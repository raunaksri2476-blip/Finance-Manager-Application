import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#8B5CF6',
  Shopping: '#3B82F6',
  Bills: '#F59E0B',
  Transport: '#06B6D4',
  Entertainment: '#EC4899',
  Education: '#10B981',
  Healthcare: '#10B981',
  Utilities: '#6366F1',
  Other: '#64748B'
};

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ transactions }) => {
  // Dynamically calculate last 6 months income & expense from actual transactions
  const monthlyData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const monthMap: Record<string, { month: string; income: number; expenses: number; timestamp: number }> = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          month: monthLabel,
          income: 0,
          expenses: 0,
          timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime()
        };
      }

      if (tx.type === 'income') {
        monthMap[monthKey].income += Number(tx.amount);
      } else if (tx.type === 'expense') {
        monthMap[monthKey].expenses += Number(tx.amount);
      }
    });

    const sorted = Object.values(monthMap).sort((a, b) => a.timestamp - b.timestamp);
    return sorted.slice(-6); // last 6 months
  }, [transactions]);

  const hasData = monthlyData.length > 0;

  return (
    <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Income vs Expenses</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Your financial activity over the last 6 months.</p>
        </div>
        {hasData && (
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-zinc-300">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="text-zinc-300">Expenses</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-72 w-full flex items-center justify-center">
        {!hasData ? (
          <div className="text-center text-xs text-zinc-500 py-12">
            No transaction history available yet for chart rendering.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [formatINR(Number(value)), '']}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#incomeGrad)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#expenseGrad)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export const ExpenseBreakdownChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  // Aggregate expense transactions dynamically by category
  const pieData = useMemo(() => {
    const expenseMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + Number(t.amount);
      });

    return Object.keys(expenseMap).map((cat) => ({
      name: cat,
      value: expenseMap[cat],
      color: CATEGORY_COLORS[cat] || '#64748B'
    }));
  }, [transactions]);

  const totalExpense = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Where your money goes</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Calculated dynamically from transactions</p>
        </div>
      </div>

      <div className="h-56 relative flex items-center justify-center">
        {pieData.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center">No expense transactions yet.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#151518" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Total Spent</span>
              <span className="text-sm font-extrabold text-white font-sans">{formatINR(totalExpense, false)}</span>
            </div>
          </>
        )}
      </div>

      {/* Category Legend with percentage split */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-800/80">
        {pieData.slice(0, 6).map((item) => {
          const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-300 truncate font-medium">{item.name}</span>
              </div>
              <span className="text-zinc-400 font-bold">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
