import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, RefreshCw, Landmark, Globe, Coins, FileText, ShieldCheck, Zap } from 'lucide-react';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (serviceName: string) => void;
}

const SERVICES = [
  { name: 'Split Bills', desc: 'Equal splits with friends via QR', icon: Users, color: '#f43f5e', badge: 'Popular' },
  { name: 'Subscriptions', desc: 'Manage Netflix, Spotify & utilities', icon: RefreshCw, color: '#8b5cf6', badge: 'Active' },
  { name: 'Savings Vaults', desc: 'Lock funds for trips & goals', icon: Landmark, color: '#10b981' },
  { name: 'Global Wire', desc: 'Zero-fee international transfer', icon: Globe, color: '#3b82f6' },
  { name: 'Crypto & Assets', desc: 'Track BTC, ETH, and index tokens', icon: Coins, color: '#f59e0b' },
  { name: 'Statements', desc: 'Export monthly PDF / CSV tax logs', icon: FileText, color: '#06b6d4' },
  { name: 'Credit Score', desc: '768 • Excellent (Updated 2d ago)', icon: ShieldCheck, color: '#10b981' },
  { name: 'Direct Pay', desc: 'Instant merchant contactless pay', icon: Zap, color: '#ec4899' },
];

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  onSelectService,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 select-none"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            className="w-full max-w-[430px] bg-[#141417] border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4 flex-shrink-0" />

            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div>
                <h2 className="text-white text-lg font-bold tracking-tight">
                  All Services
                </h2>
                <p className="text-zinc-400 text-xs">Financial tools & utilities</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="overflow-y-auto grid grid-cols-2 gap-3 pr-1">
              {SERVICES.map((svc) => {
                const Icon = svc.icon;
                return (
                  <motion.div
                    key={svc.name}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onSelectService(svc.name);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-[#1c1c21] border border-zinc-800 cursor-pointer flex flex-col justify-between h-[104px] relative group shadow-sm"
                  >
                    {svc.badge && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {svc.badge}
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" style={{ color: svc.color }} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold leading-tight group-hover:text-purple-300 transition-colors">
                        {svc.name}
                      </div>
                      <div className="text-zinc-400 text-[10px] mt-0.5 line-clamp-1">
                        {svc.desc}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
