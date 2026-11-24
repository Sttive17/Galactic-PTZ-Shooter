import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/gameState';
import { SceneState } from '../../game/sceneState';
import { playSound } from '../../game/AudioSystem';
import type { PowerId } from '../../game/powers';
import type { WeaponArchetype } from '../../types/game';

interface WeaponViewmodelProps {
  muzzleRef: RefObject<THREE.Mesh | null>;
  muzzleLightRef: RefObject<THREE.PointLight | null>;
}

export function getWeaponAccentHex(activePowers: Partial<Record<PowerId, number>>): string {
  if ((activePowers.SMART_AUTOLOCK || 0) > 0) return '#06b6d4';
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
  const selectedWeapon = useGameStore((s) => s.selectedWeapon);

  const rootGroupRef = useRef<THREE.Group>(null);
  const rotaryLeftRef = useRef<THREE.Group>(null);
  const rotaryRightRef = useRef<THREE.Group>(null);
  const teslaLeftOrbRef = useRef<THREE.Mesh>(null);
  const teslaRightOrbRef = useRef<THREE.Mesh>(null);
  const haloRingRef = useRef<THREE.Group>(null);
  const magRef = useRef<THREE.Group>(null);
  const ventMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const railgunCoilRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Smooth Weapon Swap State
  const [displayedWeapon, setDisplayedWeapon] = useState<WeaponArchetype>(selectedWeapon);
  const swapPhaseRef = useRef<'IDLE' | 'LOWERING' | 'RAISING'>('IDLE');
  const swapProgressRef = useRef<number>(1);
  const targetWeaponRef = useRef<WeaponArchetype>(selectedWeapon);
  const heatLevelRef = useRef<number>(0);

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
  const hasAutoLock = (activePowers.SMART_AUTOLOCK || 0) > 0;
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

    // Detect weapon switch request and animate lower-and-raise
    if (selectedWeapon !== targetWeaponRef.current) {
      targetWeaponRef.current = selectedWeapon;
      swapPhaseRef.current = 'LOWERING';
    }

    if (swapPhaseRef.current === 'LOWERING') {
      swapProgressRef.current = Math.max(0, swapProgressRef.current - dt * 8.5);
      if (swapProgressRef.current <= 0) {
        setDisplayedWeapon(targetWeaponRef.current);
        swapPhaseRef.current = 'RAISING';
        playSound('ui');
      }
    } else if (swapPhaseRef.current === 'RAISING') {
      swapProgressRef.current = Math.min(1, swapProgressRef.current + dt * 7.5);
      if (swapProgressRef.current >= 1) {
        swapPhaseRef.current = 'IDLE';
      }
    }

    if (rootGroupRef.current) {
      const dip = 1 - swapProgressRef.current;
      rootGroupRef.current.position.y = -dip * 0.22;
      rootGroupRef.current.rotation.x = -dip * 0.38;
    }

    // Dynamic Overheat & Thermal Vent Dissipation
    if (SceneState.weaponRecoil > 0.05) {
      heatLevelRef.current = Math.min(1, heatLevelRef.current + dt * 1.8);
    } else {
      heatLevelRef.current = Math.max(0, heatLevelRef.current - dt * 0.55);
    }

    const heat = heatLevelRef.current;
    if (ventMatRef.current) {
      if (heat > 0.05) {
        ventMatRef.current.emissive.setRGB(1.0, 0.22 + (1 - heat) * 0.45, (1 - heat) * 0.85);
        ventMatRef.current.emissiveIntensity = 2.2 + heat * 4.2;
      } else {
        ventMatRef.current.emissive.set(accentHex);
        ventMatRef.current.emissiveIntensity = 2.4;
      }
    }

    // Dynamic barrel muzzle tip position matching current archetype
    if (muzzleRef.current) {
      muzzleRef.current.position.z =
        displayedWeapon === 'HEAVY_RAILGUN' ? -0.66 : displayedWeapon === 'SCATTER_SHOTGUN' ? -0.48 : -0.58;
    }
    if (muzzleLightRef.current) {
      muzzleLightRef.current.position.z =
        displayedWeapon === 'HEAVY_RAILGUN' ? -0.7 : displayedWeapon === 'SCATTER_SHOTGUN' ? -0.52 : -0.62;
    }

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

    // Railgun pulse induction coils
    for (let i = 0; i < railgunCoilRefs.current.length; i++) {
      const coil = railgunCoilRefs.current[i];
      if (!coil) continue;
      const coilPulse = Math.sin(t * 9 + i * 1.4) * 0.5 + 0.5;
      const mat = coil.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.45 + coilPulse * 0.55;
      }
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
    <group ref={rootGroupRef}>
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

      {/* Animated Modular Plasma Magazine Cell */}
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

      {/* 3 Side Heat-Sink Vents with Dynamic Thermal Glow & Overheat (Left & Right) */}
      {[-0.17, -0.23, -0.29].map((zPos, i) => (
        <group key={i}>
          <mesh position={[-0.038, 0.018, zPos]}>
            <boxGeometry args={[0.006, 0.022, 0.032]} />
            <meshStandardMaterial
              ref={i === 0 ? ventMatRef : undefined}
              color={accentHex}
              emissive={accentHex}
              emissiveIntensity={2.6}
            />
          </mesh>
          <mesh position={[0.038, 0.018, zPos]}>
            <boxGeometry args={[0.006, 0.022, 0.032]} />
            <meshStandardMaterial color={accentHex} emissive={accentHex} emissiveIntensity={2.6} />
          </mesh>
        </group>
      ))}

      {/* ========================================================= */}
      {/* ARCHETYPE: PLASMA RIFLE (Balanced Precision Energy Carbine) */}
      {/* ========================================================= */}
      {displayedWeapon === 'PLASMA_RIFLE' && (
        <group>
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
        </group>
      )}

      {/* ========================================================= */}
      {/* ARCHETYPE: SCATTER SHOTGUN (Heavy Wide-Bore Flak Cannon)   */}
      {/* ========================================================= */}
      {displayedWeapon === 'SCATTER_SHOTGUN' && (
        <group>
          {/* Heavy Triangular Clustered Triple Barrels */}
          {[
            [-0.022, 0.042, -0.34],
            [0.022, 0.042, -0.34],
            [0, 0.016, -0.34],
          ].map((bPos, idx) => (
            <mesh key={`shotgun-barrel-${idx}`} position={bPos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.018, 0.28, 12]} />
              <meshStandardMaterial color={railMetal} metalness={0.82} roughness={0.22} />
            </mesh>
          ))}
          {/* Flared Muzzle Spreader Choke */}
          <mesh position={[0, 0.03, -0.46]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.044, 0.032, 0.06, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.88} roughness={0.2} />
          </mesh>
          {/* Heavy Ribbed Pump Fore-End */}
          <mesh position={[0, -0.045, -0.22]}>
            <boxGeometry args={[0.068, 0.052, 0.16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.4} />
          </mesh>
          {/* Side Heavy Flak Shell Magazine Tube */}
          <mesh position={[0.042, 0.02, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.22, 10]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.8} />
          </mesh>
        </group>
      )}

      {/* ========================================================= */}
      {/* ARCHETYPE: HEAVY RAILGUN (High-Voltage Hyper-Velocity Lance) */}
      {/* ========================================================= */}
      {displayedWeapon === 'HEAVY_RAILGUN' && (
        <group>
          {/* Extended Monolithic Accelerator Shroud */}
          <mesh position={[0, 0.028, -0.42]}>
            <boxGeometry args={[0.064, 0.064, 0.44]} />
            <meshStandardMaterial color={chassisTint} metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Central Hyper-Core Energy Conduit */}
          <mesh position={[0, 0.028, -0.44]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.48, 14]} />
            <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={3.5} />
          </mesh>
          {/* 4 Sequential Magnetic Accelerator Coil Rings */}
          {[-0.26, -0.34, -0.42, -0.5].map((zPos, idx) => (
            <mesh
              key={`coil-${idx}`}
              ref={(el) => {
                railgunCoilRefs.current[idx] = el;
              }}
              position={[0, 0.028, zPos]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[0.042, 0.0055, 8, 20]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} toneMapped={false} />
            </mesh>
          ))}
          {/* Dual Flanking Capacitor Banks */}
          {[-0.044, 0.044].map((cx, idx) => (
            <mesh key={`cap-${idx}`} position={[cx, 0.028, -0.22]}>
              <boxGeometry args={[0.018, 0.042, 0.16]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={2.0} />
            </mesh>
          ))}
          {/* Elongated Muzzle Accelerator Barrel */}
          <mesh position={[0, 0.028, -0.64]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.024, 0.028, 0.06, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.18} />
          </mesh>
        </group>
      )}

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
        {/* Holographic Aim Reticle Screen */}
        <mesh position={[0, 0.002, 0]}>
          <planeGeometry args={[0.04, 0.038]} />
          <meshBasicMaterial
            color={accentHex}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        {hasCrit && (
          <mesh position={[0, 0.002, 0.001]}>
            <ringGeometry args={[0.008, 0.012, 16]} />
            <meshBasicMaterial color="#facc15" toneMapped={false} />
          </mesh>
        )}
      </group>

      {/* Power Visual Enhancements */}
      {/* TRIPLE_SHOT: Flanking Outrigger Energy Pods */}
      {hasTriple && (
        <group>
          {[-0.068, 0.068].map((sideX, idx) => (
            <group key={`triple-${idx}`} position={[sideX, 0.028, -0.28]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.014, 0.014, 0.22, 10]} />
                <meshStandardMaterial color={railMetal} metalness={0.75} roughness={0.28} />
              </mesh>
              <mesh position={[0, 0, -0.11]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.016, 0.016, 0.025, 10]} />
                <meshStandardMaterial color={accentHex} emissive={accentHex} emissiveIntensity={2.5} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* RAILGUN_SPEED: Top-Mounted Heavy Accelerator Rail */}
      {hasRailgun && (
        <group position={[0, 0.068, -0.28]}>
          <mesh>
            <boxGeometry args={[0.024, 0.018, 0.32]} />
            <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.01, 0.004, 0.3]} />
            <meshBasicMaterial color="#38bdf8" toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* RAPID_FIRE: Twin Whirring Rotary Barrel Gatling Cages */}
      {hasRapid && (
        <group position={[0, 0.028, -0.32]}>
          <group ref={rotaryLeftRef} position={[-0.048, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
          <group ref={rotaryRightRef} position={[0.048, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        </group>
      )}

      {/* HEAVY_DAMAGE: Massive Reinforced Underbarrel Shroud */}
      {hasHeavy && (
        <mesh position={[0, -0.042, -0.26]}>
          <boxGeometry args={[0.082, 0.045, 0.28]} />
          <meshStandardMaterial color="#7f1d1d" metalness={0.7} roughness={0.3} />
        </mesh>
      )}

      {/* PIERCING_SHOT: Sharp Lance-Like Prongs on Left & Right Barrel Sides */}
      {hasPiercing && (
        <group>
          {[-0.038, 0.038].map((px, idx) => (
            <mesh key={`pierce-${idx}`} position={[px, 0.028, -0.48]} rotation={[Math.PI / 2, 0, idx === 0 ? 0.2 : -0.2]}>
              <coneGeometry args={[0.008, 0.14, 6]} />
              <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={2.5} />
            </mesh>
          ))}
        </group>
      )}

      {/* EMP_BLAST: Twin Pulsing Tesla Orbs on Rear Stock */}
      {hasEmp && (
        <group position={[0, 0.06, 0.14]}>
          <mesh ref={teslaLeftOrbRef} position={[-0.042, 0, 0]}>
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshBasicMaterial color="#60a5fa" toneMapped={false} />
          </mesh>
          <mesh ref={teslaRightOrbRef} position={[0.042, 0, 0]}>
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshBasicMaterial color="#60a5fa" toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* RICOCHET_ROUNDS: Prismatic Crystal Optics Node under Sight */}
      {hasRicochet && (
        <mesh position={[0, 0.068, -0.02]}>
          <octahedronGeometry args={[0.022, 0]} />
          <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={3} roughness={0.1} />
        </mesh>
      )}

      {/* BIG_HITBOX: Flared Heavy Muzzle Compensator */}
      {hasBigHitbox && (
        <mesh position={[0, 0.028, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.024, 0.08, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.24} />
        </mesh>
      )}

      {/* VAMPIRIC_SHIELD / TITAN_ARMOR: Hexagonal Energy Shield Emitter */}
      {hasShield && (
        <group position={[0, 0.01, 0.18]} rotation={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
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

      {/* SMART_AUTOLOCK: Cybernetic AI Smart-Lock Optics Module & Forward Targeting Laser */}
      {hasAutoLock && (
        <group position={[-0.046, 0.072, 0.02]}>
          <mesh>
            <boxGeometry args={[0.024, 0.022, 0.08]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.014, 0.01]}>
            <boxGeometry args={[0.014, 0.008, 0.05]} />
            <meshBasicMaterial color="#06b6d4" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.042]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.008, 0.012, 10]} />
            <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={3.2} />
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