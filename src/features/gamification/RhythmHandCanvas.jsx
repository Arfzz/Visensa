import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { Model } from "../../models/Robotic_prosthetic_arm";

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

export function RhythmHandCanvas({ visible = true }) {
  if (!visible) return null;
  // Live Layout Debugging State (Calibrated 1st POV Hand Alignment)
  const [posX, setPosX] = useState(3);
  const [posY, setPosY] = useState(-12.5);
  const [posZ, setPosZ] = useState(10);
  const [modelScale, setModelScale] = useState(0.6);
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0);
  const [rotZ, setRotZ] = useState(153);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >

      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          depth: true,
          stencil: false,
          alpha: true,
        }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <RenderFrameLimiter fps={30} />
        <PerspectiveCamera makeDefault position={[0, 8, 35]} fov={50} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <group
            raycast={() => null}
            position={[posX, posY, posZ]}
            rotation={[
              rotX * (Math.PI / 180),
              rotY * (Math.PI / 180),
              rotZ * (Math.PI / 180),
            ]}
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
            frames={1}
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

export default RhythmHandCanvas;
