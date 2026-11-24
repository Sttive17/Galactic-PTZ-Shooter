import type { RefObject } from 'react';
import * as THREE from 'three';
import type { EnemyArchetype } from '../../types/game';

const FIN_ANGLES = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
const SIX_ANGLES = Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3);
const TRI_ANGLES = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

export interface BossHullProps {
  isTargeted: boolean;
  isShielded: boolean;
  coreRef: RefObject<THREE.Mesh | null>;
  ring1Ref: RefObject<THREE.Mesh | null>;
  ring2Ref: RefObject<THREE.Mesh | null>;
  ring3Ref: RefObject<THREE.Mesh | null>;
}

const StrikerHull = ({ isTargeted, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#f43f5e';
  const accentColor = isTargeted ? '#fde047' : '#fb923c';
  return (
    <>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.4, 1]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.2 : 2.3}
          roughness={0.18}
          metalness={0.75}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <coneGeometry args={[0.48, 0.9, 6]} />
        <meshStandardMaterial color="#111827" metalness={0.85} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.56, 0, 0.08]} rotation={[0, -side * 0.34, side * 0.22]}>
          <mesh>
            <boxGeometry args={[0.72, 0.07, 0.32]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.28} />
          </mesh>
          <mesh position={[side * 0.32, -0.04, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.075, 0.38, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[side * 0.32, -0.04, 0.37]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={accentColor} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.66, 0.03, 10, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.8, 0.02, 8, 32]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </>
  );
};

const AegisHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#06b6d4';
  return (
    <>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.2 : 2.2}
          roughness={0.2}
          metalness={0.7}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.64, 0.58, 0.38, 6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.28} />
      </mesh>
      {FIN_ANGLES.map((angle, idx) => (
        <group key={idx} rotation={[0, angle, 0]}>
          <mesh position={[0.68, 0, 0]}>
            <boxGeometry args={[0.26, 0.42, 0.14]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0.82, 0, 0]}>
            <boxGeometry args={[0.05, 0.34, 0.16]} />
            <meshBasicMaterial color="#22d3ee" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {[-0.54, 0.54].map((xOff, idx) => (
        <group key={idx} position={[xOff, -0.24, 0.28]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.44, 10]} />
            <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.24]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshBasicMaterial color="#38bdf8" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.88, 0.036, 10, 36]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.98, 0.02, 8, 36]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      {isShielded && (
        <group>
          <mesh>
            <sphereGeometry args={[1.18, 24, 24]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.2, 2]} />
            <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.35} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      )}
    </>
  );
};

const StormHull = ({ isTargeted, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#a855f7';
  const cannonCross: [number, number, number][] = [
    [0, 0.72, 0.22],
    [0, -0.72, 0.22],
    [0.72, 0, 0.22],
    [-0.72, 0, 0.22],
  ];
  return (
    <>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.2 : 2.4}
          roughness={0.16}
          metalness={0.75}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[0.14, 0.56, 0.92]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.92, 0.14, 0.56]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.85} roughness={0.28} />
      </mesh>
      {cannonCross.map(([cx, cy, cz], idx) => (
        <group key={idx} position={[cx, cy, cz]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.48, 10]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.26]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshBasicMaterial color="#ec4899" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref} rotation={[0.45, 0, 0.3]}>
        <torusGeometry args={[0.84, 0.026, 8, 36]} />
        <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-0.45, 0, -0.3]}>
        <torusGeometry args={[0.96, 0.024, 8, 36]} />
        <meshStandardMaterial color="#f472b6" emissive="#ec4899" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
    </>
  );
};

