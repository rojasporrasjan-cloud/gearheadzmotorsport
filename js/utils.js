// ── SHARED UTILITIES ──────────────────────────────

export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Cloudinary optimization helper
export function cldOptimize(url, { w, h, c = 'limit' } = {}) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
  
  const transforms = ['f_auto', 'q_auto'];
  if (w) transforms.push(`w_${w}`);
  if (h) transforms.push(`h_${h}`);
  if (w || h) transforms.push(`c_${c}`);

  const insertStr = transforms.join(',');
  return url.replace(/\/upload\/(v\d+\/)?/, `/upload/${insertStr}/$1`);
}

// Cursor
export function initCursor() {
  const c = document.getElementById('cursor');
  if (!c) return;

  document.addEventListener('mousemove', e => {
    c.style.left = e.clientX + 'px';
    c.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .p-card, .ev-card, .ev-full-card, .gallery-item, input')
    .forEach(el => {
      el.addEventListener('mouseenter', () => c.classList.add('grow'));
      el.addEventListener('mouseleave', () => c.classList.remove('grow'));
    });

  document.addEventListener('mousedown', () => c.classList.add('click'));
  document.addEventListener('mouseup',   () => c.classList.remove('click'));
}

// Nav scroll border + active link + mobile hamburger
export function initNav() {
  const nav   = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-link[data-page]');

  // highlight current page + aria-current for accessibility/SEO
  links.forEach(a => {
    if (window.location.pathname.includes(a.dataset.page)) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
  // Home link is always active on index
  const homeLink = document.querySelector('.nav-link[href="/"]');
  if (homeLink && window.location.pathname === '/') {
    homeLink.setAttribute('aria-current', 'page');
  }

  // scrolled border
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // ── MOBILE HAMBURGER ──────────────────────────
  const navRight = nav?.querySelector('.nav-right');
  if (!navRight) return;

  const btn = document.createElement('button');
  btn.id = 'nav-menu-btn';
  btn.setAttribute('aria-label', 'Toggle menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  navRight.prepend(btn);

  const menu = document.createElement('div');
  menu.id = 'mobile-menu';

  const allNavLinks = document.querySelectorAll('.nav-link');
  menu.innerHTML = Array.from(allNavLinks).map(a =>
    `<a href="${a.getAttribute('href')}" class="mobile-nav-link${a.classList.contains('active') ? ' active' : ''}">${a.textContent.trim()}</a>`
  ).join('');

  document.body.insertAdjacentElement('afterbegin', menu);

  function closeMenu() {
    menu.classList.remove('open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const opening = !menu.classList.contains('open');
    menu.classList.toggle('open', opening);
    btn.classList.toggle('open', opening);
    document.body.style.overflow = opening ? 'hidden' : '';
  });

  menu.querySelectorAll('.mobile-nav-link').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  window.addEventListener('scroll', closeMenu, { passive: true });
}

// Scroll reveal
export function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: .08 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// Smooth anchor scroll
export function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Newsletter
export function initNewsletter() {
  document.getElementById('nl-form')?.addEventListener('submit', e => {
    e.preventDefault();
    import('./cart.js').then(m => m.toast('Welcome to the grid!', '✓'));
    e.target.reset();
  });
}

// ── 3D CARD TILT ──────────────────────────────────
export function initCardTilt() {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.p-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left)  / rect.width;
    const y = (e.clientY - rect.top)   / rect.height;

    const tiltX = (y - 0.5) * -12;  // vertical tilt
    const tiltY = (x - 0.5) *  12;  // horizontal tilt

    // Preserve the existing skew from the NFS style
    const baseSkew = window.innerWidth > 768 ? 'skewX(-4deg)' : '';
    card.style.transform = `${baseSkew} perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;

    // Move glare
    let glare = card.querySelector('.tilt-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'tilt-glare';
      card.appendChild(glare);
    }
    glare.style.setProperty('--glare-x', `${x * 100}%`);
    glare.style.setProperty('--glare-y', `${y * 100}%`);
  });

  document.addEventListener('mouseleave', e => {
    const card = e.target.closest?.('.p-card');
    if (!card) return;
    const baseSkew = window.innerWidth > 768 ? 'skewX(-4deg)' : '';
    card.style.transform = `${baseSkew}`;
  }, true);

  // Reset on mouseout from card
  document.addEventListener('mouseout', e => {
    if (e.target.classList?.contains('p-card')) {
      const baseSkew = window.innerWidth > 768 ? 'skewX(-4deg)' : '';
      e.target.style.transform = `${baseSkew}`;
    }
  });
}

// ── SIZE GUIDE MODAL ──────────────────────────────
export function initSizeGuide() {
  if (document.getElementById('size-guide-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'size-guide-overlay';

  const modal = document.createElement('div');
  modal.id = 'size-guide-modal';
  modal.innerHTML = `
    <div class="sg-header">
      <span class="sg-title">SIZE GUIDE</span>
      <button class="sg-close" id="sg-close">✕</button>
    </div>
    <div class="sg-body">
      <p class="sg-note">All measurements are in inches. For the best fit, measure a shirt you already own and compare to the chart below.</p>
      <table class="sg-table">
        <thead>
          <tr>
            <th>SIZE</th>
            <th>CHEST</th>
            <th>LENGTH</th>
            <th>SLEEVE</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>XS</td><td>34 – 36</td><td>27</td><td>7.5</td></tr>
          <tr><td>S</td><td>36 – 38</td><td>28</td><td>8.0</td></tr>
          <tr><td>M</td><td>38 – 40</td><td>29</td><td>8.5</td></tr>
          <tr><td>L</td><td>40 – 42</td><td>30</td><td>9.0</td></tr>
          <tr><td>XL</td><td>42 – 44</td><td>31</td><td>9.5</td></tr>
          <tr><td>2XL</td><td>44 – 46</td><td>32</td><td>10.0</td></tr>
        </tbody>
      </table>
    </div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  function close() {
    overlay.classList.remove('open');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', close);
  modal.querySelector('#sg-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

export function openSizeGuide() {
  const overlay = document.getElementById('size-guide-overlay');
  const modal   = document.getElementById('size-guide-modal');
  if (overlay && modal) {
    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

// ── FAQ ACCORDION ─────────────────────────────────
export function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all other items
      document.querySelectorAll('.faq-item.open').forEach(el => {
        if (el !== item) el.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
    });
  });
}
