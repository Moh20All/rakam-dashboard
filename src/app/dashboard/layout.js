import Shell from '@/components/Shell';
import { getNavCounts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const counts = await getNavCounts();
  return <Shell counts={counts}>{children}</Shell>;
}