// Tier 4: PHANTOM_BLINK — Emerald-Cyan diamond prism with 3 crystal blades & warp halo
const PhantomBossHull = ({ isTargeted, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#10b981';
  const accentColor = isTargeted ? '#fda4af' : '#2dd4bf';
  return (
    <>
      <mesh ref={coreRef} scale={[0.75, 1.35, 0.75]}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.3 : 2.5}
          roughness={0.14}
          metalness={0.7}
          toneMapped={false}
        />
      </mesh>
      {/* Translucent phase cloak shell */}
      <mesh>
        <octahedronGeometry args={[0.68, 1]} />
        <meshBasicMaterial color={accentColor} wireframe transparent opacity={0.38} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* 3 orbiting crystal blades */}
      {TRI_ANGLES.map((ang, i) => (
        <group key={i} rotation={[0, ang, 0]}>
          <mesh position={[0.76, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshPhysicalMaterial color="#0f172a" emissive={accentColor} emissiveIntensity={1.6} metalness={0.8} roughness={0.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.94, 0.024, 8, 36]} />
        <meshBasicMaterial color="#5eead4" toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[1.08, 0.018, 8, 36]} />
        <meshBasicMaterial color="#34d399" toneMapped={false} />
      </mesh>
    </>
  );
};

// Tier 5: ARTILLERY_FORTRESS — Massive molten-orange dreadnought saucer + 6 mortar barrels
const ArtilleryBossHull = ({ isTargeted, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#ea580c';
  const accentColor = isTargeted ? '#fde047' : '#fb923c';
  return (
    <>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.2 : 2.5}
          roughness={0.18}
          metalness={0.75}
          toneMapped={false}
        />
      </mesh>
      {/* Heavy armored dreadnought saucer hull */}
      <mesh>
        <cylinderGeometry args={[0.92, 0.72, 0.26, 12]} />
        <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.28} />
      </mesh>
      {/* 6 radial heavy mortar barrels */}
      {SIX_ANGLES.map((ang, idx) => (
        <group key={idx} rotation={[0, ang, 0]}>
          <mesh position={[0.78, 0.14, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.08, 0.11, 0.44, 8]} />
            <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0.88, 0.28, 0]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshBasicMaterial color={accentColor} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.98, 0.032, 8, 36]} />
        <meshStandardMaterial color={accentColor} emissive={coreColor} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.12, 0.022, 8, 36]} />
        <meshBasicMaterial color="#facc15" toneMapped={false} />
      </mesh>
    </>
  );
};

// Tier 6: HYBRID_SHIELD_BLINK — Cobalt-emerald twin-wing monolith + warp rings + cyan barrier
const HydraBossHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref, ring3Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#0ea5e9';
  return (
    <>
      <mesh ref={coreRef} scale={[0.8, 1.25, 0.8]}>
        <dodecahedronGeometry args={[0.42, 0]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.3 : 2.5}
          roughness={0.16}
          metalness={0.78}
          toneMapped={false}
        />
      </mesh>
      {/* Vertical cobalt monolith spine & angled twin wings */}
      <mesh>
        <boxGeometry args={[0.32, 1.15, 0.36]} />
        <meshStandardMaterial color="#0f172a" metalness={0.88} roughness={0.24} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.62, 0, 0]} rotation={[0, 0, side * 0.3]}>
          <mesh>
            <boxGeometry args={[0.68, 0.14, 0.42]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.28} />
          </mesh>
          <mesh position={[side * 0.3, 0, 0.24]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#34d399" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.88, 0.028, 8, 36]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.02, 0.024, 8, 36]} />
        <meshBasicMaterial color="#10b981" toneMapped={false} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.14, 0.018, 8, 36]} />
        <meshBasicMaterial color="#67e8f9" toneMapped={false} />
      </mesh>
      {isShielded && (
        <group>
          <mesh>
            <sphereGeometry args={[1.24, 24, 24]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.26, 2]} />
            <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.3} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      )}
    </>
  );
};

// Tier 7: HYBRID_STORM_ARTILLERY — Blazing magenta-gold 6-cannon vortex star + 3 plasma rings
const VortexBossHull = ({ isTargeted, coreRef, ring1Ref, ring2Ref, ring3Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#e879f9';
  return (
    <>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.4 : 2.6}
          roughness={0.14}
          metalness={0.78}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.76, 0.76, 0.24, 6]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.88} roughness={0.25} />
      </mesh>
      {/* 6 vortex cannon pods around perimeter */}
      {SIX_ANGLES.map((ang, i) => (
        <group key={i} rotation={[0, ang, 0]}>
          <mesh position={[0.78, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.1, 0.48, 8]} />
            <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0.78, 0, 0.46]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#facc15' : '#ec4899'} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref} rotation={[0.5, 0, 0.3]}>
        <torusGeometry args={[0.92, 0.028, 8, 36]} />
        <meshBasicMaterial color="#facc15" toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-0.5, 0.3, -0.3]}>
        <torusGeometry args={[1.06, 0.024, 8, 36]} />
        <meshBasicMaterial color="#e879f9" toneMapped={false} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, 0.6, 0.5]}>
        <torusGeometry args={[1.18, 0.02, 8, 36]} />
        <meshBasicMaterial color="#fb923c" toneMapped={false} />
      </mesh>
    </>
  );
};

