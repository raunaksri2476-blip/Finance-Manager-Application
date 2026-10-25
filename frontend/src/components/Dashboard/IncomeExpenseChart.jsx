import React from 'react';
import IncomeExpenseChartComponent from '../Charts/IncomeExpenseChart';

const IncomeExpenseChartWidget = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Income vs Expenses</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly comparison of total inflow and outflow</p>
        </div>
      </div>
      <IncomeExpenseChartComponent data={data} />
    </div>
  );
};

export default IncomeExpenseChartWidget;
