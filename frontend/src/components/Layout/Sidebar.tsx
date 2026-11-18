import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  Sparkles,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.isAdmin;

  const normalNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Accounts', path: '/accounts', icon: CreditCard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'User Accounts', path: '/admin/accounts', icon: CreditCard },
    { label: 'User Transactions', path: '/admin/transactions', icon: ArrowLeftRight },
    { label: 'User Budgets', path: '/admin/budgets', icon: PieChart },
    { label: 'User Goals', path: '/admin/goals', icon: Target },
    { label: 'User Reports', path: '/admin/reports', icon: Zap },
    { label: 'Admin Portal', path: '/admin', icon: ShieldCheck },
  ];

  const mainNavItems = isAdmin ? adminNavItems : normalNavItems;

  return (
    <aside className="w-64 bg-[#0c0c0e] border-r border-zinc-800/80 flex flex-col h-screen sticky top-0 z-30 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Wallet className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 font-sans">
              FINANCE <span className="text-purple-400">MANAGER</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">
              {isAdmin ? 'Admin Data Console' : 'Take control of your money.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          {isAdmin ? 'Admin Navigation' : 'Menu Overview'}
        </div>
        {mainNavItems.map((item, idx) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={`${item.path}-${idx}`}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600/15 text-purple-400 font-semibold border-l-2 border-purple-500 shadow-sm shadow-purple-950/40'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <IconComponent className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 pb-2 px-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          Preferences
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-purple-600/15 text-purple-400 font-semibold border-l-2 border-purple-500 shadow-sm shadow-purple-950/40'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`
          }
        >
          <Settings className="w-4.5 h-4.5" />
          <span>Settings</span>
        </NavLink>
      </div>

      {/* SaaS Feature Badge */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-zinc-900 border border-purple-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-xs font-semibold text-white">Pro Analytics</div>
            <div className="text-[10px] text-zinc-400">Live Insights Active</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          v2.4
        </span>
      </div>

      {/* Profile & Logout Bottom Container */}
      <div
        className="min-h-[72px] px-4 py-3 border-t border-zinc-800/80 bg-[#0a0a0c] relative flex items-center justify-between select-none"
        ref={profileRef}
      >
        {/* Profile Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#151518] border border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <User className="w-4 h-4 text-purple-400" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? 'Signing out...' : 'Logout'}</span>
            </button>
          </div>
        )}

        {/* Profile Row Layout */}
        <div className="flex items-center justify-between w-full gap-3">
          {/* Avatar & User Details (Clickable to toggle profile menu) */}
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer p-1.5 -ml-1.5 rounded-xl hover:bg-zinc-800/60 transition-colors group"
          >
            <img
              src={
                profile?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt="Avatar"
              className="w-[44px] h-[44px] rounded-full object-cover border border-zinc-700/80 flex-shrink-0 shadow-sm"
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold text-white truncate group-hover:text-purple-300 transition-colors">
                {profile?.fullName || 'Raunak Sharma'}
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                {profile?.email || 'raunak.demo@financemanager.io'}
              </div>
            </div>
          </div>

          {/* Interactive Logout Icon Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            disabled={loggingOut}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-950/50 transition-all duration-200 flex-shrink-0 cursor-pointer focus:outline-none"
          >
            <LogOut className={`w-4 h-4 ${loggingOut ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </aside>
  );
};
