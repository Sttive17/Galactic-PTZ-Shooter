import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Target, EnemyArchetype, BossStyle } from '../../types/game';
import { SceneState } from '../../game/sceneState';
import {
  useGameStore,
  isBossRound,
  isTrainingBossWave,
  getTrainingBossCounts,
  getRoundTotalTargets,
  getBossTierForRound,
} from '../../game/gameState';
import { BossVisual, DroneVisual } from './EnemyVisuals';
import { usePreloadedModel } from '../../game/modelLoader';
import { playSound } from '../../game/AudioSystem';
import { triggerHaptic } from '../../game/haptics';
import * as THREE from 'three';

type BossTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface BossConfig {
  tier: BossTier;
  name: string;
  subtitle: string;
  style: BossStyle;
  scale: number;
  escortCount: number;
  escortType?: 'SCOUT' | 'FLANKER' | 'SWARMER' | 'MIXED';
  generatorCount: number;
}

const BOSS_CONFIGS: Record<BossTier, BossConfig> = {
  1: {
    tier: 1,
    name: 'CENTINELA ALFA',
    subtitle: 'INTERCEPTOR RÁPIDO · RÁFAGAS DE PLASMA',
    style: 'STRIKER',
    scale: 1.0,
    escortCount: 2,
    escortType: 'SCOUT',
    generatorCount: 0,
  },
  2: {
    tier: 2,
    name: 'TITÁN AEGIS',
    subtitle: 'ESCUDO INVULNERABLE · 3 GENERADORES',
    style: 'SHIELD_GENERATORS',
    scale: 1.05,
    escortCount: 0,
    generatorCount: 3,
  },
  3: {
    tier: 3,
    name: 'LEVIATÁN TORMENTA',
    subtitle: 'TORMENTA DE BALAS · RÁFAGAS Y ABANICO',
    style: 'BULLET_STORM',
    scale: 1.1,
    escortCount: 3,
    escortType: 'SCOUT',
    generatorCount: 0,
  },
  4: {
    tier: 4,
    name: 'ESPECTRO FASE',
    subtitle: 'TELETRANSPORTE 360° · FRANCOTIRADOR ÉLITE',
    style: 'PHANTOM_BLINK',
    scale: 1.0,
    escortCount: 3,
    escortType: 'FLANKER',
    generatorCount: 0,
  },
  5: {
    tier: 5,
    name: 'ACORAZADO ARTILLERO',
    subtitle: 'ARTILLERÍA PESADA · OLEADAS Y SALVAS PREDICTIVAS',
    style: 'ARTILLERY_FORTRESS',
    scale: 1.15,
    escortCount: 3,
    escortType: 'SWARMER',
    generatorCount: 0,
  },
  6: {
    tier: 6,
    name: 'HIDRA FASE-ESCUDO',
    subtitle: 'HÍBRIDO · 3 GENERADORES + TELETRANSPORTE',
    style: 'HYBRID_SHIELD_BLINK',
    scale: 1.1,
    escortCount: 0,
    generatorCount: 3,
  },
  7: {
    tier: 7,
    name: 'VÓRTICE ESTELAR',
    subtitle: 'HÍBRIDO · ESPIRAL ROTATORIA + ARTILLERÍA',
    style: 'HYBRID_STORM_ARTILLERY',
    scale: 1.15,
    escortCount: 3,
    escortType: 'MIXED',
    generatorCount: 0,
  },
  8: {
    tier: 8,
    name: 'NÚCLEO OMEGA',
    subtitle: 'HÍBRIDO OMEGA · 4 GENERADORES + TORMENTA + TELETRANSPORTE',
    style: 'OMEGA_HYBRID',
    scale: 1.2,
    escortCount: 0,
    generatorCount: 4,
  },
};

const GEN_POSITIONS_3: [number, number, number][] = [
  [-26, 7.5, -14],
  [0, 10.5, -20],
  [26, 7.5, -14],
];

const GEN_POSITIONS_4: [number, number, number][] = [
  [-29, 7.0, -11],
  [-12, 10.5, -24],
  [12, 10.5, -24],
  [29, 7.0, -11],
];

const _bossTargetDir = new THREE.Vector3();
const _bossQuat = new THREE.Quaternion();
const _upAxis = new THREE.Vector3(0, 1, 0);
const _toPlayer = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();
const _strafeDir = new THREE.Vector3();
const _leadPos = new THREE.Vector3();
const _losOrigin = new THREE.Vector3();
const _losDir = new THREE.Vector3();
const _losHit = new THREE.Vector3();
const _losRay = new THREE.Ray();

function hasLineOfSight(
  ox: number,
  oy: number,
  oz: number,
  px: number,
  py: number,
  pz: number
): boolean {
  _losDir.set(px - ox, py - oy, pz - oz);
  const dist = _losDir.length();
  if (dist < 0.05) return true;
  _losDir.divideScalar(dist);
  _losOrigin.set(ox, oy, oz);
  _losRay.set(_losOrigin, _losDir);

  for (const box of SceneState.colliders) {
    if (box.kind === 'jumppad') continue;
    if (_losRay.intersectBox(box.box3, _losHit)) {
      if (_losOrigin.distanceTo(_losHit) < dist - 0.35) {
        return false;
      }
    }
  }
  return true;
}

function computeLeadAim(
  ox: number,
  oy: number,
  oz: number,
  projSpeed: number,
  leadFactor: number,
  outVec: THREE.Vector3
) {
  const pPos = SceneState.playerPosition;
  const dist = Math.hypot(pPos.x - ox, pPos.y - oy, pPos.z - oz);
  const travelTime = THREE.MathUtils.clamp(dist / Math.max(1, projSpeed), 0.08, 0.95) * leadFactor;
  outVec.set(
    pPos.x + SceneState.playerVelocity.x * travelTime,
    pPos.y - 0.15 + SceneState.playerVelocity.y * 0.3 * travelTime,
    pPos.z + SceneState.playerVelocity.z * travelTime
  );
}

function dispatchEnemyFan(
  x: number,
  y: number,
  z: number,
  targetX: number,
  targetY: number,
  targetZ: number,
  boltCount: number,
  spreadStep: number,
  projSpeed: number,
  damage: number
) {
  _bossTargetDir.set(targetX - x, targetY - y, targetZ - z).normalize();

  const half = (boltCount - 1) / 2;
  for (let i = 0; i < boltCount; i++) {
    const angleRad = (i - half) * spreadStep;
    _bossQuat.setFromAxisAngle(_upAxis, angleRad);
    const dir = _bossTargetDir.clone().applyQuaternion(_bossQuat);

    window.dispatchEvent(
      new CustomEvent('boss-fire-projectile', {
        detail: {
          origin: [x, y - 0.25, z],
          velocity: [dir.x * projSpeed, dir.y * projSpeed, dir.z * projSpeed],
          damage,
        },
      })
    );
  }
}

function getSafeSpawnPosition(x: number, y: number, z: number): [number, number, number] {
  let safeY = y;
  for (const box of SceneState.colliders) {
    if (
      x > box.minX - 1.5 &&
      x < box.maxX + 1.5 &&
      z > box.minZ - 1.5 &&
      z < box.maxZ + 1.5 &&
      safeY < box.maxY + 1.5
    ) {
      safeY = Math.max(safeY, box.maxY + 2.5);
    }
  }
  return [x, Math.min(24, safeY), z];
}

const GeneratorMesh = ({ target }: { target: Target }) => {
  const groupRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const [baseY] = useState(target.position[1]);
  const [phase] = useState(() => Math.random() * Math.PI * 2);

  const currentTargetId = useGameStore((state) => state.currentTarget?.id);
  const isTargeted = currentTargetId === target.id;
  const isDamaged = target.health < target.maxHealth;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const gameState = useGameStore.getState();
    if (gameState.isPaused || gameState.roundState !== 'PLAYING') return;

    const t = state.clock.elapsedTime + phase;
    const y = baseY + Math.sin(t * 2.2) * 0.45;
    target.position[1] = y;
    groupRef.current.position.set(target.position[0], y, target.position[2]);

    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 2.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 1.8;
      ring1Ref.current.rotation.z += delta * 1.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 2.4;
      ring2Ref.current.rotation.x -= delta * 0.9;
    }
  });

  const mainColor = isTargeted ? '#ef4444' : isDamaged ? '#f43f5e' : '#06b6d4';
  const accentColor = isTargeted ? '#fda4af' : isDamaged ? '#fb7185' : '#a855f7';
  const genModel = usePreloadedModel('POWER_GENERATOR');

  return (
    <group ref={groupRef} position={target.position} scale={target.scale}>
      {/* 3D Sci-Fi Power Generator Chassis */}
      {genModel && (
        <primitive object={genModel} scale={[0.32, 0.32, 0.32]} position={[0, -0.35, 0]} />
      )}
      {/* Central glowing octahedral crystal */}
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[0.36, 0]} />
        <meshPhysicalMaterial
          color={mainColor}
          emissive={mainColor}
          emissiveIntensity={2.6}
          roughness={0.12}
          metalness={0.6}
          toneMapped={false}
        />
      </mesh>
      {/* Vertical energy pylon core + beacon */}
      <mesh>
        <cylinderGeometry args={[0.14, 0.14, 1.05, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 2.4, 8]} />
        <meshBasicMaterial color={mainColor} transparent opacity={0.38} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Twin counter-rotating energy rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.56, 0.025, 8, 28]} />
        <meshBasicMaterial color={mainColor} toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.7, 0.018, 8, 28]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
    </group>
  );
};

