import React from 'react';
import { Wifi, Battery, Smartphone, Maximize2, Eye, ShieldCheck } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  isHeatmapActive: boolean;
  onToggleHeatmap: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  isPhoneFrame,
  onToggleFrame,
  isHeatmapActive,
  onToggleHeatmap,
}) => {
  if (!isPhoneFrame) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-start">
        {/* Top presentation toolbar for quick toggling */}
        <div className="w-full max-w-[430px] px-4 py-2 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/80 border-b border-zinc-900 sticky top-0 z-50">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold">MyBudget Mobile</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleHeatmap}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                isHeatmapActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>AI Heatmap</span>
            </button>

            <button
              onClick={onToggleFrame}
              className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              title="Switch to Phone Mockup Frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-[430px] min-h-screen relative bg-[#0c0c0e]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060608] via-[#0e0e12] to-[#060608] text-white flex flex-col items-center justify-center p-2 sm:p-6 select-none">
      {/* Top Presentation Bar */}
      <div className="w-full max-w-[440px] mb-4 flex items-center justify-between text-xs px-2">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium">Corizo UI/UX Course</span>
          <span className="text-zinc-600">•</span>
          <span className="text-purple-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            MyBudget App
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Attention Insight Toggle */}
          <button
            onClick={onToggleHeatmap}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isHeatmapActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>AI Heatmap {isHeatmapActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFrame}
            className="p-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-all"
            title="Toggle Fullscreen Responsive Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iPhone 16 Pro Mockup Shell matching reference screenshot */}
      <div className="relative w-full max-w-[390px] h-[830px] rounded-[52px] bg-[#0c0c0e] border-[8px] border-[#2c2b30] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-zinc-800 overflow-hidden flex flex-col">
        {/* Outer subtle metallic rim edge */}
        <div className="absolute inset-0 rounded-[44px] pointer-events-none border border-white/10" />

        {/* Dynamic Island Notch & Speaker */}
        <div className="relative z-30 pt-3 pb-1 px-7 flex items-center justify-between text-white text-[13px] font-semibold tracking-tight bg-transparent select-none">
          {/* Time: 9:41 */}
          <span className="w-12 text-left font-semibold">9:41</span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-[22px] bg-black rounded-full flex items-center justify-end px-2 gap-1.5 border border-zinc-800/60 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
          </div>

          {/* Status Icons: Cellular, Wifi, Battery */}
          <div className="w-12 flex items-center justify-end gap-1.5 text-white">
            {/* Cellular signal bars */}
            <div className="flex items-end gap-[1px] h-2.5">
              <span className="w-[2px] h-1 bg-white rounded-sm" />
              <span className="w-[2px] h-1.5 bg-white rounded-sm" />
              <span className="w-[2px] h-2 bg-white rounded-sm" />
              <span className="w-[2px] h-2.5 bg-white rounded-sm" />
            </div>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-white" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#0c0c0e] scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
};
