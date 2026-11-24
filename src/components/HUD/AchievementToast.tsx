import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Target,
  Zap,
  Shield,
  Gauge,
  Eye,
  Sparkles,
  Rocket,
  Award,
} from 'lucide-react';
import type { Achievement } from '../../game/achievements';

const ICON_MAP: Record<string, typeof Crosshair> = {
  crosshair: Crosshair,
  target: Target,
  zap: Zap,
  shield: Shield,
  gauge: Gauge,
  eye: Eye,
  sparkles: Sparkles,
  rocket: Rocket,
};

export const AchievementToast = () => {
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    const handleUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<Achievement>;
      if (!customEvent.detail) return;
      setCurrent(customEvent.detail);

      const timer = setTimeout(() => {
        setCurrent(null);
      }, 4200);

      return () => clearTimeout(timer);
    };

    window.addEventListener('achievement-unlocked', handleUnlocked);
    return () => {
      window.removeEventListener('achievement-unlocked', handleUnlocked);
    };
  }, []);

  const IconComponent = current?.iconName ? ICON_MAP[current.iconName] ?? Award : Award;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none select-none flex flex-col items-center">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-slate-950/90 border border-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.5)] backdrop-blur-xl min-w-[280px] sm:min-w-[360px]"
          >
            {/* Xbox Iconic Green Emblem */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-slate-950 font-bold shadow-[0_0_15px_#10b981] shrink-0">
              <IconComponent size={22} className="stroke-[2.5]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border border-slate-950 animate-ping" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black tracking-[0.25em] text-emerald-400 uppercase">
                  LOGRO DESBLOQUEADO // XBOX
                </span>
              </div>
              <h4 className="text-sm font-orbitron font-black text-white tracking-[0.1em] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                {current.title}
              </h4>
              <p className="text-[11px] font-mono text-slate-300 tracking-wide line-clamp-1">
                {current.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
