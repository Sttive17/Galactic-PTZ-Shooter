import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowUp,
  Crosshair,
  DoorOpen,
  Flame,
  Pause,
  RotateCcw,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import { useGameStore } from '../../game/gameState';
import { initAudio, playPortalWarp, playSound } from '../../game/AudioSystem';
import { SceneState } from '../../game/sceneState';

type JoystickAxis = 'move' | 'look';
type HoldAction = 'fire' | 'zoom' | 'sprint';
type Action = HoldAction | 'jump' | 'reload' | 'pause' | 'portal' | 'emp' | 'overdrive';

interface VirtualJoystickProps {
  label: string;
  axis: JoystickAxis;
  onChange: (x: number, y: number) => void;
}

const VirtualJoystick = ({ label, axis, onChange }: VirtualJoystickProps) => {
  const padRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const reset = () => {
    activePointerRef.current = null;
    setOffset({ x: 0, y: 0 });
    onChange(0, 0);
  };

  const update = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pad = padRef.current;
    if (!pad) return;

    const bounds = pad.getBoundingClientRect();
    const padSize = Math.min(bounds.width, bounds.height);
    const radius = ((padSize * 0.58) / 2) * 0.9;
    const deltaX = event.clientX - (bounds.left + bounds.width / 2);
    const deltaY = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(deltaX, deltaY);
    const scale = distance > radius ? radius / distance : 1;
    const rawX = (deltaX * scale) / radius;
    const rawY = (deltaY * scale) / radius;
    const magnitude = Math.hypot(rawX, rawY);
    const deadzone = 0.12;
    const outputMagnitude = magnitude <= deadzone ? 0 : (magnitude - deadzone) / (1 - deadzone);
    const outputScale = magnitude > 0 ? outputMagnitude / magnitude : 0;
    const x = rawX * outputScale;
    const y = rawY * outputScale;

    setOffset({ x: rawX * radius, y: rawY * radius });
    onChange(x, y);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current === event.pointerId) update(event);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current === event.pointerId) reset();
  };

  return (
    <div
      ref={padRef}
      role="group"
      aria-label={label}
      className="pointer-events-auto relative flex touch-none items-center justify-center rounded-full border border-cyan-300/45 bg-slate-950/65 shadow-[0_0_24px_rgba(34,211,238,0.22)] backdrop-blur-md"
      style={{ width: 'clamp(5rem, calc(10vw + 3rem), 7rem)', height: 'clamp(5rem, calc(10vw + 3rem), 7rem)' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="pointer-events-none absolute inset-3 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute h-px w-3/4 bg-white/10" />
      <div className="pointer-events-none absolute h-3/4 w-px bg-white/10" />
      <div
        data-testid={`joystick-knob-${axis}`}
        className={`pointer-events-none absolute left-1/2 top-1/2 flex h-[42%] w-[42%] items-center justify-center rounded-full border shadow-[0_0_16px_rgba(34,211,238,0.3)] ${
          axis === 'move'
            ? 'border-cyan-200/70 bg-cyan-500/45'
            : 'border-violet-200/70 bg-violet-500/45'
        }`}
        style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }}
      >
        {axis === 'move' ? <ArrowUp size={18} /> : <Crosshair size={18} />}
      </div>
      <span className="pointer-events-none absolute -bottom-5 text-[9px] font-bold tracking-[0.18em] text-cyan-100/75">
        {label}
      </span>
    </div>
  );
};

interface ActionButtonProps {
  action: Action;
  label: string;
  icon: typeof Crosshair;
  prominent?: boolean;
}

