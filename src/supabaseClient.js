import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://cfywvihxafuqnkqxqvod.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'paste_your_copied_key_here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
