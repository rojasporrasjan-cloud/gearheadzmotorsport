// ── STRIPE WEBHOOK (HARDENED) ────────────────────────
// Vercel Serverless Function — /api/webhook
// Listens for Stripe events, verifies signatures, and saves orders to Firestore.
// Uses the shared _firebase.js helper for correct ESM initialization.

import Stripe from 'stripe';
import { getDb } from './_firebase.js';

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

  // ── Validate env vars ────────────────────────────
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is missing');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Webhook] STRIPE_SECRET_KEY is missing');
    return res.status(500).json({ error: 'Stripe key not configured' });
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

  // ── HANDLE checkout.session.completed ──────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Only process paid sessions
    if (session.payment_status === 'paid') {
      // ── Fail-closed: Firebase MUST be available ────
      const db = getDb();
      if (!db) {
        console.error('[Webhook] Firebase Admin not available — cannot save order');
        // Return 500 so Stripe retries this webhook later
        return res.status(500).json({ error: 'Database unavailable' });
      }

      try {
        const orderId = 'GHZ-' + session.id.slice(-8).toUpperCase();
        // Items come from session.metadata which was written by our
        // hardened checkout.js with SERVER-VALIDATED data
        const items = session.metadata?.items
          ? JSON.parse(session.metadata.items)
          : [];

        const orderData = {
          id: session.id,
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
          items,
          date: Math.floor(event.created),
        };

        // Idempotent write using session.id as document key
        await db.collection('orders').doc(session.id).set(orderData, { merge: true });
        console.log(`[Webhook] ✓ Order ${orderId} (${session.id}) saved.`);

      } catch (err) {
        console.error('[Webhook] Firestore save error:', err);
        // Return 500 so Stripe retries
        return res.status(500).json({ error: 'Failed to save to database' });
      }
    } else {
      console.log(`[Webhook] Session ${session.id} completed but not yet paid.`);
    }
  }

  res.json({ received: true });
}

// Disable Vercel's body parser so we can verify the raw Stripe signature
export const config = { api: { bodyParser: false } };
