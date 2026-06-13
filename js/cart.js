// ── SHARED CART MODULE ────────────────────────────

export const cart = {
  items: [],

  add(product, size) {
    const key = `${product.id}__${size}`;
    const ex  = this.items.find(i => i.key === key);
    ex ? ex.qty++ : this.items.push({ key, ...product, size, qty: 1 });
    this.save();
    this.render();
    openCart();
    toast(`${product.name} added to bag`, '🛍');
  },

  remove(key) {
    this.items = this.items.filter(i => i.key !== key);
    this.save(); this.render();
  },

  qty(key, delta) {
    const item = this.items.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    this.save(); this.render();
  },

  total()  { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count()  { return this.items.reduce((s, i) => s + i.qty, 0); },

  save()   { localStorage.setItem('ghz-cart', JSON.stringify(this.items)); },

  load() {
    try {
      const saved = localStorage.getItem('ghz-cart');
      if (saved) this.items = JSON.parse(saved);
    } catch {}
  },

  render() {
    const body  = document.getElementById('cart-body');
    const total = document.getElementById('cart-total');
    const count = document.getElementById('cart-count');
    const countS = document.getElementById('cart-count-s');
    const n = this.count();

    if (count)  count.textContent  = n;
    if (countS) countS.textContent = n;
    if (total)  total.textContent  = `$${this.total().toFixed(2)}`;
    if (!body)  return;

    if (!this.items.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛍</div>
          <div class="cart-empty-text">YOUR BAG IS EMPTY</div>
        </div>`;
      return;
    }

    body.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="ci-thumb">${item.img ? `<img src="${item.img}" alt="${item.name}" />` : ''}</div>
        <div class="ci-info">
          <span class="ci-name">${item.name}</span>
          <span class="ci-meta">SIZE: ${item.size}</span>
          <div class="ci-qty">
            <button class="ci-qty-btn" data-key="${item.key}" data-d="-1">−</button>
            <span class="ci-qty-n">${item.qty}</span>
            <button class="ci-qty-btn" data-key="${item.key}" data-d="1">+</button>
          </div>
          <span class="ci-price">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
        <button class="ci-remove" data-key="${item.key}">✕</button>
      </div>`
    ).join('');

    body.querySelectorAll('.ci-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => this.qty(btn.dataset.key, +btn.dataset.d));
    });
    body.querySelectorAll('.ci-remove').forEach(btn => {
      btn.addEventListener('click', () => this.remove(btn.dataset.key));
    });
  },
};

// ── CART OPEN / CLOSE ─────────────────────────────
export function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

export async function startCheckout() {
  if (!cart.items.length) {
    toast('Your bag is empty', '🛍');
    return;
  }

  const btn = document.querySelector('#cart-sidebar .btn-red');
  const original = btn?.textContent;

  // Loading state
  if (btn) { btn.textContent = 'LOADING...'; btn.disabled = true; }

  try {
    const res = await fetch('/api/checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ items: cart.items }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    // Redirect to Stripe hosted checkout
    window.location.href = data.url;

  } catch (err) {
    console.error('[Checkout]', err);
    toast(err.message || 'Checkout failed. Try again.', '⚠');
    if (btn) { btn.textContent = original; btn.disabled = false; }
  }
}

export function initCart() {
  cart.load();
  cart.render();
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
  document.querySelector('#cart-sidebar .btn-red')?.addEventListener('click', startCheckout);
}

// ── TOAST ─────────────────────────────────────────
export function toast(msg, icon = '✓') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, 2600);
}
