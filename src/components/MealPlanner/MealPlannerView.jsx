import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sunrise, Sun, Zap, Moon, Check, Plus, Minus, Search, 
  Sparkles, Star, ChevronDown, ChevronUp, Clock, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFitness } from '../../context/FitnessContext';
import { MEAL_DATABASE } from '../../data/mealDatabase';
import { FOOD_CATALOGUE } from '../../data/indianFoodData';

export default function MealPlannerView() {
  const { 
    user, 
    plannedMeals, 
    toggleDishInPlan, 
    plannedTotals, 
    addMealToPlan,
    favouriteMeals,
    toggleFavouriteMeal,
    recentMeals,
    showToast,
  } = useFitness();

  const [activeTab, setActiveTab] = useState('breakfast');
  const [filter, setFilter] = useState('all'); // 'all', 'veg', 'nonveg', 'egg'
  const [servings, setServings] = useState({});

  // Inline Food Search & Preparation Station state
  const [showSearchStation, setShowSearchStation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState('search'); // 'search' | 'recents' | 'favourites'
  const [selectedPrepFood, setSelectedPrepFood] = useState(null);
  const [prepGrams, setPrepGrams] = useState(150);
  const [prepPeriod, setPrepPeriod] = useState('breakfast');
  const searchInputRef = useRef(null);

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Sunrise, count: 30, time: '07:30 – 09:00', title: 'Breakfast Meals' },
    { id: 'lunch', label: 'Lunch', icon: Sun, count: 30, time: '12:30 – 14:00', title: 'Lunch Meals' },
    { id: 'snacks', label: 'Snacks', icon: Zap, count: 30, time: '16:30 – 18:00', title: 'Evening Snacks' },
    { id: 'dinner', label: 'Dinner', icon: Moon, count: 30, time: '20:00 – 21:30', title: 'Dinner Meals' },
  ];

  const currentTabConfig = mealTypes.find(t => t.id === activeTab) || mealTypes[0];
  const currentDishes = MEAL_DATABASE[activeTab] || [];
  
  const filteredDishes = useMemo(() => {
    return currentDishes.filter(dish => {
      if (filter === 'veg') return dish.isVeg === true;
      if (filter === 'nonveg') return dish.isVeg === false;
      if (filter === 'egg') return dish.name.toLowerCase().includes('egg') || dish.name.toLowerCase().includes('omelette') || dish.name.toLowerCase().includes('bhurji');
      return true;
    });
  }, [currentDishes, filter]);

  // Convert FOOD_CATALOGUE into searchable array
  const allFoods = useMemo(() => {
    const foodsObj = FOOD_CATALOGUE?.foods || {};
    return Object.entries(foodsObj).map(([id, food]) => ({
      id,
      food_id: id,
      name: food.name || food.name_en,
      name_en: food.name_en || food.name,
      name_hi: food.name_hi || '',
      category: food.category || 'Dishes',
      basis_weight_g: food.basis_weight_g || 100,
      kcal_per_100g: Number(food.kcal_per_100g) || 0,
      protein_g_per_100g: Number(food.protein_g_per_100g) || 0,
      carbohydrates_g_per_100g: Number(food.carbohydrates_g_per_100g) || 0,
      fat_g_per_100g: Number(food.fat_g_per_100g) || 0,
      isVeg:
        food.category !== 'Chicken & Poultry Dishes' &&
        food.category !== 'Mutton & Red Meat Dishes' &&
        food.category !== 'Fish & Seafood' &&
        !food.name?.toLowerCase().includes('chicken') &&
        !food.name?.toLowerCase().includes('egg') &&
        !food.name?.toLowerCase().includes('mutton') &&
        !food.name?.toLowerCase().includes('fish'),
    }));
  }, []);

  // Filtered food list for inline search
  const searchResults = useMemo(() => {
    if (searchTab === 'recents') {
      if (!recentMeals || recentMeals.length === 0) return [];
      return recentMeals.map(r => {
        const match = allFoods.find(f => f.id === (r.food_id || r.id));
        return match || r;
      });
    }

    if (searchTab === 'favourites') {
      if (!favouriteMeals || favouriteMeals.length === 0) return [];
      return allFoods.filter(f => favouriteMeals.includes(f.id));
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      const popularIds = ['IND-000019', 'IND-000027', 'IND-000028', 'IND-000029', 'IND-000063', 'IND-000071', 'IND-000084', 'IND-000053'];
      return allFoods.filter(f => popularIds.includes(f.id));
    }

    return allFoods
      .filter(item => {
        const en = (item.name_en || '').toLowerCase();
        const hi = (item.name_hi || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return en.includes(q) || hi.includes(q) || cat.includes(q);
      })
      .slice(0, 16);
  }, [allFoods, searchQuery, searchTab, favouriteMeals, recentMeals]);

  // Calculated macros for selected prep food
  const prepCalculated = useMemo(() => {
    if (!selectedPrepFood) return null;
    const ratio = prepGrams / (selectedPrepFood.basis_weight_g || 100);
    return {
      calories: Math.round(selectedPrepFood.kcal_per_100g * ratio),
      protein: Math.round(selectedPrepFood.protein_g_per_100g * ratio * 10) / 10,
      carbs: Math.round(selectedPrepFood.carbohydrates_g_per_100g * ratio * 10) / 10,
      fat: Math.round(selectedPrepFood.fat_g_per_100g * ratio * 10) / 10,
    };
  }, [selectedPrepFood, prepGrams]);

  const handleSelectPrepFood = (food) => {
    setSelectedPrepFood(food);
    setPrepPeriod(activeTab);
    if (food.category === 'Breads & Flatbreads') {
      setPrepGrams(60);
    } else if (food.id === 'IND-000027') {
      setPrepGrams(100);
    } else {
      setPrepGrams(150);
    }
  };

  const handleAddPrepMeal = () => {
    if (!selectedPrepFood || !addMealToPlan) return;
    addMealToPlan(selectedPrepFood, prepPeriod, prepGrams);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF2A2E', '#10B981', '#38BDF8'],
    });
    if (showToast) {
      showToast(`Added ${selectedPrepFood.name_en} (${prepGrams}g) to ${prepPeriod.toUpperCase()}!`, 'success');
    }
    setSelectedPrepFood(null);
  };

  const targetCal = user?.targetCalories || 2260;
  const targetPro = user?.targetProtein || 163;
  const targetCarb = user?.targetCarbs || 235;
  const targetFat = user?.targetFat || 63;

  const calPercent = Math.min(100, Math.round(((plannedTotals?.calories || 0) / targetCal) * 100));
  const proPercent = Math.min(100, Math.round(((plannedTotals?.protein || 0) / targetPro) * 100));
  const carbPercent = Math.min(100, Math.round(((plannedTotals?.carbs || 0) / targetCarb) * 100));
  const fatPercent = Math.min(100, Math.round(((plannedTotals?.fat || 0) / targetFat) * 100));

  const remainingKcal = Math.max(0, targetCal - (plannedTotals?.calories || 0));
  const remainingPro = Math.max(0, targetPro - (plannedTotals?.protein || 0));

  const getDishServing = (dishId) => servings[dishId] || 1;

  const adjustDishServing = (dishId, delta) => {
    setServings(prev => {
      const current = prev[dishId] || 1;
      const next = Math.max(1, Math.min(5, current + delta));
      return { ...prev, [dishId]: next };
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 md:pb-16 relative">
      
      {/* Top Header & Planned Energy Status Bar */}
      <section className="relative overflow-hidden bg-[#14151C] rounded-3xl p-5 sm:p-7 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Gourmet High-Protein Indian Fitness Meal Background Visual */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: "url('/assets/2.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0F14] via-[#0E0F14]/90 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#FF2A2E]">
                Indian Nutrition Companion
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
              Daily Meal Planner
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
              Curated Indian whole foods and recipes calculated for your fat loss and muscle targets.
            </p>
          </div>

          {/* Planned Energy & Macronutrient Progress */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-6 bg-black/50 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner">
            
            {/* Calories Progress */}
            <div className="flex flex-col justify-center min-w-[210px]">
              <div className="flex justify-between items-baseline mb-1.5 text-xs">
                <span className="text-white/60 font-medium">Daily Calories</span>
                <span className="text-white">
                  <strong className="text-sm font-bold tabular-nums text-white">{(plannedTotals?.calories || 0).toLocaleString()}</strong>
                  <span className="text-white/50 text-[11px]"> / {targetCal.toLocaleString()} kcal</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden flex">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-[#FF2A2E] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${calPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[11px]">
                <span className="text-[#FF2A2E] font-bold">{calPercent}% of target</span>
                <span className="text-white/50">{remainingKcal.toLocaleString()} kcal left</span>
              </div>
            </div>

            <div className="h-12 w-px bg-white/10 hidden sm:block" />

            {/* Protein, Carbs, Fat */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-emerald-400 block text-[10px] font-bold uppercase">Protein</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">{plannedTotals?.protein || 0}</span>
                  <span className="text-white/40 text-[11px]">/{targetPro}g</span>
                </div>
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${proPercent}%` }} />
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-amber-400 block text-[10px] font-bold uppercase">Carbs</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-bold text-amber-400 tabular-nums">{plannedTotals?.carbs || 0}</span>
                  <span className="text-white/40 text-[11px]">/{targetCarb}g</span>
                </div>
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${carbPercent}%` }} />
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-sky-400 block text-[10px] font-bold uppercase">Fat</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-bold text-sky-400 tabular-nums">{plannedTotals?.fat || 0}</span>
                  <span className="text-white/40 text-[11px]">/{targetFat}g</span>
                </div>
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${fatPercent}%` }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTEGRATED FOOD SEARCH & PREPARATION STATION (Moved into Meals Tab)        */}
      {/* ========================================================================= */}
      <section className="bg-[#14151C] rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all">
        {/* Station Header & Toggle */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF2A2E]/10 border border-[#FF2A2E]/20 flex items-center justify-center text-[#FF2A2E] shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center flex-wrap gap-2">
                <span>Food Search &amp; Preparation Station</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF2A2E]/20 text-[#FF2A2E] font-bold whitespace-nowrap">177+ Verified</span>
              </h2>
              <p className="text-xs text-white/50">
                Search Indian household whole foods, calibrate portion weights, and log custom meals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSearchStation(!showSearchStation)}
            className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-white/10 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <span>{showSearchStation ? 'Collapse Search' : 'Open Food Search'}</span>
            {showSearchStation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Search & Preparation Body */}
        <AnimatePresence>
          {showSearchStation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-4 sm:p-6 space-y-6"
            >
              {/* Search Tabs & Query Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSearchTab('search')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      searchTab === 'search'
                        ? 'bg-white/15 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>All Foods</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab('recents')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      searchTab === 'recents'
                        ? 'bg-white/15 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recents ({recentMeals?.length || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab('favourites')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      searchTab === 'favourites'
                        ? 'bg-white/15 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Favourites ({favouriteMeals?.length || 0})</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Indian foods (e.g. Paneer bhurji, Roti, Eggs, Dal, Poha...)"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FF2A2E] transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Two-Column Grid: Search Results (Left) + Custom Portion Station (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Search Results List */}
                <div className="lg:col-span-7 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs">
                      No foods matching "{searchQuery}" found. Try searching "paneer", "egg", "dal", or "roti".
                    </div>
                  ) : (
                    searchResults.map((food) => {
                      const isFav = favouriteMeals?.includes(food.id);
                      const isSelected = selectedPrepFood?.id === food.id;

                      return (
                        <div
                          key={food.id}
                          onClick={() => handleSelectPrepFood(food)}
                          className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF2A2E]/15 border-[#FF2A2E]/50 shadow-md'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                food.isVeg ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-[#FF2A2E]'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#FF2A2E] transition-colors">
                                  {food.name_en}
                                </h4>
                                {food.name_hi && (
                                  <span className="text-[11px] text-white/40 truncate hidden sm:inline">
                                    ({food.name_hi})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-white/40 truncate">
                                {food.category} • {food.protein_g_per_100g}g Protein/100g
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="font-mono text-sm font-bold text-white">
                                {food.kcal_per_100g}
                              </span>
                              <span className="text-[10px] text-white/40 block">kcal/100g</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (toggleFavouriteMeal) toggleFavouriteMeal(food.id);
                              }}
                              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                isFav ? 'text-amber-400' : 'text-white/20 hover:text-white/60'
                              }`}
                              title={isFav ? 'Remove favourite' : 'Star favourite'}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Custom Food Preparation & Portion Calibrator */}
                <div className="lg:col-span-5 bg-[#171924] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4">
                  {selectedPrepFood ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#FF2A2E] font-bold block">
                            {selectedPrepFood.category}
                          </span>
                          <h3 className="text-base font-bold text-white mt-0.5">
                            {selectedPrepFood.name_en}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xl font-black text-[#FF2A2E]">
                            {prepCalculated?.calories}
                          </span>
                          <span className="text-[10px] text-white/50 block">Calories</span>
                        </div>
                      </div>

                      {/* Live Macro Readout */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-black/40 border border-white/5 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Protein</span>
                          <span className="font-mono font-bold text-white">{prepCalculated?.protein}g</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400 font-semibold block uppercase">Carbs</span>
                          <span className="font-mono font-bold text-white">{prepCalculated?.carbs}g</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-sky-400 font-semibold block uppercase">Fat</span>
                          <span className="font-mono font-bold text-white">{prepCalculated?.fat}g</span>
                        </div>
                      </div>

                      {/* Gram Slider & Input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>Portion Weight</span>
                          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                            <input
                              type="number"
                              min="10"
                              max="1000"
                              step="5"
                              value={prepGrams}
                              onChange={(e) => setPrepGrams(Math.max(1, Number(e.target.value) || 0))}
                              className="w-12 bg-transparent font-mono text-right font-bold text-white focus:outline-none"
                            />
                            <span className="text-[10px] text-white/50">grams</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="25"
                          max="500"
                          step="5"
                          value={prepGrams}
                          onChange={(e) => setPrepGrams(Number(e.target.value))}
                          className="w-full accent-[#FF2A2E] cursor-pointer"
                        />

                        {/* Quick Portion Chips */}
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          {[50, 100, 150, 200, 250, 300].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setPrepGrams(val)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                                prepGrams === val
                                  ? 'bg-[#FF2A2E]/20 border-[#FF2A2E] text-white font-bold'
                                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              {val}g
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Target Period Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-white/70 block">Target Meal Time</label>
                        <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                          {['breakfast', 'lunch', 'snacks', 'dinner'].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPrepPeriod(p)}
                              className={`py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                prepPeriod === p
                                  ? 'bg-[#FF2A2E] text-white shadow-sm'
                                  : 'text-white/60 hover:text-white'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={handleAddPrepMeal}
                        className="w-full py-2.5 rounded-xl bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(255,42,46,0.4)] active:scale-98 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to {prepPeriod} (+25 XP)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto">
                        <Plus className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-white">Select a Food on the Left</p>
                      <p className="text-[11px] text-white/40 max-w-xs mx-auto">
                        Click any Indian food item to configure portion weights and add it to your daily plan.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ========================================================================= */}
      {/* CHEF'S CURATED RECOMMENDATIONS FOR THE DAY                                 */}
      {/* ========================================================================= */}
      
      {/* Tabs & Dietary Filter Chips */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#14151C] p-2.5 rounded-3xl border border-white/[0.08]">
        
        {/* Meal Period Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white/[0.03] rounded-2xl">
          {mealTypes.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMealPill"
                    className="absolute inset-0 bg-[#FF2A2E] rounded-xl shadow-[0_0_14px_rgba(255,42,46,0.35)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className={`relative z-10 w-4 h-4 ${isActive ? 'text-white' : 'text-white/50'}`} />
                <span className="relative z-10">{tab.label}</span>
                <span className={`relative z-10 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dietary Filter Chips */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/5 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            All meals
          </button>
          <button
            onClick={() => setFilter('veg')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'veg'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            🌱 Vegetarian
          </button>
          <button
            onClick={() => setFilter('nonveg')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'nonveg'
                ? 'bg-[#FF2A2E]/20 text-[#FF2A2E] border border-[#FF2A2E]/40 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            🍗 High protein non-veg
          </button>
          <button
            onClick={() => setFilter('egg')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'egg'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            🥚 Egg dishes
          </button>
        </div>

      </div>

      {/* Period Showcase Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
            {currentTabConfig.title}
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">
            {currentTabConfig.time}
          </span>
        </div>
        <span className="text-xs text-white/50">
          Showing {filteredDishes.length} options
        </span>
      </div>

      {/* 3-Column Responsive Dish Grid with Authentic Local Food Images & Fluid Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${filter}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {filteredDishes.map(dish => {
            const isSelected = plannedMeals.some(m => m.name === dish.name || m.id === dish.id);
            const servingCount = getDishServing(dish.id);
            const isEgg = dish.name.toLowerCase().includes('egg') || dish.name.toLowerCase().includes('omelette') || dish.name.toLowerCase().includes('bhurji');

            return (
              <div
                key={dish.id}
                className={`group relative bg-[#14151C] rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-300 border ${
                  isSelected
                    ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-[#181B26]'
                    : 'border-white/[0.08] hover:border-[#FF2A2E]/40 hover:bg-[#181923] shadow-md hover:shadow-xl'
                }`}
              >
                {/* Image & Overlay */}
                <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-white/5">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/meals/chilla.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14151C] via-transparent to-black/40" />

                  {/* Dietary Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                      isEgg
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                        : dish.isVeg
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-[#FF2A2E]/20 text-[#FF2A2E] border-[#FF2A2E]/30'
                    }`}>
                      {isEgg ? '🥚 Egg' : dish.isVeg ? '🌱 Vegetarian' : '🍗 High Protein'}
                    </span>
                  </div>

                  {/* Calories Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-sm font-bold text-white border border-white/10 font-mono">
                    {dish.calories * servingCount} <span className="text-[10px] text-white/50 font-normal">kcal</span>
                  </div>

                  {/* Dish Title */}
                  <div className="absolute bottom-2.5 left-2.5 right-24">
                    <h3 className="text-base font-bold text-white drop-shadow-md truncate">
                      {dish.name}
                    </h3>
                  </div>
                </div>

                {/* Details & Macro Strip */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {dish.description || dish.portion}
                    </p>

                    {/* 3-Column Macro Readout */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 py-2 px-2.5 rounded-2xl bg-white/[0.03] text-center text-xs border border-white/5">
                      <div>
                        <span className="block text-[10px] text-white/40 uppercase">Protein</span>
                        <span className="text-sm text-emerald-400 font-bold tabular-nums font-mono">
                          {dish.protein * servingCount}g
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/40 uppercase">Carbs</span>
                        <span className="text-sm text-amber-400 font-bold tabular-nums font-mono">
                          {dish.carbs * servingCount}g
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/40 uppercase">Fat</span>
                        <span className="text-sm text-sky-400 font-bold tabular-nums font-mono">
                          {dish.fat * servingCount}g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Portion Multiplier & Action Button */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    {/* Stepper */}
                    <div className="flex items-center rounded-xl bg-white/5 p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => adjustDishServing(dish.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                        title="Fewer servings"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-mono text-xs text-white font-bold tabular-nums">
                        {servingCount}x
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustDishServing(dish.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                        title="More servings"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleDishInPlan({
                        ...dish,
                        calories: dish.calories * servingCount,
                        protein: dish.protein * servingCount,
                        carbs: dish.carbs * servingCount,
                        fat: dish.fat * servingCount
                      })}
                      className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                          : 'bg-white/10 hover:bg-[#FF2A2E] text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Added to Plan</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>+ Add to Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
