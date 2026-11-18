import React, { useState, useMemo } from 'react';
import { DesktopLayout } from '../components/Layout/DesktopLayout';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { GoalModal } from '../components/modals/GoalModal';
import { Goal } from '../types';
import {
  Target,
  Plus,
  Calendar,
  PlusCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  XCircle,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    goalSuggestions,
    notifications,
    deleteGoal,
    acceptGoalSuggestion,
    declineGoalSuggestion,
    markNotificationAsRead
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [addMoneyGoal, setAddMoneyGoal] = useState<Goal | null>(null);
  const [acceptedPopup, setAcceptedPopup] = useState<{ title: string; targetAmount: number; targetDate: string } | null>(null);

  // Compute pending suggestions list
  const pendingSuggestions = useMemo(() => {
    const list: Array<{ id: string; notifId?: string; title: string; targetAmount: number; targetDate: string; category?: string; message?: string }> = [];
    const seenIds = new Set<string>();

    goalSuggestions.forEach((s) => {
      if (s.status === 'pending' && !seenIds.has(s.id)) {
        seenIds.add(s.id);
        list.push({
          id: s.id,
          title: s.title,
          targetAmount: s.suggestedTargetAmount,
          targetDate: s.suggestedTargetDate,
          category: s.category || 'Savings',
          message: s.message
        });
      }
    });

    notifications.forEach((n) => {
      if (!n.read && (n.suggestionData || n.title.toLowerCase().includes('goal suggestion'))) {
        const sugId = n.suggestionData?.suggestionId || `notif-sug-${n.id}`;
        if (!seenIds.has(sugId)) {
          seenIds.add(sugId);
          list.push({
            id: sugId,
            notifId: n.id,
            title: n.suggestionData?.title || 'Emergency Fund',
            targetAmount: n.suggestionData?.targetAmount || 100000,
            targetDate: n.suggestionData?.targetDate || '2027-06-30',
            category: n.suggestionData?.category || 'Savings',
            message: n.suggestionData?.message || n.message
          });
        }
      }
    });

    return list;
  }, [goalSuggestions, notifications]);

  const handleAcceptSuggestion = async (sug: any) => {
    try {
      const created = await acceptGoalSuggestion(sug.id, {
        title: sug.title,
        targetAmount: sug.targetAmount,
        targetDate: sug.targetDate,
        category: sug.category
      });

      if (sug.notifId) {
        markNotificationAsRead(sug.notifId);
      }

      setAcceptedPopup({
        title: created?.title || sug.title,
        targetAmount: created?.targetAmount || sug.targetAmount,
        targetDate: created?.targetDate || sug.targetDate
      });
    } catch (e) {
      console.error('Accept suggestion error:', e);
    }
  };

  const handleDeclineSuggestion = async (sug: any) => {
    try {
      await declineGoalSuggestion(sug.id);
      if (sug.notifId) {
        markNotificationAsRead(sug.notifId);
      }
    } catch (e) {
      console.error('Decline suggestion error:', e);
    }
  };

  const handleEdit = (g: Goal) => {
    setEditingGoal(g);
    setAddMoneyGoal(null);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingGoal(null);
    setAddMoneyGoal(null);
    setIsModalOpen(true);
  };

  const handleAddMoney = (g: Goal) => {
    setEditingGoal(null);
    setAddMoneyGoal(g);
    setIsModalOpen(true);
  };

  return (
    <DesktopLayout pageTitle="Goals">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Savings Goals</h1>
          <p className="text-xs text-zinc-400 mt-1">Turn your financial dreams into structured milestones.</p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Goal</span>
        </button>
      </div>

      {/* PENDING ADMIN GOAL SUGGESTIONS SECTION */}
      {pendingSuggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-400">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Pending Goal Suggestions From Admin ({pendingSuggestions.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSuggestions.map((sug) => (
              <div
                key={sug.id}
                className="bg-[#151518] border border-purple-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-extrabold uppercase">
                        Admin Recommendation
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-0.5">{sug.title}</h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400 font-financial">
                      {formatINR(sug.targetAmount)}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">By {formatDate(sug.targetDate)}</div>
                  </div>
                </div>

                {sug.message && (
                  <p className="text-xs text-zinc-300 bg-[#09090b] p-3 rounded-2xl border border-zinc-800/80 leading-relaxed italic">
                    "{sug.message}"
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAcceptSuggestion(sug)}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/50 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>✓ Accept Goal</span>
                  </button>

                  <button
                    onClick={() => handleDeclineSuggestion(sug)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Cards Grid */}
      {goals.length === 0 ? (
        <div className="bg-[#151518] border border-zinc-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <Target className="w-8 h-8 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">No savings goals yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Set a financial goal and track your progress as you save.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const pct = Math.min(100, Number(((g.currentAmount / g.targetAmount) * 100).toFixed(1)));

            return (
              <div
                key={g.id}
                className="bg-[#151518] border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Row: Icon, Title & Category */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">{g.title}</h3>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800">
                          {g.category || 'Savings'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(g)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete goal "${g.title}"?`)) deleteGoal(g.id);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Numerical Savings Progress */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="text-2xl font-extrabold text-white font-financial">
                      {formatINR(g.currentAmount)}
                      <span className="text-xs text-zinc-400 font-normal"> / {formatINR(g.targetAmount)}</span>
                    </div>
                    <div className="text-sm font-extrabold text-purple-400">{pct}%</div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="h-3 w-full bg-[#09090b] rounded-full overflow-hidden border border-zinc-800 p-0.5 mb-4">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Target Date: <strong className="text-zinc-200">{formatDate(g.targetDate)}</strong></span>
                  </div>
                </div>

                {/* Deposit Money CTA */}
                <button
                  onClick={() => handleAddMoney(g)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Money to Goal</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* GREEN GOAL ACCEPTED POPUP MODAL */}
      {acceptedPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#151518] border border-emerald-500/40 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-5 relative text-center">
            <button
              onClick={() => setAcceptedPopup(null)}
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
                "{acceptedPopup.title}" Created!
              </h3>
              <p className="text-xs text-zinc-300 leading-snug">
                The suggested goal has been successfully added to your active savings goals list and saved to Supabase.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#09090b] p-4 rounded-2xl border border-zinc-800/80 text-xs text-left">
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Target Amount</div>
                <div className="text-base font-extrabold text-emerald-400 font-financial mt-0.5">
                  {formatINR(acceptedPopup.targetAmount)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Target Deadline</div>
                <div className="text-xs font-bold text-white font-mono mt-1">
                  {formatDate(acceptedPopup.targetDate)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setAcceptedPopup(null)}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.01]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editGoal={editingGoal}
        addMoneyGoal={addMoneyGoal}
      />
    </DesktopLayout>
  );
};

