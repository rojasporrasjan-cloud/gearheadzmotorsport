// ── STORE PAGE ────────────────────────────────────
import { cart, initCart, toast }                                    from './cart.js';
import { initCursor, initNav, initReveal, initNewsletter,
         initCardTilt, initSizeGuide, initFaq }                    from './utils.js';
import { buildCard, bindCards, PRODUCTS }                             from './products.js';
import { getProducts }                                              from './data-store.js';
import { initSmoothScroll }                                         from './smooth-scroll.js';

async function initStore() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let activeFilter = 'ALL';
  let activeSort   = 'default';
  let allProducts  = [];

  // ── SORT FUNCTION ──────────────────────────────
  function sortProducts(list, mode) {
    const sorted = [...list];
    switch (mode) {
      case 'price-asc':  return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      case 'name-az':    return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:           
        // Group by category (TEES, KIDS, HEADWEAR, ACCESSORIES)
        const order = { 'APPAREL': 1, 'KIDS': 2, 'HEADWEAR': 3, 'ACCESSORIES': 4 };
        return sorted.sort((a, b) => {
          // 1. Force specific products to the absolute top
          const topPriority = [
            'p-need-speed',
            'p-honda-civic',
            'p-supra-tee',
            'E1X1pZQ669hLeQMGaX4Z', // FOREVER STATIC TEE (WHITE)
            'kEQu3U3pYZCcDLRJoeoy', // REAL CARS TEE (BLACK)
            '3T2iP4DsTGl4wgVCrFNJ'  // REAL CARS TEE (WHITE)
          ];
          const prioA = topPriority.indexOf(a.id);
          const prioB = topPriority.indexOf(b.id);
          
          if (prioA !== -1 && prioB !== -1) return prioA - prioB;
          if (prioA !== -1) return -1;
          if (prioB !== -1) return 1;
          
          // 2. Prioritize "NEW DROP" items
          const isNewA = a.badge === 'NEW DROP' ? 1 : 0;
          const isNewB = b.badge === 'NEW DROP' ? 1 : 0;
          if (isNewA !== isNewB) return isNewB - isNewA;

          // 3. Group by category
          const rankA = order[a.cat] || 99;
          const rankB = order[b.cat] || 99;
          if (rankA !== rankB) return rankA - rankB;
          
          // Use alphabetical order as fallback since DB IDs are random
          return a.name.localeCompare(b.name);
        });
    }
  }

  async function render() {
    if (!allProducts.length) allProducts = await getProducts();
    let list = allProducts;
    if (activeFilter === 'SALE') {
      list = allProducts.filter(p => p.badge === 'SPECIAL OFFER' || p.oldPrice);
    } else if (activeFilter === 'NEW') {
      list = allProducts.filter(p => p.badge === 'NEW DROP');
    } else if (activeFilter !== 'ALL') {
      list = allProducts.filter(p => p.cat === activeFilter);
    }
    list = sortProducts(list, activeSort);
    grid.innerHTML = list.map(buildCard).join('');
    bindCards(grid, { cart, toast }, list);
    initReveal();
  }

  // ── FILTER BUTTONS ─────────────────────────────
  document.querySelectorAll('.f-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.cat;
      render();
    });
  });

  // ── SORT DROPDOWN ──────────────────────────────
  document.getElementById('sort-select')?.addEventListener('change', e => {
    activeSort = e.target.value;
    render();
  });

  await render();
}

document.addEventListener('DOMContentLoaded', async () => {
  initSmoothScroll();
  initCart();
  initCursor();
  initNav();
  initNewsletter();
  initSizeGuide();
  await initStore();
  initReveal();
  initCardTilt();
  initFaq();
});
