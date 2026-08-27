// ── SIZE-BASED PRICING (SERVER COPY) ──────────────
// Mirror of js/pricing.js. The server recomputes the surcharge itself so the
// client can never talk us out of it. Keep both files in sync.

export const PLUS_SIZE_SURCHARGE = 2;

// True for 2XL, 3XL, 4XL… and their XXL / XXXL spellings. Plain XL is NOT a plus size.
export function isPlusSize(size) {
  const s = String(size || '').toUpperCase().replace(/[\s-]/g, '');
  return /^[2-9]X+L$/.test(s) || /^X{2,}L$/.test(s);
}

export function sizeSurcharge(size) {
  return isPlusSize(size) ? PLUS_SIZE_SURCHARGE : 0;
}
