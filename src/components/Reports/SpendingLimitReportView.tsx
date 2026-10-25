import React, { useState } from 'react';
import {
  SpendingLimitReport,
  AnalysisPeriod,
  exportSpendingReportCSV,
  exportSpendingReportPDF
} from '../../utils/spendingLimitCalculator';
import { formatINR } from '../../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Zap,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Props {
  report: SpendingLimitReport;
  onPeriodChange?: (period: AnalysisPeriod) => void;
  isAdminView?: boolean;
}

export const SpendingLimitReportView: React.FC<Props> = ({
  report,
  onPeriodChange,
  isAdminView = false
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(true);

  const getStatusBadge = () => {
    if (report.limitStatus === 'within') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>✓ Within Recommended Limit</span>
        </div>
      );
    }
    if (report.limitStatus === 'near') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-extrabold shadow-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>⚠ Near Recommended Limit</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-extrabold shadow-sm">
        <AlertOctagon className="w-4 h-4" />
        <span>🔴 Above Recommended Limit</span>
      </div>
    );
  };

  const getHealthBadgeColor = (indicator: string) => {
    switch (indicator) {
      case 'Excellent':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Healthy':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Moderate':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Needs Attention':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Top Banner & Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#151518] border border-zinc-800/90 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> Spending Limit & Health
            </span>
            {isAdminView && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                Admin Audit Mode
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1.5">
            {isAdminView ? `Spending Limit Analysis — ${report.userName}` : 'Your Monthly Spending Limit Analysis'}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Target User: <strong className="text-white">{report.userName}</strong> ({report.userEmail}) • Period:{' '}
            <span className="text-purple-400 font-semibold">{report.periodLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector Dropdown */}
          {onPeriodChange && (
            <div className="flex items-center gap-1 bg-[#09090b] border border-zinc-800 p-1 rounded-xl text-xs font-semibold">
              {(
                [
                  { id: 'this_month', label: 'This Month' },
                  { id: '3_months', label: '3 Months' },
                  { id: '6_months', label: '6 Months' },
                  { id: '12_months', label: '12 Months' },
                  { id: 'ytd', label: 'YTD' }
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    report.period === p.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40 font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Export Buttons */}
          <button
            onClick={() => exportSpendingReportCSV(report)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700/80 transition-all hover:scale-[1.02]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportSpendingReportPDF(report)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold border border-purple-500/30 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* CORE SPENDING LIMIT CARD */}
      <div className="bg-gradient-to-br from-[#181524] via-[#151518] to-[#0c0c0e] border border-purple-500/30 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Main Limit Box */}
          <div className="space-y-3 lg:col-span-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Recommended Monthly Spending Limit
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="text-4xl lg:text-5xl font-extrabold text-white font-financial tracking-tight">
                {formatINR(report.recommendedLimit)}
              </div>
              {getStatusBadge()}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Calculated dynamically using real monthly income ({formatINR(report.monthlyIncome)}), essential expenses (
              {formatINR(report.essentialExpenses)}), and a recommended 20% savings buffer ({formatINR(report.recommendedSavings)}).
            </p>

            {/* Current vs Remaining Progress */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-300">
                  Current Month Spent: <strong className="text-white">{formatINR(report.currentSpending)}</strong>
                </span>
                <span className={report.remainingLimit >= 0 ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'}>
                  {report.remainingLimit >= 0 ? `Remaining: ${formatINR(report.remainingLimit)}` : `Over Limit: ${formatINR(Math.abs(report.remainingLimit))}`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    report.limitStatus === 'within'
                      ? 'bg-gradient-to-r from-purple-600 to-emerald-500'
                      : report.limitStatus === 'near'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-rose-600 to-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((report.currentSpending / (report.recommendedLimit || 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Allowance Box */}
          <div className="bg-[#09090b]/80 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Approximate Daily Allowance</div>

            <div className="text-3xl font-extrabold text-emerald-400 font-financial">
              {formatINR(report.dailyAllowance)} <span className="text-xs text-zinc-400 font-normal">/ day</span>
            </div>

            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>{report.daysRemainingInMonth} days remaining in current month</span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-[10px] text-purple-200">
              💡 Staying under <strong>{formatINR(report.dailyAllowance)}/day</strong> keeps you on track to meet your savings goals.
            </div>
          </div>
        </div>
      </div>

      {/* TRANSPARENT CALCULATION EXPLANATION COLLAPSIBLE */}
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">How This Recommendation Was Calculated</h3>
              <p className="text-xs text-zinc-400">Step-by-step formula transparency based on your actual data</p>
            </div>
          </div>

          <button className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors">
            {showFormulaDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showFormulaDetails && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80 space-y-1">
              <div className="text-[10px] text-purple-400 font-sans font-bold uppercase">1. Monthly Income Baseline</div>
              <div className="text-white font-bold">{report.calculationDetails.incomeFormula}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80 space-y-1">
              <div className="text-[10px] text-purple-400 font-sans font-bold uppercase">2. Essential Expenses (Fixed Needs)</div>
              <div className="text-white font-bold">{report.calculationDetails.essentialFormula}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80 space-y-1">
              <div className="text-[10px] text-purple-400 font-sans font-bold uppercase">3. Recommended Savings Target (20%)</div>
              <div className="text-white font-bold">{report.calculationDetails.savingsFormula}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80 space-y-1">
              <div className="text-[10px] text-purple-400 font-sans font-bold uppercase">4. Discretionary Spending Capacity</div>
              <div className="text-white font-bold">{report.calculationDetails.discretionaryFormula}</div>
            </div>

            <div className="md:col-span-2 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-200 font-sans space-y-1">
              <div className="text-xs font-extrabold text-purple-300">Final Recommendation Formula:</div>
              <div className="text-sm font-bold font-mono text-white">{report.calculationDetails.limitFormula}</div>
            </div>
          </div>
        )}
      </div>

      {/* FINANCIAL HEALTH INDICATOR & SAVINGS METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Box */}
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-2">Financial Health Indicator</div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getHealthBadgeColor(report.financialHealth.indicator)}`}>
                {report.financialHealth.indicator}
              </span>
              <span className="text-xs font-bold text-zinc-300 font-mono">Score: {report.financialHealth.score}/100</span>
            </div>
            <p className="text-xs text-zinc-400 mt-3">{report.financialHealth.description}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2 text-xs">
            {report.financialHealth.positiveNotes.map((note, idx) => (
              <div key={idx} className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{note}</span>
              </div>
            ))}
            {report.financialHealth.warnings.map((warn, idx) => (
              <div key={idx} className="flex items-center gap-2 text-rose-400 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Financial Totals Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Avg Monthly Income</div>
            <div className="text-2xl font-extrabold text-emerald-400 font-financial mt-1">{formatINR(report.monthlyIncome)}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Based on {report.periodLabel}</div>
          </div>

          <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Avg Monthly Expenses</div>
            <div className="text-2xl font-extrabold text-rose-400 font-financial mt-1">{formatINR(report.monthlyExpenses)}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Average monthly debit</div>
          </div>

          <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Net Monthly Savings</div>
            <div className={`text-2xl font-extrabold font-financial mt-1 ${report.netSavings >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
              {formatINR(report.netSavings)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Income minus Expenses</div>
          </div>

          <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Savings Rate</div>
            <div className="text-2xl font-extrabold text-white font-financial mt-1">{report.savingsRate}%</div>
            <div className={`text-[11px] font-bold mt-1 ${report.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {report.savingsRate >= 20 ? '✓ Exceeds 20% Target' : 'Below 20% Target'}
            </div>
          </div>
        </div>
      </div>

      {/* SPENDING TREND & BUDGET ANALYSIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Box */}
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Monthly Spending Trend
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Average Monthly</div>
              <div className="text-base font-bold text-white mt-0.5">{formatINR(report.spendingTrend.averageMonthlySpending)}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Current Month</div>
              <div className="text-base font-bold text-purple-300 mt-0.5">{formatINR(report.spendingTrend.currentMonthSpending)}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Highest Month ({report.spendingTrend.highestSpendingMonth.month})</div>
              <div className="text-base font-bold text-rose-400 mt-0.5">{formatINR(report.spendingTrend.highestSpendingMonth.amount)}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Lowest Month ({report.spendingTrend.lowestSpendingMonth.month})</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{formatINR(report.spendingTrend.lowestSpendingMonth.amount)}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Current Month Trend vs Average:</span>
            <span
              className={`font-extrabold flex items-center gap-1 ${
                report.spendingTrend.trendDirection === 'up'
                  ? 'text-rose-400'
                  : report.spendingTrend.trendDirection === 'down'
                  ? 'text-emerald-400'
                  : 'text-zinc-300'
              }`}
            >
              {report.spendingTrend.trendDirection === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownLeft className="w-4 h-4" />
              )}
              {Math.abs(report.spendingTrend.trendPercentage)}% {report.spendingTrend.trendDirection === 'up' ? 'above average' : 'below average'}
            </span>
          </div>
        </div>

        {/* Budget Analysis Box */}
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" /> Budget System Utilization
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Total Budget Limit</div>
              <div className="text-base font-bold text-white mt-0.5">{formatINR(report.budgetAnalysis.totalBudget)}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Total Spent</div>
              <div className="text-base font-bold text-purple-300 mt-0.5">{formatINR(report.budgetAnalysis.totalSpent)}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Budget Remaining</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{formatINR(report.budgetAnalysis.budgetRemaining)}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Utilization Rate</div>
              <div className="text-base font-bold text-white mt-0.5">{report.budgetAnalysis.utilizationPercentage}%</div>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs font-bold text-zinc-300">
              <span>Overall Utilization</span>
              <span>{report.budgetAnalysis.utilizationPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className={`h-full rounded-full ${
                  report.budgetAnalysis.utilizationPercentage > 100
                    ? 'bg-rose-500'
                    : report.budgetAnalysis.utilizationPercentage > 85
                    ? 'bg-amber-500'
                    : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, report.budgetAnalysis.utilizationPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN TABLE */}
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Category Spending Breakdown</h3>

        {report.categoryBreakdown.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No expense category data found for this period.</div>
        ) : (
          <div className="space-y-3">
            {report.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-300 font-mono">{formatINR(cat.amount)}</span>
                    <span className="text-zinc-500 font-mono w-12 text-right">{cat.percentage}%</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
