import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState } from "react";
import { Model } from "../models/Visensa3d";
import { HologramTarget } from "./HologramTarget";

export function VisensaCanvas() {
  // Live Tuner State
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(-16);
  const [posZ, setPosZ] = useState(30);
  const [modelScale, setModelScale] = useState(12);
  const [rotY, setRotY] = useState(90); // Slider rotasi dalam derajat (0-360)

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
      {/* Live Tuner UI */}
      <div style={{
        position: "absolute",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.8)",
        padding: "16px",
        borderRadius: "12px",
        color: "white",
        zIndex: 1000,
        display: "flex",
        gap: "16px",
        fontFamily: "monospace"
      }}>
        <div>
          <label>X: {posX}</label><br/>
          <input type="range" min="-50" max="50" value={posX} onChange={(e) => setPosX(Number(e.target.value))} />
        </div>
        <div>
          <label>Y: {posY}</label><br/>
          <input type="range" min="-50" max="50" value={posY} onChange={(e) => setPosY(Number(e.target.value))} />
        </div>
        <div>
          <label>Z: {posZ}</label><br/>
          <input type="range" min="-50" max="50" value={posZ} onChange={(e) => setPosZ(Number(e.target.value))} />
        </div>
        <div>
          <label>Rot (Derajat): {rotY}</label><br/>
          <input type="range" min="-180" max="180" value={rotY} onChange={(e) => setRotY(Number(e.target.value))} />
        </div>
        <div>
          <label>Scale: {modelScale}</label><br/>
          <input type="range" min="1" max="30" value={modelScale} onChange={(e) => setModelScale(Number(e.target.value))} />
        </div>
      </div>

      <Canvas
        shadows={false}
        style={{ width: "100%", height: "100%" }}
      >
        <PerspectiveCamera makeDefault position={[0, 8, 35]} fov={50} />
        <color attach="background" args={["#f8f9fa"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <group
            position={[posX, posY, posZ]}
            rotation={[0, rotY * (Math.PI / 180), 0]} // Konversi derajat ke radian
            scale={modelScale}
          >
            <Model />
          </group>

          <HologramTarget />

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
          minDistance={10}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2}
          target={[0, -5, -10]} 
        />
      </Canvas>
    </div>
  );
}
