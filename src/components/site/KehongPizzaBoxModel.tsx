"use client";

import { useMemo } from "react";
import { Color } from "three";
import { RoundedBox } from "@react-three/drei";

const PAPER = "#f6f1e8";
const MAGENTA = "#d71978";
const SHADOW = "#5c233f";

function Panel({
  size,
  position,
  rotation = [0, 0, 0],
  color = PAPER,
  radius = 0.04,
}: {
  size: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  radius?: number;
}) {
  return (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial color={new Color(color)} roughness={0.84} clearcoat={0.02} />
    </RoundedBox>
  );
}

function HandleHole({ position, rotation = [Math.PI / 2, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.19, 0.19, 0.025, 32]} />
      <meshBasicMaterial color={SHADOW} />
    </mesh>
  );
}

/** Procedural open pizza/takeaway box built from the two supplied reference views. */
export function KehongPizzaBoxModel() {
  const dimensions = useMemo(() => ({ width: 4.8, depth: 4.15, wall: 0.16, rim: 0.46 }), []);
  const { width, depth, wall, rim } = dimensions;
  const lidAngle = -1.1;

  return (
    <group name="kehong-pizza-box" position={[0, -0.06, 0]}>
      <Panel size={[width, wall, depth]} position={[0, 0, 0]} color={PAPER} radius={0.025} />

      <Panel size={[width, rim, wall]} position={[0, rim / 2, depth / 2]} color={MAGENTA} />
      <Panel size={[width, rim, wall]} position={[0, rim / 2, -depth / 2]} color={PAPER} />
      <Panel size={[wall, rim, depth]} position={[-width / 2, rim / 2, 0]} color={PAPER} />
      <Panel size={[wall, rim, depth]} position={[width / 2, rim / 2, 0]} color={MAGENTA} />

      <group position={[0, rim + 0.02, -depth / 2 + wall / 2]} rotation={[lidAngle, 0, 0]}>
        <Panel size={[width, wall, depth * 0.95]} position={[0, 0, depth * 0.47]} color={PAPER} radius={0.03} />
        <Panel size={[width, rim * 0.9, wall]} position={[0, depth * 0.95, 0]} color={MAGENTA} />
        <Panel size={[wall, rim * 0.86, depth * 0.94]} position={[-width / 2, depth * 0.47, 0]} color={PAPER} />
        <Panel size={[wall, rim * 0.86, depth * 0.94]} position={[width / 2, depth * 0.47, 0]} color={MAGENTA} />
        <HandleHole position={[-width * 0.38, depth * 0.95 + 0.01, 0.02]} rotation={[0, 0, 0]} />
        <HandleHole position={[width * 0.38, depth * 0.95 + 0.01, 0.02]} rotation={[0, 0, 0]} />
      </group>

      <mesh position={[0, rim + 0.015, depth / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.2]} />
        <meshBasicMaterial color={SHADOW} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
