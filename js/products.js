// ── PRODUCTS DATA ─────────────────────────────────
import { escapeHTML, cldOptimize } from './utils.js';

export const PRODUCTS = [
  // ── TEES ──────────────────────────────────────────
  {
    id: 'p-180sx', name: '180 SX TEE',
    price: 30, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/180sx-tee.png',
  },
  {
    id: 'p-911', name: '911 TEE',
    price: 20, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/911-tee.png',
  },
  {
    id: 'p-bluezilla', name: 'BLUEZILLA GODZILLA TEE',
    price: 30, cat: 'APPAREL', badge: 'NEW DROP', stock: 8,
    sizes: ['XS','S','M','L','XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/bluezilla-godzilla-tee.png',
  },
  {
    id: 'p-bluzilla', name: 'BLUZILLA TEE',
    price: 30, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/bluzilla-tee.png',
  },
  {
    id: 'p-gtr', name: 'GTR TEE',
    price: 20, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/gtr-tee.png',
  },
  {
    id: 'p-labubi-miata', name: 'LABUBI MIATA TEE',
    price: 30, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/labubi-miata-tee.png',
  },
  {
    id: 'p-miata', name: 'MIATA TEE',
    price: 30, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/miata-tee.png',
  },
  {
    id: 'p-rotary', name: 'ROTARY TEE',
    price: 30, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/rotary-tee.png',
  },
  {
    id: 'p-sakura', name: 'SAKURA TEE',
    price: 30, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/sakura-tee.png',
  },
  {
    id: 'p-forever-static', name: 'FOREVER STATIC TEE',
    price: 20, cat: 'APPAREL', badge: null, stock: 10,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/forever-static-tee.png',
  },
  // ── KIDS ──────────────────────────────────────────
  {
    id: 'p-kids-labubi', name: 'KIDS LABUBI MIATA TEE',
    price: 20, cat: 'KIDS', badge: null, stock: 5,
    sizes: ['XS','S','M','L','XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/kids-labubi-miata-tee.png',
  },
  {
    id: 'p-kids-bluezilla', name: 'KIDS BLUEZILLA GODZILLA TEE',
    price: 20, cat: 'KIDS', badge: null, stock: 0,
    sizes: ['XS','S','M','L'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/kids-bluezilla-godzilla-tee.png',
  },
  // ── HEADWEAR ──────────────────────────────────────
  {
    id: 'p-turbi-hat', name: 'GEARHEADZ TURBI HAT — BLACK',
    price: 20, cat: 'HEADWEAR', badge: null, stock: 15,
    sizes: ['ONE SIZE'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/turbi-hat-black.png',
  },
  {
    id: 'p-logo-hat', name: 'GEARHEADZ LOGO HAT — WHITE',
    price: 20, cat: 'HEADWEAR', badge: null, stock: 12,
    sizes: ['ONE SIZE'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/logo-hat-white.png',
  },
  {
    id: 'p-beanie', name: 'GEAR HEADZ LOGO BEANIE',
    price: 25, cat: 'HEADWEAR', badge: null, stock: 0,
    sizes: ['ONE SIZE'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/logo-beanie.png',
  },
  // ── ACCESSORIES ───────────────────────────────────
  {
    id: 'p-koozie', name: '"I IDENTIFY AS WATER" KOOZIE',
    price: 8, cat: 'ACCESSORIES', badge: null, stock: 20,
    sizes: ['ONE SIZE'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/i-identify-as-water-koozie.png',
  },
  {
    id: 'p-sunbrella', name: 'GEAR HEADZ SUNBRELLA',
    price: 15, cat: 'ACCESSORIES', badge: null, stock: 8,
    sizes: ['ONE SIZE'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/gear-headz-sunbrella.png',
  },
  {
    id: 'p-soap', name: 'TURBO CLEAN SOAP',
    price: 15, cat: 'ACCESSORIES', badge: null, stock: 0,
    sizes: ['ONE SIZE'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/turbo-clean-soap.png',
  },
  {
    id: 'p-plushie', name: 'TURBI PILLOW PLUSHIE',
    price: 30, cat: 'ACCESSORIES', badge: 'LIMITED', stock: 0,
    sizes: ['ONE SIZE'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/turbi-pillow-plushie.png',
  },
];

// ── BUILD PRODUCT CARD HTML ───────────────────────
export function buildCard(p) {
  const sold = p.stock === 0;

  const badge = p.badge
    ? `<span class="p-badge ${p.badge === 'LIMITED' ? 'lim' : ''}">${escapeHTML(p.badge)}</span>`
    : sold ? `<span class="p-badge sold">SOLD OUT</span>` : '';

  const sizes = p.sizes.map(s =>
    `<button class="osz-btn ${sold ? 'os-sold' : ''}"
      data-pid="${p.id}" data-size="${escapeHTML(s)}"
      ${sold ? 'disabled' : ''}>${escapeHTML(s)}</button>`
  ).join('');

  const stockEl = sold
    ? `<span class="p-stock out">SOLD OUT</span>`
    : p.stock <= 5
      ? `<span class="p-stock low">${p.stock} LEFT</span>`
      : `<span class="p-stock">${p.stock} IN STOCK</span>`;

  const imgUrl = cldOptimize(p.img, { w: 500 });
  const imgEl = imgUrl
    ? `<img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(p.name)}" loading="lazy" decoding="async" />`
    : '';

  return `
    <div class="p-card" data-id="${p.id}" data-cat="${escapeHTML(p.cat)}" style="cursor:pointer">
      <div class="p-card-img">
        <div class="p-card-img-inner">${imgEl}</div>
        ${badge}
        <div class="p-card-overlay">
          <div style="display:flex;gap:.35rem;flex-wrap:wrap">${sizes}</div>
          <button class="osz-cart-btn" data-pid="${p.id}"
            ${sold ? 'disabled style="opacity:.3"' : ''}>ADD</button>
        </div>
      </div>
      <div class="p-card-body">
        <span class="p-cat">${escapeHTML(p.cat)}</span>
        <div class="p-name">${escapeHTML(p.name)}</div>
        <div class="p-foot">
          <span class="p-price">$${p.price}.00</span>
          ${stockEl}
        </div>
      </div>
    </div>`;
}

// ── MODAL ─────────────────────────────────────────
let _cartModule = null;

function ensureModal() {
  if (document.getElementById('pmodal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'pmodal-overlay';
  overlay.addEventListener('click', closeModal);

  const modal = document.createElement('div');
  modal.id = 'pmodal';
  modal.innerHTML = `
    <button class="pmodal-close" id="pmodal-close">✕</button>
    <div class="pmodal-img" id="pmodal-img"></div>
    <div class="pmodal-info">
      <span class="pmodal-cat" id="pmodal-cat"></span>
      <div class="pmodal-name" id="pmodal-name"></div>
      <div class="pmodal-price" id="pmodal-price"></div>
      <div class="pmodal-sz-label">SELECT SIZE</div>
      <button class="pmodal-sg-btn" id="pmodal-sg-btn">📐 SIZE GUIDE</button>
      <div class="pmodal-sizes" id="pmodal-sizes"></div>
      <div class="pmodal-stock" id="pmodal-stock"></div>
      <button class="btn-red pmodal-add" id="pmodal-add">ADD TO BAG</button>
    </div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  document.getElementById('pmodal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function closeModal() {
  document.getElementById('pmodal')?.classList.remove('open');
  document.getElementById('pmodal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function openProductModal(product) {
  ensureModal();
  const sold = product.stock === 0;
  let selectedSize = null;

  // image
  const imgEl = document.getElementById('pmodal-img');
  const modalImgUrl = cldOptimize(product.img, { w: 800 });
  imgEl.innerHTML = modalImgUrl
    ? `<img src="${escapeHTML(modalImgUrl)}" alt="${escapeHTML(product.name)}" />`
    : '';
  if (product.badge) {
    const b = document.createElement('span');
    b.className = `pmodal-badge${product.badge === 'LIMITED' ? ' lim' : ''}`;
    b.textContent = product.badge;
    imgEl.appendChild(b);
  }

  // text
  document.getElementById('pmodal-cat').textContent   = product.cat;
  document.getElementById('pmodal-name').textContent  = product.name;
  document.getElementById('pmodal-price').textContent = `$${product.price}.00`;

  // stock
  const stockEl = document.getElementById('pmodal-stock');
  if (sold) {
    stockEl.textContent = 'SOLD OUT';
    stockEl.className = 'pmodal-stock out';
  } else if (product.stock <= 5) {
    stockEl.textContent = `${product.stock} LEFT`;
    stockEl.className = 'pmodal-stock low';
  } else {
    stockEl.textContent = `${product.stock} IN STOCK`;
    stockEl.className = 'pmodal-stock';
  }

  // sizes
  const sizesEl = document.getElementById('pmodal-sizes');
  sizesEl.innerHTML = product.sizes.map(s =>
    `<button class="pmodal-sz" data-size="${escapeHTML(s)}" ${sold ? 'disabled' : ''}>${escapeHTML(s)}</button>`
  ).join('');

  sizesEl.querySelectorAll('.pmodal-sz:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      sizesEl.querySelectorAll('.pmodal-sz').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    });
  });

  // add button — replace node to clear old listeners
  const oldBtn = document.getElementById('pmodal-add');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.replaceWith(newBtn);
  newBtn.disabled = sold;
  newBtn.style.opacity = sold ? '.3' : '';
  newBtn.addEventListener('click', () => {
    if (!selectedSize) {
      _cartModule?.toast('Select a size first', '⚠');
      return;
    }
    _cartModule?.cart.add(product, selectedSize);
    closeModal();
  });

  // size guide button
  document.getElementById('pmodal-sg-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    import('./utils.js').then(m => m.openSizeGuide());
  });

  document.getElementById('pmodal-overlay').classList.add('open');
  document.getElementById('pmodal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── BIND CARD EVENTS ──────────────────────────────
export function bindCards(container, cartModule) {
  _cartModule = cartModule;
  const selected = {};

  // size selection
  container.querySelectorAll('.osz-btn:not(.os-sold)').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pid = btn.dataset.pid;
      selected[pid] = btn.dataset.size;
      container.querySelectorAll(`.osz-btn[data-pid="${pid}"]`).forEach(b => b.style.borderColor = '');
      btn.style.borderColor = '#fff';
    });
  });

  // quick add from overlay
  container.querySelectorAll('.osz-cart-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pid  = btn.dataset.pid;
      const size = selected[pid];
      if (!size) {
        cartModule.toast('Select a size first', '⚠');
        return;
      }
      const product = PRODUCTS.find(p => p.id === pid);
      if (product) cartModule.cart.add(product, size);
    });
  });

  // click card → open modal
  container.querySelectorAll('.p-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.osz-btn') || e.target.closest('.osz-cart-btn')) return;
      const pid = card.dataset.id;
      const product = PRODUCTS.find(p => p.id === pid);
      if (product) openProductModal(product);
    });
  });
}
