import * as THREE from 'three';
import type { Target, Projectile } from '../types/game';
import type { MapBox } from './mapGenerator';

export interface AllyRadarEntry {
  id: number;
  active: boolean;
  role: 0 | 1 | 2;
  x: number;
  y: number;
  z: number;
  hasTarget: boolean;
}

export const PLAYER_EYE_HEIGHT = 2.0;
export const PLAYER_START_POS = new THREE.Vector3(0, PLAYER_EYE_HEIGHT, 14);

// Mutable state for high-frequency game loop updates (collisions, movement, FPS player)
// Avoids React re-renders for every frame
export const SceneState = {
  targets: [] as Target[],
  projectiles: [] as Projectile[],
  colliders: [] as MapBox[],

  // First-person player transform & physics state
  playerPosition: PLAYER_START_POS.clone(),
  playerVelocity: new THREE.Vector3(0, 0, 0),
  playerForward: new THREE.Vector3(0, 0, -1),
  muzzlePosition: new THREE.Vector3(0.32, 1.77, 13.4),
  isGrounded: true,
  moveSpeedNormalized: 0,
  weaponRecoil: 0,
  stamina: 100,
  isExhausted: false,
  isSprintingNow: false,
  ammo: 50,
  maxAmmo: 50,
  isReloading: false,
  reloadProgress: 0,
  reloadDuration: 1.35,
  portalDistance: 0,
  allies: [0, 1, 2].map((id) => ({
    id,
    active: false,
    role: id as 0 | 1 | 2,
    x: 0,
    y: 0,
    z: 0,
    hasTarget: false,
  })) as AllyRadarEntry[],

  resetAllies: () => {
    for (let i = 0; i < SceneState.allies.length; i++) {
      const ally = SceneState.allies[i];
      ally.active = false;
      ally.hasTarget = false;
      ally.x = 0;
      ally.y = 0;
      ally.z = 0;
    }
  },

  resetPlayerPosition: () => {
    SceneState.playerPosition.copy(PLAYER_START_POS);
    SceneState.playerVelocity.set(0, 0, 0);
    SceneState.playerForward.set(0, 0, -1);
    SceneState.muzzlePosition.set(0.32, 1.77, 13.4);
    SceneState.isGrounded = true;
    SceneState.moveSpeedNormalized = 0;
    SceneState.weaponRecoil = 0;
    SceneState.stamina = 100;
    SceneState.isExhausted = false;
    SceneState.isSprintingNow = false;
    SceneState.ammo = SceneState.maxAmmo;
    SceneState.isReloading = false;
    SceneState.reloadProgress = 0;
    SceneState.portalDistance = 24;
    SceneState.resetAllies();
  },
  
  // Callbacks to trigger React re-renders when necessary (e.g. target destroyed)
  onTargetDestroyed: (_id: string) => {},
  onTargetHit: (_id: string, _newHealth: number) => {},
};
