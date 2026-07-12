// ── PRODUCTS DATA ─────────────────────────────────
import { escapeHTML, cldOptimize } from './utils.js';

export const PRODUCTS = [
  // ── TEES ──────────────────────────────────────────
  {
    id: 'p-180sx', name: '180 SX TEE',
    price: 30, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/180sx-tee.png',
  },
  {
    id: 'p-bluezilla', name: 'BLUEZILLA GODZILLA TEE',
    price: 30, cat: 'APPAREL', badge: 'NEW DROP',
    sizes: ['XS','S','M','L','XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/bluezilla-godzilla-tee.png',
  },
  {
    id: 'p-bluzilla', name: 'BLUZILLA TEE',
    price: 30, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/bluzilla-tee.png',
  },
  {
    id: 'p-gtr', name: 'GTR TEE',
    price: 20, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/gtr-tee.png',
  },
  {
    id: 'p-labubu-miata', name: 'LABUBU MIATA TEE',
    price: 30, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/labubu-miata-tee.png',
  },
  {
    id: 'p-miata', name: 'MIATA TEE',
    price: 30, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/miata-tee.png',
  },
  {
    id: 'p-rotary', name: 'ROTARY TEE',
    price: 30, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/rotary-tee.png',
  },
  {
    id: 'p-sakura', name: 'SAKURA TEE',
    price: 30, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/sakura-tee.png',
  },
  {
    id: 'p-forever-static', name: 'FOREVER STATIC TEE',
    price: 20, cat: 'APPAREL', badge: null,
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/forever-static-tee.png',
  },
  {
    id: 'p-boosted-bowl', name: 'THE BOOSTED BOWL TEE',
    price: 30, cat: 'APPAREL', badge: 'NEW DROP',
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783808059/gearheadz/products/preview_boosted_bowl.png',
  },
  {
    id: 'p-turbo-girl', name: 'TURBO GIRL TEE',
    price: 30, cat: 'APPAREL', badge: 'NEW DROP',
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783807661/gearheadz/products/preview_toxica_shirt_2.png',
  },
  {
    id: 'p-jdm-legends', name: 'JDM LEGENDS TEE',
    price: 30, cat: 'APPAREL', badge: 'NEW DROP',
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783758617/gearheadz/products/jdm-legends-custom-bg.png',
  },

  {
    id: 'p-need-speed', name: 'NEED FOR SPEED TEE',
    price: 25, oldPrice: 35, cat: 'APPAREL', badge: 'SPECIAL OFFER', desc: 'Special Offer: Available until August 21!',
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783491447/gearheadz/products/Need-speed.png',
  },
  {
    id: 'p-honda-civic', name: 'HONDA CIVIC TEE',
    price: 25, oldPrice: 35, cat: 'APPAREL', badge: 'SPECIAL OFFER', desc: 'Special Offer: Available until August 21!',
    sizes: ['S','M','L','XL','2XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1783491448/gearheadz/products/honda-civic.png',
  },
  // ── KIDS ──────────────────────────────────────────
  {
    id: 'p-kids-labubu', name: 'KIDS LABUBU MIATA TEE',
    price: 20, cat: 'KIDS', badge: null,
    sizes: ['XS','S','M','L','XL'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/kids-labubu-miata-tee.png',
  },
  {
    id: 'p-kids-bluezilla', name: 'KIDS BLUEZILLA GODZILLA TEE',
    price: 20, cat: 'KIDS', badge: null,
    sizes: ['XS','S','M','L'],
    img: 'https://res.cloudinary.com/db4ld8cy2/image/upload/v1/gearheadz/products/kids-bluezilla-godzilla-tee.png',
  },
  // ── HEADWEAR ──────────────────────────────────────
  {
    id: 'p-lady-hat', name: 'LADY HAT',
    price: 30, cat: 'HEADWEAR', badge: 'NEW DROP',
    sizes: ['ONE SIZE'],
    img: 'images/products/lady-hat-1-final-bg.png',
    img2: 'images/products/lady-hat-2-final-bg.png',
  },
  {
    id: 'p-turbi-hat', name: 'GEARHEADZ TURBI HAT — BLACK',
    price: 30, cat: 'HEADWEAR', badge: null,
    sizes: ['ONE SIZE'],
    img: 'images/products/turbi-hat-black.png',
  },
  {
    id: 'p-logo-hat', name: 'GEARHEADZ LOGO HAT — BLACK',
    price: 30, cat: 'HEADWEAR', badge: null,
    sizes: ['ONE SIZE'],
    img: 'images/products/logo-hat-v2-1-final-bg.png',
  },
  {
    id: 'p-new-logo-hat', name: 'NEW GEARHEADZ LOGO HAT',
    price: 30, cat: 'HEADWEAR', badge: null,
    sizes: ['ONE SIZE'],
    img: 'images/products/new-logo-hat-cyberpunk-bg.png',
  },
  {
    id: 'p-beanie', name: 'GEAR HEADZ LOGO BEANIE',
    price: 30, cat: 'HEADWEAR', badge: null,
    sizes: ['ONE SIZE'],
    img: 'images/products/logo-beanie.png',
  },
  // ── ACCESSORIES ───────────────────────────────────
  {
    id: 'p-sunbrella', name: 'GEAR HEADZ SUNBRELLA',
    price: 15, cat: 'ACCESSORIES', badge: null,
    sizes: ['ONE SIZE'],
    img: 'images/products/gear-headz-sunbrella.png',
  }
];

// ── BUILD PRODUCT CARD HTML ───────────────────────
// Print-on-demand: products are always available, no stock limits.
export function buildCard(p) {
  const badge = p.badge
    ? `<span class="p-badge ${p.badge === 'LIMITED' ? 'lim' : ''}">${escapeHTML(p.badge)}</span>`
    : '';

  const sizes = p.sizes.map(s =>
    `<button class="osz-btn"
      data-pid="${p.id}" data-size="${escapeHTML(s)}">${escapeHTML(s)}</button>`
  ).join('');

  const imgUrl = cldOptimize(p.img, { w: 500 });
  const hasSecondary = !!p.img2;
  const imgEl = imgUrl
    ? `<img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(p.name)}" class="p-img-primary ${hasSecondary ? 'has-secondary' : ''}" loading="lazy" decoding="async" />`
    : '';
    
  const img2Url = hasSecondary ? cldOptimize(p.img2, { w: 500 }) : null;
  const img2El = img2Url
    ? `<img src="${escapeHTML(img2Url)}" alt="${escapeHTML(p.name)} Alternate" class="p-img-secondary" loading="lazy" decoding="async" />`
    : '';

  return `
    <div class="p-card" data-id="${p.id}" data-cat="${escapeHTML(p.cat)}" style="cursor:pointer">
      <div class="p-card-img">
        <div class="p-card-img-inner">${imgEl}${img2El}</div>
        ${badge}
        <div class="p-card-overlay">
          <div class="osz-row" data-pid="${p.id}" style="display:flex;gap:.35rem;flex-wrap:wrap">${sizes}</div>
          <button class="osz-cart-btn" data-pid="${p.id}">ADD</button>
        </div>
      </div>
      <div class="p-card-body">
        <span class="p-cat">${escapeHTML(p.cat)}</span>
        <div class="p-name">${escapeHTML(p.name)}</div>
        <div class="p-foot">
          <span class="p-price">
            ${p.oldPrice ? `<span style="text-decoration:line-through; opacity:0.6; font-size:0.85em; margin-right:6px;">$${p.oldPrice}.00</span>` : ''}$${p.price}.00
          </span>
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
      <div id="pmodal-suggestions-wrap" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); display: none;">
        <div style="font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.1em; margin-bottom: 1rem;">YOU MIGHT ALSO LIKE</div>
        <div id="pmodal-suggestions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"></div>
      </div>
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

function openProductModal(product, allProds = PRODUCTS) {
  ensureModal();
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
  document.getElementById('pmodal-price').innerHTML = product.oldPrice 
    ? `<span style="text-decoration:line-through; opacity:0.6; font-size:0.85em; margin-right:8px;">$${product.oldPrice}.00</span>$${product.price}.00`
    : `$${product.price}.00`;

  // stock — print-on-demand, always available
  const stockEl = document.getElementById('pmodal-stock');
  stockEl.textContent = '';
  stockEl.className = 'pmodal-stock';

  // sizes — all always enabled
  const sizesEl = document.getElementById('pmodal-sizes');
  sizesEl.innerHTML = product.sizes.map(s =>
    `<button class="pmodal-sz" data-size="${escapeHTML(s)}">${escapeHTML(s)}</button>`
  ).join('');

  sizesEl.querySelectorAll('.pmodal-sz').forEach(btn => {
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

  // suggestions
  const suggestionsEl = document.getElementById('pmodal-suggestions');
  if (suggestionsEl) {
    const related = allProds.filter(p => p.cat === product.cat && p.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    if (related.length > 0) {
      document.getElementById('pmodal-suggestions-wrap').style.display = 'block';
      suggestionsEl.innerHTML = related.map(p => `
        <div class="pmodal-sugg-card" data-id="${p.id}" style="cursor:pointer; display:flex; flex-direction:column; gap:0.5rem; transition: transform 0.2s;">
          <img src="${cldOptimize(p.img, { w: 300 })}" style="width:100%; aspect-ratio:1/1; object-fit:cover; background:#0d0d0d; border:1px solid rgba(255,255,255,0.1);" />
          <div>
            <div style="font-size:0.75rem; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${escapeHTML(p.name)}</div>
            <div style="font-family:'JetBrains Mono', monospace; font-size:0.7rem; color:#aaa;">$${p.price}.00</div>
          </div>
        </div>
      `).join('');
      
      suggestionsEl.querySelectorAll('.pmodal-sugg-card').forEach(card => {
        card.addEventListener('click', () => {
          const p = allProds.find(prod => prod.id === card.dataset.id);
          if (p) openProductModal(p, allProds);
        });
      });
    } else {
      document.getElementById('pmodal-suggestions-wrap').style.display = 'none';
    }
  }

  document.getElementById('pmodal-overlay').classList.add('open');
  document.getElementById('pmodal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── BIND CARD EVENTS ──────────────────────────────
export function bindCards(container, deps, allProds = PRODUCTS) {
  _cartModule = deps;
  const { cart: cartModule } = deps;
  const selected = {}; // pid -> size

  // size selection
  container.querySelectorAll('.osz-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const row = btn.closest('.osz-row');
      const pid = row.dataset.pid;
      row.querySelectorAll('.osz-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selected[pid] = btn.dataset.size;
    });
  });

  // quick add from overlay
  container.querySelectorAll('.osz-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pid  = btn.dataset.pid;
      const size = selected[pid];
      if (!size) {
        cartModule.toast('Select a size first', '⚠');
        return;
      }
      const product = allProds.find(p => p.id === pid);
      if (product) cartModule.cart.add(product, size);
    });
  });

  // click card → open modal
  container.querySelectorAll('.p-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.osz-btn') || e.target.closest('.osz-cart-btn')) return;
      const pid = card.dataset.id;
      const product = allProds.find(p => p.id === pid);
      if (product) openProductModal(product, allProds);
    });
  });
}
