import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../game/gameState';
import type { MapTheme, WeatherStyle } from '../../game/mapGenerator';
import { getArmorTextures, getCrateTextures, getFloorTextures } from '../../game/proceduralTextures';
import { SpaceBackdrop } from './SpaceBackdrop';

const PILLAR_COUNT = 10;
const DUST_COUNT = 550;
const LANDMARK_ANGLES_8 = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
const LANDMARK_ANGLES_6 = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2);

const CARGO_DRONE_CONFIGS = [
  { rx: 34, rz: 28, y: 27, speed: 0.22, phase: 0.0 },
  { rx: 42, rz: 36, y: 31, speed: -0.18, phase: 2.1 },
  { rx: 26, rz: 24, y: 35, speed: 0.28, phase: 4.2 },
];

const HOLO_PYLON_ANGLES = [Math.PI * 0.22, Math.PI * 0.78, Math.PI * 1.22, Math.PI * 1.78];
const CONDUIT_TOWER_ANGLES = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
const DOME_ARCH_ROTATIONS = [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75];

function getWeatherVisual(weather: WeatherStyle, theme: MapTheme): { color: string; size: number; opacity: number } {
  switch (weather) {
    case 'SNOW_CRYSTALS':
      return { color: '#e0f2fe', size: 0.36, opacity: 0.82 };
    case 'DUST_STORM':
      return { color: '#fbbf24', size: 0.34, opacity: 0.52 };
    case 'SOLAR_ASH':
      return { color: theme.primaryGlow, size: 0.32, opacity: 0.74 };
    case 'BIO_SPORES':
      return { color: theme.secondaryGlow, size: 0.38, opacity: 0.78 };
    case 'PLASMA_SPARKS':
      return { color: theme.primaryGlow, size: 0.3, opacity: 0.82 };
    case 'STAR_EMBERS':
      return { color: theme.secondaryGlow, size: 0.34, opacity: 0.75 };
    default:
      return { color: theme.primaryGlow, size: 0.28, opacity: 0.65 };
  }
}

interface BiomeLandmarksProps {
  theme: MapTheme;
  wallMat: THREE.MeshStandardMaterial;
  crateMat: THREE.MeshStandardMaterial;
  primaryGlowMat: THREE.MeshStandardMaterial;
  secondaryGlowMat: THREE.MeshStandardMaterial;
}

