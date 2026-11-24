import { useGameStore, isBossRound, isTrainingBossWave } from '../../game/gameState';
import { useGamepad } from '../../hooks/useGamepad';
import { initAudio } from '../../game/AudioSystem';
import {
  IconBadge,
  CampaignIcon,
  OrbitalLinkIcon,
  AudioWaveIcon,
  AudioMutedIcon,
} from './SciFiIcons';

export const TopBar = () => {
  const mode = useGameStore((state) => state.mode);
  const currentRound = useGameStore((state) => state.currentRound);
  const sectorName = useGameStore((state) => state.currentMap.theme.name);
  const muted = useGameStore((state) => state.preferences.muted);
  const setMuted = useGameStore((state) => state.setMuted);
  const { gamepadState } = useGamepad();

  const isWaveMode = mode === 'TRAINING';
  const isBoss = isWaveMode
    ? isTrainingBossWave(currentRound)
    : mode === 'CHALLENGE' && isBossRound(currentRound);

  const toggleMute = () => {
    initAudio();
    setMuted(!muted);
  };

  const waveBadge =
    currentRound >= 12
      ? { cls: 'border-fuchsia-400/35 text-fuchsia-300 bg-fuchsia-950/35', label: `OLEADA ${currentRound}` }
      : currentRound >= 8
        ? { cls: 'border-red-400/35 text-red-300 bg-red-950/35', label: `OLEADA ${currentRound}` }
        : currentRound >= 5
          ? { cls: 'border-amber-400/35 text-amber-300 bg-amber-950/35', label: `OLEADA ${currentRound}` }
          : { cls: 'border-emerald-400/35 text-emerald-300 bg-emerald-950/35', label: `OLEADA ${currentRound}` };

  return (
    <div className="absolute top-0 left-0 right-0 h-10 bg-slate-950/45 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-5 z-20 pointer-events-none">
      {/* Left - Brand */}
      <div className="flex items-center gap-2">
        <IconBadge accent="cyan" size="sm" shape="hex">
          <CampaignIcon size={13} />
        </IconBadge>
        <span className="text-[11px] font-orbitron font-bold tracking-[0.22em] text-slate-100">
          PTZ
        </span>
      </div>

      {/* Center - Mode, Sector & Status */}
      <div className="flex items-center gap-2.5 text-[10px] font-mono">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-200 tracking-[0.18em] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          {mode === 'CHALLENGE' ? 'CAMPAÑA' : 'OLEADAS'}
        </span>

        <span className="hidden md:inline-block text-slate-400 tracking-[0.14em] truncate max-w-[180px]">
          {sectorName}
        </span>

        {isBoss ? (
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-rose-400/45 bg-rose-950/45 text-rose-300 font-bold tracking-[0.16em]">
            JEFE · {isWaveMode ? `O${currentRound}` : `N${currentRound}`}
          </span>
        ) : isWaveMode ? (
          <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full border font-bold tracking-[0.16em] ${waveBadge.cls}`}>
            {waveBadge.label}
          </span>
        ) : (
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-200 font-semibold tracking-[0.16em]">
            NVL {currentRound}
          </span>
        )}
      </div>

      {/* Right - Input Link & Compact Mute Button */}
      <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider">
        <div className="flex items-center gap-1.5">
          <OrbitalLinkIcon
            size={14}
            className={
              gamepadState.connected
                ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]'
                : 'text-slate-400'
            }
          />
          <span className={gamepadState.connected ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
            {gamepadState.connected ? 'XBOX' : 'PC'}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          title={muted ? 'Activar audio' : 'Silenciar audio'}
          className={`pointer-events-auto p-1.5 rounded-lg border transition-all cursor-pointer ${
            muted
              ? 'bg-rose-950/50 hover:bg-rose-900/60 border-rose-400/40 text-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.2)]'
              : 'bg-cyan-950/40 hover:bg-cyan-900/50 border-cyan-400/35 text-cyan-200 hover:text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
          }`}
        >
          {muted ? <AudioMutedIcon size={14} /> : <AudioWaveIcon size={14} />}
        </button>
      </div>
    </div>
  );
};
