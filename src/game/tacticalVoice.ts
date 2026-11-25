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

export function speakTacticalCue(_cue: VoiceCue): void {
  // Voice synthesis completely silenced. Robotic browser TTS interrupted combat
  // and annoyed players. High-fidelity audio synthesizer SFX handle all tactical audio.
  return;
}
