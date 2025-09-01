// src/components/three/hero/MoleculeHeroScene.tsx
"use client";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

type Atom = { id: string; el: "H" | "C" | "O" | "N" | "S"; p: [number, number, number] };
type Bond = { a: string; b: string };

const CPK: Record<Atom["el"], string> = {
  H: "#ffffff",
  C: "#2c2c2c",
  O: "#ff4d4d",
  N: "#3d7cff",
  S: "#ffd23f",
};
const RAD: Record<Atom["el"], number> = { H: 0.22, C: 0.35, O: 0.32, N: 0.33, S: 0.42 };

function H2O(): { atoms: Atom[]; bonds: Bond[] } {
  return {
    atoms: [
      { id: "O", el: "O", p: [0, 0, 0] },
      { id: "H1", el: "H", p: [0.95, 0.3, 0] },
      { id: "H2", el: "H", p: [-0.95, 0.3, 0] },
    ],
    bonds: [
      { a: "O", b: "H1" },
      { a: "O", b: "H2" },
    ],
  };
}
function ETHANOL(): { atoms: Atom[]; bonds: Bond[] } {
  return {
    atoms: [
      { id: "C1", el: "C", p: [0, 0, 0] },
      { id: "C2", el: "C", p: [1.25, 0, 0] },
      { id: "O", el: "O", p: [2.1, 0.6, 0] },
      { id: "H1", el: "H", p: [-0.6, 0.8, 0] },
      { id: "H2", el: "H", p: [-0.6, -0.8, 0] },
      { id: "H3", el: "H", p: [0, 0, 1.0] },
      { id: "H4", el: "H", p: [1.25, 0, 1.0] },
      { id: "H5", el: "H", p: [1.85, -0.8, 0] },
      { id: "HO", el: "H", p: [2.75, 0.6, 0.6] },
    ],
    bonds: [
      { a: "C1", b: "C2" },
      { a: "C2", b: "O" },
      { a: "O", b: "HO" },
      { a: "C1", b: "H1" },
      { a: "C1", b: "H2" },
      { a: "C1", b: "H3" },
      { a: "C2", b: "H4" },
      { a: "C2", b: "H5" },
    ],
  };
}
function BENZENE(): { atoms: Atom[]; bonds: Bond[] } {
  const r = 1.4;
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    atoms.push({ id: `C${i}`, el: "C", p: [r * Math.cos(ang), 0, r * Math.sin(ang)] });
  }
  for (let i = 0; i < 6; i++) bonds.push({ a: `C${i}`, b: `C${(i + 1) % 6}` });
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    atoms.push({ id: `H${i}`, el: "H", p: [(r + 0.9) * Math.cos(ang), 0, (r + 0.9) * Math.sin(ang)] });
    bonds.push({ a: `C${i}`, b: `H${i}` });
  }
  return { atoms, bonds };
}

function Molecule({
  data,
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  label,
  onClick,
}: {
  data: { atoms: Atom[]; bonds: Bond[] };
  position?: [number, number, number];
  scale?: number;
  label: string;
  onClick?: () => void;
}) {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, d) => {
    if (group.current) group.current.rotation.y += d * 0.2;
  });
  const atomsById = useMemo(() => Object.fromEntries(data.atoms.map((a) => [a.id, a])), [data.atoms]);

  return (
    <group ref={group} position={position} scale={scale} onClick={onClick}>
      {data.bonds.map((b, i) => (
        <Bond key={i} a={atomsById[b.a]} b={atomsById[b.b]} />
      ))}
      {data.atoms.map((a) => (
        <mesh key={a.id} position={a.p}>
          <sphereGeometry args={[RAD[a.el], 32, 32]} />
          <meshStandardMaterial color={CPK[a.el]} roughness={0.35} metalness={0.1} />
        </mesh>
      ))}
      {/* Простая подпись */}
      <mesh position={[0, -2.0, 0]}>
        <planeGeometry args={[3, 0.7]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Bond({ a, b }: { a: Atom; b: Atom }) {
  const aV = useMemo(() => new THREE.Vector3(...a.p), [a.p]);
  const bV = useMemo(() => new THREE.Vector3(...b.p), [b.p]);
  const { mid, quat, len } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(bV, aV);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(aV, bV).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid, quat, len: length };
  }, [aV, bV]);

  return (
    <group position={mid} quaternion={quat}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, len, 16, 1]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function MoleculeHeroScene() {
  const router = useRouter();
  return (
    <Canvas camera={{ position: [0, 1.4, 7], fov: 55 }} shadows>
      <color attach="background" args={["#070707"]} />
      <fog attach="fog" args={["#070707", 10, 24]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 5]} intensity={1} castShadow />
      <directionalLight position={[-4, 3, -3]} intensity={0.45} />

      {/* «Плашка» пола для контакта теней */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.25} />
      </mesh>

      <Molecule data={BENZENE()} position={[-3.2, 0.2, 0]} scale={1.15} label="benzene" onClick={() => router.push("/catalog/benzene")} />
      <Molecule data={H2O()} position={[0, -0.2, 0]} scale={1.4} label="water" onClick={() => router.push("/catalog/water")} />
      <Molecule data={ETHANOL()} position={[3.2, 0.3, 0]} scale={1.2} label="ethanol" onClick={() => router.push("/catalog/ethanol")} />

      <OrbitControls enablePan={false} minDistance={4} maxDistance={14} />
    </Canvas>
  );
}
