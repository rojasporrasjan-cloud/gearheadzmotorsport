// ── SHARED FIREBASE ADMIN SINGLETON ──────────────────
// Used by all Vercel Serverless Functions (checkout, webhook, etc.)
// Firebase Admin v14 ESM exports: initializeApp, getApps, cert, getApp
// NOT: admin.credential.cert (that's the old CommonJS API)
// NOT: admin.apps (undefined in ESM — use getApps())

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let _db = null;
let _initError = null;

function ensureInit() {
  if (_db) return _db;
  if (_initError) return null;

  try {
    if (getApps().length === 0) {
      const b64 = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!b64) {
        _initError = 'FIREBASE_SERVICE_ACCOUNT env var is missing';
        console.error(`[firebase-admin] ${_initError}`);
        return null;
      }
      const serviceAccount = JSON.parse(
        Buffer.from(b64, 'base64').toString('utf8')
      );
      initializeApp({ credential: cert(serviceAccount) });
    }
    _db = getFirestore(getApp());
    return _db;
  } catch (err) {
    _initError = err.message;
    console.error('[firebase-admin] Init failed:', err.message);
    return null;
  }
}

export function getDb() {
  return ensureInit();
}
