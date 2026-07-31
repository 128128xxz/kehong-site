import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Path,
  Shape,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// This asset is an independently authored reconstruction of the supplied open-carton
// reference. It is not generated from the older React blockout component.
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        this.onloadend?.();
      });
    }
  };
}

const INNER_BOARD = new MeshPhysicalMaterial({ color: new Color("#fcfaf5"), roughness: 0.77, clearcoat: 0.015 });
INNER_BOARD.name = "white food-contact paperboard";
const PAPER_EDGE = new MeshPhysicalMaterial({ color: new Color("#cabeb0"), roughness: 0.87 });
PAPER_EDGE.name = "exposed paperboard edge";
const PRINTED_BOARD = new MeshPhysicalMaterial({ color: new Color("#d91b78"), roughness: 0.6, clearcoat: 0.025 });
PRINTED_BOARD.name = "magenta printed exterior board";
const SCORE = new MeshPhysicalMaterial({ color: new Color("#b5a897"), roughness: 0.92 });
SCORE.name = "pressed score line";

function box(name, [width, height, depth], [x, y, z], material, radius = 0.015) {
  const mesh = new Mesh(new RoundedBoxGeometry(width, height, depth, 5, radius), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  return mesh;
}

function score(name, position, size, rotation = [0, 0, 0]) {
  const mesh = box(name, size, position, SCORE, 0.003);
  mesh.rotation.set(...rotation);
  return mesh;
}

function extrudedShape(name, shape, thickness, material, position, rotation = [0, 0, 0]) {
  const mesh = new Mesh(new ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.014,
    bevelThickness: 0.014,
  }), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.material.side = DoubleSide;
  return mesh;
}

function frontPanelShape(width, height, notchWidth = 0.38, notchDepth = 0.2) {
  const shape = new Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height);
  shape.lineTo(notchWidth, height);
  shape.quadraticCurveTo(0, height - notchDepth, -notchWidth, height);
  shape.lineTo(-width / 2, height);
  shape.closePath();
  return shape;
}

