# Walkthrough — Blindaje del Panel Admin y Flujo de Pago

> Estado **verificado en disco** al 2026-06-15. Documenta lo que realmente quedó
> en el código, no lo planeado. Cada punto fue confirmado leyendo el archivo.

## Objetivo

Cerrar tres riesgos de la arquitectura original del panel admin de GearHeadz:

1. **Inyección de pedidos falsos** — el pedido se escribía a Firestore desde el
   cliente (`success.html` → `saveOrder`), spoofable desde DevTools.
2. **XSS almacenado** — datos del cliente (nombre/dirección desde Stripe,
   `item.name`) renderizados sin escapar vía `innerHTML` en el panel.
3. **Sin paginación** — `getOrders` traía toda la colección y ordenaba en JS.

Y dos hallazgos adicionales surgidos durante la auditoría:

4. **Fail-open de roles** — `checkUserRole` devolvía `admin` ante cualquier error.
5. **Escalada de privilegios en reglas** — un usuario podía auto-ascenderse a
   superadmin.

## Cambios por archivo

### Backend / Infra

- **`api/webhook.js`** (NUEVO) — Webhook de Stripe (`/api/webhook`), CommonJS.
  - Verifica la firma con `stripe.webhooks.constructEvent` (body crudo).
  - Procesa solo `checkout.session.completed` **con `payment_status === 'paid'`**.
  - Escribe con `db.collection('orders').doc(session.id).set(..., {merge:true})`
    → **idempotente** ante reentregas de Stripe.
  - Inicializa `firebase-admin` desde `FIREBASE_SERVICE_ACCOUNT` (base64).
  - ⚠️ **Detalle crítico corregido**: el `module.exports.config` (bodyParser:false)
    se asigna **al final del archivo**, después del handler. Si se asigna antes,
    la reasignación de `module.exports` lo descarta y la verificación de firma
    falla siempre.
- **`package.json`** — añadida dependencia `firebase-admin`.
- **`.env.example`** — documentados `STRIPE_WEBHOOK_SECRET` y `FIREBASE_SERVICE_ACCOUNT`.

### Seguridad — `firestore.rules` (NUEVO, versionado)

- `isAdmin()` exige `active == true` sobre el doc `users/{token.email}`.
- `orders`: `create: if false` (solo el webhook vía Admin SDK); `read/update/delete: if isAdmin()`.
- `products` / `events` / `site-config`: lectura pública, escritura `isAdmin()`.
- `users`:
  - `create`: el superadmin crea cualquier doc; un usuario solo auto-crea el suyo
    como `role:'guest', active:false`.
  - `update/delete`: **solo el superadmin** (`rojasporrasjan@gmail.com`). Un admin
    regular NO puede modificar docs de usuario (evita auto-ascenso a superadmin).

### Cliente

- **`success.html`** — eliminado el `import`/llamada a `saveOrder`. El frontend ya
  no escribe pedidos; solo muestra el ticket vía `retrieve-session`.
- **`js/data-store.js`**
  - `getOrders(lastDoc, limitCount=50)` — `orderBy('date','desc')` + `limit` +
    `startAfter`; devuelve `{ list, lastDoc }`.
  - `checkUserRole` — **fail-closed**: ante error o usuario nuevo, `guest`/`inactive`.
  - `checkUserRole` y `saveAdminUser` — normalizan email con `String(x).toLowerCase()`.
- **`js/firebase.js`** — expone `query`, `orderBy`, `limit`, `startAfter`.
- **`js/admin.js`**
  - `escapeHTML()` aplicado a todos los sinks de pedidos/productos/eventos,
    **incluido el `<textarea>` oculto de "copiar dirección"**.
  - Listener de auth **fail-closed**: si no verifica el rol, `signOut` + login.
  - Paginación: estado `allOrders` + `ordersLastDoc`, botón "Cargar más pedidos"
    que anexa resultados; la búsqueda opera sobre lo acumulado en memoria.

## Cabos sueltos / Caveats conocidos

- **Casing de email en las reglas**: las escrituras del cliente ya normalizan a
  minúsculas, pero el lenguaje de Firestore Rules **no tiene `toLowerCase`**, así
  que `isAdmin()` compara contra `request.auth.token.email` crudo. Si una cuenta de
  Auth tiene mayúsculas, podría quedar bloqueada (falla en cerrado, no en abierto).
  Mitigación: registrar emails en minúsculas.
- **Límite de 500 chars en `metadata.items`** de Stripe: un carrito muy grande
  podría truncarse. Si crece, reconstruir items desde `listLineItems`.
- **`checkUserRole` "primer usuario = superadmin"**: con las reglas actuales ese
  `setDoc` para un email no-superadmin es denegado → cae a fail-closed (guest).
  Genera ruido en consola; limpieza opcional.

## Checklist de despliegue (acciones del dueño — requieren tus credenciales)

- [ ] `npm install` (para que `firebase-admin` quede en `node_modules`).
- [ ] Cargar `STRIPE_WEBHOOK_SECRET` y `FIREBASE_SERVICE_ACCOUNT` (base64) en
      Vercel y en `.env` local.
- [ ] `firebase deploy --only firestore:rules` (con la versión corregida).
- [ ] Registrar el endpoint `/api/webhook` en Stripe (evento `checkout.session.completed`).

## Plan de verificación

1. Compra de prueba punta a punta → el doc aparece en `orders` **vía webhook**
   (no desde el cliente).
2. Confirmar que `success.html` ya no llama a `saveOrder`.
3. Probar "Cargar más" (temporalmente bajar el límite a ~5 para forzar páginas).
4. Intentar (desde DevTools, autenticado como admin regular) escribir
   `users/tu-email` con `role:'superadmin'` → debe ser **denegado**.
