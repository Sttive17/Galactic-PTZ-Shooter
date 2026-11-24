import { useEffect, useRef, useState } from 'react';
import { useGameStore, getRoundTotalTargets } from '../../game/gameState';
import { SceneState } from '../../game/sceneState';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
  ShieldCoreIcon,
  VitalCoreIcon,
  SprintBoltIcon,
} from './SciFiIcons';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

type StaminaStatus = 'READY' | 'SPRINTING' | 'EXHAUSTED';

export const ScoreBoard = () => {
  const score = useGameStore((state) => state.score);
  const combo = useGameStore((state) => state.combo);
  const shots = useGameStore((state) => state.shots);
  const hits = useGameStore((state) => state.hits);
  const timeRemaining = useGameStore((state) => Math.ceil(state.timeRemaining));
  const mode = useGameStore((state) => state.mode);
  const currentRound = useGameStore((state) => state.currentRound);
  const targetsDestroyed = useGameStore((state) => state.targetsDestroyed);
  const playerShield = useGameStore((state) => state.playerShield);
  const maxPlayerShield = useGameStore((state) => state.maxPlayerShield);
  const playerHealth = useGameStore((state) => state.playerHealth);
  const maxPlayerHealth = useGameStore((state) => state.maxPlayerHealth);

  const sprintBarRef = useRef<HTMLDivElement>(null);
  const sprintPctRef = useRef<HTMLSpanElement>(null);

  const [sprintStatus, setSprintStatus] = useState<StaminaStatus>('READY');

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      // Sprint telemetry
      const pct = Math.max(0, Math.min(100, SceneState.stamina));
      if (sprintBarRef.current) {
        sprintBarRef.current.style.width = `${pct}%`;
      }
      if (sprintPctRef.current) {
        sprintPctRef.current.textContent = `${Math.round(pct)}%`;
      }
      const nextSprint: StaminaStatus = SceneState.isExhausted
        ? 'EXHAUSTED'
        : SceneState.isSprintingNow
          ? 'SPRINTING'
          : 'READY';
      setSprintStatus((prev) => (prev === nextSprint ? prev : nextSprint));

      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const accuracy = shots > 0 ? Math.min(100, (hits / shots) * 100).toFixed(0) : '0';
  const totalTargets = getRoundTotalTargets(mode, currentRound);
  const shieldPct = Math.max(0, Math.min(100, (playerShield / maxPlayerShield) * 100));
  const healthPct = Math.max(0, Math.min(100, (playerHealth / maxPlayerHealth) * 100));
  const isShieldBroken = playerShield <= 0;
  const isLowHealth = healthPct < 35;

  const animatedScore = useSpring(0, { stiffness: 55, damping: 16 });
  useEffect(() => {
    animatedScore.set(score);
  }, [score, animatedScore]);
  const displayScore = useTransform(animatedScore, (latest) => Math.round(latest).toLocaleString());

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute top-12 right-5 flex flex-col gap-2 pointer-events-none z-10 w-52 max-lg:left-2 max-lg:right-auto max-lg:w-40 max-lg:scale-75 max-lg:origin-top-left"
    >
      {/* Card 1: Score & Compact Mission Readout */}
      <div className="bg-slate-950/50 backdrop-blur-md border border-white/10 rounded-lg px-3.5 py-2.5 relative">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
          <span className="tracking-[0.16em]">OBJ {targetsDestroyed}/{totalTargets}</span>
          <AnimatePresence>
            {combo > 1 && (
              <motion.span
                key={combo}
                initial={{ scale: 1.25, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-0.5 text-amber-300 font-orbitron font-bold"
              >
                <SprintBoltIcon size={11} className="drop-shadow-[0_0_6px_rgba(251,191,36,0.75)]" /> x{combo}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="text-2xl font-orbitron font-black text-white tracking-wide leading-tight">
          {displayScore}
        </motion.div>

        <div className="mt-2 pt-1.5 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{mode === 'CHALLENGE' ? 'TIEMPO' : 'OLEADA'}</span>
            <span
              className={`font-orbitron font-bold ${
                mode === 'CHALLENGE'
                  ? timeRemaining < 10
                    ? 'text-rose-400 animate-pulse'
                    : 'text-slate-100'
                  : 'text-emerald-300'
              }`}
            >
              {mode === 'CHALLENGE' ? formatTime(timeRemaining) : `#${currentRound}`}
            </span>
          </div>
          <div className="flex items-center justify-between border-l border-white/10 pl-2">
            <span className="text-slate-400">PREC</span>
            <span className={`font-orbitron font-bold ${Number(accuracy) >= 75 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Unified Vitals Readout */}
      <div className="bg-slate-950/50 backdrop-blur-md border border-white/10 rounded-lg px-3.5 py-2.5 flex flex-col gap-2">
        {/* Shield */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className={`flex items-center gap-1.5 font-semibold tracking-wider ${isShieldBroken ? 'text-rose-400' : 'text-cyan-300'}`}>
              <ShieldCoreIcon size={12} className="drop-shadow-[0_0_6px_currentColor]" /> ESCUDO
            </span>
            <span className="font-orbitron font-bold text-slate-100">
              {Math.ceil(playerShield)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                isShieldBroken ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-400 to-cyan-300'
              }`}
              style={{ width: `${shieldPct}%` }}
            />
          </div>
        </div>

        {/* Health */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className={`flex items-center gap-1.5 font-semibold tracking-wider ${isLowHealth ? 'text-rose-400 animate-pulse' : 'text-emerald-300'}`}>
              <VitalCoreIcon size={12} className="drop-shadow-[0_0_6px_currentColor]" /> VIDA
            </span>
            <span className="font-orbitron font-bold text-slate-100">
              {Math.ceil(playerHealth)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                isLowHealth ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-green-300'
              }`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>

        {/* Sprint */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span
              className={`flex items-center gap-1.5 font-semibold tracking-wider ${
                sprintStatus === 'EXHAUSTED'
                  ? 'text-orange-400 animate-pulse'
                  : sprintStatus === 'SPRINTING'
                    ? 'text-amber-300'
                    : 'text-sky-300'
              }`}
            >
              <SprintBoltIcon size={12} className="drop-shadow-[0_0_6px_currentColor]" /> SPRINT
            </span>
            <span ref={sprintPctRef} className="font-orbitron font-bold text-slate-100">
              100%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden">
            <div
              ref={sprintBarRef}
              className={`h-full transition-colors duration-150 ${
                sprintStatus === 'EXHAUSTED'
                  ? 'bg-orange-500'
                  : sprintStatus === 'SPRINTING'
                    ? 'bg-amber-300'
                    : 'bg-sky-400'
              }`}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
