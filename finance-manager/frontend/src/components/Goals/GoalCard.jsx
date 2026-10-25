import React, { useState } from 'react';
import { Target, Edit2, Trash2, Plus, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../common/Button';
import Input from '../common/Input';

const GoalCard = ({ goal, onEdit, onDelete, onAddMoney }) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const handleAddMoneySubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(addAmount);
    if (val > 0) {
      onAddMoney(goal._id, val);
      setAddAmount('');
      setShowAddInput(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{goal.goalName}</h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>Target Date: {formatDate(goal.deadline)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit goal"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold text-emerald-600">
            {formatCurrency(goal.currentAmount)}
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            Target: {formatCurrency(goal.targetAmount)}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(goal.percentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="font-bold text-emerald-700">{goal.percentage}% Completed</span>
          <span>Remaining: {formatCurrency(goal.remaining)}</span>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">{goal.description}</p>
      )}

      {/* Add Money Form Toggle */}
      <div className="pt-2 border-t border-slate-100">
        {!showAddInput ? (
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            className="w-full"
            onClick={() => setShowAddInput(true)}
          >
            Add Savings Deposit
          </Button>
        ) : (
          <form onSubmit={handleAddMoneySubmit} className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Amount (₹)"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              required
              className="py-1.5 text-xs"
            />
            <Button type="submit" size="sm" variant="primary">
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAddInput(false)}
            >
              Cancel
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
