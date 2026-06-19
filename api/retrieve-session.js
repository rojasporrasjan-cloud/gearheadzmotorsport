// ── RETRIEVE STRIPE SESSION ────────────────────────
// Vercel Serverless Function — /api/retrieve-session
// Takes a session_id, queries Stripe, and returns order details.

import Stripe from 'stripe';

export default async function(req, res) {
  // CORS headers (needed for local dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Validate env vars ────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe key not configured' });
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Missing session_id query parameter' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['shipping_details', 'customer_details']
    });

    // ── Fallback: Save order if paid (e.g. local dev missed webhook) ──
    if (session.payment_status === 'paid') {
      try {
        const { getDb } = await import('./_firebase.js');
        const db = getDb();
        if (db) {
          const orderId = 'GHZ-' + session.id.slice(-8).toUpperCase();
          const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
          
          let shipping = null;
          if (session.shipping_details) {
            shipping = {
              name: session.shipping_details.name || '',
              address: session.shipping_details.address || null,
            };
          } else if (session.collected_information?.shipping_details) {
            const sd = session.collected_information.shipping_details;
            shipping = { name: sd.name || '', address: sd.address || null };
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
            status: 'Confirmed',
            items,
            date: Math.floor(session.created),
          };

          // Idempotent write, merge: true
          await db.collection('orders').doc(session.id).set(orderData, { merge: true });

          // ── SEND CONFIRMATION EMAIL (Fallback) ──
          try {
            const { sendConfirmationEmail } = await import('./_emails.js');
            await sendConfirmationEmail(orderData);
          } catch (err) {
            console.error('[Retrieve Fallback] Failed to send confirmation email:', err);
          }
        }
      } catch (err) {
        console.error('[Retrieve Fallback] Error saving order:', err);
      }
    }

    return res.status(200).json({
      id: session.id,
      customer: {
        name: session.customer_details?.name || '',
        email: session.customer_details?.email || '',
        phone: session.customer_details?.phone || '',
      },
      shipping: session.shipping_details || null,
      total: session.amount_total / 100,
      paymentStatus: session.payment_status,
      items: JSON.parse(session.metadata?.items || '[]'),
      date: session.created,
    });

  } catch (err) {
    console.error('[Stripe] Retrieve Error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve payment details.' });
  }
};
