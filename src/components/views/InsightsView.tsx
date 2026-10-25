import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, ArrowUpRight, ShieldCheck, Download } from 'lucide-react';
import { BudgetCategory, Transaction } from '../../types';

interface InsightsViewProps {
  categories: BudgetCategory[];
  transactions: Transaction[];
  onOpenTips: () => void;
  onExportReport: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  categories,
  onOpenTips,
  onExportReport,
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');

  const totalSpent = categories.reduce((acc, cat) => acc + cat.spent, 0);
  const totalIncome = 4850.00;
  const netSavings = totalIncome - totalSpent;
  const savingsRate = Math.round((netSavings / totalIncome) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-4 pb-24 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            Financial Insights
          </h1>
          <p className="text-zinc-400 text-xs">AI analysis & spending metrics</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={onExportReport}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Export</span>
        </motion.button>
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 flex flex-col justify-between shadow-md"
        >
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Monthly Spend</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-sans">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            -4.2% vs last month
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 flex flex-col justify-between shadow-md"
        >
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Net Savings</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-sans">
            +${netSavings.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {savingsRate}% savings rate
          </div>
        </motion.div>
      </div>

      {/* Spending Velocity Area Chart (SVG with animated path drawing) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[26px] p-5 mb-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white text-sm font-semibold tracking-tight">
              Spending Velocity
            </h3>
            <p className="text-zinc-400 text-xs mt-0.5">Rolling 4-week expenditure</p>
          </div>

          <div className="flex items-center bg-zinc-800 rounded-xl p-0.5 text-[11px]">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeframe === 'week' ? 'bg-purple-600 text-white' : 'text-zinc-400'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeframe === 'month' ? 'bg-purple-600 text-white' : 'text-zinc-400'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* SVG Curved Line / Area Chart with motion.path */}
        <div className="h-40 w-full relative">
          <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid guide lines */}
            <line x1="0" y1="35" x2="320" y2="35" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="320" y2="75" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="115" x2="320" y2="115" stroke="#27272a" strokeDasharray="3 3" />

            {/* Area Fill with fade-in */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              d="M 10 110 C 60 90, 90 120, 140 65 C 190 20, 240 70, 310 40 L 310 135 L 10 135 Z"
              fill="url(#spendGrad)"
            />

            {/* Animated Stroke Line Drawing */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              d="M 10 110 C 60 90, 90 120, 140 65 C 190 20, 240 70, 310 40"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Highlight Peak Dots */}
            <motion.circle 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              cx="140" cy="65" r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="2" 
            />
            <motion.circle 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' }}
              cx="310" cy="40" r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" 
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 px-1">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3 (Peak)</span>
          <span>Week 4 (Current)</span>
        </div>
      </div>

      {/* AI Smart Advice Section */}
      <div className="space-y-3 mb-4">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Spending Intelligence</span>
        </h3>

        {/* Insight Card 1 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 flex items-start gap-3 shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white text-xs font-bold">Food & Dining Pace Warning</div>
            <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">
              You've spent $540 of your $700 Dining cap with 18 days left. Trimming 2 food deliveries this week will keep you under budget.
            </p>
          </div>
        </motion.div>

        {/* Insight Card 2 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 flex items-start gap-3 shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white text-xs font-bold">Cashback Stacking Opportunity</div>
            <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">
              Your Mastercard offers an additional 3% on Nike store purchases. Tap to link your retail account.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Financial Education Callout */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenTips}
        className="p-4 rounded-[22px] bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-800/40 cursor-pointer flex items-center justify-between shadow-md"
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Financial Growth</span>
          <h4 className="text-white text-xs font-bold mt-0.5">Read: The 48-Hour Rule for Impulse Buys</h4>
          <p className="text-zinc-400 text-[11px] mt-0.5">2 min interactive read in Tips & Training</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
      </motion.div>
    </motion.div>
  );
};
