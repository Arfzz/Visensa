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
  const [showDebugger, setShowDebugger] = useState(true);

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
      {/* --- FLOATING DEBUGGING MODAL PANEL --- */}
      {showDebugger && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            zIndex: 9999,
            pointerEvents: "auto",
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "12px",
            padding: "16px",
            width: "280px",
            color: "#f8fafc",
            fontFamily: "sans-serif",
            fontSize: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "8px",
            }}
          >
            <span
              style={{ fontWeight: 700, color: "#38bdf8", fontSize: "13px" }}
            >
              🛠️ 3D Layout Debugger
            </span>
            <button
              onClick={() => setShowDebugger(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Position X */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Position X:</span>
                <span style={{ color: "#38bdf8" }}>{posX}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="0.5"
                value={posX}
                onChange={(e) => setPosX(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            {/* Position Y */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Position Y:</span>
                <span style={{ color: "#38bdf8" }}>{posY}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="20"
                step="0.5"
                value={posY}
                onChange={(e) => setPosY(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            {/* Position Z */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Position Z:</span>
                <span style={{ color: "#38bdf8" }}>{posZ}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="10"
                step="0.5"
                value={posZ}
                onChange={(e) => setPosZ(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            {/* Scale */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Scale:</span>
                <span style={{ color: "#38bdf8" }}>{modelScale}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={modelScale}
                onChange={(e) => setModelScale(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            {/* Rotation Y */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Rotation Y:</span>
                <span style={{ color: "#38bdf8" }}>{rotY}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotY}
                onChange={(e) => setRotY(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            {/* Rotation X */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Rotation X:</span>
                <span style={{ color: "#38bdf8" }}>{rotX}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={rotX}
                onChange={(e) => setRotX(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            {/* Rotation Z (Palm Flip) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Rotation Z (Flip):</span>
                <span style={{ color: "#38bdf8" }}>{rotZ}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotZ}
                onChange={(e) => setRotZ(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setPosX(-0.5);
                setPosY(-8.5);
                setPosZ(0);
                setModelScale(1.35);
                setRotY(0);
                setRotX(0);
                setRotZ(153);
              }}
              style={{
                marginTop: "4px",
                padding: "6px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reset Default
            </button>
          </div>
        </div>
      )}

      {/* Show Toggle Button if Debugger Closed */}
      {!showDebugger && (
        <button
          onClick={() => setShowDebugger(true)}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            zIndex: 9999,
            pointerEvents: "auto",
            padding: "8px 14px",
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            color: "#38bdf8",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "12px",
          }}
        >
          🛠️ Open 3D Debugger
        </button>
      )}

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
