import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Calendar, Tag, CreditCard, Plus, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { AccountModal } from './AccountModal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
  defaultCategory?: string;
}

const CATEGORIES = [
  'Food',
  'Shopping',
  'Bills',
  'Salary',
  'Entertainment',
  'Transport',
  'Healthcare',
  'Investment',
  'Income',
  'Utilities',
  'Other'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, editTx, defaultCategory }) => {
  const { accounts, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState<boolean>(false);

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmount(editTx.amount.toString());
      setTitle(editTx.title);
      setCategory(editTx.category);
      setAccountId(editTx.accountId || accounts[0]?.id || '');
      setDate(editTx.date);
      setNotes(editTx.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      setCategory(defaultCategory || 'Food');
      setAccountId(accounts[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError('');
  }, [editTx, defaultCategory, isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a description');
      return;
    }
    const targetAccountId = accountId || accounts[0]?.id || 'acc-default';
    const selectedAcc = accounts.find(a => a.id === targetAccountId);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editTx) {
      await updateTransaction(editTx.id, {
        type,
        amount: numAmount,
        title: title.trim(),
        category,
        accountId: targetAccountId,
        accountName: selectedAcc?.name || '',
        date,
        time: timeStr,
        notes: notes.trim()
      });
    } else {
      await addTransaction({
        type,
        amount: numAmount,
        title: title.trim(),
        category,
        accountId: targetAccountId,
        accountName: selectedAcc?.name || '',
        date,
        time: timeStr,
        notes: notes.trim()
      });
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editTx ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Record an income or expense into your financial manager.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* NO ACCOUNTS ALERT BANNER */}
            {accounts.length === 0 && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 text-purple-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <AlertTriangle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>No Financial Account Connected</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  You must add a Credit/Debit Card or Bank Account before recording transactions.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/50 transition-all hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Credit / Debit Card Now</span>
                </button>
              </div>
            )}

            {/* Income / Expense Switch Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#09090b] p-1.5 rounded-2xl border border-zinc-800/80">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Income
              </button>
            </div>

            {/* Amount Input Display */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400 font-sans">
                  ₹
                </span>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl pl-10 pr-4 py-3.5 text-2xl font-extrabold text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>
            </div>

            {/* Description / Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Description</label>
              <input
                id="tx-title"
                type="text"
                placeholder="e.g. Swiggy Gourmet, Salary Credit, Electricity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Account & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Account
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddAccountOpen(true)}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Card
                  </button>
                </div>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {accounts.length === 0 ? (
                    <option value="">-- No Account Created --</option>
                  ) : (
                    accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (•••• {acc.accountNumber})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" /> Category
                </label>
                <select
                  id="tx-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {editTx ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />
    </>
  );
};
