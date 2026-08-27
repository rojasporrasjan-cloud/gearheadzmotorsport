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
    
    let html = list.map(buildCard).join('');

    // Nothing matched the filter (e.g. SALE with no active promo) — say so
    // instead of leaving an empty grid that looks broken.
    if (!list.length) {
      html = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #aaa;">
          <div style="font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #fff; letter-spacing: 1px;">
            ${activeFilter === 'SALE' ? 'NO ACTIVE DEALS RIGHT NOW' : 'NOTHING HERE YET'}
          </div>
          <p style="font-family: 'Inter', sans-serif; font-size: 0.95rem; margin: 0.5rem 0 0;">
            ${activeFilter === 'SALE'
              ? 'Follow us on Instagram so you don\'t miss the next drop.'
              : 'Check back soon or browse the rest of the store.'}
          </p>
        </div>`;
    }

    if (activeFilter === 'KIDS') {
      html = `
        <div style="grid-column: 1 / -1; background: rgba(255, 255, 255, 0.03); border: 1px dashed rgba(255, 255, 255, 0.2); padding: 2rem; border-radius: 8px; text-align: center; margin-bottom: 1rem; display: flex; flex-direction: column; align-items: center;">
          <h3 style="font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #fff; margin: 0 0 0.5rem 0; letter-spacing: 1px;">DON'T SEE THE DESIGN YOU WANT?</h3>
          <p style="font-family: 'Inter', sans-serif; font-size: 0.95rem; color: #aaa; margin: 0 0 1rem 0; max-width: 500px;">We can print <strong style="color:white;">ANY</strong> of our adult designs in kids sizes. Just send us a message and we'll make it for you!</p>
          <a href="https://wa.me/19088846483" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #25D366; color: white; padding: 0.7rem 1.5rem; border-radius: 50px; text-decoration: none; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 0.95rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Request Custom Kids Tee
          </a>
        </div>
      ` + html;
    }
    
    grid.innerHTML = html;
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
