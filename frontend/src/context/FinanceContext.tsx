import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { Account, Transaction, Budget, Goal, NotificationItem, FinancialSummary, GoalSuggestion } from '../types';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  notifications: NotificationItem[];
  goalSuggestions: GoalSuggestion[];
  summary: FinancialSummary;
  loading: boolean;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addAccount: (acc: Omit<Account, 'id'>) => Promise<Account>;
  updateAccount: (id: string, acc: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  syncAccountTransactions: (accountId: string) => Promise<number>;

  addBudget: (b: Omit<Budget, 'id' | 'spentAmount'>) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addGoal: (g: Omit<Goal, 'id' | 'currentAmount'>) => Promise<Goal>;
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>;
  addMoneyToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Goal Suggestions & Admin Notifications
  sendGoalSuggestion: (suggestion: Omit<GoalSuggestion, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  acceptGoalSuggestion: (suggestionId: string, fallbackData?: { title: string; targetAmount: number; targetDate: string; category?: string }) => Promise<Goal | null>;
  declineGoalSuggestion: (suggestionId: string) => Promise<void>;
  sendAdminNotification: (userId: string, notification: { title: string; message: string; priority?: 'normal' | 'important' | 'high'; type?: 'info' | 'warning' | 'success' | 'alert' }) => Promise<void>;

  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Initial Mock Seed Data
const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'HDFC Savings',
    type: 'savings',
    balance: 45000,
    accountNumber: '5087',
    bankName: 'HDFC Bank',
    colorGradient: 'from-purple-600 via-indigo-700 to-slate-900',
    isPrimary: true
  },
  {
    id: 'acc-2',
    name: 'SBI Account',
    type: 'checking',
    balance: 30500,
    accountNumber: '4218',
    bankName: 'State Bank of India',
    colorGradient: 'from-blue-600 via-cyan-700 to-slate-900',
    isPrimary: false
  },
  {
    id: 'acc-3',
    name: 'Cash Wallet',
    type: 'cash',
    balance: 4000,
    accountNumber: 'CASH',
    colorGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    isPrimary: false
  },
  {
    id: 'acc-4',
    name: 'ICICI Credit Card',
    type: 'credit',
    balance: 45000,
    accountNumber: '9904',
    bankName: 'ICICI Bank',
    colorGradient: 'from-rose-600 via-orange-700 to-slate-900',
    isPrimary: false
  }
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    accountName: 'HDFC Savings',
    title: 'Monthly Direct Payroll',
    category: 'Salary',
    amount: 75000,
    type: 'income',
    date: '2026-10-01',
    time: '09:00',
    notes: 'October monthly salary credited'
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    accountName: 'HDFC Savings',
    title: 'Amazon Online Shopping',
    category: 'Shopping',
    amount: 2499,
    type: 'expense',
    date: '2026-10-07',
    time: '18:45',
    notes: 'Wireless headphones'
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    accountName: 'HDFC Savings',
    title: 'Swiggy Gourmet Delivery',
    category: 'Food',
    amount: 450,
    type: 'expense',
    date: '2026-10-08',
    time: '20:15',
    notes: 'Dinner order'
  },
  {
    id: 'tx-4',
    accountId: 'acc-2',
    accountName: 'SBI Account',
    title: 'Electricity & Utility Bill',
    category: 'Bills',
    amount: 3200,
    type: 'expense',
    date: '2026-10-05',
    time: '11:30',
    notes: 'Home electricity payment'
  },
  {
    id: 'tx-5',
    accountId: 'acc-3',
    accountName: 'Cash Wallet',
    title: 'Uber Cab Ride',
    category: 'Transport',
    amount: 380,
    type: 'expense',
    date: '2026-10-06',
    time: '14:20'
  },
  {
    id: 'tx-6',
    accountId: 'acc-2',
    accountName: 'SBI Account',
    title: 'Freelance Design Consulting',
    category: 'Income',
    amount: 15000,
    type: 'income',
    date: '2026-10-04',
    time: '16:00',
    notes: 'UI audit project payout'
  },
  {
    id: 'tx-7',
    accountId: 'acc-1',
    accountName: 'HDFC Savings',
    title: 'Cult.Fit Gym Membership',
    category: 'Healthcare',
    amount: 1800,
    type: 'expense',
    date: '2026-10-02',
    time: '08:00'
  }
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Shopping Budget Alert',
    message: 'Shopping budget is at 97.5% limit (₹7,800 / ₹8,000).',
    type: 'warning',
    priority: 'important',
    read: false,
    timestamp: '2 hours ago'
  },
  {
    id: 'n-2',
    title: 'Salary Credited',
    message: 'Monthly salary of ₹75,000 received in HDFC Savings.',
    type: 'success',
    priority: 'normal',
    read: false,
    timestamp: '1 day ago'
  },
  {
    id: 'n-3',
    title: 'New Goal Suggestion',
    message: 'Admin suggested: Emergency Fund (Target ₹1,00,000 by 30 Jun 2027). "Consider building an emergency fund based on your spending pattern."',
    type: 'info',
    priority: 'high',
    read: false,
    timestamp: 'Just now',
    suggestionData: {
      suggestionId: 'sug-seed-1',
      title: 'Emergency Fund',
      targetAmount: 100000,
      targetDate: '2027-06-30',
      category: 'Savings',
      message: 'Consider building an emergency fund based on your spending pattern.'
    }
  }
];

