import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const BudgetOverview = ({ budgets = [] }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Exceeded':
        return 'bg-rose-100 text-rose-700';
      case 'Almost Exceeded':
        return 'bg-rose-50 text-rose-600';
      case 'Warning':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'Exceeded':
      case 'Almost Exceeded':
        return 'bg-rose-500';
      case 'Warning':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Budget Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Category spending limits & status</p>
        </div>
        <Link
          to="/budgets"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No active budgets created yet.
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 4).map((b) => (
            <div key={b._id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{b.categoryName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    {formatCurrency(b.spent)} / {formatCurrency(b.budgetAmount)}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusBadge(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(b.status)}`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
