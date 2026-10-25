import React from 'react';
import { Edit2, Trash2, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
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

  const catName = budget.categoryID?.categoryName || 'General';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{catName}</h3>
            <p className="text-[11px] text-slate-400">
              {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusBadge(budget.status)}`}>
            {budget.status}
          </span>
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-extrabold text-slate-900 text-lg">
            {formatCurrency(budget.spent)}
          </span>
          <span className="text-slate-500 font-medium">
            of {formatCurrency(budget.budgetAmount)}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(budget.status)}`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>{budget.percentage}% Used</span>
          <span>Remaining: {formatCurrency(budget.remaining)}</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
