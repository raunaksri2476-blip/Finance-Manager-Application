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

const tabIsolatedAuthStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null;
    const sessionVal = window.sessionStorage.getItem(key);
    if (sessionVal !== null) return sessionVal;
    const localVal = window.localStorage.getItem(key);
    if (localVal !== null) {
      window.sessionStorage.setItem(key, localVal);
    }
    return localVal;
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(key, value);
    window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  }
};

let circuitOpenUntil = 0;

const fastFallbackFetch = async (input, init) => {
  if (Date.now() < circuitOpenUntil) {
    throw new Error('Supabase circuit breaker open (offline fallback mode)');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal || controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    circuitOpenUntil = Date.now() + 60000;
    throw err;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    storage: tabIsolatedAuthStorage
  },
  global: {
    fetch: fastFallbackFetch
  }
});
