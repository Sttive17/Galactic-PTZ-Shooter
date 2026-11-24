import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../game/gameState';
import { initAudio, playSound } from '../../game/AudioSystem';
import { resolveGraphicsPreset } from '../../game/graphicsSettings';
import type { GraphicsConfig, GraphicsPreset } from '../../game/graphicsSettings';
import {
  Monitor,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Cpu,
  CheckCircle2,
  Sun,
  ShieldAlert,
  Eye,
  Music,
} from 'lucide-react';

interface SettingsPanelProps {
  onClose?: () => void;
  showResumeButton?: boolean;
  onAbort?: () => void;
  isOpen?: boolean;
}

export const SettingsPanel = ({
  onClose,
  showResumeButton = false,
  onAbort,
  isOpen = true,
}: SettingsPanelProps) => {
  const settings = useGameStore((state) => state.settings);
  const preferences = useGameStore((state) => state.preferences);
  const setSensitivity = useGameStore((state) => state.setSensitivity);
  const updatePreferences = useGameStore((state) => state.updatePreferences);
  const setAudioVolumes = useGameStore((state) => state.setAudioVolumes);
  const setMuted = useGameStore((state) => state.setMuted);
  const setGraphicsPreset = useGameStore((state) => state.setGraphicsPreset);
  const setGraphicsConfig = useGameStore((state) => state.setGraphicsConfig);
  const setBrightness = useGameStore((state) => state.setBrightness);
  const autoDetectAndApplyGraphics = useGameStore(
    (state) => state.autoDetectAndApplyGraphics
  );

  const [activeTab, setActiveTab] = useState<'GRAPHICS' | 'DISPLAY' | 'AUDIO_CONTROLS'>('GRAPHICS');
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [autoDetectNotice, setAutoDetectNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!onClose || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.code === 'Escape') && !e.repeat) {
        e.preventDefault();
        e.stopImmediatePropagation();
        playSound('ui');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose, isOpen]);

  const applyGraphicsPatch = (patch: Partial<GraphicsConfig>) => {
    const next = { ...settings.graphics, ...patch };
    setGraphicsConfig({
      ...patch,
      preset: resolveGraphicsPreset(next),
    });
  };

  const handleMasterVolumeChange = (val: number) => {
    initAudio();
    setAudioVolumes({ masterVolume: val });
    if (preferences.muted && val > 0) {
      setMuted(false);
    }
  };

  const handleMusicVolumeChange = (val: number) => {
    initAudio();
    setAudioVolumes({ musicVolume: val });
  };

  const handleSfxVolumeChange = (val: number) => {
    initAudio();
    setAudioVolumes({ sfxVolume: val });
  };

  const handleToggleMute = () => {
    initAudio();
    const nextMuted = !preferences.muted;
    setMuted(nextMuted);
    if (!nextMuted) playSound('ui');
  };

  const toggleFullscreen = async () => {
    playSound('ui');
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignorar rechazo de permisos de fullscreen
    }
  };

  const handleAutoDetect = () => {
    playSound('ui');
    const hw = autoDetectAndApplyGraphics();
    setAutoDetectNotice(
      `Hardware analizado: ${hw.gpu} · Asignado Modo ${
        hw.recommended === 'LOW'
          ? 'Rendimiento (Bajo)'
          : hw.recommended === 'MEDIUM'
            ? 'Equilibrado (Medio)'
            : 'Alta Calidad'
      }`
    );
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setAutoDetectNotice(null);
      noticeTimerRef.current = null;
    }, 6000);
  };

  const activePreset = resolveGraphicsPreset(settings.graphics);
  const currentBrightness = settings.graphics.brightness ?? 1.0;
  const currentSensitivity = preferences.sensitivity ?? settings.sensitivity;
  const currentDpr = settings.graphics.dpr ?? 1.0;

  return (
    <div className="flex flex-col w-full max-w-xl max-h-[90vh] bg-slate-900/95 border border-cyan-500/40 rounded-xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] text-slate-100 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-lg font-orbitron font-bold text-white tracking-wider">
              CENTRO DE CONFIGURACIÓN
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Ajusta gráficos, rendimiento y controles a tu gusto
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => {
              playSound('ui');
              onClose();
            }}
            className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 rounded border border-slate-700 transition-colors cursor-pointer"
          >
            ESC / CERRAR
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 my-3.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => {
            playSound('ui');
            setActiveTab('GRAPHICS');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-orbitron font-semibold tracking-wider transition-all cursor-pointer ${
            activeTab === 'GRAPHICS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu size={14} /> GRÁFICOS
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('ui');
            setActiveTab('DISPLAY');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-orbitron font-semibold tracking-wider transition-all cursor-pointer ${
            activeTab === 'DISPLAY'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Monitor size={14} /> PANTALLA & BRILLO
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('ui');
            setActiveTab('AUDIO_CONTROLS');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-orbitron font-semibold tracking-wider transition-all cursor-pointer ${
            activeTab === 'AUDIO_CONTROLS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 size={14} /> AUDIO & CONTROL
        </button>
      </div>

      {/* Auto-detect notification toast */}
      {autoDetectNotice && (
        <div className="mb-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-fadeIn shrink-0">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{autoDetectNotice}</span>
        </div>
      )}

      {/* Scrollable Tab Body */}
      <div className="overflow-y-auto pr-1 flex-1 min-h-0">
        {/* Tab 1: GRAPHICS */}
        {activeTab === 'GRAPHICS' && (
          <div className="space-y-3.5 text-xs font-mono pb-1">
            {/* Quick Auto-Detect Button */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-orbitron font-bold text-cyan-300 tracking-wide flex items-center gap-2">
                    <Sparkles size={15} className="text-cyan-400" />
                    AJUSTE AUTOMÁTICO SEGÚN TU PC
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Detecta tu tarjeta de video, memoria y CPU para dar máxima fluidez.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-black rounded-lg text-xs tracking-wider transition-all shadow-[0_0_16px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                >
                  ⚡ ACOMODAR A MI PC
                </button>
              </div>
            </div>

            {/* Preset Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Perfil de Calidad Gráfica
                </label>
                {activePreset === 'CUSTOM' && (
                  <span
                    data-testid="custom-preset-badge"
                    className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-400/50 text-amber-300 text-[10px] font-orbitron font-bold tracking-wider"
                  >
                    PERSONALIZADO (CUSTOM)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as Array<Exclude<GraphicsPreset, 'CUSTOM'>>).map(
                  (preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        playSound('ui');
                        setGraphicsPreset(preset);
                      }}
                      className={`py-2.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                        activePreset === preset
                          ? 'border-cyan-400 bg-cyan-950/60 text-white font-bold shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-orbitron text-xs">
                        {preset === 'LOW'
                          ? 'BAJO'
                          : preset === 'MEDIUM'
                            ? 'MEDIO'
                            : 'ALTO'}
                      </div>
                      <div className="text-[9px] mt-0.5 text-slate-400 font-sans">
                        {preset === 'LOW'
                          ? 'Rendimiento Seguro'
                          : preset === 'MEDIUM'
                            ? 'Equilibrado'
                            : 'Visual Completo'}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Granular Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {/* Resolution Scale (DPR) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded bg-slate-950/40 border border-slate-800/80">
                <div>
                  <span className="text-white font-medium">Escala de Resolución (DPR)</span>
                  <p className="text-[10px] text-slate-400">
                    Menor escala mejora FPS en pantallas de alta densidad.
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {[0.75, 0.9, 1.0, 1.2].map((scale) => {
                    const active = Math.abs(currentDpr - scale) < 0.01;
                    return (
                      <button
                        type="button"
                        key={scale}
                        onClick={() => {
                          playSound('ui');
                          applyGraphicsPatch({ dpr: scale });
                        }}
                        className={`px-2 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                          active
                            ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {scale.toFixed(scale === 0.75 ? 2 : 1)}x
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Environment Reflections */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-800/80">
                <div>
                  <span className="text-white font-medium">Reflejos Ambientales</span>
                  <p className="text-[10px] text-slate-400">
                    Iluminación IBL metálica sobre estructuras y naves.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('ui');
                    applyGraphicsPatch({
                      environmentReflections: !settings.graphics.environmentReflections,
                    });
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                    settings.graphics.environmentReflections
                      ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {settings.graphics.environmentReflections ? 'ACTIVADOS' : 'DESACTIVADOS'}
                </button>
              </div>

              {/* Real-time Shadows */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-800/80">
                <div>
                  <span className="text-white font-medium">Sombras en Tiempo Real</span>
                  <p className="text-[10px] text-slate-400">
                    Desactivarlas aumenta enormemente los FPS en gráficos integrados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('ui');
                    applyGraphicsPatch({ shadows: !settings.graphics.shadows });
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                    settings.graphics.shadows
                      ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {settings.graphics.shadows ? 'ACTIVADAS' : 'DESACTIVADAS'}
                </button>
              </div>

              {/* Shadow Map Resolution */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-800/80">
                <div className={settings.graphics.shadows ? '' : 'opacity-65'}>
                  <span className="text-white font-medium">Resolución de Sombras</span>
                  <p className="text-[10px] text-slate-400">
                    Nitidez del mapa de sombras ({settings.graphics.shadows ? 'activo' : 'requiere sombras'}).
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {([512, 1024] as const).map((size) => {
                    const active = settings.graphics.shadowMapSize === size;
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => {
                          playSound('ui');
                          applyGraphicsPatch({ shadowMapSize: size });
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                          active
                            ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200'
                        } ${!settings.graphics.shadows ? 'opacity-70' : ''}`}
                      >
                        {size}px
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complex Shaders */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-800/80">
                <div>
                  <span className="text-white font-medium">Shaders de Nebulosa y Auroras</span>
                  <p className="text-[10px] text-slate-400">
                    Efectos cósmicos complejos en el fondo del espacio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('ui');
                    applyGraphicsPatch({
                      complexShaders: !settings.graphics.complexShaders,
                    });
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                    settings.graphics.complexShaders
                      ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {settings.graphics.complexShaders ? 'ACTIVADOS' : 'DESACTIVADOS'}
                </button>
              </div>

              {/* Dust Particles */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-800/80">
                <div>
                  <span className="text-white font-medium">Partículas de Polvo y Clima</span>
                  <p className="text-[10px] text-slate-400">
                    Densidad de partículas ambientales en la atmósfera.
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {[
                    { label: 'BAJO', count: 50 },
                    { label: 'MEDIO', count: 180 },
                    { label: 'ALTO', count: 380 },
                  ].map((opt) => {
                    const active = settings.graphics.dustCount === opt.count;
                    return (
                      <button
                        type="button"
                        key={opt.count}
                        onClick={() => {
                          playSound('ui');
                          applyGraphicsPatch({ dustCount: opt.count });
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                          active
                            ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: DISPLAY & BRIGHTNESS */}
        {activeTab === 'DISPLAY' && (
          <div className="space-y-4 text-xs font-mono py-1">
            {/* Brightness Slider */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-cyan-400 font-bold tracking-wider flex items-center gap-2">
                  <Sun size={15} />
                  BRILLO DEL ENTORNO
                </label>
                <span className="text-sm font-orbitron text-white">
                  {Math.round(currentBrightness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={currentBrightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 appearance-none rounded-full outline-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>Oscuro (50%)</span>
                <span>Predeterminado (100%)</span>
                <span>Brillante (150%)</span>
              </div>
            </div>

            {/* FOV Slider */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-cyan-400 font-bold tracking-wider flex items-center gap-2">
                  <Eye size={15} />
                  CAMPO DE VISIÓN (FOV)
                </label>
                <span className="text-sm font-orbitron text-white">
                  {preferences.fov}°
                </span>
              </div>
              <input
                type="range"
                min="55"
                max="90"
                step="1"
                value={preferences.fov}
                onChange={(e) =>
                  updatePreferences({ fov: parseInt(e.target.value, 10) })
                }
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 appearance-none rounded-full outline-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>Cerrado (55°)</span>
                <span>Estándar (68°)</span>
                <span>Amplio (90°)</span>
              </div>
            </div>

            {/* Display Mode / Fullscreen */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-white font-medium text-xs block font-orbitron">
                  MODO DE PANTALLA
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isFullscreen
                    ? 'Actualmente en Pantalla Completa (máxima inmersión)'
                    : 'Actualmente en Modo Ventana del Navegador'}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-4 py-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/50 text-xs font-orbitron font-bold flex items-center gap-2 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 size={14} /> MODO VENTANA
                  </>
                ) : (
                  <>
                    <Maximize2 size={14} /> PANTALLA COMPLETA
                  </>
                )}
              </button>
            </div>

            {/* HUD Toggles: Show FPS & HUD Effects */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div>
                  <span className="text-white font-medium">Mostrar Contador FPS</span>
                  <p className="text-[10px] text-slate-400">
                    Muestra el rendimiento en tiempo real en la esquina superior.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('ui');
                    updatePreferences({ showFps: !preferences.showFps });
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                    preferences.showFps
                      ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {preferences.showFps ? 'ACTIVADO' : 'DESACTIVADO'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div>
                  <span className="text-white font-medium">Efectos de HUD / Scanlines</span>
                  <p className="text-[10px] text-slate-400">
                    Capas visuales de visor táctico y viñeta cinematográfica.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('ui');
                    updatePreferences({ hudEffects: !preferences.hudEffects });
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                    preferences.hudEffects
                      ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {preferences.hudEffects ? 'ACTIVADOS' : 'DESACTIVADOS'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/30 text-amber-200/90 text-[11px] flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-400 shrink-0" />
              <span>
                Consejo: Si notas tirones de FPS, mantén la resolución nativa y el modo Pantalla Completa para que el navegador optimice el renderizado WebGL.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: AUDIO & CONTROLS */}
        {activeTab === 'AUDIO_CONTROLS' && (
          <div className="space-y-4 text-xs font-mono py-1">
            {/* Audio Volumes */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-4">
              {/* Master Volume + Mute */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-cyan-400 font-bold tracking-wider flex items-center gap-2">
                    {preferences.muted ? (
                      <VolumeX size={15} className="text-red-400" />
                    ) : (
                      <Volume2 size={15} />
                    )}
                    VOLUMEN PRINCIPAL
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-orbitron text-white">
                      {preferences.muted
                        ? 'MUTE'
                        : `${Math.round(preferences.masterVolume * 100)}%`}
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className={`px-2 py-0.5 text-[10px] font-bold border rounded transition-colors cursor-pointer ${
                        preferences.muted
                          ? 'border-red-500/60 bg-red-950/40 text-red-400'
                          : 'border-cyan-700/60 bg-cyan-950/40 text-cyan-400'
                      }`}
                    >
                      {preferences.muted ? 'ACTIVAR' : 'SILENCIAR'}
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.muted ? 0 : preferences.masterVolume}
                  onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 appearance-none rounded-full outline-none cursor-pointer"
                />
              </div>

              {/* Music Volume */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-cyan-300 font-bold tracking-wider flex items-center gap-2">
                    <Music size={14} />
                    VOLUMEN DE MÚSICA / AMBIENTACIÓN
                  </label>
                  <span className="text-sm font-orbitron text-white">
                    {Math.round(preferences.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.musicVolume}
                  onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 appearance-none rounded-full outline-none cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-cyan-300 font-bold tracking-wider flex items-center gap-2">
                    <Volume2 size={14} />
                    VOLUMEN DE EFECTOS (SFX)
                  </label>
                  <span className="text-sm font-orbitron text-white">
                    {Math.round(preferences.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.sfxVolume}
                  onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 appearance-none rounded-full outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Sensitivity */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-cyan-400 font-bold tracking-wider">
                  SENSIBILIDAD DE CÁMARA (PTZ / RATÓN / XBOX)
                </label>
                <span className="text-sm font-orbitron text-white">
                  {currentSensitivity.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={currentSensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 appearance-none rounded-full outline-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Lenta (0.1x)</span>
                <span>Media (1.0x)</span>
                <span>Rápida (3.0x)</span>
              </div>
            </div>

            {/* Invert Y & Camera Shake */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div>
                  <span className="text-white font-medium">Invertir Eje Y</span>
                  <p className="text-[10px] text-slate-400">
                    Invierte el movimiento vertical del ratón y el stick derecho Xbox.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('ui');
                    updatePreferences({ invertY: !preferences.invertY });
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                    preferences.invertY
                      ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {preferences.invertY ? 'ACTIVADO' : 'DESACTIVADO'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div>
                  <span className="text-white font-medium">Vibración de Cámara</span>
                  <p className="text-[10px] text-slate-400">
                    Temblor de pantalla por disparos, impactos y portales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('ui');
                    updatePreferences({ cameraShake: !preferences.cameraShake });
                  }}
                  className={`px-3 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                    preferences.cameraShake
                      ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {preferences.cameraShake ? 'ACTIVADA' : 'DESACTIVADA'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons (Resume / Abort in Pause Mode) */}
      {showResumeButton && (
        <div className="flex gap-3 pt-4 mt-2 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSound('ui');
              const canvas = document.querySelector('canvas');
              if (canvas?.requestPointerLock) {
                Promise.resolve(canvas.requestPointerLock()).catch(() => {});
              }
              if (onClose) onClose();
            }}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-black text-xs tracking-widest rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] cursor-pointer"
          >
            REANUDAR MISIÓN
          </button>

          {onAbort && (
            <button
              type="button"
              onClick={() => {
                playSound('ui');
                onAbort();
              }}
              className="px-5 py-3 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white font-orbitron font-bold text-xs tracking-wider rounded-lg border border-red-900 hover:border-red-500 transition-all cursor-pointer"
            >
              ABORTAR
            </button>
          )}
        </div>
      )}
    </div>
  );
};
