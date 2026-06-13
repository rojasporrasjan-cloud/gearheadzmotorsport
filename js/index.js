// ── MAIN PAGE ─────────────────────────────────────
import { cart, initCart, toast }                                        from './cart.js';
import { initCursor, initNav, initReveal, initSmoothLinks, initNewsletter,
         initCardTilt, initSizeGuide }                                       from './utils.js';
import { buildCard, bindCards }                                         from './products.js';
import { initSmoothScroll }                                             from './smooth-scroll.js';
import { getProducts, getEvents }                                       from './data-store.js';
import { buildEventPreviewCard }                                        from './events-data.js';

// ── PRELOADER ─────────────────────────────────────
function initPreloader() {
  const wrap = document.getElementById('preloader');
  const bar  = document.getElementById('pre-bar');
  let n = 0;

  const tick = () => {
    if (n > 100) {
      wrap.classList.add('exit');
      setTimeout(() => { wrap.style.display = 'none'; revealPage(); initHeroText(); }, 640);
      return;
    }
    bar.style.width = n + '%';
    n++;
    setTimeout(tick, n > 85 ? 8 : n > 55 ? 12 : 18);
  };

  setTimeout(tick, 250);
}

// ── REVEAL PAGE ───────────────────────────────────
function revealPage() {
  document.querySelectorAll('.page-section').forEach((el, i) => {
    setTimeout(() => {
      el.style.transition = 'opacity .8s ease';
      el.classList.remove('opacity-0');
    }, i * 100);
  });
}

// ── HERO LETTER ANIMATION ─────────────────────────
function initHeroText() {
  document.querySelectorAll('.hero-animate').forEach((line, lineIdx) => {
    const raw = line.textContent.trim();
    line.textContent = '';
    raw.split('').forEach((ch, i) => {
      const el = document.createElement('span');
      if (ch === ' ') {
        el.className   = 'char-space';
        el.textContent = ' ';
      } else {
        el.className  = 'char';
        el.textContent = ch;
        el.style.animationDelay = `${0.35 + (lineIdx * 0.25) + (i * 0.04)}s`;
      }
      line.appendChild(el);
    });
  });
}

// ── FEATURED PRODUCTS (3 on main page) ────────────
async function initFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const products = await getProducts();
  grid.innerHTML  = products.slice(0, 3).map(buildCard).join('');
  bindCards(grid, { cart, toast });
}

// ── EVENTS PREVIEW (3 on main page) ───────────────
async function initEventsPreview() {
  const wrap = document.getElementById('ev-cards-preview');
  if (!wrap) return;
  const events = await getEvents();
  wrap.innerHTML = events.slice(0, 3).map((ev, i) => buildEventPreviewCard(ev, i)).join('');

  wrap.querySelectorAll('.btn-ticket[data-price]').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.add(
        { id: btn.dataset.eid, name: btn.dataset.event, price: Number(btn.dataset.price),
          cat: 'TICKET', sizes: ['ONE SIZE'], stock: 99, badge: null },
        'ONE SIZE'
      );
    });
  });
}

// ── BOOT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initSmoothScroll();
  initPreloader();
  initCart();
  initCursor();
  initNav();
  initSmoothLinks();
  initNewsletter();
  await Promise.all([initFeatured(), initEventsPreview()]);
  initReveal();
  initCardTilt();
  initSizeGuide();
});
