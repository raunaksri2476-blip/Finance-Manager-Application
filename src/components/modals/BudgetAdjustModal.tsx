import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sliders, ShieldAlert } from 'lucide-react';
import { BudgetCategory } from '../../types';

interface BudgetAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onUpdateCategoryCap: (id: string, newAllocated: number) => void;
  autoBudgetEnabled: boolean;
  onToggleAutoBudget: () => void;
}

export const BudgetAdjustModal: React.FC<BudgetAdjustModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategoryCap,
  autoBudgetEnabled,
  onToggleAutoBudget,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory>(categories[0] || null);
  const [amount, setAmount] = useState<number>(categories[0]?.allocated || 500);

  const handleSelect = (cat: BudgetCategory) => {
    setSelectedCategory(cat);
    setAmount(cat.allocated);
  };

  const handleSave = () => {
    if (selectedCategory) {
      onUpdateCategoryCap(selectedCategory.id, amount);
      onClose();
    }
  };

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
            className="w-full max-w-[430px] bg-[#141417] border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h2 className="text-white text-lg font-bold tracking-tight">
                  Budget Settings
                </h2>
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

            {/* Auto-Budgeting Toggle Switch */}
            <div className="bg-[#1c1c21] border border-zinc-800 p-4 rounded-2xl mb-5 flex items-center justify-between">
              <div className="max-w-[75%]">
                <div className="text-white text-sm font-semibold flex items-center gap-1.5">
                  <span>Auto-Budgeting Engine</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                    AI SMART
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-1">
                  Automatically rebalances category caps based on 3-month median spending.
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleAutoBudget}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  autoBudgetEnabled ? 'bg-purple-600' : 'bg-zinc-700'
                }`}
              >
                <motion.div
                  animate={{ x: autoBudgetEnabled ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="bg-white w-4 h-4 rounded-full shadow-md"
                />
              </button>
            </div>

            {/* Select Category to Adjust */}
            <div className="mb-4">
              <label className="block text-zinc-400 text-xs mb-2">Select Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(cat)}
                    className={`p-2.5 rounded-2xl border text-xs text-left transition-all ${
                      selectedCategory?.id === cat.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                        : 'bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-semibold truncate">{cat.name}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">${cat.allocated}/mo</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Adjust Slider & Input */}
            {selectedCategory && (
              <div className="bg-[#1c1c21] border border-zinc-800 p-4 rounded-2xl mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Monthly Limit</span>
                  <span className="text-xl font-bold text-white">${amount}</span>
                </div>

                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />

                <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>You will receive an alert at 80% usage (${Math.round(amount * 0.8)})</span>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSave}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
