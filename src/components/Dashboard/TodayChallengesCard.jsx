import React from 'react';
import { useFitness } from '../../context/FitnessContext';

export default function TodayChallengesCard({ setActiveTab }) {
  const { challenges, toggleChallenge, claimActiveXP } = useFitness();

  const completedCount = (challenges || []).filter(c => c.completed).length;
  const totalCount = challenges?.length || 4;
  const claimableXp = (challenges || [])
    .filter(c => c.completed && !c.claimed)
    .reduce((sum, c) => sum + (c.xp || 0), 0);
  const claimedXp = (challenges || [])
    .filter(c => c.claimed)
    .reduce((sum, c) => sum + (c.xp || 0), 0);

  return (
    <div className="w-full rounded-3xl p-5 sm:p-6 bg-[#14151C] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">emoji_events</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Today's Challenges</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 whitespace-nowrap">
                {completedCount} of {totalCount} done
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {claimedXp > 0 ? `+${claimedXp} XP claimed today` : 'Resets daily at 12:00 AM'} • Daily movement goals
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {claimableXp > 0 && (
            <button
              onClick={claimActiveXP}
              className="px-3 py-1.5 rounded-xl bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              + Claim {claimableXp} XP
            </button>
          )}
          <button
            onClick={() => setActiveTab && setActiveTab('quest-hall')}
            className="text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>All Quests</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Challenges List (Max 4) */}
      <div className="space-y-2.5 pt-4">
        {(challenges || []).slice(0, 4).map((c) => (
          <div
            key={c.id}
            onClick={() => toggleChallenge(c.id)}
            className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
              c.completed
                ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-white/80'
                : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/10 text-white'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 pr-3">
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  c.completed
                    ? 'bg-emerald-500 border-emerald-400 text-black font-bold'
                    : 'border-white/20 group-hover:border-white/40 bg-white/5'
                }`}
              >
                {c.completed && (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                )}
              </div>

              <div className="min-w-0">
                <h4 className={`text-sm font-semibold truncate transition-colors ${
                  c.completed ? 'line-through text-white/50' : 'text-white'
                }`}>
                  {c.title}
                </h4>
                <p className="text-[11px] text-white/40 truncate mt-0.5">
                  {c.target} • {c.reps || 'Daily target'}
                </p>
              </div>
            </div>

            {/* XP Badge */}
            <span
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold font-mono transition-all ${
                c.completed
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/5 text-amber-400 border border-white/10'
              }`}
            >
              +{c.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
