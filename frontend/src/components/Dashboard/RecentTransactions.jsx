import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const RecentTransactions = ({ transactions = [] }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">Your latest financial activity</p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No recent transactions found.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isIncome = tx.transactionType === 'Income';
            return (
              <div key={tx._id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {tx.description || tx.categoryID?.categoryName || 'Transaction'}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {tx.accountID?.accountName || 'Account'} • {formatDate(tx.transactionDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