const CrateMesh = ({ target }: { target: Target }) => {
  const groupRef = useRef<THREE.Group>(null);
  const crateModel = usePreloadedModel('SCIFI_CRATE');
  const currentTargetId = useGameStore((state) => state.currentTarget?.id);
  const isTargeted = currentTargetId === target.id;
  const isDamaged = target.health < target.maxHealth;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.set(target.position[0], target.position[1] + Math.sin(t * 2) * 0.05, target.position[2]);
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;
  });

  const glowColor = isTargeted ? '#ef4444' : isDamaged ? '#f59e0b' : '#38bdf8';

  return (
    <group ref={groupRef} position={target.position} scale={target.scale}>
      {crateModel ? (
        <primitive object={crateModel} scale={[0.85, 0.85, 0.85]} />
      ) : (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
      )}
      {/* Floating Tactical Marker / Loot Hologram */}
      <mesh position={[0, 0.9, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color={glowColor} wireframe toneMapped={false} />
      </mesh>
    </group>
  );
};

const BossMesh = ({ target, currentRound }: { target: Target; currentRound: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const patrolTimeRef = useRef(0);
  const attackTimerRef = useRef(0.8);
  const cycleRef = useRef(0);
  const burstRemainingRef = useRef(0);
  const blinkTimerRef = useRef(3.2);
  const blinkAnchorRef = useRef<[number, number, number]>([0, 14, -30]);
  const spiralStepRef = useRef(0);
  const prevHealthRef = useRef(target.health);
  const evadeTimerRef = useRef(0);
  const evadeCooldownRef = useRef(0);
  const evadeDirRef = useRef<1 | -1>(1);
  const losClimbRef = useRef(0);

  const currentTargetId = useGameStore((state) => state.currentTarget?.id);
  const isShielded = useGameStore((state) => state.bossInfo?.shielded ?? false);
  const mode = useGameStore((state) => state.mode);
  const isWaveMode = mode === 'TRAINING';
  const isTargeted = currentTargetId === target.id;
  const bossIndex = isWaveMode ? Math.max(1, Math.floor(currentRound / 3)) : Math.max(1, Math.floor(currentRound / 5));
  const tier = target.bossTier || (isWaveMode ? getTrainingBossCounts(currentRound).tier : getBossTierForRound(currentRound));
  const config = BOSS_CONFIGS[tier];

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const gameState = useGameStore.getState();
    if (gameState.isPaused || gameState.roundState !== 'PLAYING') return;

    const slowStacks = gameState.activePowers.SLOW_MO_DRONES || 0;
    const slowMult = Math.max(0.35, 1 - slowStacks * 0.25);
    const moveDelta = Math.min(delta, 0.05) * slowMult;

    patrolTimeRef.current += moveDelta;
    const t = patrolTimeRef.current;
    const style = target.bossStyle || config.style;
    const shieldBroken = !gameState.bossInfo?.shielded;

    // Reactive lateral evasion burst when boss takes rapid hits
    const tookDamage = target.health < prevHealthRef.current;
    prevHealthRef.current = target.health;
    evadeCooldownRef.current = Math.max(0, evadeCooldownRef.current - moveDelta);
    evadeTimerRef.current = Math.max(0, evadeTimerRef.current - moveDelta);
    losClimbRef.current = Math.max(0, losClimbRef.current - moveDelta * 2.2);

    if (tookDamage && evadeCooldownRef.current <= 0) {
      evadeTimerRef.current = 0.5;
      evadeCooldownRef.current = 2.1;
      evadeDirRef.current = Math.random() > 0.5 ? 1 : -1;
    }

    // 1. Movement & Teleportation per Boss Style
    let x = 0;
    let y = 12;
    let z = -32;

    const usesBlink =
      style === 'PHANTOM_BLINK' ||
      style === 'HYBRID_SHIELD_BLINK' ||
      (style === 'OMEGA_HYBRID' && shieldBroken);

    if (usesBlink) {
      blinkTimerRef.current -= moveDelta;
      if (blinkTimerRef.current <= 0) {
        blinkTimerRef.current =
          style === 'PHANTOM_BLINK' ? 3.8 : style === 'HYBRID_SHIELD_BLINK' ? (shieldBroken ? 3.2 : 4.4) : 3.6;
        const ang = Math.random() * Math.PI * 2;
        const rad = 22 + Math.random() * 12;
        let bx = SceneState.playerPosition.x + Math.cos(ang) * rad;
        let bz = SceneState.playerPosition.z + Math.sin(ang) * rad;
        const relZ = bz + 10;
        const hr = Math.hypot(bx, relZ);
        if (hr > 46) {
          bx = (bx / hr) * 46;
          bz = (relZ / hr) * 46 - 10;
        }
        const by = 9 + Math.random() * 7;
        blinkAnchorRef.current = [bx, by, bz];
      }
      const [ax, ay, az] = blinkAnchorRef.current;
      x = ax + Math.sin(t * 1.4) * 3.0;
      y = ay + Math.cos(t * 1.8) * 1.8;
      z = az + Math.cos(t * 1.4) * 3.0;
    } else if (tier === 1) {
      x = Math.sin(t * 0.85) * 32;
      y = 12 + Math.sin(t * 1.7) * 5;
      z = -32 + Math.cos(t * 0.85) * 10;
    } else if (tier === 2) {
      x = Math.sin(t * 0.95) * 34;
      y = 13 + Math.cos(t * 1.4) * 5.5;
      z = -30 + Math.sin(t * 0.5) * 11;
    } else if (tier === 3) {
      x = Math.sin(t * 1.2) * 36;
      y = 12 + Math.sin(t * 2.2) * 6;
      z = -28 + Math.cos(t * 0.95) * 12;
    } else if (tier === 5) {
      x = Math.sin(t * 0.68) * 35;
      y = 14 + Math.cos(t * 1.1) * 4;
      z = -34 + Math.cos(t * 0.68) * 9;
    } else if (tier === 7) {
      x = Math.sin(t * 1.3) * 37;
      y = 13 + Math.sin(t * 2.3) * 6;
      z = -26 + Math.cos(t * 1.1) * 14;
    } else {
      x = Math.sin(t * 1.35) * 38;
      y = 13 + Math.sin(t * 2.5) * 6.5;
      z = -28 + Math.cos(t * 1.1) * 14;
    }

    if (evadeTimerRef.current > 0) {
      const evadeWave = Math.sin((evadeTimerRef.current / 0.5) * Math.PI);
      x = THREE.MathUtils.clamp(x + evadeDirRef.current * evadeWave * 6.5, -42, 42);
      y += evadeWave * 2.4;
    }
    y = Math.min(24, y + losClimbRef.current);

    target.position[0] = x;
    target.position[1] = y;
    target.position[2] = z;
    groupRef.current.position.set(x, y, z);
    groupRef.current.lookAt(SceneState.playerPosition.x, y, SceneState.playerPosition.z);
    // Menacing dynamic banking into turns for massive boss craft
    const bossBank = THREE.MathUtils.clamp((x - (target.velocity ? target.velocity[0] : 0)) * -0.008, -0.28, 0.28);
    groupRef.current.rotation.z = bossBank;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (1.4 + tier * 0.25);
      const pulse = isTargeted ? 1 + Math.sin(t * 18) * 0.08 : 1 + Math.sin(t * 4) * 0.04;
      coreRef.current.scale.setScalar(pulse);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 1.4;
      ring1Ref.current.rotation.y += delta * 1.0;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 2.0;
      ring2Ref.current.rotation.z += delta * 1.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z -= delta * 1.7;
    }

    // 2. LOS-Aware Predictive Attack Patterns per Boss Style
    attackTimerRef.current -= moveDelta;
    if (attackTimerRef.current <= 0) {
      const waveScale = isWaveMode ? Math.min(18, currentRound - 1) : 0;
      const fireRateMult = isWaveMode ? Math.max(0.45, 1 - waveScale * 0.055) : 1;
      const damage = Math.min(isWaveMode ? 40 : 32, 10 + bossIndex * 2 + Math.floor(waveScale * 0.65));
      const projSpeed = Math.min(isWaveMode ? 52 : 44, 21 + bossIndex * 2.2 + waveScale * 1.0);
      const pPos = SceneState.playerPosition;

      if (burstRemainingRef.current === 0 && !hasLineOfSight(x, y, z, pPos.x, pPos.y - 0.15, pPos.z)) {
        attackTimerRef.current = 0.45;
        losClimbRef.current = 4.5;
        return;
      }

      if (style === 'STRIKER') {
        const isFan = cycleRef.current % 2 === 1;
        cycleRef.current += 1;
        computeLeadAim(x, y, z, projSpeed, 0.72, _leadPos);
        dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, isFan ? 3 : 2, isFan ? 0.12 : 0.05, projSpeed, damage);
        attackTimerRef.current = 1.55 * fireRateMult;
      } else if (style === 'SHIELD_GENERATORS') {
        computeLeadAim(x, y, z, projSpeed, 0.7, _leadPos);
        dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 3, 0.12, projSpeed, damage);
        attackTimerRef.current = (shieldBroken ? 1.0 : 1.35) * fireRateMult;
      } else if (style === 'BULLET_STORM') {
        computeLeadAim(x, y, z, projSpeed, 0.65, _leadPos);
        if (burstRemainingRef.current > 0) {
          dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, projSpeed, damage);
          burstRemainingRef.current -= 1;
          attackTimerRef.current = burstRemainingRef.current > 0 ? Math.max(0.11, 0.22 * fireRateMult) : 1.15 * fireRateMult;
        } else {
          const nextIsBarrage = cycleRef.current % 2 === 0;
          cycleRef.current += 1;
          if (nextIsBarrage) {
            dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, projSpeed, damage);
            burstRemainingRef.current = 4;
            attackTimerRef.current = Math.max(0.11, 0.22 * fireRateMult);
          } else {
            dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 7, 0.11, projSpeed, damage);
            attackTimerRef.current = 1.45 * fireRateMult;
          }
        }
      } else if (style === 'PHANTOM_BLINK') {
        const fastSpeed = Math.min(isWaveMode ? 54 : 46, projSpeed + 6);
        computeLeadAim(x, y, z, fastSpeed, 0.9, _leadPos);
        dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 3, 0.08, fastSpeed, damage);
        attackTimerRef.current = 1.25 * fireRateMult;
      } else if (style === 'ARTILLERY_FORTRESS') {
        const isHorizonWave = cycleRef.current % 2 === 0;
        cycleRef.current += 1;
        if (isHorizonWave) {
          computeLeadAim(x, y, z, projSpeed * 0.85, 0.6, _leadPos);
          dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 9, 0.14, projSpeed * 0.85, damage);
          attackTimerRef.current = 1.5 * fireRateMult;
        } else {
          computeLeadAim(x, y, z, projSpeed, 0.85, _leadPos);
          dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 4, 0.08, projSpeed, damage + 2);
          attackTimerRef.current = 1.25 * fireRateMult;
        }
      } else if (style === 'HYBRID_SHIELD_BLINK') {
        const hybridSpeed = shieldBroken ? Math.min(isWaveMode ? 52 : 44, projSpeed + 3) : projSpeed + 2;
        computeLeadAim(x, y, z, hybridSpeed, 0.85, _leadPos);
        if (shieldBroken) {
          dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 5, 0.1, hybridSpeed, damage);
          attackTimerRef.current = 1.0 * fireRateMult;
        } else {
          dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 2, 0.06, hybridSpeed, damage);
          attackTimerRef.current = 1.25 * fireRateMult;
        }
      } else if (style === 'HYBRID_STORM_ARTILLERY') {
        if (burstRemainingRef.current > 0) {
          const offsetAngle = (spiralStepRef.current - 2.5) * 0.12;
          computeLeadAim(x, y, z, projSpeed, 0.65, _leadPos);
          _bossTargetDir.set(_leadPos.x - x, _leadPos.y - y, _leadPos.z - z).normalize();
          _bossQuat.setFromAxisAngle(_upAxis, offsetAngle);
          const dir = _bossTargetDir.clone().applyQuaternion(_bossQuat);
          window.dispatchEvent(
            new CustomEvent('boss-fire-projectile', {
              detail: {
                origin: [x, y - 0.25, z],
                velocity: [dir.x * projSpeed, dir.y * projSpeed, dir.z * projSpeed],
                damage,
              },
            })
          );
          spiralStepRef.current = (spiralStepRef.current + 1) % 6;
          burstRemainingRef.current -= 1;
          attackTimerRef.current = burstRemainingRef.current > 0 ? Math.max(0.11, 0.15 * fireRateMult) : 1.1 * fireRateMult;
        } else {
          const nextSpiral = cycleRef.current % 2 === 0;
          cycleRef.current += 1;
          if (nextSpiral) {
            spiralStepRef.current = 0;
            burstRemainingRef.current = 6;
            attackTimerRef.current = Math.max(0.11, 0.15 * fireRateMult);
          } else {
            computeLeadAim(x, y, z, projSpeed, 0.85, _leadPos);
            dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 7, 0.11, projSpeed, damage);
            attackTimerRef.current = 1.35 * fireRateMult;
          }
        }
      } else {
        // OMEGA_HYBRID: predictive 5-bolt fans & rapid 4-shot aimed salvos; 25% faster when shield breaks
        const enragedMult = (shieldBroken ? 0.75 : 1.0) * fireRateMult;
        computeLeadAim(x, y, z, projSpeed, 0.9, _leadPos);
        if (burstRemainingRef.current > 0) {
          dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, projSpeed, damage);
          burstRemainingRef.current -= 1;
          attackTimerRef.current = burstRemainingRef.current > 0 ? Math.max(0.11, 0.19 * enragedMult) : 1.05 * enragedMult;
        } else {
          const nextIsFan = cycleRef.current % 2 === 0;
          cycleRef.current += 1;
          if (nextIsFan) {
            dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 5, 0.12, projSpeed, damage);
            attackTimerRef.current = 1.3 * enragedMult;
          } else {
            dispatchEnemyFan(x, y, z, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, projSpeed, damage);
            burstRemainingRef.current = 3;
            attackTimerRef.current = Math.max(0.11, 0.19 * enragedMult);
          }
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={target.position} scale={target.scale}>
      <BossVisual
        tier={tier}
        isTargeted={isTargeted}
        isShielded={isShielded}
        coreRef={coreRef}
        ring1Ref={ring1Ref}
        ring2Ref={ring2Ref}
        ring3Ref={ring3Ref}
      />
    </group>
  );
};

