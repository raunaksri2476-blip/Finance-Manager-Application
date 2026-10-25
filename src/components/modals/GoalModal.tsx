import React, { useState, useEffect } from 'react';
import { X, Target, PlusCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Goal } from '../../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
  addMoneyGoal?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  editGoal,
  addMoneyGoal
}) => {
  const { addGoal, updateGoal, addMoneyToGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Savings');
  const [depositAmount, setDepositAmount] = useState('');
  const [error, setError] = useState('');

  const isDepositMode = Boolean(addMoneyGoal);

  useEffect(() => {
    if (addMoneyGoal) {
      setDepositAmount('');
    } else if (editGoal) {
      setTitle(editGoal.title);
      setTargetAmount(editGoal.targetAmount.toString());
      setTargetDate(editGoal.targetDate);
      setCategory(editGoal.category || 'Savings');
    } else {
      setTitle('');
      setTargetAmount('');
      setTargetDate('2026-12-31');
      setCategory('Savings');
    }
    setError('');
  }, [editGoal, addMoneyGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDepositMode && addMoneyGoal) {
      const deposit = parseFloat(depositAmount);
      if (isNaN(deposit) || deposit <= 0) {
        setError('Please enter a valid amount to deposit');
        return;
      }
      await addMoneyToGoal(addMoneyGoal.id, deposit);
      onClose();
      return;
    }

    if (!title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Please enter a valid target amount');
      return;
    }
    if (!targetDate) {
      setError('Please select a target completion date');
      return;
    }

    if (editGoal) {
      await updateGoal(editGoal.id, {
        title: title.trim(),
        targetAmount: numTarget,
        targetDate,
        category
      });
    } else {
      await addGoal({
        title: title.trim(),
        targetAmount: numTarget,
        targetDate,
        category
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
              {isDepositMode
                ? `Add Money: ${addMoneyGoal?.title}`
                : editGoal
                ? 'Edit Financial Goal'
                : 'Create New Goal'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isDepositMode
                ? 'Contribute funds to accelerate your target progress.'
                : 'Set a savings milestone with target dates.'}
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

          {isDepositMode ? (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Contribution Amount (₹)
              </label>
              <input
                type="number"
                step="100"
                placeholder="e.g. 5000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-sans"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Current progress: ₹{addMoneyGoal?.currentAmount.toLocaleString()} / ₹
                {addMoneyGoal?.targetAmount.toLocaleString()}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. New Macbook Pro, Emergency Fund, Europe Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    placeholder="80000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-sans font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Savings">Savings</option>
                    <option value="Travel">Travel</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Education">Education</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </>
          )}

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
              {isDepositMode ? 'Deposit Funds' : editGoal ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
