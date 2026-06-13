// ════════════════════════════════════════════════
// GEARHEADZ MOTORSPORTS · main.js v3.0
// E-commerce focused · Vite + Tailwind + Vanilla JS
// ════════════════════════════════════════════════

// ─── PRODUCTS DATA ───────────────────────────────
const PRODUCTS = [
  {
    id: 'p1', name: 'SUPRA MK5 TECH TEE', price: 48,
    cat: 'APPAREL', badge: 'NEW DROP', stock: 12,
    sizes: ['S','M','L','XL','XXL'],
  },
  {
    id: 'p2', name: 'JDM CIRCUIT CAP', price: 36,
    cat: 'HEADWEAR', badge: 'LIMITED', stock: 5,
    sizes: ['ONE SIZE'],
  },
  {
    id: 'p3', name: 'RACING STRIPE LONGSLEEVE', price: 56,
    cat: 'APPAREL', badge: 'NEW DROP', stock: 8,
    sizes: ['S','M','L','XL'],
  },
  {
    id: 'p4', name: 'GEARHEADZ SNAPBACK', price: 42,
    cat: 'HEADWEAR', badge: null, stock: 15,
    sizes: ['ONE SIZE'],
  },
  {
    id: 'p5', name: 'KEYCHAIN SET VOL.2', price: 28,
    cat: 'ACCESSORIES', badge: null, stock: 20,
    sizes: ['ONE SIZE'],
  },
  {
    id: 'p6', name: 'JDM CULTURE TEE — WHITE', price: 44,
    cat: 'APPAREL', badge: null, stock: 0,
    sizes: ['S','M','L','XL','XXL'],
  },
];

// ─── CART STATE ──────────────────────────────────
const cart = {
  items: [],

  add(product, size) {
    const key = `${product.id}__${size}`;
    const existing = this.items.find(i => i.key === key);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ key, id: product.id, name: product.name, price: product.price, size, qty: 1 });
    }
    this.render();
    openCart();
    showToast(`${product.name} added to bag`, '🛍');
  },

  remove(key) {
    this.items = this.items.filter(i => i.key !== key);
    this.render();
  },

  changeQty(key, delta) {
    const item = this.items.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    this.render();
  },

  total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  render() {
    const container  = document.getElementById('cart-items');
    const totalEl    = document.getElementById('cart-total');
    const countNav   = document.getElementById('cart-count');
    const countSide  = document.getElementById('cart-count-sidebar');
    const n          = this.count();

    countNav.textContent  = n;
    countSide.textContent = n;
    totalEl.textContent   = `$${this.total().toFixed(2)}`;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛍</div>
          <div class="cart-empty-text">YOUR BAG IS EMPTY</div>
        </div>`;
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <div class="ci-thumb">[IMG]</div>
        <div class="ci-info">
          <span class="ci-name">${item.name}</span>
          <span class="ci-meta">SIZE: ${item.size}</span>
          <div class="ci-qty">
            <button class="ci-qty-btn" onclick="cart.changeQty('${item.key}',-1)">−</button>
            <span class="ci-qty-num">${item.qty}</span>
            <button class="ci-qty-btn" onclick="cart.changeQty('${item.key}',1)">+</button>
          </div>
          <span class="ci-price">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
        <button class="ci-remove" onclick="cart.remove('${item.key}')">✕</button>
      </div>`
    ).join('');
  },
};

// expose for inline onclick
window.cart = cart;

// ─── CART OPEN / CLOSE ───────────────────────────
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function initCart() {
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
}

// ─── TOAST ───────────────────────────────────────
function showToast(msg, icon = '✓') {
  const wrap  = document.getElementById('toast-wrap');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2600);
}

// ─── RENDER PRODUCTS ─────────────────────────────
function renderProducts(filter = 'ALL') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const list = filter === 'ALL'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.cat === filter);

  grid.innerHTML = list.map(p => {
    const isSold = p.stock === 0;

    const badgeHTML = p.badge
      ? `<span class="p-badge ${p.badge === 'LIMITED' ? 'limited' : isSold ? 'sold' : ''}">${p.badge}</span>`
      : isSold
        ? `<span class="p-badge sold">SOLD OUT</span>`
        : '';

    const sizesHTML = p.sizes.map(s => {
      const sold = isSold ? 'sold' : '';
      return `<button class="osz-btn ${sold}" data-pid="${p.id}" data-size="${s}" ${isSold ? 'disabled' : ''}>${s}</button>`;
    }).join('');

    const stockLabel = isSold
      ? `<span class="p-stock out">SOLD OUT</span>`
      : p.stock <= 5
        ? `<span class="p-stock low">${p.stock} LEFT</span>`
        : `<span class="p-stock">${p.stock} IN STOCK</span>`;

    return `
      <div class="p-card" data-id="${p.id}" data-cat="${p.cat}">
        <div class="p-card-img">
          <div class="p-card-img-inner"></div>
          <div class="p-card-overlay">
            <div class="overlay-sizes">${sizesHTML}</div>
          </div>
        </div>
        <div class="p-card-body">
          ${badgeHTML}
          <span class="p-cat">${p.cat}</span>
          <div class="p-name">${p.name}</div>
          <div class="p-foot">
            <span class="p-price">$${p.price}.00</span>
            ${stockLabel}
          </div>
        </div>
      </div>`;
  }).join('');

  // Bind size buttons inside overlay
  grid.querySelectorAll('.osz-btn:not(.sold)').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const product = PRODUCTS.find(p => p.id === btn.dataset.pid);
      if (product) cart.add(product, btn.dataset.size);
    });
  });
}

