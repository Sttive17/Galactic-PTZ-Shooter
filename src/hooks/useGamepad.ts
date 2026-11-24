import { useState, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../game/config';

export interface GamepadState {
  connected: boolean;
  axes: {
    leftX: number;
    leftY: number;
    rightX: number;
    rightY: number;
  };
  buttons: {
    rt: number;
    lt: number;
    a: boolean;
    b: boolean;
    x: boolean;
    y: boolean;
    lb: boolean;
    rb: boolean;
    start: boolean;
    view: boolean;
  };
}

const applyDeadzone = (value: number, deadzone = GAME_CONFIG.gamepad.deadzone) => {
  return Math.abs(value) < deadzone ? 0 : value;
};

export const useGamepad = () => {
  const gamepadIndexRef = useRef<number | null>(null);
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: typeof navigator !== 'undefined' &&
      typeof navigator.getGamepads === 'function' &&
      Array.from(navigator.getGamepads()).some((gamepad) => gamepad !== null),
    axes: { leftX: 0, leftY: 0, rightX: 0, rightY: 0 },
    buttons: { rt: 0, lt: 0, a: false, b: false, x: false, y: false, lb: false, rb: false, start: false, view: false }
  });

  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
      
      // Standard Xbox controller mapping
      if (e.gamepad.mapping === 'standard') {
        gamepadIndexRef.current = e.gamepad.index;
        setGamepadState(s => ({ ...s, connected: true }));
      } else {
         // Also accept non standard if it's the only one
         gamepadIndexRef.current = e.gamepad.index;
         setGamepadState(s => ({ ...s, connected: true }));
      }
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      if (e.gamepad.index === gamepadIndexRef.current) {
        console.log('Gamepad disconnected');
        gamepadIndexRef.current = null;
        setGamepadState(s => ({ ...s, connected: false }));
      }
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gamepadIndexRef.current = gamepads[i]!.index;
        break;
      }
    }

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
    };
  }, []);

  return { gamepadState, gamepadIndexRef };
};

export const getGamepadInput = (index: number | null) => {
    if (index === null) return null;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[index];
    
    if (!gamepad) return null;

    return {
      leftX: applyDeadzone(gamepad.axes[0]),
      leftY: applyDeadzone(gamepad.axes[1]),
      rightX: applyDeadzone(gamepad.axes[2]),
      rightY: applyDeadzone(gamepad.axes[3]),
      a: gamepad.buttons[0]?.pressed || false,
      b: gamepad.buttons[1]?.pressed || false,
      x: gamepad.buttons[2]?.pressed || false,
      y: gamepad.buttons[3]?.pressed || false,
      lb: gamepad.buttons[4]?.pressed || false,
      rb: gamepad.buttons[5]?.pressed || false,
      lt: gamepad.buttons[6]?.value || 0,
      rt: gamepad.buttons[7]?.value || 0,
      view: gamepad.buttons[8]?.pressed || false,
      start: gamepad.buttons[9]?.pressed || false,
    };
}
