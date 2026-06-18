// ── STRIPE CHECKOUT SESSION (HARDENED) ──────────────
// Vercel Serverless Function — /api/checkout
// 1. Receives cart items from the client
// 2. Validates EVERY price and product against Firestore (NEVER trusts client)
// 3. Sanitizes quantities (positive integers only)
// 4. Creates Stripe Checkout Session with SERVER-VERIFIED data
// 5. Writes SERVER-VERIFIED items into metadata for the webhook

import Stripe from 'stripe';
import { getDb } from './_firebase.js';

export default async function(req, res) {
  // CORS headers
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

  // ── Fail-closed: Firebase MUST be available ──────
  const db = getDb();
  if (!db) {
    console.error('[Checkout] Firebase Admin not available — refusing checkout');
    return res.status(503).json({ error: 'Service temporarily unavailable. Please try again.' });
  }

  // ── Derive site URL from headers ─────────────────
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || process.env.VERCEL_URL || 'gearheadzmotorsports.vercel.app';
  const siteUrl = process.env.SITE_URL || `${protocol}://${host}`;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Cap cart size to prevent abuse
    if (items.length > 50) {
      return res.status(400).json({ error: 'Too many items in cart' });
    }

    // ── Fetch ALL product prices from Firestore (batch) ──
    const productIds = [...new Set(items.map(i => i.id).filter(Boolean))];
    // ── Fetch ALL products from Firestore ─────────────
    // We load the full catalog because cart items may use either:
    // - Firestore auto-generated doc IDs (from live DB)
    // - Hardcoded IDs like "p-bluezilla" (from fallback data)
    // A single collection read is cheap and handles both cases.
    const productsSnap = await db.collection('products').get();

    // Build lookup maps: by doc ID and by exact name
    const catalogById = {};
    const catalogByName = {};
    productsSnap.forEach(snap => {
      const data = snap.data();
      const entry = {
        firestoreId: snap.id,
        price: Number(data.price),
        name: data.name || 'Product',
        img: data.img || '',
        stock: typeof data.stock === 'number' ? data.stock : 999,
      };
      catalogById[snap.id] = entry;
      // Index by normalized name for fallback matching
      catalogByName[entry.name.toUpperCase().trim()] = entry;
    });

    // ── Validate each item against the catalog ─────────
    const validatedItems = [];
    const errors = [];

    for (const item of items) {
      const id = item.id;
      // Try by Firestore doc ID first, then by product name
      const product = catalogById[id]
        || catalogByName[(item.name || '').toUpperCase().trim()];

      if (!product) {
        errors.push(`Product "${item.name || id}" not found or has been removed`);
        continue;
      }

      // Sanitize quantity: must be a positive integer
      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));

      // Check stock
      if (product.stock <= 0) {
        errors.push(`"${product.name}" is sold out`);
        continue;
      }

      if (qty > product.stock) {
        errors.push(`"${product.name}" only has ${product.stock} in stock`);
        continue;
      }

      // Use SERVER price, SERVER name — NEVER trust client
      validatedItems.push({
        id,
        name: product.name,
        price: product.price,
        img: product.img,
        size: item.size || 'ONE SIZE',
        qty,
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('. ') });
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({ error: 'No valid items in cart' });
    }

    // ── Build Stripe line items from VALIDATED data ────
    const lineItems = validatedItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name + (item.size && item.size !== 'ONE SIZE' ? ` (${item.size})` : ''),
          ...(item.img && {
            images: [item.img.startsWith('http') ? item.img : `${siteUrl}${item.img}`],
          }),
        },
        // SERVER price — the client's price is ignored
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    // ── Create Stripe Checkout Session ───────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/cancel.html`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      billing_address_collection: 'auto',
      // Metadata uses SERVER-VALIDATED items (not client data)
      metadata: {
        items: JSON.stringify(validatedItems.map(i => ({
          id: i.id,
          name: i.name,
          size: i.size,
          qty: i.qty,
          price: i.price,
          img: i.img,
        })))
      }
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[Stripe] Error:', err.message);
    return res.status(500).json({ error: 'Payment initialization failed. Please try again.' });
  }
}
