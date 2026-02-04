
import React, { useState, useRef, useEffect, useCallback } from 'react';
import RainCanvas from './components/RainCanvas';
import HandTracker from './components/HandTracker';
import HUD from './components/HUD';
import Loader from './components/Loader';
import { RainMode } from './types';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const modeRef = useRef<RainMode>(RainMode.NORMAL);

  // Sync mode based on hand count
  useEffect(() => {
    if (handCount === 0) {
      modeRef.current = RainMode.NORMAL;
    } else if (handCount === 1) {
      modeRef.current = RainMode.SUSPENDED;
    } else if (handCount >= 2) {
      modeRef.current = RainMode.REVERSE;
    }
  }, [handCount]);

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
        currentMode={modeRef.current} 
      />

      <div className="absolute bottom-4 left-4 text-amber-500/30 text-[10px] uppercase tracking-widest pointer-events-none">
        Amber Core OS v1.2.0 // Neural Interface Confirmed
      </div>
    </div>
  );
};

export default App;
