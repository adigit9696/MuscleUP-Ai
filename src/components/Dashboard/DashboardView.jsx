import React from 'react';
import NextStepCard from './NextStepCard';
import QuickActionsRow from './QuickActionsRow';
import ActivityRingsCard from './ActivityRingsCard';
import TodayChallengesCard from './TodayChallengesCard';
import MyPlanCard from './MyPlanCard';
import WeightTrackerCard from './WeightTrackerCard';
import SmartMealSuggestionCard from './SmartMealSuggestionCard';

export default function DashboardView({ setActiveTab }) {
  return (
    <div className="flex flex-col w-full pb-24 pt-3 sm:pt-6 relative">
      {/* Background ambient fitness texture */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.025] pointer-events-none -z-10"
        style={{ backgroundImage: "url('/assets/3.jpg')" }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full space-y-6 relative z-10">
        
        {/* 1. Dynamic Greeting & One Big "Next Step" Hero Card */}
        <NextStepCard setActiveTab={setActiveTab} />

        {/* 2. Quick Actions Row */}
        <QuickActionsRow setActiveTab={setActiveTab} />

        {/* 3. Primary Metrics Grid: Apple Activity Rings + Today's Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex">
            <ActivityRingsCard />
          </div>
          <div className="lg:col-span-5 flex">
            <TodayChallengesCard setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* 4. Secondary Grid: "What Can I Eat Now?" + Weight Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex">
            <SmartMealSuggestionCard setActiveTab={setActiveTab} />
          </div>
          <div className="lg:col-span-6 flex">
            <WeightTrackerCard />
          </div>
        </div>

        {/* 5. "My Plan" Compact Setup & Metabolic Target Summary */}
        <MyPlanCard />

      </div>
    </div>
  );
}
