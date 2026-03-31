'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function toggleLicenseStatus(licenseId, currentStatus) {
  console.log(`[Dashboard] Toggling license ${licenseId} from ${currentStatus} to ${!currentStatus}`);
  
  const { data, error } = await supabase
    .from('licenses')
    .update({ is_active: !currentStatus })
    .eq('id', licenseId)
    .select();
    
  if (error) {
    console.error('[Dashboard] Supabase Update Error:', error);
    return { error: error.message };
  }

  console.log('[Dashboard] Update successful:', data);
  
  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/customer`);
  return { success: true };
}
