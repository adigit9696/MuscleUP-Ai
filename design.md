# MuscleUP Ai — Apple Sport Obsidian Design System Specification

> **System Name:** Apple Sport Obsidian (v2.6)  
> **Target Project:** MuscleUP Ai — Personal AI Fitness & Indian Nutrition Companion  
> **Design Philosophy:** Apple-level clarity, restraint, and generous whitespace infused with high-energy athletic vitality.  
> **Core Principle:** Every screen has ONE clear purpose, ONE primary action, uniform surface language, and zero decorative clutter.  
> **Updated:** November 2026  

---

## 1. Design Identity & Thematic Direction

MuscleUP Ai uses **modern athletic clarity inspired by Apple Fitness and Apple Health**:

1. **Obsidian Foundation:** Deep, calm, layered dark surfaces (`#0E0F14` base, `#14151C` elevated cards, `#1B1D24` inset inputs and segmented controls) that reduce visual fatigue while making workout and nutrition metrics pop.
2. **Apple-Grade Restraint:** Generous whitespace, 8px grid system, continuous 20–28px card corner smoothing (`rounded-2xl` / `rounded-3xl` / `rounded-[28px]`), soft layered ambient drop shadows, and frosted glass reserved exclusively for top navigation and modal backdrops.
3. **Dual-Accent Color Discipline:** Maximum 2 accent colors per screen:
   - **Energetic Crimson:** (`#FF2A2E` → `#FF4B4F`) for primary CTAs, active tabs, calories ring, and highlights.
   - **Vibrant Emerald:** (`#10B981`) reserved strictly for completion (`Done`, `Claimed ✓`), success states, and protein goal attainment.
   - **Sky Cyan:** (`#06B6D4`) used as a supporting accent strictly for hydration, timers, and form tips.
4. **Natural Human Language:** Plain, everyday English (and natural Hinglish in Coach AI). Zero military/telemetry jargon.

---

## 2. Core Color Palette & Design Tokens

### 2.1 Surfaces & Canvas (Dark Obsidian)
| Token Name | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `surface-ground` | `#090A0D` | Deepest root canvas behind all pages |
| `surface-base` | `#0E0F14` | Primary page background |
| `surface-card` | `#14151C` | Elevated content cards, bento blocks, auth card, modal sheets |
| `surface-input` | `#1B1D24` | Uniform text inputs, Google button, segmented pill tracks |
| `surface-card-hover` | `#1A1C24` | Interactive card hover state |
| `surface-nav-glass` | `rgba(14, 15, 20, 0.90)` | Frosted glass navigation with `backdrop-filter: blur(12px)` |
| `border-subtle` | `rgba(255, 255, 255, 0.08)` | Standard crisp card boundaries |
| `border-focus` | `rgba(255, 42, 46, 0.60)` | Interactive input focus border |

### 2.2 Functional & Athletic Accents
| Accent Token | Hex / Gradient | Purpose |
| :--- | :--- | :--- |
| `accent-crimson` | `#FF2A2E` | Brand primary color, primary buttons, active nav/day pills |
| `accent-crimson-glow` | `0 8px 28px rgba(255, 42, 46, 0.45)` | Soft athletic glow on primary CTAs |
| `accent-emerald` | `#10B981` | Completed tasks (`Done ✓`), claimed XP, protein attainment |
| `accent-cyan` | `#06B6D4` | Hydration tracker, 12:00 AM reset countdown, form guides |
| `accent-amber` | `#F59E0B` | Streak flame, unclaimed XP badges (`+75 XP ready`) |

### 2.3 Typography Contrast Tokens
| Token Name | Hex Value | Usage |
| :--- | :--- | :--- |
| `text-primary` | `#FFFFFF` / `#F4F4F6` | Primary titles, headlines, active labels |
| `text-secondary` | `rgba(255, 255, 255, 0.60)` | Supporting descriptions, helper text, inactive tabs |
| `text-tertiary` | `rgba(255, 255, 255, 0.40)` | Subtle metadata, timestamps, divider labels |

---

## 3. Typography Hierarchy (`Inter` & Numerical Monospace)

- **Display 1 (Hero Title):** `32px–36px`, Weight 900, Tracking `-0.03em`.
- **Title 2 (Page Heading):** `24px–28px`, Weight 800, Tracking `-0.02em`.
- **Headline (Section Title):** `18px–20px`, Weight 700, Tracking `-0.01em`.
- **Body Regular:** `14px`, Weight 400–500.
- **Caption / Label:** `12px`, Weight 600.
- **Numerical Digits (`JetBrains Mono`):** Reserved strictly for calories, grams, countdown timers (`00h 00m 00s`), XP progress (`1,425 / 2,000`), and sets/reps.

---

## 4. UI Architecture & Screen Specifications

### 4.1 Gym Shutter Splash Screen (`GymShutterSplash.jsx`)
- Industrial dark metallic gym shutter that lifts smoothly upwards after **2–3 seconds** with subtle Web Audio shutter-opening sound effect.
- Clean minimal layout: Brand logo (`MUSCLEUP.AI`), loading progress bar, and single-line centered footer (`All Rights Reserved`).

