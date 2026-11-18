# MuscleUP Ai — Context, Architecture & Current Feature Specification

> **Document Type:** Master System Context & Production Architecture Reference  
> **Project:** `MuscleUP Ai — Personal AI Fitness & Indian Nutrition Companion`  
> **Version:** v2.6 (Apple Sport Obsidian Release)  
> **Author & Project Owner:** Aditya Jaiswal  
> **Last Updated:** November 2026  

---

## 1. Executive Summary & Product Vision

**MuscleUP Ai** is a high-clarity, fast, web-based personal fitness and Indian nutrition companion built with React, Vite, Tailwind CSS, Framer Motion, and Google Gemini AI. Designed around Apple-grade visual clarity and sporty obsidian aesthetics, every tab has one clear purpose and actionable controls:

- **Precision Biometrics Engine:** Sex-aware Mifflin-St Jeor BMR/TDEE calculator (`+5` male / `-161` female) with strict physiological calorie floors (1,500 kcal male / 1,200 kcal female) and exact macro balancing (`Calories = P×4 + C×4 + F×9`).
- **Indian Whole-Food Meal Planner & Prep Station:** Integrated 177+ verified Indian food search, custom gram portions, dietary filters (Vegetarian, High-Protein Non-Veg, Egg Dishes), Recents, Favourites, and authentic local dish photography.
- **Interactive Quest Hall & 7-Day Workout Planner:** Live 12:00 AM (midnight) daily challenge auto-reset, interactive Mon–Sun beginner-friendly home workout planner with per-task `Done` buttons, verified `+ Claim XP` progress submission synced to the XP Progress bar, and a realistic pixel-accurate interactive anatomical muscle map.
- **Live Bilingual Coach AI:** Powered by a resilient multi-model Google Gemini cascade (`gemini-flash-lite-latest` → `gemini-3.1-flash-lite` → `gemini-3.5-flash-lite` → `gemini-flash-latest` → `gemma-4-26b-a4b-it`) with pre-computed metabolic context injection and a smart offline meal-plan engine.
- **Uniform Authentication & Per-User Data Architecture:** Single reusable `AuthCard` interface across all sign-in/sign-up touchpoints, ready for permanent per-user Firebase Authentication + Cloud Firestore storage (see [`FIREBASE_SETUP_GUIDE.md`](./FIREBASE_SETUP_GUIDE.md)).

---

## 2. Production Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18/19 + Vite 6** | Instant HMR, fast production bundle, component modularity |
| **Styling & Motion** | **Tailwind CSS + Framer Motion** | Obsidian dark theme (`#0E0F14` / `#14151C` / `#FF2A2E`), GPU-friendly transitions |
| **Iconography & Effects** | **Lucide React + Canvas Confetti** | Instant vector UI icons, level-up & XP claim celebrations |
| **State & Persistence** | **React Context (`FitnessContext.jsx`) + `localStorage`** | Unified state for user profile, meals, challenges, 7-day plan, XP, streaks, and weight logs |
| **Cloud Backend (Ready)** | **Firebase Auth + Cloud Firestore** | Per-account permanent cloud storage (`users/{uid}`) — full setup in `FIREBASE_SETUP_GUIDE.md` |
| **Conversational AI** | **Google Gemini API (`v1beta`) Multi-Model Cascade** | Live answers to any custom diet/workout query in English or Hinglish with automatic 503 failover |
| **Biomechanical Map** | **WebP Anatomical Layers + Offscreen Canvas Hit-Testing** | Realistic front-body muscle explorer with `requestAnimationFrame`-throttled pointer lookup |

---

## 3. Repository & Source Architecture

