import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Flame, Shield, Check, Circle, Clock, Dumbbell, 
  Eye, PlusCircle, X, Calendar, ChevronRight, Zap, Award
} from 'lucide-react';
import { useFitness, getTimeUntilMidnight } from '../../context/FitnessContext';
import { getTodayDayId } from '../../data/weeklyWorkoutPlans';
import InteractiveMuscleMap from './InteractiveMuscleMap';
import WeeklyWorkoutPlanner from './WeeklyWorkoutPlanner';

export default function QuestHallView() {
  const {
    user,
    userProfile,
    updateXP,
    showToast,
    addToast,
    challenges: contextChallenges,
    toggleChallenge,
    claimActiveXP,
    addExerciseToWeeklyDay,
  } = useFitness();
  const profile = user || userProfile || { name: 'Aditya', level: 3, levelTitle: 'Iron Crusader', xp: 1425, nextLevelXp: 2000, streak: 7, streakMultiplier: 1.2 };
  const notify = showToast || addToast;

  // Active muscle group for the anatomical biomechanical explorer
  const [selectedMuscle, setSelectedMuscle] = useState('chest');
  const [intensityFilter, setIntensityFilter] = useState('All');

  // Selected day in the interactive 7-Day Workout Planner (defaults to today)
  const [selectedDayId, setSelectedDayId] = useState(() => getTodayDayId());
  
  // Form guide modal state
  const [activeModalExercise, setActiveModalExercise] = useState(null);

  // Real live countdown timer to 12:00 AM (midnight) local time
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntilMidnight());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Complete 9-muscle catalog database for front view + bodyweight home routines
  const muscleData = {
    chest: {
      name: "Chest",
      count: 5,
      exercises: [
        { 
          id: "ex-c1",
          name: "Standard Push-Ups", 
          level: "Beginner", 
          target: "Chest & Triceps", 
          reps: "3 sets × 12-15 reps", 
          tempo: "2s down, 1s up", 
          desc: "The classic home push-up. Keep wrists under shoulders and core locked in a straight line.",
          cues: "Keep elbows at a 45-degree angle. Lower chest 2 inches from floor, then press back up with power."
        },
        { 
          id: "ex-c2",
          name: "Decline Push-Ups", 
          level: "Intermediate", 
          target: "Upper Chest & Shoulders", 
          reps: "3 sets × 10-12 reps", 
          tempo: "2s down, 1s up", 
          desc: "Feet elevated on a chair or sofa to target clavicular upper chest fibres.",
          cues: "Keep core tight without sagging hips. Lower slowly and press smoothly."
        },
        { 
          id: "ex-c3",
          name: "Diamond Push-Ups", 
          level: "Advanced", 
          target: "Inner Chest & Triceps", 
          reps: "3 sets × 8-10 reps", 
          tempo: "2s down, 1s up", 
          desc: "Join thumbs and index fingers under chest for arm and triceps lockout strength.",
          cues: "Keep elbows tucked close to ribcage and squeeze pecs at the top."
        },
        { 
          id: "ex-c4",
          name: "Incline Push-Ups", 
          level: "Beginner", 
          target: "Lower Chest", 
          reps: "3 sets × 15-20 reps", 
          tempo: "2s down, 1s up", 
          desc: "Hands on a desk or sturdy surface. Great for building foundational pressing volume.",
          cues: "Higher elevation reduces load. Focus on chest expansion."
        },
        { 
          id: "ex-c5",
          name: "Wide-Grip Push-Ups", 
          level: "Intermediate", 
          target: "Outer Chest", 
          reps: "3 sets × 12 reps", 
          tempo: "3s down, 1s up", 
          desc: "Place hands wider than shoulders to isolate horizontal pec adduction.",
          cues: "Lower with controlled tempo to feel deep pectoral stretch."
        }
      ]
    },
    shoulders: {
      name: "Shoulders",
      count: 4,
      exercises: [
        { 
          id: "ex-s1",
          name: "Pike Push-Ups", 
          level: "Intermediate", 
          target: "Anterior & Lateral Deltoids", 
          reps: "3 sets × 8-10 reps", 
          tempo: "2s down, 1s up", 
          desc: "Hips elevated high in an inverted V-shape to direct load overhead onto shoulders.",
          cues: "Lower forehead slightly ahead of hands forming a safe tripod."
        },
        { 
          id: "ex-s2",
          name: "Wall Handstand Hold", 
          level: "Advanced", 
          target: "Entire Shoulder Girdle", 
          reps: "3 sets × 30-45 sec", 
          tempo: "Isometric hold", 
          desc: "Feet walked up a wall for overhead shoulder stability and lock-out strength.",
          cues: "Push floor away actively with locked elbows and tight glutes."
        },
        { 
          id: "ex-s3",
          name: "Prone Y-T-W Arm Raises", 
          level: "Beginner", 
          target: "Rear Delts & Rotator Cuff", 
          reps: "3 sets × 12 each", 
          tempo: "Controlled", 
          desc: "Lie face down and raise arms in Y, T, and W shapes with thumbs facing up.",
          cues: "Pinch shoulder blades gently at top of each repetition."
        },
        {
          id: "ex-s4",
          name: "Pike Shoulder Taps",
          level: "Intermediate",
          target: "Shoulder Stability",
          reps: "3 sets × 16 taps",
          tempo: "Controlled",
          desc: "From pike position, tap opposite shoulder without rotating hips.",
          cues: "Shift weight smoothly onto one hand while pressing tall."
        }
      ]
    },
    biceps: {
      name: "Biceps",
      count: 3,
      exercises: [
        { 
          id: "ex-bi1",
          name: "Doorframe Isometric Curls", 
          level: "Beginner", 
          target: "Biceps Brachii", 
          reps: "4 sets × 20 sec pull", 
          tempo: "Max tension", 
          desc: "Grip a sturdy door jamb with underhand grip and pull body in actively.",
          cues: "Keep elbow pinned near hip and squeeze biceps at maximum voluntary contraction."
        },
        { 
          id: "ex-bi2",
          name: "Table Underhand Bodyweight Curls", 
          level: "Intermediate", 
          target: "Biceps & Brachialis", 
          reps: "3 sets × 10 reps", 
          tempo: "2s pull, 2s down", 
          desc: "Lie under a sturdy table, grip the edge palms-up, and curl chest to the underside.",
          cues: "Keep body straight in a reverse plank line."
        },
        { 
          id: "ex-bi3",
          name: "Towel Isometric Flex Hold", 
          level: "Beginner", 
          target: "Bicep Peak", 
          reps: "3 sets × 30 sec hold", 
          tempo: "Static", 
          desc: "Loop a strong bath towel under both feet and pull up with full curling force.",
          cues: "Lock elbows at 90 degrees and pull against your feet."
        }
      ]
    },
    forearms: {
      name: "Forearms",
      count: 3,
      exercises: [
        { 
          id: "ex-fa1",
          name: "Fingertip Push-Up Hold", 
          level: "Intermediate", 
          target: "Forearm Flexors & Grip", 
          reps: "3 sets × 30-45 sec", 
          tempo: "Isometric", 
          desc: "Hold a push-up plank on your fingertips instead of palms.",
          cues: "Distribute pressure evenly across all 10 fingers with strong arches."
        },
        { 
          id: "ex-fa2",
          name: "Floor Wrist Extensions & Curls", 
          level: "Beginner", 
          target: "Wrist Flexors & Extensors", 
          reps: "3 sets × 20 reps", 
          tempo: "Slow & steady", 
          desc: "Kneel and roll wrists from back of hands to palms with gentle bodyweight.",
          cues: "Do not hyperextend. Warm up wrists gently before increasing load."
        },
        { 
          id: "ex-fa3",
          name: "Towel Wringing Endurance", 
          level: "Beginner", 
          target: "Grip & Rotational Forearm", 
          reps: "3 sets × 60 sec", 
          tempo: "Continuous", 
          desc: "Twist a tightly rolled dry towel in opposing directions with maximum grip force.",
          cues: "Alternate twist direction every 15 seconds."
        }
      ]
    },
    abs: {
      name: "Abdominals",
      count: 4,
      exercises: [
        { 
          id: "ex-a1",
          name: "Hollow Body Rock Hold", 
          level: "Intermediate", 
          target: "Deep Core & Rectus Abdominis", 
          reps: "4 sets × 35-45 sec", 
          tempo: "Static hold", 
          desc: "Press lower back firmly into floor, raising legs and arms into banana shape.",
          cues: "Never allow lower back to arch off the floor. Squeeze belly button down."
        },
        { 
          id: "ex-a2",
          name: "L-Sit Floor Hold", 
          level: "Advanced", 
          target: "Lower Abs & Hip Flexors", 
          reps: "4 sets × 15-20 sec", 
          tempo: "Static hold", 
          desc: "Palms on floor beside thighs; push down to suspend hips and legs off ground.",
          cues: "Depress shoulders hard. Tuck knees slightly if straight leg is too challenging."
        },
        { 
          id: "ex-a3",
          name: "Plank to Dolphin Pose", 
          level: "Intermediate", 
          target: "Core & Serratus", 
          reps: "3 sets × 12 reps", 
          tempo: "2s up, 2s down", 
          desc: "Transition from elbow plank into inverted pike using abdominal compression.",
          cues: "Push forearms actively into ground."
        },
        { 
          id: "ex-a4",
          name: "Dead Bug Core Extensions", 
          level: "Beginner", 
          target: "Anterior Core Stability", 
          reps: "3 sets × 12/side", 
          tempo: "2s extend, 1s return", 
          desc: "On your back, extend opposite arm and leg while holding trunk stationary.",
          cues: "Exhale sharply on extension to lock ribcage."
        }
      ]
    },
    obliques: {
      name: "Obliques",
      count: 3,
      exercises: [
        { 
          id: "ex-ob1",
          name: "Side Plank Hip Dips", 
          level: "Intermediate", 
          target: "Lateral Obliques", 
          reps: "3 sets × 12/side", 
          tempo: "2s down, 1s lift", 
          desc: "From a forearm side plank, dip hip toward floor and lift back to neutral.",
          cues: "Keep shoulders, hips, and ankles aligned in a single plane."
        },
        { 
          id: "ex-ob2",
          name: "Bicycle Crunch Rotations", 
          level: "Beginner", 
          target: "Transverse & Obliques", 
          reps: "3 sets × 20/side", 
          tempo: "Controlled pace", 
          desc: "Rotate ribcage to bring opposite armpit toward knee while extending other leg.",
          cues: "Turn shoulders, do not yank on head or neck."
        },
        { 
          id: "ex-ob3",
          name: "Russian Twists with Legs Elevated", 
          level: "Intermediate", 
          target: "Rotational Core", 
          reps: "3 sets × 20 twists", 
          tempo: "1s pause each side", 
          desc: "Sit on sit-bones with heels hovering, rotate torso smoothly touching floor.",
          cues: "Keep chest proud and follow hands with your gaze."
        }
      ]
    },
    quads: {
      name: "Quads",
      count: 4,
      exercises: [
        { 
          id: "ex-q1",
          name: "Air Squats with 3s Pause", 
          level: "Beginner", 
          target: "Quadriceps & Glutes", 
          reps: "4 sets × 15-20 reps", 
          tempo: "3s pause at bottom", 
          desc: "Deep bodyweight squats with 3-second bottom pause to eliminate bounce.",
          cues: "Keep heels grounded, knees tracking over second toes, and chest high."
        },
        { 
          id: "ex-q2",
          name: "Bulgarian Split Squats", 
          level: "Intermediate", 
          target: "Unilateral Quad Hypertrophy", 
          reps: "3 sets × 10/leg", 
          tempo: "2s down, 1s up", 
          desc: "Rear foot on chair; lower front knee to 90 degrees with upright torso.",
          cues: "Drive upward through front midfoot and heel."
        },
        { 
          id: "ex-q3",
          name: "Wall Sit Quad Burnout", 
          level: "Beginner", 
          target: "Isometric Quad Strength", 
          reps: "3 sets × 45-60 sec", 
          tempo: "Static hold", 
          desc: "Back flat against wall with thighs parallel to floor.",
          cues: "Knees directly over ankles, hands off thighs."
        },
        { 
          id: "ex-q4",
          name: "Assisted Pistol Squats", 
          level: "Advanced", 
          target: "Peak Single-Leg Power", 
          reps: "3 sets × 6-8/leg", 
          tempo: "Controlled", 
          desc: "Single-leg deep squat with non-working leg extended, holding doorframe for balance.",
          cues: "Keep heel flat and stand tall at top."
        }
      ]
    },
    calves: {
      name: "Calves",
      count: 3,
      exercises: [
        { 
          id: "ex-cal1",
          name: "Single-Leg Standing Calf Raises", 
          level: "Intermediate", 
          target: "Gastrocnemius", 
          reps: "3 sets × 15-20/leg", 
          tempo: "2s up, 2s stretch down", 
          desc: "Stand on a stair edge on one foot, drop heel deep and press onto big toe ball.",
          cues: "Hold the top peak contraction for 1 full second."
        },
        { 
          id: "ex-cal2",
          name: "Explosive Ankle Hops (Pogo Jumps)", 
          level: "Beginner", 
          target: "Achilles & Calf Elasticity", 
          reps: "3 sets × 30 hops", 
          tempo: "Fast spring", 
          desc: "Bounce rhythmically on balls of feet with stiff ankles like jump-roping.",
          cues: "Minimal knee bend; recoil with calf tendon elasticity."
        },
        { 
          id: "ex-cal3",
          name: "Seated Knee Calf Press", 
          level: "Beginner", 
          target: "Soleus Muscle", 
          reps: "3 sets × 25 reps", 
          tempo: "Controlled", 
          desc: "Sit with knees bent at 90 degrees and push balls of feet down against downward hand pressure.",
          cues: "Targets the deep soleus muscle responsible for lower leg width."
        }
      ]
    },
    traps: {
      name: "Traps",
      count: 3,
      exercises: [
        { 
          id: "ex-tr1",
          name: "Scapular Push-Ups", 
          level: "Beginner", 
          target: "Trapezius & Upper Scapula", 
          reps: "3 sets × 15 reps", 
          tempo: "2s protract, 1s retract", 
          desc: "In straight plank with arms locked, pinch shoulder blades together, then push ceiling away.",
          cues: "Arms stay completely straight; movement occurs entirely at the shoulder blades."
        },
        { 
          id: "ex-tr2",
          name: "Prone Y-Raises on Floor", 
          level: "Intermediate", 
          target: "Lower & Mid Traps", 
          reps: "3 sets × 12 reps", 
          tempo: "2s lift, 1s squeeze", 
          desc: "Lie on stomach with arms in wide Y-shape. Raise chest and arms squeezing upper back.",
          cues: "Lead with thumbs pointing toward ceiling."
        },
        { 
          id: "ex-tr3",
          name: "Crab Walk Static Shrug Hold", 
          level: "Intermediate", 
          target: "Upper Traps & Neck Stability", 
          reps: "3 sets × 35 sec", 
          tempo: "Static hold", 
          desc: "From reverse tabletop crab position, press palms down and shrug shoulders toward ears.",
          cues: "Keep hips elevated and head in comfortable neutral alignment."
        }
      ]
    }
  };

  const currentMuscleGroup = muscleData[selectedMuscle] || muscleData.chest;
  const filteredExercises = currentMuscleGroup.exercises.filter(ex => {
    if (intensityFilter === 'All') return true;
    return ex.level.toLowerCase() === intensityFilter.toLowerCase();
  });

  const completedCount = contextChallenges.filter(c => c.completed).length;
  const claimableChallengeXp = contextChallenges
    .filter(c => c.completed && !c.claimed)
    .reduce((sum, c) => sum + (c.xp || 0), 0);
  const allChallengesClaimed =
    contextChallenges.length > 0 && contextChallenges.every(c => c.claimed);
  const totalAvailableChallengeXp = contextChallenges
    .filter(c => !c.claimed)
    .reduce((sum, c) => sum + (c.xp || 0), 0);

  const frontMuscleList = [
    { id: 'chest', label: 'Chest' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'forearms', label: 'Forearms' },
    { id: 'abs', label: 'Abs' },
    { id: 'obliques', label: 'Obliques' },
    { id: 'quads', label: 'Quads' },
    { id: 'calves', label: 'Calves' },
    { id: 'traps', label: 'Traps' }
  ];

  const xpProgressPct = Math.min(
    100,
    Math.round(((profile.xp || 0) / (profile.nextLevelXp || 2000)) * 100)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 md:pb-16 relative">
      
      {/* Background Subtle Athletic Training Texture */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.025] pointer-events-none -z-10"
        style={{ backgroundImage: "url('/assets/3.jpg')" }}
      />

      {/* 1. Header Banner */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-[#FF2A2E]">
              Zero-Equipment Home Training
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
            Workout Challenges &amp; Body Guide
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
            Complete daily challenges, follow your interactive 7-day home workout plan, and tap any muscle on the map to explore exercises.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm text-xs">
          <span className="text-emerald-400 font-bold">1.2x Streak Boost</span>
          <span className="text-white/30">•</span>
          <span className="text-amber-400 font-bold">
            +{totalAvailableChallengeXp} Daily XP Left
          </span>
        </div>
      </section>

      {/* 2. Dynamic Lifter Level & XP Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14151C] p-5 sm:p-6 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Level */}
        <div className="md:col-span-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF2A2E]/10 border border-[#FF2A2E]/25 flex items-center justify-center text-[#FF2A2E] shadow-sm shrink-0">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-extrabold text-white uppercase tracking-tight block">
              Level {profile.level || 3} • {profile.levelTitle || 'Iron Crusader'}
            </span>
            <span className="text-xs text-white/60 font-medium">
              Consistent Home Athlete
            </span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="md:col-span-5 flex flex-col justify-center gap-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="text-white/70">
              XP Progress: <strong className="text-white font-bold font-mono">{(profile.xp || 0).toLocaleString()}</strong> / <span className="font-mono">{(profile.nextLevelXp || 2000).toLocaleString()}</span>
            </span>
            <span className="text-emerald-400 font-bold whitespace-nowrap">
              {Math.max(0, (profile.nextLevelXp || 2000) - (profile.xp || 0)).toLocaleString()} XP to Level {(profile.level || 3) + 1}
            </span>
          </div>

          <div className="relative w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-[#FF2A2E]"
              initial={false}
              animate={{ width: `${xpProgressPct}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="md:col-span-3 flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
              🔥
            </div>
            <div>
              <span className="text-xs text-white uppercase font-bold block">
                {profile.streak || 7}-Day Streak
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                Shield Active ❄️
              </span>
            </div>
          </div>
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
        </div>
      </div>

      {/* 3. Today's Daily Challenges (Dedicated Standalone Section — Resets Daily at 12:00 AM) */}
      <section className="rounded-3xl bg-[#14151C] p-5 sm:p-6 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-tight">
                Today's Challenges
              </h2>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Mark completed challenges as Done, then click "+ Claim XP" to submit your progress.
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-xs text-sky-400 self-start sm:self-auto bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 font-mono"
            title="Daily challenges automatically reset every night at 12:00 AM"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              Resets at 12:00 AM • {String(timeLeft.h).padStart(2, '0')}h {String(timeLeft.m).padStart(2, '0')}m {String(timeLeft.s).padStart(2, '0')}s
            </span>
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-2.5">
          {contextChallenges.map(challenge => {
            const isDone = challenge.completed;
            const isClaimed = challenge.claimed;
            const pct = Math.min(100, Math.round(((challenge.current || 0) / (challenge.total || 1)) * 100));

            return (
              <div
                key={challenge.id}
                onClick={() => toggleChallenge(challenge.id)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl transition-all border ${
                  isClaimed
                    ? 'bg-emerald-500/[0.08] border-emerald-500/35 shadow-sm cursor-default'
                    : isDone
                    ? 'bg-emerald-500/[0.05] border-emerald-400/30 shadow-sm cursor-pointer'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 cursor-pointer'
                }`}
              >
                {/* Checkbox & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isDone 
                      ? 'bg-emerald-500 text-black font-bold' 
                      : 'bg-white/5 text-white/40 group-hover:text-white border border-white/10'
                  }`}>
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Circle className="w-4 h-4" />}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className={`text-xs sm:text-sm font-bold block truncate transition-colors ${
                      isDone ? 'text-white/55 line-through' : 'text-white group-hover:text-[#FF2A2E]'
                    }`}>
                      {challenge.title}
                    </span>
                    <span className="text-xs text-white/45 block truncate">
                      Target: {challenge.target} • {challenge.reps || 'Daily Goal'}
                    </span>
                  </div>
                </div>

                {/* Progress, XP & Done Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`font-mono font-bold ${isDone ? 'text-emerald-400' : 'text-white'}`}>
                        {challenge.current} / {challenge.total}{challenge.unit || ''}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${
                        isClaimed ? 'text-emerald-400' : isDone ? 'text-amber-300' : 'text-white/40'
                      }`}>
                        {isClaimed ? 'Claimed' : isDone ? 'Ready' : 'Pending'}
                      </span>
                    </div>

                    <div className="w-24 sm:w-32 h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden ml-auto">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-emerald-400' : 'bg-sky-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                    isClaimed
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : isDone
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                      : 'bg-white/5 text-amber-400 border border-white/10'
                  }`}>
                    {isClaimed ? 'Claimed ✓' : `+${challenge.xp} XP`}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChallenge(challenge.id);
                    }}
                    disabled={isClaimed}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                      isClaimed
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default'
                        : isDone
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer'
                        : 'bg-white/[0.07] hover:bg-emerald-500 hover:text-black text-white border border-white/15 cursor-pointer'
                    }`}
                  >
                    {isClaimed ? 'Done ✓' : isDone ? 'Done ✓' : 'Done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions: Progress + Working "+ Claim XP" Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-bold">
              Progress: {completedCount} of {contextChallenges.length} completed
            </span>
            {claimableChallengeXp > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono text-[11px] font-bold">
                +{claimableChallengeXp} XP ready to claim
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={claimActiveXP}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              claimableChallengeXp > 0
                ? 'bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white shadow-[0_6px_22px_rgba(255,42,46,0.45)]'
                : allChallengesClaimed
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-white/75 border border-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>
              {claimableChallengeXp > 0
                ? `+ Claim ${claimableChallengeXp} XP`
                : allChallengesClaimed
                ? 'All Daily XP Claimed ✓'
                : '+ Claim XP'}
            </span>
          </button>
        </div>

      </section>

      {/* 4. Separate Integrated Interactive 7-Day Workout Planner */}
      <WeeklyWorkoutPlanner
        selectedDayId={selectedDayId}
        setSelectedDayId={setSelectedDayId}
        onOpenFormGuide={(ex) => setActiveModalExercise(ex)}
      />

      {/* 4. Target Muscle Directory with Realistic Interactive Muscle Map */}
      <section className="space-y-4">
        
        {/* Title & View Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Choose Muscle to Train
            </h2>
            <p className="text-xs text-white/50">
              Tap any muscle on the realistic anatomical map to explore zero-equipment home exercises.
            </p>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sky-400 text-xs font-semibold">
              Zero Equipment
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#FF2A2E]/15 text-[#FF2A2E] border border-[#FF2A2E]/30 text-xs font-bold">
              Selected: {currentMuscleGroup.name}
            </div>
          </div>
        </div>

        {/* Split Grid: Interactive Mannequin Map (5 Cols) + Exercises (7 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Realistic Interactive Muscle Map */}
          <div className="lg:col-span-5 rounded-3xl bg-[#14151C] p-5 sm:p-6 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4 flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-white/5">
              <span className="text-white/60 font-medium">Anatomical Muscle Map</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Interactive Front View
              </span>
            </div>

            {/* REALISTIC HIGH-FIDELITY INTERACTIVE MUSCLE MAP COMPONENT */}
            <InteractiveMuscleMap
              selectedMuscle={selectedMuscle}
              onSelectMuscle={setSelectedMuscle}
            />

            {/* Front Muscle Selection Chips (Synchronized, 44px min targets, accessible) */}
            <div className="w-full space-y-2 pt-2 border-t border-white/5">
              <span className="text-xs text-white/50 font-semibold block">
                Select by muscle group:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {frontMuscleList.map(item => {
                  const isActive = selectedMuscle === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMuscle(item.id)}
                      aria-pressed={isActive}
                      className={`min-h-[44px] px-2.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-[#FF2A2E] text-white shadow-[0_0_14px_rgba(255,42,46,0.5)]'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/5'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Exercises Directory */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Intensity Filter */}
            <div className="p-3.5 rounded-2xl bg-[#14151C] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-white/[0.08] text-xs">
              <span className="font-bold text-white uppercase tracking-wide">
                {currentMuscleGroup.exercises.length} Exercises for {currentMuscleGroup.name}
              </span>

              <div className="flex items-center flex-wrap gap-1.5">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setIntensityFilter(lvl)}
                    className={`px-2.5 py-1 rounded-xl cursor-pointer transition-colors ${
                      intensityFilter === lvl
                        ? 'bg-[#FF2A2E] text-white font-bold'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-2.5">
              {filteredExercises.map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="rounded-2xl bg-[#14151C] p-4 sm:p-5 border border-white/[0.08] hover:border-[#FF2A2E]/30 transition-all shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                          {ex.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ex.level === 'Beginner'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ex.level === 'Intermediate'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-[#FF2A2E]/20 text-[#FF2A2E] border border-[#FF2A2E]/30'
                        }`}>
                          {ex.level}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px]">
                          {ex.target}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {ex.desc}
                      </p>
                    </div>

                    <div className="text-left sm:text-right text-xs shrink-0 self-start">
                      <div className="text-sm font-bold text-white font-mono">
                        {ex.reps}
                      </div>
                      <div className="text-[11px] text-white/40">
                        {ex.tempo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <button
                      onClick={() => setActiveModalExercise(ex)}
                      className="text-sky-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>How to do it</span>
                    </button>

                    <button
                      onClick={() => addExerciseToWeeklyDay(selectedDayId, ex)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#FF2A2E] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Add to {selectedDayId.toUpperCase()} Plan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Suggestion */}
            <button
              onClick={() => setSelectedMuscle(selectedMuscle === 'chest' ? 'abs' : 'chest')}
              className="w-full p-3 rounded-2xl bg-[#14151C] hover:bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Next up: {selectedMuscle === 'chest' ? 'Abdominals & Core exercises' : 'Chest workouts'}</span>
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </section>

      {/* Form Guide Modal */}
      <AnimatePresence>
        {activeModalExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#14151C] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-[#FF2A2E] font-bold uppercase tracking-wider">
                    Form &amp; Technique
                  </span>
                  <h3 className="text-xl font-bold text-white uppercase mt-0.5">
                    {activeModalExercise.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalExercise(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <span className="text-xs text-sky-400 font-bold uppercase block">
                  Key Steps
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  {activeModalExercise.cues || activeModalExercise.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-white/40 block">Target Volume</span>
                  <span className="text-sm font-bold text-white font-mono">{activeModalExercise.reps}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-white/40 block">Pace</span>
                  <span className="text-sm font-bold text-white font-mono">{activeModalExercise.tempo}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  updateXP(30);
                  notify(`Exercise completed! +30 XP awarded!`, "success");
                  setActiveModalExercise(null);
                }}
                className="w-full py-3 rounded-2xl bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                Done, Got It (+30 XP)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
