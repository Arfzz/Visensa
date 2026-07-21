import React, { useEffect } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { useHandStore } from '../store/zustand/useHandStore'

// ── boneMap: semua tulang yang akan digerakkan (upper_arm HARUS ada di sini) ──
const boneMap = {
  upper_arm: null,
  lower_arm:  null,
  wrist:      null,
  thumb_mcp:  null, thumb_pip:  null, thumb_dip:  null,
  index_mcp:  null, index_pip:  null, index_dip:  null,
  middle_mcp: null, middle_pip: null, middle_dip: null,
  ring_mcp:   null, ring_pip:   null, ring_dip:   null,
  pinky_mcp:  null, pinky_pip:  null, pinky_dip:  null,
};

const BONE_KEYS = Object.keys(boneMap);

// Amplitudo tekukan jari — naikkan jika tangan kurang ekspresif
const CURL_MULTIPLIER = 1.8;

const DAMPING = {
  upper_arm: 0.10,
  lower_arm: 0.14,
  wrist:     0.16,
  default:   0.12,
};

const tempEuler        = new THREE.Euler();
const tempQuaternion   = new THREE.Quaternion();
const targetQuaternion = new THREE.Quaternion();
const initialRotations = {};

export function Model(props) {
  const { scene } = useGLTF('/models/fullbodyvisensa.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes } = useGraph(clone)

  useEffect(() => {
    if (!nodes) return;

    // Sambungkan semua tulang ke J_Bip_R_* (right arm avatar)
    // Bridge mengirim data tangan kanan user langsung (tanpa mirror)
    // ke bones kanan avatar — tidak ada inversi diperlukan.
    boneMap.upper_arm  = nodes.J_Bip_R_UpperArm;
    boneMap.lower_arm  = nodes.J_Bip_R_LowerArm;
    boneMap.wrist      = nodes.J_Bip_R_Hand;
    boneMap.thumb_mcp  = nodes.J_Bip_R_Thumb1;
    boneMap.thumb_pip  = nodes.J_Bip_R_Thumb2;
    boneMap.thumb_dip  = nodes.J_Bip_R_Thumb3;
    boneMap.index_mcp  = nodes.J_Bip_R_Index1;
    boneMap.index_pip  = nodes.J_Bip_R_Index2;
    boneMap.index_dip  = nodes.J_Bip_R_Index3;
    boneMap.middle_mcp = nodes.J_Bip_R_Middle1;
    boneMap.middle_pip = nodes.J_Bip_R_Middle2;
    boneMap.middle_dip = nodes.J_Bip_R_Middle3;
    boneMap.ring_mcp   = nodes.J_Bip_R_Ring1;
    boneMap.ring_pip   = nodes.J_Bip_R_Ring2;
    boneMap.ring_dip   = nodes.J_Bip_R_Ring3;
    boneMap.pinky_mcp  = nodes.J_Bip_R_Little1;
    boneMap.pinky_pip  = nodes.J_Bip_R_Little2;
    boneMap.pinky_dip  = nodes.J_Bip_R_Little3;

    // Simpan rotasi T-Pose tiap tulang sebagai baseline
    for (let i = 0; i < BONE_KEYS.length; i++) {
      const bone = boneMap[BONE_KEYS[i]];
      if (bone) initialRotations[BONE_KEYS[i]] = bone.quaternion.clone();
    }

    const missing = BONE_KEYS.filter(k => !boneMap[k]);
    if (missing.length > 0) console.warn('[Visensa3d] Tulang tidak ditemukan:', missing);
    else console.log('[Visensa3d] ✅ Semua tulang tersambung!');
  }, [nodes]);

  useFrame(() => {
    const pose = useHandStore.getState().handPose;
    if (!pose) return;

    for (let i = 0; i < BONE_KEYS.length; i++) {
      const key      = BONE_KEYS[i];
      const bone     = boneMap[key];
      const rotation = pose[key];
      const initial  = initialRotations[key];

      if (!bone || !rotation || !initial) continue;

      const isWrist    = key === 'wrist';
      const isUpperArm = key === 'upper_arm';
      const isArm      = isUpperArm || key === 'lower_arm';
      const isFinger   = !isArm && !isWrist;

      // ── Kalidokit sudah mengeluarkan Euler dalam ruang VRM yang benar ──
      // Tidak perlu swizzle/inversion manual — langsung pakai nilai aslinya.
      // (Mirror sudah dilakukan di bridge sebelum solve)
      let rotX = rotation.x;
      let rotY = rotation.y;
      let rotZ = rotation.z;

      const curlMult = isFinger ? CURL_MULTIPLIER : 1;

      if (isFinger) {
        // VRM right hand: curl (Kalidokit X) harus ke sumbu Z euler
        tempEuler.set(rotZ, rotY, rotX * curlMult);
      } else if (isWrist) {
        // VRM right wrist swizzle
        tempEuler.set(rotZ, rotY, rotX);
      } else if (isUpperArm) {
        // VRM right upper arm: elevasi → +Z | swing → Y
        tempEuler.set(0, -rotZ, rotX);
      } else {
        // lower_arm: tekukan siku (rotX dari bridge) → local Z euler
        // Pada VRM right lower arm, Z rotation = fleksi siku naik/turun
        tempEuler.set(0, 0, rotX);
      }
      tempQuaternion.setFromEuler(tempEuler);
      targetQuaternion.copy(initial).multiply(tempQuaternion);

      const damping = DAMPING[key] ?? DAMPING.default;
      bone.quaternion.slerp(targetQuaternion, damping);
      bone.updateMatrixWorld(true);
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
