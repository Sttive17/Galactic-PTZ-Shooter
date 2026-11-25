export type WeaponSkinId = 'DEFAULT' | 'CYBERPUNK_NEON' | 'GALACTIC_GOLD' | 'VOID_PHANTOM';
export type TacticalDoctrineId =
  | 'CAPACITOR_ARRAY'
  | 'REACTOR_OVERDRIVE'
  | 'SALVAGE_PROTOCOL'
  | 'AUTO_REPAIR';

export interface ArmoryState {
  shieldLevel: number;
  healthLevel: number;
  magnetLevel: number;
  dashLevel: number;
  unlockedSkins: WeaponSkinId[];
  activeSkin: WeaponSkinId;
  unlockedDoctrines: TacticalDoctrineId[];
}

const ARMORY_STORAGE_KEY = 'galactic_ptz_armory_v1';

export const DEFAULT_ARMORY_STATE: ArmoryState = {
  shieldLevel: 0,
  healthLevel: 0,
  magnetLevel: 0,
  dashLevel: 0,
  unlockedSkins: ['DEFAULT'],
  activeSkin: 'DEFAULT',
  unlockedDoctrines: [],
};

export const DOCTRINE_NODES: Record<
  TacticalDoctrineId,
  {
    name: string;
    cost: number;
    description: string;
    effectText: string;
    branch: 'COMBAT' | 'SUPPORT';
    prerequisite?: TacticalDoctrineId;
  }
> = {
  CAPACITOR_ARRAY: {
    name: 'MATRIZ DE CAPACITORES',
    cost: 75,
    description: 'Condensadores de pulso conectados a la red EMP.',
    effectText: 'EMP: -25% de enfriamiento',
    branch: 'COMBAT',
  },
  REACTOR_OVERDRIVE: {
    name: 'REACTOR DE SOBRECARGA',
    cost: 110,
    description: 'Inyectores térmicos que prolongan la ventana de Frenesí.',
    effectText: 'Frenesí: +2 s y -20% de enfriamiento',
    branch: 'COMBAT',
    prerequisite: 'CAPACITOR_ARRAY',
  },
  SALVAGE_PROTOCOL: {
    name: 'PROTOCOLO DE RECUPERACIÓN',
    cost: 65,
    description: 'Drones de apoyo clasifican y recuperan nanitas de combate.',
    effectText: '+25% nanitas recogidas',
    branch: 'SUPPORT',
  },
  AUTO_REPAIR: {
    name: 'MALLA DE AUTORREPARACIÓN',
    cost: 95,
    description: 'Nanofibras reactivos aceleran la reparación de deflectores.',
    effectText: '+35% recarga de escudo',
    branch: 'SUPPORT',
    prerequisite: 'SALVAGE_PROTOCOL',
  },
};

export interface DoctrineModifiers {
  empCooldown: number;
  overdriveCooldown: number;
  overdriveDuration: number;
  naniteMultiplier: number;
  shieldRegenMultiplier: number;
}

export function getDoctrineModifiers(armory: ArmoryState): DoctrineModifiers {
  const unlocked = new Set(armory.unlockedDoctrines);
  return {
    empCooldown: unlocked.has('CAPACITOR_ARRAY') ? 11.25 : 15,
    overdriveCooldown: unlocked.has('REACTOR_OVERDRIVE') ? 20 : 25,
    overdriveDuration: unlocked.has('REACTOR_OVERDRIVE') ? 8 : 6,
    naniteMultiplier: unlocked.has('SALVAGE_PROTOCOL') ? 1.25 : 1,
    shieldRegenMultiplier: unlocked.has('AUTO_REPAIR') ? 1.35 : 1,
  };
}

export function getArmoryVitalStats(armory: ArmoryState): { shield: number; health: number } {
  return {
    shield: Math.round(100 * (1 + armory.shieldLevel * 0.15)),
    health: Math.round(100 * (1 + armory.healthLevel * 0.15)),
  };
}

export const UPGRADE_TIERS = {
  shield: [
    { level: 1, cost: 35, bonusText: '+15% Escudo Base' },
    { level: 2, cost: 80, bonusText: '+30% Escudo Base' },
    { level: 3, cost: 160, bonusText: '+50% Escudo Base' },
  ],
  health: [
    { level: 1, cost: 35, bonusText: '+15% Casco/Salud Base' },
    { level: 2, cost: 80, bonusText: '+30% Casco/Salud Base' },
    { level: 3, cost: 160, bonusText: '+50% Casco/Salud Base' },
  ],
  magnet: [
    { level: 1, cost: 30, bonusText: '+3m Radio Imán de Drops' },
    { level: 2, cost: 70, bonusText: '+6m Radio Imán de Drops' },
    { level: 3, cost: 140, bonusText: '+10m Radio Imán de Drops' },
  ],
  dash: [
    { level: 1, cost: 50, bonusText: '-20% Enfriamiento de Propulsor' },
    { level: 2, cost: 120, bonusText: '-40% Enfriamiento de Propulsor' },
  ],
};

export const SKIN_CATALOG: Record<
  WeaponSkinId,
  { name: string; cost: number; description: string; accentColor: string; bodyColor: string }
> = {
  DEFAULT: {
    name: 'TITANIO ESTÁNDAR',
    cost: 0,
    description: 'Chasis militar de aleación de titanio y recubrimiento cerámico orbital.',
    accentColor: '#22d3ee',
    bodyColor: '#1e293b',
  },
  CYBERPUNK_NEON: {
    name: 'CYBERPUNK NEÓN',
    cost: 50,
    description: 'Acabado en cian y fucsia fosforescente con condensadores de alto voltaje.',
    accentColor: '#e879f9',
    bodyColor: '#0f172a',
  },
  GALACTIC_GOLD: {
    name: 'ORO GALÁCTICO',
    cost: 100,
    description: 'Blindaje bañado en oro cuántico pulido de grado almirante estelar.',
    accentColor: '#fbbf24',
    bodyColor: '#78350f',
  },
  VOID_PHANTOM: {
    name: 'ESPECTRO DEL VACÍO',
    cost: 150,
    description: 'Material obsidian ultra-oscuro que absorbe fotones y emite energía oscura.',
    accentColor: '#a855f7',
    bodyColor: '#09090b',
  },
};

export function loadArmoryState(): ArmoryState {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_ARMORY_STATE };
    }
    const raw = window.localStorage.getItem(ARMORY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ARMORY_STATE };
    const parsed = JSON.parse(raw) as Partial<ArmoryState>;
    return {
      shieldLevel: Math.max(0, Math.min(3, parsed.shieldLevel ?? 0)),
      healthLevel: Math.max(0, Math.min(3, parsed.healthLevel ?? 0)),
      magnetLevel: Math.max(0, Math.min(3, parsed.magnetLevel ?? 0)),
      dashLevel: Math.max(0, Math.min(2, parsed.dashLevel ?? 0)),
      unlockedSkins: Array.isArray(parsed.unlockedSkins) && parsed.unlockedSkins.length > 0
        ? parsed.unlockedSkins
        : ['DEFAULT'],
      activeSkin: parsed.activeSkin && SKIN_CATALOG[parsed.activeSkin] ? parsed.activeSkin : 'DEFAULT',
      unlockedDoctrines: Array.isArray(parsed.unlockedDoctrines)
        ? [...new Set(parsed.unlockedDoctrines.filter((id): id is TacticalDoctrineId => id in DOCTRINE_NODES))]
        : [],
    };
  } catch {
    return { ...DEFAULT_ARMORY_STATE };
  }
}

export function saveArmoryState(state: ArmoryState): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(ARMORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota
  }
}
