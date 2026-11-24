// Adaptive Multi-Bus Sci-Fi Audio Engine using Web Audio API + Local CC0 Tracks
// See public/audio/ATTRIBUTION.md for full CC0 track credits and sources.

import type { BiomeChapter } from './mapGenerator';
import { useGameStore } from './gameState';

export type SoundMood = 'CALM' | 'COMBAT' | 'HIGH_TENSION' | 'CRITICAL';

export type AudioScreen =
  | 'MAIN_MENU'
  | 'LEVEL_MAP'
  | 'SETTINGS_MENU'
  | 'GAMEPLAY'
  | 'PAUSED'
  | 'GAMEOVER';

export type AudioSituation =
  | 'EXPLORE'
  | 'COMBAT'
  | 'HIGH_TENSION'
  | 'CRITICAL'
  | 'POWER_SELECT'
  | 'PORTAL_ACTIVE'
  | 'WARP_CINEMATIC'
  | 'ROUND_COMPLETE'
  | 'VICTORY'
  | 'GAMEOVER';

export interface AudioContextSnapshot {
  screen: AudioScreen;
  chapter: BiomeChapter;
  situation: AudioSituation;
  isBoss: boolean;
  bossTier?: number;
  bossShielded?: boolean;
}

export interface AudioDebugState {
  initialized: boolean;
  contextState: AudioContextState | 'uninitialized';
  activeTrackKey: string;
  activeAmbienceKey: string;
  activeSituation: AudioSituation;
  activeScreen: AudioScreen;
  activeChapter: BiomeChapter | null;
  isBoss: boolean;
  bossTier?: number;
  loadedTracks: string[];
  failedTracks: string[];
  volumes: { master: number; music: number; sfx: number; muted: boolean };
}

declare global {
  interface Window {
    __AUDIO_DEBUG__?: AudioDebugState;
  }
}

type TrackLayerKind = 'music' | 'ambience' | 'sfx';

interface TrackSpec {
  url: string;
  layer: TrackLayerKind;
  loop: boolean;
  baseGain: number;
  playbackRate?: number;
  fallbackKey?: string;
}

interface ActiveLayerSlot {
  key: string;
  url: string;
  source: AudioBufferSourceNode;
  gain: GainNode;
  targetGain: number;
  playbackRate: number;
  stopTimer: number | null;
}

interface LayerState {
  active: ActiveLayerSlot | null;
  fading: Map<string, ActiveLayerSlot>;
}

const PREFS_STORAGE_KEY = 'scifi_fps_prefs_v1';
const audioAsset = (file: string) => `${import.meta.env.BASE_URL}audio/${file}`;

