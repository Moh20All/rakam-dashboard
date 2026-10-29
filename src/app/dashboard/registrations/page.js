import { getRegistrations } from '@/lib/data';
import { FREE_SPOTS } from '@/lib/offer';
import RegistrationsClient from './RegistrationsClient';

export const metadata = { title: 'Sign-ups' };

export default async function RegistrationsPage() {
  return <RegistrationsClient registrations={await getRegistrations()} freeSpots={FREE_SPOTS} />;
}
