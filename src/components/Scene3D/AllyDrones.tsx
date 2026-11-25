import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EnemyArchetype, Target } from '../../types/game';
import { SceneState } from '../../game/sceneState';
import { useGameStore } from '../../game/gameState';
import { playSound } from '../../game/AudioSystem';
import { usePreloadedModel } from '../../game/modelLoader';

const AllyModel = () => {
  const model = usePreloadedModel('DRONE_SCOUT');
  if (!model) return null;
  return <primitive object={model} scale={0.44} rotation={[0, Math.PI, 0]} position={[0, -0.05, 0]} />;
};

const MAX_ALLIES = 3;
const MAX_ALLY_TRACERS = 16;
const ALLY_INDICES = Array.from({ length: MAX_ALLIES }, (_, i) => i);
const TRACER_INDICES = Array.from({ length: MAX_ALLY_TRACERS }, (_, i) => i);

const UP_AXIS = new THREE.Vector3(0, 1, 0);
const _losOrigin = new THREE.Vector3();
const _losDir = new THREE.Vector3();
const _losHit = new THREE.Vector3();
const _losRay = new THREE.Ray();
const _desiredPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _tracerDir = new THREE.Vector3();
const _tracerMid = new THREE.Vector3();
const _rightVec = new THREE.Vector3();

const THREAT_WEIGHTS: Record<EnemyArchetype, number> = {
  JUGGERNAUT: 360,
  TACTICIAN: 320,
  KAMIKAZE: 300,
  PHANTOM_SNIPER: 290,
  HEALER: 280,
  ARTILLERY: 260,
  SNIPER: 240,
  FLANKER: 200,
  STRIKER: 180,
  SWARMER: 160,
  SCOUT: 80,
};

interface AllyTracerSlot {
  active: boolean;
  life: number;
  maxLife: number;
}

function getAllyCountForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  return 3;
}

