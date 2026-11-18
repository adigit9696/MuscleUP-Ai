import React from 'react';
import { useFitness } from '../context/FitnessContext';

export default function Footer({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Today' },
    { id: 'meal-planner', label: 'Meals' },
    { id: 'quest-hall', label: 'Quests' },
    { id: 'coach-ai', label: 'Coach' },
    { id: 'account', label: 'Profile' },
  ];

  return (
    <footer className="w-full bg-[#0E0F14]/90 backdrop-blur-xl border-t border-white/5 mt-auto shadow-sm mb-24 md:mb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Brand & Tagline */}
        <div className="flex items-center justify-center flex-wrap gap-2 text-center md:text-left">
          <span className="text-xs font-bold text-white uppercase tracking-tight whitespace-nowrap">
            MuscleUP<span className="text-[#FF2A2E]">.ai</span>
          </span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <p className="text-xs text-white/50 truncate max-w-[230px] sm:max-w-none">
            Free home workouts &amp; daily Indian nutrition companion.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className={`text-[11px] font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === item.id ||
                (item.id === 'coach-ai' && activeTab === 'coach') ||
                (item.id === 'meal-planner' && activeTab === 'meals') ||
                (item.id === 'quest-hall' && activeTab === 'quests')
                  ? 'text-[#FF2A2E] font-bold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Copyright in single line */}
        <div className="text-xs text-white/40 whitespace-nowrap">
          © 2026 MuscleUP Ai. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
