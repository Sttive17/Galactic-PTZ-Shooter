import { useGameStore } from '../../game/gameState';
import { Target, Crosshair, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { playSound } from '../../game/AudioSystem';

export const GameOver = () => {
  const score = useGameStore((state) => state.score);
  const shots = useGameStore((state) => state.shots);
  const hits = useGameStore((state) => state.hits);
  const targetsDestroyed = useGameStore((state) => state.targetsDestroyed);
  const currentRound = useGameStore((state) => state.currentRound);
  const lastPlayedMode = useGameStore((state) => state.lastPlayedMode);
  const resetGame = useGameStore((state) => state.resetGame);
  const startRound = useGameStore((state) => state.startRound);
  const accuracy = shots > 0 ? Math.min(100, (hits / shots) * 100).toFixed(1) : '0.0';
  const isWaveMode = lastPlayedMode === 'TRAINING';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl z-50 font-mono"
    >
      <div className="absolute inset-0 pointer-events-none scanlines opacity-50" />
      
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-panel tech-border p-10 bg-slate-950/80 max-w-lg w-full text-center border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative"
      >
        
        {/* Accent corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/80" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/80" />

        <div className="flex justify-center mb-6">
          <motion.div
             animate={{ opacity: [1, 0.5, 1] }}
             transition={{ duration: 1, repeat: Infinity }}
             className="text-red-500"
          >
            <AlertTriangle size={56} strokeWidth={1.5} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          </motion.div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-200 to-red-600 mb-8 tracking-[0.25em]">
          {isWaveMode ? `CAÍSTE EN LA OLEADA ${currentRound}` : 'SIMULACIÓN FINALIZADA'}
        </h1>

        <div className="flex flex-col gap-5 text-left mb-10">
          <div className="flex justify-between items-center bg-red-950/30 p-6 border border-red-900/50 tech-border">
            <span className="text-red-400/80 text-xs font-bold tracking-widest">PUNTUACIÓN_TOTAL</span>
            <span className="text-5xl font-orbitron font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{score.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-5 tech-border border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 mb-3 flex items-center justify-center gap-2 tracking-widest">
                <Target size={14} className="text-cyan-500"/> DESTRUIDOS
              </div>
              <div className="text-3xl font-orbitron font-bold text-cyan-400">{targetsDestroyed}</div>
            </div>
            <div className="bg-slate-900/60 p-5 tech-border border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 mb-3 flex items-center justify-center gap-2 tracking-widest">
                <Crosshair size={14} className="text-green-500"/> PRECISIÓN
              </div>
              <div className={`text-3xl font-orbitron font-bold ${parseFloat(accuracy) > 70 ? 'text-green-400' : 'text-amber-400'}`}>{accuracy}%</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSound('ui');
              if (isWaveMode) {
                resetGame('TRAINING');
              } else {
                startRound(currentRound);
              }
            }}
            className="w-full py-4 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 font-bold text-xs tracking-[0.35em] tech-border transition-colors border border-cyan-600/70 flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} /> {isWaveMode ? 'REINTENTAR OLEADAS' : `REINTENTAR NIVEL ${currentRound}`}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { playSound('ui'); resetGame('MENU'); }}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs tracking-[0.4em] tech-border transition-colors border border-slate-700"
          >
            MENÚ PRINCIPAL
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
