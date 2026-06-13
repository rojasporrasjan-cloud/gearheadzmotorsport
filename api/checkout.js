// ── STRIPE CHECKOUT SESSION ────────────────────────
// Vercel Serverless Function — /api/checkout
// Receives cart items, creates a Stripe Checkout Session,
// and returns the hosted checkout URL.

const Stripe = require('stripe');

module.exports = async (req, res) => {
  // CORS headers (needed for local dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Validate env vars ────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe key not configured' });
  }
  if (!process.env.SITE_URL) {
    return res.status(500).json({ error: 'SITE_URL not configured' });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // ── Build Stripe line items from cart ────────────
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name + (item.size && item.size !== 'ONE SIZE' ? ` (${item.size})` : ''),
          // Include product image if available
          ...(item.img && {
            images: [`${process.env.SITE_URL}${item.img}`],
          }),
        },
        // Stripe uses cents — multiply by 100
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    // ── Create Stripe Checkout Session ───────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Where to redirect after payment
      success_url: `${process.env.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.SITE_URL}/cancel.html`,
      // Collect shipping address
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      // Show order summary on Stripe page
      billing_address_collection: 'auto',
      // Save items info in metadata
      metadata: {
        items: JSON.stringify(items.map(i => ({
          id: i.id,
          name: i.name,
          size: i.size,
          qty: i.qty,
          price: i.price,
          img: i.img || ''
        })))
      }
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[Stripe] Error:', err.message);
    return res.status(500).json({ error: 'Payment initialization failed. Please try again.' });
  }
};
