import React from 'react';
import { motion } from 'framer-motion';
import { BudgetCategory, CashbackPartner } from '../types';

interface QuickMetricsProps {
  categories: BudgetCategory[];
  cashbackPartners: CashbackPartner[];
  onSpendingClick: () => void;
  onCashbackClick: () => void;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({
  onSpendingClick,
  onCashbackClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 mb-3 select-none">
      {/* Spending Card */}
      <motion.div
        whileHover={{ y: -2, backgroundColor: '#1c1c20' }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onSpendingClick}
        className="bg-[#18181b] border border-[#27272a] rounded-[24px] p-4 cursor-pointer flex flex-col justify-between h-[116px] shadow-md group"
      >
        <div>
          <h3 className="text-white text-[15px] font-semibold tracking-tight leading-tight group-hover:text-purple-300 transition-colors">
            Spending
          </h3>
          <p className="text-zinc-400 text-xs font-normal mt-0.5">
            Spent in October
          </p>
        </div>

        {/* Animated Segmented Pill Bar */}
        <div className="flex items-center gap-1.5 w-full mt-2 overflow-hidden">
          {/* Purple Pill */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ originX: 0 }}
            className="h-3.5 rounded-full bg-[#6320ee] flex-[2.6] shadow-sm" 
            title="Housing & Utilities: $1,200" 
          />
          {/* Coral Pill */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ originX: 0 }}
            className="h-3.5 rounded-full bg-[#f43f5e] flex-[1.4] shadow-sm" 
            title="Food & Dining: $540" 
          />
          {/* Green Pill */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ originX: 0 }}
            className="h-3.5 rounded-full bg-[#10b981] flex-[1] shadow-sm" 
            title="Groceries: $400" 
          />
          {/* Yellow Pill */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            style={{ originX: 0 }}
            className="h-3.5 rounded-full bg-[#f59e0b] flex-[1] shadow-sm" 
            title="Shopping: $380" 
          />
          {/* Blue Pill */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            style={{ originX: 0 }}
            className="h-3.5 rounded-full bg-[#3b82f6] flex-[0.8] shadow-sm" 
            title="Entertainment: $320" 
          />
        </div>
      </motion.div>

      {/* Cash Back Card */}
      <motion.div
        whileHover={{ y: -2, backgroundColor: '#1c1c20' }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onCashbackClick}
        className="bg-[#18181b] border border-[#27272a] rounded-[24px] p-4 cursor-pointer flex flex-col justify-between h-[116px] shadow-md group"
      >
        <div>
          <h3 className="text-white text-[15px] font-semibold tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
            Cash Back
          </h3>
        </div>

        {/* Brand Logos Row with staggered bounce */}
        <div className="flex items-center gap-1.5 mt-2">
          {/* Netflix Badge */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: -4 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl bg-black border border-zinc-800 flex items-center justify-center font-black text-red-600 text-base shadow-sm"
            title="Netflix - 5% Cash Back"
          >
            N
          </motion.div>

          {/* Nike Badge */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 4 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden p-1"
            title="Nike - 3% Cash Back"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
              <path d="M21.707 5.293c-.391-.391-1.023-.391-1.414 0L7.5 18.086l-3.793-3.793c-.391-.391-1.023-.391-1.414 1.414l4.5 4.5c.391.391 1.023.391 1.414 0l13.5-13.5c.391-.391.391-1.023 0-1.414z" />
            </svg>
          </motion.div>

          {/* McDonald's Badge */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: -3 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl bg-[#da291c] flex items-center justify-center font-bold text-[#ffbc0d] text-lg leading-none shadow-sm"
            title="McDonald's - 4% Cash Back"
          >
            M
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