function pickEnemyArchetype(round: number, index: number, mode: string): EnemyArchetype {
  if (mode === 'TRAINING') {
    if (round === 1) {
      const mod = index % 3;
      if (mod === 0) return 'STRIKER';
      if (mod === 1) return 'FLANKER';
      return 'SCOUT';
    }
    if (round <= 3) {
      const mod = index % 5;
      if (mod === 0) return 'STRIKER';
      if (mod === 1) return 'FLANKER';
      if (mod === 2) return 'SWARMER';
      if (mod === 3) return 'KAMIKAZE';
      return 'SNIPER';
    }
    if (round <= 6) {
      const mod = index % 8;
      if (mod === 0) return 'TACTICIAN';
      if (mod === 1) return 'ARTILLERY';
      if (mod === 2) return 'PHANTOM_SNIPER';
      if (mod === 3) return 'SWARMER';
      if (mod === 4) return 'FLANKER';
      if (mod === 5) return 'KAMIKAZE';
      if (mod === 6) return 'HEALER';
      return 'SNIPER';
    }
    // Wave 7+: Elite nightmare squad cycling all hardest tactical archetypes
    const mod = index % 9;
    if (mod === 0) return 'JUGGERNAUT';
    if (mod === 1) return 'TACTICIAN';
    if (mod === 2) return 'PHANTOM_SNIPER';
    if (mod === 3) return 'KAMIKAZE';
    if (mod === 4) return 'HEALER';
    if (mod === 5) return 'ARTILLERY';
    if (mod === 6) return 'SWARMER';
    if (mod === 7) return 'FLANKER';
    return 'SNIPER';
  }
  if (mode !== 'CHALLENGE') return 'SCOUT';
  if (round === 1) {
    return index % 2 === 0 ? 'STRIKER' : 'SCOUT';
  }
  if (round === 2) {
    const mod = index % 3;
    if (mod === 0) return 'STRIKER';
    if (mod === 1) return 'FLANKER';
    return 'SCOUT';
  }
  if (round === 3) {
    const mod = index % 5;
    if (mod === 0) return 'STRIKER';
    if (mod === 1) return 'FLANKER';
    if (mod === 2) return 'SWARMER';
    if (mod === 3) return 'SNIPER';
    return 'SCOUT';
  }
  if (round <= 5) {
    const mod = index % 8;
    if (mod === 0) return 'TACTICIAN';
    if (mod === 1) return 'STRIKER';
    if (mod === 2) return 'FLANKER';
    if (mod === 3) return 'SWARMER';
    if (mod === 4) return 'KAMIKAZE';
    if (mod === 5) return 'SNIPER';
    if (mod === 6) return 'ARTILLERY';
    return 'SCOUT';
  }
  if (round <= 9) {
    const mod = index % 10;
    if (mod === 0) return 'TACTICIAN';
    if (mod === 1) return 'PHANTOM_SNIPER';
    if (mod === 2) return 'FLANKER';
    if (mod === 3) return 'SWARMER';
    if (mod === 4) return 'KAMIKAZE';
    if (mod === 5) return 'HEALER';
    if (mod === 6) return 'ARTILLERY';
    if (mod === 7) return 'SNIPER';
    if (mod === 8) return 'STRIKER';
    return 'SCOUT';
  }
  // Level 10+: Full 11-archetype roster including JUGGERNAUT, KAMIKAZE & HEALER
  const mod = index % 11;
  if (mod === 0) return 'JUGGERNAUT';
  if (mod === 1) return 'TACTICIAN';
  if (mod === 2) return 'PHANTOM_SNIPER';
  if (mod === 3) return 'KAMIKAZE';
  if (mod === 4) return 'HEALER';
  if (mod === 5) return 'FLANKER';
  if (mod === 6) return 'SWARMER';
  if (mod === 7) return 'ARTILLERY';
  if (mod === 8) return 'SNIPER';
  if (mod === 9) return 'STRIKER';
  return 'SCOUT';
}

