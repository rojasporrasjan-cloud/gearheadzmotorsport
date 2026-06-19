import { sendShippingEmail } from './_emails.js';

export default async function(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, orderId, trackingNumber, trackingCarrier, customerEmail, customerName } = req.body;

    if (type === 'shipped') {
      if (!customerEmail || !orderId) {
        return res.status(400).json({ error: 'Missing customer email or order ID' });
      }

      await sendShippingEmail(orderId, trackingNumber, trackingCarrier, customerEmail, customerName);
      return res.status(200).json({ success: true, message: 'Shipping email sent' });
    }

    return res.status(400).json({ error: 'Invalid email type requested' });
  } catch (err) {
    console.error('[SendEmail API] Error:', err);
    return res.status(500).json({ error: 'Internal server error while sending email' });
  }
}
