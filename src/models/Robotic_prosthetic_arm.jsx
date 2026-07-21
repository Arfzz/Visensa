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

const CURL_MULTIPLIER = 2.0;

// ═══════════════════════════════════════════════════════════════════
// TWEAK POSISI PERGELANGAN (WRIST OFFSET)
// Jika gerakan sudah benar tapi telapak tangan tampak "melintir", 
// ubah angka di bawah ini (dalam radian). 
// Bantuan: Math.PI/2 = 90 derajat, Math.PI = 180 derajat.
// ═══════════════════════════════════════════════════════════════════
const WRIST_OFFSET = {
  x: 0,
  y: 0, // Zero-out: offset sebelumnya (-0.8) menyebabkan wrist melintir konstan
  z: 0
};

// Per-bone damping — higher = faster but twitchier
const DAMPING = {
  lower_arm: 0.22,
  wrist: 0.18,
  default: 0.15,
};

// ═══════════════════════════════════════════════════════════════════
// LIVE AXIS TUNER — press W to cycle wrist, L to cycle lower_arm
// Setelah ketemu mapping yang benar, hardcode dan hapus tuner ini.
// ═══════════════════════════════════════════════════════════════════
const MAPPING_OPTIONS = [
  { label: "A: default (z,x,-y)", fn: (r) => ({ x: r.z, y: r.x, z: -r.y }) },
  { label: "B: swap XZ (z,y,x)", fn: (r) => ({ x: r.z, y: r.y, z: r.x }) },
  { label: "C: Blender Z-up (x,z,-y)", fn: (r) => ({ x: r.x, y: r.z, z: -r.y }) },
  { label: "D: raw (x,y,z)", fn: (r) => ({ x: r.x, y: r.y, z: r.z }) },
  { label: "E: neg-swap (-z,x,y)", fn: (r) => ({ x: -r.z, y: r.x, z: r.y }) },
  { label: "F: (y,-x,z)", fn: (r) => ({ x: r.y, y: -r.x, z: r.z }) },
];

// Mutable indices — keyboard handler updates these
let wristMappingIdx = 0;  // starts at A (default, same as fingers)
let lowerArmMappingIdx = 2;  // starts at C (Blender Z-up)

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W") {
      wristMappingIdx = (wristMappingIdx + 1) % MAPPING_OPTIONS.length;
      console.log(`🔧 WRIST mapping → ${MAPPING_OPTIONS[wristMappingIdx].label}`);
    }
    if (e.key === "l" || e.key === "L") {
      lowerArmMappingIdx = (lowerArmMappingIdx + 1) % MAPPING_OPTIONS.length;
      console.log(`🔧 LOWER_ARM mapping → ${MAPPING_OPTIONS[lowerArmMappingIdx].label}`);
    }
  });
}

const axisMapping = {
  default: (rot) => ({
    x: rot.z,
    y: rot.x,
    z: -rot.y,
  }),
  // Wrist & lower_arm: resolved at runtime via tuner indices
  get wrist() { return MAPPING_OPTIONS[wristMappingIdx].fn; },
  get lower_arm() { return MAPPING_OPTIONS[lowerArmMappingIdx].fn; },
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
      lower_arm:  { x: -1, y: 1,  z: 1  },
      wrist:      { x: 1,  y: 1,  z: -1 },
      // MCP (pangkal jari): inversion berbeda dari PIP/DIP
      // curl direction dibalik karena orientasi bone beda
      index_mcp:  { x: 1,  y: -1, z: 1  },
      middle_mcp: { x: 1,  y: -1, z: 1  },
      ring_mcp:   { x: 1,  y: -1, z: 1  },
      pinky_mcp:  { x: 1,  y: -1, z: 1  },
      thumb_mcp:  { x: 1,  y: -1, z: 1  },
      // PIP / DIP: tetap sama seperti sebelumnya
      thumb:  { x: 1, y: -1, z: 1  },
      index:  { x: 1, y: 1,  z: -1 },
      middle: { x: 1, y: 1,  z: -1 },
      ring:   { x: 1, y: 1,  z: -1 },
      pinky:  { x: 1, y: 1,  z: -1 },
      default: { x: 1, y: 1, z: 1 }
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
        const isWrist = key === "wrist";
        const isLowerArm = key === "lower_arm";

        const mapper = axisMapping[key] || axisMapping.default;
        const swizzled = mapper(rotation);

        // lower_arm: menggunakan data posanya sendiri (dari Pose Landmarker),
        // tidak meminjam dari wrist. Sumbu Y di-lock ke 0 mencegah arm lari ke samping.
        if (isLowerArm) {
          swizzled.y = 0; // lock lateral yaw — normal untuk setup first-person
        }

        const isMCP = key.endsWith('_mcp');
        const fingerName = key.split('_')[0];
        // Cek full key dulu (untuk MCP overrides), lalu fallback ke fingerName
        const { x: multX, y: multY, z: multZ } = 
          inversionMap[key] ?? inversionMap[fingerName] ?? inversionMap.default;

        // MCP: suppress spread (X & Z) agar hanya curl yang aktif
        // Spread/abduction dari Kalidokit sering menyebabkan joint terlihat ngaco
        if (isMCP && key !== 'thumb_mcp') {
          swizzled.x = 0;
          swizzled.z = 0;
        }

        const currentCurlMultiplier = isWrist ? 1 : CURL_MULTIPLIER;
        const isTracking = rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0;

        tempEuler.set(
          swizzled.x * multX,
          swizzled.y * multY * currentCurlMultiplier,
          swizzled.z * multZ
        );

        tempQuaternion.setFromEuler(tempEuler);

        // Terapkan offset khusus untuk pergelangan tangan agar model selaras
        if (isWrist) {
          const offsetEuler = new THREE.Euler(WRIST_OFFSET.x, WRIST_OFFSET.y, WRIST_OFFSET.z);
          const offsetQuat = new THREE.Quaternion().setFromEuler(offsetEuler);
          tempQuaternion.multiply(offsetQuat);
        }

        targetQuaternion.copy(initial).multiply(tempQuaternion);

        // Per-bone damping: lengan lebih responsif, jari lebih stabil
        const damping = DAMPING[key] || DAMPING.default;
        bone.quaternion.slerp(targetQuaternion, damping);
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