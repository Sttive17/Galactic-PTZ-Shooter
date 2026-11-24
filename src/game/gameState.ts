import { create } from 'zustand';
import { GAME_CONFIG } from './config';
import { getRandomPowerChoices } from './powers';
import type { PowerId } from './powers';
import { SceneState } from './sceneState';
import { generateMapForLevel, generateRandomMap, getChapterForLevel } from './mapGenerator';
import type { GeneratedMap, BiomeChapter } from './mapGenerator';
import {
  loadSavedGraphicsConfig,
  saveGraphicsConfig,
  detectHardware,
  GRAPHICS_PRESETS,
} from './graphicsSettings';
import type { GraphicsConfig, GraphicsPreset, HardwareInfo } from './graphicsSettings';
import type { BossStyle, PTZOpticalMode } from '../types/game';
import { audioSystem } from './AudioSystem';
import { triggerHaptic } from './haptics';

const initialMap = generateRandomMap();
SceneState.colliders = initialMap.obstacles;

export type GameMode = 'MENU' | 'TRAINING' | 'CHALLENGE' | 'GAMEOVER' | 'LEVEL_MAP';
export type RoundState = 'PLAYING' | 'PORTAL_ACTIVE' | 'WARP_CINEMATIC' | 'POWER_SELECT' | 'TRANSITION';

export const MAX_LEVELS = 50;

export const isChapterBossLevel = (round: number) =>
  round === 10 || round === 20 || round === 30 || round === 40;

export const getMaxAmmoForStacks = (stacks: number): number =>
  stacks <= 0 ? 50 : stacks === 1 ? 80 : stacks === 2 ? 120 : 200;

export const isBossRound = (round: number) => round > 0 && round % 5 === 0;

export const isTrainingBossWave = (wave: number) => wave > 0 && wave % 3 === 0;

export const getTrainingBossCounts = (wave: number) => {
  const bossIndex = Math.max(1, Math.floor(wave / 3));
  const tier = (((bossIndex - 1) % 8) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  const generatorCount = tier === 8 ? 4 : tier === 2 || tier === 6 ? 3 : 0;
  const escortCount = generatorCount > 0 ? Math.min(4, Math.floor(bossIndex / 2)) : Math.min(6, 2 + bossIndex);
  return { bossIndex, tier, generatorCount, escortCount };
};

export const getBossTierForRound = (round: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 => {
  if (round >= 50) return 8;
  if (round === 45) return 7;
  const idx = Math.max(1, Math.floor(round / 5));
  return (((idx - 1) % 8) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export const getRoundTotalTargets = (mode: GameMode, round: number) => {
  if (mode === 'TRAINING') {
    if (isTrainingBossWave(round)) {
      const { generatorCount, escortCount } = getTrainingBossCounts(round);
      return 1 + generatorCount + escortCount;
    }
    return Math.min(42, 6 + round * 3);
  }
  if (mode !== 'CHALLENGE') return 10;
  if (isBossRound(round)) {
    if (round === 5) return 3;
    if (getBossTierForRound(round) === 8) return 5;
    return 4;
  }
  if (round <= 10) return 4 + round;
  return Math.min(36, 14 + Math.floor((round - 10) * 0.55));
};

export interface BossInfo {
  name: string;
  health: number;
  maxHealth: number;
  subtitle?: string;
  shielded?: boolean;
  generatorsRemaining?: number;
  tier?: number;
  style?: BossStyle;
}

export interface WaveBannerInfo {
  wave: number;
  isBoss: boolean;
  bonusPowerName?: string;
}

export interface PortalTransitionInfo {
  fromChapter: BiomeChapter;
  toChapter: BiomeChapter;
  nextLevel: number;
}

export interface PTZState {
  pan: number;
  tilt: number;
  zoom: number;
}

export interface Settings {
  sensitivity: number;
  graphics: GraphicsConfig;
}

export interface UserPreferences {
  sensitivity: number;
  invertY: boolean;
  cameraShake: boolean;
  fov: number;
  showFps: boolean;
  hudEffects: boolean;
  vibration: boolean;
  aimAssist: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

const PREFS_STORAGE_KEY = 'scifi_fps_prefs_v1';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  sensitivity: 1.0,
  invertY: false,
  cameraShake: true,
  fov: 68,
  showFps: true,
  hudEffects: true,
  vibration: true,
  aimAssist: true,
  masterVolume: 0.7,
  musicVolume: 0.7,
  sfxVolume: 0.85,
  muted: false,
};

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function sanitizePreferences(partial: Partial<UserPreferences>, base: UserPreferences = DEFAULT_USER_PREFERENCES): UserPreferences {
  return {
    sensitivity: clampNumber(partial.sensitivity, 0.1, 3.0, base.sensitivity),
    invertY: typeof partial.invertY === 'boolean' ? partial.invertY : base.invertY,
    cameraShake: typeof partial.cameraShake === 'boolean' ? partial.cameraShake : base.cameraShake,
    fov: Math.round(clampNumber(partial.fov, 55, 90, base.fov)),
    showFps: typeof partial.showFps === 'boolean' ? partial.showFps : base.showFps,
    hudEffects: typeof partial.hudEffects === 'boolean' ? partial.hudEffects : base.hudEffects,
    vibration: typeof partial.vibration === 'boolean' ? partial.vibration : base.vibration,
    aimAssist: typeof partial.aimAssist === 'boolean' ? partial.aimAssist : base.aimAssist,
    masterVolume: clampNumber(partial.masterVolume, 0, 1, base.masterVolume),
    musicVolume: clampNumber(partial.musicVolume, 0, 1, base.musicVolume),
    sfxVolume: clampNumber(partial.sfxVolume, 0, 1, base.sfxVolume),
    muted: typeof partial.muted === 'boolean' ? partial.muted : base.muted,
  };
}

function loadSavedPreferences(): UserPreferences {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_USER_PREFERENCES };
    }
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_USER_PREFERENCES };
    }
    return sanitizePreferences(parsed, DEFAULT_USER_PREFERENCES);
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

function savePreferences(prefs: UserPreferences): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota or security restrictions
  }
}

