import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Utensils, Home, Tv, Car, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onSeeAllClick: () => void;
  onTransactionClick: (tx: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onSeeAllClick,
  onTransactionClick,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Dining':
        return <Utensils className="w-4 h-4 text-rose-400" />;
      case 'Shopping':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'Housing':
      case 'Utilities':
        return <Home className="w-4 h-4 text-purple-400" />;
      case 'Entertainment':
        return <Tv className="w-4 h-4 text-blue-400" />;
      case 'Transportation':
        return <Car className="w-4 h-4 text-cyan-400" />;
      case 'Income':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatAmount = (amount: number, type: 'expense' | 'income') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="px-4 mb-4 select-none">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-white text-[15px] font-semibold tracking-tight">
          Recent Activity
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSeeAllClick}
          className="text-purple-400 hover:text-purple-300 text-xs font-medium tracking-wide transition-colors"
        >
          See all
        </motion.button>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-[24px] divide-y divide-zinc-800/60 overflow-hidden shadow-md">
        {transactions.slice(0, 4).map((tx, idx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 + 0.1 }}
            whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.4)' }}
            whileTap={{ scale: 0.99, backgroundColor: 'rgba(39, 39, 42, 0.7)' }}
            onClick={() => onTransactionClick(tx)}
            className="p-3.5 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                {getCategoryIcon(tx.category)}
              </div>
              <div>
                <div className="text-white text-sm font-medium tracking-tight">
                  {tx.title}
                </div>
                <div className="text-zinc-400 text-xs mt-0.5">
                  {tx.date} • {tx.time}
                </div>
              </div>
            </div>

            <div className={`text-sm font-semibold tracking-tight ${
              tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'
            }`}>
              {formatAmount(tx.amount, tx.type)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