### 4.2 Uniform Authentication Surface (`AuthCard.jsx` & `AuthModal.jsx`)
- **100% Consistent Across All Entry Points:** Used identically inside `AuthModal` (Navbar avatar click), `AccountView` (when signed out), and locked `Meals` / `Coach` views.
- **Visual Spec:**
  - Centered `max-w-[440px]` card (`bg-[#14151C] rounded-[28px] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.8)]`).
  - Header: Red lightning bolt (`Lucide Zap`) + bold `MUSCLEUP.AI` wordmark + single-line contextual subtitle.
  - Segmented Toggle: `LOG IN` | `CREATE ACCOUNT` inside `bg-[#1B1D24] rounded-2xl p-1.5` with `#FF2A2E` active pill.
  - Full-width `Continue with Google` button (`bg-[#1B1D24] rounded-2xl`).
  - Clean `OR WITH EMAIL` horizontal rule divider.
  - `Email` + `Password` (with crimson `Forgot password?` link and Lucide `Eye`/`EyeOff` toggle; plus `Full Name` in Create Account mode).
  - Full-width `#FF2A2E` CTA (`LOG IN` / `CREATE ACCOUNT`) with crimson ambient glow.
  - Optional uniform quick profile setup card immediately following account creation.

### 4.3 Navigation System (`Navbar.jsx`)
- **Desktop Header:** Frosted glass fixed bar (`h-16 sm:h-20`), brand badge on left, 4 clean pill tabs in center (**Today**, **Meals**, **Quests**, **Coach**), streak chip (`🔥 7d ❄️`), live level chip (`⚡ Lvl 3`), and profile avatar on right.
- **Mobile Bottom Navigation:** Fixed 4-tab floating obsidian dock (`rounded-3xl`, 48px+ touch targets) with no cluttered `+` floating button.

### 4.4 Dashboard ("Today" Screen)
- Contextual greeting + date, dynamic single **Next Step** action card, Apple-style 3 concentric activity rings (Calories, Protein, Hydration), Quick Actions row, **Today's Challenges** card (with live `+ Claim XP` pill when tasks are ready), compact **My Plan** editable summary card, Smart Meal Suggestions, and Weight Tracker trend card.

### 4.5 Meals Tab (`MealPlannerView.jsx`)
- **Plate Scanner & External Add Food Removed:** All food search, custom gram portions, Recents, Favourites, and meal preparation tools live cleanly inside the **Meals** tab.
- **Visual Cards:** Authentic local Indian culinary photography (`public/assets/meals/*.jpg`), dietary filter pills (All, Vegetarian, High-Protein Non-Veg, Egg Dishes), Breakfast / Lunch / Snacks / Dinner tabs, and real-time remaining calorie/macro progress bars.

### 4.6 Quest Hall (`QuestHallView.jsx` + `WeeklyWorkoutPlanner.jsx` + `InteractiveMuscleMap.jsx`)
Structured into 4 clear, independent sections:
1. **Dynamic Lifter Level & XP Progress Banner:** Displays current level, title, animated XP Progress bar, XP remaining to next level, and active streak shield. Updates instantaneously whenever XP is claimed.
2. **Standalone Today's Challenges Card:**
   - Real live **12:00 AM (midnight)** countdown (`Resets at 12:00 AM • HHh MMm SSs`) with automatic daily reset at midnight.
   - Each challenge shows progress bar, XP tag, and an interactive **`Done`** button.
   - Dedicated footer with progress counter and working **`+ Claim XP`** button that submits completed tasks, prevents double-claiming, fires confetti, and updates the XP Progress bar.
3. **Separate Interactive 7-Day Workout Planner (`WeeklyWorkoutPlanner.jsx`):**
   - 3 switchable zero-equipment templates (`Balanced Home Fit`, `Fat Loss & Core Burn`, `Strength & Muscle Build`) plus `Reset Week` control.
   - Interactive `Mon`–`Sun` selector strip automatically focused on **Today**, with completion badges per day.
   - Simple, beginner-friendly exercises with plain-English 1-line "how to do it" instructions, sets/reps/rest tags, form-tip modal trigger, per-task **`Done`** button, and per-day **`+ Claim XP`** button synced to the XP Progress bar.
4. **Target Muscle Directory & Realistic Interactive Muscle Map (`InteractiveMuscleMap.jsx`):**
   - Desaturated dark steel-grey anatomical base with original red muscle fibre texture revealed through feathered per-muscle WebP alpha masks for 9 front-view muscle groups.
   - `requestAnimationFrame`-throttled hit testing for smooth 60fps interaction, paired with filterable exercise cards (`+ Add to [DAY] Plan` adds directly to the 7-Day Workout Planner).

### 4.7 Coach AI Tab (`CoachAIView.jsx`)
- Clean chat sanctuary powered by embedded Google Gemini multi-model cascade (`gemini-flash-lite-latest` → `gemini-3.1-flash-lite` → `gemini-3.5-flash-lite` → `gemini-flash-latest` → `gemma-4-26b-a4b-it`) with zero API key setup UI.
- Displays live remaining calorie/protein pill, dynamic contextual suggestion chips, bilingual English/Hinglish answers up to 1,200 tokens for full-day meal plans, and a resilient offline meal-plan engine.

### 4.8 User Account & Profile (`AccountView.jsx`)
- **Signed Out:** Renders the uniform `AuthCard`.
- **Signed In:** Athlete header banner with Sign Out confirmation modal, live 4-card Athlete Progress Report (dynamic XP Progress %, Streak, live BMI, Daily Fuel Goals), and directly editable personal biometrics form with instant Mifflin-St Jeor target recalculation.

---

## 5. Performance, Motion & Accessibility Standards

- **Zero Lag Optimization:** No full-screen `mix-blend-luminosity` / `mix-blend-screen` compositing overlays; `requestAnimationFrame` throttling on interactive canvas pointer moves; Lucide vector icons in critical auth & workout paths for instant paint.
- **Motion:** Purposeful 180ms–350ms transitions respecting `prefers-reduced-motion`.
- **Touch & Focus:** Minimum 44px interactive touch targets, keyboard Escape dismissal on modals, and high-contrast WCAG AA/AAA dark text hierarchy.
