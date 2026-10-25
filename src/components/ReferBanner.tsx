import React from 'react';
import { motion } from 'framer-motion';

interface ReferBannerProps {
  onLearnMoreClick: () => void;
}

export const ReferBanner: React.FC<ReferBannerProps> = ({ onLearnMoreClick }) => {
  return (
    <div className="px-4 mb-4 select-none">
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative overflow-hidden rounded-[24px] bg-[#18181b] border border-[#27272a] p-4 flex items-center justify-between shadow-lg"
      >
        {/* Left text & button */}
        <div className="z-10 max-w-[65%]">
          <h3 className="text-white text-[15px] font-semibold tracking-tight">
            Refer and Earn
          </h3>
          <p className="text-zinc-400 text-xs mt-1 leading-snug">
            Share a referral link to your friend and get rewarded
          </p>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#323238' }}
            whileTap={{ scale: 0.94 }}
            onClick={onLearnMoreClick}
            className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#27272a] text-white text-xs font-medium tracking-wide shadow-sm"
          >
            Learn more
          </motion.button>
        </div>

        {/* Right 3D Orb Artwork with levitating floating animation */}
        <div className="relative w-28 h-24 flex items-center justify-center flex-shrink-0">
          {/* Glowing gradient backdrops with gentle pulse */}
          <motion.div 
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute w-20 h-20 rounded-full bg-purple-600/30 blur-xl pointer-events-none" 
          />
          
          {/* Main Dark 3D Glass Sphere Floating */}
          <motion.div 
            animate={{ y: [-3, 3, -3], rotate: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#0a0a0d] via-[#1f1f26] to-[#40404c] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),_0_8px_20px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-full bg-white/25 blur-[1px] -translate-y-2 -translate-x-2" />
          </motion.div>

          {/* Secondary tiny floating satellite orb */}
          <motion.div 
            animate={{ y: [2, -4, 2], x: [-1, 2, -1] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="absolute bottom-1 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-[#27272f] to-[#0d0d10] border border-white/10 shadow-md" 
          />
        </div>
      </motion.div>
    </div>
  );
};
