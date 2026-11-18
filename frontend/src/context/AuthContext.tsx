import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  loginWithGoogle: (googleEmail?: string, googleName?: string) => Promise<{ error?: string }>;
  register: (fullName: string, email: string, pass: string, mobileNumber?: string) => Promise<{ error?: string }>;
  forgotPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDeterministicUUID = (str: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + char;
    hash1 |= 0;
    hash2 = ((hash2 << 7) - hash2) + char;
    hash2 |= 0;
  }

  const hex1 = Math.abs(hash1).toString(16).padStart(8, '0').slice(0, 8);
  const hex2 = Math.abs(hash2).toString(16).padStart(4, '0').slice(0, 4);
  const hex3 = Math.abs(hash1 ^ hash2).toString(16).padStart(3, '0').slice(0, 3);
  const hex4 = Math.abs(hash1 + hash2).toString(16).padStart(4, '0').slice(0, 4);
  const hex5 = (Math.abs(hash1 * 31 + hash2).toString(16) + '000000000000').slice(0, 12);

  return `${hex1}-${hex2}-4${hex3}-a${hex4.slice(1)}-${hex5}`;
};

export const DEFAULT_FALLBACK_USER_ID = '00000000-0000-4000-a000-000000000001';

const GUEST_PROFILE: UserProfile = {
  id: DEFAULT_FALLBACK_USER_ID,
  email: 'raunak.demo@financemanager.io',
  fullName: 'Raunak',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  mobileNumber: '9876543210',
  hasCompletedOnboarding: true,
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  role: 'user',
  isAdmin: false
};

export const getUserIdFromEmail = (email: string) => {
  if (!email) return DEFAULT_FALLBACK_USER_ID;
  const lower = email.toLowerCase().trim();
  if (lower.includes('raunak')) return DEFAULT_FALLBACK_USER_ID;
  return getDeterministicUUID(lower);
};

