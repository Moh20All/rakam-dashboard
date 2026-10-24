import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CustomerClient from './CustomerClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await supabase.from('customers').select('name').eq('id', id).maybeSingle();
  return { title: data?.name || 'Customer' };
}

export default async function CustomerPage({ params }) {
  const { id } = await params;
  const { data: customer } = await supabase
    .from('customers')
    .select('*, licenses (*)')
    .eq('id', id)
    .maybeSingle();

  if (!customer) {
    return (
      <div className="card p-10 text-center">
        <p className="font-semibold">This customer does not exist anymore.</p>
        <Link href="/dashboard/licenses" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-ink"><ArrowLeft className="size-4" /> Back to licenses</Link>
      </div>
    );
  }

  customer.licenses = (customer.licenses || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return <CustomerClient customer={customer} />;
}
