// ── DATA STORE ────────────────────────────────────
// Capa de datos centralizada.
// Lee de Firestore cuando Firebase está configurado (lazy-loaded).
// Cae al fallback hardcoded si no lo está.

import { getFirebase }                           from './firebase.js';
import { PRODUCTS as FALLBACK_PRODUCTS }         from './products.js';
import { EVENTS   as FALLBACK_EVENTS }           from './events-data.js';

// ── PRODUCTS ──────────────────────────────────────

export async function getProducts() {
  const fb = await getFirebase();
  if (!fb) return FALLBACK_PRODUCTS;
  try {
    const snap = await fb.getDocs(fb.collection(fb.db, 'products'));
    if (snap.empty) return FALLBACK_PRODUCTS;
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch { return FALLBACK_PRODUCTS; }
}

export async function saveProduct(product) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  const { id, ...data } = product;
  if (id) await fb.updateDoc(fb.doc(fb.db, 'products', id), data);
  else    await fb.addDoc(fb.collection(fb.db, 'products'), data);
}

export async function deleteProduct(id) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.deleteDoc(fb.doc(fb.db, 'products', id));
}

// ── EVENTS ────────────────────────────────────────

export async function getEvents() {
  const fb = await getFirebase();
  if (!fb) return FALLBACK_EVENTS;
  try {
    const snap = await fb.getDocs(fb.collection(fb.db, 'events'));
    if (snap.empty) return FALLBACK_EVENTS;
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch { return FALLBACK_EVENTS; }
}

export async function saveEvent(event) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  const { id, ...data } = event;
  if (id) await fb.updateDoc(fb.doc(fb.db, 'events', id), data);
  else    await fb.addDoc(fb.collection(fb.db, 'events'), data);
}

export async function deleteEvent(id) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.deleteDoc(fb.doc(fb.db, 'events', id));
}

// ── ORDERS ────────────────────────────────────────

export async function getOrders(lastDoc = null, limitCount = 50) {
  const fb = await getFirebase();
  if (!fb) return { list: [], lastDoc: null };
  try {
    let q;
    if (lastDoc) {
      q = fb.query(
        fb.collection(fb.db, 'orders'),
        fb.orderBy('date', 'desc'),
        fb.startAfter(lastDoc),
        fb.limit(limitCount)
      );
    } else {
      q = fb.query(
        fb.collection(fb.db, 'orders'),
        fb.orderBy('date', 'desc'),
        fb.limit(limitCount)
      );
    }
    
    const snap = await fb.getDocs(q);
    if (snap.empty) return { list: [], lastDoc: null };
    
    const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    return { list, lastDoc: snap.docs[snap.docs.length - 1] };
  } catch (err) {
    console.error('[getOrders] Error:', err);
    return { list: [], lastDoc: null };
  }
}

export async function saveOrder(order) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.setDoc(fb.doc(fb.db, 'orders', order.id), order, { merge: true });
}

export async function updateOrderStatus(orderId, status) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.updateDoc(fb.doc(fb.db, 'orders', orderId), { status });
}

export async function deleteOrder(orderId) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.deleteDoc(fb.doc(fb.db, 'orders', orderId));
}

// ── USER ROLES / ADMINS ───────────────────────────

export async function checkUserRole(rawEmail) {
  const email = String(rawEmail).toLowerCase();
  const isSuperadminEmail = email === 'rojasporrasjan@gmail.com';
  const fb = await getFirebase();
  if (!fb) return { email, role: 'superadmin', active: true }; // Fallback offline
  try {
    const docRef = fb.doc(fb.db, 'users', email);

    if (isSuperadminEmail) {
      const superUser = { email, role: 'superadmin', active: true };
      try {
        await fb.setDoc(docRef, superUser, { merge: true });
      } catch (writeErr) {
        console.warn('[checkUserRole] Failed to write superadmin doc to Firestore:', writeErr);
      }
      return superUser;
    }

    const snap = await fb.getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }

    // Check if the users collection is completely empty
    const usersSnap = await fb.getDocs(fb.collection(fb.db, 'users'));
    if (usersSnap.empty) {
      // First user becomes superadmin
      const newUser = { email, role: 'superadmin', active: true };
      await fb.setDoc(docRef, newUser);
      return newUser;
    } else {
      // Default to guest for subsequent users (Wait for admin approval)
      const newUser = { email, role: 'guest', active: false };
      await fb.setDoc(docRef, newUser);
      return newUser;
    }
  } catch (err) {
    console.error('[checkUserRole] Error:', err);
    return { email, role: 'guest', active: false }; // FAIL-CLOSED
  }
}

export async function getAdminUsers() {
  const fb = await getFirebase();
  if (!fb) return [];
  try {
    const snap = await fb.getDocs(fb.collection(fb.db, 'users'));
    if (snap.empty) return [];
    return snap.docs.map(d => d.data());
  } catch { return []; }
}

export async function saveAdminUser(rawEmail, role, active) {
  const email = String(rawEmail).toLowerCase();
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.setDoc(fb.doc(fb.db, 'users', email), { email, role, active }, { merge: true });
}

export async function deleteAdminUser(email) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.deleteDoc(fb.doc(fb.db, 'users', email));
}

// ── SITE CONFIG ───────────────────────────────────

export const DEFAULT_CONFIG = {
  heroHome:       '/video/supra.mp4',
  heroStore:      '/images/store_hero.png',
  heroEvents:     '/video/events.mp4',
  socialIG:       'https://instagram.com/2gearheadz',
  socialTT:       '',
  socialYT:       '',
  socialFB:       '',
  footerTagline:  'JDM culture gear for those who live and breathe motorsports. Built different since 2024.',
  copyrightYear:  '2026',
  privacyPolicy:  '',
  termsOfService: '',
};

export async function getSiteConfig() {
  const fb = await getFirebase();
  if (!fb) return DEFAULT_CONFIG;
  try {
    const snap = await fb.getDoc(fb.doc(fb.db, 'site-config', 'main'));
    return snap.exists() ? { ...DEFAULT_CONFIG, ...snap.data() } : DEFAULT_CONFIG;
  } catch { return DEFAULT_CONFIG; }
}

export async function saveSiteConfig(config) {
  const fb = await getFirebase();
  if (!fb) throw new Error('Firebase no configurado');
  await fb.setDoc(fb.doc(fb.db, 'site-config', 'main'), config, { merge: true });
}
