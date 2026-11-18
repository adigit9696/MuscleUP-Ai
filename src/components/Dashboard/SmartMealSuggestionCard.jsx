import React, { useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { FOOD_CATALOGUE } from '../../data/indianFoodData';

export default function SmartMealSuggestionCard({ setActiveTab }) {
  const { targets, dailyTotals, addMealToPlan } = useFitness();

  const calLeft = Math.max(0, (targets.calories || 2260) - (dailyTotals.calories || 0));
  const proteinLeft = Math.max(0, (targets.protein || 163) - (dailyTotals.protein || 0));

  // Find 3 top matching foods from catalogue
  const suggestedFoods = useMemo(() => {
    const foodsObj = FOOD_CATALOGUE?.foods || {};
    const candidates = [
      { id: 'IND-000019', grams: 150, period: 'lunch' }, // Paneer
      { id: 'IND-000027', grams: 100, period: 'breakfast' }, // Boiled Eggs
      { id: 'IND-000063', grams: 200, period: 'dinner' }, // Dal Tadka
      { id: 'IND-000071', grams: 200, period: 'lunch' }, // Rajma Masala
      { id: 'IND-000084', grams: 180, period: 'dinner' }, // Palak Paneer
      { id: 'IND-000029', grams: 60, period: 'lunch' }, // Roti
      { id: 'IND-000003', grams: 100, period: 'breakfast' }, // Poha
    ];

    return candidates
      .map(c => {
        const food = foodsObj[c.id];
        if (!food) return null;
        const ratio = c.grams / (food.basis_weight_g || 100);
        return {
          id: c.id,
          food_id: c.id,
          name_en: food.name_en || food.name,
          name_hi: food.name_hi || '',
          category: food.category,
          grams: c.grams,
          period: c.period,
          calories: Math.round((food.kcal_per_100g || 200) * ratio),
          protein: Math.round((food.protein_g_per_100g || 10) * ratio * 10) / 10,
          rawFood: food,
        };
      })
      .filter(Boolean)
      .slice(0, 3);
  }, []);

  return (
    <div className="w-full rounded-3xl p-5 sm:p-6 bg-[#14151C] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              What Can I Eat Now?
            </h3>
            <p className="text-xs text-white/50">
              Matched to your remaining {calLeft} kcal &amp; {proteinLeft}g protein
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab && setActiveTab('meal-planner')}
          className="text-xs font-semibold text-[#FF2A2E] hover:text-[#ff4b4f] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Search 177+</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      {/* Suggested Meals List */}
      <div className="space-y-2.5 pt-4">
        {suggestedFoods.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all"
          >
            <div className="min-w-0 pr-3">
              <div className="flex items-baseline gap-2">
                <h4 className="text-sm font-semibold text-white truncate">
                  {item.name_en}
                </h4>
                {item.name_hi && (
                  <span className="text-[11px] text-white/40 truncate hidden sm:inline">
                    ({item.name_hi})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/40 truncate mt-0.5">
                {item.grams}g portion • <span className="text-emerald-400 font-medium">+{item.protein}g Protein</span> • {item.calories} kcal
              </p>
            </div>

            <button
              onClick={() => addMealToPlan(item.rawFood, item.period, item.grams)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#FF2A2E] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Log</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
