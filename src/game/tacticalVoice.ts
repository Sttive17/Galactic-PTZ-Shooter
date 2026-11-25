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
  | 'titan_neutralized'
  | 'autolock_active'
  | 'emp_ready'
  | 'overdrive_ready';

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
  autolock_active: 'Sistema Smart-Lock enlazado. Autoapuntado y disparo autónomo activos.',
  emp_ready: 'Pulso electromagnético cargado y listo.',
  overdrive_ready: 'Sistema de sobrecarga frenesí disponible.',
};

let lastSpeechTime = 0;

export function speakTacticalCue(_cue: VoiceCue): void {
  // Voice synthesis completely silenced. Robotic browser TTS interrupted combat
  // and annoyed players. High-fidelity audio synthesizer SFX handle all tactical audio.
  return;
}
