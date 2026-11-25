import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import { CHAPTER_META } from '../../game/mapGenerator';
import { SceneState } from '../../game/sceneState';
import { GalaxySparkIcon, OrbitalLinkIcon, IconBadge } from './SciFiIcons';
import { playSound } from '../../game/AudioSystem';

const WARP_RAYS = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * 360,
  delay: (i % 6) * 0.08,
  length: 140 + (i % 3) * 80,
}));

export const PortalCinematic = () => {
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);
  const portalTransition = useGameStore((state) => state.portalTransition);
  const commitPortalArrival = useGameStore((state) => state.commitPortalArrival);
  const finishPortalCinematic = useGameStore((state) => state.finishPortalCinematic);

  const distRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<'WARP' | 'ARRIVAL'>('WARP');
  const arrivalCommittedRef = useRef(false);

  // Update live distance to portal without triggering React re-renders
  useEffect(() => {
    if (roundState !== 'PORTAL_ACTIVE') return;
    let rafId = 0;
    const tick = () => {
      if (distRef.current) {
        distRef.current.textContent = `${Math.max(0, Math.round(SceneState.portalDistance))}m`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [roundState]);

  // Orchestrate 3.6s Warp Cinematic: 0..1.1s Hyperspace Warp -> commitPortalArrival -> 1.1..3.6s Chapter Title Card
  useEffect(() => {
    if (roundState !== 'WARP_CINEMATIC') {
      arrivalCommittedRef.current = false;
      return;
    }

    arrivalCommittedRef.current = false;

    const commitTimer = window.setTimeout(() => {
      arrivalCommittedRef.current = true;
      commitPortalArrival();
      setPhase('ARRIVAL');
      playSound('ui');
    }, 1100);

    const endTimer = window.setTimeout(() => {
      setPhase('WARP');
      finishPortalCinematic();
    }, 3600);

    const onSkipKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && arrivalCommittedRef.current) {
        e.preventDefault();
        setPhase('WARP');
        finishPortalCinematic();
      }
    };
    window.addEventListener('keydown', onSkipKey);

    return () => {
      window.clearTimeout(commitTimer);
      window.clearTimeout(endTimer);
      window.removeEventListener('keydown', onSkipKey);
    };
  }, [roundState, commitPortalArrival, finishPortalCinematic]);

  if (mode !== 'CHALLENGE' && mode !== 'TRAINING') return null;

  const destMeta = portalTransition
    ? CHAPTER_META[portalTransition.toChapter]
    : CHAPTER_META.GALACTIC_ARENA;

  return (
    <AnimatePresence>
      {/* Active Dimensional Portal Waypoint Prompt */}
      {roundState === 'PORTAL_ACTIVE' && (
        <motion.div
          key="portal-prompt"
          initial={{ y: -24, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="pointer-events-none fixed top-14 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5"
        >
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-950/75 backdrop-blur-md border shadow-[0_0_28px_rgba(34,211,238,0.28)]"
            style={{ borderColor: `${destMeta.accentHex}99` }}
          >
            <IconBadge accent="cyan" size="sm" shape="hex">
              <GalaxySparkIcon size={14} />
            </IconBadge>

            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono font-bold tracking-[0.26em] text-amber-300">
                JEFE DERROTADO · PORTAL DIMENSIONAL ABIERTO
              </span>
              <span className="text-xs font-orbitron font-black tracking-[0.14em] text-white">
                CAPÍTULO {destMeta.roman}: {destMeta.name}
              </span>
            </div>

            <div className="ml-2 pl-3 border-l border-white/15 flex flex-col items-end">
              <span className="text-[9px] font-mono text-slate-400">DISTANCIA</span>
              <span
                ref={distRef}
                className="text-sm font-orbitron font-black"
                style={{ color: destMeta.accentHex }}
              >
                24m
              </span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-950/70 border border-white/15 text-[10px] font-mono font-bold tracking-[0.22em] text-cyan-200 animate-pulse">
            CRUZA EL PORTAL CENTRAL O PRESIONA [E]
          </div>
        </motion.div>
      )}

      {/* Fullscreen Hyperspace Warp & Chapter Arrival Cinematic */}
      {roundState === 'WARP_CINEMATIC' && (
        <motion.div
          key="warp-cinematic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => {
            if (arrivalCommittedRef.current) finishPortalCinematic();
          }}
          className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden pointer-events-auto select-none"
        >
          {/* Hyperspace Tunnel Streaks during first 1.1s */}
          {phase === 'WARP' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1.9, opacity: 1 }}
                transition={{ duration: 1.05, ease: 'easeIn' }}
                className="relative w-80 h-80 flex items-center justify-center"
              >
                <div
                  className="absolute inset-0 rounded-full border-4 blur-[1px]"
                  style={{
                    borderColor: destMeta.accentHex,
                    boxShadow: `0 0 90px ${destMeta.accentHex}`,
                  }}
                />
                {WARP_RAYS.map((ray, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scaleX: 0.2, opacity: 0 }}
                    animate={{ scaleX: 2.2, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.75, delay: ray.delay, repeat: Infinity }}
                    className="absolute h-0.5 origin-left rounded-full"
                    style={{
                      width: `${ray.length}px`,
                      background: `linear-gradient(90deg, transparent, ${destMeta.accentHex}, #ffffff)`,
                      transform: `rotate(${ray.angle}deg) translateX(35px)`,
                    }}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-16 px-5 py-2 rounded-full bg-slate-950/75 border border-white/20 text-xs font-orbitron font-bold tracking-[0.28em] text-white"
              >
                SALTO DIMENSIONAL // TELETRANSPORTANDO...
              </motion.div>
            </div>
          )}

          {/* Bright Conversion Flash at 1.1s Moment of Arrival */}
          {phase === 'ARRIVAL' && (
            <>
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 bg-white z-40"
              />

              {/* Top Letterbox Cinema Bar */}
              <motion.div
                initial={{ y: '-100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full h-[11vh] bg-slate-950/95 border-b border-white/10 flex items-center justify-between px-8 z-20"
              >
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.28em] text-slate-400">
                  <OrbitalLinkIcon size={14} className="text-cyan-400" />
                  <span>SECUENCIA DE DESPLIEGUE INTER-BIOMA</span>
                </div>
                <span className="text-[10px] font-mono tracking-[0.26em] text-slate-400">
                  NIVEL {portalTransition?.nextLevel ?? ''}
                </span>
              </motion.div>

              {/* Center Chapter Arrival Title Showcase (translucent so new 3D world is visible) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="my-auto mx-auto max-w-4xl px-8 py-7 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 text-center z-20 shadow-[0_0_60px_rgba(2,6,23,0.75)]"
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950/85 border text-[11px] font-mono font-bold tracking-[0.34em] mb-4"
                  style={{ borderColor: `${destMeta.accentHex}88`, color: destMeta.accentHex }}
                >
                  <GalaxySparkIcon size={13} />
                  <span>CAPÍTULO {destMeta.roman} // {destMeta.rangeLabel}</span>
                </div>

                <h1
                  className="text-3xl sm:text-5xl md:text-6xl font-orbitron font-black tracking-[0.14em] text-white"
                  style={{ textShadow: `0 0 32px ${destMeta.accentHex}88` }}
                >
                  {destMeta.name}
                </h1>

                <div
                  className="w-48 h-0.5 mx-auto my-4 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${destMeta.accentHex}, transparent)` }}
                />

                <p className="text-xs sm:text-sm font-mono font-semibold tracking-[0.28em] text-slate-200">
                  {destMeta.cinematicQuote}
                </p>
              </motion.div>

              {/* Bottom Letterbox Cinema Bar */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full h-[11vh] bg-slate-950/95 border-t border-white/10 flex items-center justify-center z-20"
              >
                <span className="text-[10px] font-mono tracking-[0.3em] text-slate-400">
                  [ESPACIO] O CLICK PARA CONTINUAR
                </span>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
