import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export default function Toast() {
  const { toast } = useFitness();

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl shadow-2xl backdrop-blur-2xl border ${
            toast.type === 'success'
              ? 'bg-surface-container-lowest/95 border-tertiary/50 text-tertiary shadow-[0_0_20px_rgba(78,222,163,0.25)]'
              : toast.type === 'error'
              ? 'bg-surface-container-lowest/95 border-primary-container/50 text-primary shadow-[0_0_20px_rgba(255,84,76,0.25)]'
              : 'bg-surface-container-lowest/95 border-secondary/50 text-secondary shadow-[0_0_20px_rgba(76,215,246,0.25)]'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0 text-tertiary stroke-[2.5]" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-primary stroke-[2.5]" />}
          {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 text-secondary stroke-[2.5]" />}
          
          <span className="font-sans text-xs font-semibold text-on-surface tracking-wide">
            {toast.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
