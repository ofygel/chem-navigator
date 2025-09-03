// src/components/three/GlobalMolecularField.tsx
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useUI } from "@/store/ui";

/* ===================== Utilities ===================== */
type V3 = [number, number, number];
type Bond = [number, number];
type Atom = { p: V3; r: number; kind: "C" | "H" | "O" };

function fbm(x: number, y: number, t: number) {
  const s = Math.sin, c = Math.cos;
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * s(x * f + t * (0.6 + 0.2 * i)) * c(y * f - t * (0.7 + 0.17 * i));
    a *= 0.5; f *= 1.7;
  }
  return v;
}
function colorLerp(hexA: string, hexB: string, k: number) {
  const a = new THREE.Color(hexA);
  const b = new THREE.Color(hexB);
  return `#${a.lerp(b, THREE.MathUtils.clamp(k, 0, 1)).getHexString()}`;
}
function smoothTowards(current: number, target: number, dt: number, speed = 3) {
  const k = 1 - Math.exp(-dt * speed);
  return current + (target - current) * k;
}

/* ===================== Primitives ===================== */
function Ball({
  p, r, color, low, emissive = 0.18, kind,
}: { p: V3; r: number; color: string; low: boolean; emissive?: number; kind?: Atom["kind"] }) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    const amp = kind === "H" ? 0.02 : kind === "O" ? 0.015 : 0.01;
    const s = 1 + amp * Math.sin(t * 1.3 + r);
    mesh.current.scale.setScalar(s);
  });
  return (
    <mesh ref={mesh} position={p}>
      <sphereGeometry args={[r, low ? 14 : 22, low ? 12 : 20]} />
      {low ? (
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      ) : (
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0}
          emissive={new THREE.Color(color)}
          emissiveIntensity={emissive}
          transparent
          opacity={0.8}
        />
      )}
    </mesh>
  );
}

