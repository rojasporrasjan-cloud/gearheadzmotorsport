import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const CLOUD_NAME = "db4ld8cy2";
const UPLOAD_PRESET = "GH 123";

async function uploadToCloudinary(filePath, publicId) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const fileData = fs.readFileSync(filePath);
  const blob = new Blob([fileData]);
  
  const form = new FormData();
  form.append('file', blob);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('public_id', publicId);
  form.append('folder', 'gearheadz/products');
  
  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

async function migrate() {
  const snap = await db.collection('products').get();
  let count = 0;
  
  for (const doc of snap.docs) {
    const p = doc.data();
    let updated = false;
    
    // Check main image
    if (p.img && (p.img.startsWith('images/') || p.img.startsWith('/images/'))) {
      const localPath = 'public/' + p.img.replace(/^\//, ''); // public/images/products/...
      if (fs.existsSync(localPath)) {
        console.log(`Uploading ${localPath} for product ${p.id}...`);
        const pubId = p.img.split('/').pop().split('.')[0]; 
        try {
          const url = await uploadToCloudinary(localPath, pubId);
          p.img = url;
          updated = true;
          console.log(` -> Success: ${url}`);
        } catch (err) {
          console.error(` -> Failed to upload ${localPath}:`, err.message);
        }
      } else {
        console.log(`Local file not found: ${localPath}`);
      }
    }
    
    if (updated) {
      await db.collection('products').doc(doc.id).set(p, { merge: true });
      count++;
    }
  }
  
  console.log(`Migration complete! Updated ${count} products in Firebase.`);
}

migrate();