// Tier 8: OMEGA_HYBRID — Colossal obsidian-gold-crimson celestial reactor
const OmegaHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref, ring3Ref }: BossHullProps) => {
  const coreColor = isTargeted ? '#ff3b5c' : '#facc15';
  const turrets: [number, number, number][] = [
    [-0.68, 0.42, 0.25],
    [0.68, 0.42, 0.25],
    [-0.68, -0.42, 0.25],
    [0.68, -0.42, 0.25],
  ];
  return (
    <>
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.46, 0]} />
        <meshPhysicalMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isTargeted ? 3.5 : 2.6}
          roughness={0.14}
          metalness={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.72, 0.72, 0.28, 8]} />
        <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.22} />
      </mesh>
      {FIN_ANGLES.map((angle, idx) => (
        <group key={idx} rotation={[0, angle, 0]}>
          <mesh position={[0.82, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.12, 0.42, 6]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {turrets.map(([tx, ty, tz], idx) => (
        <group key={idx} position={[tx, ty, tz]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 0.5, 10]} />
            <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.27]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshBasicMaterial color="#facc15" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.84, 0.032, 10, 40]} />
        <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={1.9} toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.98, 0.026, 8, 40]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.9} toneMapped={false} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.12, 0.024, 8, 40]} />
        <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      {isShielded && (
        <group>
          <mesh>
            <sphereGeometry args={[1.28, 24, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.3, 2]} />
            <meshBasicMaterial color="#facc15" wireframe transparent opacity={0.28} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      )}
    </>
  );
};

export const BossVisual = ({
  tier,
  ...props
}: BossHullProps & { tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }) => {
  switch (tier) {
    case 1: return <StrikerHull {...props} />;
    case 2: return <AegisHull {...props} />;
    case 3: return <StormHull {...props} />;
    case 4: return <PhantomBossHull {...props} />;
    case 5: return <ArtilleryBossHull {...props} />;
    case 6: return <HydraBossHull {...props} />;
    case 7: return <VortexBossHull {...props} />;
    case 8: return <OmegaHull {...props} />;
  }
};

export interface DroneVisualProps {
  archetype: EnemyArchetype;
  isTargeted: boolean;
  isDamaged: boolean;
  coreRef: RefObject<THREE.Mesh | null>;
  shieldRef: RefObject<THREE.Mesh | null>;
  ring1Ref: RefObject<THREE.Group | null>;
  ring2Ref: RefObject<THREE.Group | null>;
}

