import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Plus,
  Zap,
  Building2,
  CreditCard,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  Smartphone,
  Info
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const { addAccount, addTransaction, refreshData } = useFinance();

  const [step, setStep] = useState<number>(1);

  // Step 1: Profile Details
  const [fullName, setFullName] = useState<string>(profile?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState<string>(profile?.mobileNumber || '9876543210');
  const [currency, setCurrency] = useState<string>(profile?.currency || 'INR');

  // Step 2: Connection Type Choice
  const [connectionType, setConnectionType] = useState<'automatic' | 'manual'>('automatic');

  // Step 3: Account Type & Permissions
  const [accountType, setAccountType] = useState<'savings' | 'checking' | 'credit' | 'cash' | 'investment'>('savings');
  const [agreedPermissions, setAgreedPermissions] = useState<boolean>(true);

  // Step 4: Provider Flow or Manual Account Entry
  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [accountName, setAccountName] = useState<string>('HDFC Savings Account');
  const [accountNumber, setAccountNumber] = useState<string>('5087');
  const [openingBalance, setOpeningBalance] = useState<string>('45000');
  const [aaOtp, setAaOtp] = useState<string>('123456');
  const [isVerifyingAa, setIsVerifyingAa] = useState<boolean>(false);

  // Status & Notifications
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Step 1 Submit Handler
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    setErrorMsg('');
    await updateProfile({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      currency
    });
    setStep(2);
  };

  // Step 4 Completion (Account Creation)
  const handleCreateAccountAndFinish = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const balNum = parseFloat(openingBalance);
      if (isNaN(balNum) || balNum < 0) {
        setErrorMsg('Please enter a valid balance.');
        setIsSubmitting(false);
        return;
      }

      // 1. Create Account
      const createdAcc = await addAccount({
        name: accountName.trim() || `${bankName} Account`,
        type: accountType,
        balance: balNum,
        accountNumber: accountNumber.trim() || '4321',
        bankName: bankName,
        colorGradient: accountType === 'credit' ? 'from-rose-600 to-slate-900' : 'from-purple-600 to-slate-900',
        isPrimary: true,
        isConnected: false,
        syncStatus: 'manual'
      });

      // 2. Add initial transaction
      if (createdAcc?.id) {
        await addTransaction({
          accountId: createdAcc.id,
          title: 'Initial Account Deposit',
          category: 'Income',
          amount: balNum,
          type: 'income',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          notes: 'Initial account opening balance'
        });
      }

      // Mark Onboarding Complete in User Profile
      await updateProfile({ hasCompletedOnboarding: true });
      await refreshData();
      setStep(5);
    } catch (err: any) {
      console.error('Onboarding account error:', err);
      setErrorMsg(err?.message || 'Failed to finish onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none font-sans">
      <div className="bg-[#151518] border border-purple-500/30 rounded-3xl p-7 max-w-xl w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Header Badge & Close Button */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                First-Login Setup Wizard
              </span>
              <h3 className="text-base font-extrabold text-white">Welcome to Finance Manager!</h3>
            </div>
          </div>

          <button
            onClick={() => {
              updateProfile({ hasCompletedOnboarding: true });
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs font-bold"
            title="Skip Onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
            <span>Step {step} of 5</span>
            <span className="text-purple-400 font-mono">
              {step === 1 && 'Complete Profile'}
              {step === 2 && 'Select Connection Method'}
              {step === 3 && 'Account Permissions'}
              {step === 4 && (connectionType === 'automatic' ? 'Account Aggregator Consent' : 'Manual Account Metadata')}
              {step === 5 && 'Setup Completed!'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: COMPLETE PROFILE */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4 text-xs">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white">1. Verify Your Profile Details</h4>
              <p className="text-zinc-400 text-[11px]">
                Confirm your name and mobile number to associate your financial accounts securely.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Mobile Number (SMS/OTP)</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
            >
              <span>Continue to Account Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: CHOOSE CONNECTION METHOD */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white">2. Choose Account Setup Method</h4>
              <p className="text-zinc-400 text-[11px]">
                Connect your accounts automatically via Account Aggregator or enter them manually.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option A: Automatic Bank Sync */}
              <div
                onClick={() => setConnectionType('automatic')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  connectionType === 'automatic'
                    ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                    : 'bg-[#09090b] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-extrabold uppercase">
                    Auto Sync
                  </span>
                </div>
                <h5 className="font-extrabold text-sm text-white">Automatic Connection</h5>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Read-only sync via Account Aggregator Gateway (Setu AA Sandbox).
                </p>
              </div>

              {/* Option B: Manual Entry */}
              <div
                onClick={() => setConnectionType('manual')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  connectionType === 'manual'
                    ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                    : 'bg-[#09090b] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[9px] font-extrabold uppercase">
                    Manual Data
                  </span>
                </div>
                <h5 className="font-extrabold text-sm text-white">Manual Account Entry</h5>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Enter savings, credit cards, or cash balances without connecting bank APIs.
                </p>
              </div>
            </div>

            {/* Provider Status Banner */}
            <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Secure Account Setup</span>
                <span>Manage your bank accounts, credit cards, and cash balances in one place.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Proceed to Permissions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ACCOUNT TYPE & PERMISSIONS */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white">3. Select Account Type & Permissions</h4>
              <p className="text-zinc-400 text-[11px]">
                Review the requested read-only consent scope for your financial record.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-zinc-400 mb-1">Account Category</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
              >
                <option value="savings">Savings Account</option>
                <option value="checking">Checking / Salary Account</option>
                <option value="credit">Credit Card Account</option>
                <option value="cash">Cash Wallet / Reserve</option>
                <option value="investment">Investment Reserve</option>
              </select>
            </div>

            {/* Permissions Box */}
            <div className="p-4 rounded-2xl bg-[#09090b] border border-zinc-800 space-y-2.5">
              <div className="font-bold text-white text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Requested Read-Only Permissions:</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> Read account balances & summary metrics.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> Fetch transaction history for categorization.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> Zero write access — cannot initiate transfers or payments.
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="permConsent"
                checked={agreedPermissions}
                onChange={(e) => setAgreedPermissions(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="permConsent" className="text-[11px] text-zinc-300 cursor-pointer">
                I authorize read-only processing for my financial dashboard.
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!agreedPermissions}
                onClick={() => setStep(4)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Continue to {connectionType === 'automatic' ? 'Consent Flow' : 'Account Details'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROVIDER FLOW OR MANUAL METADATA */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            {connectionType === 'automatic' ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">4. Account Aggregator Gateway Consent</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Simulating Setu AA Gateway consent for mobile <strong className="text-white">{mobileNumber}</strong>.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Select Bank (FIP)</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="SBI Bank">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-[#09090b] border border-purple-500/30 space-y-3 text-center">
                  <Smartphone className="w-8 h-8 text-purple-400 mx-auto" />
                  <div>
                    <div className="text-xs font-bold text-white">AA Consent OTP Sent</div>
                    <div className="text-[11px] text-zinc-400">Enter OTP (Sandbox Test Code: <strong className="text-emerald-400 font-mono">123456</strong>)</div>
                  </div>

                  <input
                    type="text"
                    value={aaOtp}
                    onChange={(e) => setAaOtp(e.target.value)}
                    placeholder="123456"
                    className="w-48 mx-auto bg-[#151518] border border-zinc-700 rounded-xl px-4 py-2 text-center text-sm font-mono text-white tracking-widest focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">4. Enter Manual Account Metadata</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Only display metadata is stored. Never enter bank passwords, PINs, or CVVs.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Account Display Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. HDFC Primary Savings"
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Bank / Issuer Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Masked Last 4 Digits</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="5087"
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Current Opening Balance (₹)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="45000"
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateAccountAndFinish}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Setting up Account...' : 'Complete & Import Transactions'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: COMPLETED */}
        {step === 5 && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                ✓ Setup Completed
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight mt-2">
                Your Account is Configured!
              </h3>
              <p className="text-xs text-zinc-300 leading-snug max-w-sm mx-auto">
                {connectionType === 'automatic'
                  ? 'Bank account synced via Account Aggregator Gateway. Your dashboard has been populated with initial transactions.'
                  : 'Manual account created successfully. You can now track your transactions and budgets.'}
              </p>
            </div>

            <button
              onClick={() => {
                updateProfile({ hasCompletedOnboarding: true });
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Explore My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
