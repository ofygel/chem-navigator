// src/components/three/intro/HeroIntroCanvas.tsx
"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useUI } from "@/store/ui";
import GrowingMolecule from "./GrowingMolecule";
import ParticlesTitle from "./ParticlesTitle";
import Effects from "./effects";
import * as THREE from "three";

function CameraDolly({ startAt = 2.2, duration = 0.8 }: { startAt?: number; duration?: number }) {
  const { camera } = useThree();
  const startZ = 4;
  const endZ = 7.5;
  useEffect(() => {
    camera.position.set(0, 0.6, startZ);
  }, [camera]);

  useFrame((state) => {
    const t = THREE.MathUtils.clamp((state.clock.getElapsedTime() - startAt) / duration, 0, 1);
    const ease = t * t * (3 - 2 * t);
    camera.position.z = THREE.MathUtils.lerp(startZ, endZ, ease);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Lights() {
  const key = useRef<THREE.DirectionalLight>(null!);
  useFrame((state) => {
    const t = Math.min(state.clock.getElapsedTime() / 0.6, 1); // мягкий «рассвет»
    if (key.current) key.current.intensity = 0.2 + 0.9 * t;
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={key} position={[4, 5, 4]} intensity={0.2} castShadow />
      <directionalLight position={[-3, 3, -2]} intensity={0.35} />
      <pointLight position={[0, 1.5, 0]} intensity={0.3} />
    </>
  );
}

export default function HeroIntroCanvas() {
  const setIntroDone = useUI((s) => s.setIntroDone);

  // Автозавершение интро через ~3.1s
  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 3100);
    return () => clearTimeout(t);
  }, [setIntroDone]);

  return (
    <Canvas camera={{ position: [0, 0.6, 4], fov: 55 }} shadows>
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 8, 22]} />

      <Lights />
      <Effects />

      {/* По таймлайну: рост молекулы, затем из частиц возникает название */}
      <group position={[0, 0.2, 0]}>
        <GrowingMolecule startAt={0.2} duration={1.2} />
      </group>
      <ParticlesTitle startAt={1.1} duration={0.9} y={-1.4} />

      {/* Камера плавно «отъезжает», открывая пространство геро-сцены */}
      <CameraDolly startAt={2.2} duration={0.8} />
    </Canvas>
  );
}
