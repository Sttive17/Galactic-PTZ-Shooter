import * as THREE from 'three';

export type BiomeChapter =
  | 'UNDERGROUND_LAB'
  | 'EARTH_OPEN_FIELD'
  | 'ROCKET_LAUNCH_ZONE'
  | 'ORBITAL_STRATOSPHERE'
  | 'GALACTIC_ARENA';

export type SkyMode =
  | 'ENCLOSED_BUNKER'
  | 'EARTH_DAY'
  | 'LAUNCH_DUSK'
  | 'ORBITAL_HORIZON'
  | 'DEEP_SPACE';

export type BiomeArchitecture =
  | 'LAB_BUNKER'
  | 'EARTH_VALLEY'
  | 'ROCKET_PAD'
  | 'ORBITAL_STATION'
  | 'ORBITAL_HANGAR'
  | 'CANYON_OUTPOST'
  | 'ICE_CITADEL'
  | 'PLASMA_REACTOR'
  | 'VOID_MONOLITHS'
  | 'SOLAR_FOUNDRY'
  | 'BIO_DOME'
  | 'QUANTUM_MATRIX'
  | 'LAVA_FORTRESS'
  | 'ASTRAL_TEMPLE';

export type WeatherStyle =
  | 'DATA_MOTES'
  | 'DUST_STORM'
  | 'SNOW_CRYSTALS'
  | 'PLASMA_SPARKS'
  | 'STAR_EMBERS'
  | 'SOLAR_ASH'
  | 'BIO_SPORES';

export interface ChapterMeta {
  index: number;
  roman: string;
  name: string;
  rangeLabel: string;
  accentHex: string;
  cinematicQuote: string;
  skyMode: SkyMode;
}

export const CHAPTER_META: Record<BiomeChapter, ChapterMeta> = {
  UNDERGROUND_LAB: {
    index: 1,
    roman: 'I',
    name: 'LABORATORIO SUBTERRÁNEO',
    rangeLabel: 'NIVELES 1 - 10',
    accentHex: '#22d3ee',
    cinematicQuote: 'COMPLEJO CRIO-BIOMÉDICO B-09 // PROFUNDIDAD -420M',
    skyMode: 'ENCLOSED_BUNKER',
  },
  EARTH_OPEN_FIELD: {
    index: 2,
    roman: 'II',
    name: 'CAMPO ABIERTO TERRESTRE',
    rangeLabel: 'NIVELES 11 - 20',
    accentHex: '#34d399',
    cinematicQuote: 'VALLE VERDE DE SUPERFICIE // ATMÓSFERA DESPEJADA',
    skyMode: 'EARTH_DAY',
  },
  ROCKET_LAUNCH_ZONE: {
    index: 3,
    roman: 'III',
    name: 'ZONA DE LANZAMIENTO ESPACIAL',
    rangeLabel: 'NIVELES 21 - 30',
    accentHex: '#fb923c',
    cinematicQuote: 'PUERTO AEROESPACIAL APOLO // IGNICIÓN EN CUENTA REGRESIVA',
    skyMode: 'LAUNCH_DUSK',
  },
  ORBITAL_STRATOSPHERE: {
    index: 4,
    roman: 'IV',
    name: 'ESTACIÓN ESTRATOSFÉRICA',
    rangeLabel: 'NIVELES 31 - 40',
    accentHex: '#60a5fa',
    cinematicQuote: 'ÓRBITA BAJA TERRESTRE // UMBRAL DEL ESPACIO PROFUNDO',
    skyMode: 'ORBITAL_HORIZON',
  },
  GALACTIC_ARENA: {
    index: 5,
    roman: 'V',
    name: 'ARENA GALÁCTICA PROFUNDA',
    rangeLabel: 'NIVELES 41 - 50',
    accentHex: '#e879f9',
    cinematicQuote: 'CONVERGENCIA CÓSMICA // CONQUISTA EL SECTOR OMEGA',
    skyMode: 'DEEP_SPACE',
  },
};

export function getChapterForLevel(level: number): BiomeChapter {
  const safe = Math.max(1, Math.floor(level));
  if (safe <= 10) return 'UNDERGROUND_LAB';
  if (safe <= 20) return 'EARTH_OPEN_FIELD';
  if (safe <= 30) return 'ROCKET_LAUNCH_ZONE';
  if (safe <= 40) return 'ORBITAL_STRATOSPHERE';
  return 'GALACTIC_ARENA';
}

export interface MapTheme {
  id: string;
  name: string;
  ambientSubtitle: string;
  chapter: BiomeChapter;
  skyMode: SkyMode;
  architecture: BiomeArchitecture;
  weather: WeatherStyle;
  bgColor: string;
  fogColor: string;
  fogDensity: number;
  floorColor: string;
  wallColor: string;
  crateColor: string;
  primaryGlow: string;
  secondaryGlow: string;
  gridPrimary: number;
  gridSecondary: number;
  keyLightColor: string;
  rimLightColor: string;
  skyTintA: [number, number, number];
  skyTintB: [number, number, number];
  skyTintC: [number, number, number];
  floorRoughness: number;
  floorMetalness: number;
  floorClearcoat: number;
}

export interface MapBox {
  id: string;
  kind: 'wall' | 'crate' | 'tower' | 'barrier' | 'platform' | 'jumppad';
  pos: [number, number, number];
  size: [number, number, number];
  accent: 'primary' | 'secondary';
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  box3: THREE.Box3;
}

export interface GeneratedMap {
  seed: number;
  layoutName: string;
  theme: MapTheme;
  obstacles: MapBox[];
}

