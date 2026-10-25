import React, { useState } from 'react';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import {
  User,
  Shield,
  Bell,
  Globe,
  Key,
  LogOut,
  Save,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { profile, updateProfile, logout } = useAuth();
  const { accounts } = useFinance();

  const [fullName, setFullName] = useState(profile?.fullName || 'Raunak');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');
  const [dateFormat, setDateFormat] = useState(profile?.dateFormat || 'DD/MM/YYYY');
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);

  // Notification Preferences State
  const [notifBudget, setNotifBudget] = useState(true);
  const [notifMonthly, setNotifMonthly] = useState(true);
  const [notifGoals, setNotifGoals] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      currency,
      dateFormat,
      avatarUrl
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <DesktopLayout pageTitle="Settings">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Account & App Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">Configure your personal details, preferences, and security.</p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile and application settings successfully updated.</span>
          </div>
        )}

        {/* 1. Profile Information */}
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Personal Profile</h2>
              <p className="text-xs text-zinc-400">Update your user info and display avatar.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="flex items-center gap-6 pb-4">
              <img
                src={avatarUrl}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-2xl object-cover border border-zinc-700 p-1 bg-zinc-900 shadow-md"
              />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || 'user@financemanager.io'}
                  className="w-full bg-[#09090b]/50 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. Preferences */}
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">System Preferences</h2>
              <p className="text-xs text-zinc-400">Currency symbols and regional formatting.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Date Display Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 08/10/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/08/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-08)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Notification Toggles */}
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Notifications & Alerts</h2>
              <p className="text-xs text-zinc-400">Choose which notifications trigger top navbar alerts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80">
              <div>
                <div className="text-xs font-bold text-white">Budget Limit Warnings</div>
                <div className="text-[11px] text-zinc-400">Notify when any category reaches 85% limit</div>
              </div>
              <input
                type="checkbox"
                checked={notifBudget}
                onChange={(e) => setNotifBudget(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80">
              <div>
                <div className="text-xs font-bold text-white">Monthly Financial Summaries</div>
                <div className="text-[11px] text-zinc-400">Receive automated end-of-month cash flow updates</div>
              </div>
              <input
                type="checkbox"
                checked={notifMonthly}
                onChange={(e) => setNotifMonthly(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80">
              <div>
                <div className="text-xs font-bold text-white">Savings Goals Milestones</div>
                <div className="text-[11px] text-zinc-400">Get alerts when goal progress crosses 50% or 100%</div>
              </div>
              <input
                type="checkbox"
                checked={notifGoals}
                onChange={(e) => setNotifGoals(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Security & Password Settings */}
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Security & Password</h2>
              <p className="text-xs text-zinc-400">Manage credentials and security preferences.</p>
            </div>
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  if (newPassword) {
                    alert('Password updated successfully');
                    setNewPassword('');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* 5. Logout Box */}
        <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-300">Sign Out of Finance Manager</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Logout from this desktop browser session.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </DesktopLayout>
  );
};
