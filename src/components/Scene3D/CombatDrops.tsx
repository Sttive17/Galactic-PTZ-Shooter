import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneState } from '../../game/sceneState';
import { useGameStore } from '../../game/gameState';
import { playSound } from '../../game/AudioSystem';
import { triggerHaptic } from '../../game/haptics';

const _distVec = new THREE.Vector3();
const _playerCenter = new THREE.Vector3();

export const CombatDrops = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    const drops = SceneState.drops;
    if (drops.length === 0) return;

    _playerCenter.copy(SceneState.playerPosition);
    _playerCenter.y -= 0.6; // target player torso

    const store = useGameStore.getState();

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      if (!drop || !drop.active) {
        drops.splice(i, 1);
        continue;
      }

      drop.age += dt;
      if (drop.age >= drop.maxAge) {
        drop.active = false;
        drops.splice(i, 1);
        continue;
      }

      // Physics: fall to floor level y ~ 0.6
      if (drop.position.y > 0.6) {
        drop.velocity.y -= 14 * dt;
        drop.position.addScaledVector(drop.velocity, dt);
        if (drop.position.y < 0.6) {
          drop.position.y = 0.6;
          drop.velocity.set(0, 0, 0);
        }
      } else {
        drop.position.y = 0.6 + Math.sin(t * 3.5 + i) * 0.12;
      }

      // Player magnet & collection
      _distVec.subVectors(_playerCenter, drop.position);
      const dist = _distVec.length();

      if (dist < 8.5) {
        // Magnet acceleration towards player
        const pullSpeed = Math.min(22, 12 / Math.max(0.4, dist));
        drop.position.lerp(_playerCenter, dt * pullSpeed);
      }

      if (dist < 1.4) {
        // Collect drop!
        drop.active = false;
        drops.splice(i, 1);
        playSound('zoom');
        triggerHaptic('hit');

        if (drop.kind === 'SHIELD') {
          store.regenShield(drop.value);
        } else if (drop.kind === 'AMMO') {
          SceneState.ammo = SceneState.maxAmmo;
          SceneState.isReloading = false;
          SceneState.reloadProgress = 0;
        } else if (drop.kind === 'NANITE') {
          store.addNanites(drop.value);
          store.registerHit(150);
        }
      }
    }
  });

  const drops = SceneState.drops;

  return (
    <group ref={groupRef}>
      {drops.map((drop) => {
        if (!drop.active) return null;
        const isShield = drop.kind === 'SHIELD';
        const isAmmo = drop.kind === 'AMMO';
        const color = isShield ? '#38bdf8' : isAmmo ? '#fbbf24' : '#c084fc';

        return (
          <group key={drop.id} position={drop.position}>
            {/* Outer glowing aura */}
            <mesh>
              <sphereGeometry args={[0.38, 12, 12]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Core rotating shape */}
            <mesh rotation={[drop.age * 2, drop.age * 2.5, 0]}>
              {isShield ? (
                <octahedronGeometry args={[0.26, 0]} />
              ) : isAmmo ? (
                <cylinderGeometry args={[0.12, 0.12, 0.38, 8]} />
              ) : (
                <dodecahedronGeometry args={[0.24, 0]} />
              )}
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.8}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