const LAB_THEMES: MapTheme[] = [
  {
    id: 'LAB_CRYO_VAULT',
    name: 'LABORATORIO CRIO-BÚNKER B-01',
    ambientSubtitle: 'INSTALACIÓN SUBTERRÁNEA · CÁMARA DE CONTENCIÓN',
    chapter: 'UNDERGROUND_LAB',
    skyMode: 'ENCLOSED_BUNKER',
    architecture: 'LAB_BUNKER',
    weather: 'DATA_MOTES',
    bgColor: '#0c131d',
    fogColor: '#121d2b',
    fogDensity: 0.0042,
    floorColor: '#1f2b3a',
    wallColor: '#37485e',
    crateColor: '#2a3748',
    primaryGlow: '#38bdf8',
    secondaryGlow: '#fbbf24',
    gridPrimary: 0x0ea5e9,
    gridSecondary: 0x1e293b,
    keyLightColor: '#e2e8f0',
    rimLightColor: '#38bdf8',
    skyTintA: [0.06, 0.1, 0.18],
    skyTintB: [0.16, 0.45, 0.72],
    skyTintC: [0.22, 0.78, 0.92],
    floorRoughness: 0.34,
    floorMetalness: 0.58,
    floorClearcoat: 0.65,
  },
  {
    id: 'LAB_HAZARD_WING',
    name: 'ALA DE PRUEBAS BALÍSTICAS R-4',
    ambientSubtitle: 'BÚNKER SUBTERRÁNEO · CONDUCTOS INDUSTRIALES',
    chapter: 'UNDERGROUND_LAB',
    skyMode: 'ENCLOSED_BUNKER',
    architecture: 'LAB_BUNKER',
    weather: 'PLASMA_SPARKS',
    bgColor: '#12151c',
    fogColor: '#1a1f29',
    fogDensity: 0.0045,
    floorColor: '#242933',
    wallColor: '#404754',
    crateColor: '#313742',
    primaryGlow: '#fbbf24',
    secondaryGlow: '#22d3ee',
    gridPrimary: 0xf59e0b,
    gridSecondary: 0x334155,
    keyLightColor: '#fef3c7',
    rimLightColor: '#fbbf24',
    skyTintA: [0.1, 0.12, 0.16],
    skyTintB: [0.65, 0.45, 0.14],
    skyTintC: [0.14, 0.74, 0.88],
    floorRoughness: 0.4,
    floorMetalness: 0.62,
    floorClearcoat: 0.48,
  },
  {
    id: 'LAB_XENO_BIO',
    name: 'NÚCLEO BIO-QUÍMICO G-9',
    ambientSubtitle: 'LABORATORIO PROFUNDO · REACTORES DE SÍNTESIS',
    chapter: 'UNDERGROUND_LAB',
    skyMode: 'ENCLOSED_BUNKER',
    architecture: 'LAB_BUNKER',
    weather: 'BIO_SPORES',
    bgColor: '#081716',
    fogColor: '#0e2422',
    fogDensity: 0.0044,
    floorColor: '#18302e',
    wallColor: '#2d4f4b',
    crateColor: '#213d3a',
    primaryGlow: '#34d399',
    secondaryGlow: '#67e8f9',
    gridPrimary: 0x10b981,
    gridSecondary: 0x134e4a,
    keyLightColor: '#ecfeff',
    rimLightColor: '#34d399',
    skyTintA: [0.05, 0.14, 0.13],
    skyTintB: [0.1, 0.58, 0.46],
    skyTintC: [0.35, 0.88, 0.94],
    floorRoughness: 0.3,
    floorMetalness: 0.55,
    floorClearcoat: 0.72,
  },
];

const EARTH_THEMES: MapTheme[] = [
  {
    id: 'EARTH_MORNING_MEADOW',
    name: 'PRADERA TERRESTRE DEL ALBA',
    ambientSubtitle: 'CAMPO ABIERTO · CIELO DESPEJADO MATINAL',
    chapter: 'EARTH_OPEN_FIELD',
    skyMode: 'EARTH_DAY',
    architecture: 'EARTH_VALLEY',
    weather: 'BIO_SPORES',
    bgColor: '#56a8e8',
    fogColor: '#9ad0f5',
    fogDensity: 0.0022,
    floorColor: '#2f6b3f',
    wallColor: '#6b7280',
    crateColor: '#57534e',
    primaryGlow: '#34d399',
    secondaryGlow: '#facc15',
    gridPrimary: 0x4ade80,
    gridSecondary: 0x166534,
    keyLightColor: '#fffbeb',
    rimLightColor: '#7dd3fc',
    skyTintA: [0.22, 0.56, 0.92],
    skyTintB: [0.52, 0.8, 0.98],
    skyTintC: [0.95, 0.96, 0.88],
    floorRoughness: 0.78,
    floorMetalness: 0.08,
    floorClearcoat: 0.05,
  },
  {
    id: 'EARTH_GOLDEN_PLAINS',
    name: 'VALLE VERDE CENTRAL',
    ambientSubtitle: 'CAMPO ABIERTO · ENERGÍA EÓLICA DE SUPERFICIE',
    chapter: 'EARTH_OPEN_FIELD',
    skyMode: 'EARTH_DAY',
    architecture: 'EARTH_VALLEY',
    weather: 'DATA_MOTES',
    bgColor: '#3c91df',
    fogColor: '#8fc8f2',
    fogDensity: 0.002,
    floorColor: '#3b7a38',
    wallColor: '#64748b',
    crateColor: '#78624e',
    primaryGlow: '#fde047',
    secondaryGlow: '#22d3ee',
    gridPrimary: 0x86efac,
    gridSecondary: 0x15803d,
    keyLightColor: '#fef9c3',
    rimLightColor: '#38bdf8',
    skyTintA: [0.16, 0.48, 0.88],
    skyTintB: [0.46, 0.78, 0.96],
    skyTintC: [1.0, 0.92, 0.65],
    floorRoughness: 0.76,
    floorMetalness: 0.08,
    floorClearcoat: 0.05,
  },
  {
    id: 'EARTH_SUNSET_RIDGE',
    name: 'COLINAS DEL OCASO TERRESTRE',
    ambientSubtitle: 'CAMPO ABIERTO · ATARDECER DORADO EN LA TIERRA',
    chapter: 'EARTH_OPEN_FIELD',
    skyMode: 'EARTH_DAY',
    architecture: 'EARTH_VALLEY',
    weather: 'DUST_STORM',
    bgColor: '#b85a3a',
    fogColor: '#e3966d',
    fogDensity: 0.0026,
    floorColor: '#3d5e31',
    wallColor: '#69564e',
    crateColor: '#54433b',
    primaryGlow: '#fb923c',
    secondaryGlow: '#34d399',
    gridPrimary: 0xfb923c,
    gridSecondary: 0x3f6212,
    keyLightColor: '#fed7aa',
    rimLightColor: '#fde047',
    skyTintA: [0.24, 0.3, 0.62],
    skyTintB: [0.88, 0.44, 0.28],
    skyTintC: [1.0, 0.78, 0.42],
    floorRoughness: 0.74,
    floorMetalness: 0.1,
    floorClearcoat: 0.08,
  },
];

