import { useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { EnemyArchetype } from '../../types/game';
import { usePreloadedModel } from '../../game/modelLoader';
import type { ModelKey } from '../../game/modelLoader';

const ModelCraft = ({
  modelKey,
  scale = 1.0,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
}: {
  modelKey: ModelKey;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
}) => {
  const model = usePreloadedModel(modelKey);
  if (!model) return null;
  const isDrone = modelKey === 'DRONE_GUNNER' || modelKey === 'DRONE_SCOUT';
  const isHeavyUnit = modelKey === 'ROBOT_WALKER' || modelKey === 'HEAVY_CYBORG';

  return (
    <group scale={scale} rotation={rotation} position={position}>
      <primitive object={model} />
      {isDrone && (
        <>
          {/* Targeting lens and twin engine glow make the small GLB silhouettes readable at range. */}
          <mesh position={[0, 0.06, -0.62]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#fb7185" toneMapped={false} />
          </mesh>
          {[-0.28, 0.28].map((x) => (
            <mesh key={x} position={[x, -0.12, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.08, 0.36, 8]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.82} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}
      {isHeavyUnit && (
        <>
          {/* Heavy silhouettes receive a powered spine and shoulder warning lamps. */}
          <mesh position={[0, 0.6, 0.12]}>
            <boxGeometry args={[0.07, 0.52, 0.05]} />
            <meshBasicMaterial color="#f59e0b" toneMapped={false} />
          </mesh>
          {[-0.32, 0.32].map((x) => (
            <mesh key={x} position={[x, 0.72, -0.08]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#ef4444" toneMapped={false} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

const BOSS_RIGS = {
  1: { color: '#38bdf8', accent: '#fbbf24', radius: 2.25, batteries: 2 },
  2: { color: '#22d3ee', accent: '#a855f7', radius: 2.5, batteries: 3 },
  3: { color: '#f59e0b', accent: '#fb7185', radius: 2.6, batteries: 4 },
  4: { color: '#a855f7', accent: '#67e8f9', radius: 2.15, batteries: 2 },
  5: { color: '#f97316', accent: '#facc15', radius: 2.7, batteries: 4 },
  6: { color: '#c084fc', accent: '#22d3ee', radius: 2.75, batteries: 3 },
  7: { color: '#fb7185', accent: '#f59e0b', radius: 2.9, batteries: 4 },
  8: { color: '#f43f5e', accent: '#facc15', radius: 3.15, batteries: 4 },
} as const;

/** Visible weak-core and weapon silhouette shared by every boss family. */
const BossThreatRig = ({
  tier,
  isTargeted,
  isShielded,
}: {
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  isTargeted: boolean;
  isShielded: boolean;
}) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const config = BOSS_RIGS[tier];

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const pulse = 1 + Math.sin(clock.elapsedTime * (isTargeted ? 10 : 4)) * 0.09;
    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y += dt * 1.8;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x += dt * 1.25;
      innerRingRef.current.rotation.z -= dt * 0.8;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y -= dt * 0.95;
      outerRingRef.current.rotation.x += dt * 0.45;
    }
  });

  return (
    <group position={[0, 1.25, 0]}>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.43, 1]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={isTargeted ? 5.5 : 3.2}
          metalness={0.7}
          roughness={0.18}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.74, 0.045, 8, 24]} />
        <meshBasicMaterial color={config.accent} toneMapped={false} />
      </mesh>
      <mesh ref={outerRingRef} rotation={[0.65, 0, 0.3]}>
        <torusGeometry args={[1.05, 0.026, 8, 28]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.78} toneMapped={false} />
      </mesh>

      {Array.from({ length: config.batteries }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const row = Math.floor(index / 2);
        return (
          <group key={index} position={[side * (1.35 + row * 0.26), 0.9 + row * 0.45, -0.15]} rotation={[0, side * 0.32, 0]}>
            <mesh>
              <boxGeometry args={[0.5, 0.36, 1.15]} />
              <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.23} />
            </mesh>
            <mesh position={[0, 0, -0.59]}>
              <circleGeometry args={[0.13, 12]} />
              <meshBasicMaterial color={config.accent} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {isShielded && (
        <mesh scale={[1, 0.76, 1]}>
          <sphereGeometry args={[config.radius, 22, 16]} />
          <meshBasicMaterial
            color={config.color}
            wireframe
            transparent
            opacity={0.16}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
};

export interface BossHullProps {
  isTargeted: boolean;
  isShielded: boolean;
  coreRef: RefObject<THREE.Mesh | null>;
  ring1Ref: RefObject<THREE.Mesh | null>;
  ring2Ref: RefObject<THREE.Mesh | null>;
  ring3Ref?: RefObject<THREE.Mesh | null>;
}

// Boss Tier 1: CENTINELA ALFA (Colossal Mecha Quadruped Titan)
const StrikerHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="BOSS_MECHA_TITAN" scale={0.9} rotation={[0, Math.PI, 0]} position={[0, -0.4, 0]} />
      {/* Target & Raycast Reference Core (transparent anchor) */}
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />

      {/* Dynamic Shield & Threat Aura */}
      {isShielded && (
        <mesh>
          <sphereGeometry args={[3.2, 18, 18]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 2.8, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

// Boss Tier 2: TITÁN AEGIS (Armored Behemoth Fortress)
const AegisHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="BOSS_BEHEMOTH" scale={0.9} rotation={[0, Math.PI, 0]} position={[0, -0.45, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />

      {isShielded && (
        <mesh>
          <sphereGeometry args={[3.4, 20, 20]} />
          <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.38} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 3.0, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

// Boss Tier 3: LEVIATÁN TORMENTA
const StormHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="BOSS_MECHA_TITAN" scale={1.0} rotation={[0, Math.PI, 0]} position={[0, -0.4, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />
      {isShielded && (
        <mesh>
          <sphereGeometry args={[3.5, 18, 18]} />
          <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 3.2, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

// Boss Tier 4: ESPECTRO FASE
const PhantomBossHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="ROBOT_WALKER" scale={2.8} rotation={[0, Math.PI, 0]} position={[0, -0.4, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />
      {isShielded && (
        <mesh>
          <sphereGeometry args={[3.2, 18, 18]} />
          <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 3.2, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

// Boss Tier 5: ACORAZADO ARTILLERO
const ArtilleryBossHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="HEAVY_CYBORG" scale={3.2} rotation={[0, Math.PI, 0]} position={[0, -0.5, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />
      {isShielded && (
        <mesh>
          <sphereGeometry args={[3.6, 18, 18]} />
          <meshBasicMaterial color="#ea580c" wireframe transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 3.4, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

// Boss Tier 6: HIDRA FASE-ESCUDO
const HydraBossHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref, ring3Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="BOSS_BEHEMOTH" scale={1.05} rotation={[0, Math.PI, 0]} position={[0, -0.5, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />
      {ring3Ref && <mesh ref={ring3Ref} visible={false} />}
      {isShielded && (
        <mesh>
          <sphereGeometry args={[3.6, 20, 20]} />
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 3.4, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

// Boss Tier 7: VÓRTICE ESTELAR
const VortexBossHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref, ring3Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="BOSS_MECHA_TITAN" scale={1.1} rotation={[0, Math.PI, 0]} position={[0, -0.5, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />
      {ring3Ref && <mesh ref={ring3Ref} visible={false} />}
      {isShielded && (
        <mesh>
          <sphereGeometry args={[3.8, 20, 20]} />
          <meshBasicMaterial color="#c084fc" wireframe transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 3.6, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

// Boss Tier 8: NÚCLEO OMEGA
const OmegaHull = ({ isTargeted, isShielded, coreRef, ring1Ref, ring2Ref, ring3Ref }: BossHullProps) => {
  return (
    <>
      <ModelCraft modelKey="BOSS_MECHA_TITAN" scale={1.2} rotation={[0, Math.PI, 0]} position={[0, -0.5, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <mesh ref={ring1Ref} visible={false} />
      <mesh ref={ring2Ref} visible={false} />
      {ring3Ref && <mesh ref={ring3Ref} visible={false} />}
      {isShielded && (
        <mesh>
          <sphereGeometry args={[4.0, 22, 22]} />
          <meshBasicMaterial color="#f43f5e" wireframe transparent opacity={0.38} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {isTargeted && (
        <mesh position={[0, 3.8, 0]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

export const BossVisual = ({
  tier,
  ...props
}: BossHullProps & { tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }) => {
  let hull: React.ReactNode;
  switch (tier) {
    case 1:
      hull = <StrikerHull {...props} />;
      break;
    case 2:
      hull = <AegisHull {...props} />;
      break;
    case 3:
      hull = <StormHull {...props} />;
      break;
    case 4:
      hull = <PhantomBossHull {...props} />;
      break;
    case 5:
      hull = <ArtilleryBossHull {...props} />;
      break;
    case 6:
      hull = <HydraBossHull {...props} />;
      break;
    case 7:
      hull = <VortexBossHull {...props} />;
      break;
    case 8:
      hull = <OmegaHull {...props} />;
      break;
    default:
      hull = <StrikerHull {...props} />;
  }

  return (
    <>
      {hull}
      <BossThreatRig tier={tier} isTargeted={props.isTargeted} isShielded={props.isShielded} />
    </>
  );
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
  // STRIKER: Rapid Plasma Gunner Drone
  if (archetype === 'STRIKER') {
    return (
      <>
        <ModelCraft modelKey="DRONE_GUNNER" scale={1.8} rotation={[0, Math.PI, 0]} position={[0, -0.06, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.05, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#f59e0b'} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.25, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // FLANKER: Fast Interceptor Craft
  if (archetype === 'FLANKER') {
    return (
      <>
        <ModelCraft modelKey="FIGHTER_INTERCEPTOR" scale={1.5} rotation={[0, Math.PI, 0]} position={[0, -0.06, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.1, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#a855f7'} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.25, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // SNIPER: Long-range Precision Mech Walker
  if (archetype === 'SNIPER') {
    return (
      <>
        <ModelCraft modelKey="ROBOT_WALKER" scale={1.8} rotation={[0, Math.PI, 0]} position={[0, -0.1, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.05, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#fb7185'} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.3, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // TACTICIAN: Heavy Commander Gunner Drone
  if (archetype === 'TACTICIAN') {
    return (
      <>
        <ModelCraft modelKey="DRONE_GUNNER" scale={1.9} rotation={[0, Math.PI, 0]} position={[0, -0.06, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.15, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#ef4444'} transparent opacity={0.26} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.3, 0]}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // SWARMER: High-speed Recon Scout Drone
  if (archetype === 'SWARMER') {
    return (
      <>
        <ModelCraft modelKey="DRONE_SCOUT" scale={1.3} rotation={[0, Math.PI, 0]} position={[0, -0.04, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[0.9, 14, 14]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#a3e635'} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
      </>
    );
  }

  // ARTILLERY: Heavy Cyborg Titan
  if (archetype === 'ARTILLERY') {
    return (
      <>
        <ModelCraft modelKey="HEAVY_CYBORG" scale={2.2} rotation={[0, Math.PI, 0]} position={[0, -0.08, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.25, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#ea580c'} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.4, 0]}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // PHANTOM_SNIPER: Cloaked Precision Walker
  if (archetype === 'PHANTOM_SNIPER') {
    return (
      <>
        <ModelCraft modelKey="ROBOT_WALKER" scale={1.9} rotation={[0, Math.PI, 0]} position={[0, -0.06, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.1, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#14b8a6'} transparent opacity={0.25} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.35, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // JUGGERNAUT: Armored Combat Cyborg
  if (archetype === 'JUGGERNAUT') {
    return (
      <>
        <ModelCraft modelKey="HEAVY_CYBORG" scale={2.1} rotation={[0, Math.PI, 0]} position={[0, -0.08, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.25, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#dc2626'} transparent opacity={0.26} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.4, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // KAMIKAZE: High-speed Aggressive Drone
  if (archetype === 'KAMIKAZE') {
    return (
      <>
        <ModelCraft modelKey="DRONE_SCOUT" scale={1.6} rotation={[0, Math.PI, 0]} position={[0, -0.05, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff1e1e' : '#ff4400'} transparent opacity={0.25} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.2, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#ff1e1e" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // HEALER: Support Drone
  if (archetype === 'HEALER') {
    return (
      <>
        <ModelCraft modelKey="DRONE_SCOUT" scale={1.7} rotation={[0, Math.PI, 0]} position={[0, -0.05, 0]} />
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
        </mesh>
        <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
          <sphereGeometry args={[1.05, 16, 16]} />
          <meshBasicMaterial color={isTargeted ? '#ff3b5c' : '#10b981'} transparent opacity={0.24} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={ring1Ref} />
        <group ref={ring2Ref} />
        {isTargeted && (
          <mesh position={[0, 1.25, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
          </mesh>
        )}
      </>
    );
  }

  // Default: SCOUT (Primary Sci-Fi Stylized Recon Drone with glowing central eye)
  return (
    <>
      <ModelCraft modelKey="DRONE_SCOUT" scale={1.8} rotation={[0, Math.PI, 0]} position={[0, -0.06, 0]} />
      <mesh ref={coreRef} visible={false}>
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>
      <mesh ref={shieldRef} visible={isTargeted || isDamaged}>
        <sphereGeometry args={[1.05, 16, 16]} />
        <meshBasicMaterial
          color={isTargeted ? '#ff3b5c' : '#39ff14'}
          transparent
          opacity={0.25}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={ring1Ref} />
      <group ref={ring2Ref} />
      {isTargeted && (
        <mesh position={[0, 1.25, 0]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshBasicMaterial color="#ef4444" wireframe toneMapped={false} />
        </mesh>
      )}
    </>
  );
};
