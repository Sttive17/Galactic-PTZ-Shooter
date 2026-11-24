import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { SceneState } from '../../game/sceneState';
import { useGameStore } from '../../game/gameState';
import { GAME_CONFIG } from '../../game/config';
import type { MapBox } from '../../game/mapGenerator';
import type { PowerId } from '../../game/powers';
import * as THREE from 'three';
import { playSound } from '../../game/AudioSystem';
import { triggerHaptic } from '../../game/haptics';
import { spawnCombatDrop } from '../../game/combatDrops';

function getPlayerBoltPalette(activePowers: Partial<Record<PowerId, number>>): { bolt: string; tracer: string } {
  if ((activePowers.HEAVY_DAMAGE || 0) > 0) return { bolt: '#fb7185', tracer: '#fda4af' };
  if ((activePowers.CRITICAL_OPTICS || 0) > 0) return { bolt: '#facc15', tracer: '#fde047' };
  if ((activePowers.RICOCHET_ROUNDS || 0) > 0) return { bolt: '#c084fc', tracer: '#e879f9' };
  if ((activePowers.PIERCING_SHOT || 0) > 0) return { bolt: '#22d3ee', tracer: '#67e8f9' };
  if ((activePowers.EMP_BLAST || 0) > 0) return { bolt: '#60a5fa', tracer: '#93c5fd' };
  return { bolt: '#38bdf8', tracer: '#7dd3fc' };
}

const MAX_PARTICLES = 500;
const MAX_SHOCKWAVES = 16;
const MAX_BOSS_PROJ = 80;
const MAX_PLAYER_PROJ = 64;
const MAX_TRACERS = 24;

// Stable module-level args/indices so R3F never recreates InstancedMeshes on re-render
const PARTICLES_ARGS: [THREE.BufferGeometry | undefined, THREE.Material | undefined, number] = [undefined, undefined, MAX_PARTICLES];
const PLAYER_PROJ_ARGS: [THREE.BufferGeometry | undefined, THREE.Material | undefined, number] = [undefined, undefined, MAX_PLAYER_PROJ];
const BOSS_PROJ_ARGS: [THREE.BufferGeometry | undefined, THREE.Material | undefined, number] = [undefined, undefined, MAX_BOSS_PROJ];
const TRACER_INDICES = Array.from({ length: MAX_TRACERS }, (_, i) => i);
const SHOCKWAVE_INDICES = Array.from({ length: MAX_SHOCKWAVES }, (_, i) => i);

const setUnitYQuaternion = (quat: THREE.Quaternion, dir: THREE.Vector3) => {
  if (dir.y < -0.9999) {
    quat.set(1, 0, 0, 0);
  } else {
    quat.setFromUnitVectors(UP_AXIS, dir);
  }
};

const syncBossPoolLength = (slots: BossProjectileSlot[]) => {
  while (slots.length < MAX_BOSS_PROJ) {
    slots.push({
      active: false,
      hiddenSynced: false,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      damage: 12,
    });
  }
};

// Reusable static calculation objects to avoid GC pressure
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const _projDir = new THREE.Vector3();
const _prevPos = new THREE.Vector3();
const _lineSegment = new THREE.Line3();
const _closestPoint = new THREE.Vector3();
const _targetCenter = new THREE.Vector3();
const _hitPos = new THREE.Vector3();
const _ray = new THREE.Ray();
const _rayDir = new THREE.Vector3();
const _boxHitPoint = new THREE.Vector3();
const _worldHitPos = new THREE.Vector3();
const _bossPrevPos = new THREE.Vector3();

// Fire-time convergence & tracer helpers
const _camDir = new THREE.Vector3();
const _camRay = new THREE.Ray();
const _aimSphere = new THREE.Sphere();
const _aimPoint = new THREE.Vector3();
const _startPos = new THREE.Vector3();
const _boltDir = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _spreadQuat = new THREE.Quaternion();
const _tracerDir = new THREE.Vector3();
const _tracerMid = new THREE.Vector3();
const _tracerEnd = new THREE.Vector3();

interface ShockwaveSlot {
  active: boolean;
  life: number;
  maxLife: number;
  maxRadius: number;
}

interface TracerSlot {
  active: boolean;
  life: number;
  maxLife: number;
}

interface PlayerProjectileSlot {
  active: boolean;
  hiddenSynced: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  pierceLeft: number;
  bouncesLeft: number;
  lastHitTargetId: string | null;
}

interface BossProjectileSlot {
  active: boolean;
  hiddenSynced: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  damage: number;
}

