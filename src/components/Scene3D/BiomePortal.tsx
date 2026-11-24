import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/gameState';
import { CHAPTER_META } from '../../game/mapGenerator';
import { SceneState } from '../../game/sceneState';
import { playPortalWarp } from '../../game/AudioSystem';

const PORTAL_X = 0;
const PORTAL_Z = -10;

const PORTAL_VORTEX_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PORTAL_VORTEX_FRAGMENT = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;

    float safeLen = abs(p.x) + abs(p.y);
    float angle = safeLen > 0.0001 ? atan(p.y, p.x) : 0.0;

    float spiral = sin(angle * 5.0 - r * 14.0 + uTime * 5.2) * 0.5 + 0.5;
    float ripples = sin(r * 22.0 - uTime * 7.5) * 0.5 + 0.5;
    float core = exp(-r * 3.8);
    float rim = smoothstep(0.68, 0.98, r) * (1.0 - smoothstep(0.96, 1.0, r));

    vec3 col = mix(uColor * 0.55, vec3(1.0), core * 0.85 + rim * 0.65);
    col += uColor * (spiral * 0.5 + ripples * 0.35);

    float alpha = clamp(core * 0.95 + spiral * 0.45 * (1.0 - r * 0.6) + rim * 0.9, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const BiomePortal = () => {
  const mode = useGameStore((state) => state.mode);
  const roundState = useGameStore((state) => state.roundState);
  const portalTransition = useGameStore((state) => state.portalTransition);
  const enterChapterPortal = useGameStore((state) => state.enterChapterPortal);

  const isVisible =
    (mode === 'CHALLENGE' || mode === 'TRAINING') &&
    (roundState === 'PORTAL_ACTIVE' || roundState === 'WARP_CINEMATIC');

  const accentHex = portalTransition
    ? CHAPTER_META[portalTransition.toChapter].accentHex
    : '#22d3ee';

  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const pulseBaseRef = useRef<THREE.Mesh>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (roundState === 'PORTAL_ACTIVE') {
      triggeredRef.current = false;
    }
  }, [roundState]);

  const vortexMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PORTAL_VORTEX_VERTEX,
      fragmentShader: PORTAL_VORTEX_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#22d3ee') },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
  }, []);

  useEffect(() => {
    vortexMat.uniforms.uColor.value.set(accentHex);
  }, [accentHex, vortexMat]);

  useEffect(() => () => vortexMat.dispose(), [vortexMat]);

  useFrame(({ clock }, delta) => {
    if (!isVisible) return;
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    vortexMat.uniforms.uTime.value = t;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += dt * 1.45;
      outerRingRef.current.rotation.y = Math.sin(t * 0.9) * 0.14;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= dt * 2.3;
      innerRingRef.current.rotation.x = Math.cos(t * 1.1) * 0.12;
    }
    if (pulseBaseRef.current) {
      const s = 1 + Math.sin(t * 3.8) * 0.16;
      pulseBaseRef.current.scale.set(s, s, 1);
    }

    const dx = SceneState.playerPosition.x - PORTAL_X;
    const dz = SceneState.playerPosition.z - PORTAL_Z;
    const flatDist = Math.hypot(dx, dz);
    SceneState.portalDistance = flatDist;

    if (roundState === 'PORTAL_ACTIVE' && !triggeredRef.current && flatDist < 4.2) {
      triggeredRef.current = true;
      playPortalWarp();
      enterChapterPortal();
    }
  });

  if (!isVisible) return null;

  return (
    <group position={[PORTAL_X, 0, PORTAL_Z]}>
      {/* Armored Dimensional Pedestal Base */}
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <cylinderGeometry args={[3.6, 4.3, 0.44, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={pulseBaseRef}>
        <ringGeometry args={[3.1, 3.65, 40]} />
        <meshBasicMaterial color={accentHex} transparent opacity={0.85} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* Swirling Dimensional Vortex Disc */}
      <mesh position={[0, 4.0, 0]} material={vortexMat}>
        <circleGeometry args={[3.2, 48]} />
      </mesh>

      {/* Outer & Inner Counter-Rotating Stargate Energy Rings */}
      <mesh ref={outerRingRef} position={[0, 4.0, 0]}>
        <torusGeometry args={[3.45, 0.16, 12, 48]} />
        <meshBasicMaterial color={accentHex} toneMapped={false} />
      </mesh>
      <mesh ref={innerRingRef} position={[0, 4.0, 0]}>
        <torusGeometry args={[3.9, 0.09, 10, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} toneMapped={false} />
      </mesh>

      {/* Twin Anchor Pylons Flanking the Gate */}
      {[-3.95, 3.95].map((px, idx) => (
        <group key={idx} position={[px, 2.3, 0]}>
          <mesh>
            <boxGeometry args={[0.65, 4.6, 0.85]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.26} />
          </mesh>
          <mesh position={[0, 0, 0.46]}>
            <boxGeometry args={[0.16, 3.8, 0.08]} />
            <meshBasicMaterial color={accentHex} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Tall Sky-High Beacon Pillar so Player Locates Portal Immediately */}
      <mesh position={[0, 18, 0]}>
        <cylinderGeometry args={[0.85, 2.5, 36, 20, 1, true]} />
        <meshBasicMaterial
          color={accentHex}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Portal Point Light */}
      <pointLight position={[0, 4, 1.5]} color={accentHex} intensity={5} distance={28} decay={1.5} />
    </group>
  );
};
