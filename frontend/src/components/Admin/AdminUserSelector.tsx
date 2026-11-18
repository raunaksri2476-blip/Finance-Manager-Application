import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { UserProfile } from '../../types';
import { getUserIdFromEmail } from '../../context/AuthContext';
import { Search, UserCheck, CheckCircle2, Loader2, ChevronDown, User, Trash2 } from 'lucide-react';

interface AdminUserSelectorProps {
  selectedUserId: string;
  onSelectUser: (user: UserProfile) => void;
  className?: string;
}

export const MOCK_ADMIN_REGISTERED_USERS: UserProfile[] = [
  {
    id: getUserIdFromEmail('raunak@financemanager.io'),
    email: 'raunak@financemanager.io',
    fullName: 'Raunak Srivastav',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    role: 'user'
  },
  {
    id: getUserIdFromEmail('priya.patel@financemanager.io'),
    email: 'priya.patel@financemanager.io',
    fullName: 'Priya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    role: 'user'
  },
  {
    id: getUserIdFromEmail('vikram.m@financemanager.io'),
    email: 'vikram.m@financemanager.io',
    fullName: 'Vikram Malhotra',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    role: 'user'
  },
  {
    id: getUserIdFromEmail('demo@financemanager.io'),
    email: 'demo@financemanager.io',
    fullName: 'Demo Client User',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    role: 'user'
  }
];

