// ── STRIPE WEBHOOK (HARDENED v2) ─────────────────────
// Vercel Serverless Function — /api/webhook
// 1. Verifies Stripe signature
// 2. Retrieves FULL session from Stripe API (webhook payload is incomplete)
// 3. Saves order with complete shipping address to Firestore
// 4. Status: "Confirmed" (payment verified by Stripe)

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
    const sessionFromEvent = event.data.object;

    // Only process paid sessions
    if (sessionFromEvent.payment_status === 'paid') {
      // ── Fail-closed: Firebase MUST be available ────
      const db = getDb();
      if (!db) {
        console.error('[Webhook] Firebase Admin not available — cannot save order');
        return res.status(500).json({ error: 'Database unavailable' });
      }

      try {
        // ── RETRIEVE FULL SESSION from Stripe API ──────
        // The webhook event payload often omits shipping_details,
        // customer_details, etc. We must fetch the complete session.
        const session = await stripe.checkout.sessions.retrieve(
          sessionFromEvent.id,
          { expand: ['shipping_details', 'customer_details'] }
        );

        const orderId = 'GHZ-' + session.id.slice(-8).toUpperCase();
        const items = session.metadata?.items
          ? JSON.parse(session.metadata.items)
          : [];

        // Build full shipping address object
        let shipping = null;
        if (session.shipping_details) {
          shipping = {
            name: session.shipping_details.name || '',
            address: session.shipping_details.address || null,
          };
        } else if (session.collected_information?.shipping_details) {
          // Stripe API v2 sometimes nests differently
          const sd = session.collected_information.shipping_details;
          shipping = {
            name: sd.name || '',
            address: sd.address || null,
          };
        }

        const orderData = {
          id: session.id,
          orderNum: orderId,
          customer: {
            name: session.customer_details?.name || '',
            email: session.customer_details?.email || '',
            phone: session.customer_details?.phone || '',
          },
          shipping,
          total: session.amount_total / 100,
          paymentStatus: session.payment_status,
          // Auto-confirmed because Stripe verified the payment
          status: 'Confirmed',
          items,
          date: Math.floor(event.created),
        };

        // Idempotent write using session.id as document key
        await db.collection('orders').doc(session.id).set(orderData, { merge: true });
        console.log(`[Webhook] ✓ Order ${orderId} saved. Shipping: ${shipping ? 'YES' : 'NONE'}`);

      } catch (err) {
        console.error('[Webhook] Error:', err);
        return res.status(500).json({ error: 'Failed to process order' });
      }
    } else {
      console.log(`[Webhook] Session ${sessionFromEvent.id} completed but not yet paid.`);
    }
  }

  res.json({ received: true });
}

// Disable Vercel's body parser so we can verify the raw Stripe signature
export const config = { api: { bodyParser: false } };
