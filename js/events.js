// ── EVENTS PAGE ───────────────────────────────────
import { cart, initCart }                    from './cart.js';
import { initCursor, initNav, initReveal }   from './utils.js';
import { initSmoothScroll }                  from './smooth-scroll.js';
import { getEvents }                         from './data-store.js';
import { buildEventFullCard }                from './events-data.js';

async function initEventsGrid() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  const events = await getEvents();
  grid.innerHTML = events.map((ev, i) => buildEventFullCard(ev, i)).join('');
  initReveal();

  grid.querySelectorAll('.btn-ticket[data-price]').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.add(
        { id: btn.dataset.eid, name: btn.dataset.event, price: Number(btn.dataset.price),
          cat: 'TICKET', sizes: ['ONE SIZE'], stock: 99, badge: null },
        'ONE SIZE'
      );
    });
  });

  grid.querySelectorAll('.btn-check-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const eid = btn.dataset.eid;
      const target = document.getElementById(`ev-details-${eid}`);
      if (!target) return;

      const isOpen = target.classList.toggle('open');
      btn.classList.toggle('open', isOpen);

      const label = btn.querySelector('span');
      if (label) {
        label.innerHTML = isOpen
          ? `HIDE DETAILS <span class="ev-details-arrow">▼</span>`
          : `CHECK DETAILS <span class="ev-details-arrow">▼</span>`;
      }

      if (isOpen) {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      }
    });
  });

  grid.querySelectorAll('.btn-close-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const eid = btn.dataset.eid;
      const target = document.getElementById(`ev-details-${eid}`);
      if (!target) return;

      target.classList.remove('open');

      const mainBtn = grid.querySelector(`.btn-check-details[data-eid="${eid}"]`);
      if (mainBtn) {
        mainBtn.classList.remove('open');
        const label = mainBtn.querySelector('span');
        if (label) {
          label.innerHTML = `CHECK DETAILS <span class="ev-details-arrow">▼</span>`;
        }
      }

      const card = target.closest('.ev-full-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // Process Instagram embeds
  if (window.instgrm) {
    window.instgrm.Embeds.process();
  } else {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    document.body.appendChild(s);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initSmoothScroll();
  initCart();
  initCursor();
  initNav();
  await initEventsGrid();
  initReveal();
});
