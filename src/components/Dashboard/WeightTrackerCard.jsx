import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';

export default function WeightTrackerCard() {
  const { user, weightLogs, logWeight } = useFitness();
  const [inputWeight, setInputWeight] = useState(user.weight || 70.0);

  useEffect(() => {
    if (user?.weight) setInputWeight(user.weight);
  }, [user?.weight]);

  const handleSave = (e) => {
    e.preventDefault();
    if (inputWeight > 0) {
      logWeight(inputWeight);
    }
  };

  // Safe logs
  const logs = weightLogs && weightLogs.length > 0 ? weightLogs : [
    { date: '2026-11-04', weight: 75.4 },
    { date: '2026-11-08', weight: 75.0 },
    { date: '2026-11-12', weight: 74.6 },
    { date: '2026-11-17', weight: 74.2 },
  ];

  // SVG Chart Dimensions
  const weights = logs.map(l => l.weight);
  const minW = Math.min(...weights, user.targetWeight || 70) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  const width = 360;
  const height = 120;
  const padX = 20;
  const padY = 20;

  // Compute points
  const points = logs.map((l, idx) => {
    const x = padX + (idx / Math.max(1, logs.length - 1)) * (width - 2 * padX);
    const y = height - padY - ((l.weight - minW) / range) * (height - 2 * padY);
    return { x, y, weight: l.weight, date: l.date };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  // Target line Y
  const targetY = user.targetWeight
    ? height - padY - ((user.targetWeight - minW) / range) * (height - 2 * padY)
    : null;

  return (
    <div className="w-full rounded-3xl p-5 sm:p-6 bg-[#14151C] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <span className="material-symbols-outlined text-[20px]">scale</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Weight Trajectory</h3>
            <p className="text-xs text-white/50">
              Current: <strong className="text-white">{user.weight || 74.2} kg</strong> • Target: {user.targetWeight || 70.0} kg
            </p>
          </div>
        </div>

        {/* Quick Log Form */}
        <form onSubmit={handleSave} className="flex items-center gap-1.5 w-full sm:w-auto">
          <input
            type="number"
            step="0.1"
            min="30"
            max="250"
            value={inputWeight}
            onChange={(e) => setInputWeight(Number(e.target.value))}
            className="w-20 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF2A2E]"
            placeholder="kg"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Log Weight
          </button>
        </form>
      </div>

      {/* SVG Trend Chart */}
      <div className="py-4">
        <div className="w-full h-32 flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Target Weight dashed guide line */}
            {targetY && (
              <>
                <line
                  x1={padX}
                  y1={targetY}
                  x2={width - padX}
                  y2={targetY}
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <text
                  x={width - padX}
                  y={targetY - 5}
                  fill="#10B981"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  Target {user.targetWeight}kg
                </text>
              </>
            )}

            {/* Gradient Area under line */}
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`}
                fill="url(#weightGrad)"
              />
            )}

            {/* Main Weight Path Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#14151C"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="#e3e1e9"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {p.weight}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Footer Insight */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
        <span>14-day tracking trend</span>
        <span className="text-emerald-400 font-medium">
          ↓ {((logs[0]?.weight || 75.4) - (user.weight || 74.2)).toFixed(1)} kg lost this month
        </span>
      </div>
    </div>
  );
}