function BondMesh({ a, b, color, low }: { a: V3; b: V3; color: string; low: boolean }) {
  const av = useMemo(() => new THREE.Vector3(...a), [a]);
  const bv = useMemo(() => new THREE.Vector3(...b), [b]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(bv, av), [av, bv]);
  const len = dir.length();
  const mid = useMemo(() => new THREE.Vector3().addVectors(av, bv).multiplyScalar(0.5), [av, bv]);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()),
    [dir]
  );
  const r = low ? 0.034 : 0.045;
  return (
    <group position={mid.toArray() as V3} quaternion={quat}>
      <mesh position={[0, len * 0.5, 0]}>
        <cylinderGeometry args={[r, r, len, low ? 8 : 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/* ===================== Molecule presets ===================== */
function useBenzene(scale = 1) {
  return useMemo(() => {
    const R = 1.25 * scale, RH = 1.9 * scale;
    const atoms: Atom[] = []; const bonds: Bond[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      atoms.push({ p: [Math.cos(a) * R, Math.sin(a) * R, 0], r: 0.26 * scale, kind: "C" });
    }
    for (let i = 0; i < 6; i++) bonds.push([i, (i + 1) % 6]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      atoms.push({ p: [Math.cos(a) * RH, Math.sin(a) * RH, 0], r: 0.18 * scale, kind: "H" });
      bonds.push([i, 6 + i]);
    }
    return { atoms, bonds };
  }, [scale]);
}
function useMethane(scale = 1) {
  return useMemo(() => {
    const C: Atom = { p: [0, 0, 0], r: 0.28 * scale, kind: "C" };
    const t = 0.9 * scale;
    const H: Atom[] = [
      { p: [ t,  t,  t], r: 0.18 * scale, kind: "H" },
      { p: [-t, -t,  t], r: 0.18 * scale, kind: "H" },
      { p: [-t,  t, -t], r: 0.18 * scale, kind: "H" },
      { p: [ t, -t, -t], r: 0.18 * scale, kind: "H" },
    ];
    return { atoms: [C, ...H], bonds: [[0,1],[0,2],[0,3],[0,4]] as Bond[] };
  }, [scale]);
}
function useChain(scale = 1) {
  return useMemo(() => {
    const a: Atom[] = [
      { p: [-0.8 * scale, 0, 0], r: 0.26 * scale, kind: "C" },
      { p: [ 0.8 * scale, 0, 0], r: 0.26 * scale, kind: "C" },
      { p: [ 1.8 * scale, 0.5 * scale, 0], r: 0.24 * scale, kind: "O" },
      { p: [ 2.4 * scale, 1.2 * scale, 0], r: 0.18 * scale, kind: "H" },
      { p: [-1.2 * scale, 0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
      { p: [-1.2 * scale, -0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
      { p: [ 1.2 * scale, 0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
      { p: [ 1.2 * scale, -0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
    ];
    const b: Bond[] = [[0,1],[1,2],[2,3],[0,4],[0,5],[1,6],[1,7]];
    return { atoms: a, bonds: b };
  }, [scale]);
}

/* ===================== Parallax ===================== */
function Parallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  useFrame(({ mouse }, dt) => {
    const tx = mouse.y * 0.1;
    const ty = mouse.x * 0.15;
    const k = 1 - Math.exp(-dt * 4);
    group.current.rotation.x += (tx - group.current.rotation.x) * k;
    group.current.rotation.y += (ty - group.current.rotation.y) * k;
  });
  return <group ref={group}>{children}</group>;
}

/* ===================== Ion cloud (instanced) ===================== */
function IonCloud({ heatRef, count = 160, low = false }: { heatRef: MutableRefObject<number>; count?: number; low?: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        rad: 1.8 + Math.random() * 3.2,
        spd: 0.2 + Math.random() * 0.8,
        pha: Math.random() * Math.PI * 2,
        elev: (Math.random() - 0.5) * 1.8,
        jitter: Math.random() * 0.6 + 0.2,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const H = heatRef.current;
    const m = new THREE.Matrix4();
    const s = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const d = data[i];
      const w = d.spd * (0.5 + H * 1.4);
      const a = d.pha + t * w;
      const r = d.rad * (1 + 0.12 * Math.sin(t * 0.3 + i));
      const x = Math.cos(a) * r + fbm(i * 0.3, 0.2, t * 0.6) * d.jitter;
      const y = d.elev + Math.sin(a * 0.7) * 0.3 + fbm(0.2, i * 0.25, t * 0.55) * d.jitter * 0.6;
      const z = Math.sin(a) * (r * 0.55) + fbm(i * 0.17, 0.33, t * 0.7) * d.jitter * 0.8;
      const sc = low ? 0.015 : 0.02 + 0.01 * Math.min(1, H);
      m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), s.set(sc, sc, sc));
      mesh.current.setMatrixAt(i, m);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined as any, undefined as any, count]}>
      <sphereGeometry args={[1, low ? 8 : 12, low ? 8 : 12]} />
      <meshBasicMaterial color="#7ff0e8" transparent opacity={0.35} />
    </instancedMesh>
  );
}

/* ===================== Heat pulses ===================== */
function PulseRings({ heatRef }: { heatRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!);
  const pulses = useRef<Array<{ t: number; life: number }>>([]);
  const prev = useRef(heatRef.current);

  useFrame((_, dt) => {
    const h = heatRef.current;
    if (h - prev.current > 0.14) {
      pulses.current.push({ t: 0, life: 1.4 });
      if (pulses.current.length > 5) pulses.current.shift();
    }
    prev.current = h;
    pulses.current.forEach((p) => (p.t += dt));
    pulses.current = pulses.current.filter((p) => p.t < p.life);

    for (let i = 0; i < group.current.children.length; i++) {
      const mesh = group.current.children[i] as THREE.Mesh;
      const p = pulses.current[i];
      if (!p) { mesh.visible = false; continue; }
      mesh.visible = true;
      const u = p.t / p.life;
      const s = 0.8 + u * 6.0;
      mesh.scale.setScalar(s);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - u) * 0.28;
      mat.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {new Array(5).fill(0).map((_, i) => (
        <mesh key={i}>
          <ringGeometry args={[0.45, 0.48, 64]} />
          <meshBasicMaterial color="#00ffd5" transparent opacity={0.0} />
        </mesh>
      ))}
    </group>
  );
}

/* ===================== Bond sparks (instanced) ===================== */
function BondSparks({
  atoms, bonds, heatRef, low = false, perBond = 2,
}: { atoms: Atom[]; bonds: Bond[]; heatRef: MutableRefObject<number>; low?: boolean; perBond?: number }) {
  const count = bonds.length * perBond;
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const data = useMemo(() => {
    const arr: Array<{ b: number; u: number; speed: number; off: number }> = [];
    for (let i = 0; i < bonds.length; i++) {
      for (let k = 0; k < perBond; k++) {
        arr.push({
          b: i,
          u: Math.random(),
          speed: 0.5 + Math.random() * 1.2,
          off: (Math.random() - 0.5) * 0.08,
        });
      }
    }
    return arr;
  }, [bonds, perBond]);

  useFrame((_, dt) => {
    const m = new THREE.Matrix4();
    const s = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const H = heatRef.current;
    for (let i = 0; i < count; i++) {
      const d = data[i];
      const [ai, bi] = bonds[d.b];
      const a = new THREE.Vector3(...atoms[ai].p);
      const b = new THREE.Vector3(...atoms[bi].p);
      d.u = (d.u + dt * d.speed * (0.3 + H * 1.3)) % 1;
      const pos = new THREE.Vector3().lerpVectors(a, b, d.u);
      // легкий «виток» вокруг связи
      const dir = new THREE.Vector3().subVectors(b, a).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(dir, up).normalize();
      pos.addScaledVector(side, d.off * Math.sin(d.u * Math.PI * 2));
      const sc = low ? 0.035 : 0.045 + 0.02 * Math.min(1, H);
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      m.compose(pos, q, s.set(sc, sc * 2.2, sc)); // продолговатая искра
      mesh.current.setMatrixAt(i, m);
      const mat = mesh.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + 0.45 * Math.sin((d.u + i) * Math.PI * 2);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined as any, undefined as any, count]}>
      <cylinderGeometry args={[0.2, 0.0, 1, 6]} />
      <meshBasicMaterial color="#78fff5" transparent opacity={0.6} />
    </instancedMesh>
  );
}

/* ===================== Heat Haze (shader plane) ===================== */
function HeatHaze({ heatRef }: { heatRef: MutableRefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uHeat.value = heatRef.current;
  });

  const shader = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uHeat: { value: 0 },
          uColor: { value: new THREE.Color("#43f7e7") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uHeat;
          uniform vec3 uColor;

          // дешёвый шум
          float n(vec2 x){ return fract(sin(dot(x, vec2(12.9898,78.233))) * 43758.5453); }
          float noise(vec2 x){
            vec2 i = floor(x), f = fract(x);
            float a = n(i), b = n(i+vec2(1.,0.)), c = n(i+vec2(0.,1.)), d = n(i+vec2(1.,1.));
            vec2 u = f*f*(3.-2.*f);
            return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
          }

          void main(){
            // центр — сильнее «дрожит»
            vec2 uv = vUv - 0.5;
            float r = length(uv);
            float mask = smoothstep(0.9, 0.2, r); // мягкая линза в центре
            float t = uTime * (0.6 + uHeat * 0.8);

            // «мираж» — просто мерцающее свечение + шум
            float w = noise(uv * 8.0 + t) * 0.8 + noise(uv * 20.0 - t) * 0.2;
            float str = (0.04 + 0.22 * clamp(uHeat/2.0, 0., 1.)) * mask;
            vec3 col = uColor * (w * str);

            gl_FragColor = vec4(col, (w * str));
          }
        `,
      }),
    []
  );

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[20, 12, 1, 1]} />
      {/* @ts-ignore */}
      <primitive object={shader} ref={mat} attach="material" />
    </mesh>
  );
}

/* ===================== Live molecule ===================== */
function LiveMolecule({
  base, type, low, heatRef, scale = 1, yawBase = 0.1,
}: {
  base: V3; type: "benzene" | "methane" | "chain"; low: boolean; heatRef: MutableRefObject<number>;
  scale?: number; yawBase?: number;
}) {
  const cfg = {
    benzene: useBenzene(scale),
    methane: useMethane(scale * 0.95),
    chain: useChain(scale * 1.05),
  }[type];

  const group = useRef<THREE.Group>(null!);
  const target = useRef(new THREE.Vector3(...base));
  const t0 = useRef(Math.random() * 100);

  useFrame((_, dt) => {
    const t = (t0.current += dt);
    const H = heatRef.current;
    group.current.rotation.y += dt * (yawBase + H * 0.12);

    const amp = 0.15 + H * 0.35;
    const ox = fbm(base[0] * 0.7, base[1] * 0.6, t * (0.25 + H * 0.15)) * amp;
    const oy = fbm(base[1] * 0.6, base[0] * 0.7, t * (0.23 + H * 0.18)) * amp;
    const oz = fbm(base[0] * 0.5, base[1] * 0.5, t * (0.2 + H * 0.16)) * amp * 0.6;
    target.current.set(base[0] + ox, base[1] + oy, base[2] + oz);

    const followSpeed = 2.0 + H * 3.0;
    group.current.position.lerp(target.current, 1 - Math.exp(-dt * followSpeed));
  });

  const heat = heatRef.current;
  const baseColor = heat < 1
    ? colorLerp("#06e7e7", "#0df2a6", heat)
    : colorLerp("#0df2a6", "#ff7a00", Math.min(1, heat - 1));

  const c = new THREE.Color(baseColor);
  const Hc = c.clone().multiplyScalar(0.82);
  const Oc = c.clone().lerp(new THREE.Color("#ffd28a"), 0.35);

  return (
    <group ref={group} position={base} scale={1}>
      {cfg.bonds.map(([i, j], k) => (
        <BondMesh key={`b-${type}-${k}`} a={cfg.atoms[i].p} b={cfg.atoms[j].p} color={baseColor} low={low} />
      ))}

      {/* искры вдоль связей */}
      <BondSparks atoms={cfg.atoms} bonds={cfg.bonds} heatRef={heatRef} low={low} perBond={2} />

      {cfg.atoms.map((a, i) => (
        <Ball
          key={`a-${type}-${i}`}
          p={a.p}
          r={a.r}
          low={low}
          kind={a.kind}
          color={a.kind === "H" ? `#${Hc.getHexString()}` : a.kind === "O" ? `#${Oc.getHexString()}` : baseColor}
        />
      ))}
    </group>
  );
}

/* ===================== Cooler & HeatDriver ===================== */
function Cooler({ cool }: { cool: (dt: number) => void }) {
  useFrame((_, dt) => cool(dt * 0.25));
  return null;
}
function HeatDriver({ input, out }: { input: MutableRefObject<number>; out: MutableRefObject<number> }) {
  useFrame((_, dt) => {
    out.current = smoothTowards(out.current, input.current, dt, 3.2);
  });
  return null;
}

/* ===================== Main global field ===================== */
export default function GlobalMolecularField() {
  const { qualityMode, reaction, addHeat, cool } = useUI();
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const low = qualityMode === "low" || dpr > 1.75;

  const reactionRef = useRef(0);
  useEffect(() => { reactionRef.current = reaction; }, [reaction]);
  const heatRef = useRef(0);

  useEffect(() => {
    let y0 = window.scrollY, t0 = performance.now();
    const onScroll = () => {
      const y = window.scrollY, t = performance.now();
      const vy = Math.abs(y - y0) / Math.max(16, t - t0);
      if (vy > 0.8) addHeat(Math.min(2, vy * 0.35));
      y0 = y; t0 = t;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [addHeat]);

  const bases: Array<{ p: V3; type: "benzene" | "methane" | "chain"; s: number; yaw?: number }> = [
    { p: [ 0.0,  0.2, -0.2], type: "benzene", s: 1.35, yaw: 0.12 },
    { p: [-2.8, -0.2, -0.8], type: "methane", s: 1.15, yaw: 0.09 },
    { p: [ 2.7,  0.3,  0.1], type: "chain",   s: 1.35, yaw: 0.10 },
    { p: [-3.6,  1.1, -1.2], type: "chain",   s: 1.15, yaw: 0.10 },
    { p: [ 3.4, -1.1, -1.2], type: "methane", s: 1.10, yaw: 0.08 },
  ];

  return (
    <Canvas
      camera={{ position: [0, 0.45, 6.7], fov: 55 }}
      dpr={low ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !low, powerPreference: low ? "low-power" : "high-performance", stencil: false, depth: true }}
      shadows={false}
    >
      <color attach="background" args={["#0d0f1a"]} />
      <fog attach="fog" args={["#0d0f1a", 9, 24]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 6, 6]} intensity={0.35} />

      <HeatDriver input={reactionRef} out={heatRef} />
      <Cooler cool={cool} />

      <Parallax>
        {bases.map((b, i) => (
          <LiveMolecule key={i} base={b.p} type={b.type} low={low} heatRef={heatRef} scale={b.s} yawBase={b.yaw} />
        ))}
        <IonCloud heatRef={heatRef} low={low} />
        <PulseRings heatRef={heatRef} />
        {/* тепловой «мираж» — очень лёгкая дрожь воздуха */}
        {!low && <HeatHaze heatRef={heatRef} />}
      </Parallax>

      {!low && (
        <EffectComposer enableNormalPass={false}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Bloom
            intensity={THREE.MathUtils.lerp(0.12, 0.38, Math.min(1, heatRef.current / 2))}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            offset={[
              0.0008 + 0.0015 * Math.min(1, heatRef.current / 2.2),
              0.0008 + 0.0015 * Math.min(1, heatRef.current / 2.2),
            ]}
          />
          <Noise opacity={0.02 + 0.05 * Math.min(1, heatRef.current / 2)} />
          <Vignette eskil={false} offset={0.25} darkness={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
