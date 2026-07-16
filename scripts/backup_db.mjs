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
      products.push(data);
    });
    
    // Sort by id for consistency
    products.sort((a, b) => a.id.localeCompare(b.id));

    const arrayStr = `export const PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;
    
    // Grab the UI functions from the perfect file so they aren't lost
    const perfectContent = fs.readFileSync('js/products_perfect.js', 'utf8');
    const functionsPart = perfectContent.substring(perfectContent.indexOf('// ── BUILD PRODUCT CARD HTML'));
    
    const content = `// ── PRODUCTS DATA ─────────────────────────────────\nimport { escapeHTML, cldOptimize } from './utils.js';\n\n${arrayStr}\n${functionsPart}`;
    fs.writeFileSync('js/products.js', content);
    console.log('products.js overwritten with sanitized Firebase data AND UI functions preserved.');
  } catch(e) {
    console.error("Error reading:", e);
  }
}

exportDb();
