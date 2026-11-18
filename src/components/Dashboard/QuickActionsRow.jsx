import React from 'react';
import { useFitness } from '../../context/FitnessContext';

export default function QuickActionsRow({ setActiveTab }) {
  const { addWater } = useFitness();

  const actions = [
    {
      id: 'explore-meals',
      label: 'Explore Meals',
      icon: 'restaurant_menu',
      color: 'text-[#FF2A2E]',
      bgColor: 'bg-[#FF2A2E]/10 border-[#FF2A2E]/20',
      onClick: () => setActiveTab && setActiveTab('meal-planner'),
    },
    {
      id: 'log-water',
      label: 'Log water (+250ml)',
      icon: 'water_drop',
      color: 'text-[#06B6D4]',
      bgColor: 'bg-[#06B6D4]/10 border-[#06B6D4]/20',
      onClick: () => addWater(0.25),
    },
    {
      id: 'start-workout',
      label: 'Start workout',
      icon: 'fitness_center',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10 border-amber-400/20',
      onClick: () => setActiveTab && setActiveTab('quest-hall'),
    },
    {
      id: 'ask-coach',
      label: 'Ask Coach',
      icon: 'smart_toy',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10 border-purple-400/20',
      onClick: () => setActiveTab && setActiveTab('coach-ai'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {actions.map((act) => (
        <button
          key={act.id}
          onClick={act.onClick}
          className="group p-3 sm:p-4 rounded-3xl bg-[#14151C] hover:bg-[#1A1C26] border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2.5 sm:gap-3.5 shadow-sm active:scale-[0.98] cursor-pointer text-left min-w-0"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border shrink-0 ${act.bgColor} ${act.color} group-hover:scale-105 transition-transform`}>
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{act.icon}</span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block leading-snug group-hover:text-white transition-colors truncate">
              {act.label}
            </span>
            <span className="text-[10px] text-white/40 block mt-0.5 truncate">
              Quick action
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
