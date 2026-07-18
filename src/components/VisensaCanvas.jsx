import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import { Model } from "../models/Robotic_prosthetic_arm";
import { HologramTarget } from "./HologramTarget";

export function VisensaCanvas() {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 50 }}
        shadows={false} // Performance: Disable WebGL shadow mapping to minimize shader complexity and draw calls
        style={{ width: "100%", height: "100%" }}
      >
        {/* Soft, bright clinical off-white background to maximize contrast for future gamification overlays */}
        <color attach="background" args={["#f8f9fa"]} />

        {/* Lower fill light intensity to prevent high-key flat lighting against the white background */}
        <ambientLight intensity={0.4} />

        {/* Calibrated directional key light to preserve highlight-to-shadow ratio and metallic detail definition */}
        <directionalLight position={[10, 15, 10]} intensity={1.0} />

        {/* High-fidelity city environment preset to drive clean metallic and plastic specular reflections */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Model />
          <HologramTarget />

          {/* 
            Grounds the skeletal structure dynamically on the bright surface.
            Subtle opacity (0.35) prevents a harsh black pool of shadow under the model.
          */}
          <ContactShadows
            position={[0, -15, 0]}
            opacity={0.35}
            scale={60}
            blur={2.0}
            far={20}
          />
        </Suspense>

        {/* 
          Strict camera constraints optimized for patients of all ages:
          - enablePan: false prevents accidental lateral panning away from the primary interaction target.
          - minDistance / maxDistance: prevents frustum clipping and zoom disorientation.
          - maxPolarAngle: locks camera rotation at the horizon plane, preventing disorienting underneath views.
        */}
        <OrbitControls
          enablePan={false}
          minDistance={25}
          maxDistance={80}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
