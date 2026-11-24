import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../game/gameState';
import { SceneState } from '../../game/sceneState';
import { WeaponViewmodel } from './WeaponViewmodel';

// Static reusable calculation objects to eliminate GC allocations
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _targetQuaternion = new THREE.Quaternion();
const _shakeOffset = new THREE.Vector3();

export const PTZCamera = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const weaponRef = useRef<THREE.Group>(null);
  const muzzleRef = useRef<THREE.Mesh>(null);
  const muzzleLightRef = useRef<THREE.PointLight>(null);
  const bobPhaseRef = useRef(0);
  const initialFovRef = useRef(
    THREE.MathUtils.clamp(useGameStore.getState().preferences?.fov ?? 68, 55, 90)
  );

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const { ptz, cameraShake, mode, roundState, currentRound, portalTransition, preferences } =
      useGameStore.getState();
    const clampedDelta = Math.min(delta, 0.05);

    // Cinematic hyperspace portal warp & biome arrival camera sweep
    if (roundState === 'WARP_CINEMATIC') {
      if (weaponRef.current) weaponRef.current.visible = false;
      if (muzzleLightRef.current) muzzleLightRef.current.intensity = 0;

      const arrivedInNewWorld = portalTransition !== null && currentRound === portalTransition.nextLevel;
      if (!arrivedInNewWorld) {
        // Sucked into the swirling vortex at [0, 4.0, -10]
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, 0, Math.min(1, clampedDelta * 4.5));
        cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 4.0, Math.min(1, clampedDelta * 4.5));
        cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, -8.5, Math.min(1, clampedDelta * 4.2));
        cameraRef.current.lookAt(0, 4.0, -28);
        cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, 114, Math.min(1, clampedDelta * 3.8));
        if (preferences?.cameraShake ?? true) {
          cameraRef.current.position.x += (Math.random() - 0.5) * 0.14;
          cameraRef.current.position.y += (Math.random() - 0.5) * 0.14;
        }
      } else {
        // Wide dramatic establishing glide showcasing the new biome sky & architecture
        const t = state.clock.elapsedTime;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, Math.sin(t * 0.6) * 5.5, Math.min(1, clampedDelta * 2.5));
        cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 5.2, Math.min(1, clampedDelta * 2.5));
        cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, 13.5, Math.min(1, clampedDelta * 2.5));
        cameraRef.current.lookAt(0, 9.5, -36);
        cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, 72, Math.min(1, clampedDelta * 3.5));
      }
      cameraRef.current.updateProjectionMatrix();
      return;
    }

    // Cinematic 360° galactic orbit camera when browsing Menu or Level Map
    if (mode === 'MENU' || mode === 'LEVEL_MAP') {
      const t = state.clock.elapsedTime;
      const angle = t * 0.12;
      const radius = 28;
      const camX = Math.sin(angle) * radius;
      const camY = 11 + Math.sin(t * 0.25) * 2.5;
      const camZ = -10 + Math.cos(angle) * radius;

      cameraRef.current.position.set(camX, camY, camZ);
      cameraRef.current.lookAt(0, 6, -14);
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, 66, Math.min(1, clampedDelta * 6));
      cameraRef.current.updateProjectionMatrix();

      if (weaponRef.current) {
        weaponRef.current.visible = false;
      }
      if (muzzleLightRef.current) {
        muzzleLightRef.current.intensity = 0;
      }
      return;
    }

    // 1. Apply First-Person Camera Rotation (360° Yaw & Pitch)
    const panRad = THREE.MathUtils.degToRad(ptz.pan);
    const tiltRad = THREE.MathUtils.degToRad(ptz.tilt);
    _euler.set(tiltRad, -panRad, 0, 'YXZ');
    _targetQuaternion.setFromEuler(_euler);
    cameraRef.current.quaternion.slerp(_targetQuaternion, Math.min(1, clampedDelta * 22));

    // Share live player look direction with Enemy AI (zero GC)
    cameraRef.current.getWorldDirection(SceneState.playerForward);

    // 2. Smooth Zoom (FOV)
    const baseFov = THREE.MathUtils.clamp(preferences?.fov ?? 68, 55, 90);
    const targetFov = baseFov / ptz.zoom;
    cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFov, Math.min(1, clampedDelta * 12));

    // 3. First-Person Position + Subtle Head-Bobbing while walking
    const speedNorm = SceneState.isGrounded ? SceneState.moveSpeedNormalized : 0;
    if (speedNorm > 0.05) {
      bobPhaseRef.current += clampedDelta * (9 + speedNorm * 4);
    }
    const bobY = Math.sin(bobPhaseRef.current) * 0.06 * speedNorm;
    const bobX = Math.cos(bobPhaseRef.current * 0.5) * 0.03 * speedNorm;

    cameraRef.current.position.set(
      SceneState.playerPosition.x + bobX,
      SceneState.playerPosition.y + bobY,
      SceneState.playerPosition.z
    );

    // 4. Screen Shake Logic
    if (cameraShake > 0) {
      if (preferences?.cameraShake ?? true) {
        _shakeOffset.set(
          (Math.random() - 0.5) * cameraShake * 0.35,
          (Math.random() - 0.5) * cameraShake * 0.35,
          (Math.random() - 0.5) * cameraShake * 0.35
        );
        cameraRef.current.position.add(_shakeOffset);

        const newShake = cameraShake - clampedDelta * 2.5;
        if (newShake <= 0) {
          useGameStore.setState({ cameraShake: 0 });
        } else {
          useGameStore.setState({ cameraShake: newShake });
        }
      } else {
        useGameStore.setState({ cameraShake: 0 });
      }
    }

    // 5. First-Person Modular Tactical Weapon Viewmodel Animation (Recoil, ADS, Sway)
    if (weaponRef.current) {
      const showWeapon = mode === 'CHALLENGE' || mode === 'TRAINING';
      weaponRef.current.visible = showWeapon;

      if (showWeapon) {
        // Decay weapon recoil smoothly
        SceneState.weaponRecoil = Math.max(0, SceneState.weaponRecoil - clampedDelta * 8);
        const recoil = SceneState.weaponRecoil;

        // ADS tuck-in when zooming
        const adsFactor = Math.min(1, (ptz.zoom - 1) / 3);
        const baseX = THREE.MathUtils.lerp(0.32, 0.14, adsFactor);
        const baseY = THREE.MathUtils.lerp(-0.26, -0.22, adsFactor);
        const baseZ = THREE.MathUtils.lerp(-0.55, -0.48, adsFactor);

        const swayY = Math.sin(bobPhaseRef.current) * 0.012 * speedNorm;
        const swayX = Math.cos(bobPhaseRef.current * 0.5) * 0.012 * speedNorm;

        // First-Person Reload dip, tilt & lock-in snap animation
        const progress = SceneState.isReloading ? SceneState.reloadProgress : 0;
        const dipCurve = SceneState.isReloading ? Math.sin(Math.min(1, progress) * Math.PI) : 0;
        const lockSnap =
          SceneState.isReloading && progress > 0.85
            ? Math.sin(((progress - 0.85) / 0.15) * Math.PI) * 0.025
            : 0;

        weaponRef.current.position.set(
          baseX + swayX,
          baseY + swayY + recoil * 0.015 - 0.11 * dipCurve + lockSnap,
          baseZ + recoil * 0.07 + 0.04 * dipCurve
        );
        weaponRef.current.rotation.x = recoil * 0.08 - 0.28 * dipCurve;
        weaponRef.current.rotation.z = 0.36 * dipCurve;

        // Muzzle flash flare + dynamic shot illumination
        const flashVisible = !SceneState.isReloading && recoil > 0.65;
        if (muzzleRef.current) {
          muzzleRef.current.visible = flashVisible;
          if (flashVisible) {
            const s = 0.7 + Math.random() * 0.6;
            muzzleRef.current.scale.set(s, s, s);
          }
        }
        if (muzzleLightRef.current) {
          muzzleLightRef.current.intensity = flashVisible ? 6 : 0;
        }

        // Track exact 3D world coordinates of the rifle muzzle tip on the current frame
        cameraRef.current.updateMatrixWorld(true);
        if (muzzleRef.current) {
          muzzleRef.current.getWorldPosition(SceneState.muzzlePosition);
        }
      } else if (muzzleLightRef.current) {
        muzzleLightRef.current.intensity = 0;
      }
    }

    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={initialFovRef.current}
      near={0.05}
      far={650}
      position={[0, 2, 14]}
    >
      {/* First-Person Modular Evolving Sci-Fi Pulse Rifle */}
      <group ref={weaponRef} position={[0.32, -0.26, -0.55]}>
        <WeaponViewmodel muzzleRef={muzzleRef} muzzleLightRef={muzzleLightRef} />
      </group>
    </PerspectiveCamera>
  );
};
