import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useFitness, computeMifflinStJeor } from '../../context/FitnessContext';
import AuthCard from '../AuthCard';

export default function AccountView() {
  const { user, signOutUser, cloudSyncStatus, updateUserMetrics, showToast, targets } = useFitness();

  // Sign out confirmation modal state
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Editable form fields when signed in (kept in sync with Firestore hydration)
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [weight, setWeight] = useState(user?.weight || 70.0);
  const [height, setHeight] = useState(user?.height || 175);
  const [age, setAge] = useState(user?.age || 24);
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight || 68.0);
  const [gender, setGender] = useState(user?.gender || 'male');
  const [goal, setGoal] = useState(user?.goal || 'loss');
  const [activity, setActivity] = useState(user?.activity || 1.55);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setWeight(user.weight ?? 70.0);
    setHeight(user.height ?? 175);
    setAge(user.age ?? 24);
    setTargetWeight(user.targetWeight ?? 68.0);
    setGender(user.gender || 'male');
    setGoal(user.goal || 'loss');
    setActivity(user.activity ?? 1.55);
  }, [user?.uid, user?.name, user?.email, user?.weight, user?.height, user?.age, user?.targetWeight, user?.gender, user?.goal, user?.activity]);

  // Compute live BMI from current state
  const heightM = height > 0 ? height / 100 : 1.75;
  const currentBMI = (weight > 0 && heightM > 0) ? (weight / (heightM * heightM)).toFixed(1) : '21.6';

  let bmiCategory = 'Normal Weight';
  let bmiBadgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  const bmiNum = parseFloat(currentBMI);
  if (bmiNum < 18.5) {
    bmiCategory = 'Underweight';
    bmiBadgeClass = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
  } else if (bmiNum <= 24.9) {
    bmiCategory = 'Normal Weight';
    bmiBadgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (bmiNum <= 29.9) {
    bmiCategory = 'Overweight';
    bmiBadgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else {
    bmiCategory = 'Obese';
    bmiBadgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }

  // Handle Save Profile & Recalculate Mifflin-St Jeor Targets
  const handleSaveProfile = (e) => {
    e.preventDefault();

    const calc = computeMifflinStJeor(
      Number(weight),
      Number(height),
      Number(age),
      gender,
      Number(activity),
      goal
    );

    updateUserMetrics({
      name,
      email,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      targetWeight: Number(targetWeight),
      gender,
      goal,
      activity: Number(activity),
      targetCalories: calc.calories,
      targetProtein: calc.protein,
      targetCarbs: calc.carbs,
      targetFat: calc.fat,
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF2A2E', '#4edea3', '#4cd7f6'],
    });

    showToast(`Profile updated! New BMI: ${currentBMI} • ${calc.calories} kcal goal`, 'success');
  };

  // Execute confirmed Firebase Sign Out (all cloud data stays permanently saved in Firestore)
  const handleConfirmSignOut = async () => {
    await signOutUser();
    setShowSignOutConfirm(false);
  };

  const getInitials = (n) => {
    if (!n) return 'AJ';
    return n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  };

  // =========================================================================
  // VIEW A: SIGNED-OUT UNIFORM AUTH INTERFACE
  // =========================================================================
  if (!user?.isLoggedIn) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center min-h-[70vh] relative">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-[0.025] pointer-events-none -z-10"
          style={{ backgroundImage: "url('/assets/3.jpg')" }}
        />
        <AuthCard />
      </div>
    );
  }

  // =========================================================================
  // VIEW B: SIGNED-IN ATHLETE PROFILE & DIRECT EDIT FORM
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 md:pb-16 relative">
      
      {/* Background Subtle Atmosphere */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.025] pointer-events-none -z-10"
        style={{ backgroundImage: "url('/assets/3.jpg')" }}
      />

      {/* ========================================================================= */}
      {/* 1. ATHLETE PROFILE HEADER BANNER (Edit Details Button REMOVED)             */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#14151C] rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar with Status Beacon */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#1f212a] to-[#2c2f3c] border-2 border-white/20 shadow-2xl flex items-center justify-center font-display text-2xl sm:text-3xl font-black text-white">
              {getInitials(user?.name || name)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-[#14151C] flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.8)]">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user?.name || name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#FF2A2E]/20 text-[#FF2A2E] border border-[#FF2A2E]/30 uppercase font-bold">
                Level {user?.level || 1} • {user?.levelTitle || 'Rookie Lifter'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                cloudSyncStatus === 'synced'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : cloudSyncStatus === 'syncing'
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : 'bg-white/5 text-white/50 border-white/10'
              }`}>
                {cloudSyncStatus === 'synced'
                  ? '☁ Cloud Saved'
                  : cloudSyncStatus === 'syncing'
                  ? '☁ Syncing...'
                  : '☁ Cloud Ready'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60">
              {user?.email || email}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-white/40">
              <span className="text-[#FF2A2E] font-medium">⚡ Calisthenics &amp; Indian Nutrition Athlete</span>
              <span>•</span>
              <span>Member Since 2026</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Sign Out Only */}
        <div className="flex items-center gap-3 relative z-10 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2 border border-rose-500/30 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ATHLETE PROGRESS REPORT (All saved information & biometrics)           */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF2A2E] text-[22px]">analytics</span>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
              Athlete Progress Report
            </h2>
          </div>
          <span className="text-xs text-white/50">
            Live Biometric Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Level & XP Progress */}
          <div className="p-4 rounded-2xl bg-[#14151C] border border-white/5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">XP Progress</span>
              <span className="font-mono text-xs text-emerald-400 font-bold">Lvl {user?.level || 3}</span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {(user?.xp ?? 0).toLocaleString()}{' '}
                <span className="text-xs text-white/50 font-normal">
                  / {(user?.nextLevelXp || 2000).toLocaleString()} XP
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-[#FF2A2E] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((user?.xp ?? 0) / (user?.nextLevelXp || 2000)) * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-white/50 mt-2">
              {Math.min(100, (((user?.xp ?? 0) / (user?.nextLevelXp || 2000)) * 100)).toFixed(1)}% Completed to Level {(user?.level || 3) + 1}
            </span>
          </div>

          {/* Card 2: Streak & Multiplier */}
          <div className="p-4 rounded-2xl bg-[#14151C] border border-white/5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">Workout Streak</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Shield Active
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <span>🔥 {user?.streak || 7} Days</span>
              </div>
              <span className="text-xs text-amber-400 font-medium mt-1 block">
                1.2x Active XP Multiplier
              </span>
            </div>
            <span className="text-[11px] text-white/50 mt-2">
              Next milestone: 10-day streak badge
            </span>
          </div>

          {/* Card 3: Body Mass Index (BMI) Status */}
          <div className="p-4 rounded-2xl bg-[#14151C] border border-white/5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">Current BMI</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bmiBadgeClass}`}>
                {bmiCategory}
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {currentBMI}
              </div>
              <span className="text-xs text-white/60 block mt-1">
                Weight: {weight} kg • Height: {height} cm
              </span>
            </div>
            <span className="text-[11px] text-white/50 mt-2">
              Target Weight: {targetWeight} kg
            </span>
          </div>

          {/* Card 4: Daily Calorie & Protein Target */}
          <div className="p-4 rounded-2xl bg-[#14151C] border border-white/5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">Daily Fuel Goals</span>
              <span className="font-mono text-xs text-[#FF2A2E] font-bold">Mifflin-St Jeor</span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {(user?.targetCalories || targets?.calories || 2260).toLocaleString()}{' '}
                <span className="text-xs text-white/50 font-normal">kcal</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-emerald-400 font-bold">{user?.targetProtein || targets?.protein || 163}g Pro</span>
                <span className="text-amber-400">{user?.targetCarbs || targets?.carbs || 235}g Carb</span>
                <span className="text-sky-400">{user?.targetFat || targets?.fat || 63}g Fat</span>
              </div>
            </div>
            <span className="text-[11px] text-white/50 mt-2">
              Water Logged: {user?.hydrationLiters || 2.8}L / 3.5L
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DIRECTLY EDITABLE USER BIOMETRICS & GOAL FORM (No "Edit Details" toggle) */}
      {/* ========================================================================= */}
      <section className="rounded-3xl bg-[#14151C] p-6 sm:p-8 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
              Edit Your Personal Details
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Update your current weight, height, age, and fitness goals. Targets recalculate instantly on save.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-white/70 border border-white/10">
            Directly Editable
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A2E]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A2E]"
                required
              />
            </div>
          </div>

          {/* Row 2: Weight, Height, Age, Target Weight */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
              />
            </div>
          </div>

          {/* Row 3: Gender, Goal, Activity Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Gender Toggle */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-[#FF2A2E] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-[#FF2A2E] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Your Fitness Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E0F14] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2A2E] cursor-pointer"
              >
                <option value="loss">Steady Fat Loss (-400 kcal)</option>
                <option value="aggressive_loss">Aggressive Fat Loss (-600 kcal)</option>
                <option value="maintain">Weight Maintenance (Balanced)</option>
                <option value="lean_bulk">Lean Muscle Gain (+300 kcal)</option>
                <option value="mass_gain">Maximum Mass Gain (+500 kcal)</option>
              </select>
            </div>

            {/* Daily Activity Level */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Daily Activity Level
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E0F14] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2A2E] cursor-pointer"
              >
                <option value={1.2}>Sedentary (Desk work / little exercise)</option>
                <option value={1.375}>Lightly active (1-3 days/week exercise)</option>
                <option value={1.55}>Moderately active (3-5 days/week workouts)</option>
                <option value={1.725}>Very active (6-7 days/week hard workout)</option>
              </select>
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white text-xs uppercase font-extrabold tracking-wider flex items-center gap-2 shadow-[0_4px_20px_rgba(255,42,46,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save &amp; Update Targets</span>
            </button>
          </div>

        </form>
      </section>

      {/* ========================================================================= */}
      {/* 4. SIGN OUT CONFIRMATION MODAL                                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#14151C] border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">logout</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Sign Out of MuscleUP.Ai?
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  You will be signed out on this device. All of your workouts, meals, XP, and biometrics remain permanently saved in your Firebase account.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignOutConfirm(false)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignOut}
                  className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
