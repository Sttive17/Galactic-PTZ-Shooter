import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SceneState } from '../../game/sceneState';
import { AmmoCellIcon } from './SciFiIcons';

type AmmoVisualStatus = 'RELOADING' | 'EMPTY' | 'LOW' | 'OK';

export const AmmoHUD = () => {
  const ammoCountRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reloadPctRef = useRef<HTMLSpanElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const capBadgeRef = useRef<HTMLSpanElement>(null);

  const [status, setStatus] = useState<AmmoVisualStatus>('OK');

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const maxAmmo = Math.max(1, SceneState.maxAmmo);
      const ammo = Math.max(0, Math.floor(SceneState.ammo));
      const ammoRatio = Math.max(0, Math.min(1, ammo / maxAmmo));
      const reloading = SceneState.isReloading;
      const progress = Math.max(0, Math.min(1, SceneState.reloadProgress));

      if (ammoCountRef.current) {
        const nextText = String(ammo);
        if (ammoCountRef.current.textContent !== nextText) {
          ammoCountRef.current.textContent = nextText;
        }
      }

      if (barRef.current) {
        const widthPct = reloading ? progress * 100 : ammoRatio * 100;
        barRef.current.style.width = `${widthPct}%`;
      }

      if (reloadPctRef.current) {
        if (reloading) {
          reloadPctRef.current.style.display = 'inline';
          reloadPctRef.current.textContent = `${Math.round(progress * 100)}%`;
        } else {
          reloadPctRef.current.style.display = 'none';
        }
      }

      if (promptRef.current) {
        promptRef.current.style.opacity = !reloading && ammo < maxAmmo ? '1' : '0';
      }

      if (capBadgeRef.current) {
        if (maxAmmo !== 50) {
          capBadgeRef.current.style.display = 'inline-flex';
          const capText = `CAP ${maxAmmo}`;
          if (capBadgeRef.current.textContent !== capText) {
            capBadgeRef.current.textContent = capText;
          }
        } else {
          capBadgeRef.current.style.display = 'none';
        }
      }

      const nextStatus: AmmoVisualStatus = reloading
        ? 'RELOADING'
        : ammo <= 0
          ? 'EMPTY'
          : ammoRatio <= 0.3
            ? 'LOW'
            : 'OK';
      setStatus((prev) => (prev === nextStatus ? prev : nextStatus));

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const borderClass =
    status === 'EMPTY'
      ? 'border-rose-400/45'
      : status === 'RELOADING' || status === 'LOW'
        ? 'border-amber-400/40'
        : 'border-white/10';

  const headerColorClass =
    status === 'RELOADING'
      ? 'text-amber-300 animate-pulse'
      : status === 'EMPTY'
        ? 'text-rose-400 animate-pulse'
        : status === 'LOW'
          ? 'text-amber-300'
          : 'text-cyan-200';

  const statusLabel =
    status === 'RELOADING'
      ? 'RECARGANDO...'
      : status === 'EMPTY'
        ? 'SIN BALAS'
        : status === 'LOW'
          ? 'MUNICIÓN BAJA'
          : 'MUNICIÓN';

  const countColorClass =
    status === 'EMPTY'
      ? 'text-rose-400'
      : status === 'LOW' || status === 'RELOADING'
        ? 'text-amber-300'
        : 'text-white';

  const barColorClass =
    status === 'RELOADING'
      ? 'h-full transition-colors duration-150 bg-gradient-to-r from-amber-400 to-cyan-300'
      : status === 'EMPTY'
        ? 'h-full transition-colors duration-150 bg-rose-500'
        : status === 'LOW'
          ? 'h-full transition-colors duration-150 bg-amber-400'
          : 'h-full transition-colors duration-150 bg-gradient-to-r from-cyan-400 to-sky-300';

  return (
    <motion.div
      data-testid="ammo-hud"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute bottom-4 right-5 pointer-events-none z-10 w-52"
    >
      <div
        className={`bg-slate-950/55 backdrop-blur-md border rounded-lg px-3.5 py-2.5 flex flex-col gap-1.5 transition-colors duration-150 ${borderClass}`}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className={`flex items-center gap-1.5 font-semibold tracking-wider ${headerColorClass}`}>
            <AmmoCellIcon size={13} className="drop-shadow-[0_0_6px_currentColor]" />
            {statusLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              ref={capBadgeRef}
              style={{ display: 'none' }}
              className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/35 text-[9px] font-orbitron font-bold text-amber-300 tracking-wider"
            >
              CAP 50
            </span>
            <span
              ref={reloadPctRef}
              style={{ display: 'none' }}
              className="text-[10px] font-orbitron font-bold text-amber-300"
            >
              0%
            </span>
          </div>
        </div>

        {/* Primary Readout Row */}
        <div className="flex items-baseline justify-between gap-2">
          <div data-testid="ammo-counter" className="flex items-baseline gap-1.5 font-orbitron leading-none">
            <span ref={ammoCountRef} className={`text-2xl font-black tracking-wide ${countColorClass}`}>
              50
            </span>{' '}
            <span className="text-sm font-bold text-slate-400">/</span>{' '}
            <span aria-label="munición de reserva infinita" className="text-xl font-bold text-cyan-300">
              ∞
            </span>
          </div>

          <span
            ref={promptRef}
            style={{ opacity: 0 }}
            className={`text-[10px] font-mono font-bold tracking-wider transition-opacity ${
              status === 'EMPTY' || status === 'LOW' ? 'text-amber-300 animate-pulse' : 'text-slate-400'
            }`}
          >
            [R] / [X]
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden">
          <div ref={barRef} style={{ width: '100%' }} className={barColorClass} />
        </div>
      </div>
    </motion.div>
  );
};
