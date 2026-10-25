import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { BudgetCategory } from '../../types';

interface BudgetsViewProps {
  categories: BudgetCategory[];
  onAdjustBudgetClick: () => void;
  autoBudgetEnabled: boolean;
  onToggleAutoBudget: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  onAdjustBudgetClick,
  autoBudgetEnabled,
  onToggleAutoBudget,
}) => {
  const totalAllocated = categories.reduce((acc, cat) => acc + cat.allocated, 0);
  const totalSpent = categories.reduce((acc, cat) => acc + cat.spent, 0);
  const remaining = Math.max(0, totalAllocated - totalSpent);
  const percentageSpent = Math.min(100, Math.round((totalSpent / totalAllocated) * 100));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-4 pb-24 select-none"
    >
      {/* View Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            Monthly Budgets
          </h1>
          <p className="text-zinc-400 text-xs">October 2026 Budget Overview</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={onAdjustBudgetClick}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Adjust Caps</span>
        </motion.button>
      </div>

      {/* Primary Budget Burn Card */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#1c1c21] via-[#18181b] to-[#121215] border border-[#27272a] p-5 shadow-xl mb-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 text-xs font-medium">Total Spent</span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {formatCurrency(remaining)} Left
          </span>
        </div>

        <div className="text-3xl font-extrabold text-white tracking-tight mb-3">
          {formatCurrency(totalSpent)} <span className="text-sm font-normal text-zinc-500">/ {formatCurrency(totalAllocated)}</span>
        </div>

        {/* Global Progress Bar with animated fill */}
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentageSpent}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-rose-500"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
          <span>{percentageSpent}% consumed</span>
          <span>18 days remaining</span>
        </div>
      </motion.div>

      {/* Auto-Budgeting Quick Toggle Card */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-3.5 mb-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 max-w-[75%]">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white text-xs font-bold">Auto-Budgeting Guardrails</div>
            <div className="text-zinc-400 text-[11px]">Dynamic AI category alerts enabled</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleAutoBudget}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
            autoBudgetEnabled ? 'bg-purple-600' : 'bg-zinc-700'
          }`}
        >
          <motion.div
            animate={{ x: autoBudgetEnabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white w-4 h-4 rounded-full shadow-md"
          />
        </button>
      </div>

      {/* Category Breakdown Cards with staggered entrance */}
      <div className="space-y-3">
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider px-1">
          Category Budgets
        </h2>

        {categories.map((cat, index) => {
          const catPercent = Math.min(100, Math.round((cat.spent / cat.allocated) * 100));
          const isWarning = catPercent >= cat.alertThreshold;
          const isOver = catPercent >= 100;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
              whileHover={{ y: -2, backgroundColor: '#1e1e23' }}
              whileTap={{ scale: 0.98 }}
              onClick={onAdjustBudgetClick}
              className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-white text-sm font-semibold tracking-tight">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isOver ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Exceeded
                    </span>
                  ) : isWarning ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Alert {catPercent}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> On Track
                    </span>
                  )}
                  <span className="text-xs font-bold text-white">
                    ${cat.spent} <span className="text-zinc-500 font-normal">/ ${cat.allocated}</span>
                  </span>
                </div>
              </div>

              {/* Animated Category Progress Bar */}
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${catPercent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 + 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: isOver ? '#f43f5e' : cat.color,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