function closureFlapShape(width, height) {
  const shape = new Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.lineTo(width / 2 - 0.08, height / 2);
  shape.lineTo(-width / 2 + 0.08, height / 2);
  shape.closePath();
  for (const x of [-1.85, 1.85]) {
    const hole = new Path();
    hole.absarc(x, 0.01, 0.18, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  return shape;
}

function createTray(width, depth) {
  const tray = new Group();
  tray.name = "folded lower tray";
  const board = 0.11;
  const wall = 0.69;
  const frontZ = depth / 2 - board / 2;
  const rearZ = -depth / 2 + board / 2;

  tray.add(
    box("lower tray substrate", [width, board, depth], [0, 0, 0], PAPER_EDGE, 0.025),
    box("food-contact base liner", [width - 0.22, 0.018, depth - 0.23], [0, 0.066, 0], INNER_BOARD, 0.012),
    extrudedShape("front printed wall with thumb notch", frontPanelShape(width, wall), board, PRINTED_BOARD, [0, 0, frontZ]),
    box("front white inner face", [width - 0.24, wall - 0.16, 0.025], [0, wall / 2 - 0.05, frontZ - 0.075], INNER_BOARD, 0.008),
    box("rear hinge wall", [width, wall, board], [0, wall / 2, rearZ], INNER_BOARD, 0.018),
    box("left inner tray wall", [board, wall, depth - 0.08], [-width / 2 + board / 2, wall / 2, 0], INNER_BOARD, 0.018),
    box("right inner tray wall", [board, wall, depth - 0.08], [width / 2 - board / 2, wall / 2, 0], INNER_BOARD, 0.018),
    box("left printed outer return", [0.15, wall - 0.11, depth - 0.24], [-width / 2 - 0.035, wall / 2 - 0.02, 0], PRINTED_BOARD, 0.012),
    box("right printed outer return", [0.15, wall - 0.11, depth - 0.24], [width / 2 + 0.035, wall / 2 - 0.02, 0], PRINTED_BOARD, 0.012),
    score("front fold score", [0, wall + 0.012, frontZ - 0.065], [width - 0.5, 0.016, 0.018]),
    score("left tray fold score", [-width / 2 + 0.058, wall + 0.012, 0], [depth - 0.46, 0.016, 0.018], [0, Math.PI / 2, 0]),
    score("right tray fold score", [width / 2 - 0.058, wall + 0.012, 0], [depth - 0.46, 0.016, 0.018], [0, Math.PI / 2, 0]),
  );

  // Triangular end gussets give the folded lower tray its distinctive, non-rectangular corner read.
  for (const x of [-1, 1]) {
    const gusset = new Shape();
    gusset.moveTo(0, 0);
    gusset.lineTo(0.32, 0);
    gusset.lineTo(0, 0.32);
    gusset.closePath();
    const mesh = extrudedShape(x < 0 ? "left front fold gusset" : "right front fold gusset", gusset, 0.04, PAPER_EDGE, [x * (width / 2 - 0.18), 0.08, frontZ - 0.13], [0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
    tray.add(mesh);
  }
  return tray;
}

function createLid(width, depth) {
  const lid = new Group();
  lid.name = "hinged upper lid";
  lid.position.set(0, 0.64, -depth / 2 + 0.06);
  lid.rotation.x = -1.13;

  const board = 0.105;
  const flapHeight = 0.5;
  lid.add(
    box("lid paperboard edge core", [width, board, depth], [0, 0, depth / 2], PAPER_EDGE, 0.025),
    box("lid white inner sheet", [width - 0.16, 0.018, depth - 0.16], [0, -0.062, depth / 2], INNER_BOARD, 0.014),
    // The closure strip has two true openings, not painted circles.
    extrudedShape("perforated magenta closure flap", closureFlapShape(width - 0.12, flapHeight), 0.11, PRINTED_BOARD, [0, -0.12, depth - 0.2], [-Math.PI / 2, 0, 0]),
    score("free-edge fold score", [0, -0.073, depth - 0.48], [width - 0.5, 0.012, 0.025]),
    score("hinge score", [0, -0.073, 0.32], [width - 0.36, 0.012, 0.025]),
  );

  // Side returns are folded along the lid's two long edges, and must remain
  // attached to the lid-local plane when the hinge rotates.
  lid.add(
    box("left folded magenta lid return", [0.2, 0.105, depth - 0.48], [-width / 2 + 0.1, -0.112, depth / 2 - 0.02], PRINTED_BOARD, 0.011),
    box("right folded magenta lid return", [0.2, 0.105, depth - 0.48], [width / 2 - 0.1, -0.112, depth / 2 - 0.02], PRINTED_BOARD, 0.011),
  );

  // Hinge and two inner locking tabs are separate meshes for inspection / future animation.
  lid.add(
    box("rear hinge barrel", [width - 0.34, 0.12, 0.14], [0, -0.04, 0.02], PAPER_EDGE, 0.02),
    box("left lid locking tab", [0.34, 0.075, 0.46], [-1.72, -0.115, 0.62], INNER_BOARD, 0.02),
    box("right lid locking tab", [0.34, 0.075, 0.46], [1.72, -0.115, 0.62], INNER_BOARD, 0.02),
  );
  lid.children.at(-2).rotation.x = -0.42;
  lid.children.at(-1).rotation.x = -0.42;
  return lid;
}

function createModel() {
  const root = new Group();
  root.name = "Kehong image-guided open pizza carton v2";
  root.userData = {
    source: "two supplied reference views",
    fidelity: "image-guided procedural reconstruction",
    states: ["open"],
    namedParts: ["folded lower tray", "hinged upper lid", "perforated magenta closure flap"],
  };
  const width = 6.0;
  const depth = 4.32;
  root.add(createTray(width, depth), createLid(width, depth));
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  return root;
}

const outFile = path.resolve("public/models/kehong-reference-pizza-box.glb");
await mkdir(path.dirname(outFile), { recursive: true });
const exporter = new GLTFExporter();
const glb = await new Promise((resolve, reject) => {
  exporter.parse(createModel(), resolve, reject, { binary: true, includeCustomExtensions: true });
});
await writeFile(outFile, Buffer.from(glb));
console.log(`Wrote ${outFile}`);