```text
Mr Muscle Tracker/
├── public/
│   └── assets/
│       ├── meals/                  # 46 authentic local Indian food photos (.jpg)
│       └── muscle-map/             # Processed WebP base, red muscle texture, feathered alpha masks & idMap
├── src/
│   ├── App.jsx                     # Root shell, splash trigger, tab router, uniform AuthCard gating
│   ├── main.jsx                    # React entry point with FitnessProvider
│   ├── index.css                   # Global obsidian tokens, typography, reduced-motion rules
│   ├── context/
│   │   └── FitnessContext.jsx      # Global state, Mifflin-St Jeor math, 12:00 AM reset, XP/Level engine, 7-day plan actions
│   ├── data/
│   │   ├── indianFoodData.js       # 177+ verified Indian foods with kcal/macros per 100g & local images
│   │   ├── foodSearch.js           # Sub-5ms fuzzy & phonetic Indian food search
│   │   ├── mealCalc.js             # Portion scaling & macro total helpers
│   │   ├── mealDatabase.js         # Curated breakfast/lunch/snack/dinner recipes
│   │   └── weeklyWorkoutPlans.js   # 3 beginner-friendly 7-Day Home Workout templates (Balanced, Fat Loss, Strength)
│   └── components/
│       ├── AuthCard.jsx            # Single uniform Log In / Create Account / Profile Setup card
│       ├── AuthModal.jsx           # Lightweight modal wrapper around AuthCard
│       ├── Navbar.jsx              # Desktop frosted pill nav + mobile 4-tab floating dock
│       ├── Footer.jsx              # Minimal single-row footer
│       ├── Toast.jsx               # Non-blocking notification banner
│       ├── Splash/
│       │   └── GymShutterSplash.jsx # 2–3s industrial gym shutter reveal with Web Audio shutter sound
│       ├── Dashboard/
│       │   ├── DashboardView.jsx
│       │   ├── NextStepCard.jsx
│       │   ├── ActivityRingsCard.jsx
│       │   ├── QuickActionsRow.jsx
│       │   ├── TodayChallengesCard.jsx
│       │   ├── MyPlanCard.jsx
│       │   ├── SmartMealSuggestionCard.jsx
│       │   └── WeightTrackerCard.jsx
│       ├── MealPlanner/
│       │   └── MealPlannerView.jsx  # Integrated Food Search & Prep Station + daily meal tabs + macro bars
│       ├── QuestHall/
│       │   ├── QuestHallView.jsx    # XP banner, standalone Today's Challenges (12:00 AM reset), Muscle Directory
│       │   ├── WeeklyWorkoutPlanner.jsx # Interactive Mon–Sun workout schedule with Done & + Claim XP
│       │   └── InteractiveMuscleMap.jsx # Realistic 9-muscle interactive front body explorer
│       ├── CoachAI/
│       │   └── CoachAIView.jsx      # Live Gemini multi-model cascade + offline meal-plan fallback
│       └── Account/
│           └── AccountView.jsx      # Uniform AuthCard (signed out) OR Progress Report + direct edit form (signed in)
├── context.md                      # This master system context document
├── design.md                       # Apple Sport Obsidian v2.6 design system specification
└── FIREBASE_SETUP_GUIDE.md         # Step-by-step guide to connect Firebase Auth & Firestore
```

---

## 4. Core Implemented Modules & Business Logic

### 4.1 Biometrics & Nutrition Math (`FitnessContext.jsx`)
- **Sex-Aware Mifflin-St Jeor BMR:**
  - Male: $\text{BMR} = 10W + 6.25H - 5A + 5$
  - Female: $\text{BMR} = 10W + 6.25H - 5A - 161$
- **TDEE:** $\text{BMR} \times \text{Activity Multiplier}$ (`1.2`, `1.375`, `1.55`, `1.725`).
- **Safe Calorie Floors:** Never drops below `1,500 kcal` (male) or `1,200 kcal` (female).
- **Goal Offsets:** Aggressive Loss (`-600`), Steady Loss (`-400`), Maintenance (`0`), Lean Bulk (`+300`), Mass Gain (`+500`).
- **Macro Balancing:** Protein `1.8–2.2 g/kg`, Fat `25%` of kcal (`÷ 9`), Carbs derived from remaining calories (`÷ 4`), then final calories synchronized to `P×4 + C×4 + F×9`.

### 4.2 Uniform Authentication Experience (`AuthCard.jsx` & `AuthModal.jsx`)
- **Single Source of Truth:** Every sign-in or create-account flow (Account tab, locked Meals/Coach tabs, Navbar avatar modal) renders the exact same `AuthCard` component.
- **Capabilities:** Instant toggle between `LOG IN` and `CREATE ACCOUNT`, Google Sign-In button, Email/Password form with visibility toggle and password strength badge, and optional quick body-stats setup for new signups.

### 4.3 Daily Meal Planner & Integrated Food Prep Station (`MealPlannerView.jsx`)
- **Plate Scanner & External Add Food Removed:** All meal discovery, food search, portion sizing, and logging live cohesively inside the **Meals** tab.
- **Verified Indian Catalogue:** 177+ Indian whole foods and dishes with authentic local images in `public/assets/meals/`.
- **Dietary Filters:** All Meals, Vegetarian, High-Protein Non-Veg, Egg Dishes, plus Breakfast / Lunch / Snacks / Dinner tabs and live remaining calorie/macro bars.

