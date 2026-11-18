-- ========================================================
-- FINANCE MANAGER DATABASE SCHEMA & ADMIN RLS MIGRATION
-- ========================================================
-- Execute this script in your Supabase SQL Editor to set up
-- database tables, Row Level Security (RLS) policies, and
-- admin access permissions.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
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

-- Ensure columns exist if table was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- 3. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('savings', 'checking', 'credit', 'cash', 'investment')),
    balance NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    account_number TEXT NOT NULL,
    color_gradient TEXT DEFAULT 'from-purple-600 via-indigo-700 to-slate-900',
    is_primary BOOLEAN DEFAULT false,
    is_connected BOOLEAN DEFAULT false,
    sync_status TEXT DEFAULT 'manual',
    last_synced_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT false;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'manual';
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS last_synced_at DATE;

-- 4. TRANSACTIONS TABLE
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
    provider_tx_id TEXT,
    is_synced BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS provider_tx_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_synced BOOLEAN DEFAULT false;

-- 5. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    limit_amount NUMERIC(14, 2) NOT NULL,
    period TEXT DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. GOALS TABLE
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

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. GOAL SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.goal_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    admin_email TEXT DEFAULT 'admin@financemanager.io',
    title TEXT NOT NULL,
    suggested_target_amount NUMERIC(14, 2) NOT NULL,
    suggested_target_date DATE NOT NULL,
    category TEXT DEFAULT 'Savings',
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES WITH ADMIN PRIVILEGES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_suggestions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ACCOUNTS POLICIES
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
CREATE POLICY "Users can view own accounts or admins view all" ON public.accounts
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
CREATE POLICY "Users can insert own accounts" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
CREATE POLICY "Users can update own accounts" ON public.accounts
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
CREATE POLICY "Users can delete own accounts" ON public.accounts
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions or admins view all" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- BUDGETS POLICIES
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets or admins view all" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- GOALS POLICIES
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view own goals or admins view all" ON public.goals
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
CREATE POLICY "Users can insert own goals or admins insert" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications or admins view all" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Admins or users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- GOAL SUGGESTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own goal suggestions or admins view all" ON public.goal_suggestions;
CREATE POLICY "Users can view own goal suggestions or admins view all" ON public.goal_suggestions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert goal suggestions" ON public.goal_suggestions;
CREATE POLICY "Admins can insert goal suggestions" ON public.goal_suggestions
    FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goal suggestions" ON public.goal_suggestions;
CREATE POLICY "Users can update own goal suggestions" ON public.goal_suggestions
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- RPC Function for Idempotent Goal Suggestion Acceptance
CREATE OR REPLACE FUNCTION public.accept_goal_suggestion(
    p_suggestion_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sug public.goal_suggestions%ROWTYPE;
    v_new_goal_id UUID;
BEGIN
    SELECT * INTO v_sug
    FROM public.goal_suggestions
    WHERE id = p_suggestion_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Suggestion not found');
    END IF;

    IF v_sug.status = 'accepted' THEN
        SELECT id INTO v_new_goal_id
        FROM public.goals
        WHERE user_id = p_user_id AND title = v_sug.title
        LIMIT 1;

        RETURN jsonb_build_object(
            'success', true,
            'already_accepted', true,
            'goal_id', v_new_goal_id,
            'title', v_sug.title,
            'target_amount', v_sug.suggested_target_amount,
            'target_date', v_sug.suggested_target_date
        );
    END IF;

    UPDATE public.goal_suggestions
    SET status = 'accepted'
    WHERE id = p_suggestion_id;

    SELECT id INTO v_new_goal_id
    FROM public.goals
    WHERE user_id = p_user_id AND title = v_sug.title;

    IF v_new_goal_id IS NULL THEN
        INSERT INTO public.goals (
            user_id,
            title,
            target_amount,
            current_amount,
            target_date,
            category
        ) VALUES (
            p_user_id,
            v_sug.title,
            v_sug.suggested_target_amount,
            0.00,
            v_sug.suggested_target_date,
            COALESCE(v_sug.category, 'Savings')
        )
        RETURNING id INTO v_new_goal_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'already_accepted', false,
        'goal_id', v_new_goal_id,
        'title', v_sug.title,
        'target_amount', v_sug.suggested_target_amount,
        'target_date', v_sug.suggested_target_date
    );
END;
$$;

