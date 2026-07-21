import React, { useEffect } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { useHandStore } from '../store/zustand/useHandStore'

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
  lower_arm: 0.22,
  wrist: 0.18,
  default: 0.15,
};

const tempEuler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const targetQuaternion = new THREE.Quaternion();
const initialRotations = {};

export function Model(props) {
  const { scene } = useGLTF('/models/fullbodyvisensa.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)

  useEffect(() => {
    if (nodes) {
      boneMap.upper_arm = nodes.J_Bip_L_UpperArm;
      boneMap.lower_arm = nodes.J_Bip_L_LowerArm;
      boneMap.wrist = nodes.J_Bip_L_Hand;
      boneMap.thumb_mcp = nodes.J_Bip_L_Thumb1;
      boneMap.thumb_pip = nodes.J_Bip_L_Thumb2;
      boneMap.thumb_dip = nodes.J_Bip_L_Thumb3;
      boneMap.index_mcp = nodes.J_Bip_L_Index1;
      boneMap.index_pip = nodes.J_Bip_L_Index2;
      boneMap.index_dip = nodes.J_Bip_L_Index3;
      boneMap.middle_mcp = nodes.J_Bip_L_Middle1;
      boneMap.middle_pip = nodes.J_Bip_L_Middle2;
      boneMap.middle_dip = nodes.J_Bip_L_Middle3;
      boneMap.ring_mcp = nodes.J_Bip_L_Ring1;
      boneMap.ring_pip = nodes.J_Bip_L_Ring2;
      boneMap.ring_dip = nodes.J_Bip_L_Ring3;
      boneMap.pinky_mcp = nodes.J_Bip_L_Little1; 
      boneMap.pinky_pip = nodes.J_Bip_L_Little2;
      boneMap.pinky_dip = nodes.J_Bip_L_Little3;

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

    for (let i = 0; i < BONE_KEYS.length; i++) {
      const key = BONE_KEYS[i];
      const bone = boneMap[key];
      const rotation = pose[key];
      const initial = initialRotations[key];

      if (bone && rotation && initial) {
        const isWrist = key === "wrist";
        
        // --- STANDARD VRM MAPPING ---
        // Model fullbody VRM standar menggunakan sumbu XYZ asli dari Kalidokit
        let rotX = rotation.x;
        let rotY = rotation.y;
        let rotZ = rotation.z;

        const currentCurlMultiplier = isWrist ? 1 : CURL_MULTIPLIER;

        // Inversion standar untuk kamera cermin (mirrored)
        let multX = 1; 
        let multY = 1; 
        let multZ = -1; // Sumbu Z dibalik agar sesuai gerakan cermin

        tempEuler.set(
          rotX * multX, 
          rotY * multY * currentCurlMultiplier, 
          rotZ * multZ
        );

        tempQuaternion.setFromEuler(tempEuler);
        targetQuaternion.copy(initial).multiply(tempQuaternion);

        const damping = DAMPING[key] || DAMPING.default;
        bone.quaternion.slerp(targetQuaternion, damping);
        bone.updateMatrixWorld(true);
      }
    }
  });

  return (
    <primitive
      object={clone}
      {...props}
    />
  );
}

useGLTF.preload('/models/fullbodyvisensa.glb')
