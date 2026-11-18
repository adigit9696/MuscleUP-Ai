import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitness } from '../context/FitnessContext';
import AuthCard from './AuthCard';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen } = useFitness();

  useEffect(() => {
    if (!authModalOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setAuthModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [authModalOpen, setAuthModalOpen]);

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop click to dismiss */}
          <div
            className="fixed inset-0"
            onClick={() => setAuthModalOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full flex justify-center"
          >
            <AuthCard
              showCloseButton
              onClose={() => setAuthModalOpen(false)}
              onSuccess={() => setAuthModalOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
