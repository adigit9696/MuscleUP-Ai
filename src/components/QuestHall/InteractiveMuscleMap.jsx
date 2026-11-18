import React, { useState, useEffect, useRef, useMemo } from 'react';

// Muscle ID to Name mapping matching scripts/prepare_muscle_map.py
const ID_TO_MUSCLE = {
  1: 'chest',
  2: 'shoulders',
  3: 'biceps',
  4: 'forearms',
  5: 'abs',
  6: 'obliques',
  7: 'quads',
  8: 'calves',
  9: 'traps',
};

const MUSCLE_TO_ID = Object.fromEntries(
  Object.entries(ID_TO_MUSCLE).map(([id, name]) => [name, Number(id)])
);

const MUSCLE_LABELS = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  calves: 'Calves',
  traps: 'Traps',
};

export default function InteractiveMuscleMap({
  selectedMuscle = 'chest',
  onSelectMuscle,
  className = '',
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const idMapDataRef = useRef(null); // Uint8ClampedArray of id_map.png
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const [debugCoords, setDebugCoords] = useState(null);
  const rafIdRef = useRef(null);
  const currentHoveredRef = useRef(null);

  // Check ?debug=map query parameter
  const isDebug = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debug') === 'map';
  }, []);

  const imageNaturalWidth = 1122;
  const imageNaturalHeight = 1402;

  // Load id_map.png once into an offscreen canvas for instantaneous O(1) hit testing
  useEffect(() => {
    const idMapImg = new Image();
    idMapImg.src = '/assets/muscle-map/front/id_map.png';
    idMapImg.crossOrigin = 'anonymous';

    idMapImg.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = imageNaturalWidth;
      offscreen.height = imageNaturalHeight;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(idMapImg, 0, 0);
      const imgData = ctx.getImageData(0, 0, imageNaturalWidth, imageNaturalHeight);
      idMapDataRef.current = imgData.data; // R, G, B, A
      setMapLoaded(true);
    };

    idMapImg.onerror = (e) => {
      console.warn('Could not load muscle id_map.png:', e);
    };
  }, []);

  // Helper to read muscle ID at image coordinates (X, Y) with 8px radius snap
  const getMuscleAtPoint = (imgX, imgY) => {
    const data = idMapDataRef.current;
    if (!data) return null;

    const clampX = Math.max(0, Math.min(imageNaturalWidth - 1, Math.round(imgX)));
    const clampY = Math.max(0, Math.min(imageNaturalHeight - 1, Math.round(imgY)));

    const directIdx = (clampY * imageNaturalWidth + clampX) * 4;
    const directId = data[directIdx]; // 8-bit PNG grayscale value is stored in R channel

    if (directId > 0 && ID_TO_MUSCLE[directId]) {
      return ID_TO_MUSCLE[directId];
    }

    // 8px nearest-muscle snap search
    const radius = 8;
    let closestMuscle = null;
    let closestDistSq = Infinity;

    for (let dy = -radius; dy <= radius; dy++) {
      const ny = clampY + dy;
      if (ny < 0 || ny >= imageNaturalHeight) continue;
      for (let dx = -radius; dx <= radius; dx++) {
        const distSq = dx * dx + dy * dy;
        if (distSq > radius * radius || distSq >= closestDistSq) continue;
        const nx = clampX + dx;
        if (nx < 0 || nx >= imageNaturalWidth) continue;

        const idx = (ny * imageNaturalWidth + nx) * 4;
        const id = data[idx];
        if (id > 0 && ID_TO_MUSCLE[id]) {
          closestMuscle = ID_TO_MUSCLE[id];
          closestDistSq = distSq;
        }
      }
    }

    return closestMuscle;
  };

  // Convert mouse/pointer event to image coordinates
  const pointerToImageCoords = (e) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return null;

    const scaleX = imageNaturalWidth / rect.width;
    const scaleY = imageNaturalHeight / rect.height;

    return {
      imgX: x * scaleX,
      imgY: y * scaleY,
      screenX: e.clientX,
      screenY: e.clientY,
      containerX: x,
      containerY: y,
    };
  };

  // Click / Tap handler
  const handleClick = (e) => {
    const coords = pointerToImageCoords(e);
    if (!coords) return;

    const muscle = getMuscleAtPoint(coords.imgX, coords.imgY);
    if (muscle && onSelectMuscle) {
      onSelectMuscle(muscle);
    }
  };

  // Optimized Pointer Move (Hover) handler throttled with requestAnimationFrame
  const handlePointerMove = (e) => {
    if (rafIdRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        if (currentHoveredRef.current !== null) {
          currentHoveredRef.current = null;
          setHoveredMuscle(null);
          setTooltipPos(prev => ({ ...prev, visible: false }));
        }
        return;
      }

      const scaleX = imageNaturalWidth / rect.width;
      const scaleY = imageNaturalHeight / rect.height;
      const muscle = getMuscleAtPoint(x * scaleX, y * scaleY);

      if (muscle !== currentHoveredRef.current) {
        currentHoveredRef.current = muscle;
        setHoveredMuscle(muscle);
      }

      if (isDebug) {
        setDebugCoords({
          x: Math.round(x * scaleX),
          y: Math.round(y * scaleY),
          muscle: muscle || 'none',
        });
      }

      if (muscle) {
        setTooltipPos({
          x,
          y: y - 12,
          visible: true,
        });
      } else {
        setTooltipPos(prev => (prev.visible ? { ...prev, visible: false } : prev));
      }
    });
  };

  const handlePointerLeave = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    currentHoveredRef.current = null;
    setHoveredMuscle(null);
    setTooltipPos(prev => ({ ...prev, visible: false }));
  };

  // Current muscle soft alpha mask URL
  const selectedMaskUrl = selectedMuscle
    ? `/assets/muscle-map/front/masks/${selectedMuscle.toLowerCase()}.webp`
    : null;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Interactive Map Visual Stage */}
      <div
        ref={containerRef}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] aspect-[1122/1402] cursor-pointer overflow-hidden rounded-2xl touch-manipulation"
        style={{
          // Prevent all scaling, jumping, or transforms on hover
          transform: 'none',
          willChange: 'auto',
        }}
        role="img"
        aria-label={`Interactive human muscle anatomy map. Currently viewing: ${MUSCLE_LABELS[selectedMuscle] || 'None'} selected.`}
      >
        {/* Layer 1: Desaturated Neutral Steel-Grey Base Image */}
        <img
          ref={imgRef}
          src="/assets/muscle-map/front/base_steel.webp"
          alt="Anatomy base figure"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          loading="eager"
          decoding="async"
        />

        {/* Layer 2 & 3: Original Color Muscle Layer Clipped by Selected Soft Alpha Mask + Subtle Glow */}
        {selectedMaskUrl && (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 ease-out"
            style={{
              maskImage: `url(${selectedMaskUrl})`,
              WebkitMaskImage: `url(${selectedMaskUrl})`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              filter: 'drop-shadow(0 0 16px rgba(255, 42, 46, 0.75))',
            }}
          >
            <img
              src="/assets/muscle-map/front/body_color.webp"
              alt="Active muscle highlight"
              className="w-full h-full object-contain filter brightness-[1.12] contrast-[1.08]"
              loading="eager"
              decoding="async"
            />
          </div>
        )}

        {/* Hover Light Tint (Extremely subtle, no zoom or translation) */}
        {hoveredMuscle && hoveredMuscle !== selectedMuscle && (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150"
            style={{
              maskImage: `url(/assets/muscle-map/front/masks/${hoveredMuscle}.webp)`,
              WebkitMaskImage: `url(/assets/muscle-map/front/masks/${hoveredMuscle}.webp)`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
          />
        )}

        {/* Debug Overlay (Only when ?debug=map is present in URL) */}
        {isDebug && (
          <img
            src="/assets/muscle-map/debug/mask_overlay_debug.png"
            alt="Debug alignment overlay"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-40 z-30"
          />
        )}

        {/* Tooltip on Desktop */}
        {tooltipPos.visible && hoveredMuscle && (
          <div
            className="absolute z-40 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide pointer-events-none -translate-x-1/2 -translate-y-full shadow-lg whitespace-nowrap"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            {MUSCLE_LABELS[hoveredMuscle] || hoveredMuscle}
          </div>
        )}
      </div>

      {/* Debug Info Pill */}
      {isDebug && debugCoords && (
        <div className="mt-2 px-3 py-1 rounded-xl bg-black/80 border border-emerald-500/40 font-mono text-[11px] text-emerald-400">
          [DEBUG] X: {debugCoords.x}, Y: {debugCoords.y} | Muscle: <strong>{debugCoords.muscle}</strong>
        </div>
      )}

      {/* Selected Muscle Indicator Label */}
      <div className="mt-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF2A2E] shadow-[0_0_8px_rgba(255,42,46,0.8)]" />
        <span className="text-xs uppercase tracking-wider font-bold text-white">
          {MUSCLE_LABELS[selectedMuscle] || 'Select a muscle'} Selected
        </span>
        <span className="text-white/40 text-xs">• Tap any muscle</span>
      </div>
    </div>
  );
}
