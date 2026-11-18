import React from 'react';
import { motion } from 'framer-motion';
import { useFitness } from '../context/FitnessContext';

export default function Navbar() {
  const { activeTab, setActiveTab, user, setAuthModalOpen } = useFitness();

  const navItems = [
    { id: 'dashboard', label: 'Today', icon: 'dashboard' },
    { id: 'meal-planner', label: 'Meals', icon: 'restaurant' },
    { id: 'quest-hall', label: 'Quests', icon: 'emoji_events' },
    { id: 'coach-ai', label: 'Coach', icon: 'smart_toy' },
  ];

  const getInitials = (name) => {
    if (!name) return 'AJ';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* DESKTOP & TABLET TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0E0F14]/90 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="h-16 sm:h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 lg:gap-6">
          
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 group focus:outline-none text-left cursor-pointer shrink-0"
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/[0.06] border border-white/10 group-hover:border-[#FF2A2E]/50 transition-all shadow-inner">
              <span className="material-symbols-outlined text-[#FF2A2E] text-[20px] sm:text-[22px]">bolt</span>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF2A2E] shadow-[0_0_8px_rgba(255,42,46,0.9)]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight uppercase group-hover:text-[#FF2A2E] transition-colors">
                MuscleUP<span className="text-[#FF2A2E]">.ai</span>
              </span>
              <span className="hidden sm:inline font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF2A2E]/15 text-[#FF2A2E] uppercase font-bold tracking-wider border border-[#FF2A2E]/20">
                PRO
              </span>
            </div>
          </button>

          {/* Desktop Navigation Tabs — 1 Line with nowrap & flex-shrink-0 */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'coach-ai' && activeTab === 'coach') || (item.id === 'meal-planner' && activeTab === 'meals') || (item.id === 'quest-hall' && activeTab === 'quests');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 flex items-center gap-2 h-9 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white drop-shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDesktopNavPill"
                      className="absolute inset-0 bg-[#FF2A2E] rounded-full shadow-[0_0_16px_rgba(255,42,46,0.45)] -z-10"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Metrics & Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Streak Chip with Freeze indicator */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm shrink-0 cursor-pointer hover:border-white/20 transition-all"
              title={user.streakFreezesAvailable > 0 ? "1 Streak Freeze ready" : "Streak active"}
            >
              <span className="text-sm leading-none">🔥</span>
              <span className="text-xs font-bold text-white tracking-tight">
                {user.streak || 1}d
              </span>
              {user.streakFreezesAvailable > 0 && (
                <span className="text-[11px] leading-none" title="Streak Freeze Available">❄️</span>
              )}
            </div>

            {/* Level Chip */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm shrink-0">
              <span className="text-emerald-400 text-xs leading-none">⚡</span>
              <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                Lvl {user.level || 1}
              </span>
            </div>

            {/* Profile Avatar (Signed In) or Log In CTA (Signed Out) */}
            {user?.isLoggedIn ? (
              <button
                onClick={() => setActiveTab('account')}
                className="relative flex items-center justify-center p-0.5 rounded-full bg-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/15"
                title="Account & Profile"
                aria-label="Open User Account"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF2A2E] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {getInitials(user.name || user.email)}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0E0F14]" />
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#FF2A2E] hover:bg-[#ff4b4f] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_14px_rgba(255,42,46,0.4)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Log In
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MOBILE FLOATING GLASSMORPHIC NAVIGATION PILL (4 Tabs, Equal Spacing, No '+' button) */}
      <nav className="md:hidden fixed bottom-4 inset-x-3 z-40 max-w-lg mx-auto">
        <div className="h-16 px-2 rounded-3xl bg-[#0E0F14]/90 backdrop-blur-md border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] grid grid-cols-4 items-center gap-1 relative">
          {[
            { id: 'dashboard', alias: 'today', label: 'Today', icon: 'dashboard' },
            { id: 'meal-planner', alias: 'meals', label: 'Meals', icon: 'restaurant' },
            { id: 'quest-hall', alias: 'quests', label: 'Quests', icon: 'emoji_events' },
            { id: 'coach-ai', alias: 'coach', label: 'Coach', icon: 'smart_toy' },
          ].map((item) => {
            const isActive = activeTab === item.id || activeTab === item.alias;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-12 rounded-2xl cursor-pointer focus:outline-none transition-all ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActivePill"
                    className="absolute inset-0 bg-[#FF2A2E]/20 border border-[#FF2A2E]/40 rounded-2xl -z-10 shadow-[0_0_12px_rgba(255,42,46,0.3)]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className={`material-symbols-outlined text-[20px] transition-transform ${isActive ? 'scale-110 text-[#FF2A2E]' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] tracking-tight font-medium ${isActive ? 'text-white font-bold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
