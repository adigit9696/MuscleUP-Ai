import React from 'react';
import { useFitness } from '../../context/FitnessContext';

export default function NextStepCard({ setActiveTab }) {
  const { user, targets, dailyTotals, challenges } = useFitness();

  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon';
  else if (currentHour >= 17 && currentHour < 22) greeting = 'Good evening';
  else if (currentHour >= 22 || currentHour < 5) greeting = 'Good night';

  const caloriesRemaining = Math.max(0, (targets.calories || 2260) - (dailyTotals.calories || 0));
  const proteinRemaining = Math.max(0, (targets.protein || 163) - (dailyTotals.protein || 0));
  const incompleteChallenges = (challenges || []).filter(c => !c.completed);
  const nextChallenge = incompleteChallenges[0] || (challenges && challenges[0]);

  // Primary focus: Start Workout (navigates to Quest Hall)
  const workoutTitle = incompleteChallenges.length > 0
    ? `Today's Workout: ${nextChallenge?.title?.split(':')[0] || 'Calisthenics Power'}`
    : "All Daily Challenges Crushed! 🔥";

  const workoutDescription = incompleteChallenges.length > 0
    ? `Target: ${nextChallenge?.target || 'Full Body'} • ${nextChallenge?.reps || '3 sets'} • Earn +${nextChallenge?.xp || 75} XP to keep your ${user.streak || 7}-day streak boost!`
    : `Amazing work! Your ${user.streak || 7}-day streak is protected. Explore the interactive 3D muscle guide for recovery or bonus sets.`;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#171822] via-[#1D1E2A] to-[#2B171A] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      {/* Background Sporty Fitness Ambience */}
      <div
        className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-15 pointer-events-none"
        style={{ backgroundImage: "url('/assets/1.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F14]/90 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-[#FF2A2E]">
              {greeting}, {user.name || 'Athlete'}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-xs text-white/50">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-xs text-amber-400 font-bold">
              🔥 {user.streak || 7}d Streak Active
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {workoutTitle}
          </h2>

          <p className="text-sm text-white/70 leading-relaxed">
            {workoutDescription}
          </p>

          <div className="pt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
            <span>Remaining: <strong className="text-white">{caloriesRemaining} kcal</strong></span>
            <span>•</span>
            <span>Protein target: <strong className="text-emerald-400">{proteinRemaining}g left</strong></span>
          </div>
        </div>

        {/* Primary Hero "Start Workout" CTA */}
        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={() => setActiveTab && setActiveTab('quest-hall')}
            className="w-full md:w-auto px-7 py-4 rounded-2xl bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white font-extrabold text-sm tracking-wide shadow-[0_8px_24px_rgba(255,42,46,0.45)] hover:shadow-[0_8px_32px_rgba(255,42,46,0.65)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[22px]">fitness_center</span>
            <span>Start Workout</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
