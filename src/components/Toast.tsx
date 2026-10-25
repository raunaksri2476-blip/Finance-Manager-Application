import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'alert' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={onDismiss}
          className="fixed top-14 left-4 right-4 max-w-[360px] mx-auto z-50 cursor-pointer select-none"
        >
          <div className="bg-[#18181d]/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : toast.type === 'alert' 
                ? 'bg-rose-500/20 text-rose-400' 
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : toast.type === 'alert' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1">
              <div className="text-white text-xs font-bold tracking-tight">
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-zinc-400 text-[11px] mt-0.5">
                  {toast.description}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