export const Projectiles = () => {
  const { camera } = useThree();
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);

  // Particle System Refs
  const particlesMesh = useRef<THREE.InstancedMesh>(null);
  const particleData = useRef(
    Array.from({ length: MAX_PARTICLES }, () => ({ velocity: new THREE.Vector3(), life: 0 }))
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Zero-Latency Player Projectile InstancedMesh Pool
  const playerProjMesh = useRef<THREE.InstancedMesh>(null);
  const playerProjMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const lastBoltColorRef = useRef<string>('#38bdf8');
  const playerProjSlots = useRef<PlayerProjectileSlot[]>(
    Array.from({ length: MAX_PLAYER_PROJ }, () => ({
      active: false,
      hiddenSynced: false,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      age: 0,
      pierceLeft: 0,
      bouncesLeft: 0,
      lastHitTargetId: null,
    }))
  );
  const playerProjCursor = useRef(0);

  // Instant Laser Tracer Beam Pool
  const tracerMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const tracerSlots = useRef<TracerSlot[]>(
    Array.from({ length: MAX_TRACERS }, () => ({
      active: false,
      life: 0,
      maxLife: 0.15,
    }))
  );
  const tracerCursor = useRef(0);

  // Pooled Boss Projectiles Refs
  const bossProjMesh = useRef<THREE.InstancedMesh>(null);
  const bossProjSlots = useRef<BossProjectileSlot[]>(
    Array.from({ length: MAX_BOSS_PROJ }, () => ({
      active: false,
      hiddenSynced: false,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      damage: 12,
    }))
  );
  const bossProjCursor = useRef(0);

  // Initialize pooled tracer & shockwave meshes hidden once on mount (never via JSX props so re-renders never wipe active visuals)
  useEffect(() => {
    for (let i = 0; i < MAX_TRACERS; i++) {
      const m = tracerMeshes.current[i];
      if (m) m.visible = false;
    }
    for (let i = 0; i < MAX_SHOCKWAVES; i++) {
      const m = shockwaveMeshes.current[i];
      if (m) m.visible = false;
    }
  }, []);

  // Clear player & boss projectiles and tracers when leaving active gameplay
  useEffect(() => {
    if (mode === 'MENU' || mode === 'LEVEL_MAP' || mode === 'GAMEOVER' || roundState !== 'PLAYING') {
      SceneState.projectiles = [];
      for (const slot of playerProjSlots.current) {
        slot.active = false;
        slot.hiddenSynced = false;
      }
      for (const slot of bossProjSlots.current) {
        slot.active = false;
        slot.hiddenSynced = false;
      }
      for (let i = 0; i < MAX_TRACERS; i++) {
        tracerSlots.current[i].active = false;
        const m = tracerMeshes.current[i];
        if (m) m.visible = false;
      }
      for (let i = 0; i < MAX_SHOCKWAVES; i++) {
        shockwaveSlots.current[i].active = false;
        const m = shockwaveMeshes.current[i];
        if (m) m.visible = false;
      }
    }
  }, [mode, roundState]);

  // Pooled Shockwave Rings Refs (zero GC allocations)
  const shockwaveMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const shockwaveSlots = useRef<ShockwaveSlot[]>(
    Array.from({ length: MAX_SHOCKWAVES }, () => ({
      active: false,
      life: 0,
      maxLife: 0.4,
      maxRadius: 3,
    }))
  );
  const shockwaveCursor = useRef(0);

  const spawnExplosion = (position: THREE.Vector3, countTotal = 30) => {
    let count = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (particleData.current[i].life <= 0) {
        particleData.current[i].life = 1.0;
        particleData.current[i].velocity.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        );
        dummy.position.copy(position);
        dummy.quaternion.identity();
        dummy.scale.setScalar(Math.random() * 0.5 + 0.2);
        dummy.updateMatrix();
        particlesMesh.current?.setMatrixAt(i, dummy.matrix);
        count++;
        if (count >= countTotal) break;
      }
    }
    if (particlesMesh.current) {
      particlesMesh.current.instanceMatrix.needsUpdate = true;
    }
  };

  const spawnShockwave = (position: THREE.Vector3, maxRadius: number, colorHex: string, duration = 0.42) => {
    const idx = shockwaveCursor.current;
    shockwaveCursor.current = (idx + 1) % MAX_SHOCKWAVES;

    const slot = shockwaveSlots.current[idx];
    slot.active = true;
    slot.life = duration;
    slot.maxLife = duration;
    slot.maxRadius = maxRadius;

    const mesh = shockwaveMeshes.current[idx];
    if (mesh) {
      mesh.position.copy(position);
      mesh.scale.setScalar(0.2);
      mesh.visible = true;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.set(colorHex);
      mat.opacity = 0.9;
    }
  };

  const spawnTracer = (start: THREE.Vector3, end: THREE.Vector3, colorHex: string) => {
    _tracerDir.subVectors(end, start);
    const dist = _tracerDir.length();
    if (dist < 0.05) return;
    _tracerDir.divideScalar(dist);

    const idx = tracerCursor.current;
    tracerCursor.current = (idx + 1) % MAX_TRACERS;

    const slot = tracerSlots.current[idx];
    slot.active = true;
    slot.life = 0.22;
    slot.maxLife = 0.22;

    const mesh = tracerMeshes.current[idx];
    if (mesh) {
      _tracerMid.addVectors(start, end).multiplyScalar(0.5);
      mesh.position.copy(_tracerMid);
      setUnitYQuaternion(mesh.quaternion, _tracerDir);
      mesh.scale.set(1, dist, 1);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.set(colorHex);
      mat.opacity = 0.95;
      mesh.visible = true;
    }
  };

  useEffect(() => {
    const handleFire = () => {
      const { activePowers } = useGameStore.getState();

      const tripleStacks = activePowers.TRIPLE_SHOT || 0;
      const railgunStacks = activePowers.RAILGUN_SPEED || 0;
      const bigHitbox = activePowers.BIG_HITBOX || 0;
      const pierceStacks = activePowers.PIERCING_SHOT || 0;
      const ricochetStacks = activePowers.RICOCHET_ROUNDS || 0;
      const speed = GAME_CONFIG.projectile.speed * (1 + railgunStacks * 0.45);
      const boltScale = 1 + bigHitbox * 0.6;

      // 1. Cast crosshair ray using actual camera world direction for pinpoint convergence
      camera.getWorldDirection(_camDir);
      _camRay.set(camera.position, _camDir);

      let rawHitDist = Infinity;
      for (const target of SceneState.targets) {
        if (!target.active) continue;
        _targetCenter.set(target.position[0], target.position[1], target.position[2]);
        _aimSphere.set(_targetCenter, target.scale * 0.65);
        if (_camRay.intersectSphere(_aimSphere, _boxHitPoint)) {
          const d = camera.position.distanceTo(_boxHitPoint);
          if (d < rawHitDist) rawHitDist = d;
        }
      }
      for (const box of SceneState.colliders) {
        if (_camRay.intersectBox(box.box3, _boxHitPoint)) {
          const d = camera.position.distanceTo(_boxHitPoint);
          if (d < rawHitDist) rawHitDist = d;
        }
      }

      const aimDist = Math.max(6, rawHitDist === Infinity ? 65 : rawHitDist);
      _aimPoint.copy(camera.position).addScaledVector(_camDir, aimDist);

      // 2. Spawn from live 3D muzzle position, unless standing flush against an obstacle (prevent wall-poking)
      _startPos.copy(SceneState.muzzlePosition);
      const muzzleDist = camera.position.distanceTo(SceneState.muzzlePosition);
      if (muzzleDist > 0.001) {
        _rayDir.subVectors(SceneState.muzzlePosition, camera.position).divideScalar(muzzleDist);
        _ray.set(camera.position, _rayDir);
        for (const box of SceneState.colliders) {
          if (_ray.intersectBox(box.box3, _boxHitPoint)) {
            if (camera.position.distanceTo(_boxHitPoint) < muzzleDist) {
              _startPos.copy(camera.position).addScaledVector(_camDir, 0.15);
              break;
            }
          }
        }
      }

      const totalBolts = 1 + tripleStacks * 2;
      const { bolt: boltColor, tracer: tracerColor } = getPlayerBoltPalette(activePowers);
      if (playerProjMatRef.current && lastBoltColorRef.current !== boltColor) {
        playerProjMatRef.current.color.set(boltColor);
        lastBoltColorRef.current = boltColor;
      }

      const spreadStepRad = THREE.MathUtils.degToRad(2.8);
      const halfSpread = (totalBolts - 1) / 2;

      const baseDir = _aimPoint.clone().sub(_startPos).normalize();
      _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
      const tracerDist = rawHitDist < 65 ? Math.max(1.2, rawHitDist) : 45;
      let matrixDirty = false;

      for (let i = 0; i < totalBolts; i++) {
        const angleRad = (i - halfSpread) * spreadStepRad;
        _spreadQuat.setFromAxisAngle(_camUp, angleRad);
        _boltDir.copy(baseDir).applyQuaternion(_spreadQuat).normalize();

        const idx = playerProjCursor.current;
        playerProjCursor.current = (idx + 1) % MAX_PLAYER_PROJ;

        const slot = playerProjSlots.current[idx];
        slot.active = true;
        slot.hiddenSynced = false;
        slot.position.copy(_startPos);
        slot.velocity.copy(_boltDir).multiplyScalar(speed);
        slot.age = 0;
        slot.pierceLeft = pierceStacks;
        slot.bouncesLeft = ricochetStacks;
        slot.lastHitTargetId = null;

        // Immediately sync matrix at muzzle on frame 0 so there's zero spawn lag
        if (playerProjMesh.current) {
          dummy.position.copy(_startPos);
          setUnitYQuaternion(dummy.quaternion, _boltDir);
          dummy.scale.setScalar(boltScale);
          dummy.updateMatrix();
          playerProjMesh.current.setMatrixAt(idx, dummy.matrix);
          matrixDirty = true;
        }

        // Instant luminous laser tracer connecting barrel to target/aim point
        _tracerEnd.copy(_startPos).addScaledVector(_boltDir, tracerDist);
        spawnTracer(_startPos, _tracerEnd, tracerColor);
      }

      if (matrixDirty && playerProjMesh.current) {
        playerProjMesh.current.instanceMatrix.needsUpdate = true;
      }

      playSound('shoot');
      useGameStore.getState().addCameraShake(0.16);
    };

    const handleBossFire = (e: Event) => {
      syncBossPoolLength(bossProjSlots.current);
      const { origin, velocity, damage } = (e as CustomEvent).detail;
      const idx = bossProjCursor.current % MAX_BOSS_PROJ;
      bossProjCursor.current = (idx + 1) % MAX_BOSS_PROJ;

      const slot = bossProjSlots.current[idx];
      slot.active = true;
      slot.hiddenSynced = false;
      slot.position.set(origin[0], origin[1], origin[2]);
      slot.velocity.set(velocity[0], velocity[1], velocity[2]);
      slot.life = 5.0;
      slot.damage = damage || 12;
      playSound('shoot');
    };

    window.addEventListener('fire-projectile', handleFire);
    window.addEventListener('boss-fire-projectile', handleBossFire);
    return () => {
      window.removeEventListener('fire-projectile', handleFire);
      window.removeEventListener('boss-fire-projectile', handleBossFire);
    };
  }, [camera, dummy]);

  useFrame((state, delta) => {
    const storeState = useGameStore.getState();
    if (storeState.isPaused) return;

    const dt = Math.min(delta, 0.05);

    // 1. Update Instant Laser Tracer Fade
    for (let i = 0; i < MAX_TRACERS; i++) {
      const slot = tracerSlots.current[i];
      const mesh = tracerMeshes.current[i];
      if (!slot || !slot.active || !mesh) continue;

      slot.life -= dt;
      if (slot.life <= 0) {
        slot.active = false;
        mesh.visible = false;
      } else {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = (slot.life / slot.maxLife) * 0.95;
      }
    }

    // 2. Update Shockwave Rings
    for (let i = 0; i < MAX_SHOCKWAVES; i++) {
      const slot = shockwaveSlots.current[i];
      const mesh = shockwaveMeshes.current[i];
      if (!slot || !slot.active || !mesh) continue;

      slot.life -= dt;
      if (slot.life <= 0) {
        slot.active = false;
        mesh.visible = false;
      } else {
        const progress = 1 - slot.life / slot.maxLife;
        const easeOut = 1 - Math.pow(1 - progress, 2);
        mesh.scale.setScalar(0.2 + easeOut * slot.maxRadius);
        mesh.lookAt(state.camera.position);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (1 - progress) * 0.85);
      }
    }

    // 3. Update Particles
    let particleUpdated = false;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particleData.current[i];
      if (!p) continue;
      if (p.life > 0) {
        p.life -= dt;
        particlesMesh.current?.getMatrixAt(i, dummy.matrix);
        dummy.position.setFromMatrixPosition(dummy.matrix);
        dummy.quaternion.identity();

        dummy.position.addScaledVector(p.velocity, dt);
        p.velocity.y -= 9.8 * dt;
        dummy.scale.setScalar(Math.max(0, p.life));

        dummy.updateMatrix();
        particlesMesh.current?.setMatrixAt(i, dummy.matrix);
        particleUpdated = true;
      } else if (p.life > -1) {
        dummy.quaternion.identity();
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        particlesMesh.current?.setMatrixAt(i, dummy.matrix);
        p.life = -1;
        particleUpdated = true;
      }
    }
    if (particleUpdated && particlesMesh.current) {
      particlesMesh.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Update Boss Attack Projectiles (blocked by cover/walls/floor!)
    syncBossPoolLength(bossProjSlots.current);
    let bossProjUpdated = false;
    for (let i = 0; i < MAX_BOSS_PROJ; i++) {
      const bp = bossProjSlots.current[i];
      if (!bp) continue;
      if (!bp.active) {
        if (!bp.hiddenSynced && bossProjMesh.current) {
          dummy.quaternion.identity();
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          bossProjMesh.current.setMatrixAt(i, dummy.matrix);
          bp.hiddenSynced = true;
          bossProjUpdated = true;
        }
        continue;
      }

      bp.life -= dt;
      if (bp.life <= 0 || storeState.roundState !== 'PLAYING') {
        bp.active = false;
        dummy.quaternion.identity();
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        bossProjMesh.current?.setMatrixAt(i, dummy.matrix);
        bp.hiddenSynced = true;
        bossProjUpdated = true;
        continue;
      }

      _bossPrevPos.copy(bp.position);
      bp.position.addScaledVector(bp.velocity, dt);
      _lineSegment.set(_bossPrevPos, bp.position);

      const segLen = _bossPrevPos.distanceTo(bp.position);
      let blocked = false;

      if (segLen > 0.0001) {
        _rayDir.subVectors(bp.position, _bossPrevPos).divideScalar(segLen);
        _ray.set(_bossPrevPos, _rayDir);

        if (bp.position.y <= 0 && _bossPrevPos.y > 0) {
          const t = _bossPrevPos.y / (_bossPrevPos.y - bp.position.y);
          _worldHitPos.lerpVectors(_bossPrevPos, bp.position, t);
          blocked = true;
        }

        if (!blocked) {
          for (const box of SceneState.colliders) {
            if (_ray.intersectBox(box.box3, _boxHitPoint)) {
              const d = _bossPrevPos.distanceTo(_boxHitPoint);
              if (d <= segLen + 0.45) {
                _worldHitPos.copy(_boxHitPoint);
                blocked = true;
                break;
              }
            }
          }
        }
      }

      if (blocked) {
        bp.active = false;
        dummy.quaternion.identity();
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        bossProjMesh.current?.setMatrixAt(i, dummy.matrix);
        bp.hiddenSynced = true;
        bossProjUpdated = true;
        spawnExplosion(_worldHitPos, 12);
        continue;
      }

      _lineSegment.closestPointToPoint(SceneState.playerPosition, true, _closestPoint);
      if (_closestPoint.distanceTo(SceneState.playerPosition) <= 1.25) {
        bp.active = false;
        dummy.quaternion.identity();
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        bossProjMesh.current?.setMatrixAt(i, dummy.matrix);
        bp.hiddenSynced = true;
        bossProjUpdated = true;
        storeState.damagePlayer(bp.damage);
        storeState.addCameraShake(0.45);
        playSound('hit');
        continue;
      }

      if (bossProjMesh.current) {
        dummy.position.copy(bp.position);
        dummy.quaternion.identity();
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        bossProjMesh.current.setMatrixAt(i, dummy.matrix);
        bossProjUpdated = true;
      }
    }
    if (bossProjUpdated && bossProjMesh.current) {
      bossProjMesh.current.instanceMatrix.needsUpdate = true;
    }

    // 5. Update Zero-Latency Player Projectiles with continuous ray-segment collision
    const { activePowers } = storeState;
    const currentBigHitbox = activePowers.BIG_HITBOX || 0;
    const currentEmpStacks = activePowers.EMP_BLAST || 0;
    const currentTripleStacks = activePowers.TRIPLE_SHOT || 0;
    const currentHeavyDamage = activePowers.HEAVY_DAMAGE || 0;
    const currentCritStacks = activePowers.CRITICAL_OPTICS || 0;
    const projScale = 1 + currentBigHitbox * 0.6;
    const effectiveProjRadius = GAME_CONFIG.projectile.radius * projScale;

    let playerProjUpdated = false;
    for (let i = 0; i < MAX_PLAYER_PROJ; i++) {
      const proj = playerProjSlots.current[i];
      if (!proj) continue;
      if (!proj.active) {
        if (!proj.hiddenSynced && playerProjMesh.current) {
          dummy.quaternion.identity();
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          playerProjMesh.current.setMatrixAt(i, dummy.matrix);
          proj.hiddenSynced = true;
          playerProjUpdated = true;
        }
        continue;
      }

      _prevPos.copy(proj.position);
      proj.position.addScaledVector(proj.velocity, dt);
      proj.age += dt;
      _lineSegment.set(_prevPos, proj.position);

      if (proj.age > GAME_CONFIG.projectile.lifetime || storeState.roundState !== 'PLAYING') {
        proj.active = false;
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        playerProjMesh.current?.setMatrixAt(i, dummy.matrix);
        proj.hiddenSynced = true;
        playerProjUpdated = true;
        if (currentTripleStacks === 0 && storeState.roundState === 'PLAYING') {
          storeState.resetCombo();
        }
        continue;
      }

      const segLen = _prevPos.distanceTo(proj.position);
      let closestWorldDist = Infinity;
      let hitWorldType: 'floor' | 'perimeter' | 'box' | null = null;
      let hitBox: MapBox | null = null;

      if (segLen > 0.0001) {
        _rayDir.subVectors(proj.position, _prevPos).divideScalar(segLen);
        _ray.set(_prevPos, _rayDir);

        // Floor collision (y <= 0)
        if (proj.position.y <= 0 && _prevPos.y > 0) {
          const t = _prevPos.y / (_prevPos.y - proj.position.y);
          const d = t * segLen;
          if (d < closestWorldDist) {
            closestWorldDist = d;
            _worldHitPos.lerpVectors(_prevPos, proj.position, t);
            hitWorldType = 'floor';
            hitBox = null;
          }
        }

        // Outer hangar perimeter wall
        if (Math.hypot(proj.position.x, proj.position.z + 10) >= 62) {
          if (segLen < closestWorldDist) {
            closestWorldDist = segLen;
            _worldHitPos.copy(proj.position);
            hitWorldType = 'perimeter';
            hitBox = null;
          }
        }

        // Procedural map obstacles
        for (const box of SceneState.colliders) {
          const hit = _ray.intersectBox(box.box3, _boxHitPoint);
          if (hit) {
            const d = _prevPos.distanceTo(_boxHitPoint);
            if (d <= segLen + effectiveProjRadius && d < closestWorldDist) {
              closestWorldDist = d;
              _worldHitPos.copy(_boxHitPoint);
              hitWorldType = 'box';
              hitBox = box;
            }
          }
        }
      }

      // Find closest target hit along segment
      let closestTarget = null;
      let closestTargetDist = Infinity;

      for (const target of SceneState.targets) {
        if (!target.active || target.id === proj.lastHitTargetId) continue;

        const hitRadius = target.scale * 0.78 + effectiveProjRadius;
        _targetCenter.set(target.position[0], target.position[1], target.position[2]);
        _lineSegment.closestPointToPoint(_targetCenter, true, _closestPoint);

        const distToCenter = _closestPoint.distanceTo(_targetCenter);

        if (distToCenter <= hitRadius) {
          const d = _prevPos.distanceTo(_closestPoint);
          if (d < closestTargetDist) {
            closestTargetDist = d;
            closestTarget = target;
            _hitPos.copy(_closestPoint);
          }
        }
      }

      // Resolve whichever impact occurred first (target vs solid obstacle)
      if (closestTarget && closestTargetDist <= closestWorldDist) {
        const bossHasShield = closestTarget.isBoss && SceneState.targets.some((t) => t.active && t.isGenerator);
        const canPierce = !bossHasShield && (proj.pierceLeft || 0) > 0;

        if (canPierce) {
          proj.pierceLeft = (proj.pierceLeft || 0) - 1;
          proj.lastHitTargetId = closestTarget.id;
          if (playerProjMesh.current) {
            _projDir.copy(proj.velocity).normalize();
            dummy.position.copy(proj.position);
            setUnitYQuaternion(dummy.quaternion, _projDir);
            dummy.scale.setScalar(projScale);
            dummy.updateMatrix();
            playerProjMesh.current.setMatrixAt(i, dummy.matrix);
            playerProjUpdated = true;
          }
        } else {
          proj.active = false;
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          playerProjMesh.current?.setMatrixAt(i, dummy.matrix);
          proj.hiddenSynced = true;
          playerProjUpdated = true;
        }

        if (bossHasShield) {
          // Shielded Boss deflects incoming fire until all generators are destroyed
          playSound('zoom');
          spawnShockwave(_hitPos, 2.4, '#22d3ee', 0.3);
          spawnExplosion(_hitPos, 10);
        } else {
          const baseDmg = GAME_CONFIG.projectile.damage + currentHeavyDamage;
          const critChance = Math.min(1, currentCritStacks * 0.25);
          const isCrit = critChance > 0 && Math.random() < critChance;
          const finalDmg = isCrit ? Math.ceil(baseDmg * 2.5) : baseDmg;

          closestTarget.health -= finalDmg;
          playSound('hit');
          spawnExplosion(_hitPos);
          if (isCrit) {
            spawnShockwave(_hitPos, 2.2, '#facc15', 0.28);
          }

          if (closestTarget.health <= 0) {
            closestTarget.active = false;
            playSound('destroy');
            storeState.addCameraShake(closestTarget.isBoss ? 0.8 : closestTarget.isGenerator ? 0.5 : 0.35);

            spawnShockwave(
              _hitPos,
              closestTarget.isBoss ? 14 : closestTarget.isGenerator ? 5.5 : 3.2 * Math.max(0.7, closestTarget.scale),
              closestTarget.isBoss ? '#ff2a55' : closestTarget.isGenerator ? '#22d3ee' : '#fb923c',
              closestTarget.isBoss ? 0.7 : 0.38
            );

            _targetCenter.set(closestTarget.position[0], closestTarget.position[1], closestTarget.position[2]);
            const distFromCamera = SceneState.playerPosition.distanceTo(_targetCenter);
            const distMultiplier = Math.max(1, distFromCamera / 20);
            const finalPoints = Math.round(closestTarget.points * distMultiplier);

            storeState.registerHit(finalPoints);
            SceneState.onTargetDestroyed(closestTarget.id);

            // Spawn Drops on Target Death
            if (closestTarget.isBoss) {
              triggerHaptic('bossDeath');
              spawnCombatDrop(_targetCenter, 'SHIELD');
              spawnCombatDrop(_targetCenter, 'AMMO');
              spawnCombatDrop(_targetCenter, 'NANITE');
            } else if (Math.random() < 0.65) {
              spawnCombatDrop(_targetCenter);
            }

            let generatorDestroyed = Boolean(closestTarget.isGenerator);

            // EMP_BLAST Power
            if (currentEmpStacks > 0) {
              const empRadius = 10 + (currentEmpStacks - 1) * 4;
              spawnShockwave(_targetCenter, empRadius * 0.9, '#22d3ee', 0.55);

              const blastOriginX = closestTarget.position[0];
              const blastOriginY = closestTarget.position[1];
              const blastOriginZ = closestTarget.position[2];

              for (const other of SceneState.targets) {
                if (!other.active || other.id === closestTarget.id) continue;
                const dx = other.position[0] - blastOriginX;
                const dy = other.position[1] - blastOriginY;
                const dz = other.position[2] - blastOriginZ;
                if (dx * dx + dy * dy + dz * dz <= empRadius * empRadius) {
                  if (other.isBoss) {
                    const otherShielded = SceneState.targets.some((t) => t.active && t.isGenerator);
                    if (!otherShielded) {
                      other.health = Math.max(1, other.health - 5 * currentEmpStacks);
                      _hitPos.set(other.position[0], other.position[1], other.position[2]);
                      spawnExplosion(_hitPos, 15);
                      SceneState.onTargetHit(other.id, other.health);
                    }
                  } else {
                    other.active = false;
                    other.health = 0;
                    if (other.isGenerator) generatorDestroyed = true;
                    _hitPos.set(other.position[0], other.position[1], other.position[2]);
                    spawnExplosion(_hitPos);
                    spawnShockwave(_hitPos, other.isGenerator ? 5.5 : 2.5, '#22d3ee', 0.35);
                    const otherDist = SceneState.playerPosition.distanceTo(_hitPos);
                    const otherPts = Math.round(other.points * Math.max(1, otherDist / 20));
                    storeState.registerHit(otherPts);
                    SceneState.onTargetDestroyed(other.id);
                  }
                }
              }
            }

            if (generatorDestroyed) {
              const remainingGens = SceneState.targets.filter((t) => t.active && t.isGenerator).length;
              const prevBoss = useGameStore.getState().bossInfo;
              if (prevBoss) {
                useGameStore.getState().setBossInfo({
                  ...prevBoss,
                  shielded: remainingGens > 0,
                  generatorsRemaining: remainingGens,
                });
              }
              if (remainingGens === 0) {
                const activeBoss = SceneState.targets.find((t) => t.active && t.isBoss);
                if (activeBoss) {
                  _targetCenter.set(activeBoss.position[0], activeBoss.position[1], activeBoss.position[2]);
                  spawnShockwave(_targetCenter, 12, '#22d3ee', 0.65);
                }
                playSound('destroy');
              }
            }
          } else {
            SceneState.onTargetHit(closestTarget.id, closestTarget.health);
          }
        }
      } else if (closestWorldDist < Infinity) {
        if ((proj.bouncesLeft || 0) > 0) {
          if (hitWorldType === 'floor') {
            proj.velocity.y = Math.abs(proj.velocity.y);
          } else if (hitWorldType === 'perimeter') {
            let nx = -_worldHitPos.x;
            let nz = -(_worldHitPos.z + 10);
            const len = Math.hypot(nx, nz) || 1;
            nx /= len;
            nz /= len;
            const dot = proj.velocity.x * nx + proj.velocity.z * nz;
            if (dot < 0) {
              proj.velocity.x -= 2 * dot * nx;
              proj.velocity.z -= 2 * dot * nz;
            }
          } else if (hitWorldType === 'box' && hitBox) {
            const dLeft = Math.abs(_worldHitPos.x - hitBox.minX);
            const dRight = Math.abs(_worldHitPos.x - hitBox.maxX);
            const dBottom = Math.abs(_worldHitPos.y - hitBox.minY);
            const dTop = Math.abs(_worldHitPos.y - hitBox.maxY);
            const dBack = Math.abs(_worldHitPos.z - hitBox.minZ);
            const dFront = Math.abs(_worldHitPos.z - hitBox.maxZ);
            const minFace = Math.min(dLeft, dRight, dBottom, dTop, dBack, dFront);
            if (minFace === dLeft) proj.velocity.x = -Math.abs(proj.velocity.x);
            else if (minFace === dRight) proj.velocity.x = Math.abs(proj.velocity.x);
            else if (minFace === dBottom) proj.velocity.y = -Math.abs(proj.velocity.y);
            else if (minFace === dTop) proj.velocity.y = Math.abs(proj.velocity.y);
            else if (minFace === dBack) proj.velocity.z = -Math.abs(proj.velocity.z);
            else proj.velocity.z = Math.abs(proj.velocity.z);
          }

          _projDir.copy(proj.velocity).normalize();
          proj.position.copy(_worldHitPos).addScaledVector(_projDir, 0.15);
          proj.bouncesLeft = (proj.bouncesLeft || 0) - 1;
          proj.lastHitTargetId = null;
          spawnExplosion(_worldHitPos, 8);
          playSound('zoom');
          if (playerProjMesh.current) {
            dummy.position.copy(proj.position);
            setUnitYQuaternion(dummy.quaternion, _projDir);
            dummy.scale.setScalar(projScale);
            dummy.updateMatrix();
            playerProjMesh.current.setMatrixAt(i, dummy.matrix);
            playerProjUpdated = true;
          }
        } else {
          proj.active = false;
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          playerProjMesh.current?.setMatrixAt(i, dummy.matrix);
          proj.hiddenSynced = true;
          playerProjUpdated = true;
          spawnExplosion(_worldHitPos);
          playSound('hit');
          if (currentTripleStacks === 0) {
            storeState.resetCombo();
          }
        }
      } else if (playerProjMesh.current) {
        _projDir.copy(proj.velocity).normalize();
        dummy.position.copy(proj.position);
        setUnitYQuaternion(dummy.quaternion, _projDir);
        dummy.scale.setScalar(projScale);
        dummy.updateMatrix();
        playerProjMesh.current.setMatrixAt(i, dummy.matrix);
        playerProjUpdated = true;
      }
    }
    if (playerProjUpdated && playerProjMesh.current) {
      playerProjMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={particlesMesh} frustumCulled={false} args={PARTICLES_ARGS}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshBasicMaterial color="#fb923c" toneMapped={false} />
      </instancedMesh>

      {/* Zero-Latency Instanced Player Plasma Bolts */}
      <instancedMesh ref={playerProjMesh} frustumCulled={false} args={PLAYER_PROJ_ARGS}>
        <cylinderGeometry args={[0.12, 0.08, 2.4, 8]} />
        <meshBasicMaterial ref={playerProjMatRef} color="#38bdf8" toneMapped={false} />
      </instancedMesh>

      {/* Instant Luminous Laser Tracer Beams (Barrel -> Target) */}
      {TRACER_INDICES.map((idx) => (
        <mesh
          key={`tracer-${idx}`}
          frustumCulled={false}
          ref={(el) => {
            tracerMeshes.current[idx] = el;
          }}
        >
          <cylinderGeometry args={[0.045, 0.028, 1, 6]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Pooled Boss Crimson Plasma Attack Orbs */}
      <instancedMesh ref={bossProjMesh} frustumCulled={false} args={BOSS_PROJ_ARGS}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshBasicMaterial color="#ff2a55" toneMapped={false} />
      </instancedMesh>

      {/* Pooled Shockwave Explosion Rings */}
      {SHOCKWAVE_INDICES.map((idx) => (
        <mesh
          key={idx}
          frustumCulled={false}
          ref={(el) => {
            shockwaveMeshes.current[idx] = el;
          }}
        >
          <ringGeometry args={[0.78, 1.0, 32]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
};
