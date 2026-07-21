import React, { useEffect } from "react";
import { useGraph, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useHandStore } from "../store/zustand/useHandStore";

// Typo duplikat udah gua bersihin dan upper_arm udah dimasukin
const boneMap = {
  lower_arm: null,
  wrist: null,
  thumb_mcp: null,
  thumb_pip: null,
  thumb_dip: null,
  index_mcp: null,
  index_pip: null,
  index_dip: null,
  middle_mcp: null,
  middle_pip: null,
  middle_dip: null,
  ring_mcp: null,
  ring_pip: null,
  ring_dip: null,
  pinky_mcp: null,
  pinky_pip: null,
  pinky_dip: null,
};

const BONE_KEYS = Object.keys(boneMap);

const DAMPING_FACTOR = 0.15;
const CURL_MULTIPLIER = 2.0;

const axisMapping = {
  default: (rot) => ({
    x: rot.z,
    y: rot.x,
    z: -rot.y,
  }),
// Opsi 1: Sumbu Y & Z ketuker (Kasus Blender paling umum)
  // lower_arm: (rot) => ({ x: rot.x, y: rot.z, z: -rot.y }),
  
  // Opsi 2: Engselnya ada di sumbu Z Kalidokit, tapi X di Blender
  // lower_arm: (rot) => ({ x: rot.z, y: rot.y, z: rot.x }),
  
  // Opsi 3: Melintir 90 derajat (X ketuker sama Y)
  // lower_arm: (rot) => ({ x: rot.y, y: -rot.x, z: rot.z }),

  // Opsi 4: Data mentah Kalidokit (Siapa tau temen lu bikin rigging Y-Up murni)
  lower_arm: (rot) => ({ x: rot.x, y: rot.y, z: rot.z }),


// wrist: (rot) => ({ x: rot.x, y: rot.y, z: rot.z }),

  // OPSI A: Samain kayak jari-jari (Biasanya ini yang paling bener kalau rigging-nya rapi)
  // wrist: (rot) => ({ x: rot.z, y: rot.x, z: -rot.y }),

  // OPSI B: Sumbu X dan Z ketuker
  wrist: (rot) => ({ x: rot.z, y: rot.y, z: rot.x }),

  // OPSI C: Lawan arah dari Opsi A
  // wrist: (rot) => ({ x: -rot.z, y: -rot.x, z: rot.y }),
};

const tempEuler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const targetQuaternion = new THREE.Quaternion();
const initialRotations = {};

const thumbPos = new THREE.Vector3();
const indexPos = new THREE.Vector3();
const pinchPos = new THREE.Vector3();
const targetPosVec = new THREE.Vector3();

