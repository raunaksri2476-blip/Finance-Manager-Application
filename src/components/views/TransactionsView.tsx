import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Utensils, ShoppingBag, Home, Tv, Car, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onAddTransactionClick: () => void;
  onTransactionClick: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onAddTransactionClick,
  onTransactionClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

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

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' ? true : tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatAmount = (amount: number, type: 'expense' | 'income') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-4 pb-24 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            Transactions
          </h1>
          <p className="text-zinc-400 text-xs">All activity & statements</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onAddTransactionClick}
          className="w-9 h-9 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all"
          title="Add Transaction"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search transactions, brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 p-1 bg-[#18181b] border border-[#27272a] rounded-2xl">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            filterType === 'all' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            filterType === 'expense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            filterType === 'income' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Income
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[24px] divide-y divide-zinc-800/60 overflow-hidden shadow-md">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 px-4 text-zinc-500">
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs mt-1">Try changing your search query or filter</p>
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.4)' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onTransactionClick(tx)}
              className="p-3.5 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  {getCategoryIcon(tx.category)}
                </div>
                <div>
                  <div className="text-white text-sm font-medium tracking-tight">
                    {tx.title}
                  </div>
                  <div className="text-zinc-400 text-xs mt-0.5">
                    {tx.category} • {tx.date} at {tx.time}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-sm font-semibold tracking-tight ${
                  tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-100'
                }`}>
                  {formatAmount(tx.amount, tx.type)}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {tx.cardLast4 ? `•• ${tx.cardLast4}` : ''}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
