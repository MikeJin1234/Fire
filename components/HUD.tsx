
import React, { useMemo } from 'react';
import { RainMode } from '../types';

interface HUDProps {
  handCount: number;
  currentMode: RainMode;
}

const HUD: React.FC<HUDProps> = ({ handCount, currentMode }) => {
  const statusInfo = useMemo(() => {
    switch (currentMode) {
      case RainMode.NORMAL:
        return {
          label: "STABLE GRAVITY",
          desc: "NEURAL FLOW SYNCHRONIZED",
          color: "text-amber-400",
          border: "border-amber-500",
          bg: "bg-amber-500/10"
        };
      case RainMode.SUSPENDED:
        return {
          label: "TIME SUSPENSION",
          desc: "KINETIC STASIS ACTIVE",
          color: "text-white",
          border: "border-white",
          bg: "bg-white/10"
        };
      case RainMode.REVERSE:
        return {
          label: "POLARITY INVERSION",
          desc: "ANTI-GRAVITY OVERRIDE",
          color: "text-orange-500",
          border: "border-orange-500",
          bg: "bg-orange-500/10"
        };
    }
  }, [currentMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 font-mono">
      <div className={`absolute top-10 left-10 p-4 border-l-4 ${statusInfo.border} ${statusInfo.bg} backdrop-blur-sm transition-all duration-300`}>
        <div className="flex items-center space-x-2 mb-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${statusInfo.color.replace('text', 'bg')}`} />
          <h1 className={`text-xl font-bold tracking-tighter ${statusInfo.color}`}>
            SYSTEM: {statusInfo.label}
          </h1>
        </div>
        <p className="text-[10px] text-amber-200/60 opacity-80 mb-2">{statusInfo.desc}</p>
        
        <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] text-amber-500/50 uppercase">
          <div>Sensors Detected: <span className={statusInfo.color}>{handCount}</span></div>
          <div>Energy Output: 88.5%</div>
          <div>Field Sync: 1:1</div>
          <div>Signal: STRONG</div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
         <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-amber-500">
           <path d="M100 0H70M100 0V30" strokeWidth="1" />
           <path d="M100 0L80 20" strokeWidth="0.5" />
         </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 pointer-events-none rotate-180">
         <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-amber-500">
           <path d="M100 0H70M100 0V30" strokeWidth="1" />
           <path d="M100 0L80 20" strokeWidth="0.5" />
         </svg>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center transition-opacity duration-1000">
        <div className="flex space-x-8 text-[11px] tracking-widest uppercase text-white/40">
           <div className={handCount === 0 ? "text-amber-400 animate-pulse scale-110" : ""}>[0] NORMAL</div>
           <div className={handCount === 1 ? "text-white animate-pulse scale-110" : ""}>[1] SUSPEND</div>
           <div className={handCount >= 2 ? "text-orange-500 animate-pulse scale-110" : ""}>[2] REVERSE</div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
