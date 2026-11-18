import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Recursively remove `undefined` values because Firestore rejects undefined properties
function sanitizeForFirestore(value) {
  if (value === undefined) return null;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item));
  }
  const clean = {};
  for (const [k, v] of Object.entries(value)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirestore(v);
    }
  }
  return clean;
}

/**
 * Load a registered user's isolated account data from Firestore:
 * - users/{uid}
 * - users/{uid}/dailyData/{todayDate}
 * - users/{uid}/weeklyPlans/active
 */
export async function loadUserAccountData(uid, todayDate) {
  if (!uid) return { profile: null, daily: null, weeklyPlan: null };

  const profileRef = doc(db, 'users', uid);
  const dailyRef = doc(db, 'users', uid, 'dailyData', todayDate);
  const weeklyRef = doc(db, 'users', uid, 'weeklyPlans', 'active');

  const [profileSnap, dailySnap, weeklySnap] = await Promise.all([
    getDoc(profileRef),
    getDoc(dailyRef),
    getDoc(weeklyRef),
  ]);

  return {
    profile: profileSnap.exists() ? profileSnap.data() : null,
    daily: dailySnap.exists() ? dailySnap.data() : null,
    weeklyPlan: weeklySnap.exists() ? weeklySnap.data() : null,
  };
}

/**
 * Permanently save/merge the user's profile, biometrics, targets, XP, level,
 * streak, hydration, weight history, favourite & recent meals under users/{uid}.
 */
export async function saveUserProfile(uid, profileData) {
  if (!uid) return;
  const profileRef = doc(db, 'users', uid);
  const cleanData = sanitizeForFirestore(profileData);
  await setDoc(
    profileRef,
    {
      ...cleanData,
      uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Permanently save today's logged meals and Daily Challenges progress under
 * users/{uid}/dailyData/{YYYY-MM-DD}.
 */
export async function saveDailyData(uid, todayDate, { plannedMeals, challenges }) {
  if (!uid || !todayDate) return;
  const dailyRef = doc(db, 'users', uid, 'dailyData', todayDate);
  const cleanData = sanitizeForFirestore({ plannedMeals, challenges, date: todayDate });
  await setDoc(
    dailyRef,
    {
      ...cleanData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Permanently save the user's interactive 7-Day Workout Plan & task Done/Claimed states
 * under users/{uid}/weeklyPlans/active.
 */
export async function saveWeeklyWorkoutPlan(uid, weeklyPlan) {
  if (!uid || !weeklyPlan) return;
  const weeklyRef = doc(db, 'users', uid, 'weeklyPlans', 'active');
  const cleanData = sanitizeForFirestore(weeklyPlan);
  await setDoc(
    weeklyRef,
    {
      ...cleanData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
