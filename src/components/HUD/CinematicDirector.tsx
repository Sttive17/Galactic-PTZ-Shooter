import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import {
  AlertTriangle,
  Radio,
  CheckCircle2,
  Crosshair,
  Award,
  Zap,
} from 'lucide-react';

export const CinematicDirector = () => {
  const cinematicState = useGameStore((state) => state.cinematicState);
  const activeBossIntro = useGameStore((state) => state.activeBossIntro);
  const finishBossIntro = useGameStore((state) => state.finishBossIntro);
  const finishDeploymentCinematic = useGameStore((state) => state.finishDeploymentCinematic);
  const finishBossVictory = useGameStore((state) => state.finishBossVictory);

  const [bootStep, setBootStep] = useState(0);

  // Auto-advance & duration timers
  useEffect(() => {
    if (cinematicState === 'DEPLOYMENT') {
      const s0 = setTimeout(() => setBootStep(0), 0);
      const s1 = setTimeout(() => setBootStep(1), 500);
      const s2 = setTimeout(() => setBootStep(2), 1100);
      const s3 = setTimeout(() => setBootStep(3), 1700);
      const finishTimer = setTimeout(() => {
        finishDeploymentCinematic();
      }, 2600);

      return () => {
        clearTimeout(s0);
        clearTimeout(s1);
        clearTimeout(s2);
        clearTimeout(s3);
        clearTimeout(finishTimer);
      };
    }

    if (cinematicState === 'BOSS_INTRO') {
      const finishTimer = setTimeout(() => {
        finishBossIntro();
      }, 3400);
      return () => clearTimeout(finishTimer);
    }

    if (cinematicState === 'BOSS_VICTORY') {
      const finishTimer = setTimeout(() => {
        finishBossVictory();
      }, 2400);
      return () => clearTimeout(finishTimer);
    }
  }, [cinematicState, finishBossIntro, finishDeploymentCinematic, finishBossVictory]);

  // Skip controls (Space or Gamepad A)
  useEffect(() => {
    if (cinematicState === 'NONE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (cinematicState === 'DEPLOYMENT') finishDeploymentCinematic();
        else if (cinematicState === 'BOSS_INTRO') finishBossIntro();
        else if (cinematicState === 'BOSS_VICTORY') finishBossVictory();
      }
    };

    let rafId = 0;
    let wasPressed = false;
    const pollGamepad = () => {
      const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp) {
          const aBtn = gp.buttons[0]?.pressed || false;
          if (aBtn && !wasPressed) {
            wasPressed = true;
            if (cinematicState === 'DEPLOYMENT') finishDeploymentCinematic();
            else if (cinematicState === 'BOSS_INTRO') finishBossIntro();
            else if (cinematicState === 'BOSS_VICTORY') finishBossVictory();
          } else if (!aBtn) {
            wasPressed = false;
          }
        }
      }
      rafId = requestAnimationFrame(pollGamepad);
    };

    window.addEventListener('keydown', handleKeyDown);
    rafId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(rafId);
    };
  }, [cinematicState, finishDeploymentCinematic, finishBossIntro, finishBossVictory]);

  if (cinematicState === 'NONE') return null;

  const isBossIntro = cinematicState === 'BOSS_INTRO';
  const isDeployment = cinematicState === 'DEPLOYMENT';
  const isBossVictory = cinematicState === 'BOSS_VICTORY';

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none flex flex-col justify-between overflow-hidden">
      {/* 21:9 Widescreen Cinematic Letterbox Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="w-full h-16 sm:h-20 bg-slate-950/95 border-b border-cyan-500/30 flex items-center justify-between px-8 text-[11px] font-mono tracking-[0.25em]"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${isBossIntro ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          <span className={isBossIntro ? 'text-rose-400 font-bold' : isBossVictory ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
            {isBossIntro ? 'ALERTA DE AMENAZA PRIORITARIA' : isBossVictory ? 'SECTOR ASEGURADO' : 'SECUENCIA DE COMBATE TÁCTICO'}
          </span>
        </div>

        <div className="text-slate-400 hidden sm:flex items-center gap-2">
          <span>[ESPACIO] / (A) SALTAR</span>
        </div>
      </motion.div>

      {/* Center Cinematic Action & Title Cards */}
      <div className="my-auto flex flex-col items-center justify-center p-6 text-center">
        <AnimatePresence mode="wait">
          {/* 1. Deployment Cockpit Telemetry Boot */}
          {isDeployment && (
            <motion.div
              key="deployment"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-4 max-w-lg p-6 rounded-2xl bg-slate-950/70 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_40px_rgba(6,182,212,0.3)]"
            >
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-400 shadow-[0_0_20px_#22d3ee]">
                <Crosshair size={32} className="animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              <div>
                <div className="text-xs font-mono font-bold tracking-[0.35em] text-cyan-400 uppercase">
                  INFILTRACIÓN ORBITAL // COCKPIT MK-V
                </div>
                <h2 className="text-3xl sm:text-4xl font-orbitron font-black text-white tracking-[0.15em] mt-1">
                  PREPARADO PARA EL DESPLIEGUE
                </h2>
              </div>

              {/* Sequential Telemetry Checkpoints */}
              <div className="w-full space-y-2 font-mono text-xs text-left bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className={`flex items-center gap-2 transition-opacity ${bootStep >= 1 ? 'opacity-100 text-emerald-400' : 'opacity-30 text-slate-500'}`}>
                  <CheckCircle2 size={16} />
                  <span>SISTEMA DE VISIÓN PTZ: CALIBRADO (100%)</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity ${bootStep >= 2 ? 'opacity-100 text-emerald-400' : 'opacity-30 text-slate-500'}`}>
                  <CheckCircle2 size={16} />
                  <span>PROPULSORES VECTORIALES: IGNICIÓN LISTA</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity ${bootStep >= 3 ? 'opacity-100 text-cyan-300' : 'opacity-30 text-slate-500'}`}>
                  <Zap size={16} />
                  <span>BLINDAJE Y ARSENAL DE PLASMA: EN LÍNEA</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Menacing Boss Introduction Splash Card */}
          {isBossIntro && activeBossIntro && (
            <motion.div
              key="boss-intro"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="flex flex-col items-center text-center max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/80 text-rose-400 font-mono text-xs font-black tracking-[0.3em] mb-4 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                <AlertTriangle size={16} />
                <span>ADVERTENCIA: TITÁN JEFE CLASE OMEGA</span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-orbitron font-black tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-red-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.7)] uppercase">
                {activeBossIntro.name}
              </h1>

              <div className="mt-3 px-6 py-2 rounded-xl bg-slate-950/80 border border-rose-500/40 backdrop-blur-md">
                <p className="text-sm sm:text-base font-mono font-bold tracking-[0.25em] text-amber-200">
                  {activeBossIntro.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6 text-xs font-mono text-slate-300">
                <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700">
                  TIER DE COMBATE: {activeBossIntro.tier}
                </span>
                <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700">
                  PUNTO DÉBIL: NÚCLEO FRONTAL (CRIT 2.5X)
                </span>
              </div>
            </motion.div>
          )}

          {/* 3. Boss Victory Slow-Mo Screen */}
          {isBossVictory && (
            <motion.div
              key="boss-victory"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center max-w-xl p-8 rounded-2xl bg-slate-950/80 border border-amber-400/80 backdrop-blur-md shadow-[0_0_50px_rgba(251,191,36,0.4)]"
            >
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-400 shadow-[0_0_25px_#f59e0b] mb-4">
                <Award size={40} />
              </div>

              <div className="text-xs font-mono font-bold tracking-[0.35em] text-amber-400 uppercase">
                VICTORIA TÁCTICA // AMENAZA NEUTRALIZADA
              </div>

              <h2 className="text-4xl sm:text-5xl font-orbitron font-black text-white tracking-[0.14em] mt-1">
                TITÁN DESTRUIDO
              </h2>

              <p className="mt-3 text-xs sm:text-sm font-mono text-amber-200/90 tracking-wide">
                GRIETA ESPACIAL ESTABILIZADA · ATRAVIESA EL PORTAL DIMENSIONAL
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 21:9 Widescreen Cinematic Letterbox Bottom Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="w-full h-16 sm:h-20 bg-slate-950/95 border-t border-cyan-500/30 flex items-center justify-between px-8 text-[11px] font-mono tracking-[0.25em]"
      >
        <div className="text-slate-500 font-bold flex items-center gap-2">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span>CANAL DE COMUNICACIÓN // ALMIRANTAL 01</span>
        </div>

        <div className="text-cyan-400 font-bold">
          <span>SISTEMA EN DIRECTO</span>
        </div>
      </motion.div>
    </div>
  );
};
