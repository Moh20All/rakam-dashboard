import { adminJson } from '@/lib/api';
import { getLicenses, getFeedback, getCrashes, hasUpgrade } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Everything the app's screens need in one call; the app filters and counts on the phone. */
export async function GET() {
  return adminJson(async () => {
    const [licenses, feedback, crashes, upgraded] = await Promise.all([getLicenses(), getFeedback(), getCrashes(), hasUpgrade()]);
    return { licenses, feedback, crashes, upgraded };
  });
}
