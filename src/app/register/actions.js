'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { wilaya, commune } from '@/lib/places';
import { FREE_SPOTS } from '@/lib/offer';

// Public form: errors come back as codes, the page shows them in the visitor's language.
const MAX_PER_HOUR = 5;
const TOOLS = ['notebook', 'excel', 'software', 'nothing'];

function clean(v, max = 200) {
  const s = String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
  return s || null;
}

/** Algerian numbers -> 0XXXXXXXXX (mobile 05/06/07 + 8 digits, landline 02-04 + 7 digits) */
function normalizePhone(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.startsWith('00213')) d = d.slice(5);
  else if (d.startsWith('213')) d = d.slice(3);
  if (!d.startsWith('0')) d = `0${d}`;
  return /^0[5-7]\d{8}$/.test(d) || /^0[2-4]\d{7}$/.test(d) ? d : null;
}

async function position(createdAt) {
  const { count } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).lte('created_at', createdAt);
  return count || 1;
}

export async function registerAction(form) {
  if (clean(form.website)) return { ok: true, position: 0 }; // bot filled the hidden field: pretend it worked

  const shop = clean(form.shop_name, 120);
  const owner = clean(form.owner_name, 120);
  const phone = normalizePhone(form.phone);
  const w = wilaya(form.wilaya);
  const c = w && commune(w[0], form.commune);
  const email = clean(form.email, 120);
  if (!shop || !owner) return { error: 'required' };
  if (!phone) return { error: 'phone' };
  if (!w || !c) return { error: 'place' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'email' };

  const h = await headers();
  const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || 'unknown').split(',')[0].trim();

  // Same phone twice: keep the first sign-up and its place in the line
  const { data: existing, error: findErr } = await supabase
    .from('registrations').select('created_at').eq('phone', phone).order('created_at').limit(1).maybeSingle();
  if (findErr) return { error: 'server' };
  if (existing) {
    const pos = await position(existing.created_at);
    return { ok: true, already: true, position: pos, free: pos <= FREE_SPOTS };
  }

  const since = new Date(Date.now() - 3600000).toISOString();
  const { count: recent } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', since);
  if ((recent || 0) >= MAX_PER_HOUR) return { error: 'limit' };

  const pcs = Math.min(10, Math.max(1, Number(form.pcs) || 1));
  const { data: row, error } = await supabase.from('registrations').insert({
    shop_name: shop,
    owner_name: owner,
    phone,
    email,
    wilaya_code: w[0],
    wilaya_name: w[1],
    commune_name: c[0],
    address: clean(form.address, 200),
    pcs,
    current_tool: TOOLS.includes(form.current_tool) ? form.current_tool : null,
    message: clean(form.message, 1000),
    lang: ['fr', 'ar', 'en'].includes(form.lang) ? form.lang : null,
    ip,
  }).select('created_at').single();
  if (error) return { error: 'server' };

  revalidatePath('/dashboard', 'layout');
  const pos = await position(row.created_at);
  return { ok: true, position: pos, free: pos <= FREE_SPOTS };
}
