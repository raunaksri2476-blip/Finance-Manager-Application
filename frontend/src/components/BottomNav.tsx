import React from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart2, MessageSquare, MoreHorizontal } from 'lucide-react';

export type TabType = 'home' | 'payment' | 'message' | 'more';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'payment', label: 'Payment', icon: BarChart2 },
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2 z-40 select-none">
      <div className="flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 z-10 transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Sliding Active Background Aura */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white/[0.06] rounded-2xl -z-10"
                />
              )}

              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5] scale-110 text-white' : 'stroke-[1.8]'}`} />
              <span className={`text-[11px] font-medium tracking-tight mt-1 ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>

              {/* Notification Dot for Message Tab */}
              {tab.id === 'message' && (
                <span className="absolute top-1 right-4 w-1.5 h-1.5 bg-purple-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2" />
    </nav>
  );
};
