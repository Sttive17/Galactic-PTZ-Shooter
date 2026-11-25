import { Vector3 } from 'three';

export const ENEMY_ARCHETYPES = [
  'SCOUT',
  'STRIKER',
  'FLANKER',
  'SNIPER',
  'TACTICIAN',
  'SWARMER',
  'ARTILLERY',
  'PHANTOM_SNIPER',
  'JUGGERNAUT',
  'KAMIKAZE',
  'HEALER',
] as const;

export type EnemyArchetype = (typeof ENEMY_ARCHETYPES)[number];

export type BossStyle =
  | 'STRIKER'
  | 'SHIELD_GENERATORS'
  | 'BULLET_STORM'
  | 'PHANTOM_BLINK'
  | 'ARTILLERY_FORTRESS'
  | 'HYBRID_SHIELD_BLINK'
  | 'HYBRID_STORM_ARTILLERY'
  | 'OMEGA_HYBRID';

export interface Target {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: number;
  health: number;
  maxHealth: number;
  points: number;
  active: boolean;
  velocity?: [number, number, number];
  isBoss?: boolean;
  bossName?: string;
  bossTier?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  bossStyle?: BossStyle;
  isGenerator?: boolean;
  isCrate?: boolean;
  isArmored?: boolean;
  canShoot?: boolean;
  enemyType?: EnemyArchetype;
  flankAngle?: number;
  flankDir?: 1 | -1;
}

export interface Projectile {
  id: string;
  position: Vector3;
  velocity: Vector3;
  createdAt: number;
  active: boolean;
}

export type PTZOpticalMode = 'NORMAL' | 'THERMAL' | 'NIGHT_VISION';

export type WeaponArchetype =
  | 'PLASMA_RIFLE'
  | 'SCATTER_SHOTGUN'
  | 'HEAVY_RAILGUN'
  | 'MICRO_MISSILES'
  | 'CRYO_BEAM';

export interface PilotStats {
  killsTotal: number;
  bossesDefeated: number;
  shotsFired: number;
  shotsHit: number;
  highestCombo: number;
  highScore: number;
  nanitesCollected: number;
  totalDamageDealt: number;
  missionsCompleted: number;
}

export type CombatDropKind = 'SHIELD' | 'AMMO' | 'NANITE';

export type CinematicState = 'NONE' | 'DEPLOYMENT' | 'BOSS_INTRO' | 'BOSS_VICTORY';

export interface BossIntroData {
  name: string;
  subtitle: string;
  tier: number;
  style: string;
}

export interface CombatDrop {
  id: string;
  kind: CombatDropKind;
  position: Vector3;
  velocity: Vector3;
  age: number;
  maxAge: number;
  value: number;
  active: boolean;
}
