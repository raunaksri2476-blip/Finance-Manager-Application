import React from 'react';
import { Search, Calendar, Bell } from 'lucide-react';

interface HeaderProps {
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  hasUnreadNotifications?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onNotificationClick,
  onProfileClick,
  hasUnreadNotifications = true,
}) => {
  return (
    <header className="flex items-center justify-between gap-3 pt-3 pb-4 px-4 select-none">
      {/* Profile Avatar */}
      <button
        onClick={onProfileClick}
        className="relative flex-shrink-0 group focus:outline-none"
        title="View Profile"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700/80 p-0.5 bg-zinc-900 group-hover:border-zinc-500 transition-colors">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Josh Hill Avatar"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback if network image unavailable
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            JH
          </div>
        </div>
      </button>

      {/* Search Input Bar */}
      <div 
        onClick={onSearchClick}
        className="flex-1 flex items-center gap-2 bg-[#1c1c20] hover:bg-[#232328] border border-zinc-800/80 px-3.5 py-2 rounded-2xl cursor-pointer transition-colors"
      >
        <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <span className="text-zinc-400 text-sm font-medium tracking-wide">Search</span>
      </div>

      {/* Action Icons: Calendar & Notification Bell */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onNotificationClick}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 active:scale-95 transition-all"
          title="Calendar / Due Dates"
        >
          <Calendar className="w-5 h-5 text-zinc-300" />
        </button>

        <button
          onClick={onNotificationClick}
          className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 active:scale-95 transition-all"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-zinc-300" />
          {hasUnreadNotifications && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#0c0c0e]" />
          )}
        </button>
      </div>
    </header>
  );
};
