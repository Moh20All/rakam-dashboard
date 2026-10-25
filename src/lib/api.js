// Helpers for the JSON API used by the Warshati Admin mobile app (src/app/api/admin/*).
import { NextResponse } from 'next/server';
import { requireAdmin } from './auth';

/** Runs fn() for a signed-in admin and returns its result as JSON (401 when not signed in). */
export async function adminJson(fn) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  try {
    return NextResponse.json(await fn());
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

/** Plain object -> FormData, for the actions that read a form */
export function toFormData(obj = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj)) if (v != null) fd.set(k, String(v));
  return fd;
}