export const AdminUserSelector: React.FC<AdminUserSelectorProps> = ({
  selectedUserId,
  onSelectUser,
  className = ''
}) => {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_ADMIN_REGISTERED_USERS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch users from Supabase `profiles` table + Local Registry + Active Sessions
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        let mappedUsers: UserProfile[] = [];
        const { data, error } = await supabase.from('profiles').select('*');
        if (data && data.length > 0 && !error) {
          mappedUsers = data.map((p) => {
            const userEmail =
              p.email ||
              (p.full_name?.includes('@')
                ? p.full_name
                : `${p.full_name?.toLowerCase().replace(/\s+/g, '') || 'user'}@financemanager.io`);
            return {
              id: p.id,
              email: userEmail,
              fullName: p.full_name || userEmail.split('@')[0] || 'Registered User',
              avatarUrl:
                p.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              currency: p.currency || 'INR',
              dateFormat: p.date_format || 'DD/MM/YYYY',
              role: p.role || 'user'
            };
          });
        }

        // Local registered users registry
        const localRaw = localStorage.getItem('fm_all_registered_users');
        const localUsers: UserProfile[] = localRaw ? JSON.parse(localRaw) : [];

        // Currently authenticated session user
        const authUserRaw = localStorage.getItem('fm_auth_user');
        let currentAuthProfile: UserProfile | null = null;
        if (authUserRaw) {
          try {
            const parsed = JSON.parse(authUserRaw);
            if (parsed.profile && parsed.profile.id) {
              currentAuthProfile = parsed.profile;
            }
          } catch (e) {}
        }

        // Check for any user financial keys stored in localStorage (fm_budgets_<uid>, etc.)
        const foundUserIds = new Set<string>();
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('fm_budgets_') || k.startsWith('fm_accounts_') || k.startsWith('fm_goals_'))) {
              const parts = k.split('_');
              const uid = parts[2];
              if (uid && uid.length > 5 && !['guest-user-123'].includes(uid)) {
                foundUserIds.add(uid);
              }
            }
          }
        } catch (e) {}

        // Unified user map keyed by ID and indexed by email to prevent duplicate or phantom entries
        const userMap = new Map<string, UserProfile>();
        const emailMap = new Map<string, string>(); // lowercase email -> user.id

        const addUser = (u: UserProfile) => {
          if (!u || !u.id) return;
          const lowerEmail = (u.email || '').toLowerCase().trim();

          if (lowerEmail && emailMap.has(lowerEmail)) {
            const existingId = emailMap.get(lowerEmail)!;
            const existing = userMap.get(existingId);
            if (existing) {
              userMap.set(existingId, {
                ...existing,
                ...u,
                id: existingId,
                fullName:
                  u.fullName && u.fullName !== 'User' && u.fullName !== 'Registered User'
                    ? u.fullName
                    : existing.fullName
              });
              return;
            }
          }

          userMap.set(u.id, u);
          if (lowerEmail) emailMap.set(lowerEmail, u.id);
        };

        // 1. Seed / default mock users
        MOCK_ADMIN_REGISTERED_USERS.forEach(addUser);

        // 2. Local registered users
        localUsers.forEach(addUser);

        // 3. Supabase profiles
        mappedUsers.forEach(addUser);

        // 4. Current auth profile
        if (currentAuthProfile) addUser(currentAuthProfile);

        // 5. Inferred users from financial storage keys
        foundUserIds.forEach((uid) => {
          if (!userMap.has(uid)) {
            addUser({
              id: uid,
              email: `user-${uid.slice(0, 8)}@financemanager.io`,
              fullName: `User ${uid.slice(0, 8)}`,
              avatarUrl:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              currency: 'INR',
              dateFormat: 'DD/MM/YYYY',
              role: 'user'
            });
          }
        });

        const merged = Array.from(userMap.values());
        setUsers(merged);
      } catch (err) {
        console.warn('Supabase users fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    const handleUpdate = () => fetchUsers();
    window.addEventListener('finance_user_registered', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('finance_user_registered', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const handleDeleteUser = async (usr: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Admin Action: Are you sure you want to delete user profile "${usr.fullName}" (${usr.email})?`)) {
      try {
        const remaining = users.filter((u) => u.id !== usr.id);
        setUsers(remaining);

        // Clean local storage registry
        const raw = localStorage.getItem('fm_all_registered_users');
        if (raw) {
          const existing: UserProfile[] = JSON.parse(raw);
          const updated = existing.filter((u) => u.id !== usr.id);
          localStorage.setItem('fm_all_registered_users', JSON.stringify(updated));
        }

        localStorage.removeItem(`fm_accounts_${usr.id}`);
        localStorage.removeItem(`fm_transactions_${usr.id}`);
        localStorage.removeItem(`fm_budgets_${usr.id}`);
        localStorage.removeItem(`fm_goals_${usr.id}`);

        // Delete from Supabase profiles table
        await supabase.from('profiles').delete().eq('id', usr.id);

        if (selectedUserId === usr.id && remaining.length > 0) {
          onSelectUser(remaining[0]);
        }

        window.dispatchEvent(new Event('finance_user_registered'));
      } catch (err) {
        console.error('Admin delete user profile error:', err);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [searchQuery, users]);

  const selectedUserObj = users.find((u) => u.id === selectedUserId) || users[0] || MOCK_ADMIN_REGISTERED_USERS[0];

  return (
    <div className={`space-y-4 select-none font-sans ${className}`}>
      {/* Top Search Bar & Header */}
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Admin User Context
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight mt-1">
              Select Target Client Account
            </h3>
            <p className="text-xs text-zinc-400">
              Search by name or email to inspect user accounts, transactions, budgets, goals & reports.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="🔍 Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors font-sans"
            />
          </div>
        </div>

        {/* User Search Results List */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {filteredUsers.map((usr) => {
            const isSelected = selectedUserObj.id === usr.id;
            return (
              <div
                key={usr.id}
                onClick={() => onSelectUser(usr)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500 shadow-md shadow-purple-950/40 text-white scale-[1.01]'
                    : 'bg-[#09090b] border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
                      isSelected ? 'bg-purple-600 text-white shadow-md' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {usr.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold truncate">{usr.fullName}</div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">{usr.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteUser(usr, e)}
                    title={`Delete user ${usr.fullName}`}
                    className="p-1 rounded-lg bg-black/40 hover:bg-rose-950/80 text-rose-300 hover:text-white transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
