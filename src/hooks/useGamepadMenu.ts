import { useState, useEffect, useRef } from 'react';
import { playSound } from '../game/AudioSystem';
import { triggerHaptic } from '../game/haptics';

interface UseGamepadMenuOptions {
  enabled: boolean;
  itemCount: number;
  initialIndex?: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  axis?: 'vertical' | 'horizontal';
}

export function useGamepadMenu({
  enabled,
  itemCount,
  initialIndex = 0,
  onSelect,
  onBack,
  axis = 'vertical',
}: UseGamepadMenuOptions) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const selectedIndexRef = useRef(initialIndex);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const lastNavTimeRef = useRef(0);
  const wasAPressedRef = useRef(false);
  const wasBPressedRef = useRef(false);

  useEffect(() => {
    if (!enabled || itemCount <= 0) return;

    let rafId = 0;

    const poll = () => {
      const now = performance.now();
      const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
      let activeGp = null;

      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          activeGp = gamepads[i];
          break;
        }
      }

      if (activeGp) {
        const threshold = 0.55;
        const lsX = activeGp.axes[0] || 0;
        const lsY = activeGp.axes[1] || 0;
        const dUp = activeGp.buttons[12]?.pressed || false;
        const dDown = activeGp.buttons[13]?.pressed || false;
        const dLeft = activeGp.buttons[14]?.pressed || false;
        const dRight = activeGp.buttons[15]?.pressed || false;

        const aPressed = activeGp.buttons[0]?.pressed || false;
        const bPressed = activeGp.buttons[1]?.pressed || false;

        // Navigation input
        let delta = 0;
        if (axis === 'vertical') {
          if (dUp || lsY < -threshold) delta = -1;
          else if (dDown || lsY > threshold) delta = 1;
        } else {
          if (dLeft || lsX < -threshold) delta = -1;
          else if (dRight || lsX > threshold) delta = 1;
        }

        if (delta !== 0 && now - lastNavTimeRef.current > 220) {
          lastNavTimeRef.current = now;
          const next = (selectedIndexRef.current + delta + itemCount) % itemCount;
          setSelectedIndex(next);
          playSound('ui');
          triggerHaptic('hit');
        }

        // A button -> Select
        if (aPressed && !wasAPressedRef.current) {
          triggerHaptic('fire');
          playSound('ui');
          onSelect?.(selectedIndexRef.current);
        }
        wasAPressedRef.current = aPressed;

        // B button -> Back
        if (bPressed && !wasBPressedRef.current) {
          triggerHaptic('alarm');
          playSound('ui');
          onBack?.();
        }
        wasBPressedRef.current = bPressed;
      }

      rafId = requestAnimationFrame(poll);
    };

    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, itemCount, axis, onSelect, onBack]);

  return { selectedIndex, setSelectedIndex };
}