const LAUNCH_THEMES: MapTheme[] = [
  {
    id: 'LAUNCH_DUSK_ALPHA',
    name: 'PLATAFORMA DE LANZAMIENTO APOLO',
    ambientSubtitle: 'BASE ESPACIAL · COHETES EN CUENTA REGRESIVA',
    chapter: 'ROCKET_LAUNCH_ZONE',
    skyMode: 'LAUNCH_DUSK',
    architecture: 'ROCKET_PAD',
    weather: 'SOLAR_ASH',
    bgColor: '#1d2647',
    fogColor: '#333b5e',
    fogDensity: 0.0032,
    floorColor: '#2c3442',
    wallColor: '#4c576b',
    crateColor: '#3b4354',
    primaryGlow: '#fb923c',
    secondaryGlow: '#38bdf8',
    gridPrimary: 0xf97316,
    gridSecondary: 0x334155,
    keyLightColor: '#ffedd5',
    rimLightColor: '#38bdf8',
    skyTintA: [0.1, 0.14, 0.34],
    skyTintB: [0.58, 0.3, 0.24],
    skyTintC: [0.96, 0.56, 0.24],
    floorRoughness: 0.5,
    floorMetalness: 0.45,
    floorClearcoat: 0.28,
  },
  {
    id: 'LAUNCH_CRYO_TANK',
    name: 'TORRE CRIOGÉNICA DE DESPEGUE',
    ambientSubtitle: 'PUERTO ORBITAL · PRESURIZACIÓN DE PROPELENTE',
    chapter: 'ROCKET_LAUNCH_ZONE',
    skyMode: 'LAUNCH_DUSK',
    architecture: 'ROCKET_PAD',
    weather: 'PLASMA_SPARKS',
    bgColor: '#14203b',
    fogColor: '#243659',
    fogDensity: 0.0035,
    floorColor: '#232f42',
    wallColor: '#435570',
    crateColor: '#314057',
    primaryGlow: '#67e8f9',
    secondaryGlow: '#f97316',
    gridPrimary: 0x06b6d4,
    gridSecondary: 0x1e293b,
    keyLightColor: '#e0f2fe',
    rimLightColor: '#fb923c',
    skyTintA: [0.08, 0.13, 0.3],
    skyTintB: [0.24, 0.42, 0.68],
    skyTintC: [0.92, 0.52, 0.28],
    floorRoughness: 0.42,
    floorMetalness: 0.52,
    floorClearcoat: 0.42,
  },
  {
    id: 'LAUNCH_IGNITION_NIGHT',
    name: 'ZONA DE IGNICIÓN NOCTURNA',
    ambientSubtitle: 'DESPEGUE INMINENTE · REFLECTORES DE TORRE',
    chapter: 'ROCKET_LAUNCH_ZONE',
    skyMode: 'LAUNCH_DUSK',
    architecture: 'ROCKET_PAD',
    weather: 'SOLAR_ASH',
    bgColor: '#111629',
    fogColor: '#1e2642',
    fogDensity: 0.0034,
    floorColor: '#1f2536',
    wallColor: '#3f4863',
    crateColor: '#2e364d',
    primaryGlow: '#f97316',
    secondaryGlow: '#fde047',
    gridPrimary: 0xfb923c,
    gridSecondary: 0x1e293b,
    keyLightColor: '#fef3c7',
    rimLightColor: '#f97316',
    skyTintA: [0.07, 0.09, 0.24],
    skyTintB: [0.34, 0.2, 0.42],
    skyTintC: [0.95, 0.48, 0.18],
    floorRoughness: 0.44,
    floorMetalness: 0.5,
    floorClearcoat: 0.36,
  },
];

