import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function updateDb() {
  try {
    const batch = db.batch();
    
    // Shirts to $30 (commented out because some don't exist)
    // batch.update(db.collection('products').doc('p-911'), { price: 30 });
    // batch.update(db.collection('products').doc('p-gtr'), { price: 30 });
    // batch.update(db.collection('products').doc('p-forever-static'), { price: 30 });

    // Hats to $20
    batch.update(db.collection('products').doc('p-turbi-hat'), { price: 30 });
    batch.update(db.collection('products').doc('p-logo-hat'), { price: 30 });
    batch.update(db.collection('products').doc('p-lady-hat'), { price: 30 });
    batch.update(db.collection('products').doc('p-beanie'), { price: 30 });

    await batch.commit();
    console.log('Firebase prices updated successfully!');
  } catch(e) {
    console.error("Error updating:", e);
  }
}

updateDb();
