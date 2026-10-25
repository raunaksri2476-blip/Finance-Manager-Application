import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const TransactionTable = ({ transactions = [], onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
        <p className="text-sm font-medium text-slate-500">No transactions match your search/filter parameters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 lg:px-6">Date</th>
              <th className="py-3.5 px-4 lg:px-6">Description</th>
              <th className="py-3.5 px-4 lg:px-6">Category</th>
              <th className="py-3.5 px-4 lg:px-6">Account</th>
              <th className="py-3.5 px-4 lg:px-6">Type</th>
              <th className="py-3.5 px-4 lg:px-6 text-right">Amount</th>
              <th className="py-3.5 px-4 lg:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {transactions.map((tx) => {
              const isIncome = tx.transactionType === 'Income';
              return (
                <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 lg:px-6 font-medium text-slate-600 whitespace-nowrap">
                    {formatDate(tx.transactionDate)}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 font-bold text-slate-900 max-w-xs truncate">
                    {tx.description || 'No Description'}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700 text-[11px]">
                      {tx.categoryID?.categoryName || 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 font-medium text-slate-600 whitespace-nowrap">
                    {tx.accountID?.accountName || 'Account'}
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 text-right font-extrabold whitespace-nowrap text-sm">
                    <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 lg:px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit transaction"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        title="Delete transaction"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
