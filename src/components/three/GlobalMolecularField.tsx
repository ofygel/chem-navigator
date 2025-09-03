// src/components/three/GlobalMolecularField.tsx
"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useUI } from "@/store/ui";

/* ===================== Utilities ===================== */
type V3 = [number, number, number];
type Bond = [number, number];
type Atom = { p: V3; r: number; kind: "C" | "H" | "O" };

// lightweight fbm-ish noise
function fbm(x: number, y: number, t: number) {
  const s = Math.sin, c = Math.cos;
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * s(x * f + t * (0.6 + 0.2 * i)) * c(y * f - t * (0.7 + 0.17 * i));
    a *= 0.5; f *= 1.7;
  }
  return v; // ~[-1..1]
}

function colorLerp(hexA: string, hexB: string, k: number) {
  const a = new THREE.Color(hexA);
  const b = new THREE.Color(hexB);
  return `#${a.lerp(b, THREE.MathUtils.clamp(k, 0, 1)).getHexString()}`;
}

/* ===================== Primitives ===================== */
function Ball({
  p, r, color, low, emissive = 0.18, kind,
}: {
  p: V3; r: number; color: string; low: boolean; emissive?: number; kind?: Atom["kind"];
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    // subtle breathing depending on atom kind
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

function useMethane(scale = 1) { // CH4
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
  const t0 = useRef(Math.random() * 100);

  useFrame((_, dt) => {
    const t = (t0.current += dt);
    const H = heatRef.current; // 0..3
    const speed = yawBase + H * 0.12;
    group.current.rotation.y += dt * speed;

    // floating (brownian) offset — amplitude depends on “temperature”
    const amp = 0.15 + H * 0.35;
    const ox = fbm(base[0] * 0.7, base[1] * 0.6, t * (0.3 + H * 0.2)) * amp;
    const oy = fbm(base[1] * 0.6, base[0] * 0.7, t * (0.25 + H * 0.22)) * amp;
    const oz = fbm(base[0] * 0.5, base[1] * 0.5, t * (0.2 + H * 0.2)) * amp * 0.6;
    group.current.position.set(base[0] + ox, base[1] + oy, base[2] + oz);
  });

  // color from temperature: cyan -> mint -> orange
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

/* ===================== Cooler (inside Canvas) ===================== */
function Cooler({ cool }: { cool: (dt: number) => void }) {
  useFrame((_, dt) => cool(dt * 0.25)); // ~4s to cool down
  return null;
}

/* ===================== Main global field ===================== */
export default function GlobalMolecularField() {
  const { qualityMode, reaction, addHeat, cool } = useUI();
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const low = qualityMode === "low" || dpr > 1.75;

  // reaction accumulator
  const heatRef = useRef(0);
  useEffect(() => { heatRef.current = reaction; }, [reaction]);

  // thermal boost from scroll velocity
  useEffect(() => {
    let y0 = window.scrollY, t0 = performance.now();
    const onScroll = () => {
      const y = window.scrollY, t = performance.now();
      const vy = Math.abs(y - y0) / Math.max(16, t - t0); // px/ms
      if (vy > 0.8) addHeat(Math.min(2, vy * 0.35));
      y0 = y; t0 = t;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [addHeat]);

  // molecule placements so they’re visible around the hero
  const bases: Array<{ p: V3; type: "benzene" | "methane" | "chain"; s: number; yaw?: number }> = [
    { p: [ 0.0,  0.2, -0.2], type: "benzene", s: 1.35, yaw: 0.12 },
    { p: [-2.8, -0.2, -0.8], type: "methane", s: 1.15, yaw: 0.09 },
    { p: [ 2.7,  0.3,  0.1], type: "chain",   s: 1.35, yaw: 0.10 },
    { p: [-3.6,  1.1, -1.2], type: "chain",   s: 1.15, yaw: 0.10 },
    { p: [ 3.4, -1.1, -1.2], type: "methane", s: 1.10, yaw: 0.08 },
  ];

  const bloomIntensity = low ? 0 : THREE.MathUtils.lerp(0.12, 0.36, Math.min(1, heatRef.current / 2));

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

      {/* cool down each frame — INSIDE Canvas to avoid R3F hook error */}
      <Cooler cool={cool} />

      {bases.map((b, i) => (
        <LiveMolecule key={i} base={b.p} type={b.type} low={low} heatRef={heatRef} scale={b.s} yawBase={b.yaw} />
      ))}

      {!low && (
        <EffectComposer enableNormalPass={false}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Bloom intensity={bloomIntensity} luminanceThreshold={0.22} luminanceSmoothing={0.9} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
