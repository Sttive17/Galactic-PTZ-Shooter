import { useGameStore } from '../../game/gameState';
import { useGamepad } from '../../hooks/useGamepad';
import { useGamepadMenu } from '../../hooks/useGamepadMenu';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { initAudio, playSound } from '../../game/AudioSystem';
import { SettingsPanel } from './SettingsPanel';
import { ArmoryModal } from './ArmoryModal';
import { Sliders, Shield } from 'lucide-react';
import {
  IconBadge,
  CampaignIcon,
  StarMapIcon,
  WavesIcon,
  OrbitalLinkIcon,
  GalaxySparkIcon,
  KeyboardGlyph,
  MouseGlyph,
  GamepadGlyph,
} from './SciFiIcons';

export const MainMenu = () => {
  const isSettingsOpen = useGameStore((state) => state.isSettingsOpen);
  const setSettingsOpen = useGameStore((state) => state.setSettingsOpen);
  const isArmoryOpen = useGameStore((state) => state.isArmoryOpen);
  const setArmoryOpen = useGameStore((state) => state.setArmoryOpen);
  const resetGame = useGameStore((state) => state.resetGame);
  const setMode = useGameStore((state) => state.setMode);
  const currentMap = useGameStore((state) => state.currentMap);
  const { gamepadState } = useGamepad();

  const start = (mode: 'CHALLENGE' | 'TRAINING') => {
    initAudio();
    resetGame(mode);
  };

  const handleMenuSelect = (index: number) => {
    if (index === 0) {
      playSound('ui');
      start('CHALLENGE');
    } else if (index === 1) {
      initAudio();
      playSound('ui');
      setMode('LEVEL_MAP');
    } else if (index === 2) {
      playSound('ui');
      start('TRAINING');
    } else if (index === 3) {
      initAudio();
      playSound('ui');
      setArmoryOpen(true);
    } else if (index === 4) {
      initAudio();
      playSound('ui');
      setSettingsOpen(true);
    }
  };

  const { selectedIndex } = useGamepadMenu({
    enabled: !isSettingsOpen && !isArmoryOpen,
    itemCount: 5,
    onSelect: handleMenuSelect,
    axis: 'horizontal',
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 18, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } },
  };

  const featurePills = ['50 NIVELES', '18 PODERES', '9 CLASES', '8 JEFES', '10 BIOMAS'];

  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.12)_0%,rgba(2,6,23,0.68)_75%,rgba(2,6,23,0.88)_100%)] p-6 md:p-8 select-none overflow-hidden">
      {/* Top Galactic Telemetry Bar */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-950/45 border border-cyan-500/25 backdrop-blur-sm text-[11px] font-mono tracking-[0.22em]"
      >
        <div className="flex items-center gap-2.5 text-cyan-300 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <OrbitalLinkIcon size={16} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span>ORBITAL LINK // ACTIVO</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-violet-300 font-bold">
          <GalaxySparkIcon size={15} className="text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
          <span>CAMPAÑA 50 NIVELES</span>
        </div>

        <div className="text-slate-300 font-semibold truncate max-w-md">
          <span className="text-slate-500 mr-1.5">SECTOR ACTUAL:</span>
          <span className="text-cyan-300">{currentMap.theme.name}</span>
          <span className="text-slate-600 mx-1.5">·</span>
          <span className="text-fuchsia-300">{currentMap.layoutName}</span>
        </div>
      </motion.div>

      {/* Center Galactic Command Hub (leaves sides open for orbiting 3D view) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 flex flex-col items-center justify-center my-auto max-w-3xl mx-auto w-full relative"
      >
        {/* Subtle Animated Orbital Ring Emblem behind Title */}
        <motion.div variants={itemVariants} className="relative flex flex-col items-center text-center mb-8">
          <div className="pointer-events-none absolute -top-12 w-56 h-56 flex items-center justify-center opacity-45">
            <motion.svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
            >
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="url(#orbitalGrad)"
                strokeWidth="1"
                strokeDasharray="10 8 3 8"
              />
              <circle
                cx="100"
                cy="100"
                r="66"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.75"
                strokeOpacity="0.45"
                strokeDasharray="24 14"
              />
              <defs>
                <linearGradient id="orbitalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#e879f9" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-400/35 text-cyan-300 text-[10px] font-mono font-bold tracking-[0.35em] mb-4 backdrop-blur-sm">
            SISTEMA TÁCTICO ESPACIAL MK-V
          </div>

          <h1 className="text-5xl sm:text-7xl font-orbitron font-black tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-400 drop-shadow-[0_0_28px_rgba(34,211,238,0.45)]">
            GALACTIC PTZ
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm font-mono font-bold tracking-[0.42em] text-cyan-200/85">
            ORBITAL STRIKE // SIMULADOR TÁCTICO 3D
          </p>
        </motion.div>

        {/* Compact Sci-Fi Feature Pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 mb-9">
          {featurePills.map((pill) => (
            <span
              key={pill}
              className="px-3 py-1 rounded-full bg-slate-950/50 border border-cyan-500/25 text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-200/90 backdrop-blur-sm shadow-[0_0_12px_rgba(6,182,212,0.12)]"
            >
              {pill}
            </span>
          ))}
        </motion.div>

        {/* 5 Sleek Glassmorphic Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full max-w-4xl"
        >
          <button
            onClick={() => {
              playSound('ui');
              start('CHALLENGE');
            }}
            className={`group py-3 px-3 rounded-xl bg-gradient-to-r from-cyan-500/90 via-sky-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-black text-xs tracking-[0.14em] border border-cyan-200/60 shadow-[0_0_25px_rgba(34,211,238,0.45)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              gamepadState.connected && selectedIndex === 0 ? 'ring-2 ring-emerald-400 scale-[1.04] shadow-[0_0_25px_rgba(52,211,153,0.7)]' : ''
            }`}
          >
            <IconBadge accent="cyan" size="md" shape="hex" className="group-hover:scale-110 transition-transform">
              <CampaignIcon size={18} />
            </IconBadge>
            <span>CAMPAÑA</span>
            {gamepadState.connected && selectedIndex === 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold">
                (A)
              </span>
            )}
          </button>

          <button
            onClick={() => {
              initAudio();
              playSound('ui');
              setMode('LEVEL_MAP');
            }}
            className={`group py-3 px-3 rounded-xl bg-slate-950/60 hover:bg-violet-950/70 text-violet-200 hover:text-white font-orbitron font-bold text-xs tracking-[0.14em] border border-violet-400/40 hover:border-cyan-400/70 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              gamepadState.connected && selectedIndex === 1 ? 'ring-2 ring-emerald-400 scale-[1.04] shadow-[0_0_25px_rgba(52,211,153,0.7)]' : ''
            }`}
          >
            <IconBadge accent="violet" size="md" shape="hex" className="group-hover:scale-110 transition-transform">
              <StarMapIcon size={18} />
            </IconBadge>
            <span>MAPA ESTELAR</span>
            {gamepadState.connected && selectedIndex === 1 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold">
                (A)
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playSound('ui');
              start('TRAINING');
            }}
            className={`group py-3 px-3 rounded-xl bg-slate-950/60 hover:bg-emerald-950/70 text-emerald-200 hover:text-white font-orbitron font-bold text-xs tracking-[0.14em] border border-emerald-400/40 hover:border-emerald-300/80 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              gamepadState.connected && selectedIndex === 2 ? 'ring-2 ring-emerald-400 scale-[1.04] shadow-[0_0_25px_rgba(52,211,153,0.7)]' : ''
            }`}
          >
            <IconBadge accent="emerald" size="md" shape="hex" className="group-hover:scale-110 transition-transform">
              <WavesIcon size={18} />
            </IconBadge>
            <span>OLEADAS</span>
            {gamepadState.connected && selectedIndex === 2 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold">
                (A)
              </span>
            )}
          </button>

          <button
            onClick={() => {
              initAudio();
              playSound('ui');
              setArmoryOpen(true);
            }}
            className={`group py-3 px-3 rounded-xl bg-slate-950/60 hover:bg-amber-950/70 text-amber-300 hover:text-white font-orbitron font-bold text-xs tracking-[0.14em] border border-amber-500/40 hover:border-amber-400 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              gamepadState.connected && selectedIndex === 3 ? 'ring-2 ring-emerald-400 scale-[1.04] shadow-[0_0_25px_rgba(52,211,153,0.7)]' : ''
            }`}
          >
            <IconBadge accent="amber" size="md" shape="hex" className="group-hover:scale-110 transition-transform">
              <Shield size={18} />
            </IconBadge>
            <span>ARMERÍA</span>
            {gamepadState.connected && selectedIndex === 3 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold">
                (A)
              </span>
            )}
          </button>

          <button
            onClick={() => {
              initAudio();
              playSound('ui');
              setSettingsOpen(true);
            }}
            className={`group py-3 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 text-cyan-300 hover:text-white font-orbitron font-bold text-xs tracking-[0.14em] border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              gamepadState.connected && selectedIndex === 4 ? 'ring-2 ring-emerald-400 scale-[1.04] shadow-[0_0_25px_rgba(52,211,153,0.7)]' : ''
            }`}
          >
            <IconBadge accent="cyan" size="md" shape="hex" className="group-hover:scale-110 transition-transform">
              <Sliders size={18} />
            </IconBadge>
            <span>AJUSTES</span>
            {gamepadState.connected && selectedIndex === 4 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold">
                (A)
              </span>
            )}
          </button>
        </motion.div>
      </motion.div>

      {/* Armory Modal */}
      <AnimatePresence>
        {isArmoryOpen && (
          <ArmoryModal isOpen={isArmoryOpen} onClose={() => setArmoryOpen(false)} />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-xl"
            >
              <SettingsPanel isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Bottom Control Dock */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="z-10 max-w-3xl mx-auto w-full px-5 py-3 rounded-xl bg-slate-950/55 border border-slate-700/60 backdrop-blur-md flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-mono text-slate-300"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-400/35 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]">
            <KeyboardGlyph size={14} />
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/30 text-cyan-300 font-bold text-[11px]">
            WASD + SHIFT + ESPACIO
          </span>
          <span className="text-slate-400 hidden md:inline">Mover · Sprint · Saltar</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-sky-500/15 border border-sky-400/35 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.2)]">
            <MouseGlyph size={14} />
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-sky-500/30 text-sky-300 font-bold text-[11px]">
            MOUSE
          </span>
          <span className="text-slate-400 hidden md:inline">Apuntar · Disparar · Zoom</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-fuchsia-500/15 border border-fuchsia-400/35 text-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.2)]">
            <GamepadGlyph size={14} />
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-fuchsia-500/30 text-fuchsia-300 font-bold text-[11px]">
            XBOX RT/LT/LB/RB
          </span>
          <span className="text-slate-400 hidden md:inline">Disparo · Zoom · Mando</span>
        </div>
      </motion.div>
    </div>
  );
};
