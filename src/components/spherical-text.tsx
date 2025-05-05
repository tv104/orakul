"use client";

import { FC, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface SphericalTextProps {
  text: string;
  onReady?: () => void;
  className?: string;
}

interface CharPosition {
  position: [number, number, number];
  quaternion: THREE.Quaternion;
  char: string;
  key: string;
}

const rows = 11;
const radius = 3.5;
const fontSize = 0.4;
const rotationSpeed = -0.0015;
const sphereCenter = new THREE.Vector3(0, 0, 0);
const worldUpDirection = new THREE.Vector3(0, 1, 0);

const SphericalText3D: FC<SphericalTextProps> = ({ text, onReady }) => {
  const group = useRef<THREE.Group>(null);
  const textWithSpace = useMemo(() => {
    return ` ${text} `;
  }, [text]);

  const characters = useMemo(() => {
    const chars: CharPosition[] = [];

    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      const phi = (rowIdx / (rows - 1)) * Math.PI; // 0 (top) to PI (bottom)
      const y = radius * Math.cos(phi);
      const rowRadius = radius * Math.sin(phi);

      // Skip the poles
      if (Math.abs(rowRadius) < 0.2) continue;

      // Calculate number of chars for this latitude
      const circumference = 2 * Math.PI * rowRadius;
      const charsInRow = Math.max(
        5,
        Math.floor(circumference / (fontSize * 0.6))
      );

      // Create characters around the circle
      for (let charIdx = 0; charIdx < charsInRow; charIdx++) {
        const theta = (charIdx / charsInRow) * Math.PI * 2;
        const x = rowRadius * Math.sin(theta);
        const z = rowRadius * Math.cos(theta);

        const charIndex = (rowIdx + charIdx) % textWithSpace.length;
        const char = textWithSpace[charIndex];
        const charPosition = new THREE.Vector3(x, y, z);

        const rotationMatrix = new THREE.Matrix4().lookAt(
          charPosition,
          sphereCenter,
          worldUpDirection
        );

        const quaternion = new THREE.Quaternion().setFromRotationMatrix(
          rotationMatrix
        );

        chars.push({
          position: [x, y, z],
          quaternion,
          char,
          key: `${rowIdx}-${charIdx}`,
        });
      }
    }

    return chars;
  }, [textWithSpace]);

  useEffect(() => {
    const checkReady = () => {
      if (group.current) {
        onReady?.();
      }
    };

    const timer = setTimeout(checkReady, 100);
    return () => clearTimeout(timer);
  }, [onReady]);

  useFrame(() => {
    if (group.current) group.current.rotation.y += rotationSpeed;
  });

  return (
    <group ref={group}>
      {characters.map(({ position, quaternion, char, key }) => (
        <Text
          key={key}
          position={position}
          quaternion={quaternion}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="fonts/Meddon-Regular.ttf"
        >
          {char}
        </Text>
      ))}
    </group>
  );
};

export const SphericalText: FC<SphericalTextProps> = ({
  className = "",
  onReady,
  ...props
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      className={`w-full h-full ${className}`}
    >
      <SphericalText3D {...props} onReady={onReady} />
    </Canvas>
  );
};
