import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { BalanceCard } from '../components/Common/BalanceCard';
import { StatCard } from '../components/Common/StatCard';
import { IncomeExpenseChart, ExpenseBreakdownChart } from '../components/Dashboard/FinancialCharts';
import { TransactionModal } from '../components/modals/TransactionModal';
import { AccountModal } from '../components/modals/AccountModal';
import { BudgetModal } from '../components/modals/BudgetModal';
import { GoalModal } from '../components/modals/GoalModal';
import { OnboardingWizard } from '../components/Onboarding/OnboardingWizard';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowRight,
  CreditCard,
  Target,
  PieChart,
  ShoppingBag,
  Utensils,
  Zap,
  Briefcase,
  PlusCircle,
  FolderPlus
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Bills: Zap,
  Salary: Briefcase,
  Income: Briefcase,
  Default: Wallet
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { accounts, transactions, budgets, goals, summary } = useFinance();

  // Modal Control States
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddAccOpen, setIsAddAccOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!profile?.hasCompletedOnboarding);

  return (
    <DesktopLayout pageTitle="Dashboard">
      {/* 4 Stat Cards Header Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="TOTAL BALANCE"
          amount={summary.totalBalance}
          changePercentage={12.8}
          changeLabel="vs last month"
          icon={Wallet}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-400"
        />
        <StatCard
          title="MONTHLY INCOME"
          amount={summary.totalIncome}
          changePercentage={summary.incomeChangePercentage}
          changeLabel="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-400"
        />
        <StatCard
          title="MONTHLY EXPENSES"
          amount={summary.totalExpenses}
          changePercentage={summary.expenseChangePercentage}
          changeLabel="vs last month"
          icon={TrendingDown}
          iconBgColor="bg-rose-500/10"
          iconTextColor="text-rose-400"
          isPositiveGood={false}
        />
        <StatCard
          title="SAVINGS"
          amount={summary.totalSavings}
          changePercentage={summary.savingsRate}
          changeLabel="savings rate"
          icon={PiggyBank}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-400"
        />
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Quick Actions</h3>
          <span className="text-[11px] text-zinc-500">Perform instant financial tasks</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Transaction</span>
          </button>

          <button
            onClick={() => setIsAddAccOpen(true)}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>+ Add Account</span>
          </button>

          <button
            onClick={() => setIsAddBudgetOpen(true)}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PieChart className="w-4 h-4 text-purple-400" />
            <span>+ Create Budget</span>
          </button>

          <button
            onClick={() => setIsAddGoalOpen(true)}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Target className="w-4 h-4 text-purple-400" />
            <span>+ Create Goal</span>
          </button>
        </div>
      </div>

      {/* Main Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Balance Highlight Card */}
          <BalanceCard
            balance={summary.totalBalance}
            holderName={profile?.fullName || 'Raunak'}
            accountLabel="HDFC Savings •••• 5087"
            onAddTx={() => setIsAddTxOpen(true)}
          />

          {/* Income vs Expenses Chart */}
          <IncomeExpenseChart transactions={transactions} />

          {/* Recent Transactions Section */}
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Transactions</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Latest 5 financial activities across all accounts</p>
              </div>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span>View All Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {transactions.slice(0, 5).map((tx) => {
                const IconComponent = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS.Default;
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="py-3.5 flex items-center justify-between hover:bg-zinc-800/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{tx.title}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                            {tx.category}
                          </span>
                          <span>•</span>
                          <span>{tx.accountName || 'HDFC Savings'}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-extrabold font-financial ${
                        isIncome ? 'text-emerald-400' : 'text-zinc-100'
                      }`}
                    >
                      {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column Side Panels */}
        <div className="space-y-8">
          {/* Expense Breakdown Donut */}
          <ExpenseBreakdownChart transactions={transactions} />

          {/* Accounts Overview Cards */}
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Your Accounts</h3>
              </div>
              <Link to="/accounts" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                Manage All
              </Link>
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => navigate('/accounts')}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${acc.colorGradient} border border-white/10 shadow-lg relative overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white tracking-wide">{acc.name}</span>
                    <span className="text-[10px] font-mono text-zinc-300 bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
                      •••• {acc.accountNumber}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-white font-financial">
                    {formatINR(acc.balance)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Overview Widget */}
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Budget Overview</h3>
              </div>
              <Link to="/budgets" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                Manage
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400 space-y-1">
                <p>No budgets created yet.</p>
                <Link to="/budgets" className="text-purple-400 font-bold hover:underline inline-block">
                  + Create Budget
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 4).map((b) => {
                  const pct = Math.min(100, Math.round((b.spentAmount / b.limitAmount) * 100));
                  let barColor = 'bg-emerald-500';
                  if (pct >= 100) barColor = 'bg-rose-500';
                  else if (pct >= 80) barColor = 'bg-amber-500';

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">{b.category}</span>
                        <span className="font-bold text-zinc-400">
                          {formatINR(b.spentAmount, false)} / {formatINR(b.limitAmount, false)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Financial Goals Widget */}
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Financial Goals</h3>
              </div>
              <Link to="/goals" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                View All
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400 space-y-1">
                <p>No savings goals created yet.</p>
                <Link to="/goals" className="text-purple-400 font-bold hover:underline inline-block">
                  + Create Goal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g.id} className="p-3.5 rounded-2xl bg-[#09090b] border border-zinc-800/80">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="font-bold text-white">{g.title}</span>
                        <span className="font-bold text-purple-400">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden my-2">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                        <span>{formatINR(g.currentAmount)}</span>
                        <span>Target: {formatINR(g.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <AccountModal isOpen={isAddAccOpen} onClose={() => setIsAddAccOpen(false)} />
      <BudgetModal isOpen={isAddBudgetOpen} onClose={() => setIsAddBudgetOpen(false)} />
      <GoalModal isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} />
      <OnboardingWizard isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </DesktopLayout>
  );
};