### 4.4 Quest Hall: Midnight Reset, Interactive 7-Day Planner & XP Engine
1. **Dynamic Lifter Level & XP Progress Banner:**
   - Uses unified `getLevelInfo(xp)` curve:
     - Level 1 (*Rookie Lifter*): `0–499 XP`
     - Level 2 (*Consistent Athlete*): `500–1,199 XP`
     - Level 3 (*Iron Crusader*): `1,200–1,999 XP`
     - Level 4 (*Elite Lifter*): `2,000–2,999 XP`
     - Level 5 (*Titan Lifter*): `3,000–4,499 XP`
     - Level 6 (*Olympian Legend*): `4,500+ XP`
   - Smooth animated progress bar updates immediately whenever XP is claimed, with confetti celebration on Level Up.
2. **Standalone Today's Challenges Section:**
   - **12:00 AM (Midnight) Auto-Reset:** Live ticking countdown (`Resets at 12:00 AM • HHh MMm SSs`) calculated against local midnight (`setHours(24, 0, 0, 0)`). Automatically resets daily challenges at 12:00 AM and on next-day login.
   - **Task Completion & `+ Claim XP`:** Users click `Done` on completed challenges and press **`+ Claim XP`** (`claimActiveXP`) to submit progress, lock claimed tasks against double-claiming, and credit XP directly to the XP Progress bar.
3. **Integrated Interactive 7-Day Workout Planner (`WeeklyWorkoutPlanner.jsx`):**
   - Separated cleanly from Today's Challenges as its own interactive weekly schedule.
   - Supports 3 beginner-friendly zero-equipment templates (`Balanced Home Fit`, `Fat Loss & Core Burn`, `Strength & Muscle Build`) persisted in `localStorage` (`muscleup_v2_weekly_plan`).
   - Interactive `Mon`–`Sun` selector automatically focuses **Today**, shows completion checkmarks per day, lists simple easy-to-understand exercises with plain-English how-to cues, provides an individual **`Done`** button per exercise, and includes a day-level **`+ Claim XP`** button (`claimWeeklyDayXP`) that submits completed workout tasks to the XP Progress bar.
   - Clicking `+ Add to [DAY] Plan` on any exercise in the Target Muscle Directory appends it directly into that day's workout schedule.
4. **Interactive Realistic Muscle Map (`InteractiveMuscleMap.jsx`):**
   - Built from processed WebP anatomical assets (`body_front` desaturated steel-grey base + full-color red muscle texture masked by feathered per-muscle alpha masks + 8-bit `idMap` hit-testing throttled via `requestAnimationFrame`).
   - Future-proofed architecture for adding back-view muscles via config + assets without rewriting runtime code.

### 4.5 Coach AI (`CoachAIView.jsx`)
- **Zero-Setup Embedded API Key:** Manual key setup modal removed; displays live online badge.
- **Multi-Model Resilient Cascade:** Sequentially attempts `gemini-flash-lite-latest` → `gemini-3.1-flash-lite` → `gemini-3.5-flash-lite` → `gemini-flash-latest` → `gemma-4-26b-a4b-it` with 12s timeout and `1,200` max output tokens so full-day meal plans never truncate.
- **Grounded Context:** Injects pre-computed targets and consumed/remaining calories & protein; supports English and Hinglish seamlessly.
- **Smart Offline Fallback:** If completely disconnected, synthesizes personalized 4-meal Indian meal plans, macro breakdowns, plateau fixes, and 20-minute home circuits locally.

### 4.6 Account & Profile (`AccountView.jsx`)
- Displays live Athlete Progress Report (XP Progress %, Streak & Shield, live BMI, Mifflin-St Jeor Daily Fuel Goals) and directly editable biometric fields (Name, Email, Weight, Height, Age, Target Weight, Gender, Goal, Activity) that immediately recalculate all app-wide targets on save.

---

## 5. Planned Cloud Backend Data Model (Firebase Firestore)

To isolate and permanently store every registered user's data across devices, the app maps cleanly onto **Firebase Authentication** + **Cloud Firestore** under a per-user document tree:

```text
users/{uid}                         # Profile, biometrics, targets, XP, level, streak, hydration, lastActiveDate
  ├── dailyLogs/{YYYY-MM-DD}        # Planned/logged meals, daily totals, daily challenges state & claimed flags
  ├── weeklyPlans/active            # Active 7-Day Workout Plan (templateId, days[], task done/claimed flags)
  ├── weightLogs/{YYYY-MM-DD}       # Historical body-weight entries for trend chart
  └── preferences/foods             # Favourite food IDs & recent food search history
```

All Firestore security rules restrict reads and writes strictly to `request.auth != null && request.auth.uid == userId`, guaranteeing permanent, private, per-account storage. Full step-by-step setup instructions are documented in [`FIREBASE_SETUP_GUIDE.md`](./FIREBASE_SETUP_GUIDE.md).
