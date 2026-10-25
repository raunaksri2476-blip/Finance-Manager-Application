import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { useFinance } from '../context/FinanceContext';
import { useAuth, getUserIdFromEmail } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { formatINR, formatDate } from '../utils/formatters';
import { AdminAuditLog, TransactionType, Transaction, Budget, Goal, Account, UserProfile, GoalSuggestion } from '../types';
import { AdminUserSelector, MOCK_ADMIN_REGISTERED_USERS } from '../components/Admin/AdminUserSelector';
import {
  generateSpendingLimitReport,
  AnalysisPeriod,
  SpendingLimitReport
} from '../utils/spendingLimitCalculator';
import { SpendingLimitReportView } from '../components/Reports/SpendingLimitReportView';
import {
  ShieldCheck,
  UserCheck,
  PlusCircle,
  CreditCard,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Users,
  Database,
  History,
  Zap,
  AlertTriangle,
  AlertOctagon,
  Search,
  Bell,
  Send,
  Plus,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Check,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';

const FALLBACK_USER_DATA: Record<
  string,
  {
    accounts: Account[];
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    monthlyCategoryHistory: Record<string, Array<{ month: string; amount: number }>>;
    goalContributions: Record<string, Array<{ date: string; amount: number; notes: string }>>;
  }
> = {
  'user-raunak': {
    accounts: [
      { id: 'acc-r1', name: 'HDFC Savings', type: 'savings', balance: 45000, accountNumber: '5087', bankName: 'HDFC Bank', colorGradient: 'from-purple-600 to-slate-900', isPrimary: true, createdAt: '2025-01-15' },
      { id: 'acc-r2', name: 'SBI Account', type: 'checking', balance: 30500, accountNumber: '4218', bankName: 'SBI', colorGradient: 'from-blue-600 to-slate-900', isPrimary: false, createdAt: '2025-03-10' },
      { id: 'acc-r3', name: 'Cash Wallet', type: 'cash', balance: 4000, accountNumber: 'CASH', colorGradient: 'from-emerald-600 to-slate-900', isPrimary: false, createdAt: '2025-02-01' },
      { id: 'acc-r4', name: 'ICICI Credit Card', type: 'credit', balance: 45000, accountNumber: '9904', bankName: 'ICICI', colorGradient: 'from-rose-600 to-slate-900', isPrimary: false, createdAt: '2025-04-20' }
    ],
    transactions: [
      { id: 'tx-r1', accountId: 'acc-r1', accountName: 'HDFC Savings', title: 'Monthly Direct Payroll', category: 'Salary', amount: 75000, type: 'income', date: '2026-10-01', time: '09:00', notes: 'Monthly salary' },
      { id: 'tx-r2', accountId: 'acc-r1', accountName: 'HDFC Savings', title: 'Amazon Online Shopping', category: 'Shopping', amount: 2499, type: 'expense', date: '2026-10-07', time: '18:45', notes: 'Wireless headphones' },
      { id: 'tx-r3', accountId: 'acc-r1', accountName: 'HDFC Savings', title: 'Swiggy Gourmet Delivery', category: 'Food', amount: 450, type: 'expense', date: '2026-10-08', time: '20:15', notes: 'Dinner order' },
      { id: 'tx-r4', accountId: 'acc-r2', accountName: 'SBI Account', title: 'Electricity & Utility Bill', category: 'Bills', amount: 3200, type: 'expense', date: '2026-10-05', time: '11:30' },
      { id: 'tx-r5', accountId: 'acc-r3', accountName: 'Cash Wallet', title: 'Uber Cab Ride', category: 'Transport', amount: 380, type: 'expense', date: '2026-10-06', time: '14:20' },
      { id: 'tx-r6', accountId: 'acc-r2', accountName: 'SBI Account', title: 'Freelance Design Consulting', category: 'Income', amount: 15000, type: 'income', date: '2026-10-04', time: '16:00' },
      { id: 'tx-r7', accountId: 'acc-r1', accountName: 'HDFC Savings', title: 'Cult.Fit Gym Membership', category: 'Healthcare', amount: 1800, type: 'expense', date: '2026-10-02', time: '08:00' }
    ],
    budgets: [
      { id: 'b-r1', userId: '00000000-0000-4000-a000-000000000001', category: 'Food', limitAmount: 12000, spentAmount: 450, period: 'monthly' },
      { id: 'b-r2', userId: '00000000-0000-4000-a000-000000000001', category: 'Shopping', limitAmount: 8000, spentAmount: 2499, period: 'monthly' },
      { id: 'b-r3', userId: '00000000-0000-4000-a000-000000000001', category: 'Bills', limitAmount: 10000, spentAmount: 3200, period: 'monthly' }
    ],
    goals: [
      { id: 'g-r1', userId: '00000000-0000-4000-a000-000000000001', title: 'New Macbook Pro M3', targetAmount: 150000, currentAmount: 65000, targetDate: '2027-04-30', category: 'Gadgets' },
      { id: 'g-r2', userId: '00000000-0000-4000-a000-000000000001', title: 'Emergency Reserve', targetAmount: 100000, currentAmount: 45000, targetDate: '2027-06-30', category: 'Savings' }
    ],
    monthlyCategoryHistory: {},
    goalContributions: {}
  },
  'user-priya': {
    accounts: [
      { id: 'acc-p1', name: 'ICICI Wealth Savings', type: 'savings', balance: 125000, accountNumber: '7712', bankName: 'ICICI Bank', colorGradient: 'from-purple-600 to-indigo-900', isPrimary: true, createdAt: '2025-02-10' },
      { id: 'acc-p2', name: 'Axis Corporate Card', type: 'credit', balance: 35000, accountNumber: '3310', bankName: 'Axis Bank', colorGradient: 'from-rose-600 to-slate-900', isPrimary: false, createdAt: '2025-05-12' }
    ],
    transactions: [
      { id: 'tx-p1', accountId: 'acc-p1', accountName: 'ICICI Wealth Savings', title: 'Tech Consulting Payout', category: 'Income', amount: 120000, type: 'income', date: '2026-10-01', time: '11:00' },
      { id: 'tx-p2', accountId: 'acc-p2', accountName: 'Axis Corporate Card', title: 'Luxury Retail Fashion', category: 'Shopping', amount: 38000, type: 'expense', date: '2026-10-03', time: '16:30' },
      { id: 'tx-p3', accountId: 'acc-p1', accountName: 'ICICI Wealth Savings', title: 'Gourmet Dining Experience', category: 'Food', amount: 14500, type: 'expense', date: '2026-10-05', time: '21:00' }
    ],
    budgets: [
      { id: 'b-p1', userId: 'priya', category: 'Shopping', limitAmount: 40000, spentAmount: 38000, period: 'monthly' }
    ],
    goals: [
      { id: 'g-p1', userId: 'priya', title: 'Europe Summer Trip', targetAmount: 300000, currentAmount: 180000, targetDate: '2027-08-15', category: 'Travel' }
    ],
    monthlyCategoryHistory: {},
    goalContributions: {}
  },
  'user-vikram': {
    accounts: [
      { id: 'acc-v1', name: 'SBI Salary Account', type: 'checking', balance: 68000, accountNumber: '9901', bankName: 'SBI', colorGradient: 'from-blue-600 to-slate-900', isPrimary: true, createdAt: '2025-01-01' },
      { id: 'acc-v2', name: 'Zerodha Investment Reserve', type: 'investment', balance: 140000, accountNumber: '7780', bankName: 'Zerodha', colorGradient: 'from-emerald-600 to-slate-900', isPrimary: false, createdAt: '2025-04-10' },
      { id: 'acc-v3', name: 'Emergency Cash Fund', type: 'cash', balance: 15000, accountNumber: 'CASH', colorGradient: 'from-amber-600 to-slate-900', isPrimary: false, createdAt: '2025-03-01' }
    ],
    transactions: [
      { id: 'tx-v1', accountId: 'acc-v1', accountName: 'SBI Salary Account', title: 'Monthly Salary Credit', category: 'Salary', amount: 65000, type: 'income', date: '2026-10-01', time: '09:30' },
      { id: 'tx-v2', accountId: 'acc-v1', accountName: 'SBI Salary Account', title: 'Fuel & Commute Pass', category: 'Transport', amount: 4200, type: 'expense', date: '2026-10-03', time: '12:15' },
      { id: 'tx-v3', accountId: 'acc-v1', accountName: 'SBI Salary Account', title: 'Supermarket Supplies', category: 'Food', amount: 5500, type: 'expense', date: '2026-10-05', time: '18:00' }
    ],
    budgets: [
      { id: 'b-v1', userId: 'vikram', category: 'Transport', limitAmount: 5000, spentAmount: 4200, period: 'monthly' }
    ],
    goals: [
      { id: 'g-v1', userId: 'vikram', title: 'Car Downpayment', targetAmount: 200000, currentAmount: 95000, targetDate: '2027-03-31', category: 'Vehicle' }
    ],
    monthlyCategoryHistory: {},
    goalContributions: {}
  },
  'user-demo': {
    accounts: [
      { id: 'acc-d1', name: 'Primary Demo Wallet', type: 'savings', balance: 25000, accountNumber: '1092', bankName: 'HDFC', colorGradient: 'from-purple-600 to-indigo-800', isPrimary: true, createdAt: '2025-06-01' }
    ],
    transactions: [
      { id: 'tx-d1', accountId: 'acc-d1', accountName: 'Primary Demo Wallet', title: 'Freelance Design Credit', category: 'Income', amount: 45000, type: 'income', date: '2026-10-02', time: '10:00' },
      { id: 'tx-d2', accountId: 'acc-d1', accountName: 'Primary Demo Wallet', title: 'Software Subscriptions', category: 'Bills', amount: 6800, type: 'expense', date: '2026-10-04', time: '14:00' }
    ],
    budgets: [],
    goals: [],
    monthlyCategoryHistory: {},
    goalContributions: {}
  }
};

interface AdminPageProps {
  defaultTab?: 'accounts' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'audit';
}

export const AdminPage: React.FC<AdminPageProps> = ({ defaultTab = 'accounts' }) => {
  const { profile } = useAuth();
  const {
    accounts: contextAccounts,
    transactions: contextTransactions,
    budgets: contextBudgets,
    goals: contextGoals,
    goalSuggestions: contextGoalSuggestions,
    deleteAccount,
    sendGoalSuggestion,
    sendAdminNotification
  } = useFinance();
  const location = useLocation();
  const navigate = useNavigate();

  // Selected User Context (Stores selectedUserId, selectedUserName, selectedUserEmail)
  const [selectedUser, setSelectedUser] = useState<UserProfile>(MOCK_ADMIN_REGISTERED_USERS[0]);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);

  // User Datasets Loaded from Supabase for `selectedUser.id`
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userBudgets, setUserBudgets] = useState<Budget[]>([]);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);

  // Admin Sub-Navigation Tabs
  const [adminTab, setAdminTab] = useState<'accounts' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'audit'>(defaultTab);

  // Sync tab state with current route pathname
  useEffect(() => {
    if (location.pathname === '/admin/accounts') setAdminTab('accounts');
    else if (location.pathname === '/admin/transactions') setAdminTab('transactions');
    else if (location.pathname === '/admin/budgets') setAdminTab('budgets');
    else if (location.pathname === '/admin/goals') setAdminTab('goals');
    else if (location.pathname === '/admin/reports') setAdminTab('reports');
    else if (location.pathname === '/admin/audit') setAdminTab('audit');
    else if (location.pathname === '/admin') setAdminTab(defaultTab);
  }, [location.pathname, defaultTab]);

  const changeAdminTab = (tab: 'accounts' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'audit') => {
    setAdminTab(tab);
    navigate(`/admin/${tab}`);
  };

  // Accounts Filters & Selected Detail Modal State
  const [accountSearchQuery, setAccountSearchQuery] = useState<string>('');
  const [selectedAccountDetail, setSelectedAccountDetail] = useState<Account | null>(null);

  // Transactions Filters & Selection State (with Date Range support)
  const [txSearchQuery, setTxSearchQuery] = useState<string>('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('all');
  const [txAccountFilter, setTxAccountFilter] = useState<string>('all');
  const [txStartDate, setTxStartDate] = useState<string>('');
  const [txEndDate, setTxEndDate] = useState<string>('');

  // Budgets Selected Detail Modal State
  const [selectedBudgetDetail, setSelectedBudgetDetail] = useState<Budget | null>(null);

  // Goals Selected Detail Modal State & Goal Suggestion Modal State
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<Goal | null>(null);
  const [isSuggestGoalOpen, setIsSuggestGoalOpen] = useState<boolean>(false);
  const [suggestTitle, setSuggestTitle] = useState<string>('Emergency Fund');
  const [suggestTarget, setSuggestTarget] = useState<string>('150000');
  const [suggestDate, setSuggestDate] = useState<string>('2027-06-30');
  const [suggestMessage, setSuggestMessage] = useState<string>('Based on your current savings pattern, building an emergency fund would be a good next financial goal.');

  // Notification Sender Modal State
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [notifTitle, setNotifTitle] = useState<string>('Budget & Spending Alert');
  const [notifMessage, setNotifMessage] = useState<string>('Your Food spending has reached 85% of your monthly budget limit.');
  const [notifPriority, setNotifPriority] = useState<'normal' | 'important' | 'high'>('important');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([
    {
      id: 'log-1',
      adminEmail: profile?.email || 'admin@financemanager.io',
      targetUserName: 'Raunak Srivastav',
      targetUserEmail: 'raunak@financemanager.io',
      action: 'Inspected Account History',
      details: 'Loaded Supabase accounts for Raunak Srivastav',
      timestamp: 'Just now'
    }
  ]);

interface AdminUserCacheEntry {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  goalSuggestions: GoalSuggestion[];
  timestamp: number;
}

const adminCacheMap = new Map<string, AdminUserCacheEntry>();
const CACHE_TTL_MS = 30000;

  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  const [userGoalSuggestions, setUserGoalSuggestions] = useState<GoalSuggestion[]>([]);

  // Performance optimization state & cancellation refs
  const activeReqIdRef = React.useRef<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchErrors, setFetchErrors] = useState<{
    accounts?: string;
    transactions?: string;
    budgets?: string;
    goals?: string;
  }>({});
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  // Parallelized Supabase data loader with caching and request cancellation
  const loadUserSupabaseData = async (userId: string, forceRefresh = false) => {
    const currentReqId = ++activeReqIdRef.current;

    // Check cache first for instant 0ms rendering if not forcing refresh
    if (!forceRefresh) {
      const cached = adminCacheMap.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setUserAccounts(cached.accounts);
        setUserTransactions(cached.transactions);
        setUserBudgets(cached.budgets);
        setUserGoals(cached.goals);
        setUserGoalSuggestions(cached.goalSuggestions);
        setIsLoadingUser(false);
        setFetchErrors({});
        return;
      }
    }

    try {
      if (forceRefresh) setIsRefreshing(true);
      else setIsLoadingUser(true);
      setFetchErrors({});

      const isUUID = (str: string): boolean => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
      };

      const isRaunakOrDemo =
        Boolean(FALLBACK_USER_DATA[selectedUser.id]) ||
        selectedUser.email?.toLowerCase().includes('raunak') ||
        selectedUser.fullName?.toLowerCase().includes('raunak') ||
        selectedUser.id === '00000000-0000-4000-a000-000000000001';

      const userPrefix = selectedUser.email?.split('@')[0] || '';

      const rawUids = [
        userId,
        selectedUser.id,
        getUserIdFromEmail(selectedUser.email),
        userPrefix ? getUserIdFromEmail(userPrefix) : null,
        ...(isRaunakOrDemo ? ['00000000-0000-4000-a000-000000000001'] : [])
      ];

      const candidateUids = Array.from(
        new Set(rawUids.filter((uid): uid is string => Boolean(uid && isUUID(uid))))
      );

      const getDirectLocalStorage = <T,>(keyPrefix: string): T[] => {
        const results: T[] = [];
        const seenKeys = new Set<string>();

        const readKey = (k: string) => {
          if (seenKeys.has(k)) return;
          seenKeys.add(k);
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) results.push(...parsed);
            } catch (e) {
              console.error(`Error parsing ${k}:`, e);
            }
          }
        };

        candidateUids.forEach((uid) => readKey(`fm_${keyPrefix}_${uid}`));
        if (selectedUser.id) readKey(`fm_${keyPrefix}_${selectedUser.id}`);
        if (selectedUser.email) readKey(`fm_${keyPrefix}_${selectedUser.email}`);
        if (userPrefix) readKey(`fm_${keyPrefix}_${userPrefix}`);

        return results;
      };

      const localAccs = getDirectLocalStorage<Account>('accounts');
      const localTx = getDirectLocalStorage<Transaction>('transactions');
      const localB = getDirectLocalStorage<Budget>('budgets');
      const localG = getDirectLocalStorage<Goal>('goals');
      const localS = getDirectLocalStorage<GoalSuggestion>('goal_suggestions');

      // EXECUTE ALL 5 QUERIES CONCURRENTLY IN PARALLEL VIA Promise.allSettled
      const [accRes, txRes, bRes, gRes, sugRes] = await Promise.allSettled([
        supabase.from('accounts').select('*').in('user_id', candidateUids),
        supabase.from('transactions').select('*').in('user_id', candidateUids).order('date', { ascending: false }),
        supabase.from('budgets').select('*').in('user_id', candidateUids),
        supabase.from('goals').select('*').in('user_id', candidateUids),
        supabase.from('goal_suggestions').select('*').in('user_id', candidateUids).order('created_at', { ascending: false })
      ]);

      // Cancellation check: ignore obsolete response if user context switched mid-request
      if (currentReqId !== activeReqIdRef.current) return;

      const newErrors: { accounts?: string; transactions?: string; budgets?: string; goals?: string } = {};

      // 1. Accounts
      let dbAccounts: Account[] = [];
      if (accRes.status === 'fulfilled' && accRes.value.data && !accRes.value.error) {
        dbAccounts = accRes.value.data.map((a) => ({
          id: a.id,
          userId: a.user_id,
          name: a.name,
          type: a.type,
          balance: Number(a.balance),
          accountNumber: a.account_number,
          colorGradient: a.color_gradient || 'from-purple-600 to-slate-900',
          isPrimary: a.is_primary,
          createdAt: a.created_at ? a.created_at.split('T')[0] : '2025-01-15'
        }));
      } else if (accRes.status === 'rejected' || (accRes.status === 'fulfilled' && accRes.value.error)) {
        const errObj = accRes.status === 'fulfilled' ? accRes.value.error : accRes.reason;
        console.warn('Supabase accounts query notice:', errObj?.message || errObj);
      }

      const isMockAccId = (id: string) => ['acc-1', 'acc-2', 'acc-3', 'acc-4'].includes(id);
      const accMap = new Map<string, Account>();
      contextAccounts.filter(a => candidateUids.includes(a.userId || '') && !isMockAccId(a.id)).forEach(a => accMap.set(a.id, a));
      localAccs.filter(a => (candidateUids.includes(a.userId || '') || !a.userId) && !isMockAccId(a.id)).forEach(a => accMap.set(a.id, a));
      dbAccounts.forEach(a => accMap.set(a.id, a));
      let mergedAccounts = Array.from(accMap.values());

      if (mergedAccounts.length === 0) {
        if (isRaunakOrDemo) {
          const fallbackAccs = FALLBACK_USER_DATA[selectedUser.id]?.accounts || FALLBACK_USER_DATA['user-raunak'].accounts;
          mergedAccounts = fallbackAccs.map(a => ({ ...a, userId: selectedUser.id }));
        } else {
          mergedAccounts = [
            {
              id: `acc-${selectedUser.id.slice(0, 8)}`,
              userId: selectedUser.id,
              name: `${selectedUser.fullName}'s Main Account`,
              type: 'savings',
              balance: 0,
              accountNumber: '•••• 1412',
              colorGradient: 'from-purple-600 via-indigo-700 to-slate-900',
              isPrimary: true,
              createdAt: new Date().toISOString().split('T')[0]
            }
          ];
        }
      }

      // 2. Transactions
      let dbTransactions: Transaction[] = [];
      if (txRes.status === 'fulfilled' && txRes.value.data && !txRes.value.error) {
        dbTransactions = txRes.value.data.map((t) => ({
          id: t.id,
          userId: t.user_id,
          accountId: t.account_id,
          accountName: t.account_name || 'Primary Account',
          title: t.title,
          category: t.category,
          amount: Number(t.amount),
          type: t.type,
          date: t.date,
          time: t.time,
          notes: t.notes
        }));
      } else if (txRes.status === 'rejected' || (txRes.status === 'fulfilled' && txRes.value.error)) {
        const errObj = txRes.status === 'fulfilled' ? txRes.value.error : txRes.reason;
        console.warn('Supabase transactions query notice:', errObj?.message || errObj);
      }

      const txMap = new Map<string, Transaction>();
      contextTransactions.filter(t => candidateUids.includes(t.userId || '')).forEach(t => txMap.set(t.id, t));
      localTx.filter(t => candidateUids.includes(t.userId || '') || !t.userId).forEach(t => txMap.set(t.id, t));
      dbTransactions.forEach(t => txMap.set(t.id, t));
      let mergedTransactions = Array.from(txMap.values());

      if (mergedTransactions.length === 0 && isRaunakOrDemo) {
        const fallbackTxs = FALLBACK_USER_DATA[selectedUser.id]?.transactions || FALLBACK_USER_DATA['user-raunak'].transactions;
        mergedTransactions = fallbackTxs.map(t => ({ ...t, userId: selectedUser.id }));
      }

      // 3. Budgets
      let dbBudgets: Budget[] = [];
      if (bRes.status === 'fulfilled' && bRes.value.data && !bRes.value.error) {
        dbBudgets = bRes.value.data.map((b) => ({
          id: b.id,
          userId: b.user_id,
          category: b.category,
          limitAmount: Number(b.limit_amount),
          spentAmount: 0,
          period: b.period || 'monthly'
        }));
      } else if (bRes.status === 'rejected' || (bRes.status === 'fulfilled' && bRes.value.error)) {
        const errObj = bRes.status === 'fulfilled' ? bRes.value.error : bRes.reason;
        console.warn('Supabase budgets query notice:', errObj?.message || errObj);
      }

      const bMap = new Map<string, Budget>();
      contextBudgets.filter(b => candidateUids.includes(b.userId || '')).forEach(b => bMap.set(b.id, b));
      localB.filter(b => candidateUids.includes(b.userId || '') || !b.userId).forEach(b => bMap.set(b.id, b));
      dbBudgets.forEach(b => bMap.set(b.id, b));
      let mergedBudgets = Array.from(bMap.values());

      if (mergedBudgets.length === 0 && isRaunakOrDemo) {
        const fallbackB = FALLBACK_USER_DATA[selectedUser.id]?.budgets || FALLBACK_USER_DATA['user-raunak'].budgets;
        mergedBudgets = fallbackB.map(b => ({ ...b, userId: selectedUser.id }));
      }

      // Pre-index category spent amounts for fast budget calculations
      const categorySpentMap = new Map<string, number>();
      mergedTransactions.forEach((t) => {
        if (t.type === 'expense' && t.category) {
          const key = t.category.toLowerCase().trim();
          categorySpentMap.set(key, (categorySpentMap.get(key) || 0) + Number(t.amount));
        }
      });

      const processedBudgets = mergedBudgets.map((b) => {
        const catSpent = categorySpentMap.get(b.category.toLowerCase().trim()) || 0;
        return {
          ...b,
          spentAmount: catSpent > 0 ? catSpent : (b.spentAmount || 0)
        };
      });

      // 4. Goals
      let dbGoals: Goal[] = [];
      if (gRes.status === 'fulfilled' && gRes.value.data && !gRes.value.error) {
        dbGoals = gRes.value.data.map((g) => ({
          id: g.id,
          userId: g.user_id,
          title: g.title,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          targetDate: g.target_date,
          category: g.category,
          createdAt: g.created_at ? g.created_at.split('T')[0] : '2026-01-10'
        }));
      } else if (gRes.status === 'rejected' || (gRes.status === 'fulfilled' && gRes.value.error)) {
        const errObj = gRes.status === 'fulfilled' ? gRes.value.error : gRes.reason;
        console.warn('Supabase goals query notice:', errObj?.message || errObj);
      }

      const gMap = new Map<string, Goal>();
      contextGoals.filter(g => candidateUids.includes(g.userId || '')).forEach(g => gMap.set(g.id, g));
      localG.filter(g => candidateUids.includes(g.userId || '') || !g.userId).forEach(g => gMap.set(g.id, g));
      dbGoals.forEach(g => gMap.set(g.id, g));
      let mergedGoals = Array.from(gMap.values());

      if (mergedGoals.length === 0 && isRaunakOrDemo) {
        const fallbackG = FALLBACK_USER_DATA[selectedUser.id]?.goals || FALLBACK_USER_DATA['user-raunak'].goals;
        mergedGoals = fallbackG.map(g => ({ ...g, userId: selectedUser.id }));
      }

      // 5. Goal Suggestions
      let dbSuggestions: GoalSuggestion[] = [];
      if (sugRes.status === 'fulfilled' && sugRes.value.data && !sugRes.value.error) {
        dbSuggestions = sugRes.value.data.map((s) => ({
          id: s.id,
          userId: s.user_id,
          adminEmail: s.admin_email || 'admin@financemanager.io',
          title: s.title,
          suggestedTargetAmount: Number(s.suggested_target_amount),
          suggestedTargetDate: s.suggested_target_date,
          category: s.category || 'Savings',
          message: s.message,
          status: s.status || 'pending',
          createdAt: s.created_at
        }));
      }

      const sMap = new Map<string, GoalSuggestion>();
      contextGoalSuggestions.filter(s => candidateUids.includes(s.userId || '')).forEach(s => sMap.set(s.id, s));
      localS.filter(s => candidateUids.includes(s.userId || '') || !s.userId).forEach(s => sMap.set(s.id, s));
      dbSuggestions.forEach(s => sMap.set(s.id, s));
      const mergedSuggestions = Array.from(sMap.values());

      // Save into in-memory cache
      adminCacheMap.set(userId, {
        accounts: mergedAccounts,
        transactions: mergedTransactions,
        budgets: processedBudgets,
        goals: mergedGoals,
        goalSuggestions: mergedSuggestions,
        timestamp: Date.now()
      });

      setUserAccounts(mergedAccounts);
      setUserTransactions(mergedTransactions);
      setUserBudgets(processedBudgets);
      setUserGoals(mergedGoals);
      setUserGoalSuggestions(mergedSuggestions);
      setFetchErrors({});
    } catch (e) {
      console.error('Supabase query exception:', e);
    } finally {
      setIsLoadingUser(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserSupabaseData(selectedUser.id, false);

    const handleDataChange = () => {
      adminCacheMap.clear();
      loadUserSupabaseData(selectedUser.id, true);
    };

    window.addEventListener('finance_data_changed', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('finance_data_changed', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, [selectedUser.id]);

  // Handle User Switch with DEPENDENCY RESET, CANCEL INFLIGHT, & INSTANT CACHE RENDER
  const handleSelectUser = (userObj: UserProfile) => {
    if (selectedUser.id === userObj.id) return;
    
    // Invalidate any in-flight requests from previously selected user
    activeReqIdRef.current++;

    setSelectedUser(userObj);

    // Reset dependent selections & search filters
    setSelectedAccountDetail(null);
    setSelectedBudgetDetail(null);
    setSelectedGoalDetail(null);
    setTxAccountFilter('all');
    setTxCategoryFilter('all');
    setTxTypeFilter('all');
    setTxStartDate('');
    setTxEndDate('');
    setTxSearchQuery('');
    setAccountSearchQuery('');

    // Instant Cache Render if warm
    const cached = adminCacheMap.get(userObj.id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setUserAccounts(cached.accounts);
      setUserTransactions(cached.transactions);
      setUserBudgets(cached.budgets);
      setUserGoals(cached.goals);
      setUserGoalSuggestions(cached.goalSuggestions);
      setIsLoadingUser(false);
      setFetchErrors({});
    } else {
      setIsLoadingUser(true);
      setUserAccounts([]);
      setUserTransactions([]);
      setUserBudgets([]);
      setUserGoals([]);
    }

    // Record Audit Log
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: profile?.email || 'admin@financemanager.io',
      targetUserName: userObj.fullName,
      targetUserEmail: userObj.email,
      action: 'Switched User Context',
      details: `Loaded user_id = ${userObj.id}`,
      timestamp: 'Just now'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleManualRefresh = () => {
    loadUserSupabaseData(selectedUser.id, true);
  };

  // Accounts Tab Filtered List
  const filteredAccounts = useMemo(() => {
    const q = accountSearchQuery.toLowerCase().trim();
    if (!q) return userAccounts;
    return userAccounts.filter(
      (acc) =>
        acc.name.toLowerCase().includes(q) ||
        acc.type.toLowerCase().includes(q) ||
        acc.accountNumber.toLowerCase().includes(q)
    );
  }, [accountSearchQuery, userAccounts]);

  // Account Detail Modal Transactions specifically for `user_id = selectedUserId AND account_id = selectedAccountId`
  const accountTransactions = useMemo(() => {
    if (!selectedAccountDetail) return [];
    return userTransactions.filter((t) => t.accountId === selectedAccountDetail.id);
  }, [selectedAccountDetail, userTransactions]);

  // Transactions Tab Filtered List with MULTI-FILTERING (User, Account, Category, Type, Date Range, Search)
  const filteredTransactions = useMemo(() => {
    return userTransactions.filter((t) => {
      if (txTypeFilter !== 'all' && t.type !== txTypeFilter) return false;
      if (txCategoryFilter !== 'all' && t.category.toLowerCase() !== txCategoryFilter.toLowerCase()) return false;
      if (txAccountFilter !== 'all' && t.accountId !== txAccountFilter) return false;
      if (txStartDate && t.date < txStartDate) return false;
      if (txEndDate && t.date > txEndDate) return false;
      if (txSearchQuery.trim()) {
        const q = txSearchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchAcc = (t.accountName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchAcc) return false;
      }
      return true;
    });
  }, [userTransactions, txTypeFilter, txCategoryFilter, txAccountFilter, txStartDate, txEndDate, txSearchQuery]);

  // Transactions Summary Metrics for Filtered List
  const txSummary = useMemo(() => {
    const count = filteredTransactions.length;
    const totalSpent = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const avgTx = count > 0 ? Math.round((totalSpent + totalIncome) / count) : 0;
    const highestTx = count > 0 ? Math.max(...filteredTransactions.map((t) => Number(t.amount))) : 0;
    const latestDate = filteredTransactions[0]?.date || 'N/A';

    return { count, totalSpent, totalIncome, avgTx, highestTx, latestDate };
  }, [filteredTransactions]);

  // Processed budgets with live category spent amounts from `userTransactions`
  const processedBudgets = useMemo(() => {
    return userBudgets.map((b) => {
      const categorySpent = userTransactions
        .filter((t) => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { ...b, spentAmount: categorySpent };
    });
  }, [userBudgets, userTransactions]);

  // Target User Spending Limit Report for Reports Tab
  const spendingReport: SpendingLimitReport = useMemo(() => {
    return generateSpendingLimitReport(
      { id: selectedUser.id, fullName: selectedUser.fullName, email: selectedUser.email },
      '6_months',
      userTransactions,
      processedBudgets,
      userGoals
    );
  }, [selectedUser, userTransactions, processedBudgets, userGoals]);

  // Admin Goal Suggestion Submit Handler
  const handleSendGoalSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(suggestTarget);
    if (isNaN(amtNum) || amtNum <= 0 || !suggestTitle.trim()) {
      showBanner('Please enter valid goal suggestion parameters');
      return;
    }

    await sendGoalSuggestion({
      userId: selectedUser.id,
      adminEmail: profile?.email || 'admin@financemanager.io',
      title: suggestTitle.trim(),
      suggestedTargetAmount: amtNum,
      suggestedTargetDate: suggestDate,
      category: 'Savings',
      message: suggestMessage.trim()
    });

    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: profile?.email || 'admin@financemanager.io',
      targetUserName: selectedUser.fullName,
      targetUserEmail: selectedUser.email,
      action: 'Sent Goal Suggestion',
      details: `Suggested "${suggestTitle}" (₹${amtNum.toLocaleString()})`,
      timestamp: 'Just now'
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showBanner(`Goal suggestion "${suggestTitle}" sent to ${selectedUser.fullName}!`);
    setIsSuggestGoalOpen(false);
  };

  // Admin Notification Sender Handler
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      showBanner('Please enter a notification title and message');
      return;
    }

    await sendAdminNotification(selectedUser.id, {
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      priority: notifPriority,
      type: notifPriority === 'high' ? 'warning' : 'info'
    });

    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: profile?.email || 'admin@financemanager.io',
      targetUserName: selectedUser.fullName,
      targetUserEmail: selectedUser.email,
      action: 'Sent User Notification',
      details: `Notification: "${notifTitle}"`,
      timestamp: 'Just now'
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showBanner(`Notification sent successfully to ${selectedUser.fullName}!`);
    setIsNotifModalOpen(false);
  };

  // Admin Delete User Account Handler
  const handleAdminDeleteAccount = async (accId: string, accName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Admin Action: Delete account "${accName}" for user ${selectedUser.fullName}?`)) {
      try {
        await deleteAccount(accId);
        
        // Also remove from Supabase accounts for selectedUser.id
        await supabase.from('accounts').delete().eq('id', accId);

        // Update local state
        setUserAccounts(prev => prev.filter(a => a.id !== accId));

        const newLog: AdminAuditLog = {
          id: `log-${Date.now()}`,
          adminEmail: profile?.email || 'admin@financemanager.io',
          targetUserName: selectedUser.fullName,
          targetUserEmail: selectedUser.email,
          action: 'Deleted User Account',
          details: `Deleted account "${accName}" (ID: ${accId})`,
          timestamp: 'Just now'
        };
        setAuditLogs((prev) => [newLog, ...prev]);

        showBanner(`Account "${accName}" deleted successfully for ${selectedUser.fullName}`);
      } catch (err) {
        console.error('Admin delete account error:', err);
      }
    }
  };

  const currentFallbackData = FALLBACK_USER_DATA[selectedUser.id] || FALLBACK_USER_DATA['user-raunak'];

  return (
    <DesktopLayout pageTitle="Admin Portal">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> ADMIN CONTROL CENTER
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1.5">
            Admin Account Management & User Financial Audit
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select any registered user to load their Supabase accounts, transactions, budgets, goals & spending limit analysis.
          </p>
        </div>
      </div>

      {notificationBanner && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notificationBanner}</span>
        </div>
      )}

      {/* REUSABLE ADMIN USER SELECTOR COMPONENT */}
      <AdminUserSelector
        selectedUserId={selectedUser.id}
        onSelectUser={(u) => handleSelectUser(u)}
      />

      {/* SELECTED USER CONTEXT COMPACT BANNER */}
      <div className="bg-gradient-to-r from-[#181524] via-[#151518] to-[#0c0c0e] border border-purple-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-purple-900/40">
            {selectedUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active User Context
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedUser.fullName}</h2>
            <p className="text-xs text-zinc-400 font-mono">{selectedUser.email}</p>
          </div>
        </div>

        {/* Quick User Stats & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
            <div className="text-[10px] text-zinc-400 font-bold uppercase">Accounts</div>
            <div className="text-xs font-extrabold text-white font-mono">{userAccounts.length}</div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
            <div className="text-[10px] text-zinc-400 font-bold uppercase">Tx Count</div>
            <div className="text-xs font-extrabold text-white font-mono">{userTransactions.length}</div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
            <div className="text-[10px] text-zinc-400 font-bold uppercase">Budgets</div>
            <div className="text-xs font-extrabold text-white font-mono">{userBudgets.length}</div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
            <div className="text-[10px] text-zinc-400 font-bold uppercase">Goals</div>
            <div className="text-xs font-extrabold text-white font-mono">{userGoals.length}</div>
          </div>

          {/* Action CTAs */}
          <button
            onClick={() => setIsSuggestGoalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-md shadow-purple-950/50 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Suggest Goal</span>
          </button>

          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700/80 transition-all hover:scale-[1.02]"
          >
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Send Notif</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isLoadingUser || isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 text-xs font-bold border border-purple-800/60 transition-all hover:scale-[1.02] disabled:opacity-50"
            title="Force reload latest user data from Supabase"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${isLoadingUser || isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {!isBannerDismissed && Object.keys(fetchErrors).length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Notice: Some network queries had issues. Fallback user data is loaded safely.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="px-3 py-1 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Fetch
            </button>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400 hover:text-white transition-all cursor-pointer"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ADMIN SUB-NAVIGATION TABS */}
      <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 overflow-x-auto">
          <button
            onClick={() => changeAdminTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === 'accounts' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" /> User Accounts ({userAccounts.length})
          </button>

          <button
            onClick={() => changeAdminTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === 'transactions' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowLeftRightIcon className="w-4 h-4" /> User Transactions ({userTransactions.length})
          </button>

          <button
            onClick={() => changeAdminTab('budgets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === 'budgets' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" /> User Budgets ({userBudgets.length})
          </button>

          <button
            onClick={() => changeAdminTab('goals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === 'goals' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" /> User Goals ({userGoals.length})
          </button>

          <button
            onClick={() => changeAdminTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === 'reports' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-300" /> Spending Limit Report
          </button>

          <button
            onClick={() => changeAdminTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === 'audit' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> System Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* LOADING INDICATOR ON USER SWITCH */}
        {isLoadingUser ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold text-zinc-400">Loading {selectedUser.fullName}'s financial data...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: ACCOUNTS */}
            {adminTab === 'accounts' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Financial Accounts — {selectedUser.fullName}
                    </h3>
                    <p className="text-xs text-zinc-400">Click any account card to inspect details and full transaction history.</p>
                  </div>

                  {/* Account Search Input */}
                  <div className="relative w-72">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search accounts/cards by name, type, last 4..."
                      value={accountSearchQuery}
                      onChange={(e) => setAccountSearchQuery(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {filteredAccounts.length === 0 ? (
                  <div className="p-12 text-center text-xs text-zinc-400 bg-[#09090b] border border-zinc-800/80 rounded-3xl space-y-2">
                    <CreditCard className="w-8 h-8 text-zinc-600 mx-auto" />
                    <div className="text-sm font-bold text-white">No Financial Accounts Registered</div>
                    <p className="text-zinc-500 max-w-sm mx-auto">
                      {selectedUser.fullName} currently has no financial accounts registered in Supabase.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => setSelectedAccountDetail(acc)}
                        className={`p-6 rounded-3xl border bg-gradient-to-br ${acc.colorGradient} border-zinc-700/80 shadow-xl cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden group`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                            {acc.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-300">•••• {acc.accountNumber}</span>
                            <button
                              type="button"
                              onClick={(e) => handleAdminDeleteAccount(acc.id, acc.name, e)}
                              title="Delete Account (Admin Action)"
                              className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-950/80 text-rose-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-base font-extrabold text-white">{acc.name}</div>
                        <div className="text-2xl font-extrabold text-white font-financial mt-1">
                          {formatINR(acc.balance)}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-300">
                          <span>Created: {acc.createdAt || '2025-01-15'}</span>
                          <span className="font-bold text-purple-300 group-hover:underline">Inspect History →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TRANSACTIONS */}
            {adminTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Transaction Management — {selectedUser.fullName}
                    </h3>
                    <p className="text-xs text-zinc-400">Multi-filtered transaction query engine for {selectedUser.fullName}.</p>
                  </div>
                </div>

                {/* MULTI-FILTERING BAR (User, Account, Category, Type, Date Range, Search) */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-[#09090b] p-3 rounded-2xl border border-zinc-800 text-xs">
                  {/* Search Title */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Search Tx</label>
                    <input
                      type="text"
                      placeholder="Search title..."
                      value={txSearchQuery}
                      onChange={(e) => setTxSearchQuery(e.target.value)}
                      className="w-full bg-[#151518] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Type</label>
                    <select
                      value={txTypeFilter}
                      onChange={(e) => setTxTypeFilter(e.target.value as any)}
                      className="w-full bg-[#151518] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Category</label>
                    <select
                      value={txCategoryFilter}
                      onChange={(e) => setTxCategoryFilter(e.target.value)}
                      className="w-full bg-[#151518] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="Food">Food</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Salary">Salary</option>
                      <option value="Transport">Transport</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>

                  {/* Account Filter (POPULATED ONLY WITH SELECTED USER'S ACCOUNTS) */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Account</label>
                    <select
                      value={txAccountFilter}
                      onChange={(e) => setTxAccountFilter(e.target.value)}
                      className="w-full bg-[#151518] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">All User Accounts</option>
                      {userAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} (•••• {acc.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">From Date</label>
                    <input
                      type="date"
                      value={txStartDate}
                      onChange={(e) => setTxStartDate(e.target.value)}
                      className="w-full bg-[#151518] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">To Date</label>
                    <input
                      type="date"
                      value={txEndDate}
                      onChange={(e) => setTxEndDate(e.target.value)}
                      className="w-full bg-[#151518] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Filtered Tx Summary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#09090b] border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Total Txs</div>
                    <div className="text-base font-extrabold text-white mt-0.5">{txSummary.count}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#09090b] border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Total Expenses</div>
                    <div className="text-base font-extrabold text-rose-400 mt-0.5">{formatINR(txSummary.totalSpent)}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#09090b] border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Total Income</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">{formatINR(txSummary.totalIncome)}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#09090b] border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Avg Transaction</div>
                    <div className="text-base font-extrabold text-purple-300 mt-0.5">{formatINR(txSummary.avgTx)}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#09090b] border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Highest Tx</div>
                    <div className="text-base font-extrabold text-white mt-0.5">{formatINR(txSummary.highestTx)}</div>
                  </div>
                </div>

                {/* Transactions Table */}
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center text-xs text-zinc-500 bg-[#09090b] border border-zinc-800/80 rounded-2xl">
                    No transactions found for this user.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800/80 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 bg-[#09090b]">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Account</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-xs">
                        {filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4 text-zinc-400 font-mono">{formatDate(tx.date)}</td>
                            <td className="py-3.5 px-4 font-bold text-white">{tx.title}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {tx.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-300">{tx.accountName || 'Account'}</td>
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-extrabold ${
                                tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BUDGETS */}
            {adminTab === 'budgets' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Budget System Management — {selectedUser.fullName}
                    </h3>
                    <p className="text-xs text-zinc-400">Click any budget category to view limit status, variance, and monthly historical spending trends.</p>
                  </div>
                </div>

                {processedBudgets.length === 0 ? (
                  <div className="p-12 text-center text-xs text-zinc-500 bg-[#09090b] border border-zinc-800/80 rounded-2xl">
                    No budgets created by this user.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {processedBudgets.map((b) => {
                      const variance = b.limitAmount - b.spentAmount;
                      const pct = Math.round((b.spentAmount / (b.limitAmount || 1)) * 100);
                      const isExceeded = pct > 100;

                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBudgetDetail(b)}
                          className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-purple-500/60 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-base font-extrabold text-white">{b.category}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isExceeded
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : pct >= 85
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {isExceeded ? 'Exceeded' : pct >= 85 ? 'Near Limit' : 'Healthy'}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between text-xs mb-2">
                            <span className="text-zinc-400">
                              Spent: <strong className="text-white">{formatINR(b.spentAmount)}</strong> / Limit: {formatINR(b.limitAmount)}
                            </span>
                            <span className="font-extrabold text-purple-300 font-mono">{pct}%</span>
                          </div>

                          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 mb-4">
                            <div
                              className={`h-full rounded-full ${
                                isExceeded ? 'bg-rose-500' : pct >= 85 ? 'bg-amber-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                            <span>Remaining: <strong className="text-emerald-400">{formatINR(Math.max(0, variance))}</strong></span>
                            <span className="font-bold text-purple-400 group-hover:underline">View History & Trend →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: GOALS */}
            {adminTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Savings Goal & Suggestion Audit — {selectedUser.fullName}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Track goal suggestions sent to {selectedUser.fullName} and inspect their active savings goals.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsSuggestGoalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Suggest Goal</span>
                  </button>
                </div>

                {/* SENT GOAL SUGGESTIONS SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Sent Goal Suggestions ({userGoalSuggestions.length})</span>
                    </h4>
                  </div>

                  {userGoalSuggestions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500 bg-[#09090b] border border-zinc-800/80 rounded-2xl">
                      No goal suggestions sent to this user yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userGoalSuggestions.map((sug) => {
                        const statusColors: Record<string, string> = {
                          pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                          accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                          declined: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        };
                        return (
                          <div
                            key={sug.id}
                            className="bg-[#09090b] border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-2 relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-extrabold text-white">{sug.title}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                  statusColors[sug.status] || statusColors.pending
                                }`}
                              >
                                {sug.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <span>Target: <strong className="text-emerald-400 font-financial">{formatINR(sug.suggestedTargetAmount)}</strong></span>
                              <span>Deadline: <strong className="text-white font-mono">{formatDate(sug.suggestedTargetDate)}</strong></span>
                            </div>

                            {sug.message && (
                              <p className="text-[11px] text-zinc-400 italic bg-[#151518] p-2.5 rounded-xl border border-zinc-800/60 mt-2">
                                "{sug.message}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ACTIVE SAVINGS GOALS SECTION */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Active User Savings Goals ({userGoals.length})</span>
                  </h4>

                  {userGoals.length === 0 ? (
                    <div className="p-12 text-center text-xs text-zinc-500 bg-[#09090b] border border-zinc-800/80 rounded-2xl">
                      No active savings goals created by this user yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {userGoals.map((g) => {
                        const pct = Math.round((g.currentAmount / (g.targetAmount || 1)) * 100);
                        return (
                          <div
                            key={g.id}
                            onClick={() => setSelectedGoalDetail(g)}
                            className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-purple-500/60 transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-base font-extrabold text-white">{g.title}</span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {g.category || 'Savings'}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between text-xs mb-2">
                              <span className="text-zinc-400">
                                Saved: <strong className="text-emerald-400">{formatINR(g.currentAmount)}</strong> / Target: {formatINR(g.targetAmount)}
                              </span>
                              <span className="font-extrabold text-purple-300 font-mono">{pct}%</span>
                            </div>

                            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 mb-4">
                              <div className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                              <span>Deadline: <strong className="text-white">{formatDate(g.targetDate)}</strong></span>
                              <span className="font-bold text-purple-400 group-hover:underline">Contribution Log →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SPENDING LIMIT REPORT */}
            {adminTab === 'reports' && (
              <SpendingLimitReportView report={spendingReport} isAdminView={true} />
            )}

            {/* TAB 6: AUDIT TRAIL */}
            {adminTab === 'audit' && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white tracking-tight">Admin System Audit Trail</h3>
                <div className="divide-y divide-zinc-800/60 bg-[#09090b] border border-zinc-800 rounded-3xl p-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between px-3 hover:bg-zinc-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-white">
                            {log.action} — <span className="text-purple-300">{log.targetUserName}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {log.details} • Admin: {log.adminEmail}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-zinc-500 font-mono">{log.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: ACCOUNT DETAILS & TRANSACTION HISTORY */}
      {selectedAccountDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedAccountDetail(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Account Detail Panel</span>
              <h3 className="text-xl font-extrabold text-white">{selectedAccountDetail.name}</h3>
              <p className="text-xs text-zinc-400">
                User: <strong className="text-white">{selectedUser.fullName}</strong> • Masked Card: •••• {selectedAccountDetail.accountNumber}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-[#09090b] p-4 rounded-2xl border border-zinc-800 text-xs">
              <div>
                <div className="text-zinc-500 text-[10px]">Available Balance</div>
                <div className="text-lg font-extrabold text-emerald-400 font-financial mt-0.5">{formatINR(selectedAccountDetail.balance)}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">Account Type</div>
                <div className="text-xs font-bold text-white capitalize mt-1">{selectedAccountDetail.type}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">Created Date</div>
                <div className="text-xs font-bold text-zinc-300 mt-1">{selectedAccountDetail.createdAt || '2025-01-15'}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-white tracking-tight">Account Transaction History</h4>
              {accountTransactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 bg-[#09090b] rounded-2xl">No transactions found for this account.</div>
              ) : (
                <div className="divide-y divide-zinc-800/60 bg-[#09090b] border border-zinc-800 rounded-2xl p-2">
                  {accountTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{tx.title}</div>
                        <div className="text-[11px] text-zinc-400">{formatDate(tx.date)} • {tx.category}</div>
                      </div>
                      <div className={`font-extrabold font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BUDGET DETAILS & HISTORICAL TREND */}
      {selectedBudgetDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedBudgetDetail(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Budget Category Detail</span>
              <h3 className="text-xl font-extrabold text-white">{selectedBudgetDetail.category} Budget</h3>
              <p className="text-xs text-zinc-400">User: <strong className="text-white">{selectedUser.fullName}</strong></p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#09090b] p-4 rounded-2xl border border-zinc-800 text-xs">
              <div>
                <div className="text-zinc-500 text-[10px]">Monthly Limit</div>
                <div className="text-sm font-extrabold text-white font-financial mt-0.5">{formatINR(selectedBudgetDetail.limitAmount)}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">Amount Spent</div>
                <div className="text-sm font-extrabold text-purple-300 font-financial mt-0.5">{formatINR(selectedBudgetDetail.spentAmount)}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">Remaining Amount</div>
                <div className="text-sm font-extrabold text-emerald-400 font-financial mt-0.5">{formatINR(Math.max(0, selectedBudgetDetail.limitAmount - selectedBudgetDetail.spentAmount))}</div>
              </div>
            </div>

            {/* Monthly Trend Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-white tracking-tight">Historical Monthly Spending Trend</h4>
              <div className="space-y-2 bg-[#09090b] border border-zinc-800 rounded-2xl p-4 text-xs">
                {((FALLBACK_USER_DATA[selectedUser.id]?.monthlyCategoryHistory[selectedBudgetDetail.category]) || [
                  { month: 'May 2026', amount: 5200 },
                  { month: 'June 2026', amount: 6100 },
                  { month: 'July 2026', amount: 4900 },
                  { month: 'August 2026', amount: 7200 },
                  { month: 'September 2026', amount: 5800 },
                  { month: 'October 2026', amount: selectedBudgetDetail.spentAmount }
                ]).map((hist: { month: string; amount: number }) => (
                  <div key={hist.month} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0">
                    <span className="text-zinc-300 font-bold">{hist.month}</span>
                    <span className="font-mono text-purple-300 font-extrabold">{formatINR(hist.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GOAL DETAIL & CONTRIBUTION HISTORY */}
      {selectedGoalDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedGoalDetail(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Goal Detail & History</span>
              <h3 className="text-xl font-extrabold text-white">{selectedGoalDetail.title}</h3>
              <p className="text-xs text-zinc-400">User: <strong className="text-white">{selectedUser.fullName}</strong> • Deadline: {formatDate(selectedGoalDetail.targetDate)}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#09090b] p-4 rounded-2xl border border-zinc-800 text-xs">
              <div>
                <div className="text-zinc-500 text-[10px]">Target Amount</div>
                <div className="text-sm font-extrabold text-white font-financial mt-0.5">{formatINR(selectedGoalDetail.targetAmount)}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">Current Saved</div>
                <div className="text-sm font-extrabold text-emerald-400 font-financial mt-0.5">{formatINR(selectedGoalDetail.currentAmount)}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">Remaining</div>
                <div className="text-sm font-extrabold text-purple-300 font-financial mt-0.5">{formatINR(Math.max(0, selectedGoalDetail.targetAmount - selectedGoalDetail.currentAmount))}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-white tracking-tight">Contribution History Log</h4>
              <div className="space-y-2 bg-[#09090b] border border-zinc-800 rounded-2xl p-4 text-xs">
                {((FALLBACK_USER_DATA[selectedUser.id]?.goalContributions[selectedGoalDetail.id]) || [
                  { date: '2026-10-01', amount: 10000, notes: 'Monthly salary allocation' },
                  { date: '2026-09-15', amount: 15000, notes: 'Bonus deposit' }
                ]).map((contrib: { date: string; amount: number; notes: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
                    <div>
                      <div className="font-bold text-white">{contrib.notes}</div>
                      <div className="text-[10px] text-zinc-400">{formatDate(contrib.date)}</div>
                    </div>
                    <div className="font-mono text-emerald-400 font-extrabold">+{formatINR(contrib.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN GOAL SUGGESTION FORM */}
      {isSuggestGoalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsSuggestGoalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Suggest Financial Goal</span>
              <h3 className="text-lg font-extrabold text-white">Send Goal Suggestion to {selectedUser.fullName}</h3>
              <p className="text-xs text-zinc-400 leading-snug">
                Creates a goal suggestion notification for {selectedUser.fullName}. The goal is created ONLY if the user accepts it.
              </p>
            </div>

            <form onSubmit={handleSendGoalSuggestion} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={suggestTitle}
                  onChange={(e) => setSuggestTitle(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Suggested Target (₹)</label>
                  <input
                    type="number"
                    value={suggestTarget}
                    onChange={(e) => setSuggestTarget(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Suggested Deadline</label>
                  <input
                    type="date"
                    value={suggestDate}
                    onChange={(e) => setSuggestDate(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={suggestMessage}
                  onChange={(e) => setSuggestMessage(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-900/40 transition-all"
              >
                Send Suggestion to {selectedUser.fullName}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADMIN NOTIFICATION SENDER FORM */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsNotifModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">User Messaging</span>
              <h3 className="text-lg font-extrabold text-white">Send Notification to {selectedUser.fullName}</h3>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Priority Level</label>
                <select
                  value={notifPriority}
                  onChange={(e) => setNotifPriority(e.target.value as any)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="important">Important Priority</option>
                  <option value="high">High Priority Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-900/40 transition-all"
              >
                Send Notification to {selectedUser.fullName}
              </button>
            </form>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
};

// Helper icon component for transaction tab
const ArrowLeftRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </svg>
);