const initialPreferences = loadSavedPreferences();
audioSystem.setVolume(initialPreferences.masterVolume);
audioSystem.setMuted(initialPreferences.muted);

export interface LevelStat {
  score: number;
  targetsDestroyed: number;
  totalTargets: number;
}

export interface GameState {
  mode: GameMode;
  lastPlayedMode: 'CHALLENGE' | 'TRAINING';
  roundState: RoundState;
  isPaused: boolean;
  isSettingsOpen: boolean;
  settings: Settings;
  preferences: UserPreferences;
  score: number;
  combo: number;
  shots: number;
  hits: number;
  timeRemaining: number;
  currentRound: number;
  highestRound: number;
  targetsDestroyed: number;
  levelStats: Record<number, LevelStat>;
  ptz: PTZState;
  currentTarget: { id: string, health: number, points: number, distance: number } | null;
  cameraShake: number;
  activePowers: Partial<Record<PowerId, number>>;
  powerChoices: PowerId[];
  currentMap: GeneratedMap;
  playerShield: number;
  maxPlayerShield: number;
  playerHealth: number;
  maxPlayerHealth: number;
  lastDamageTime: number;
  bossInfo: BossInfo | null;
  waveBanner: WaveBannerInfo | null;
  portalTransition: PortalTransitionInfo | null;
  opticalMode: PTZOpticalMode;
  nanites: number;
  dashCooldown: number;
  
