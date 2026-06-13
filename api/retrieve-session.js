// ── RETRIEVE STRIPE SESSION ────────────────────────
// Vercel Serverless Function — /api/retrieve-session
// Takes a session_id, queries Stripe, and returns order details.

const Stripe = require('stripe');

module.exports = async (req, res) => {
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

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

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
