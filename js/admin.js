// ── ADMIN PANEL ───────────────────────────────────
import { getFirebase, isConfigured as fbReady, createAuthUser } from './firebase.js';
import { isConfigured as cloudReady, uploadImage, uploadVideo } from './cloudinary.js';
import {
  getProducts, saveProduct, deleteProduct,
  getEvents,   saveEvent,   deleteEvent,
  getOrders,   saveOrder,   updateOrderStatus, deleteOrder,
  checkUserRole, getAdminUsers, saveAdminUser, deleteAdminUser,
  getSiteConfig, saveSiteConfig,
  DEFAULT_CONFIG,
} from './data-store.js';

// ── CONSTANTS ─────────────────────────────────────
const FALLBACK_PASS = 'gearheadz2026';
const ALL_SIZES     = ['XS','S','M','L','XL','2XL','ONE SIZE'];
const CATS          = ['APPAREL','HEADWEAR','ACCESSORIES','KIDS'];
const BADGES        = ['', 'NEW DROP', 'LIMITED'];

// ── UTILS ─────────────────────────────────────────
import { escapeHTML, cldOptimize } from './utils.js';

let currentSec  = 'dashboard';
let saveFn      = null;

// ── BOOT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('a-login-form').addEventListener('submit', handleLogin);
  document.getElementById('as-logout').addEventListener('click', handleLogout);
  document.getElementById('a-dw-close').addEventListener('click', closeDrawer);
  document.getElementById('a-drawer-overlay').addEventListener('click', closeDrawer);
  document.querySelectorAll('.as-link[data-sec]').forEach(btn =>
    btn.addEventListener('click', () => navigate(btn.dataset.sec))
  );

  if (fbReady) {
    getFirebase().then(fb => {
      fb.onAuthStateChanged(fb.auth, async u => {
        if (u) {
          try {
            const roleData = await checkUserRole(u.email);
            if (roleData && roleData.active === false) {
              await fb.signOut(fb.auth);
              showLogin('Tu cuenta ha sido desactivada por el Superadministrador.');
            } else {
              showApp(u.email, roleData ? roleData.role : 'admin');
            }
          } catch (err) {
            console.error('[Auth Listener] Error:', err);
            // FAIL-CLOSED: si no podemos verificar el rol, no abrimos el panel.
            await fb.signOut(fb.auth);
            showLogin('No se pudo verificar tu cuenta. Inicia sesión de nuevo.');
          }
        } else {
          showLogin();
        }
      });
    });
  } else {
    const s = sessionStorage.getItem('ghz-admin');
    s ? showApp(s, 'superadmin') : showLogin();
  }
});

// ── AUTH ──────────────────────────────────────────
function showLogin(errMsg = '') {
  document.getElementById('a-login').style.display = 'flex';
  document.getElementById('a-app').classList.remove('visible');
  const errEl = document.getElementById('a-login-err');
  if (errEl) errEl.textContent = errMsg;
}

let currentUserRole = 'admin';

function showApp(email = '', role = 'admin') {
  currentUserRole = role;
  document.getElementById('a-login').style.display = 'none';
  document.getElementById('a-app').classList.add('visible');
  document.getElementById('as-email').textContent = email;

  // Show or hide Superadmin navigation items
  const superEls = document.querySelectorAll('.super-only');
  superEls.forEach(el => {
    if (role === 'superadmin') {
      el.style.display = el.tagName === 'DIV' ? 'block' : 'flex';
    } else {
      el.style.display = 'none';
    }
  });

  navigate(currentSec);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('al-email').value.trim();
  const pass  = document.getElementById('al-pass').value;
  const btn   = document.getElementById('al-submit');
  const errEl = document.getElementById('a-login-err');

  btn.disabled = true; btn.textContent = 'ENTRANDO...'; errEl.textContent = '';

  try {
    if (fbReady) {
      const fb = await getFirebase();
      await fb.signInWithEmailAndPassword(fb.auth, email, pass);
      // El observador onAuthStateChanged cargará showApp
    } else {
      if (pass !== FALLBACK_PASS) throw new Error('Contraseña incorrecta');
      sessionStorage.setItem('ghz-admin', email || 'admin');
      showApp(email || 'admin', 'superadmin');
    }
  } catch (err) {
    errEl.textContent = err.code === 'auth/invalid-credential'
      ? 'Email o contraseña incorrectos' : err.message;
    btn.disabled = false; btn.textContent = 'ENTRAR';
  }
}

async function handleLogout() {
  if (fbReady) { const fb = await getFirebase(); await fb.signOut(fb.auth); }
  else sessionStorage.removeItem('ghz-admin');
  showLogin();
}

// ── NAVIGATION ────────────────────────────────────
function navigate(sec) {
  if (['post-generator', 'admins'].includes(sec) && currentUserRole !== 'superadmin') {
    sec = 'dashboard';
  }
  currentSec = sec;
  document.querySelectorAll('.as-link').forEach(b =>
    b.classList.toggle('active', b.dataset.sec === sec)
  );
  ({ dashboard: renderDashboard, products: renderProducts,
     events: renderEvents, orders: renderOrders,
     'post-generator': renderPostGenerator, admins: renderAdmins,
     media: renderMedia, config: renderConfig, policies: renderPolicies })[sec]?.();
}

function setContent(html) {
  document.getElementById('a-content').innerHTML = html;
}

// ── DRAWER ────────────────────────────────────────
function openDrawer(title, bodyHtml, onSave) {
  saveFn = onSave;
  document.getElementById('a-dw-title').textContent = title;
  document.getElementById('a-dw-body').innerHTML    = bodyHtml;

  const ft = document.getElementById('a-dw-ft');
  ft.innerHTML = `
    <button class="a-btn-primary" id="dw-save">GUARDAR</button>
    <button class="a-btn-secondary" id="dw-cancel">Cancelar</button>`;
  document.getElementById('dw-save').addEventListener('click', async () => {
    const btn = document.getElementById('dw-save');
    btn.disabled = true; btn.textContent = 'GUARDANDO...';
    try {
      await saveFn();
      closeDrawer();
    } catch (err) {
      toast(err.message, 'err');
      btn.disabled = false; btn.textContent = 'GUARDAR';
    }
  });
  document.getElementById('dw-cancel').addEventListener('click', closeDrawer);

  document.getElementById('a-drawer-overlay').classList.add('open');
  document.getElementById('a-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('a-drawer-overlay').classList.remove('open');
  const dw = document.getElementById('a-drawer');
  dw.classList.remove('open');
  dw.classList.remove('wide');
  document.body.style.overflow = '';
  saveFn = null;
}

// ── TOAST ─────────────────────────────────────────
function toast(msg, type = 'ok') {
  const icon = { ok: '✓', err: '✕', inf: '●' }[type] || '●';
  const wrap = document.getElementById('a-toast-wrap');
  const el   = document.createElement('div');
  el.className = `a-toast ${type}`;
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 3200);
}

// ── IMAGE UPLOAD WIDGET ───────────────────────────
function imgWidget(id, currentUrl = '') {
  const optUrl = cldOptimize(currentUrl, { w: 150 });
  return `
    <div class="a-img-wrap">
      <img class="a-img-prev" id="${id}-prev"
        src="${optUrl}" onerror="this.style.opacity='.25'"
        style="${optUrl ? '' : 'opacity:.25'}" />
      <div class="a-img-ctrl">
        <label class="a-img-filebtn" for="${id}-file">📎 Seleccionar archivo</label>
        <input type="file" id="${id}-file" accept="image/*" style="display:none" />
        <span class="a-img-fname" id="${id}-fname">
          ${currentUrl ? currentUrl.split('/').pop().slice(0,35) : 'Sin imagen'}
        </span>
        ${!cloudReady ? `<span class="a-img-warn">⚠ Cloudinary no configurado — solo URL</span>` : ''}
        <input class="a-input" id="${id}-url" type="text"
          placeholder="/images/... o URL completa"
          value="${currentUrl}" style="margin-top:.4rem" />
      </div>
    </div>`;
}

function bindImgWidget(id, onChange = null) {
  document.getElementById(`${id}-file`)?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const prev = document.getElementById(`${id}-prev`);
    prev.src = URL.createObjectURL(file);
    prev.style.opacity = '1';
    document.getElementById(`${id}-fname`).textContent = file.name;
    document.getElementById(`${id}-url`).value = '';
    if (onChange) onChange();
  });
  document.getElementById(`${id}-url`)?.addEventListener('input', () => {
    const url = document.getElementById(`${id}-url`).value.trim();
    const prev = document.getElementById(`${id}-prev`);
    prev.src = url;
    prev.style.opacity = url ? '1' : '.25';
    document.getElementById(`${id}-fname`).textContent = url ? url.split('/').pop().slice(0,35) : 'Sin imagen';
    if (onChange) onChange();
  });
}

async function resolveImg(id, folder = 'gearheadz/products') {
  const file = document.getElementById(`${id}-file`)?.files[0];
  if (file && cloudReady) {
    toast('Subiendo imagen…', 'inf');
    return await uploadImage(file, folder);
  }
  return document.getElementById(`${id}-url`)?.value.trim() || '';
}

async function resolveVideo(id, folder = 'gearheadz/hero') {
  const file = document.getElementById(`${id}-file`)?.files[0];
  if (file && cloudReady) {
    toast('Subiendo video…', 'inf');
    return await uploadVideo(file, folder);
  }
  return document.getElementById(`${id}-url`)?.value.trim() || '';
}

// ── SIZES HTML ────────────────────────────────────
function sizesHtml(selected = []) {
  return `<div class="a-sizes-wrap">${
    ALL_SIZES.map(s => `
      <input class="a-sz-cb" type="checkbox" id="sz-${s}" value="${s}"
        ${selected.includes(s) ? 'checked' : ''} />
      <label class="a-sz-lbl" for="sz-${s}">${s}</label>`
    ).join('')
  }</div>`;
}

function getSelectedSizes() {
  return ALL_SIZES.filter(s => document.getElementById(`sz-${s}`)?.checked);
}