  // Actions
  setMode: (mode: GameMode) => void;
  setRoundState: (state: RoundState) => void;
  setOpticalMode: (mode: PTZOpticalMode) => void;
  toggleOpticalMode: () => void;
  addNanites: (amount: number) => void;
  setDashCooldown: (cd: number) => void;
  selectPower: (powerId: PowerId) => void;
  clearWaveBanner: () => void;
  advanceTrainingWave: () => void;
  openChapterPortal: () => void;
  enterChapterPortal: () => void;
  commitPortalArrival: () => void;
  finishPortalCinematic: () => void;
  damagePlayer: (amount: number) => void;
  regenShield: (amount: number) => void;
  setBossInfo: (info: BossInfo | null) => void;
  togglePause: () => void;
  setSettingsOpen: (open: boolean) => void;
  setSensitivity: (val: number) => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  setAudioVolumes: (volumes: Partial<Pick<UserPreferences, 'masterVolume' | 'musicVolume' | 'sfxVolume'>>) => void;
  setMuted: (muted: boolean) => void;
  setGraphicsConfig: (config: Partial<GraphicsConfig>) => void;
  setGraphicsPreset: (preset: GraphicsPreset) => void;
  setBrightness: (brightness: number) => void;
  autoDetectAndApplyGraphics: () => HardwareInfo;
  updatePTZ: (panDelta: number, tiltDelta: number, zoomDelta: number) => void;
  registerShot: () => void;
  registerHit: (points: number) => void;
  resetCombo: () => void;
  tickTime: (delta: number) => void;
  resetGame: (mode: GameMode) => void;
  setCurrentTarget: (targetInfo: { id: string, health: number, points: number, distance: number } | null) => void;
  nextRound: () => void;
  completeRound: () => void;
  startRound: (roundNumber: number) => void;
  addCameraShake: (amount: number) => void;
  clearCameraShake: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  mode: 'MENU',
  lastPlayedMode: 'CHALLENGE',
  roundState: 'PLAYING',
  isPaused: false,
  isSettingsOpen: false,
  settings: {
    sensitivity: initialPreferences.sensitivity,
    graphics: loadSavedGraphicsConfig(),
  },
  preferences: initialPreferences,
  score: 0,
  combo: 1,
  shots: 0,
  hits: 0,
  timeRemaining: GAME_CONFIG.challengeDuration,
  currentRound: 1,
  highestRound: 1,
  targetsDestroyed: 0,
  levelStats: {},
  ptz: { pan: 0, tilt: 0, zoom: 1 },
  currentTarget: null,
  cameraShake: 0,
  activePowers: {},
  powerChoices: [],
  currentMap: initialMap,
  playerShield: 100,
  maxPlayerShield: 100,
  playerHealth: 100,
  maxPlayerHealth: 100,
  lastDamageTime: 0,
  bossInfo: null,
  waveBanner: null,
  portalTransition: null,
  opticalMode: 'NORMAL',
  nanites: 0,
  dashCooldown: 0,

  setOpticalMode: (opticalMode) => set({ opticalMode }),
  toggleOpticalMode: () => set((state) => {
    const next: PTZOpticalMode =
      state.opticalMode === 'NORMAL'
        ? 'THERMAL'
        : state.opticalMode === 'THERMAL'
          ? 'NIGHT_VISION'
          : 'NORMAL';
    return { opticalMode: next };
  }),
  addNanites: (amount) => set((state) => ({ nanites: state.nanites + Math.max(0, amount) })),
  setDashCooldown: (dashCooldown) => set({ dashCooldown }),

  setMode: (mode) => {
    if (mode === 'MENU' || mode === 'LEVEL_MAP') {
      SceneState.resetAllies();
    }
    set((state) => ({
      mode,
      isSettingsOpen: false,
      ...(mode === 'MENU' || mode === 'LEVEL_MAP'
        ? { isPaused: false, bossInfo: null, waveBanner: null, portalTransition: null, roundState: 'PLAYING' as RoundState }
        : { roundState: state.roundState }),
    }));
  },
  
  setRoundState: (roundState) => set({ roundState }),

  setBossInfo: (bossInfo) => set({ bossInfo }),

