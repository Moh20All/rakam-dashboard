import { createClient } from '@supabase/supabase-js';

// We use the service role key for the dashboard so it has full admin access
// to bypass RLS and manage customers and licenses securely.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
