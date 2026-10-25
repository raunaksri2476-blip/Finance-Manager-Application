import React from 'react';
import { CreditCard, Wallet, Landmark, PiggyBank, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const AccountCard = ({ account, onEdit, onDelete, onView }) => {
  const getAccountIcon = (type) => {
    switch (type) {
      case 'Savings Account':
        return PiggyBank;
      case 'Cash':
        return Wallet;
      case 'Credit Card':
        return CreditCard;
      default:
        return Landmark;
    }
  };

  const Icon = getAccountIcon(account.accountType);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{account.accountName}</h3>
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full mt-0.5">
              {account.accountType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onView && (
            <button
              onClick={() => onView(account)}
              title="View details"
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(account)}
            title="Edit account"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(account)}
            title="Delete account"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
          Balance
        </p>
        <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(account.balance)}
        </h4>
        {account.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-1">{account.description}</p>
        )}
      </div>
    </div>
  );
};

export default AccountCard;
