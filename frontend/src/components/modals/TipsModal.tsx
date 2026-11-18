import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, BookOpen, ChevronRight, Award, Sparkles } from 'lucide-react';
import { financialTips } from '../../data/mockData';
import { FinancialTip } from '../../types';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  const [selectedTip, setSelectedTip] = useState<FinancialTip | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 select-none"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            className="w-full max-w-[430px] bg-[#141417] border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4 flex-shrink-0" />

            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-white text-base font-bold tracking-tight">
                    Tips And Training
                  </h2>
                  <p className="text-zinc-400 text-xs">Financial literacy for young professionals</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {selectedTip ? (
              /* Tip Details View */
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="overflow-y-auto space-y-4 pr-1"
              >
                <button
                  onClick={() => setSelectedTip(null)}
                  className="text-xs text-purple-400 hover:underline flex items-center gap-1 mb-2"
                >
                  ← Back to modules
                </button>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    {selectedTip.category}
                  </span>
                  <h3 className="text-white text-lg font-bold mt-2">
                    {selectedTip.title}
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                    {selectedTip.summary}
                  </p>
                </div>

                <div className="space-y-2.5 bg-[#1c1c21] p-4 rounded-2xl border border-zinc-800">
                  <h4 className="text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Actionable Takeaways
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {selectedTip.detail.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedTip(null)}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-2xl transition-all"
                >
                  Mark Lesson as Completed (+50 Points)
                </motion.button>
              </motion.div>
            ) : (
              /* List of Tips */
              <div className="overflow-y-auto space-y-3 pr-1">
                {/* Achievement Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <div className="text-white text-xs font-bold">Level 2 Budget Master</div>
                      <div className="text-zinc-400 text-[11px]">3 of 5 lessons completed</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-300 bg-purple-600/30 px-2 py-1 rounded-xl">
                    350 XP
                  </span>
                </div>

                <div className="space-y-2.5">
                  {financialTips.map((tip) => (
                    <motion.div
                      key={tip.id}
                      whileHover={{ scale: 1.01, backgroundColor: '#202025' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTip(tip)}
                      className="p-3.5 rounded-2xl bg-[#1c1c21] border border-zinc-800/80 cursor-pointer flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-colors flex-shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold group-hover:text-purple-300 transition-colors">
                            {tip.title}
                          </div>
                          <div className="text-zinc-400 text-[11px] mt-0.5 line-clamp-1">
                            {tip.summary}
                          </div>
                          <div className="text-zinc-500 text-[10px] mt-1 flex items-center gap-2">
                            <span>{tip.category}</span>
                            <span>•</span>
                            <span>{tip.readTime}</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
