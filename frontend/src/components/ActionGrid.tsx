import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Plus, GraduationCap, LayoutGrid } from 'lucide-react';

interface ActionGridProps {
  onQRClick: () => void;
  onAddClick: () => void;
  onTipsClick: () => void;
  onServicesClick: () => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  onQRClick,
  onAddClick,
  onTipsClick,
  onServicesClick,
}) => {
  return (
    <div className="flex gap-3 px-4 mb-3 select-none h-[122px]">
      {/* Column 1: Stacked Small Action Tiles (QR & +) */}
      <div className="flex flex-col justify-between w-[56px] h-full flex-shrink-0">
        {/* QR Scanner Tile */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1, backgroundColor: '#222228' }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onQRClick}
          className="w-[56px] h-[56px] rounded-[18px] bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300 shadow-md group"
          title="Scan QR Code"
        >
          <QrCode className="w-6 h-6 text-zinc-300 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-200" />
        </motion.button>

        {/* Quick Add Expense (+) Tile */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1, backgroundColor: '#222228' }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onAddClick}
          className="w-[56px] h-[56px] rounded-[18px] bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300 shadow-md group"
          title="Quick Add Expense"
        >
          <Plus className="w-6 h-6 text-zinc-300 group-hover:text-emerald-400 group-hover:rotate-90 group-hover:scale-110 stroke-[2.2] transition-all duration-300" />
        </motion.button>
      </div>

      {/* Column 2: Tips And Training Tile */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2, backgroundColor: '#1c1c20' }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onTipsClick}
        className="flex-1 rounded-[24px] bg-[#18181b] border border-[#27272a] p-3.5 flex flex-col justify-between cursor-pointer shadow-md group"
      >
        <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-200">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="text-white text-[13px] font-medium tracking-tight leading-snug group-hover:text-purple-300 transition-colors">
          Tips And Training
        </div>
      </motion.div>

      {/* Column 3: All Services Tile */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2, backgroundColor: '#1c1c20' }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onServicesClick}
        className="flex-1 rounded-[24px] bg-[#18181b] border border-[#27272a] p-3.5 flex flex-col justify-between cursor-pointer shadow-md group"
      >
        <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-200">
          <LayoutGrid className="w-5 h-5" />
        </div>
        <div className="text-white text-[13px] font-medium tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
          All Services
        </div>
      </motion.div>
    </div>
  );
};
