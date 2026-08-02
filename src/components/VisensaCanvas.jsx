import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useState } from "react";
import * as THREE from "three";
import { Timer } from "three";
import { Model } from "../models/Robotic_prosthetic_arm";
import CalibrationOverlay from "./CalibrationOverlay";
import ExerciseHUD from "./ExerciseHUD";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

// --- 30 FPS RENDER LOOP THROTTLE COMPONENT FOR R3F ---
function RenderFrameLimiter({ fps = 30 }) {
  const interval = 1000 / fps;
  const lastRenderTime = useRef(0);

  useFrame(() => {
    const now = performance.now();
    const elapsed = now - lastRenderTime.current;
    if (elapsed < interval) {
      return;
    }
    lastRenderTime.current = now - (elapsed % interval);
  });

  return null;
}

export function VisensaCanvas() {
  // Live Tuner State
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(-22);
  const [posZ, setPosZ] = useState(-30);
  const [modelScale, setModelScale] = useState(1.5);
  const [rotY, setRotY] = useState(0);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <CalibrationOverlay />
      <ExerciseHUD />

      <Canvas
        shadows={false}
        dpr={1}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          depth: true,
          stencil: false,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <RenderFrameLimiter fps={30} />
        <PerspectiveCamera makeDefault position={[0, 8, 35]} fov={50} />
        <color attach="background" args={["#f8f9fa"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <group
            position={[posX, posY, posZ]}
            rotation={[0, rotY * (Math.PI / 180), 0]}
            scale={modelScale}
          >
            <Model />
          </group>

          <ContactShadows
            position={[0, -20, 0]}
            opacity={0.35}
            scale={60}
            blur={2.0}
            far={20}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          minDistance={10}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2}
          target={[0, -5, -10]}
        />
      </Canvas>
    </div>
  );
}
