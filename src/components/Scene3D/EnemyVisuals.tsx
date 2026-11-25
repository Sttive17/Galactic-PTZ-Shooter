import type { RefObject } from 'react';
import * as THREE from 'three';
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
  return <primitive object={model} scale={scale} rotation={rotation} position={position} />;
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
  switch (tier) {
    case 1:
      return <StrikerHull {...props} />;
    case 2:
      return <AegisHull {...props} />;
    case 3:
      return <StormHull {...props} />;
    case 4:
      return <PhantomBossHull {...props} />;
    case 5:
      return <ArtilleryBossHull {...props} />;
    case 6:
      return <HydraBossHull {...props} />;
    case 7:
      return <VortexBossHull {...props} />;
    case 8:
      return <OmegaHull {...props} />;
    default:
      return <StrikerHull {...props} />;
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
