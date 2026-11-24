import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, MAX_LEVELS, isBossRound, isChapterBossLevel } from '../../game/gameState';
import { ArrowLeft } from 'lucide-react';
import { playSound } from '../../game/AudioSystem';
import { useState } from 'react';
import { getLevelMapPreview, CHAPTER_META } from '../../game/mapGenerator';
import type { BiomeChapter } from '../../game/mapGenerator';
import {
  IconBadge,
  StarMapIcon,
  BossSkullIcon,
  LockHexIcon,
  MissionDoneIcon,
  CampaignIcon,
  GalaxySparkIcon,
} from './SciFiIcons';

const CHAPTER_SECTIONS: { chapter: BiomeChapter; start: number }[] = [
  { chapter: 'UNDERGROUND_LAB', start: 1 },
  { chapter: 'EARTH_OPEN_FIELD', start: 11 },
  { chapter: 'ROCKET_LAUNCH_ZONE', start: 21 },
  { chapter: 'ORBITAL_STRATOSPHERE', start: 31 },
  { chapter: 'GALACTIC_ARENA', start: 41 },
];

export const LevelMap = () => {
  const highestRound = useGameStore((state) => state.highestRound);
  const currentRound = useGameStore((state) => state.currentRound);
  const levelStats = useGameStore((state) => state.levelStats);
  const startRound = useGameStore((state) => state.startRound);
  const setMode = useGameStore((state) => state.setMode);

  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md font-mono"
    >
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      <div className="max-w-6xl w-full p-8 flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <IconBadge accent="cyan" size="lg" shape="hex">
              <StarMapIcon size={26} />
            </IconBadge>
            <div>
              <h2 className="text-sm text-slate-400 font-bold tracking-[0.4em] mb-1">CENTRO DE COMANDO</h2>
              <h1 className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-500 tracking-widest">
                SELECCIÓN DE MISIÓN
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-900/70 border border-cyan-800/60 text-xs font-bold tracking-widest text-cyan-300">
              PROGRESO: {highestRound} / {MAX_LEVELS}
            </div>
            <button 
              onClick={() => { playSound('ui'); setMode('MENU'); }}
              className="flex items-center gap-2 px-6 py-3 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 bg-slate-900/50 transition-colors tech-border font-bold tracking-widest"
            >
              <ArrowLeft size={16} /> VOLVER
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-8 min-h-0">
          {/* Main Chapter-Grouped Grid */}
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-7 pb-8">
            {CHAPTER_SECTIONS.map(({ chapter, start }) => {
              const meta = CHAPTER_META[chapter];
              const chapterLevels = Array.from({ length: 10 }, (_, idx) => start + idx);

              return (
                <div key={chapter} className="space-y-3">
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-900/75 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: meta.accentHex,
                          boxShadow: `0 0 10px ${meta.accentHex}`,
                        }}
                      />
                      <span className="text-xs font-orbitron font-black tracking-[0.2em] text-white">
                        CAPÍTULO {meta.roman} · {meta.name}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold tracking-[0.22em]"
                      style={{ color: meta.accentHex }}
                    >
                      {meta.rangeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-3.5">
                    {chapterLevels.map((level) => {
                      const isUnlocked = level <= highestRound;
                      const isCurrent = level === currentRound;
                      const hasStats = !!levelStats[level];
                      const isBoss = isBossRound(level);
                      const isPortal = isChapterBossLevel(level);

                      return (
                        <motion.button
                          key={level}
                          disabled={!isUnlocked}
                          onHoverStart={() => setHoveredLevel(level)}
                          onHoverEnd={() => setHoveredLevel(null)}
                          whileHover={isUnlocked ? { scale: 1.05, y: -2 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                          onClick={() => {
                            if (isUnlocked) {
                              playSound('ui');
                              startRound(level);
                            }
                          }}
                          className={`relative p-3.5 tech-border border text-left flex flex-col justify-between h-28 transition-colors ${
                            isUnlocked
                              ? isCurrent
                                ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                                : isBoss
                                  ? 'border-rose-600/70 bg-rose-950/35 hover:bg-rose-900/40 hover:border-rose-400'
                                  : 'border-cyan-700/50 bg-slate-900/80 hover:bg-cyan-950/60 hover:border-cyan-400'
                              : isBoss
                                ? 'border-rose-950/60 bg-slate-950/80 cursor-not-allowed opacity-60'
                                : 'border-slate-800 bg-slate-950/80 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className={`text-2xl font-orbitron font-bold ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                              {level.toString().padStart(2, '0')}
                            </span>
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              {isBoss && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold tracking-widest bg-rose-950/80 border border-rose-500/60 text-rose-300">
                                  <BossSkullIcon size={10} /> JEFE
                                </span>
                              )}
                              {isUnlocked ? (
                                hasStats ? (
                                  <MissionDoneIcon size={15} className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
                                ) : (
                                  <CampaignIcon size={14} className="text-cyan-400/75" />
                                )
                              ) : (
                                <LockHexIcon size={14} className="text-rose-400/65" />
                              )}
                            </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between gap-1">
                            <div className={`text-[9px] tracking-widest font-bold ${isUnlocked ? (isCurrent ? 'text-cyan-300' : 'text-cyan-500') : 'text-slate-600'}`}>
                              {isUnlocked ? (isCurrent ? 'ACTUAL' : 'LISTO') : 'BLOQUEADO'}
                            </div>
                            {isPortal && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-bold tracking-wider bg-cyan-950/85 border border-cyan-400/60 text-cyan-200">
                                <GalaxySparkIcon size={9} /> PORTAL
                              </span>
                            )}
                          </div>

                          {isUnlocked && isCurrent && (
                            <div
                              className="absolute top-0 right-0 w-full h-full border-2 border-cyan-400 animate-pulse pointer-events-none"
                              style={{ clipPath: 'polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Side Panel */}
          <div className="w-80 shrink-0">
            <AnimatePresence mode="wait">
              {hoveredLevel && hoveredLevel <= highestRound ? (() => {
                const levelPreview = getLevelMapPreview(hoveredLevel);
                return (
                <motion.div 
                  key={`stats-${hoveredLevel}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-900/80 border border-cyan-500/30 tech-border p-6 h-full flex flex-col"
                >
                  <div className="mb-4">
                     <h3 className="text-cyan-500 text-xs font-bold tracking-[0.3em] mb-1">INTEL REPORTE</h3>
                     <h2 className="text-3xl font-orbitron font-black text-white tracking-widest">NIVEL {hoveredLevel}</h2>
                  </div>

                  {/* Unique Level Biome & Layout Preview */}
                  <div className="mb-5 p-3.5 rounded-lg bg-slate-950/85 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: levelPreview.theme.primaryGlow,
                          boxShadow: `0 0 10px ${levelPreview.theme.primaryGlow}`,
                        }}
                      />
                      <span className="text-xs font-orbitron font-bold text-white tracking-wider truncate">
                        {levelPreview.theme.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug mb-2">
                      {levelPreview.theme.ambientSubtitle}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-[9px] font-bold tracking-widest text-cyan-300">
                      <StarMapIcon size={11} />
                      <span>{levelPreview.layoutName}</span>
                    </div>
                  </div>

                  {levelStats[hoveredLevel] ? (
                    <div className="space-y-4 flex-1">
                      <div className="bg-slate-950/80 p-4 border border-slate-800 tech-border">
                        <div className="text-[10px] text-cyan-500 mb-1 flex items-center gap-2"><CampaignIcon size={14}/> MEJOR PUNTUACIÓN</div>
                        <div className="text-3xl font-orbitron font-bold text-white">
                          {levelStats[hoveredLevel].score.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="bg-slate-950/80 p-4 border border-slate-800 tech-border">
                        <div className="text-[10px] text-cyan-500 mb-1 flex items-center gap-2"><MissionDoneIcon size={14}/> OBJETIVOS DESTRUIDOS</div>
                        <div className="text-3xl font-orbitron font-bold text-white flex items-baseline gap-2">
                          {levelStats[hoveredLevel].targetsDestroyed}
                          <span className="text-lg text-slate-500">/ {levelStats[hoveredLevel].totalTargets}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500" 
                            style={{ width: `${(levelStats[hoveredLevel].targetsDestroyed / levelStats[hoveredLevel].totalTargets) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                      <IconBadge accent="slate" size="lg" shape="hex" className="mb-3">
                        <CampaignIcon size={24} />
                      </IconBadge>
                      <p className="text-sm font-bold text-slate-300 tracking-widest">SIN REGISTROS</p>
                      <p className="text-xs text-slate-500 mt-1">Misión aún no completada</p>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4 text-center text-[10px] text-slate-500 tracking-widest border-t border-slate-800">
                    CLICK PARA INICIAR MISIÓN
                  </div>
                </motion.div>
                );
              })() : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-950/50 border border-slate-800/50 tech-border p-6 h-full flex items-center justify-center text-center"
                >
                   <div className="flex flex-col items-center">
                     <IconBadge accent="violet" size="lg" shape="hex" className="mb-4 opacity-75">
                       <StarMapIcon size={24} />
                     </IconBadge>
                     <p className="text-xs font-bold text-slate-400 tracking-widest">SELECCIONA O PASA EL CURSOR SOBRE UNA MISIÓN DESBLOQUEADA</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
