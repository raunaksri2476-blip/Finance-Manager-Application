import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-sm max-w-md"
      >
        {icons[toast.type] || icons.info}
        <span className="flex-1 font-medium">{toast.message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