const DroneMesh = ({ target, currentRound }: { target: Target; currentRound: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);

  const currentTargetId = useGameStore((state) => state.currentTarget?.id);
  const isTargeted = currentTargetId === target.id;
  const archetype: EnemyArchetype = target.enemyType || 'SCOUT';
  const isGroundUnit = archetype === 'JUGGERNAUT' || archetype === 'ARTILLERY' || archetype === 'SNIPER';

  const [timeOffset] = useState(() => Math.random() * 100);
  const orbitAngleRef = useRef<number>(target.flankAngle ?? 0);
  const attackTimerRef = useRef<number | null>(null);
  const burstRemainingRef = useRef(0);
  const blinkTimerRef = useRef<number>(4.5);
  const cycleRef = useRef(0);
  const prevHealthRef = useRef(target.health);
  const dodgeCooldownRef = useRef(0.6);
  const dodgeTimerRef = useRef(0);
  const dodgeVecRef = useRef<[number, number, number]>([0, 0, 0]);
  const flankSideRef = useRef<1 | -1>(target.flankDir || 1);
  const strafeFlipTimerRef = useRef(2.4);
  const peekBoostRef = useRef(0);

  // Physical motion simulation refs (inertia, banking, impact knockback, and stride physics)
  const prevPosRef = useRef<[number, number, number]>([...target.position]);
  const knockbackVecRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const bankAngleRef = useRef(0);
  const pitchAngleRef = useRef(0);
  const stepCycleRef = useRef(0);

  useEffect(() => {
    dodgeCooldownRef.current = 0.6 + Math.random() * 0.8;
    strafeFlipTimerRef.current = 2.4 + Math.random() * 2.0;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const gameState = useGameStore.getState();
    if (gameState.isPaused || gameState.roundState !== 'PLAYING') return;

    const slowStacks = gameState.activePowers.SLOW_MO_DRONES || 0;
    const slowMult = Math.max(0.35, 1 - slowStacks * 0.25);
    const moveDelta = Math.min(delta, 0.05) * slowMult;

    const isWaveMode = gameState.mode === 'TRAINING';
    const earlySpeedScale = isWaveMode
      ? currentRound <= 4
        ? THREE.MathUtils.clamp(0.48 + currentRound * 0.12, 0.6, 1.0)
        : 1.0
      : currentRound <= 10
        ? THREE.MathUtils.clamp(0.36 + currentRound * 0.06, 0.42, 0.96)
        : 1.0;
    const motionDelta = moveDelta * earlySpeedScale;
    const waveScale = isWaveMode ? Math.min(18, currentRound - 1) : 0;
    const fireRateMult = isWaveMode ? Math.max(0.45, 1 - waveScale * 0.055) : 1;
    const speedBonus = isWaveMode ? waveScale * 1.0 : 0;
    const dmgBonus = isWaveMode ? Math.floor(waveScale * 0.65) : 0;

    const t = state.clock.elapsedTime + timeOffset;
    const tier10 = Math.min(20, Math.max(0, currentRound - 9));
    const evasionBoost = 1 + tier10 * 0.06 + waveScale * 0.04;
    const playerPos = SceneState.playerPosition;
    const flankDir = flankSideRef.current;
    const isOrbital =
      archetype === 'FLANKER' ||
      archetype === 'TACTICIAN' ||
      archetype === 'SNIPER' ||
      archetype === 'SWARMER' ||
      archetype === 'PHANTOM_SNIPER' ||
      archetype === 'JUGGERNAUT' ||
      archetype === 'HEALER';

    // Track reactive threat & hit state
    const tookHit = target.health < prevHealthRef.current;
    prevHealthRef.current = target.health;
    dodgeCooldownRef.current = Math.max(0, dodgeCooldownRef.current - moveDelta);
    dodgeTimerRef.current = Math.max(0, dodgeTimerRef.current - moveDelta);
    peekBoostRef.current = Math.max(0, peekBoostRef.current - moveDelta * 2.4);
    strafeFlipTimerRef.current -= moveDelta;
    if (strafeFlipTimerRef.current <= 0) {
      strafeFlipTimerRef.current = 2.2 + Math.random() * 2.4;
      flankSideRef.current = flankSideRef.current === 1 ? -1 : 1;
    }

    _toPlayer.set(playerPos.x - target.position[0], 0, playerPos.z - target.position[2]);
    const flatDistToPlayer = _toPlayer.length() || 1;
    _toPlayer.divideScalar(flatDistToPlayer);
    const lateralSign = flankSideRef.current;
    _strafeDir.set(-_toPlayer.z * lateralSign, 0, _toPlayer.x * lateralSign);

    // Reactive Aim-Threat & Damage-Triggered Dodge Jukes (fair pacing on Levels 1-10)
    const allowAimTrigger = isWaveMode ? currentRound >= 3 : currentRound >= 6;
    if ((tookHit || (allowAimTrigger && isTargeted)) && dodgeCooldownRef.current <= 0) {
      const jukeSign = Math.random() > 0.5 ? 1 : -1;
      const jukeSpeed = isWaveMode
        ? 18 + waveScale * 0.5
        : currentRound <= 5
          ? 7 + currentRound * 0.8
          : currentRound <= 10
            ? 10 + (currentRound - 5) * 1.4
            : 21;
      dodgeVecRef.current = [
        -_toPlayer.z * jukeSign * jukeSpeed,
        (Math.random() > 0.35 ? 1 : -0.5) * (jukeSpeed * 0.35),
        _toPlayer.x * jukeSign * jukeSpeed,
      ];
      dodgeTimerRef.current = 0.32;
      dodgeCooldownRef.current = isWaveMode
        ? Math.max(1.15, 2.3 - waveScale * 0.1)
        : currentRound <= 5
          ? 4.5
          : currentRound <= 10
            ? 3.5
            : 2.3;
    }

    // 1. Smarter Tactical Positioning & Blind-Spot Flanking AI
    if (archetype === 'FLANKER') {
      const playerLookAngle = Math.atan2(SceneState.playerForward.z, SceneState.playerForward.x);
      const desiredAngle = playerLookAngle + flankDir * THREE.MathUtils.degToRad(130) + Math.sin(t * 0.7) * 0.45;
      const diff = Math.atan2(Math.sin(desiredAngle - orbitAngleRef.current), Math.cos(desiredAngle - orbitAngleRef.current));
      orbitAngleRef.current += THREE.MathUtils.clamp(diff, -0.55 * motionDelta, 0.55 * motionDelta) + flankDir * 0.15 * motionDelta;
      const radius = 17.5 + Math.sin(t * 1.1) * 2.5;
      _desiredPos.set(
        playerPos.x + Math.cos(orbitAngleRef.current) * radius,
        THREE.MathUtils.clamp(6.5 + Math.sin(t * 1.9) * 3.5 + peekBoostRef.current * 3.0, 3, 22),
        playerPos.z + Math.sin(orbitAngleRef.current) * radius
      );
      const steer = Math.min(1, motionDelta * (isTargeted && currentRound >= 6 ? 2.2 : 1.8));
      target.position[0] = THREE.MathUtils.lerp(target.position[0], _desiredPos.x, steer);
      target.position[1] = THREE.MathUtils.lerp(target.position[1], _desiredPos.y, steer);
      target.position[2] = THREE.MathUtils.lerp(target.position[2], _desiredPos.z, steer);
    } else if (archetype === 'SWARMER') {
      orbitAngleRef.current += flankDir * (0.72 + tier10 * 0.02) * motionDelta;
      const radius = 12 + Math.sin(t * 2.5) * 2.5;
      _desiredPos.set(
        playerPos.x + Math.cos(orbitAngleRef.current) * radius,
        THREE.MathUtils.clamp(4.5 + Math.sin(t * 3.1) * 2.8 + peekBoostRef.current * 2.5, 2.5, 16),
        playerPos.z + Math.sin(orbitAngleRef.current) * radius
      );
      const steer = Math.min(1, motionDelta * 2.6);
      target.position[0] = THREE.MathUtils.lerp(target.position[0], _desiredPos.x, steer);
      target.position[1] = THREE.MathUtils.lerp(target.position[1], _desiredPos.y, steer);
      target.position[2] = THREE.MathUtils.lerp(target.position[2], _desiredPos.z, steer);
    } else if (archetype === 'PHANTOM_SNIPER') {
      if ((isTargeted && currentRound >= 6) || flatDistToPlayer < 22) {
        blinkTimerRef.current = Math.min(blinkTimerRef.current, 1.1);
      }
      blinkTimerRef.current -= moveDelta;
      if (blinkTimerRef.current <= 0) {
        blinkTimerRef.current = 5.5;
        const playerLookAngle = Math.atan2(SceneState.playerForward.z, SceneState.playerForward.x);
        orbitAngleRef.current = playerLookAngle + (Math.random() > 0.5 ? 1 : -1) * THREE.MathUtils.degToRad(110 + Math.random() * 55);
        const rad = 24 + Math.random() * 11;
        target.position[0] = playerPos.x + Math.cos(orbitAngleRef.current) * rad;
        target.position[1] = 10 + Math.random() * 8;
        target.position[2] = playerPos.z + Math.sin(orbitAngleRef.current) * rad;
      } else {
        orbitAngleRef.current += flankDir * 0.25 * motionDelta;
        target.position[0] += Math.cos(t * 1.4) * 2.2 * motionDelta;
        target.position[1] += Math.sin(t * 1.8) * 1.8 * motionDelta;
        target.position[2] += Math.sin(t * 1.4) * 2.2 * motionDelta;
      }
    } else if (archetype === 'TACTICIAN') {
      const playerLookAngle = Math.atan2(SceneState.playerForward.z, SceneState.playerForward.x);
      const desiredAngle = playerLookAngle + flankDir * THREE.MathUtils.degToRad(145) + Math.cos(t * 0.8) * 0.4;
      const diff = Math.atan2(Math.sin(desiredAngle - orbitAngleRef.current), Math.cos(desiredAngle - orbitAngleRef.current));
      orbitAngleRef.current += THREE.MathUtils.clamp(diff, -0.55 * motionDelta, 0.55 * motionDelta);
      const radius = 21 + Math.cos(t * 0.9) * 3.5;
      _desiredPos.set(
        playerPos.x + Math.cos(orbitAngleRef.current) * radius,
        THREE.MathUtils.clamp(8.5 + Math.sin(t * 1.4) * 4.0 + peekBoostRef.current * 3.2, 3.5, 22),
        playerPos.z + Math.sin(orbitAngleRef.current) * radius
      );
      const steer = Math.min(1, motionDelta * 2.0);
      target.position[0] = THREE.MathUtils.lerp(target.position[0], _desiredPos.x, steer);
      target.position[1] = THREE.MathUtils.lerp(target.position[1], _desiredPos.y, steer);
      target.position[2] = THREE.MathUtils.lerp(target.position[2], _desiredPos.z, steer);

      if (isTargeted && (isWaveMode || currentRound >= 6)) {
        target.position[0] += _strafeDir.x * 7.5 * motionDelta;
        target.position[2] += _strafeDir.z * 7.5 * motionDelta;
        target.position[1] += Math.sin(t * 4.5) * 3.5 * motionDelta;
      }
    } else if (archetype === 'JUGGERNAUT') {
      orbitAngleRef.current += flankDir * 0.32 * motionDelta;
      const radius = 21.5 + Math.sin(t * 0.7) * 3.0;
      _desiredPos.set(
        playerPos.x + Math.cos(orbitAngleRef.current) * radius,
        THREE.MathUtils.clamp(7.5 + Math.sin(t * 1.0) * 2.5 + peekBoostRef.current * 3.0, 4, 18),
        playerPos.z + Math.sin(orbitAngleRef.current) * radius
      );
      const steer = Math.min(1, motionDelta * 1.6);
      target.position[0] = THREE.MathUtils.lerp(target.position[0], _desiredPos.x, steer);
      target.position[1] = THREE.MathUtils.lerp(target.position[1], _desiredPos.y, steer);
      target.position[2] = THREE.MathUtils.lerp(target.position[2], _desiredPos.z, steer);
    } else if (archetype === 'ARTILLERY') {
      target.position[0] += (Math.sin(t * 0.55) * 5.5 + _strafeDir.x * peekBoostRef.current * 6.0) * motionDelta;
      target.position[2] += (Math.cos(t * 0.45) * 4.5 + _strafeDir.z * peekBoostRef.current * 6.0) * motionDelta;
      target.position[1] = THREE.MathUtils.lerp(
        target.position[1],
        19 + Math.sin(t * 0.8) * 2.5 + peekBoostRef.current * 3.0,
        Math.min(1, motionDelta * 1.8)
      );
    } else if (archetype === 'SNIPER') {
      const disengageMult = (isTargeted && currentRound >= 6) || flatDistToPlayer < 24 ? 1.7 : 1.0;
      if (flatDistToPlayer < 28) {
        target.position[0] -= _toPlayer.x * 11 * disengageMult * motionDelta;
        target.position[2] -= _toPlayer.z * 11 * disengageMult * motionDelta;
      } else if (flatDistToPlayer > 46) {
        target.position[0] += _toPlayer.x * 5 * motionDelta;
        target.position[2] += _toPlayer.z * 5 * motionDelta;
      }
      target.position[0] += _strafeDir.x * 5.5 * disengageMult * motionDelta;
      target.position[2] += _strafeDir.z * 5.5 * disengageMult * motionDelta;
      target.position[1] = THREE.MathUtils.lerp(
        target.position[1],
        17.5 + Math.sin(t * 0.9) * 3.5 + peekBoostRef.current * 3.2,
        Math.min(1, motionDelta * 2.2)
      );
    } else if (archetype === 'KAMIKAZE') {
      // High-speed direct rush dive towards player position
      const kamikazeSpeed = (15 + waveScale * 0.75) * evasionBoost;
      target.position[0] += _toPlayer.x * kamikazeSpeed * motionDelta;
      target.position[2] += _toPlayer.z * kamikazeSpeed * motionDelta;
      target.position[1] = THREE.MathUtils.lerp(
        target.position[1],
        playerPos.y + 1.2,
        Math.min(1, motionDelta * 3.2)
      );

      // Check detonation range (< 3.2m from player)
      const distSq =
        (playerPos.x - target.position[0]) ** 2 +
        (playerPos.y + 1.2 - target.position[1]) ** 2 +
        (playerPos.z - target.position[2]) ** 2;
      if (distSq < 3.2 * 3.2) {
        target.active = false;
        target.health = 0;
        const gState = useGameStore.getState();
        gState.damagePlayer(25);
        gState.addCameraShake(0.45);
        playSound('hit');
        triggerHaptic('hit');
      }
    } else if (archetype === 'HEALER') {
      // Support drone maintaining 18-28m tactical range and repairing wounded allies
      if (flatDistToPlayer < 19) {
        target.position[0] -= _toPlayer.x * 7 * motionDelta;
        target.position[2] -= _toPlayer.z * 7 * motionDelta;
      } else if (flatDistToPlayer > 30) {
        target.position[0] += _toPlayer.x * 5 * motionDelta;
        target.position[2] += _toPlayer.z * 5 * motionDelta;
      }
      target.position[0] += _strafeDir.x * 4.5 * motionDelta;
      target.position[2] += _strafeDir.z * 4.5 * motionDelta;
      target.position[1] = THREE.MathUtils.lerp(
        target.position[1],
        13.5 + Math.sin(t * 1.4) * 3,
        Math.min(1, motionDelta * 2.0)
      );

      // Nanite healing beam to ally with lowest health percentage
      const targets = SceneState.targets;
      let woundedAlly: Target | null = null;
      let lowestPct = 1.0;
      for (let i = 0; i < targets.length; i++) {
        const ally = targets[i];
        if (!ally.active || ally.id === target.id) continue;
        const pct = ally.health / ally.maxHealth;
        if (pct < 0.98 && pct < lowestPct) {
          lowestPct = pct;
          woundedAlly = ally;
        }
      }
      if (woundedAlly) {
        woundedAlly.health = Math.min(woundedAlly.maxHealth, woundedAlly.health + 10 * moveDelta);
      }
    } else if (archetype === 'STRIKER') {
      // Tactical lateral strafe maintaining 18–26m combat range + cover peeking
      if (flatDistToPlayer < 17) {
        target.position[0] -= _toPlayer.x * 6.5 * motionDelta;
        target.position[2] -= _toPlayer.z * 6.5 * motionDelta;
      } else if (flatDistToPlayer > 28) {
        target.position[0] += _toPlayer.x * 5.0 * motionDelta;
        target.position[2] += _toPlayer.z * 5.0 * motionDelta;
      }
      const strafeSpeed = currentRound <= 2 ? 3.8 : 6.4 * evasionBoost;
      target.position[0] += _strafeDir.x * strafeSpeed * motionDelta;
      target.position[2] += _strafeDir.z * strafeSpeed * motionDelta;
      target.position[1] += (Math.sin(t * 1.6) * 2.2 + peekBoostRef.current * 3.8) * motionDelta;
    } else {
      // SCOUT: agile figure-8 pattern + amplified lateral weave when targeted on higher levels
      const targetedMult = isTargeted && (isWaveMode || currentRound >= 5) ? 1.65 : 1.0;
      const baseVx = target.velocity ? target.velocity[0] : 0;
      const baseVy = target.velocity ? target.velocity[1] : 0;
      const baseVz = target.velocity ? target.velocity[2] : 0;
      if (currentRound >= 10) {
        const speedMult = (1 + Math.min(30, currentRound) * 0.14) * (1 + tier10 * 0.025);
        target.position[0] += (baseVx * evasionBoost + Math.sin(t * 2.2 * speedMult) * 7.5 * evasionBoost * targetedMult) * motionDelta;
        target.position[1] += (baseVy * evasionBoost + Math.cos(t * 1.4 * speedMult) * 5.5 * evasionBoost) * motionDelta;
        target.position[2] += (baseVz * evasionBoost + Math.sin(t * 0.9 * speedMult) * 4.0 * evasionBoost) * motionDelta;
      } else {
        target.position[0] += (baseVx + _strafeDir.x * Math.sin(t * 1.8) * (targetedMult > 1 ? 5.2 : 2.2)) * motionDelta;
        target.position[1] += (baseVy + Math.cos(t * 1.2) * (targetedMult > 1 ? 2.6 : 1.2)) * motionDelta;
        target.position[2] += (baseVz + _strafeDir.z * Math.sin(t * 1.8) * (targetedMult > 1 ? 5.2 : 2.2)) * motionDelta;
      }
    }

    // Apply reactive dodge burst
    if (dodgeTimerRef.current > 0) {
      const [dx, dy, dz] = dodgeVecRef.current;
      target.position[0] += dx * motionDelta;
      target.position[1] += dy * motionDelta;
      target.position[2] += dz * motionDelta;
    }

    // Apply cover-peek lateral slide if LOS was blocked
    if (peekBoostRef.current > 0) {
      target.position[0] += _strafeDir.x * 7.5 * motionDelta;
      target.position[2] += _strafeDir.z * 7.5 * motionDelta;
      target.position[1] += 3.5 * motionDelta;
    }

    // Squad Boids Separation (Anti-Clumping: fan out into crossfire angles)
    for (let i = 0; i < SceneState.targets.length; i++) {
      const other = SceneState.targets[i];
      if (!other.active || other.id === target.id) continue;
      const sx = target.position[0] - other.position[0];
      const sy = target.position[1] - other.position[1];
      const sz = target.position[2] - other.position[2];
      const distSq = sx * sx + sy * sy + sz * sz;
      if (distSq > 0.001 && distSq < 30.25) {
        const dist = Math.sqrt(distSq);
        const push = ((5.5 - dist) / 5.5) * 9.0 * motionDelta;
        target.position[0] += (sx / dist) * push;
        target.position[1] += (sy / dist) * push * 0.45;
        target.position[2] += (sz / dist) * push;
      }
    }

    // 2. Arena bounds clamping
    if (isOrbital) {
      const relX = target.position[0];
      const relZ = target.position[2] + 10;
      const rad = Math.hypot(relX, relZ);
      const maxRad = archetype === 'SNIPER' ? 50 : 48;
      if (rad > maxRad) {
        target.position[0] = (relX / rad) * maxRad;
        target.position[2] = (relZ / rad) * maxRad - 10;
      }
      target.position[1] = THREE.MathUtils.clamp(
        target.position[1],
        isGroundUnit ? 1.0 : (archetype === 'PHANTOM_SNIPER' ? 11 : 2.5),
        24
      );
    } else {
      if (target.position[0] > 40) {
        target.position[0] = 40;
        if (target.velocity) target.velocity[0] = -Math.abs(target.velocity[0]);
      } else if (target.position[0] < -40) {
        target.position[0] = -40;
        if (target.velocity) target.velocity[0] = Math.abs(target.velocity[0]);
      }

      if (target.position[1] > 25) {
        target.position[1] = 25;
        if (target.velocity) target.velocity[1] = -Math.abs(target.velocity[1]);
      } else if (target.position[1] < (isGroundUnit ? 1.0 : 2.8)) {
        target.position[1] = isGroundUnit ? 1.25 : 2.8;
        if (target.velocity) target.velocity[1] = Math.abs(target.velocity[1]);
      }

      if (target.position[2] > -10) {
        target.position[2] = -10;
        if (target.velocity) target.velocity[2] = -Math.abs(target.velocity[2]);
      } else if (target.position[2] < -60) {
        target.position[2] = -60;
        if (target.velocity) target.velocity[2] = Math.abs(target.velocity[2]);
      }
    }

    // 3. Solid Drone-vs-Obstacle Physics Bounce (never clip inside walls/towers)
    const m = target.scale * 0.75;
    for (const box of SceneState.colliders) {
      if (
        target.position[0] + m > box.minX &&
        target.position[0] - m < box.maxX &&
        target.position[1] + m > box.minY &&
        target.position[1] - m < box.maxY &&
        target.position[2] + m > box.minZ &&
        target.position[2] - m < box.maxZ
      ) {
        const penLeft = target.position[0] + m - box.minX;
        const penRight = box.maxX - (target.position[0] - m);
        const penBottom = target.position[1] + m - box.minY;
        const penTop = box.maxY - (target.position[1] - m);
        const penBack = target.position[2] + m - box.minZ;
        const penFront = box.maxZ - (target.position[2] - m);

        const minPen = Math.min(penLeft, penRight, penBottom, penTop, penBack, penFront);
        if (minPen === penLeft) {
          target.position[0] = box.minX - m;
          if (target.velocity) target.velocity[0] = -Math.abs(target.velocity[0]);
        } else if (minPen === penRight) {
          target.position[0] = box.maxX + m;
          if (target.velocity) target.velocity[0] = Math.abs(target.velocity[0]);
        } else if (minPen === penBottom) {
          target.position[1] = box.minY - m;
          if (target.velocity) target.velocity[1] = -Math.abs(target.velocity[1]);
        } else if (minPen === penTop) {
          target.position[1] = box.maxY + m;
          if (target.velocity) target.velocity[1] = Math.abs(target.velocity[1]);
        } else if (minPen === penBack) {
          target.position[2] = box.minZ - m;
          if (target.velocity) target.velocity[2] = -Math.abs(target.velocity[2]);
        } else {
          target.position[2] = box.maxZ + m;
          if (target.velocity) target.velocity[2] = Math.abs(target.velocity[2]);
        }
        if (isOrbital) {
          orbitAngleRef.current += flankDir * 0.4 * moveDelta;
        }
      }
    }

    // 4. LOS-Aware & Predictive Lead Attack Patterns
    if (target.canShoot) {
      if (attackTimerRef.current === null) {
        attackTimerRef.current = 1.6 + Math.random() * 2.2;
      }
      attackTimerRef.current -= moveDelta;
      if (attackTimerRef.current <= 0) {
        const [ox, oy, oz] = target.position;
        if (burstRemainingRef.current === 0 && !hasLineOfSight(ox, oy, oz, playerPos.x, playerPos.y - 0.15, playerPos.z)) {
          attackTimerRef.current = 0.45;
          peekBoostRef.current = 1.0;
          flankSideRef.current = flankSideRef.current === 1 ? -1 : 1;
        } else if (archetype === 'STRIKER') {
          const speed = (isWaveMode ? 20 : currentRound <= 2 ? 18 : 20) + speedBonus;
          const lead = isWaveMode ? 0.65 : currentRound <= 2 ? 0.25 : 0.55;
          computeLeadAim(ox, oy, oz, speed, lead, _leadPos);
          attackTimerRef.current = (isWaveMode ? Math.max(1.1, 2.4 * fireRateMult) : currentRound <= 2 ? 3.0 : Math.max(2.0, 2.9 - tier10 * 0.05));
          dispatchEnemyFan(
            ox,
            oy,
            oz,
            _leadPos.x,
            _leadPos.y,
            _leadPos.z,
            1,
            0,
            speed,
            (isWaveMode ? 7 : currentRound <= 2 ? 5 : 7) + dmgBonus
          );
        } else if (archetype === 'FLANKER') {
          const speed = 22 + speedBonus;
          computeLeadAim(ox, oy, oz, speed, 0.58, _leadPos);
          if (burstRemainingRef.current > 0) {
            dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, speed, 7 + dmgBonus);
            burstRemainingRef.current -= 1;
            attackTimerRef.current = Math.max(1.0, (2.6 - tier10 * 0.04) * fireRateMult);
          } else {
            dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, speed, 7 + dmgBonus);
            burstRemainingRef.current = 1;
            attackTimerRef.current = Math.max(0.12, 0.2 * fireRateMult);
          }
        } else if (archetype === 'SWARMER') {
          const speed = 24 + speedBonus;
          computeLeadAim(ox, oy, oz, speed, 0.68, _leadPos);
          if (burstRemainingRef.current > 0) {
            dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, speed, 5 + dmgBonus);
            burstRemainingRef.current -= 1;
            attackTimerRef.current =
              burstRemainingRef.current > 0
                ? Math.max(0.09, 0.14 * fireRateMult)
                : Math.max(0.95, (2.5 - tier10 * 0.04) * fireRateMult);
          } else {
            dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, speed, 5 + dmgBonus);
            burstRemainingRef.current = 2;
            attackTimerRef.current = Math.max(0.09, 0.14 * fireRateMult);
          }
        } else if (archetype === 'ARTILLERY') {
          const speed = 18 + speedBonus;
          computeLeadAim(ox, oy, oz, speed, 0.75, _leadPos);
          attackTimerRef.current = Math.max(1.25, (3.4 - tier10 * 0.05) * fireRateMult);
          dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 5, 0.14, speed, 9 + dmgBonus);
        } else if (archetype === 'SNIPER') {
          const speed = 36 + speedBonus;
          computeLeadAim(ox, oy, oz, speed, 0.88, _leadPos);
          attackTimerRef.current = Math.max(1.2, (3.3 - tier10 * 0.05) * fireRateMult);
          dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 1, 0, speed, 12 + dmgBonus);
        } else if (archetype === 'PHANTOM_SNIPER') {
          const speed = 34 + speedBonus;
          computeLeadAim(ox, oy, oz, speed, 0.9, _leadPos);
          attackTimerRef.current = Math.max(1.15, (3.0 - tier10 * 0.05) * fireRateMult);
          dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 2, 0.045, speed, 10 + dmgBonus);
        } else if (archetype === 'JUGGERNAUT') {
          const isWave = cycleRef.current % 2 === 1;
          cycleRef.current += 1;
          attackTimerRef.current = Math.max(1.0, (2.5 - tier10 * 0.04) * fireRateMult);
          if (isWave) {
            const speed = 20 + speedBonus;
            computeLeadAim(ox, oy, oz, speed, 0.82, _leadPos);
            dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 5, 0.13, speed, 9 + dmgBonus);
          } else {
            const speed = 24 + speedBonus;
            computeLeadAim(ox, oy, oz, speed, 0.85, _leadPos);
            dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 3, 0.09, speed, 10 + dmgBonus);
          }
        } else if (archetype === 'TACTICIAN') {
          const projSpeed = Math.min(46, 25 + tier10 * 0.45 + speedBonus);
          const dmg = Math.min(24, 10 + Math.floor(tier10 / 4) + dmgBonus);
          computeLeadAim(ox, oy, oz, projSpeed, 0.92, _leadPos);
          attackTimerRef.current = Math.max(0.95, (2.7 - tier10 * 0.05) * fireRateMult);
          dispatchEnemyFan(ox, oy, oz, _leadPos.x, _leadPos.y, _leadPos.z, 3, 0.11, projSpeed, dmg);
        }
      }
    }

    // 5. Physical Dynamics: Real velocity calculation, impact knockback, and banking
    const dt = Math.max(0.001, Math.min(delta, 0.05));
    const vx = (target.position[0] - prevPosRef.current[0]) / dt;
    const vz = (target.position[2] - prevPosRef.current[2]) / dt;
    prevPosRef.current = [target.position[0], target.position[1], target.position[2]];

    // Immediate reactive knockback impulse when taking damage
    if (tookHit) {
      const hitDirX = target.position[0] - playerPos.x;
      const hitDirZ = target.position[2] - playerPos.z;
      const hitDist = Math.hypot(hitDirX, hitDirZ) || 1;
      const knockForce = (isGroundUnit ? 5.2 : 8.5) / Math.max(0.6, target.scale);
      knockbackVecRef.current.x += (hitDirX / hitDist) * knockForce;
      knockbackVecRef.current.z += (hitDirZ / hitDist) * knockForce;
      knockbackVecRef.current.y += isGroundUnit ? 0.35 : 1.6;
    }

    // Integrate & spring-decay knockback vector
    target.position[0] += knockbackVecRef.current.x * dt;
    target.position[1] += knockbackVecRef.current.y * dt;
    target.position[2] += knockbackVecRef.current.z * dt;
    knockbackVecRef.current.multiplyScalar(Math.exp(-dt * 8.2));

    // Ground clamping & vertical physics
    if (isGroundUnit) {
      target.position[1] = THREE.MathUtils.lerp(target.position[1], 1.25, Math.min(1, dt * 8.0));
      stepCycleRef.current += Math.hypot(vx, vz) * dt * 4.2;
    } else {
      target.position[1] = Math.max(2.8, target.position[1]);
    }

    groupRef.current.position.set(...target.position);
    groupRef.current.lookAt(playerPos.x, target.position[1], playerPos.z);

    // Dynamic Banking (Roll into turns) & Pitch for aerial units
    if (!isGroundUnit) {
      const yaw = groupRef.current.rotation.y;
      const relStrafe = vx * Math.cos(-yaw) - vz * Math.sin(-yaw);
      const relForward = vx * Math.sin(-yaw) + vz * Math.cos(-yaw);

      const targetRoll = THREE.MathUtils.clamp(-relStrafe * 0.045, -0.62, 0.62);
      const targetPitch = THREE.MathUtils.clamp(relForward * 0.03, -0.4, 0.4);

      bankAngleRef.current = THREE.MathUtils.damp(bankAngleRef.current, targetRoll, 9.0, dt);
      pitchAngleRef.current = THREE.MathUtils.damp(pitchAngleRef.current, targetPitch, 9.0, dt);

      groupRef.current.rotation.z += bankAngleRef.current;
      groupRef.current.rotation.x += pitchAngleRef.current;
    } else {
      // Mechanical footstep bobbing and shoulder sway for walkers/cyborgs
      const stepBob = Math.sin(stepCycleRef.current) * 0.08;
      groupRef.current.position.y += Math.abs(stepBob);
      groupRef.current.rotation.z = Math.sin(stepCycleRef.current * 0.5) * 0.04;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 2.2;
      ring1Ref.current.rotation.y += delta * 1.6;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 3.1;
      ring2Ref.current.rotation.z += delta * 1.2;
    }

    if (coreRef.current && shieldRef.current) {
      if (isTargeted) {
        const pulse = 1 + Math.sin(t * 20) * 0.12;
        coreRef.current.scale.setScalar(pulse);
        shieldRef.current.scale.setScalar(1 + Math.sin(t * 14) * 0.06);
      } else {
        coreRef.current.scale.setScalar(1);
        shieldRef.current.scale.setScalar(1);
      }
      coreRef.current.rotation.y += delta * 1.5;
    }
  });

  const isDamaged = target.health < target.maxHealth;

  return (
    <group ref={groupRef} position={target.position} scale={target.scale}>
      <DroneVisual
        archetype={archetype}
        isTargeted={isTargeted}
        isDamaged={isDamaged}
        coreRef={coreRef}
        shieldRef={shieldRef}
        ring1Ref={ring1Ref}
        ring2Ref={ring2Ref}
      />
    </group>
  );
};

