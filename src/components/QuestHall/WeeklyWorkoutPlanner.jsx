import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  Clock,
  Sparkles,
  RotateCcw,
  Eye,
  Dumbbell,
  Award,
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { PLAN_TEMPLATES, getTodayDayId } from '../../data/weeklyWorkoutPlans';

export default function WeeklyWorkoutPlanner({
  selectedDayId,
  setSelectedDayId,
  onOpenFormGuide,
}) {
  const {
    weeklyPlan,
    generateWeeklyPlan,
    toggleWeeklyTask,
    claimWeeklyDayXP,
    resetWeeklyPlanProgress,
  } = useFitness();

  const todayId = getTodayDayId();
  const days = weeklyPlan?.days || [];
  const activeDay = days.find((d) => d.dayId === selectedDayId) || days[0];

  // Weekly totals
  const totalWeekTasks = days.reduce((sum, d) => sum + d.tasks.length, 0);
  const doneWeekTasks = days.reduce(
    (sum, d) => sum + d.tasks.filter((t) => t.completed).length,
    0
  );

  // Active day totals
  const dayTasks = activeDay?.tasks || [];
  const dayDoneCount = dayTasks.filter((t) => t.completed).length;
  const dayPct =
    dayTasks.length > 0 ? Math.round((dayDoneCount / dayTasks.length) * 100) : 0;
  const dayClaimableXp = dayTasks
    .filter((t) => t.completed && !t.claimed)
    .reduce((sum, t) => sum + (t.xp || 25), 0);
  const dayAllClaimed =
    dayTasks.length > 0 && dayTasks.every((t) => t.claimed);

  const templateList = Object.values(PLAN_TEMPLATES);

  return (
    <section className="rounded-3xl bg-[#14151C] p-5 sm:p-6 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.45)] space-y-5">
      {/* Header + Plan Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-[#FF2A2E]" />
            <h2 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-tight">
              7-Day Workout Planner
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {doneWeekTasks} / {totalWeekTasks} tasks done
            </span>
          </div>
          <p className="text-xs text-white/55">
            {weeklyPlan?.tagline ||
              'Follow simple, beginner-friendly exercises each day. Click Done on completed tasks and Claim XP.'}
          </p>
        </div>

        {/* Plan Style Selector + Reset */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            {templateList.map((tpl) => {
              const isSelected = weeklyPlan?.templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => generateWeeklyPlan(tpl.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#FF2A2E] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={resetWeeklyPlanProgress}
            title="Reset all checkboxes for a new week"
            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-white/65 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Week</span>
          </button>
        </div>
      </div>

      {/* 7-Day Interactive Day Strip (Mon - Sun) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const isSelected = activeDay?.dayId === day.dayId;
          const isToday = day.dayId === todayId;
          const allDone =
            day.tasks.length > 0 && day.tasks.every((t) => t.completed);
          const doneCount = day.tasks.filter((t) => t.completed).length;

          return (
            <button
              key={day.dayId}
              type="button"
              onClick={() => setSelectedDayId(day.dayId)}
              className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FF2A2E] border-[#FF2A2E] text-white shadow-[0_6px_20px_rgba(255,42,46,0.4)]'
                  : allDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
                  : 'bg-white/[0.03] border-white/[0.07] text-white/70 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              {isToday && (
                <span
                  className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${
                    isSelected ? 'text-white/90' : 'text-[#FF2A2E]'
                  }`}
                >
                  Today
                </span>
              )}
              <span className="text-xs sm:text-sm font-extrabold">
                {day.shortLabel}
              </span>

              <div className="mt-1 flex items-center gap-1 text-[10px] font-mono">
                {allDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className={isSelected ? 'text-white/85' : 'text-white/40'}>
                    {doneCount}/{day.tasks.length}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Workout Breakdown */}
      {activeDay && (
        <motion.div
          key={activeDay.dayId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Active Day Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-[#FF2A2E]">
                  {activeDay.dayName}
                  {activeDay.dayId === todayId ? ' (Today)' : ''}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-white/70 border border-white/10">
                  {activeDay.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                  <Clock className="w-3 h-3" />
                  {activeDay.duration}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {activeDay.focus}
              </h3>
            </div>

            {/* Active Day Progress Bar */}
            <div className="w-full sm:w-48 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-medium">Day Completion</span>
                <span className="font-mono font-bold text-emerald-400">
                  {dayDoneCount}/{dayTasks.length} ({dayPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
                  style={{ width: `${dayPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Simple Interactive Exercise Task Cards */}
          <div className="space-y-2.5">
            {dayTasks.map((task, idx) => {
              const isDone = task.completed;
              const isClaimed = task.claimed;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                    isClaimed
                      ? 'bg-emerald-500/[0.08] border-emerald-500/30'
                      : isDone
                      ? 'bg-emerald-500/[0.05] border-emerald-400/25'
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.07]'
                  }`}
                >
                  {/* Left: Step number + Exercise Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-mono shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white/[0.06] text-white/70 border border-white/10'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold transition-colors ${
                            isDone ? 'text-white/60 line-through' : 'text-white'
                          }`}
                        >
                          {task.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-white/60">
                          {task.muscle}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-sky-400">
                          {task.setsReps}
                        </span>
                        {task.rest && task.rest !== 'None' && (
                          <span className="text-[11px] text-white/40">
                            • {task.rest}
                          </span>
                        )}
                      </div>

                      {/* Plain-English How-To Hint */}
                      <p className="text-xs text-white/60 leading-relaxed">
                        {task.howTo}
                      </p>

                      {onOpenFormGuide && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenFormGuide({
                              name: task.name,
                              reps: task.setsReps,
                              tempo: task.rest || 'Controlled',
                              desc: task.howTo,
                              cues: task.cues || task.howTo,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-white font-semibold pt-0.5 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>See step-by-step form tip</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: XP Tag + Interactive "Done" Button */}
                  <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    <span
                      className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                        isClaimed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isDone
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                          : 'bg-white/5 text-amber-400 border border-white/10'
                      }`}
                    >
                      {isClaimed ? 'Claimed ✓' : `+${task.xp} XP`}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleWeeklyTask(activeDay.dayId, task.id)}
                      disabled={isClaimed}
                      className={`min-w-[96px] px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        isClaimed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : isDone
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_14px_rgba(16,185,129,0.35)] cursor-pointer active:scale-95'
                          : 'bg-white/[0.07] hover:bg-emerald-500 hover:text-black text-white border border-white/15 cursor-pointer active:scale-95'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{isClaimed ? 'Claimed' : isDone ? 'Done' : 'Done'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day Footer: Submit Progress & Claim XP */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs">
              <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white font-semibold">
                {activeDay.dayName} Progress: {dayDoneCount} of {dayTasks.length} completed
              </span>
              {dayClaimableXp > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono text-[11px] font-bold">
                  +{dayClaimableXp} XP ready
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => claimWeeklyDayXP(activeDay.dayId)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                dayClaimableXp > 0
                  ? 'bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white shadow-[0_6px_22px_rgba(255,42,46,0.45)]'
                  : dayAllClaimed
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-white/70 border border-white/10'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {dayClaimableXp > 0
                  ? `+ Claim ${dayClaimableXp} XP`
                  : dayAllClaimed
                  ? `${activeDay.shortLabel} XP Claimed ✓`
                  : '+ Claim XP'}
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
