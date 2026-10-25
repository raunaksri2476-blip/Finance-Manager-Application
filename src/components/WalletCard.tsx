import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { AccountCard } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

interface WalletCardProps {
  card: AccountCard;
  allCards?: AccountCard[];
  onSelectCard?: (card: AccountCard) => void;
  onAddCardClick: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  card,
  allCards = [],
  onSelectCard,
  onAddCardClick,
}) => {
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <div className="px-4 mb-3 select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[26px] p-5 border border-[#2d2d35] bg-gradient-to-b from-[#242429] via-[#1a1a1e] to-[#121215] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)] group"
        >
          {/* Animated metallic sheen sweep on load / hover */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, repeatDelay: 6, duration: 2.2, ease: 'easeInOut' }}
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-[-25deg] pointer-events-none"
          />

          {/* Decorative ambient radial glare */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/[0.04] rounded-full blur-2xl pointer-events-none" />

          {/* Top Header Row: "Wallet" & "+" button */}
          <div className="flex items-center justify-between mb-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium tracking-tight">Wallet</span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setHideBalance(!hideBalance)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title={hideBalance ? "Show balance" : "Hide balance"}
              >
                {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.88 }}
              onClick={onAddCardClick}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white transition-all shadow-sm"
              title="Add Card or Funds"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          </div>

          {/* Cardholder Name */}
          <div className="text-zinc-400 text-sm font-normal tracking-wide mb-5 relative z-10">
            {card.holderName}
          </div>

          {/* Large Animated Balance Display */}
          <div className="mb-6 relative z-10">
            <div className="text-white text-[32px] font-extrabold tracking-tight leading-none font-sans flex items-baseline">
              {hideBalance ? (
                '••••••••'
              ) : (
                <AnimatedNumber value={card.balance} duration={700} />
              )}
            </div>
          </div>

          {/* Bottom Row: Account Number & Card Brand / Masked Digits */}
          <div className="flex items-center justify-between pt-1 relative z-10">
            <div className="text-zinc-400 text-xs font-medium tracking-wide">
              Account {card.accountNumber}
            </div>

            <div className="flex items-center gap-2">
              {card.cardBrand === 'mastercard' ? (
                <div className="flex items-center -space-x-2">
                  <span className="w-4 h-4 rounded-full bg-[#eb001b] inline-block shadow-sm" />
                  <span className="w-4 h-4 rounded-full bg-[#f79e1b] inline-block opacity-90 shadow-sm" />
                </div>
              ) : (
                <span className="text-xs font-black text-blue-400 italic">VISA</span>
              )}
              <span className="text-zinc-400 text-xs font-mono tracking-wider">
                **** {card.cardLast4}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Account Switcher Indicator Dots with spring animation */}
      {allCards.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          {allCards.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => onSelectCard && onSelectCard(c)}
              animate={{ width: c.id === card.id ? 24 : 8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`h-1.5 rounded-full ${
                c.id === card.id ? 'bg-white' : 'bg-zinc-700 hover:bg-zinc-500'
              }`}
              title={c.label}
            />
          ))}
        </div>
      )}
    </div>
  );
};
