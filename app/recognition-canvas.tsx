"use client";

import { Suspense, useRef } from "react";

import { Edges, Float, Sparkles, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RecognitionCanvasProps {
  readonly active: boolean;
  readonly logoSrc: string;
}

type RecognitionFieldProps = RecognitionCanvasProps;

const SHARDS = [
  { position: [-3.25, 1.75, -1.2], rotation: [0.2, 0.1, -0.62], scale: [0.18, 1.9, 0.55] },
  { position: [-2.9, -1.9, -0.7], rotation: [-0.35, 0.35, 0.72], scale: [0.12, 1.45, 0.42] },
  { position: [3.25, 1.55, -1.3], rotation: [-0.3, -0.15, 0.6], scale: [0.16, 1.8, 0.5] },
  { position: [3.1, -1.75, -0.8], rotation: [0.25, -0.4, -0.72], scale: [0.12, 1.35, 0.4] },
  { position: [-1.65, 2.9, -1.8], rotation: [0.5, 0.1, 1.05], scale: [0.1, 1.1, 0.35] },
  { position: [1.8, -2.85, -1.6], rotation: [-0.5, -0.2, 0.96], scale: [0.1, 1.2, 0.35] },
] as const;

function LogoMonolith({ logoSrc }: { readonly logoSrc: string }) {
  const texture = useTexture(logoSrc);

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.24} floatingRange={[-0.08, 0.08]}>
      <group rotation={[-0.03, -0.12, 0.015]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.25, 3.25, 0.12]} />
          <meshStandardMaterial color="#F5F3EE" roughness={0.82} metalness={0.04} />
          <Edges color="#005C35" threshold={15} />
        </mesh>
        <mesh position={[0, 0, 0.066]}>
          <planeGeometry args={[3.12, 3.12]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function RecognitionField({ active, logoSrc }: RecognitionFieldProps) {
  const root = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (root.current === null || orbit.current === null) {
      return;
    }

    const targetX = active ? state.pointer.y * 0.12 : 0;
    const targetY = active ? state.pointer.x * 0.18 : 0;
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetX, 3.5, delta);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 3.5, delta);

    if (active) {
      orbit.current.rotation.z += delta * 0.045;
      orbit.current.rotation.y -= delta * 0.025;
    }
  });

  return (
    <group ref={root}>
      <group ref={orbit}>
        {SHARDS.map((shard, index) => (
          <mesh
            key={index}
            position={[...shard.position]}
            rotation={[...shard.rotation]}
            scale={[...shard.scale]}
          >
            <coneGeometry args={[0.72, 2.25, 3]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#005C35" : "#172E24"}
              roughness={0.4}
              metalness={0.42}
            />
            <Edges color={index % 2 === 0 ? "#0A9A61" : "#355E4B"} threshold={12} />
          </mesh>
        ))}
      </group>

      <LogoMonolith logoSrc={logoSrc} />
      <Sparkles
        count={34}
        scale={[8, 7, 4]}
        size={1.15}
        speed={active ? 0.16 : 0}
        opacity={0.42}
        color="#4FA97D"
        noise={0.7}
      />
    </group>
  );
}

/** Isolated responsive WebGL field; HTML remains the source of readable content. */
export function RecognitionCanvas({ active, logoSrc }: RecognitionCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "demand"}
      camera={{ position: [0, 0, 7.7], fov: 35, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 5, 7]} intensity={2.7} color="#F5F3EE" castShadow />
      <pointLight position={[-4, -2, 3]} intensity={18} distance={8} color="#005C35" />
      <pointLight position={[4, 3, -1]} intensity={12} distance={7} color="#1B7550" />
      <Suspense fallback={null}>
        <RecognitionField active={active} logoSrc={logoSrc} />
      </Suspense>
    </Canvas>
  );
}
