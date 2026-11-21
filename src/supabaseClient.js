import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://cfywvihxafuqnkqxqvod.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_zgOjuNIBscNr10Hz30HVmw__hQ3X04a';

const envUrl = import.meta.env?.VITE_SUPABASE_URL;
const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl =
  envUrl && envUrl.startsWith('https://') && !envUrl.includes('your-supabase-project-id')
    ? envUrl.trim()
    : DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  envKey && envKey !== 'paste_your_copied_key_here' && !envKey.includes('your-anon-key-here')
    ? envKey.trim()
    : DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
