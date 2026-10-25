import { Transaction, Budget, Goal, UserProfile } from '../types';
import { formatINR } from './formatters';

export type AnalysisPeriod = 'this_month' | '3_months' | '6_months' | '12_months' | 'ytd';

export type SpendingLimitStatus = 'within' | 'near' | 'above';

export type FinancialHealthRating = 'Excellent' | 'Healthy' | 'Moderate' | 'Needs Attention' | 'High Spending Risk';

export interface SpendingLimitReport {
  userId: string;
  userName: string;
  userEmail: string;
  period: AnalysisPeriod;
  periodLabel: string;
  startDate: string;
  endDate: string;
  
  // Financial Totals in Period
  monthlyIncome: number;
  monthlyExpenses: number;
  averageMonthlyExpenses: number;
  essentialExpenses: number;
  recommendedSavings: number;
  discretionaryCapacity: number;
  recommendedLimit: number;
  currentSpending: number; // Spending in current month
  remainingLimit: number;
  limitStatus: SpendingLimitStatus;
  
  // Daily Allowance
  dailyAllowance: number;
  daysRemainingInMonth: number;
  
  // Savings Metrics
  netSavings: number;
  savingsRate: number;
  
  // Breakdown & Analysis
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  
  budgetAnalysis: {
    totalBudget: number;
    totalSpent: number;
    budgetRemaining: number;
    utilizationPercentage: number;
  };
  
  spendingTrend: {
    averageMonthlySpending: number;
    currentMonthSpending: number;
    previousMonthSpending: number;
    highestSpendingMonth: { month: string; amount: number };
    lowestSpendingMonth: { month: string; amount: number };
    trendPercentage: number;
    trendDirection: 'up' | 'down' | 'neutral';
  };
  
  financialHealth: {
    indicator: FinancialHealthRating;
    score: number;
    description: string;
    warnings: string[];
    positiveNotes: string[];
  };
  
  calculationDetails: {
    incomeFormula: string;
    essentialFormula: string;
    savingsFormula: string;
    discretionaryFormula: string;
    limitFormula: string;
  };
  
