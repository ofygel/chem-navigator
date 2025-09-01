//src/components/three/intro/GrowingMolecule.tsx
"use client";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

type Atom = { id: string; element: "H" | "C" | "O" | "N" | "S"; pos: [number, number, number] };
type Bond = { a: string; b: string };
type Props = { startAt?: number; duration?: number };

const CPK: Record<Atom["element"], string> = {
  H: "#ffffff",
  C: "#2c2c2c",
  O: "#ff4d4d",
  N: "#3d7cff",
  S: "#ffd23f",
};

const RADIUS: Record<Atom["element"], number> = {
  H: 0.22,
  C: 0.35,
  O: 0.32,
  N: 0.33,
  S: 0.42,
};

function benzene(): { atoms: Atom[]; bonds: Bond[] } {
  const r = 1.3;
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    atoms.push({ id: `C${i}`, element: "C", pos: [r * Math.cos(a), 0, r * Math.sin(a)] });
  }
  for (let i = 0; i < 6; i++) bonds.push({ a: `C${i}`, b: `C${(i + 1) % 6}` });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const h: Atom = { id: `H${i}`, element: "H", pos: [(r + 0.9) * Math.cos(a), 0, (r + 0.9) * Math.sin(a)] };
    atoms.push(h);
    bonds.push({ a: `C${i}`, b: h.id });
  }
  return { atoms, bonds };
}

// Безопасная установка прозрачности для Material | Material[]
function setOpacitySafe(material: THREE.Material | THREE.Material[], value: number) {
  if (Array.isArray(material)) {
    material.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      mm.transparent = true;
      mm.opacity = value;
    });
  } else {
    const m = material as THREE.MeshStandardMaterial;
    m.transparent = true;
    m.opacity = value;
  }
}

function AtomMesh({
  atom,
  delay,
  start,
  end,
}: {
  atom: Atom;
  delay: number;
  start: number;
  end: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const color = CPK[atom.element];
  const r = RADIUS[atom.element];

  useFrame((state) => {
    const tRaw = (state.clock.getElapsedTime() - (start + delay)) / (end - start);
    const t = THREE.MathUtils.clamp(tRaw, 0, 1);
    const ease = t * t * (3 - 2 * t);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, ease));
    setOpacitySafe(ref.current.material, ease);
  });

  return (
    <mesh ref={ref} position={atom.pos}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial color={color} transparent roughness={0.35} metalness={0.1} />
    </mesh>
  );
}

function BondMesh({
  a,
  b,
  delay,
  start,
  end,
}: {
  a: Atom;
  b: Atom;
  delay: number;
  start: number;
  end: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const aV = useMemo(() => new THREE.Vector3(...a.pos), [a.pos]);
  const bV = useMemo(() => new THREE.Vector3(...b.pos), [b.pos]);

  const { mid, quat, len } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(bV, aV);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(aV, bV).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid, quat, len: length };
  }, [aV, bV]);

  useFrame((state) => {
    const tRaw = (state.clock.getElapsedTime() - (start + delay)) / (end - start);
    const t = THREE.MathUtils.clamp(tRaw, 0, 1);
    const ease = t * t * (3 - 2 * t);
    ref.current.scale.set(1, THREE.MathUtils.lerp(0.001, len, ease), 1);
    setOpacitySafe(ref.current.material, ease);
  });

  return (
    <group position={mid} quaternion={quat}>
      {/* Бонд высотой 1, масштабируем по Y до нужной длины */}
      <mesh ref={ref}>
        <cylinderGeometry args={[0.08, 0.08, 1, 16, 1]} />
        <meshStandardMaterial color="#9ca3af" transparent roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function GrowingMolecule({ startAt = 0.0, duration = 1.2 }: Props) {
  const { atoms, bonds } = useMemo(() => benzene(), []);
  const group = useRef<THREE.Group>(null!);

  // Таймлайн для общей сцены
  const start = startAt;
  const end = startAt + duration;

  useFrame((state) => {
    const t = THREE.MathUtils.clamp((state.clock.getElapsedTime() - start) / (end - start), 0, 1);
    const ease = t * t * (3 - 2 * t); // smoothstep
    if (group.current) {
      group.current.children.forEach((obj) => {
        obj.visible = ease > 0.02;
      });
      group.current.scale.setScalar(0.9 + ease * 0.1);
    }
  });

  return (
    <group ref={group}>
      {/* Сначала связи, затем атомы — появляется аккуратно */}
      {bonds.map((b, i) => {
        const A = atoms.find((x) => x.id === b.a)!;
        const B = atoms.find((x) => x.id === b.b)!;
        return (
          <BondMesh
            key={`${b.a}-${b.b}`}
            a={A}
            b={B}
            delay={i * 0.02}
            start={start + 0.1}
            end={end}
          />
        );
      })}
      {atoms.map((a, i) => (
        <AtomMesh key={a.id} atom={a} delay={i * 0.03} start={start} end={end} />
      ))}
    </group>
  );
}
