// src/components/three/HologramMolecule.tsx
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useUI } from "@/store/ui";

type V3 = [number, number, number];
type Bond = [number, number];

type Atom = {
  p: V3;
  r: number;
  kind: "C" | "H" | "O";
};

function Ball({
  p,
  r,
  color,
  low,
  kind,
}: { p: V3; r: number; color: string; low: boolean; kind: Atom["kind"] }) {
  const mesh = useRef<THREE.Mesh>(null!);
  // Чуть «дышит» размер, чтобы фон был живее
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = 1 + (kind === "H" ? 0.02 : 0.01) * Math.sin(t * 1.2 + r);
    mesh.current.scale.setScalar(s);
  });

  // В high режиме — лёгкая эмиссия, в low — basic
  const mat = low ? (
    <meshBasicMaterial color={color} transparent opacity={0.55} />
  ) : (
    <meshStandardMaterial
      color={color}
      roughness={0.2}
      metalness={0.0}
      emissive={new THREE.Color(color)}
      emissiveIntensity={0.2}
      transparent
      opacity={0.75}
    />
  );

  return (
    <mesh ref={mesh} position={p}>
      <sphereGeometry args={[r, low ? 14 : 22, low ? 12 : 20]} />
      {mat}
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

  const radius = low ? 0.035 : 0.045;

  return (
    <group position={mid.toArray() as V3} quaternion={quat}>
      <mesh position={[0, len * 0.5, 0]}>
        <cylinderGeometry args={[radius, radius, len, low ? 8 : 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/** Генератор бензола C6H6 (плоское кольцо + шесть H) */
function useBenzene(scale = 1): { atoms: Atom[]; bonds: Bond[] } {
  return useMemo(() => {
    const R = 1.25 * scale;
    const RH = 1.9 * scale;
    const atoms: Atom[] = [];
    const bonds: Bond[] = [];

    // 6 углеродов по кругу
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      atoms.push({ p: [Math.cos(a) * R, Math.sin(a) * R, 0], r: 0.26 * scale, kind: "C" });
    }
    // связи C-C
    for (let i = 0; i < 6; i++) bonds.push([i, (i + 1) % 6]);

    // 6 гидрогенов снаружи
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      atoms.push({ p: [Math.cos(a) * RH, Math.sin(a) * RH, 0], r: 0.18 * scale, kind: "H" });
      bonds.push([i, 6 + i]);
    }

    return { atoms, bonds };
  }, [scale]);
}

/** Простой метан CH4 (тетраэдр) */
function useMethane(scale = 1): { atoms: Atom[]; bonds: Bond[] } {
  return useMemo(() => {
    const C: Atom = { p: [0, 0, 0], r: 0.28 * scale, kind: "C" };
    const t = 0.9 * scale;
    const Hs: Atom[] = [
      { p: [ t,  t,  t], r: 0.18 * scale, kind: "H" },
      { p: [-t, -t,  t], r: 0.18 * scale, kind: "H" },
      { p: [-t,  t, -t], r: 0.18 * scale, kind: "H" },
      { p: [ t, -t, -t], r: 0.18 * scale, kind: "H" },
    ];
    const atoms = [C, ...Hs];
    const bonds: Bond[] = [
      [0,1],[0,2],[0,3],[0,4]
    ];
    return { atoms, bonds };
  }, [scale]);
}

/** Короткая цепочка (условный C–C–O–H) */
function useChain(scale = 1): { atoms: Atom[]; bonds: Bond[] } {
  return useMemo(() => {
    const atoms: Atom[] = [
      { p: [-0.8 * scale, 0, 0], r: 0.26 * scale, kind: "C" },
      { p: [ 0.8 * scale, 0, 0], r: 0.26 * scale, kind: "C" },
      { p: [ 1.8 * scale, 0.5 * scale, 0], r: 0.24 * scale, kind: "O" },
      { p: [ 2.4 * scale, 1.2 * scale, 0], r: 0.18 * scale, kind: "H" },
      // Пара водородов на каждом C для «молекулярности»
      { p: [-1.2 * scale, 0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
      { p: [-1.2 * scale, -0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
      { p: [ 1.2 * scale, 0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
      { p: [ 1.2 * scale, -0.9 * scale, 0], r: 0.18 * scale, kind: "H" },
    ];
    const bonds: Bond[] = [
      [0,1],[1,2],[2,3],
      [0,4],[0,5],[1,6],[1,7],
    ];
    return { atoms, bonds };
  }, [scale]);
}

function Molecule({
  atoms, bonds, color, low, position = [0,0,0], scale = 1, yawSpeed = 0.12,
}: {
  atoms: Atom[];
  bonds: Bond[];
  color: string;
  low: boolean;
  position?: V3;
  scale?: number;
  yawSpeed?: number;
}) {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, d) => {
    g.current.rotation.y += d * yawSpeed * (low ? 0.75 : 1);
  });

  // Тонкая вариативность цветов H/O — чтобы ушло ощущение «планеты»
  const col = new THREE.Color(color);
  const hydrogen = col.clone().multiplyScalar(0.8);
  const oxygen = col.clone().lerp(new THREE.Color("#0df2a6"), 0.35);

  return (
    <group ref={g} position={position} scale={scale}>
      {bonds.map(([i, j], k) => (
        <BondMesh key={`b-${k}`} a={atoms[i].p} b={atoms[j].p} color={color} low={low} />
      ))}
      {atoms.map((a, i) => (
        <Ball
          key={`a-${i}`}
          p={a.p}
          r={a.r}
          low={low}
          kind={a.kind}
          color={a.kind === "H" ? `#${hydrogen.getHexString()}` : a.kind === "O" ? `#${oxygen.getHexString()}` : color}
        />
      ))}
    </group>
  );
}

/** Лёгкий параллакс от мыши */
function Parallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { size } = useThree();
  useFrame(({ mouse }) => {
    // mouse: [-1..1]
    const rx = THREE.MathUtils.lerp(group.current.rotation.x, mouse.y * 0.08, 0.06);
    const ry = THREE.MathUtils.lerp(group.current.rotation.y, mouse.x * 0.12, 0.06);
    group.current.rotation.set(rx, ry, 0);
  });
  return <group ref={group}>{children}</group>;
}

export default function HologramMolecule() {
  const { qualityMode, hoverCategory } = useUI();
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const low = qualityMode === "low" || dpr > 1.75;

  const base =
    hoverCategory === "construction" ? "#0df2a6" :
    hoverCategory === "industrial"   ? "#8ab4ff" :
    hoverCategory === "lab"          ? "#06e7e7" : "#06e7e7";

  // Предсоздаём молекулы
  const benzene = useBenzene(1);
  const methane = useMethane(0.9);
  const chain   = useChain(1);

  return (
    <Canvas
      camera={{ position: [0, 0.4, 6.5], fov: 55 }}
      dpr={low ? [1, 1.25] : [1, 1.75]}
      gl={{
        antialias: !low,
        powerPreference: low ? "low-power" : "high-performance",
        stencil: false,
        depth: true,
      }}
      shadows={false}
    >
      <color attach="background" args={["#0d0f1a"]} />
      <fog attach="fog" args={["#0d0f1a", 9, 24]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 6, 6]} intensity={0.35} />

      <Parallax>
        {/* Центральное кольцо (C6H6) немного ближе к камере */}
        <Molecule atoms={benzene.atoms} bonds={benzene.bonds} color={base} low={low} position={[0, 0.15, -0.2]} scale={1.35} />
        {/* Слева — тетраэдр (метан), чуть дальше */}
        <Molecule atoms={methane.atoms} bonds={methane.bonds} color={base} low={low} position={[-2.6, -0.2, -0.8]} scale={1.2} yawSpeed={0.09} />
        {/* Справа — короткая цепочка, ближе и крупнее */}
        <Molecule atoms={chain.atoms} bonds={chain.bonds} color={base} low={low} position={[2.7, 0.3, 0.1]} scale={1.4} yawSpeed={0.1} />
      </Parallax>

      {!low && (
        <EffectComposer enableNormalPass={false}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Bloom intensity={0.2} luminanceThreshold={0.22} luminanceSmoothing={0.9} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
