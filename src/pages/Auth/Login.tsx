import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { login, loginWithGoogle, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  // Initially EMPTY fields as per requirements
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.error) {
      setError(res.error || 'Invalid email or password.');
    } else {
      const isAdminUser = email.trim().toLowerCase().includes('admin');
      if (isAdminUser) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.error) {
      setError(res.error || 'Unable to sign in with Google. Please try again.');
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGuestClick = () => {
    loginAsGuest();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#09090b] text-white flex select-none font-sans overflow-hidden">
      {/* LEFT COLUMN: 58% width Branding & Desktop Financial Visual Card */}
      <div className="hidden lg:flex w-[58%] bg-gradient-to-br from-[#121215] via-[#16161b] to-[#09090b] p-10 xl:p-12 border-r border-zinc-800/80 flex-col justify-between relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white font-sans">
              FINANCE <span className="text-purple-400">MANAGER</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">Take control of your money.</p>
          </div>
        </div>

        {/* Middle Heading & Single Balance Card Visual */}
        <div className="relative z-10 my-auto py-6 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> PREMIUM FINTECH PLATFORM
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight font-financial">
              Master your financial flow with confidence.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              Track your money, understand your spending, and build better financial habits — all in one place.
            </p>
          </div>

          {/* Single Premium Desktop Balance Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-[#17171c] via-[#1a1a22] to-[#121216] border border-purple-500/30 backdrop-blur-xl shadow-2xl space-y-3.5 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-600/20 transition-all" />
            
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-bold tracking-wide">HDFC SAVINGS</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                +12.8%
              </span>
            </div>

            <div>
              <div className="text-xs text-zinc-400 mb-0.5 font-medium">Total Balance</div>
              <div className="text-3xl font-black text-white font-financial tracking-tight">₹1,24,500.00</div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-zinc-800/80 font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px]">Income</span>
                <span className="text-emerald-400 font-bold">₹75,000</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px]">Expenses</span>
                <span className="text-purple-400 font-bold">₹42,300</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px]">Account</span>
                <span className="text-zinc-300 font-semibold">•••• 5087</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 font-medium border-t border-zinc-800/80 pt-4">
          <span>© 2026 Finance Manager SaaS</span>
          <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Bank-Grade Encryption
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: 42% width Login Card */}
      <div className="w-full lg:w-[42%] bg-[#0c0c0e] p-6 lg:p-10 flex flex-col justify-between overflow-y-auto">
        <div className="w-full max-w-sm mx-auto my-auto space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Sign in to continue to your Finance Manager.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#151518] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Password with Eye Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-400">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#151518] border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-[#0c0c0e] px-3 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider absolute">
              OR
            </span>
          </div>

          {/* Compact Google Login Button (20px Google SVG) */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full py-2.5 rounded-xl bg-[#151518] hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Quick Guest Demo Option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleGuestClick}
              className="text-[11px] font-semibold text-zinc-500 hover:text-purple-400 transition-colors"
            >
              Or click here to preview Demo Guest Mode →
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