// ── GOOGLE MAPS HELPERS ───────────────────────────
function mapsEmbedUrl(address) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
function mapsDirectUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// ════════════════════════════════════════════════
// SECCIÓN: DASHBOARD
// ════════════════════════════════════════════════
async function renderDashboard() {
  setContent('<div class="a-loading">Cargando estadísticas…</div>');
  const [products, events, ordersData] = await Promise.all([getProducts(), getEvents(), getOrders()]);
  const soldOut   = products.filter(p => p.stock === 0).length;
  const lowStock  = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const openEvts  = events.filter(e => e.status === 'open').length;

  const orders = ordersData.list || [];
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">DASHBOARD</div>
        <div class="a-page-sub">GearHeadz Motorsports — Panel de control</div>
      </div>
      <a href="/" target="_blank" class="a-btn-secondary">VER SITIO →</a>
    </div>

    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat-val">${products.length}</div>
        <div class="a-stat-lbl">PRODUCTOS</div>
      </div>
      <div class="a-stat ${soldOut ? 'danger' : ''}">
        <div class="a-stat-val">${soldOut}</div>
        <div class="a-stat-lbl">SOLD OUT</div>
      </div>
      <div class="a-stat ${lowStock ? 'warn' : ''}">
        <div class="a-stat-val">${lowStock}</div>
        <div class="a-stat-lbl">POCO STOCK</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-val">${events.length}</div>
        <div class="a-stat-lbl">EVENTOS</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-val" style="color:var(--green)">$${totalSales.toFixed(2)}</div>
        <div class="a-stat-lbl">TOTAL VENTAS</div>
      </div>
      <div class="a-stat ${pendingOrders ? 'warn' : ''}">
        <div class="a-stat-val">${pendingOrders}</div>
        <div class="a-stat-lbl">PEDIDOS PENDIENTES</div>
      </div>
    </div>

    <div class="a-divider"></div>

    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2rem">
      <button class="a-btn-primary" id="db-new-product">+ NUEVO PRODUCTO</button>
      <button class="a-btn-primary" id="db-new-event">+ NUEVO EVENTO</button>
    </div>

    <div class="a-cfg-card">
      <div class="a-cfg-title">ESTADO DE SERVICIOS</div>
      <div class="a-status-row">
        <span>Firebase / Firestore</span>
        <span class="a-badge ${fbReady ? 'ok' : 'danger'}">${fbReady ? '● CONECTADO' : '● SIN CONFIGURAR'}</span>
      </div>
      <div class="a-status-row">
        <span>Cloudinary</span>
        <span class="a-badge ${cloudReady ? 'ok' : 'danger'}">${cloudReady ? '● CONECTADO' : '● SIN CONFIGURAR'}</span>
      </div>
      ${!fbReady ? `
      <p style="font-size:.72rem;color:var(--yellow);margin-top:1rem;line-height:1.6">
        ⚠ Firebase no está configurado. Los cambios en el panel <strong>no se guardan</strong> en la nube.<br>
        Edita <code style="background:var(--ink);padding:.1rem .35rem;border-radius:3px">js/firebase.js</code> con tus credenciales del proyecto.
      </p>` : ''}
    </div>
  `);

  document.getElementById('db-new-product')?.addEventListener('click', () => {
    navigate('products');
    setTimeout(() => openProductForm(), 100);
  });
  document.getElementById('db-new-event')?.addEventListener('click', () => {
    navigate('events');
    setTimeout(() => openEventForm(), 100);
  });
}

// ════════════════════════════════════════════════
// SECCIÓN: PRODUCTOS
// ════════════════════════════════════════════════
async function renderProducts() {
  setContent('<div class="a-loading">Cargando productos…</div>');
  const products = await getProducts();

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">PRODUCTOS</div>
        <div class="a-page-sub">${products.length} productos — Filtro:
          <select id="prod-filter" style="background:var(--card2);border:1px solid var(--line);color:var(--snow);border-radius:4px;padding:.2rem .5rem;font-size:.75rem;margin-left:.4rem">
            <option value="ALL">TODOS</option>
            ${CATS.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="a-btn-primary" id="btn-new-prod">+ NUEVO PRODUCTO</button>
    </div>

    <div class="a-table-outer">
      <div class="a-table-wrap">
        <table class="a-table" id="prod-table">
          <thead>
            <tr>
              <th>IMG</th>
              <th>NOMBRE</th>
              <th>CATEGORÍA</th>
              <th>PRECIO</th>
              <th>STOCK</th>
              <th>BADGE</th>
              <th>TALLAS</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="prod-tbody"></tbody>
        </table>
      </div>
    </div>
  `);

  function renderRows(list) {
    document.getElementById('prod-tbody').innerHTML = list.length ? list.map(p => {
      const sold = p.stock === 0;
      const low  = p.stock > 0 && p.stock <= 5;
      const stockBadge = sold
        ? `<span class="a-badge danger">SOLD OUT</span>`
        : low
          ? `<span class="a-badge warn">${p.stock} LEFT</span>`
          : `<span style="font-size:.78rem">${p.stock}</span>`;
      const badgeEl = p.badge
        ? `<span class="a-badge ${p.badge === 'LIMITED' ? 'lim' : 'new'}">${p.badge}</span>`
        : '—';

      return `
        <tr>
          <td>${p.img
            ? `<img class="a-thumb" src="${escapeHTML(p.img)}" alt="" />`
            : `<div class="a-thumb-ph">◻</div>`}
          </td>
          <td style="font-weight:500;max-width:180px">${escapeHTML(p.name)}</td>
          <td><span style="font-size:.72rem;color:var(--muted)">${escapeHTML(p.cat)}</span></td>
          <td>$${p.price}</td>
          <td>${stockBadge}</td>
          <td>${badgeEl}</td>
          <td style="font-size:.72rem;color:var(--muted);max-width:140px">
            ${(p.sizes || []).join(', ')}
          </td>
          <td>
            <div class="a-actions">
              <button class="a-btn-edit" data-id="${p.id}">Editar</button>
              <button class="a-btn-del"  data-del="${p.id}">Eliminar</button>
            </div>
          </td>
        </tr>`;
    }).join('') : `
      <tr><td colspan="8">
        <div class="a-empty"><div class="a-empty-ico">◻</div><div>Sin productos</div></div>
      </td></tr>`;
  }

  let allProds = products;
  renderRows(allProds);

  document.getElementById('prod-filter').addEventListener('change', e => {
    const f = e.target.value;
    renderRows(f === 'ALL' ? allProds : allProds.filter(p => p.cat === f));
  });

  document.getElementById('btn-new-prod').addEventListener('click', () => openProductForm());

  document.getElementById('prod-tbody').addEventListener('click', async e => {
    const editId = e.target.closest('[data-id]')?.dataset.id;
    const delId  = e.target.closest('[data-del]')?.dataset.del;

    if (editId) {
      const p = allProds.find(x => x.id === editId);
      if (p) openProductForm(p);
    }
    if (delId) {
      if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
      try {
        await deleteProduct(delId);
        toast('Producto eliminado');
        allProds = allProds.filter(x => x.id !== delId);
        renderRows(allProds);
      } catch (err) { toast(err.message, 'err'); }
    }
  });
}