  generatedAt: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseTxDate = (dateStr: string) => {
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    return { year, month, day };
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
};

// Essential spending categories
const ESSENTIAL_CATEGORIES = new Set([
  'bills', 'food', 'healthcare', 'rent', 'housing', 'utilities', 'groceries', 'transport'
]);

export function generateSpendingLimitReport(
  userProfile: Partial<UserProfile>,
  period: AnalysisPeriod = '6_months',
  transactions: Transaction[] = [],
  budgets: Budget[] = [],
  goals: Goal[] = []
): SpendingLimitReport {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  // Determine period label & number of months
  let numMonths = 6;
  let periodLabel = 'Last 6 Months';

  if (period === 'this_month') {
    numMonths = 1;
    periodLabel = 'This Month';
  } else if (period === '3_months') {
    numMonths = 3;
    periodLabel = 'Last 3 Months';
  } else if (period === '6_months') {
    numMonths = 6;
    periodLabel = 'Last 6 Months';
  } else if (period === '12_months') {
    numMonths = 12;
    periodLabel = 'Last 12 Months';
  } else if (period === 'ytd') {
    numMonths = curMonth + 1;
    periodLabel = 'Year to Date';
  }

  // Filter target month list
  const targetMonths: Array<{ year: number; month: number; label: string }> = [];
  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(curYear, curMonth - i, 1);
    targetMonths.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
    });
  }

  // Filter transactions within target months
  const filteredTx = transactions.filter((t) => {
    const { year, month } = parseTxDate(t.date);
    return targetMonths.some((tm) => tm.year === year && tm.month === month);
  });

  // Income & Expense totals for period
  const totalIncome = filteredTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyIncome = Math.round(totalIncome / Math.max(1, numMonths));
  const monthlyExpenses = Math.round(totalExpenses / Math.max(1, numMonths));
  const averageMonthlyExpenses = monthlyExpenses;

  // Monthly breakdown for trend
  const monthData = targetMonths.map((tm) => {
    const monthTxs = transactions.filter((t) => {
      const { year, month } = parseTxDate(t.date);
      return year === tm.year && month === tm.month;
    });

    const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);

    return {
      month: tm.label,
      year: tm.year,
      monthIndex: tm.month,
      expense: exp,
      income: inc
    };
  });

  // Current month spending
  const currentMonthEntry = monthData.find((m) => m.year === curYear && m.monthIndex === curMonth);
  const currentSpending = currentMonthEntry ? currentMonthEntry.expense : 0;

  // Previous month spending
  const prevMonthIndex = curMonth === 0 ? 11 : curMonth - 1;
  const prevMonthYear = curMonth === 0 ? curYear - 1 : curYear;
  const prevMonthEntry = monthData.find((m) => m.year === prevMonthYear && m.monthIndex === prevMonthIndex);
  const previousMonthSpending = prevMonthEntry ? prevMonthEntry.expense : 0;

  // Highest and lowest spending months
  let highestMonth = { month: targetMonths[0]?.label || 'Current', amount: 0 };
  let lowestMonth = { month: targetMonths[0]?.label || 'Current', amount: Infinity };

  monthData.forEach((m) => {
    if (m.expense > highestMonth.amount) {
      highestMonth = { month: m.month, amount: m.expense };
    }
    if (m.expense < lowestMonth.amount) {
      lowestMonth = { month: m.month, amount: m.expense };
    }
  });

  if (lowestMonth.amount === Infinity) lowestMonth.amount = 0;

  // Essential Expenses calculation (Essential category items or ~55% of total expenses)
  const essentialTxTotal = filteredTx
    .filter((t) => t.type === 'expense' && ESSENTIAL_CATEGORIES.has(t.category.toLowerCase()))
    .reduce((s, t) => s + Number(t.amount), 0);

  const calculatedEssential = Math.round(essentialTxTotal / Math.max(1, numMonths));
  const essentialExpenses = calculatedEssential > 0 ? calculatedEssential : Math.round(averageMonthlyExpenses * 0.55);

  // Recommended Savings (20% of monthly income, or minimum 15% of income)
  const recommendedSavings = Math.round(monthlyIncome * 0.20);

  // Discretionary Spending Capacity = Monthly Income - Essential Expenses - Recommended Savings
  const discretionaryCapacity = Math.max(0, monthlyIncome - essentialExpenses - recommendedSavings);

  // Recommended Monthly Spending Limit = Essential Expenses + Discretionary Capacity
  // (Which equals Monthly Income - Recommended Savings, or 80% of Income)
  const recommendedLimit = monthlyIncome > 0
    ? Math.max(essentialExpenses, Math.round(monthlyIncome * 0.80))
    : Math.max(15000, averageMonthlyExpenses + 5000);

  // Remaining spending allowance for current month
  const remainingLimit = recommendedLimit - currentSpending;

  // Status check
  let limitStatus: SpendingLimitStatus = 'within';
  const ratio = currentSpending / (recommendedLimit || 1);
  if (ratio > 1.0) {
    limitStatus = 'above';
  } else if (ratio >= 0.85) {
    limitStatus = 'near';
  } else {
    limitStatus = 'within';
  }

  // Days remaining in current calendar month
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemainingInMonth = Math.max(1, daysInMonth - currentDay + 1);

  // Approximate Daily Allowance
  const dailyAllowance = Math.max(0, Math.round(remainingLimit / daysRemainingInMonth));

  // Net Savings & Savings Rate
  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Number(((netSavings / monthlyIncome) * 100).toFixed(1)) : 0;

  // Category Breakdown
  const categoryMap: Record<string, number> = {};
  filteredTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
    });

  const categoryBreakdown = Object.keys(categoryMap)
    .map((cat) => {
      const amt = categoryMap[cat];
      const pct = totalExpenses > 0 ? Number(((amt / totalExpenses) * 100).toFixed(1)) : 0;
      return { category: cat, amount: amt, percentage: pct };
    })
    .sort((a, b) => b.amount - a.amount);

  // Budget Analysis
  const totalBudget = budgets.reduce((s, b) => s + Number(b.limitAmount), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spentAmount), 0);
  const budgetRemaining = totalBudget - totalSpent;
  const utilizationPercentage = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

  // Spending Trend percentage vs average
  const trendDiff = currentSpending - averageMonthlyExpenses;
  const trendPercentage = averageMonthlyExpenses > 0 ? Number(((trendDiff / averageMonthlyExpenses) * 100).toFixed(1)) : 0;
  const trendDirection: 'up' | 'down' | 'neutral' = trendPercentage > 2 ? 'up' : trendPercentage < -2 ? 'down' : 'neutral';

  // Financial Health Indicator & Score (0-100)
  let healthScore = 70;
  const warnings: string[] = [];
  const positiveNotes: string[] = [];

  if (savingsRate >= 25) {
    healthScore += 15;
    positiveNotes.push(`Strong savings rate of ${savingsRate}% exceeds the recommended 20% benchmark.`);
  } else if (savingsRate >= 15) {
    healthScore += 5;
    positiveNotes.push(`Healthy savings rate of ${savingsRate}%.`);
  } else if (savingsRate < 0) {
    healthScore -= 20;
    warnings.push(`Monthly expenses exceed income (Negative net savings of ${formatINR(Math.abs(netSavings))}).`);
  } else {
    healthScore -= 10;
    warnings.push(`Low savings rate of ${savingsRate}% is below the 20% target.`);
  }

  if (limitStatus === 'within') {
    healthScore += 10;
    positiveNotes.push(`Current spending is well within your recommended limit.`);
  } else if (limitStatus === 'near') {
    healthScore -= 5;
    warnings.push(`You have utilized ${Math.round(ratio * 100)}% of your monthly spending limit.`);
  } else {
    healthScore -= 20;
    warnings.push(`Current spending (${formatINR(currentSpending)}) has exceeded your limit of ${formatINR(recommendedLimit)}.`);
  }

  if (utilizationPercentage > 100) {
    healthScore -= 10;
    warnings.push(`Budget utilization is at ${utilizationPercentage}%, indicating overspending in budget categories.`);
  } else if (utilizationPercentage > 0 && utilizationPercentage <= 85) {
    healthScore += 5;
    positiveNotes.push(`Budget utilization is controlled at ${utilizationPercentage}%.`);
  }

  healthScore = Math.max(10, Math.min(100, healthScore));

  let indicator: FinancialHealthRating = 'Healthy';
  if (healthScore >= 85) indicator = 'Excellent';
  else if (healthScore >= 70) indicator = 'Healthy';
  else if (healthScore >= 50) indicator = 'Moderate';
  else if (healthScore >= 35) indicator = 'Needs Attention';
  else indicator = 'High Spending Risk';

  // Calculation Details Text for Transparency
  const calculationDetails = {
    incomeFormula: `Average Monthly Income = Total Income (${formatINR(totalIncome)}) ÷ ${numMonths} Months = ${formatINR(monthlyIncome)}`,
    essentialFormula: `Essential Expenses = Fixed & Vital Categories (Food, Bills, Healthcare, Transport) = ${formatINR(essentialExpenses)}/mo`,
    savingsFormula: `Recommended Savings = 20% of Monthly Income = ${formatINR(recommendedSavings)}/mo`,
    discretionaryFormula: `Discretionary Spending Capacity = Income (${formatINR(monthlyIncome)}) - Essential (${formatINR(essentialExpenses)}) - Savings (${formatINR(recommendedSavings)}) = ${formatINR(discretionaryCapacity)}`,
    limitFormula: `Recommended Monthly Spending Limit = Essential (${formatINR(essentialExpenses)}) + Discretionary (${formatINR(discretionaryCapacity)}) = ${formatINR(recommendedLimit)}`
  };

  return {
    userId: userProfile.id || 'user-unknown',
    userName: userProfile.fullName || 'Valued User',
    userEmail: userProfile.email || 'user@financemanager.io',
    period,
    periodLabel,
    startDate: targetMonths[0]?.label || '',
    endDate: targetMonths[targetMonths.length - 1]?.label || '',
    monthlyIncome,
    monthlyExpenses,
    averageMonthlyExpenses,
    essentialExpenses,
    recommendedSavings,
    discretionaryCapacity,
    recommendedLimit,
    currentSpending,
    remainingLimit,
    limitStatus,
    dailyAllowance,
    daysRemainingInMonth,
    netSavings,
    savingsRate,
    categoryBreakdown,
    budgetAnalysis: {
      totalBudget,
      totalSpent,
      budgetRemaining,
      utilizationPercentage
    },
    spendingTrend: {
      averageMonthlySpending: averageMonthlyExpenses,
      currentMonthSpending: currentSpending,
      previousMonthSpending,
      highestSpendingMonth: highestMonth,
      lowestSpendingMonth: lowestMonth,
      trendPercentage,
      trendDirection
    },
    financialHealth: {
      indicator,
      score: healthScore,
      description: `Based on your ${savingsRate}% savings rate, spending trends, and budget utilization.`,
      warnings,
      positiveNotes
    },
    calculationDetails,
    generatedAt: new Date().toLocaleString()
  };
}

