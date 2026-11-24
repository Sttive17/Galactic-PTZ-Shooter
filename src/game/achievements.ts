import { playSound } from './AudioSystem';
import { triggerHaptic } from './haptics';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'FIRST_BLOOD',
    title: 'PRIMER CONTACTO',
    description: 'Destruye tu primer dron orbital hostil.',
    iconName: 'crosshair',
  },
  {
    id: 'CRITICAL_STRIKE',
    title: 'IMPACTO QUIRÚRGICO',
    description: 'Acierta en el punto débil de un enemigo causando daño crítico.',
    iconName: 'target',
  },
  {
    id: 'SHARPSHOOTER',
    title: 'OJO DE HALCÓN',
    description: 'Alcanza una racha de combo de 12 impactos consecutivos sin fallar.',
    iconName: 'zap',
  },
  {
    id: 'TITAN_SLAYER',
    title: 'ASESINO DE TITANES',
    description: 'Neutraliza con éxito a un jefe de capítulo de nivel 5 o superior.',
    iconName: 'shield',
  },
  {
    id: 'DASH_MASTER',
    title: 'MAESTRO DE LA ESQUIVA',
    description: 'Realiza 5 maniobras de propulsor Dash evadiendo fuego enemigo.',
    iconName: 'gauge',
  },
  {
    id: 'OPTICS_TACTICIAN',
    title: 'ESPECTRO TÁCTICO',
    description: 'Alterna entre los modos de visión PTZ Térmico y Nocturno.',
    iconName: 'eye',
  },
  {
    id: 'NANITE_HOARDER',
    title: 'CAZADOR DE NANITAS',
    description: 'Recolecta 50 nanitas cuánticas en el campo de batalla.',
    iconName: 'sparkles',
  },
  {
    id: 'WARP_VOYAGER',
    title: 'SALTO HIPERESPACIAL',
    description: 'Atraviesa un portal estelar hacia un nuevo bioma planetario.',
    iconName: 'rocket',
  },
];

const ACHIEVEMENTS_STORAGE_KEY = 'galactic_ptz_achievements_v1';

function loadUnlockedAchievements(): Set<string> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return new Set();
    const raw = window.localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveUnlockedAchievements(unlocked: Set<string>): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
  } catch {
    // Ignore quota
  }
}

const unlockedCache: Set<string> = loadUnlockedAchievements();

export function unlockAchievement(id: string): void {
  if (unlockedCache.has(id)) return;
  const item = ACHIEVEMENTS_LIST.find((a) => a.id === id);
  if (!item) return;

  unlockedCache.add(id);
  saveUnlockedAchievements(unlockedCache);

  playSound('ui');
  triggerHaptic('crit');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: item }));
  }
}

export function isAchievementUnlocked(id: string): boolean {
  return unlockedCache.has(id);
}
