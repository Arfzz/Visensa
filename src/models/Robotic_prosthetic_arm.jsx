import React, { useEffect } from "react";
import { useGraph, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useHandStore } from "../store/useHandStore";

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

// Pre-allocated reusable mathematical variables to prevent garbage collection churn inside the R3F loop.
const tempEuler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
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

  // Traverse materials once when clone changes to fix backface culling
  // which is caused by negative scaling on the root group.
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
          // Quaternions are cloned to avoid gimbal lock when applying high-frequency multi-axis offsets.
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

    // Throttled useFrame debugger: log once when index_mcp.x > 0
    if (!hasLoggedRef.current && pose.index_mcp && pose.index_mcp.x > 0) {
      console.log("Model - useFrame transient pose read (index_mcp.x > 0):", pose);
      hasLoggedRef.current = true;
    }

    // Reset log flag if pose returns to rest to allow subsequent debug cycles
    if (hasLoggedRef.current && pose.index_mcp && pose.index_mcp.x === 0) {
      hasLoggedRef.current = false;
    }

    // Bone mapping safety check: warn if key exists in Zustand but not in boneMap
    for (const poseKey in pose) {
      if (!(poseKey in boneMap)) {
        if (!warnedKeysRef.current.has(poseKey)) {
          console.warn(`Bone key "${poseKey}" exists in Zustand store but is completely missing from boneMap.`);
          warnedKeysRef.current.add(poseKey);
        }
      }
    }

    for (let i = 0; i < BONE_KEYS.length; i++) {
      const key = BONE_KEYS[i];
      const bone = boneMap[key];
      const rotation = pose[key];
      const initial = initialRotations[key];
      if (bone && rotation && initial) {
        // Set Euler orientation using Euler XYZ from the transient handPose coordinate system
        tempEuler.set(rotation.x, rotation.y, rotation.z);
        tempQuaternion.setFromEuler(tempEuler);

        // Perform quaternion multiplication to combine rest pose and dynamic posture without gimbal lock
        bone.quaternion.copy(initial).multiply(tempQuaternion);

        // Force immediate local and world matrix recalculation for the skeletal system
        bone.updateMatrixWorld(true);
      }
    }

    // Precision Pinch collision logic: triggers target relocation if pinch is registered close to hologram.
    const thumbBone = boneMap.thumb_dip;
    const indexBone = boneMap.index_dip;
    if (thumbBone && indexBone) {
      // getWorldPosition requires immediate world matrices to be calculated beforehand (completed in loop above)
      thumbBone.getWorldPosition(thumbPos);
      indexBone.getWorldPosition(indexPos);

      const pinchDistance = thumbPos.distanceTo(indexPos);

      pinchPos.addVectors(thumbPos, indexPos).multiplyScalar(0.5);

      const targetPos = useHandStore.getState().targetPosition;
      targetPosVec.set(targetPos.x, targetPos.y, targetPos.z);

      const targetDistance = pinchPos.distanceTo(targetPosVec);

      // Throttled logging (once per 1.0 second) to inspect actual distances during static mock testing
      const now = state.clock.getElapsedTime();
      if (now - lastLogTimeRef.current > 1.0) {
        console.log(
          `[Debug Pinch] Fingertips Distance: ${pinchDistance.toFixed(2)} units | Distance to Target: ${targetDistance.toFixed(2)} units`
        );
        lastLogTimeRef.current = now;
      }

      // Calibrated thresholds based on actual model scale (Fingertips: ~9.36, Distance to Target: ~4.74)
      if (pinchDistance < 12.0 && targetDistance < 8.0) {
        console.log("Precision Pinch Success! Target Relocated.");
        // Success action: instantly relocates target within bounds
        useHandStore.getState().relocateTarget();
      }
    }
  });

  const { actions } = useAnimations(animations, group);

  return (
    <group ref={group} {...props} dispose={null} scale={[-1, 1, 1]}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, -Math.PI]}>
          <group
            name="c343d89ca7824aaab7741850a7e1c66efbx"
            rotation={[-Math.PI, 0, 0]}
          >
            <group name="Object_2">
              <group name="RootNode">
                <group name="Armature" position={[0, 0, 28.155]} scale={100}>
                  <group name="Object_5">
                    <primitive object={nodes._rootJoint} />
                    <group name="Object_26" position={[0, -0.008, 16.034]} />
                    <group name="Object_28" position={[0, -0.008, 19.821]} />
                    <group name="Object_30" position={[0, -0.008, 19.585]} />
                    <group name="Object_32" position={[0, -0.008, 19.821]} />
                    <group name="Object_34" position={[0, -0.003, 12.828]} />
                    <group name="Object_36" position={[0, 0, 19.318]} />
                    <group name="Object_38" position={[0, 0, 24.446]} />
                    <group name="Object_40" position={[0, -0.003, 2.285]} />
                    <group name="Object_42" position={[0, -0.003, 2.922]} />
                    <group name="Object_44" position={[0, -0.003, -8.828]} />
                    <group name="Object_46" position={[0, -0.003, -5.469]} />
                    <group name="Object_48" position={[0, -0.003, -7.557]} />
                    <group name="Object_50" position={[0, -2.909, -3.473]} />
                    <group name="Object_52" position={[0, -0.003, -7.108]} />
                    <group
                      name="Object_54"
                      position={[-0.011, -0.001, -11.367]}
                    />
                    <group
                      name="Object_56"
                      position={[0.937, 0.989, -16.607]}
                    />
                    <group
                      name="Object_58"
                      position={[-3.316, 0.421, -13.868]}
                    />
                    <group
                      name="Object_60"
                      position={[1.135, -1.442, -17.465]}
                    />
                    <group
                      name="Object_62"
                      position={[0.696, -0.111, -15.027]}
                    />
                    <group
                      name="Object_64"
                      position={[0.49, -1.231, -13.222]}
                    />
                    <group
                      name="Object_66"
                      position={[-4.944, 0.511, -15.08]}
                    />
                    <group
                      name="Object_68"
                      position={[-1.816, -0.129, -19.243]}
                    />
                    <group
                      name="Object_70"
                      position={[-2.1, -0.129, -22.884]}
                    />
                    <group
                      name="Object_72"
                      position={[-2.328, -0.084, -25.815]}
                    />
                    <group
                      name="Object_74"
                      position={[0.509, -0.254, -19.282]}
                    />
                    <group
                      name="Object_76"
                      position={[0.743, -0.254, -23.004]}
                    />
                    <group
                      name="Object_78"
                      position={[0.933, -0.208, -26.002]}
                    />
                    <group
                      name="Object_80"
                      position={[2.397, -0.254, -18.789]}
                    />
                    <group
                      name="Object_82"
                      position={[3.23, -0.254, -22.173]}
                    />
                    <group
                      name="Object_84"
                      position={[3.901, -0.211, -24.898]}
                    />
                    <group
                      name="Object_86"
                      position={[4.007, -0.254, -17.741]}
                    />
                    <group
                      name="Object_88"
                      position={[5.077, -0.254, -20.318]}
                    />
                    <group
                      name="Object_90"
                      position={[5.939, -0.219, -22.393]}
                    />
                    <group
                      name="Object_92"
                      position={[-6.497, 0.511, -17.727]}
                    />
                    <group
                      name="Object_94"
                      position={[-5.967, 0.511, -16.342]}
                    />
                    <group
                      name="Object_96"
                      position={[-7.263, 0.511, -19.004]}
                    />
                    <group
                      name="Object_98"
                      position={[-2.408, -0.114, -26.849]}
                    />
                    <group name="Object_100" position={[1, -0.239, -27.058]} />
                    <group
                      name="Object_102"
                      position={[4.138, -0.24, -25.859]}
                    />
                    <group
                      name="Object_104"
                      position={[6.243, -0.242, -23.124]}
                    />
                    <group
                      name="Object_106"
                      position={[-1.967, -0.338, -21.186]}
                    />
                    <group
                      name="Object_108"
                      position={[0.635, -0.467, -21.269]}
                    />
                    <group
                      name="Object_110"
                      position={[2.842, -0.453, -20.595]}
                    />
                    <group
                      name="Object_112"
                      position={[4.578, -0.413, -19.116]}
                    />
                    <group
                      name="Object_114"
                      position={[-2.219, -0.221, -24.419]}
                    />
                    <group
                      name="Object_116"
                      position={[0.843, -0.347, -24.574]}
                    />
                    <group
                      name="Object_118"
                      position={[3.582, -0.341, -23.6]}
                    />
                    <group
                      name="Object_120"
                      position={[5.529, -0.324, -21.404]}
                    />
                    <skinnedMesh
                      name="Object_27"
                      geometry={nodes.Object_27.geometry}
                      material={materials.UpperArm}
                      skeleton={nodes.Object_27.skeleton}
                    />
                    <skinnedMesh
                      name="Object_29"
                      geometry={nodes.Object_29.geometry}
                      material={materials.UpperArm}
                      skeleton={nodes.Object_29.skeleton}
                    />
                    <skinnedMesh
                      name="Object_31"
                      geometry={nodes.Object_31.geometry}
                      material={materials.UpperArm}
                      skeleton={nodes.Object_31.skeleton}
                    />
                    <skinnedMesh
                      name="Object_33"
                      geometry={nodes.Object_33.geometry}
                      material={materials.UpperArm}
                      skeleton={nodes.Object_33.skeleton}
                    />
                    <skinnedMesh
                      name="Object_35"
                      geometry={nodes.Object_35.geometry}
                      material={materials.UpperArm}
                      skeleton={nodes.Object_35.skeleton}
                    />
                    <skinnedMesh
                      name="Object_37"
                      geometry={nodes.Object_37.geometry}
                      material={materials.UpperArm}
                      skeleton={nodes.Object_37.skeleton}
                    />
                    <skinnedMesh
                      name="Object_39"
                      geometry={nodes.Object_39.geometry}
                      material={materials.UpperArm}
                      skeleton={nodes.Object_39.skeleton}
                    />
                    <skinnedMesh
                      name="Object_41"
                      geometry={nodes.Object_41.geometry}
                      material={materials.LowerArm}
                      skeleton={nodes.Object_41.skeleton}
                    />
                    <skinnedMesh
                      name="Object_43"
                      geometry={nodes.Object_43.geometry}
                      material={materials.LowerArm}
                      skeleton={nodes.Object_43.skeleton}
                    />
                    <skinnedMesh
                      name="Object_45"
                      geometry={nodes.Object_45.geometry}
                      material={materials.LowerArm}
                      skeleton={nodes.Object_45.skeleton}
                    />
                    <skinnedMesh
                      name="Object_47"
                      geometry={nodes.Object_47.geometry}
                      material={materials.LowerArm}
                      skeleton={nodes.Object_47.skeleton}
                    />
                    <skinnedMesh
                      name="Object_49"
                      geometry={nodes.Object_49.geometry}
                      material={materials.LowerArm}
                      skeleton={nodes.Object_49.skeleton}
                    />
                    <skinnedMesh
                      name="Object_51"
                      geometry={nodes.Object_51.geometry}
                      material={materials.LowerArm}
                      skeleton={nodes.Object_51.skeleton}
                    />
                    <skinnedMesh
                      name="Object_53"
                      geometry={nodes.Object_53.geometry}
                      material={materials.LowerArm}
                      skeleton={nodes.Object_53.skeleton}
                    />
                    <skinnedMesh
                      name="Object_55"
                      geometry={nodes.Object_55.geometry}
                      material={materials.Hand}
                      skeleton={nodes.Object_55.skeleton}
                    />
                    <skinnedMesh
                      name="Object_57"
                      geometry={nodes.Object_57.geometry}
                      material={materials.Hand}
                      skeleton={nodes.Object_57.skeleton}
                    />
                    <skinnedMesh
                      name="Object_59"
                      geometry={nodes.Object_59.geometry}
                      material={materials.Hand}
                      skeleton={nodes.Object_59.skeleton}
                    />
                    <skinnedMesh
                      name="Object_61"
                      geometry={nodes.Object_61.geometry}
                      material={materials.Hand}
                      skeleton={nodes.Object_61.skeleton}
                    />
                    <skinnedMesh
                      name="Object_63"
                      geometry={nodes.Object_63.geometry}
                      material={materials.Hand}
                      skeleton={nodes.Object_63.skeleton}
                    />
                    <skinnedMesh
                      name="Object_65"
                      geometry={nodes.Object_65.geometry}
                      material={materials.Hand}
                      skeleton={nodes.Object_65.skeleton}
                    />
                    <skinnedMesh
                      name="Object_67"
                      geometry={nodes.Object_67.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_67.skeleton}
                    />
                    <skinnedMesh
                      name="Object_69"
                      geometry={nodes.Object_69.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_69.skeleton}
                    />
                    <skinnedMesh
                      name="Object_71"
                      geometry={nodes.Object_71.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_71.skeleton}
                    />
                    <skinnedMesh
                      name="Object_73"
                      geometry={nodes.Object_73.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_73.skeleton}
                    />
                    <skinnedMesh
                      name="Object_75"
                      geometry={nodes.Object_75.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_75.skeleton}
                    />
                    <skinnedMesh
                      name="Object_77"
                      geometry={nodes.Object_77.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_77.skeleton}
                    />
                    <skinnedMesh
                      name="Object_79"
                      geometry={nodes.Object_79.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_79.skeleton}
                    />
                    <skinnedMesh
                      name="Object_81"
                      geometry={nodes.Object_81.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_81.skeleton}
                    />
                    <skinnedMesh
                      name="Object_83"
                      geometry={nodes.Object_83.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_83.skeleton}
                    />
                    <skinnedMesh
                      name="Object_85"
                      geometry={nodes.Object_85.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_85.skeleton}
                    />
                    <skinnedMesh
                      name="Object_87"
                      geometry={nodes.Object_87.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_87.skeleton}
                    />
                    <skinnedMesh
                      name="Object_89"
                      geometry={nodes.Object_89.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_89.skeleton}
                    />
                    <skinnedMesh
                      name="Object_91"
                      geometry={nodes.Object_91.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_91.skeleton}
                    />
                    <skinnedMesh
                      name="Object_93"
                      geometry={nodes.Object_93.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_93.skeleton}
                    />
                    <skinnedMesh
                      name="Object_95"
                      geometry={nodes.Object_95.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_95.skeleton}
                    />
                    <skinnedMesh
                      name="Object_97"
                      geometry={nodes.Object_97.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_97.skeleton}
                    />
                    <skinnedMesh
                      name="Object_99"
                      geometry={nodes.Object_99.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_99.skeleton}
                    />
                    <skinnedMesh
                      name="Object_101"
                      geometry={nodes.Object_101.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_101.skeleton}
                    />
                    <skinnedMesh
                      name="Object_103"
                      geometry={nodes.Object_103.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_103.skeleton}
                    />
                    <skinnedMesh
                      name="Object_105"
                      geometry={nodes.Object_105.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_105.skeleton}
                    />
                    <skinnedMesh
                      name="Object_107"
                      geometry={nodes.Object_107.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_107.skeleton}
                    />
                    <skinnedMesh
                      name="Object_109"
                      geometry={nodes.Object_109.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_109.skeleton}
                    />
                    <skinnedMesh
                      name="Object_111"
                      geometry={nodes.Object_111.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_111.skeleton}
                    />
                    <skinnedMesh
                      name="Object_113"
                      geometry={nodes.Object_113.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_113.skeleton}
                    />
                    <skinnedMesh
                      name="Object_115"
                      geometry={nodes.Object_115.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_115.skeleton}
                    />
                    <skinnedMesh
                      name="Object_117"
                      geometry={nodes.Object_117.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_117.skeleton}
                    />
                    <skinnedMesh
                      name="Object_119"
                      geometry={nodes.Object_119.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_119.skeleton}
                    />
                    <skinnedMesh
                      name="Object_121"
                      geometry={nodes.Object_121.geometry}
                      material={materials.Fingers}
                      skeleton={nodes.Object_121.skeleton}
                    />
                  </group>
                </group>
                <group name="Buttons_low" position={[0, -0.008, 16.034]} />
                <group name="Vents1_low" position={[0, -0.008, 19.821]} />
                <group name="Pipes_low" position={[0, -0.008, 19.585]} />
                <group name="Vents2_low" position={[0, -0.008, 19.821]} />
                <group name="BallJoint_low" position={[0, -0.003, 12.828]} />
                <group name="UpperArm_low" position={[0, 0, 19.318]} />
                <group name="Padding_low" position={[0, 0, 24.446]} />
                <group name="PaddingArm_low" position={[0, -0.003, 2.285]} />
                <group name="LowerArm_low" position={[0, -0.003, 2.922]} />
                <group name="WristBolts3_low" position={[0, -0.003, -8.828]} />
                <group name="WristBolts1_low" position={[0, -0.003, -5.469]} />
                <group name="WristBolts2_low" position={[0, -0.003, -7.557]} />
                <group name="WristDial_low" position={[0, -2.909, -3.473]} />
                <group name="Wrist_low" position={[0, -0.003, -7.108]} />
                <group
                  name="WristJoint_low"
                  position={[-0.011, -0.001, -11.367]}
                />
                <group name="Palm_low" position={[0.937, 0.989, -16.607]} />
                <group
                  name="ThumbJoint_low"
                  position={[-3.316, 0.421, -13.868]}
                />
                <group name="Balls_low" position={[1.135, -1.442, -17.465]} />
                <group name="Hand_low" position={[0.696, -0.111, -15.027]} />
                <group
                  name="HandDetail_low"
                  position={[0.49, -1.231, -13.222]}
                />
                <group
                  name="BallJoint1_low"
                  position={[-4.944, 0.511, -15.08]}
                />
                <group
                  name="BallJoint3_low"
                  position={[-1.816, -0.129, -19.243]}
                />
                <group
                  name="BallJoint4_low"
                  position={[-2.1, -0.129, -22.884]}
                />
                <group
                  name="BallJoint5_low"
                  position={[-2.328, -0.084, -25.815]}
                />
                <group
                  name="BallJoint6_low"
                  position={[0.509, -0.254, -19.282]}
                />
                <group
                  name="BallJoint7_low"
                  position={[0.743, -0.254, -23.004]}
                />
                <group
                  name="BallJoint8_low"
                  position={[0.933, -0.208, -26.002]}
                />
                <group
                  name="BallJoint9_low"
                  position={[2.397, -0.254, -18.789]}
                />
                <group
                  name="BallJoint10_low"
                  position={[3.23, -0.254, -22.173]}
                />
                <group
                  name="BallJoint11_low"
                  position={[3.901, -0.211, -24.898]}
                />
                <group
                  name="BallJoint12_low"
                  position={[4.007, -0.254, -17.741]}
                />
                <group
                  name="BallJoint13_low"
                  position={[5.077, -0.254, -20.318]}
                />
                <group
                  name="BallJoint14_low"
                  position={[5.939, -0.219, -22.393]}
                />
                <group
                  name="BallJoint2_low"
                  position={[-6.497, 0.511, -17.727]}
                />
                <group name="Finger1_low" position={[-5.967, 0.511, -16.342]} />
                <group name="Finger2_low" position={[-7.263, 0.511, -19.004]} />
                <group
                  name="Finger5_low"
                  position={[-2.408, -0.114, -26.849]}
                />
                <group name="Finger8_low" position={[1, -0.239, -27.058]} />
                <group name="Finger11_low" position={[4.138, -0.24, -25.859]} />
                <group
                  name="Finger14_low"
                  position={[6.243, -0.242, -23.124]}
                />
                <group
                  name="Finger3_low"
                  position={[-1.967, -0.338, -21.186]}
                />
                <group name="Finger6_low" position={[0.635, -0.467, -21.269]} />
                <group name="Finger9_low" position={[2.842, -0.453, -20.595]} />
                <group
                  name="Finger12_low"
                  position={[4.578, -0.413, -19.116]}
                />
                <group
                  name="Finger4_low"
                  position={[-2.219, -0.221, -24.419]}
                />
                <group name="Finger7_low" position={[0.843, -0.347, -24.574]} />
                <group name="Finger10_low" position={[3.582, -0.341, -23.6]} />
                <group
                  name="Finger13_low"
                  position={[5.529, -0.324, -21.404]}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/robotic_prosthetic_arm.glb");
