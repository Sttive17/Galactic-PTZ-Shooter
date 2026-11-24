import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/gameState';

const COMET_COUNT = 5;

const _upAxis = new THREE.Vector3(0, 1, 0);
const _cometDir = new THREE.Vector3();
const _cometPos = new THREE.Vector3();

const NEBULA_VERTEX = `
  varying vec3 vWorldDir;

  void main() {
    vWorldDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAGMENT = `
  varying vec3 vWorldDir;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  float trigFbm(vec3 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      float wave = sin(p.x * 2.1 + uTime * 0.04) * cos(p.y * 2.4 - uTime * 0.03)
                 + sin(p.z * 2.3 + p.x * 1.4 - uTime * 0.025);
      v += amp * (wave * 0.5);
      p = p * 1.95 + vec3(1.7, 2.3, 1.1);
      amp *= 0.5;
    }
    return v * 0.5 + 0.5;
  }

  void main() {
    vec3 dir = normalize(vWorldDir);
    float n1 = smoothstep(0.30, 0.86, trigFbm(dir * 2.2));
    float n2 = smoothstep(0.34, 0.88, trigFbm(dir * 3.1 + vec3(2.4, -1.3, 0.8)));
    float horizonMask = smoothstep(-0.25, 0.35, dir.y);

    vec3 col = mix(uColorA, uColorB, n1);
    col = mix(col, uColorC, n2 * 0.68);

    float alpha = (n1 * 0.38 + n2 * 0.28) * horizonMask;
    gl_FragColor = vec4(col, alpha);
  }
`;

const AURORA_VERTEX = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uWaveSpeed;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(uv.x * 12.0 + uTime * uWaveSpeed) * 4.5 + cos(uv.x * 21.0 - uTime * uWaveSpeed * 0.7) * 2.2;
    pos.x += wave * (0.3 + uv.y * 0.7);
    pos.z += cos(uv.x * 10.0 + uTime * uWaveSpeed * 0.8) * 3.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const AURORA_FRAGMENT = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uPhase;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  void main() {
    float edgeX = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
    float edgeY = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
    float curtain = 0.55 + 0.45 * sin(vUv.x * 28.0 + uTime * 0.55 + uPhase + sin(vUv.x * 11.0 - uTime * 0.35) * 2.0);
    float shimmer = 0.75 + 0.25 * sin(vUv.y * 9.0 - uTime * 0.9 + vUv.x * 8.0);

    vec3 tintC = max(uColorC, vec3(0.14));
    vec3 tintB = max(uColorB, vec3(0.14));

    vec3 col = mix(tintC, tintB, smoothstep(0.15, 0.58, vUv.y));
    col = mix(col, mix(tintB, vec3(1.0), 0.22), smoothstep(0.58, 0.92, vUv.y));

    float alpha = edgeX * edgeY * curtain * shimmer * 0.36;
    gl_FragColor = vec4(col, alpha);
  }
`;

interface CometState {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
  progress: number;
  cooldown: number;
  maxDist: number;
}

const COMET_COLORS = ['#e0f2fe', '#7dd3fc', '#c084fc', '#fde68a', '#67e8f9'];

