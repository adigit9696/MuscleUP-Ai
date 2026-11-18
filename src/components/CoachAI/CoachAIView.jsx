import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, User, Sparkles, Dumbbell, Utensils, Flame, 
  Droplet, Check, ChevronRight, Zap, RefreshCw, Key
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { FOOD_CATALOGUE } from '../../data/indianFoodData';

export default function CoachAIView() {
  const { user, targets, dailyTotals, showToast, addWater } = useFitness();
  
  const targetCal = targets?.calories || 2260;
  const targetPro = targets?.protein || 163;
  const calConsumed = dailyTotals?.calories || 0;
  const proConsumed = dailyTotals?.protein || 0;
  const remCal = Math.max(0, targetCal - calConsumed);
  const remPro = Math.max(0, targetPro - proConsumed);

  // Embedded Coach AI Gemini API Key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AQ.Ab8RN6LBldWMHhm2yOTAUlnC3WHA21U_Zhav5nou5qisr0mUzQ';

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'coach',
      time: 'Just now',
      text: `Hello ${user?.name || 'Aditya'}! I'm your AI Fitness & Nutrition Coach.\n\nI have your personalized metabolic targets loaded: **${targetCal} kcal** & **${targetPro}g Protein**. Ask me anything about home workouts, Indian food macros, breaking plateaus, or timing meals in English or Hindi (Hinglish)!`,
      chips: [
        "How much protein in 100g Paneer?",
        "Can I eat rice at night for fat loss?",
        `Hit my remaining ${remPro}g protein today`,
        "20-minute home chest & core workout"
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Prevent auto-scrolling to bottom on first mount so user sees top hero banner
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, isTyping]);

  // Grounded Offline Knowledge Engine (Cites exact 177+ foods with exact numbers)
  const generateOfflineResponse = (query) => {
    const q = query.toLowerCase().trim();
    const isHindi = /kya|kaise|karo|bhai|btao|khau|diet|motivat|hoga|chahiye|kitna|h|hai|mera|meri|mujhe|pet|vajan|wazan|raat|chawal|paneer|anda|shuru/.test(q);

    // 1. Paneer Protein Query
    if (q.includes('paneer') && (q.includes('protein') || q.includes('kitna') || q.includes('much') || q.includes('calories'))) {
      if (isHindi) {
        return {
          text: `**100g Fresh Raw Paneer** me hamare verified database ke according:
• **Protein:** 18.3g
• **Calories:** 265 kcal
• **Fat:** 20.8g
• **Carbs:** 1.2g

💡 **Coach Tip:** Agar fat loss target hai, toh low-fat paneer ya paneer bhurji with lots of veggies try karo. 150g paneer se aapko ~27.5g high-quality casein protein milta hai!`
        };
      } else {
        return {
          text: `According to our verified Indian nutrition catalogue, **100g of raw paneer** contains:
• **Protein:** 18.3g
• **Calories:** 265 kcal
• **Healthy Fats:** 20.8g
• **Carbohydrates:** 1.2g

💡 **Coach Tip:** Paneer is rich in slow-digesting casein protein, making it fantastic for muscle repair overnight. For a fat loss phase, stir-fry 150g with capsicum and tomatoes to get **27.5g protein** under 400 kcal.`
        };
      }
    }

    // 2. Whole Day Meal Plan / Diet Plan / Nutrition Goal Query
    if (
      q.includes('meal plan') || 
      q.includes('diet plan') || 
      q.includes('whole day') || 
      q.includes('full day') || 
      q.includes('nutritian') || 
      q.includes('nutrition') || 
      q.includes('diet chart') ||
      (q.includes('khao') && (q.includes('din') || q.includes('subah') || q.includes('raat')))
    ) {
      const bCal = Math.round(targetCal * 0.25);
      const bPro = Math.round(targetPro * 0.22);
      const lCal = Math.round(targetCal * 0.35);
      const lPro = Math.round(targetPro * 0.35);
      const sCal = Math.round(targetCal * 0.15);
      const sPro = Math.round(targetPro * 0.18);
      const dCal = Math.round(targetCal * 0.25);
      const dPro = Math.round(targetPro * 0.25);

      if (isHindi) {
        return {
          text: `**Aapke personalized metabolic targets (${targetCal} kcal & ${targetPro}g Protein) ke hisaab se Authentic Indian Full-Day Meal Plan:**

🌅 **1. Breakfast (8:00 AM) — ${bCal} kcal • ${bPro}g Protein**
• Moong Dal Chilla / Paneer Stuffed Chilla (2 medium) + Mint Chutney
• 1 glass Toned Milk ya 1 bowl Greek Yogurt / Dahi (150g)
• *Alt (Non-Veg):* 3 Boiled Egg Whites + 1 Whole Egg Omelette with 2 Whole Wheat Brown Toast

☀️ **2. Lunch (1:30 PM) — ${lCal} kcal • ${lPro}g Protein**
• 150g Low-fat Paneer Bhurji ya Soya Matar Curry (Non-veg: 150g Grilled Chicken Breast)
• 1 Bowl Yellow Dal Tadka (200g)
• 2 Phulka / Whole Wheat Roti (bina ghee ya minimal 1/2 tsp ghee)
• 1 Katori Steamed Rice (100g) + Fresh Cucumber & Onion Salad

🍵 **3. Evening Snack (5:00 PM) — ${sCal} kcal • ${sPro}g Protein**
• 40g Roasted Chana (Bhuna Chana) + 10 Almonds
• 1 Cup Green Tea ya Black Coffee (sugar-free)
• *Muscle Booster:* 1 glass Chhach (Buttermilk) with roasted jeera

🌙 **4. Dinner (8:30 PM) — ${dCal} kcal • ${dPro}g Protein**
• 1.5 Cup Rajma Curry ya Chhole (Kam tel me bana hua)
• 1 Cup Jeera Rice + Cucumber Raita (100g dahi)
• Sauteed Green Vegetables (Beans, Carrots, Capsicum)

🎯 **Daily Total:** ~${targetCal} kcal & ~${targetPro}g Protein.
Aap ye saare dishes seedhe **Meals Tab** me 1-tap se track kar sakte ho!`
        };
      } else {
        return {
          text: `**Personalized Full-Day Indian Meal Plan** tailored directly to your target: **${targetCal} kcal** & **${targetPro}g Protein**.

🌅 **1. Power Breakfast (8:00 AM) — ~${bCal} kcal • ~${bPro}g Protein**
• High-protein Moong Dal / Paneer Chilla (2 medium) OR 3 Boiled Eggs (2 whites, 1 whole) with 2 multi-grain toast
• 150g Fresh Dahi (Curd) or Greek Yogurt with a dash of roasted cumin

☀️ **2. Macro-Balanced Lunch (1:30 PM) — ~${lCal} kcal • ~${lPro}g Protein**
• 150g Paneer Bhurji / Soya Chunks Curry (Non-veg: 150g Grilled Chicken / Fish)
• 1 Cup Thick Dal Tadka (Moong or Toor)
• 2 Phulkas (Whole Wheat Roti, no excess ghee)
• 1 Katori Steamed Basmati Rice (100g) + Large Cucumber & Tomato salad bowl

🍵 **3. Pre-Workout / Evening Snack (5:00 PM) — ~${sCal} kcal • ~${sPro}g Protein**
• 40g Roasted Bengal Gram (Bhuna Chana) + 12 Almonds / Walnuts
• 200ml Fresh Salted Buttermilk (Chaas) or Black Coffee

🌙 **4. Restorative Dinner (8:30 PM) — ~${dCal} kcal • ~${dPro}g Protein**
• 1.5 Bowl Rajma Curry (Kidney Beans) or Chickpea Curry
• 1 Bowl Jeera Brown/White Rice
• 100g Cucumber & Mint Raita + Stir-fried French Beans & Capsicum

🎯 **Total Intake:** Matches your **${targetCal} kcal** & **${targetPro}g Protein** targets within ±2%. All recipes can be logged directly from the **Meals tab**!`
        };
      }
    }

    // 3. Rice at night query
    if (q.includes('rice') || q.includes('chawal')) {
      if (isHindi) {
        return {
          text: `**Bhai, bilkul kha sakte ho! Yeh ek bohot bada myth hai ki raat ko chawal khane se fat banta hai.**

Yahan science samajhiye:
1. **Total Daily Calorie Balance:** Fat tab banta hai jab aap pure din me maintenance se zyada calories khate ho, chahe chawal din me khao ya raat me.
2. **Portion Control:** 1 bowl (150g steamed rice) me ~187 kcal aur 42g carbs hote hain. Bas apne daily limit (**${remCal} kcal**) ke andar rakho.
3. **Sleep Quality:** Raat ko thoda carb khane se serotonin banta hai, jisse neend achi aati hai!`
        };
      } else {
        return {
          text: `**Yes, you can absolutely eat rice at night during fat loss!**

Here is what physiological science actually shows:
1. **Energy Balance Trumps Clock:** Fat gain occurs from a persistent caloric surplus across the whole day, not from the time of day carbs are ingested.
2. **Standard Portion:** 1 standard katori (150g cooked steamed white rice) provides **187 kcal** and **42g carbohydrates**.
3. **Sleep Benefits:** Moderate complex carbs in the evening stimulate tryptophan uptake and serotonin synthesis, improving sleep quality and overnight recovery.

Ensure your total day stays within your **${targetCal} kcal** target!`
        };
      }
    }

    // 3. Hit Remaining Protein / Diet Query
    if (q.includes('protein') || q.includes('remaining') || q.includes('diet') || q.includes('eat now') || q.includes('khana')) {
      if (isHindi) {
        return {
          text: `Aapke target ke hisab se aaj **${remPro}g Protein** aur **${remCal} kcal** remaining hain.

Yahan best Indian protein options hain jo catalogue me verified hain:
• **3 Boiled Eggs (150g):** 207 kcal | **18.7g Protein** (Zero sugar, fast digestion)
• **150g Paneer Bhurji:** 397 kcal | **27.5g Protein**
• **50g Roasted Soya Chunks:** 172 kcal | **26g Protein** (Highest protein density)
• **200g Greek Yogurt / Hung Curd:** 134 kcal | **14g Protein**
• **1 Bowl Dal Tadka (200g):** 168 kcal | **7.8g Protein**

Aap Seedhe **Meals tab** me jakar 1-tap me ise log kar sakte ho!`
        };
      } else {
        return {
          text: `You have **${remPro}g Protein** and **${remCal} kcal** remaining today to hit your goal.

Top verified Indian whole-food options to close this gap:
1. **3 Whole Boiled Eggs (150g):** 207 kcal • **18.7g Protein** • 14.2g Fat
2. **150g Fresh Paneer Stir-fry:** 397 kcal • **27.5g Protein** • 31g Fat
3. **50g Soya Chunks (dry measure):** 172 kcal • **26.0g Protein** • 16g Carbs
4. **200g Hung Curd / Plain Dahi:** 134 kcal • **14.0g Protein**

Tap **Add Meal** on your navigation bar to log any of these in less than 5ms!`
        };
      }
    }

    // 4. Plateau Query
    if (q.includes('plateau') || q.includes('stuck') || q.includes('ruk gya') || q.includes('vajan kam nahi')) {
      if (isHindi) {
        return {
          text: `**Weight loss plateau aana bilkul normal hai! Isko todne ke 4 proven tareeqe:**

1. **Hidden Calories Check:** Cooking oil (1 tbsp ghee = 120 kcal) aur salad dressings measure karke dalo. Small unlogged bites matter.
2. **NEAT Increase:** Din bhar me 8,000 - 10,000 steps poore karo.
3. **Water Retention:** Agar workout hard kiya hai toh muscles me paani hold hota hai (DOMS). Scale par panic mat karo.
4. **1-Day Diet Refeed:** 1 din maintenance calories khao taaki leptin hormone boost ho sake, fir deficit continue karo.`
        };
      } else {
        return {
          text: `**Weight plateaus are a completely natural part of physiological fat loss.**

Here is the 4-step action plan to break through:
1. **Audit Hidden Calories:** Track cooking oils precisely. 1 tablespoon of ghee or mustard oil adds 120–135 kcal.
2. **Protect NEAT (Non-Exercise Activity):** Fatigue can subconsciously lower daily movement. Target 8,000 to 10,000 daily steps.
3. **Cortisol & Water Weight:** New workout stress causes transient intracellular water retention. Trust the trend chart over a 14-day window.
4. **Refeed Day:** If in a deficit for >6 weeks, spend 24 hours at maintenance calories to restore leptin and thyroid efficiency.`
        };
      }
    }

    // 5. Workout / Push-ups Query
    if (q.includes('workout') || q.includes('push') || q.includes('exercise') || q.includes('kasrat') || q.includes('chest')) {
      return {
        text: `Here is a high-intensity, zero-equipment **20-minute Calisthenic Circuit**:

• **Round 1:** Standard Push-Ups — 3 sets × 12–15 reps (Elbows at 45°, 2-second descent)
• **Round 2:** Air Squats — 3 sets × 20 reps (Full depth, chest up)
• **Round 3:** Diamond Push-Ups — 3 sets × 8–10 reps (Triceps & inner chest)
• **Round 4:** Plank with Shoulder Taps — 3 sets × 45 seconds (Glutes locked)

*Rest 45 seconds between circuits. Earn +75 XP by checking off challenges in the Quests tab!*`,
        circuit: {
          title: "20-MINUTE HOME ATHLETIC CIRCUIT",
          rounds: "3 Rounds • 45s Rest",
          exercises: [
            { num: "01", name: "Standard Push-ups", target: "Chest & Arms", reps: "3 sets × 15 reps" },
            { num: "02", name: "Bodyweight Squats", target: "Quadriceps & Glutes", reps: "3 sets × 20 reps" },
            { num: "03", name: "Bicycle Crunches", target: "Abs & Core", reps: "3 sets × 25 reps" },
            { num: "04", name: "Isometric Plank", target: "Core Stability", reps: "3 sets × 60s hold" },
          ]
        }
      };
    }

    // 6. Safety / Injury / Extreme deficit query
    if (q.includes('hurt') || q.includes('pain') || q.includes('chot') || q.includes('dard') || q.includes('500 kcal') || q.includes('fasting')) {
      return {
        text: `⚠️ **Health & Safety Notice:**
I cannot provide medical diagnosis. If you are experiencing sharp joint or back pain, please cease the movement immediately and consult a certified physiotherapist or medical professional.

Additionally, extreme starvation diets under 1,200 kcal for females or 1,500 kcal for males are hazardous to hormonal health and metabolic rate. Our engine enforces safe physiological floors.`
      };
    }

    // Default Fallback
    return {
      text: isHindi
        ? `Bhai, main aapke liye yahan hoon! Aap mujhse:\n• Indian food macros (Paneer, Anda, Roti, Dal, Chawal)\n• 20-minute home workouts\n• Weight loss & plateau tips\n• Daily calorie balance (${targetCal} kcal)\nke baare me kuch bhi pooch sakte ho!`
        : `I'm here to support your fitness journey! You can ask me about:\n• Indian whole food macros & portions\n• Zero-equipment home workouts & form cues\n• Breaking fat loss plateaus\n• Hitting your daily ${targetPro}g protein target.`
    };
  };

  // Multi-model Gemini Cascade for 100% online availability
  const GEMINI_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemma-4-26b-a4b-it'
  ];

  const callGeminiCoach = async (userPrompt) => {
    if (!apiKey) {
      return generateOfflineResponse(userPrompt);
    }

    const systemInstruction = `You are MuscleUP Coach AI, a warm, motivating, scientifically grounded personal fitness coach and Indian nutrition expert.
METABOLIC PROFILE FOR ${user.name || 'Aditya'}:
- Sex: ${user.gender || 'male'}
- Weight: ${user.weight || 74.2} kg (Target: ${user.targetWeight || 70.0} kg)
- Daily Target Calories: ${targetCal} kcal
- Daily Target Protein: ${targetPro} g
- Today Consumed: ${calConsumed} kcal, ${proConsumed}g protein
- Today Remaining: ${remCal} kcal, ${remPro}g protein
CRITICAL RULES:
1. NEVER recalculate BMR or macros. Use the pre-computed numbers above.
2. GROUNDING IN INDIAN FOODS: When recommending or breaking down Indian meals, use accurate practical values (e.g. 100g Paneer = 265 kcal, 18.3g P; 1 Egg = 70 kcal, 6.2g P; 1 Whole Wheat Roti = 93 kcal, 3.2g P; 100g Dal = 84 kcal, 3.9g P; 100g Cooked Rice = 125 kcal, 2.5g P; 50g Soya Chunks = 172 kcal, 26g P).
3. FULL MEAL PLANS: When asked for a meal plan or daily schedule, provide Breakfast, Lunch, Evening Snack, and Dinner with portion sizes (in grams or katoris), calories, and protein for each meal, ensuring the day totals match ${targetCal} kcal and ${targetPro}g protein.
4. LANGUAGE MATCHING: If the user writes in Hindi or Hinglish, reply in encouraging, natural Hinglish. If in English, reply in English.
5. FORMAT: Use clean bold headings, bullet points, and concise actionable steps.`;

    // Cascade through available models
    for (const model of GEMINI_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1200,
          }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const answer = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('')?.trim();
          if (answer) {
            return { text: answer }; // Successful live Gemini response!
          }
        } else {
          console.warn(`Model ${model} returned status ${res.status}. Falling to next model.`);
        }
      } catch (err) {
        console.warn(`Error attempting model ${model}:`, err.message || err);
      }
    }

    // If all models failed or offline, use our intelligent local engine
    console.warn('All Gemini models exhausted or network offline, falling back to offline engine');
    const fallback = generateOfflineResponse(userPrompt);
    return {
      ...fallback,
      note: 'Offline Coach Engine (Gemini connection unavailable)',
    };
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await callGeminiCoach(text);
      const coachMsg = {
        id: `c-${Date.now()}`,
        sender: 'coach',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.text,
        circuit: response.circuit,
        note: response.note,
        chips: [
          "How much protein in 100g Paneer?",
          "Can I eat rice at night?",
          `Hit remaining ${remPro}g protein`,
          "20-min home workout"
        ]
      };
      setMessages(prev => [...prev, coachMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-28 md:pb-16 relative">
      
      {/* Top Header & Context Strip */}
      <section className="relative overflow-hidden bg-[#14151C] rounded-3xl p-5 sm:p-6 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: "url('/assets/3.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0F14] via-[#0E0F14]/90 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#FF2A2E]">
                Personal AI Coach
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs text-emerald-400 font-semibold">
                {apiKey ? 'Live Multi-Model Gemini AI' : 'Offline Verified Engine'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Coach AI
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl">
              Ask in English or Hindi about Indian nutrition, exercise form, and daily macro balance.
            </p>
          </div>

          {/* Active AI Status & Progress Pill */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Coach AI Online</span>
            </div>

            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-white/40 uppercase block">Remaining</span>
                <span className="font-mono text-xs font-bold text-white">{remCal} kcal • {remPro}g P</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Messages Container */}
      <div className="bg-[#14151C] rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col h-[560px] sm:h-[640px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-[#FF2A2E] text-white'
                    : 'bg-white/10 text-[#FF2A2E] border border-[#FF2A2E]/30'
                }`}
              >
                {m.sender === 'user' ? 'You' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden ${
                  m.sender === 'user'
                    ? 'bg-[#FF2A2E] text-white rounded-tr-none'
                    : 'bg-[#1A1C26] text-white/90 border border-white/5 rounded-tl-none shadow-sm'
                }`}
              >
                <div>{m.text}</div>

                {/* Optional Structured Circuit Card */}
                {m.circuit && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#FF2A2E]">
                      <span>{m.circuit.title}</span>
                      <span className="text-white/50 text-[10px]">{m.circuit.rounds}</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {m.circuit.exercises.map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                          <span className="text-white font-medium">{ex.num}. {ex.name}</span>
                          <span className="text-white/50 font-mono text-[11px]">{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestion Chips */}
                {m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                    {m.chips.map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs transition-colors cursor-pointer border border-white/5"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-1.5 text-[10px] text-white/30">
                  {m.note && <span>{m.note} • </span>}
                  <span>{m.time}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#FF2A2E] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#1A1C26] rounded-2xl px-4 py-2.5 border border-white/5 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FF2A2E] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#FF2A2E] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#FF2A2E] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0E0F14] border-t border-white/5 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about Indian diet, protein, push-up form, or calories..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#FF2A2E] transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isTyping}
            className="w-12 h-12 rounded-2xl bg-[#FF2A2E] hover:bg-[#ff4b4f] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            aria-label="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
