import React, { useState, useEffect, useRef } from 'react';

/**
 * GymShutterSplash Component
 * Minimalist, high-impact industrial gym shutter splash screen.
 * Displays for 2.5 seconds with:
 * - Brand emblem (dumbbell badge)
 * - Brand name (MUSCLEUP.AI)
 * - Sleek loading progress bar
 * - Centered "All Rights Reserved 2026 © MuscleUP Ai" at bottom
 * 
 * At 2.5s, triggers upward mechanical roll with authentic shutter opening audio synthesis.
 */
export default function GymShutterSplash({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isRollingUp, setIsRollingUp] = useState(false);
  const [showLightFlare, setShowLightFlare] = useState(false);
  const hasTriggeredRoll = useRef(false);

  // Realistic Web Audio API synthesizer for heavy metal shutter opening sound
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // 1. Initial mechanical latch release / clank
      const oscLatch = ctx.createOscillator();
      const gainLatch = ctx.createGain();
      oscLatch.type = 'sawtooth';
      oscLatch.frequency.setValueAtTime(180, now);
      oscLatch.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      gainLatch.gain.setValueAtTime(0.28, now);
      gainLatch.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      oscLatch.connect(gainLatch);
      gainLatch.connect(ctx.destination);
      oscLatch.start(now);
      oscLatch.stop(now + 0.17);

      // 2. Rolling slats rattling upward inside vertical steel guide rails (bandpass filtered noise)
      const bufferSize = ctx.sampleRate * 1.0;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, now + 0.05);
      filter.frequency.linearRampToValueAtTime(950, now + 0.8);
      filter.Q.setValueAtTime(3.0, now + 0.05);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now + 0.05);
      noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now + 0.05);
      whiteNoise.stop(now + 1.05);

      // 3. Deep low-frequency mechanical rumble into overhead coil barrel
      const oscRumble = ctx.createOscillator();
      const gainRumble = ctx.createGain();
      oscRumble.type = 'triangle';
      oscRumble.frequency.setValueAtTime(55, now + 0.05);
      oscRumble.frequency.linearRampToValueAtTime(95, now + 0.6);
      oscRumble.frequency.linearRampToValueAtTime(40, now + 1.0);
      gainRumble.gain.setValueAtTime(0.001, now);
      gainRumble.gain.linearRampToValueAtTime(0.18, now + 0.15);
      gainRumble.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      oscRumble.connect(gainRumble);
      gainRumble.connect(ctx.destination);
      oscRumble.start(now + 0.05);
      oscRumble.stop(now + 1.05);
    } catch {
      // Audio fails gracefully if autoplay restricted
    }
  };

  const triggerRollUp = () => {
    if (hasTriggeredRoll.current) return;
    hasTriggeredRoll.current = true;
    setIsRollingUp(true);
    setShowLightFlare(true);
    playShutterSound();

    // After 1050ms upward roll, unmount and reveal app
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1050);
  };

  // 2.5-second timer countdown (between 2-3 seconds as requested)
  useEffect(() => {
    const totalDuration = 2500;
    const intervalMs = 25;
    const startTime = performance.now();

    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const currentPct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(currentPct);

      if (elapsed >= totalDuration) {
        clearInterval(timer);
        triggerRollUp();
      }
    }, intervalMs);

    // Escape or Space to skip immediately
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        clearInterval(timer);
        triggerRollUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const slatsCount = 24;

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] z-[999] overflow-hidden select-none bg-[#08090c] flex flex-col justify-between"
      style={{
        transform: isRollingUp ? 'translateY(-100%)' : 'translateY(0%)',
        transition: 'transform 1.05s cubic-bezier(0.19, 1, 0.22, 1)',
        willChange: 'transform',
      }}
    >
      {/* 1. TOP ROLLER BARREL (Minimalist industrial cap with hazard stripe) */}
      <div className="w-full bg-[#121318] border-b border-[#1c1e26] shadow-2xl z-30 relative shrink-0 pt-safe">
        <div className="h-4 bg-gradient-to-r from-[#171820] via-[#252834] to-[#171820] border-b border-white/10" />
        <div className="h-2 w-full hazard-stripe" />
      </div>

      {/* 2. CENTER SECTION: SHUTTER SLATS + EMBLEM + BRAND + CLEAN LOADING BAR */}
      <div className="w-full flex-1 relative overflow-hidden flex flex-col justify-around bg-[#0b0c10]">
        
        {/* Background Corrugated Steel Slats */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-85 pointer-events-none">
          {Array.from({ length: slatsCount }).map((_, idx) => (
            <div key={idx} className="shutter-slat flex-shrink-0">
              <span className="slat-rivet" />
              <span className="slat-rivet" />
            </div>
          ))}
        </div>

        {/* Left Vertical Guide Track */}
        <div className="absolute inset-y-0 left-0 w-4 sm:w-6 md:w-8 bg-gradient-to-r from-black via-[#181920] to-[#252834] border-r-2 border-[#ff2a2e]/30 shadow-2xl flex flex-col justify-around py-4 items-center z-20 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
          ))}
        </div>

        {/* Right Vertical Guide Track */}
        <div className="absolute inset-y-0 right-0 w-4 sm:w-6 md:w-8 bg-gradient-to-l from-black via-[#181920] to-[#252834] border-l-2 border-[#ff2a2e]/30 shadow-2xl flex flex-col justify-around py-4 items-center z-20 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
          ))}
        </div>

        {/* CENTER CONTENT: LOGO, BRAND NAME, LOADING BAR ONLY */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 my-auto text-center">
          
          {/* 1. LOGO: Dumbbell Emblem Badge with Crimson Glow */}
          <div className="relative mb-4 sm:mb-6 flex items-center justify-center">
            <div className="absolute -inset-6 bg-[#ff2a2e]/30 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-b from-[#20222a] to-[#0c0d12] border-2 border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#ff2a2e] drop-shadow-[0_0_14px_rgba(255,42,46,0.9)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" />
              </svg>

              {/* Corner mounting bolts */}
              <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
              <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
              <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
            </div>
          </div>

          {/* 2. BRAND NAME: MUSCLEUP.AI */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter shutter-stencil-text uppercase leading-none">
              MUSCLEUP<span className="shutter-stencil-accent">.AI</span>
            </h1>
          </div>

          {/* 3. LOADING BAR: Minimalist & Sleek */}
          <div className="w-full max-w-[280px] sm:max-w-xs flex flex-col items-center">
            <div className="w-full h-2 bg-zinc-900/90 border border-white/10 rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#ff474b] to-[#ff2a2e] rounded-full transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(255,42,46,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM STEEL PULL-BAR: ONLY "All Rights Reserved" CENTERED */}
      <div
        onClick={triggerRollUp}
        className="w-full knurled-handle-bar flex flex-col items-center justify-center px-4 relative z-30 shrink-0 pb-safe py-3.5 cursor-pointer"
        title="Tap to open immediately"
      >
        <div className="text-center">
          <p className="font-mono text-xs text-zinc-300 font-semibold tracking-wider">
            All Rights Reserved 2026 © MuscleUP Ai
          </p>
        </div>

        {/* Rubber Weather Seal */}
        <div className="h-1 w-full max-w-sm bg-black/80 mt-2 rounded-full flex items-center justify-center">
          <div className="w-full h-0.5 bg-white/10" />
        </div>
      </div>

      {/* Bottom Light Burst Flare upon upward roll */}
      {showLightFlare && (
        <div className="shutter-light-flare animate-pulse" />
      )}
    </div>
  );
}
