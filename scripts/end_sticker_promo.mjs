// End of the Fast & Furious tee promo:
// - price back to $30 (same as the rest of the catalog)
// - drop the crossed-out oldPrice and the expired "until August 21" note
// - keep the free sticker via the `sticker` flag, now "while supplies last"
//   (the badge stays free for NEW DROP / SOLD OUT / etc.)
//
// Run from the project root:  node scripts/end_sticker_promo.mjs

import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(fs.readFileSync('./gearheadzmotorsport-firebase-adminsdk-fbsvc-59eb5f7475.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const PROMO_IDS = ['p-need-speed', 'p-honda-civic'];

const UPDATE = {
  price: 30,
  oldPrice: FieldValue.delete(),
  sticker: true,
  desc: 'Comes with a free exclusive sticker while supplies last.',
};

async function run() {
  for (const id of PROMO_IDS) {
    const ref = db.collection('products').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`! ${id} not found in Firestore — skipped`);
      continue;
    }
    await ref.update(UPDATE);
    console.log(`✓ ${snap.data().name}: $${snap.data().price} → $30, promo ended, sticker flagged`);
  }
  console.log('Done.');
}

run().catch(err => {
  console.error('Error updating Firestore:', err);
  process.exit(1);
});
