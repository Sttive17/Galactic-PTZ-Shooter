import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const MODEL_PATHS = {
  // Enemies & Craft Archetypes
  CRAFT_SCOUT: 'models/enemies/craft_scout.glb',
  CRAFT_KAMIKAZE: 'models/enemies/craft_kamikaze.glb',
  CRAFT_SNIPER: 'models/enemies/craft_sniper.glb',
  CRAFT_TANK: 'models/enemies/craft_tank.glb',
  CRAFT_BOSS: 'models/enemies/craft_boss.glb',

  // Dedicated Boss Flagships & Super-Weapons
  BOSS_OMEGA: 'models/enemies/boss_omega.glb',
  BOSS_VORTEX: 'models/enemies/boss_vortex.glb',
  BOSS_TITAN: 'models/enemies/boss_titan.glb',
  BOSS_RACER: 'models/enemies/boss_racer.glb',
  BOSS_MINER: 'models/enemies/boss_miner.glb',
  TURRET_HEAVY: 'models/enemies/turret_heavy.glb',

  // Standard Environment Props
  CONTAINER: 'models/props/container.glb',
  CONTAINER_TALL: 'models/props/container_tall.glb',
  GENERATOR: 'models/props/generator.glb',
  PLASMA_BARREL: 'models/props/plasma_barrel.glb',
  SATELLITE_DISH: 'models/props/satellite_dish.glb',
  HOLOGRAM_TABLE: 'models/props/hologram_table.glb',
  COMPUTER_TERMINAL: 'models/props/computer_terminal.glb',
  METEOR: 'models/props/meteor.glb',

  // Trees & Nature Biome (Campo Abierto Terrestre)
  TREE_PINE: 'models/props/tree_pine.glb',
  TREE_OAK: 'models/props/tree_oak.glb',
  TREE_PALM: 'models/props/tree_palm.glb',
  TREE_DEFAULT: 'models/props/tree_default.glb',
  PLANT_BUSH: 'models/props/plant_bush.glb',
  ROCK_TALL: 'models/props/rock_tall.glb',
  ROVER: 'models/props/rover.glb',

  // Rocket & Spaceport Biome (Zona de Lanzamiento)
  ROCKET_BASE: 'models/props/rocket_base.glb',
  ROCKET_FUEL: 'models/props/rocket_fuel.glb',
  ROCKET_TOP: 'models/props/rocket_top.glb',
  ROCKET_FINS: 'models/props/rocket_fins.glb',
  HANGAR: 'models/props/hangar.glb',
  SATELLITE_LARGE: 'models/props/satellite_large.glb',

  // Crystals & Deep Space Biome (Arena Galáctica / Nebulosa)
  CRYSTAL_LARGE: 'models/props/crystal_large.glb',
  CRYSTAL_CLUSTER: 'models/props/crystal_cluster.glb',
} as const;

export type ModelKey = keyof typeof MODEL_PATHS;

export function getModelUrl(relPath: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  return cleanBase + cleanPath;
}

const modelCache = new Map<string, THREE.Group>();
const pendingLoads = new Map<string, Promise<THREE.Group>>();
const loader = new GLTFLoader();

export async function loadModel(key: ModelKey): Promise<THREE.Group> {
  const relPath = MODEL_PATHS[key];
  const url = getModelUrl(relPath);

  if (modelCache.has(url)) {
    return modelCache.get(url)!;
  }

  if (pendingLoads.has(url)) {
    return pendingLoads.get(url)!;
  }

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    // Explicitly set resource path to the model's parent folder so relative textures resolve cleanly
    const lastSlash = url.lastIndexOf('/');
    const resourceDir = lastSlash !== -1 ? url.slice(0, lastSlash + 1) : '';
    loader.setResourcePath(resourceDir);

    loader.load(
      url,
      (gltf) => {
        // Auto-center model at local origin (0, 0, 0)
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        for (const child of gltf.scene.children) {
          child.position.sub(center);
        }

        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        modelCache.set(url, gltf.scene);
        pendingLoads.delete(url);
        resolve(gltf.scene);
      },
      undefined,
      (err) => {
        pendingLoads.delete(url);
        console.warn(`[modelLoader] Could not load model ${url}, falling back:`, err);
        reject(err);
      }
    );
  });

  pendingLoads.set(url, promise);
  return promise;
}

export function preloadAllModels(): void {
  for (const key of Object.keys(MODEL_PATHS) as ModelKey[]) {
    loadModel(key).catch(() => {});
  }
}

export function usePreloadedModel(key: ModelKey): THREE.Group | null {
  const relPath = MODEL_PATHS[key];
  const url = getModelUrl(relPath);
  const [cachedScene, setCachedScene] = useState<THREE.Group | null>(() => modelCache.get(url) || null);

  useEffect(() => {
    if (modelCache.has(url)) {
      return;
    }

    let active = true;
    loadModel(key)
      .then((scene) => {
        if (active) setCachedScene(scene);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [key, url]);

  return useMemo(() => {
    if (!cachedScene) return null;
    return cachedScene.clone(true);
  }, [cachedScene]);
}
