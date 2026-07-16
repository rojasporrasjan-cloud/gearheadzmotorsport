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

async function fix() {
  const localPath = 'public/images/products/need-speed-with-bg.png';
  const url = await uploadToCloudinary(localPath, 'need-speed-perfect-neon-bg');
  console.log('Uploaded to:', url);
  
  await db.collection('products').doc('p-need-speed').update({ img: url });
  console.log('Firebase updated for p-need-speed');
}

fix();
