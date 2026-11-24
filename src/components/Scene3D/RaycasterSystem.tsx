import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../game/gameState';
import { SceneState } from '../../game/sceneState';
import * as THREE from 'three';

// Reusable static objects to eliminate Garbage Collection allocations in useFrame
const _raycaster = new THREE.Raycaster();
const _screenCenter = new THREE.Vector2(0, 0);
const _targetPos = new THREE.Vector3();
const _sphere = new THREE.Sphere();
const _intersectionPoint = new THREE.Vector3();
const _boxHit = new THREE.Vector3();

export const RaycasterSystem = () => {
  const setCurrentTarget = useGameStore((state) => state.setCurrentTarget);
  const { camera } = useThree();

  useFrame(() => {
    let detectedTarget = null;
    let minDistance = Infinity;

    _raycaster.setFromCamera(_screenCenter, camera);

    // Compute closest blocking wall/obstacle along crosshair ray so we don't lock through walls
    let closestWallDist = Infinity;
    for (const box of SceneState.colliders) {
      if (_raycaster.ray.intersectBox(box.box3, _boxHit)) {
        const d = camera.position.distanceTo(_boxHit);
        if (d < closestWallDist) closestWallDist = d;
      }
    }

    for (const target of SceneState.targets) {
      if (!target.active) continue;
      
      _targetPos.set(target.position[0], target.position[1], target.position[2]);
      const distanceToCamera = camera.position.distanceTo(_targetPos);
      if (distanceToCamera >= closestWallDist) continue;
      
      _sphere.set(_targetPos, target.scale);
      const intersect = _raycaster.ray.intersectSphere(_sphere, _intersectionPoint);
      
      if (intersect) {
        if (distanceToCamera < minDistance) {
          minDistance = distanceToCamera;
          detectedTarget = target;
        }
      }
    }

    if (detectedTarget) {
      const current = useGameStore.getState().currentTarget;
      const healthRatio = detectedTarget.health / detectedTarget.maxHealth;
      if (!current || current.id !== detectedTarget.id || Math.abs(current.health - healthRatio) > 0.01) {
        setCurrentTarget({
          id: detectedTarget.id,
          health: healthRatio,
          points: detectedTarget.points,
          distance: minDistance
        });
      }
    } else {
      if (useGameStore.getState().currentTarget) {
        setCurrentTarget(null);
      }
    }
  });

  return null;
};
