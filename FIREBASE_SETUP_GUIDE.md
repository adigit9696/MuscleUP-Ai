# Firebase Backend Integration Guide — MuscleUP Ai

This step-by-step guide walks you through connecting **MuscleUP Ai** to **Firebase Authentication** and **Cloud Firestore** so every user who signs up or logs in has their own private, permanent account storage across devices.

---

## Architecture Overview: Per-User Data Isolation

Every registered user gets a unique Firebase User ID (`uid`). All of their fitness data is stored permanently inside their own private Firestore document tree:

```text
users/
 └── {uid}/                          # Private to this user only
      ├── (root document)            # name, email, gender, age, height, weight, targetWeight,
      │                              # goal, activity, targets, xp, level, streak, hydrationLiters,
      │                              # lastActiveDate, favouriteMeals, recentMeals
      ├── dailyData/{YYYY-MM-DD}     # plannedMeals[], challenges[] (with done & claimed flags)
      ├── weeklyPlans/active         # 7-Day Workout Plan (templateId, days[], task done/claimed flags)
      └── weightLogs/{YYYY-MM-DD}    # { date, weight } entries for Weight Tracker chart
```

---

## Step 1: Create Your Firebase Project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **Create a project** (or **Add project**).
3. Name it **`muscleup-ai`** (or any name you prefer) and click **Continue**.
4. Disable or enable Google Analytics (optional) and click **Create project**.
5. Once ready, click **Continue** to open the Project Overview dashboard.

---

## Step 2: Register Your Web App & Copy Firebase Config

