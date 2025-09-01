// src/components/three/HologramMolecule.tsx
"use client";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useUI } from "@/store/ui";

function HoloAtom({ p = [0, 0, 0] as [number, number, number], r = 0.35 }) {
  const { hoverCategory } = useUI();
  const color = hoverCategory
    ? (hoverCategory === "construction" ? "#0df2a6" // mint
      : hoverCategory === "industrial" ? "#8ab4ff"  // blue
      : hoverCategory === "lab" ? "#06e7e7"         // cyan
      : "#06e7e7")
    : "#06e7e7";

  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    mesh.current.rotation.y += d * 0.4;
  });
  return (
    <mesh ref={mesh} position={p}>
      <sphereGeometry args={[r, 18, 18]} />
      {/* неоновый “каркас” */}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.45} />
    </mesh>
  );
}

function bondTransform(a: THREE.Vector3, b: THREE.Vector3) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return { len, mid, quat };
}

function HoloBond({ a, b }: { a: [number, number, number]; b: [number, number, number] }) {
  const { hoverCategory } = useUI();
  const color = hoverCategory
    ? (hoverCategory === "construction" ? "#0df2a6"
      : hoverCategory === "industrial" ? "#8ab4ff"
      : hoverCategory === "lab" ? "#06e7e7"
      : "#06e7e7")
    : "#06e7e7";

  const av = useMemo(() => new THREE.Vector3(...a), [a]);
  const bv = useMemo(() => new THREE.Vector3(...b), [b]);
  const { len, mid, quat } = useMemo(() => bondTransform(av, bv), [av, bv]);
  return (
    <group position={mid} quaternion={quat}>
      {/* тонкая “неоновая трубка” */}
      <mesh>
        <cylinderGeometry args={[0.035, 0.035, len, 12, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function HoloMoleculeInner() {
  // Возьмём этанол (смотрится асимметрично и «научно»)
  const atoms: [number, number, number][] = [
    [0, 0, 0], [1.25, 0, 0], [2.1, 0.6, 0], // C1, C2, O
    [-0.6, 0.8, 0], [-0.6, -0.8, 0], [0, 0, 1.0], [1.25, 0, 1.0], [1.85, -0.8, 0], [2.75, 0.6, 0.6] // Hx
  ];
  const bonds: [number, number][] = [
    [0, 1], [1, 2],
    [2, 8], [0, 3], [0, 4], [0, 5], [1, 6], [1, 7]
  ];

  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => {
    group.current.rotation.y += d * 0.15;
  });

  return (
    <group ref={group} position={[0, 0.2, 0]} scale={1.2}>
      {bonds.map(([i, j], idx) => (
        <HoloBond key={idx} a={atoms[i]} b={atoms[j]} />
      ))}
      {atoms.map((p, idx) => (
        <HoloAtom key={idx} p={p as any} r={idx < 3 ? 0.4 : 0.28} />
      ))}
    </group>
  );
}

export default function HologramMolecule() {
  return (
    <Canvas camera={{ position: [0, 0.6, 6], fov: 55 }} dpr={[1, 1.75]}>
      <color attach="background" args={["#0d0f1a"]} />
      <fog attach="fog" args={["#0d0f1a", 10, 26]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[6, 6, 6]} intensity={0.4} />
      <HoloMoleculeInner />
      <EffectComposer enableNormalPass={false}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Bloom intensity={0.25} luminanceThreshold={0.18} luminanceSmoothing={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
