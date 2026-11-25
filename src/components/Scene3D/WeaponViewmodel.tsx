import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/gameState';
import { SceneState } from '../../game/sceneState';
import { playSound } from '../../game/AudioSystem';
import type { PowerId } from '../../game/powers';
import type { WeaponArchetype } from '../../types/game';
import { usePreloadedModel } from '../../game/modelLoader';
import type { ModelKey } from '../../game/modelLoader';

interface WeaponViewmodelProps {
  muzzleRef: RefObject<THREE.Mesh | null>;
  muzzleLightRef: RefObject<THREE.PointLight | null>;
}

export function getWeaponAccentHex(activePowers: Partial<Record<PowerId, number>>): string {
  if ((activePowers.SMART_AUTOLOCK || 0) > 0) return '#06b6d4';
  if ((activePowers.HEAVY_DAMAGE || 0) > 0) return '#fb7185';
  if ((activePowers.CRITICAL_OPTICS || 0) > 0) return '#facc15';
  if ((activePowers.RICOCHET_ROUNDS || 0) > 0) return '#c084fc';
  if ((activePowers.PIERCING_SHOT || 0) > 0) return '#22d3ee';
  if ((activePowers.EMP_BLAST || 0) > 0) return '#60a5fa';
  if ((activePowers.SLOW_MO_DRONES || 0) > 0) return '#34d399';
  return '#22d3ee';
}

