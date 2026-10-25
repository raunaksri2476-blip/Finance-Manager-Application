import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ fullScreen = false, message = 'Loading finance data...' }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-9 h-9 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default Loading;