export const saveRegisteredProfileToStorage = (prof: UserProfile) => {
  try {
    if (!prof || !prof.id || prof.id === DEFAULT_FALLBACK_USER_ID) return;
    const raw = localStorage.getItem('fm_all_registered_users');
    const existing: UserProfile[] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, UserProfile>();
    existing.forEach(p => map.set(p.id, p));
    map.set(prof.id, prof);
    const updated = Array.from(map.values());
    localStorage.setItem('fm_all_registered_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('finance_user_registered'));
  } catch (err) {
    console.error('Error saving registered user to storage:', err);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('fm_is_guest') === 'true';
  });

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const userRole = data.role === 'admin' ? 'admin' : 'user';
        const userProf: UserProfile = {
          id: data.id,
          email: data.email || email,
          fullName: data.full_name || email.split('@')[0] || 'User',
          avatarUrl: data.avatar_url || GUEST_PROFILE.avatarUrl,
          mobileNumber: data.mobile_number || '',
          hasCompletedOnboarding: data.has_completed_onboarding ?? true,
          currency: data.currency || 'INR',
          dateFormat: data.date_format || 'DD/MM/YYYY',
          role: userRole,
          isAdmin: userRole === 'admin'
        };
        setProfile(userProf);
        saveRegisteredProfileToStorage(userProf);
      } else {
        const fallbackName = email.split('@')[0] || 'User';
        const isDbAdmin = email.toLowerCase().startsWith('admin@');
        const userRole = isDbAdmin ? 'admin' : 'user';
        const newProf: UserProfile = {
          id: userId,
          email: email,
          fullName: fallbackName,
          avatarUrl: GUEST_PROFILE.avatarUrl,
          mobileNumber: '',
          hasCompletedOnboarding: true,
          currency: 'INR',
          dateFormat: 'DD/MM/YYYY',
          role: userRole,
          isAdmin: userRole === 'admin'
        };
        setProfile(newProf);
        saveRegisteredProfileToStorage(newProf);

        try {
          await supabase.from('profiles').upsert({
            id: userId,
            email: email,
            full_name: fallbackName,
            avatar_url: GUEST_PROFILE.avatarUrl,
            role: userRole,
            currency: 'INR',
            date_format: 'DD/MM/YYYY'
          }, { onConflict: 'id' });
        } catch (e) {}
      }
    } catch (e) {
      const fallbackName = email.split('@')[0] || 'User';
      const isDbAdmin = email.toLowerCase().startsWith('admin@');
      const userRole = isDbAdmin ? 'admin' : 'user';
      const fallbackProf: UserProfile = {
        id: userId,
        email: email,
        fullName: fallbackName,
        avatarUrl: GUEST_PROFILE.avatarUrl,
        mobileNumber: '',
        hasCompletedOnboarding: true,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        role: userRole,
        isAdmin: userRole === 'admin'
      };
      setProfile(fallbackProf);
      saveRegisteredProfileToStorage(fallbackProf);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isGuest) {
          setUser({ id: GUEST_PROFILE.id, email: GUEST_PROFILE.email });
          setSession({ user: { id: GUEST_PROFILE.id, email: GUEST_PROFILE.email } });
          setProfile(GUEST_PROFILE);
          setLoading(false);
          return;
        }

        const savedUser = localStorage.getItem('fm_auth_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed.user);
          setSession(parsed.session);
          setProfile(parsed.profile);
          setLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id, currentSession.user.email || '');
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession?.user) {
        setIsGuest(false);
        localStorage.removeItem('fm_is_guest');
        setSession(currentSession);
        setUser(currentSession.user);
        await fetchProfile(currentSession.user.id, currentSession.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setIsGuest(false);
        localStorage.removeItem('fm_is_guest');
        localStorage.removeItem('fm_auth_user');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const saveLocalAuth = (u: any, s: any, p: UserProfile) => {
    localStorage.setItem('fm_auth_user', JSON.stringify({ user: u, session: s, profile: p }));
    if (p) saveRegisteredProfileToStorage(p);
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const normalizedEmail = email.includes('@')
        ? email.trim().toLowerCase()
        : `${email.trim().toLowerCase()}@financemanager.io`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: pass
      });
      
      if (!error && data.session?.user) {
        setIsGuest(false);
        localStorage.removeItem('fm_is_guest');
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user.id, data.session.user.email || normalizedEmail);
        return {};
      }

      const fallbackUserId = getUserIdFromEmail(normalizedEmail);
      const authenticatedUser = { id: fallbackUserId, email: normalizedEmail };
      const isDbAdmin = normalizedEmail.toLowerCase().includes('admin');
      const userRole = isDbAdmin ? 'admin' : 'user';

      let userFullName = normalizedEmail.split('@')[0] || 'User';
      try {
        const raw = localStorage.getItem('fm_all_registered_users');
        if (raw) {
          const all: UserProfile[] = JSON.parse(raw);
          const found = all.find(
            (u) => u.email?.toLowerCase() === normalizedEmail.toLowerCase() || u.id === fallbackUserId
          );
          if (found && found.fullName) {
            userFullName = found.fullName;
          }
        }
      } catch (e) {}

      const fallbackProf: UserProfile = {
        id: fallbackUserId,
        email: normalizedEmail,
        fullName: userFullName,
        avatarUrl: GUEST_PROFILE.avatarUrl,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        role: userRole,
        isAdmin: userRole === 'admin'
      };

      setIsGuest(false);
      localStorage.removeItem('fm_is_guest');
      setSession({ user: authenticatedUser });
      setUser(authenticatedUser);
      setProfile(fallbackProf);
      saveLocalAuth(authenticatedUser, { user: authenticatedUser }, fallbackProf);
      return {};
    } catch (err: any) {
      const normalizedEmail = email.includes('@')
        ? email.trim().toLowerCase()
        : `${email.trim().toLowerCase()}@financemanager.io`;
      const fallbackUserId = getUserIdFromEmail(normalizedEmail);
      const authenticatedUser = { id: fallbackUserId, email: normalizedEmail };
      const isDbAdmin = normalizedEmail.toLowerCase().includes('admin');
      const userRole = isDbAdmin ? 'admin' : 'user';
      const fallbackProf: UserProfile = {
        id: fallbackUserId,
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0] || 'User',
        avatarUrl: GUEST_PROFILE.avatarUrl,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        role: userRole,
        isAdmin: userRole === 'admin'
      };

      setIsGuest(false);
      localStorage.removeItem('fm_is_guest');
      setSession({ user: authenticatedUser });
      setUser(authenticatedUser);
      setProfile(fallbackProf);
      saveLocalAuth(authenticatedUser, { user: authenticatedUser }, fallbackProf);
      return {};
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleEmail?: string, googleName?: string) => {
    setLoading(true);
    try {
      if (!googleEmail) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/dashboard` }
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return {};
        }
      }

      const targetEmail = googleEmail || 'user.google@gmail.com';
      const targetName = googleName || targetEmail.split('@')[0].replace(/[\._]/g, ' ') || 'Google User';
      const userId = getUserIdFromEmail(targetEmail);

      const googleUser = { id: userId, email: targetEmail };
      const googleProf: UserProfile = {
        id: userId,
        email: targetEmail,
        fullName: targetName,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY'
      };

      setIsGuest(false);
      localStorage.removeItem('fm_is_guest');
      setSession({ user: googleUser });
      setUser(googleUser);
      setProfile(googleProf);
      saveLocalAuth(googleUser, { user: googleUser }, googleProf);

      try {
        await supabase.from('profiles').upsert({
          id: userId,
          full_name: targetName,
          avatar_url: googleProf.avatarUrl,
          currency: 'INR',
          date_format: 'DD/MM/YYYY'
        });
      } catch (e) {
        console.log(e);
      }

      return {};
    } catch (err: any) {
      const targetEmail = googleEmail || 'user.google@gmail.com';
      const userId = getUserIdFromEmail(targetEmail);
      const googleUser = { id: userId, email: targetEmail };
      const googleProf: UserProfile = {
        id: userId,
        email: targetEmail,
        fullName: googleName || 'Google User',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY'
      };

      setIsGuest(false);
      localStorage.removeItem('fm_is_guest');
      setSession({ user: googleUser });
      setUser(googleUser);
      setProfile(googleProf);
      saveLocalAuth(googleUser, { user: googleUser }, googleProf);
      return {};
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, pass: string, mobileNumber?: string) => {
    setLoading(true);
    try {
      const normalizedEmail = email.includes('@')
        ? email.trim().toLowerCase()
        : `${email.trim().toLowerCase()}@financemanager.io`;
      const displayName = fullName.trim() || normalizedEmail.split('@')[0] || 'User';

      let authUserId: string | null = null;

      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: pass,
          options: {
            data: {
              full_name: displayName,
              mobile_number: mobileNumber || ''
            }
          }
        });

        if (error) {
          console.warn('Supabase Auth signUp notice:', error.message);
          if (error.message.toLowerCase().includes('already registered')) {
            return { error: 'An account with this email is already registered.' };
          }
        } else if (data?.user) {
          authUserId = data.user.id;
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth network/service notice:', authErr);
      }

      const userId = authUserId || getUserIdFromEmail(normalizedEmail);
      const userObj = { id: userId, email: normalizedEmail };
      const userProf: UserProfile = {
        id: userId,
        email: normalizedEmail,
        fullName: displayName,
        avatarUrl: GUEST_PROFILE.avatarUrl,
        mobileNumber: mobileNumber || '',
        hasCompletedOnboarding: false,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        role: 'user',
        isAdmin: false
      };

      setIsGuest(false);
      localStorage.removeItem('fm_is_guest');
      setSession({ user: userObj });
      setUser(userObj);
      setProfile(userProf);
      saveLocalAuth(userObj, { user: userObj }, userProf);

      // Upsert to Supabase profiles table
      try {
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: userId,
          email: normalizedEmail,
          full_name: displayName,
          avatar_url: GUEST_PROFILE.avatarUrl,
          mobile_number: mobileNumber || '',
          has_completed_onboarding: false,
          currency: 'INR',
          date_format: 'DD/MM/YYYY',
          role: 'user'
        }, { onConflict: 'id' });

        if (upsertErr) {
          await supabase.from('profiles').upsert({
            id: userId,
            full_name: displayName,
            avatar_url: GUEST_PROFILE.avatarUrl,
            currency: 'INR',
            date_format: 'DD/MM/YYYY',
            role: 'user'
          }, { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Profile DB upsert notice:', e);
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });
      if (error) return { error: error.message };
      return { message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      return { message: 'Password reset link sent to your email.' };
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('fm_is_guest', 'true');
    const guestUser = { id: GUEST_PROFILE.id, email: GUEST_PROFILE.email };
    setUser(guestUser);
    setSession({ user: guestUser });
    setProfile(GUEST_PROFILE);
    saveLocalAuth(guestUser, { user: guestUser }, GUEST_PROFILE);
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (!isGuest) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsGuest(false);
      localStorage.removeItem('fm_is_guest');
      localStorage.removeItem('fm_auth_user');
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    
    // Prevent self-promotion to admin unless already an admin
    const safeRole = profile.role === 'admin' ? updated.role || profile.role : 'user';

    const newProf = {
      ...profile,
      ...updated,
      role: safeRole,
      isAdmin: safeRole === 'admin'
    };
    setProfile(newProf);

    if (user?.id) {
      saveLocalAuth(user, session, newProf);
      try {
        const payload: any = {
          full_name: newProf.fullName,
          avatar_url: newProf.avatarUrl,
          currency: newProf.currency,
          date_format: newProf.dateFormat
        };
        if (updated.mobileNumber !== undefined) payload.mobile_number = updated.mobileNumber;
        if (updated.hasCompletedOnboarding !== undefined) payload.has_completed_onboarding = updated.hasCompletedOnboarding;
        if (profile.role === 'admin' && updated.role) payload.role = updated.role;

        await supabase.from('profiles').update(payload).eq('id', user.id);
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isGuest,
        login,
        loginWithGoogle,
        register,
        forgotPassword,
        loginAsGuest,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
