import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, CheckCircle2, AlertTriangle, Info, Plus, ShieldCheck, RefreshCw, Target, Check, X, ArrowRight, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { getGreeting, formatINR, formatDate } from '../../utils/formatters';
import { TransactionModal } from '../modals/TransactionModal';

interface NavbarProps {
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle = 'Dashboard' }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, clearAllNotifications, refreshData, loading, acceptGoalSuggestion, declineGoalSuggestion } = useFinance();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Success Modal State when Goal is Accepted
  const [acceptedGoalPopup, setAcceptedGoalPopup] = useState<{ title: string; targetAmount: number; targetDate: string } | null>(null);

  // Decline Modal State when Goal is Declined
  const [declinedGoalPopup, setDeclinedGoalPopup] = useState<{ title: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAcceptGoal = async (notifItem: any) => {
    try {
      let sugId = notifItem.suggestionData?.suggestionId;
      let title = notifItem.suggestionData?.title;
      let targetAmount = notifItem.suggestionData?.targetAmount;
      let targetDate = notifItem.suggestionData?.targetDate;
      let category = notifItem.suggestionData?.category || 'Savings';

      if (!title || !targetAmount) {
        const msg = notifItem.message || '';
        if (msg.toLowerCase().includes('emergency')) title = 'Emergency Fund';
        else if (msg.toLowerCase().includes('macbook')) title = 'New Macbook Pro';
        else if (msg.toLowerCase().includes('vacation')) title = 'Europe Summer Vacation';
        else title = 'Admin Suggested Goal';

        const amtMatch = msg.match(/₹?\s*([\d,]+)/);
        if (amtMatch) {
          targetAmount = parseInt(amtMatch[1].replace(/,/g, ''), 10);
        } else {
          targetAmount = 100000;
        }

        const dateMatch = msg.match(/\b\d{4}-\d{2}-\d{2}\b/);
        targetDate = dateMatch ? dateMatch[0] : '2027-06-30';
      }

      sugId = sugId || `sug-${Date.now()}`;

      const createdGoal = await acceptGoalSuggestion(sugId, {
        title: title || 'Emergency Fund',
        targetAmount: targetAmount || 100000,
        targetDate: targetDate || '2027-06-30',
        category: category || 'Savings'
      });

      markNotificationAsRead(notifItem.id);
      setShowNotifications(false);

      setAcceptedGoalPopup({
        title: createdGoal?.title || title || 'Emergency Fund',
        targetAmount: createdGoal?.targetAmount || targetAmount || 100000,
        targetDate: createdGoal?.targetDate || targetDate || '2027-06-30'
      });
    } catch (e) {
      console.error('handleAcceptGoal error:', e);
    }
  };

  const handleDeclineGoal = (notifItem: any) => {
    const sugId = notifItem.suggestionData?.suggestionId || `sug-${Date.now()}`;
    const title = notifItem.suggestionData?.title || 'Goal Suggestion';

    declineGoalSuggestion(sugId);
    markNotificationAsRead(notifItem.id);
    setShowNotifications(false);

    setDeclinedGoalPopup({
      title: title
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-20 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-8 flex items-center justify-between sticky top-0 z-20 select-none">
        {/* Left: Greeting & Page Title */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-zinc-400 font-medium">
            {getGreeting(profile?.fullName || 'Raunak')} 👋 — Here's your financial overview.
          </p>
        </div>

        {/* Right: Quick Action, Search, Refresh, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Admin Data Center Button (Admin Only) */}
          {(profile?.role === 'admin' || profile?.isAdmin) && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Admin Data Portal</span>
            </Link>
          )}

          {/* Quick Add Transaction CTA Button */}
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>

          {/* Sync / Refresh Button */}
          <button
            onClick={handleManualRefresh}
            title="Refresh financial data"
            className="w-10 h-10 rounded-xl bg-[#151518] border border-zinc-800/90 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          {/* Search Input Bar */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions, accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151518] border border-zinc-800/90 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Notifications Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-xl bg-[#151518] border border-zinc-800/90 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 transition-all relative"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-purple-500 rounded-full ring-2 ring-[#09090b] animate-pulse" />
              )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-[#151518] border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-zinc-400 hover:text-purple-400 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">No notifications available</div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markNotificationAsRead(item.id)}
                        className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                          !item.read ? 'bg-purple-950/10' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {item.suggestionData || item.title.includes('Goal') ? (
                            <Target className="w-4.5 h-4.5 text-purple-400" />
                          ) : item.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : item.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Info className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white flex items-center justify-between">
                            <span className="truncate">{item.title}</span>
                            <span className="text-[10px] text-zinc-500 font-normal flex-shrink-0 ml-2">{item.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.message}</p>

                          {/* Goal Suggestion Action Buttons */}
                          {(item.suggestionData || item.title.toLowerCase().includes('goal suggestion')) && (
                            <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleAcceptGoal(item)}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-purple-950/50 transition-all hover:scale-[1.02] cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept Goal
                              </button>
                              <button
                                onClick={() => handleDeclineGoal(item)}
                                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
            <img
              src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Profile Avatar"
              className="w-10 h-10 rounded-xl object-cover border border-zinc-700 p-0.5 bg-zinc-900 shadow-md"
            />
          </div>
        </div>
      </header>

      {/* Add Transaction Modal Dialog */}
      <TransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />

      {/* GOAL ACCEPTED POPUP MODAL */}
      {acceptedGoalPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#151518] border border-emerald-500/40 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-5 relative text-center">
            <button
              onClick={() => setAcceptedGoalPopup(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                ✓ Goal Accepted
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight mt-2">
                "{acceptedGoalPopup.title}" Created!
              </h3>
              <p className="text-xs text-zinc-300 leading-snug">
                The suggested goal has been successfully added to your active savings goals list.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#09090b] p-4 rounded-2xl border border-zinc-800/80 text-xs text-left">
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Target Amount</div>
                <div className="text-base font-extrabold text-emerald-400 font-financial mt-0.5">
                  {formatINR(acceptedGoalPopup.targetAmount)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Target Deadline</div>
                <div className="text-xs font-bold text-white font-mono mt-1">
                  {formatDate(acceptedGoalPopup.targetDate)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setAcceptedGoalPopup(null);
                  navigate('/goals');
                }}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>View Savings Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAcceptedGoalPopup(null)}
                className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOAL DECLINED POPUP MODAL */}
      {declinedGoalPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#151518] border border-amber-500/40 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-5 relative text-center">
            <button
              onClick={() => setDeclinedGoalPopup(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/50">
              <XCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                Goal Suggestion Declined
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight mt-2">
                "{declinedGoalPopup.title}" Declined
              </h3>
              <p className="text-xs text-zinc-300 leading-snug">
                You have declined the goal suggestion. No goal was added to your account.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setDeclinedGoalPopup(null)}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