const TRACK_REGISTRY: Record<string, TrackSpec> = {
  // Menus & Waiting Rooms
  menu_main: {
    url: audioAsset('menu-main.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.32,
    fallbackKey: 'ambience_galactic',
  },
  ambience_menu_main: {
    url: audioAsset('space-ambient.ogg'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.18,
  },
  menu_level_map: {
    url: audioAsset('menu-main.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.28,
    playbackRate: 0.97,
    fallbackKey: 'menu_main',
  },
  ambience_level_map: {
    url: audioAsset('biome-orbital.mp3'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.18,
    fallbackKey: 'ambience_galactic',
  },
  menu_settings: {
    url: audioAsset('menu-settings.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.30,
    fallbackKey: 'menu_main',
  },
  ambience_settings: {
    url: audioAsset('biome-lab.ogg'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.14,
    fallbackKey: 'ambience_galactic',
  },
  menu_paused: {
    url: audioAsset('menu-settings.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.16,
    playbackRate: 0.94,
    fallbackKey: 'menu_main',
  },

  // 5 Biome Ambience Beds
  ambience_lab: {
    url: audioAsset('biome-lab.ogg'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.30,
    fallbackKey: 'ambience_galactic',
  },
  ambience_earth: {
    url: audioAsset('biome-earth.ogg'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.34,
    fallbackKey: 'ambience_galactic',
  },
  ambience_launch: {
    url: audioAsset('biome-launch.ogg'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.28,
    fallbackKey: 'ambience_galactic',
  },
  ambience_orbital: {
    url: audioAsset('biome-orbital.mp3'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.30,
    fallbackKey: 'ambience_galactic',
  },
  ambience_galactic: {
    url: audioAsset('space-ambient.ogg'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.32,
  },

  // 5 Biome Exploration Music Layers (distinct keys, non-overlapping URLs vs each biome's ambience)
  music_biome_lab: {
    url: audioAsset('space-ambient.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.10,
  },
  music_biome_earth: {
    url: audioAsset('space-ambient.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.08,
  },
  music_biome_launch: {
    url: audioAsset('space-ambient.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.10,
  },
  music_biome_orbital: {
    url: audioAsset('menu-main.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.12,
    fallbackKey: 'ambience_galactic',
  },
  music_biome_galactic: {
    url: audioAsset('menu-main.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.12,
    fallbackKey: 'ambience_galactic',
  },

  // Combat & Tension Situations
  music_combat: {
    url: audioAsset('tense-combat.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.24,
    playbackRate: 1.0,
    fallbackKey: 'menu_main',
  },
  music_high_tension: {
    url: audioAsset('tense-combat.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.36,
    playbackRate: 1.03,
    fallbackKey: 'music_combat',
  },
  music_critical: {
    url: audioAsset('tense-combat.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.44,
    playbackRate: 1.07,
    fallbackKey: 'music_combat',
  },

  // Power Select, Portal, Warp, Victory & Game Over
  music_power_select: {
    url: audioAsset('situation-power-select.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.30,
    fallbackKey: 'menu_main',
  },
  music_portal: {
    url: audioAsset('situation-power-select.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.34,
    playbackRate: 1.04,
    fallbackKey: 'music_power_select',
  },
  music_warp: {
    url: audioAsset('situation-power-select.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.38,
    playbackRate: 1.08,
    fallbackKey: 'music_power_select',
  },
  music_round_complete: {
    url: audioAsset('situation-victory.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.34,
    fallbackKey: 'menu_main',
  },
  music_victory: {
    url: audioAsset('situation-victory.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.40,
    playbackRate: 1.02,
    fallbackKey: 'music_round_complete',
  },
  music_gameover: {
    url: audioAsset('situation-gameover.mp3'),
    layer: 'music',
    loop: true,
    baseGain: 0.36,
    fallbackKey: 'ambience_galactic',
  },
  ambience_gameover: {
    url: audioAsset('space-ambient.ogg'),
    layer: 'ambience',
    loop: true,
    baseGain: 0.12,
    playbackRate: 0.88,
  },

  // Boss Encounters
  music_boss: {
    url: audioAsset('boss-standard.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.40,
    fallbackKey: 'music_high_tension',
  },
  music_boss_omega: {
    url: audioAsset('boss-omega.ogg'),
    layer: 'music',
    loop: true,
    baseGain: 0.42,
    fallbackKey: 'music_boss',
  },

  // Stinger SFX
  sfx_tension_alarm: {
    url: audioAsset('tension-alarm.ogg'),
    layer: 'sfx',
    loop: false,
    baseGain: 0.30,
  },
};

function clamp01(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function loadBootstrapAudioPrefs(): {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
} {
  const defaults = {
    masterVolume: 0.7,
    musicVolume: 0.7,
    sfxVolume: 0.85,
    muted: false,
  };
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaults;
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return defaults;
    return {
      masterVolume: clamp01(parsed.masterVolume, defaults.masterVolume),
      musicVolume: clamp01(parsed.musicVolume, defaults.musicVolume),
      sfxVolume: clamp01(parsed.sfxVolume, defaults.sfxVolume),
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : defaults.muted,
    };
  } catch {
    return defaults;
  }
}

function getBiomeAmbienceKey(chapter: BiomeChapter): string {
  switch (chapter) {
    case 'UNDERGROUND_LAB':
      return 'ambience_lab';
    case 'EARTH_OPEN_FIELD':
      return 'ambience_earth';
    case 'ROCKET_LAUNCH_ZONE':
      return 'ambience_launch';
    case 'ORBITAL_STRATOSPHERE':
      return 'ambience_orbital';
    case 'GALACTIC_ARENA':
      return 'ambience_galactic';
  }
}

function getBiomeExploreMusicKey(chapter: BiomeChapter): string {
  switch (chapter) {
    case 'UNDERGROUND_LAB':
      return 'music_biome_lab';
    case 'EARTH_OPEN_FIELD':
      return 'music_biome_earth';
    case 'ROCKET_LAUNCH_ZONE':
      return 'music_biome_launch';
    case 'ORBITAL_STRATOSPHERE':
      return 'music_biome_orbital';
    case 'GALACTIC_ARENA':
      return 'music_biome_galactic';
  }
}

function moodFromSituation(situation: AudioSituation): SoundMood {
  if (situation === 'CRITICAL') return 'CRITICAL';
  if (situation === 'HIGH_TENSION') return 'HIGH_TENSION';
  if (situation === 'COMBAT') return 'COMBAT';
  return 'CALM';
}

interface ResolvedLayerPlan {
  ambienceKey: string;
  musicKey: string;
  ambienceGainScale: number;
  musicGainScale: number;
  musicRateOverride?: number;
  synthAmbientTarget: number;
}

class SynthAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Synthesized base ambient nodes
  private ambientStarted = false;
  private ambientGain: GainNode | null = null;
  private sonarInterval: number | null = null;
  private heartbeatInterval: number | null = null;

  // Track decoding & caching
  private bufferCache = new Map<string, AudioBuffer>();
  private inflightUrlLoads = new Map<string, Promise<AudioBuffer | null>>();
  private loadedTrackKeys = new Set<string>();
  private failedTrackKeys = new Set<string>();
  private tracksLoaded = false;
  private tracksLoading = false;
  private preloadPromise: Promise<{ loaded: string[]; failed: string[] }> | null = null;
  private alarmBuffer: AudioBuffer | null = null;
  private lastTensionAlarmTime = 0;

  // Dual-layer smooth crossfader
  private musicLayer: LayerState = { active: null, fading: new Map() };
  private ambienceLayer: LayerState = { active: null, fading: new Map() };

  // Context Director state
  private currentMood: SoundMood = 'CALM';
  private activeScreen: AudioScreen = 'MAIN_MENU';
  private activeChapter: BiomeChapter | null = 'GALACTIC_ARENA';
  private activeSituation: AudioSituation = 'EXPLORE';
  private activeIsBoss = false;
  private activeBossTier: number | undefined = undefined;
  private activeBossShielded: boolean | undefined = undefined;
  private desiredMusicKey = 'menu_main';
  private desiredAmbienceKey = 'ambience_menu_main';
  private desiredMusicGainScale = 1.0;
  private desiredAmbienceGainScale = 1.0;
  private desiredMusicRateOverride: number | undefined = undefined;
  private desiredSynthAmbientGain = 0.04;

  // PTZ Servo motor nodes
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private currentMotorVolume = 0;

  // Volume state (bootstrapped safely from localStorage; store sync attaches lazily)
  private muted: boolean;
  private volume: number;
  private musicVolume: number;
  private sfxVolume: number;

  // Lazy Zustand subscription state (never accessed synchronously during module eval)
  private storeSubscribed = false;
  private storeUnsubscribe: (() => void) | null = null;

  constructor() {
    const initial = loadBootstrapAudioPrefs();
    this.volume = initial.masterVolume;
    this.musicVolume = initial.musicVolume;
    this.sfxVolume = initial.sfxVolume;
    this.muted = initial.muted;
  }

  ensureStoreSubscription() {
    if (this.storeSubscribed) return;
    try {
      if (typeof useGameStore?.getState !== 'function' || typeof useGameStore?.subscribe !== 'function') {
        return;
      }
      this.storeSubscribed = true;
      this.storeUnsubscribe = useGameStore.subscribe((state, prevState) => {
        const nextPrefs = state.preferences;
        const oldPrefs = prevState.preferences;
        if (nextPrefs.masterVolume !== oldPrefs.masterVolume) {
          this.setVolume(nextPrefs.masterVolume);
        }
        if (nextPrefs.musicVolume !== oldPrefs.musicVolume) {
          this.setMusicVolume(nextPrefs.musicVolume);
        }
        if (nextPrefs.sfxVolume !== oldPrefs.sfxVolume) {
          this.setSfxVolume(nextPrefs.sfxVolume);
        }
        if (nextPrefs.muted !== oldPrefs.muted) {
          this.setMuted(nextPrefs.muted);
        }
      });
    } catch {
      this.storeSubscribed = false;
    }
  }

  private ensureAudioContextGraph(): boolean {
    if (!this.ctx) {
      if (typeof window === 'undefined') return false;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.value = this.musicVolume;
      this.ambienceGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.ctx.onstatechange = () => {
        if (this.ctx?.state === 'running') {
          this.syncLayersToDesired();
        }
      };
    }

    return Boolean(this.ctx && this.masterGain && this.musicGain && this.ambienceGain && this.sfxGain);
  }

  init() {
    this.ensureStoreSubscription();
    if (!this.ensureAudioContextGraph() || !this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx
        .resume()
        .then(() => {
          this.syncLayersToDesired();
        })
        .catch(() => {});
    }

    if (!this.noiseBuffer && this.ctx) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (!this.ambientStarted) {
      this.startAmbient();
      this.initMotorSound();
      this.startHeartbeatLoop();
    }

    if (!this.tracksLoaded && !this.tracksLoading) {
      void this.preloadAllTracks();
    }

    if (this.ctx.state === 'running') {
      this.syncLayersToDesired();
    }
  }

  private async fetchAndDecodeUrl(url: string): Promise<AudioBuffer | null> {
    if (!this.ensureAudioContextGraph() || !this.ctx) return null;

    const cached = this.bufferCache.get(url);
    if (cached) return cached;

    const existing = this.inflightUrlLoads.get(url);
    if (existing) return existing;

    const loadPromise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuf = await response.arrayBuffer();
        if (!this.ctx) return null;
        const decoded = await this.ctx.decodeAudioData(arrayBuf);
        this.bufferCache.set(url, decoded);
        return decoded;
      } catch {
        return null;
      } finally {
        this.inflightUrlLoads.delete(url);
      }
    })();

    this.inflightUrlLoads.set(url, loadPromise);
    return loadPromise;
  }

  private syncRegistryStatusForUrl(url: string, decoded: AudioBuffer | null) {
    for (const [key, spec] of Object.entries(TRACK_REGISTRY)) {
      if (spec.url !== url) continue;
      if (decoded) {
        this.loadedTrackKeys.add(key);
        this.failedTrackKeys.delete(key);
        if (key === 'sfx_tension_alarm') {
          this.alarmBuffer = decoded;
        }
      } else {
        this.failedTrackKeys.add(key);
      }
    }
  }

  private async ensureTrackLoaded(key: string): Promise<AudioBuffer | null> {
    const spec = TRACK_REGISTRY[key];
    if (!spec) {
      this.failedTrackKeys.add(key);
      return null;
    }

    const cached = this.bufferCache.get(spec.url);
    if (cached) {
      this.loadedTrackKeys.add(key);
      this.failedTrackKeys.delete(key);
      if (key === 'sfx_tension_alarm') {
        this.alarmBuffer = cached;
      }
      return cached;
    }

    const decoded = await this.fetchAndDecodeUrl(spec.url);
    this.syncRegistryStatusForUrl(spec.url, decoded);
    return decoded;
  }

  async preloadAllTracks(): Promise<{ loaded: string[]; failed: string[] }> {
    this.ensureStoreSubscription();
    if (this.preloadPromise) return this.preloadPromise;

    this.tracksLoading = true;
    this.preloadPromise = (async () => {
      try {
        if (!this.ensureAudioContextGraph()) {
          for (const key of Object.keys(TRACK_REGISTRY)) {
            this.failedTrackKeys.add(key);
          }
          return {
            loaded: Array.from(this.loadedTrackKeys).sort(),
            failed: Array.from(this.failedTrackKeys).sort(),
          };
        }

        const uniqueUrls = Array.from(new Set(Object.values(TRACK_REGISTRY).map((s) => s.url)));
        await Promise.allSettled(
          uniqueUrls.map(async (url) => {
            const buf = await this.fetchAndDecodeUrl(url);
            this.syncRegistryStatusForUrl(url, buf);
          })
        );

        this.tracksLoaded = true;
        if (this.ctx?.state === 'running') {
          this.syncLayersToDesired();
        }
        return {
          loaded: Array.from(this.loadedTrackKeys).sort(),
          failed: Array.from(this.failedTrackKeys).sort(),
        };
      } finally {
        this.tracksLoading = false;
        this.preloadPromise = null;
      }
    })();

    return this.preloadPromise;
  }

  private resolveLayerPlan(snapshot: AudioContextSnapshot): ResolvedLayerPlan {
    const biomeAmbience = getBiomeAmbienceKey(snapshot.chapter);
    const biomeExploreMusic = getBiomeExploreMusicKey(snapshot.chapter);

    if (snapshot.screen === 'GAMEOVER' || snapshot.situation === 'GAMEOVER') {
      return {
        ambienceKey: 'ambience_gameover',
        musicKey: 'music_gameover',
        ambienceGainScale: 1.0,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.04,
      };
    }

    if (snapshot.screen === 'SETTINGS_MENU') {
      return {
        ambienceKey: 'ambience_settings',
        musicKey: 'menu_settings',
        ambienceGainScale: 1.0,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.03,
      };
    }

    if (snapshot.screen === 'MAIN_MENU') {
      return {
        ambienceKey: 'ambience_menu_main',
        musicKey: 'menu_main',
        ambienceGainScale: 1.0,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.04,
      };
    }

    if (snapshot.screen === 'LEVEL_MAP') {
      return {
        ambienceKey: 'ambience_level_map',
        musicKey: 'menu_level_map',
        ambienceGainScale: 1.0,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.03,
      };
    }

    if (snapshot.screen === 'PAUSED') {
      return {
        ambienceKey: biomeAmbience,
        musicKey: 'menu_paused',
        ambienceGainScale: 0.45,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.02,
      };
    }

    // GAMEPLAY
    if (snapshot.situation === 'WARP_CINEMATIC') {
      return {
        ambienceKey: 'ambience_orbital',
        musicKey: 'music_warp',
        ambienceGainScale: 0.65,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.04,
      };
    }

    if (snapshot.situation === 'PORTAL_ACTIVE') {
      return {
        ambienceKey: 'ambience_galactic',
        musicKey: 'music_portal',
        ambienceGainScale: 0.60,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.04,
      };
    }

    if (snapshot.situation === 'POWER_SELECT') {
      return {
        ambienceKey: biomeAmbience,
        musicKey: 'music_power_select',
        ambienceGainScale: 0.55,
        musicGainScale: 1.0,
        synthAmbientTarget: snapshot.chapter === 'EARTH_OPEN_FIELD' ? 0.0 : 0.03,
      };
    }

    if (snapshot.situation === 'VICTORY') {
      return {
        ambienceKey: 'ambience_galactic',
        musicKey: 'music_victory',
        ambienceGainScale: 0.50,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.02,
      };
    }

    if (snapshot.situation === 'ROUND_COMPLETE') {
      return {
        ambienceKey: biomeAmbience,
        musicKey: 'music_round_complete',
        ambienceGainScale: 0.45,
        musicGainScale: 1.0,
        synthAmbientTarget: 0.02,
      };
    }

    if (snapshot.isBoss) {
      const tier = snapshot.bossTier ?? 1;
      const bossKey = tier >= 6 ? 'music_boss_omega' : 'music_boss';
      const criticalBoost = snapshot.situation === 'CRITICAL' ? 1.05 : 1.0;
      return {
        ambienceKey: biomeAmbience,
        musicKey: bossKey,
        ambienceGainScale: 0.50,
        musicGainScale: snapshot.bossShielded ? 0.95 : 1.08,
        musicRateOverride: criticalBoost,
        synthAmbientTarget: snapshot.chapter === 'EARTH_OPEN_FIELD' ? 0.0 : 0.04,
      };
    }

    if (snapshot.situation === 'CRITICAL') {
      return {
        ambienceKey: biomeAmbience,
        musicKey: 'music_critical',
        ambienceGainScale: 0.45,
        musicGainScale: 1.0,
        synthAmbientTarget: snapshot.chapter === 'EARTH_OPEN_FIELD' ? 0.0 : 0.05,
      };
    }

    if (snapshot.situation === 'HIGH_TENSION') {
      return {
        ambienceKey: biomeAmbience,
        musicKey: 'music_high_tension',
        ambienceGainScale: 0.55,
        musicGainScale: 1.0,
        synthAmbientTarget: snapshot.chapter === 'EARTH_OPEN_FIELD' ? 0.0 : 0.04,
      };
    }

    if (snapshot.situation === 'COMBAT') {
      return {
        ambienceKey: biomeAmbience,
        musicKey: 'music_combat',
        ambienceGainScale: 0.65,
        musicGainScale: 1.0,
        synthAmbientTarget: snapshot.chapter === 'EARTH_OPEN_FIELD' ? 0.0 : 0.03,
      };
    }

    // EXPLORE
    return {
      ambienceKey: biomeAmbience,
      musicKey: biomeExploreMusic,
      ambienceGainScale: 1.0,
      musicGainScale: 1.0,
      synthAmbientTarget: snapshot.chapter === 'EARTH_OPEN_FIELD' ? 0.0 : 0.03,
    };
  }

  setAudioContext(snapshot: AudioContextSnapshot) {
    this.ensureStoreSubscription();

    this.activeScreen = snapshot.screen;
    this.activeChapter = snapshot.chapter;
    this.activeSituation = snapshot.situation;
    this.activeIsBoss = snapshot.isBoss;
    this.activeBossTier = snapshot.isBoss ? snapshot.bossTier : undefined;
    this.activeBossShielded = snapshot.isBoss ? snapshot.bossShielded : undefined;
    this.currentMood = moodFromSituation(snapshot.situation);

    const plan = this.resolveLayerPlan(snapshot);
    this.desiredAmbienceKey = plan.ambienceKey;
    this.desiredMusicKey = plan.musicKey;
    this.desiredAmbienceGainScale = plan.ambienceGainScale;
    this.desiredMusicGainScale = plan.musicGainScale;
    this.desiredMusicRateOverride = plan.musicRateOverride;
    this.desiredSynthAmbientGain = plan.synthAmbientTarget;

    if (snapshot.screen !== 'GAMEPLAY' && this.motorGain && this.ctx) {
      this.currentMotorVolume = 0;
      this.motorGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
    }

    this.syncLayersToDesired();
  }

  setIntensity(mood: SoundMood) {
    this.ensureStoreSubscription();
    if (this.currentMood === mood && this.tracksLoaded) return;
    const situation: AudioSituation =
      mood === 'CRITICAL'
        ? 'CRITICAL'
        : mood === 'HIGH_TENSION'
          ? 'HIGH_TENSION'
          : mood === 'COMBAT'
            ? 'COMBAT'
            : 'EXPLORE';

    this.setAudioContext({
      screen: this.activeScreen,
      chapter: this.activeChapter ?? 'GALACTIC_ARENA',
      situation,
      isBoss: this.activeIsBoss,
      bossTier: this.activeBossTier,
      bossShielded: this.activeBossShielded,
    });
  }

  private stopSlotImmediately(slot: ActiveLayerSlot) {
    if (slot.stopTimer !== null) {
      window.clearTimeout(slot.stopTimer);
      slot.stopTimer = null;
    }
    try {
      slot.source.stop();
    } catch {
      // Ignore already-stopped source
    }
    try {
      slot.source.disconnect();
      slot.gain.disconnect();
    } catch {
      // Ignore already-disconnected nodes
    }
  }

  private fadeOutSlot(layer: LayerState, slot: ActiveLayerSlot, fadeSeconds = 0.85) {
    if (!this.ctx) {
      this.stopSlotImmediately(slot);
      return;
    }

    const existingFading = layer.fading.get(slot.key);
    if (existingFading && existingFading !== slot) {
      layer.fading.delete(slot.key);
      this.stopSlotImmediately(existingFading);
    }

    if (slot.stopTimer !== null) {
      window.clearTimeout(slot.stopTimer);
      slot.stopTimer = null;
    }

    const now = this.ctx.currentTime;
    const currentGain = Math.max(0.0001, slot.gain.gain.value);
    slot.gain.gain.cancelScheduledValues(now);
    slot.gain.gain.setValueAtTime(currentGain, now);
    slot.gain.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds);

    slot.stopTimer = window.setTimeout(() => {
      layer.fading.delete(slot.key);
      this.stopSlotImmediately(slot);
    }, Math.ceil((fadeSeconds + 0.08) * 1000));

    layer.fading.set(slot.key, slot);
  }

  private syncLayersToDesired() {
    if (!this.ctx) return;

    if (this.ambientGain) {
      const hasExternalAmbience = Boolean(this.ambienceLayer.active);
      const targetSynth = hasExternalAmbience ? this.desiredSynthAmbientGain : 0.16;
      this.ambientGain.gain.setTargetAtTime(targetSynth, this.ctx.currentTime, 0.45);
    }

    if (this.ctx.state !== 'running') return;

    this.transitionLayer(
      'ambience',
      this.desiredAmbienceKey,
      this.desiredAmbienceGainScale,
      undefined
    );
    this.transitionLayer(
      'music',
      this.desiredMusicKey,
      this.desiredMusicGainScale,
      this.desiredMusicRateOverride
    );
  }

  private transitionLayer(
    layerName: 'music' | 'ambience',
    requestedKey: string,
    gainScale: number,
    rateOverride: number | undefined,
    visitedKeys?: Set<string>
  ) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const bus = layerName === 'music' ? this.musicGain : this.ambienceGain;
    if (!bus) return;

    const spec = TRACK_REGISTRY[requestedKey];
    if (!spec) return;

    const layer = layerName === 'music' ? this.musicLayer : this.ambienceLayer;
    const targetGain = Math.max(0.0001, spec.baseGain * gainScale);
    const targetRate = rateOverride ?? spec.playbackRate ?? 1.0;
    const now = this.ctx.currentTime;

    // Case 1: Requested key is already active
    if (layer.active && layer.active.key === requestedKey) {
      layer.active.targetGain = targetGain;
      layer.active.playbackRate = targetRate;
      layer.active.gain.gain.setTargetAtTime(targetGain, now, 0.25);
      layer.active.source.playbackRate.setTargetAtTime(targetRate, now, 0.25);
      return;
    }

    // Case 2: Same underlying audio URL is already active under a different key (e.g. combat -> high tension)
    if (layer.active && layer.active.url === spec.url) {
      layer.active.key = requestedKey;
      layer.active.targetGain = targetGain;
      layer.active.playbackRate = targetRate;
      layer.active.gain.gain.setTargetAtTime(targetGain, now, 0.28);
      layer.active.source.playbackRate.setTargetAtTime(targetRate, now, 0.28);
      return;
    }

    // Case 3: Requested key is currently fading out -> promote cleanly back to active
    const fadingMatch = layer.fading.get(requestedKey);
    if (fadingMatch) {
      layer.fading.delete(requestedKey);
      if (fadingMatch.stopTimer !== null) {
        window.clearTimeout(fadingMatch.stopTimer);
        fadingMatch.stopTimer = null;
      }
      if (layer.active) {
        this.fadeOutSlot(layer, layer.active);
      }
      const currentVal = Math.max(0.0001, fadingMatch.gain.gain.value);
      fadingMatch.gain.gain.cancelScheduledValues(now);
      fadingMatch.gain.gain.setValueAtTime(currentVal, now);
      fadingMatch.gain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
      fadingMatch.source.playbackRate.setTargetAtTime(targetRate, now, 0.25);
      fadingMatch.targetGain = targetGain;
      fadingMatch.playbackRate = targetRate;
      layer.active = fadingMatch;
      return;
    }

    // Case 4: Buffer ready in cache -> crossfade cleanly
    const cachedBuffer = this.bufferCache.get(spec.url);
    if (cachedBuffer) {
      if (layer.active) {
        this.fadeOutSlot(layer, layer.active);
        layer.active = null;
      }

      const slotGain = this.ctx.createGain();
      slotGain.gain.setValueAtTime(0.0001, now);
      slotGain.gain.linearRampToValueAtTime(targetGain, now + 0.7);
      slotGain.connect(bus);

      const source = this.ctx.createBufferSource();
      source.buffer = cachedBuffer;
      source.loop = spec.loop;
      source.playbackRate.setValueAtTime(targetRate, now);
      source.connect(slotGain);
      source.start(now);

      layer.active = {
        key: requestedKey,
        url: spec.url,
        source,
        gain: slotGain,
        targetGain,
        playbackRate: targetRate,
        stopTimer: null,
      };

      if (layerName === 'ambience' && this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(this.desiredSynthAmbientGain, now, 0.5);
      }
      return;
    }

    // Case 5: Not decoded yet -> load asynchronously with stale-desiredKey race protection
    const seen = visitedKeys ?? new Set<string>();
    if (seen.has(requestedKey)) return;
    seen.add(requestedKey);

    void this.ensureTrackLoaded(requestedKey).then((buf) => {
      const currentDesired =
        layerName === 'music' ? this.desiredMusicKey : this.desiredAmbienceKey;
      if (!this.ctx || this.ctx.state !== 'running' || currentDesired !== requestedKey) {
        return;
      }
      if (buf) {
        const latestScale =
          layerName === 'music' ? this.desiredMusicGainScale : this.desiredAmbienceGainScale;
        const latestRate = layerName === 'music' ? this.desiredMusicRateOverride : undefined;
        this.transitionLayer(layerName, requestedKey, latestScale, latestRate, seen);
      } else if (spec.fallbackKey && !seen.has(spec.fallbackKey)) {
        const latestScale =
          layerName === 'music' ? this.desiredMusicGainScale : this.desiredAmbienceGainScale;
        this.transitionLayer(layerName, spec.fallbackKey, latestScale, undefined, seen);
      }
    });
  }

  private triggerHeartbeatPulse(t: number, gainPeak: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(62, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(gainPeak, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  private startHeartbeatLoop() {
    if (this.heartbeatInterval !== null) return;
    this.heartbeatInterval = window.setInterval(() => {
      if (
        this.currentMood !== 'CRITICAL' ||
        this.activeScreen !== 'GAMEPLAY' ||
        !this.ctx ||
        !this.sfxGain ||
        this.ctx.state !== 'running' ||
        this.muted
      ) {
        return;
      }
      const t = this.ctx.currentTime;
      this.triggerHeartbeatPulse(t, 0.16);
      this.triggerHeartbeatPulse(t + 0.24, 0.1);
    }, 1100);
  }

  private ensureContext(): boolean {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx
        .resume()
        .then(() => {
          this.syncLayersToDesired();
        })
        .catch(() => {});
    }
    return Boolean(this.ctx && this.masterGain && this.sfxGain);
  }

  setVolume(val: number) {
    this.volume = clamp01(val, this.volume);
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  getVolume(): number {
    return this.volume;
  }

  setMusicVolume(val: number) {
    this.musicVolume = clamp01(val, this.musicVolume);
    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.musicGain) {
        this.musicGain.gain.setTargetAtTime(this.musicVolume, now, 0.05);
      }
      if (this.ambienceGain) {
        this.ambienceGain.gain.setTargetAtTime(this.musicVolume, now, 0.05);
      }
    }
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  setSfxVolume(val: number) {
    this.sfxVolume = clamp01(val, this.sfxVolume);
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  setMuted(muted: boolean) {
    this.muted = Boolean(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  // Dark Tactical Hangar Ambient Drone + Breathing Filter + Subtle Sonar Pulse
  private startAmbient() {
    if (!this.ctx || !this.ambienceGain || !this.sfxGain || this.ambientStarted) return;
    this.ambientStarted = true;

    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.14, now + 2.5);
    this.ambientGain.connect(this.ambienceGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);
    filter.Q.value = 3.5;
    filter.connect(this.ambientGain);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.14;
    lfoGain.gain.value = 70;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    const drone1 = this.ctx.createOscillator();
    drone1.type = 'sawtooth';
    drone1.frequency.value = 55;
    const d1Gain = this.ctx.createGain();
    d1Gain.gain.value = 0.35;
    drone1.connect(d1Gain);
    d1Gain.connect(filter);
    drone1.start(now);

    const drone2 = this.ctx.createOscillator();
    drone2.type = 'triangle';
    drone2.frequency.value = 55.35;
    const d2Gain = this.ctx.createGain();
    d2Gain.gain.value = 0.45;
    drone2.connect(d2Gain);
    d2Gain.connect(filter);
    drone2.start(now);

    const pad = this.ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 82.41;
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.2;
    pad.connect(padGain);
    padGain.connect(filter);
    pad.start(now);

    // Subtle periodic tactical radar ping every 5.5s
    this.sonarInterval = window.setInterval(() => {
      if (!this.ctx || !this.sfxGain || this.ctx.state !== 'running' || this.muted) return;
      const t = this.ctx.currentTime;
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1320, t);
      ping.frequency.exponentialRampToValueAtTime(880, t + 0.35);

      pingGain.gain.setValueAtTime(0.0001, t);
      pingGain.gain.linearRampToValueAtTime(0.025, t + 0.02);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

      ping.connect(pingGain);
      pingGain.connect(this.sfxGain);
      ping.start(t);
      ping.stop(t + 0.65);
    }, 5500);
  }

  // Continuous PTZ Servo Motor Oscillator (silent when speed = 0)
  private initMotorSound() {
    if (!this.ctx || !this.sfxGain || this.motorOsc) return;
    const now = this.ctx.currentTime;

    this.motorOsc = this.ctx.createOscillator();
    this.motorOsc.type = 'triangle';
    this.motorOsc.frequency.setValueAtTime(110, now);

    const motorFilter = this.ctx.createBiquadFilter();
    motorFilter.type = 'bandpass';
    motorFilter.frequency.value = 260;
    motorFilter.Q.value = 2.0;

    this.motorGain = this.ctx.createGain();
    this.motorGain.gain.setValueAtTime(0.0, now);

    this.motorOsc.connect(motorFilter);
    motorFilter.connect(this.motorGain);
    this.motorGain.connect(this.sfxGain);
    this.motorOsc.start(now);
  }

  updateMotorSound(speed: number) {
    if (!this.ctx || !this.motorGain || !this.motorOsc || this.ctx.state !== 'running') {
      this.currentMotorVolume = 0;
      return;
    }
    const clamped = Math.max(0, Math.min(1, speed));
    const now = this.ctx.currentTime;
    const targetGain = clamped > 0.02 ? clamped * 0.045 : 0;
    const targetFreq = 95 + clamped * 120;
    this.currentMotorVolume = targetGain;
    this.motorGain.gain.setTargetAtTime(targetGain, now, 0.04);
    this.motorOsc.frequency.setTargetAtTime(targetFreq, now, 0.04);
  }

  getMotorVolume(): number {
    return this.currentMotorVolume;
  }

  playZoom() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.045);
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  playShoot() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playHit() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);

    if (!this.noiseBuffer) return;
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noiseSource.start(t);
  }

  playDestroy() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(22, t + 0.42);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.42);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  playAlarm() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(1050, t + 0.12);
    osc.frequency.setValueAtTime(1320, t + 0.24);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  playTensionAlarm() {
    const nowMs = performance.now();
    if (nowMs - this.lastTensionAlarmTime < 6000) return;
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    this.lastTensionAlarmTime = nowMs;

    if (this.alarmBuffer) {
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.alarmBuffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      src.connect(gain);
      gain.connect(this.sfxGain);
      src.start(t);
    } else {
      this.playAlarm();
    }
  }

  playShieldBreak() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.46);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.frequency.exponentialRampToValueAtTime(240, t + 0.46);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);

    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.18, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      noise.connect(nGain);
      nGain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  playReload() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Stage 1: crisp metallic mag eject click
    const ejectOsc = this.ctx.createOscillator();
    const ejectGain = this.ctx.createGain();
    ejectOsc.type = 'triangle';
    ejectOsc.frequency.setValueAtTime(520, t);
    ejectOsc.frequency.exponentialRampToValueAtTime(190, t + 0.09);
    ejectGain.gain.setValueAtTime(0.14, t);
    ejectGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    ejectOsc.connect(ejectGain);
    ejectGain.connect(this.sfxGain);
    ejectOsc.start(t);
    ejectOsc.stop(t + 0.12);

    // Stage 2: rising plasma cell lock-in whine
    const lockTime = t + 0.48;
    const lockOsc = this.ctx.createOscillator();
    const lockGain = this.ctx.createGain();
    lockOsc.type = 'sine';
    lockOsc.frequency.setValueAtTime(280, lockTime);
    lockOsc.frequency.exponentialRampToValueAtTime(760, lockTime + 0.24);
    lockGain.gain.setValueAtTime(0.001, lockTime);
    lockGain.gain.linearRampToValueAtTime(0.12, lockTime + 0.05);
    lockGain.gain.exponentialRampToValueAtTime(0.001, lockTime + 0.28);
    lockOsc.connect(lockGain);
    lockGain.connect(this.sfxGain);
    lockOsc.start(lockTime);
    lockOsc.stop(lockTime + 0.3);
  }

  playPortalOpen() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Deep dimensional hum + rising harmonic chime
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65, t);
    subOsc.frequency.exponentialRampToValueAtTime(110, t + 1.1);
    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(0.24, t + 0.18);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 1.45);

    const freqs = [330, 495, 660, 990];
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const start = t + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f * 0.9, start);
      osc.frequency.exponentialRampToValueAtTime(f * 1.15, start + 0.55);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.85);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.9);
    });
  }

  playPortalWarp() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Rising hyperspace sweep
    const sweep = this.ctx.createOscillator();
    const sweepFilter = this.ctx.createBiquadFilter();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(85, t);
    sweep.frequency.exponentialRampToValueAtTime(920, t + 1.05);
    sweepFilter.type = 'bandpass';
    sweepFilter.frequency.setValueAtTime(240, t);
    sweepFilter.frequency.exponentialRampToValueAtTime(2800, t + 1.05);
    sweepFilter.Q.value = 1.8;
    sweepGain.gain.setValueAtTime(0.001, t);
    sweepGain.gain.linearRampToValueAtTime(0.22, t + 0.35);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 1.25);
    sweep.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(this.sfxGain);
    sweep.start(t);
    sweep.stop(t + 1.3);

    // Arrival celestial resolution chord around t + 1.05s
    const chimeTime = t + 1.05;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chimeTime);
      gain.gain.setValueAtTime(0.001, chimeTime);
      gain.gain.linearRampToValueAtTime(0.08, chimeTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 1.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(chimeTime);
      osc.stop(chimeTime + 1.3);
    });
  }

  playUI() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  getDebugState(): AudioDebugState {
    this.ensureStoreSubscription();
    const activeTrackKey = this.failedTrackKeys.has(this.desiredMusicKey)
      ? (this.musicLayer.active?.key ?? this.desiredMusicKey)
      : this.desiredMusicKey;
    const activeAmbienceKey = this.failedTrackKeys.has(this.desiredAmbienceKey)
      ? (this.ambienceLayer.active?.key ?? this.desiredAmbienceKey)
      : this.desiredAmbienceKey;

    return {
      initialized: this.ctx !== null,
      contextState: this.ctx ? this.ctx.state : 'uninitialized',
      activeTrackKey,
      activeAmbienceKey,
      activeSituation: this.activeSituation,
      activeScreen: this.activeScreen,
      activeChapter: this.activeChapter,
      isBoss: this.activeIsBoss,
      bossTier: this.activeBossTier,
      loadedTracks: Array.from(this.loadedTrackKeys).sort(),
      failedTracks: Array.from(this.failedTrackKeys).sort(),
      volumes: {
        master: this.volume,
        music: this.musicVolume,
        sfx: this.sfxVolume,
        muted: this.muted,
      },
    };
  }

  dispose() {
    if (this.sonarInterval !== null) {
      clearInterval(this.sonarInterval);
      this.sonarInterval = null;
    }
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    for (const layer of [this.musicLayer, this.ambienceLayer]) {
      if (layer.active) {
        this.stopSlotImmediately(layer.active);
        layer.active = null;
      }
      for (const slot of layer.fading.values()) {
        this.stopSlotImmediately(slot);
      }
      layer.fading.clear();
    }
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
      this.storeSubscribed = false;
    }
    this.currentMotorVolume = 0;
  }
}

export const audioSystem = new SynthAudio();

queueMicrotask(() => {
  audioSystem.ensureStoreSubscription();
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, '__AUDIO_DEBUG__', {
    configurable: true,
    enumerable: true,
    get: () => audioSystem.getDebugState(),
  });
}

export const initAudio = () => audioSystem.init();
export const setAudioMood = (mood: SoundMood) => audioSystem.setIntensity(mood);
export const playTensionAlarm = () => audioSystem.playTensionAlarm();
export const playShieldBreak = () => audioSystem.playShieldBreak();
export const playReload = () => audioSystem.playReload();
export const playPortalOpen = () => audioSystem.playPortalOpen();
export const playPortalWarp = () => audioSystem.playPortalWarp();

export const playSound = (sound: 'shoot' | 'hit' | 'destroy' | 'alarm' | 'ui' | 'zoom') => {
  switch (sound) {
    case 'shoot': audioSystem.playShoot(); break;
    case 'hit': audioSystem.playHit(); break;
    case 'destroy': audioSystem.playDestroy(); break;
    case 'alarm': audioSystem.playAlarm(); break;
    case 'ui': audioSystem.playUI(); break;
    case 'zoom': audioSystem.playZoom(); break;
  }
};
