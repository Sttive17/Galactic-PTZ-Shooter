import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Skull, Zap } from 'lucide-react';
import { useGameStore } from '../../game/gameState';

export const WaveBanner = () => {
  const waveBanner = useGameStore((state) => state.waveBanner);
  const clearWaveBanner = useGameStore((state) => state.clearWaveBanner);
  const hasBossBar = useGameStore((state) => Boolean(state.bossInfo));

  useEffect(() => {
    if (!waveBanner) return;
    const timer = window.setTimeout(() => {
      clearWaveBanner();
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [waveBanner, clearWaveBanner]);

  return (
    <AnimatePresence>
      {waveBanner && (
        <motion.div
          key={`wave-banner-${waveBanner.wave}`}
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.08, y: -12 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className={`fixed ${hasBossBar ? 'top-[34%]' : 'top-[28%]'} left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center text-center`}
        >
          {/* Expanding Top Neon Sweep Line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`w-64 h-[2px] mb-3 rounded-full ${
              waveBanner.isBoss
                ? 'bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_16px_rgba(244,63,94,0.9)]'
                : 'bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_16px_rgba(34,211,238,0.9)]'
            }`}
          />

          <div className="px-8 py-3 rounded-xl bg-slate-950/65 backdrop-blur-md border border-white/15 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col items-center">
            <div className="flex items-center gap-2.5">
              {waveBanner.isBoss ? (
                <Skull size={22} className="text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
              ) : (
                <Zap size={22} className="text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              )}
              <span
                className={`text-4xl md:text-5xl font-orbitron font-black tracking-[0.22em] text-transparent bg-clip-text ${
                  waveBanner.isBoss
                    ? 'bg-gradient-to-r from-rose-200 via-orange-200 to-rose-400'
                    : 'bg-gradient-to-r from-emerald-200 via-cyan-200 to-sky-400'
                }`}
              >
                OLEADA {waveBanner.wave}
              </span>
            </div>

            <div
              className={`mt-1.5 text-[11px] font-mono font-bold tracking-[0.28em] animate-pulse ${
                waveBanner.isBoss ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              {waveBanner.isBoss ? '⚠ OLEADA DE JEFE + ESCOLTA' : '¡PREPÁRATE! ENEMIGOS ENTRANTES'}
            </div>
          </div>

          {/* Expanding Bottom Neon Sweep Line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
            className={`w-64 h-[2px] mt-3 rounded-full ${
              waveBanner.isBoss
                ? 'bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_16px_rgba(244,63,94,0.9)]'
                : 'bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_16px_rgba(34,211,238,0.9)]'
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
