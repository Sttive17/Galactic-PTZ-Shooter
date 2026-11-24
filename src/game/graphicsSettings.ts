// Hardware Detection and Graphics Quality Pipeline
// Prevents GPU driver timeout (TDR) and PC freezes on lower-end/integrated GPUs

export type GraphicsPreset = 'LOW' | 'MEDIUM' | 'HIGH' | 'CUSTOM';

export interface GraphicsConfig {
  preset: GraphicsPreset;
  dpr: number;
  shadows: boolean;
  shadowMapSize: 512 | 1024;
  environmentReflections: boolean;
  complexShaders: boolean;
  starCount: number;
  dustCount: number;
  antialias: boolean;
  brightness: number; // 0.5 to 1.5 (default 1.0)
}

export interface HardwareInfo {
  gpu: string;
  vendor: string;
  isLowEnd: boolean;
  recommended: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
  cores?: number;
  deviceMemory?: number;
  maxTextureSize?: number;
  devicePixelRatio?: number;
}

export const GRAPHICS_PRESETS: Record<GraphicsPreset, GraphicsConfig> = {
  LOW: {
    preset: 'LOW',
    dpr: 0.9,
    shadows: false,
    shadowMapSize: 512,
    environmentReflections: false,
    complexShaders: false,
    starCount: 650,
    dustCount: 50,
    antialias: false,
    brightness: 1.0,
  },
  MEDIUM: {
    preset: 'MEDIUM',
    dpr: 1.0,
    shadows: true,
    shadowMapSize: 512,
    environmentReflections: false,
    complexShaders: true,
    starCount: 1400,
    dustCount: 180,
    antialias: true,
    brightness: 1.0,
  },
  HIGH: {
    preset: 'HIGH',
    dpr: 1.0,
    shadows: true,
    shadowMapSize: 1024,
    environmentReflections: true,
    complexShaders: true,
    starCount: 2200,
    dustCount: 380,
    antialias: true,
    brightness: 1.0,
  },
  CUSTOM: {
    preset: 'CUSTOM',
    dpr: 1.0,
    shadows: true,
    shadowMapSize: 512,
    environmentReflections: false,
    complexShaders: true,
    starCount: 1400,
    dustCount: 180,
    antialias: true,
    brightness: 1.0,
  },
};

export function resolveGraphicsPreset(config: Partial<GraphicsConfig>): GraphicsPreset {
  const candidates: Array<'LOW' | 'MEDIUM' | 'HIGH'> = ['LOW', 'MEDIUM', 'HIGH'];
  for (const key of candidates) {
    const target = GRAPHICS_PRESETS[key];
    const dprMatch =
      typeof config.dpr === 'number' && Math.abs(config.dpr - target.dpr) < 0.001;
    if (
      dprMatch &&
      config.shadows === target.shadows &&
      config.shadowMapSize === target.shadowMapSize &&
      config.environmentReflections === target.environmentReflections &&
      config.complexShaders === target.complexShaders &&
      config.starCount === target.starCount &&
      config.dustCount === target.dustCount
    ) {
      return key;
    }
  }
  return 'CUSTOM';
}

const STORAGE_KEY = 'scifi_fps_graphics_v1';

