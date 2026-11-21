/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://cfywvihxafuqnkqxqvod.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_zgOjuNIBscNr10Hz30HVmw__hQ3X04a';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl =
  envUrl && envUrl.startsWith('https://') && !envUrl.includes('your-supabase-project-id')
    ? envUrl.trim()
    : DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  envKey && envKey !== 'paste_your_copied_key_here' && !envKey.includes('your-anon-key-here')
    ? envKey.trim()
    : DEFAULT_SUPABASE_KEY;

// Use per-tab sessionStorage with initial seed from localStorage so each browser tab
// maintains an isolated login session without logging out other open tabs!
const tabIsolatedAuthStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    const sessionVal = window.sessionStorage.getItem(key);
    if (sessionVal !== null) return sessionVal;
    const localVal = window.localStorage.getItem(key);
    if (localVal !== null) {
      window.sessionStorage.setItem(key, localVal);
    }
    return localVal;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(key, value);
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: tabIsolatedAuthStorage
  }
});
