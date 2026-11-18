import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitness, computeMifflinStJeor } from '../../context/FitnessContext';

export default function MyPlanCard() {
  const { user, targets, updateUserMetrics, showToast } = useFitness();
  const [modalOpen, setModalOpen] = useState(false);

  // Form state inside edit modal
  const [weight, setWeight] = useState(user.weight || 70.0);
  const [height, setHeight] = useState(user.height || 175);
  const [age, setAge] = useState(user.age || 24);
  const [gender, setGender] = useState(user.gender || 'male');
  const [activity, setActivity] = useState(user.activity || 1.55);
  const [goal, setGoal] = useState(user.goal || 'loss');

  useEffect(() => {
    setWeight(user.weight || 70.0);
    setHeight(user.height || 175);
    setAge(user.age || 24);
    setGender(user.gender || 'male');
    setActivity(user.activity || 1.55);
    setGoal(user.goal || 'loss');
  }, [user.uid, user.weight, user.height, user.age, user.gender, user.activity, user.goal]);

  // Compute live BMI
  const heightM = (Number(user.height) || 175) / 100;
  const bmiVal = heightM > 0 ? (Number(user.weight || 70) / (heightM * heightM)).toFixed(1) : '22.0';
  let bmiCategory = 'Normal';
  let bmiBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (bmiVal < 18.5) {
    bmiCategory = 'Underweight';
    bmiBadgeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  } else if (bmiVal <= 24.9) {
    bmiCategory = 'Normal Weight';
    bmiBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (bmiVal <= 29.9) {
    bmiCategory = 'Overweight';
    bmiBadgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  } else {
    bmiCategory = 'Obese';
    bmiBadgeColor = 'text-red-400 bg-red-500/10 border-red-500/20';
  }

  const handleSavePlan = () => {
    const calc = computeMifflinStJeor(weight, height, age, gender, activity, goal);
    updateUserMetrics({
      gender,
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      activity: Number(activity),
      goal,
      targetCalories: calc.calories,
      targetProtein: calc.protein,
      targetCarbs: calc.carbs,
      targetFat: calc.fat,
    });
    setModalOpen(false);
    showToast(`Targets updated: ${calc.calories} kcal • ${calc.protein}g Protein!`, 'success');
  };

  const goalLabels = {
    loss: 'Fat Loss (-400 kcal)',
    aggressive_loss: 'Fast Fat Loss (-600 kcal)',
    maintenance: 'Maintenance (0 kcal)',
    lean_bulk: 'Lean Muscle Gain (+300 kcal)',
    mass_gain: 'Mass Gain (+500 kcal)',
  };

  return (
    <>
      <div className="w-full rounded-3xl p-5 sm:p-6 bg-[#14151C] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FF2A2E]/5 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF2A2E]/10 border border-[#FF2A2E]/20 flex items-center justify-center text-[#FF2A2E]">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">My Daily Plan</h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${bmiBadgeColor}`}>
                  BMI {bmiVal} • {bmiCategory}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Mifflin-St Jeor formula • {goalLabels[user.goal] || 'Fat Loss'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>Adjust Metrics</span>
          </button>
        </div>

        {/* Plan Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
              Daily Calories
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl font-bold text-white">
                {targets.calories}
              </span>
              <span className="text-[11px] text-white/40">kcal</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider block">
              Protein Target
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl font-bold text-white">
                {targets.protein}
              </span>
              <span className="text-[11px] text-white/40">g/day</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider block">
              Carbohydrates
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl font-bold text-white">
                {targets.carbs}
              </span>
              <span className="text-[11px] text-white/40">g/day</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] font-semibold text-sky-400/80 uppercase tracking-wider block">
              Healthy Fats
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl font-bold text-white">
                {targets.fat}
              </span>
              <span className="text-[11px] text-white/40">g/day</span>
            </div>
          </div>
        </div>

        {/* Compact stats pill footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-white/50 gap-2">
          <div className="flex items-center gap-3">
            <span>Weight: <strong className="text-white font-medium">{user.weight} kg</strong></span>
            <span>•</span>
            <span>Height: <strong className="text-white font-medium">{user.height} cm</strong></span>
            <span>•</span>
            <span>Age: <strong className="text-white font-medium">{user.age} y</strong></span>
          </div>
          <span className="text-white/40 text-[11px]">
            Goal: {user.targetWeight ? `${user.targetWeight} kg target` : 'Stay Consistent'}
          </span>
        </div>
      </div>

      {/* Interactive Metric Adjustment Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-[#14151C] border border-white/10 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF2A2E]/10 border border-[#FF2A2E]/20 flex items-center justify-center text-[#FF2A2E]">
                    <span className="material-symbols-outlined text-lg">calculate</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Adjust Body Metrics &amp; Plan</h3>
                    <p className="text-xs text-white/50">Mifflin-St Jeor Metabolic Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Gender Toggle */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">Sex</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        gender === 'male' ? 'bg-[#FF2A2E] text-white shadow-md' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Male (+5 BMR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        gender === 'female' ? 'bg-[#FF2A2E] text-white shadow-md' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Female (-161 BMR)
                    </button>
                  </div>
                </div>

                {/* Numeric Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="35"
                      max="200"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1.5">Height (cm)</label>
                    <input
                      type="number"
                      min="120"
                      max="240"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1.5">Age (years)</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF2A2E]"
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">Daily Activity</label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1C24] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2A2E] cursor-pointer"
                  >
                    <option value={1.2}>Sedentary (Little or no exercise)</option>
                    <option value={1.375}>Lightly active (1-3 days/week)</option>
                    <option value={1.55}>Moderately active (3-5 days/week) [Recommended]</option>
                    <option value={1.725}>Very active (6-7 days/week)</option>
                    <option value={1.9}>Extremely active (Athlete/hard physical work)</option>
                  </select>
                </div>

                {/* Goal Directive */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">Primary Target Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1C24] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2A2E] cursor-pointer"
                  >
                    <option value="loss">Fat Loss (-400 kcal deficit, high protein)</option>
                    <option value="aggressive_loss">Fast Fat Loss (-600 kcal, floor protected)</option>
                    <option value="maintenance">Maintenance (Equal burn &amp; intake)</option>
                    <option value="lean_bulk">Lean Muscle Gain (+300 kcal surplus)</option>
                    <option value="mass_gain">Mass Hypertrophy (+500 kcal surplus)</option>
                  </select>
                </div>

                {/* Instant preview of calculated targets */}
                {(() => {
                  const preview = computeMifflinStJeor(weight, height, age, gender, activity, goal);
                  return (
                    <div className="p-3.5 rounded-2xl bg-[#FF2A2E]/5 border border-[#FF2A2E]/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">New Calculated Target:</span>
                        <span className="font-mono font-bold text-white">
                          {preview.calories} kcal
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5 text-center text-xs">
                        <div>
                          <span className="text-emerald-400 block font-semibold">{preview.protein}g</span>
                          <span className="text-white/40 text-[10px]">Protein</span>
                        </div>
                        <div>
                          <span className="text-amber-400 block font-semibold">{preview.carbs}g</span>
                          <span className="text-white/40 text-[10px]">Carbs</span>
                        </div>
                        <div>
                          <span className="text-sky-400 block font-semibold">{preview.fat}g</span>
                          <span className="text-white/40 text-[10px]">Fat</span>
                        </div>
                      </div>
                      {preview.safeFloorApplied && (
                        <p className="text-[11px] text-amber-300 mt-2 text-center">
                          ⚠️ Safe floor enforced ({gender === 'female' ? '1200' : '1500'} kcal min) to prevent metabolic starvation.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="px-5 py-2.5 rounded-xl bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Save &amp; Update Goals
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
