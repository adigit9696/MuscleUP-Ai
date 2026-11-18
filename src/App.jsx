import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitness } from './context/FitnessContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import AuthCard from './components/AuthCard';
import GymShutterSplash from './components/Splash/GymShutterSplash';
import DashboardView from './components/Dashboard/DashboardView';
import MealPlannerView from './components/MealPlanner/MealPlannerView';
import CoachAIView from './components/CoachAI/CoachAIView';
import QuestHallView from './components/QuestHall/QuestHallView';
import AccountView from './components/Account/AccountView';
import Footer from './components/Footer';

export default function App() {
  const { activeTab, setActiveTab, user, setAuthModalOpen } = useFitness();
  const [showSplash, setShowSplash] = useState(true);

  // Re-trigger shutter listener (from footer or dev tools)
  useEffect(() => {
    const handleRearm = () => setShowSplash(true);
    window.addEventListener('muscleup:rearm-shutter', handleRearm);
    return () => window.removeEventListener('muscleup:rearm-shutter', handleRearm);
  }, []);

  // Force scroll to top on tab/route changes and manual restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelectorAll('.overflow-y-auto').forEach(el => {
      el.scrollTop = 0;
    });
  }, [activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'today':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'meal-planner':
      case 'meals':
        if (!user?.isLoggedIn) {
          return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center min-h-[70vh]">
              <AuthCard subtitle="Log in to unlock your Daily Meal Planner and track your Indian nutrition goals." />
            </div>
          );
        }
        return <MealPlannerView />;
      case 'coach-ai':
      case 'coach':
        if (!user?.isLoggedIn) {
          return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center min-h-[70vh]">
              <AuthCard subtitle="Log in to chat with Coach AI for personalized meal plans and workouts." />
            </div>
          );
        }
        return <CoachAIView />;
      case 'quest-hall':
      case 'quests':
        return <QuestHallView />;
      case 'account':
      case 'profile':
        return <AccountView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden">
      {/* Google Stitch AI Gym Shutter Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <GymShutterSplash onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Background ambient subtle gradients without expensive GPU blur filter rasterization */}
      <div 
        className="pointer-events-none fixed inset-0 -z-10 opacity-35"
        style={{
          background: 'radial-gradient(circle at 15% 15%, rgba(255, 42, 46, 0.08) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(56, 189, 248, 0.05) 0%, transparent 45%)'
        }}
      />

      {/* Dynamic Notifications */}
      <Toast />

      {/* Account & Profile Setup Modal */}
      <AuthModal />

      {/* Top Header Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 sm:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
