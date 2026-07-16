import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  await db.collection('products').doc('p-boosted-bowl').update({
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783758619/gearheadz/products/boosted-bowl-custom-bg.png'
  });
  console.log('Updated boosted-bowl');

  await db.collection('products').doc('p-jdm-legends').update({
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783758617/gearheadz/products/jdm-legends-custom-bg.png'
  });
  console.log('Updated jdm-legends');

  await db.collection('products').doc('p-turbo-girl').update({
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783758618/gearheadz/products/turbo-girl-custom-bg.png'
  });
  console.log('Updated turbo-girl');

  console.log('Done.');
}
run();
