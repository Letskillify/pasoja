import React, { useState, useEffect } from 'react';

const Preloader = ({ onComplete, label = 'Loading', isDataReady }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'ready'

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 60);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const remaining = 100 - prev;
        const step = isDataReady ? 25 : (remaining > 20 ? 14 : 3.5);
        return Math.min(prev + step, 100);
      });
    }, 50);

    return () => {
      clearInterval(timer);
      clearTimeout(contentTimer);
    };
  }, [isDataReady]);

  useEffect(() => {
    if (progress >= 100) {
      setPhase('ready');
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 800);
      }, 350);
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
          className="w-full h-1/2 bg-[#faf9f5]"
          style={{
            transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
            transition: 'transform 800ms cubic-bezier(0.85, 0, 0.15, 1)',
          }}
        />
        {/* Bottom curtain */}
        <div
          className="w-full h-1/2 bg-[#faf9f5]"
          style={{
            transform: isExiting ? 'translateY(100%)' : 'translateY(0%)',
            transition: 'transform 800ms cubic-bezier(0.85, 0, 0.15, 1)',
          }}
        />
      </div>

      {/* Thin horizontal progress bar — top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] z-30">
        <div
          className="h-full bg-black transition-all duration-150 ease-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Corner decorations */}
      <div className="absolute inset-5 md:inset-8 pointer-events-none z-20"
        style={{ opacity: isExiting ? 0 : 1, transition: 'opacity 500ms ease' }}
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-black/10" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-black/10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-black/10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-black/10" />
      </div>

      {/* Central content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
        style={{
          opacity: showContent ? (isExiting ? 0 : 1) : 0,
          transform: showContent ? (isExiting ? 'translateY(-16px)' : 'translateY(0)') : 'translateY(12px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
        }}
      >
        {/* Logo */}
        <div className="mb-10">
          <img
            src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png"
            alt="Pasoja"
            className="h-14 md:h-16 object-cover brightness-0 opacity-90"
          />
        </div>

        {/* SVG Progress Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="44"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="50" cy="50" r="44"
              stroke="rgba(0,0,0,0.9)"
              strokeWidth="1"
              fill="none"
              strokeLinecap="square"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 120ms ease-out' }}
            />
          </svg>
          <span className="text-[22px] font-black text-zinc-900 tabular-nums leading-none tracking-tight">
            {displayProgress}
          </span>
        </div>

        {/* Status text */}
        <div className="h-5 overflow-hidden relative flex items-center justify-center">
          <span
            className="block text-[10px] font-black uppercase tracking-[0.35em] transition-all duration-500"
            style={{
              color: phase === 'ready' ? '#111111' : '#666666',
            }}
          >
            {phase === 'ready' ? 'Ready' : label}
          </span>
        </div>

        {/* Animated dots */}
        {phase === 'loading' && (
          <div className="flex gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-black/30 rounded-full"
                style={{
                  animation: `preloader-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

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