const BiomeLandmarks = ({
  theme,
  wallMat,
  crateMat,
  primaryGlowMat,
  secondaryGlowMat,
}: BiomeLandmarksProps) => {
  const centerGroupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    if (centerGroupRef.current) {
      centerGroupRef.current.rotation.y += dt * 0.36;
      centerGroupRef.current.position.y = 29 + Math.sin(t * 1.1) * 0.6;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += dt * 0.65;
    if (ring2Ref.current) ring2Ref.current.rotation.x -= dt * 0.52;
    if (ring3Ref.current) ring3Ref.current.rotation.y += dt * 0.74;
  });

  switch (theme.architecture) {
    case 'ORBITAL_HANGAR':
      return (
        <group position={[0, 26, -10]}>
          <group ref={centerGroupRef} position={[0, 3, 0]}>
            <mesh>
              <icosahedronGeometry args={[4.5, 2]} />
              <meshBasicMaterial
                color={theme.primaryGlow}
                wireframe
                transparent
                opacity={0.34}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[2.1, 16, 16]} />
              <meshBasicMaterial
                color={theme.secondaryGlow}
                transparent
                opacity={0.28}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
          <mesh ref={ring1Ref} rotation={[Math.PI * 0.32, 0.4, 0]}>
            <torusGeometry args={[6.8, 0.1, 8, 48]} />
            <meshBasicMaterial color={theme.primaryGlow} transparent opacity={0.62} toneMapped={false} />
          </mesh>
          <mesh ref={ring2Ref} rotation={[-Math.PI * 0.28, -0.3, 0.5]}>
            <torusGeometry args={[8.4, 0.08, 8, 48]} />
            <meshBasicMaterial color={theme.secondaryGlow} transparent opacity={0.48} toneMapped={false} />
          </mesh>
          <mesh position={[0, -6, 0]}>
            <cylinderGeometry args={[4.4, 1.4, 12, 24, 1, true]} />
            <meshBasicMaterial
              color={theme.primaryGlow}
              transparent
              opacity={0.11}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      );

    case 'ICE_CITADEL':
      return (
        <group>
          {LANDMARK_ANGLES_8.map((ang, i) => {
            const x = Math.cos(ang) * 55;
            const z = Math.sin(ang) * 55 - 10;
            const rotY = -ang + Math.PI / 2;
            const h = 20 + (i % 3) * 5;
            return (
              <group key={`ice-${i}`} position={[x, 0, z]} rotation={[0.14, rotY, 0]}>
                <mesh position={[0, h / 2, 0]}>
                  <coneGeometry args={[2.6, h, 6]} />
                  <meshPhysicalMaterial
                    color="#bae6fd"
                    emissive={theme.primaryGlow}
                    emissiveIntensity={0.35}
                    transparent
                    opacity={0.72}
                    roughness={0.1}
                    metalness={0.15}
                    clearcoat={1}
                  />
                </mesh>
                <mesh position={[0, h * 0.38, 1.3]} material={i % 2 === 0 ? primaryGlowMat : secondaryGlowMat}>
                  <boxGeometry args={[0.22, h * 0.55, 0.14]} />
                </mesh>
              </group>
            );
          })}
          {/* Orbiting Overhead Cryo Crystal */}
          <group ref={centerGroupRef} position={[0, 29, -18]}>
            <mesh scale={[1, 1.65, 1]}>
              <octahedronGeometry args={[3.4, 0]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                emissive={theme.primaryGlow}
                emissiveIntensity={0.75}
                transparent
                opacity={0.82}
                roughness={0.08}
                clearcoat={1}
              />
            </mesh>
            <mesh ref={ring1Ref} rotation={[Math.PI / 2.2, 0, 0]}>
              <torusGeometry args={[6.4, 0.12, 8, 48]} />
              <meshBasicMaterial color={theme.secondaryGlow} toneMapped={false} />
            </mesh>
          </group>
        </group>
      );

    case 'LAVA_FORTRESS':
      return (
        <group>
          {/* Flush Magma Channels Across Arena Floor */}
          {[
            { pos: [-26, 0.03, -10] as [number, number, number], args: [1.4, 0.02, 74] as [number, number, number], col: theme.primaryGlow },
            { pos: [26, 0.03, -10] as [number, number, number], args: [1.4, 0.02, 74] as [number, number, number], col: theme.primaryGlow },
            { pos: [0, 0.03, -34] as [number, number, number], args: [84, 0.02, 1.6] as [number, number, number], col: theme.secondaryGlow },
          ].map((river, idx) => (
            <mesh key={`lava-river-${idx}`} position={river.pos}>
              <boxGeometry args={river.args} />
              <meshBasicMaterial color={river.col} transparent opacity={0.85} toneMapped={false} />
            </mesh>
          ))}
          {/* 8 Jagged Basalt Volcanic Obelisks */}
          {LANDMARK_ANGLES_8.map((ang, i) => {
            const x = Math.cos(ang) * 55;
            const z = Math.sin(ang) * 55 - 10;
            const rotY = -ang + Math.PI / 2;
            return (
              <group key={`lava-spire-${i}`} position={[x, 0, z]} rotation={[-0.12, rotY, 0]}>
                <mesh position={[0, 12, 0]} material={wallMat}>
                  <cylinderGeometry args={[1.1, 3.2, 24, 5]} />
                </mesh>
                <mesh position={[0, 10, 1.45]} material={i % 2 === 0 ? primaryGlowMat : secondaryGlowMat}>
                  <boxGeometry args={[0.38, 17, 0.2]} />
                </mesh>
              </group>
            );
          })}
          {/* Overhead Caldera Ember Ring */}
          <group ref={centerGroupRef} position={[0, 30, -18]}>
            <mesh ref={ring1Ref} rotation={[Math.PI * 0.45, 0, 0]} material={primaryGlowMat}>
              <torusGeometry args={[8.5, 0.26, 8, 48]} />
            </mesh>
            <mesh>
              <octahedronGeometry args={[2.8, 0]} />
              <meshBasicMaterial color={theme.secondaryGlow} wireframe toneMapped={false} />
            </mesh>
          </group>
        </group>
      );

    case 'SOLAR_FOUNDRY':
      return (
        <group>
          {/* 6 Giant Overhead Angled Solar Collector Sails */}
          {LANDMARK_ANGLES_6.map((ang, i) => {
            const x = Math.cos(ang) * 52;
            const z = Math.sin(ang) * 52 - 10;
            const rotY = -ang + Math.PI / 2;
            return (
              <group key={`solar-sail-${i}`} position={[x, 24, z]} rotation={[0.45, rotY, 0]}>
                <mesh material={wallMat}>
                  <boxGeometry args={[12, 6.2, 0.45]} />
                </mesh>
                <mesh position={[0, 0, 0.28]} material={i % 2 === 0 ? primaryGlowMat : secondaryGlowMat}>
                  <boxGeometry args={[10.8, 0.22, 0.12]} />
                </mesh>
                <mesh position={[0, -2.5, 0.28]} material={secondaryGlowMat}>
                  <boxGeometry args={[10.8, 0.18, 0.12]} />
                </mesh>
              </group>
            );
          })}
          {/* Flush Solar Crucible Cross Strips */}
          <mesh position={[-32, 0.03, -10]}>
            <boxGeometry args={[0.9, 0.02, 72]} />
            <meshBasicMaterial color={theme.secondaryGlow} transparent opacity={0.75} toneMapped={false} />
          </mesh>
          <mesh position={[32, 0.03, -10]}>
            <boxGeometry args={[0.9, 0.02, 72]} />
            <meshBasicMaterial color={theme.secondaryGlow} transparent opacity={0.75} toneMapped={false} />
          </mesh>
        </group>
      );

    case 'BIO_DOME':
      return (
        <group>
          {LANDMARK_ANGLES_6.map((ang, i) => {
            const x = Math.cos(ang) * 54;
            const z = Math.sin(ang) * 54 - 10;
            const rotY = -ang + Math.PI / 2;
            return (
              <group key={`bio-flora-${i}`} position={[x, 0, z]} rotation={[0.18, rotY, 0]}>
                <mesh position={[0, 10, 0]} material={crateMat}>
                  <cylinderGeometry args={[0.7, 1.8, 20, 8]} />
                </mesh>
                <mesh position={[0, 20.5, 1.5]}>
                  <sphereGeometry args={[2.1, 14, 14]} />
                  <meshStandardMaterial
                    color={theme.secondaryGlow}
                    emissive={theme.primaryGlow}
                    emissiveIntensity={2.4}
                    roughness={0.25}
                    toneMapped={false}
                  />
                </mesh>
                <mesh position={[0, 20.5, 1.5]}>
                  <sphereGeometry args={[3.2, 14, 14]} />
                  <meshBasicMaterial
                    color={theme.primaryGlow}
                    transparent
                    opacity={0.22}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            );
          })}
          <group ref={centerGroupRef} position={[0, 28, -14]}>
            <mesh>
              <torusKnotGeometry args={[2.4, 0.32, 64, 10]} />
              <meshBasicMaterial color={theme.secondaryGlow} wireframe transparent opacity={0.55} toneMapped={false} />
            </mesh>
          </group>
        </group>
      );

    case 'VOID_MONOLITHS':
      return (
        <group>
          {LANDMARK_ANGLES_8.map((ang, i) => {
            const x = Math.cos(ang) * 54;
            const z = Math.sin(ang) * 54 - 10;
            const rotY = -ang + Math.PI / 2;
            return (
              <group key={`void-mono-${i}`} position={[x, 14 + (i % 2) * 3, z]} rotation={[0.08, rotY, (i % 2 === 0 ? 1 : -1) * 0.08]}>
                <mesh material={wallMat}>
                  <boxGeometry args={[3.2, 16, 1.4]} />
                </mesh>
                <mesh position={[0, 0, 0.78]} material={primaryGlowMat}>
                  <boxGeometry args={[0.25, 13, 0.1]} />
                </mesh>
                <mesh position={[0, -7, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[2.8, 0.1, 8, 28]} />
                  <meshBasicMaterial color={theme.secondaryGlow} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
          <group ref={centerGroupRef} position={[0, 29, -18]}>
            <mesh>
              <dodecahedronGeometry args={[3.2, 0]} />
              <meshBasicMaterial color={theme.primaryGlow} wireframe toneMapped={false} />
            </mesh>
            <mesh ref={ring1Ref} rotation={[Math.PI * 0.35, 0.3, 0]}>
              <torusGeometry args={[7.2, 0.14, 8, 48]} />
              <meshBasicMaterial color={theme.secondaryGlow} toneMapped={false} />
            </mesh>
          </group>
        </group>
      );

    case 'PLASMA_REACTOR':
      return (
        <group>
          <group ref={centerGroupRef} position={[0, 30, -18]}>
            <mesh>
              <sphereGeometry args={[2.9, 20, 20]} />
              <meshBasicMaterial color={theme.primaryGlow} toneMapped={false} />
            </mesh>
            <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]} material={primaryGlowMat}>
              <torusGeometry args={[6.4, 0.25, 10, 48]} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[0.4, Math.PI / 3, 0]} material={secondaryGlowMat}>
              <torusGeometry args={[8.2, 0.22, 10, 48]} />
            </mesh>
            <mesh ref={ring3Ref} rotation={[-0.4, -Math.PI / 3, 0]} material={primaryGlowMat}>
              <torusGeometry args={[10.0, 0.18, 10, 48]} />
            </mesh>
          </group>
          {LANDMARK_ANGLES_6.map((ang, i) => {
            const x = Math.cos(ang) * 55;
            const z = Math.sin(ang) * 55 - 10;
            return (
              <mesh key={`plasma-beam-${i}`} position={[x, 18, z]}>
                <cylinderGeometry args={[0.35, 0.35, 36, 10]} />
                <meshBasicMaterial
                  color={i % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow}
                  transparent
                  opacity={0.55}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                />
              </mesh>
            );
          })}
        </group>
      );

    case 'QUANTUM_MATRIX':
      return (
        <group>
          {LANDMARK_ANGLES_8.map((ang, i) => {
            const x = Math.cos(ang) * 53;
            const z = Math.sin(ang) * 53 - 10;
            return (
              <group key={`q-node-${i}`} position={[x, 17 + (i % 2) * 4, z]} rotation={[0.4, ang, 0.4]}>
                <mesh>
                  <octahedronGeometry args={[2.8, 0]} />
                  <meshBasicMaterial
                    color={i % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow}
                    wireframe
                    toneMapped={false}
                  />
                </mesh>
              </group>
            );
          })}
          <group ref={centerGroupRef} position={[0, 30, -18]}>
            <mesh>
              <boxGeometry args={[5.8, 5.8, 5.8]} />
              <meshBasicMaterial color={theme.primaryGlow} wireframe toneMapped={false} />
            </mesh>
            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
              <boxGeometry args={[3.8, 3.8, 3.8]} />
              <meshBasicMaterial color={theme.secondaryGlow} wireframe toneMapped={false} />
            </mesh>
          </group>
        </group>
      );

    case 'CANYON_OUTPOST':
      return (
        <group>
          {LANDMARK_ANGLES_8.map((ang, i) => {
            const x = Math.cos(ang) * 56;
            const z = Math.sin(ang) * 56 - 10;
            const rotY = -ang + Math.PI / 2;
            return (
              <group key={`mesa-${i}`} position={[x, 0, z]} rotation={[0, rotY, 0]}>
                <mesh position={[0, 4.5, 0]} material={crateMat}>
                  <boxGeometry args={[9.5, 9, 6]} />
                </mesh>
                <mesh position={[0, 11.5, -0.8]} material={wallMat}>
                  <boxGeometry args={[6.5, 5, 4.4]} />
                </mesh>
                <mesh position={[0, 16.5, -0.8]}>
                  <cylinderGeometry args={[0.12, 0.24, 5, 6]} />
                  <meshBasicMaterial color={theme.secondaryGlow} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
        </group>
      );

    case 'ASTRAL_TEMPLE':
      return (
        <group>
          {LANDMARK_ANGLES_8.map((ang, i) => {
            const x = Math.cos(ang) * 55;
            const z = Math.sin(ang) * 55 - 10;
            return (
              <group key={`astral-col-${i}`} position={[x, 0, z]}>
                <mesh position={[0, 11, 0]} material={wallMat}>
                  <cylinderGeometry args={[1.35, 1.65, 22, 12]} />
                </mesh>
                <mesh position={[0, 23.8, 0]}>
                  <octahedronGeometry args={[1.6, 0]} />
                  <meshBasicMaterial color={i % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
          {/* Grand Overhead Celestial Astrolabe */}
          <group ref={centerGroupRef} position={[0, 30, -16]}>
            <mesh ref={ring1Ref} rotation={[Math.PI * 0.25, 0.3, 0]}>
              <torusGeometry args={[10.5, 0.22, 10, 64]} />
              <meshBasicMaterial color={theme.primaryGlow} toneMapped={false} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[-Math.PI * 0.35, 0.2, 0.5]}>
              <torusGeometry args={[7.8, 0.18, 10, 64]} />
              <meshBasicMaterial color={theme.secondaryGlow} toneMapped={false} />
            </mesh>
            <mesh ref={ring3Ref}>
              <torusGeometry args={[5.2, 0.14, 10, 48]} />
              <meshBasicMaterial color={theme.primaryGlow} toneMapped={false} />
            </mesh>
          </group>
        </group>
      );

    default:
      return null;
  }
};

const SKY_DOME_VERTEX = `
  varying vec3 vWorldDir;
  void main() {
    vWorldDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_SKY_FRAGMENT = `
  varying vec3 vWorldDir;
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunGlow;

  void main() {
    vec3 dir = normalize(vWorldDir);
    float up = clamp(dir.y, 0.0, 1.0);
    vec3 sky = mix(uHorizon, uZenith, pow(up, 0.55));
    vec3 sunDir = normalize(vec3(0.45, 0.48, -0.75));
    float sunAmt = max(0.0, dot(dir, sunDir));
    sky += uSunGlow * pow(sunAmt, 8.0) * 0.42;
    gl_FragColor = vec4(sky, 1.0);
  }
`;

const LAUNCH_SKY_FRAGMENT = `
  varying vec3 vWorldDir;
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunGlow;

  void main() {
    vec3 dir = normalize(vWorldDir);
    float h = smoothstep(-0.08, 0.58, dir.y);
    vec3 sky = mix(uHorizon, uZenith, h);
    float band = exp(-abs(dir.y - 0.04) * 7.5);
    sky += uSunGlow * band * 0.52;
    gl_FragColor = vec4(sky, 1.0);
  }
`;

/* ========================= CHAPTER 1: UNDERGROUND LAB (Levels 1-10) ========================= */
const LAB_TUBE_ANGLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2 + Math.PI / 8);
const LAB_BEAM_ZS = [-46, -28, -10, 8, 26];

const UndergroundLabWorld = ({
  theme,
  wallMat,
  crateMat,
  primaryGlowMat,
  secondaryGlowMat,
}: BiomeLandmarksProps) => {
  const coreRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    for (let i = 0; i < coreRefs.current.length; i++) {
      const m = coreRefs.current[i];
      if (!m) continue;
      m.rotation.y += dt * (i % 2 === 0 ? 1.1 : -1.1);
      m.position.y = 6.2 + Math.sin(t * 2.2 + i) * 0.45;
    }
  });

  return (
    <group>
      {/* Enclosed Subterranean Titanium-Concrete Roof Slab */}
      <mesh position={[0, 32.5, -10]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[142, 142]} />
        <meshStandardMaterial color={theme.floorColor} roughness={0.62} metalness={0.45} />
      </mesh>

      {/* Enclosed Cylindrical Reinforced Bunker Outer Wall */}
      <mesh position={[0, 16, -10]}>
        <cylinderGeometry args={[63, 63, 33, 24, 1, true]} />
        <meshStandardMaterial
          color={theme.wallColor}
          side={THREE.BackSide}
          roughness={0.55}
          metalness={0.5}
        />
      </mesh>

      {/* Perimeter Hazard Base Stripe Ring */}
      <mesh position={[0, 1.6, -10]}>
        <cylinderGeometry args={[62.4, 62.4, 0.85, 32, 1, true]} />
        <meshBasicMaterial color={theme.secondaryGlow} side={THREE.BackSide} transparent opacity={0.75} toneMapped={false} />
      </mesh>

      {/* Overhead Steel Ceiling Girders & Recessed Fluorescent Light Panels */}
      {LAB_BEAM_ZS.map((bz, idx) => (
        <group key={`lab-beam-${idx}`} position={[0, 31.2, bz]}>
          <mesh material={wallMat}>
            <boxGeometry args={[118, 1.4, 2.2]} />
          </mesh>
          {[-28, 0, 28].map((lx, lIdx) => (
            <group key={`lamp-${lIdx}`} position={[lx, -0.78, 0]}>
              <mesh>
                <boxGeometry args={[14, 0.16, 1.6]} />
                <meshBasicMaterial color={theme.keyLightColor} toneMapped={false} />
              </mesh>
              <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[15, 0.08, 0.25]} />
                <meshBasicMaterial color={idx % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 8 Cryo-Containment Specimen Tubes with Suspended Floating Cores */}
      {LAB_TUBE_ANGLES.map((ang, i) => {
        const x = Math.cos(ang) * 56;
        const z = Math.sin(ang) * 56 - 10;
        const rotY = -ang + Math.PI / 2;
        return (
          <group key={`lab-tube-${i}`} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            <mesh position={[0, 0.9, 0]} material={crateMat}>
              <cylinderGeometry args={[2.5, 2.9, 1.8, 12]} />
            </mesh>
            <mesh position={[0, 13.8, 0]} material={wallMat}>
              <cylinderGeometry args={[2.4, 2.4, 2.4, 12]} />
            </mesh>
            <mesh position={[0, 7.2, 0]}>
              <cylinderGeometry args={[1.95, 1.95, 10.8, 16, 1, true]} />
              <meshPhysicalMaterial
                color={theme.primaryGlow}
                transparent
                opacity={0.22}
                roughness={0.08}
                clearcoat={1}
                depthWrite={false}
              />
            </mesh>
            <mesh
              ref={(el) => {
                coreRefs.current[i] = el;
              }}
              position={[0, 6.2, 0]}
            >
              <octahedronGeometry args={[1.15, 0]} />
              <meshBasicMaterial color={i % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow} toneMapped={false} />
            </mesh>
            {/* Glowing server/monitor console column */}
            <mesh position={[0, 19, 0]} material={wallMat}>
              <cylinderGeometry args={[0.9, 1.2, 9, 8]} />
            </mesh>
            <mesh position={[0, 23, 0]} material={i % 2 === 0 ? primaryGlowMat : secondaryGlowMat}>
              <torusGeometry args={[1.4, 0.14, 8, 24]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ========================= CHAPTER 2: EARTH OPEN FIELD (Levels 11-20) ========================= */
const EARTH_CLOUD_CLUSTERS = Array.from({ length: 14 }, (_, i) => {
  const ang = (i / 14) * Math.PI * 2;
  const dist = 78 + (i % 3) * 28;
  return {
    x: Math.cos(ang) * dist,
    y: 48 + (i % 4) * 7,
    z: Math.sin(ang) * dist - 10,
    scale: 1.0 + (i % 3) * 0.45,
    speed: 0.015 + (i % 4) * 0.004,
    phase: ang,
    dist,
  };
});
const EARTH_MOUNTAINS = Array.from({ length: 24 }, (_, i) => {
  const ang = (i / 24) * Math.PI * 2;
  const dist = 104 + (i % 3) * 14;
  return {
    x: Math.cos(ang) * dist,
    z: Math.sin(ang) * dist - 10,
    radius: 18 + (i % 4) * 5,
    height: 22 + (i % 5) * 7,
    shade: i % 3 === 0 ? '#1e4d38' : i % 3 === 1 ? '#255c42' : '#2d6a4c',
  };
});
const EARTH_TREES = Array.from({ length: 18 }, (_, i) => {
  const ang = (i / 18) * Math.PI * 2 + 0.12;
  const dist = 60 + (i % 3) * 6;
  return {
    x: Math.cos(ang) * dist,
    z: Math.sin(ang) * dist - 10,
    scale: 0.85 + (i % 3) * 0.25,
  };
});
const EARTH_TURBINES = [
  { x: -58, z: -48, rotY: 0.4 },
  { x: 58, z: -48, rotY: -0.4 },
  { x: -64, z: 18, rotY: 0.9 },
  { x: 64, z: 18, rotY: -0.9 },
];

const EarthOpenFieldWorld = ({ theme }: { theme: MapTheme }) => {
  const skyMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SKY_DOME_VERTEX,
      fragmentShader: EARTH_SKY_FRAGMENT,
      uniforms: {
        uZenith: { value: new THREE.Color(...theme.skyTintA) },
        uHorizon: { value: new THREE.Color(...theme.skyTintB) },
        uSunGlow: { value: new THREE.Color(...theme.skyTintC) },
      },
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
  }, [theme.skyTintA, theme.skyTintB, theme.skyTintC]);

  useEffect(() => {
    skyMat.uniforms.uZenith.value.setRGB(...theme.skyTintA);
    skyMat.uniforms.uHorizon.value.setRGB(...theme.skyTintB);
    skyMat.uniforms.uSunGlow.value.setRGB(...theme.skyTintC);
  }, [theme, skyMat]);

  useEffect(() => () => skyMat.dispose(), [skyMat]);

  const rotorRefs = useRef<(THREE.Group | null)[]>([]);
  const cloudRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    for (let i = 0; i < rotorRefs.current.length; i++) {
      const r = rotorRefs.current[i];
      if (r) r.rotation.z -= dt * (1.8 + i * 0.22);
    }
    for (let i = 0; i < cloudRefs.current.length; i++) {
      const c = cloudRefs.current[i];
      const cfg = EARTH_CLOUD_CLUSTERS[i];
      if (!c || !cfg) continue;
      const a = cfg.phase + t * cfg.speed;
      c.position.x = Math.cos(a) * cfg.dist;
      c.position.z = Math.sin(a) * cfg.dist - 10;
    }
  });

  return (
    <group>
      {/* Daylight / Golden-Hour Earth Sky Dome */}
      <mesh material={skyMat}>
        <sphereGeometry args={[360, 32, 24]} />
      </mesh>

      {/* Warm Glowing Sun & Atmospheric Halo */}
      <group position={[110, 125, -185]}>
        <mesh>
          <sphereGeometry args={[14, 24, 24]} />
          <meshBasicMaterial color="#fffbeb" fog={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[23, 24, 24]} />
          <meshBasicMaterial
            color={theme.keyLightColor}
            transparent
            opacity={0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* 14 Drifting Puffy White Clouds */}
      {EARTH_CLOUD_CLUSTERS.map((c, i) => (
        <group
          key={`cloud-${i}`}
          ref={(el) => {
            cloudRefs.current[i] = el;
          }}
          position={[c.x, c.y, c.z]}
          scale={c.scale}
        >
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[5.5, 10, 10]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.86} fog={false} />
          </mesh>
          <mesh position={[-4.5, -0.8, 0.8]}>
            <sphereGeometry args={[4.1, 10, 10]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.82} fog={false} />
          </mesh>
          <mesh position={[4.6, -0.6, -0.6]}>
            <sphereGeometry args={[4.4, 10, 10]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.82} fog={false} />
          </mesh>
        </group>
      ))}

      {/* Distant Rolling Valley Mountain Ring */}
      {EARTH_MOUNTAINS.map((m, i) => (
        <mesh key={`mtn-${i}`} position={[m.x, m.height / 2 - 1, m.z]}>
          <coneGeometry args={[m.radius, m.height, 7]} />
          <meshStandardMaterial color={m.shade} roughness={0.92} metalness={0.02} />
        </mesh>
      ))}

      {/* 18 Stylized Pine Trees Around Valley Meadow */}
      {EARTH_TREES.map((tr, i) => (
        <group key={`tree-${i}`} position={[tr.x, 0, tr.z]} scale={tr.scale}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.6, 4.4, 7]} />
            <meshStandardMaterial color="#5c4033" roughness={0.9} />
          </mesh>
          <mesh position={[0, 5.4, 0]} castShadow>
            <coneGeometry args={[2.8, 4.6, 7]} />
            <meshStandardMaterial color="#166534" roughness={0.85} />
          </mesh>
          <mesh position={[0, 8.2, 0]} castShadow>
            <coneGeometry args={[2.2, 4.2, 7]} />
            <meshStandardMaterial color="#15803d" roughness={0.85} />
          </mesh>
          <mesh position={[0, 10.6, 0]} castShadow>
            <coneGeometry args={[1.5, 3.4, 7]} />
            <meshStandardMaterial color="#22c55e" roughness={0.82} />
          </mesh>
        </group>
      ))}

      {/* 4 Spinning Green-Energy Wind Turbines */}
      {EARTH_TURBINES.map((wt, i) => (
        <group key={`turbine-${i}`} position={[wt.x, 0, wt.z]} rotation={[0, wt.rotY, 0]}>
          <mesh position={[0, 12, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.9, 24, 10]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.25} />
          </mesh>
          <mesh position={[0, 24.2, 0.3]}>
            <boxGeometry args={[1.4, 1.4, 2.8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
          </mesh>
          <group
            ref={(el) => {
              rotorRefs.current[i] = el;
            }}
            position={[0, 24.2, 1.8]}
          >
            {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((bAng, bIdx) => (
              <group key={bIdx} rotation={[0, 0, bAng]}>
                <mesh position={[0, 4.8, 0]}>
                  <boxGeometry args={[0.45, 9.6, 0.14]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.3} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
};

/* ========================= CHAPTER 3: ROCKET LAUNCH ZONE (Levels 21-30) ========================= */
const ROCKET_PADS = [
  { x: -56, z: -48, rotY: 0.55 },
  { x: 0, z: -68, rotY: 0 },
  { x: 56, z: -48, rotY: -0.55 },
];

const RocketLaunchWorld = ({ theme, wallMat, crateMat }: { theme: MapTheme; wallMat: THREE.MeshStandardMaterial; crateMat: THREE.MeshStandardMaterial }) => {
  const skyMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SKY_DOME_VERTEX,
      fragmentShader: LAUNCH_SKY_FRAGMENT,
      uniforms: {
        uZenith: { value: new THREE.Color(...theme.skyTintA) },
        uHorizon: { value: new THREE.Color(...theme.skyTintB) },
        uSunGlow: { value: new THREE.Color(...theme.skyTintC) },
      },
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
  }, [theme.skyTintA, theme.skyTintB, theme.skyTintC]);

  useEffect(() => {
    skyMat.uniforms.uZenith.value.setRGB(...theme.skyTintA);
    skyMat.uniforms.uHorizon.value.setRGB(...theme.skyTintB);
    skyMat.uniforms.uSunGlow.value.setRGB(...theme.skyTintC);
  }, [theme, skyMat]);

  useEffect(() => () => skyMat.dispose(), [skyMat]);

  const steamRefs = useRef<(THREE.Mesh | null)[]>([]);
  const strobeRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < steamRefs.current.length; i++) {
      const m = steamRefs.current[i];
      if (!m) continue;
      const cycle = (t * 0.45 + i * 0.27) % 1;
      m.position.y = 2.5 + cycle * 9;
      m.scale.setScalar(1 + cycle * 2.2);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(cycle * Math.PI) * 0.28;
    }
    const blink = Math.sin(t * 5.0) > 0.2 ? 1.0 : 0.15;
    for (let i = 0; i < strobeRefs.current.length; i++) {
      const mat = strobeRefs.current[i];
      if (mat) mat.opacity = blink;
    }
  });

  return (
    <group>
      {/* Dusk Aerospace Twilight Sky Dome */}
      <mesh material={skyMat}>
        <sphereGeometry args={[360, 32, 24]} />
      </mesh>

      {/* 3 Colossal Multi-Stage Rockets on Launch Pads */}
      {ROCKET_PADS.map((pad, idx) => (
        <group key={`rocket-pad-${idx}`} position={[pad.x, 0, pad.z]} rotation={[0, pad.rotY, 0]}>
          {/* Reinforced Concrete Blast Pad */}
          <mesh position={[0, 1.5, 0]} material={wallMat} receiveShadow>
            <boxGeometry args={[20, 3, 20]} />
          </mesh>

          {/* Red/White Umbilical Service Gantry Tower */}
          <group position={[-6.8, 0, -1]}>
            <mesh position={[0, 27, 0]}>
              <boxGeometry args={[4.2, 54, 4.2]} />
              <meshStandardMaterial color="#dc2626" wireframe />
            </mesh>
            {[8, 18, 28, 38, 48].map((armY, aIdx) => (
              <mesh key={aIdx} position={[2.8, armY, 1]} material={crateMat}>
                <boxGeometry args={[4.5, 0.7, 1.2]} />
              </mesh>
            ))}
            <mesh position={[0, 55.2, 0]}>
              <sphereGeometry args={[0.7, 8, 8]} />
              <meshBasicMaterial
                ref={(el) => {
                  strobeRefs.current[idx] = el;
                }}
                color="#ef4444"
                transparent
                toneMapped={false}
              />
            </mesh>
          </group>

          {/* Main Space Rocket Body (height ~56m) */}
          <group position={[1.8, 3, 0]}>
            {/* Main White-Titanium Core Stage */}
            <mesh position={[0, 19, 0]}>
              <cylinderGeometry args={[2.5, 2.7, 38, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.35} roughness={0.3} />
            </mesh>
            {/* Dark Interstage Band */}
            <mesh position={[0, 34, 0]}>
              <cylinderGeometry args={[2.55, 2.55, 3.2, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Upper Payload Fairing & Nose Cone */}
            <mesh position={[0, 44.5, 0]}>
              <coneGeometry args={[2.55, 13, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.35} roughness={0.28} />
            </mesh>
            {/* Twin Orange Solid Rocket Boosters */}
            {[-3.4, 3.4].map((bx, bIdx) => (
              <group key={bIdx} position={[bx, 0, 0]}>
                <mesh position={[0, 13, 0]}>
                  <cylinderGeometry args={[1.25, 1.35, 26, 12]} />
                  <meshStandardMaterial color="#ea580c" metalness={0.3} roughness={0.45} />
                </mesh>
                <mesh position={[0, 28.5, 0]}>
                  <coneGeometry args={[1.25, 5, 12]} />
                  <meshStandardMaterial color="#f8fafc" metalness={0.35} roughness={0.3} />
                </mesh>
              </group>
            ))}
            {/* Glowing Ignition Engine Bells */}
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[1.6, 2.3, 1.6, 12]} />
              <meshBasicMaterial color={theme.primaryGlow} toneMapped={false} />
            </mesh>
            {/* Rising Cryogenic LOX Steam Plumes */}
            <mesh
              ref={(el) => {
                steamRefs.current[idx * 2] = el;
              }}
              position={[0, 3, 2.5]}
            >
              <sphereGeometry args={[3.4, 10, 10]} />
              <meshBasicMaterial color="#e2e8f0" transparent opacity={0.22} depthWrite={false} />
            </mesh>
            <mesh
              ref={(el) => {
                steamRefs.current[idx * 2 + 1] = el;
              }}
              position={[0, 5, -2.5]}
            >
              <sphereGeometry args={[3.0, 10, 10]} />
              <meshBasicMaterial color="#cbd5e1" transparent opacity={0.2} depthWrite={false} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

/* ========================= CHAPTER 4: ORBITAL STRATOSPHERE (Levels 31-40) ========================= */
const ORBITAL_STAR_COUNT = 1600;
const SOLAR_WING_SPOTS = [
  { x: -66, y: 12, z: -12, rotY: 0.25 },
  { x: 66, y: 12, z: -12, rotY: -0.25 },
  { x: -58, y: 19, z: -48, rotY: 0.65 },
  { x: 58, y: 19, z: -48, rotY: -0.65 },
];

const OrbitalStratosphereWorld = ({
  theme,
  wallMat,
  primaryGlowMat,
  secondaryGlowMat,
}: {
  theme: MapTheme;
  wallMat: THREE.MeshStandardMaterial;
  primaryGlowMat: THREE.MeshStandardMaterial;
  secondaryGlowMat: THREE.MeshStandardMaterial;
}) => {
  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(ORBITAL_STAR_COUNT * 3);
    for (let i = 0; i < ORBITAL_STAR_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 240 + Math.random() * 140;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useEffect(() => () => starGeo.dispose(), [starGeo]);

  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (earthRef.current) earthRef.current.rotation.y += dt * 0.008;
    if (cloudsRef.current) cloudsRef.current.rotation.y += dt * 0.014;
  });

  return (
    <group>
      {/* Crisp High-Orbit Starfield */}
      <points geometry={starGeo}>
        <pointsMaterial color="#e0f2fe" size={1.35} transparent opacity={0.85} fog={false} depthWrite={false} />
      </points>

      {/* Giant Curved Planet Earth Horizon Below/Behind Station */}
      <group position={[0, -172, -135]}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[182, 48, 48]} />
          <meshStandardMaterial
            color="#1d4ed8"
            emissive="#0c4a6e"
            emissiveIntensity={0.42}
            roughness={0.55}
            metalness={0.12}
            fog={false}
          />
        </mesh>
        {/* Subtle Green-Gold Continental Mass Accents & Clouds */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[183.8, 36, 36]} />
          <meshBasicMaterial
            color="#e0f2fe"
            wireframe
            transparent
            opacity={0.12}
            depthWrite={false}
            fog={false}
          />
        </mesh>
        {/* Bright Cyan Stratospheric Atmosphere Limb */}
        <mesh>
          <sphereGeometry args={[189.5, 48, 48]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            fog={false}
          />
        </mesh>
        {/* Biome-Tinted Polar Ionospheric Halo */}
        <mesh>
          <sphereGeometry args={[191.5, 36, 36]} />
          <meshBasicMaterial
            color={theme.primaryGlow}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* 4 Huge Photovoltaic Solar Array Wings Extending into Orbit */}
      {SOLAR_WING_SPOTS.map((wing, idx) => (
        <group key={`solar-wing-${idx}`} position={[wing.x, wing.y, wing.z]} rotation={[0.25, wing.rotY, 0]}>
          <mesh material={wallMat}>
            <boxGeometry args={[28, 0.35, 0.7]} />
          </mesh>
          <mesh position={[0, 0, 4.2]}>
            <boxGeometry args={[24, 0.14, 6.2]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.82} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0, -4.2]}>
            <boxGeometry args={[24, 0.14, 6.2]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.82} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.2, 0]} material={idx % 2 === 0 ? primaryGlowMat : secondaryGlowMat}>
            <boxGeometry args={[24, 0.08, 0.25]} />
          </mesh>
        </group>
      ))}

      {/* Perimeter Orbital Docking Airlocks & Sensor Spine */}
      {LANDMARK_ANGLES_6.map((ang, i) => {
        const x = Math.cos(ang) * 56;
        const z = Math.sin(ang) * 56 - 10;
        const rotY = -ang + Math.PI / 2;
        return (
          <group key={`orb-dock-${i}`} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            <mesh position={[0, 4.5, 0]}>
              <cylinderGeometry args={[2.1, 2.5, 9, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.28} />
            </mesh>
            <mesh position={[0, 9.5, 0]} material={i % 2 === 0 ? primaryGlowMat : secondaryGlowMat}>
              <torusGeometry args={[2.2, 0.16, 8, 24]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Environment = () => {
  const currentMap = useGameStore((state) => state.currentMap);
  const graphics = useGameStore((state) => state.settings.graphics);
  const { theme, obstacles } = currentMap;
  const currentDustCount = graphics?.dustCount ?? 80;
  const enableShadows = graphics?.shadows ?? false;
  const shadowMapSize = graphics?.shadowMapSize ?? 512;

  const ceilingRingRef = useRef<THREE.Group>(null);
  const radarLeftRef = useRef<THREE.Group>(null);
  const radarRightRef = useRef<THREE.Group>(null);
  const sweepRef = useRef<THREE.Mesh>(null);
  const beaconsRef = useRef<THREE.MeshStandardMaterial>(null);
  const dustRef = useRef<THREE.Points>(null);
  const ambientDroneRefs = useRef<(THREE.Group | null)[]>([]);
  const gantryLeftRef = useRef<THREE.Group>(null);
  const gantryRightRef = useRef<THREE.Group>(null);
  const holoBeaconRefs = useRef<(THREE.Mesh | null)[]>([]);
  const conduitRingRefs = useRef<(THREE.Mesh | null)[]>([]);
  const jumpGateRefs = useRef<(THREE.Mesh | null)[]>([]);

  const domeGeometry = useMemo(() => new THREE.IcosahedronGeometry(85, 2), []);

  // Singleton procedural PBR textures (never disposed per theme)
  const floorTex = useMemo(() => getFloorTextures(), []);
  const armorTex = useMemo(() => getArmorTextures(), []);
  const crateTex = useMemo(() => getCrateTextures(), []);

  // Theme-driven materials with clean disposal on theme change
  const materials = useMemo(() => {
    return {
      wireframeMaterial: new THREE.MeshBasicMaterial({
        color: theme.primaryGlow,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      }),
      solidMaterial: new THREE.MeshStandardMaterial({
        color: theme.bgColor,
        side: THREE.BackSide,
        roughness: 0.4,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      }),
      floorMaterial: new THREE.MeshPhysicalMaterial({
        color: theme.floorColor,
        map: floorTex.map,
        bumpMap: floorTex.bumpMap,
        bumpScale: 0.16,
        roughnessMap: floorTex.roughnessMap,
        roughness: theme.floorRoughness,
        metalness: theme.floorMetalness,
        clearcoat: theme.floorClearcoat,
        clearcoatRoughness: 0.22,
        envMapIntensity: 1.45,
      }),
      wallMat: new THREE.MeshStandardMaterial({
        color: theme.wallColor,
        map: armorTex.map,
        bumpMap: armorTex.bumpMap,
        bumpScale: 0.14,
        roughness: 0.32,
        metalness: 0.62,
        envMapIntensity: 1.35,
      }),
      crateMat: new THREE.MeshStandardMaterial({
        color: theme.crateColor,
        map: crateTex.map,
        bumpMap: crateTex.bumpMap,
        bumpScale: 0.16,
        roughness: 0.44,
        metalness: 0.45,
      }),
      primaryGlowMat: new THREE.MeshStandardMaterial({
        color: theme.primaryGlow,
        emissive: theme.primaryGlow,
        emissiveIntensity: 3.0,
        roughness: 0.2,
        toneMapped: false,
      }),
      secondaryGlowMat: new THREE.MeshStandardMaterial({
        color: theme.secondaryGlow,
        emissive: theme.secondaryGlow,
        emissiveIntensity: 3.0,
        roughness: 0.2,
        toneMapped: false,
      }),
    };
  }, [theme, floorTex, armorTex, crateTex]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((mat) => mat.dispose());
    };
  }, [materials]);

  // Perimeter structural pillars around the hangar
  const pillars = useMemo(() => {
    const items = [];
    const radius = 64;
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const angle = (i / PILLAR_COUNT) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 10;
      items.push({ x, z, rotY: -angle + Math.PI / 2 });
    }
    return items;
  }, []);

  // Floating atmospheric weather / energy particles
  const dustGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = Math.min(DUST_COUNT, currentDustCount);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 116;
      positions[i * 3 + 1] = 1 + Math.random() * 40;
      positions[i * 3 + 2] = 28 - Math.random() * 96;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [currentDustCount]);

  useEffect(() => {
    return () => {
      domeGeometry.dispose();
      dustGeo.dispose();
    };
  }, [domeGeometry, dustGeo]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (ceilingRingRef.current) {
      ceilingRingRef.current.rotation.y += dt * 0.18;
    }
    if (radarLeftRef.current) {
      radarLeftRef.current.rotation.y += dt * 0.65;
    }
    if (radarRightRef.current) {
      radarRightRef.current.rotation.y -= dt * 0.55;
    }
    if (sweepRef.current) {
      sweepRef.current.rotation.z -= dt * 0.35;
    }
    if (beaconsRef.current) {
      beaconsRef.current.emissiveIntensity = 1.2 + Math.sin(t * 4.5) * 1.1;
    }
    if (dustRef.current) {
      const posAttr = dustRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const weather = theme.weather;
      const count = Math.min(DUST_COUNT, currentDustCount);
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;
        if (weather === 'SNOW_CRYSTALS') {
          arr[iy] -= dt * (2.6 + (i % 5) * 0.45);
          arr[ix] += Math.sin(t * 1.4 + i) * dt * 1.2;
          if (arr[iy] < 0.8) arr[iy] = 41;
          if (arr[ix] > 58) arr[ix] = -58;
          if (arr[ix] < -58) arr[ix] = 58;
        } else if (weather === 'DUST_STORM') {
          arr[ix] += dt * (9.5 + (i % 4) * 1.8);
          arr[iz] += dt * 2.8;
          arr[iy] += Math.sin(t * 2.2 + i) * dt * 0.7;
          if (arr[ix] > 58) arr[ix] = -58;
          if (arr[iz] > 28) arr[iz] = -68;
          if (arr[iy] < 0.8) arr[iy] = 41;
          if (arr[iy] > 41) arr[iy] = 1;
        } else if (weather === 'SOLAR_ASH' || weather === 'BIO_SPORES' || weather === 'PLASMA_SPARKS') {
          const rise = weather === 'PLASMA_SPARKS' ? 4.4 : weather === 'SOLAR_ASH' ? 3.2 : 2.1;
          arr[iy] += dt * (rise + (i % 4) * 0.35);
          arr[ix] += Math.cos(t * 1.1 + i) * dt * 0.9;
          arr[iz] += Math.sin(t * 0.9 + i) * dt * 0.9;
          if (arr[iy] > 41) arr[iy] = 0.8;
        } else {
          arr[iy] += dt * 0.85;
          if (arr[iy] > 41) arr[iy] = 0.8;
        }
      }
      posAttr.needsUpdate = true;
      dustRef.current.rotation.y = weather === 'DATA_MOTES' || weather === 'STAR_EMBERS' ? t * 0.04 : 0;
    }

    // Rising energy pulse rings along the 4 diagonal conduit towers
    for (let i = 0; i < CONDUIT_TOWER_ANGLES.length; i++) {
      const ring = conduitRingRefs.current[i];
      if (!ring) continue;
      const cycle = ((t * 0.38 + i * 0.25) % 1);
      ring.position.y = 2 + cycle * 26;
      ring.scale.setScalar(1 + Math.sin(cycle * Math.PI) * 0.22);
    }

    // Gentle hover & pulse for floating holographic jump pad gates
    for (let i = 0; i < jumpGateRefs.current.length; i++) {
      const gate = jumpGateRefs.current[i];
      if (!gate) continue;
      gate.position.y = 1.35 + Math.sin(t * 3.1 + i * 1.1) * 0.2;
      gate.rotation.z += dt * 1.2;
    }

    // Living hangar overhead cargo drones
    for (let i = 0; i < CARGO_DRONE_CONFIGS.length; i++) {
      const grp = ambientDroneRefs.current[i];
      if (!grp) continue;
      const cfg = CARGO_DRONE_CONFIGS[i];
      const ang = t * cfg.speed + cfg.phase;
      const nx = Math.cos(ang) * cfg.rx;
      const nz = -10 + Math.sin(ang) * cfg.rz;
      const ny = cfg.y + Math.sin(t * 1.3 + i) * 1.1;
      grp.position.set(nx, ny, nz);
      grp.rotation.y = -ang + (cfg.speed > 0 ? Math.PI : 0);
    }

    // Gliding overhead gantry searchlights
    if (gantryLeftRef.current) {
      gantryLeftRef.current.position.z = -10 + Math.sin(t * 0.28) * 24;
      gantryLeftRef.current.rotation.z = Math.sin(t * 0.7) * 0.14;
    }
    if (gantryRightRef.current) {
      gantryRightRef.current.position.z = -10 + Math.cos(t * 0.24) * 24;
      gantryRightRef.current.rotation.z = -Math.sin(t * 0.65) * 0.14;
    }

    // Pulsing perimeter holographic status beacons
    for (let i = 0; i < HOLO_PYLON_ANGLES.length; i++) {
      const beam = holoBeaconRefs.current[i];
      if (!beam) continue;
      const mat = beam.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.22 + Math.sin(t * 2.5 + i * 1.4) * 0.1;
    }
  });

  const weatherVisual = getWeatherVisual(theme.weather, theme);
  const isDeepSpace = theme.skyMode === 'DEEP_SPACE';
  const isEarthDay = theme.skyMode === 'EARTH_DAY';
  let jumpPadRenderIdx = 0;

  return (
    <group>
      {/* Dynamic Sector Atmospheric Background & Biome Fog */}
      <color attach="background" args={[theme.bgColor]} />
      <fogExp2 attach="fog" args={[theme.fogColor, theme.fogDensity]} />

      {/* Chapter-Specific World Skies & Macro Scenery */}
      {isDeepSpace && <SpaceBackdrop />}
      {theme.skyMode === 'ENCLOSED_BUNKER' && (
        <UndergroundLabWorld
          theme={theme}
          wallMat={materials.wallMat}
          crateMat={materials.crateMat}
          primaryGlowMat={materials.primaryGlowMat}
          secondaryGlowMat={materials.secondaryGlowMat}
        />
      )}
      {isEarthDay && <EarthOpenFieldWorld theme={theme} />}
      {theme.skyMode === 'LAUNCH_DUSK' && (
        <RocketLaunchWorld theme={theme} wallMat={materials.wallMat} crateMat={materials.crateMat} />
      )}
      {theme.skyMode === 'ORBITAL_HORIZON' && (
        <OrbitalStratosphereWorld
          theme={theme}
          wallMat={materials.wallMat}
          primaryGlowMat={materials.primaryGlowMat}
          secondaryGlowMat={materials.secondaryGlowMat}
        />
      )}

      {/* Balanced Chapter-Aware Lighting */}
      <hemisphereLight args={[theme.keyLightColor, theme.floorColor, isEarthDay ? 1.75 : 1.35]} />
      <ambientLight intensity={isEarthDay ? 0.85 : 0.68} color="#cbd5e1" />
      <directionalLight
        position={[25, 55, 10]}
        intensity={isEarthDay ? 3.25 : 2.8}
        color={theme.keyLightColor}
        castShadow={enableShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={180}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight position={[-30, 35, -50]} intensity={isEarthDay ? 1.15 : 1.55} color={theme.rimLightColor} />

      {/* Accent Fill Lights (decay=0 for wide arena illumination) */}
      <pointLight position={[-42, 18, -38]} intensity={isEarthDay ? 0.9 : 2.4} color={theme.primaryGlow} distance={115} decay={0} />
      <pointLight position={[42, 18, -26]} intensity={isEarthDay ? 0.9 : 2.2} color={theme.secondaryGlow} distance={115} decay={0} />
      <pointLight position={[0, 32, -40]} intensity={isEarthDay ? 0.8 : 2.4} color={theme.primaryGlow} distance={125} decay={0} />

      {/* Galactic Hangar Outer Shell, Pillars, Conduits & Signature Landmarks (Levels 41-50) */}
      {isDeepSpace && (
        <>
          <mesh geometry={domeGeometry} material={materials.solidMaterial} position={[0, -5, -10]} />
          <mesh geometry={domeGeometry} material={materials.wireframeMaterial} position={[0, -5, -10]} scale={0.99} />

          {/* 3 Subtle Angled Volumetric Ceiling Light Shafts */}
          {[
            { pos: [-18, 28, -22] as [number, number, number], rot: [0.18, 0, -0.22] as [number, number, number], color: theme.primaryGlow },
            { pos: [18, 28, -24] as [number, number, number], rot: [0.18, 0, 0.22] as [number, number, number], color: theme.secondaryGlow },
            { pos: [0, 30, -34] as [number, number, number], rot: [-0.2, 0, 0] as [number, number, number], color: theme.primaryGlow },
          ].map((shaft, idx) => (
            <mesh key={`shaft-${idx}`} position={shaft.pos} rotation={shaft.rot}>
              <coneGeometry args={[12, 56, 20, 1, true]} />
              <meshBasicMaterial
                color={shaft.color}
                transparent
                opacity={0.045}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ))}

          {/* 4 Glowing Geodesic Dome Arch Ribs */}
          {DOME_ARCH_ROTATIONS.map((rotY, idx) => (
            <group key={`arch-${idx}`} position={[0, -5, -10]} rotation={[0, rotY, 0]}>
              <mesh>
                <torusGeometry args={[83.5, 0.35, 8, 64, Math.PI]} />
                <meshBasicMaterial
                  color={idx % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow}
                  transparent
                  opacity={0.38}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}

          {/* Biome-Specific Signature 3D Architecture & Landmarks */}
          <BiomeLandmarks
            theme={theme}
            wallMat={materials.wallMat}
            crateMat={materials.crateMat}
            primaryGlowMat={materials.primaryGlowMat}
            secondaryGlowMat={materials.secondaryGlowMat}
          />

          {/* Structural Hangar Pillars & Glowing Vertical Strips */}
          {pillars.map((p, idx) => (
            <group key={idx} position={[p.x, 0, p.z]} rotation={[0, p.rotY, 0]}>
              <mesh position={[0, 18, 0]} material={materials.wallMat} castShadow receiveShadow>
                <boxGeometry args={[3.2, 36, 4.5]} />
              </mesh>
              <mesh position={[0, 2, 1.2]} material={materials.crateMat}>
                <boxGeometry args={[4.4, 4, 3.2]} />
              </mesh>
              <mesh position={[0, 18, 2.35]} material={materials.primaryGlowMat}>
                <boxGeometry args={[0.35, 28, 0.15]} />
              </mesh>
              <mesh position={[0, 36.6, 0]}>
                <sphereGeometry args={[0.55, 12, 12]} />
                <meshStandardMaterial
                  ref={idx === 0 ? beaconsRef : undefined}
                  color={theme.secondaryGlow}
                  emissive={theme.secondaryGlow}
                  emissiveIntensity={2}
                />
              </mesh>
            </group>
          ))}

          {/* 4 Tall Perimeter Energy Conduit Towers with Rising Pulse Rings */}
          {CONDUIT_TOWER_ANGLES.map((angle, idx) => {
            const tx = Math.cos(angle) * 57;
            const tz = Math.sin(angle) * 57 - 10;
            const ringColor = idx % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow;
            return (
              <group key={`conduit-tower-${idx}`} position={[tx, 0, tz]}>
                <mesh position={[0, 1.4, 0]} material={materials.wallMat} castShadow>
                  <cylinderGeometry args={[2.0, 2.6, 2.8, 8]} />
                </mesh>
                <mesh position={[0, 15, 0]}>
                  <cylinderGeometry args={[0.55, 0.55, 26, 12]} />
                  <meshBasicMaterial color={ringColor} transparent opacity={0.75} toneMapped={false} />
                </mesh>
                <mesh position={[0, 28.5, 0]} material={materials.crateMat}>
                  <cylinderGeometry args={[1.6, 1.2, 1.8, 8]} />
                </mesh>
                <mesh
                  ref={(el) => {
                    conduitRingRefs.current[idx] = el;
                  }}
                  position={[0, 6, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <torusGeometry args={[1.45, 0.14, 8, 24]} />
                  <meshBasicMaterial color={ringColor} toneMapped={false} />
                </mesh>
              </group>
            );
          })}

          {/* Elevated Perimeter Catwalk Ring */}
          <mesh position={[0, 22, -10]} rotation={[Math.PI / 2, 0, 0]} material={materials.wallMat}>
            <torusGeometry args={[62, 0.9, 8, 48]} />
          </mesh>
          <mesh position={[0, 22.8, -10]} rotation={[Math.PI / 2, 0, 0]} material={materials.primaryGlowMat}>
            <torusGeometry args={[61.1, 0.12, 6, 48]} />
          </mesh>

          {/* Overhead Rotating Holographic Ceiling Core */}
          <group ref={ceilingRingRef} position={[0, 42, -32]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.wallMat}>
              <torusGeometry args={[18, 0.8, 8, 32]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.primaryGlowMat}>
              <torusGeometry args={[15.5, 0.18, 6, 32]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.secondaryGlowMat}>
              <torusGeometry args={[9, 0.14, 6, 24]} />
            </mesh>
          </group>

          {/* Left & Right Tactical Radar Towers */}
          <group position={[-42, 0, -40]}>
            <mesh position={[0, 9, 0]} material={materials.wallMat} castShadow>
              <cylinderGeometry args={[1.2, 2.4, 18, 8]} />
            </mesh>
            <group ref={radarLeftRef} position={[0, 19, 0]}>
              <mesh rotation={[0.4, 0, 0]} material={materials.crateMat}>
                <cylinderGeometry args={[4.5, 1.0, 1.4, 12, 1, true]} />
              </mesh>
              <mesh position={[0, 1.2, 0]} material={materials.primaryGlowMat}>
                <sphereGeometry args={[0.45, 10, 10]} />
              </mesh>
            </group>
          </group>

          <group position={[42, 0, -40]}>
            <mesh position={[0, 9, 0]} material={materials.wallMat} castShadow>
              <cylinderGeometry args={[1.2, 2.4, 18, 8]} />
            </mesh>
            <group ref={radarRightRef} position={[0, 19, 0]}>
              <mesh rotation={[0.4, 0, 0]} material={materials.crateMat}>
                <cylinderGeometry args={[4.5, 1.0, 1.4, 12, 1, true]} />
              </mesh>
              <mesh position={[0, 1.2, 0]} material={materials.secondaryGlowMat}>
                <sphereGeometry args={[0.45, 10, 10]} />
              </mesh>
            </group>
          </group>
        </>
      )}

      {/* Procedural Random Obstacles, Parkour Platforms & Jump Pads */}
      {obstacles.map((prop) => {
        const glowColor = prop.accent === 'primary' ? theme.primaryGlow : theme.secondaryGlow;
        const glowMat = prop.accent === 'primary' ? materials.primaryGlowMat : materials.secondaryGlowMat;

        if (prop.kind === 'platform') {
          return (
            <group key={prop.id} position={prop.pos}>
              {/* Sleek floating deck slab */}
              <mesh material={materials.wallMat} castShadow receiveShadow>
                <boxGeometry args={prop.size} />
              </mesh>
              <mesh position={[0, prop.size[1] / 2 + 0.03, 0]} material={materials.crateMat} receiveShadow>
                <boxGeometry args={[prop.size[0] * 0.92, 0.05, prop.size[2] * 0.92]} />
              </mesh>
              {/* Neon edge perimeter trim rails */}
              <mesh position={[0, 0, prop.size[2] / 2 + 0.02]} material={glowMat}>
                <boxGeometry args={[prop.size[0], 0.12, 0.06]} />
              </mesh>
              <mesh position={[0, 0, -prop.size[2] / 2 - 0.02]} material={glowMat}>
                <boxGeometry args={[prop.size[0], 0.12, 0.06]} />
              </mesh>
              <mesh position={[prop.size[0] / 2 + 0.02, 0, 0]} material={glowMat}>
                <boxGeometry args={[0.06, 0.12, prop.size[2]]} />
              </mesh>
              <mesh position={[-prop.size[0] / 2 - 0.02, 0, 0]} material={glowMat}>
                <boxGeometry args={[0.06, 0.12, prop.size[2]]} />
              </mesh>
              {/* Twin glowing anti-gravity thruster rings beneath platform */}
              {[-prop.size[0] * 0.28, prop.size[0] * 0.28].map((xOff, idx) => (
                <mesh
                  key={idx}
                  position={[xOff, -prop.size[1] / 2 - 0.08, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <torusGeometry args={[0.62, 0.075, 8, 24]} />
                  <meshBasicMaterial color={glowColor} toneMapped={false} />
                </mesh>
              ))}
            </group>
          );
        }

        if (prop.kind === 'jumppad') {
          const gateIdx = jumpPadRenderIdx++;
          return (
            <group key={prop.id} position={prop.pos}>
              <mesh material={materials.wallMat} receiveShadow>
                <cylinderGeometry args={[1.28, 1.45, 0.22, 8]} />
              </mesh>
              <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.92, 1.18, 24]} />
                <meshBasicMaterial color="#22d3ee" toneMapped={false} />
              </mesh>
              <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.58, 24]} />
                <meshBasicMaterial color="#34d399" toneMapped={false} />
              </mesh>
              {/* Translucent upward antigrav energy column */}
              <mesh position={[0, 0.85, 0]}>
                <cylinderGeometry args={[0.98, 1.12, 1.5, 24, 1, true]} />
                <meshBasicMaterial
                  color="#22d3ee"
                  transparent
                  opacity={0.28}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
              {/* Floating Holographic Jump Ring Gate */}
              <mesh
                ref={(el) => {
                  jumpGateRefs.current[gateIdx] = el;
                }}
                position={[0, 1.35, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[1.15, 0.08, 10, 32]} />
                <meshBasicMaterial color={glowColor} toneMapped={false} />
              </mesh>
            </group>
          );
        }

        const isStructural = prop.kind === 'wall' || prop.kind === 'tower';
        const bodyMat = isStructural ? materials.wallMat : materials.crateMat;
        const capMat = isStructural ? materials.crateMat : materials.wallMat;
        return (
          <group key={prop.id} position={prop.pos}>
            <mesh material={bodyMat} castShadow receiveShadow>
              <boxGeometry args={prop.size} />
            </mesh>
            {/* Chamfered/Stepped Top Cap on Walls & Towers */}
            {isStructural && (
              <mesh position={[0, prop.size[1] / 2 + 0.14, 0]} material={capMat} castShadow receiveShadow>
                <boxGeometry args={[prop.size[0] * 0.9, 0.28, prop.size[2] * 0.9]} />
              </mesh>
            )}
            {/* Top glowing tactical trim */}
            <mesh position={[0, prop.size[1] / 2 + (isStructural ? 0.3 : 0.04), 0]} material={glowMat}>
              <boxGeometry args={[prop.size[0] * 0.82, 0.08, prop.size[2] * 0.24]} />
            </mesh>
            {/* Base warning border & vertical light strips on towers/walls */}
            {isStructural && (
              <>
                <mesh position={[0, -prop.size[1] / 2 + 0.15, 0]} material={glowMat}>
                  <boxGeometry args={[prop.size[0] + 0.04, 0.12, prop.size[2] + 0.04]} />
                </mesh>
                {prop.kind === 'tower' && (
                  <>
                    <mesh position={[0, 0, prop.size[2] / 2 + 0.03]} material={glowMat}>
                      <boxGeometry args={[0.16, prop.size[1] * 0.8, 0.06]} />
                    </mesh>
                    <mesh position={[0, 0, -prop.size[2] / 2 - 0.03]} material={glowMat}>
                      <boxGeometry args={[0.16, prop.size[1] * 0.8, 0.06]} />
                    </mesh>
                  </>
                )}
              </>
            )}
          </group>
        );
      })}

      {/* Ambient Hangar Drones, Gantries & Holographic Pylons (Galactic & Orbital Chapters) */}
      {(isDeepSpace || theme.skyMode === 'ORBITAL_HORIZON') && (
        <>
          {CARGO_DRONE_CONFIGS.map((cfg, idx) => (
            <group
              key={`cargo-${idx}`}
              ref={(el) => {
                ambientDroneRefs.current[idx] = el;
              }}
              position={[cfg.rx, cfg.y, -10]}
            >
              <mesh material={materials.crateMat}>
                <boxGeometry args={[2.2, 0.9, 3.2]} />
              </mesh>
              <mesh position={[0, -0.7, 0]} material={materials.wallMat}>
                <boxGeometry args={[1.6, 0.7, 2.0]} />
              </mesh>
              {[-1.3, 1.3].map((tx, tIdx) => (
                <mesh key={tIdx} position={[tx, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.25, 0.35, 1.4, 8]} />
                  <meshBasicMaterial color={idx % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow} toneMapped={false} />
                </mesh>
              ))}
            </group>
          ))}

          {/* 4 Perimeter Holographic Status Pylons */}
          {HOLO_PYLON_ANGLES.map((angle, idx) => {
            const px = Math.cos(angle) * 52;
            const pz = Math.sin(angle) * 52 - 10;
            const rotY = -angle + Math.PI / 2;
            return (
              <group key={`holo-${idx}`} position={[px, 0, pz]} rotation={[0, rotY, 0]}>
                <mesh position={[0, 1.1, 0]} material={materials.wallMat}>
                  <cylinderGeometry args={[0.9, 1.3, 2.2, 8]} />
                </mesh>
                <mesh position={[0, 4.2, 0]}>
                  <planeGeometry args={[2.6, 3.4]} />
                  <meshBasicMaterial
                    color={idx % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow}
                    transparent
                    opacity={0.22}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
                <mesh
                  ref={(el) => {
                    holoBeaconRefs.current[idx] = el;
                  }}
                  position={[0, 6.5, 0]}
                >
                  <cylinderGeometry args={[0.16, 0.35, 9, 10, 1, true]} />
                  <meshBasicMaterial
                    color={idx % 2 === 0 ? theme.primaryGlow : theme.secondaryGlow}
                    transparent
                    opacity={0.22}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            );
          })}
        </>
      )}

      {/* 2 Gliding Overhead Searchlight Beams (Galactic Hangar & Rocket Launch) */}
      {(isDeepSpace || theme.skyMode === 'LAUNCH_DUSK') && (
        <>
          <group ref={gantryLeftRef} position={[-22, 33, -10]}>
            <mesh material={materials.wallMat}>
              <boxGeometry args={[2.8, 0.8, 1.8]} />
            </mesh>
            <mesh position={[0, -14, 0]}>
              <coneGeometry args={[7.5, 28, 16, 1, true]} />
              <meshBasicMaterial
                color={theme.primaryGlow}
                transparent
                opacity={0.07}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>

          <group ref={gantryRightRef} position={[22, 33, -10]}>
            <mesh material={materials.wallMat}>
              <boxGeometry args={[2.8, 0.8, 1.8]} />
            </mesh>
            <mesh position={[0, -14, 0]}>
              <coneGeometry args={[7.5, 28, 16, 1, true]} />
              <meshBasicMaterial
                color={theme.secondaryGlow}
                transparent
                opacity={0.07}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        </>
      )}

      {/* Floor Energy Conduit Strips & Tactical Spawn Pad */}
      {!isEarthDay &&
        [
          { pos: [-14, 0.03, 14] as [number, number, number], args: [24, 0.02, 0.24] as [number, number, number] },
          { pos: [14, 0.03, 14] as [number, number, number], args: [24, 0.02, 0.24] as [number, number, number] },
          { pos: [0, 0.03, -8] as [number, number, number], args: [0.28, 0.02, 40] as [number, number, number] },
        ].map((conduit, idx) => (
          <mesh key={`conduit-${idx}`} position={conduit.pos}>
            <boxGeometry args={conduit.args} />
            <meshBasicMaterial
              color={idx === 2 ? theme.secondaryGlow : theme.primaryGlow}
              transparent
              opacity={0.42}
              toneMapped={false}
            />
          </mesh>
        ))}

      {/* Glowing Tactical Spawn Pad under Player Start (0, 0.05, 14) */}
      <group position={[0, 0.05, 14]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.1, 2.35, 48]} />
          <meshBasicMaterial color={theme.primaryGlow} transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.25, 32]} />
          <meshBasicMaterial color={theme.secondaryGlow} transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} material={materials.crateMat}>
          <circleGeometry args={[2.1, 32]} />
        </mesh>
      </group>

      {/* Main Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[280, 280]} />
        <primitive object={materials.floorMaterial} attach="material" />
      </mesh>

      {/* Floor Grid Overlay */}
      <gridHelper
        key={theme.id}
        args={[180, 90, theme.gridPrimary, theme.gridSecondary]}
        position={[0, 0.04, -10]}
        material-opacity={isEarthDay ? 0.05 : 0.22}
        material-transparent
      />

      {/* Concentric Range Distance Rings & Radar Sweep (hidden on natural Earth Meadow) */}
      {!isEarthDay && (
        <>
          {[18, 34, 50].map((r, i) => (
            <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -10]}>
              <ringGeometry args={[r - 0.15, r, 64]} />
              <meshBasicMaterial color={i === 1 ? theme.secondaryGlow : theme.primaryGlow} transparent opacity={0.35} />
            </mesh>
          ))}

          <mesh ref={sweepRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, -10]}>
            <ringGeometry args={[2, 54, 48, 1, 0, 0.12]} />
            <meshBasicMaterial color={theme.primaryGlow} transparent opacity={0.14} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Dynamic Biome Weather & Energy Particles */}
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          color={weatherVisual.color}
          size={weatherVisual.size}
          transparent
          opacity={weatherVisual.opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
