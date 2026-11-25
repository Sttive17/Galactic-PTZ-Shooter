import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, getRoundTotalTargets, isChapterBossLevel } from '../../game/gameState';
import { setAudioMood, playTensionAlarm, playShieldBreak, playPortalOpen } from '../../game/AudioSystem';
import { getDoctrineModifiers } from '../../game/armory';
import type { SoundMood } from '../../game/AudioSystem';

export const GameManager = () => {
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);
  const completeRound = useGameStore((state) => state.completeRound);
  const openChapterPortal = useGameStore((state) => state.openChapterPortal);
  const advanceTrainingWave = useGameStore((state) => state.advanceTrainingWave);
  const tickTime = useGameStore((state) => state.tickTime);
  const regenShield = useGameStore((state) => state.regenShield);
  const checking = useRef(false);
  const shieldRegenAccumRef = useRef(0);
  const audioTickAccumRef = useRef(0);
  const prevHasBossRef = useRef(false);
  const prevShieldRef = useRef(100);

  useEffect(() => {
    if (roundState === 'PLAYING') {
      checking.current = false;
      shieldRegenAccumRef.current = 0;
    }
  }, [roundState]);

  useFrame((_state, delta) => {
    // Drive game timer cleanly within the Three.js loop
    if (roundState === 'PLAYING' && mode === 'CHALLENGE') {
      tickTime(delta);
    }

    // Recharge player shield out of combat (10/s after 4.5s without damage)
    if (roundState === 'PLAYING' && (mode === 'CHALLENGE' || mode === 'TRAINING')) {
      shieldRegenAccumRef.current += delta;
      if (shieldRegenAccumRef.current >= 0.2) {
        shieldRegenAccumRef.current -= 0.2;
        const gs = useGameStore.getState();
        if (!gs.isPaused && gs.playerShield < gs.maxPlayerShield) {
          regenShield(2.0 * getDoctrineModifiers(gs.armory).shieldRegenMultiplier);
        }
      }
    }

    // Adaptive Audio Mood Director + Boss / Shield-Break audio triggers
    audioTickAccumRef.current += delta;
    if (audioTickAccumRef.current >= 0.25) {
      audioTickAccumRef.current -= 0.25;
      const gs = useGameStore.getState();
      const inCombat =
        (gs.mode === 'CHALLENGE' || gs.mode === 'TRAINING') &&
        !gs.isPaused &&
        gs.roundState === 'PLAYING';

      let nextMood: SoundMood = 'CALM';
      if (inCombat) {
        if (
          gs.playerHealth < 35 ||
          (gs.mode === 'CHALLENGE' && gs.timeRemaining > 0 && gs.timeRemaining < 12)
        ) {
          nextMood = 'CRITICAL';
        } else if (
          gs.bossInfo !== null ||
          gs.playerShield <= 0 ||
          (gs.mode === 'TRAINING' && gs.currentRound >= 4) ||
          (gs.mode === 'CHALLENGE' && gs.currentRound >= 8)
        ) {
          nextMood = 'HIGH_TENSION';
        } else {
          nextMood = 'COMBAT';
        }
      }
      setAudioMood(nextMood);

      const hasBoss = gs.bossInfo !== null;
      if (hasBoss && !prevHasBossRef.current && inCombat) {
        playTensionAlarm();
      }
      prevHasBossRef.current = hasBoss;

      if (inCombat && prevShieldRef.current > 0 && gs.playerShield <= 0) {
        playShieldBreak();
      }
      prevShieldRef.current = gs.playerShield;
    }
  });

  useEffect(() => {
    if (mode !== 'CHALLENGE' && mode !== 'TRAINING') return;

    let debounceTimer: number | undefined;
    const interval = window.setInterval(() => {
      if (roundState === 'PLAYING' && !checking.current) {
        const { currentRound, targetsDestroyed } = useGameStore.getState();
        const totalTargets = getRoundTotalTargets(mode, currentRound);

        if (targetsDestroyed > 0 && targetsDestroyed >= totalTargets) {
          checking.current = true;
          if (mode === 'TRAINING') {
            advanceTrainingWave();
            debounceTimer = window.setTimeout(() => {
              checking.current = false;
            }, 600);
          } else if (isChapterBossLevel(currentRound)) {
            playPortalOpen();
            openChapterPortal();
          } else {
            completeRound();
          }
        }
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
      if (debounceTimer !== undefined) {
        window.clearTimeout(debounceTimer);
      }
    };
  }, [mode, roundState, completeRound, openChapterPortal, advanceTrainingWave]);

  return null;
};
