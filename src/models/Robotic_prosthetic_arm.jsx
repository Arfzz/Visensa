import React, { useEffect } from "react";
import { useGraph, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useHandStore } from "../store/zustand/useHandStore";
import { useVisionStore } from '../store/zustand/VisionStore';

const boneMap = {
  lower_arm: null,
  wrist: null,
  thumb_mcp: null, thumb_pip: null, thumb_dip: null,
  index_mcp: null, index_pip: null, index_dip: null,
  middle_mcp: null, middle_pip: null, middle_dip: null,
  ring_mcp: null, ring_pip: null, ring_dip: null,
  pinky_mcp: null, pinky_pip: null, pinky_dip: null,
};

const BONE_KEYS = Object.keys(boneMap);
const CURL_MULTIPLIER = 2.0;

const DAMPING = {
  upper_arm: 0.08,
  lower_arm: 0.1,
  wrist: 0.15,
  default: 0.2,
};

const axisMapping = {
  default: (rot) => ({ x: rot.z, y: rot.x, z: -rot.y }),
  lower_arm: (rot) => ({ x: rot.z, y: rot.y, z: rot.x }), 
  wrist: (rot) => ({ x: rot.x, y: rot.y, z: rot.z })
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
  const { scene } = useGLTF("/models/robotic_prosthetic_arm.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const lastLogTimeRef = React.useRef(0);

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
    const handler = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'l' || key === 'o') {
        window.__captureLog = true;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (nodes) {
      boneMap.lower_arm = nodes.Bone001_01;
      boneMap.wrist = nodes.Bone002_02;
      boneMap.thumb_mcp = nodes.Bone003_03; boneMap.thumb_pip = nodes.Bone004_05; boneMap.thumb_dip = nodes.Bone005_06;
      boneMap.index_mcp = nodes.Bone016_016; boneMap.index_pip = nodes.Bone017_017; boneMap.index_dip = nodes.Bone018_018;
      boneMap.middle_mcp = nodes.Bone006_07; boneMap.middle_pip = nodes.Bone007_08; boneMap.middle_dip = nodes.Bone008_09;
      boneMap.ring_mcp = nodes.Bone009_010; boneMap.ring_pip = nodes.Bone010_011; boneMap.ring_dip = nodes.Bone011_012;
      boneMap.pinky_mcp = nodes.Bone012_013; boneMap.pinky_pip = nodes.Bone013_014; boneMap.pinky_dip = nodes.Bone014_015;

      for (let i = 0; i < BONE_KEYS.length; i++) {
        const key = BONE_KEYS[i];
        const bone = boneMap[key];
        if (bone) {
          initialRotations[key] = bone.quaternion.clone();
        }
      }
    }
  }, [nodes]);

  useFrame(() => {
    const pose = useHandStore.getState().handPose;
    if (!pose) return;

    if (pose.wrist && !pose.lower_arm) {
      pose.lower_arm = { x: 0, y: 0, z: 0 };
    }

    const inversionMap = {
      lower_arm:  { x: 1, y: -1, z: -1 }, 
      wrist:      { x: 1, y: -1, z: 1 },
      index_mcp:  { x: 1, y: -1, z: 1 },
      middle_mcp: { x: 1, y: -1, z: 1 },
      ring_mcp:   { x: 1, y: -1, z: 1 },
      pinky_mcp:  { x: 1, y: -1, z: 1 },
      thumb_mcp:  { x: 1, y: -1, z: 1 },
      thumb:      { x: 1, y: 1, z: 1 },
      index:      { x: 1, y: 1, z: -1 },
      middle:     { x: 1, y: 1, z: -1 },
      ring:       { x: 1, y: 1, z: -1 },
      pinky:      { x: 1, y: 1, z: -1 },
      default:    { x: 1, y: 1, z: 1 }
    };

    for (let i = 0; i < BONE_KEYS.length; i++) {
      const key = BONE_KEYS[i];
      const bone = boneMap[key];
      const rotation = pose[key];
      const initial = initialRotations[key];

      if (bone && rotation && initial) {
        const isWrist = key === "wrist";
        const isLowerArm = key === "lower_arm";
        
        const isTracking = pose.wrist && (pose.wrist.x !== 0 || pose.wrist.y !== 0 || pose.wrist.z !== 0);

        const mapper = axisMapping[key] || axisMapping.default;
        const swizzled = mapper(rotation);

        // --- LOWER ARM KINEMATICS ---
        if (isLowerArm) {
          if (pose.wrist) {
            swizzled.y = -((pose.wrist.y * 1.05) + (Math.PI / 2.5));
          } else {
            swizzled.y = 0;
          }

          const visionState = useVisionStore.getState();
          const poseLandmarks = visionState.poseLandmarks; 
          
          if (poseLandmarks && poseLandmarks[14] && poseLandmarks[16]) {
            const elbowDot = poseLandmarks[14]; 
            const wristDot = poseLandmarks[16]; 

            const deltaX = wristDot.x - elbowDot.x;
            const k = 3;
            const bendMultiplier = pose.wrist ? -Math.tanh(k * pose.wrist.y) : -1;

            swizzled.z = (deltaX * bendMultiplier);
          } else {
            swizzled.z = 0; 
          }
          swizzled.x = 0; 

          // --- DIAGNOSTIC LOG SEMENTARA (SNAPSHOT ON-DEMAND 'L' / 'O') ---
          if (window.__captureLog) {
            if (poseLandmarks && poseLandmarks[14] && poseLandmarks[16]) {
              const elbowDot = poseLandmarks[14]; 
              const wristDot = poseLandmarks[16]; 
              const deltaX = wristDot.x - elbowDot.x;
              const k = 3;
              const bendMultiplier = pose.wrist ? -Math.tanh(k * pose.wrist.y) : -1;
              console.log('%c[SNAPSHOT]', 'color: lime; font-weight: bold', {
                deltaX: deltaX.toFixed(4),
                poseWristY: pose.wrist ? pose.wrist.y.toFixed(4) : null,
                bendMultiplier: bendMultiplier.toFixed(4),
                swizzledZ: swizzled.z.toFixed(4),
              });
            } else {
              console.log('%c[SNAPSHOT WARNING]', 'color: yellow; font-weight: bold', {
                hasPoseLandmarks: !!poseLandmarks,
                hasElbow14: !!(poseLandmarks && poseLandmarks[14]),
                hasWrist16: !!(poseLandmarks && poseLandmarks[16]),
                poseWristY: pose.wrist ? pose.wrist.y.toFixed(4) : null,
              });
            }
            window.__captureLog = false;
          }
          // --- END DIAGNOSTIC LOG ---
        }

        // --- WRIST KINEMATICS (HAND LANDMARKS PIPE 0 & 9 + READY POSE CLAMP) ---
        if (isWrist) {
          const visionState = useVisionStore.getState();
          const handLandmarks = visionState.handLandmarks;

          if (handLandmarks && handLandmarks.length > 0) {
            const singleHand = Array.isArray(handLandmarks[0]) ? handLandmarks[0] : handLandmarks;
            const wristDot = singleHand[0]; // Base of palm / wrist
            const palmDot = singleHand[9];  // Middle MCP (pangkal jari tengah)

            if (wristDot && palmDot) {
              const deltaY = wristDot.y - palmDot.y;
              const deltaZ = palmDot.z - wristDot.z;

              const wristPitch = Math.atan2(deltaY, Math.sqrt(deltaZ * deltaZ + 0.001));

              // Hard anatomical limit: min -30 deg (-PI/6), max +60 deg (+PI/3)
              // Mencegah rotasi berlebihan menyentuh mesh lengan
              swizzled.x = THREE.MathUtils.clamp(wristPitch * 1.2, -Math.PI / 6, Math.PI / 3);
              swizzled.y = 0;
              swizzled.z = 0;
            }
          } else if (pose.wrist) {
            swizzled.x = THREE.MathUtils.clamp(pose.wrist.x, -Math.PI / 6, Math.PI / 3);
            swizzled.y = 0;
            swizzled.z = 0;
          } else {
            swizzled.x = 0;
            swizzled.y = 0;
            swizzled.z = 0;
          }
        }

        // --- FINGER KINEMATICS ---
        const isMCP = key.endsWith('_mcp');
        const fingerName = key.split('_')[0];
        const { x: multX, y: multY, z: multZ } = inversionMap[key] ?? inversionMap[fingerName] ?? inversionMap.default;

        if (isMCP && key !== 'thumb_mcp') {
          swizzled.x = 0;
          swizzled.z = 0;
        }

        const currentCurlMultiplier = isWrist ? 1 : CURL_MULTIPLIER;

        tempEuler.set(
          swizzled.x * multX,
          swizzled.y * multY * currentCurlMultiplier,
          swizzled.z * multZ
        );

        tempQuaternion.setFromEuler(tempEuler);
        targetQuaternion.copy(initial).multiply(tempQuaternion);

        // --- DOUBLE COVER SHORT-PATH GUARD ---
        if (bone.quaternion.dot(targetQuaternion) < 0) {
          targetQuaternion.negate();
        }

        const damping = DAMPING[key] ?? DAMPING.default;
        bone.quaternion.slerp(targetQuaternion, damping);
        bone.updateMatrixWorld(true);
      }
    }

    // --- PINCH DETECTION ---
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

      if (pinchDistance < 12.0 && targetDistance < 8.0) {
        useHandStore.getState().relocateTarget();
      }
    }
  });

  return (
    <primitive
      ref={group}
      object={clone}
      rotation={[-(Math.PI / 2), 0, 0]} 
      {...props}
    />
  );
}

useGLTF.preload("/models/robotic_prosthetic_arm.glb");