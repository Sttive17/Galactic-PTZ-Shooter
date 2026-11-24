import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import { useGamepad } from '../../hooks/useGamepad';
import { useGamepadMenu } from '../../hooks/useGamepadMenu';
import { getDeviceProfile } from '../../game/deviceProfile';
import { POWERS_CATALOG } from '../../game/powers';
import type { PowerId, PowerDefinition } from '../../game/powers';
import { playSound, initAudio } from '../../game/AudioSystem';
import {
  Zap,
  Sparkles,
  Radio,
  Maximize2,
  Rocket,
  Snowflake,
  Gem,
  Clock,
  Cpu,
  Flame,
  Crosshair,
  HeartPulse,
  ShieldPlus,
  ArrowUpCircle,
  Gauge,
  Target,
  Repeat,
  Bot,
  BatteryCharging,
} from 'lucide-react';

const PowerIcon = ({ id, size = 28 }: { id: PowerId; size?: number }) => {
  const cls = 'drop-shadow-[0_0_8px_currentColor]';
  switch (id) {
    case 'RAPID_FIRE': return <Zap size={size} className={cls} strokeWidth={2.2} />;
    case 'TRIPLE_SHOT': return <Sparkles size={size} className={cls} strokeWidth={2.2} />;
    case 'EMP_BLAST': return <Radio size={size} className={cls} strokeWidth={2.2} />;
    case 'BIG_HITBOX': return <Maximize2 size={size} className={cls} strokeWidth={2.2} />;
    case 'RAILGUN_SPEED': return <Rocket size={size} className={cls} strokeWidth={2.2} />;
    case 'SLOW_MO_DRONES': return <Snowflake size={size} className={cls} strokeWidth={2.2} />;
    case 'SCORE_BOOST': return <Gem size={size} className={cls} strokeWidth={2.2} />;
    case 'TIME_SURGE': return <Clock size={size} className={cls} strokeWidth={2.2} />;
    case 'HEAVY_DAMAGE': return <Flame size={size} className={cls} strokeWidth={2.2} />;
    case 'PIERCING_SHOT': return <Crosshair size={size} className={cls} strokeWidth={2.2} />;
    case 'VAMPIRIC_SHIELD': return <HeartPulse size={size} className={cls} strokeWidth={2.2} />;
    case 'TITAN_ARMOR': return <ShieldPlus size={size} className={cls} strokeWidth={2.2} />;
    case 'JET_BOOTS': return <ArrowUpCircle size={size} className={cls} strokeWidth={2.2} />;
    case 'TURBO_SPRINT': return <Gauge size={size} className={cls} strokeWidth={2.2} />;
    case 'CRITICAL_OPTICS': return <Target size={size} className={cls} strokeWidth={2.2} />;
    case 'RICOCHET_ROUNDS': return <Repeat size={size} className={cls} strokeWidth={2.2} />;
    case 'ALLY_DRONE': return <Bot size={size} className={cls} strokeWidth={2.2} />;
    case 'EXTENDED_MAG': return <BatteryCharging size={size} className={cls} strokeWidth={2.2} />;
    case 'SMART_AUTOLOCK': return <Cpu size={size} className={cls} strokeWidth={2.2} />;
  }
};

const accentStyles: Record<
  PowerDefinition['accent'],
  { border: string; bg: string; text: string; badge: string; glow: string; medallionShell: string; medallionGlow: string }
> = {
  cyan: {
    border: 'border-cyan-500/60 hover:border-cyan-300',
    bg: 'bg-cyan-950/30 hover:bg-cyan-900/40',
    text: 'text-cyan-400',
    badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60',
    glow: 'shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.45)]',
    medallionShell: 'from-cyan-400/35 via-sky-500/20 to-blue-600/35 border-cyan-400/60',
    medallionGlow: 'shadow-[0_0_24px_rgba(34,211,238,0.32)]',
  },
  amber: {
    border: 'border-amber-500/60 hover:border-amber-300',
    bg: 'bg-amber-950/30 hover:bg-amber-900/40',
    text: 'text-amber-400',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-600/60',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(251,191,36,0.45)]',
    medallionShell: 'from-amber-400/35 via-orange-500/20 to-yellow-600/35 border-amber-400/60',
    medallionGlow: 'shadow-[0_0_24px_rgba(251,191,36,0.32)]',
  },
  purple: {
    border: 'border-purple-500/60 hover:border-purple-300',
    bg: 'bg-purple-950/30 hover:bg-purple-900/40',
    text: 'text-purple-400',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-600/60',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:shadow-[0_0_35px_rgba(192,132,252,0.45)]',
    medallionShell: 'from-purple-400/35 via-fuchsia-500/20 to-violet-700/35 border-purple-400/60',
    medallionGlow: 'shadow-[0_0_24px_rgba(192,132,252,0.32)]',
  },
  emerald: {
    border: 'border-emerald-500/60 hover:border-emerald-300',
    bg: 'bg-emerald-950/30 hover:bg-emerald-900/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(52,211,153,0.45)]',
    medallionShell: 'from-emerald-400/35 via-teal-500/20 to-green-700/35 border-emerald-400/60',
    medallionGlow: 'shadow-[0_0_24px_rgba(52,211,153,0.32)]',
  },
  rose: {
    border: 'border-rose-500/60 hover:border-rose-300',
    bg: 'bg-rose-950/30 hover:bg-rose-900/40',
    text: 'text-rose-400',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-600/60',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.2)] hover:shadow-[0_0_35px_rgba(251,113,133,0.45)]',
    medallionShell: 'from-rose-400/35 via-pink-500/20 to-red-700/35 border-rose-400/60',
    medallionGlow: 'shadow-[0_0_24px_rgba(251,113,133,0.32)]',
  },
};

