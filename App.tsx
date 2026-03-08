
import React, { useState, useRef, useCallback, useMemo } from 'react';
import RainCanvas from './components/RainCanvas';
import HandTracker from './components/HandTracker';
import HUD from './components/HUD';
import Loader from './components/Loader';
import { RainMode } from './types';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const modeRef = useRef<RainMode>(RainMode.NORMAL);

  // Derive mode from handCount (computed during render, not in useEffect)
  const currentMode = useMemo(() => {
    if (handCount === 0) return RainMode.NORMAL;
    if (handCount === 1) return RainMode.SUSPENDED;
    return RainMode.REVERSE;
  }, [handCount]);

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
        handCount={handCount}
        currentMode={currentMode}
      />

      <div className="absolute bottom-4 left-4 text-amber-500/30 text-[10px] uppercase tracking-widest pointer-events-none">
        Amber Core OS v1.2.0 // Neural Interface Confirmed
      </div>
    </div>
  );
};

export default App;
