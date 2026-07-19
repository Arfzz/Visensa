import React, { useEffect } from "react";
import { useGraph, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useHandStore } from "../store/zustand/useHandStore";

// Static mapping of logical bones to reference holders in module scope.
// Prevents GC churn by avoiding repeated array/object creation.
const boneMap = {
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

// Pre-allocated dampening factor to govern slerp transition speed.
const DAMPING_FACTOR = 0.15;

// Configurable multiplier to amplify finger bending/curling motion.
// Increase or decrease this value to fine-tune the tightness of the fist and the pinch.
const CURL_MULTIPLIER = 2.0;

// Remapping configuration to resolve coordinate system axis mismatches between Kalidokit and the GLTF bone structure.
const axisMapping = {
  // Default swizzling applied to all joints to match standard local bone orientations.
  default: (rot) => ({
    x: rot.z,
    y: rot.x,
    z: -rot.y,
  }),
};

// Pre-allocated reusable mathematical variables to prevent garbage collection churn inside the R3F loop.
const tempEuler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const targetQuaternion = new THREE.Quaternion();
const initialRotations = {};

// Pre-allocated vector variables for zero-instantiation collision distance calculations.
const thumbPos = new THREE.Vector3();
const indexPos = new THREE.Vector3();
const pinchPos = new THREE.Vector3();
const targetPosVec = new THREE.Vector3();

export function Model(props) {
  const group = React.useRef();
  const { scene, animations } = useGLTF("/models/robotic_prosthetic_arm.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);

  // Traverse materials once when clone changes to fix backface culling.
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

  // Bind local nodes to the boneMap external reference dictionary and cache rest pose orientations.
  useEffect(() => {
    if (nodes) {
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

  // High-frequency transient update loop. Reads from the Zustand store
  // imperatively to maintain a steady 60fps and bypass React's virtual DOM.
 useFrame((state) => {
    const pose = useHandStore.getState().handPose;
    if (!pose) return;

    // --- Transient Pose Logging ---
    if (!hasLoggedRef.current && pose.index_mcp && pose.index_mcp.x > 0) {
      console.log("Model - useFrame transient pose read (index_mcp.x > 0):", pose);
      hasLoggedRef.current = true;
    }
    if (hasLoggedRef.current && pose.index_mcp && pose.index_mcp.x === 0) {
      hasLoggedRef.current = false;
    }

    // --- Missing Bone Validation ---
    for (const poseKey in pose) {
      if (!(poseKey in boneMap) && !warnedKeysRef.current.has(poseKey)) {
        console.warn(`Bone key "${poseKey}" exists in Zustand but is missing from boneMap.`);
        warnedKeysRef.current.add(poseKey);
      }
    }

    // --- AXIS INVERSION MAP ---
    // Change 1 to -1 for x, y, or z to invert the bending direction for a specific finger.
    const inversionMap = {
      thumb:  { x: -1, y: 1, z: -1 },
      index:  { x: -1, y: -1, z: 1 },
      middle: { x: -1, y: -1, z: 1 },
      ring:   { x: -1, y: -1, z: 1 },
      pinky:  { x: -1, y: -1, z: 1 },
      wrist:  { x: 1, y: 1, z: 1 },
      default:{ x: 1, y: 1, z: 1 }
    };

    // --- Bone Rotation Loop ---
    for (let i = 0; i < BONE_KEYS.length; i++) {
      const key = BONE_KEYS[i];
      const bone = boneMap[key];
      const rotation = pose[key];
      const initial = initialRotations[key];

      if (bone && rotation && initial) {
        const mapper = axisMapping[key] || axisMapping.default;
        const swizzled = mapper(rotation);

        // 1. Extract prefix (e.g., "index" from "index_mcp") and fetch inversion config
        const fingerName = key.split('_')[0];
        const { x: multX, y: multY, z: multZ } = inversionMap[fingerName] || inversionMap.default;

        const isWrist = key === "wrist";
        const currentCurlMultiplier = isWrist ? 1 : CURL_MULTIPLIER;

        // 2. Apply multipliers to base euler
        tempEuler.set(
          swizzled.x * multX,
          swizzled.y * multY * currentCurlMultiplier,
          swizzled.z * multZ
        );

        // 3. Apply custom wrist offset for bind pose calibration
        if (isWrist) {
          const xOffset = 0; 
          const yOffset = 0; 
          const zOffset = 0; 

          tempEuler.set(
            tempEuler.x + xOffset,
            tempEuler.y + yOffset,
            tempEuler.z + zOffset
          );
        }

        // 4. Slerp to target rotation
        tempQuaternion.setFromEuler(tempEuler);
        targetQuaternion.copy(initial).multiply(tempQuaternion);
        bone.quaternion.slerp(targetQuaternion, DAMPING_FACTOR);
        bone.updateMatrixWorld(true);
      }
    }

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
        console.log(`[Debug Pinch] Fingertips Distance: ${pinchDistance.toFixed(2)} | To Target: ${targetDistance.toFixed(2)}`);
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
