'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const UPGRADE_HINT = 'Run supabase/dashboard-upgrade.sql in Supabase first.';

function refresh(customerId) {
  revalidatePath('/dashboard', 'layout');
  if (customerId) revalidatePath(`/dashboard/customer/${customerId}`);
}

// Missing column = the upgrade SQL has not been run yet
function dbError(error, fallback) {
  if (/column .* does not exist|Could not find the .* column/i.test(error?.message || '')) return { error: UPGRADE_HINT };
  return { error: fallback };
}

function clean(v, max = 500) {
  const s = String(v ?? '').trim().slice(0, max);
  return s || null;
}

// WARSHATI-XXXX-XXXX-XXXX-XXXX, without look-alike characters (0/O, 1/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateKey() {
  const bytes = crypto.randomBytes(16);
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
  return `WARSHATI-${chars.match(/.{4}/g).join('-')}`;
}

/* ---------- Licenses ---------- */

export async function createCustomerWithLicenses(formData) {
  await requireAdmin();
  const name = clean(formData.get('name'), 120);
  if (!name) return { error: 'The shop or customer name is required.' };
  const count = Math.min(10, Math.max(1, Number(formData.get('count')) || 1));
  const priceRaw = String(formData.get('price') || '').replace(/\s/g, '');
  const price = priceRaw ? Number(priceRaw) : null;
  if (price != null && (!Number.isFinite(price) || price < 0)) return { error: 'The price must be a number.' };
  const note = clean(formData.get('license_note'), 300);

  const { data: customer, error: cErr } = await supabase
    .from('customers')
    .insert({ name, phone: clean(formData.get('phone'), 40), address: clean(formData.get('address'), 200), notes: clean(formData.get('notes'), 2000) })
    .select('id').single();
  if (cErr) return { error: 'Could not save the customer.' };

  const res = await insertLicenses(customer.id, count, price, note);
  if (res.error) {
    await supabase.from('customers').delete().eq('id', customer.id); // no orphan customer
    return res;
  }
  refresh();
  return { ok: true, customerId: customer.id, keys: res.keys };
}

export async function addLicenses(customerId, count = 1, price = null, note = null) {
  await requireAdmin();
  const res = await insertLicenses(customerId, Math.min(10, Math.max(1, Number(count) || 1)), price, note);
  if (res.error) return res;
  refresh(customerId);
  return { ok: true, keys: res.keys, message: res.keys.length > 1 ? `${res.keys.length} keys created` : `Key created: ${res.keys[0]}` };
}

async function insertLicenses(customerId, count, price, note) {
  const extras = {};
  if (price != null) extras.price = price;
  if (note) extras.note = note;
  const rows = Array.from({ length: count }, () => ({ key: generateKey(), customer_id: customerId, ...extras }));
  const { error } = await supabase.from('licenses').insert(rows);
  if (error) return dbError(error, 'Could not create the license key.');
  return { keys: rows.map((r) => r.key) };
}

export async function setLicenseActive(licenseId, active) {
  await requireAdmin();
  const patch = { is_active: !!active };
  let { data, error } = await supabase.from('licenses').update({ ...patch, revoked_at: active ? null : new Date().toISOString() }).eq('id', licenseId).select('customer_id').single();
  if (error && /revoked_at/.test(error.message)) {
    ({ data, error } = await supabase.from('licenses').update(patch).eq('id', licenseId).select('customer_id').single());
  }
  if (error) return { error: 'Could not change the license.' };
  refresh(data.customer_id);
  return { ok: true, message: active ? 'License reactivated' : 'License revoked. The app will lock on its next check.' };
}

export async function resetMachine(licenseId) {
  await requireAdmin();
  const { data, error } = await supabase.from('licenses').update({ machine_id: null }).eq('id', licenseId).select('customer_id').single();
  if (error) return { error: 'Could not reset the PC binding.' };
  refresh(data.customer_id);
  return { ok: true, message: 'PC unlinked. The key can now be activated on a new computer.' };
}

