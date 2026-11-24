// Gamepad Haptic Vibration Engine for Xbox and standard Gamepads
import { useGameStore } from './gameState';

export type HapticPreset =
  | 'fire'
  | 'hit'
  | 'crit'
  | 'damage'
  | 'reload'
  | 'jump'
  | 'dash'
  | 'bossDeath'
  | 'alarm';

export function triggerHaptic(preset: HapticPreset, customIndex?: number | null) {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

  const prefs = useGameStore.getState().preferences;
  if (prefs && prefs.vibration === false) return;

  const gamepads = navigator.getGamepads();
  const gpIndex = customIndex ?? null;

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (!gp) continue;
    if (gpIndex !== null && gp.index !== gpIndex) continue;

    // Extended gamepad actuator interface
    const actuator = (gp as unknown as { vibrationActuator?: { playEffect: (type: string, params: Record<string, number>) => Promise<unknown> } }).vibrationActuator;
    if (!actuator || typeof actuator.playEffect !== 'function') continue;

    try {
      switch (preset) {
        case 'fire':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 45,
            weakMagnitude: 0.35,
            strongMagnitude: 0.15,
          }).catch(() => {});
          break;

        case 'hit':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 35,
            weakMagnitude: 0.25,
            strongMagnitude: 0.05,
          }).catch(() => {});
          break;

        case 'crit':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 65,
            weakMagnitude: 0.6,
            strongMagnitude: 0.3,
          }).catch(() => {});
          break;

        case 'damage':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 180,
            weakMagnitude: 0.5,
            strongMagnitude: 0.8,
          }).catch(() => {});
          break;

        case 'reload':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 50,
            weakMagnitude: 0.3,
            strongMagnitude: 0.1,
          }).then(() => {
            setTimeout(() => {
              actuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: 60,
                weakMagnitude: 0.45,
                strongMagnitude: 0.2,
              }).catch(() => {});
            }, 260);
          }).catch(() => {});
          break;

        case 'dash':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 90,
            weakMagnitude: 0.7,
            strongMagnitude: 0.4,
          }).catch(() => {});
          break;

        case 'jump':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 50,
            weakMagnitude: 0.25,
            strongMagnitude: 0.1,
          }).catch(() => {});
          break;

        case 'bossDeath':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 650,
            weakMagnitude: 0.85,
            strongMagnitude: 1.0,
          }).catch(() => {});
          break;

        case 'alarm':
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 100,
            weakMagnitude: 0.4,
            strongMagnitude: 0.3,
          }).catch(() => {});
          break;
      }
    } catch {
      // Ignore vibration error on unsupported hardware
    }
  }
}
