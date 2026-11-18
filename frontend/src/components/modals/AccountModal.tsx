import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Account } from '../../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

const GRADIENTS = [
  { name: 'Purple Indigo', value: 'from-purple-600 via-indigo-700 to-slate-900' },
  { name: 'Ocean Cyan', value: 'from-blue-600 via-cyan-700 to-slate-900' },
  { name: 'Emerald Forest', value: 'from-emerald-600 via-teal-700 to-slate-900' },
  { name: 'Rose Sunset', value: 'from-rose-600 via-orange-700 to-slate-900' },
  { name: 'Midnight Violet', value: 'from-violet-800 via-purple-900 to-slate-950' },
];

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, editAccount }) => {
  const { addAccount, updateAccount } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<'savings' | 'checking' | 'credit' | 'cash' | 'investment'>('savings');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setBalance(editAccount.balance.toString());
      setAccountNumber(editAccount.accountNumber);
      setBankName(editAccount.bankName || '');
      setGradient(editAccount.colorGradient);
    } else {
      setName('');
      setType('savings');
      setBalance('');
      setAccountNumber('');
      setBankName('');
      setGradient(GRADIENTS[0].value);
    }
    setError('');
    setIsSubmitting(false);
  }, [editAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter account name');
      return;
    }
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      setError('Please enter a valid initial balance');
      return;
    }

    const finalAccNum = accountNumber.trim() || '0000';

    try {
      setIsSubmitting(true);
      if (editAccount) {
        await updateAccount(editAccount.id, {
          name: name.trim(),
          type,
          balance: numBalance,
          accountNumber: finalAccNum,
          bankName: bankName.trim(),
          colorGradient: gradient
        });
      } else {
        await addAccount({
          name: name.trim(),
          type,
          balance: numBalance,
          accountNumber: finalAccNum,
          bankName: bankName.trim() || (type === 'credit' ? 'Credit Card' : 'Bank Account'),
          colorGradient: gradient,
          isPrimary: false,
          isConnected: false,
          syncStatus: 'manual'
        });
      }
      onClose();
    } catch (err: any) {
      console.error('Submit account error:', err);
      setError(err?.message || 'Failed to save account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {editAccount ? 'Edit Account' : 'Add Financial Account'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your bank accounts, credit/debit cards, or cash balances.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACCOUNT ENTRY FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Account / Card Name</label>
            <input
              type="text"
              placeholder="e.g. HDFC Savings, ICICI Credit Card, Cash Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="savings">Savings</option>
                <option value="checking">Bank Account</option>
                <option value="cash">Cash Wallet</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Initial Balance (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-sans font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Last 4 Digits / Mask (Optional)</label>
              <input
                type="text"
                maxLength={8}
                placeholder="5087"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Bank / Institution</label>
              <input
                type="text"
                placeholder="HDFC Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Card Gradient Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Card Style Gradient</label>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  type="button"
                  key={g.name}
                  onClick={() => setGradient(g.value)}
                  className={`h-10 rounded-xl bg-gradient-to-tr ${g.value} border-2 transition-all ${
                    gradient === g.value ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-80'
                  }`}
                  title={g.name}
                />
              ))}
            </div>
          </div>

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
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500 hover:scale-[1.02] cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Saving Account...' : (editAccount ? 'Update Account' : 'Save Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
