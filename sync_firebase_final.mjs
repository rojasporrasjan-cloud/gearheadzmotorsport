import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { PRODUCTS } from './js/products.js';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function updateDb() {
  try {
    const batch = db.batch();
    
    for (const p of PRODUCTS) {
      const ref = db.collection('products').doc(p.id);
      batch.set(ref, p); 
    }

    await batch.commit();
    console.log('Firebase finally updated with exact Cloudinary URLs and correct names!');
  } catch(e) {
    console.error("Error updating:", e);
  }
}

updateDb();
