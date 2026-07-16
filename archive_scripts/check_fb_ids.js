import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function checkDb() {
    const snap = await db.collection('products').get();
    for (const doc of snap.docs) {
        const data = doc.data();
        console.log(`${doc.id}: ${data.name}`);
    }
}

checkDb().catch(console.error);
