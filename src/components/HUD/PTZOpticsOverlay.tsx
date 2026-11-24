import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import { useGamepad } from '../../hooks/useGamepad';
import { Eye, ShieldAlert, Cpu } from 'lucide-react';

export const PTZOpticsOverlay = () => {
  const opticalMode = useGameStore((state) => state.opticalMode);
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);
  const dashCooldown = useGameStore((state) => state.dashCooldown);
  const { gamepadState } = useGamepad();

  const isGameplay =
    (mode === 'CHALLENGE' || mode === 'TRAINING') &&
    (roundState === 'PLAYING' || roundState === 'PORTAL_ACTIVE');

  if (!isGameplay) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 overflow-hidden font-mono select-none">
      {/* Top Center Optical HUD telemetry */}
      <div className="flex justify-center items-center w-full">
        <AnimatePresence mode="wait">
          {opticalMode !== 'NORMAL' && (
            <motion.div
              key={opticalMode}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2.5 px-3 py-1 rounded border backdrop-blur-md text-[11px] font-bold tracking-[0.25em] ${
                opticalMode === 'THERMAL'
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full animate-ping bg-current" />
              {opticalMode === 'THERMAL' ? (
                <>
                  <ShieldAlert size={14} />
                  <span>PTZ-FLIR // ESPECTRO TÉRMICO ACTIVO</span>
                </>
              ) : (
                <>
                  <Eye size={14} />
                  <span>PTZ-NIGHT // VISIÓN NOCTURNA FÓSFORO P-43</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center Screen Tactical Overlay Effects */}
      {opticalMode === 'THERMAL' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_60%,rgba(15,23,42,0.6)_100%)] border-[3px] border-rose-500/30">
          {/* Thermal calibration scale on the right */}
          <div className="absolute right-6 top-1/3 flex flex-col items-center gap-1 text-[9px] text-rose-300">
            <span className="font-bold">+450°C</span>
            <div className="w-2 h-32 rounded bg-gradient-to-b from-white via-amber-400 via-rose-600 to-indigo-900 border border-white/20 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span className="font-bold">-50°C</span>
            <span className="text-[8px] text-rose-400/80 mt-1">CALIB. IR</span>
          </div>
        </div>
      )}

      {opticalMode === 'NIGHT_VISION' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,rgba(6,78,59,0.4)_100%)] border-[3px] border-emerald-500/40">
          <div className="absolute left-6 top-1/3 flex flex-col gap-1 text-[9px] text-emerald-300 font-mono tracking-widest">
            <span>NV-GAIN: +18dB</span>
            <span>IR-EMITTER: AUTO</span>
            <span>FREQ: 850nm</span>
            <div className="w-16 h-1 bg-emerald-500/50 mt-1" />
          </div>
        </div>
      )}

      {/* Bottom Status Indicators: Dash Cooldown & Optics Mode Switcher */}
      <div className="flex items-end justify-between w-full px-2">
        {/* Dash Cooldown Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-cyan-500/30 backdrop-blur-md text-[10px] tracking-widest">
          <span className="text-cyan-400 font-bold">
            {gamepadState.connected ? '(B) / (LB)' : '[C]'} PROPULSOR
          </span>
          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/20">
            <div
              className={`h-full transition-all duration-75 ${
                dashCooldown <= 0
                  ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                  : 'bg-amber-400/80'
              }`}
              style={{ width: `${Math.round((1 - dashCooldown) * 100)}%` }}
            />
          </div>
          {dashCooldown <= 0 ? (
            <span className="text-emerald-400 font-bold text-[9px]">LISTO</span>
          ) : (
            <span className="text-amber-400 font-bold text-[9px]">CARGANDO</span>
          )}
        </div>

        {/* Optical Mode Indicator & Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/10 backdrop-blur-md text-[10px] tracking-widest text-slate-300">
          <Cpu size={12} className="text-cyan-400" />
          <span>ÓPTICA:</span>
          <span
            className={`font-bold ${
              opticalMode === 'THERMAL'
                ? 'text-rose-400'
                : opticalMode === 'NIGHT_VISION'
                  ? 'text-emerald-400'
                  : 'text-cyan-400'
            }`}
          >
            {opticalMode === 'THERMAL'
              ? 'TÉRMICO'
              : opticalMode === 'NIGHT_VISION'
                ? 'NOCTURNO'
                : 'ESTÁNDAR'}
          </span>
          <span className="text-slate-500 text-[9px]">
            {gamepadState.connected ? '(Y)' : '[V]'}
          </span>
        </div>
      </div>
    </div>
  );
};