function openProductForm(p = null) {
  const isNew = !p;
  const d = p || { name: '', price: 30, cat: 'APPAREL', stock: 10, badge: '', sizes: ['S','M','L','XL'], img: '' };

  document.getElementById('a-drawer').classList.add('wide');

  openDrawer(isNew ? 'NUEVO PRODUCTO' : 'EDITAR PRODUCTO', `
    <div class="a-dw-form-col">
      <div class="a-field">
        <label>NOMBRE DEL PRODUCTO</label>
        <input class="a-input" id="pf-name" value="${d.name}" placeholder="Ej. SUPRA MK5 TEE" />
      </div>
      <div class="a-grid-2">
        <div class="a-field">
          <label>PRECIO ($)</label>
          <input class="a-input" id="pf-price" type="number" min="0" value="${d.price}" />
        </div>
        <div class="a-field">
          <label>STOCK</label>
          <input class="a-input" id="pf-stock" type="number" min="0" value="${d.stock}" />
        </div>
      </div>
      <div class="a-grid-2">
        <div class="a-field">
          <label>CATEGORÍA</label>
          <select class="a-select" id="pf-cat">
            ${CATS.map(c => `<option ${d.cat===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="a-field">
          <label>BADGE</label>
          <select class="a-select" id="pf-badge">
            ${BADGES.map(b => `<option value="${b}" ${d.badge===b?'selected':''}>${b || 'Sin badge'}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="a-field">
        <label>TALLAS DISPONIBLES</label>
        ${sizesHtml(d.sizes || [])}
      </div>
      <div class="a-form-sep"></div>
      <div class="a-form-sec">IMAGEN DEL PRODUCTO</div>
      <div class="a-field">
        ${imgWidget('pf-img', d.img || '')}
      </div>
    </div>
    <div class="a-dw-preview-col">
      <div class="a-form-sec" style="margin-bottom:0.5rem">VISTA PREVIA EN VIVO</div>
      <div class="p-card" style="pointer-events: auto;">
        <div class="p-card-img">
          <div class="p-card-img-inner" id="pv-img-container"></div>
          <span class="p-badge" id="pv-badge"></span>
          <div class="p-card-overlay">
            <div style="display:flex;gap:.35rem;flex-wrap:wrap" id="pv-sizes"></div>
            <button class="osz-cart-btn" style="pointer-events: none;">ADD</button>
          </div>
        </div>
        <div class="p-card-body">
          <span class="p-cat" id="pv-cat"></span>
          <div class="p-name" id="pv-name"></div>
          <div class="p-foot">
            <span class="p-price" id="pv-price"></span>
            <span class="p-stock" id="pv-stock"></span>
          </div>
        </div>
      </div>
      <div class="a-preview-hint">Pasa el cursor sobre la tarjeta para probar el hover y ver las tallas</div>
    </div>
  `, async () => {
    const name  = document.getElementById('pf-name').value.trim();
    const price = Number(document.getElementById('pf-price').value);
    const stock = Number(document.getElementById('pf-stock').value);
    const cat   = document.getElementById('pf-cat').value;
    const badge = document.getElementById('pf-badge').value || null;
    const sizes = getSelectedSizes();
    const img   = await resolveImg('pf-img');

    if (!name) throw new Error('El nombre es obligatorio');
    if (!sizes.length) throw new Error('Selecciona al menos una talla');

    await saveProduct({ ...(isNew ? {} : { id: p.id }), name, price, stock, cat, badge, sizes, img });
    toast(isNew ? 'Producto creado ✓' : 'Producto actualizado ✓');
    renderProducts();
  });

  const syncLivePreview = () => {
    const nameEl = document.getElementById('pf-name');
    const priceEl = document.getElementById('pf-price');
    const stockEl = document.getElementById('pf-stock');
    const catEl = document.getElementById('pf-cat');
    const badgeEl = document.getElementById('pf-badge');
    
    if (!nameEl) return; // Drawer closed
    
    const name = nameEl.value.trim() || 'NOMBRE DEL PRODUCTO';
    const price = Number(priceEl.value) || 0;
    const stock = Number(stockEl.value) || 0;
    const cat = catEl.value;
    const badge = badgeEl.value;
    
    // Update labels
    document.getElementById('pv-name').textContent = name.toUpperCase();
    document.getElementById('pv-price').textContent = `$${price}.00`;
    document.getElementById('pv-cat').textContent = cat;
    
    // Stock Status
    const pvStock = document.getElementById('pv-stock');
    const isSold = stock === 0;
    if (isSold) {
      pvStock.textContent = 'SOLD OUT';
      pvStock.className = 'p-stock out';
    } else if (stock <= 5) {
      pvStock.textContent = `${stock} LEFT`;
      pvStock.className = 'p-stock low';
    } else {
      pvStock.textContent = `${stock} IN STOCK`;
      pvStock.className = 'p-stock';
    }
    
    // Badge status
    const pvBadge = document.getElementById('pv-badge');
    if (isSold) {
      pvBadge.textContent = 'SOLD OUT';
      pvBadge.className = 'p-badge sold';
      pvBadge.style.display = 'block';
    } else if (badge && badge !== 'null') {
      pvBadge.textContent = badge;
      pvBadge.className = `p-badge ${badge === 'LIMITED' ? 'lim' : ''}`;
      pvBadge.style.display = 'block';
    } else {
      pvBadge.style.display = 'none';
    }
    
    // Sizes list
    const pvSizes = document.getElementById('pv-sizes');
    const selectedSizes = [];
    ALL_SIZES.forEach(s => {
      const cb = document.getElementById(`sz-${s}`);
      if (cb && cb.checked) selectedSizes.push(s);
    });
    pvSizes.innerHTML = selectedSizes.map(s => 
      `<button class="osz-btn ${isSold ? 'os-sold' : ''}" ${isSold ? 'disabled' : ''}>${s}</button>`
    ).join('');
    
    // Image uploader
    const imgContainer = document.getElementById('pv-img-container');
    const fileInput = document.getElementById('pf-img-file');
    const urlInput = document.getElementById('pf-img-url');
    
    let imgSrc = '';
    if (fileInput && fileInput.files && fileInput.files[0]) {
      imgSrc = URL.createObjectURL(fileInput.files[0]);
    } else if (urlInput && urlInput.value.trim()) {
      imgSrc = urlInput.value.trim();
    }
    
    if (imgSrc) {
      imgContainer.innerHTML = `<img src="${imgSrc}" alt="${name}" />`;
    } else {
      imgContainer.innerHTML = `<span style="font-size:2rem;opacity:.15">🏎</span>`;
    }
  };

  // Attach keyup and inputs listeners
  ['pf-name', 'pf-price', 'pf-stock'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', syncLivePreview);
  });
  ['pf-cat', 'pf-badge'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', syncLivePreview);
  });
  
  // Sizes CB
  ALL_SIZES.forEach(s => {
    document.getElementById(`sz-${s}`)?.addEventListener('change', syncLivePreview);
  });

  bindImgWidget('pf-img', syncLivePreview);
  syncLivePreview();
}

// ════════════════════════════════════════════════
// SECCIÓN: EVENTOS
// ════════════════════════════════════════════════
async function renderEvents() {
  setContent('<div class="a-loading">Cargando eventos…</div>');
  const events = await getEvents();

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">EVENTOS</div>
        <div class="a-page-sub">${events.length} eventos en el calendario</div>
      </div>
      <button class="a-btn-primary" id="btn-new-ev">+ NUEVO EVENTO</button>
    </div>
    <div class="a-ev-list" id="ev-list"></div>
  `);

  let allEvs = events;

  function renderList(list) {
    const statusLabel = { open: 'OPEN', limited: 'FEW LEFT', soon: 'COMING SOON' };
    const statusCls   = { open: 'ok',   limited: 'warn',      soon: 'muted' };
    document.getElementById('ev-list').innerHTML = list.length ? list.map(ev => `
      <div class="a-ev-row">
        <div class="a-ev-img" style="background-image:url('${escapeHTML(ev.img)}')"></div>
        <div class="a-ev-info">
          <div class="a-ev-name">${escapeHTML(ev.name)}</div>
          <div class="a-ev-meta">
            ${escapeHTML(ev.month)} ${escapeHTML(ev.day)}${ev.year ? ' · ' + escapeHTML(ev.year) : ''}
            ${ev.price ? ' · $' + escapeHTML(ev.price) : ''}
            ${ev.location ? ' · 📍 ' + escapeHTML(ev.location) : ''}
            ${ev.instagramUrl ? ' · 📸 Embed' : ''}
          </div>
        </div>
        <span class="a-badge ${statusCls[ev.status] || 'muted'}">${statusLabel[ev.status] || ev.status}</span>
        <div class="a-ev-actions">
          <button class="a-btn-edit" data-id="${ev.id}">Editar</button>
          <button class="a-btn-del"  data-del="${ev.id}">Eliminar</button>
        </div>
      </div>
    `).join('') : `
      <div class="a-empty"><div class="a-empty-ico">◷</div><div>Sin eventos</div></div>`;
  }

  renderList(allEvs);

  document.getElementById('btn-new-ev').addEventListener('click', () => openEventForm());

  document.getElementById('ev-list').addEventListener('click', async e => {
    const editId = e.target.closest('[data-id]')?.dataset.id;
    const delId  = e.target.closest('[data-del]')?.dataset.del;
    if (editId) openEventForm(allEvs.find(x => x.id === editId));
    if (delId) {
      if (!confirm('¿Eliminar este evento?')) return;
      try {
        await deleteEvent(delId);
        toast('Evento eliminado');
        allEvs = allEvs.filter(x => x.id !== delId);
        renderList(allEvs);
      } catch (err) { toast(err.message, 'err'); }
    }
  });
}

function openEventForm(ev = null) {
  const isNew = !ev;
  const d = ev || {
    name: '', month: '', day: '', year: '2026',
    timeStart: '', timeEnd: '', location: '',
    description: '', price: '', status: 'open',
    img: '', mapsEmbed: '', mapsLink: '',
    instagramUrl: '',
  };

  openDrawer(isNew ? 'NUEVO EVENTO' : 'EDITAR EVENTO', `
    <div class="a-field">
      <label>NOMBRE DEL EVENTO</label>
      <input class="a-input" id="ef-name" value="${d.name}" placeholder="Ej. TOKYO SEASON CLOSER" />
    </div>
    <div class="a-grid-3">
      <div class="a-field">
        <label>MES</label>
        <input class="a-input" id="ef-month" value="${d.month}" placeholder="OCT" maxlength="3" style="text-transform:uppercase" />
      </div>
      <div class="a-field">
        <label>DÍA</label>
        <input class="a-input" id="ef-day" value="${d.day}" placeholder="26" maxlength="2" />
      </div>
      <div class="a-field">
        <label>AÑO</label>
        <input class="a-input" id="ef-year" value="${d.year}" placeholder="2026" maxlength="4" />
      </div>
    </div>
    <div class="a-grid-2">
      <div class="a-field">
        <label>HORA INICIO</label>
        <input class="a-input" id="ef-start" value="${d.timeStart}" placeholder="1:00 PM" />
      </div>
      <div class="a-field">
        <label>HORA FIN</label>
        <input class="a-input" id="ef-end" value="${d.timeEnd}" placeholder="6:00 PM" />
      </div>
    </div>
    <div class="a-grid-2">
      <div class="a-field">
        <label>PRECIO TICKET ($) — dejar vacío si es gratis/TBA</label>
        <input class="a-input" id="ef-price" type="number" min="0" value="${d.price ?? ''}" placeholder="120" />
      </div>
      <div class="a-field">
        <label>ESTADO</label>
        <select class="a-select" id="ef-status">
          <option value="open"    ${d.status==='open'    ?'selected':''}>OPEN</option>
          <option value="limited" ${d.status==='limited' ?'selected':''}>FEW LEFT</option>
          <option value="soon"    ${d.status==='soon'    ?'selected':''}>COMING SOON</option>
        </select>
      </div>
    </div>
    <div class="a-field">
      <label>UBICACIÓN (texto visible)</label>
      <input class="a-input" id="ef-loc" value="${d.location}" placeholder="@2gearheadz / Nombre del lugar" />
    </div>
    <div class="a-field">
      <label>DESCRIPCIÓN</label>
      <textarea class="a-textarea" id="ef-desc" rows="3">${d.description}</textarea>
    </div>
    <div class="a-field">
      <label>LINK DE INSTAGRAM (OPCIONAL - MOSTRARÁ EL EMBED INTERACTIVO)</label>
      <input class="a-input" id="ef-instagram" value="${d.instagramUrl || ''}" placeholder="Ej. https://www.instagram.com/p/DM0UqaGxrqo/" />
    </div>

    <div class="a-form-sep"></div>
    <div class="a-form-sec">IMAGEN DE FONDO</div>
    <div class="a-field">${imgWidget('ef-img', d.img || '')}</div>

    <div class="a-form-sep"></div>
    <div class="a-form-sec">UBICACIÓN EN GOOGLE MAPS</div>
    <div class="a-field">
      <label>BUSCAR DIRECCIÓN</label>
      <div class="a-maps-row">
        <input class="a-input" id="ef-maps-addr"
          placeholder="Ej. San José, Costa Rica"
          value="${d.mapsLink ? decodeURIComponent((d.mapsLink.split('query=')[1] || '').replace(/\+/g,' ')) : ''}" />
        <button class="a-maps-btn" id="ef-maps-gen" type="button">📍 Generar</button>
      </div>
    </div>
    <div id="ef-maps-prev" style="${d.mapsEmbed ? '' : 'display:none'}">
      <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;
        background:var(--ink);border:1px solid var(--line);border-radius:6px;margin-top:.4rem">
        <span style="font-size:1.3rem">📍</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:.62rem;letter-spacing:.1em;color:var(--muted);margin-bottom:.2rem">UBICACIÓN GUARDADA</div>
          <a id="ef-maps-link" href="${d.mapsLink || '#'}" target="_blank" rel="noopener noreferrer"
             style="font-size:.8rem;color:var(--red);word-break:break-all;text-decoration:none">
             ${d.mapsLink ? 'Ver en Google Maps →' : ''}
          </a>
        </div>
        <button type="button" id="ef-maps-clear"
          style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:1rem;padding:.25rem;line-height:1"
          title="Quitar ubicación">✕</button>
      </div>
      <input type="hidden" id="ef-maps-embed" value="${d.mapsEmbed}" />
    </div>
  `, async () => {
    const name   = document.getElementById('ef-name').value.trim();
    const month  = document.getElementById('ef-month').value.trim().toUpperCase();
    const day    = document.getElementById('ef-day').value.trim();
    const year   = document.getElementById('ef-year').value.trim();
    const tStart = document.getElementById('ef-start').value.trim();
    const tEnd   = document.getElementById('ef-end').value.trim();
    const loc    = document.getElementById('ef-loc').value.trim();
    const desc   = document.getElementById('ef-desc').value.trim();
    const price  = document.getElementById('ef-price').value;
    const status = document.getElementById('ef-status').value;
    const img    = await resolveImg('ef-img', 'gearheadz/events');
    const embed  = document.getElementById('ef-maps-embed')?.value || d.mapsEmbed || '';
    const addr   = document.getElementById('ef-maps-addr').value.trim();
    const link   = addr ? mapsDirectUrl(addr) : d.mapsLink || '';
    const instagramUrl = document.getElementById('ef-instagram').value.trim() || null;

    if (!name) throw new Error('El nombre del evento es obligatorio');

    await saveEvent({
      ...(isNew ? {} : { id: ev.id }),
      name, month, day, year, timeStart: tStart, timeEnd: tEnd,
      location: loc, description: desc,
      price: price !== '' ? Number(price) : null,
      status, img, mapsEmbed: embed, mapsLink: link,
      instagramUrl,
    });
    toast(isNew ? 'Evento creado ✓' : 'Evento actualizado ✓');
    renderEvents();
  });

  bindImgWidget('ef-img');

  // Google Maps generator — shows link, no iframe (avoids blocking renderer)
  document.getElementById('ef-maps-gen')?.addEventListener('click', () => {
    const addr = document.getElementById('ef-maps-addr').value.trim();
    if (!addr) { toast('Escribe una dirección primero', 'inf'); return; }
    const embedUrl = mapsEmbedUrl(addr);
    const linkUrl  = mapsDirectUrl(addr);
    const prevWrap = document.getElementById('ef-maps-prev');
    prevWrap.style.display = '';
    document.getElementById('ef-maps-embed').value = embedUrl;
    const linkEl = document.getElementById('ef-maps-link');
    linkEl.href = linkUrl;
    linkEl.textContent = `Ver "${addr}" en Google Maps →`;
  });

  // Clear map
  document.getElementById('ef-maps-clear')?.addEventListener('click', () => {
    document.getElementById('ef-maps-prev').style.display = 'none';
    document.getElementById('ef-maps-embed').value = '';
    document.getElementById('ef-maps-addr').value = '';
    const linkEl = document.getElementById('ef-maps-link');
    if (linkEl) { linkEl.href = '#'; linkEl.textContent = ''; }
  });
}

// ════════════════════════════════════════════════
// SECCIÓN: HERO / MEDIA
// ════════════════════════════════════════════════
async function renderMedia() {
  setContent('<div class="a-loading">Cargando configuración de media…</div>');
  const cfg = await getSiteConfig();

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">HERO / MEDIA</div>
        <div class="a-page-sub">Videos e imágenes de fondo de cada página</div>
      </div>
    </div>
    <div class="a-media-grid">

      <div class="a-media-card">
        <div>
          <div class="a-media-lbl">PÁGINA HOME</div>
          <div class="a-media-name">Video Hero</div>
        </div>
        <video class="a-media-preview" src="${cfg.heroHome}" muted autoplay loop playsinline
          style="object-fit:cover"></video>
        <div class="a-field">
          <label>URL / RUTA DEL VIDEO</label>
          <input class="a-input" id="m-home-url" value="${cfg.heroHome}"
            placeholder="/video/supra.mp4" />
        </div>
        ${cloudReady ? `
          <div>
            <label class="a-img-filebtn" for="m-home-file">📎 Subir video (.mp4)</label>
            <input type="file" id="m-home-file" accept="video/*" style="display:none" />
            <span class="a-img-fname" id="m-home-fname" style="display:block;margin-top:.4rem">Sin archivo</span>
          </div>` : `<span class="a-img-warn">⚠ Configura Cloudinary para subir archivos</span>`}
        <button class="a-btn-primary" id="save-home-hero">GUARDAR CAMBIO</button>
      </div>

      <div class="a-media-card">
        <div>
          <div class="a-media-lbl">PÁGINA STORE</div>
          <div class="a-media-name">Imagen Hero</div>
        </div>
        <img class="a-media-preview" src="${cfg.heroStore}" alt="Store hero"
          onerror="this.style.opacity='.3'" />
        <div class="a-field">
          <label>URL / RUTA DE IMAGEN</label>
          <input class="a-input" id="m-store-url" value="${cfg.heroStore}"
            placeholder="/images/store_hero.png" />
        </div>
        ${cloudReady ? `
          <div>
            <label class="a-img-filebtn" for="m-store-file">📎 Subir imagen</label>
            <input type="file" id="m-store-file" accept="image/*" style="display:none" />
            <span class="a-img-fname" id="m-store-fname" style="display:block;margin-top:.4rem">Sin archivo</span>
          </div>` : `<span class="a-img-warn">⚠ Configura Cloudinary para subir archivos</span>`}
        <button class="a-btn-primary" id="save-store-hero">GUARDAR CAMBIO</button>
      </div>

      <div class="a-media-card">
        <div>
          <div class="a-media-lbl">PÁGINA EVENTS</div>
          <div class="a-media-name">Video Hero</div>
        </div>
        <video class="a-media-preview" src="${cfg.heroEvents}" muted autoplay loop playsinline
          style="object-fit:cover"></video>
        <div class="a-field">
          <label>URL / RUTA DEL VIDEO</label>
          <input class="a-input" id="m-ev-url" value="${cfg.heroEvents}"
            placeholder="/video/events.mp4" />
        </div>
        ${cloudReady ? `
          <div>
            <label class="a-img-filebtn" for="m-ev-file">📎 Subir video (.mp4)</label>
            <input type="file" id="m-ev-file" accept="video/*" style="display:none" />
            <span class="a-img-fname" id="m-ev-fname" style="display:block;margin-top:.4rem">Sin archivo</span>
          </div>` : `<span class="a-img-warn">⚠ Configura Cloudinary para subir archivos</span>`}
        <button class="a-btn-primary" id="save-ev-hero">GUARDAR CAMBIO</button>
      </div>

    </div>
  `);

  // File name previews
  [['m-home-file','m-home-fname'], ['m-store-file','m-store-fname'], ['m-ev-file','m-ev-fname']]
    .forEach(([fileId, nameId]) => {
      document.getElementById(fileId)?.addEventListener('change', e => {
        const f = e.target.files[0];
        if (f) document.getElementById(nameId).textContent = f.name;
      });
    });

  document.getElementById('save-home-hero')?.addEventListener('click', async () => {
    try {
      const file = document.getElementById('m-home-file')?.files[0];
      const url  = file && cloudReady
        ? await resolveVideo('m-home', 'gearheadz/hero')
        : document.getElementById('m-home-url').value.trim();
      await saveSiteConfig({ heroHome: url });
      toast('Hero home actualizado ✓');
    } catch (e) { toast(e.message, 'err'); }
  });

  document.getElementById('save-store-hero')?.addEventListener('click', async () => {
    try {
      const file = document.getElementById('m-store-file')?.files[0];
      const url  = file && cloudReady
        ? await resolveImg('m-store', 'gearheadz/hero')
        : document.getElementById('m-store-url').value.trim();
      await saveSiteConfig({ heroStore: url });
      toast('Hero store actualizado ✓');
    } catch (e) { toast(e.message, 'err'); }
  });

  document.getElementById('save-ev-hero')?.addEventListener('click', async () => {
    try {
      const file = document.getElementById('m-ev-file')?.files[0];
      const url  = file && cloudReady
        ? await resolveVideo('m-ev', 'gearheadz/hero')
        : document.getElementById('m-ev-url').value.trim();
      await saveSiteConfig({ heroEvents: url });
      toast('Hero events actualizado ✓');
    } catch (e) { toast(e.message, 'err'); }
  });
}

