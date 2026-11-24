import * as THREE from 'three';
import type { Target, Projectile, CombatDrop } from '../types/game';
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

export interface TouchControlsState {
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  fire: boolean;
  zoom: boolean;
  sprint: boolean;
}

export const PLAYER_EYE_HEIGHT = 2.0;
export const PLAYER_START_POS = new THREE.Vector3(0, PLAYER_EYE_HEIGHT, 14);

// Mutable state for high-frequency game loop updates (collisions, movement, FPS player)
// Avoids React re-renders for every frame
export const SceneState = {
  targets: [] as Target[],
  projectiles: [] as Projectile[],
  drops: [] as CombatDrop[],
  colliders: [] as MapBox[],
  touchControls: {
    moveX: 0,
    moveY: 0,
    lookX: 0,
    lookY: 0,
    fire: false,
    zoom: false,
    sprint: false,
  } as TouchControlsState,

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
  dashCooldownTimer: 0,
  dashDurationTimer: 0,
  isDashing: false,
  ammo: 50,
  maxAmmo: 50,
  isReloading: false,
  reloadProgress: 0,
  reloadDuration: 1.35,
  portalDistance: 0,
  resetTouchControls: () => {
    SceneState.touchControls.moveX = 0;
    SceneState.touchControls.moveY = 0;
    SceneState.touchControls.lookX = 0;
    SceneState.touchControls.lookY = 0;
    SceneState.touchControls.fire = false;
    SceneState.touchControls.zoom = false;
    SceneState.touchControls.sprint = false;
  },
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
    SceneState.dashCooldownTimer = 0;
    SceneState.dashDurationTimer = 0;
    SceneState.isDashing = false;
    SceneState.drops = [];
    SceneState.ammo = SceneState.maxAmmo;
    SceneState.isReloading = false;
    SceneState.reloadProgress = 0;
    SceneState.portalDistance = 24;
    SceneState.resetTouchControls();
    SceneState.resetAllies();
  },
  
  // Callbacks to trigger React re-renders when necessary (e.g. target destroyed)
  onTargetDestroyed: (_id: string) => {},
  onTargetHit: (_id: string, _newHealth: number) => {},
};
