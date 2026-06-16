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

---

# Ronda 2 — Hardening del storefront público y dependencias (2026-06-15)

> Verificado en disco. Alcance: defensa en profundidad del frontend público
> (datos de productos/eventos son admin-controlled tras las reglas de Ronda 1,
> así que esto protege ante un admin comprometido) + higiene de dependencias.

## Cambios

- **`js/utils.js`** — `escapeHTML` extraído aquí y **exportado** (fuente única).
  Se eliminó la copia local de `js/admin.js`.
- **`js/admin.js`** — ahora `import { escapeHTML } from './utils.js'` (sin copia local).
- **`js/cart.js`** — escapados `item.name`, `item.size`, `item.img`, y el toast.
- **`js/products.js`** — `buildCard`/`openProductModal` escapan `name`, `cat`,
  `badge`, tallas e `img`. Añadidos `loading="lazy"` + `decoding="async"` + `alt`
  semántico en las imágenes de tarjeta.
- **`js/events-data.js`** — `buildEventFullCard`/`buildEventPreviewCard` escapan
  `name`, `location`, `month/day/year`, horarios, `img`, y los `href`
  (`instagramUrl`, `mapsLink`) que ya llevan `rel="noopener"`.
  (Esto protege indirectamente a `index.js` y `store.js`, que dependen de
  `buildCard`/`buildEventPreviewCard`.)
- **`package-lock.json`** — `npm audit fix` (sin `--force`): corrigió `protobufjs`.
  Conteo 9 → 8.

## Vulnerabilidades restantes (decisión deliberada, NO tocar a ciegas)

Las 8 restantes (6 moderadas, **2 altas**) **no llegan al storefront**:

- Las 2 altas son **`vite` / `esbuild`**: vulnerabilidades del **servidor de
  desarrollo**, sin impacto en el build de producción ni en el navegador del
  cliente. Limpiarlas exige un upgrade mayor de Vite — hágase aparte y con
  prueba de build, **nunca** con `npm audit fix --force`.
- Las moderadas restantes son del subárbol de **`firebase-admin`** (uuid,
  gaxios, teeny-request, etc.): backend serverless (`api/webhook.js`), no el
  frontend. `--force` las "arregla" **degradando firebase-admin 14 → 10**
  (breaking) — no hacerlo.

## Verificación adicional

5. Inyectar un payload (`<img src=x onerror=alert(1)>`) en el `name` de un
   producto/evento en Firestore → el storefront debe renderizarlo como **texto
   inofensivo**, sin ejecutar.
