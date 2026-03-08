
import React, { useEffect, useRef, useState } from 'react';

interface HandTrackerProps {
  onHandUpdate: (count: number) => void;
  onReady: () => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, onReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState<string>('INIT');
  const onHandUpdateRef = useRef(onHandUpdate);
  onHandUpdateRef.current = onHandUpdate;

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 320;
    canvas.height = 240;

    let camera: any = null;
    let hands: any = null;
    let destroyed = false;

    const init = async () => {
      // 1. Wait for MediaPipe CDN scripts
      setStatus('LOADING MEDIAPIPE...');
      const deadline = Date.now() + 15000;
      while (!(window as any).Hands || !(window as any).Camera) {
        if (Date.now() > deadline) {
          setStatus('ERR: MEDIAPIPE LOAD TIMEOUT');
          onReady();
          return;
        }
        await new Promise(r => setTimeout(r, 200));
      }
      if (destroyed) return;

      // 2. Init Hands
      setStatus('INIT HANDS MODEL...');
      try {
        hands = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });

        let resultCount = 0;
        hands.onResults((results: any) => {
          if (destroyed) return;
          resultCount++;
          const landmarks = results.multiHandLandmarks;
          const count = landmarks?.length ?? 0;
          onHandUpdateRef.current(count);

          if (resultCount <= 3 || resultCount % 30 === 0) {
            setStatus(`TRACKING [${count} hand${count !== 1 ? 's' : ''}] f:${resultCount}`);
          }

          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (landmarks) {
              landmarks.forEach((lm: any) => {
                ctx.fillStyle = '#fbbf24';
                lm.forEach((pt: any, idx: number) => {
                  if (idx % 4 === 0) {
                    ctx.beginPath();
                    ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, Math.PI * 2);
                    ctx.fill();
                  }
                });
              });
            }
          }
        });

        // 3. Init camera
        setStatus('STARTING CAMERA...');
        camera = new (window as any).Camera(videoRef.current!, {
          onFrame: async () => {
            if (!destroyed && videoRef.current && hands) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 320,
          height: 240,
        });

        await camera.start();
        if (destroyed) return;
        setStatus('CAMERA ACTIVE — WAITING FOR HANDS');
        onReady();
      } catch (err: any) {
        setStatus(`ERR: ${err.message || err}`);
        onReady();
      }
    };

    init();

    return () => {
      destroyed = true;
      try { if (camera) camera.stop(); } catch {}
      try { if (hands) hands.close(); } catch {}
    };
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 transition-all duration-500 ease-in-out z-40
      ${isMinimized ? 'w-12 h-12 overflow-hidden' : 'w-64 h-48'}
      bg-black border-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] rounded-lg group`}>

      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute top-1 right-1 z-50 p-1 text-amber-500 hover:text-white transition-colors"
      >
        {isMinimized ? (
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        ) : (
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        )}
      </button>

      {!isMinimized && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400 -m-1"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400 -m-1"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400 -m-1"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400 -m-1"></div>
          <div className="absolute -top-6 left-0 text-[10px] text-amber-500 font-mono tracking-tighter opacity-70">
            KINETIC_FLOW_SENSOR // {status}
          </div>
        </>
      )}

      <video
        ref={videoRef}
        className={`w-full h-full object-cover grayscale brightness-125 contrast-125 sepia-[0.3] ${isMinimized ? 'opacity-0' : 'opacity-100'}`}
        playsInline
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none ${isMinimized ? 'hidden' : 'block'}`}
      />

      {isMinimized && (
        <div className="w-full h-full flex items-center justify-center bg-amber-950/30">
           <svg className="w-6 h-6 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </div>
      )}
    </div>
  );
};

export default HandTracker;
