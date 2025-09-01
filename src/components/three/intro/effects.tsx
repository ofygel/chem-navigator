//src/components/three/intro/effects.tsx
"use client";
import { useUI } from "@/store/ui";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

export default function Effects() {
  const quality = useUI((s) => s.qualityMode);

  // Корректный проп для постпроцесса
  const enableNormalPass = false;
  const multisampling = quality === "high" ? 4 : 0;

  if (quality === "low") {
    return (
      <EffectComposer enableNormalPass={enableNormalPass} multisampling={multisampling}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer enableNormalPass={enableNormalPass} multisampling={multisampling}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.85}
        blendFunction={BlendFunction.ADD}
      />
    </EffectComposer>
  );
}
