'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

// Generate a random RAKAM-XXXX-XXXX-XXXX-XXXX key
function generateLicenseKey() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  return `RAKAM-${parts.join('-')}`;
}

export async function createCustomerAndLicense(formData) {
  const name = formData.get('name');
  const phone = formData.get('phone');
  const address = formData.get('address');
  const notes = formData.get('notes');

  if (!name) return { error: 'Customer Name is required' };

  // 1. Create the customer
  const { data: customer, error: customerErr } = await supabase
    .from('customers')
    .insert([{ name, phone, address, notes }])
    .select()
    .single();

  if (customerErr) {
    console.error(customerErr);
    return { error: 'Failed to create customer record.' };
  }

  // 2. Generate and store the license key
  const licenseKey = generateLicenseKey();
  
  const { data: license, error: licenseErr } = await supabase
    .from('licenses')
    .insert([{ key: licenseKey, customer_id: customer.id }])
    .select()
    .single();

  if (licenseErr) {
    console.error(licenseErr);
    // Note: If this drops, the customer is softly orphaned. But this is an MVP.
    return { error: 'Failed to issue license key.' };
  }

  revalidatePath('/dashboard');
  
  // Return the raw key to the UI so we can display the success screen
  return { success: true, key: licenseKey, customerId: customer.id };
}