export function Model(props) {
  const group = React.useRef();
  const { scene, animations } = useGLTF("/models/robotic_prosthetic_arm.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);

  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (let i = 0; i < mats.length; i++) {
          mats[i].side = THREE.DoubleSide;
          mats[i].needsUpdate = true;
        }
      }
    });
  }, [clone]);

  useEffect(() => {
    if (nodes) {
      boneMap.lower_arm = nodes.Bone001_01;
      boneMap.wrist = nodes.Bone002_02;
      boneMap.thumb_mcp = nodes.Bone003_03;
      boneMap.thumb_pip = nodes.Bone004_05;
      boneMap.thumb_dip = nodes.Bone005_06;
      boneMap.index_mcp = nodes.Bone016_016;
      boneMap.index_pip = nodes.Bone017_017;
      boneMap.index_dip = nodes.Bone018_018;
      boneMap.middle_mcp = nodes.Bone006_07;
      boneMap.middle_pip = nodes.Bone007_08;
      boneMap.middle_dip = nodes.Bone008_09;
      boneMap.ring_mcp = nodes.Bone009_010;
      boneMap.ring_pip = nodes.Bone010_011;
      boneMap.ring_dip = nodes.Bone011_012;
      boneMap.pinky_mcp = nodes.Bone012_013;
      boneMap.pinky_pip = nodes.Bone013_014;
      boneMap.pinky_dip = nodes.Bone014_015;

      for (let i = 0; i < BONE_KEYS.length; i++) {
        const key = BONE_KEYS[i];
        const bone = boneMap[key];
        if (bone) {
          initialRotations[key] = bone.quaternion.clone();
        }
      }
    }
  }, [nodes]);

  const hasLoggedRef = React.useRef(false);
  const warnedKeysRef = React.useRef(new Set());
  const lastLogTimeRef = React.useRef(0);

  useFrame((state) => {
    const pose = useHandStore.getState().handPose;
    if (!pose) return;

    if (!hasLoggedRef.current && pose.index_mcp && pose.index_mcp.x > 0) {
      console.log("Model - useFrame transient pose read (index_mcp.x > 0):", pose);
      hasLoggedRef.current = true;
    }
    if (hasLoggedRef.current && pose.index_mcp && pose.index_mcp.x === 0) {
      hasLoggedRef.current = false;
    }

    for (const poseKey in pose) {
      if (!(poseKey in boneMap) && !warnedKeysRef.current.has(poseKey)) {
        console.warn(`Bone key "${poseKey}" exists in Zustand but is missing from boneMap.`);
        warnedKeysRef.current.add(poseKey);
      }
    }

    const inversionMap = {
      lower_arm: { x: -1, y: 1, z: 1 },
      thumb:  { x: 1, y: -1, z: 1 },
      index:  { x: 1, y: 1, z: -1 },
      middle: { x: 1, y: 1, z: -1 },
      ring:   { x: 1, y: 1, z: -1 },
      pinky:  { x: 1, y: 1, z: -1 },
      
      wrist:  { x: 1, y: -1, z: -1 },
      default:{ x: 1, y: 1, z: 1 }
    };

    // --- Bone Rotation Loop ---
    for (let i = 0; i < BONE_KEYS.length; i++) {
      const key = BONE_KEYS[i];
      const bone = boneMap[key];
      const rotation = pose[key];
      // if (key === "lower_arm") {
      //     bone.rotation.set(0, 0, 0);
      //     continue;
      // }
      const initial = initialRotations[key];

      if (bone && rotation && initial) {
        const mapper = axisMapping[key] || axisMapping.default;
        const swizzled = mapper(rotation);

        if (key === "lower_arm") {
          const wristSwizzled = axisMapping.default(pose.wrist);
          
          swizzled.z = wristSwizzled.x; // Copas sumbu pelintiran dari pergelangan
          swizzled.y = 0;               // Gembok sumbu belok biar lengan ga lari ke kiri
        }
        
        const fingerName = key.split('_')[0];
        const { x: multX, y: multY, z: multZ } = inversionMap[fingerName] || inversionMap.default;

        const isWrist = key === "wrist";
        const isLowerArm = key === "lower_arm";
        const currentCurlMultiplier = isWrist ? 1 : CURL_MULTIPLIER;
        const isTracking = rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0;

        tempEuler.set(
          swizzled.x * multX,
          swizzled.y * multY * currentCurlMultiplier,
          swizzled.z * multZ
        );
        if (isTracking) {
          if (isLowerArm) {
            // Math.PI / 2 itu 90 derajat. 
            // Kalo pas lu save dia malah muter ke arah sebaliknya (malah makin miring), 
            // lu tinggal ganti tandanya jadi minus: -Math.PI / 2
            tempEuler.set(
              tempEuler.x,
              tempEuler.y,
              tempEuler.z+ -(Math.PI / 2)
            );
          }

          if (isWrist) {
            // --- FOKUS BENERIN OFFSET PERGELANGAN DI SINI ---
            const xOffset = 0; 
            // Mainkan yOffset ini (misal -0.5, -0.8, atau 0.5) sampai pergelangan 3D lu sejajar lurus
            const yOffset = -0.5; 
            const zOffset = 0; 

            tempEuler.set(
              tempEuler.x + xOffset,
              tempEuler.y + yOffset,
              tempEuler.z + zOffset
            );
          }
        }

        tempQuaternion.setFromEuler(tempEuler);
        targetQuaternion.copy(initial).multiply(tempQuaternion);
        bone.quaternion.slerp(targetQuaternion, DAMPING_FACTOR);
        bone.updateMatrixWorld(true);
      }
    }
    // GUA HAPUS BLOK FAKE IK (lowerArmBone) DI SINI. Udah murni ditangani loop di atas.

    // --- Precision Pinch Logic ---
    const thumbBone = boneMap.thumb_dip;
    const indexBone = boneMap.index_dip;
    
    if (thumbBone && indexBone) {
      thumbBone.getWorldPosition(thumbPos);
      indexBone.getWorldPosition(indexPos);

      const pinchDistance = thumbPos.distanceTo(indexPos);
      pinchPos.addVectors(thumbPos, indexPos).multiplyScalar(0.5);

      const targetPos = useHandStore.getState().targetPosition;
      targetPosVec.set(targetPos.x, targetPos.y, targetPos.z);
      const targetDistance = pinchPos.distanceTo(targetPosVec);

      const now = state.clock.getElapsedTime();
      if (now - lastLogTimeRef.current > 1.0) {
        // console.log(`[Debug Pinch] Fingertips Distance: ${pinchDistance.toFixed(2)} | To Target: ${targetDistance.toFixed(2)}`);
        lastLogTimeRef.current = now;
      }

      if (pinchDistance < 12.0 && targetDistance < 8.0) {
        console.log("Precision Pinch Success! Target Relocated.");
        useHandStore.getState().relocateTarget();
      }
    }
  });

  const { actions } = useAnimations(animations, group);

  return (
    <primitive
      ref={group}
      object={clone}
      {...props}
    />
  );
}

useGLTF.preload("/models/robotic_prosthetic_arm.glb");