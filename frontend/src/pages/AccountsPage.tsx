import React, { useState } from 'react';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { AccountModal } from '../components/modals/AccountModal';
import { Account } from '../types';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { accounts, transactions, deleteAccount } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string | null>(null);

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const filteredTransactions = selectedAccountFilter
    ? transactions.filter((t) => t.accountId === selectedAccountFilter)
    : transactions;

  return (
    <DesktopLayout pageTitle="Accounts">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Accounts & Cards</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage your bank accounts, cards, and cash balances in one place.</p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Account</span>
        </button>
      </div>

      {/* Accounts Cards Grid */}
      {accounts.length === 0 ? (
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <CreditCard className="w-8 h-8 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">No Financial Accounts Created</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Add your first Bank Account, Credit/Debit Card, or Cash Wallet to track balances and transactions.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accounts.map((acc) => {
            const isSelected = selectedAccountFilter === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountFilter(isSelected ? null : acc.id)}
                className={`rounded-3xl p-6 bg-gradient-to-br ${acc.colorGradient} border border-white/10 shadow-2xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] group ${
                  isSelected ? 'ring-2 ring-purple-400 shadow-purple-900/40' : ''
                }`}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                    {acc.type}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(acc);
                      }}
                      className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete account ${acc.name}?`)) deleteAccount(acc.id);
                      }}
                      className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-950/80 text-rose-300 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Balance */}
                <div className="mb-6">
                  <div className="text-xs text-zinc-300 font-medium">Available Balance</div>
                  <div className="text-3xl font-extrabold text-white font-financial tracking-tight mt-1">
                    {formatINR(acc.balance)}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-200">
                  <span className="font-bold truncate max-w-[120px]">{acc.name}</span>
                  <span className="font-mono tracking-widest text-[11px] bg-black/20 px-2 py-0.5 rounded">
                    •••• {acc.accountNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Specific Activity */}
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {selectedAccountFilter
                ? `Activity for ${accounts.find((a) => a.id === selectedAccountFilter)?.name}`
                : 'All Accounts Recent Activity'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {selectedAccountFilter ? 'Click card again to show all accounts' : 'Filter by clicking any account card above'}
            </p>
          </div>
          {selectedAccountFilter && (
            <button
              onClick={() => setSelectedAccountFilter(null)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="divide-y divide-zinc-800/60">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">No transactions recorded for this account.</div>
          ) : (
            filteredTransactions.slice(0, 8).map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="py-4 flex items-center justify-between hover:bg-zinc-800/30 px-3 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{tx.title}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium text-[10px]">
                          {tx.category}
                        </span>
                        <span>{tx.accountName || 'Primary Account'}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`text-sm font-extrabold font-financial ${isIncome ? 'text-emerald-400' : 'text-zinc-100'}`}>
                    {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editAccount={editingAccount} />
    </DesktopLayout>
  );
};
