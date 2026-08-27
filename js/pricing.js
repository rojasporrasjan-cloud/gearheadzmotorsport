// ── SIZE-BASED PRICING ────────────────────────────
// Plus sizes (2XL and up) cost more to produce, so they carry a flat surcharge.
// Keep this file in sync with api/_pricing.js (server-side copy).

export const PLUS_SIZE_SURCHARGE = 2;

// True for 2XL, 3XL, 4XL… and their XXL / XXXL spellings. Plain XL is NOT a plus size.
export function isPlusSize(size) {
  const s = String(size || '').toUpperCase().replace(/[\s-]/g, '');
  return /^[2-9]X+L$/.test(s) || /^X{2,}L$/.test(s);
}

export function sizeSurcharge(size) {
  return isPlusSize(size) ? PLUS_SIZE_SURCHARGE : 0;
}

// Final unit price for a product in a given size.
export function priceFor(product, size) {
  return Number(product?.price || 0) + sizeSurcharge(size);
}

// True when a product offers at least one plus size (used to show the "+$2" note).
export function hasPlusSizes(product) {
  return Array.isArray(product?.sizes) && product.sizes.some(isPlusSize);
}