// ─── FILTER PILLS ────────────────────────────────
function initFilters() {
  const pills = document.querySelectorAll('.f-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.textContent.trim().toUpperCase();
      renderProducts(filter === 'ALL' ? 'ALL' : filter.replace('HEADWEAR','HEADWEAR').replace('ACCESSORIES','ACCESSORIES').replace('APPAREL','APPAREL'));
    });
  });
}

// ─── FEATURED DROP ───────────────────────────────
function initFeaturedDrop() {
  // Size selector
  document.querySelectorAll('.sz-btn:not(.sold-out)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Add to cart
  const addBtn = document.querySelector('.btn-add-cart');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const active = document.querySelector('.sz-btn.active');
    if (!active) {
      showToast('Please select a size', '⚠');
      return;
    }
    const product = {
      id:    addBtn.dataset.id,
      name:  addBtn.dataset.name,
      price: parseInt(addBtn.dataset.price),
    };
    cart.add(product, active.textContent.trim());
  });
}

// ─── EVENT TICKETS ───────────────────────────────
function initEventButtons() {
  document.querySelectorAll('.btn-event:not(.full)').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = {
        id:    `evt-${btn.dataset.event?.replace(/\s/g,'-').toLowerCase()}`,
        name:  `TICKET: ${btn.dataset.event}`,
        price: parseInt(btn.dataset.price || 0),
      };
      cart.add(product, 'TICKET');
    });
  });
}

// ─── PRELOADER ───────────────────────────────────
function initPreloader() {
  const wrap    = document.getElementById('preloader');
  const phaseEl = document.getElementById('pre-phase');
  const barEl   = document.getElementById('pre-bar');

  const PHASES = [
    { at: 0,  text: 'ENGINE COLD. INITIALIZING.',    shake: false },
    { at: 26, text: 'POWER-BAND ENGAGED. GEAR 1.',   shake: false },
    { at: 56, text: 'ACCELERATING. GEAR 2.',         shake: true  },
    { at: 86, text: 'MAX PERFORMANCE. RACE COMPLETE.', shake: false },
  ];

  let n = 0;

  const tick = () => {
    if (n > 100) {
      document.body.classList.remove('shake');
      setTimeout(() => {
        wrap.classList.add('exit');
        setTimeout(() => {
          wrap.style.display = 'none';
          revealSite();
        }, 650);
      }, 250);
      return;
    }

    barEl.style.width = n + '%';

    const phase = [...PHASES].reverse().find(p => n >= p.at);
    if (phase) {
      phaseEl.textContent = phase.text;
      if (phase.shake && n >= 56 && n < 85) {
        document.body.classList.add('shake');
      } else if (n >= 85) {
        document.body.classList.remove('shake');
      }
    }

    n++;
    setTimeout(tick, n > 85 ? 8 : n > 55 ? 12 : n > 25 ? 16 : 22);
  };

  setTimeout(tick, 300);
}

// ─── REVEAL SITE ─────────────────────────────────
function revealSite() {
  const hero     = document.getElementById('hero');
  const nav      = document.getElementById('nav');
  const featured = document.getElementById('featured-drop');
  const shop     = document.getElementById('shop');
  const events   = document.getElementById('events');

  [hero, nav, featured, shop, events].forEach((el, i) => {
    if (!el) return;
    setTimeout(() => {
      el.style.transition = 'opacity .8s ease';
      el.classList.remove('opacity-0');
    }, i * 120);
  });
}

// ─── CURSOR ──────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  let cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  const targets = 'a, button, .p-card, .ev-card, .nl-input, .sz-btn';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('click'));
}

// ─── NAV ACTIVE ON SCROLL ────────────────────────
function initNavScroll() {
  const links = document.querySelectorAll('.nav-a[data-sec]');
  const secs  = ['shop', 'events'];

  window.addEventListener('scroll', () => {
    let active = 'shop';
    secs.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) active = id;
    });
    links.forEach(a => a.classList.toggle('active', a.dataset.sec === active));
  }, { passive: true });
}

// ─── SCROLL REVEAL ───────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: .08 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─── SMOOTH NAV LINKS ────────────────────────────
function initNavLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').replace('#', '');
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ─── NEWSLETTER ──────────────────────────────────
function initNewsletter() {
  document.getElementById('nl-form')?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('You\'re on the list. Welcome to the grid.', '✓');
    e.target.reset();
  });
}

// ─── BOOT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initPreloader();
  initCart();
  initCursor();
  initFeaturedDrop();
  initEventButtons();
  initFilters();
  initNavScroll();
  initScrollReveal();
  initNavLinks();
  initNewsletter();
  cart.render();
});
