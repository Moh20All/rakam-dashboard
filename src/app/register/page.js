import { supabase } from '@/lib/supabase';
import { FREE_SPOTS } from '@/lib/offer';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inscription & précommande',
  description: 'Inscrivez votre atelier de réparation de téléphones sur Warshati. Les premiers inscrits l’ont gratuitement.',
};

export default async function RegisterPage({ searchParams }) {
  const { lang } = await searchParams;
  // How many free places are left (if the table is not there yet, show the full offer)
  const { count, error } = await supabase.from('registrations').select('id', { count: 'exact', head: true });
  const taken = error ? 0 : count || 0;
  return <RegisterForm initialLang={['fr', 'ar', 'en'].includes(lang) ? lang : 'fr'} freeSpots={FREE_SPOTS} spotsLeft={Math.max(0, FREE_SPOTS - taken)} />;
}
