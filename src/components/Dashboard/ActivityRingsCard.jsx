import React from 'react';
import { useFitness } from '../../context/FitnessContext';

export default function ActivityRingsCard() {
  const { user, targets, dailyTotals, addWater } = useFitness();

  const calConsumed = dailyTotals?.calories || 0;
  const calTarget = targets?.calories || 2260;
  const calPct = Math.min(100, Math.round((calConsumed / calTarget) * 100));
  const calLeft = Math.max(0, calTarget - calConsumed);

  const proteinConsumed = dailyTotals?.protein || 0;
  const proteinTarget = targets?.protein || 163;
  const proteinPct = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));

  const waterConsumed = user?.hydrationLiters || 0;
  const waterTarget = targets?.hydration || 3.5;
  const waterPct = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));

  // Circumference calculations: C = 2 * PI * r
  // R1 = 68 -> C1 = 427.25
  // R2 = 52 -> C2 = 326.72
  // R3 = 36 -> C3 = 226.19
  const c1 = 427.25;
  const c2 = 326.72;
  const c3 = 226.19;

  const offset1 = c1 - (c1 * calPct) / 100;
  const offset2 = c2 - (c2 * proteinPct) / 100;
  const offset3 = c3 - (c3 * waterPct) / 100;

  return (
    <div className="w-full rounded-3xl p-5 sm:p-6 bg-[#14151C] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF2A2E] text-[20px]">donut_large</span>
          <h3 className="text-base font-bold text-white tracking-tight">Today's Activity Rings</h3>
        </div>
        <span className="text-xs text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          {calPct >= 100 && proteinPct >= 100 ? 'Goals Crushed 🎯' : 'In Progress'}
        </span>
      </div>

      {/* Main Rings + Metrics Row */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
        {/* Apple-Style Concentric Rings */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
            {/* Background Tracks */}
            <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255, 42, 46, 0.15)" strokeWidth="10" />
            <circle cx="80" cy="80" r="52" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="10" />
            <circle cx="80" cy="80" r="36" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="10" />

            {/* Ring 1: Calories (Crimson) */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="#FF2A2E"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c1}
              strokeDashoffset={offset1}
              className="transition-all duration-1000 ease-out"
            />

            {/* Ring 2: Protein (Emerald) */}
            <circle
              cx="80"
              cy="80"
              r="52"
              fill="none"
              stroke="#10B981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c2}
              strokeDashoffset={offset2}
              className="transition-all duration-1000 ease-out"
            />

            {/* Ring 3: Hydration (Cyan) */}
            <circle
              cx="80"
              cy="80"
              r="36"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c3}
              strokeDashoffset={offset3}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Info Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-mono text-xl font-black text-white tracking-tight">
              {calLeft > 0 ? calLeft : '0'}
            </span>
            <span className="text-[10px] text-white/50 uppercase font-semibold">
              {calLeft > 0 ? 'kcal left' : 'Goal met!'}
            </span>
          </div>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="flex-1 w-full space-y-2.5 max-w-sm">
          {/* Metric 1: Calories */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#FF2A2E] shadow-[0_0_8px_rgba(255,42,46,0.6)]" />
              <div>
                <span className="text-xs font-semibold text-white block">Calories</span>
                <span className="text-[11px] text-white/40">{calPct}% of target</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-white">
                {calConsumed} <span className="text-white/40 font-normal">/ {calTarget} kcal</span>
              </span>
            </div>
          </div>

          {/* Metric 2: Protein */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <div>
                <span className="text-xs font-semibold text-white block">Protein</span>
                <span className="text-[11px] text-white/40">{proteinPct}% of target</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-white">
                {proteinConsumed} <span className="text-white/40 font-normal">/ {proteinTarget}g</span>
              </span>
            </div>
          </div>

          {/* Metric 3: Hydration */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <div>
                <span className="text-xs font-semibold text-white block">Hydration</span>
                <span className="text-[11px] text-white/40">{waterPct}% of target</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-white">
                {waterConsumed} <span className="text-white/40 font-normal">/ {waterTarget}L</span>
              </span>
              <button
                type="button"
                onClick={() => addWater(0.25)}
                className="px-2 py-1 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#06B6D4] border border-[#06B6D4]/30 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                title="Add 250ml water"
              >
                +250ml
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
