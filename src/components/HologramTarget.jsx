import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useHandStore } from "../store/useHandStore";

export function HologramTarget() {
  const torusRef = useRef();
  const sphereRef = useRef();
  
  // Reactively track the target position from Zustand for rendering updates.
  const targetPosition = useHandStore((state) => state.targetPosition);

  // Micro-animations for visual polish and to indicate interactivity/glow.
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (torusRef.current) {
      torusRef.current.rotation.y += 0.02;
      torusRef.current.rotation.x = Math.sin(elapsed * 2) * 0.15;
    }
    if (sphereRef.current) {
      // Pulse scale to represent a beating/active target
      const scale = 1.0 + Math.sin(elapsed * 5) * 0.15;
      sphereRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[targetPosition.x, targetPosition.y, targetPosition.z]}>
      {/* Outer rotating Torus ring - increased dimensions for clear clinical visibility */}
      <mesh ref={torusRef}>
        <torusGeometry args={[3.0, 0.6, 16, 64]} />
        <meshStandardMaterial 
          color="#00f3ff" 
          emissive="#00f3ff" 
          emissiveIntensity={2.0} 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Inner pulsating core Sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial 
          color="#00ff88" 
          emissive="#00ff88" 
          emissiveIntensity={2.5} 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}
