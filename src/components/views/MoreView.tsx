import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Smartphone, Shield, CreditCard, FileText, ChevronRight, Check, Sparkles, LogOut } from 'lucide-react';
import { AccountCard } from '../../types';

interface MoreViewProps {
  card: AccountCard;
  isHeatmapActive: boolean;
  onToggleHeatmap: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenServices: () => void;
  onOpenTips: () => void;
  onOpenReferral: () => void;
  onLogout: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  card,
  isHeatmapActive,
  onToggleHeatmap,
  isPhoneFrame,
  onTogglePhoneFrame,
  onOpenServices,
  onOpenTips,
  onOpenReferral,
  onLogout,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-4 pb-28 select-none"
    >
      {/* Header */}
      <h1 className="text-white text-xl font-bold tracking-tight mb-4">
        Settings & More
      </h1>

      {/* User Profile Card */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-[#18181b] border border-[#27272a] rounded-[24px] p-4 flex items-center justify-between mb-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 p-0.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Josh Hill"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="text-white text-base font-bold tracking-tight">
              {card.holderName}
            </div>
            <div className="text-zinc-400 text-xs mt-0.5">
              Verified Member • Account #{card.accountNumber}
            </div>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          PRO TIER
        </span>
      </motion.div>

      {/* Corizo UI/UX Course Special Feature: Attention Insight AI Heatmap */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-br from-purple-950/40 via-[#18181b] to-[#141417] border border-purple-700/40 rounded-[24px] p-4 mb-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 max-w-[75%]">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white text-xs font-bold flex items-center gap-1.5">
                <span>Attention Insight AI Heatmap</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 font-extrabold uppercase">
                  UAT MODE
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5 leading-snug">
                Simulate eye-tracking gaze distribution over buttons, cards, and budget bars.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleHeatmap}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              isHeatmapActive ? 'bg-purple-600' : 'bg-zinc-700'
            }`}
          >
            <motion.div
              animate={{ x: isHeatmapActive ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-white w-4 h-4 rounded-full shadow-md"
            />
          </button>
        </div>
      </motion.div>

      {/* Presentation Display Mode */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-3.5 mb-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white text-xs font-bold">iPhone Device Frame</div>
            <div className="text-zinc-400 text-[11px]">
              {isPhoneFrame ? 'Phone mockup frame ON' : 'Fullscreen web view'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onTogglePhoneFrame}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
            isPhoneFrame ? 'bg-purple-600' : 'bg-zinc-700'
          }`}
        >
          <motion.div
            animate={{ x: isPhoneFrame ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white w-4 h-4 rounded-full shadow-md"
          />
        </button>
      </div>

      {/* Navigation Settings Options */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[24px] divide-y divide-zinc-800/60 overflow-hidden mb-4 shadow-md">
        <motion.div
          whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.4)' }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenServices}
          className="p-3.5 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span className="text-white text-xs font-medium">Fintech Services & Vaults</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </motion.div>

        <motion.div
          whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.4)' }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenTips}
          className="p-3.5 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white text-xs font-medium">Tips & Training Lessons</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </motion.div>

        <motion.div
          whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.4)' }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenReferral}
          className="p-3.5 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-white text-xs font-medium">Refer Friends & Earn ($25)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </motion.div>

        <div className="p-3.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-white text-xs font-medium">FaceID / Biometric Passcode</span>
          </div>
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Account Logout Action */}
      <motion.button
        whileHover={{ scale: 1.01, backgroundColor: 'rgba(244, 63, 94, 0.15)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onLogout}
        className="w-full py-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 font-semibold text-xs rounded-[22px] flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of MyBudget</span>
      </motion.button>

      <div className="text-center text-zinc-500 text-[11px] pt-4">
        MyBudget Mobile • v1.0.0 (Capacitor Native Shell)
        <br />
        Corizo UI/UX Design Course Project
      </div>
    </motion.div>
  );
};
