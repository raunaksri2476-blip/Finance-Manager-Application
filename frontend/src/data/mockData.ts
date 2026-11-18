import { AccountCard, BudgetCategory, CashbackPartner, FinancialTip, Transaction } from '../types';

export const initialCards: AccountCard[] = [
  {
    id: 'card-1',
    holderName: 'Josh Hill',
    balance: 15630.71,
    accountNumber: '** 5087',
    cardLast4: '3264',
    cardBrand: 'mastercard',
    label: 'Primary Checking',
    gradient: 'from-[#232329] via-[#1a1a1f] to-[#141417]'
  },
  {
    id: 'card-2',
    holderName: 'Josh Hill',
    balance: 4820.50,
    accountNumber: '** 9912',
    cardLast4: '8841',
    cardBrand: 'visa',
    label: 'High Yield Savings',
    gradient: 'from-[#1e293b] via-[#0f172a] to-[#020617]'
  }
];

export const initialBudgetCategories: BudgetCategory[] = [
  {
    id: 'housing',
    name: 'Housing & Utilities',
    allocated: 1400,
    spent: 1200,
    color: '#8b5cf6', // Brand purple
    icon: 'Home',
    alertThreshold: 90
  },
  {
    id: 'dining',
    name: 'Food & Dining',
    allocated: 700,
    spent: 540,
    color: '#f43f5e', // Coral
    icon: 'Utensils',
    alertThreshold: 80
  },
  {
    id: 'groceries',
    name: 'Groceries & Health',
    allocated: 500,
    spent: 400,
    color: '#10b981', // Emerald
    icon: 'Apple',
    alertThreshold: 80
  },
  {
    id: 'shopping',
    name: 'Shopping & Retail',
    allocated: 500,
    spent: 380,
    color: '#f59e0b', // Amber
    icon: 'ShoppingBag',
    alertThreshold: 75
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Tech',
    allocated: 500,
    spent: 320,
    color: '#3b82f6', // Blue
    icon: 'Tv',
    alertThreshold: 70
  },
  {
    id: 'transport',
    name: 'Transportation',
    allocated: 400,
    spent: 210,
    color: '#06b6d4', // Cyan
    icon: 'Car',
    alertThreshold: 80
  }
];

export const initialCashbackPartners: CashbackPartner[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    symbol: 'N',
    rate: '5% back',
    earned: 42.50,
    bgColor: '#e50914',
    textColor: '#ffffff'
  },
  {
    id: 'nike',
    name: 'Nike',
    symbol: '✔',
    rate: '3% back',
    earned: 64.20,
    bgColor: '#ffffff',
    textColor: '#000000'
  },
  {
    id: 'mcdonalds',
    name: "McDonald's",
    symbol: 'M',
    rate: '4% back',
    earned: 41.50,
    bgColor: '#ffbc0d',
    textColor: '#da291c'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Nike Official Store',
    category: 'Shopping',
    amount: 110.00,
    type: 'expense',
    date: 'Today',
    time: '14:24',
    account: 'Account ** 5087',
    cardLast4: '3264',
    note: 'Air Max sneakers promo'
  },
  {
    id: 'tx-2',
    title: 'Uber Eats - Sushi Bar',
    category: 'Dining',
    amount: 34.20,
    type: 'expense',
    date: 'Today',
    time: '12:15',
    account: 'Account ** 5087',
    cardLast4: '3264',
    note: 'Lunch with Alex'
  },
  {
    id: 'tx-3',
    title: 'Bi-Weekly Direct Payroll',
    category: 'Income',
    amount: 3250.00,
    type: 'income',
    date: 'Yesterday',
    time: '09:00',
    account: 'Account ** 5087',
    cardLast4: '3264',
    note: 'Apex Design Corp Payroll'
  },
  {
    id: 'tx-4',
    title: 'Whole Foods Market',
    category: 'Dining',
    amount: 86.40,
    type: 'expense',
    date: 'Yesterday',
    time: '18:40',
    account: 'Account ** 5087',
    cardLast4: '3264',
    note: 'Weekly organic groceries'
  },
  {
    id: 'tx-5',
    title: 'Netflix 4K Premium',
    category: 'Entertainment',
    amount: 15.99,
    type: 'expense',
    date: 'Oct 09',
    time: '04:00',
    account: 'Account ** 5087',
    cardLast4: '3264',
    note: 'Monthly recurring subscription'
  },
  {
    id: 'tx-6',
    title: 'Shell Gasoline Station',
    category: 'Transportation',
    amount: 45.00,
    type: 'expense',
    date: 'Oct 08',
    time: '16:50',
    account: 'Account ** 5087',
    cardLast4: '3264',
    note: 'Full fuel tank fill-up'
  },
  {
    id: 'tx-7',
    title: 'City Electric & Water',
    category: 'Housing',
    amount: 142.50,
    type: 'expense',
    date: 'Oct 05',
    time: '10:30',
    account: 'Account ** 5087',
    cardLast4: '3264',
    note: 'Monthly utilities bill'
  }
];

export const financialTips: FinancialTip[] = [
  {
    id: 'tip-1',
    title: 'Mastering the 50/30/20 Rule',
    readTime: '2 min read',
    category: 'Budgeting Strategy',
    summary: 'Allocate 50% to needs, 30% to wants, and 20% directly into automated savings or investments.',
    detail: [
      'Needs (50%): Housing, utilities, groceries, and essential transit.',
      'Wants (30%): Dining out, streaming, retail therapy, and weekend leisure.',
      'Savings (20%): Emergency buffer, index funds, and retirement accounts.'
    ]
  },
  {
    id: 'tip-2',
    title: 'Slash Impulse Weekend Spending',
    readTime: '3 min read',
    category: 'Psychological Money Habits',
    summary: 'Implement the 48-Hour Rule for non-essential purchases over $50 to prevent buyer regret.',
    detail: [
      'When considering a spontaneous purchase, bookmark it for 48 hours.',
      'Over 68% of impulse urges dissolve once dopamine levels return to baseline.',
      'Check your MyBudget category bar before tapping Apple Pay.'
    ]
  },
  {
    id: 'tip-3',
    title: 'Maximizing Cashback Stacking',
    readTime: '1 min read',
    category: 'Rewards & Optimization',
    summary: 'Stack your MyBudget partner rewards with loyalty programs to earn up to 8% back on dining.',
    detail: [
      'Combine brand cashback (Nike 3%, Netflix 5%) with credit card category boosts.',
      'Deposit earned cashback directly into your High Yield Savings card.'
    ]
  }
];
