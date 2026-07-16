import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function rename() {
  await db.collection('products').doc('p-turbo-girl').update({ name: 'LA TOXICA TEE' });
  console.log('Firebase updated: Renamed to LA TOXICA TEE');
}

rename();
