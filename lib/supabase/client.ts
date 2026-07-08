import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase Environment Variables: Please check .env.local');
    return null as any;
  }

  console.log('Supabase Client initialized successfully');

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