// ════════════════════════════════════════════════
// SECCIÓN: CONFIGURACIÓN
// ════════════════════════════════════════════════
async function renderConfig() {
  setContent('<div class="a-loading">Cargando configuración…</div>');
  const cfg = await getSiteConfig();

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">CONFIGURACIÓN</div>
        <div class="a-page-sub">Redes sociales, textos y ajustes globales del sitio</div>
      </div>
    </div>

    <div class="a-cfg-card">
      <div class="a-cfg-title">REDES SOCIALES</div>
      <div class="a-field">
        <label>INSTAGRAM</label>
        <input class="a-input" id="cfg-ig" value="${cfg.socialIG || ''}" placeholder="https://instagram.com/..." />
      </div>
      <div class="a-field">
        <label>TIKTOK</label>
        <input class="a-input" id="cfg-tt" value="${cfg.socialTT || ''}" placeholder="https://tiktok.com/..." />
      </div>
      <div class="a-field">
        <label>YOUTUBE</label>
        <input class="a-input" id="cfg-yt" value="${cfg.socialYT || ''}" placeholder="https://youtube.com/..." />
      </div>
      <div class="a-field">
        <label>FACEBOOK</label>
        <input class="a-input" id="cfg-fb" value="${cfg.socialFB || ''}" placeholder="https://facebook.com/..." />
      </div>
      <button class="a-btn-primary" id="save-social">GUARDAR REDES</button>
    </div>

    <div class="a-cfg-card">
      <div class="a-cfg-title">TEXTOS DEL SITIO</div>
      <div class="a-field">
        <label>TAGLINE DEL FOOTER</label>
        <textarea class="a-textarea" id="cfg-tagline" rows="2">${cfg.footerTagline || ''}</textarea>
      </div>
      <div class="a-field">
        <label>AÑO DE COPYRIGHT</label>
        <input class="a-input" id="cfg-year" value="${cfg.copyrightYear || '2026'}" style="width:120px" />
      </div>
      <button class="a-btn-primary" id="save-texts">GUARDAR TEXTOS</button>
    </div>

    ${fbReady ? `
    <div class="a-cfg-card">
      <div class="a-cfg-title">SEGURIDAD</div>
      <p style="font-size:.78rem;color:var(--muted);margin-bottom:1rem">
        Para cambiar la contraseña del admin, usa la consola de Firebase Authentication.
      </p>
      <a href="https://console.firebase.google.com" target="_blank" class="a-btn-secondary">
        Abrir Firebase Console →
      </a>
    </div>` : ''}
  `);

  document.getElementById('save-social')?.addEventListener('click', async () => {
    try {
      await saveSiteConfig({
        socialIG: document.getElementById('cfg-ig').value.trim(),
        socialTT: document.getElementById('cfg-tt').value.trim(),
        socialYT: document.getElementById('cfg-yt').value.trim(),
        socialFB: document.getElementById('cfg-fb').value.trim(),
      });
      toast('Redes sociales guardadas ✓');
    } catch (e) { toast(e.message, 'err'); }
  });

  document.getElementById('save-texts')?.addEventListener('click', async () => {
    try {
      await saveSiteConfig({
        footerTagline: document.getElementById('cfg-tagline').value.trim(),
        copyrightYear: document.getElementById('cfg-year').value.trim(),
      });
      toast('Textos guardados ✓');
    } catch (e) { toast(e.message, 'err'); }
  });
}

// ════════════════════════════════════════════════
// SECCIÓN: POLÍTICAS
// ════════════════════════════════════════════════
async function renderPolicies() {
  setContent('<div class="a-loading">Cargando políticas…</div>');
  const cfg = await getSiteConfig();
  let activeTab = 'privacy';

  function renderTabs() {
    setContent(`
      <div class="a-page-hd">
        <div>
          <div class="a-page-title">POLÍTICAS LEGALES</div>
          <div class="a-page-sub">Privacidad y Términos de Servicio</div>
        </div>
      </div>
      <div class="a-pol-tabs">
        <button class="a-pol-tab ${activeTab==='privacy'?'active':''}" data-tab="privacy">PRIVACY POLICY</button>
        <button class="a-pol-tab ${activeTab==='terms'?'active':''}"   data-tab="terms">TERMS OF SERVICE</button>
      </div>
      <div class="a-cfg-card" style="padding:0">
        <div style="padding:1rem 1.5rem;border-bottom:1px solid var(--line)">
          <span style="font-size:.65rem;letter-spacing:.14em;color:var(--muted)">
            ${activeTab === 'privacy' ? 'PRIVACY POLICY' : 'TERMS OF SERVICE'}
          </span>
        </div>
        <div style="padding:1.5rem">
          <textarea class="a-textarea" id="pol-text" rows="18" style="min-height:360px"
            placeholder="Escribe aquí el contenido completo...">${
              activeTab === 'privacy'
                ? (cfg.privacyPolicy || '')
                : (cfg.termsOfService || '')
            }</textarea>
          <div style="margin-top:1rem;display:flex;gap:.75rem">
            <button class="a-btn-primary" id="pol-save">GUARDAR CAMBIOS</button>
            <span style="font-size:.72rem;color:var(--muted);align-self:center">
              Los cambios se guardan en Firestore y se muestran en el sitio.
            </span>
          </div>
        </div>
      </div>
    `);

    document.querySelectorAll('.a-pol-tab').forEach(btn =>
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === activeTab) return;
        activeTab = btn.dataset.tab;
        renderTabs();
      })
    );

    document.getElementById('pol-save')?.addEventListener('click', async () => {
      const text = document.getElementById('pol-text').value;
      try {
        await saveSiteConfig(
          activeTab === 'privacy'
            ? { privacyPolicy: text }
            : { termsOfService: text }
        );
        cfg[activeTab === 'privacy' ? 'privacyPolicy' : 'termsOfService'] = text;
        toast('Política guardada ✓');
      } catch (e) { toast(e.message, 'err'); }
    });
  }

  renderTabs();
}

// ════════════════════════════════════════════════
// SECCIÓN: PEDIDOS / VENTAS
// ════════════════════════════════════════════════
let allOrders = [];
let ordersLastDoc = null;

async function renderOrders() {
  setContent('<div class="a-loading">Cargando pedidos…</div>');
  const res = await getOrders();
  allOrders = res.list || [];
  ordersLastDoc = res.lastDoc || null;

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">PEDIDOS / VENTAS</div>
        <div class="a-page-sub" id="order-count-label">${allOrders.length} pedidos cargados — Filtro:
          <select id="order-filter" style="background:var(--card2);border:1px solid var(--line);color:var(--snow);border-radius:4px;padding:.2rem .5rem;font-size:.75rem;margin-left:.4rem">
            <option value="ALL">TODOS</option>
            <option value="Confirmed">CONFIRMADOS</option>
            <option value="Pending">PENDIENTES</option>
            <option value="Shipped">ENVIADOS</option>
            <option value="Completed">COMPLETADOS</option>
          </select>
          <input type="text" id="order-search" placeholder="Buscar por email o # de orden..." style="background:var(--card2);border:1px solid var(--line);color:var(--snow);border-radius:4px;padding:.2rem .5rem;font-size:.75rem;margin-left:.6rem;width:220px" />
        </div>
      </div>
    </div>

    <div class="a-table-outer">
      <div class="a-table-wrap">
        <table class="a-table" id="order-table">
          <thead>
            <tr>
              <th>PEDIDO #</th>
              <th>FECHA</th>
              <th>CLIENTE</th>
              <th>PRODUCTOS</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
              <th>DIRECCIÓN ENVÍO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody id="order-tbody"></tbody>
        </table>
      </div>
    </div>
    <div id="order-load-more-wrap" style="text-align:center; padding: 1.5rem 0;"></div>
  `);

  function renderRows(list) {
    document.getElementById('order-tbody').innerHTML = list.length ? list.map(o => {
      // ── Status badge with full lifecycle ──────────
      const statusMap = {
        'Confirmed': '<span class="a-badge ok">✓ CONFIRMADO</span>',
        'Shipped':   '<span class="a-badge" style="background:rgba(59,130,246,.15);color:#60a5fa;border-color:#3b82f6">📦 ENVIADO</span>',
        'Completed': '<span class="a-badge" style="background:rgba(34,197,94,.15);color:#4ade80;border-color:#22c55e">✔ COMPLETADO</span>',
        'Pending':   '<span class="a-badge pending">⏳ PENDIENTE</span>',
      };
      const statusBadge = statusMap[o.status] || statusMap['Pending'];

      // Tracking info
      const trackingHtml = o.trackingNumber
        ? `<div style="font-size:.68rem;color:var(--yellow);margin-top:.3rem">📦 ${escapeHTML(o.trackingCarrier || '')} ${escapeHTML(o.trackingNumber)}</div>`
        : '';

      const dateStr = o.date
        ? new Date(o.date * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

      // Build products list string
      const itemsHtml = (o.items || []).map(item => `
        <div class="a-order-item">
          <span>${item.qty}x ${escapeHTML(item.name)} <span class="a-order-item-meta">(${escapeHTML(item.size) || 'ONE SIZE'})</span></span>
          <span style="color:var(--muted)">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
      `).join('');

      // Build shipping address string
      let addrHtml = '<span style="color:var(--muted);font-size:.75rem">Sin dirección</span>';
      let copyAddrText = '';
      if (o.shipping && o.shipping.address) {
        const a = o.shipping.address;
        const street = `${a.line1 || ''}${a.line2 ? ', ' + a.line2 : ''}`;
        const cityState = `${a.city || ''}, ${a.state || ''} ${a.postal_code || ''}`;
        const country = a.country || '';
        
        addrHtml = `
          <div class="a-order-addr">
            <div style="font-weight:500">${escapeHTML(o.shipping.name || '')}</div>
            <div>${escapeHTML(street)}</div>
            <div>${escapeHTML(cityState)}</div>
            <div>${escapeHTML(country)}</div>
            <button class="a-order-copy-btn" data-copy="${o.id}">📋 Copiar</button>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${cityState}, ${country}`)}" target="_blank" rel="noopener noreferrer" style="font-size:.7rem;color:var(--yellow);margin-left:.5rem;text-decoration:underline">📍 Mapa</a>
          </div>
        `;
        copyAddrText = `${o.shipping.name || ''}\n${street}\n${cityState}\n${country}`;
      }

      // ── Action buttons based on current status ────
      let actionsHtml = '';
      if (o.status === 'Confirmed' || o.status === 'Pending') {
        actionsHtml = `
          <button class="a-btn-edit mark-shipped" style="border-color:var(--yellow);color:var(--yellow)">📦 Marcar Enviado</button>
          <button class="a-btn-del delete-order">Eliminar</button>`;
      } else if (o.status === 'Shipped') {
        actionsHtml = `
          <button class="a-btn-edit mark-completed" style="border-color:var(--green);color:var(--green)">✔ Completar</button>
          <button class="a-btn-del delete-order">Eliminar</button>`;
      } else {
        actionsHtml = `
          <button class="a-btn-edit reopen-order" style="border-color:#666;color:var(--muted)">↩ Reabrir</button>
          <button class="a-btn-del delete-order">Eliminar</button>`;
      }

      return `
        <tr data-order-id="${o.id}">
          <td style="font-family:'JetBrains Mono', monospace;font-size:.8rem;font-weight:500">${o.orderNum || o.id.slice(-8).toUpperCase()}</td>
          <td style="font-size:.78rem;white-space:nowrap">${dateStr}</td>
          <td>
            <div class="a-order-customer">${escapeHTML(o.customer?.name || 'Invitado')}</div>
            <div class="a-order-email">${escapeHTML(o.customer?.email || '')}</div>
            <div class="a-order-phone">${escapeHTML(o.customer?.phone || '')}</div>
          </td>
          <td>
            <div class="a-order-items" style="min-width:180px">${itemsHtml}</div>
          </td>
          <td style="font-weight:600">$${(o.total || 0).toFixed(2)}</td>
          <td>${statusBadge}${trackingHtml}</td>
          <td>${addrHtml}</td>
          <td>
            <div class="a-actions">${actionsHtml}</div>
            <textarea id="copy-text-${o.id}" style="position:absolute;left:-9999px;opacity:0">${escapeHTML(copyAddrText)}</textarea>
          </td>
        </tr>`;
    }).join('') : `
      <tr><td colspan="8">
        <div class="a-empty"><div class="a-empty-ico">🛍</div><div>Sin pedidos registrados</div></div>
      </td></tr>`;
  }

  renderRows(allOrders);
  updateLoadMoreBtn();

  // Filter handler
  document.getElementById('order-filter').addEventListener('change', runFilter);
  document.getElementById('order-search').addEventListener('input', runFilter);

  function runFilter() {
    const f = document.getElementById('order-filter').value;
    const q = document.getElementById('order-search').value.trim().toLowerCase();

    let filtered = allOrders;

    if (f !== 'ALL') {
      filtered = filtered.filter(o => o.status === f);
    }

    if (q) {
      filtered = filtered.filter(o => {
        const orderNum = (o.orderNum || '').toLowerCase();
        const id = (o.id || '').toLowerCase();
        const email = (o.customer?.email || '').toLowerCase();
        const name = (o.customer?.name || '').toLowerCase();
        const shippingName = (o.shipping?.name || '').toLowerCase();
        return orderNum.includes(q) || id.includes(q) || email.includes(q) || name.includes(q) || shippingName.includes(q);
      });
    }

    renderRows(filtered);
    
    // Update count label
    const labelEl = document.getElementById('order-count-label');
    if (labelEl) {
      labelEl.innerHTML = `${allOrders.length} pedidos cargados (Mostrando ${filtered.length}) — Filtro:
          <select id="order-filter" style="background:var(--card2);border:1px solid var(--line);color:var(--snow);border-radius:4px;padding:.2rem .5rem;font-size:.75rem;margin-left:.4rem">
            <option value="ALL" ${f === 'ALL' ? 'selected' : ''}>TODOS</option>
            <option value="Confirmed" ${f === 'Confirmed' ? 'selected' : ''}>CONFIRMADOS</option>
            <option value="Pending" ${f === 'Pending' ? 'selected' : ''}>PENDIENTES</option>
            <option value="Shipped" ${f === 'Shipped' ? 'selected' : ''}>ENVIADOS</option>
            <option value="Completed" ${f === 'Completed' ? 'selected' : ''}>COMPLETADOS</option>
          </select>
          <input type="text" id="order-search" value="${q}" placeholder="Buscar por email o # de orden..." style="background:var(--card2);border:1px solid var(--line);color:var(--snow);border-radius:4px;padding:.2rem .5rem;font-size:.75rem;margin-left:.6rem;width:220px" />`;
      document.getElementById('order-filter').addEventListener('change', runFilter);
      document.getElementById('order-search').addEventListener('input', runFilter);
    }
  }

  function updateLoadMoreBtn() {
    const wrap = document.getElementById('order-load-more-wrap');
    if (!wrap) return;
    if (ordersLastDoc) {
      wrap.innerHTML = '<button id="btn-load-more-orders" class="a-btn" style="padding:0.6rem 1.2rem;">Cargar más pedidos</button>';
      document.getElementById('btn-load-more-orders').addEventListener('click', async (e) => {
        e.target.disabled = true;
        e.target.textContent = 'Cargando...';
        try {
          const nextRes = await getOrders(ordersLastDoc, 50);
          if (nextRes.list && nextRes.list.length > 0) {
            allOrders = [...allOrders, ...nextRes.list];
            ordersLastDoc = nextRes.lastDoc;
            runFilter();
            updateLoadMoreBtn();
          } else {
            ordersLastDoc = null;
            updateLoadMoreBtn();
          }
        } catch (err) {
          e.target.disabled = false;
          e.target.textContent = 'Error. Reintentar';
          console.error(err);
        }
      });
    } else {
      wrap.innerHTML = '<div style="color:var(--muted); font-size:0.8rem;">No hay más pedidos para cargar.</div>';
    }
  }

  // Event delegation for table body
  document.getElementById('order-tbody').addEventListener('click', async e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const orderId = tr.dataset.orderId;
    const order = allOrders.find(x => x.id === orderId);

    // ── Mark as Shipped (opens drawer for tracking) ──
    if (e.target.classList.contains('mark-shipped')) {
      openDrawer('MARCAR COMO ENVIADO', `
        <div class="a-field">
          <label>NÚMERO DE TRACKING (opcional)</label>
          <input class="a-input" id="ship-tracking" placeholder="Ej. 1Z999AA10123456784" />
        </div>
        <div class="a-field">
          <label>TRANSPORTISTA</label>
          <select class="a-select" id="ship-carrier">
            <option value="USPS">USPS</option>
            <option value="UPS">UPS</option>
            <option value="FedEx">FedEx</option>
            <option value="DHL">DHL</option>
            <option value="Other">Otro</option>
          </select>
        </div>
        <div class="a-field">
          <label>NOTAS PARA EL CLIENTE (opcional)</label>
          <textarea class="a-textarea" id="ship-notes" rows="2" placeholder="Ej. Tu pedido fue enviado hoy..."></textarea>
        </div>
      `, async () => {
        const tracking = document.getElementById('ship-tracking').value.trim();
        const carrier = document.getElementById('ship-carrier').value;
        const notes = document.getElementById('ship-notes').value.trim();
        try {
          await updateOrderStatus(orderId, 'Shipped', { trackingNumber: tracking, trackingCarrier: carrier, shippingNotes: notes, shippedAt: Date.now() });
          order.status = 'Shipped';
          order.trackingNumber = tracking;
          order.trackingCarrier = carrier;
          toast('📦 Pedido marcado como enviado ✓');
          runFilter();
        } catch (err) { toast(err.message, 'err'); }
      });
    }

    // ── Mark as Completed ──
    if (e.target.classList.contains('mark-completed')) {
      try {
        await updateOrderStatus(orderId, 'Completed', { completedAt: Date.now() });
        order.status = 'Completed';
        toast('✔ Pedido completado ✓');
        runFilter();
      } catch (err) { toast(err.message, 'err'); }
    }

    // ── Reopen order ──
    if (e.target.classList.contains('reopen-order')) {
      try {
        await updateOrderStatus(orderId, 'Confirmed');
        order.status = 'Confirmed';
        toast('Pedido reabierto');
        runFilter();
      } catch (err) { toast(err.message, 'err'); }
    }

    // Delete order
    if (e.target.classList.contains('delete-order')) {
      if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
      try {
        await deleteOrder(orderId);
        toast('Pedido eliminado');
        allOrders = allOrders.filter(x => x.id !== orderId);
        runFilter();
      } catch (err) { toast(err.message, 'err'); }
    }

    // Copy shipping address
    if (e.target.classList.contains('a-order-copy-btn')) {
      const txtArea = document.getElementById(`copy-text-${orderId}`);
      if (txtArea) {
        txtArea.select();
        txtArea.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(txtArea.value);
        toast('Dirección copiada al portapapeles');
      }
    }
  });
}

// ════════════════════════════════════════════════
// SECCIÓN: GESTIONAR ADMINS (Superadmin-only)
// ════════════════════════════════════════════════
async function renderAdmins() {
  setContent('<div class="a-loading">Cargando administradores…</div>');
  const users = await getAdminUsers();

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">GESTIONAR ADMINISTRADORES</div>
        <div class="a-page-sub">Gestiona los accesos y roles de los usuarios del panel administrativo</div>
      </div>
    </div>

    <div class="a-cfg-card" style="margin-bottom:2rem">
      <div class="a-cfg-title">AGREGAR ADMINISTRADOR</div>
      <p style="font-size:.78rem;color:var(--muted);margin-bottom:1rem;line-height:1.6">
        Crea una cuenta completa de administrador (se registrará tanto en Firebase Auth como en la base de datos). El usuario podrá iniciar sesión con las credenciales que definas aquí.
      </p>
      <form id="add-admin-form" style="display:flex;gap:1rem;align-items:flex-end;max-width:850px;flex-wrap:wrap">
        <div class="a-field" style="flex:2;margin-bottom:0">
          <label>EMAIL DEL ADMINISTRADOR</label>
          <input class="a-input" id="new-admin-email" type="email" placeholder="cliente@gearheadzmotorsports.com" required />
        </div>
        <div class="a-field" style="flex:2;margin-bottom:0">
          <label>CONTRASEÑA (Min 6 caracteres)</label>
          <input class="a-input" id="new-admin-pass" type="password" placeholder="Contraseña..." required minlength="6" />
        </div>
        <div class="a-field" style="flex:1;margin-bottom:0">
          <label>ROL</label>
          <select class="a-select" id="new-admin-role">
            <option value="admin">Administrador</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <button class="a-btn-primary" type="submit" style="height:38px">+ CREAR CUENTA</button>
      </form>
    </div>

    <div class="a-table-outer">
      <div class="a-table-wrap">
        <table class="a-table" id="admins-table">
          <thead>
            <tr>
              <th>EMAIL</th>
              <th>ROL (SUPERADMIN / ADMIN)</th>
              <th>ESTADO ACCESO (ACTIVO / DESACTIVADO)</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody id="admins-tbody"></tbody>
        </table>
      </div>
    </div>
  `);

  function renderRows(list) {
    document.getElementById('admins-tbody').innerHTML = list.length ? list.map(u => {
      const isSuper = u.role === 'superadmin';
      const isActive = u.active !== false;

      return `
        <tr data-email="${u.email}">
          <td style="font-weight:500;font-size:.875rem">${u.email}</td>
          <td>
            <label class="a-toggle-switch">
              <input type="checkbox" class="a-toggle-input super role-toggle" ${isSuper ? 'checked' : ''} />
              <span class="a-toggle-slider super"></span>
              <span style="font-size:.78rem;color:${isSuper ? 'var(--red)' : 'var(--muted)'}">${isSuper ? 'SUPERADMIN' : 'ADMIN'}</span>
            </label>
          </td>
          <td>
            <label class="a-toggle-switch">
              <input type="checkbox" class="a-toggle-input active-toggle" ${isActive ? 'checked' : ''} />
              <span class="a-toggle-slider"></span>
              <span style="font-size:.78rem;color:${isActive ? 'var(--green)' : 'var(--muted)'}">${isActive ? 'ACTIVO' : 'DESACTIVADO'}</span>
            </label>
          </td>
          <td>
            <button class="a-btn-del delete-admin" style="padding:.25rem .5rem">Eliminar</button>
          </td>
        </tr>`;
    }).join('') : `
      <tr><td colspan="4">
        <div class="a-empty"><div class="a-empty-ico">⚙</div><div>Sin administradores en la base de datos</div></div>
      </td></tr>`;
  }

  let allUsers = users;
  renderRows(allUsers);

  // Add Admin Form
  document.getElementById('add-admin-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = document.getElementById('new-admin-email').value.trim().toLowerCase();
    const pass = document.getElementById('new-admin-pass').value;
    const role  = document.getElementById('new-admin-role').value;

    if (!email || !pass) return;
    if (allUsers.some(u => u.email === email)) {
      toast('Este usuario ya existe en la lista', 'err');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'CREANDO...';

    try {
      if (fbReady) {
        await createAuthUser(email, pass);
      }
      await saveAdminUser(email, role, true);
      toast('Cuenta creada exitosamente ✓');
      allUsers.push({ email, role, active: true });
      renderRows(allUsers);
      document.getElementById('new-admin-email').value = '';
      document.getElementById('new-admin-pass').value = '';
    } catch (err) { 
      toast(err.message, 'err'); 
    } finally {
      btn.disabled = false;
      btn.textContent = '+ CREAR CUENTA';
    }
  });

  // Table actions delegation
  document.getElementById('admins-tbody').addEventListener('click', async e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const email = tr.dataset.email;
    const user = allUsers.find(x => x.email === email);

    // Toggle Role
    if (e.target.classList.contains('role-toggle')) {
      const nextRole = e.target.checked ? 'superadmin' : 'admin';
      try {
        await saveAdminUser(email, nextRole, user.active !== false);
        user.role = nextRole;
        toast(`Rol cambiado a ${nextRole} ✓`);
        renderRows(allUsers);
      } catch (err) {
        e.target.checked = !e.target.checked;
        toast(err.message, 'err');
      }
    }

    // Toggle Active State
    if (e.target.classList.contains('active-toggle')) {
      const nextActive = e.target.checked;
      try {
        await saveAdminUser(email, user.role, nextActive);
        user.active = nextActive;
        toast(nextActive ? 'Acceso activado ✓' : 'Acceso desactivado ✓');
        renderRows(allUsers);
      } catch (err) {
        e.target.checked = !e.target.checked;
        toast(err.message, 'err');
      }
    }

    // Delete Admin User Document
    if (e.target.classList.contains('delete-admin')) {
      if (email === document.getElementById('as-email').textContent.trim().toLowerCase()) {
        toast('No puedes eliminarte a ti mismo', 'err');
        return;
      }
      if (!confirm(`¿Eliminar los privilegios de ${email}?`)) return;
      try {
        await deleteAdminUser(email);
        toast('Administrador eliminado de la base de datos');
        allUsers = allUsers.filter(x => x.email !== email);
        renderRows(allUsers);
      } catch (err) { toast(err.message, 'err'); }
    }
  });
}

