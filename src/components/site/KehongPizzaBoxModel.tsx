"use client";

import { Color, DoubleSide, ExtrudeGeometry, Path, Shape } from "three";
import { RoundedBox } from "@react-three/drei";

const PAPER = "#f8f4ed";
const EDGE = "#d9cdbd";
const MAGENTA = "#d71978";
const INK = "#67224a";

type Vec3 = [number, number, number];

function Panel({
  size,
  position,
  rotation = [0, 0, 0],
  color = PAPER,
  radius = 0.035,
}: {
  size: Vec3;
  position: Vec3;
  rotation?: Vec3;
  color?: string;
  radius?: number;
}) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={3} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhysicalMaterial color={new Color(color)} roughness={0.82} clearcoat={0.03} />
    </RoundedBox>
  );
}

function FoldLine({ position, rotation = [0, 0, 0], size = [3.8, 0.018, 0.018] as Vec3 }: { position: Vec3; rotation?: Vec3; size?: Vec3 }) {
  return <Panel size={size} position={position} rotation={rotation} color={EDGE} radius={0.005} />;
}

function LidCard() {
  const lidShape = new Shape();
  lidShape.moveTo(-2.4, -1.9);
  lidShape.lineTo(2.4, -1.9);
  lidShape.lineTo(2.4, 1.9);
  lidShape.lineTo(-2.4, 1.9);
  lidShape.closePath();
  // True punched handle openings, rather than dark decals over a solid lid.
  for (const x of [-1.82, 1.82]) {
    const hole = new Path();
    hole.absarc(x, 1.35, 0.18, 0, Math.PI * 2, true);
    lidShape.holes.push(hole);
  }
  const lidGeometry = new ExtrudeGeometry(lidShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.02,
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={lidGeometry} position={[0, 1.9, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={new Color(PAPER)} roughness={0.82} clearcoat={0.03} side={DoubleSide} />
      </mesh>
      <Panel size={[4.72, 0.42, 0.16]} position={[0, 3.8, 0]} color={MAGENTA} radius={0.025} />
      <Panel size={[0.16, 0.34, 3.45]} position={[-2.34, 1.94, 0]} color={PAPER} radius={0.018} />
      <Panel size={[0.16, 0.34, 3.45]} position={[2.34, 1.94, 0]} color={MAGENTA} radius={0.018} />
      <FoldLine position={[0, 0.12, -0.1]} size={[4.4, 0.02, 0.02]} />
      <FoldLine position={[0, 3.55, -0.1]} size={[4.2, 0.02, 0.02]} />
    </group>
  );
}

function SideWing({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 2.42, 1.05, -1.42]} rotation={[0, side * 0.18, 0]}>
      <Panel size={[0.13, 1.9, 2.45]} position={[0, 0, 0]} color={side === 1 ? MAGENTA : PAPER} radius={0.02} />
      <Panel size={[0.16, 0.35, 0.52]} position={[0, -0.7, 0.92]} color={PAPER} radius={0.03} />
      <mesh position={[side * 0.075, 1.0, 0.15]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.035, 32]} />
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
}

/** Reference-guided pizza/takeaway box: tray, folded walls, hinge, side wings and cut-out handles. */
export function KehongPizzaBoxModel() {
  const width = 4.8;
  const depth = 4.15;
  const wall = 0.15;
  const rim = 0.52;
  const lidTilt = -1.12;

  return (
    <group name="kehong-pizza-box" position={[0, -0.04, 0]}>
      <Panel size={[width, wall, depth]} position={[0, 0, 0]} color={PAPER} radius={0.025} />
      <Panel size={[width, rim, wall]} position={[0, rim / 2, depth / 2]} color={MAGENTA} />
      <Panel size={[width, rim, wall]} position={[0, rim / 2, -depth / 2]} color={PAPER} />
      <Panel size={[wall, rim, depth]} position={[-width / 2, rim / 2, 0]} color={PAPER} />
      <Panel size={[wall, rim, depth]} position={[width / 2, rim / 2, 0]} color={MAGENTA} />

      <FoldLine position={[0, rim + 0.015, depth / 2 - 0.06]} size={[4.35, 0.02, 0.025]} />
      <FoldLine position={[0, rim + 0.015, -depth / 2 + 0.06]} size={[4.35, 0.02, 0.025]} />
      <FoldLine position={[-width / 2 + 0.06, rim + 0.015, 0]} rotation={[0, Math.PI / 2, 0]} size={[3.55, 0.02, 0.025]} />
      <FoldLine position={[width / 2 - 0.06, rim + 0.015, 0]} rotation={[0, Math.PI / 2, 0]} size={[3.55, 0.02, 0.025]} />

      <group position={[0, rim + 0.08, -depth / 2 + wall / 2]} rotation={[lidTilt, 0, 0]}>
        <LidCard />
        <SideWing side={-1} />
        <SideWing side={1} />
      </group>

      <Panel size={[0.7, 0.06, 0.12]} position={[0, rim + 0.035, -depth / 2 - 0.02]} color={EDGE} radius={0.01} />
      <mesh position={[0, rim + 0.02, depth / 2 + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.035, 32, 1, false, 0, Math.PI]} />
        <meshBasicMaterial color={INK} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
