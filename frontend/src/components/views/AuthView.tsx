import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Fingerprint, 
  Sparkles, 
  Check,
  X,
  Send
} from 'lucide-react';

interface AuthViewProps {
  onLogin: (userData: { name: string; email: string }) => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('josh.hill@fintech.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Josh Hill');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: authMode === 'signup' ? (name.trim() || 'New Member') : (name || 'Josh Hill'),
        email: email.trim() || 'josh.hill@fintech.io',
      });
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setEmail('josh.hill@fintech.io');
    setName('Josh Hill');
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: 'Josh Hill',
        email: 'josh.hill@fintech.io',
      });
    }, 450);
  };

  const handleBiometricAuth = () => {
    setBiometricScanning(true);
    setTimeout(() => {
      setBiometricScanning(false);
      onLogin({
        name: 'Josh Hill',
        email: 'josh.hill@fintech.io',
      });
    }, 1100);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setIsForgotOpen(false);
      setForgotEmail('');
    }, 1800);
  };

  return (
    <div className="min-h-full px-5 pt-7 pb-10 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding Section */}
      <div className="relative z-10 flex flex-col items-center text-center mt-2 mb-6">
        {/* Glowing Logo Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative mb-3"
        >
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#18181b] via-[#24242b] to-[#383844] p-[1.5px] shadow-[0_0_35px_rgba(139,92,246,0.35)] border border-white/15 flex items-center justify-center">
            <div className="w-full h-full rounded-[20px] bg-[#0c0c0e] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-transparent to-emerald-500/20" />
              {/* Custom Bank/Wallet SVG Icon */}
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white relative z-10 fill-none stroke-current stroke-[2]">
                <rect x="2" y="5" width="20" height="14" rx="4" />
                <path d="M2 10h20" />
                <circle cx="17" cy="15" r="1.5" className="fill-purple-400 stroke-none" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-white text-2xl font-black tracking-tight font-sans"
        >
          My<span className="text-purple-400">Budget</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-zinc-400 text-xs mt-1 tracking-wide"
        >
          Master your personal wealth with ease
        </motion.p>
      </div>

      {/* Segmented Auth Mode Switcher */}
      <div className="relative z-10 bg-[#16161a] border border-[#27272a] p-1 rounded-2xl mb-5 flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => setAuthMode('signin')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold relative transition-colors duration-200 ${
            authMode === 'signin' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {authMode === 'signin' && (
            <motion.div
              layoutId="authSegmentPill"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute inset-0 bg-zinc-800 rounded-xl shadow-md border border-zinc-700/60 -z-10"
            />
          )}
          Sign In
        </button>

        <button
          type="button"
          onClick={() => setAuthMode('signup')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold relative transition-colors duration-200 ${
            authMode === 'signup' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {authMode === 'signup' && (
            <motion.div
              layoutId="authSegmentPill"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute inset-0 bg-zinc-800 rounded-xl shadow-md border border-zinc-700/60 -z-10"
            />
          )}
          Create Account
        </button>
      </div>

      {/* Auth Form */}
      <motion.form
        key={authMode}
        initial={{ opacity: 0, x: authMode === 'signin' ? -12 : 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: authMode === 'signin' ? 12 : -12 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit}
        className="relative z-10 space-y-3.5"
      >
        {/* Full Name field (Sign Up only) */}
        {authMode === 'signup' && (
          <div>
            <label className="block text-zinc-400 text-[11px] font-medium mb-1 pl-1">Full Name</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-[#16161a] border border-[#27272a] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="block text-zinc-400 text-[11px] font-medium mb-1 pl-1">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#16161a] border border-[#27272a] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-zinc-400 text-[11px] font-medium mb-1 pl-1">Password</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#16161a] border border-[#27272a] rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-zinc-500 hover:text-zinc-300 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me / Forgot Password row */}
        {authMode === 'signin' ? (
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md accent-purple-600 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs pt-1 px-1 text-zinc-400">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded-md accent-purple-600 bg-zinc-800 border-zinc-700 cursor-pointer"
            />
            <span>I agree to the <span className="text-purple-400 underline">Terms</span> & <span className="text-purple-400 underline">Privacy</span></span>
          </div>
        )}

        {/* Primary Action Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{authMode === 'signin' ? 'Sign In to MyBudget' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Demo Account Quick Access Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mt-4 p-3 rounded-2xl bg-[#16161a]/90 border border-purple-500/25 flex items-center justify-between shadow-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-white text-xs font-bold">1-Tap Demo Sign In</div>
            <div className="text-zinc-400 text-[10px]">Josh Hill ($15,630.71 wallet)</div>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleDemoLogin}
          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-md active:bg-purple-700 transition-colors"
        >
          Quick Demo
        </motion.button>
      </motion.div>

      {/* Social / Biometric Logins */}
      <div className="relative z-10 mt-4">
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Or Connect With</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Apple Button */}
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: '#222228' }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleDemoLogin}
            className="py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center gap-2 text-xs font-medium text-white shadow-sm"
            title="Continue with Apple"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.62-.75 1.04-1.8 0.92-2.86-.9.04-1.98.6-2.61 1.34-.55.63-1.03 1.66-0.9 2.68 1 .08 2.02-.49 2.59-1.16z" />
            </svg>
            <span>Apple</span>
          </motion.button>

          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: '#222228' }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleDemoLogin}
            className="py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center gap-2 text-xs font-medium text-white shadow-sm"
            title="Continue with Google"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.9 7.5 23.5 12 23.5z"/>
            </svg>
            <span>Google</span>
          </motion.button>

          {/* Biometric FaceID/Fingerprint Button */}
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: '#222228' }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleBiometricAuth}
            className="py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400 shadow-sm"
            title="Biometric FaceID Unlock"
          >
            <Fingerprint className={`w-4 h-4 ${biometricScanning ? 'animate-pulse text-emerald-300 scale-125' : ''}`} />
            <span>{biometricScanning ? 'Scanning...' : 'Face ID'}</span>
          </motion.button>
        </div>
      </div>

      {/* Security Footnote */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 mt-5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>256-Bit Bank Level Encryption • SOC-2 Certified</span>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsForgotOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="w-full max-w-[360px] bg-[#141417] border border-zinc-800 rounded-[28px] p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsForgotOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pt-1 pb-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-white text-base font-bold tracking-tight">
                  Reset Your Password
                </h3>
                <p className="text-zinc-400 text-xs mt-1 px-2">
                  Enter your registered email address and we'll send you an instant reset link.
                </p>
              </div>

              {forgotSent ? (
                <div className="py-4 text-center text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Reset link sent to your inbox!</span>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-[#1c1c21] border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reset Link</span>
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
