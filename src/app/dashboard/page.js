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

  // Fetch monitoring stats
  const { count: totalFeedback } = await supabase.from('feedback').select('*', { count: 'exact', head: true });
  const { count: openBugs } = await supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('type', 'Bug');
  
  const { count: totalCrashes } = await supabase.from('crash_reports').select('*', { count: 'exact', head: true });
  const { count: unresolvedCrashes } = await supabase.from('crash_reports').select('*', { count: 'exact', head: true }).eq('resolved', false);

  const monitoringStats = {
    totalFeedback: totalFeedback || 0,
    openBugs: openBugs || 0,
    totalCrashes: totalCrashes || 0,
    unresolvedCrashes: unresolvedCrashes || 0
  };

  return <DashboardClient licenses={licenses || []} stats={stats} monitoringStats={monitoringStats} />;
}
