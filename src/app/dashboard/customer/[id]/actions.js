'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateCustomerDetails(customerId, formData) {
  const name = formData.get('name');
  const phone = formData.get('phone');
  const address = formData.get('address');
  const notes = formData.get('notes');

  const { error } = await supabase
    .from('customers')
    .update({ name, phone, address, notes })
    .eq('id', customerId);

  if (error) {
    return { error: 'Failed to update customer details' };
  }

  revalidatePath(`/dashboard/customer/${customerId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function resetMachineBinding(licenseId) {
  const { error } = await supabase
    .from('licenses')
    .update({ machine_id: null })
    .eq('id', licenseId);

  if (error) {
    return { error: 'Failed to reset machine binding.' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
