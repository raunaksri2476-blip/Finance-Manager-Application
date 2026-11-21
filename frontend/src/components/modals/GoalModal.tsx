import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Target, PlusCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit Success Animation Popup State
  const [depositSuccess, setDepositSuccess] = useState<{
    goalTitle: string;
    deposited: number;
    newCurrent: number;
    target: number;
  } | null>(null);

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
    setDepositSuccess(null);
    setIsSubmitting(false);
  }, [editGoal, addMoneyGoal, isOpen]);

  // Lock body scroll while GoalModal is open (backdrop-blur on overlay handles visual blur without GPU spike)
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDepositMode && addMoneyGoal) {
      const deposit = parseFloat(depositAmount);
      if (isNaN(deposit) || deposit <= 0) {
        setError('Please enter a valid amount to deposit');
        return;
      }

      setIsSubmitting(true);
      const prevCurrent = addMoneyGoal.currentAmount;
      const targetVal = addMoneyGoal.targetAmount;
      const goalTitle = addMoneyGoal.title;

      await addMoneyToGoal(addMoneyGoal.id, deposit);
      setIsSubmitting(false);

      // Show animated deposit confirmation modal
      setDepositSuccess({
        goalTitle,
        deposited: deposit,
        newCurrent: prevCurrent + deposit,
        target: targetVal
      });
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

    setIsSubmitting(true);
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
    setIsSubmitting(false);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto select-none font-sans"
      role="dialog"
      aria-modal="true"
    >
      {/* Full-Viewport Dark & Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[14px]"
        style={{ WebkitBackdropFilter: 'blur(14px)' }}
        onClick={() => {
          setDepositSuccess(null);
          onClose();
        }}
        aria-hidden="true"
      />

      {depositSuccess ? (
        /* ANIMATED DEPOSIT SUCCESS POPUP */
        <div className="relative z-10 bg-[#151518] border border-emerald-500/40 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-5 text-center animate-in zoom-in-95 fade-in duration-300">
          <button
            onClick={() => {
              setDepositSuccess(null);
              onClose();
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Glowing Checkmark Ring */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/60">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Funds Deposited Successfully
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight font-financial pt-1">
              +{formatINR(depositSuccess.deposited)} Added!
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your contribution has been deposited toward{' '}
              <strong className="text-white">"{depositSuccess.goalTitle}"</strong>.
            </p>
          </div>

          {/* Updated Goal Progress Card inside Popup */}
          <div className="bg-[#09090b] p-4 rounded-2xl border border-zinc-800/90 space-y-2.5 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-semibold">Updated Goal Balance</span>
              <span className="text-emerald-400 font-extrabold">
                {Math.min(100, Math.round((depositSuccess.newCurrent / depositSuccess.target) * 100))}% Complete
              </span>
            </div>

            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-purple-500 to-cyan-400 transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((depositSuccess.newCurrent / depositSuccess.target) * 100))}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-white font-bold">{formatINR(depositSuccess.newCurrent)}</span>
              <span className="text-zinc-400">Target: {formatINR(depositSuccess.target)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDepositSuccess(null);
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <span>Awesome, Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* STANDARD CREATE / EDIT / DEPOSIT GOAL FORM */
        <div className="relative z-10 bg-[#151518] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200">
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
              className="w-9 h-9 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                  autoFocus
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
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] cursor-pointer"
              >
                {isSubmitting
                  ? 'Processing...'
                  : isDepositMode
                  ? 'Deposit Funds'
                  : editGoal
                  ? 'Update Goal'
                  : 'Save Goal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
