import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function exportDb() {
  try {
    const snap = await db.collection('products').get();
    let products = [];
    snap.forEach(doc => {
      let data = doc.data();
      if (!data.id) data.id = doc.id;
      // All hats should have price 20
      if (data.cat === 'HEADWEAR') {
          data.price = 20;
      }
      
      // Fix duplicate "NEW GEARHEADZ LOGO HAT" problem
      if (data.id === 'p-logo-hat') {
          data.name = 'GEARHEADZ LOGO HAT — BLACK';
          // Ensure it uses the correct image
          data.img = 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783488923/gearheadz/products/logo-hat-v2-1-final-bg.png';
      }
      if (data.id === 'p-new-logo-hat') {
          // This one is gray with cyberpunk background
          data.img = 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783491040/gearheadz/products/new-logo-hat-cyberpunk-bg.png';
      }
      
      products.push(data);
    });
    
    // Sort by id for consistency
    products.sort((a, b) => a.id.localeCompare(b.id));

    const content = `export const PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync('js/products.js', content);
    console.log('products.js overwritten with sanitized Firebase data.');
  } catch(e) {
    console.error("Error reading:", e);
  }
}

exportDb();
