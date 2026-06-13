// ── PREMIUM SMOOTH SCROLL ENGINE ──────────────────────
// Momentum-based inertia scroll — luxury automotive feel
// Similar to Lenis / Locomotive Scroll but zero dependencies

export function initSmoothScroll() {
  // Don't run on mobile/touch — native scroll is better there
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const html = document.documentElement;
  const body = document.body;

  // ── State ──────────────────────────────────────────
  let current  = 0;   // rendered scroll position
  let target   = 0;   // where we want to be
  let ease     = 0.085; // 0.05 = ultra slow luxury | 0.12 = snappy premium
  let rafId    = null;
  let isActive = true;

  // ── Setup fixed scroll container ──────────────────
  // IMPORTANT: position:fixed elements inside a transformed parent
  // lose their fixed behaviour (CSS spec). We must keep them on <body>.
  // These IDs are direct children of body that must stay fixed:
  const FIXED_IDS = new Set([
    'cursor', 'toast-wrap', 'cart-overlay', 'cart-sidebar',
    'pmodal', 'pmodal-overlay', 'preloader'
  ]);

  function setupDOM() {
    const wrapper = document.createElement('div');
    wrapper.id = 'scroll-wrapper';

    // Move only non-fixed children into the wrapper
    // Fixed UI elements (cursor, cart, modals) stay directly on <body>
    // so CSS position:fixed keeps working correctly
    const children = Array.from(body.children);
    children.forEach(child => {
      if (!FIXED_IDS.has(child.id)) {
        wrapper.appendChild(child);
      }
    });

    // Insert wrapper before first fixed element still on body
    body.insertBefore(wrapper, body.firstChild);

    // Lock body so native scroll doesn't interfere
    body.style.overflow  = 'hidden';
    body.style.position  = 'fixed';
    body.style.width     = '100%';
    body.style.top       = '0';
    body.style.left      = '0';

    // Set page height so scrollbar appears
    const setHeight = () => {
      html.style.height = wrapper.scrollHeight + 'px';
    };

    setHeight();

    // Resize observer to update height if content changes
    const ro = new ResizeObserver(setHeight);
    ro.observe(wrapper);

    return wrapper;
  }

  // ── Lerp (linear interpolation) ───────────────────
  // The core of the smooth feel — eases current toward target
  const lerp = (a, b, t) => a + (b - a) * t;

  // ── Clamp ─────────────────────────────────────────
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // ── Tick — runs every animation frame ─────────────
  function tick(wrapper) {
    if (!isActive) return;

    // Clamp target to page bounds
    const maxScroll = html.scrollHeight - window.innerHeight;
    target  = clamp(target, 0, maxScroll);

    // Smooth lerp toward target
    current = lerp(current, target, ease);

    // Sub-pixel rounding — prevents blurry text
    const rounded = Math.round(current * 100) / 100;

    // Apply transform (GPU accelerated, no layout reflow)
    wrapper.style.transform = `translateY(${-rounded}px)`;

    // Update native scroll position for anchor links / JS APIs
    // to stay in sync (e.g., window.scrollY)
    window._scrollY = rounded;

    rafId = requestAnimationFrame(() => tick(wrapper));
  }

  // ── Wheel handler ─────────────────────────────────
  function onWheel(e) {
    e.preventDefault();

    // Normalize delta across browsers and trackpads
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 40;   // Firefox line mode
    if (e.deltaMode === 2) delta *= 800;  // Page mode

    // Trackpad sensitivity multiplier
    const multiplier = Math.abs(delta) < 10 ? 3.5 : 1;
    target += delta * multiplier;
  }

  // ── Keyboard scroll support ───────────────────────
  function onKey(e) {
    const amount = window.innerHeight * 0.85;
    if (e.key === 'ArrowDown')  target += 120;
    if (e.key === 'ArrowUp')    target -= 120;
    if (e.key === 'PageDown')   target += amount;
    if (e.key === 'PageUp')     target -= amount;
    if (e.key === 'End')        target  = html.scrollHeight;
    if (e.key === 'Home')       target  = 0;
  }

  // ── Override window.scrollTo for anchor links ─────
  const nativeScrollTo = window.scrollTo.bind(window);
  window.scrollTo = (x, y) => {
    if (typeof y === 'number') target = y;
    else if (typeof x === 'object' && x.top !== undefined) target = x.top;
  };

  // Override scrollIntoView for anchor links
  Element.prototype._nativeScrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(opts) {
    const rect    = this.getBoundingClientRect();
    const scrolled = current;
    target = scrolled + rect.top - 100; // 100px offset from top
  };

  // ── Override window.scrollY getter ────────────────
  try {
    Object.defineProperty(window, 'scrollY', {
      get: () => current,
      configurable: true,
    });
    Object.defineProperty(window, 'pageYOffset', {
      get: () => current,
      configurable: true,
    });
  } catch(e) { /* already defined */ }

  // ── Boot ──────────────────────────────────────────
  const wrapper = setupDOM();

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey,  { passive: true });

  rafId = requestAnimationFrame(() => tick(wrapper));

  // ── Public API ────────────────────────────────────
  return {
    scrollTo(y) { target = y; },
    destroy() {
      isActive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    },
  };
}