export const Targets = () => {
  const currentRound = useGameStore((state) => state.currentRound);
  const mode = useGameStore((state) => state.mode);
  const currentMap = useGameStore((state) => state.currentMap);
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const newTargets: Target[] = [];
    if (mode === 'CHALLENGE' || mode === 'TRAINING') {
      const isWaveTraining = mode === 'TRAINING';
      const isBossNow = isWaveTraining ? isTrainingBossWave(currentRound) : isBossRound(currentRound);

      if (isBossNow) {
        const waveCounts = isWaveTraining ? getTrainingBossCounts(currentRound) : null;
        const bossIndex = waveCounts ? waveCounts.bossIndex : Math.max(1, Math.floor(currentRound / 5));
        const tier = waveCounts ? waveCounts.tier : getBossTierForRound(currentRound);
        const cfg = BOSS_CONFIGS[tier];
        const stamp = Date.now();
        const bossHealth = isWaveTraining
          ? 55 + bossIndex * 34
          : currentRound >= 50
            ? 280
            : 35 + bossIndex * 22;
        const generatorCount = waveCounts ? waveCounts.generatorCount : cfg.generatorCount;
        const generatorHealth = isWaveTraining
          ? Math.min(16, 4 + bossIndex)
          : Math.min(12, 3 + Math.floor(bossIndex * 0.8));
        const escortCount = waveCounts
          ? waveCounts.escortCount
          : currentRound === 5
            ? 2
            : cfg.generatorCount === 0
              ? 3
              : 0;
        const bossTitleBase = cfg.name.split(' // ')[0];
        const bossName = isWaveTraining
          ? `OLEADA ${currentRound} // ${bossTitleBase} MK-${bossIndex}`
          : currentRound >= 50
            ? `${bossTitleBase} // JEFE FINAL`
            : `${bossTitleBase} // MK-${bossIndex}`;

        const boss: Target = {
          id: `boss-${stamp}`,
          isBoss: true,
          bossName,
          bossTier: tier,
          bossStyle: cfg.style,
          position: [0, 14, -32],
          scale: cfg.scale,
          health: bossHealth,
          maxHealth: bossHealth,
          points: 2000 + bossIndex * 1000,
          active: true,
          velocity: [10 + Math.min(10, bossIndex) * 2.5, 0, 0],
        };
        newTargets.push(boss);

        // Shield Generators for Shielded Bosses
        if (generatorCount > 0) {
          const spots = generatorCount === 3 ? GEN_POSITIONS_3 : GEN_POSITIONS_4;
          for (let i = 0; i < generatorCount; i++) {
            const [gx, gy, gz] = spots[i];
            const pos = getSafeSpawnPosition(gx, gy, gz);
            newTargets.push({
              id: `gen-${stamp}-${i}`,
              position: pos,
              scale: 1.35,
              health: generatorHealth,
              maxHealth: generatorHealth,
              points: 500 + bossIndex * 200,
              active: true,
              isGenerator: true,
            });
          }
        }

        // Escorts per Boss type (aggressive mixed escorts in TRAINING wave mode)
        const waveEscortRotation: EnemyArchetype[] = ['TACTICIAN', 'PHANTOM_SNIPER', 'FLANKER', 'SWARMER'];
        for (let i = 0; i < escortCount; i++) {
          const escortType: EnemyArchetype = isWaveTraining
            ? waveEscortRotation[(i + bossIndex) % waveEscortRotation.length]
            : cfg.escortType === 'FLANKER'
              ? 'FLANKER'
              : cfg.escortType === 'SWARMER'
                ? 'SWARMER'
                : cfg.escortType === 'MIXED'
                  ? i === 0
                    ? 'TACTICIAN'
                    : 'FLANKER'
                  : 'SCOUT';
          const scale = Math.max(0.6, 1.08 - bossIndex * 0.04);
          const flankAngle = (i / Math.max(1, escortCount)) * Math.PI * 2;
          const flankDir: 1 | -1 = i % 2 === 0 ? 1 : -1;
          const rawX = (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 18);
          const rawY = 5 + Math.random() * 12;
          const rawZ = -22 - Math.random() * 24;
          const pos = getSafeSpawnPosition(rawX, rawY, rawZ);

          const escortSpeed = currentRound === 5 && !isWaveTraining ? 6 : 10 + Math.min(8, bossIndex) * 1.8;
          const escortHp =
            escortType === 'TACTICIAN' ? 3 + (isWaveTraining ? Math.floor(bossIndex / 2) : 0) : isWaveTraining && bossIndex >= 3 ? 2 : 1;
          newTargets.push({
            id: `tgt-${stamp}-${i}`,
            position: pos,
            scale,
            health: escortHp,
            maxHealth: escortHp,
            points: Math.round(140 / scale),
            active: true,
            isArmored: escortHp > 1 || escortType === 'TACTICIAN',
            canShoot: escortType !== 'SCOUT',
            enemyType: escortType,
            flankAngle,
            flankDir,
            velocity: [(Math.random() - 0.5) * escortSpeed, (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3.5],
          });
        }

        useGameStore.getState().setBossInfo({
          name: bossName,
          subtitle: cfg.subtitle,
          health: bossHealth,
          maxHealth: bossHealth,
          shielded: generatorCount > 0,
          generatorsRemaining: generatorCount,
          tier,
          style: cfg.style,
        });
        useGameStore.getState().triggerBossIntro({
          name: bossName,
          subtitle: cfg.subtitle,
          tier,
          style: cfg.style,
        });
      } else {
        useGameStore.getState().setBossInfo(null);
        const count = getRoundTotalTargets(mode, currentRound);
        const waveHpBonus = isWaveTraining ? Math.floor((currentRound - 1) / 3) : 0;

        for (let i = 0; i < count; i++) {
          const enemyType = pickEnemyArchetype(currentRound, i, mode);
          const isMoving = isWaveTraining ? true : currentRound >= 2 || enemyType !== 'SCOUT';
          const scale = isWaveTraining
            ? Math.max(0.9, 1.15 - Math.min(14, currentRound) * 0.02)
            : currentRound <= 10
              ? Math.max(0.95, 1.2 - currentRound * 0.02)
              : Math.max(0.85, 1.05 - Math.min(10, currentRound - 10) * 0.015);
          const canShoot = enemyType !== 'SCOUT' && enemyType !== 'KAMIKAZE' && enemyType !== 'HEALER';
          const maxHealth =
            enemyType === 'JUGGERNAUT'
              ? (currentRound >= 40 ? 8 : currentRound >= 32 ? 6 : currentRound >= 24 ? 5 : 4) + waveHpBonus
              : enemyType === 'TACTICIAN'
                ? (currentRound >= 40 ? 6 : currentRound >= 30 ? 5 : currentRound >= 22 ? 4 : currentRound >= 15 ? 3 : 2) + waveHpBonus
                : enemyType === 'HEALER'
                  ? 2 + waveHpBonus
                  : enemyType === 'ARTILLERY' && isWaveTraining
                  ? 2 + waveHpBonus
                  : enemyType === 'FLANKER' || enemyType === 'SWARMER' || enemyType === 'SNIPER' || enemyType === 'PHANTOM_SNIPER'
                    ? (isWaveTraining && currentRound >= 5) || (!isWaveTraining && currentRound >= 25 && (enemyType === 'FLANKER' || enemyType === 'SWARMER'))
                      ? 2
                      : 1
                    : 1;
          const isArmored = enemyType === 'TACTICIAN' || enemyType === 'JUGGERNAUT' || maxHealth > 1;

          const flankAngle = (i / Math.max(1, count)) * Math.PI * 2;
          const flankDir: 1 | -1 = i % 2 === 0 ? 1 : -1;

          const isFlankingClass =
            enemyType === 'FLANKER' ||
            enemyType === 'TACTICIAN' ||
            enemyType === 'SWARMER' ||
            enemyType === 'PHANTOM_SNIPER' ||
            enemyType === 'JUGGERNAUT' ||
            enemyType === 'HEALER' ||
            enemyType === 'KAMIKAZE';
          const rawX = isFlankingClass ? Math.cos(flankAngle) * 28 : (Math.random() - 0.5) * 56;
          const isGroundSpawn = enemyType === 'JUGGERNAUT' || enemyType === 'ARTILLERY' || enemyType === 'SNIPER';
          const rawY = isGroundSpawn ? 1.25 : 4.2 + Math.random() * 7.5;
          const rawZ = isFlankingClass ? 14 + Math.sin(flankAngle) * 28 : -20 - Math.random() * 28;
          const pos = getSafeSpawnPosition(rawX, rawY, rawZ);

          const cappedRound = Math.min(30, currentRound);
          const baseVelX = isWaveTraining
            ? currentRound <= 4
              ? 4.5 + currentRound * 1.1
              : 7 + Math.min(20, currentRound) * 1.45
            : currentRound <= 10
              ? 2.2 + currentRound * 0.45
              : 10 + cappedRound * 1.4;
          const baseVelY = isWaveTraining
            ? currentRound <= 4
              ? 2.2 + currentRound * 0.5
              : 3.5 + Math.min(20, currentRound) * 0.65
            : currentRound <= 10
              ? 1.2 + currentRound * 0.22
              : 5 + cappedRound * 0.6;
          const ptsMult =
            enemyType === 'JUGGERNAUT'
              ? 2.2
              : enemyType === 'TACTICIAN' || enemyType === 'PHANTOM_SNIPER'
                ? 1.8
                : enemyType === 'ARTILLERY' || enemyType === 'SNIPER'
                  ? 1.4
                  : enemyType === 'FLANKER' || enemyType === 'SWARMER'
                    ? 1.3
                    : enemyType === 'STRIKER'
                      ? 1.15
                      : 1.0;

          newTargets.push({
            id: `tgt-${Date.now()}-${i}`,
            position: pos,
            scale,
            health: maxHealth,
            maxHealth,
            points: Math.round((100 / scale) * ptsMult),
            active: true,
            isArmored,
            canShoot,
            enemyType,
            flankAngle,
            flankDir,
            velocity: isMoving
              ? [(Math.random() - 0.5) * baseVelX, (Math.random() - 0.5) * baseVelY, (Math.random() - 0.5) * 3]
              : undefined,
          });
        }

        // Spawn 1-2 Destructible Tactical Supply Crates
        const crateCount = currentRound % 2 === 0 ? 2 : 1;
        for (let c = 0; c < crateCount; c++) {
          const cAngle = c * Math.PI + 0.6;
          const cDist = 16 + c * 8;
          const cx = Math.cos(cAngle) * cDist;
          const cz = -12 + Math.sin(cAngle) * cDist;
          newTargets.push({
            id: `crate-${Date.now()}-${c}`,
            position: [cx, 1.0, cz],
            scale: 1.25,
            health: 20,
            maxHealth: 20,
            points: 150,
            active: true,
            isCrate: true,
          });
        }
      }
    } else {
      useGameStore.getState().setBossInfo(null);
    }

    setTargets(newTargets);
    SceneState.targets = newTargets;
  }, [mode, currentRound, currentMap]);

  useEffect(() => {
    SceneState.onTargetDestroyed = (id) => {
      if (id.startsWith('boss-')) {
        useGameStore.getState().setBossInfo(null);
        useGameStore.getState().triggerBossVictory();
      }
      const remaining = SceneState.targets.filter((t) => t.id !== id);
      SceneState.targets = remaining;
      setTargets((prev) => prev.filter((t) => t.id !== id));

      if (id.startsWith('gen-')) {
        const remainingGens = remaining.filter((t) => t.active && t.isGenerator).length;
        const activeBoss = remaining.find((t) => t.active && t.isBoss);
        const prevBoss = useGameStore.getState().bossInfo;
        if (prevBoss) {
          useGameStore.getState().setBossInfo({
            ...prevBoss,
            shielded: remainingGens > 0,
            generatorsRemaining: remainingGens,
            tier: prevBoss.tier ?? activeBoss?.bossTier,
            style: prevBoss.style ?? activeBoss?.bossStyle,
          });
        }
      }
    };
    SceneState.onTargetHit = (id, newHealth) => {
      if (id.startsWith('boss-')) {
        const boss = SceneState.targets.find((t) => t.id === id);
        if (boss) {
          const prevBoss = useGameStore.getState().bossInfo;
          useGameStore.getState().setBossInfo({
            ...prevBoss,
            name: boss.bossName || prevBoss?.name || 'JEFE',
            health: Math.max(0, newHealth),
            maxHealth: boss.maxHealth,
            tier: boss.bossTier ?? prevBoss?.tier,
            style: boss.bossStyle ?? prevBoss?.style,
          });
        }
      }
      setTargets((prev) => [...prev]);
    };
  }, []);

  return (
    <>
      {targets.map((t) =>
        t.isBoss ? (
          <BossMesh key={t.id} target={t} currentRound={currentRound} />
        ) : t.isGenerator ? (
          <GeneratorMesh key={t.id} target={t} />
        ) : t.isCrate ? (
          <CrateMesh key={t.id} target={t} />
        ) : (
          <DroneMesh key={t.id} target={t} currentRound={currentRound} />
        )
      )}
    </>
  );
};