const ModelGun = ({
  modelKey,
  scale = 0.32,
  position = [0, -0.06, -0.05],
  rotation = [0, -Math.PI / 2, 0],
}: {
  modelKey: ModelKey;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const model = usePreloadedModel(modelKey);
  if (!model) return null;
  return <primitive object={model} scale={scale} position={position} rotation={rotation} />;
};

export const WeaponViewmodel = ({ muzzleRef, muzzleLightRef }: WeaponViewmodelProps) => {
  const activePowers = useGameStore((s) => s.activePowers);
  const selectedWeapon = useGameStore((s) => s.selectedWeapon);

  const rootGroupRef = useRef<THREE.Group>(null);
  const coilRef = useRef<THREE.Mesh>(null);
  const haloRingRef = useRef<THREE.Group>(null);

  // Smooth Weapon Swap State
  const [displayedWeapon, setDisplayedWeapon] = useState<WeaponArchetype>(selectedWeapon);
  const swapPhaseRef = useRef<'IDLE' | 'LOWERING' | 'RAISING'>('IDLE');
  const swapProgressRef = useRef<number>(1);
  const targetWeaponRef = useRef<WeaponArchetype>(selectedWeapon);
  const heatLevelRef = useRef<number>(0);

  const accentHex = getWeaponAccentHex(activePowers);
  const hasAutoLock = (activePowers.SMART_AUTOLOCK || 0) > 0;
  const hasOverdrive = (activePowers.RAPID_FIRE || 0) > 0 || (activePowers.HEAVY_DAMAGE || 0) > 0;

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Detect weapon switch request and animate lower-and-raise
    if (selectedWeapon !== targetWeaponRef.current) {
      targetWeaponRef.current = selectedWeapon;
      swapPhaseRef.current = 'LOWERING';
    }

    if (swapPhaseRef.current === 'LOWERING') {
      swapProgressRef.current = Math.max(0, swapProgressRef.current - dt * 8.5);
      if (swapProgressRef.current <= 0) {
        setDisplayedWeapon(targetWeaponRef.current);
        swapPhaseRef.current = 'RAISING';
        playSound('ui');
      }
    } else if (swapPhaseRef.current === 'RAISING') {
      swapProgressRef.current = Math.min(1, swapProgressRef.current + dt * 7.5);
      if (swapProgressRef.current >= 1) {
        swapPhaseRef.current = 'IDLE';
      }
    }

    // Dynamic Overheat & Thermal Vent Dissipation
    if (SceneState.weaponRecoil > 0.05) {
      heatLevelRef.current = Math.min(1, heatLevelRef.current + dt * 1.8);
    } else {
      heatLevelRef.current = Math.max(0, heatLevelRef.current - dt * 0.55);
    }

    if (rootGroupRef.current) {
      const dip = 1 - swapProgressRef.current;
      const reloadDip = SceneState.isReloading ? Math.sin(SceneState.reloadProgress * Math.PI) * 0.12 : 0;
      rootGroupRef.current.position.y = -dip * 0.22 - reloadDip;
      rootGroupRef.current.position.z = dip * 0.1;
      rootGroupRef.current.rotation.x = -dip * 0.38 - reloadDip * 0.6;
    }

    // Dynamic barrel muzzle tip position matching current 3D archetype
    const muzzleZ =
      displayedWeapon === 'HEAVY_RAILGUN' || displayedWeapon === 'CRYO_BEAM'
        ? -0.58
        : displayedWeapon === 'SCATTER_SHOTGUN' || displayedWeapon === 'MICRO_MISSILES'
          ? -0.44
          : -0.50;

    const muzzleY =
      displayedWeapon === 'HEAVY_RAILGUN' ? 0.02 : displayedWeapon === 'SCATTER_SHOTGUN' ? 0.03 : 0.02;

    if (muzzleRef.current) {
      muzzleRef.current.position.set(0, muzzleY, muzzleZ);
    }
    if (muzzleLightRef.current) {
      muzzleLightRef.current.position.set(0, muzzleY + 0.01, muzzleZ - 0.04);
    }

    if (coilRef.current) {
      coilRef.current.rotation.z += dt * (hasOverdrive ? 6.0 : 2.0);
    }
    if (haloRingRef.current) {
      haloRingRef.current.rotation.z -= dt * 3.0;
    }
  });

  return (
    <group ref={rootGroupRef}>
      {/* Real 3D Weapon Models mounted according to active archetype */}
      {displayedWeapon === 'PLASMA_RIFLE' && (
        <ModelGun
          modelKey="WEAPON_RIFLE_PLASMA"
          scale={0.32}
          position={[0, -0.06, -0.05]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      )}

      {displayedWeapon === 'SCATTER_SHOTGUN' && (
        <ModelGun
          modelKey="WEAPON_LAUNCHER_HEAVY"
          scale={0.30}
          position={[0, -0.07, -0.03]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      )}

      {displayedWeapon === 'HEAVY_RAILGUN' && (
        <ModelGun
          modelKey="WEAPON_SNIPER_RAILGUN"
          scale={0.28}
          position={[0, -0.05, -0.08]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      )}

      {displayedWeapon === 'MICRO_MISSILES' && (
        <ModelGun
          modelKey="WEAPON_LAUNCHER_HEAVY"
          scale={0.32}
          position={[0, -0.07, -0.03]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      )}

      {displayedWeapon === 'CRYO_BEAM' && (
        <ModelGun
          modelKey="WEAPON_SNIPER_RAILGUN"
          scale={0.28}
          position={[0, -0.05, -0.08]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      )}

      {/* Futuristic Holographic Power Accents (Optics & Targeting Emitter) */}
      {hasAutoLock && (
        <group position={[0, 0.055, -0.22]}>
          <mesh>
            <ringGeometry args={[0.015, 0.02, 16]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.85} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.04]}>
            <cylinderGeometry args={[0.001, 0.001, 0.1, 6]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} toneMapped={false} />
          </mesh>
        </group>
      )}

      {hasOverdrive && (
        <group ref={haloRingRef} position={[0, 0.02, -0.38]}>
          <mesh>
            <torusGeometry args={[0.045, 0.003, 8, 24]} />
            <meshBasicMaterial color={accentHex} transparent opacity={0.65} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* Muzzle Flash Marker (Preserves Raycast & Exact World Coordinates) */}
      <mesh ref={muzzleRef} position={[0, 0.02, -0.50]} visible={false}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshBasicMaterial color={accentHex} transparent opacity={0.92} toneMapped={false} />
      </mesh>

      {/* Dynamic Muzzle Flash Point Light */}
      <pointLight
        ref={muzzleLightRef}
        position={[0, 0.03, -0.54]}
        color={accentHex}
        intensity={0}
        distance={8}
        decay={2}
      />
    </group>
  );
};
