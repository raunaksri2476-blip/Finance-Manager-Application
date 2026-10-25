import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Trash2, Calendar, CreditCard, Tag, Clock } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDeleteTransaction?: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onDeleteTransaction,
}) => {
  const formatAmount = (amount: number, type: 'expense' | 'income') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <AnimatePresence>
      {transaction && (
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
            className="w-full max-w-[400px] bg-[#141417] border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Receipt className="w-4 h-4 text-purple-400" />
                <span>Digital Receipt</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Amount and Title */}
            <div className="text-center py-4 border-b border-zinc-800/80">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-white mb-2 shadow-md">
                {transaction.title.charAt(0)}
              </div>
              <h3 className="text-white text-lg font-bold tracking-tight">
                {transaction.title}
              </h3>
              <div className={`text-3xl font-extrabold tracking-tight mt-1 font-sans ${
                transaction.type === 'income' ? 'text-emerald-400' : 'text-white'
              }`}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                {transaction.type === 'income' ? 'Income Deposit' : 'Card Purchase'}
              </span>
            </div>

            {/* Receipt Details Breakdown */}
            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-zinc-500" />
                  Category
                </span>
                <span className="text-white font-medium">{transaction.category}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Date
                </span>
                <span className="text-white font-medium">{transaction.date}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Time
                </span>
                <span className="text-white font-medium">{transaction.time}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                  Payment Method
                </span>
                <span className="text-white font-mono font-medium">Mastercard (**** {transaction.cardLast4})</span>
              </div>

              {transaction.note && (
                <div className="bg-[#1c1c21] p-3 rounded-xl border border-zinc-800/80 mt-2">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Note</div>
                  <div className="text-zinc-300 text-xs mt-0.5">{transaction.note}</div>
                </div>
              )}
            </div>

            {/* Delete Transaction Action */}
            {onDeleteTransaction && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onDeleteTransaction(transaction.id);
                  onClose();
                }}
                className="w-full mt-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 border border-rose-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Transaction</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
