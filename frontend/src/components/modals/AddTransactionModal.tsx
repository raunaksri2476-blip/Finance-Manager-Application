import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Utensils, ShoppingBag, Home, Tv, Car, Apple } from 'lucide-react';
import { Transaction, TransactionType } from '../../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES = [
  { name: 'Dining', label: 'Food & Dining', icon: Utensils, color: '#f43f5e' },
  { name: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: '#f59e0b' },
  { name: 'Housing', label: 'Housing & Bills', icon: Home, color: '#8b5cf6' },
  { name: 'Groceries', label: 'Groceries', icon: Apple, color: '#10b981' },
  { name: 'Entertainment', label: 'Entertainment', icon: Tv, color: '#3b82f6' },
  { name: 'Transportation', label: 'Transport', icon: Car, color: '#06b6d4' },
] as const;

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<any>('Dining');
  const [note, setNote] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      title: title.trim() || (type === 'income' ? 'Direct Deposit' : 'General Purchase'),
      category: type === 'income' ? 'Income' : category,
      amount: parsedAmount,
      type,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      account: 'Account ** 5087',
      cardLast4: '3264',
      note: note.trim(),
    });

    // Reset and close
    setAmount('');
    setTitle('');
    setNote('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 select-none"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            className="w-full max-w-[430px] bg-[#141417] border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Handle bar */}
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-lg font-bold tracking-tight">
                Add Transaction
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Income vs Expense Toggle */}
              <div className="grid grid-cols-2 p-1 bg-[#1c1c21] rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount Input */}
              <div className="text-center py-2">
                <label className="block text-zinc-400 text-xs mb-1">Amount (USD)</label>
                <div className="relative inline-flex items-center justify-center">
                  <span className="text-3xl font-bold text-zinc-400 mr-1">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                    required
                    className="w-48 bg-transparent text-white text-4xl font-extrabold text-center focus:outline-none placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Merchant / Title Input */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">Merchant / Payee</label>
                <input
                  type="text"
                  placeholder={type === 'income' ? 'e.g., Client Freelance, Employer' : 'e.g., Starbucks, Target, Netflix'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1c1c21] border border-zinc-800 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Categories (for expenses) */}
              {type === 'expense' && (
                <div>
                  <label className="block text-zinc-400 text-xs mb-1.5">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.name;
                      return (
                        <motion.button
                          type="button"
                          key={cat.name}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setCategory(cat.name)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 text-xs transition-all ${
                            isSelected
                              ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                              : 'bg-[#1c1c21] border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" style={{ color: cat.color }} />
                          <span className="truncate">{cat.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Note */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Team lunch, impulse buy"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#1c1c21] border border-zinc-800 text-white rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Submit Button with spring tap */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Transaction</span>
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