const ActionButton = ({ action, label, icon: Icon, prominent = false }: ActionButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const isHoldAction = (value: Action): value is HoldAction =>
    value === 'fire' || value === 'zoom' || value === 'sprint';

  const setHoldState = (pressed: boolean) => {
    if (!isHoldAction(action)) return;
    SceneState.touchControls[action] = pressed;
    setPressed(pressed);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    initAudio();
    if (!isHoldAction(action)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setHoldState(true);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (isHoldAction(action) && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setHoldState(false);
  };

  const handleClick = () => {
    initAudio();
    if (action === 'jump') {
      window.dispatchEvent(new Event('touch-jump'));
    } else if (action === 'reload') {
      window.dispatchEvent(new Event('touch-reload'));
    } else if (action === 'emp') {
      window.dispatchEvent(new Event('touch-emp'));
    } else if (action === 'overdrive') {
      window.dispatchEvent(new Event('touch-overdrive'));
    } else if (action === 'pause') {
      useGameStore.getState().togglePause();
      playSound('ui');
    } else if (action === 'portal') {
      const state = useGameStore.getState();
      if (state.roundState === 'PORTAL_ACTIVE' && !state.isPaused) {
        playPortalWarp();
        state.enterChapterPortal();
      }
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isHoldAction(action) ? pressed : undefined}
      className={`pointer-events-auto flex h-12 w-12 touch-none flex-col items-center justify-center gap-0.5 rounded-2xl border text-[8px] font-bold tracking-wider shadow-lg backdrop-blur-md active:scale-95 ${
        prominent
          ? 'border-cyan-200/70 bg-cyan-500/55 text-white shadow-cyan-950/50'
          : 'border-white/20 bg-slate-950/70 text-slate-100'
      }`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

interface TouchControlsProps {
  enabled: boolean;
}

export const TouchControls = ({ enabled }: TouchControlsProps) => {
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);
  const isPaused = useGameStore((state) => state.isPaused);
  const isSettingsOpen = useGameStore((state) => state.isSettingsOpen);

  useEffect(() => {
    return () => SceneState.resetTouchControls();
  }, []);

  const isPlayingMode = mode === 'CHALLENGE' || mode === 'TRAINING';
  const isActiveRound = roundState === 'PLAYING' || roundState === 'PORTAL_ACTIVE';

  if (!enabled || !isPlayingMode || !isActiveRound || isPaused || isSettingsOpen) {
    return null;
  }

  const updateMove = (x: number, y: number) => {
    SceneState.touchControls.moveX = x;
    SceneState.touchControls.moveY = y;
  };

  const updateLook = (x: number, y: number) => {
    SceneState.touchControls.lookX = x;
    SceneState.touchControls.lookY = y;
  };

  return (
    <div data-testid="touch-controls" className="pointer-events-none fixed inset-0 z-40 select-none">
      <div className="absolute bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-[calc(0.75rem+env(safe-area-inset-left))]">
        <VirtualJoystick label="MOVER" axis="move" onChange={updateMove} />
      </div>

      <div className="absolute bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-[calc(0.75rem+env(safe-area-inset-right))]">
        <VirtualJoystick label="MIRAR" axis="look" onChange={updateLook} />
      </div>

      <div data-testid="touch-action-grid" className="absolute bottom-[calc(8.5rem+env(safe-area-inset-bottom))] right-[calc(0.75rem+env(safe-area-inset-right))] grid w-max grid-cols-3 justify-items-center gap-1">
        <ActionButton action="fire" label="FUEGO" icon={Target} prominent />
        <ActionButton action="jump" label="SALTAR" icon={ArrowUp} />
        <ActionButton action="zoom" label="ZOOM" icon={Crosshair} />
        <ActionButton action="reload" label="RECARGA" icon={RotateCcw} />
        <ActionButton action="sprint" label="CORRER" icon={Zap} />
        <ActionButton action="emp" label="EMP" icon={Shield} />
        <ActionButton action="overdrive" label="FRENESÍ" icon={Flame} />
        {roundState === 'PORTAL_ACTIVE' && (
          <ActionButton action="portal" label="ENTRAR" icon={DoorOpen} />
        )}
      </div>

      <div className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2">
        <ActionButton action="pause" label="PAUSA" icon={Pause} />
      </div>
    </div>
  );
};
