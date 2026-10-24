import { redirect } from 'next/navigation';

// Old address: monitoring is now split into Feedback and Crashes
export default function MonitoringPage() {
  redirect('/dashboard/feedback');
}
