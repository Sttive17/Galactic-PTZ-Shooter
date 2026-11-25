import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Skull, Zap } from 'lucide-react';
import { useGameStore } from '../../game/gameState';

export const WaveBanner = () => {
  const waveBanner = useGameStore((state) => state.waveBanner);
  const clearWaveBanner = useGameStore((state) => state.clearWaveBanner);

  useEffect(() => {
    if (!waveBanner) return;
    const timer = window.setTimeout(() => {
      clearWaveBanner();
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [waveBanner, clearWaveBanner]);

  return (
    <AnimatePresence>
      {waveBanner && (
        <motion.div
          key={`wave-banner-${waveBanner.wave}`}
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center text-center"
        >
          <div className="px-5 py-2 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-3">
            {waveBanner.isBoss ? (
              <Skull size={18} className="text-rose-400" />
            ) : (
              <Zap size={18} className="text-cyan-400" />
            )}
            <span
              className={`text-lg md:text-xl font-orbitron font-black tracking-[0.16em] ${
                waveBanner.isBoss ? 'text-rose-300' : 'text-cyan-300'
              }`}
            >
              OLEADA {waveBanner.wave}
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              {waveBanner.isBoss ? '· AMENAZA JEFE' : '· ENEMIGOS ENTRANTES'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
