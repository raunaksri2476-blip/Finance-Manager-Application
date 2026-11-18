import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Sparkles, Mail, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();

  // Initially EMPTY field
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    const res = await forgotPassword(email.trim());
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setMessage(res.message || 'Password reset link sent to your email.');
    }
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

        {/* Middle Heading */}
        <div className="relative z-10 my-auto py-6 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> ACCOUNT ACCESS RECOVERY
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight font-financial">
              Recover your workspace with ease.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              Enter your registered email address and we'll send you an instant reset link to regain full access.
            </p>
          </div>

          {/* Single Premium Desktop Card Visual */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-[#17171c] via-[#1a1a22] to-[#121216] border border-purple-500/30 backdrop-blur-xl shadow-2xl space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-bold tracking-wide">SECURITY PROTOCOL</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[11px] border border-purple-500/30">
                Encrypted Link
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-300">
              Instant Password Reset Delivery
            </div>
            <p className="text-[11px] text-zinc-400">
              Your financial data and account integrity remain 100% protected.
            </p>
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

      {/* RIGHT COLUMN: 42% width Forgot Password Card */}
      <div className="w-full lg:w-[42%] bg-[#0c0c0e] p-6 lg:p-10 flex flex-col justify-between overflow-y-auto">
        <div className="w-full max-w-sm mx-auto my-auto space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset your password</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your email address and we'll send you a password reset link.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{submitting ? 'Sending link...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Back to Sign In Link */}
          <div className="text-center text-xs text-zinc-400 pt-4 border-t border-zinc-800/80">
            Remembered your password?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