export function detectHardware(): HardwareInfo {
  let gpu = 'Desconocida';
  let vendor = 'Desconocido';
  let isLowEnd = false;
  let recommended: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let hasWebGL = false;
  let maxTextureSize = 0;

  let canvas: HTMLCanvasElement | null = null;
  let gl: WebGLRenderingContext | null = null;

  try {
    if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      gl =
        (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

      if (gl) {
        hasWebGL = true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
          vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
        }
        if (!gpu) {
          gpu = String(gl.getParameter(gl.RENDERER) || 'Genérica');
        }
        if (!vendor) {
          vendor = String(gl.getParameter(gl.VENDOR) || 'Genérico');
        }
        const rawMaxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        if (typeof rawMaxTex === 'number' && Number.isFinite(rawMaxTex) && rawMaxTex > 0) {
          maxTextureSize = rawMaxTex;
        }
      }
    }
  } catch {
    // Canvas context error fallback
  } finally {
    if (gl) {
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        // Ignore context release error
      }
    }
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  const gpuLower = gpu.toLowerCase();
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const rawDeviceMemory =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
      : undefined;
  const deviceMemory =
    typeof rawDeviceMemory === 'number' && Number.isFinite(rawDeviceMemory) && rawDeviceMemory > 0
      ? rawDeviceMemory
      : undefined;
  const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const devicePixelRatio =
    typeof rawDpr === 'number' && Number.isFinite(rawDpr) && rawDpr > 0 ? rawDpr : 1;

  // Integrated, software, or weak GPU patterns (excluding 'direct3d' which matches ANGLE dedicated GPUs on Windows)
  const integratedMatches = [
    'intel',
    'uhd',
    'hd graphics',
    'iris',
    'mali',
    'adreno',
    'powervr',
    'basic render',
    'microsoft basic',
    'warp',
    'llvmpipe',
    'swrast',
    'softpipe',
    'software',
    'swiftshader',
    'subzero',
    'mesa',
    'vega 3',
    'vega 6',
    'vega 7',
    'vega 8',
    'radeon(tm) graphics',
    'radeon graphics',
  ];

  const dedicatedHighMatches = [
    'rtx 30',
    'rtx 40',
    'rtx 50',
    'rx 67',
    'rx 68',
    'rx 69',
    'rx 77',
    'rx 78',
    'rx 79',
    'apple m1 pro',
    'apple m1 max',
    'apple m2 pro',
    'apple m2 max',
    'apple m3',
    'apple m4',
  ];

  const isExplicitIntegrated = integratedMatches.some((token) => gpuLower.includes(token));
  const isDedicatedHigh = dedicatedHighMatches.some((token) => gpuLower.includes(token));

  if (
    !hasWebGL ||
    isExplicitIntegrated ||
    cores <= 4 ||
    (deviceMemory !== undefined && deviceMemory <= 4) ||
    (maxTextureSize > 0 && maxTextureSize <= 4096)
  ) {
    isLowEnd = true;
    recommended = 'LOW';
  } else if (
    isDedicatedHigh &&
    cores >= 8 &&
    (deviceMemory === undefined || deviceMemory >= 8) &&
    (maxTextureSize === 0 || maxTextureSize >= 16384) &&
    devicePixelRatio <= 2.5
  ) {
    isLowEnd = false;
    recommended = 'HIGH';
  } else if (
    devicePixelRatio >= 2 &&
    !isDedicatedHigh &&
    deviceMemory !== undefined &&
    deviceMemory <= 6
  ) {
    isLowEnd = true;
    recommended = 'LOW';
  } else {
    // Mid tier (GTX 1060/1650, RTX 2060, Radeon 580/5500, etc.)
    isLowEnd = false;
    recommended = 'MEDIUM';
  }

  const details = isLowEnd
    ? `${gpu} (Detectado como gráficos integrados o recursos moderados -> Modo Rendimiento)`
    : `${gpu} (Detectado hardware dedicado -> Modo ${recommended === 'HIGH' ? 'Alta Calidad' : 'Equilibrado'})`;

  return {
    gpu,
    vendor,
    isLowEnd,
    recommended,
    details,
    cores,
    deviceMemory,
    maxTextureSize,
    devicePixelRatio,
  };
}

export function loadSavedGraphicsConfig(): GraphicsConfig {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GraphicsConfig>;
        if (parsed && typeof parsed === 'object') {
          const basePreset: GraphicsPreset =
            parsed.preset && parsed.preset in GRAPHICS_PRESETS ? parsed.preset : 'LOW';
          const base = GRAPHICS_PRESETS[basePreset];
          const rawDpr =
            typeof parsed.dpr === 'number' && Number.isFinite(parsed.dpr) ? parsed.dpr : base.dpr;
          const rawShadowSize =
            typeof parsed.shadowMapSize === 'number' && Number.isFinite(parsed.shadowMapSize)
              ? parsed.shadowMapSize
              : base.shadowMapSize;
          const rawBrightness =
            typeof parsed.brightness === 'number' && Number.isFinite(parsed.brightness)
              ? parsed.brightness
              : 1.0;

          const merged: GraphicsConfig = {
            ...base,
            ...parsed,
            // Guarantee safety limits even if corrupted in storage
            dpr: Math.min(1.2, Math.max(0.75, rawDpr)),
            shadowMapSize: rawShadowSize >= 1024 ? 1024 : 512,
            brightness: Math.min(1.5, Math.max(0.5, rawBrightness)),
          };
          merged.preset = resolveGraphicsPreset(merged);
          return merged;
        }
      }
    }
  } catch {
    // Ignore storage parsing issues
  }

  // First time running: auto detect hardware and set recommended preset safely!
  const hw = detectHardware();
  const initial = { ...GRAPHICS_PRESETS[hw.recommended] };
  saveGraphicsConfig(initial);
  return initial;
}

export function saveGraphicsConfig(config: GraphicsConfig) {
  try {
    if (typeof localStorage === 'undefined') return;
    const normalized: GraphicsConfig = {
      ...config,
      preset: resolveGraphicsPreset(config),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore storage quota/security errors
  }
}
