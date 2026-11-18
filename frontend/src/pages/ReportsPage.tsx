import React, { useState, useMemo } from 'react';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';
import {
  generateSpendingLimitReport,
  AnalysisPeriod,
  exportSpendingReportCSV,
  exportSpendingReportPDF
} from '../utils/spendingLimitCalculator';
import { SpendingLimitReportView } from '../components/Reports/SpendingLimitReportView';
import {
  FileSpreadsheet,
  FileText,
  Loader2,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

type OverviewPeriodFilter = 'this-month' | 'last-6-months' | 'year-to-date';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseTxDate = (dateStr: string) => {
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed (0 = Jan)
    const day = parseInt(parts[2], 10);
    return { year, month, day };
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
};

export const ReportsPage: React.FC = () => {
  const { profile } = useAuth();
  const { transactions, budgets, goals } = useFinance();

  const [activeTab, setActiveTab] = useState<'overview' | 'spending-limit'>('spending-limit');
  const [period, setPeriod] = useState<OverviewPeriodFilter>('last-6-months');
  const [spendingLimitPeriod, setSpendingLimitPeriod] = useState<AnalysisPeriod>('6_months');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handlePeriodChange = (newPeriod: OverviewPeriodFilter) => {
    if (period === newPeriod) return;
    setIsUpdating(true);
    setPeriod(newPeriod);
    setTimeout(() => setIsUpdating(false), 200);
  };

  // Generate Spending Limit Report for currently logged-in user ONLY
  const userSpendingReport = useMemo(() => {
    return generateSpendingLimitReport(
      profile || {},
      spendingLimitPeriod,
      transactions,
      budgets,
      goals
    );
  }, [profile, spendingLimitPeriod, transactions, budgets, goals]);

  // Dynamic calculation for Financial Overview based on reportPeriod
  const reportData = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    let filteredTx = transactions;
    let chartData: Array<{ month: string; income: number; expense: number; net: number }> = [];

    if (period === 'this-month') {
      filteredTx = transactions.filter((t) => {
        const { year, month } = parseTxDate(t.date);
        return year === curYear && month === curMonth;
      });

      const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
      const dailyMap: { [day: number]: { income: number; expense: number } } = {};
      for (let d = 1; d <= daysInMonth; d++) {
        dailyMap[d] = { income: 0, expense: 0 };
      }

      filteredTx.forEach((t) => {
        const { day } = parseTxDate(t.date);
        if (dailyMap[day]) {
          if (t.type === 'income') dailyMap[day].income += Number(t.amount);
          if (t.type === 'expense') dailyMap[day].expense += Number(t.amount);
        }
      });

      const monthName = MONTH_NAMES[curMonth];
      chartData = Object.keys(dailyMap).map((dStr) => {
        const d = Number(dStr);
        const inc = dailyMap[d].income;
        const exp = dailyMap[d].expense;
        return {
          month: `${String(d).padStart(2, '0')} ${monthName}`,
          income: inc,
          expense: exp,
          net: inc - exp
        };
      });
    } else if (period === 'last-6-months') {
      const targetMonths: Array<{ year: number; month: number; label: string }> = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(curYear, curMonth - i, 1);
        targetMonths.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
        });
      }

      filteredTx = transactions.filter((t) => {
        const { year, month } = parseTxDate(t.date);
        return targetMonths.some((tm) => tm.year === year && tm.month === month);
      });

      chartData = targetMonths.map((tm) => {
        const monthTxs = transactions.filter((t) => {
          const { year, month } = parseTxDate(t.date);
          return year === tm.year && month === tm.month;
        });

        const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

        return {
          month: tm.label,
          income: inc,
          expense: exp,
          net: inc - exp
        };
      });
    } else if (period === 'year-to-date') {
      const targetMonths: Array<{ year: number; month: number; label: string }> = [];
      for (let m = 0; m <= curMonth; m++) {
        targetMonths.push({
          year: curYear,
          month: m,
          label: `${MONTH_NAMES[m]} ${curYear}`
        });
      }

      filteredTx = transactions.filter((t) => {
        const { year, month } = parseTxDate(t.date);
        return year === curYear && month <= curMonth;
      });

      chartData = targetMonths.map((tm) => {
        const monthTxs = transactions.filter((t) => {
          const { year, month } = parseTxDate(t.date);
          return year === tm.year && month === tm.month;
        });

        const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

        return {
          month: tm.label,
          income: inc,
          expense: exp,
          net: inc - exp
        };
      });
    }

    const totalIncome = filteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = filteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Number(((netCashFlow / totalIncome) * 100).toFixed(1)) : 0;

    return {
      filteredTx,
      chartData,
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate
    };
  }, [period, transactions]);

  // CSV Export utility function
  const exportOverviewCSV = () => {
    const headers = ['ID', 'Date', 'Title', 'Category', 'Account', 'Type', 'Amount (INR)'];
    const rows = reportData.filteredTx.map((t) => [
      t.id,
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.accountName || 'Primary Account',
      t.type,
      t.amount
    ]);

    const periodStr = period === 'this-month' ? 'This_Month' : period === 'last-6-months' ? 'Last_6_Months' : 'Year_To_Date';
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_Manager_Report_${periodStr}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const periodLabelMap: Record<OverviewPeriodFilter, string> = {
    'this-month': 'This Month',
    'last-6-months': 'Last 6 Months',
    'year-to-date': 'Year to Date'
  };

  return (
    <DesktopLayout pageTitle="Reports">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Reports & Spending Limits</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Personalized intelligence report for <strong className="text-white">{profile?.fullName || 'User'}</strong>
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#151518] p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('spending-limit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'spending-limit'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-300" />
            Spending Limit Analysis
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Financial Overview
          </button>
        </div>
      </div>

      {/* TAB 1: SPENDING LIMIT ANALYSIS */}
      {activeTab === 'spending-limit' && (
        <SpendingLimitReportView
          report={userSpendingReport}
          onPeriodChange={(p) => setSpendingLimitPeriod(p)}
          isAdminView={false}
        />
      )}

      {/* TAB 2: FINANCIAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Cash Flow & Variance Analysis</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time analytics for <span className="text-purple-400 font-semibold">{periodLabelMap[period]}</span>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector Buttons */}
              <div className="flex items-center gap-1.5 bg-[#151518] border border-zinc-800 p-1 rounded-xl">
                {(['this-month', 'last-6-months', 'year-to-date'] as OverviewPeriodFilter[]).map((pKey) => {
                  const isActive = period === pKey;
                  return (
                    <button
                      key={pKey}
                      onClick={() => handlePeriodChange(pKey)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 scale-[1.02]'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }`}
                    >
                      {periodLabelMap[pKey]}
                    </button>
                  );
                })}
              </div>

              {/* Export Buttons */}
              <button
                onClick={exportOverviewCSV}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold border border-purple-500/30 transition-colors"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* 4 Dynamic KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Total Cash In</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-financial">{formatINR(reportData.totalIncome)}</div>
              <div className="text-[11px] text-zinc-500 mt-1 font-medium">Income for {periodLabelMap[period]}</div>
            </div>

            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Total Cash Out</div>
              <div className="text-2xl font-extrabold text-rose-400 font-financial">{formatINR(reportData.totalExpenses)}</div>
              <div className="text-[11px] text-zinc-500 mt-1 font-medium">Expenses for {periodLabelMap[period]}</div>
            </div>

            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Net Cash Flow</div>
              <div className={`text-2xl font-extrabold font-financial ${reportData.netCashFlow >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                {formatINR(reportData.netCashFlow)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 font-medium">
                {reportData.netCashFlow >= 0 ? 'Positive liquidity reserve' : 'Net liquidity deficit'}
              </div>
            </div>

            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Savings Rate</div>
              <div className="text-2xl font-extrabold text-white font-financial">{reportData.savingsRate}%</div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">
                {reportData.savingsRate >= 30 ? 'Exceeds 30% safety benchmark' : 'Current period rate'}
              </div>
            </div>
          </div>

          {/* Main Bar Chart */}
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Monthly Cash Flow & Net Savings Trend</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Breakdown of income, expenses, and savings for <span className="text-purple-400 font-semibold">{periodLabelMap[period]}</span>
                </p>
              </div>
              {isUpdating && (
                <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating report...</span>
                </div>
              )}
            </div>

            <div className="h-80 w-full">
              {isUpdating ? (
                <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <span className="text-xs font-semibold">Recalculating financial statement...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [formatINR(Number(val)), '']}
                    />
                    <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Expenses" />
                    <Bar dataKey="net" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Net Savings" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Budget Performance & Variance Analysis Table */}
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight mb-4">Budget Variance Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-[#111113]">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Allocated Budget</th>
                    <th className="py-3 px-4">Actual Spent</th>
                    <th className="py-3 px-4">Variance (Remaining)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {budgets.map((b) => {
                    const variance = b.limitAmount - b.spentAmount;
                    const isExceeded = variance < 0;

                    return (
                      <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{b.category}</td>
                        <td className="py-3.5 px-4 text-zinc-300 font-mono">{formatINR(b.limitAmount)}</td>
                        <td className="py-3.5 px-4 text-zinc-300 font-mono">{formatINR(b.spentAmount)}</td>
                        <td className={`py-3.5 px-4 font-mono font-bold ${isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatINR(variance)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isExceeded ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isExceeded ? 'Exceeded' : 'Within Limit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
};
