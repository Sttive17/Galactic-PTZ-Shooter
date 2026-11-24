import * as THREE from 'three';
import { SceneState } from './sceneState';
import type { CombatDropKind } from '../types/game';

export const spawnCombatDrop = (pos: THREE.Vector3, forcedKind?: CombatDropKind) => {
  if (SceneState.drops.length >= 32) {
    SceneState.drops.shift();
  }
  const rand = Math.random();
  const kind: CombatDropKind =
    forcedKind ?? (rand < 0.44 ? 'SHIELD' : rand < 0.8 ? 'AMMO' : 'NANITE');

  SceneState.drops.push({
    id: `drop_${Date.now()}_${Math.random()}`,
    kind,
    position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 0.5, (Math.random() - 0.5) * 1.5)),
    velocity: new THREE.Vector3((Math.random() - 0.5) * 3, 3 + Math.random() * 2, (Math.random() - 0.5) * 3),
    age: 0,
    maxAge: 25,
    value: kind === 'SHIELD' ? 25 : kind === 'AMMO' ? 50 : 15,
    active: true,
  });
};