export const SpaceBackdrop = () => {
  const graphics = useGameStore((state) => state.settings.graphics);
  const activeStarCount = graphics?.starCount ?? 1000;
  const complexShaders = graphics?.complexShaders ?? false;

  const starRef = useRef<THREE.Points>(null);
  const starMatRef = useRef<THREE.PointsMaterial>(null);
  const sunCorona1Ref = useRef<THREE.Mesh>(null);
  const sunCorona2Ref = useRef<THREE.Mesh>(null);
  const gasGiantRef = useRef<THREE.Group>(null);
  const icePlanetRef = useRef<THREE.Mesh>(null);
  const crimsonMoonRef = useRef<THREE.Mesh>(null);
  const stationRef = useRef<THREE.Group>(null);
  const ship1Ref = useRef<THREE.Group>(null);
  const ship2Ref = useRef<THREE.Group>(null);
  const beacon1MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const beacon2MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const cometRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Procedural multi-tinted Starfield (dynamic count based on GPU capability)
  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(activeStarCount * 3);
    const colors = new Float32Array(activeStarCount * 3);
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#7dd3fc'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#fde68a'),
    ];

    for (let i = 0; i < activeStarCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const radius = 255 + Math.random() * 170;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) - 35;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const c = palette[Math.floor(Math.random() * palette.length)];
      const brightness = 0.55 + Math.random() * 0.45;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [activeStarCount]);

  const theme = useGameStore((state) => state.currentMap.theme);

  // Procedural GLSL Cosmic Nebula Clouds Sky Sphere
  const nebula = useMemo(() => {
    const initialTheme = useGameStore.getState().currentMap.theme;
    const geo = new THREE.SphereGeometry(380, 32, 24);
    const mat = new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERTEX,
      fragmentShader: NEBULA_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(...initialTheme.skyTintA) },
        uColorB: { value: new THREE.Color(...initialTheme.skyTintB) },
        uColorC: { value: new THREE.Color(...initialTheme.skyTintC) },
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      fog: false,
    });
    return { geo, mat };
  }, []);

  // 3 Animated Aurora Borealis Curtain Ribbons
  const auroraRibbons = useMemo(() => {
    const initialTheme = useGameStore.getState().currentMap.theme;
    const configs = [
      { radius: 155, height: 42, y: 74, thetaStart: Math.PI * 0.85, thetaLength: 0.95, rotZ: 0.14, phase: 0.0, speed: 0.55 },
      { radius: 168, height: 36, y: 88, thetaStart: Math.PI * 1.15, thetaLength: 0.8, rotZ: -0.1, phase: 2.1, speed: 0.42 },
      { radius: 162, height: 44, y: 78, thetaStart: Math.PI * 0.25, thetaLength: 1.05, rotZ: 0.08, phase: 4.3, speed: 0.48 },
    ];

    return configs.map((cfg) => {
      const geo = new THREE.CylinderGeometry(
        cfg.radius,
        cfg.radius * 0.96,
        cfg.height,
        64,
        6,
        true,
        cfg.thetaStart,
        cfg.thetaLength
      );
      const mat = new THREE.ShaderMaterial({
        vertexShader: AURORA_VERTEX,
        fragmentShader: AURORA_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: cfg.phase },
          uWaveSpeed: { value: cfg.speed },
          uColorB: { value: new THREE.Color(...initialTheme.skyTintB) },
          uColorC: { value: new THREE.Color(...initialTheme.skyTintC) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      return { geo, mat, y: cfg.y, rotZ: cfg.rotZ };
    });
  }, []);

  // 5 Shooting Stars / Comets shared resources
  const cometGeo = useMemo(() => new THREE.CylinderGeometry(0.08, 0.6, 26, 8), []);
  const cometMaterials = useMemo(
    () =>
      COMET_COLORS.map(
        (col) =>
          new THREE.MeshBasicMaterial({
            color: col,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
            fog: false,
          })
      ),
    []
  );

  const cometStates = useRef<CometState[]>(
    Array.from({ length: COMET_COUNT }, (_, idx) => {
      const angle = (idx / COMET_COUNT) * Math.PI * 2 + 0.4;
      return {
        origin: new THREE.Vector3(Math.cos(angle) * 260, 120 + (idx % 3) * 35, Math.sin(angle) * 260),
        dir: new THREE.Vector3(-Math.sin(angle), -0.25 - (idx % 2) * 0.15, Math.cos(angle)).normalize(),
        speed: 95 + idx * 18,
        progress: 0,
        cooldown: idx * 2.2,
        maxDist: 340,
      };
    })
  );

  // Sync outer space nebula & aurora shaders with the active biome palette
  useEffect(() => {
    nebula.mat.uniforms.uColorA.value.setRGB(...theme.skyTintA);
    nebula.mat.uniforms.uColorB.value.setRGB(...theme.skyTintB);
    nebula.mat.uniforms.uColorC.value.setRGB(...theme.skyTintC);
    for (const ribbon of auroraRibbons) {
      ribbon.mat.uniforms.uColorB.value.setRGB(...theme.skyTintB);
      ribbon.mat.uniforms.uColorC.value.setRGB(...theme.skyTintC);
    }
  }, [theme, nebula, auroraRibbons]);

  useEffect(() => {
    return () => {
      starGeo.dispose();
      nebula.geo.dispose();
      nebula.mat.dispose();
      cometGeo.dispose();
      cometMaterials.forEach((m) => m.dispose());
      auroraRibbons.forEach((r) => {
        r.geo.dispose();
        r.mat.dispose();
      });
    };
  }, [starGeo, nebula, cometGeo, cometMaterials, auroraRibbons]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (starRef.current) {
      starRef.current.rotation.y += dt * 0.008;
    }
    if (starMatRef.current) {
      starMatRef.current.size = 1.55 + Math.sin(t * 2.4) * 0.22;
      starMatRef.current.opacity = 0.86 + Math.cos(t * 1.9) * 0.1;
    }

    if (complexShaders) {
      nebula.mat.uniforms.uTime.value = t;
      auroraRibbons.forEach((r) => {
        r.mat.uniforms.uTime.value = t;
      });
    }

    if (sunCorona1Ref.current) {
      sunCorona1Ref.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.05);
    }
    if (sunCorona2Ref.current) {
      sunCorona2Ref.current.scale.setScalar(1 + Math.cos(t * 0.9) * 0.07);
    }

    if (gasGiantRef.current) {
      gasGiantRef.current.rotation.y += dt * 0.03;
    }
    if (icePlanetRef.current) {
      icePlanetRef.current.rotation.y -= dt * 0.045;
    }
    if (crimsonMoonRef.current) {
      crimsonMoonRef.current.rotation.y += dt * 0.025;
    }

    // Distant orbital ring station slow rotation
    if (stationRef.current) {
      stationRef.current.rotation.y += dt * 0.045;
    }

    // 2 Passing starships orbiting beyond the geodesic dome
    if (ship1Ref.current) {
      const a1 = t * 0.09;
      ship1Ref.current.position.set(Math.cos(a1) * 185, 68 + Math.sin(t * 0.4) * 5, -10 + Math.sin(a1) * 185);
      ship1Ref.current.rotation.y = -a1;
    }
    if (ship2Ref.current) {
      const a2 = -t * 0.065 + 2.4;
      ship2Ref.current.position.set(Math.cos(a2) * 215, 86 + Math.cos(t * 0.35) * 6, -10 + Math.sin(a2) * 215);
      ship2Ref.current.rotation.y = -a2 + Math.PI;
    }

    const blink1 = Math.sin(t * 5.2) > 0.25 ? 1 : 0.15;
    const blink2 = Math.cos(t * 4.4) > 0.25 ? 1 : 0.15;
    if (beacon1MatRef.current) beacon1MatRef.current.opacity = blink1;
    if (beacon2MatRef.current) beacon2MatRef.current.opacity = blink2;

    // 5 Shooting Stars / Comets streaking across space
    for (let i = 0; i < COMET_COUNT; i++) {
      const st = cometStates.current[i];
      const mesh = cometRefs.current[i];
      const mat = cometMaterials[i];
      if (!mesh || !mat) continue;

      if (st.cooldown > 0) {
        st.cooldown -= dt;
        mesh.visible = false;
        mat.opacity = 0;
        continue;
      }

      st.progress += st.speed * dt;
      if (st.progress >= st.maxDist) {
        const theta = Math.random() * Math.PI * 2;
        const elev = 95 + Math.random() * 90;
        const dist = 250 + Math.random() * 30;
        st.origin.set(Math.cos(theta) * dist, elev, Math.sin(theta) * dist);
        _cometDir
          .set(-Math.sin(theta) + (Math.random() - 0.5) * 0.6, -0.22 - Math.random() * 0.2, Math.cos(theta) + (Math.random() - 0.5) * 0.6)
          .normalize();
        st.dir.copy(_cometDir);
        st.progress = 0;
        st.cooldown = 2.0 + Math.random() * 4.5;
        mesh.visible = false;
        mat.opacity = 0;
        continue;
      }

      const norm = st.progress / st.maxDist;
      const fade = Math.sin(norm * Math.PI);
      _cometPos.copy(st.origin).addScaledVector(st.dir, st.progress);
      mesh.position.copy(_cometPos);
      mesh.quaternion.setFromUnitVectors(_upAxis, st.dir);
      mesh.visible = true;
      mat.opacity = fade * 0.85;
    }

    for (const ribbon of auroraRibbons) {
      ribbon.mat.uniforms.uTime.value = t;
    }
  });

  return (
    <group>
      {/* Procedural GLSL Cosmic Nebula Sky Sphere (Only when enabled in graphics settings) */}
      {complexShaders && <mesh geometry={nebula.geo} material={nebula.mat} />}

      {/* Distant Multi-Colored 2,600 Starfield */}
      <points ref={starRef} geometry={starGeo}>
        <pointsMaterial
          ref={starMatRef}
          size={1.6}
          vertexColors
          transparent
          opacity={0.92}
          sizeAttenuation
          fog={false}
          depthWrite={false}
        />
      </points>

      {/* 5 Animated Shooting Stars / Comets */}
      {cometMaterials.map((mat, idx) => (
        <mesh
          key={`comet-${idx}`}
          ref={(el) => {
            cometRefs.current[idx] = el;
          }}
          geometry={cometGeo}
          material={mat}
          visible={false}
        />
      ))}

      {/* Glowing Sun + Dual Additive Corona Halos */}
      <group position={[135, 115, -240]}>
        <mesh>
          <sphereGeometry args={[22, 32, 32]} />
          <meshBasicMaterial color="#fffbeb" fog={false} />
        </mesh>
        <mesh ref={sunCorona1Ref}>
          <sphereGeometry args={[28, 32, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.34}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
        <mesh ref={sunCorona2Ref}>
          <sphereGeometry args={[40, 32, 32]} />
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
        {/* 3rd Wide Outer Solar Flare Halo */}
        <mesh>
          <sphereGeometry args={[58, 32, 32]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* Planet 1: Ringed Gas Giant */}
      <group ref={gasGiantRef} position={[-145, 76, -210]}>
        <mesh>
          <sphereGeometry args={[25, 32, 32]} />
          <meshStandardMaterial
            color="#d97706"
            emissive="#78350f"
            emissiveIntensity={0.28}
            roughness={0.75}
            metalness={0.1}
            fog={false}
          />
        </mesh>
        <mesh scale={[1.005, 0.24, 1.005]}>
          <sphereGeometry args={[25, 32, 16]} />
          <meshStandardMaterial
            color="#9a3412"
            emissive="#431407"
            emissiveIntensity={0.2}
            roughness={0.8}
            fog={false}
          />
        </mesh>
        <mesh rotation={[Math.PI * 0.38, 0.25, 0]}>
          <ringGeometry args={[31, 43, 64]} />
          <meshBasicMaterial color="#fcd34d" transparent opacity={0.34} side={THREE.DoubleSide} fog={false} />
        </mesh>
        <mesh rotation={[Math.PI * 0.38, 0.25, 0]}>
          <ringGeometry args={[45, 51, 64]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.2} side={THREE.DoubleSide} fog={false} />
        </mesh>
      </group>

      {/* Planet 2: Cyan Ice Exoplanet with Atmospheric Glow Shell */}
      <group position={[155, 52, -145]}>
        <mesh ref={icePlanetRef}>
          <sphereGeometry args={[14, 32, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0369a1"
            emissiveIntensity={0.3}
            roughness={0.45}
            metalness={0.2}
            fog={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[15.4, 32, 32]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* Planet 3: Crimson Moon behind/beside capsule */}
      <mesh ref={crimsonMoonRef} position={[-95, 105, 165]}>
        <sphereGeometry args={[11, 28, 28]} />
        <meshStandardMaterial
          color="#be123c"
          emissive="#4c0519"
          emissiveIntensity={0.28}
          roughness={0.85}
          metalness={0.05}
          fog={false}
        />
      </mesh>

      {/* Distant Orbital Ring Station */}
      <group ref={stationRef} position={[42, 92, -195]} rotation={[0.42, 0.2, -0.18]}>
        <mesh>
          <torusGeometry args={[18, 1.4, 12, 48]} />
          <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.3} fog={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[18, 0.35, 8, 48]} />
          <meshBasicMaterial color="#22d3ee" toneMapped={false} fog={false} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[2.2, 2.2, 22, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.32} fog={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[36, 0.8, 1.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.4} fog={false} />
        </mesh>
        <mesh position={[0, 11.5, 0]}>
          <sphereGeometry args={[1.2, 12, 12]} />
          <meshBasicMaterial color="#a855f7" toneMapped={false} fog={false} />
        </mesh>
      </group>

      {/* Passing Starship 1 */}
      <group ref={ship1Ref} position={[185, 68, -10]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.8, 11, 6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.28} fog={false} />
        </mesh>
        <mesh position={[0, 0, 1]}>
          <boxGeometry args={[9, 0.35, 3.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} fog={false} />
        </mesh>
        <mesh position={[0, 0, 5.8]}>
          <sphereGeometry args={[1.0, 10, 10]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} fog={false} />
        </mesh>
        <mesh position={[4.5, 0.3, 1.2]}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshBasicMaterial ref={beacon1MatRef} color="#f43f5e" transparent opacity={1} toneMapped={false} fog={false} />
        </mesh>
      </group>

      {/* Passing Starship 2 */}
      <group ref={ship2Ref} position={[-215, 86, -10]}>
        <mesh>
          <boxGeometry args={[3.4, 2.2, 14]} />
          <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.32} fog={false} />
        </mesh>
        <mesh position={[0, 0.4, -7.2]}>
          <boxGeometry args={[5.5, 1.2, 2.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.32} fog={false} />
        </mesh>
        <mesh position={[0, 0, 7.2]}>
          <sphereGeometry args={[1.2, 10, 10]} />
          <meshBasicMaterial color="#fbbf24" toneMapped={false} fog={false} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial ref={beacon2MatRef} color="#22d3ee" transparent opacity={1} toneMapped={false} fog={false} />
        </mesh>
      </group>

      {/* 3 Animated Aurora Borealis Ribbons */}
      {complexShaders &&
        auroraRibbons.map((ribbon, idx) => (
          <mesh
            key={idx}
            geometry={ribbon.geo}
            material={ribbon.mat}
            position={[0, ribbon.y, -10]}
            rotation={[0, 0, ribbon.rotZ]}
          />
        ))}
    </group>
  );
};
