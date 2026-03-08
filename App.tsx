
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import RainCanvas from './components/RainCanvas';
import HandTracker from './components/HandTracker';
import HUD from './components/HUD';
import Loader from './components/Loader';
import { RainMode } from './types';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [keyOverride, setKeyOverride] = useState<number | null>(null);
  const modeRef = useRef<RainMode>(RainMode.NORMAL);

  // Keyboard controls: press 0, 1, 2 to override mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0') setKeyOverride(0);
      else if (e.key === '1') setKeyOverride(1);
      else if (e.key === '2') setKeyOverride(2);
      else if (e.key === 'Escape') setKeyOverride(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const effectiveHandCount = keyOverride !== null ? keyOverride : handCount;

  const currentMode = useMemo(() => {
    if (effectiveHandCount === 0) return RainMode.NORMAL;
    if (effectiveHandCount === 1) return RainMode.SUSPENDED;
    return RainMode.REVERSE;
  }, [effectiveHandCount]);

  // Keep ref in sync for the animation loop
  modeRef.current = currentMode;

  const handleTrackerReady = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {!isLoaded && <Loader />}

      <RainCanvas modeRef={modeRef} />

      <HandTracker
        onHandUpdate={setHandCount}
        onReady={handleTrackerReady}
      />

      <HUD
        handCount={effectiveHandCount}
        currentMode={currentMode}
      />

      <div className="absolute bottom-4 left-4 text-amber-500/30 text-[10px] uppercase tracking-widest pointer-events-none">
        Amber Core OS v1.2.0 // Neural Interface Confirmed
        {keyOverride !== null && ' // KEY OVERRIDE ACTIVE (ESC to reset)'}
      </div>
    </div>
  );
};

export default App;
