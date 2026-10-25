import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { BudgetModal } from '../components/modals/BudgetModal';
import { TransactionModal } from '../components/modals/TransactionModal';
import { Budget, Transaction } from '../types';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Calendar,
  Sparkles,
  Receipt,
  X,
  Tag,
  FileText
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { budgets, transactions, deleteBudget, deleteTransaction } = useFinance();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected Budget Category State
  const initialCatParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCatParam || null);

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const handleSelectCategory = (categoryName: string) => {
    if (selectedCategory?.toLowerCase() === categoryName.toLowerCase()) {
      setSelectedCategory(null);
      setSearchParams({});
    } else {
      setSelectedCategory(categoryName);
      setSearchParams({ category: categoryName.toLowerCase() });
    }
  };

  const handleEditBudget = (e: React.MouseEvent, b: Budget) => {
    e.stopPropagation();
    setEditingBudget(b);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = (e: React.MouseEvent, b: Budget) => {
    e.stopPropagation();
    if (confirm(`Delete budget for ${b.category}?`)) {
      if (selectedCategory?.toLowerCase() === b.category.toLowerCase()) {
        setSelectedCategory(null);
      }
      deleteBudget(b.id);
    }
  };

  const handleAddNewBudget = () => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  const handleAddTxForSelectedCategory = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  // Current Month Filtering Logic for Transactions
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((t) => {
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [transactions]);

  // Selected Budget Details & Transactions List
  const activeSelectedBudget = useMemo(() => {
    if (!selectedCategory) return null;
    return budgets.find((b) => b.category.toLowerCase() === selectedCategory.toLowerCase()) || null;
  }, [budgets, selectedCategory]);

  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return currentMonthTransactions.filter(
      (t) => t.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [currentMonthTransactions, selectedCategory]);

  // Dynamically calculate spent amount from expense transactions for current month
  const selectedCategorySpent = useMemo(() => {
    return selectedCategoryTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [selectedCategoryTransactions]);

  return (
    <DesktopLayout pageTitle="Budgets">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Monthly Category Budgets</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Click any budget card to view its live transaction history and category breakdown.
          </p>
        </div>

        <button
          onClick={handleAddNewBudget}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Budget</span>
        </button>
      </div>

      {/* Interactive Budget Cards Grid */}
      {budgets.length === 0 ? (
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <PieChart className="w-8 h-8 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">No budgets yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Create your first budget to track spending and stay in control of your money.
            </p>
          </div>
          <button
            onClick={handleAddNewBudget}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            // Dynamic month calculation
            const catExpenses = currentMonthTransactions
              .filter((t) => t.category.toLowerCase() === b.category.toLowerCase() && t.type === 'expense')
              .reduce((sum, t) => sum + Number(t.amount), 0);

            const spent = catExpenses;
            const limit = b.limitAmount;
            const pct = Math.min(100, Math.round((spent / limit) * 100));
            const remaining = limit - spent;

            const isSelected = selectedCategory?.toLowerCase() === b.category.toLowerCase();

            let statusText = 'Healthy';
            let statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            let StatusIcon = CheckCircle2;
            let progressColor = 'bg-emerald-500';

            if (pct >= 100) {
              statusText = 'Exceeded';
              statusBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
              StatusIcon = AlertOctagon;
              progressColor = 'bg-rose-500';
            } else if (pct >= 80) {
              statusText = 'Near Limit';
              statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              StatusIcon = AlertTriangle;
              progressColor = 'bg-amber-500';
            }

            return (
              <div
                key={b.id}
                onClick={() => handleSelectCategory(b.category)}
                className={`rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#18181c] border-2 border-purple-500 ring-2 ring-purple-500/40 shadow-purple-950/40 scale-[1.01]'
                    : 'bg-[#151518] border border-zinc-800 hover:border-zinc-700 hover:bg-[#18181b]'
                }`}
              >
                {/* Active selection indicator badge */}
                {isSelected && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-purple-600 text-[10px] font-extrabold uppercase tracking-wider text-white rounded-bl-2xl">
                    Selected Category
                  </div>
                )}

                {/* Top Row: Category Title & Status */}
                <div className="flex items-center justify-between mb-4 pr-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-purple-400 border border-zinc-700'
                      }`}
                    >
                      <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{b.category}</h3>
                      <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                        Monthly Limit
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${statusBadgeClass}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Progress Numerical Display */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-extrabold text-white font-financial">
                    {formatINR(spent)} <span className="text-xs text-zinc-400 font-normal">/ {formatINR(limit)}</span>
                  </div>
                  <div className="text-sm font-extrabold text-white">{pct}%</div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-[#09090b] rounded-full overflow-hidden border border-zinc-800 p-0.5 mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Bottom Info & Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 text-xs">
                  <div className="text-zinc-400 font-medium">
                    Remaining:{' '}
                    <span className={`font-bold ${remaining < 0 ? 'text-rose-400' : 'text-white'}`}>
                      {formatINR(remaining)}
                    </span>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditBudget(e, b)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Edit Budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteBudget(e, b)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-rose-400 transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SELECTED CATEGORY TRANSACTION HISTORY SECTION */}
      {selectedCategory && (
        <div className="bg-[#151518] border border-purple-500/40 rounded-3xl p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Section Header & Summary Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase">
                  Category Selected
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
                {selectedCategory} Transactions
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                All transactions in the {selectedCategory} category for the current monthly budget period.
              </p>
            </div>

            {/* Header Summary KPI Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl px-4 py-2 text-xs">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total Spent</span>
                <span className="text-sm font-extrabold text-white font-financial">
                  {formatINR(selectedCategorySpent)}
                </span>
              </div>

              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl px-4 py-2 text-xs">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Current Budget</span>
                <span className="text-sm font-extrabold text-white font-financial">
                  {formatINR(activeSelectedBudget?.limitAmount || 0)}
                </span>
              </div>

              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl px-4 py-2 text-xs">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Remaining</span>
                <span className="text-sm font-extrabold text-purple-400 font-financial">
                  {formatINR((activeSelectedBudget?.limitAmount || 0) - selectedCategorySpent)}
                </span>
              </div>

              <button
                onClick={handleAddTxForSelectedCategory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add {selectedCategory} Transaction</span>
              </button>
            </div>
          </div>

          {/* Transactions List or Empty State */}
          {selectedCategoryTransactions.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3 bg-[#09090b] border border-zinc-800 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No transactions yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                There are no transactions for the <strong className="text-purple-300">{selectedCategory}</strong> category within the selected budget period.
              </p>
              <button
                onClick={handleAddTxForSelectedCategory}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Transaction</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60 bg-[#09090b] border border-zinc-800/80 rounded-2xl overflow-hidden">
              <div className="p-3 bg-[#111113] border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>{selectedCategory} Category Transactions ({selectedCategoryTransactions.length})</span>
                <span>Click row for transaction details</span>
              </div>
              {selectedCategoryTransactions.map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTxForDetail(tx)}
                    className="p-4 flex items-center justify-between hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {tx.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5 font-sans">
                          <span>{tx.accountName || 'Primary Savings'}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-extrabold font-financial ${
                          isIncome ? 'text-emerald-400' : 'text-zinc-100'
                        }`}
                      >
                        {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">{tx.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Transaction Detail Dialog Modal */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Transaction Details</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Recorded entry specification</p>
              </div>
              <button
                onClick={() => setSelectedTxForDetail(null)}
                className="w-9 h-9 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center p-4 rounded-2xl bg-[#09090b] border border-zinc-800">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  {selectedTxForDetail.title}
                </div>
                <div
                  className={`text-3xl font-extrabold font-financial ${
                    selectedTxForDetail.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedTxForDetail.type === 'income'
                    ? `+${formatINR(selectedTxForDetail.amount)}`
                    : `-${formatINR(selectedTxForDetail.amount)}`}
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-zinc-800/80">
                  <span className="text-zinc-400 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-purple-400" /> Category</span>
                  <span className="font-bold text-white">{selectedTxForDetail.category}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-zinc-800/80">
                  <span className="text-zinc-400 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-purple-400" /> Account</span>
                  <span className="font-bold text-white">{selectedTxForDetail.accountName || 'Primary'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-zinc-800/80">
                  <span className="text-zinc-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-400" /> Date</span>
                  <span className="font-bold text-white font-mono">{formatDate(selectedTxForDetail.date)}</span>
                </div>

                {selectedTxForDetail.notes && (
                  <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800/80">
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" /> Notes
                    </span>
                    <p className="text-zinc-300 text-xs">{selectedTxForDetail.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTx(selectedTxForDetail);
                    setSelectedTxForDetail(null);
                    setIsTxModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Transaction</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete transaction "${selectedTxForDetail.title}"?`)) {
                      deleteTransaction(selectedTxForDetail.id);
                      setSelectedTxForDetail(null);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        editBudget={editingBudget}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        editTx={editingTx}
        defaultCategory={selectedCategory || 'Food'}
      />
    </DesktopLayout>
  );
};
