import React, { useState, useEffect } from 'react';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'ready'

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 80);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const remaining = 100 - prev;
        const increment = Math.random() * (remaining > 20 ? 13 : 1.8);
        return Math.min(prev + increment, 100);
      });
    }, 75);

    return () => {
      clearInterval(timer);
      clearTimeout(contentTimer);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setPhase('ready');
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1000);
      }, 600);
      return () => clearTimeout(exitTimer);
    }
  }, [progress, onComplete]);

  const displayProgress = Math.floor(Math.min(progress, 100));

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden" style={{ pointerEvents: isExiting ? 'none' : 'auto' }}>

      {/* Split curtain panels */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top curtain */}
        <div
          className="w-full h-1/2 bg-[#080808]"
          style={{
            transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
            transition: 'transform 1000ms cubic-bezier(0.85, 0, 0.15, 1)',
          }}
        />
        {/* Bottom curtain */}
        <div
          className="w-full h-1/2 bg-[#080808]"
          style={{
            transform: isExiting ? 'translateY(100%)' : 'translateY(0%)',
            transition: 'transform 1000ms cubic-bezier(0.85, 0, 0.15, 1)',
          }}
        />
      </div>

      {/* Thin horizontal progress bar — top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] z-30">
        <div
          className="h-full bg-white transition-all duration-150 ease-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Corner decorations */}
      <div className="absolute inset-5 md:inset-8 pointer-events-none z-20"
        style={{ opacity: isExiting ? 0 : 1, transition: 'opacity 600ms ease' }}
      >
        {/* TL */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10" />
        {/* TR */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10" />
        {/* BL */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10" />
        {/* BR */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10" />
      </div>

      {/* Central content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
        style={{
          opacity: showContent ? (isExiting ? 0 : 1) : 0,
          transform: showContent ? (isExiting ? 'translateY(-16px)' : 'translateY(0)') : 'translateY(12px)',
          transition: 'opacity 700ms ease, transform 700ms ease',
        }}
      >
        {/* Logo */}
        <div className="mb-10">
          <img
            src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png"
            alt="Pasoja"
            className="h-14 md:h-16 object-contain brightness-0 invert opacity-90"
          />
        </div>

        {/* SVG Progress Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Track */}
            <circle
              cx="50" cy="50" r="44"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              fill="none"
            />
            {/* Progress */}
            <circle
              cx="50" cy="50" r="44"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1"
              fill="none"
              strokeLinecap="square"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 150ms ease-out' }}
            />
          </svg>
          {/* Counter */}
          <span className="text-[22px] font-black text-white tabular-nums leading-none tracking-tight"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {displayProgress}
          </span>
        </div>

        {/* Status text */}
        <div className="h-5 overflow-hidden relative flex items-center justify-center">
          <span
            className="block text-[10px] font-black uppercase tracking-[0.35em] transition-all duration-500"
            style={{
              color: phase === 'ready' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
              transform: phase === 'ready' ? 'translateY(0)' : 'translateY(0)',
            }}
          >
            {phase === 'ready' ? 'Ready' : 'Loading'}
          </span>
        </div>

        {/* Animated dots */}
        {phase === 'loading' && (
          <div className="flex gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-white/20 rounded-full"
                style={{
                  animation: `preloader-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inline keyframe */}
      <style>{`
        @keyframes preloader-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scaleY(1); }
          40% { opacity: 1; transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
};

export default Preloader;