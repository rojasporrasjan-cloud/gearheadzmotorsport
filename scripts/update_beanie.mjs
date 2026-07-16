import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function update() {
  await db.collection('products').doc('p-beanie').update({ 
    badge: 'SEASONAL ONLY',
    outOfStock: true
  });
  console.log('Firebase updated: Beanie marked as SEASONAL ONLY and outOfStock');
}

update();