  damagePlayer: (amount) => set((state) => {
    if (state.isPaused || state.roundState !== 'PLAYING' || (state.mode !== 'CHALLENGE' && state.mode !== 'TRAINING')) {
      return state;
    }
    triggerHaptic('damage');
    const armorStacks = state.activePowers.TITAN_ARMOR || 0;
    const reduction = Math.min(0.6, armorStacks * 0.15);
    const finalDmg = Math.max(1, Math.round(amount * (1 - reduction)));
    const shieldAbsorbed = Math.min(state.playerShield, finalDmg);
    const newShield = state.playerShield - shieldAbsorbed;
    const remainingDmg = finalDmg - shieldAbsorbed;
    const newHealth = Math.max(0, state.playerHealth - remainingDmg);
    const now = performance.now();
    if (newHealth <= 0) {
      SceneState.resetAllies();
      const totalTargets = getRoundTotalTargets(state.mode, state.currentRound);
      const newStats = { ...state.levelStats };
      const existing = newStats[state.currentRound];
      if (!existing || state.score > existing.score) {
        newStats[state.currentRound] = {
          score: state.score,
          targetsDestroyed: state.targetsDestroyed,
          totalTargets,
        };
      }
      return {
        playerShield: 0,
        playerHealth: 0,
        lastDamageTime: now,
        mode: 'GAMEOVER',
        bossInfo: null,
        levelStats: newStats,
      };
    }
    return {
      playerShield: newShield,
      playerHealth: newHealth,
      lastDamageTime: now,
    };
  }),

  regenShield: (amount) => set((state) => {
    if (state.isPaused || state.roundState !== 'PLAYING' || state.playerShield >= state.maxPlayerShield) {
      return state;
    }
    if (performance.now() - state.lastDamageTime < 4500) {
      return state;
    }
    return {
      playerShield: Math.min(state.maxPlayerShield, state.playerShield + amount),
    };
  }),

  selectPower: (powerId) => set((state) => {
    const prevCount = state.activePowers[powerId] || 0;
    const updatedPowers = { ...state.activePowers, [powerId]: prevCount + 1 };
    const extraTime = powerId === 'TIME_SURGE' ? 25 : 0;
    const armorBonus = powerId === 'TITAN_ARMOR' ? 35 : 0;
    const nextMaxShield = state.maxPlayerShield + armorBonus;
    const nextShield = Math.min(nextMaxShield, state.playerShield + armorBonus);

    const nextMaxAmmo = getMaxAmmoForStacks(updatedPowers.EXTENDED_MAG || 0);
    SceneState.maxAmmo = nextMaxAmmo;
    SceneState.ammo = nextMaxAmmo;
    SceneState.isReloading = false;
    SceneState.reloadProgress = 0;

    return {
      activePowers: updatedPowers,
      powerChoices: [],
      roundState: 'PLAYING',
      maxPlayerShield: nextMaxShield,
      playerShield: nextShield,
      timeRemaining: Math.min(240, state.timeRemaining + extraTime),
      waveBanner:
        state.mode === 'TRAINING'
          ? { wave: state.currentRound, isBoss: isTrainingBossWave(state.currentRound) }
          : null,
    };
  }),

  clearWaveBanner: () => set({ waveBanner: null }),

  openChapterPortal: () => set((state) => {
    const totalTargets = getRoundTotalTargets(state.mode, state.currentRound);
    const newStats = { ...state.levelStats };
    const existing = newStats[state.currentRound];
    if (!existing || state.score > existing.score) {
      newStats[state.currentRound] = {
        score: state.score,
        targetsDestroyed: state.targetsDestroyed,
        totalTargets,
      };
    }
    const nextLevel = Math.min(MAX_LEVELS, state.currentRound + 1);
    return {
      roundState: 'PORTAL_ACTIVE',
      highestRound: Math.max(state.highestRound, nextLevel),
      bossInfo: null,
      levelStats: newStats,
      portalTransition: {
        fromChapter: getChapterForLevel(state.currentRound),
        toChapter: getChapterForLevel(nextLevel),
        nextLevel,
      },
    };
  }),

  enterChapterPortal: () => set((state) => {
    if (state.roundState !== 'PORTAL_ACTIVE') return state;
    return { roundState: 'WARP_CINEMATIC' };
  }),