const ORBITAL_THEMES: MapTheme[] = [
  {
    id: 'ORBITAL_EXOSPHERE',
    name: 'MIRADOR ESTRATOSFÉRICO ZENIT',
    ambientSubtitle: 'ÓRBITA BAJA · HORIZONTE DEL PLANETA TIERRA',
    chapter: 'ORBITAL_STRATOSPHERE',
    skyMode: 'ORBITAL_HORIZON',
    architecture: 'ORBITAL_STATION',
    weather: 'STAR_EMBERS',
    bgColor: '#061329',
    fogColor: '#0b1e40',
    fogDensity: 0.0024,
    floorColor: '#1e3554',
    wallColor: '#46658c',
    crateColor: '#314b6e',
    primaryGlow: '#60a5fa',
    secondaryGlow: '#fcd34d',
    gridPrimary: 0x38bdf8,
    gridSecondary: 0x1e3a8a,
    keyLightColor: '#f0f9ff',
    rimLightColor: '#fde047',
    skyTintA: [0.04, 0.11, 0.3],
    skyTintB: [0.12, 0.42, 0.84],
    skyTintC: [0.46, 0.85, 0.98],
    floorRoughness: 0.24,
    floorMetalness: 0.74,
    floorClearcoat: 0.78,
  },
  {
    id: 'ORBITAL_SOLAR_WING',
    name: 'ANILLO SOLAR EXOSFÉRICO',
    ambientSubtitle: 'ESTACIÓN ORBITAL · PANELES FOTOVOLTAICOS',
    chapter: 'ORBITAL_STRATOSPHERE',
    skyMode: 'ORBITAL_HORIZON',
    architecture: 'ORBITAL_STATION',
    weather: 'DATA_MOTES',
    bgColor: '#051024',
    fogColor: '#091b38',
    fogDensity: 0.0025,
    floorColor: '#1a2e4a',
    wallColor: '#3d5880',
    crateColor: '#2b4263',
    primaryGlow: '#38bdf8',
    secondaryGlow: '#fbbf24',
    gridPrimary: 0x0ea5e9,
    gridSecondary: 0x172554,
    keyLightColor: '#ecfeff',
    rimLightColor: '#fbbf24',
    skyTintA: [0.05, 0.1, 0.28],
    skyTintB: [0.14, 0.36, 0.76],
    skyTintC: [0.96, 0.78, 0.32],
    floorRoughness: 0.26,
    floorMetalness: 0.76,
    floorClearcoat: 0.8,
  },
  {
    id: 'ORBITAL_AURORA_DECK',
    name: 'MUELLE IONOSFÉRICO AURORA',
    ambientSubtitle: 'ESTRATOSFERA SUPERIOR · AURORAS POLARES',
    chapter: 'ORBITAL_STRATOSPHERE',
    skyMode: 'ORBITAL_HORIZON',
    architecture: 'ORBITAL_STATION',
    weather: 'STAR_EMBERS',
    bgColor: '#061224',
    fogColor: '#0b2038',
    fogDensity: 0.0026,
    floorColor: '#18334a',
    wallColor: '#355c78',
    crateColor: '#25455e',
    primaryGlow: '#34d399',
    secondaryGlow: '#60a5fa',
    gridPrimary: 0x2dd4bf,
    gridSecondary: 0x164e63,
    keyLightColor: '#e0f2fe',
    rimLightColor: '#34d399',
    skyTintA: [0.04, 0.12, 0.28],
    skyTintB: [0.1, 0.65, 0.58],
    skyTintC: [0.28, 0.68, 0.96],
    floorRoughness: 0.22,
    floorMetalness: 0.7,
    floorClearcoat: 0.84,
  },
];

