"use client";

import { Color, DoubleSide, ExtrudeGeometry, Path, Shape } from "three";
import { RoundedBox } from "@react-three/drei";

const PAPER = "#f7f3eb";
const PAPER_EDGE = "#d6cbbd";
const MAGENTA = "#d71878";
const CREASE = "#b7a895";

type Vec3 = [number, number, number];

function Panel({
  size,
  position,
  rotation = [0, 0, 0],
  color = PAPER,
  radius = 0.025,
}: {
  size: Vec3;
  position: Vec3;
  rotation?: Vec3;
  color?: string;
  radius?: number;
}) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={3} position={position} rotation={rotation} castShadow receiveShadow>
      <meshPhysicalMaterial color={new Color(color)} roughness={0.84} clearcoat={0.02} />
    </RoundedBox>
  );
}

function Crease({ position, rotation = [0, 0, 0], size }: { position: Vec3; rotation?: Vec3; size: Vec3 }) {
  return <Panel size={size} position={position} rotation={rotation} color={CREASE} radius={0.004} />;
}

/**
 * The pink closure rail is a real perforated panel. Its two openings are actual
 * mesh holes, rather than a pair of dark discs painted onto a solid strip.
 */
function PunchedClosureRail({ width, position }: { width: number; position: Vec3 }) {
  const rail = new Shape();
  const height = 0.42;
  rail.moveTo(-width / 2, -height / 2);
  rail.lineTo(width / 2, -height / 2);
  rail.lineTo(width / 2, height / 2);
  rail.lineTo(-width / 2, height / 2);
  rail.closePath();

  for (const x of [-1.67, 1.67]) {
    const hole = new Path();
    hole.absarc(x, 0, 0.17, 0, Math.PI * 2, true);
    rail.holes.push(hole);
  }

  const geometry = new ExtrudeGeometry(rail, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.018,
    bevelThickness: 0.016,
  });

  return (
    <mesh geometry={geometry} position={position} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial color={new Color(MAGENTA)} roughness={0.72} clearcoat={0.04} side={DoubleSide} />
    </mesh>
  );
}

/** Front panel with the shallow thumb notch shown in the reference turntable. */
function NotchedFrontWall({ width, height, thickness, depth }: { width: number; height: number; thickness: number; depth: number }) {
  const notchRadius = 0.32;
  const panel = new Shape();
  panel.moveTo(-width / 2, 0);
  panel.lineTo(width / 2, 0);
  panel.lineTo(width / 2, height);
  panel.lineTo(notchRadius, height);
  panel.quadraticCurveTo(0, height - notchRadius * 0.8, -notchRadius, height);
  panel.lineTo(-width / 2, height);
  panel.closePath();

  const geometry = new ExtrudeGeometry(panel, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.014,
    bevelThickness: 0.014,
  });

  return (
    <mesh geometry={geometry} position={[0, 0, depth / 2 - thickness / 2]} castShadow receiveShadow>
      <meshPhysicalMaterial color={new Color(MAGENTA)} roughness={0.72} clearcoat={0.04} side={DoubleSide} />
    </mesh>
  );
}

function OpenLid({ width, depth }: { width: number; depth: number }) {
  return (
    <group name="opening-lid" position={[0, 0.62, -depth / 2 + 0.08]} rotation={[-1.08, 0, 0]}>
      {/* Inner white board, rooted at the rear hinge and extending upward when opened. */}
      <Panel size={[width, 0.12, depth]} position={[0, 0, depth / 2]} color={PAPER} radius={0.02} />

      {/* Folded pink outer shell visible at the free edge and both side returns. */}
      <PunchedClosureRail width={width - 0.14} position={[0, -0.09, depth - 0.24]} />
      <Panel size={[0.24, 0.12, depth - 0.5]} position={[-width / 2 + 0.12, -0.07, depth / 2 - 0.02]} color={MAGENTA} radius={0.012} />
      <Panel size={[0.24, 0.12, depth - 0.5]} position={[width / 2 - 0.12, -0.07, depth / 2 - 0.02]} color={MAGENTA} radius={0.012} />

      {/* Inner fold system and two locking tabs shown in the supplied open-box view. */}
      <Crease position={[0, -0.072, 0.44]} size={[width - 0.45, 0.012, 0.024]} />
      <Crease position={[0, -0.072, depth - 0.5]} size={[width - 0.38, 0.012, 0.024]} />
      <Panel size={[0.32, 0.1, 0.44]} position={[-1.52, -0.1, 0.66]} rotation={[-0.35, 0, 0]} color={PAPER_EDGE} radius={0.016} />
      <Panel size={[0.32, 0.1, 0.44]} position={[1.52, -0.1, 0.66]} rotation={[-0.35, 0, 0]} color={PAPER_EDGE} radius={0.016} />
    </group>
  );
}

function Tray({ width, depth }: { width: number; depth: number }) {
  const wall = 0.15;
  const wallHeight = 0.62;

  return (
    <group name="folded-tray">
      <Panel size={[width, 0.14, depth]} position={[0, 0, 0]} color={PAPER} radius={0.022} />
      <Panel size={[width - 0.24, 0.014, depth - 0.28]} position={[0, 0.078, 0]} color="#fffdf8" radius={0.01} />

      {/* The reference has a coloured front exterior and a pale food-contact interior. */}
      <NotchedFrontWall width={width} height={wallHeight} thickness={wall} depth={depth} />
      <Panel size={[width - 0.24, 0.32, 0.035]} position={[0, 0.19, depth / 2 - 0.075]} color={PAPER} radius={0.008} />
      <Panel size={[width, wallHeight, wall]} position={[0, wallHeight / 2, -depth / 2]} color={PAPER} radius={0.018} />
      <Panel size={[wall, wallHeight, depth]} position={[-width / 2, wallHeight / 2, 0]} color={PAPER} radius={0.018} />
      <Panel size={[wall, wallHeight, depth]} position={[width / 2, wallHeight / 2, 0]} color={PAPER} radius={0.018} />

      {/* Slim pink outer-return strips make the tray read as a folded carton, not a plain tray. */}
      <Panel size={[0.12, wallHeight - 0.08, depth - 0.2]} position={[-width / 2 - 0.045, wallHeight / 2, 0]} color={MAGENTA} radius={0.01} />
      <Panel size={[0.12, wallHeight - 0.08, depth - 0.2]} position={[width / 2 + 0.045, wallHeight / 2, 0]} color={MAGENTA} radius={0.01} />

      <Crease position={[0, wallHeight + 0.012, depth / 2 - 0.07]} size={[width - 0.4, 0.018, 0.022]} />
      <Crease position={[-width / 2 + 0.07, wallHeight + 0.012, 0]} rotation={[0, Math.PI / 2, 0]} size={[depth - 0.42, 0.018, 0.022]} />
      <Crease position={[width / 2 - 0.07, wallHeight + 0.012, 0]} rotation={[0, Math.PI / 2, 0]} size={[depth - 0.42, 0.018, 0.022]} />
    </group>
  );
}

/**
 * Reference-guided reconstruction of the supplied open takeaway/pizza box.
 * It is an independently articulated carton: tray, hinge lid, pink closure rail,
 * perforations, fold lines, returns, and locking tabs are individual 3D parts.
 */
export function KehongPizzaBoxModel() {
  const width = 4.9;
  const depth = 4.05;

  return (
    <group name="kehong-reference-pizza-box" position={[0, 0, 0]} rotation={[0, -0.08, 0]}>
      <Tray width={width} depth={depth} />
      <OpenLid width={width} depth={depth} />
    </group>
  );
}
