import React, { useEffect } from "react";
import { useGraph, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useHandStore } from "../store/zustand/useHandStore";
import { useVisionStore } from "../store/zustand/VisionStore";

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

const DAMPING = {
  upper_arm: 3.0,
  lower_arm: 3.0,
  wrist: 7.0,
  default: 8.0,
};

const inversionMap = {
  lower_arm: { x: 1, y: -1, z: -1 },
  wrist: { x: 1, y: -1, z: 1 },
  index_mcp: { x: 1, y: -1, z: 1 },
  middle_mcp: { x: 1, y: -1, z: 1 },
  ring_mcp: { x: 1, y: -1, z: 1 },
  pinky_mcp: { x: 1, y: -1, z: 1 },
  thumb_mcp: { x: 1, y: -1, z: 1 },
  thumb: { x: 1, y: 1, z: 1 },
  index: { x: 1, y: 1, z: -1 },
  middle: { x: 1, y: 1, z: -1 },
  ring: { x: 1, y: 1, z: -1 },
  pinky: { x: 1, y: 1, z: -1 },
  default: { x: 1, y: 1, z: 1 },
};

const axisMapping = {
  default: (rot) => ({ x: rot.z, y: rot.x, z: -rot.y }),
  lower_arm: (rot) => ({ x: rot.z, y: rot.y, z: rot.x }),
  wrist: (rot) => ({ x: rot.x, y: rot.y, z: rot.z }),
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
  const lowerArmBaselineXRef = React.useRef(null);
  const hasLoggedFrameErrorRef = React.useRef(false);

  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material)
          ? child.material
          : [child.material];
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
      if (key === "l" || key === "o") {
        window.__captureLog = true;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (nodes) {
      boneMap.lower_arm = nodes.Bone001_01;
      boneMap.wrist = nodes.Bone002_02;
      boneMap.thumb_mcp = nodes.Bone015_04 || nodes.Bone003_03;
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

  useFrame((_, delta) => {
    try {
      if (!nodes || !nodes.Bone001_01) return;

      const pose = useHandStore.getState().handPose;
      if (!pose) return;

      if (hasLoggedFrameErrorRef.current) {
        hasLoggedFrameErrorRef.current = false;
      }

      if (pose.wrist && !pose.lower_arm) {
        pose.lower_arm = { x: 0, y: 0, z: 0 };
      }

      const visionState = useVisionStore.getState();

      for (let i = 0; i < BONE_KEYS.length; i++) {
        const key = BONE_KEYS[i];
        const bone = boneMap[key];
        const rotation = pose[key];
        const initial = initialRotations[key];

        if (bone && rotation && initial) {
          const isWrist = key === "wrist";
          const isLowerArm = key === "lower_arm";

          const isTracking =
            pose.wrist &&
            (pose.wrist.x !== 0 || pose.wrist.y !== 0 || pose.wrist.z !== 0);

          const mapper = axisMapping[key] || axisMapping.default;
          const swizzled = mapper(rotation);

          // --- LOWER ARM KINEMATICS ---
          if (isLowerArm) {
            if (pose.wrist) {
              swizzled.y = -(pose.wrist.y * 1.05 + Math.PI / 2.5);
            } else {
              swizzled.y = 0;
            }

            const handLandmarks = visionState.handLandmarks;
            const poseLandmarks = visionState.poseLandmarks;
            const isCalibrated = visionState.isCalibrated;

            let wristDotX = null;
            if (poseLandmarks && poseLandmarks[16]) {
              wristDotX = poseLandmarks[16].x;
            } else if (handLandmarks && handLandmarks.length > 0) {
              const singleHand = Array.isArray(handLandmarks[0])
                ? handLandmarks[0]
                : handLandmarks;
              if (singleHand[0]) wristDotX = singleHand[0].x;
            }

            let deviationRaw = 0;
            if (wristDotX !== null) {
              if (isCalibrated) {
                if (lowerArmBaselineXRef.current === null) {
                  lowerArmBaselineXRef.current = wristDotX;
                }
                deviationRaw = wristDotX - lowerArmBaselineXRef.current;
                const SENSITIVITY = 3.5;
                swizzled.z = deviationRaw * SENSITIVITY;
              } else {
                lowerArmBaselineXRef.current = null;
                swizzled.z = 0;
              }
            } else {
              lowerArmBaselineXRef.current = null;
              swizzled.z = 0;
            }
            swizzled.x = 0;

            // --- DIAGNOSTIC LOG SEMENTARA (SNAPSHOT ON-DEMAND 'L' / 'O') ---
            if (window.__captureLog) {
              console.log("%c[SNAPSHOT]", "color: lime; font-weight: bold", {
                handedness,
                isLeftHand,
                wristDotX: wristDotX !== null ? wristDotX.toFixed(4) : null,
                baselineX:
                  lowerArmBaselineXRef.current !== null
                    ? lowerArmBaselineXRef.current.toFixed(4)
                    : null,
                deviationRaw: deviationRaw.toFixed(4),
                swizzledZ: swizzled.z.toFixed(4),
              });
              window.__captureLog = false;
            }
            // --- END DIAGNOSTIC LOG ---
          }

          // --- WRIST KINEMATICS (HAND LANDMARKS PIPE 0 & 9 + READY POSE CLAMP) ---
          if (isWrist) {
            const handLandmarks = visionState.handLandmarks;

            if (handLandmarks && handLandmarks.length > 0) {
              const singleHand = Array.isArray(handLandmarks[0])
                ? handLandmarks[0]
                : handLandmarks;
              const wristDot = singleHand[0]; // Base of palm / wrist
              const palmDot = singleHand[9]; // Middle MCP (pangkal jari tengah)

              if (wristDot && palmDot) {
                const deltaY = wristDot.y - palmDot.y;
                const deltaZ = palmDot.z - wristDot.z;

                const wristPitch = Math.atan2(
                  deltaY,
                  Math.sqrt(deltaZ * deltaZ + 0.001),
                );

                swizzled.x = THREE.MathUtils.clamp(
                  wristPitch * 1.2,
                  -Math.PI / 6,
                  Math.PI / 3,
                );
                swizzled.y = 0;
                swizzled.z = 0;
              }
            } else if (pose.wrist) {
              swizzled.x = THREE.MathUtils.clamp(
                pose.wrist.x,
                -Math.PI / 6,
                Math.PI / 3,
              );
              swizzled.y = 0;
              swizzled.z = 0;
            } else {
              swizzled.x = 0;
              swizzled.y = 0;
              swizzled.z = 0;
            }
          }

          // --- FINGER KINEMATICS ---
          const isMCP = key.endsWith("_mcp");
          const fingerName = key.split("_")[0];
          const {
            x: multX,
            y: multY,
            z: multZ,
          } = inversionMap[key] ??
          inversionMap[fingerName] ??
          inversionMap.default;

          if (isMCP && key !== "thumb_mcp") {
            swizzled.x = swizzled.x * 2.0;
            swizzled.z = 0;
          }

          const currentCurlMultiplier = isWrist ? 1 : CURL_MULTIPLIER;

          const eulerOrder = isLowerArm ? "ZYX" : "XYZ";

          tempEuler.set(
            swizzled.x * multX,
            swizzled.y * multY * currentCurlMultiplier,
            swizzled.z * multZ,
            eulerOrder,
          );

          tempQuaternion.setFromEuler(tempEuler);
          targetQuaternion.copy(initial).multiply(tempQuaternion);

          // --- DOUBLE COVER SHORT-PATH GUARD ---
          if (bone.quaternion.dot(targetQuaternion) < 0) {
            targetQuaternion.set(
              -targetQuaternion.x,
              -targetQuaternion.y,
              -targetQuaternion.z,
              -targetQuaternion.w,
            );
          }

          const dampingRate = DAMPING[key] ?? DAMPING.default;
          const stepDamping = 1 - Math.exp(-dampingRate * delta);
          bone.quaternion.slerp(targetQuaternion, stepDamping);
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
        if (targetPos) {
          targetPosVec.set(targetPos.x, targetPos.y, targetPos.z);
          const targetDistance = pinchPos.distanceTo(targetPosVec);

          if (pinchDistance < 12.0 && targetDistance < 8.0) {
            useHandStore.getState().relocateTarget();
          }
        }
      }
    } catch (err) {
      if (!hasLoggedFrameErrorRef.current) {
        console.error("[Robotic_prosthetic_arm useFrame Error]:", err);
        hasLoggedFrameErrorRef.current = true;
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
