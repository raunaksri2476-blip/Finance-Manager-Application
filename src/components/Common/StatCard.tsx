import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  amount: number;
  changePercentage?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  isPositiveGood?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  changePercentage,
  changeLabel = 'vs last month',
  icon: Icon,
  iconBgColor = 'bg-purple-500/10',
  iconTextColor = 'text-purple-400',
  isPositiveGood = true
}) => {
  const isPositive = changePercentage !== undefined && changePercentage >= 0;
  const isGood = isPositiveGood ? isPositive : !isPositive;

  return (
    <div className="bg-[#151518] border border-zinc-800/90 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-200 shadow-md group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-financial mb-2">
        {formatINR(amount)}
      </div>

      {changePercentage !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              isGood
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? `+${changePercentage}%` : `${changePercentage}%`}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">{changeLabel}</span>
        </div>
      )}
    </div>
  );
};
