import type { PilotStats } from '../types/game';

const PILOT_STATS_STORAGE_KEY = 'galactic_ptz_stats_v1';

export const DEFAULT_PILOT_STATS: PilotStats = {
  killsTotal: 0,
  bossesDefeated: 0,
  shotsFired: 0,
  shotsHit: 0,
  highestCombo: 1,
  highScore: 0,
  nanitesCollected: 0,
  totalDamageDealt: 0,
  missionsCompleted: 0,
};

export function loadPilotStats(): PilotStats {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_PILOT_STATS };
    }
    const raw = window.localStorage.getItem(PILOT_STATS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PILOT_STATS };
    const parsed = JSON.parse(raw) as Partial<PilotStats>;
    return {
      killsTotal: Math.max(0, parsed.killsTotal ?? 0),
      bossesDefeated: Math.max(0, parsed.bossesDefeated ?? 0),
      shotsFired: Math.max(0, parsed.shotsFired ?? 0),
      shotsHit: Math.max(0, parsed.shotsHit ?? 0),
      highestCombo: Math.max(1, parsed.highestCombo ?? 1),
      highScore: Math.max(0, parsed.highScore ?? 0),
      nanitesCollected: Math.max(0, parsed.nanitesCollected ?? 0),
      totalDamageDealt: Math.max(0, parsed.totalDamageDealt ?? 0),
      missionsCompleted: Math.max(0, parsed.missionsCompleted ?? 0),
    };
  } catch {
    return { ...DEFAULT_PILOT_STATS };
  }
}

export function savePilotStats(stats: PilotStats): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(PILOT_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota limits
  }
}

let cachedStats: PilotStats | null = null;

export function getCachedPilotStats(): PilotStats {
  if (!cachedStats) {
    cachedStats = loadPilotStats();
  }
  return cachedStats;
}

export function recordStatUpdate(updater: (prev: PilotStats) => PilotStats): PilotStats {
  const current = getCachedPilotStats();
  const next = updater(current);
  cachedStats = next;
  savePilotStats(next);
  return next;
}
