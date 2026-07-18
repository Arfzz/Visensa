import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { Model } from "./models/Robotic_prosthetic_arm";
import { MockTester } from "./components/MockTester";
import { VisensaCanvas } from "./components/VisensaCanvas";

export default function App() {
  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <VisensaCanvas />
      <MockTester />

    </div>
  );
}