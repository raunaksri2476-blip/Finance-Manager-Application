import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportAPI, transactionAPI, accountAPI, categoryAPI } from '../services/api';
import StatCard from '../components/Dashboard/StatCard';
import IncomeExpenseChartWidget from '../components/Dashboard/IncomeExpenseChart';
import ExpenseChartWidget from '../components/Dashboard/ExpenseChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import BudgetOverview from '../components/Dashboard/BudgetOverview';
import GoalOverview from '../components/Dashboard/GoalOverview';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import TransactionModal from '../components/Transactions/TransactionModal';
import Toast from '../components/common/Toast';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Transaction Modal state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await reportAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load dashboard data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenAddModal = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        accountAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setAccounts(accRes.data || []);
      setCategories(catRes.data || []);
      setIsAddTxOpen(true);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load options for transaction' });
    }
  };

  const handleCreateTx = async (txData) => {
    setTxSubmitting(true);
    try {
      await transactionAPI.create(txData);
      setToast({ type: 'success', message: 'Transaction added successfully.' });
      setIsAddTxOpen(false);
      fetchDashboardData();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to add transaction' });
    } finally {
      setTxSubmitting(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <Loading fullScreen={false} message="Calculating dashboard metrics..." />;

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-2xl text-center space-y-3">
        <p className="font-semibold text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDashboardData}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name || 'Friend'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            Here's your financial overview and live account summary.
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          icon={Plus}
          className="shadow-lg shadow-emerald-600/30"
        >
          Add Transaction
        </Button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          amount={data?.totalBalance || 0}
          icon={Wallet}
          colorScheme="indigo"
        />
        <StatCard
          title="Total Income"
          amount={data?.totalIncome || 0}
          icon={TrendingUp}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Expenses"
          amount={data?.totalExpenses || 0}
          icon={TrendingDown}
          colorScheme="rose"
        />
        <StatCard
          title="Savings"
          amount={data?.savings || 0}
          icon={PiggyBank}
          colorScheme="amber"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChartWidget data={data?.incomeVsExpensesMonthly || []} />
        </div>
        <div>
          <ExpenseChartWidget data={data?.expenseByCategory || []} />
        </div>
      </div>

      {/* Recent Activity & Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={data?.recentTransactions || []} />
        <BudgetOverview budgets={data?.budgetOverview || []} />
      </div>

      {/* Financial Goals */}
      <div>
        <GoalOverview goals={data?.goalOverview || []} />
      </div>

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSubmit={handleCreateTx}
        accounts={accounts}
        categories={categories}
        loading={txSubmitting}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Dashboard;
