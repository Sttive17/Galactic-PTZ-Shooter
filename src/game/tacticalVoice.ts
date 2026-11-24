import { useGameStore } from './gameState';

export type VoiceCue =
  | 'shield_critical'
  | 'boss_detected'
  | 'dash_ready'
  | 'critical_hit'
  | 'portal_ready'
  | 'round_victory'
  | 'drop_confirmed'
  | 'titan_detected'
  | 'titan_neutralized';

const CUE_PHRASES: Record<VoiceCue, string> = {
  shield_critical: 'Advertencia. Escudo colapsado.',
  boss_detected: 'Alerta. Amenaza de clase jefe detectada.',
  dash_ready: 'Propulsor táctico disponible.',
  critical_hit: 'Impacto en núcleo confirmado.',
  portal_ready: 'Sector despejado. Portal de evacuación activo.',
  round_victory: 'Amenazas neutralizadas.',
  drop_confirmed: 'Cápsula de despliegue en descenso. Listo para combate.',
  titan_detected: 'Alerta máxima. Titán hostil detectado.',
  titan_neutralized: 'Titán enemigo neutralizado. Sector asegurado.',
};

let lastSpeechTime = 0;

export function speakTacticalCue(cue: VoiceCue): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const prefs = useGameStore.getState().preferences;
  if (prefs && prefs.muted) return;

  const now = performance.now();
  if (now - lastSpeechTime < 3200) return; // Prevent audio overlap

  try {
    const text = CUE_PHRASES[cue];
    if (!text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.15;
    utterance.pitch = 1.1;
    utterance.volume = Math.min(1.0, (prefs?.masterVolume ?? 0.8) * 0.9);
    utterance.lang = 'es-ES';

    lastSpeechTime = now;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis unavailable or blocked
  }
}
