import { AnimatePresence, motion } from 'framer-motion';
import { Skull, Shield } from 'lucide-react';
import { useGameStore } from '../../game/gameState';

export const BossBar = () => {
  const bossInfo = useGameStore((state) => state.bossInfo);
  const lastDamageTime = useGameStore((state) => state.lastDamageTime);

  const pct =
    bossInfo && bossInfo.maxHealth > 0
      ? Math.max(0, Math.min(100, (bossInfo.health / bossInfo.maxHealth) * 100))
      : 0;
  const isShielded = Boolean(bossInfo?.shielded);
  const gensLeft = bossInfo?.generatorsRemaining ?? 0;

  return (
    <>
      {/* Full-screen radial red damage flash when player is hit */}
      <AnimatePresence>
        {lastDamageTime > 0 && (
          <motion.div
            key={lastDamageTime}
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: 'radial-gradient(circle, rgba(225,29,72,0) 45%, rgba(225,29,72,0.68) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Sleek Top-center Boss Health / Shield Bar */}
      <AnimatePresence>
        {bossInfo && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-md px-4"
          >
            <div
              className={`px-3.5 py-2 rounded-lg backdrop-blur-md border transition-colors ${
                isShielded
                  ? 'bg-slate-950/60 border-cyan-400/45 shadow-[0_0_20px_rgba(34,211,238,0.22)]'
                  : 'bg-slate-950/60 border-rose-500/45 shadow-[0_0_20px_rgba(225,29,72,0.22)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-orbitron font-bold tracking-[0.16em] ${
                    isShielded ? 'text-cyan-300' : 'text-rose-300'
                  }`}
                >
                  {isShielded ? (
                    <Shield size={13} className="text-cyan-400" />
                  ) : (
                    <Skull size={13} className="text-rose-400" />
                  )}
                  <span>{bossInfo.name}</span>
                </div>
                <span className="text-[11px] font-orbitron font-bold text-slate-100">
                  {Math.ceil(bossInfo.health)} / {bossInfo.maxHealth}
                </span>
              </div>

              {isShielded && (
                <div className="text-[9px] font-mono font-semibold tracking-[0.14em] text-cyan-300 mb-1">
                  ESCUDO INVULNERABLE — DESTRUYE {gensLeft} GENERADOR(ES)
                </div>
              )}

              <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    isShielded
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-300'
                      : 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-400'
                  }`}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'tween', duration: 0.15 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
