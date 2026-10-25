import React from 'react';
import { TrendingUp, ArrowUpRight, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface BalanceCardProps {
  balance: number;
  holderName?: string;
  accountLabel?: string;
  onAddTx?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  holderName = 'Raunak',
  accountLabel = 'HDFC Savings •••• 5087',
  onAddTx
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 p-7 bg-gradient-to-b from-[#242429] via-[#1a1a1e] to-[#121215] shadow-2xl transition-all duration-300 hover:border-purple-500/40 group">
      {/* Background Decorative Accent Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Card Row */}
      <div className="flex items-center justify-between relative z-10 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Total Net Balance
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-2">
            <span className="w-5 h-5 rounded-full bg-[#eb001b] inline-block shadow-sm"></span>
            <span className="w-5 h-5 rounded-full bg-[#f79e1b] inline-block opacity-90 shadow-sm"></span>
          </div>
          <span className="text-zinc-400 text-xs font-mono tracking-widest font-semibold">WORLD DEBIT</span>
        </div>
      </div>

      {/* Holder Name */}
      <div className="text-zinc-400 text-xs font-medium tracking-wide relative z-10 mb-4">
        Account Holder: <span className="text-white font-semibold">{holderName}</span>
      </div>

      {/* Visually Dominant Financial Balance Number */}
      <div className="mb-6 relative z-10">
        <div className="text-white text-4xl lg:text-5xl font-extrabold tracking-tight font-financial text-zinc-50 drop-shadow-sm">
          {formatINR(balance)}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" /> +12.8%
          </span>
          <span className="text-zinc-400 text-xs font-medium">from last month</span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 relative z-10">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>{accountLabel}</span>
        </div>

        {onAddTx && (
          <button
            onClick={onAddTx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all duration-200"
          >
            <span>Quick Deposit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
