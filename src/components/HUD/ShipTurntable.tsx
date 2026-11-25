import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { usePreloadedModel } from '../../game/modelLoader';
import { useGameStore } from '../../game/gameState';
import { SKIN_CATALOG } from '../../game/armory';

const RotatingShip = () => {
  const groupRef = useRef<THREE.Group>(null);
  const shipModel = usePreloadedModel('PLAYER_SHIP');
  const activeSkin = useGameStore((state) => state.armory.activeSkin);
  const skin = SKIN_CATALOG[activeSkin];

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y += delta * 0.45;
    groupRef.current.position.y = Math.sin(t * 1.6) * 0.08;
    groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {shipModel ? (
        <primitive object={shipModel} scale={[1.4, 1.4, 1.4]} rotation={[0.1, Math.PI, 0]} />
      ) : (
        <mesh>
          <coneGeometry args={[0.8, 2.2, 4]} />
          <meshStandardMaterial color={skin?.accentColor || '#38bdf8'} roughness={0.3} metalness={0.8} />
        </mesh>
      )}

      {/* Thruster Engine Plumes */}
      <mesh position={[-0.45, 0.1, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.22, 0.7, 8]} />
        <meshBasicMaterial color={skin?.accentColor || '#06b6d4'} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.45, 0.1, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.22, 0.7, 8]} />
        <meshBasicMaterial color={skin?.accentColor || '#06b6d4'} transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

export const ShipTurntable = () => {
  const activeSkin = useGameStore((state) => state.armory.activeSkin);
  const skin = SKIN_CATALOG[activeSkin];

  return (
    <div className="relative w-full h-48 md:h-56 rounded-xl bg-slate-950/80 border border-cyan-500/30 overflow-hidden shadow-[inset_0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-center">
      {/* 3D R3F Viewport */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.2, 3.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 3]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-3, 2, -2]} intensity={1.2} color={skin?.accentColor || '#06b6d4'} />
        <RotatingShip />
      </Canvas>

      {/* Sci-Fi Overlay Grid & Badges */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.7)_100%)]" />

      {/* Top Left Ship Specs */}
      <div className="pointer-events-none absolute top-3 left-3 text-left">
        <div className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
          HANGAR // BAHÍA 01
        </div>
        <div className="text-sm font-orbitron font-black text-white tracking-wider">
          VANGUARD MK-IV
        </div>
      </div>

      {/* Bottom Right Skin Active Badge */}
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-cyan-400/30 text-[10px] font-mono text-cyan-300 backdrop-blur-sm">
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/40"
          style={{ backgroundColor: skin?.accentColor, boxShadow: `0 0 8px ${skin?.accentColor}` }}
        />
        <span>CAMUFLAJE: {skin?.name || 'ESTÁNDAR'}</span>
      </div>
    </div>
  );
};