// ════════════════════════════════════════════════
// SECCIÓN: POST GENERATOR (Superadmin-only Canvas Tool)
// ════════════════════════════════════════════════
const bgImages = {
  touge: '/images/rx7.png',
  skyline: '/images/skyline.png',
  race: '/images/race_grid.png'
};

const loadedBgs = {};
let bgsPreloaded = false;

function preloadBgs(callback) {
  if (bgsPreloaded) { callback?.(); return; }
  let remaining = Object.keys(bgImages).length;
  if (remaining === 0) { bgsPreloaded = true; callback?.(); return; }

  Object.entries(bgImages).forEach(([k, src]) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'anonymous'; // Avoid canvas pollution
    img.onload = () => {
      loadedBgs[k] = img;
      remaining--;
      if (remaining === 0) { bgsPreloaded = true; callback?.(); }
    };
    img.onerror = () => {
      remaining--;
      if (remaining === 0) { bgsPreloaded = true; callback?.(); }
    };
  });
}

async function renderPostGenerator() {
  setContent('<div class="a-loading">Cargando recursos gráficos…</div>');
  
  preloadBgs(() => {
    initPostGeneratorApp();
  });
}

function initPostGeneratorApp() {
  const state = {
    bgPreset: 'tokyo',
    carImg: null,
    carScale: 1.0,
    carX: 540,
    carY: 650,
    carRot: 0,
    headline: 'LIMITED DROP',
    headX: 540,
    headY: 200,
    headSize: 90,
    headColor: '#FFFFFF',
    subline: 'GEARHEADZ MOTORSPORTS',
    subX: 540,
    subY: 300,
    subSize: 42,
    subColor: '#E8001C',
    sticker: 'limited', // limited, sold-out, speed-lines, none
  };

  setContent(`
    <div class="a-page-hd">
      <div>
        <div class="a-page-title">JDM POST GENERATOR</div>
        <div class="a-page-sub">Diseña y exporta publicaciones de la marca para tus redes sociales (Instagram 1080x1080)</div>
      </div>
    </div>

    <div class="a-post-creator">
      
      <!-- Canvas Column -->
      <div>
        <div class="a-canvas-container">
          <canvas id="post-canvas" width="1080" height="1080"></canvas>
        </div>
        <p style="font-size:.7rem;color:var(--muted);margin-top:.75rem;line-height:1.5;text-align:center">
          💡 <strong>Arrastra el texto o el carro directamente en el lienzo</strong> para acomodarlo a tu gusto.
        </p>
      </div>

      <!-- Controls Column -->
      <div class="a-post-controls">
        
        <!-- Background selector -->
        <div>
          <label style="display:block;font-size:.65rem;letter-spacing:.12em;color:var(--muted);margin-bottom:.4rem">FONDO JDM</label>
          <div class="a-preset-bg-grid">
            <div class="a-preset-bg-card active" data-bg="tokyo">
              <div style="background:#050505;border:1px solid #333;width:100%;aspect-ratio:16/10;border-radius:4px;margin-bottom:.3rem;display:flex;align-items:center;justify-content:center;font-size:.55rem;color:var(--red)">NEÓN GRID</div>
              Neón Tokyo
            </div>
            <div class="a-preset-bg-card" data-bg="touge">
              <img class="a-preset-bg-thumb" src="/images/rx7.png" onerror="this.src='/images/supra.png'" />
              Touge Pass
            </div>
            <div class="a-preset-bg-card" data-bg="skyline">
              <img class="a-preset-bg-thumb" src="/images/skyline.png" onerror="this.src='/images/supra.png'" />
              Midnight R34
            </div>
            <div class="a-preset-bg-card" data-bg="race">
              <img class="a-preset-bg-thumb" src="/images/race_grid.png" onerror="this.src='/images/supra.png'" />
              Track Grid
            </div>
          </div>
        </div>

        <!-- Product Image uploader -->
        <div style="border-top:1px solid var(--line);padding-top:1rem">
          <label style="display:block;font-size:.65rem;letter-spacing:.12em;color:var(--muted);margin-bottom:.4rem">IMAGEN DEL PRODUCTO (PNG CON TRANSPARENCIA)</label>
          <div style="display:flex;gap:1rem;align-items:center">
            <label class="a-img-filebtn" for="post-car-file" style="margin-top:0">📎 Subir PNG</label>
            <input type="file" id="post-car-file" accept="image/*" style="display:none" />
            <span class="a-img-fname" id="post-car-fname">Sin imagen seleccionada</span>
          </div>
        </div>

        <!-- Product Controls -->
        <div id="car-ctrls" style="display:none;border-top:1px solid var(--line);padding-top:1rem">
          <div class="a-control-row">
            <span class="a-slider-label">ESCALA</span>
            <div class="a-slider-wrap">
              <input type="range" class="a-slider" id="post-car-scale" min="0.2" max="2.5" step="0.01" value="1.0" />
              <span class="a-slider-val" id="post-car-scale-val">1.0x</span>
            </div>
          </div>
          <div class="a-control-row" style="margin-top:.75rem">
            <span class="a-slider-label">ROTACIÓN</span>
            <div class="a-slider-wrap">
              <input type="range" class="a-slider" id="post-car-rot" min="-180" max="180" step="1" value="0" />
              <span class="a-slider-val" id="post-car-rot-val">0°</span>
            </div>
          </div>
        </div>

        <!-- Headline Controls -->
        <div style="border-top:1px solid var(--line);padding-top:1rem">
          <div class="a-field" style="margin-bottom:.75rem">
            <label>TÍTULO PRINCIPAL</label>
            <input class="a-input" id="post-head" value="${state.headline}" placeholder="LIMITED DROP" />
          </div>
          <div class="a-grid-2">
            <div class="a-field" style="margin-bottom:0">
              <label>TAMAÑO</label>
              <input class="a-input" id="post-head-size" type="number" value="${state.headSize}" />
            </div>
            <div class="a-field" style="margin-bottom:0">
              <label>COLOR</label>
              <input class="a-input" id="post-head-color" type="color" value="${state.headColor}" style="padding:.2rem .4rem;height:38px;cursor:pointer" />
            </div>
          </div>
        </div>

        <!-- Subline Controls -->
        <div style="border-top:1px solid var(--line);padding-top:1rem">
          <div class="a-field" style="margin-bottom:.75rem">
            <label>SUBTÍTULO</label>
            <input class="a-input" id="post-sub" value="${state.subline}" placeholder="GEARHEADZ MOTORSPORTS" />
          </div>
          <div class="a-grid-2">
            <div class="a-field" style="margin-bottom:0">
              <label>TAMAÑO</label>
              <input class="a-input" id="post-sub-size" type="number" value="${state.subSize}" />
            </div>
            <div class="a-field" style="margin-bottom:0">
              <label>COLOR</label>
              <input class="a-input" id="post-sub-color" type="color" value="${state.subColor}" style="padding:.2rem .4rem;height:38px;cursor:pointer" />
            </div>
          </div>
        </div>

        <!-- Stickers -->
        <div style="border-top:1px solid var(--line);padding-top:1rem">
          <label style="display:block;font-size:.65rem;letter-spacing:.12em;color:var(--muted);margin-bottom:.4rem">PEGATINAS / DETALLES JDM</label>
          <div class="a-sticker-grid">
            <button class="a-sticker-btn active" data-sticker="limited">LIMITED DROP</button>
            <button class="a-sticker-btn" data-sticker="sold-out">SOLD OUT</button>
            <button class="a-sticker-btn" data-sticker="speed-lines">SPEED LINES</button>
            <button class="a-sticker-btn" data-sticker="none">NINGUNO</button>
          </div>
        </div>

        <!-- Action -->
        <button class="a-btn-primary" id="btn-export-post" style="width:100%;justify-content:center;margin-top:.5rem">
          📥 EXPORTAR PUBLICACIÓN (PNG)
        </button>

      </div>

    </div>
  `);

  const canvas = document.getElementById('post-canvas');
  const ctx = canvas.getContext('2d');

  function drawCanvas() {
    ctx.clearRect(0, 0, 1080, 1080);

    // 1. Draw Background
    if (state.bgPreset === 'tokyo') {
      drawNeonGrid(ctx);
    } else {
      const img = loadedBgs[state.bgPreset];
      if (img) {
        const scale = Math.max(1080 / img.width, 1080 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (1080 - w) / 2;
        const y = (1080 - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      } else {
        ctx.fillStyle = '#0F0F0F';
        ctx.fillRect(0, 0, 1080, 1080);
      }

      if (state.bgPreset === 'touge') {
        ctx.fillStyle = 'rgba(12, 12, 12, 0.7)';
        ctx.fillRect(0, 0, 1080, 1080);
        drawFogLines(ctx);
      } else if (state.bgPreset === 'skyline') {
        const skylineGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
        skylineGrad.addColorStop(0, 'rgba(12, 12, 12, 0.85)');
        skylineGrad.addColorStop(1, 'rgba(232, 0, 28, 0.35)');
        ctx.fillStyle = skylineGrad;
        ctx.fillRect(0, 0, 1080, 1080);
      } else if (state.bgPreset === 'race') {
        const raceGrad = ctx.createLinearGradient(540, 0, 540, 1080);
        raceGrad.addColorStop(0, 'rgba(12, 12, 12, 0.85)');
        raceGrad.addColorStop(0.6, 'rgba(232, 0, 28, 0.25)');
        raceGrad.addColorStop(1, 'rgba(12, 12, 12, 0.9)');
        ctx.fillStyle = raceGrad;
        ctx.fillRect(0, 0, 1080, 1080);
        drawWarningLines(ctx);
      }
    }

    // 2. Draw JDM Speed lines
    if (state.sticker === 'speed-lines') {
      drawSpeedLines(ctx);
    }

    // 3. Draw Uploaded Product Image
    if (state.carImg) {
      ctx.save();
      ctx.translate(state.carX, state.carY);
      ctx.rotate((state.carRot * Math.PI) / 180);
      
      const dw = state.carImg.width * state.carScale;
      const dh = state.carImg.height * state.carScale;
      ctx.drawImage(state.carImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }

    // 4. Draw Headline (Bebas Neue)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = state.headColor;
    ctx.font = `italic ${state.headSize}px 'Bebas Neue', sans-serif`;
    ctx.letterSpacing = '0.04em';
    ctx.fillText(state.headline.toUpperCase(), state.headX, state.headY);

    // 5. Draw Subline (Permanent Marker)
    ctx.fillStyle = state.subColor;
    ctx.font = `${state.subSize}px 'Permanent Marker', cursive`;
    ctx.fillText(state.subline, state.subX, state.subY);

    // 6. Draw Stickers
    if (state.sticker === 'sold-out') {
      drawSoldOutStamp(ctx, 840, 280);
    } else if (state.sticker === 'limited') {
      drawLimitedDropStripe(ctx, 540, 960);
    }
  }

  // Draw Helper: Neon Retro Grid background
  function drawNeonGrid(ctx) {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1080, 1080);
    
    // Draw Sun
    const sunY = 480;
    const sunR = 250;
    const sunGrad = ctx.createLinearGradient(540, sunY - sunR, 540, sunY + sunR);
    sunGrad.addColorStop(0, '#E8001C');
    sunGrad.addColorStop(0.5, '#FF4D5E');
    sunGrad.addColorStop(1, '#FFCC00');
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, sunY, sunR, 0, Math.PI, true);
    ctx.clip();
    
    ctx.fillStyle = sunGrad;
    ctx.fillRect(540 - sunR, sunY - sunR, sunR * 2, sunR * 2);
    
    // Sun lines
    ctx.fillStyle = '#050505';
    for (let y = sunY - sunR; y < sunY; y += 18) {
      const h = 2 + ((y - (sunY - sunR)) / sunR) * 12;
      ctx.fillRect(540 - sunR, y, sunR * 2, h);
    }
    ctx.restore();
    
    // Horizon glow
    const glowGrad = ctx.createLinearGradient(540, sunY - 40, 540, sunY + 80);
    glowGrad.addColorStop(0, 'rgba(232, 0, 28, 0.45)');
    glowGrad.addColorStop(1, 'rgba(5, 5, 5, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, sunY - 40, 1080, 150);

    // Grid floor lines
    ctx.strokeStyle = '#E8001C';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#E8001C';
    
    ctx.beginPath();
    ctx.moveTo(0, sunY);
    ctx.lineTo(1080, sunY);
    ctx.stroke();
    
    const rays = 16;
    for (let i = 0; i <= rays; i++) {
      const xStart = (1080 / rays) * i;
      ctx.beginPath();
      ctx.moveTo(540 + (xStart - 540) * 0.08, sunY);
      ctx.lineTo(xStart, 1080);
      ctx.stroke();
    }
    
    for (let y = sunY; y <= 1080; y += (y - sunY) * 0.16 + 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1080, y);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
  }

  // Draw Helper: Fog details for Touge Mountain
  function drawFogLines(ctx) {
    ctx.save();
    const fogGrad = ctx.createRadialGradient(540, 750, 100, 540, 750, 450);
    fogGrad.addColorStop(0, 'rgba(120, 120, 120, 0.2)');
    fogGrad.addColorStop(0.5, 'rgba(40, 40, 40, 0.1)');
    fogGrad.addColorStop(1, 'rgba(12, 12, 12, 0)');
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.arc(540, 750, 450, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Helper: Yellow/Black Warning stripe for track grid
  function drawWarningLines(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(232, 0, 28, 0.08)';
    ctx.fillRect(0, 880, 1080, 200);

    ctx.strokeStyle = '#FFCC00';
    ctx.lineWidth = 15;
    ctx.globalAlpha = 0.65;
    for (let i = -100; i < 1180; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 1080);
      ctx.lineTo(i + 40, 950);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Helper: Speed Lines
  function drawSpeedLines(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    const numLines = 60;
    const cx = 540;
    const cy = 540;

    for (let i = 0; i < numLines; i++) {
      const angle = (Math.PI * 2 / numLines) * i + Math.random() * 0.05;
      const r1 = 350 + Math.random() * 100;
      const r2 = 600 + Math.random() * 200;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Helper: SOLD OUT grunge stamp
  function drawSoldOutStamp(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-15 * Math.PI) / 180);

    ctx.strokeStyle = '#E8001C';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#E8001C';
    ctx.font = "bold 32px 'Bebas Neue', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SOLD OUT', 0, 0);

    ctx.strokeStyle = '#050505';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 6; i++) {
      const y = -80 + Math.random() * 160;
      ctx.beginPath();
      ctx.moveTo(-80, y);
      ctx.lineTo(80, y + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Helper: LIMITED DROP alert stripe
  function drawLimitedDropStripe(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    const w = 550;
    const h = 60;

    const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    grad.addColorStop(0, '#E8001C');
    grad.addColorStop(1, '#ff0055');
    ctx.fillStyle = grad;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.25;
    for (let x = -w/2 + 20; x < -w/2 + 100; x += 15) {
      ctx.beginPath(); ctx.moveTo(x, -h/2); ctx.lineTo(x + 10, h/2); ctx.stroke();
    }
    for (let x = w/2 - 100; x < w/2 - 20; x += 15) {
      ctx.beginPath(); ctx.moveTo(x, -h/2); ctx.lineTo(x + 10, h/2); ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#FFF';
    ctx.font = "italic 32px 'Bebas Neue', sans-serif";
    ctx.letterSpacing = '0.06em';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ LIMITED DROP — NO RESTOCKS ⚡', 0, 1);

    ctx.restore();
  }

  let activeDrag = null;
  let startX = 0;
  let startY = 0;

  const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1080,
      y: ((e.clientY - rect.top) / rect.height) * 1080
    };
  };

  canvas.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    const dHead = Math.hypot(pos.x - state.headX, pos.y - state.headY);
    const dSub  = Math.hypot(pos.x - state.subX, pos.y - state.subY);
    const dCar  = Math.hypot(pos.x - state.carX, pos.y - state.carY);

    if (dHead < 80) {
      activeDrag = 'headline';
    } else if (dSub < 50) {
      activeDrag = 'subline';
    } else if (state.carImg && dCar < (state.carImg.width * state.carScale) / 2) {
      activeDrag = 'car';
    } else {
      activeDrag = null;
    }
    startX = pos.x;
    startY = pos.y;
  });

  canvas.addEventListener('mousemove', e => {
    if (!activeDrag) return;
    const pos = getMousePos(e);
    const dx = pos.x - startX;
    const dy = pos.y - startY;

    if (activeDrag === 'headline') {
      state.headX += dx;
      state.headY += dy;
    } else if (activeDrag === 'subline') {
      state.subX += dx;
      state.subY += dy;
    } else if (activeDrag === 'car') {
      state.carX += dx;
      state.carY += dy;
    }

    startX = pos.x;
    startY = pos.y;
    drawCanvas();
  });

  const endDrag = () => { activeDrag = null; };
  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('mouseleave', endDrag);

  // Background presets selection
  document.querySelectorAll('.a-preset-bg-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.a-preset-bg-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.bgPreset = card.dataset.bg;
      drawCanvas();
    });
  });

  // Uploader handler
  document.getElementById('post-car-file')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('post-car-fname').textContent = file.name;
    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        state.carImg = img;
        state.carScale = Math.min(650 / img.width, 650 / img.height);
        state.carX = 540;
        state.carY = 650;
        state.carRot = 0;
        
        document.getElementById('car-ctrls').style.display = 'block';
        document.getElementById('post-car-scale').value = state.carScale;
        document.getElementById('post-car-scale-val').textContent = state.carScale.toFixed(2) + 'x';
        document.getElementById('post-car-rot').value = 0;
        document.getElementById('post-car-rot-val').textContent = '0°';
        
        drawCanvas();
        toast('Imagen de producto cargada ✓');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Controls inputs
  document.getElementById('post-car-scale').addEventListener('input', e => {
    state.carScale = Number(e.target.value);
    document.getElementById('post-car-scale-val').textContent = state.carScale.toFixed(2) + 'x';
    drawCanvas();
  });

  document.getElementById('post-car-rot').addEventListener('input', e => {
    state.carRot = Number(e.target.value);
    document.getElementById('post-car-rot-val').textContent = state.carRot + '°';
    drawCanvas();
  });

  document.getElementById('post-head').addEventListener('input', e => {
    state.headline = e.target.value;
    drawCanvas();
  });
  document.getElementById('post-head-size').addEventListener('input', e => {
    state.headSize = Number(e.target.value);
    drawCanvas();
  });
  document.getElementById('post-head-color').addEventListener('input', e => {
    state.headColor = e.target.value;
    drawCanvas();
  });

  document.getElementById('post-sub').addEventListener('input', e => {
    state.subline = e.target.value;
    drawCanvas();
  });
  document.getElementById('post-sub-size').addEventListener('input', e => {
    state.subSize = Number(e.target.value);
    drawCanvas();
  });
  document.getElementById('post-sub-color').addEventListener('input', e => {
    state.subColor = e.target.value;
    drawCanvas();
  });

  document.querySelectorAll('.a-sticker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.a-sticker-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.sticker = btn.dataset.sticker;
      drawCanvas();
    });
  });

  document.getElementById('btn-export-post').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'gearheadz_promo_post.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('Publicación exportada y descargada ✓');
  });

  drawCanvas();
}

