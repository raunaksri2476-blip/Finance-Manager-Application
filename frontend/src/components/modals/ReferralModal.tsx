import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Check, Share2 } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = 'JOSH-MYBUDGET-25';

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://mybudget.app/join?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="w-full max-w-[380px] bg-[#141417] border border-zinc-800 rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>

            <div className="text-center pt-2 pb-4">
              <motion.div 
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="w-16 h-16 mx-auto rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-lg shadow-purple-600/20"
              >
                <Gift className="w-8 h-8" />
              </motion.div>

              <h3 className="text-white text-xl font-bold tracking-tight">
                Refer Friends, Earn $25
              </h3>
              <p className="text-zinc-400 text-xs mt-1.5 px-3 leading-relaxed">
                Give a friend $25 when they set up their first category budget on MyBudget. You get $25 deposited straight into your Wallet!
              </p>
            </div>

            {/* Code Box */}
            <div className="bg-[#1c1c21] border border-zinc-800 rounded-2xl p-3 mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Your Referral Code</div>
                <div className="text-white font-mono font-bold text-sm tracking-wide mt-0.5">{referralCode}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </motion.button>
            </div>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCopy}
              className="w-full py-3 bg-[#24242a] hover:bg-[#2d2d34] text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 border border-zinc-700 transition-all"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Share Referral Link</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
