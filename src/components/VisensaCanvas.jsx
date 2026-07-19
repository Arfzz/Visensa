import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { Model } from "../models/Robotic_prosthetic_arm";
import { HologramTarget } from "./HologramTarget";

export function VisensaCanvas() {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
      <Canvas
        shadows={false} // Performance: Disable WebGL shadow mapping to minimize shader complexity and draw calls
        style={{ width: "100%", height: "100%" }}
      >
        {/* First-person camera: positioned above and behind the patient's shoulder */}
        <PerspectiveCamera
          makeDefault
          position={[0, 8, 22]} 
          fov={50}
        />

        {/* Soft, bright clinical off-white background to maximize contrast for future gamification overlays */}
        <color attach="background" args={["#f8f9fa"]} />

        {/* Lower fill light intensity to prevent high-key flat lighting against the white background */}
        <ambientLight intensity={0.4} />

        {/* Calibrated directional key light to preserve highlight-to-shadow ratio and metallic detail definition */}
        <directionalLight position={[10, 15, 10]} intensity={1.0} />

        {/* High-fidelity city environment preset to drive clean metallic and plastic specular reflections */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          {/* 
            First-Person POV shoulder group wrapper.
            Anchors the forearm base at the bottom edge of the viewport, pointing forward along the Z axis.
          */}
          <group
            // POSITION: Anchor the shoulder/elbow at the bottom edge of the screen
            position={[0, -2, 2]} 
            // ROTATION: Orient the forearm to point straight forward (away from the camera, into the Z-axis)
            // [x, y, z] index mapping:
            //   rotation[0] = X axis -> controls "Tilt Up/Down" (Pitch)
            //   rotation[1] = Y axis -> controls "Pan Left/Right" (Yaw)
            //   rotation[2] = Z axis -> controls "Forearm Twist" (Roll)
            rotation={[-Math.PI / 2, 0, 0]} 
          >
            <Model />
          </group>

          <HologramTarget />

          {/* 
            Grounds the skeletal structure dynamically on the bright surface.
            Positioned at Y=-16 to sit just below the horizontally laid arm.
          */}
          <ContactShadows
            position={[0, -16, 0]}
            opacity={0.35}
            scale={60}
            blur={2.0}
            far={20}
          />
        </Suspense>

        {/* 
          Strict camera constraints optimized for patients:
          - target={[0, -5, -10]} aligns rotation center with the forward hand interaction zone
        */}
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2}
          target={[0, -5, -10]} 
        />
      </Canvas>
    </div>
  );
}