export const PowerSelection = () => {
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);
  const currentRound = useGameStore((state) => state.currentRound);
  const powerChoices = useGameStore((state) => state.powerChoices);
  const activePowers = useGameStore((state) => state.activePowers);
  const selectPower = useGameStore((state) => state.selectPower);
  const isWaveMode = mode === 'TRAINING';
  const { gamepadState } = useGamepad();

  const handleChoose = useCallback((id: PowerId) => {
    initAudio();
    playSound('alarm');
    const canvas = document.querySelector('canvas');
    if (getDeviceProfile().inputMode === 'pointer' && canvas?.requestPointerLock) {
      Promise.resolve(canvas.requestPointerLock()).catch(() => {});
    }
    selectPower(id);
  }, [selectPower]);

  const { selectedIndex } = useGamepadMenu({
    enabled: roundState === 'POWER_SELECT',
    itemCount: powerChoices.length,
    onSelect: (index) => {
      const choice = powerChoices[index];
      if (choice) handleChoose(choice);
    },
    axis: 'horizontal',
  });

  // Gamepad face buttons X, Y, B instant selection
  useEffect(() => {
    if (roundState !== 'POWER_SELECT' || powerChoices.length === 0) return;
    let raf = 0;
    let wasPressed = false;
    const pollButtons = () => {
      const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
      let gp = null;
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          gp = gamepads[i];
          break;
        }
      }
      if (gp) {
        const x = gp.buttons[2]?.pressed || false;
        const y = gp.buttons[3]?.pressed || false;
        const b = gp.buttons[1]?.pressed || false;
        if ((x || y || b) && !wasPressed) {
          wasPressed = true;
          if (x && powerChoices[0]) handleChoose(powerChoices[0]);
          else if (y && powerChoices[1]) handleChoose(powerChoices[1]);
          else if (b && powerChoices[2]) handleChoose(powerChoices[2]);
        } else if (!x && !y && !b) {
          wasPressed = false;
        }
      }
      raf = requestAnimationFrame(pollButtons);
    };
    raf = requestAnimationFrame(pollButtons);
    return () => cancelAnimationFrame(raf);
  }, [roundState, powerChoices, handleChoose]);

  // Allow instant selection with keys 1, 2, 3
  useEffect(() => {
    if (roundState !== 'POWER_SELECT' || powerChoices.length === 0) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && powerChoices[0]) handleChoose(powerChoices[0]);
      if (e.key === '2' && powerChoices[1]) handleChoose(powerChoices[1]);
      if (e.key === '3' && powerChoices[2]) handleChoose(powerChoices[2]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [roundState, powerChoices, handleChoose]);

  useEffect(() => {
    if (roundState === 'POWER_SELECT' && powerChoices.length === 0) {
      useGameStore.setState({ roundState: 'PLAYING' });
    }
  }, [roundState, powerChoices]);

  if (roundState !== 'POWER_SELECT' || powerChoices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-md font-mono pointer-events-auto p-6"
    >
      <div className="max-w-5xl w-full flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-3 bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-bold tracking-[0.35em]">
            <Cpu size={14} /> {isWaveMode ? `OLEADA ${currentRound}` : `NIVEL ${currentRound}`} // MEJORA DE ARMAMENTO
          </div>
          <h1 className="text-3xl md:text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-500 tracking-widest">
            ELIGE 1 DE 3 PODERES
          </h1>
          <p className="text-xs text-slate-400 tracking-widest mt-2">
            {isWaveMode
              ? `HAZ CLICK EN UN MÓDULO O PRESIONA [1], [2] O [3] PARA INICIAR LA OLEADA ${currentRound}`
              : 'HAZ CLICK EN UN MÓDULO O PRESIONA [1], [2] O [3] PARA INICIAR EL NIVEL'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {powerChoices.map((powerId, index) => {
            const power = POWERS_CATALOG[powerId];
            const style = accentStyles[power.accent];
            const currentStack = activePowers[powerId] || 0;

            return (
              <motion.button
                key={powerId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChoose(powerId)}
                className={`group glass-panel tech-border border-2 p-6 text-left flex flex-col justify-between min-h-[280px] transition-all cursor-pointer ${style.border} ${style.bg} ${style.glow} ${
                  gamepadState.connected && selectedIndex === index
                    ? 'ring-2 ring-emerald-400 scale-[1.04] shadow-[0_0_30px_rgba(52,211,153,0.7)]'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold tracking-[0.25em] px-2.5 py-1 border ${style.badge}`}>
                      {power.rarity}
                    </span>
                    <span className="text-xs font-orbitron font-bold text-slate-400 bg-slate-900/80 border border-slate-700 px-2 py-0.5">
                      {gamepadState.connected
                        ? index === 0
                          ? '(X)'
                          : index === 1
                            ? '(Y)'
                            : '(B)'
                        : `[${index + 1}]`}
                    </span>
                  </div>

                  {/* Layered Octagonal/Beveled Sci-Fi Icon Medallion */}
                  <div className="relative w-16 h-16 mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br border ${style.medallionShell} ${style.medallionGlow}`}
                      style={{
                        clipPath: 'polygon(22% 0%, 78% 0%, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0% 78%, 0% 22%)',
                      }}
                    />
                    <div
                      className="absolute inset-[2px] bg-slate-950/90"
                      style={{
                        clipPath: 'polygon(22% 0%, 78% 0%, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0% 78%, 0% 22%)',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-[2px] opacity-30 bg-[radial-gradient(circle_at_30%_25%,white,transparent_70%)]"
                      style={{
                        clipPath: 'polygon(22% 0%, 78% 0%, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0% 78%, 0% 22%)',
                      }}
                    />
                    <span className={`relative z-10 ${style.text}`}>
                      <PowerIcon id={powerId} size={30} />
                    </span>
                  </div>

                  <h2 className="text-xl font-orbitron font-black text-white tracking-wider mb-2">
                    {power.name}
                  </h2>

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold tracking-widest ${style.text}`}>
                      {currentStack === 0
                        ? `MÓDULO NUEVO (NV. 1/${power.maxStacks})`
                        : `MEJORA: NV. ${currentStack} → NV. ${currentStack + 1}/${power.maxStacks}`}
                    </span>
                    {currentStack + 1 >= power.maxStacks && (
                      <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded">
                        MÁXIMO NIVEL
                      </span>
                    )}
                  </div>

                  {/* Level pip indicator bar */}
                  <div className="flex items-center gap-1 mb-3.5">
                    {Array.from({ length: power.maxStacks }).map((_, pipIdx) => {
                      const isAcquired = pipIdx < currentStack;
                      const isNext = pipIdx === currentStack;
                      return (
                        <div
                          key={`pip-${pipIdx}`}
                          className={`h-1.5 flex-1 rounded-sm transition-all ${
                            isAcquired
                              ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                              : isNext
                                ? 'bg-cyan-500/50 animate-pulse border border-cyan-400/80'
                                : 'bg-slate-800 border border-slate-700/50'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    {power.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className={`text-[11px] font-bold tracking-wider px-3 py-2 bg-slate-950/80 border border-slate-800 flex-1 ${style.text}`}>
                    {power.effectText}
                  </div>
                  {gamepadState.connected && selectedIndex === index && (
                    <span className="px-2 py-1 rounded bg-emerald-400 text-slate-950 font-bold text-[10px]">
                      (A)
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Compact HUD bar showing all active powers installed during the current run
export const ActivePowersBar = () => {
  const activePowers = useGameStore((state) => state.activePowers);
  const entries = Object.entries(activePowers) as [PowerId, number][];

  if (entries.length === 0) return null;

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-1.5 pointer-events-none z-20 max-w-md">
      {entries.map(([id, count]) => {
        const power = POWERS_CATALOG[id];
        const style = accentStyles[power.accent];
        return (
          <div
            key={id}
            title={power.name}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/60 border border-white/15 text-[10px] font-mono backdrop-blur-md shadow-[0_0_12px_rgba(2,6,23,0.45)]"
          >
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-md bg-slate-900/90 border border-white/10 ${style.text}`}>
              <PowerIcon id={id} size={10} />
            </span>
            <span className="text-slate-200 hidden sm:inline">{power.shortName}</span>
            {count > 1 || count >= power.maxStacks ? (
              <span className={`font-orbitron font-bold ${count >= power.maxStacks ? 'text-amber-300' : 'text-white'}`}>
                {count >= power.maxStacks ? `MÁX` : `x${count}`}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
