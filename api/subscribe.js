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

  const db = getDb();
  if (!db) {
    console.error('[Subscribe] Firebase Admin not available');
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }

  try {
    let { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    email = email.trim().toLowerCase();
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if it already exists to prevent duplicate writes
    const docRef = db.collection('subscribers').doc(email);
    const doc = await docRef.get();
    
    if (doc.exists) {
      return res.status(409).json({ error: 'You are already subscribed to the grid!' });
    }

    // Save the new subscriber
    await docRef.set({
      email,
      dateJoined: Date.now(),
      status: 'active'
    });

    return res.status(200).json({ success: true, message: 'Welcome to the grid!' });
  } catch (err) {
    console.error('[Subscribe] Error:', err.message);
    return res.status(500).json({ error: 'Could not subscribe. Please try again later.' });
  }
}
