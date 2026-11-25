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

  // High-Fidelity Spaceships & Player Vessel
  PLAYER_SHIP: 'assets/models/ships/player_ship.glb',
  FIGHTER_INTERCEPTOR: 'assets/models/ships/fighter_interceptor.glb',

  // Cyberpunk & Advanced Combat Enemies
  DRONE_GUNNER: 'assets/models/enemies/drone_gunner.glb',
  DRONE_SCOUT: 'assets/models/enemies/drone_scout.glb',
  ROBOT_WALKER: 'assets/models/enemies/robot_walker.glb',
  HEAVY_CYBORG: 'assets/models/enemies/heavy_cyborg.glb',

  // Colossal Mechas & Bosses
  BOSS_MECHA_TITAN: 'assets/models/bosses/boss_mecha_titan.glb',
  BOSS_BEHEMOTH: 'assets/models/bosses/boss_behemoth.glb',

  // Weapons
  WEAPON_RIFLE_PLASMA: 'assets/models/weapons/rifle_plasma.glb',
  WEAPON_LAUNCHER_HEAVY: 'assets/models/weapons/launcher_heavy.glb',
  WEAPON_SNIPER_RAILGUN: 'assets/models/weapons/sniper_railgun.glb',

  // Modular Hangar Environment
  HANGAR_FLOOR: 'assets/models/environments/hangar_floor.glb',
  HANGAR_WALL: 'assets/models/environments/hangar_wall.glb',
  HANGAR_COLUMN: 'assets/models/environments/hangar_column.glb',
  HANGAR_DOOR: 'assets/models/environments/hangar_door.glb',
  HANGAR_STAIRS: 'assets/models/environments/hangar_stairs.glb',

  // Props & Pickups
  SCIFI_CRATE: 'assets/models/props/scifi_crate.glb',
  SCIFI_CAPSULE: 'assets/models/props/scifi_capsule.glb',
  POWER_GENERATOR: 'assets/models/props/power_generator.glb',
  TURRET_DEFENSE: 'assets/models/props/turret_defense.glb',
  PICKUP_LOOTBOX: 'assets/models/pickups/lootbox.glb',
  PICKUP_SHIELD: 'assets/models/pickups/pickup_shield.glb',
  PICKUP_CORE: 'assets/models/pickups/pickup_core.glb',
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

/**
 * Preload only assets that the next interaction is expected to show.
 *
 * Models otherwise load when their owning scene component mounts. Loading the
 * whole catalogue at boot caused unnecessary network, CPU and GPU work before
 * the player had even selected a mode.
 */
export function preloadModels(keys: readonly ModelKey[]): void {
  for (const key of keys) {
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
