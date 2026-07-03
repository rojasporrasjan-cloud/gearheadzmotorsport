import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function fixDb() {
    // 1. Get old docs
    const doc1 = await db.collection('products').doc('hGGNP9Jiu6Q8cQO8oQ80').get();
    const doc2 = await db.collection('products').doc('mPcFnuqHHJWxnzMRhyIz').get();
    
    // 2. Set new docs
    if (doc1.exists) {
        await db.collection('products').doc('p-honda-civic').set(doc1.data());
        await db.collection('products').doc('hGGNP9Jiu6Q8cQO8oQ80').delete();
    }
    
    if (doc2.exists) {
        await db.collection('products').doc('p-need-speed').set(doc2.data());
        await db.collection('products').doc('mPcFnuqHHJWxnzMRhyIz').delete();
    }
    console.log("Fixed document IDs!");
}

fixDb().catch(console.error);
