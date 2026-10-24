import { getCrashes } from '@/lib/data';
import CrashesClient from './CrashesClient';

export const metadata = { title: 'Crashes' };

export default async function CrashesPage() {
  return <CrashesClient crashes={await getCrashes()} />;
}