  commitPortalArrival: () => set((state) => {
    const nextLevel = state.portalTransition?.nextLevel ?? Math.min(MAX_LEVELS, state.currentRound + 1);
    const newMap = generateMapForLevel(nextLevel);
    SceneState.colliders = newMap.obstacles;
    SceneState.resetPlayerPosition();
    SceneState.resetAllies();
    const timePowerBonus = (state.activePowers.TIME_SURGE || 0) * 10;
    const bonusTime = 35 + nextLevel * 2 + timePowerBonus;
    return {
      currentRound: nextLevel,
      highestRound: Math.max(state.highestRound, nextLevel),
      targetsDestroyed: 0,
      currentMap: newMap,
      timeRemaining: Math.min(240, state.timeRemaining + bonusTime),
      playerShield: state.maxPlayerShield,
      playerHealth: Math.min(state.maxPlayerHealth, state.playerHealth + 45),
      bossInfo: null,
    };
  }),

  finishPortalCinematic: () => set((state) => {
    if (state.roundState !== 'WARP_CINEMATIC') return state;
    return {
      roundState: 'POWER_SELECT',
      powerChoices: getRandomPowerChoices(3),
      portalTransition: null,
    };
  }),

  advanceTrainingWave: () => set((state) => {
    if (state.mode !== 'TRAINING') return state;
    const nextWave = state.currentRound + 1;
    const newMap = generateMapForLevel(nextWave, true);
    SceneState.colliders = newMap.obstacles;
    SceneState.ammo = SceneState.maxAmmo;
    SceneState.isReloading = false;
    SceneState.reloadProgress = 0;
    SceneState.resetPlayerPosition();
    SceneState.resetAllies();

    return {
      currentRound: nextWave,
      targetsDestroyed: 0,
      roundState: 'POWER_SELECT',
      powerChoices: getRandomPowerChoices(3),
      currentMap: newMap,
      bossInfo: null,
      playerShield: state.maxPlayerShield,
      playerHealth: Math.min(state.maxPlayerHealth, state.playerHealth + 35),
      waveBanner: null,
    };
  }),
  
