
import React, { useState, useEffect } from 'react';

const Loader: React.FC = () => {
  const [text, setText] = useState("");
  const messages = [
    "> INITIALIZING_RAIN_CORE_OS...",
    "> SYNCING_ENERGY_LATTICE...",
    "> CALIBRATING_AMBER_PARTICLES...",
    "> STABILIZING_GRAVITY_FIELD...",
    "> SYSTEM_READY."
  ];

  useEffect(() => {
    let currentIdx = 0;
    let charIdx = 0;
    
    const interval = setInterval(() => {
      if (currentIdx < messages.length) {
        const currentMsg = messages[currentIdx];
        if (charIdx <= currentMsg.length) {
          setText(prev => prev + currentMsg[charIdx]);
          charIdx++;
        } else {
          setText(prev => prev + "\n");
          currentIdx++;
          charIdx = 0;
        }
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-mono">
      <div className="w-full max-w-lg p-8">
        <pre className="text-amber-500 whitespace-pre-wrap text-sm leading-relaxed">
          {text}
          <span className="animate-pulse">_</span>
        </pre>
        
        <div className="mt-12 w-full h-1 bg-amber-950 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-amber-400 animate-[loading_2s_ease-in-out_infinite]" 
               style={{ width: '30%' }} />
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