1. In the Firebase Console Project Overview, click the **Web icon (`</>`)** to add a web app.
2. Enter App nickname: **`MuscleUP Ai Web`** and click **Register app**.
3. Firebase will show you a `firebaseConfig` object like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "muscleup-ai.firebaseapp.com",
     projectId: "muscleup-ai",
     storageBucket: "muscleup-ai.firebasestorage.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456"
   };
   ```
4. Keep this tab open (you'll paste these values into `.env` in Step 6).

---

## Step 3: Enable Firebase Authentication (Email/Password + Google)

1. In the left sidebar of Firebase Console, click **Build → Authentication**.
2. Click **Get started**.
3. Open the **Sign-in method** tab:
   - Click **Email/Password** → toggle **Enable** → click **Save**.
   - Click **Google** → toggle **Enable** → select a **Support email** → click **Save**.
4. Open the **Settings → Authorized domains** tab and verify `localhost` is listed (it is included by default). When you deploy online (Vercel/Netlify/Firebase Hosting), add your live domain here as well.

---

## Step 4: Create Cloud Firestore Database & Security Rules

1. In the left sidebar, click **Build → Firestore Database**.
2. Click **Create database**.
3. Choose a Cloud Firestore location near your users (e.g., **`asia-south1 (Mumbai)`** for lowest latency in India).
4. Start in **Production mode** and click **Create**.
5. Go to the **Rules** tab in Firestore and replace the rules with the following strict per-user isolation rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only the authenticated owner of {userId} can read or write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

6. Click **Publish**.  
   > **Why this matters:** Even if thousands of users register in MuscleUP Ai, User A can **never** view or modify User B's meals, workouts, XP, or biometrics.

---

## Step 5: Install the Firebase SDK in Your Project

Open a terminal inside the `Mr Muscle Tracker` folder and run:

```bash
npm install firebase
```

---

## Step 6: Store Your Credentials in `.env`

In `Mr Muscle Tracker/`, create a file named `.env` (and ensure `.env` is listed in `.gitignore` so secrets aren't pushed publicly):

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Step 7: Create `src/firebase.js`

Create `src/firebase.js` to initialize Firebase Auth and Firestore once for the entire app:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

---

## Step 8: Create Per-User Cloud Storage Helpers (`src/services/userDataService.js`)

Create `src/services/userDataService.js` to read and permanently persist each user's isolated account data:

```javascript
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Load entire account bundle for a signed-in user (uid)
export async function loadUserAccountData(uid, todayDate) {
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

// Save/merge profile, biometrics, XP, level, streak, weightLogs, favourites
export async function saveUserProfile(uid, profileData) {
  if (!uid) return;
  const profileRef = doc(db, 'users', uid);
  await setDoc(
    profileRef,
    { ...profileData, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// Save today's meals & daily challenges (isolated by date YYYY-MM-DD)
export async function saveDailyData(uid, todayDate, { plannedMeals, challenges }) {
  if (!uid) return;
  const dailyRef = doc(db, 'users', uid, 'dailyData', todayDate);
  await setDoc(
    dailyRef,
    { plannedMeals, challenges, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// Save the user's 7-Day Workout Plan & exercise Done/Claimed states
export async function saveWeeklyWorkoutPlan(uid, weeklyPlan) {
  if (!uid) return;
  const weeklyRef = doc(db, 'users', uid, 'weeklyPlans', 'active');
  await setDoc(
    weeklyRef,
    { ...weeklyPlan, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
```

---

## Step 9: Connect `AuthCard.jsx` to Real Firebase Auth

In `src/components/AuthCard.jsx`, replace the local login/signup handlers with real Firebase Auth calls:

```javascript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
```

1. **Log In (`authMode === 'login'`):**
   ```javascript
   const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
   // FitnessContext's onAuthStateChanged listener will automatically load cred.user.uid's Firestore data!
   ```
2. **Create Account (`authMode === 'signup'`):**
   ```javascript
   const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
   await updateProfile(cred.user, { displayName: derivedName });
   // Save initial profile in Firestore under users/{cred.user.uid}
   ```
3. **Continue with Google:**
   ```javascript
   await signInWithPopup(auth, googleProvider);
   ```
4. **Forgot Password:**
   ```javascript
   await sendPasswordResetEmail(auth, email.trim());
   ```

---

## Step 10: Sync `FitnessContext.jsx` with `onAuthStateChanged`

In `src/context/FitnessContext.jsx`:

1. Add an auth listener inside `FitnessProvider`:
   ```javascript
   import { onAuthStateChanged, signOut } from 'firebase/auth';
   import { auth } from '../firebase';
   import {
     loadUserAccountData,
     saveUserProfile,
     saveDailyData,
     saveWeeklyWorkoutPlan,
   } from '../services/userDataService';

   useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
       if (!firebaseUser) {
         // User signed out: reset in-memory state cleanly
         setUser((prev) => ({ ...DEFAULT_USER, isLoggedIn: false, uid: null, name: '', email: '' }));
         return;
       }

       const today = getTodayDateLocal();
       const cloud = await loadUserAccountData(firebaseUser.uid, today);

       if (cloud.profile) {
         // Existing returning user: hydrate their exact permanent saved data
         setUser({ ...DEFAULT_USER, ...cloud.profile, uid: firebaseUser.uid, isLoggedIn: true });
         if (cloud.profile.weightLogs) setWeightLogs(cloud.profile.weightLogs);
         if (cloud.profile.favouriteMeals) setFavouriteMeals(cloud.profile.favouriteMeals);
         if (cloud.profile.recentMeals) setRecentMeals(cloud.profile.recentMeals);
       } else {
         // Brand-new account: create their fresh permanent record in Firestore
         const freshProfile = {
           ...DEFAULT_USER,
           uid: firebaseUser.uid,
           name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
           email: firebaseUser.email,
           isLoggedIn: true,
           xp: 0,
           level: 1,
           levelTitle: 'Rookie Lifter',
           nextLevelXp: 500,
           streak: 1,
           lastActiveDate: today,
         };
         setUser(freshProfile);
         await saveUserProfile(firebaseUser.uid, freshProfile);
       }

       // Hydrate today's meals & challenges (or reset fresh if it's a new day after 12:00 AM)
       if (cloud.daily) {
         setPlannedMeals(cloud.daily.plannedMeals || []);
         setChallenges(cloud.daily.challenges || DEFAULT_CHALLENGES.map(c => ({ ...c, completed: false, claimed: false, current: 0 })));
       } else {
         setPlannedMeals([]);
         setChallenges(DEFAULT_CHALLENGES.map(c => ({ ...c, completed: false, claimed: false, current: 0 })));
       }

       // Hydrate their saved 7-Day Workout Plan
       if (cloud.weeklyPlan) {
         setWeeklyPlan(cloud.weeklyPlan);
       } else {
         const starterPlan = createWeeklyPlanFromTemplate('balanced');
         setWeeklyPlan(starterPlan);
         await saveWeeklyWorkoutPlan(firebaseUser.uid, starterPlan);
       }
     });

     return () => unsubscribe();
   }, []);
   ```

2. Replace the `localStorage.setItem(...)` effects with debounced Firestore syncs whenever `user.uid` is present:
   ```javascript
   // Persist profile, XP, streak, weightLogs, favourites permanently under users/{uid}
   useEffect(() => {
     if (!user?.uid || !user?.isLoggedIn) return;
     const t = setTimeout(() => {
       saveUserProfile(user.uid, {
         ...user,
         weightLogs,
         favouriteMeals,
         recentMeals,
       });
     }, 400);
     return () => clearTimeout(t);
   }, [user, weightLogs, favouriteMeals, recentMeals]);

   // Persist today's meals & challenges under users/{uid}/dailyData/{YYYY-MM-DD}
   useEffect(() => {
     if (!user?.uid || !user?.isLoggedIn) return;
     const t = setTimeout(() => {
       saveDailyData(user.uid, getTodayDateLocal(), { plannedMeals, challenges });
     }, 400);
     return () => clearTimeout(t);
   }, [user?.uid, user?.isLoggedIn, plannedMeals, challenges]);

   // Persist 7-Day Workout Plan under users/{uid}/weeklyPlans/active
   useEffect(() => {
     if (!user?.uid || !user?.isLoggedIn) return;
     const t = setTimeout(() => {
       saveWeeklyWorkoutPlan(user.uid, weeklyPlan);
     }, 400);
     return () => clearTimeout(t);
   }, [user?.uid, user?.isLoggedIn, weeklyPlan]);
   ```

3. Update **Sign Out** in `src/components/Account/AccountView.jsx`:
   ```javascript
   import { signOut } from 'firebase/auth';
   import { auth } from '../../firebase';

   const handleConfirmSignOut = async () => {
     await signOut(auth);
     localStorage.clear();
     setShowSignOutConfirm(false);
     showToast('Signed out safely. Your data remains permanently saved in your account.', 'info');
   };
   ```

---

## Step 11: Verify Permanent Per-User Storage

1. Restart Vite (`npm run dev`) so Vite loads your new `.env` variables.
2. Create **Account A** (`userA@example.com`):
   - Set weight/height, complete a daily challenge, click **`+ Claim XP`**, check off Monday exercises in the 7-Day Planner, and log a meal.
   - Check **Firebase Console → Firestore Database → `users/{uidA}`** — you will see all of Account A's documents saved live.
3. Click **Sign Out**, then create **Account B** (`userB@example.com`):
   - Account B starts completely fresh (`0 XP`, `Level 1`, empty daily log) with zero data leaked from Account A.
4. Sign out of Account B and log back into **Account A**:
   - All of Account A's exact XP, level, BMI, meals, daily challenges, and 7-Day Workout Planner progress restore permanently—even on a completely different browser or phone!