  togglePause: () => set((state) => {
    if (state.mode === 'CHALLENGE' || state.mode === 'TRAINING') {
      return { isPaused: !state.isPaused };
    }
    return state;
  }),

  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),

  setSensitivity: (val) => set((state) => {
    const clamped = clampNumber(val, 0.1, 3.0, state.preferences.sensitivity);
    const nextPrefs = { ...state.preferences, sensitivity: clamped };
    savePreferences(nextPrefs);
    return {
      settings: { ...state.settings, sensitivity: clamped },
      preferences: nextPrefs,
    };
  }),

  updatePreferences: (partial) => set((state) => {
    const nextPrefs = sanitizePreferences({ ...state.preferences, ...partial }, state.preferences);
    savePreferences(nextPrefs);
    if (partial.masterVolume !== undefined) {
      audioSystem.setVolume(nextPrefs.masterVolume);
    }
    if (partial.muted !== undefined) {
      audioSystem.setMuted(nextPrefs.muted);
    }
    return {
      preferences: nextPrefs,
      ...(partial.sensitivity !== undefined
        ? { settings: { ...state.settings, sensitivity: nextPrefs.sensitivity } }
        : {}),
    };
  }),

  setAudioVolumes: (volumes) => set((state) => {
    const nextPrefs = sanitizePreferences({ ...state.preferences, ...volumes }, state.preferences);
    savePreferences(nextPrefs);
    audioSystem.setVolume(nextPrefs.masterVolume);
    return { preferences: nextPrefs };
  }),

  setMuted: (muted) => set((state) => {
    const nextPrefs = { ...state.preferences, muted: Boolean(muted) };
    savePreferences(nextPrefs);
    audioSystem.setMuted(nextPrefs.muted);
    return { preferences: nextPrefs };
  }),

  setGraphicsConfig: (newCfg) => set((state) => {
    const updated = { ...state.settings.graphics, ...newCfg };
    saveGraphicsConfig(updated);
    return { settings: { ...state.settings, graphics: updated } };
  }),

  setGraphicsPreset: (preset) => set((state) => {
    const base = GRAPHICS_PRESETS[preset];
    const updated = { ...base, brightness: state.settings.graphics.brightness };
    saveGraphicsConfig(updated);
    return { settings: { ...state.settings, graphics: updated } };
  }),

  setBrightness: (brightness) => set((state) => {
    const updated = { ...state.settings.graphics, brightness };
    saveGraphicsConfig(updated);
    return { settings: { ...state.settings, graphics: updated } };
  }),

  autoDetectAndApplyGraphics: () => {
    const hw = detectHardware();
    const recommendedPreset = hw.recommended;
    const base = GRAPHICS_PRESETS[recommendedPreset];
    const currentBrightness = useGameStore.getState().settings.graphics?.brightness ?? 1.0;
    const updated = { ...base, brightness: currentBrightness };
    saveGraphicsConfig(updated);
    set((state) => ({ settings: { ...state.settings, graphics: updated } }));
    return hw;
  },

  setCurrentTarget: (currentTarget) => set({ currentTarget }),

  updatePTZ: (panDelta, tiltDelta, zoomDelta) => {
    set((state) => {
      if (state.isPaused) return state; // Block movement if paused
      // Unrestricted 360° yaw (wrapped cleanly to -180..180 for HUD display)
      let newPan = state.ptz.pan + panDelta;
      if (newPan > 180) newPan -= 360;
      if (newPan < -180) newPan += 360;
      const newTilt = Math.max(-80, Math.min(80, state.ptz.tilt + tiltDelta));
      const newZoom = Math.max(GAME_CONFIG.camera.zoomMin, Math.min(GAME_CONFIG.camera.zoomMax, state.ptz.zoom + zoomDelta));
      
      return { ptz: { pan: newPan, tilt: newTilt, zoom: newZoom } };
    });
  },

  registerShot: () => set((state) => {
    if (state.isPaused) return state;
    triggerHaptic('fire');
    return { shots: state.shots + 1 }
  }),

  registerHit: (points) => set((state) => {
    triggerHaptic('hit');
    const newCombo = state.combo + 1;
    const scoreBoostMult = 1 + (state.activePowers.SCORE_BOOST || 0) * 0.5;
    const addedScore = Math.round(points * state.combo * scoreBoostMult);
    const vampStacks = state.activePowers.VAMPIRIC_SHIELD || 0;
    let nextShield = state.playerShield;
    let nextHealth = state.playerHealth;
    if (vampStacks > 0) {
      const healAmount = 6 * vampStacks;
      const shieldSpace = state.maxPlayerShield - state.playerShield;
      const shieldGain = Math.min(shieldSpace, healAmount);
      nextShield = state.playerShield + shieldGain;
      const remainingHeal = healAmount - shieldGain;
      nextHealth = Math.min(state.maxPlayerHealth, state.playerHealth + remainingHeal);
    }
    return {
      hits: state.hits + 1,
      score: state.score + addedScore,
      combo: newCombo,
      targetsDestroyed: state.targetsDestroyed + 1,
      playerShield: nextShield,
      playerHealth: nextHealth,
    };
  }),

  resetCombo: () => set({ combo: 1 }),

  tickTime: (delta) => set((state) => {
    if (state.mode === 'CHALLENGE' && state.timeRemaining > 0 && state.roundState === 'PLAYING' && !state.isPaused) {
      const newTime = state.timeRemaining - delta;
      if (newTime <= 0) {
        SceneState.resetAllies();
        // Save stats on gameover only if it beats previous or if no previous record
        const totalTargets = getRoundTotalTargets(state.mode, state.currentRound);
        const newStats = { ...state.levelStats };
        const existing = newStats[state.currentRound];
        if (!existing || state.score > existing.score) {
          newStats[state.currentRound] = {
             score: state.score,
             targetsDestroyed: state.targetsDestroyed,
             totalTargets
          };
        }
        return { timeRemaining: 0, mode: 'GAMEOVER', bossInfo: null, levelStats: newStats };
      }
      return { timeRemaining: newTime };
    }
    return state;
  }),

  resetGame: (mode) => {
    const newMap = mode === 'MENU' ? generateRandomMap() : generateMapForLevel(1, mode === 'TRAINING');
    SceneState.colliders = newMap.obstacles;
    SceneState.maxAmmo = 50;
    SceneState.ammo = 50;
    SceneState.isReloading = false;
    SceneState.reloadProgress = 0;
    SceneState.resetPlayerPosition();
    SceneState.resetAllies();
    const isPlayingMode = mode === 'CHALLENGE' || mode === 'TRAINING';
    set({
      mode,
      ...(isPlayingMode ? { lastPlayedMode: mode } : {}),
      roundState: isPlayingMode ? 'POWER_SELECT' : 'PLAYING',
      isPaused: false,
      isSettingsOpen: false,
      score: 0,
      combo: 1,
      shots: 0,
      hits: 0,
      timeRemaining: mode === 'CHALLENGE' ? GAME_CONFIG.challengeDuration : 0,
      currentRound: 1,
      targetsDestroyed: 0,
      ptz: { pan: 0, tilt: 0, zoom: 1 },
      cameraShake: 0,
      activePowers: {},
      powerChoices: isPlayingMode ? getRandomPowerChoices(3) : [],
      currentMap: newMap,
      maxPlayerShield: 100,
      playerShield: 100,
      maxPlayerHealth: 100,
      playerHealth: 100,
      lastDamageTime: 0,
      bossInfo: null,
      waveBanner: null,
      portalTransition: null,
    });
  },
  
  completeRound: () => set((state) => {
    const totalTargets = getRoundTotalTargets(state.mode, state.currentRound);
    const newStats = { ...state.levelStats };
    const existing = newStats[state.currentRound];
    if (!existing || state.score > existing.score) {
        newStats[state.currentRound] = {
          score: state.score,
          targetsDestroyed: state.targetsDestroyed,
          totalTargets
        };
    }
    
    return {
       roundState: 'TRANSITION',
       bossInfo: null,
       levelStats: newStats
    };
  }),

  nextRound: () => set((state) => {
    const isTraining = state.mode === 'TRAINING';
    const nextR = isTraining ? state.currentRound + 1 : Math.min(MAX_LEVELS, state.currentRound + 1);
    const timePowerBonus = (state.activePowers.TIME_SURGE || 0) * 10;
    const bonusTime = 30 + nextR * 2 + timePowerBonus;
    const newMap = generateMapForLevel(nextR, isTraining);
    SceneState.colliders = newMap.obstacles;
    SceneState.resetPlayerPosition();
    SceneState.resetAllies();
    return {
      currentRound: nextR,
      highestRound: isTraining ? state.highestRound : Math.max(state.highestRound, nextR),
      roundState: 'POWER_SELECT',
      powerChoices: getRandomPowerChoices(3),
      targetsDestroyed: 0,
      timeRemaining: isTraining ? state.timeRemaining : Math.min(240, state.timeRemaining + bonusTime),
      currentMap: newMap,
      playerShield: state.maxPlayerShield,
      playerHealth: Math.min(state.maxPlayerHealth, state.playerHealth + 35),
      bossInfo: null,
    };
  }),
  
  startRound: (roundNumber: number) => {
    const newMap = generateMapForLevel(roundNumber);
    SceneState.colliders = newMap.obstacles;
    SceneState.maxAmmo = 50;
    SceneState.ammo = 50;
    SceneState.isReloading = false;
    SceneState.reloadProgress = 0;
    SceneState.resetPlayerPosition();
    SceneState.resetAllies();
    set({
      mode: 'CHALLENGE',
      lastPlayedMode: 'CHALLENGE',
      roundState: 'POWER_SELECT',
      isPaused: false,
      isSettingsOpen: false,
      score: 0,
      combo: 1,
      shots: 0,
      hits: 0,
      timeRemaining: GAME_CONFIG.challengeDuration,
      currentRound: roundNumber,
      targetsDestroyed: 0,
      ptz: { pan: 0, tilt: 0, zoom: 1 },
      cameraShake: 0,
      activePowers: {},
      powerChoices: getRandomPowerChoices(3),
      currentMap: newMap,
      maxPlayerShield: 100,
      playerShield: 100,
      maxPlayerHealth: 100,
      playerHealth: 100,
      lastDamageTime: 0,
      bossInfo: null,
      waveBanner: null,
      portalTransition: null,
    });
  },

  addCameraShake: (amount) => set((state) => ({
    cameraShake: Math.min(1, state.cameraShake + amount)
  })),
  
  clearCameraShake: () => set({ cameraShake: 0 })
}));
