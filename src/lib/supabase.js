import { createClient } from '@supabase/supabase-js';

// Server-only: the service-role key bypasses RLS. Never import this from a 'use client' file.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