const GALACTIC_THEMES: MapTheme[] = [
  {
    id: 'CYBER_HANGAR',
    name: 'HANGAR CIBER-TÁCTICO',
    ambientSubtitle: 'ESTACIÓN ORBITAL · HOLOGRAMA CENTRAL',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'ORBITAL_HANGAR',
    weather: 'DATA_MOTES',
    bgColor: '#091529',
    fogColor: '#0d1b33',
    fogDensity: 0.0036,
    floorColor: '#1a2b46',
    wallColor: '#334866',
    crateColor: '#263954',
    primaryGlow: '#22d3ee',
    secondaryGlow: '#f59e0b',
    gridPrimary: 0x0891b2,
    gridSecondary: 0x164e63,
    keyLightColor: '#e0f2fe',
    rimLightColor: '#fbbf24',
    skyTintA: [0.09, 0.14, 0.42],
    skyTintB: [0.55, 0.18, 0.8],
    skyTintC: [0.08, 0.76, 0.9],
    floorRoughness: 0.32,
    floorMetalness: 0.68,
    floorClearcoat: 0.7,
  },
  {
    id: 'MARS_OUTPOST',
    name: 'BASE MARCIANA ALFA',
    ambientSubtitle: 'CAÑÓN ROJO · TORMENTA DE POLVO FÉRRICO',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'CANYON_OUTPOST',
    weather: 'DUST_STORM',
    bgColor: '#24110c',
    fogColor: '#2a150f',
    fogDensity: 0.0056,
    floorColor: '#3b211a',
    wallColor: '#5c362c',
    crateColor: '#4a2b22',
    primaryGlow: '#fb923c',
    secondaryGlow: '#facc15',
    gridPrimary: 0xea580c,
    gridSecondary: 0x7c2d12,
    keyLightColor: '#ffedd5',
    rimLightColor: '#38bdf8',
    skyTintA: [0.28, 0.1, 0.08],
    skyTintB: [0.76, 0.28, 0.14],
    skyTintC: [0.96, 0.62, 0.22],
    floorRoughness: 0.56,
    floorMetalness: 0.35,
    floorClearcoat: 0.25,
  },
  {
    id: 'CRYO_SECTOR',
    name: 'SECTOR CRIOGÉNICO 09',
    ambientSubtitle: 'CIUDADELA GLACIAL · NEVADA DE CRISTAL',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'ICE_CITADEL',
    weather: 'SNOW_CRYSTALS',
    bgColor: '#091d29',
    fogColor: '#0d2534',
    fogDensity: 0.0044,
    floorColor: '#1b3e52',
    wallColor: '#396178',
    crateColor: '#294c61',
    primaryGlow: '#67e8f9',
    secondaryGlow: '#34d399',
    gridPrimary: 0x06b6d4,
    gridSecondary: 0x155e75,
    keyLightColor: '#ecfeff',
    rimLightColor: '#2dd4bf',
    skyTintA: [0.07, 0.22, 0.38],
    skyTintB: [0.24, 0.72, 0.92],
    skyTintC: [0.65, 0.95, 1.0],
    floorRoughness: 0.18,
    floorMetalness: 0.52,
    floorClearcoat: 0.92,
  },
  {
    id: 'NEON_CORE',
    name: 'NÚCLEO REACTOR OMEGA',
    ambientSubtitle: 'CÁMARA DE CONFINAMIENTO · ARCOS DE PLASMA',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'PLASMA_REACTOR',
    weather: 'PLASMA_SPARKS',
    bgColor: '#150b29',
    fogColor: '#19102b',
    fogDensity: 0.004,
    floorColor: '#271a42',
    wallColor: '#422e6b',
    crateColor: '#342357',
    primaryGlow: '#e879f9',
    secondaryGlow: '#22d3ee',
    gridPrimary: 0xc026d3,
    gridSecondary: 0x581c87,
    keyLightColor: '#fae8ff',
    rimLightColor: '#22d3ee',
    skyTintA: [0.16, 0.08, 0.36],
    skyTintB: [0.85, 0.22, 0.88],
    skyTintC: [0.12, 0.84, 0.94],
    floorRoughness: 0.26,
    floorMetalness: 0.78,
    floorClearcoat: 0.8,
  },
  {
    id: 'VOID_NEBULA',
    name: 'NEBULOSA DEL VACÍO',
    ambientSubtitle: 'ABISMO ESTELAR · MONOLITOS GRAVITATORIOS',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'VOID_MONOLITHS',
    weather: 'STAR_EMBERS',
    bgColor: '#0d0924',
    fogColor: '#110d29',
    fogDensity: 0.003,
    floorColor: '#1e1945',
    wallColor: '#352d70',
    crateColor: '#292259',
    primaryGlow: '#a855f7',
    secondaryGlow: '#38bdf8',
    gridPrimary: 0x9333ea,
    gridSecondary: 0x3b0764,
    keyLightColor: '#ede9fe',
    rimLightColor: '#38bdf8',
    skyTintA: [0.1, 0.07, 0.3],
    skyTintB: [0.58, 0.22, 0.92],
    skyTintC: [0.22, 0.64, 0.98],
    floorRoughness: 0.28,
    floorMetalness: 0.72,
    floorClearcoat: 0.75,
  },
  {
    id: 'SOLAR_FORGE',
    name: 'FORJA SOLAR HELIOS',
    ambientSubtitle: 'CRISOL DE FUSIÓN · CENIZA INCANDESCENTE',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'SOLAR_FOUNDRY',
    weather: 'SOLAR_ASH',
    bgColor: '#211307',
    fogColor: '#26170a',
    fogDensity: 0.0052,
    floorColor: '#382412',
    wallColor: '#593b1f',
    crateColor: '#472f18',
    primaryGlow: '#f97316',
    secondaryGlow: '#fde047',
    gridPrimary: 0xf97316,
    gridSecondary: 0x7c2d12,
    keyLightColor: '#fef3c7',
    rimLightColor: '#fb923c',
    skyTintA: [0.26, 0.12, 0.05],
    skyTintB: [0.88, 0.36, 0.08],
    skyTintC: [0.98, 0.82, 0.26],
    floorRoughness: 0.42,
    floorMetalness: 0.65,
    floorClearcoat: 0.4,
  },
  {
    id: 'EMERALD_BIOME',
    name: 'BIOMA ESMERALDA X-7',
    ambientSubtitle: 'DOMO XENO-VERDE · ESPORAS BIOLUMINISCENTES',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'BIO_DOME',
    weather: 'BIO_SPORES',
    bgColor: '#071b18',
    fogColor: '#091f1c',
    fogDensity: 0.0048,
    floorColor: '#133832',
    wallColor: '#235950',
    crateColor: '#1b4740',
    primaryGlow: '#10b981',
    secondaryGlow: '#34d399',
    gridPrimary: 0x10b981,
    gridSecondary: 0x064e3b,
    keyLightColor: '#d1fae5',
    rimLightColor: '#22d3ee',
    skyTintA: [0.05, 0.22, 0.18],
    skyTintB: [0.1, 0.72, 0.5],
    skyTintC: [0.24, 0.88, 0.82],
    floorRoughness: 0.38,
    floorMetalness: 0.45,
    floorClearcoat: 0.55,
  },
  {
    id: 'QUANTUM_CITADEL',
    name: 'CIUDADELA CUÁNTICA',
    ambientSubtitle: 'MATRIZ DIGITAL · NODOS HIPERESPACIALES',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'QUANTUM_MATRIX',
    weather: 'DATA_MOTES',
    bgColor: '#091022',
    fogColor: '#0b1224',
    fogDensity: 0.0034,
    floorColor: '#162340',
    wallColor: '#293e6b',
    crateColor: '#1f3054',
    primaryGlow: '#06b6d4',
    secondaryGlow: '#f43f5e',
    gridPrimary: 0x06b6d4,
    gridSecondary: 0x1e3a8a,
    keyLightColor: '#e0f2fe',
    rimLightColor: '#f43f5e',
    skyTintA: [0.06, 0.14, 0.34],
    skyTintB: [0.08, 0.68, 0.86],
    skyTintC: [0.94, 0.24, 0.46],
    floorRoughness: 0.24,
    floorMetalness: 0.8,
    floorClearcoat: 0.85,
  },
  {
    id: 'VOLCANIC_CALDERA',
    name: 'CALDERA MAGMA VULCANO',
    ambientSubtitle: 'FORTALEZA BASÁLTICA · CANALES DE LAVA',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'LAVA_FORTRESS',
    weather: 'SOLAR_ASH',
    bgColor: '#1f0907',
    fogColor: '#290d0a',
    fogDensity: 0.0062,
    floorColor: '#2d1311',
    wallColor: '#4a211c',
    crateColor: '#3a1915',
    primaryGlow: '#ff4500',
    secondaryGlow: '#fbbf24',
    gridPrimary: 0xf97316,
    gridSecondary: 0x7f1d1d,
    keyLightColor: '#ffedd5',
    rimLightColor: '#ef4444',
    skyTintA: [0.28, 0.05, 0.05],
    skyTintB: [0.92, 0.22, 0.08],
    skyTintC: [0.98, 0.66, 0.18],
    floorRoughness: 0.48,
    floorMetalness: 0.55,
    floorClearcoat: 0.35,
  },
  {
    id: 'ASTRAL_SANCTUARY',
    name: 'SANTUARIO ASTRAL ZENIT',
    ambientSubtitle: 'TEMPLO CELESTIAL · ASTROLABIO DORADO',
    chapter: 'GALACTIC_ARENA',
    skyMode: 'DEEP_SPACE',
    architecture: 'ASTRAL_TEMPLE',
    weather: 'STAR_EMBERS',
    bgColor: '#0c112b',
    fogColor: '#0e1433',
    fogDensity: 0.0029,
    floorColor: '#19224d',
    wallColor: '#2f3d7a',
    crateColor: '#232f61',
    primaryGlow: '#fcd34d',
    secondaryGlow: '#60a5fa',
    gridPrimary: 0xf59e0b,
    gridSecondary: 0x1e3a8a,
    keyLightColor: '#fef9c3',
    rimLightColor: '#60a5fa',
    skyTintA: [0.09, 0.13, 0.4],
    skyTintB: [0.24, 0.46, 0.9],
    skyTintC: [0.98, 0.8, 0.32],
    floorRoughness: 0.22,
    floorMetalness: 0.72,
    floorClearcoat: 0.82,
  },
];

