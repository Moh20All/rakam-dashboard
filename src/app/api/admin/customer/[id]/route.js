import { adminJson } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { id } = await params;
  return adminJson(async () => {
    const { data: customer, error } = await supabase.from('customers').select('*, licenses (*)').eq('id', id).maybeSingle();
    if (error) throw new Error('Could not load the customer.');
    if (customer) customer.licenses = (customer.licenses || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return { customer };
  });
}
