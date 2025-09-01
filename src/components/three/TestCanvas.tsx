"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

function Box() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d; });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial metalness={0.2} roughness={0.4} />
    </mesh>
  );
}

export default function TestCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 55 }}>
      <color attach="background" args={["#070707"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3,3,3]} intensity={1} />
      <Box />
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
