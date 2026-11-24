import { useGameStore } from '../../game/gameState';
import { motion, AnimatePresence } from 'framer-motion';

export const Crosshair = () => {
  const currentTarget = useGameStore((state) => state.currentTarget);
  const ptz = useGameStore((state) => state.ptz);
  const isTargeted = !!currentTarget;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none font-mono">
      
      {/* Central Tactical Reticle */}
      <motion.div 
        animate={{ scale: isTargeted ? 0.8 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative"
      >
        {/* Outer Tech Ring */}
        <div className={`w-40 h-40 max-lg:w-28 max-lg:h-28 border-2 border-dashed rounded-full transition-colors duration-300 ${isTargeted ? 'border-red-500/50 animate-[spin_4s_linear_infinite]' : 'border-cyan-500/20 animate-[spin_10s_linear_infinite]'}`} />
        
        {/* Inner Tech Ring with ticks */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 max-lg:w-14 max-lg:h-14 border-t-2 border-b-2 ${isTargeted ? 'border-red-500/80' : 'border-cyan-500/40'} rounded-full opacity-60 transition-colors duration-200`} />
        
        {/* Center Dot */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 ${isTargeted ? 'bg-red-500' : 'bg-cyan-400'} rounded-full opacity-100 shadow-[0_0_10px_rgba(34,211,238,0.8)]`} />
        
        {/* Precision Crosshair Lines */}
        <div className={`absolute top-1/2 -left-20 max-lg:-left-14 w-16 max-lg:w-10 h-[1px] -translate-y-1/2 ${isTargeted ? 'bg-red-500' : 'bg-cyan-500/80'}`}>
           <div className={`absolute top-0 right-0 w-1 h-1 -translate-y-[1.5px] ${isTargeted ? 'bg-red-500' : 'bg-cyan-400'}`} />
        </div>
        <div className={`absolute top-1/2 -right-20 max-lg:-right-14 w-16 max-lg:w-10 h-[1px] -translate-y-1/2 ${isTargeted ? 'bg-red-500' : 'bg-cyan-500/80'}`}>
           <div className={`absolute top-0 left-0 w-1 h-1 -translate-y-[1.5px] ${isTargeted ? 'bg-red-500' : 'bg-cyan-400'}`} />
        </div>
        <div className={`absolute -top-20 max-lg:-top-14 left-1/2 w-[1px] h-16 max-lg:h-10 -translate-x-1/2 ${isTargeted ? 'bg-red-500' : 'bg-cyan-500/80'}`} />
        <div className={`absolute -bottom-20 max-lg:-bottom-14 left-1/2 w-[1px] h-16 max-lg:h-10 -translate-x-1/2 ${isTargeted ? 'bg-red-500' : 'bg-cyan-500/80'}`} />

      </motion.div>

      {/* Target Info Floating (Lock-on HUD) */}
      <AnimatePresence>
        {isTargeted && currentTarget && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 ml-24 max-lg:ml-16 -mt-16 w-48 max-lg:w-40 glass-panel tech-border bg-red-950/80 p-3 max-lg:p-2 text-[10px] border border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.3)] text-red-100"
          >
            <div className="font-bold border-b border-red-500/40 pb-1 mb-2 flex items-center justify-between text-red-400 tracking-widest">
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                 LOCK_ON
              </div>
              <span>TGT_{currentTarget.id.slice(-2)}</span>
            </div>
            <div className="flex justify-between mb-1">
               <span className="text-red-400/80">INTEGRIDAD:</span> 
               <span className="font-orbitron font-bold text-white">{Math.round(currentTarget.health * 100)}%</span>
            </div>
            <div className="flex justify-between mb-1">
               <span className="text-red-400/80">DISTANCIA:</span> 
               <span className="font-orbitron text-white">{currentTarget.distance.toFixed(1)}m</span>
            </div>
            <div className="flex justify-between text-amber-400 font-bold mt-2 pt-1.5 border-t border-red-500/30">
              <span>RECOMPENSA:</span> <span className="font-orbitron">+{currentTarget.points}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic PTZ Indicators + FPS Controls Hint */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="flex gap-4 lg:gap-8 text-[10px] text-cyan-400/80 font-mono tracking-widest">
          <div>AZIMUTH: {ptz.pan.toFixed(1)}°</div>
          <div>ELEV: {ptz.tilt.toFixed(1)}°</div>
          <div>MAG: {ptz.zoom.toFixed(1)}X</div>
        </div>
        <div className="hidden lg:block whitespace-nowrap text-[9px] text-slate-400/80 tracking-[0.2em] bg-slate-950/60 px-3 py-1 border border-slate-800/80">
          WASD MOVER • ESPACIO SALTAR • CLICK APUNTAR 360° Y DISPARAR • CLK DER ZOOM • ESC PAUSA
        </div>
      </div>
    </div>
  );
};