// CSV Export Utility for Spending Limit Report
export function exportSpendingReportCSV(report: SpendingLimitReport) {
  const lines: string[] = [];
  lines.push('FINANCE MANAGER — SPENDING LIMIT & FINANCIAL HEALTH REPORT');
  lines.push(`User Name,${report.userName}`);
  lines.push(`User Email,${report.userEmail}`);
  lines.push(`Analysis Period,${report.periodLabel}`);
  lines.push(`Generated Date,${report.generatedAt}`);
  lines.push('');

  lines.push('SPENDING LIMIT SUMMARY');
  lines.push(`Recommended Monthly Spending Limit,INR ${report.recommendedLimit}`);
  lines.push(`Current Month Spending,INR ${report.currentSpending}`);
  lines.push(`Remaining Allowance,INR ${report.remainingLimit}`);
  lines.push(`Status,${report.limitStatus.toUpperCase()}`);
  lines.push(`Approximate Daily Allowance,INR ${report.dailyAllowance}/day (${report.daysRemainingInMonth} days remaining)`);
  lines.push('');

  lines.push('FINANCIAL ANALYSIS');
  lines.push(`Monthly Income,INR ${report.monthlyIncome}`);
  lines.push(`Monthly Expenses,INR ${report.monthlyExpenses}`);
  lines.push(`Net Savings,INR ${report.netSavings}`);
  lines.push(`Savings Rate,${report.savingsRate}%`);
  lines.push(`Financial Health Indicator,${report.financialHealth.indicator} (${report.financialHealth.score}/100)`);
  lines.push('');

  lines.push('CALCULATION FORMULA BREAKDOWN');
  lines.push(`Monthly Income,${report.calculationDetails.incomeFormula}`);
  lines.push(`Essential Expenses,${report.calculationDetails.essentialFormula}`);
  lines.push(`Recommended Savings,${report.calculationDetails.savingsFormula}`);
  lines.push(`Discretionary Capacity,${report.calculationDetails.discretionaryFormula}`);
  lines.push(`Recommended Limit Formula,${report.calculationDetails.limitFormula}`);
  lines.push('');

  lines.push('CATEGORY BREAKDOWN');
  lines.push('Category,Amount (INR),Percentage (%)');
  report.categoryBreakdown.forEach((cat) => {
    lines.push(`"${cat.category.replace(/"/g, '""')}",${cat.amount},${cat.percentage}%`);
  });
  lines.push('');

  lines.push('BUDGET PERFORMANCE');
  lines.push(`Total Budget Allocated,INR ${report.budgetAnalysis.totalBudget}`);
  lines.push(`Total Budget Spent,INR ${report.budgetAnalysis.totalSpent}`);
  lines.push(`Budget Remaining,INR ${report.budgetAnalysis.budgetRemaining}`);
  lines.push(`Utilization Rate,${report.budgetAnalysis.utilizationPercentage}%`);

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `Spending_Limit_Report_${report.userName.replace(/\s+/g, '_')}_${report.period}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PDF Export Utility for Spending Limit Report
export function exportSpendingReportPDF(report: SpendingLimitReport) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export the PDF report.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Spending Limit Analysis - ${report.userName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; margin: 0; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #27272a; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 20px; font-weight: 800; color: #a855f7; }
        .sub { font-size: 12px; color: #a1a1aa; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; }
        .title { font-size: 11px; text-transform: uppercase; color: #a1a1aa; font-weight: 700; margin-bottom: 8px; }
        .val { font-size: 24px; font-weight: 800; color: #ffffff; }
        .val-purple { font-size: 28px; font-weight: 800; color: #c084fc; }
        .val-green { color: #4ade80; }
        .val-red { color: #f87171; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 10px; }
        .badge-green { background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }
        .badge-amber { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
        .badge-red { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }
        .section { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { text-align: left; font-size: 11px; text-transform: uppercase; color: #a1a1aa; border-b: 1px solid #27272a; padding: 10px; }
        td { font-size: 13px; border-b: 1px solid #27272a; padding: 10px; color: #e4e4e7; }
        .footer { font-size: 11px; text-align: center; color: #71717a; margin-top: 40px; border-t: 1px solid #27272a; padding-top: 20px; }
        @media print {
          body { background: #ffffff; color: #000000; padding: 20px; }
          .card, .section { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
          .val, .section-title { color: #0f172a; }
          .val-purple { color: #7e22ce; }
          .sub, .title, th { color: #475569; }
          td { color: #1e293b; border-color: #e2e8f0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">FINANCE MANAGER</div>
          <div class="sub">Spending Limit & Financial Health Analysis</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 700; color: #fff;">${report.userName}</div>
          <div class="sub">${report.userEmail} • ${report.periodLabel}</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="title">Recommended Monthly Spending Limit</div>
          <div class="val-purple">${formatINR(report.recommendedLimit)}</div>
          <div class="badge ${report.limitStatus === 'within' ? 'badge-green' : report.limitStatus === 'near' ? 'badge-amber' : 'badge-red'}">
            ${report.limitStatus === 'within' ? '✓ Within Limit' : report.limitStatus === 'near' ? '⚠ Near Limit' : '🔴 Above Limit'}
          </div>
        </div>

        <div class="card">
          <div class="title">Current Spending (${report.periodLabel})</div>
          <div class="val">${formatINR(report.currentSpending)}</div>
          <div class="sub" style="margin-top: 8px;">Remaining: <strong>${formatINR(report.remainingLimit)}</strong></div>
        </div>

        <div class="card">
          <div class="title">Approximate Daily Allowance</div>
          <div class="val val-green">${formatINR(report.dailyAllowance)}/day</div>
          <div class="sub" style="margin-top: 8px;">${report.daysRemainingInMonth} days remaining in month</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Transparent Calculation Breakdown</div>
        <div style="font-size: 12px; line-height: 1.8; color: #a1a1aa;">
          <div>• <strong>Monthly Income:</strong> ${report.calculationDetails.incomeFormula}</div>
          <div>• <strong>Essential Expenses:</strong> ${report.calculationDetails.essentialFormula}</div>
          <div>• <strong>Recommended Savings (20%):</strong> ${report.calculationDetails.savingsFormula}</div>
          <div>• <strong>Discretionary Capacity:</strong> ${report.calculationDetails.discretionaryFormula}</div>
          <div style="margin-top: 8px; font-weight: 700; color: #c084fc;">• <strong>Result:</strong> ${report.calculationDetails.limitFormula}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Financial Health Summary</div>
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
          <div style="font-size: 20px; font-weight: 800; color: #a855f7;">${report.financialHealth.indicator}</div>
          <div style="font-size: 14px; font-weight: 700; color: #e4e4e7;">Score: ${report.financialHealth.score} / 100</div>
        </div>
        <div class="sub" style="margin-bottom: 12px;">${report.financialHealth.description}</div>
        ${
          report.financialHealth.warnings.length > 0
            ? `<div style="color: #f87171; font-size: 12px; margin-bottom: 6px;">⚠️ <strong>Warnings:</strong> ${report.financialHealth.warnings.join(' | ')}</div>`
            : ''
        }
        ${
          report.financialHealth.positiveNotes.length > 0
            ? `<div style="color: #4ade80; font-size: 12px;">✓ <strong>Positive Factors:</strong> ${report.financialHealth.positiveNotes.join(' | ')}</div>`
            : ''
        }
      </div>

      <div class="section">
        <div class="section-title">Category Spending Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount (INR)</th>
              <th>Share of Spending</th>
            </tr>
          </thead>
          <tbody>
            ${report.categoryBreakdown
              .map(
                (c) => `
              <tr>
                <td>${c.category}</td>
                <td><strong>${formatINR(c.amount)}</strong></td>
                <td>${c.percentage}%</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Generated automatically by Finance Manager on ${report.generatedAt}. This report provides analytical recommendations for financial planning.
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
