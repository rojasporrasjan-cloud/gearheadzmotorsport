// ── FIREBASE CONFIG ───────────────────────────────
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto → Agrega una app web → copia firebaseConfig
// 3. Activa: Firestore Database, Storage, Authentication (Email/Password)

const firebaseConfig = {
  apiKey:            "AIzaSyBwsrIUrvubEUTnCkZyInPYlh77DmbHBUc",
  authDomain:        "gearheadzmotorsport.firebaseapp.com",
  projectId:         "gearheadzmotorsport",
  storageBucket:     "gearheadzmotorsport.firebasestorage.app",
  messagingSenderId: "735462440219",
  appId:             "1:735462440219:web:cfb5fc3ea7388f221867be",
};

// ── Sync check — no SDK needed ────────────────────
export const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// ── Lazy singleton — Firebase SDK only loads when configured ──
// This keeps the main bundle ~237 KB smaller for unconfigured sites
let _cache = null;

export async function getFirebase() {
  if (_cache !== null) return _cache;
  if (!isConfigured)   return (_cache = null);

  const [appMod, firestoreMod, authMod, storageMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
    import('firebase/auth'),
    import('firebase/storage'),
  ]);

  const app = appMod.initializeApp(firebaseConfig);

  _cache = {
    // ── Core instances ──
    app,
    db:      firestoreMod.getFirestore(app),
    auth:    authMod.getAuth(app),
    storage: storageMod.getStorage(app),

    // ── Firestore helpers ──
    collection:  firestoreMod.collection,
    query:       firestoreMod.query,
    orderBy:     firestoreMod.orderBy,
    limit:       firestoreMod.limit,
    startAfter:  firestoreMod.startAfter,
    getDocs:     firestoreMod.getDocs,
    getDoc:      firestoreMod.getDoc,
    doc:         firestoreMod.doc,
    setDoc:      firestoreMod.setDoc,
    addDoc:      firestoreMod.addDoc,
    updateDoc:   firestoreMod.updateDoc,
    deleteDoc:   firestoreMod.deleteDoc,

    // ── Auth helpers ──
    signInWithEmailAndPassword: authMod.signInWithEmailAndPassword,
    signOut:                    authMod.signOut,
    onAuthStateChanged:         authMod.onAuthStateChanged,

    // ── Storage helpers ──
    ref:            storageMod.ref,
    uploadBytes:    storageMod.uploadBytes,
    getDownloadURL: storageMod.getDownloadURL,
  };

  return _cache;
}
