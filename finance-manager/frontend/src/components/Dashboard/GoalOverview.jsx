import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const GoalOverview = ({ goals = [] }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Financial Goals</h3>
          <p className="text-xs text-slate-500 mt-0.5">Track your savings targets</p>
        </div>
        <Link
          to="/goals"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No financial goals defined yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.slice(0, 3).map((goal) => (
            <div
              key={goal._id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{goal.goalName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Target: {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-600">{formatCurrency(goal.currentAmount)}</span>
                  <span className="font-semibold text-slate-500">{goal.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalOverview;
