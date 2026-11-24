import { motion } from 'framer-motion';
import { useGameStore, MAX_LEVELS, isTrainingBossWave } from '../../game/gameState';
import { ShieldAlert, Crosshair, Target, Play, Map, XOctagon, AlertTriangle } from 'lucide-react';
import { playSound } from '../../game/AudioSystem';
import { useEffect } from 'react';

export const RoundTransition = () => {
  const mode = useGameStore((state) => state.mode);
  const currentRound = useGameStore((state) => state.currentRound);
  const score = useGameStore((state) => state.score);
  const hits = useGameStore((state) => state.hits);
  const shots = useGameStore((state) => state.shots);
  const roundState = useGameStore((state) => state.roundState);
  const nextRound = useGameStore((state) => state.nextRound);
  const setMode = useGameStore((state) => state.setMode);

  // We only reset checking state when leaving transition
  useEffect(() => {
    // If we want to automatically focus a button for Gamepad, we could do it here
  }, [roundState]);

  if (roundState !== 'TRANSITION') return null;

  const accuracy = shots > 0 ? Math.min(100, (hits / shots) * 100).toFixed(1) : '0.0';

  const isWaveMode = mode === 'TRAINING';
  const isCampaignFinished = mode === 'CHALLENGE' && currentRound >= MAX_LEVELS;
  const nextWave = currentRound + 1;
  const nextWaveIsBoss = isWaveMode && isTrainingBossWave(nextWave);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-md font-mono pointer-events-auto"
    >
      {/* Flashbang effect */}
      <motion.div 
         initial={{ opacity: 1 }} 
         animate={{ opacity: 0 }} 
         transition={{ duration: 0.5, ease: 'easeOut' }}
         className="absolute inset-0 bg-white z-50 pointer-events-none"
      />

      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-panel p-8 tech-border bg-slate-900/90 border border-cyan-500/50 shadow-[0_0_50px_rgba(8,145,178,0.3)] max-w-lg w-full text-center"
      >
        <div className="flex justify-center mb-4">
          <ShieldAlert size={48} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </div>
        
        <h2 className="text-xl text-slate-400 font-bold tracking-[0.4em] mb-2">
          {isWaveMode ? 'SUPERVIVENCIA POR OLEADAS' : 'SISTEMA PTZ'}
        </h2>
        <h1 className="text-3xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-cyan-600 mb-6 tracking-widest">
          {isWaveMode
            ? `OLEADA ${currentRound} SUPERADA`
            : isCampaignFinished
              ? '¡CAMPAÑA COMPLETADA!'
              : `NIVEL ${currentRound} COMPLETADO`}
        </h1>

        {isWaveMode && (
          <div
            className={`mb-6 px-4 py-2.5 border text-xs font-bold tracking-widest flex items-center justify-center gap-2 ${
              nextWaveIsBoss
                ? 'bg-rose-950/55 border-rose-500/70 text-rose-300 animate-pulse'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            }`}
          >
            <AlertTriangle size={15} />
            <span>
              {nextWaveIsBoss
                ? `ALERTA: OLEADA ${nextWave} — JEFE + ESCOLTA`
                : `DIFICULTAD EN AUMENTO · OLEADA ${nextWave}`}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-950/50 p-4 border border-slate-800 tech-border">
            <div className="text-[10px] text-cyan-500 mb-2 flex items-center justify-center gap-2"><Target size={14}/> PUNTUACIÓN</div>
            <div className="text-2xl font-orbitron font-bold text-white">{score.toLocaleString()}</div>
          </div>
          <div className="bg-slate-950/50 p-4 border border-slate-800 tech-border">
            <div className="text-[10px] text-cyan-500 mb-2 flex items-center justify-center gap-2"><Crosshair size={14}/> PRECISIÓN</div>
            <div className={`text-2xl font-orbitron font-bold ${parseFloat(accuracy) >= 80 ? 'text-green-400' : 'text-amber-400'}`}>{accuracy}%</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {!isCampaignFinished ? (
            <button 
              onClick={() => { playSound('ui'); nextRound(); }}
              className="w-full py-3 bg-cyan-950/40 hover:bg-cyan-900 text-cyan-400 font-bold tracking-[0.2em] border border-cyan-800 hover:border-cyan-400 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={16} /> {isWaveMode ? `SIGUIENTE OLEADA (${nextWave})` : 'SIGUIENTE NIVEL'}
            </button>
          ) : (
            <div className="text-xs text-green-400 font-bold tracking-widest mb-2 py-2 bg-green-950/30 border border-green-800">
              ¡FELICITACIONES! HAS SUPERADO LOS {MAX_LEVELS} NIVELES
            </div>
          )}
          
          {!isWaveMode && (
            <button 
              onClick={() => { playSound('ui'); setMode('LEVEL_MAP'); }}
              className="w-full py-3 bg-slate-800/40 hover:bg-slate-700 text-slate-300 font-bold tracking-[0.2em] border border-slate-700 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
            >
              <Map size={16} /> MAPA DE NIVELES
            </button>
          )}
          
          <button 
            onClick={() => { playSound('ui'); setMode('MENU'); }}
            className="w-full py-3 bg-red-950/40 hover:bg-red-900 text-red-400 font-bold tracking-[0.2em] border border-red-900 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <XOctagon size={16} /> ABORTAR MISIÓN
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