export const DroneVisual = ({
  archetype,
  isTargeted,
  isDamaged,
  coreRef,
  shieldRef,
  ring1Ref,
  ring2Ref,
}: DroneVisualProps) => {
  if (archetype === 'STRIKER') {
    const color = isTargeted ? '#ff3b5c' : '#f59e0b';
    const accent = isTargeted ? '#fda4af' : '#fbbf24';
    return (
      <>
        <mesh ref={coreRef}>
          <octahedronGeometry args={[0.28, 0]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.3} roughness={0.18} metalness={0.7} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.42, 0, 0]} rotation={[0, -side * 0.3, side * 0.2]}>
            <boxGeometry args={[0.45, 0.06, 0.24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.28} />
          </mesh>
        ))}
        <mesh position={[0, -0.18, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.07, 0.28, 8]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      </>
    );
  }

  if (archetype === 'FLANKER') {
    const color = isTargeted ? '#ff3b5c' : '#a855f7';
    const accent = isTargeted ? '#fda4af' : '#c084fc';
    return (
      <>
        <mesh ref={coreRef} scale={[0.7, 0.65, 1.35]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.5} roughness={0.14} metalness={0.75} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} rotation={[0.5, 0, 0.4]}>
          <mesh>
            <torusGeometry args={[0.52, 0.022, 8, 28]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
        <group ref={ring2Ref} rotation={[-0.5, 0, -0.4]}>
          <mesh>
            <torusGeometry args={[0.62, 0.018, 8, 28]} />
            <meshBasicMaterial color="#e879f9" toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  if (archetype === 'SNIPER') {
    const color = isTargeted ? '#ff3b5c' : '#fb7185';
    const railColor = isTargeted ? '#fde047' : '#38bdf8';
    return (
      <>
        <mesh ref={coreRef}>
          <octahedronGeometry args={[0.25, 1]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.5} roughness={0.15} metalness={0.75} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshBasicMaterial color={railColor} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.18, 0.72, 0.22]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.06, 0.92, 8]} />
          <meshBasicMaterial color={railColor} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref}>
          <mesh>
            <torusGeometry args={[0.46, 0.02, 8, 28]} />
            <meshBasicMaterial color={railColor} toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  if (archetype === 'TACTICIAN') {
    const color = isTargeted ? '#ff3b5c' : isDamaged ? '#fb7185' : '#ef4444';
    const accent = isTargeted ? '#fde047' : isDamaged ? '#fda4af' : '#facc15';
    return (
      <>
        <mesh ref={coreRef}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.6} roughness={0.15} metalness={0.8} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.25} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.38, 0.34, 0.26, 6]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.22} />
        </mesh>
        <group ref={ring1Ref}>
          {TRI_ANGLES.map((ang, i) => (
            <group key={i} rotation={[0, ang, 0]}>
              <mesh position={[0.52, 0, 0]}>
                <boxGeometry args={[0.14, 0.3, 0.1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
              </mesh>
              <mesh position={[0.6, 0, 0]}>
                <boxGeometry args={[0.04, 0.22, 0.12]} />
                <meshBasicMaterial color={accent} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
        <group ref={ring2Ref}>
          <mesh>
            <torusGeometry args={[0.64, 0.02, 8, 32]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  if (archetype === 'SWARMER') {
    const color = isTargeted ? '#ff3b5c' : '#a3e635';
    const accent = isTargeted ? '#fde047' : '#facc15';
    return (
      <>
        <mesh ref={coreRef}>
          <tetrahedronGeometry args={[0.34, 0]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.4} roughness={0.16} metalness={0.65} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.36, 14, 14]} />
          <meshBasicMaterial color={accent} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref}>
          {TRI_ANGLES.map((ang, i) => (
            <mesh key={i} rotation={[0, ang, 0]} position={[Math.cos(ang) * 0.42, 0, Math.sin(ang) * 0.42]}>
              <boxGeometry args={[0.34, 0.04, 0.09]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </>
    );
  }

  if (archetype === 'ARTILLERY') {
    const color = isTargeted ? '#ff3b5c' : '#ea580c';
    const accent = isTargeted ? '#fde047' : '#fb923c';
    return (
      <>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.3, 14, 14]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.4} roughness={0.2} metalness={0.75} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.58, 0.44, 0.2, 10]} />
          <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.28} />
        </mesh>
        {TRI_ANGLES.map((ang, i) => (
          <mesh
            key={i}
            position={[Math.cos(ang) * 0.34, 0.22, Math.sin(ang) * 0.34]}
            rotation={[0.35, -ang, 0]}
          >
            <cylinderGeometry args={[0.055, 0.07, 0.34, 8]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        ))}
        <group ref={ring1Ref}>
          <mesh>
            <torusGeometry args={[0.64, 0.022, 8, 28]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  if (archetype === 'PHANTOM_SNIPER') {
    const color = isTargeted ? '#ff3b5c' : '#14b8a6';
    const accent = isTargeted ? '#fde047' : '#e879f9';
    return (
      <>
        <mesh ref={coreRef} scale={[0.75, 1.3, 0.75]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.6} roughness={0.14} metalness={0.75} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <octahedronGeometry args={[0.52, 0]} />
          <meshBasicMaterial color={accent} wireframe transparent opacity={0.34} depthWrite={false} toneMapped={false} />
        </mesh>
        {[-0.22, 0.22].map((xOff, idx) => (
          <mesh key={idx} position={[xOff, 0, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.05, 0.88, 8]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        ))}
        <group ref={ring1Ref} rotation={[0.6, 0, 0.4]}>
          <mesh>
            <torusGeometry args={[0.56, 0.02, 8, 28]} />
            <meshBasicMaterial color="#2dd4bf" toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  if (archetype === 'JUGGERNAUT') {
    const color = isTargeted ? '#ff3b5c' : isDamaged ? '#fb7185' : '#dc2626';
    const accent = isTargeted ? '#fde047' : '#f97316';
    const cornerOffsets: [number, number][] = [
      [-0.48, 0.34],
      [0.48, 0.34],
      [-0.48, -0.34],
      [0.48, -0.34],
    ];
    return (
      <>
        <mesh ref={coreRef}>
          <dodecahedronGeometry args={[0.34, 0]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={2.6} roughness={0.16} metalness={0.85} toneMapped={false} />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.48, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.78, 0.62, 0.68]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.25} />
        </mesh>
        {cornerOffsets.map(([cx, cy], idx) => (
          <mesh key={idx} position={[cx, cy, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.42, 8]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        ))}
        <group ref={ring1Ref}>
          <mesh>
            <torusGeometry args={[0.68, 0.028, 8, 28]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
        <group ref={ring2Ref}>
          <mesh>
            <torusGeometry args={[0.78, 0.02, 8, 28]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  if (archetype === 'KAMIKAZE') {
    const color = isTargeted ? '#ff1e1e' : '#ff4400';
    const accent = isTargeted ? '#fde047' : '#ffaa00';
    return (
      <>
        {/* Forward Spear Core */}
        <mesh ref={coreRef} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.3, 0.75, 4]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={3.2}
            roughness={0.15}
            metalness={0.7}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={shieldRef}>
          <coneGeometry args={[0.42, 0.9, 4]} />
          <meshBasicMaterial color={accent} transparent opacity={0.25} wireframe depthWrite={false} toneMapped={false} />
        </mesh>
        {/* Swept-back Delta Wings */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.42, 0, -0.15]} rotation={[0, side * 0.45, 0]}>
            <mesh>
              <boxGeometry args={[0.55, 0.04, 0.28]} />
              <meshStandardMaterial color="#1f1f23" metalness={0.88} roughness={0.24} />
            </mesh>
            {/* Wingtip warning flare */}
            <mesh position={[side * 0.28, 0, -0.1]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Rear Overcharged Thrusters */}
        <group ref={ring1Ref} position={[0, 0, -0.38]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 0.3, 8]} />
            <meshStandardMaterial color="#09090b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.16, 0.45, 8]} />
            <meshBasicMaterial color="#ff3300" toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  if (archetype === 'HEALER') {
    const color = isTargeted ? '#ff3b5c' : '#10b981';
    const accent = isTargeted ? '#fde047' : '#34d399';
    return (
      <>
        {/* Soothing Bio-Nanite Core */}
        <mesh ref={coreRef}>
          <octahedronGeometry args={[0.32, 1]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.8}
            roughness={0.12}
            metalness={0.5}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={shieldRef}>
          <sphereGeometry args={[0.44, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
        {/* Support Chassis Ring */}
        <mesh>
          <torusGeometry args={[0.54, 0.035, 8, 32]} />
          <meshStandardMaterial color="#064e3b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Cross Emitters */}
        {FIN_ANGLES.map((ang, i) => (
          <group key={i} rotation={[0, ang, 0]}>
            <mesh position={[0.42, 0, 0]}>
              <boxGeometry args={[0.18, 0.08, 0.08]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0.52, 0, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Rotating Halo */}
        <group ref={ring1Ref}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.62, 0.018, 8, 32]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
        <group ref={ring2Ref}>
          <mesh rotation={[-Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.62, 0.018, 8, 32]} />
            <meshBasicMaterial color="#6ee7b7" toneMapped={false} />
          </mesh>
        </group>
      </>
    );
  }

  // Default: SCOUT (Neon Green orb)
  const finalColor = isTargeted ? '#ef4444' : '#39ff14';
  const emissiveAccent = isTargeted ? '#f87171' : '#4ade80';

  return (
    <>
      <mesh visible={false}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.3, 2]} />
        <meshPhysicalMaterial
          color={finalColor}
          emissive={finalColor}
          emissiveIntensity={isTargeted ? 2.8 : 2.3}
          roughness={0.16}
          metalness={0.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shieldRef}>
        <sphereGeometry args={[0.4, 20, 20]} />
        <meshBasicMaterial
          color={emissiveAccent}
          transparent
          opacity={isTargeted ? 0.34 : 0.28}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[0.48, 0.028, 8, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.48, 0.012, 8, 32]} />
          <meshStandardMaterial color={emissiveAccent} emissive={finalColor} emissiveIntensity={1.6} />
        </mesh>
      </group>
      <group ref={ring2Ref}>
        <mesh>
          <torusGeometry args={[0.62, 0.022, 8, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.62, 0.01, 8, 32]} />
          <meshStandardMaterial color={finalColor} emissive={finalColor} emissiveIntensity={1.2} />
        </mesh>
      </group>
      {FIN_ANGLES.map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0.44, 0, 0]}>
            <boxGeometry args={[0.24, 0.03, 0.1]} />
            <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[0.57, 0, 0]}>
            <boxGeometry args={[0.04, 0.036, 0.11]} />
            <meshStandardMaterial color={emissiveAccent} emissive={finalColor} emissiveIntensity={2.2} />
          </mesh>
        </group>
      ))}
    </>
  );
};
