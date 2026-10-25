import React, { useState, useEffect } from 'react';
import { X, PieChart } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBudget?: Budget | null;
}

const BUDGET_CATEGORIES = [
  'Food',
  'Shopping',
  'Bills',
  'Entertainment',
  'Transport',
  'Healthcare',
  'Utilities',
  'Other'
];

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, editBudget }) => {
  const { addBudget, updateBudget } = useFinance();

  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editBudget) {
      setCategory(editBudget.category);
      setLimitAmount(editBudget.limitAmount.toString());
    } else {
      setCategory(BUDGET_CATEGORIES[0]);
      setLimitAmount('');
    }
    setError('');
  }, [editBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limitAmount);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid target monthly budget limit');
      return;
    }

    if (editBudget) {
      await updateBudget(editBudget.id, {
        category,
        limitAmount: numLimit
      });
    } else {
      await addBudget({
        category,
        limitAmount: numLimit,
        period: 'monthly'
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {editBudget ? 'Edit Budget Category' : 'Create Budget Category'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set monthly spending thresholds to track healthy limits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Monthly Limit (₹)</label>
            <input
              type="number"
              step="100"
              placeholder="e.g. 8000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-sans font-bold"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02]"
            >
              {editBudget ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
