// src/components/three/intro/ParticlesTitle.tsx
"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

type Props = {
  text?: string;
  y?: number;
  startAt?: number;
  duration?: number;
};

export default function ParticlesTitle({ text = "CHEM-NAVIGATOR", y = -1.4, startAt = 1.1, duration = 0.9 }: Props) {
  const countRef = useRef(0);
  const targets = useRef<THREE.Vector3[]>([]);
  const starts = useRef<THREE.Vector3[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // 1) Растеризуем текст на скрытом canvas и собираем точки-таргеты
  useEffect(() => {
    const cvs = document.createElement("canvas");
    const W = 1024, H = 256;
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 140px Arial";
    ctx.fillText(text, W / 2, H / 2);

    const img = ctx.getImageData(0, 0, W, H);
    const step = 6; // плотность точек
    const pts: THREE.Vector3[] = [];
    for (let yPix = 0; yPix < H; yPix += step) {
      for (let xPix = 0; xPix < W; xPix += step) {
        const i = (yPix * W + xPix) * 4;
        if (img.data[i + 3] > 180) {
          const xN = (xPix / W) * 6 - 3;          // масштаб в мировые координаты
          const yN = (-(yPix / H) * 1.6 + 0.8) + y;
          pts.push(new THREE.Vector3(xN, yN, 0));
        }
      }
    }

    // Ограничим число частиц (для производительности)
    const max = Math.min(3500, pts.length);
    targets.current = pts.slice(0, max);
    starts.current = targets.current.map(
      () => new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6 + 1.5, (Math.random() - 0.5) * 4 - 2)
    );
    countRef.current = max;

    // Инициализация матриц
    for (let i = 0; i < max; i++) {
      dummy.position.copy(starts.current[i]);
      dummy.scale.setScalar(0.001);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [text, y, dummy]);

  // 2) Анимируем «перелёт» к тексту
  useFrame((state) => {
    const T = THREE.MathUtils.clamp((state.clock.getElapsedTime() - startAt) / duration, 0, 1);
    const ease = T * T * (3 - 2 * T);

    for (let i = 0; i < countRef.current; i++) {
      const s = starts.current[i];
      const t = targets.current[i];
      dummy.position.lerpVectors(s, t, ease);
      dummy.scale.setScalar(THREE.MathUtils.lerp(0.001, 0.06, ease));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, 1]}>
      {/* В рандере args[2] (count) перепишется автоматически после эффекта выше */}
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#9fd3ff" emissive="#18364a" emissiveIntensity={0.4} roughness={0.4} metalness={0.1} />
    </instancedMesh>
  );
}
