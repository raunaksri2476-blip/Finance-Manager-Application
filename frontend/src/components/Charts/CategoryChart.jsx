import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#10B981', '#14B8A6', '#6B7280'];

const CategoryChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No category expenses recorded yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-slate-300">{name}:</span>
          <span className="font-bold text-white">{formatCurrency(value)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingLeft: 10 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
