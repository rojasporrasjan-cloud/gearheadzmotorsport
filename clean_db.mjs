import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { PRODUCTS } from './js/products.js';

const sa = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function clean() {
    const validIds = PRODUCTS.map(p => p.id);
    console.log("Valid IDs:", validIds);
    const snap = await db.collection('products').get();
    const batch = db.batch();
    
    let toDelete = [];
    snap.forEach(doc => {
        if (!validIds.includes(doc.id)) {
            toDelete.push(doc.id);
            batch.delete(doc.ref);
        }
    });
    
    for (const p of PRODUCTS) {
        batch.set(db.collection('products').doc(p.id), p);
    }
    
    if (toDelete.length > 0) {
        console.log("Deleting extra old products from DB:", toDelete);
    }
    
    await batch.commit();
    console.log("Database cleaned and synced perfectly with products.js!");
}
clean();