export const THEMES: MapTheme[] = [
  ...LAB_THEMES,
  ...EARTH_THEMES,
  ...LAUNCH_THEMES,
  ...ORBITAL_THEMES,
  ...GALACTIC_THEMES,
];

type LayoutArchetype =
  | 'PASARELAS GEMELAS'
  | 'ASCENSO ESPIRAL'
  | 'ANILLO REACTOR'
  | 'FORTALEZA CRUZADA'
  | 'PUENTES COLGANTES'
  | 'TERRAZAS ESCALONADAS';

const LAYOUTS: LayoutArchetype[] = [
  'PASARELAS GEMELAS',
  'ASCENSO ESPIRAL',
  'ANILLO REACTOR',
  'FORTALEZA CRUZADA',
  'PUENTES COLGANTES',
  'TERRAZAS ESCALONADAS',
];

function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randRange(min: number, max: number, rng: () => number) {
  return min + rng() * (max - min);
}

function createMapBox(
  id: string,
  kind: MapBox['kind'],
  x: number,
  minY: number,
  z: number,
  w: number,
  h: number,
  d: number,
  accent: 'primary' | 'secondary'
): MapBox {
  const minX = x - w / 2;
  const maxX = x + w / 2;
  const maxY = minY + h;
  const minZ = z - d / 2;
  const maxZ = z + d / 2;

  return {
    id,
    kind,
    pos: [x, minY + h / 2, z],
    size: [w, h, d],
    accent,
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    box3: new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    ),
  };
}