export async function updateLicenseNote(licenseId, note, price) {
  await requireAdmin();
  const p = price === '' || price == null ? null : Number(String(price).replace(/\s/g, ''));
  if (p != null && !Number.isFinite(p)) return { error: 'The price must be a number.' };
  const { data, error } = await supabase.from('licenses').update({ note: clean(note, 300), price: p }).eq('id', licenseId).select('customer_id').single();
  if (error) return dbError(error, 'Could not save.');
  refresh(data.customer_id);
  return { ok: true, message: 'Saved' };
}

export async function deleteLicense(licenseId) {
  await requireAdmin();
  const { data, error } = await supabase.from('licenses').delete().eq('id', licenseId).select('customer_id').single();
  if (error) return { error: 'Could not delete the license.' };
  refresh(data.customer_id);
  return { ok: true, message: 'License deleted' };
}

/* ---------- Customers ---------- */

export async function updateCustomer(customerId, formData) {
  await requireAdmin();
  const name = clean(formData.get('name'), 120);
  if (!name) return { error: 'The name cannot be empty.' };
  const { error } = await supabase.from('customers').update({
    name,
    phone: clean(formData.get('phone'), 40),
    address: clean(formData.get('address'), 200),
    notes: clean(formData.get('notes'), 2000),
  }).eq('id', customerId);
  if (error) return { error: 'Could not save the customer.' };
  refresh(customerId);
  return { ok: true, message: 'Customer saved' };
}

export async function deleteCustomer(customerId) {
  await requireAdmin();
  const { error: lErr } = await supabase.from('licenses').delete().eq('customer_id', customerId);
  if (lErr) return { error: 'Could not delete the customer’s licenses.' };
  const { error } = await supabase.from('customers').delete().eq('id', customerId);
  if (error) return { error: 'Could not delete the customer.' };
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

/* ---------- Feedback & crashes ---------- */

export async function setFeedbackStatus(ids, status) {
  await requireAdmin();
  if (!['new', 'seen', 'done'].includes(status)) return { error: 'Unknown status.' };
  const { error } = await supabase.from('feedback').update({ status }).in('id', [].concat(ids));
  if (error) return dbError(error, 'Could not update the feedback.');
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

export async function setFeedbackNote(id, note) {
  await requireAdmin();
  const { error } = await supabase.from('feedback').update({ admin_note: clean(note, 2000) }).eq('id', id);
  if (error) return dbError(error, 'Could not save the note.');
  revalidatePath('/dashboard/feedback');
  return { ok: true, message: 'Note saved' };
}

export async function deleteFeedback(id) {
  await requireAdmin();
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) return { error: 'Could not delete.' };
  revalidatePath('/dashboard', 'layout');
  return { ok: true, message: 'Feedback deleted' };
}

export async function setCrashesResolved(ids, resolved) {
  await requireAdmin();
  const { error } = await supabase.from('crash_reports').update({ resolved: !!resolved }).in('id', [].concat(ids));
  if (error) return { error: 'Could not update the crash reports.' };
  revalidatePath('/dashboard', 'layout');
  return { ok: true, message: resolved ? 'Marked as fixed' : 'Reopened' };
}

export async function setCrashNote(ids, note) {
  await requireAdmin();
  const { error } = await supabase.from('crash_reports').update({ admin_note: clean(note, 2000) }).in('id', [].concat(ids));
  if (error) return dbError(error, 'Could not save the note.');
  revalidatePath('/dashboard/crashes');
  return { ok: true, message: 'Note saved' };
}

export async function deleteCrashes(ids) {
  await requireAdmin();
  const { error } = await supabase.from('crash_reports').delete().in('id', [].concat(ids));
  if (error) return { error: 'Could not delete.' };
  revalidatePath('/dashboard', 'layout');
  return { ok: true, message: 'Deleted' };
}
