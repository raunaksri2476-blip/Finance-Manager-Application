import React from 'react';
import { Eye, Info, X } from 'lucide-react';

interface AttentionInsightOverlayProps {
  onClose: () => void;
}

export const AttentionInsightOverlay: React.FC<AttentionInsightOverlayProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
      {/* Top Floating Heatmap Metrics HUD */}
      <div className="pointer-events-auto absolute top-12 left-4 right-4 z-40 bg-zinc-900/90 backdrop-blur-md border border-purple-500/40 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between text-xs animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-white font-bold text-[11px] flex items-center gap-1.5">
              <span>Attention Insight (AI) Gaze Heatmap</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                CLARITY: 84/100
              </span>
            </div>
            <div className="text-zinc-400 text-[10px]">
              Simulating 100+ predictive gaze fixations (0.42s window)
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          title="Exit Heatmap Mode"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Heatmap Layer Gradients */}

      {/* Hotspot 1: Wallet Card Balance ($15,630.71) - Deep Red Core */}
      <div 
        className="absolute top-[170px] left-[50%] -translate-x-[50%] w-64 h-36 rounded-full opacity-75 blur-2xl heatmap-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.9) 0%, rgba(245,158,11,0.7) 40%, rgba(16,185,129,0.3) 70%, transparent 100%)'
        }}
      />
      {/* AOI Marker for Wallet Card */}
      <div className="pointer-events-auto absolute top-[148px] right-6 px-2 py-0.5 rounded-md bg-red-600/90 text-white font-mono text-[9px] font-bold shadow-lg">
        AOI 1 • 38.2% Focus
      </div>

      {/* Hotspot 2: Spending Category Pill Bar - Amber / Emerald */}
      <div 
        className="absolute top-[345px] left-8 w-36 h-20 rounded-full opacity-70 blur-xl heatmap-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.85) 0%, rgba(16,185,129,0.5) 50%, transparent 100%)'
        }}
      />
      <div className="pointer-events-auto absolute top-[310px] left-6 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-black font-mono text-[9px] font-bold shadow-lg">
        AOI 2 • 24.1% Focus
      </div>

      {/* Hotspot 3: Quick Action '+' Add Transaction Button */}
      <div 
        className="absolute top-[480px] left-8 w-24 h-24 rounded-full opacity-80 blur-lg heatmap-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.95) 0%, rgba(245,158,11,0.6) 45%, transparent 100%)'
        }}
      />
      <div className="pointer-events-auto absolute top-[430px] left-6 px-1.5 py-0.5 rounded-md bg-red-500/90 text-white font-mono text-[9px] font-bold shadow-lg">
        AOI 3 • 16.4% Focus
      </div>

      {/* Hotspot 4: Cash Back Badges */}
      <div 
        className="absolute top-[345px] right-10 w-32 h-20 rounded-full opacity-60 blur-xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.7) 0%, rgba(6,182,212,0.3) 60%, transparent 100%)'
        }}
      />

      {/* Bottom Floating Legend Bar */}
      <div className="pointer-events-auto absolute bottom-16 left-6 right-6 bg-black/85 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between text-[10px] text-zinc-300 shadow-xl">
        <span className="font-semibold flex items-center gap-1">
          <Info className="w-3 h-3 text-purple-400" />
          Heat Intensity Scale:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-mono">Low</span>
          <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-500" />
          <span className="text-red-400 font-mono font-bold">High</span>
        </div>
      </div>
    </div>
  );
};
