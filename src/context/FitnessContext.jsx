import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  loadUserAccountData,
  saveUserProfile,
  saveDailyData,
  saveWeeklyWorkoutPlan,
} from '../services/userDataService';
import { createWeeklyPlanFromTemplate } from '../data/weeklyWorkoutPlans';

const FitnessContext = createContext();

// Get current date string in user's local timezone ('YYYY-MM-DD') for exact 12:00 AM midnight resets
export function getTodayDateLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Legacy alias kept for compatibility
export function getTodayDateIST() {
  return getTodayDateLocal();
}

// Compute exact time remaining until next 12:00:00 AM (midnight) local time
export function getTimeUntilMidnight() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diffMs % (1000 * 60)) / 1000);
  return { h, m, s, diffMs };
}

// Single source of truth for XP -> Level curve
export function getLevelInfo(xpValue = 0) {
  const xp = Math.max(0, Number(xpValue) || 0);
  if (xp >= 4500) return { level: 6, levelTitle: 'Olympian Legend', minXp: 4500, nextLevelXp: 6000 };
  if (xp >= 3000) return { level: 5, levelTitle: 'Titan Lifter', minXp: 3000, nextLevelXp: 4500 };
  if (xp >= 2000) return { level: 4, levelTitle: 'Elite Lifter', minXp: 2000, nextLevelXp: 3000 };
  if (xp >= 1200) return { level: 3, levelTitle: 'Iron Crusader', minXp: 1200, nextLevelXp: 2000 };
  if (xp >= 500) return { level: 2, levelTitle: 'Consistent Athlete', minXp: 500, nextLevelXp: 1200 };
  return { level: 1, levelTitle: 'Rookie Lifter', minXp: 0, nextLevelXp: 500 };
}

// Compute Mifflin-St Jeor with safe floors and exact macro balancing
export function computeMifflinStJeor(weight, height, age, gender = 'male', activity = 1.55, goal = 'loss') {
  const w = Number(weight) || 70;
  const h = Number(height) || 175;
  const a = Number(age) || 24;
  const act = Number(activity) || 1.55;

  // Sex-aware BMR constant (+5 for male, -161 for female)
  let bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'female' ? -161 : 5);
  const tdee = Math.round(bmr * act);

  let targetCal = tdee;
  if (goal === 'aggressive_loss') targetCal -= 600;
  else if (goal === 'loss') targetCal -= 400;
  else if (goal === 'lean_bulk') targetCal += 300;
  else if (goal === 'mass_gain') targetCal += 500;

  // Strict physiological calorie floor (never starve: min 1200 kcal female, 1500 kcal male)
  const safeFloor = gender === 'female' ? 1200 : 1500;
  targetCal = Math.max(safeFloor, Math.round(targetCal));

  // Protein target: 1.8 - 2.2 g/kg depending on goal
  const proteinMultiplier = (goal === 'loss' || goal === 'aggressive_loss') ? 2.2 : (goal === 'mass_gain' || goal === 'lean_bulk') ? 2.0 : 1.8;
  const protein = Math.round(w * proteinMultiplier);

  // Fat target: ~25% of calories
  const fat = Math.round((targetCal * 0.25) / 9);

  // Carbs derived strictly to balance Calories = P*4 + C*4 + F*9
  const remainingCalForCarbs = Math.max(0, targetCal - (protein * 4 + fat * 9));
  const carbs = Math.max(40, Math.round(remainingCalForCarbs / 4));

  // Re-sync final calories to exact macro sum
  const calories = protein * 4 + carbs * 4 + fat * 9;

  return {
    bmr: Math.round(bmr),
    tdee,
    calories,
    protein,
    carbs,
    fat,
    safeFloorApplied: targetCal === safeFloor
  };
}

const GUEST_USER = {
  uid: null,
  name: '',
  email: '',
  isLoggedIn: false,
  gender: 'male',
  age: 24,
  height: 175,
  weight: 70.0,
  targetWeight: 68.0,
  activity: 1.55,
  goal: 'loss',
  dietType: 'nonveg',
  level: 1,
  levelTitle: 'Rookie Lifter',
  xp: 0,
  nextLevelXp: 500,
  streak: 1,
  streakMultiplier: 1.0,
  streakFreezesAvailable: 1,
  weeklyFreezeUsed: false,
  lastActiveDate: getTodayDateLocal(),
  targetCalories: 2150,
  targetProtein: 154,
  targetCarbs: 225,
  targetFat: 60,
  hydrationLiters: 0,
  hydrationTarget: 3.5,
  planConfigured: false,
};

