import React, { useState, useMemo } from 'react';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { TransactionModal } from '../components/modals/TransactionModal';
import { Transaction } from '../types';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Download
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions, accounts, deleteTransaction } = useFinance();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const matchesSearch =
        tx.title.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase());

      // Type
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;

      // Category
      const matchesCat = categoryFilter === 'all' || tx.category === categoryFilter;

      // Account
      const matchesAcc = accountFilter === 'all' || tx.accountId === accountFilter;

      return matchesSearch && matchesType && matchesCat && matchesAcc;
    });
  }, [transactions, search, typeFilter, categoryFilter, accountFilter]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <DesktopLayout pageTitle="Transactions">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transactions Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Track every rupee coming in and going out.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type Switch buttons */}
          <div className="flex items-center bg-[#09090b] border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#09090b] border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="bg-[#09090b] border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-[#111113]">
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Account</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No transactions match your current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Title & Icon */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-white">{tx.title}</div>
                            {tx.notes && <div className="text-[11px] text-zinc-400 truncate max-w-xs">{tx.notes}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-semibold text-[11px] border border-zinc-700/60">
                          {tx.category}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="py-4 px-4 text-zinc-300 font-medium">
                        {tx.accountName || 'Primary Savings'}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-zinc-400 font-mono text-[11px]">
                        {formatDate(tx.date)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-extrabold font-financial text-sm ${
                            isIncome ? 'text-emerald-400' : 'text-zinc-100'
                          }`}
                        >
                          {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete transaction "${tx.title}"?`)) deleteTransaction(tx.id);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-rose-400 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editTx={editingTx} />
    </DesktopLayout>
  );
};
