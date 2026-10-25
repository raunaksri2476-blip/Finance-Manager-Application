-- FINANCE MANAGER SUPABASE DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor to set up tables and Row Level Security (RLS) policies.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    mobile_number TEXT,
    has_completed_onboarding BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    currency TEXT DEFAULT 'INR',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- 2. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('savings', 'checking', 'credit', 'cash', 'investment')),
    balance NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    account_number TEXT NOT NULL,
    color_gradient TEXT DEFAULT 'from-purple-600 via-indigo-700 to-slate-900',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    limit_amount NUMERIC(14, 2) NOT NULL,
    period TEXT DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. GOALS TABLE
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL,
    current_amount NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    target_date DATE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. GOAL SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.goal_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    admin_email TEXT NOT NULL,
    title TEXT NOT NULL,
    suggested_target_amount NUMERIC(14, 2) NOT NULL,
    suggested_target_date DATE NOT NULL,
    category TEXT DEFAULT 'Savings',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HELPER: Check admin role without recursive RLS evaluation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    mobile_number,
    role,
    currency,
    date_format,
    has_completed_onboarding
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'User'
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    ),
    COALESCE(new.raw_user_meta_data->>'mobile_number', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    'INR',
    'DD/MM/YYYY',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_suggestions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owners and admins" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can update profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by owners and admins" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

CREATE POLICY "Users and admins can update profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Accounts Policies
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT USING (public.is_admin());

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.is_admin());

-- Budgets Policies
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Admins can view all budgets" ON public.budgets;

CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all budgets" ON public.budgets FOR SELECT USING (public.is_admin());

-- Goals Policies
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;

CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all goals" ON public.goals FOR SELECT USING (public.is_admin());

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT USING (public.is_admin());

-- Goal Suggestions Policies
DROP POLICY IF EXISTS "Users can view own goal suggestions" ON public.goal_suggestions;
DROP POLICY IF EXISTS "Users can update own goal suggestions" ON public.goal_suggestions;
DROP POLICY IF EXISTS "Admins can view all goal suggestions" ON public.goal_suggestions;
DROP POLICY IF EXISTS "Admins can insert goal suggestions" ON public.goal_suggestions;

CREATE POLICY "Users can view own goal suggestions" ON public.goal_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own goal suggestions" ON public.goal_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all goal suggestions" ON public.goal_suggestions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert goal suggestions" ON public.goal_suggestions FOR INSERT WITH CHECK (public.is_admin());

-- DATABASE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_suggestions_user_id ON public.goal_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);



