'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function markCrashResolved(id, resolved) {
  const { error } = await supabase
    .from('crash_reports')
    .update({ resolved })
    .eq('id', id);

  if (error) {
    console.error('Error updating crash status:', error);
    throw new Error('Failed to update crash report status');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/monitoring');
}