const SEED_BUDGETS: Budget[] = [
  { id: 'b-seed-1', userId: '00000000-0000-4000-a000-000000000001', category: 'Food', limitAmount: 12000, spentAmount: 450, period: 'monthly' },
  { id: 'b-seed-2', userId: '00000000-0000-4000-a000-000000000001', category: 'Shopping', limitAmount: 8000, spentAmount: 2499, period: 'monthly' },
  { id: 'b-seed-3', userId: '00000000-0000-4000-a000-000000000001', category: 'Bills', limitAmount: 10000, spentAmount: 3200, period: 'monthly' }
];

const SEED_GOALS: Goal[] = [
  { id: 'g-seed-1', userId: '00000000-0000-4000-a000-000000000001', title: 'New Macbook Pro M3', targetAmount: 150000, currentAmount: 65000, targetDate: '2027-04-30', category: 'Gadgets' },
  { id: 'g-seed-2', userId: '00000000-0000-4000-a000-000000000001', title: 'Emergency Reserve', targetAmount: 100000, currentAmount: 45000, targetDate: '2027-06-30', category: 'Savings' }
];

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getStorageKey = (key: string, userId?: string) => {
  const uid = userId || 'guest-user-123';
  return `fm_${key}_${uid}`;
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();
  const currentUserId = user?.id || 'guest-user-123';

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [goalSuggestions, setGoalSuggestions] = useState<GoalSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync to user-scoped localStorage
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem(getStorageKey('accounts', currentUserId), JSON.stringify(accounts));
    }
  }, [accounts, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('transactions', currentUserId), JSON.stringify(transactions));
  }, [transactions, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('budgets', currentUserId), JSON.stringify(budgets));
  }, [budgets, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('goals', currentUserId), JSON.stringify(goals));
  }, [goals, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('notifications', currentUserId), JSON.stringify(notifications));
  }, [notifications, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('goal_suggestions', currentUserId), JSON.stringify(goalSuggestions));
  }, [goalSuggestions, currentUserId]);

  // Fetch Supabase data or reload from storage for current user
  const refreshData = async () => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';

    try {
      setLoading(true);

      const savedAccRaw = localStorage.getItem(getStorageKey('accounts', activeUid));
      const localAccs: Account[] = savedAccRaw ? JSON.parse(savedAccRaw) : [];

      const savedTxRaw = localStorage.getItem(getStorageKey('transactions', activeUid));
      const localTx: Transaction[] = savedTxRaw ? JSON.parse(savedTxRaw) : [];

      const savedBRaw = localStorage.getItem(getStorageKey('budgets', activeUid));
      const localB: Budget[] = savedBRaw ? JSON.parse(savedBRaw) : [];

      const savedGRaw = localStorage.getItem(getStorageKey('goals', activeUid));
      const localG: Goal[] = savedGRaw ? JSON.parse(savedGRaw) : [];

      const savedNRaw = localStorage.getItem(getStorageKey('notifications', activeUid));
      const localN: NotificationItem[] = savedNRaw ? JSON.parse(savedNRaw) : [];

      const savedSRaw = localStorage.getItem(getStorageKey('goal_suggestions', activeUid));
      const localS: GoalSuggestion[] = savedSRaw ? JSON.parse(savedSRaw) : [];

      if (!isGuest && user?.id) {
        // 1. Accounts
        let mappedAcc: Account[] = [];
        const { data: accData, error: accErr } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);

        if (accErr) {
          console.error('Supabase fetch accounts error:', accErr);
        } else if (accData) {
          mappedAcc = accData.map(a => ({
            id: a.id,
            userId: a.user_id,
            name: a.name,
            type: a.type,
            balance: Number(a.balance),
            accountNumber: a.account_number,
            colorGradient: a.color_gradient || 'from-purple-600 via-indigo-700 to-slate-900',
            isPrimary: a.is_primary,
            isConnected: a.is_connected,
            syncStatus: a.sync_status,
            lastSyncedAt: a.last_synced_at
          }));
        }

        const isMockAccId = (id: string) => [
          'acc-1', 'acc-2', 'acc-3', 'acc-4',
          'acc-r1', 'acc-r2', 'acc-r3', 'acc-r4',
          'acc-v1', 'acc-v2', 'acc-v3',
          'acc-p1', 'acc-p2',
          'acc-d1'
        ].includes(id);

        const cleanLocalAccs = localAccs.filter(a => !isMockAccId(a.id));

        const accMap = new Map<string, Account>();
        cleanLocalAccs.forEach(a => accMap.set(a.id, a));
        mappedAcc.forEach(a => accMap.set(a.id, a));
        const mergedAcc = Array.from(accMap.values()).filter(a => !isMockAccId(a.id));

        setAccounts(mergedAcc);
        localStorage.setItem(getStorageKey('accounts', activeUid), JSON.stringify(mergedAcc));

        // 2. Transactions
        let mappedTx: Transaction[] = [];
        const { data: txData, error: txErr } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (txErr) {
          console.error('Supabase fetch transactions error:', txErr);
        } else if (txData) {
          mappedTx = txData.map(t => ({
            id: t.id,
            userId: t.user_id,
            accountId: t.account_id,
            accountName: t.account_name || 'Account',
            title: t.title,
            category: t.category,
            amount: Number(t.amount),
            type: t.type,
            date: t.date,
            time: t.time,
            notes: t.notes
          }));
        }

        const txMap = new Map<string, Transaction>();
        localTx.forEach(t => txMap.set(t.id, t));
        mappedTx.forEach(t => txMap.set(t.id, t));
        let mergedTx = Array.from(txMap.values());

        if (mappedTx.length === 0 && mergedTx.every(t => ['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5', 'tx-6', 'tx-7'].includes(t.id))) {
          mergedTx = [];
        }

        setTransactions(mergedTx);
        localStorage.setItem(getStorageKey('transactions', activeUid), JSON.stringify(mergedTx));

        // 3. Budgets
        let mappedB: Budget[] = [];
        const { data: bData, error: bErr } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);

        if (bErr) {
          console.error('Supabase fetch budgets error:', bErr);
        } else if (bData) {
          mappedB = bData.map(b => ({
            id: b.id,
            userId: b.user_id,
            category: b.category,
            limitAmount: Number(b.limit_amount),
            spentAmount: 0,
            period: b.period || 'monthly'
          }));
        }

        const bMap = new Map<string, Budget>();
        localB.forEach(b => bMap.set(b.id, b));
        mappedB.forEach(b => bMap.set(b.id, b));
        let mergedB = Array.from(bMap.values());

        if (mappedB.length === 0 && mergedB.every(b => ['b-1', 'b-2', 'b-3'].includes(b.id))) {
          mergedB = [];
        }

        setBudgets(mergedB);
        localStorage.setItem(getStorageKey('budgets', activeUid), JSON.stringify(mergedB));

        // 4. Goals
        let mappedG: Goal[] = [];
        const { data: gData, error: gErr } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id);

        if (gErr) {
          console.error('Supabase fetch goals error:', gErr);
        } else if (gData) {
          mappedG = gData.map(g => ({
            id: g.id,
            userId: g.user_id,
            title: g.title,
            targetAmount: Number(g.target_amount),
            currentAmount: Number(g.current_amount),
            targetDate: g.target_date,
            category: g.category
          }));
        }

        const gMap = new Map<string, Goal>();
        localG.forEach(g => gMap.set(g.id, g));
        mappedG.forEach(g => gMap.set(g.id, g));
        let mergedG = Array.from(gMap.values());

        if (mappedG.length === 0 && mergedG.every(g => ['g-1', 'g-2'].includes(g.id))) {
          mergedG = [];
        }

        setGoals(mergedG);
        localStorage.setItem(getStorageKey('goals', activeUid), JSON.stringify(mergedG));

        // 5. Notifications
        let mappedN: NotificationItem[] = [];
        const { data: notifData, error: notifErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (notifErr) {
          console.error('Supabase fetch notifications error:', notifErr);
        } else if (notifData) {
          mappedN = notifData.map(n => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type || 'info',
            read: n.read ?? false,
            timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'
          }));
        }

        const nMap = new Map<string, NotificationItem>();
        localN.forEach(n => nMap.set(n.id, n));
        mappedN.forEach(n => nMap.set(n.id, n));
        const mergedN = Array.from(nMap.values());
        setNotifications(mergedN);
        localStorage.setItem(getStorageKey('notifications', activeUid), JSON.stringify(mergedN));

        // 6. Goal Suggestions
        let mappedS: GoalSuggestion[] = [];
        const { data: sugData, error: sugErr } = await supabase
          .from('goal_suggestions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sugErr) {
          console.error('Supabase fetch goal suggestions error:', sugErr);
        } else if (sugData) {
          mappedS = sugData.map(s => ({
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
        localS.forEach(s => sMap.set(s.id, s));
        mappedS.forEach(s => sMap.set(s.id, s));
        const mergedS = Array.from(sMap.values());
        setGoalSuggestions(mergedS);
        localStorage.setItem(getStorageKey('goal_suggestions', activeUid), JSON.stringify(mergedS));

        return;
      }

      // Guest user fallback
      setAccounts(localAccs.length > 0 ? localAccs : SEED_ACCOUNTS);
      setTransactions(localTx.length > 0 ? localTx : SEED_TRANSACTIONS);
      setBudgets(localB.length > 0 ? localB : SEED_BUDGETS);
      setGoals(localG.length > 0 ? localG : SEED_GOALS);
      setNotifications(localN);
      setGoalSuggestions(localS);
    } catch (err) {
      console.error('FinanceContext refreshData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, isGuest]);

  // Financial summary
  const summary: FinancialSummary = useMemo(() => {
    const totalBalance = accounts.reduce((sum, a) => sum + (a.type === 'credit' ? 0 : Number(a.balance)), 0);
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthIncome = transactions
      .filter(t => {
        if (t.type !== 'income') return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentMonthExpenses = transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = currentMonthIncome > 0 
      ? currentMonthIncome 
      : transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = currentMonthExpenses > 0 
      ? currentMonthExpenses 
      : transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Number(((totalSavings / totalIncome) * 100).toFixed(1)) : 0;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      incomeChangePercentage: 8.2,
      expenseChangePercentage: -4.1
    };
  }, [accounts, transactions]);

  // Update budget spent dynamically from category transactions
  const processedBudgets = useMemo(() => {
    return budgets.map(b => {
      const categorySpent = transactions
        .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { ...b, spentAmount: categorySpent };
    });
  }, [budgets, transactions]);

  // TRANSACTION ACTIONS
  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    try {
      const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
      const newId = generateUUID();
      const newTx: Transaction = { ...txData, id: newId, userId: activeUid };

      setTransactions(prev => {
        const updated = [newTx, ...prev];
        localStorage.setItem(getStorageKey('transactions', activeUid), JSON.stringify(updated));
        return updated;
      });

      setAccounts(prevAccounts => {
        const updated = prevAccounts.map(acc => {
          if (acc && acc.id === txData.accountId) {
            const delta = txData.type === 'income' ? Number(txData.amount) : -Number(txData.amount);
            return { ...acc, balance: Math.max(0, (acc.balance || 0) + delta) };
          }
          return acc;
        });
        localStorage.setItem(getStorageKey('accounts', activeUid), JSON.stringify(updated));
        return updated;
      });

      window.dispatchEvent(new Event('finance_data_changed'));

      if (!isGuest && user?.id) {
        try {
          await supabase.from('transactions').insert({
            id: newId,
            user_id: user.id,
            account_id: txData.accountId,
            title: txData.title,
            category: txData.category,
            amount: txData.amount,
            type: txData.type,
            date: txData.date,
            time: txData.time,
            notes: txData.notes
          });

          const targetAcc = accounts.find(a => a && a.id === txData.accountId);
          if (targetAcc) {
            const delta = txData.type === 'income' ? Number(txData.amount) : -Number(txData.amount);
            await supabase.from('accounts').update({
              balance: (targetAcc.balance || 0) + delta
            }).eq('id', txData.accountId);
          }
        } catch (err) {
          console.error('Supabase addTransaction error:', err);
        }
      }
    } catch (e) {
      console.error('addTransaction error:', e);
    }
  };

  const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    setTransactions(prev => {
      const res = prev.map(t => t.id === id ? { ...t, ...updated } : t);
      localStorage.setItem(getStorageKey('transactions', activeUid), JSON.stringify(res));
      return res;
    });

    const newTx = { ...oldTx, ...updated };
    const oldDelta = oldTx.type === 'income' ? -Number(oldTx.amount) : Number(oldTx.amount);
    const newDelta = newTx.type === 'income' ? Number(newTx.amount) : -Number(newTx.amount);

    setAccounts(prev => {
      const res = prev.map(acc => {
        if (acc.id === oldTx.accountId && oldTx.accountId === newTx.accountId) {
          return { ...acc, balance: acc.balance + oldDelta + newDelta };
        }
        if (acc.id === oldTx.accountId) {
          return { ...acc, balance: acc.balance + oldDelta };
        }
        if (acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance + newDelta };
        }
        return acc;
      });
      localStorage.setItem(getStorageKey('accounts', activeUid), JSON.stringify(res));
      return res;
    });

    window.dispatchEvent(new Event('finance_data_changed'));
  };

  const deleteTransaction = async (id: string) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    setTransactions(prev => {
      const res = prev.filter(t => t.id !== id);
      localStorage.setItem(getStorageKey('transactions', activeUid), JSON.stringify(res));
      return res;
    });

    const reverseDelta = oldTx.type === 'income' ? -Number(oldTx.amount) : Number(oldTx.amount);
    setAccounts(prev => {
      const res = prev.map(acc => acc.id === oldTx.accountId ? { ...acc, balance: acc.balance + reverseDelta } : acc);
      localStorage.setItem(getStorageKey('accounts', activeUid), JSON.stringify(res));
      return res;
    });

    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id) {
      await supabase.from('transactions').delete().eq('id', id);
    }
  };

  // ACCOUNT ACTIONS
  const addAccount = async (acc: Omit<Account, 'id'>): Promise<Account> => {
    try {
      const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
      const newId = generateUUID();
      const newAcc: Account = { ...acc, id: newId, userId: activeUid };

      const isMockAccId = (id: string) => [
        'acc-1', 'acc-2', 'acc-3', 'acc-4',
        'acc-r1', 'acc-r2', 'acc-r3', 'acc-r4',
        'acc-v1', 'acc-v2', 'acc-v3',
        'acc-p1', 'acc-p2',
        'acc-d1'
      ].includes(id);

      setAccounts(prev => {
        const cleanPrev = prev.filter(a => !isMockAccId(a.id));
        const updated = [...cleanPrev, newAcc];
        localStorage.setItem(getStorageKey('accounts', activeUid), JSON.stringify(updated));
        return updated;
      });
      window.dispatchEvent(new Event('finance_data_changed'));

      if (!isGuest && user?.id) {
        try {
          const { error: insertErr } = await supabase.from('accounts').insert({
            id: newId,
            user_id: user.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            account_number: acc.accountNumber,
            color_gradient: acc.colorGradient,
            is_primary: acc.isPrimary,
            is_connected: acc.isConnected || false,
            sync_status: acc.syncStatus || 'manual',
            last_synced_at: acc.lastSyncedAt || null
          });
          if (insertErr) {
            console.error('Supabase addAccount insert error:', insertErr);
          }
        } catch (err) {
          console.error('Supabase addAccount error:', err);
        }
      }
      return newAcc;
    } catch (e) {
      console.error('addAccount error:', e);
      return { ...acc, id: generateUUID() };
    }
  };

  const updateAccount = async (id: string, updated: Partial<Account>) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    setAccounts(prev => {
      const res = prev.map(a => a.id === id ? { ...a, ...updated } : a);
      localStorage.setItem(getStorageKey('accounts', activeUid), JSON.stringify(res));
      return res;
    });
    window.dispatchEvent(new Event('finance_data_changed'));
    if (!isGuest && user?.id) {
      await supabase.from('accounts').update(updated).eq('id', id);
    }
  };

  const deleteAccount = async (id: string) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    setAccounts(prev => {
      const res = prev.filter(a => a.id !== id);
      localStorage.setItem(getStorageKey('accounts', activeUid), JSON.stringify(res));
      return res;
    });
    window.dispatchEvent(new Event('finance_data_changed'));
    if (!isGuest && user?.id) {
      await supabase.from('accounts').delete().eq('id', id);
    }
  };

  const syncAccountTransactions = async (accountId: string): Promise<number> => {
    return 0;
  };

  // BUDGET ACTIONS
  const addBudget = async (b: Omit<Budget, 'id' | 'spentAmount'>) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    const newId = generateUUID();
    const newBudget: Budget = { ...b, id: newId, userId: activeUid, spentAmount: 0 };

    setBudgets(prev => {
      const updated = [...prev, newBudget];
      localStorage.setItem(getStorageKey('budgets', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id) {
      try {
        await supabase.from('budgets').insert({
          id: newId,
          user_id: user.id,
          category: b.category,
          limit_amount: b.limitAmount,
          period: b.period
        });
      } catch (err) {
        console.error('Supabase addBudget error:', err);
      }
    }
  };

  const updateBudget = async (id: string, b: Partial<Budget>) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    setBudgets(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...b } : item);
      localStorage.setItem(getStorageKey('budgets', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id) {
      try {
        const payload: any = {};
        if (b.category !== undefined) payload.category = b.category;
        if (b.limitAmount !== undefined) payload.limit_amount = b.limitAmount;
        if (b.period !== undefined) payload.period = b.period;
        await supabase.from('budgets').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateBudget error:', err);
      }
    }
  };

  const deleteBudget = async (id: string) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    setBudgets(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem(getStorageKey('budgets', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id) {
      await supabase.from('budgets').delete().eq('id', id);
    }
  };

  // GOAL ACTIONS
  const addGoal = async (g: Omit<Goal, 'id' | 'currentAmount'>): Promise<Goal> => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    const newId = generateUUID();
    const newGoal: Goal = { ...g, id: newId, userId: activeUid, currentAmount: 0 };

    setGoals(prev => {
      const updated = [newGoal, ...prev];
      localStorage.setItem(getStorageKey('goals', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id) {
      try {
        await supabase.from('goals').insert({
          id: newId,
          user_id: user.id,
          title: g.title,
          target_amount: g.targetAmount,
          current_amount: 0,
          target_date: g.targetDate,
          category: g.category
        });
      } catch (e) {
        console.error('Supabase addGoal error:', e);
      }
    }
    return newGoal;
  };

  const updateGoal = async (id: string, g: Partial<Goal>) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    setGoals(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...g } : item);
      localStorage.setItem(getStorageKey('goals', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id) {
      try {
        const payload: any = {};
        if (g.title !== undefined) payload.title = g.title;
        if (g.targetAmount !== undefined) payload.target_amount = g.targetAmount;
        if (g.currentAmount !== undefined) payload.current_amount = g.currentAmount;
        if (g.targetDate !== undefined) payload.target_date = g.targetDate;
        if (g.category !== undefined) payload.category = g.category;
        await supabase.from('goals').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateGoal error:', err);
      }
    }
  };

  const addMoneyToGoal = async (id: string, amount: number) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    const targetGoal = goals.find(g => g.id === id);
    const newAmt = targetGoal ? targetGoal.currentAmount + amount : amount;

    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g);
      localStorage.setItem(getStorageKey('goals', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    const notifId = generateUUID();
    if (targetGoal) {
      const newNotif: NotificationItem = {
        id: notifId,
        title: 'Goal Contribution',
        message: `Added ₹${amount.toLocaleString()} to ${targetGoal.title}`,
        type: 'success',
        read: false,
        timestamp: 'Just now'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    if (!isGuest && user?.id) {
      try {
        await supabase.from('goals').update({ current_amount: newAmt }).eq('id', id);
        if (targetGoal) {
          await supabase.from('notifications').insert({
            id: notifId,
            user_id: user.id,
            title: 'Goal Contribution',
            message: `Added ₹${amount.toLocaleString()} to ${targetGoal.title}`,
            type: 'success',
            read: false
          });
        }
      } catch (e) {
        console.error('Supabase addMoneyToGoal error:', e);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      localStorage.setItem(getStorageKey('goals', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id) {
      await supabase.from('goals').delete().eq('id', id);
    }
  };

  // ADMIN GOAL SUGGESTIONS & NOTIFICATIONS
  const sendGoalSuggestion = async (sugData: Omit<GoalSuggestion, 'id' | 'status' | 'createdAt'>) => {
    const sugId = generateUUID();
    const notifId = generateUUID();
    const targetUid = sugData.userId || '00000000-0000-4000-a000-000000000001';

    const newSug: GoalSuggestion = {
      ...sugData,
      id: sugId,
      userId: targetUid,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setGoalSuggestions(prev => {
      const updated = [newSug, ...prev];
      localStorage.setItem(getStorageKey('goal_suggestions', targetUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    // Send notification to target user
    const newNotif: NotificationItem = {
      id: notifId,
      userId: targetUid,
      title: 'New Goal Suggestion',
      message: `Admin suggested: ${sugData.title} (Target ₹${sugData.suggestedTargetAmount.toLocaleString()} by ${sugData.suggestedTargetDate}). "${sugData.message}"`,
      type: 'info',
      priority: 'high',
      read: false,
      timestamp: 'Just now',
      suggestionData: {
        suggestionId: sugId,
        title: sugData.title,
        targetAmount: sugData.suggestedTargetAmount,
        targetDate: sugData.suggestedTargetDate,
        category: sugData.category || 'Savings',
        message: sugData.message
      }
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (!isGuest && user?.id) {
      try {
        await supabase.from('goal_suggestions').insert({
          id: sugId,
          user_id: targetUid,
          admin_email: sugData.adminEmail || 'admin@financemanager.io',
          title: sugData.title,
          suggested_target_amount: sugData.suggestedTargetAmount,
          suggested_target_date: sugData.suggestedTargetDate,
          category: sugData.category || 'Savings',
          message: sugData.message,
          status: 'pending'
        });

        await supabase.from('notifications').insert({
          id: notifId,
          user_id: targetUid,
          title: newNotif.title,
          message: newNotif.message,
          type: 'info',
          read: false
        });
      } catch (e) {
        console.error('Supabase sendGoalSuggestion error:', e);
      }
    }
  };

  const acceptGoalSuggestion = async (
    suggestionId: string,
    fallbackData?: { title: string; targetAmount: number; targetDate: string; category?: string }
  ): Promise<Goal | null> => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';

    // 1. Locate suggestion in state or use fallback values
    const sug = goalSuggestions.find(s => s.id === suggestionId);

    const title = sug?.title || fallbackData?.title || 'Emergency Fund';
    const targetAmount = Number(sug?.suggestedTargetAmount || fallbackData?.targetAmount || 150000);
    const targetDate = sug?.suggestedTargetDate || fallbackData?.targetDate || '2026-10-22';
    const category = sug?.category || fallbackData?.category || 'Savings';

    // 2. Idempotency Check: Avoid creating duplicate goals if goal already exists for this title & amount
    let targetGoal = goals.find(
      g => g.title.toLowerCase().trim() === title.toLowerCase().trim() && Number(g.targetAmount) === targetAmount
    );

    if (!targetGoal) {
      targetGoal = await addGoal({
        title,
        targetAmount,
        targetDate,
        category
      });
    }

    // 3. Mark suggestion status as 'accepted' locally & in LocalStorage
    setGoalSuggestions(prev => {
      const updated = prev.map(s => (s.id === suggestionId || (sug && s.id === sug.id)) ? { ...s, status: 'accepted' as const } : s);
      localStorage.setItem(getStorageKey('goal_suggestions', activeUid), JSON.stringify(updated));
      return updated;
    });

    const acceptNotifId = generateUUID();
    const acceptNotif: NotificationItem = {
      id: acceptNotifId,
      userId: activeUid,
      title: 'Goal Accepted',
      message: `Accepted suggested goal "${title}" and created financial target of ₹${targetAmount.toLocaleString()}.`,
      type: 'success',
      read: true,
      timestamp: 'Just now'
    };
    setNotifications(prev => [acceptNotif, ...prev]);

    // 4. Persist suggestion status change & notification to Supabase
    if (!isGuest && activeUid) {
      try {
        if (suggestionId && !suggestionId.startsWith('notif-sug-')) {
          await supabase.from('goal_suggestions').update({ status: 'accepted' }).eq('id', suggestionId);
        }
        await supabase.from('notifications').insert({
          id: acceptNotifId,
          user_id: activeUid,
          title: acceptNotif.title,
          message: acceptNotif.message,
          type: 'success',
          read: true
        });
      } catch (e) {
        console.error('Supabase acceptGoalSuggestion error:', e);
      }
    }

    // 5. Invalidate caches & notify both User & Admin portals
    window.dispatchEvent(new Event('finance_data_changed'));
    window.dispatchEvent(new Event('storage'));

    return targetGoal;
  };

  const declineGoalSuggestion = async (suggestionId: string) => {
    const activeUid = user?.id || '00000000-0000-4000-a000-000000000001';
    setGoalSuggestions(prev => {
      const updated = prev.map(s => s.id === suggestionId ? { ...s, status: 'declined' as const } : s);
      localStorage.setItem(getStorageKey('goal_suggestions', activeUid), JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('finance_data_changed'));

    if (!isGuest && user?.id && suggestionId) {
      try {
        await supabase.from('goal_suggestions').update({ status: 'declined' }).eq('id', suggestionId);
      } catch (e) {
        console.error('Supabase declineGoalSuggestion error:', e);
      }
    }
  };

  const sendAdminNotification = async (
    targetUserId: string,
    notificationData: { title: string; message: string; priority?: 'normal' | 'important' | 'high'; type?: 'info' | 'warning' | 'success' | 'alert' }
  ) => {
    const notifId = generateUUID();
    const newNotif: NotificationItem = {
      id: notifId,
      userId: targetUserId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      priority: notificationData.priority || 'normal',
      read: false,
      timestamp: 'Just now'
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (!isGuest && user?.id) {
      try {
        await supabase.from('notifications').insert({
          id: notifId,
          user_id: targetUserId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          read: false
        });
      } catch (e) {
        console.error('Supabase sendAdminNotification error:', e);
      }
    }
  };

  // NOTIFICATION ACTIONS
  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!isGuest && user?.id) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch (e) {
        console.error('Supabase markNotificationAsRead error:', e);
      }
    }
  };

  const clearAllNotifications = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (!isGuest && user?.id) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      } catch (e) {
        console.error('Supabase clearAllNotifications error:', e);
      }
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        budgets: processedBudgets,
        goals,
        notifications,
        goalSuggestions,
        summary,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        syncAccountTransactions,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        addMoneyToGoal,
        deleteGoal,
        sendGoalSuggestion,
        acceptGoalSuggestion,
        declineGoalSuggestion,
        sendAdminNotification,
        markNotificationAsRead,
        clearAllNotifications,
        refreshData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
