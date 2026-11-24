import { useEffect, useState } from 'react';

export const FpsCounter = () => {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let rafId = 0;
    let frameCount = 0;
    let lastSampleTime = performance.now();

    const tick = (now: number) => {
      frameCount += 1;
      const elapsed = now - lastSampleTime;

      if (elapsed >= 500) {
        const nextFps = Math.round((frameCount * 1000) / elapsed);
        setFps(nextFps);
        frameCount = 0;
        lastSampleTime = now;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const isGood = fps >= 50;
  const isOk = fps >= 30 && fps < 50;

  const textStyle = isGood ? 'text-emerald-300' : isOk ? 'text-amber-300' : 'text-rose-300';
  const dotStyle = isGood
    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
    : isOk
      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]'
      : 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.9)]';

  return (
    <div className="absolute top-12 left-5 z-30 pointer-events-none opacity-80">
      <div className="px-2 py-0.5 rounded-full bg-slate-950/50 backdrop-blur-sm border border-white/10 text-[10px] font-mono font-semibold flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
        <span className={textStyle}>{fps} FPS</span>
      </div>
    </div>
  );
};
