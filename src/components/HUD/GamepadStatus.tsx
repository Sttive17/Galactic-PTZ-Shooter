import { Gamepad2, Keyboard } from 'lucide-react';
import { useGamepad } from '../../hooks/useGamepad';

export const GamepadStatus = () => {
  const { gamepadState } = useGamepad();

  return (
    <div className="hidden sm:flex items-center gap-1.5 absolute bottom-4 right-5 px-2.5 py-1 rounded-full bg-slate-950/45 backdrop-blur-md border border-white/10 pointer-events-none z-10 text-[10px] font-mono tracking-widest">
      {gamepadState.connected ? (
        <>
          <Gamepad2 size={12} className="text-emerald-400" />
          <span className="text-emerald-300 font-semibold">XBOX</span>
        </>
      ) : (
        <>
          <Keyboard size={12} className="text-cyan-400" />
          <span className="text-slate-300 font-semibold">PC</span>
        </>
      )}
    </div>
  );
};
