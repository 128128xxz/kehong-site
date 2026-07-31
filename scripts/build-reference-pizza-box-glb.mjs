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

// GLTFExporter uses FileReader in browser builds. This minimal polyfill is
// enough for the binary-only export performed in this Node build script.
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

const PAPER = new MeshPhysicalMaterial({ color: new Color("#f7f3eb"), roughness: 0.84, clearcoat: 0.02 });
PAPER.name = "food-contact white paperboard";
const PAPER_EDGE = new MeshPhysicalMaterial({ color: new Color("#d6cbbd"), roughness: 0.76, clearcoat: 0.01 });
PAPER_EDGE.name = "paperboard edge";
const MAGENTA = new MeshPhysicalMaterial({ color: new Color("#d71878"), roughness: 0.72, clearcoat: 0.04 });
MAGENTA.name = "magenta printed outer board";
const CREASE = new MeshPhysicalMaterial({ color: new Color("#b7a895"), roughness: 0.9 });
CREASE.name = "scored fold line";

function roundedBox(name, [width, height, depth], [x, y, z], material, radius = 0.02) {
  const mesh = new Mesh(new RoundedBoxGeometry(width, height, depth, 4, radius), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  return mesh;
}

function crease(name, position, size, rotation = [0, 0, 0]) {
  const mesh = roundedBox(name, size, position, CREASE, 0.003);
  mesh.rotation.set(...rotation);
  return mesh;
}

function punchedClosureRail(width, depth) {
  const height = 0.42;
  const rail = new Shape();
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

  const mesh = new Mesh(new ExtrudeGeometry(rail, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.018,
    bevelThickness: 0.016,
  }), MAGENTA);
  mesh.name = "punched magenta closure rail";
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -0.09, depth - 0.24);
  mesh.material.side = DoubleSide;
  return mesh;
}

function notchedFrontWall(width, height, thickness, depth) {
  const notchRadius = 0.32;
  const panel = new Shape();
  panel.moveTo(-width / 2, 0);
  panel.lineTo(width / 2, 0);
  panel.lineTo(width / 2, height);
  panel.lineTo(notchRadius, height);
  panel.quadraticCurveTo(0, height - notchRadius * 0.8, -notchRadius, height);
  panel.lineTo(-width / 2, height);
  panel.closePath();

  const mesh = new Mesh(new ExtrudeGeometry(panel, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.014,
    bevelThickness: 0.014,
  }), MAGENTA);
  mesh.name = "notched magenta front wall";
  mesh.position.set(0, 0, depth / 2 - thickness / 2);
  mesh.material.side = DoubleSide;
  return mesh;
}

function createTray(width, depth) {
  const tray = new Group();
  tray.name = "carton tray";
  const wall = 0.15;
  const wallHeight = 0.62;

  tray.add(
    roundedBox("tray base", [width, 0.14, depth], [0, 0, 0], PAPER, 0.022),
    roundedBox("food contact liner", [width - 0.24, 0.014, depth - 0.28], [0, 0.078, 0], PAPER, 0.01),
    notchedFrontWall(width, wallHeight, wall, depth),
    roundedBox("front inner lining", [width - 0.24, 0.32, 0.035], [0, 0.19, depth / 2 - 0.075], PAPER, 0.008),
    roundedBox("rear hinge wall", [width, wallHeight, wall], [0, wallHeight / 2, -depth / 2], PAPER, 0.018),
    roundedBox("left inner wall", [wall, wallHeight, depth], [-width / 2, wallHeight / 2, 0], PAPER, 0.018),
    roundedBox("right inner wall", [wall, wallHeight, depth], [width / 2, wallHeight / 2, 0], PAPER, 0.018),
    roundedBox("left magenta outer return", [0.12, wallHeight - 0.08, depth - 0.2], [-width / 2 - 0.045, wallHeight / 2, 0], MAGENTA, 0.01),
    roundedBox("right magenta outer return", [0.12, wallHeight - 0.08, depth - 0.2], [width / 2 + 0.045, wallHeight / 2, 0], MAGENTA, 0.01),
    crease("front tray crease", [0, wallHeight + 0.012, depth / 2 - 0.07], [width - 0.4, 0.018, 0.022]),
    crease("left tray crease", [-width / 2 + 0.07, wallHeight + 0.012, 0], [depth - 0.42, 0.018, 0.022], [0, Math.PI / 2, 0]),
    crease("right tray crease", [width / 2 - 0.07, wallHeight + 0.012, 0], [depth - 0.42, 0.018, 0.022], [0, Math.PI / 2, 0]),
  );
  return tray;
}

function createLid(width, depth) {
  const lid = new Group();
  lid.name = "hinged opening lid";
  lid.position.set(0, 0.62, -depth / 2 + 0.08);
  lid.rotation.x = -1.08;

  lid.add(
    roundedBox("white inner lid", [width, 0.12, depth], [0, 0, depth / 2], PAPER, 0.02),
    punchedClosureRail(width - 0.14, depth),
    roundedBox("left magenta lid return", [0.24, 0.12, depth - 0.5], [-width / 2 + 0.12, -0.07, depth / 2 - 0.02], MAGENTA, 0.012),
    roundedBox("right magenta lid return", [0.24, 0.12, depth - 0.5], [width / 2 - 0.12, -0.07, depth / 2 - 0.02], MAGENTA, 0.012),
    crease("lower lid score", [0, -0.072, 0.44], [width - 0.45, 0.012, 0.024]),
    crease("upper lid score", [0, -0.072, depth - 0.5], [width - 0.38, 0.012, 0.024]),
    roundedBox("left locking tab", [0.32, 0.1, 0.44], [-1.52, -0.1, 0.66], PAPER_EDGE, 0.016),
    roundedBox("right locking tab", [0.32, 0.1, 0.44], [1.52, -0.1, 0.66], PAPER_EDGE, 0.016),
  );
  lid.children.at(-2).rotation.x = -0.35;
  lid.children.at(-1).rotation.x = -0.35;
  return lid;
}

function createModel() {
  const root = new Group();
  root.name = "Kehong reference pizza takeaway box";
  root.userData = {
    source: "project-generated reference turntable",
    modelType: "paperboard carton",
    states: ["open"],
  };
  const width = 4.9;
  const depth = 4.05;
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
const model = createModel();
const glb = await new Promise((resolve, reject) => {
  exporter.parse(model, resolve, reject, { binary: true, includeCustomExtensions: true });
});
await writeFile(outFile, Buffer.from(glb));
console.log(`Wrote ${outFile}`);
