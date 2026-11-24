import { Canvas } from '@react-three/fiber';
import { Environment as DreiEnvironment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../game/gameState';
import { Environment } from './Environment';
import { PTZCamera } from './PTZCamera';
import { Targets } from './Targets';
import { AllyDrones } from './AllyDrones';
import { Projectiles } from './Projectiles';
import { InputManager } from './InputManager';
import { RaycasterSystem } from './RaycasterSystem';
import { GameManager } from './GameManager';
import { BiomePortal } from './BiomePortal';

export const GameEngine = () => {
  const graphics = useGameStore((state) => state.settings.graphics);
  const brightness = graphics.brightness ?? 1.0;

  return (
    <div className="absolute inset-0 bg-slate-950">
      <Canvas
        dpr={graphics.dpr || 1.0}
        shadows={graphics.shadows}
        camera={{ position: [0, 0, 0], fov: 60 }}
        gl={{
          antialias: graphics.antialias,
          powerPreference: 'default',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.22 * brightness,
        }}
      >
        {/* Dynamic IBL Reflections - Disabled on low-end to prevent GPU TDR crash */}
        {graphics.environmentReflections ? (
          <DreiEnvironment resolution={256} frames={1}>
            <Lightformer
              form="rect"
              intensity={2.6}
              color="#ecfeff"
              position={[0, 14, -4]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[24, 6, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.6}
              color="#fde68a"
              position={[20, 14, -20]}
              rotation={[0.3, -Math.PI * 0.72, 0]}
              scale={[16, 8, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.4}
              color="#38bdf8"
              position={[-12, 4, -8]}
              rotation={[0, Math.PI / 3, 0]}
              scale={[12, 6, 1]}
            />
          </DreiEnvironment>
        ) : (
          /* High-performance ambient fallback */
          <ambientLight intensity={0.45 * brightness} color="#94a3b8" />
        )}

        <InputManager />
        <PTZCamera />
        <GameManager />
        <Environment />
        <BiomePortal />
        <Targets />
        <AllyDrones />
        <Projectiles />
        <RaycasterSystem />
      </Canvas>
    </div>
  );
};
