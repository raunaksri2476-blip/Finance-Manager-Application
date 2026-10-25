import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const StatCard = ({ title, amount, icon: Icon, trend, colorScheme = 'emerald' }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      val: 'text-emerald-700',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      val: 'text-slate-900',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      val: 'text-rose-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      val: 'text-slate-900',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.emerald;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${scheme.val}`}>
          {formatCurrency(amount)}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;