function buildParkourLayout(
  layoutName: LayoutArchetype,
  seed: number,
  obstacles: MapBox[],
  rng: () => number
) {
  if (layoutName === 'PASARELAS GEMELAS') {
    const leftSteps = [1.5, 3.1, 4.7, 6.3];
    const rightSteps = [1.5, 3.1, 4.7, 6.3];
    const leftBaseX = randRange(-21, -17, rng);
    const rightBaseX = randRange(17, 21, rng);

    leftSteps.forEach((stepY, idx) => {
      const px = leftBaseX + (idx === 3 ? 2.5 : randRange(-1.8, 1.8, rng));
      const pz = 6 - idx * 6.8 + randRange(-0.8, 0.8, rng);
      obstacles.push(
        createMapBox(
          `plat-l-${seed}-${idx}`,
          'platform',
          px,
          stepY,
          pz,
          randRange(4.8, 6.0, rng),
          0.55,
          randRange(4.4, 5.4, rng),
          idx % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    });

    rightSteps.forEach((stepY, idx) => {
      const px = rightBaseX + (idx === 3 ? -2.5 : randRange(-1.8, 1.8, rng));
      const pz = 6 - idx * 6.8 + randRange(-0.8, 0.8, rng);
      obstacles.push(
        createMapBox(
          `plat-r-${seed}-${idx}`,
          'platform',
          px,
          stepY,
          pz,
          randRange(4.8, 6.0, rng),
          0.55,
          randRange(4.4, 5.4, rng),
          idx % 2 === 0 ? 'secondary' : 'primary'
        )
      );
    });

    const bridgeZ = -17 + randRange(-1.5, 1.5, rng);
    obstacles.push(
      createMapBox(`plat-b1-${seed}`, 'platform', -6.8, 6.3, bridgeZ, 6.4, 0.55, 4.6, 'primary'),
      createMapBox(`plat-b2-${seed}`, 'platform', 6.8, 6.3, bridgeZ, 6.4, 0.55, 4.6, 'secondary')
    );

    const jumpPadSpots: [number, number][] = [
      [-12.5 + randRange(-1.2, 1.2, rng), 9.5 + randRange(-1.0, 1.0, rng)],
      [12.5 + randRange(-1.2, 1.2, rng), 9.5 + randRange(-1.0, 1.0, rng)],
      [randRange(-4.5, 4.5, rng), -27.5 + randRange(-2.0, 2.0, rng)],
    ];
    jumpPadSpots.forEach(([jx, jz], idx) => {
      obstacles.push(
        createMapBox(
          `jpad-${seed}-${idx}`,
          'jumppad',
          jx,
          0,
          jz,
          2.6,
          0.25,
          2.6,
          idx % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    });
    return;
  }

  if (layoutName === 'ASCENSO ESPIRAL') {
    const startAngle = 2.45 + randRange(-0.25, 0.25, rng);
    const stepCount = 8;
    for (let i = 0; i < stepCount; i++) {
      const angle = startAngle + i * 0.5;
      const radius = 19.5 - i * 1.1;
      const px = Math.cos(angle) * radius;
      const pz = -10 + Math.sin(angle) * radius;
      const py = 1.5 + i * 0.78;
      obstacles.push(
        createMapBox(
          `plat-sp-${seed}-${i}`,
          'platform',
          px,
          py,
          pz,
          5.6,
          0.55,
          5.2,
          i % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    }

    obstacles.push(
      createMapBox(`plat-sp-hub-${seed}`, 'platform', 0, 7.2, -10, 7.6, 0.65, 7.6, 'primary')
    );

    const jumpPadSpots: [number, number][] = [
      [-14.5 + randRange(-0.8, 0.8, rng), 7.5 + randRange(-0.8, 0.8, rng)],
      [14.5 + randRange(-0.8, 0.8, rng), 7.5 + randRange(-0.8, 0.8, rng)],
      [0, -29.5 + randRange(-1.0, 1.0, rng)],
    ];
    jumpPadSpots.forEach(([jx, jz], idx) => {
      obstacles.push(
        createMapBox(
          `jpad-${seed}-${idx}`,
          'jumppad',
          jx,
          0,
          jz,
          2.6,
          0.25,
          2.6,
          idx % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    });
    return;
  }

  if (layoutName === 'ANILLO REACTOR') {
    const ringCount = 8;
    const ringRadius = 20.5;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(angle) * ringRadius;
      const pz = -10 + Math.sin(angle) * ringRadius;
      const py = i % 2 === 0 ? 2.8 : 4.4;
      obstacles.push(
        createMapBox(
          `plat-ring-${seed}-${i}`,
          'platform',
          px,
          py,
          pz,
          6.0,
          0.55,
          5.4,
          i % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    }

    obstacles.push(
      createMapBox(`plat-rc-${seed}`, 'platform', 0, 5.4, -10, 7.4, 0.6, 7.4, 'primary'),
      createMapBox(`plat-rl-${seed}`, 'platform', -10, 5.4, -10, 6.2, 0.55, 4.6, 'secondary'),
      createMapBox(`plat-rr-${seed}`, 'platform', 10, 5.4, -10, 6.2, 0.55, 4.6, 'secondary')
    );

    const diagRadius = 13;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const jx = Math.cos(angle) * diagRadius;
      const jz = -10 + Math.sin(angle) * diagRadius;
      obstacles.push(
        createMapBox(
          `jpad-${seed}-${i}`,
          'jumppad',
          jx,
          0,
          jz,
          2.6,
          0.25,
          2.6,
          i % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    }
    return;
  }

  if (layoutName === 'PUENTES COLGANTES') {
    const spanX = [-17, -9, 0, 9, 17];
    spanX.forEach((sx, idx) => {
      const archY = idx === 2 ? 6.0 : idx === 1 || idx === 3 ? 4.8 : 3.2;
      obstacles.push(
        createMapBox(
          `plat-sky-n-${seed}-${idx}`,
          'platform',
          sx,
          archY,
          -20 + randRange(-0.8, 0.8, rng),
          6.8,
          0.55,
          4.8,
          idx % 2 === 0 ? 'primary' : 'secondary'
        ),
        createMapBox(
          `plat-sky-s-${seed}-${idx}`,
          'platform',
          sx,
          archY - 0.6,
          0 + randRange(-0.8, 0.8, rng),
          6.4,
          0.55,
          4.6,
          idx % 2 === 0 ? 'secondary' : 'primary'
        )
      );
    });

    obstacles.push(
      createMapBox(`plat-sky-link-${seed}`, 'platform', 0, 5.8, -10, 6.2, 0.6, 8.2, 'primary')
    );

    const bridgePads: [number, number][] = [
      [-18.5, 6.5],
      [18.5, 6.5],
      [-18.5, -26.5],
      [18.5, -26.5],
    ];
    bridgePads.forEach(([jx, jz], idx) => {
      obstacles.push(
        createMapBox(
          `jpad-${seed}-${idx}`,
          'jumppad',
          jx,
          0,
          jz,
          2.6,
          0.25,
          2.6,
          idx % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    });
    return;
  }

  if (layoutName === 'TERRAZAS ESCALONADAS') {
    const tiers = [
      { x: -19, y: 1.8, z: 4, w: 7.0, d: 5.5 },
      { x: 19, y: 1.8, z: 4, w: 7.0, d: 5.5 },
      { x: -23, y: 3.6, z: -8, w: 6.8, d: 6.0 },
      { x: 23, y: 3.6, z: -8, w: 6.8, d: 6.0 },
      { x: -14, y: 5.2, z: -20, w: 7.2, d: 5.4 },
      { x: 14, y: 5.2, z: -20, w: 7.2, d: 5.4 },
      { x: 0, y: 6.8, z: -29, w: 9.2, d: 5.8 },
      { x: 0, y: 3.4, z: -9, w: 6.2, d: 5.0 },
    ];
    tiers.forEach((tier, idx) => {
      obstacles.push(
        createMapBox(
          `plat-ter-${seed}-${idx}`,
          'platform',
          tier.x + randRange(-1.0, 1.0, rng),
          tier.y,
          tier.z + randRange(-0.8, 0.8, rng),
          tier.w,
          0.6,
          tier.d,
          idx % 2 === 0 ? 'primary' : 'secondary'
        )
      );
    });

    const terracePads: [number, number][] = [
      [-10.5, 8.2],
      [10.5, 8.2],
      [-21, -18],
      [21, -18],
    ];
    terracePads.forEach(([jx, jz], idx) => {
      obstacles.push(
        createMapBox(
          `jpad-${seed}-${idx}`,
          'jumppad',
          jx,
          0,
          jz,
          2.6,
          0.25,
          2.6,
          idx % 2 === 0 ? 'secondary' : 'primary'
        )
      );
    });
    return;
  }

  // FORTALEZA CRUZADA
  const corners: [number, number][] = [
    [-19, 2],
    [19, 2],
    [-19, -24],
    [19, -24],
  ];
  corners.forEach(([cx, cz], idx) => {
    obstacles.push(
      createMapBox(
        `plat-bastion-${seed}-${idx}`,
        'platform',
        cx,
        4.6,
        cz,
        6.8,
        0.6,
        6.8,
        idx % 2 === 0 ? 'primary' : 'secondary'
      ),
      createMapBox(
        `plat-step-${seed}-${idx}`,
        'platform',
        cx,
        2.2,
        cz > -10 ? cz + 7.2 : cz - 7.2,
        5.2,
        0.55,
        4.6,
        idx % 2 === 0 ? 'secondary' : 'primary'
      )
    );
  });

  obstacles.push(
    createMapBox(`plat-chub-${seed}`, 'platform', 0, 5.4, -11, 7.0, 0.6, 7.0, 'primary'),
    createMapBox(`plat-cleft-${seed}`, 'platform', -9.6, 5.4, -11, 6.2, 0.55, 4.4, 'secondary'),
    createMapBox(`plat-cright-${seed}`, 'platform', 9.6, 5.4, -11, 6.2, 0.55, 4.4, 'secondary'),
    createMapBox(`plat-cback-${seed}`, 'platform', 0, 5.4, -21, 5.2, 0.55, 6.0, 'primary')
  );

  const fortressPads: [number, number][] = [
    [-11.5, 7.8],
    [11.5, 7.8],
    [-11.5, -28.5],
    [11.5, -28.5],
  ];
  fortressPads.forEach(([jx, jz], idx) => {
    obstacles.push(
      createMapBox(
        `jpad-${seed}-${idx}`,
        'jumppad',
        jx,
        0,
        jz,
        2.6,
        0.25,
        2.6,
        idx % 2 === 0 ? 'primary' : 'secondary'
      )
    );
  });
}

export function getLevelMapPreview(level: number): { theme: MapTheme; layoutName: LayoutArchetype } {
  const safeLevel = Math.max(1, Math.floor(level));
  const chapter = getChapterForLevel(safeLevel);
  const subIndex = (safeLevel - 1) % 10;

  let theme: MapTheme;
  if (chapter === 'UNDERGROUND_LAB') {
    theme = LAB_THEMES[subIndex % LAB_THEMES.length];
  } else if (chapter === 'EARTH_OPEN_FIELD') {
    theme = EARTH_THEMES[subIndex % EARTH_THEMES.length];
  } else if (chapter === 'ROCKET_LAUNCH_ZONE') {
    theme = LAUNCH_THEMES[subIndex % LAUNCH_THEMES.length];
  } else if (chapter === 'ORBITAL_STRATOSPHERE') {
    theme = ORBITAL_THEMES[subIndex % ORBITAL_THEMES.length];
  } else {
    theme = GALACTIC_THEMES[subIndex % GALACTIC_THEMES.length];
  }

  const layoutIdx = ((safeLevel - 1) * 3 + Math.floor((safeLevel - 1) / 5)) % LAYOUTS.length;
  return {
    theme,
    layoutName: LAYOUTS[layoutIdx],
  };
}

export function generateMapForLevel(level: number, randomizeSalt = false): GeneratedMap {
  const safeLevel = Math.max(1, Math.floor(level));
  const { theme, layoutName } = getLevelMapPreview(safeLevel);
  const baseSeed = ((safeLevel * 2654435761) ^ 0x9e3779b9) >>> 0;
  const salt = randomizeSalt ? Math.floor(Math.random() * 1_000_000_000) : 0;
  const seed = (baseSeed ^ salt) >>> 0;
  const rng = createSeededRng(seed || 1337);
  const obstacles: MapBox[] = [];

  buildParkourLayout(layoutName, seed, obstacles, rng);

  const targetGroundCount = 14 + Math.floor(rng() * 5);
  const arenaCenterZ = -10;
  const maxArenaRadius = 46;
  const spawnX = 0;
  const spawnZ = 14;
  const spawnClearRadius = 9.5;
  const portalPlazaClearRadius =
    safeLevel === 10 || safeLevel === 20 || safeLevel === 30 || safeLevel === 40 ? 6.5 : 0;
  const paddingBetweenBoxes = 2.2;

  let groundCreated = 0;
  let attempts = 0;
  while (groundCreated < targetGroundCount && attempts < 350) {
    attempts++;

    const roll = rng();
    let kind: MapBox['kind'];
    let w: number;
    let h: number;
    let d: number;

    if (roll < 0.28) {
      kind = 'wall';
      const horizontal = rng() > 0.5;
      w = horizontal ? randRange(6.5, 12.0, rng) : randRange(1.6, 2.4, rng);
      d = horizontal ? randRange(1.6, 2.4, rng) : randRange(6.5, 12.0, rng);
      h = randRange(3.8, 6.6, rng);
    } else if (roll < 0.58) {
      kind = 'crate';
      w = randRange(2.6, 4.4, rng);
      d = randRange(2.6, 4.4, rng);
      h = randRange(1.4, 2.2, rng);
    } else if (roll < 0.8) {
      kind = 'barrier';
      const horizontal = rng() > 0.5;
      w = horizontal ? randRange(4.5, 8.5, rng) : randRange(1.2, 1.8, rng);
      d = horizontal ? randRange(1.2, 1.8, rng) : randRange(4.5, 8.5, rng);
      h = randRange(1.3, 1.9, rng);
    } else {
      kind = 'tower';
      w = randRange(3.0, 4.4, rng);
      d = randRange(3.0, 4.4, rng);
      h = randRange(7.0, 12.0, rng);
    }

    const angle = rng() * Math.PI * 2;
    const dist = Math.sqrt(rng()) * maxArenaRadius;
    const x = Math.cos(angle) * dist;
    const z = arenaCenterZ + Math.sin(angle) * dist;

    const distToSpawn = Math.hypot(x - spawnX, z - spawnZ);
    if (distToSpawn < spawnClearRadius + Math.max(w, d) * 0.5) continue;

    if (portalPlazaClearRadius > 0) {
      const distToPortal = Math.hypot(x, z - arenaCenterZ);
      if (distToPortal < portalPlazaClearRadius + Math.max(w, d) * 0.5) continue;
    }

    const minX = x - w / 2;
    const maxX = x + w / 2;
    const minZ = z - d / 2;
    const maxZ = z + d / 2;

    let overlaps = false;
    for (const other of obstacles) {
      const pad = other.kind === 'platform' || other.kind === 'jumppad' ? 1.5 : paddingBetweenBoxes;
      if (
        minX - pad < other.maxX &&
        maxX + pad > other.minX &&
        minZ - pad < other.maxZ &&
        maxZ + pad > other.minZ
      ) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    obstacles.push(
      createMapBox(
        `obs-${seed}-${groundCreated}`,
        kind,
        x,
        0,
        z,
        w,
        h,
        d,
        rng() > 0.45 ? 'primary' : 'secondary'
      )
    );
    groundCreated++;
  }

  return {
    seed,
    layoutName,
    theme,
    obstacles,
  };
}

export function generateRandomMap(): GeneratedMap {
  // Sample iconic Galactic Arena levels (41-50) for the Main Menu orbital showcase
  return generateMapForLevel(41 + Math.floor(Math.random() * 10), true);
}
