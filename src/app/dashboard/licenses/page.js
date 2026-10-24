import { getLicenses } from '@/lib/data';
import LicensesClient from './LicensesClient';

export const metadata = { title: 'Licenses' };

export default async function LicensesPage({ searchParams }) {
  const { state, q } = await searchParams;
  const licenses = await getLicenses();
  return <LicensesClient licenses={licenses} initialState={state || 'all'} initialQuery={q || ''} />;
}
