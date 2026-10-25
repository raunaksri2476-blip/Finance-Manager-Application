import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  Target,
  FileBarChart,
  Settings,
  LogOut,
  X,
  PieChart,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: WalletCards },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
      isActive
        ? 'bg-emerald-500/10 text-emerald-400 font-semibold shadow-inner'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-64 border-r border-slate-800 select-none">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-extrabold text-xl">
            ₹
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
              FINANCE MANAGER
            </h1>
            <p className="text-[10px] font-medium text-slate-400 tracking-wider mt-1 uppercase">
              Control Your Money
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <p className="px-3.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={navLinkClass}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <div className="pt-6 my-2 border-t border-slate-800">
          <p className="px-3.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
            System
          </p>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={navLinkClass}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-200 truncate">
                {user?.name || 'User'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