const createFreshChallenges = () => [
  { id: 'c1', title: 'Push-Up Century: Complete 50 Push-ups', target: 'Chest & Arms', current: 0, total: 50, reps: '3 sets × 15-20', xp: 75, completed: false, claimed: false },
  { id: 'c2', title: 'Core Steel: 3 Sets of 25 Sit-Ups', target: 'Abdominals', current: 0, total: 75, reps: '3 sets × 25', xp: 60, completed: false, claimed: false },
  { id: 'c3', title: 'Leg Power: 40 Bodyweight Air Squats', target: 'Quadriceps & Glutes', current: 0, total: 40, reps: '3 sets × 15', xp: 60, completed: false, claimed: false },
  { id: 'c4', title: 'Isometric Beast: 2-Minute Total Plank Hold', target: 'Core Stability', current: 0, total: 120, unit: 's', reps: '2 × 60s hold', xp: 50, completed: false, claimed: false },
];

export function FitnessProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  // Guard: never overwrite Firestore before initial hydration finishes for the current uid
  const hydratedUidRef = useRef(null);
  const permissionWarnedRef = useRef(false);

  const [user, setUser] = useState(GUEST_USER);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [challenges, setChallenges] = useState(createFreshChallenges);
  const [weeklyPlan, setWeeklyPlan] = useState(() => createWeeklyPlanFromTemplate('balanced'));
  const [weightLogs, setWeightLogs] = useState([]);
  const [favouriteMeals, setFavouriteMeals] = useState(['IND-000019', 'IND-000027', 'IND-000029']);
  const [recentMeals, setRecentMeals] = useState([]);

  // Toast notifier
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3400);
  }, []);
  const addToast = showToast;

  // Reset Daily Challenges cleanly for a fresh day (called automatically at 12:00 AM midnight)
  const resetDailyChallenges = useCallback((notifyUser = false) => {
    setChallenges(createFreshChallenges());
    if (notifyUser) {
      showToast('🌙 Midnight reset! Fresh Daily Challenges are now unlocked.', 'info');
    }
  }, [showToast]);

  // Helper to handle Firestore write errors cleanly
  const handleCloudError = useCallback((err) => {
    console.warn('Firestore sync error:', err);
    setCloudSyncStatus('error');
    if (
      (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) &&
      !permissionWarnedRef.current
    ) {
      permissionWarnedRef.current = true;
      showToast(
        'Firestore permissions blocked write. Publish the per-user Firestore Security Rules in Firebase Console.',
        'error'
      );
    }
  }, [showToast]);

  // =========================================================================
  // FIREBASE AUTH LISTENER & PER-USER CLOUD FIRESTORE HYDRATION
  // =========================================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      hydratedUidRef.current = null;

      if (!firebaseUser) {
        // Signed out: clear in-memory state cleanly so no previous account data leaks
        setUser(GUEST_USER);
        setPlannedMeals([]);
        setChallenges(createFreshChallenges());
        setWeeklyPlan(createWeeklyPlanFromTemplate('balanced'));
        setWeightLogs([]);
        setFavouriteMeals(['IND-000019', 'IND-000027', 'IND-000029']);
        setRecentMeals([]);
        setCloudSyncStatus('idle');
        setAuthLoading(false);
        return;
      }

      const uid = firebaseUser.uid;
      const today = getTodayDateLocal();
      setCloudSyncStatus('syncing');

      try {
        const cloud = await loadUserAccountData(uid, today);

        if (cloud.profile) {
          // Existing user: hydrate their exact saved cloud profile
          const savedProfile = cloud.profile;
          const lvlInfo = getLevelInfo(savedProfile.xp ?? 0);

          let streak = savedProfile.streak || 1;
          let freezesAvailable = savedProfile.streakFreezesAvailable ?? 1;
          let freezeUsed = savedProfile.weeklyFreezeUsed || false;
          let hydrationLiters = savedProfile.hydrationLiters ?? 0;

          // Daily rollover check if user returns on a new date
          if (savedProfile.lastActiveDate && savedProfile.lastActiveDate !== today) {
            const lastDate = new Date(savedProfile.lastActiveDate);
            const currDate = new Date(today);
            const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              streak = (savedProfile.streak || 0) + 1;
            } else if (diffDays === 2 && freezesAvailable > 0) {
              freezesAvailable = 0;
              freezeUsed = true;
              showToast('❄️ Streak Freeze used! Your streak was protected.', 'info');
            } else if (diffDays > 1) {
              streak = 1;
            }
            hydrationLiters = 0;
          }

          const hydratedUser = {
            ...GUEST_USER,
            ...savedProfile,
            uid,
            email: firebaseUser.email || savedProfile.email || '',
            name: savedProfile.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Athlete'),
            isLoggedIn: true,
            level: lvlInfo.level,
            levelTitle: lvlInfo.levelTitle,
            nextLevelXp: lvlInfo.nextLevelXp,
            streak,
            streakFreezesAvailable: freezesAvailable,
            weeklyFreezeUsed: freezeUsed,
            hydrationLiters,
            lastActiveDate: today,
          };

          setUser(hydratedUser);
          setWeightLogs(
            Array.isArray(savedProfile.weightLogs) && savedProfile.weightLogs.length > 0
              ? savedProfile.weightLogs
              : [{ date: today, weight: hydratedUser.weight || 70 }]
          );
          setFavouriteMeals(
            Array.isArray(savedProfile.favouriteMeals)
              ? savedProfile.favouriteMeals
              : ['IND-000019', 'IND-000027', 'IND-000029']
          );
          setRecentMeals(Array.isArray(savedProfile.recentMeals) ? savedProfile.recentMeals : []);
        } else {
          // Brand-new Firebase account: initialize a completely fresh permanent record
          const initialName =
            firebaseUser.displayName ||
            (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Athlete');
          const calc = computeMifflinStJeor(70, 175, 24, 'male', 1.55, 'loss');
          const initialWeightLog = [{ date: today, weight: 70.0 }];
          const freshProfile = {
            ...GUEST_USER,
            uid,
            name: initialName,
            email: firebaseUser.email || '',
            isLoggedIn: true,
            xp: 0,
            level: 1,
            levelTitle: 'Rookie Lifter',
            nextLevelXp: 500,
            streak: 1,
            lastActiveDate: today,
            targetCalories: calc.calories,
            targetProtein: calc.protein,
            targetCarbs: calc.carbs,
            targetFat: calc.fat,
            hydrationLiters: 0,
            planConfigured: false,
          };

          setUser(freshProfile);
          setWeightLogs(initialWeightLog);
          setFavouriteMeals(['IND-000019', 'IND-000027', 'IND-000029']);
          setRecentMeals([]);

          await saveUserProfile(uid, {
            ...freshProfile,
            weightLogs: initialWeightLog,
            favouriteMeals: ['IND-000019', 'IND-000027', 'IND-000029'],
            recentMeals: [],
          });
        }

        // Hydrate today's daily meals & challenges (or start fresh if it's a new day!)
        if (cloud.daily) {
          setPlannedMeals(Array.isArray(cloud.daily.plannedMeals) ? cloud.daily.plannedMeals : []);
          setChallenges(
            Array.isArray(cloud.daily.challenges) && cloud.daily.challenges.length > 0
              ? cloud.daily.challenges.map((c) => ({ ...c, claimed: Boolean(c.claimed) }))
              : createFreshChallenges()
          );
        } else {
          const freshChallenges = createFreshChallenges();
          setPlannedMeals([]);
          setChallenges(freshChallenges);
          await saveDailyData(uid, today, { plannedMeals: [], challenges: freshChallenges });
        }

        // Hydrate their saved 7-Day Workout Plan
        if (cloud.weeklyPlan && Array.isArray(cloud.weeklyPlan.days) && cloud.weeklyPlan.days.length === 7) {
          setWeeklyPlan(cloud.weeklyPlan);
        } else {
          const starterPlan = createWeeklyPlanFromTemplate('balanced');
          setWeeklyPlan(starterPlan);
          await saveWeeklyWorkoutPlan(uid, starterPlan);
        }

        hydratedUidRef.current = uid;
        setCloudSyncStatus('synced');
      } catch (err) {
        handleCloudError(err);
        // Even if Firestore fails transiently, still sign user in locally with their Auth info
        const fallbackName =
          firebaseUser.displayName ||
          (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Athlete');
        setUser((prev) => ({
          ...prev,
          uid,
          name: prev.name || fallbackName,
          email: firebaseUser.email || prev.email,
          isLoggedIn: true,
        }));
        hydratedUidRef.current = uid;
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [handleCloudError, showToast]);

  // =========================================================================
  // EXACT 12:00 AM (MIDNIGHT) AUTO-RESET TIMER
  // =========================================================================
  useEffect(() => {
    let midnightTimerId;
    const scheduleNextMidnightReset = () => {
      const { diffMs } = getTimeUntilMidnight();
      midnightTimerId = setTimeout(() => {
        const newToday = getTodayDateLocal();
        resetDailyChallenges(true);
        setPlannedMeals([]);
        setUser(prev => ({
          ...prev,
          lastActiveDate: newToday,
          hydrationLiters: 0,
        }));
        scheduleNextMidnightReset();
      }, diffMs + 500);
    };

    scheduleNextMidnightReset();
    return () => clearTimeout(midnightTimerId);
  }, [resetDailyChallenges]);

  // =========================================================================
  // PERMANENT PER-USER CLOUD FIRESTORE AUTO-SYNC (DEBOUNCED)
  // =========================================================================
  useEffect(() => {
    if (!user?.uid || !user?.isLoggedIn || hydratedUidRef.current !== user.uid) return;
    setCloudSyncStatus('syncing');
    const timer = setTimeout(() => {
      saveUserProfile(user.uid, {
        ...user,
        weightLogs,
        favouriteMeals,
        recentMeals,
      })
        .then(() => setCloudSyncStatus('synced'))
        .catch(handleCloudError);
    }, 450);
    return () => clearTimeout(timer);
  }, [user, weightLogs, favouriteMeals, recentMeals, handleCloudError]);

  useEffect(() => {
    if (!user?.uid || !user?.isLoggedIn || hydratedUidRef.current !== user.uid) return;
    const today = getTodayDateLocal();
    const timer = setTimeout(() => {
      saveDailyData(user.uid, today, { plannedMeals, challenges })
        .then(() => setCloudSyncStatus('synced'))
        .catch(handleCloudError);
    }, 450);
    return () => clearTimeout(timer);
  }, [user?.uid, user?.isLoggedIn, plannedMeals, challenges, handleCloudError]);

  useEffect(() => {
    if (!user?.uid || !user?.isLoggedIn || hydratedUidRef.current !== user.uid) return;
    const timer = setTimeout(() => {
      saveWeeklyWorkoutPlan(user.uid, weeklyPlan)
        .then(() => setCloudSyncStatus('synced'))
        .catch(handleCloudError);
    }, 450);
    return () => clearTimeout(timer);
  }, [user?.uid, user?.isLoggedIn, weeklyPlan, handleCloudError]);

  // Real Firebase Sign Out (preserves all user data safely in Firestore!)
  const signOutUser = useCallback(async () => {
    try {
      hydratedUidRef.current = null;
      await signOut(auth);
      localStorage.removeItem('muscleup_v2_user');
      localStorage.removeItem('muscleup_v2_meals');
      localStorage.removeItem('muscleup_v2_challenges');
      localStorage.removeItem('muscleup_v2_weekly_plan');
      localStorage.removeItem('muscleup_v2_weights');
      localStorage.removeItem('muscleup_v2_favs');
      localStorage.removeItem('muscleup_v2_recents');
      showToast('Signed out safely. All your progress is saved in your account.', 'info');
    } catch (err) {
      console.error('Sign out failed:', err);
      showToast('Could not sign out right now. Please try again.', 'error');
    }
  }, [showToast]);

  // Dynamic XP and Level calculations (strictly synced with getLevelInfo)
  const updateXP = useCallback((amount) => {
    setUser(u => {
      const newXp = Math.max(0, (u.xp || 0) + amount);
      const lvlInfo = getLevelInfo(newXp);

      if (lvlInfo.level > (u.level || 1)) {
        confetti({
          particleCount: 140,
          spread: 95,
          origin: { y: 0.5 },
          colors: ['#FF2A2E', '#10B981', '#F59E0B', '#FFFFFF']
        });
        showToast(`🎉 LEVEL UP! You are now Level ${lvlInfo.level} — ${lvlInfo.levelTitle}!`, 'success');
      }

      return {
        ...u,
        xp: newXp,
        level: lvlInfo.level,
        levelTitle: lvlInfo.levelTitle,
        nextLevelXp: lvlInfo.nextLevelXp,
      };
    });
  }, [showToast]);

  // Add meal to planned meals
  const addMealToPlan = (dish, period = 'breakfast', grams = 100) => {
    const ratio = grams / (dish.basis_weight_g || 100);
    const newEntry = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      foodId: dish.food_id || dish.id,
      name: dish.name_en || dish.name,
      nameHi: dish.name_hi || '',
      portion: `${grams}g`,
      calories: Math.round((dish.kcal_per_100g || dish.calories || 200) * ratio),
      protein: Math.round((dish.protein_g_per_100g || dish.protein || 10) * ratio),
      carbs: Math.round((dish.carbohydrates_g_per_100g || dish.carbs || 25) * ratio),
      fat: Math.round((dish.fat_g_per_100g || dish.fat || 5) * ratio),
      period: period || 'lunch',
      isVeg: dish.category !== 'Chicken & Poultry Dishes' && dish.category !== 'Mutton & Red Meat Dishes' && dish.category !== 'Fish & Seafood' && !dish.name?.toLowerCase().includes('chicken') && !dish.name?.toLowerCase().includes('egg'),
      image: dish.image || null,
    };

    setPlannedMeals(prev => [newEntry, ...prev]);

    setRecentMeals(prev => {
      const filtered = prev.filter(f => (f.food_id || f.id) !== (dish.food_id || dish.id));
      return [dish, ...filtered].slice(0, 8);
    });

    updateXP(25);
    showToast(`Added ${newEntry.name} (+${newEntry.protein}g protein)!`, 'success');
  };

  // Toggle dish in MealPlannerView cards
  const toggleDishInPlan = (dish, period = 'breakfast', servingMultiplier = 1) => {
    const exists = plannedMeals.some(m => m.name === dish.name || m.id === dish.id);
    if (exists) {
      setPlannedMeals(prev => prev.filter(m => m.name !== dish.name && m.id !== dish.id));
      showToast(`Removed ${dish.name} from today's plan.`, 'info');
    } else {
      const entry = {
        id: dish.id || `dish-${Date.now()}`,
        name: dish.name,
        portion: `${servingMultiplier}x serving`,
        calories: Math.round((dish.calories || 200) * servingMultiplier),
        protein: Math.round((dish.protein || 10) * servingMultiplier),
        carbs: Math.round((dish.carbs || 25) * servingMultiplier),
        fat: Math.round((dish.fat || 5) * servingMultiplier),
        period,
        isVeg: Boolean(dish.isVeg),
        image: dish.image || null,
      };
      setPlannedMeals(prev => [entry, ...prev]);
      updateXP(25);
      showToast(`Added ${dish.name} (+${entry.protein}g protein)!`, 'success');
    }
  };

  // Remove meal from plan
  const removeMealFromPlan = (mealId) => {
    setPlannedMeals(prev => prev.filter(m => m.id !== mealId));
    showToast('Meal removed', 'info');
  };

  // Toggle meal in favourite
  const toggleFavouriteMeal = (foodId) => {
    setFavouriteMeals(prev => {
      const exists = prev.includes(foodId);
      if (exists) {
        showToast('Removed from favourites', 'info');
        return prev.filter(id => id !== foodId);
      } else {
        showToast('Added to favourites ⭐', 'success');
        return [foodId, ...prev];
      }
    });
  };

  // Water tracking
  const addWater = (amountLiters = 0.25) => {
    setUser(prev => {
      const current = prev.hydrationLiters || 0;
      const target = prev.hydrationTarget || 3.5;
      const updated = Math.min(6.0, Number((current + amountLiters).toFixed(2)));
      showToast(`+${Math.round(amountLiters * 1000)}ml water logged! (${updated}L / ${target}L)`, 'info');
      return { ...prev, hydrationLiters: updated };
    });
  };

  // Weight logging
  const logWeight = (newWeightKg) => {
    const val = Number(newWeightKg);
    if (!val || val <= 0) return;
    const today = getTodayDateLocal();

    setWeightLogs(prev => {
      const filtered = prev.filter(l => l.date !== today);
      return [...filtered, { date: today, weight: val }].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    updateUserMetrics({ weight: val });
    showToast(`Weight updated to ${val} kg!`, 'success');
  };

  // Recalculate metrics via Mifflin-St Jeor
  const updateUserMetrics = (newMetrics) => {
    setUser(prev => {
      const updated = { ...prev, ...newMetrics };
      const calc = computeMifflinStJeor(
        updated.weight,
        updated.height,
        updated.age,
        updated.gender,
        updated.activity,
        updated.goal
      );

      updated.targetCalories = calc.calories;
      updated.targetProtein = calc.protein;
      updated.targetCarbs = calc.carbs;
      updated.targetFat = calc.fat;
      updated.planConfigured = true;
      return updated;
    });
  };

  // Daily totals computed from plannedMeals
  const plannedTotals = plannedMeals.reduce((acc, dish) => ({
    calories: acc.calories + (dish.calories || 0),
    protein: acc.protein + (dish.protein || 0),
    carbs: acc.carbs + (dish.carbs || 0),
    fat: acc.fat + (dish.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Toggle daily challenge completion (marked Done; XP is awarded when clicking "+ Claim XP")
  const toggleChallenge = (id) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        if (c.claimed) {
          showToast('This challenge XP is already claimed for today! Resets at 12:00 AM.', 'info');
          return c;
        }
        const nextState = !c.completed;
        if (nextState) {
          showToast(`Marked done! Click "+ Claim XP" to add +${c.xp} XP to your progress bar.`, 'success');
        }
        return { ...c, completed: nextState, current: nextState ? c.total : 0 };
      }
      return c;
    }));
  };

  // Submit completed Daily Challenges progress and award XP to the XP Progress bar
  const claimActiveXP = () => {
    const claimable = challenges.filter(c => c.completed && !c.claimed);
    if (claimable.length === 0) {
      const allClaimed = challenges.length > 0 && challenges.every(c => c.claimed);
      showToast(
        allClaimed
          ? 'All daily challenge XP has already been claimed! Next reset at 12:00 AM.'
          : 'Mark at least one challenge as Done first, then click "+ Claim XP"!',
        'info'
      );
      return 0;
    }

    const totalEarned = claimable.reduce((sum, c) => sum + (c.xp || 0), 0);

    setChallenges(prev => prev.map(c =>
      c.completed && !c.claimed ? { ...c, claimed: true } : c
    ));

    updateXP(totalEarned);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#FF2A2E', '#10B981', '#06B6D4', '#F59E0B']
    });
    showToast(`🏆 Progress submitted! +${totalEarned} XP added to your XP Progress bar!`, 'success');
    return totalEarned;
  };

  // 7-Day Workout Planner Actions
  const generateWeeklyPlan = (templateId = 'balanced') => {
    const freshPlan = createWeeklyPlanFromTemplate(templateId);
    setWeeklyPlan(freshPlan);
    showToast(`7-Day "${freshPlan.label}" workout plan generated!`, 'success');
    return freshPlan;
  };

  const toggleWeeklyTask = (dayId, taskId) => {
    setWeeklyPlan(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.dayId !== dayId) return day;
        return {
          ...day,
          tasks: day.tasks.map(task => {
            if (task.id !== taskId) return task;
            if (task.claimed) {
              showToast('XP for this task has already been claimed!', 'info');
              return task;
            }
            const nextDone = !task.completed;
            if (nextDone) {
              showToast(`"${task.name}" marked Done! Click "+ Claim XP" to submit.`, 'success');
            }
            return { ...task, completed: nextDone };
          })
        };
      })
    }));
  };

  const claimWeeklyDayXP = (dayId) => {
    const targetDay = weeklyPlan?.days?.find(d => d.dayId === dayId);
    if (!targetDay) return 0;

    const claimableTasks = targetDay.tasks.filter(t => t.completed && !t.claimed);
    if (claimableTasks.length === 0) {
      const allClaimed = targetDay.tasks.length > 0 && targetDay.tasks.every(t => t.claimed);
      showToast(
        allClaimed
          ? `All XP for ${targetDay.dayName} has already been claimed!`
          : `Click "Done" on completed exercises in ${targetDay.dayName} first to claim XP!`,
        'info'
      );
      return 0;
    }

    const totalEarned = claimableTasks.reduce((sum, t) => sum + (t.xp || 25), 0);

    setWeeklyPlan(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.dayId !== dayId) return day;
        return {
          ...day,
          tasks: day.tasks.map(t => (t.completed && !t.claimed ? { ...t, claimed: true } : t))
        };
      })
    }));

    updateXP(totalEarned);
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#FF2A2E', '#10B981', '#06B6D4', '#F59E0B']
    });
    showToast(`⚡ ${targetDay.dayName} progress submitted! +${totalEarned} XP added!`, 'success');
    return totalEarned;
  };

  const addExerciseToWeeklyDay = (dayId, exercise) => {
    const newTask = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: exercise.name,
      muscle: exercise.target || 'Full Body',
      setsReps: exercise.reps || '3 sets × 12 reps',
      rest: '45s rest',
      xp: 30,
      howTo: exercise.desc || 'Perform with smooth, controlled bodyweight form.',
      cues: exercise.cues || exercise.desc,
      completed: false,
      claimed: false,
    };

    setWeeklyPlan(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.dayId !== dayId) return day;
        if (day.tasks.some(t => t.name === exercise.name)) {
          return day;
        }
        return {
          ...day,
          tasks: [...day.tasks, newTask]
        };
      })
    }));

    const dayName = weeklyPlan?.days?.find(d => d.dayId === dayId)?.dayName || 'your weekly plan';
    showToast(`Added "${exercise.name}" to ${dayName}'s workout!`, 'success');
  };

  const resetWeeklyPlanProgress = () => {
    setWeeklyPlan(prev => ({
      ...prev,
      days: prev.days.map(day => ({
        ...day,
        tasks: day.tasks.map(t => ({ ...t, completed: false, claimed: false }))
      }))
    }));
    showToast('Weekly workout checkboxes reset for a fresh week!', 'info');
  };

  const targets = useMemo(() => ({
    calories: user.targetCalories || 2150,
    protein: user.targetProtein || 154,
    carbs: user.targetCarbs || 225,
    fat: user.targetFat || 60,
    hydration: user.hydrationTarget || 3.5,
  }), [user.targetCalories, user.targetProtein, user.targetCarbs, user.targetFat, user.hydrationTarget]);

  const contextValue = useMemo(() => ({
    activeTab,
    setActiveTab,
    user,
    setUser,
    authLoading,
    cloudSyncStatus,
    signOutUser,
    updateUserMetrics,
    updateXP,
    targets,
    plannedMeals,
    setPlannedMeals,
    addMealToPlan,
    toggleDishInPlan,
    removeMealFromPlan,
    toggleFavouriteMeal,
    favouriteMeals,
    recentMeals,
    plannedTotals,
    dailyTotals: plannedTotals,
    challenges,
    toggleChallenge,
    claimActiveXP,
    resetDailyChallenges,
    weeklyPlan,
    generateWeeklyPlan,
    toggleWeeklyTask,
    claimWeeklyDayXP,
    addExerciseToWeeklyDay,
    resetWeeklyPlanProgress,
    addWater,
    logWeight,
    weightLogs,
    planModalOpen,
    setPlanModalOpen,
    authModalOpen,
    setAuthModalOpen,
    toast,
    showToast,
    addToast,
  }), [
    activeTab,
    user,
    authLoading,
    cloudSyncStatus,
    signOutUser,
    targets,
    plannedMeals,
    favouriteMeals,
    recentMeals,
    plannedTotals,
    challenges,
    weeklyPlan,
    weightLogs,
    planModalOpen,
    authModalOpen,
    toast,
  ]);

  return (
    <FitnessContext.Provider value={contextValue}>
      {children}
    </FitnessContext.Provider>
  );
}

export function useFitness() {
  return useContext(FitnessContext);
}
