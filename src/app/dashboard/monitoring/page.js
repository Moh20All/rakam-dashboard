import { supabase } from '@/lib/supabase';
import MonitoringClient from './MonitoringClient';

export const dynamic = 'force-dynamic';

export default async function MonitoringPage() {
  // Fetch feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (feedbackError) {
    console.error('Error fetching feedback:', feedbackError);
  }

  // Fetch crashes
  const { data: crashes, error: crashesError } = await supabase
    .from('crash_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (crashesError) {
    console.error('Error fetching crashes:', crashesError);
  }

  return <MonitoringClient feedback={feedback || []} crashes={crashes || []} />;
}
