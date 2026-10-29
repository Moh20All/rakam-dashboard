// Server-side reads. Columns added by supabase/dashboard-upgrade.sql (status, last_seen_at, …)
// are read with select('*'), so pages keep working before that SQL has been run.
import { supabase } from './supabase';

export async function getLicenses() {
  const { data, error } = await supabase
    .from('licenses')
    .select('*, customers (id, name, phone, address)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Could not load licenses: ${error.message}`);
  return data || [];
}

export async function getFeedback() {
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(1000);
  if (error) throw new Error(`Could not load feedback: ${error.message}`);
  return data || [];
}

export async function getCrashes() {
  const { data, error } = await supabase.from('crash_reports').select('*').order('created_at', { ascending: false }).limit(1000);
  if (error) throw new Error(`Could not load crash reports: ${error.message}`);
  return data || [];
}

/** Sign-ups from /register. Empty until supabase/registrations.sql has been run. */
export async function getRegistrations() {
  const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false }).limit(2000);
  return error ? [] : data || [];
}

/** Badge numbers for the sidebar: new sign-ups, new feedback, open crashes */
export async function getNavCounts() {
  const [rg, fb, cr] = await Promise.all([
    supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('crash_reports').select('id', { count: 'exact', head: true }).eq('resolved', false),
  ]);
  return { registrations: rg.error ? 0 : rg.count || 0, feedback: fb.error ? 0 : fb.count || 0, crashes: cr.error ? 0 : cr.count || 0 };
}

/** True once supabase/dashboard-upgrade.sql has been run */
export async function hasUpgrade() {
  const { error } = await supabase.from('licenses').select('last_seen_at').limit(1);
  return !error;
}
