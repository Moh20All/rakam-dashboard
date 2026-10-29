// Algerian wilayas and communes (2026), from the algeria-wilayas-communes-2026 dataset.
// dz-places.json: { w: [[code, name, arName]], c: { [code]: [[name, arName]] } }
import data from './dz-places.json';

export const WILAYAS = data.w;
export const COMMUNES = data.c;

export function wilaya(code) {
  return WILAYAS.find((w) => w[0] === Number(code)) || null;
}

/** The commune (by its French name) if it belongs to that wilaya */
export function commune(code, name) {
  return (COMMUNES[String(code)] || []).find((c) => c[0] === name) || null;
}