function hasClearShot(
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

function pickAllyTarget(
  roleIdx: number,
  allyPos: THREE.Vector3,
  bossShielded: boolean,
  lockedTargetIds: (string | null)[],
  allyCount: number
): Target | null {
  const targets = SceneState.targets;
  let bestTarget: Target | null = null;
  let bestScore = -Infinity;

  let activeShootableCount = 0;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    if (!t.active) continue;
    if (t.isBoss && bossShielded) continue;
    activeShootableCount++;
  }

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    if (!t.active || t.health <= 0) continue;
    if (t.isBoss && bossShielded) continue;

    let score = 0;
    if (t.isGenerator) {
      score += 10000;
    } else if (t.isBoss) {
      score += 450;
    } else {
      const arch: EnemyArchetype = t.enemyType || 'SCOUT';
      score += THREAT_WEIGHTS[arch];
    }

    const dx = t.position[0] - allyPos.x;
    const dy = t.position[1] - allyPos.y;
    const dz = t.position[2] - allyPos.z;
    const dist = Math.hypot(dx, dy, dz);
    score -= dist * 2.5;

    // Bonus for finishing wounded targets quickly
    if (t.health <= 2 && t.maxHealth > 1) {
      score += 90;
    }

    // Coordinate across squad: split fire across enemies when multiple remain,
    // or focus-fire together on tough elites/bosses/generators
    if (activeShootableCount >= allyCount && !t.isGenerator && !t.isBoss) {
      for (let other = 0; other < allyCount; other++) {
        if (other !== roleIdx && lockedTargetIds[other] === t.id) {
          score -= 600;
          break;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTarget = t;
    }
  }

  return bestTarget;
}

export const AllyDrones = () => {
  const allyLevel = useGameStore((s) => s.activePowers.ALLY_DRONE || 0);
  const mode = useGameStore((s) => s.mode);
  const roundState = useGameStore((s) => s.roundState);

  const allyCount = getAllyCountForLevel(allyLevel);
  const isPlaying = (mode === 'CHALLENGE' || mode === 'TRAINING') && roundState === 'PLAYING';

  const allyGroupRefs = useRef<(THREE.Group | null)[]>([null, null, null]);
  const haloRingRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const coreRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);

  const allyPositions = useRef<THREE.Vector3[]>([
    new THREE.Vector3(-2.4, 3.0, 12.2),
    new THREE.Vector3(2.4, 3.0, 12.2),
    new THREE.Vector3(0, 4.2, 11.4),
  ]);
  const shootCooldowns = useRef<number[]>([0.2, 0.3, 0.4]);
  const lockedTargetIds = useRef<(string | null)[]>([null, null, null]);
  const recoilOffsets = useRef<number[]>([0, 0, 0]);
  const peekSignRef = useRef<number[]>([1, -1, 1]);

  const tracerMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const tracerSlots = useRef<AllyTracerSlot[]>(
    Array.from({ length: MAX_ALLY_TRACERS }, () => ({
      active: false,
      life: 0,
      maxLife: 0.14,
    }))
  );
  const tracerCursor = useRef(0);

  // Initialize pooled tracer meshes hidden cleanly on mount
  useEffect(() => {
    for (let i = 0; i < MAX_ALLY_TRACERS; i++) {
      const m = tracerMeshes.current[i];
      if (m) m.visible = false;
    }
    return () => {
      SceneState.resetAllies();
    };
  }, []);

  // Re-anchor companions beside the player when starting/entering waves or leveling up
  useEffect(() => {
    const p = SceneState.playerPosition;
    allyPositions.current[0].set(p.x - 2.2, p.y + 1.0, p.z - 1.5);
    allyPositions.current[1].set(p.x + 2.2, p.y + 1.0, p.z - 1.5);
    allyPositions.current[2].set(p.x, p.y + 2.2, p.z - 2.2);
    lockedTargetIds.current = [null, null, null];
    shootCooldowns.current = [0.25, 0.35, 0.45];

    if (!isPlaying || allyCount === 0) {
      SceneState.resetAllies();
      for (let i = 0; i < MAX_ALLY_TRACERS; i++) {
        tracerSlots.current[i].active = false;
        const m = tracerMeshes.current[i];
        if (m) m.visible = false;
      }
    }
  }, [isPlaying, allyCount, roundState]);

  const spawnAllyTracer = (start: THREE.Vector3, endX: number, endY: number, endZ: number, colorHex: string) => {
    _lookTarget.set(endX, endY, endZ);
    _tracerDir.subVectors(_lookTarget, start);
    const dist = _tracerDir.length();
    if (dist < 0.05) return;
    _tracerDir.divideScalar(dist);

    const idx = tracerCursor.current;
    tracerCursor.current = (idx + 1) % MAX_ALLY_TRACERS;
    const slot = tracerSlots.current[idx];
    slot.active = true;
    slot.life = 0.14;
    slot.maxLife = 0.14;

    const mesh = tracerMeshes.current[idx];
    if (mesh) {
      _tracerMid.addVectors(start, _lookTarget).multiplyScalar(0.5);
      mesh.position.copy(_tracerMid);
      if (_tracerDir.y < -0.9999) {
        mesh.quaternion.set(1, 0, 0, 0);
      } else {
        mesh.quaternion.setFromUnitVectors(UP_AXIS, _tracerDir);
      }
      mesh.scale.set(1, dist, 1);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.set(colorHex);
      mat.opacity = 0.92;
      mesh.visible = true;
    }
  };

  useFrame((state, delta) => {
    const storeState = useGameStore.getState();
    if (storeState.isPaused) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // 1. Fade out active ally laser tracer beams
    for (let i = 0; i < MAX_ALLY_TRACERS; i++) {
      const slot = tracerSlots.current[i];
      const mesh = tracerMeshes.current[i];
      if (!slot || !slot.active || !mesh) continue;

      slot.life -= dt;
      if (slot.life <= 0) {
        slot.active = false;
        mesh.visible = false;
      } else {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = (slot.life / slot.maxLife) * 0.92;
      }
    }

    if (!isPlaying || allyCount === 0) {
      SceneState.resetAllies();
      return;
    }

    const currentLevel = storeState.activePowers.ALLY_DRONE || 0;
    const activeCount = getAllyCountForLevel(currentLevel);
    if (activeCount === 0) {
      SceneState.resetAllies();
      return;
    }

    // Upgrade scaling: Level 1 (0.62s / 1 dmg), Level 3 (0.45s / 2 dmg), Level 5 (0.28s / 3 dmg)
    const fireInterval = Math.max(0.26, 0.62 - (currentLevel - 1) * 0.085);
    const shotDamage = 1 + Math.floor((currentLevel - 1) / 2);
    const allySpeed = 14 + Math.min(8, currentLevel - 1) * 1.8;
    const bossShielded = Boolean(storeState.bossInfo?.shielded);

    const pPos = SceneState.playerPosition;
    const pFwd = SceneState.playerForward;
    _rightVec.set(-pFwd.z, 0, pFwd.x);
    if (_rightVec.lengthSq() > 0.001) {
      _rightVec.normalize();
    } else {
      _rightVec.set(1, 0, 0);
    }

    for (let role = 0; role < activeCount; role++) {
      const grp = allyGroupRefs.current[role];
      const pos = allyPositions.current[role];
      if (!grp || !pos) continue;

      // 2. Smart Target Selection & Coordination
      const chosen = pickAllyTarget(role, pos, bossShielded, lockedTargetIds.current, activeCount);
      lockedTargetIds.current[role] = chosen ? chosen.id : null;

      let clearShot = false;
      if (chosen) {
        const [tx, ty, tz] = chosen.position;
        clearShot = hasClearShot(pos.x, pos.y, pos.z, tx, ty, tz);

        const toTargetAngle = Math.atan2(tz - pPos.z, tx - pPos.x);
        const orbitBase = toTargetAngle + Math.PI;
        let angleFromTarget = orbitBase - 0.96; // Role 0: VANGUARD (-55°)
        let orbitRadius = 11.2;
        let desiredY = ty + Math.sin(t * 2.4 + role) * 1.6;

        if (role === 1) {
          // Role 1: FLANKER (+120° opposite flank crossfire)
          angleFromTarget = orbitBase + 2.1;
          orbitRadius = 11.6;
          desiredY = ty + Math.cos(t * 2.1) * 1.8;
        } else if (role === 2) {
          // Role 2: OVERWATCH (elevated high-ground sniper)
          angleFromTarget = orbitBase + Math.sin(t * 0.9) * 0.45;
          orbitRadius = 14.5;
          desiredY = ty + 5.5 + Math.sin(t * 1.5) * 1.2;
        }

        if (!clearShot) {
          desiredY += 4.2;
          angleFromTarget += peekSignRef.current[role] * 0.72;
        }

        _desiredPos.set(
          tx + Math.cos(angleFromTarget) * orbitRadius,
          THREE.MathUtils.clamp(desiredY, 2.5, 25),
          tz + Math.sin(angleFromTarget) * orbitRadius
        );
      } else {
        // Escort player in a hovering tactical V-formation
        const sideOffset = role === 0 ? -2.2 : role === 1 ? 2.2 : 0;
        const fwdOffset = role === 2 ? -2.4 : -1.4;
        const heightOffset = role === 2 ? 2.1 : 1.0;
        _desiredPos.set(
          pPos.x + _rightVec.x * sideOffset + pFwd.x * fwdOffset,
          THREE.MathUtils.clamp(pPos.y + heightOffset + Math.sin(t * 2.8 + role * 1.5) * 0.24, 2.2, 24),
          pPos.z + _rightVec.z * sideOffset + pFwd.z * fwdOffset
        );
      }

      // Clamp desired position within arena bounds
      const relZ = _desiredPos.z + 10;
      const hr = Math.hypot(_desiredPos.x, relZ);
      if (hr > 50) {
        _desiredPos.x = (_desiredPos.x / hr) * 50;
        _desiredPos.z = (relZ / hr) * 50 - 10;
      }

      // Smooth steering toward tactical position
      const steer = Math.min(1, dt * (allySpeed * 0.28));
      pos.lerp(_desiredPos, steer);

      // Keep companion drones separated cleanly from each other
      for (let other = 0; other < activeCount; other++) {
        if (other === role) continue;
        const otherPos = allyPositions.current[other];
        const sx = pos.x - otherPos.x;
        const sy = pos.y - otherPos.y;
        const sz = pos.z - otherPos.z;
        const dSq = sx * sx + sy * sy + sz * sz;
        if (dSq > 0.001 && dSq < 10.24) {
          const d = Math.sqrt(dSq);
          const push = ((3.2 - d) / 3.2) * 8.0 * dt;
          pos.x += (sx / d) * push;
          pos.y += (sy / d) * push * 0.4;
          pos.z += (sz / d) * push;
        }
      }

      // Avoid clipping inside solid obstacle boxes
      const rPad = 0.9;
      for (const box of SceneState.colliders) {
        if (box.kind === 'jumppad') continue;
        if (
          pos.x + rPad > box.minX &&
          pos.x - rPad < box.maxX &&
          pos.y + rPad > box.minY &&
          pos.y - rPad < box.maxY &&
          pos.z + rPad > box.minZ &&
          pos.z - rPad < box.maxZ
        ) {
          pos.y = Math.min(26, Math.max(pos.y, box.maxY + rPad));
        }
      }

      // Decay visual recoil & update drone transform + orientation
      recoilOffsets.current[role] = Math.max(0, recoilOffsets.current[role] - dt * 6);
      grp.position.copy(pos);

      const radarEntry = SceneState.allies[role];
      if (radarEntry) {
        radarEntry.active = true;
        radarEntry.role = role as 0 | 1 | 2;
        radarEntry.x = pos.x;
        radarEntry.y = pos.y;
        radarEntry.z = pos.z;
        radarEntry.hasTarget = Boolean(chosen);
      }

      if (chosen) {
        grp.lookAt(chosen.position[0], chosen.position[1], chosen.position[2]);
      } else {
        grp.lookAt(pPos.x + pFwd.x * 16, pos.y, pPos.z + pFwd.z * 16);
      }

      // Animate core & halo ring rotation
      const halo = haloRingRefs.current[role];
      if (halo) {
        halo.rotation.z += dt * (2.5 + currentLevel * 0.4);
      }
      const core = coreRefs.current[role];
      if (core) {
        core.rotation.y += dt * 3.0;
        const pulse = 1 + recoilOffsets.current[role] * 0.25;
        core.scale.setScalar(pulse);
      }

      // 3. Fast Autonomous Combat Firing
      shootCooldowns.current[role] -= dt;
      if (chosen && chosen.active && chosen.health > 0 && shootCooldowns.current[role] <= 0) {
        if (!clearShot) {
          shootCooldowns.current[role] = 0.2;
          peekSignRef.current[role] = peekSignRef.current[role] === 1 ? -1 : 1;
        } else {
          shootCooldowns.current[role] = fireInterval;
          recoilOffsets.current[role] = 1.0;

          const [tx, ty, tz] = chosen.position;
          spawnAllyTracer(pos, tx, ty, tz, role === 2 ? '#67e8f9' : '#34d399');

          chosen.health -= shotDamage;
          if (chosen.health <= 0) {
            chosen.active = false;
            playSound('destroy');
            const distFromPlayer = pPos.distanceTo(_lookTarget.set(tx, ty, tz));
            const finalPoints = Math.round(chosen.points * Math.max(1, distFromPlayer / 20));
            storeState.registerHit(finalPoints);
            SceneState.onTargetDestroyed(chosen.id);
          } else {
            playSound('hit');
            SceneState.onTargetHit(chosen.id, chosen.health);
          }
        }
      }
    }

    for (let r = activeCount; r < MAX_ALLIES; r++) {
      const unused = SceneState.allies[r];
      if (unused) {
        unused.active = false;
        unused.hasTarget = false;
      }
    }
  });

  if (!isPlaying || allyCount === 0) return null;

  return (
    <>
      {ALLY_INDICES.map((idx) => {
        if (idx >= allyCount) return null;
        const roleColor = idx === 2 ? '#22d3ee' : idx === 1 ? '#2dd4bf' : '#34d399';
        return (
          <group
            key={`ally-${idx}`}
            ref={(el) => {
              allyGroupRefs.current[idx] = el;
            }}
            position={[allyPositions.current[idx].x, allyPositions.current[idx].y, allyPositions.current[idx].z]}
          >
            <AllyModel />
            {/* White-Titanium Interceptor Fuselage */}
            <mesh>
              <boxGeometry args={[0.58, 0.34, 0.86]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.78} roughness={0.22} />
            </mesh>
            {/* Dark Armor Nose Cowling */}
            <mesh position={[0, 0.04, 0.34]}>
              <boxGeometry args={[0.42, 0.24, 0.36]} />
              <meshStandardMaterial color="#0f172a" metalness={0.75} roughness={0.28} />
            </mesh>
            {/* Swept Interceptor Wings */}
            <mesh position={[-0.64, 0.02, -0.08]} rotation={[0, 0.28, -0.18]}>
              <boxGeometry args={[0.78, 0.07, 0.42]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.24} />
            </mesh>
            <mesh position={[0.64, 0.02, -0.08]} rotation={[0, -0.28, 0.18]}>
              <boxGeometry args={[0.78, 0.07, 0.42]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.24} />
            </mesh>
            {/* Wingtip Thruster Strips */}
            <mesh position={[-1.0, 0.08, -0.18]}>
              <boxGeometry args={[0.08, 0.08, 0.32]} />
              <meshBasicMaterial color={roleColor} toneMapped={false} />
            </mesh>
            <mesh position={[1.0, 0.08, -0.18]}>
              <boxGeometry args={[0.08, 0.08, 0.32]} />
              <meshBasicMaterial color={roleColor} toneMapped={false} />
            </mesh>
            {/* Twin Front Plasma Barrels (aligned +Z toward lookAt target) */}
            {[-0.22, 0.22].map((bx, bIdx) => (
              <mesh key={bIdx} position={[bx, -0.08, 0.56]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.055, 0.42, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
              </mesh>
            ))}
            {/* Glowing Friendly Emerald-Cyan Reactor Core */}
            <mesh
              ref={(el) => {
                coreRefs.current[idx] = el;
              }}
              position={[0, 0.12, 0.06]}
            >
              <octahedronGeometry args={[0.22, 0]} />
              <meshBasicMaterial color={roleColor} toneMapped={false} />
            </mesh>
            {/* Rotating Tactical Halo Ring */}
            <mesh
              ref={(el) => {
                haloRingRefs.current[idx] = el;
              }}
              position={[0, 0, -0.12]}
            >
              <torusGeometry args={[0.62, 0.032, 8, 28]} />
              <meshBasicMaterial color={roleColor} transparent opacity={0.85} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* Pooled Glowing Companion Laser Tracer Beams */}
      {TRACER_INDICES.map((idx) => (
        <mesh
          key={`ally-tracer-${idx}`}
          frustumCulled={false}
          ref={(el) => {
            tracerMeshes.current[idx] = el;
          }}
        >
          <cylinderGeometry args={[0.048, 0.032, 1, 6]} />
          <meshBasicMaterial
            color="#34d399"
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
};
