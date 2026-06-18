// ── STRIPE WEBHOOK ───────────────────────────────
// Vercel Serverless Function — /api/webhook
// Listens for Stripe events, verifies signatures, and updates Firestore.

import Stripe from 'stripe';
import admin from 'firebase-admin';

// ── VERCEL CONFIG ───────────────────────────────────
// Disabling Vercel's default body parser is required so Stripe can verify the
// raw-body signature. The actual `config` export is set at the BOTTOM of this
// file — it must be attached AFTER module.exports is assigned the handler,
// otherwise the assignment overwrites it.

// ── INIT FIREBASE ADMIN ─────────────────────────────
if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountBase64) {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.error('[Webhook] FIREBASE_SERVICE_ACCOUNT is missing');
    }
  } catch (error) {
    console.error('[Webhook] Firebase admin initialization error', error);
  }
}

const getRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export default async function(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`[Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── HANDLE EVENTS ───────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Only process paid sessions
    if (session.payment_status === 'paid') {
      try {
        const orderId = 'GHZ-' + session.id.slice(-8).toUpperCase();
        const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

        const orderData = {
          id: session.id, // Using session.id for idempotency
          orderNum: orderId,
          customer: {
            name: session.customer_details?.name || '',
            email: session.customer_details?.email || '',
            phone: session.customer_details?.phone || '',
          },
          shipping: session.shipping_details || null,
          total: session.amount_total / 100,
          paymentStatus: session.payment_status,
          status: 'Pending',
          items: items,
          date: Math.floor(event.created), // from the event timestamp
        };

        if (admin.apps.length) {
          const db = admin.firestore();
          // Idempotent write using merge
          await db.collection('orders').doc(session.id).set(orderData, { merge: true });
          console.log(`[Webhook] Order ${session.id} saved successfully.`);
        } else {
          console.error('[Webhook] Admin SDK not initialized, cannot save order.');
        }

      } catch (err) {
        console.error('[Webhook] Firestore save error:', err);
        return res.status(500).json({ error: 'Failed to save to database' });
      }
    } else {
      console.log(`[Webhook] Session ${session.id} completed but payment_status is not paid yet.`);
    }
  }

  res.json({ received: true });
};

// Set the Vercel config AFTER the handler assignment above. Assigning to
// module.exports replaces the object, so this must come last to survive.
export const config = { api: { bodyParser: false } };
