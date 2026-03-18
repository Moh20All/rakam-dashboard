'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function toggleLicenseStatus(licenseId, currentStatus) {
  const { error } = await supabase
    .from('licenses')
    .update({ is_active: !currentStatus })
    .eq('id', licenseId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/customer`);
  return { success: true };
}
