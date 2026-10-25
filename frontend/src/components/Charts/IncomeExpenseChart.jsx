import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const IncomeExpenseChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No monthly financial data available yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-800 space-y-1">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize text-slate-400">{entry.name}:</span>
              <span className="font-bold text-white">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            tickFormatter={(value) => `₹${value >= 1000 ? `${value / 1000}k` : value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="#10B981"
            radius={[6, 6, 0, 0]}
            barSize={18}
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill="#F43F5E"
            radius={[6, 6, 0, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
