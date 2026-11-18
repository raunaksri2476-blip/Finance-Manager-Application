export type TransactionType = 'income' | 'expense';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  mobileNumber?: string;
  hasCompletedOnboarding?: boolean;
  currency: string; // default "INR"
  dateFormat: string; // default "DD/MM/YYYY"
  role?: 'user' | 'admin';
  isAdmin?: boolean;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  targetUserName: string;
  targetUserEmail: string;
  action: string; // e.g. "Recorded Income", "Created Account", "Allocated Budget", "Suggested Goal"
  details: string;
  amount?: number;
  timestamp: string;
}

export interface Account {
  id: string;
  userId?: string;
  name: string; // e.g. "HDFC Savings", "SBI Account", "Cash Wallet"
  type: 'savings' | 'checking' | 'credit' | 'cash' | 'investment';
  balance: number;
  accountNumber: string; // e.g. "5087" or "4218"
  bankName?: string;
  colorGradient: string; // Tailwind gradient class
  isPrimary?: boolean;
  isConnected?: boolean;
  syncStatus?: 'active' | 'pending' | 'expired' | 'failed' | 'manual';
  lastSyncedAt?: string;
  providerAccountId?: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  accountId?: string;
  accountName?: string;
  account?: string; // legacy alias
  cardLast4?: string; // legacy alias
  title: string; // Description
  category: string; // "Food", "Shopping", "Bills", "Salary", "Entertainment", "Transport", "Healthcare", "Investment"
  amount: number;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  time?: string;
  notes?: string;
  note?: string; // legacy alias
  icon?: string;
  providerTxId?: string;
  isSynced?: boolean;
}

export interface Budget {
  id: string;
  userId?: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
  period: 'monthly' | 'yearly';
}

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  icon?: string;
  createdAt?: string;
}

export interface GoalSuggestion {
  id: string;
  userId: string;
  adminEmail: string;
  title: string;
  suggestedTargetAmount: number;
  suggestedTargetDate: string;
  category?: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  priority?: 'normal' | 'important' | 'high';
  read: boolean;
  timestamp: string;
  suggestionData?: {
    suggestionId: string;
    title: string;
    targetAmount: number;
    targetDate: string;
    category?: string;
    message: string;
  };
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  incomeChangePercentage: number;
  expenseChangePercentage: number;
}

// Legacy Type Aliases for compatibility
export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
  alertThreshold: number;
}

export interface AccountCard {
  id: string;
  holderName: string;
  balance: number;
  accountNumber: string;
  cardLast4: string;
  cardBrand: 'mastercard' | 'visa';
  label: string;
  gradient: string;
}

export interface CashbackPartner {
  id: string;
  name: string;
  symbol: string;
  rate: string;
  earned: number;
  bgColor: string;
  textColor: string;
}

export interface FinancialTip {
  id: string;
  title: string;
  readTime: string;
  category: string;
  summary: string;
  detail: string[];
}

export interface ServiceItem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  badge?: string;
}
