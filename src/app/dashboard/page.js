import { supabase } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch all licenses with their associated customer data
  const { data: licenses, error } = await supabase
    .from('licenses')
    .select(`
      *,
      customers (
        name,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching licenses:', error);
    return <div className="p-8 text-red-500">Failed to load licenses.</div>;
  }

  // Calculate statistics
  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.is_active).length,
    activated: licenses.filter(l => l.is_active && l.machine_id).length,
    revoked: licenses.filter(l => !l.is_active).length
  };

  return <DashboardClient licenses={licenses || []} stats={stats} />;
}
