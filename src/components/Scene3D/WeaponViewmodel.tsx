import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/gameState';
import { SceneState } from '../../game/sceneState';
import type { PowerId } from '../../game/powers';

interface WeaponViewmodelProps {
  muzzleRef: RefObject<THREE.Mesh | null>;
  muzzleLightRef: RefObject<THREE.PointLight | null>;
}

export function getWeaponAccentHex(activePowers: Partial<Record<PowerId, number>>): string {
  if ((activePowers.HEAVY_DAMAGE || 0) > 0) return '#fb7185';
  if ((activePowers.CRITICAL_OPTICS || 0) > 0) return '#facc15';
  if ((activePowers.RICOCHET_ROUNDS || 0) > 0) return '#c084fc';
  if ((activePowers.PIERCING_SHOT || 0) > 0) return '#22d3ee';
  if ((activePowers.EMP_BLAST || 0) > 0) return '#60a5fa';
  if ((activePowers.SLOW_MO_DRONES || 0) > 0) return '#34d399';
  return '#22d3ee';
}

export const WeaponViewmodel = ({ muzzleRef, muzzleLightRef }: WeaponViewmodelProps) => {
  const activePowers = useGameStore((s) => s.activePowers);

  const rotaryLeftRef = useRef<THREE.Group>(null);
  const rotaryRightRef = useRef<THREE.Group>(null);
  const teslaLeftOrbRef = useRef<THREE.Mesh>(null);
  const teslaRightOrbRef = useRef<THREE.Mesh>(null);
  const haloRingRef = useRef<THREE.Group>(null);
  const magRef = useRef<THREE.Group>(null);

  const magStacks = activePowers.EXTENDED_MAG || 0;

  const hasTriple = (activePowers.TRIPLE_SHOT || 0) > 0;
  const hasRailgun = (activePowers.RAILGUN_SPEED || 0) > 0;
  const hasRapid = (activePowers.RAPID_FIRE || 0) > 0;
  const hasHeavy = (activePowers.HEAVY_DAMAGE || 0) > 0;
  const hasPiercing = (activePowers.PIERCING_SHOT || 0) > 0;
  const hasCrit = (activePowers.CRITICAL_OPTICS || 0) > 0;
  const hasEmp = (activePowers.EMP_BLAST || 0) > 0;
  const hasRicochet = (activePowers.RICOCHET_ROUNDS || 0) > 0;
  const hasBigHitbox = (activePowers.BIG_HITBOX || 0) > 0;
  const hasShield = (activePowers.VAMPIRIC_SHIELD || 0) > 0 || (activePowers.TITAN_ARMOR || 0) > 0;
  const hasCryo = (activePowers.SLOW_MO_DRONES || 0) > 0;
  const hasAlly = (activePowers.ALLY_DRONE || 0) > 0;
  const hasUtility =
    (activePowers.SCORE_BOOST || 0) > 0 ||
    (activePowers.TIME_SURGE || 0) > 0 ||
    (activePowers.JET_BOOTS || 0) > 0 ||
    (activePowers.TURBO_SPRINT || 0) > 0;

  let totalStacks = 0;
  for (const val of Object.values(activePowers)) {
    totalStacks += val || 0;
  }

  const isMk2 = totalStacks >= 2;
  const isMk3 = totalStacks >= 5;
  const isMk4 = totalStacks >= 8;

  const accentHex = getWeaponAccentHex(activePowers);
  const chassisTint = isMk3 ? '#1e293b' : isMk2 ? '#162032' : '#111827';
  const railMetal = isMk4 ? '#94a3b8' : isMk2 ? '#64748b' : '#374151';
  const shieldColor = (activePowers.VAMPIRIC_SHIELD || 0) > 0 ? '#34d399' : '#38bdf8';

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const firingBoost = SceneState.weaponRecoil > 0.05 ? 4.2 : 1.0;

    if (rotaryLeftRef.current) {
      rotaryLeftRef.current.rotation.z += dt * 4.5 * firingBoost;
    }
    if (rotaryRightRef.current) {
      rotaryRightRef.current.rotation.z -= dt * 4.5 * firingBoost;
    }

    if (teslaLeftOrbRef.current && teslaRightOrbRef.current) {
      const s = 1 + Math.sin(t * 11) * 0.25;
      teslaLeftOrbRef.current.scale.setScalar(s);
      teslaRightOrbRef.current.scale.setScalar(1 + Math.cos(t * 11) * 0.25);
    }

    if (haloRingRef.current) {
      haloRingRef.current.rotation.z += dt * 1.8;
      haloRingRef.current.rotation.y = Math.sin(t * 1.5) * 0.14;
    }

    if (magRef.current) {
      if (SceneState.isReloading) {
        const p = Math.max(0, Math.min(1, SceneState.reloadProgress));
        const drop = p < 0.5 ? p * 2 : (1 - p) * 2;
        magRef.current.position.y = -0.068 - drop * 0.16;
        magRef.current.rotation.x = drop * 0.25;
      } else {
        magRef.current.position.y = -0.068;
        magRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group>
      {/* Matte Gunmetal Main Chassis Receiver */}
      <mesh position={[0, -0.005, 0.04]}>
        <boxGeometry args={[0.084, 0.1, 0.44]} />
        <meshStandardMaterial color={chassisTint} metalness={0.68} roughness={0.35} />
      </mesh>

      {/* Sculpted Upper Shroud */}
      <mesh position={[0, 0.052, -0.06]}>
        <boxGeometry args={[0.066, 0.036, 0.38]} />
        <meshStandardMaterial color="#1f2937" metalness={0.68} roughness={0.32} />
      </mesh>

      {/* Angled Lower Foregrip */}
      <mesh position={[0, -0.075, -0.15]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[0.044, 0.085, 0.052]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Animated Modular Plasma Magazine Cell (50 -> 80 -> 120 -> 200) */}
      <group ref={magRef} position={[0, -0.068, 0.02]}>
        {magStacks === 0 && (
          <>
            <mesh>
              <boxGeometry args={[0.042, 0.09, 0.056]} />
              <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.01, 0.03]}>
              <boxGeometry args={[0.018, 0.055, 0.004]} />
              <meshBasicMaterial color={accentHex} toneMapped={false} />
            </mesh>
          </>
        )}
        {magStacks === 1 && (
          <>
            <mesh position={[0, -0.02, 0]}>
              <boxGeometry args={[0.046, 0.13, 0.062]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.26} />
            </mesh>
            {[-0.014, 0.014].map((mx, idx) => (
              <mesh key={`m1-${idx}`} position={[mx, -0.02, 0.032]}>
                <boxGeometry args={[0.008, 0.095, 0.005]} />
                <meshBasicMaterial color="#fbbf24" toneMapped={false} />
              </mesh>
            ))}
          </>
        )}
        {magStacks === 2 &&
          [-0.024, 0.024].map((mx, idx) => (
            <group key={`m2-${idx}`} position={[mx, -0.02, 0]}>
              <mesh>
                <boxGeometry args={[0.034, 0.125, 0.058]} />
                <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.24} />
              </mesh>
              <mesh position={[0, 0, 0.031]}>
                <boxGeometry args={[0.012, 0.095, 0.005]} />
                <meshBasicMaterial color={idx === 0 ? '#fbbf24' : '#22d3ee'} toneMapped={false} />
              </mesh>
            </group>
          ))}
        {magStacks >= 3 && (
          <group position={[0, -0.02, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.054, 0.054, 0.085, 14]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.22} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.057, 0.057, 0.02, 14]} />
              <meshBasicMaterial color="#fbbf24" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0.045]}>
              <torusGeometry args={[0.038, 0.0045, 8, 20]} />
              <meshBasicMaterial color={accentHex} toneMapped={false} />
            </mesh>
          </group>
        )}
      </group>

      {/* Ventilated Barrel Shroud */}
      <mesh position={[0, 0.015, -0.24]}>
        <boxGeometry args={[0.072, 0.068, 0.24]} />
        <meshStandardMaterial color={chassisTint} metalness={0.68} roughness={0.35} />
      </mesh>

      {/* 3 Glowing Side Heat-Sink Vents (Left & Right) */}
      {[-0.17, -0.23, -0.29].map((zPos, i) => (
        <group key={i}>
          <mesh position={[-0.038, 0.018, zPos]}>
            <boxGeometry args={[0.006, 0.022, 0.032]} />
            <meshStandardMaterial color={accentHex} emissive={accentHex} emissiveIntensity={2.6} />
          </mesh>
          <mesh position={[0.038, 0.018, zPos]}>
            <boxGeometry args={[0.006, 0.022, 0.032]} />
            <meshStandardMaterial color={accentHex} emissive={accentHex} emissiveIntensity={2.6} />
          </mesh>
        </group>
      ))}

      {/* Twin Cylindrical Magnetic Rails Flanking Glowing Plasma Core Tube */}
      <mesh position={[-0.024, 0.03, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.34, 12]} />
        <meshStandardMaterial color={railMetal} metalness={0.78} roughness={0.26} />
      </mesh>
      <mesh position={[0.024, 0.03, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.34, 12]} />
        <meshStandardMaterial color={railMetal} metalness={0.78} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0.03, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.34, 12]} />
        <meshStandardMaterial color={accentHex} emissive={accentHex} emissiveIntensity={3} />
      </mesh>

      {/* Muzzle Brake */}
      <mesh position={[0, 0.028, -0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.026, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.78} roughness={0.28} />
      </mesh>

      {/* Holographic Reflex Sight (Upgraded when CRITICAL_OPTICS active) */}
      <group position={[0, 0.095, 0.04]}>
        <mesh position={[0, -0.022, 0]}>
          <boxGeometry args={[0.048, 0.012, 0.068]} />
          <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.38} />
        </mesh>
        <mesh position={[-0.023, 0.002, 0]}>
          <boxGeometry args={[0.006, 0.042, 0.062]} />
          <meshStandardMaterial color="#111827" metalness={0.65} roughness={0.38} />
        </mesh>
        <mesh position={[0.023, 0.002, 0]}>
          <boxGeometry args={[0.006, 0.042, 0.062]} />
          <meshStandardMaterial color="#111827" metalness={0.65} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.022, 0]}>
          <boxGeometry args={[0.052, 0.006, 0.062]} />
          <meshStandardMaterial color="#111827" metalness={0.65} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.002, 0]}>
          <planeGeometry args={[0.038, 0.034]} />
          <meshBasicMaterial
            color={hasCrit ? '#facc15' : accentHex}
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.002, 0.001]}>
          <sphereGeometry args={[0.0025, 8, 8]} />
          <meshBasicMaterial color={hasCrit ? '#fde047' : '#67e8f9'} />
        </mesh>

        {/* CRITICAL_OPTICS Module: Dual-Ring Holo Sniper Optic + Golden Rangefinder */}
        {hasCrit && (
          <>
            <mesh position={[0, 0.002, -0.032]}>
              <torusGeometry args={[0.021, 0.0032, 8, 24]} />
              <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={2.0} />
            </mesh>
            <mesh position={[0, 0.024, -0.022]}>
              <boxGeometry args={[0.046, 0.005, 0.052]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.22} />
            </mesh>
            <group position={[-0.048, -0.038, -0.15]}>
              <mesh>
                <boxGeometry args={[0.018, 0.02, 0.085]} />
                <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, -0.045]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.008, 10]} />
                <meshBasicMaterial color="#fde047" toneMapped={false} />
              </mesh>
            </group>
          </>
        )}
      </group>

      {/* TRIPLE_SHOT: Twin Lateral Scatter-Cannon Sub-Barrels */}
      {hasTriple &&
        [-0.056, 0.056].map((sideX, idx) => (
          <group key={`triple-${idx}`} position={[sideX, 0.016, -0.31]}>
            <mesh position={[sideX > 0 ? -0.014 : 0.014, 0, 0.06]}>
              <boxGeometry args={[0.022, 0.02, 0.1]} />
              <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.013, 0.015, 0.28, 10]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.26} />
            </mesh>
            <mesh position={[0, 0, -0.145]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.028, 10]} />
              <meshBasicMaterial color={accentHex} toneMapped={false} />
            </mesh>
          </group>
        ))}

      {/* RAILGUN_SPEED: Extended Forward Rail Prongs + 3 Accelerator Coil Rings */}
      {hasRailgun && (
        <group>
          {[-0.026, 0.026].map((rx, idx) => (
            <mesh key={`rail-ext-${idx}`} position={[rx, 0.032, -0.52]}>
              <boxGeometry args={[0.008, 0.012, 0.26]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.18} />
            </mesh>
          ))}
          {[-0.36, -0.44, -0.52].map((rz, idx) => (
            <mesh key={`coil-${idx}`} position={[0, 0.03, rz]}>
              <torusGeometry args={[0.031, 0.004, 8, 20]} />
              <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={2.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* RAPID_FIRE: Twin Side-Mounted Spinning Rotary Overdrive Cooling Drums */}
      {hasRapid && (
        <>
          {[-0.058, 0.058].map((rx, idx) => (
            <group
              key={`rotary-${idx}`}
              ref={idx === 0 ? rotaryLeftRef : rotaryRightRef}
              position={[rx, 0.002, -0.05]}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.14, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.03, 8]} />
                <meshBasicMaterial color="#fbbf24" toneMapped={false} />
              </mesh>
              {[0, Math.PI * 0.5].map((rot, fIdx) => (
                <mesh key={fIdx} rotation={[0, 0, rot]}>
                  <boxGeometry args={[0.052, 0.006, 0.11]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
        </>
      )}

      {/* HEAVY_DAMAGE: Heavy Armored Antimatter Muzzle Shroud + Glowing Reactor Core */}
      {hasHeavy && (
        <group>
          {[-0.03, 0.03].map((hx, idx) => (
            <mesh key={`heavy-side-${idx}`} position={[hx, 0.024, -0.44]}>
              <boxGeometry args={[0.014, 0.044, 0.18]} />
              <meshStandardMaterial color="#1f2937" metalness={0.82} roughness={0.28} />
            </mesh>
          ))}
          <mesh position={[0, -0.002, -0.44]}>
            <boxGeometry args={[0.068, 0.014, 0.17]} />
            <meshStandardMaterial color="#111827" metalness={0.82} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.072, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.14, 12]} />
            <meshStandardMaterial color="#fb7185" emissive="#f43f5e" emissiveIntensity={3.2} />
          </mesh>
        </group>
      )}

      {/* PIERCING_SHOT: Under-Barrel Crystalline Laser-Lance Emitter Prong */}
      {hasPiercing && (
        <group position={[0, -0.028, -0.46]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.014, 0.24, 4]} />
            <meshStandardMaterial
              color="#67e8f9"
              emissive="#22d3ee"
              emissiveIntensity={2.8}
              metalness={0.4}
              roughness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.012, 0.07]}>
            <boxGeometry args={[0.024, 0.018, 0.11]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.28} />
          </mesh>
        </group>
      )}

      {/* EMP_BLAST: Twin Upper-Receiver Tesla Arc Coils with Pulsing Spheres */}
      {hasEmp &&
        [-0.034, 0.034].map((tx, idx) => (
          <group key={`tesla-${idx}`} position={[tx, 0.072, -0.22]}>
            <mesh>
              <cylinderGeometry args={[0.008, 0.011, 0.036, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh ref={idx === 0 ? teslaLeftOrbRef : teslaRightOrbRef} position={[0, 0.022, 0]}>
              <sphereGeometry args={[0.011, 10, 10]} />
              <meshBasicMaterial color="#60a5fa" toneMapped={false} />
            </mesh>
          </group>
        ))}

      {/* RICOCHET_ROUNDS: 4 Angled Neon-Violet Prism Deflector Fins around Muzzle */}
      {hasRicochet && (
        <group position={[0, 0.028, -0.52]}>
          {[Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].map((ang, idx) => (
            <group key={`ric-${idx}`} rotation={[0, 0, ang]}>
              <mesh position={[0, 0.033, 0]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.006, 0.024, 0.06]} />
                <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2.6} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* BIG_HITBOX: Expanded Wide-Bore Translucent Plasma Containment Chamber */}
      {hasBigHitbox && (
        <mesh position={[0, 0.028, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.044, 0.044, 0.24, 16, 1, true]} />
          <meshBasicMaterial
            color={accentHex}
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* VAMPIRIC_SHIELD / TITAN_ARMOR: Left-Flank Holographic Forearm Shield Projector */}
      {hasShield && (
        <group position={[-0.088, -0.008, -0.02]} rotation={[0, -0.22, 0]}>
          <mesh position={[0.025, 0, 0]}>
            <boxGeometry args={[0.04, 0.014, 0.028]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.28} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.062, 0.062, 0.004, 6]} />
            <meshBasicMaterial
              color={shieldColor}
              transparent
              opacity={0.26}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.062, 0.0035, 6, 6]} />
            <meshBasicMaterial color={shieldColor} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* SLOW_MO_DRONES: Right-Side Glowing Cryo-Coolant Canister */}
      {hasCryo && (
        <group position={[0.056, -0.01, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.013, 0.013, 0.17, 10]} />
            <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[0, 0.086, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.02, 10]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.28} />
          </mesh>
          <mesh position={[0, -0.086, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.02, 10]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.28} />
          </mesh>
        </group>
      )}

      {/* ALLY_DRONE: Tactical Drone-Link Antenna Beacon on Right Upper Receiver Rail */}
      {hasAlly && (
        <group position={[0.044, 0.068, 0.06]}>
          <mesh>
            <boxGeometry args={[0.016, 0.014, 0.036]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.026, 0]}>
            <cylinderGeometry args={[0.003, 0.004, 0.044, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.052, 0]}>
            <sphereGeometry args={[0.007, 10, 10]} />
            <meshBasicMaterial color="#34d399" toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* UTILITY POWERS (SCORE_BOOST / TIME_SURGE / JET_BOOTS / TURBO_SPRINT): Rear Telemetry Fins */}
      {hasUtility && (
        <group position={[0, 0.042, 0.2]}>
          {[-0.036, 0.036].map((fx, idx) => (
            <group key={`fin-${idx}`} position={[fx, 0, 0]} rotation={[0, 0, idx === 0 ? 0.35 : -0.35]}>
              <mesh>
                <boxGeometry args={[0.006, 0.044, 0.08]} />
                <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.018, 0.01]}>
                <boxGeometry args={[0.008, 0.006, 0.064]} />
                <meshBasicMaterial color={accentHex} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* MK-II Tier Upgrade (2+ total stacks): Sleek Titanium Upper Trim Rails */}
      {isMk2 &&
        [-0.036, 0.036].map((tx, idx) => (
          <mesh key={`mk2-${idx}`} position={[tx, 0.068, -0.06]}>
            <boxGeometry args={[0.008, 0.01, 0.34]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.18} />
          </mesh>
        ))}

      {/* MK-III Tier Upgrade (5+ total stacks): Glowing Side Energy Radiator Wings */}
      {isMk3 &&
        [-0.066, 0.066].map((wx, idx) => (
          <group key={`mk3-${idx}`} position={[wx, 0.036, -0.22]} rotation={[0, 0, idx === 0 ? 0.28 : -0.28]}>
            <mesh>
              <boxGeometry args={[0.036, 0.006, 0.14]} />
              <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.24} />
            </mesh>
            <mesh position={[idx === 0 ? -0.014 : 0.014, 0, 0]}>
              <boxGeometry args={[0.006, 0.008, 0.12]} />
              <meshBasicMaterial color={accentHex} toneMapped={false} />
            </mesh>
          </group>
        ))}

      {/* MK-IV Tier Upgrade (8+ total stacks): Orbiting Holographic Barrel Halo Ring */}
      {isMk4 && (
        <group ref={haloRingRef} position={[0, 0.028, -0.4]}>
          <mesh>
            <torusGeometry args={[0.064, 0.0038, 8, 28]} />
            <meshBasicMaterial
              color={accentHex}
              transparent
              opacity={0.82}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {/* Muzzle Flash + Dynamic Point Light (exact barrel tip preserved) */}
      <mesh ref={muzzleRef} position={[0, 0.028, -0.58]} visible={false}>
        <octahedronGeometry args={[0.068, 0]} />
        <meshBasicMaterial color={accentHex} transparent opacity={0.92} toneMapped={false} />
      </mesh>
      <pointLight ref={muzzleLightRef} position={[0, 0.03, -0.62]} color={accentHex} intensity={0} distance={8} decay={2} />
    </group>
  );
};
