import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  Box3,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

globalThis.FileReader = class {
  constructor() {
    this.onloadend = null;
    this.result = null;
  }

  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const root = process.cwd();
const outDir = path.join(root, "public/models");
const manifestPath = path.join(root, "src/data/orinscareModelManifest.json");
const fontPath = path.join(root, "tools/assets/helvetiker_regular.typeface.json");
const font = new FontLoader().parse(JSON.parse(await readFile(fontPath, "utf8")));

const DEG = Math.PI / 180;
const rand = mulberry32(20260706);

const materials = {
  pinkPrint: material("printed_pink_paper_subtle_grain", "#ce1b72", 0.58),
  pinkDark: material("darker_magenta_folded_edge", "#9d0f4f", 0.62),
  whiteFood: material("warm_white_food_contact_paper", "#f4efe4", 0.72),
  whiteCoated: material("slightly_coated_white_paper", "#faf6ec", 0.48),
  kraftEdge: material("brown_kraft_exposed_paper_core", "#9b6b3d", 0.82),
  crease: material("scored_fold_shadow_line", "#6b4a2a", 0.9),
  blackInk: material("printed_dark_ink", "#181512", 0.55),
  goldFilm: material("warm_gold_laminated_board", "#d8ad47", 0.34, 0),
  silverFilm: material("soft_silver_laminated_board", "#d8d5ce", 0.28, 0),
  pet: material("clear_pet_window_slight_thickness", "#dceff2", 0.08, 0, {
    transparent: true,
    opacity: 0.28,
    side: DoubleSide,
  }),
  cheese: material("oily_melted_cheese_pbr", "#f2c54c", 0.34),
  crust: material("dry_baked_crust_rough", "#b97935", 0.78),
  char: material("small_toasted_char_spots", "#4c2817", 0.86),
  sauce: material("tomato_red_pepper_wet", "#c32922", 0.32),
  pineapple: material("wet_pineapple_chunks", "#f0c94c", 0.31),
  chicken: material("pale_chicken_seafood_chunks", "#ead0a8", 0.48),
  paperCup: material("coated_cup_paper_satin", "#f2f4ed", 0.48),
  pulpTray: material("white_molded_pulp_or_plastic_tray", "#e8e7df", 0.58),
};

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function material(name, color, roughness, metalness = 0, options = {}) {
  const mat = new MeshStandardMaterial({
    name,
    color,
    roughness,
    metalness,
    ...options,
  });
  mat.color.convertSRGBToLinear();
  return mat;
}

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new Shape();

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

function plateGeometry(width, height, thickness, radius = 0.03, bevel = 0.015) {
  const geometry = new ExtrudeGeometry(roundedRectShape(width, height, radius), {
    depth: thickness,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geometry.translate(0, 0, -thickness / 2);
  addPaperVertexColor(geometry);
  geometry.computeVertexNormals();
  return geometry;
}

function notchWallGeometry(width, height, thickness, notchRadius = 0.34) {
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const shape = new Shape();

  shape.moveTo(left, bottom);
  shape.lineTo(right, bottom);
  shape.lineTo(right, top);
  shape.lineTo(notchRadius, top);
  for (let i = 0; i <= 22; i += 1) {
    const theta = (i / 22) * Math.PI;
    shape.lineTo(Math.cos(theta) * notchRadius, top - Math.sin(theta) * notchRadius * 0.72);
  }
  shape.lineTo(left, top);
  shape.lineTo(left, bottom);

  const geometry = new ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -thickness / 2);
  addPaperVertexColor(geometry, 0.035);
  geometry.computeVertexNormals();
  return geometry;
}

function addPaperVertexColor(geometry, variance = 0.025) {
  const position = geometry.getAttribute("position");
  const colors = [];
  for (let i = 0; i < position.count; i += 1) {
    const n = (Math.sin(position.getX(i) * 13.1 + position.getY(i) * 17.7 + position.getZ(i) * 5.3) + 1) / 2;
    const v = 1 + (n - 0.5) * variance;
    colors.push(v, v, v);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
}

function mesh(name, geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const item = new Mesh(geometry, mat);
  item.name = name;
  item.position.set(...position);
  item.rotation.set(...rotation);
  return item;
}

function horizontalPlate(name, width, depth, thickness, mat, position, radius = 0.04) {
  return mesh(name, plateGeometry(width, depth, thickness, radius), mat, position, [-Math.PI / 2, 0, 0]);
}

function addText(target, label, size, depth, mat, position, rotation = [0, 0, 0]) {
  const geometry = new TextGeometry(label, {
    font,
    size,
    depth,
    curveSegments: 6,
    bevelEnabled: false,
  });
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box) {
    geometry.translate(-(box.max.x - box.min.x) / 2, -(box.max.y - box.min.y) / 2, 0);
  }
  const labelMesh = mesh(`printed_logo_${label.replace(/\s+/g, "_")}`, geometry, mat, position, rotation);
  target.add(labelMesh);
  return labelMesh;
}

function creaseLine(name, length, mat, position, rotation = [0, 0, 0], thickness = 0.014) {
  return mesh(name, new CylinderGeometry(thickness, thickness, length, 10), mat, position, rotation);
}

function ringOnPanel(name, radius, tube, mat, position, rotation) {
  return mesh(name, new TorusGeometry(radius, tube, 10, 36), mat, position, rotation);
}

function addSmallNoiseDiscs(group, count, bounds, mat, radius = 0.012) {
  for (let i = 0; i < count; i += 1) {
    const x = MathUtils.lerp(bounds[0], bounds[1], rand());
    const z = MathUtils.lerp(bounds[2], bounds[3], rand());
    const y = bounds[4] + rand() * bounds[5];
    const disc = mesh(
      `paper_fiber_speck_${i}`,
      new CylinderGeometry(radius * (0.5 + rand()), radius * (0.5 + rand()), 0.003, 7),
      mat,
      [x, y, z],
      [Math.PI / 2, rand() * Math.PI, 0],
    );
    group.add(disc);
  }
}

function createPizzaBox() {
  const group = new Group();
  group.name = "orinscare_box_v6_realistic";
  const width = 6.2;
  const depth = 4.6;
  const wall = 0.08;
  const wallH = 0.58;

  group.add(horizontalPlate("single_piece_box_floor_white_food_contact", width, depth, 0.08, materials.whiteFood, [0, 0, 0], 0.07));
  group.add(horizontalPlate("bottom_visible_exposed_kraft_core", width + 0.05, depth + 0.05, 0.035, materials.kraftEdge, [0, -0.058, 0], 0.07));

  group.add(mesh("front_wall_pink_print_with_real_semicircle_notch", notchWallGeometry(width, wallH, wall, 0.32), materials.pinkPrint, [0, wallH / 2, depth / 2 + wall / 2]));
  group.add(mesh("front_inside_warm_white_food_contact_liner", notchWallGeometry(width - 0.14, wallH - 0.1, 0.01, 0.28), materials.whiteFood, [0, wallH / 2, depth / 2 - 0.014]));
  group.add(mesh("back_hinge_wall_pink_print", plateGeometry(width, wallH, wall, 0.025), materials.pinkPrint, [0, wallH / 2, -depth / 2 - wall / 2]));
  group.add(mesh("left_side_wall_pink_print", plateGeometry(depth, wallH, wall, 0.025), materials.pinkPrint, [-width / 2 - wall / 2, wallH / 2, 0], [0, Math.PI / 2, 0]));
  group.add(mesh("right_side_wall_pink_print", plateGeometry(depth, wallH, wall, 0.025), materials.pinkPrint, [width / 2 + wall / 2, wallH / 2, 0], [0, Math.PI / 2, 0]));

  for (const x of [-width / 2 - wall - 0.004, width / 2 + wall + 0.004]) {
    group.add(ringOnPanel(`round_locking_hole_kraft_rim_${x > 0 ? "right" : "left"}`, 0.105, 0.015, materials.kraftEdge, [x, 0.32, 1.6], [0, Math.PI / 2, 0]));
    group.add(mesh(`round_locking_hole_dark_recess_${x > 0 ? "right" : "left"}`, new CircleGeometry(0.075, 30), materials.blackInk, [x + (x > 0 ? 0.002 : -0.002), 0.32, 1.6], [0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]));
  }
  group.add(ringOnPanel("front_locking_hole_kraft_rim", 0.1, 0.014, materials.kraftEdge, [0, 0.3, depth / 2 + wall + 0.006], [Math.PI / 2, 0, 0]));

  const lid = new Group();
  lid.name = "one_piece_open_lid_68_degree_with_inward_side_flaps";
  lid.position.set(0, wallH, -depth / 2 - wall * 0.5);
  lid.rotation.x = 66 * DEG;
  group.add(lid);

  lid.add(horizontalPlate("open_lid_outer_pink_printed_board", width, 4.15, 0.075, materials.pinkPrint, [0, 0.02, -2.075], 0.05));
  lid.add(horizontalPlate("open_lid_inside_warm_white_food_contact_face", width - 0.22, 3.92, 0.012, materials.whiteFood, [0, -0.035, -2.0], 0.035));
  lid.add(mesh("far_lid_exposed_kraft_cut_edge", plateGeometry(width, 0.06, 0.035, 0.02), materials.kraftEdge, [0, 0.07, -4.18], [-Math.PI / 2, 0, 0]));
  lid.add(mesh("lid_front_fold_score_shadow", plateGeometry(width - 0.2, 0.025, 0.012, 0.01), materials.crease, [0, 0.08, -0.16], [-Math.PI / 2, 0, 0]));

  const flapDepth = 3.65;
  const flapWidth = 0.5;
  for (const side of [-1, 1]) {
    const flap = new Group();
    flap.name = `${side > 0 ? "right" : "left"}_lid_side_flap_folded_inward_on_inner_face`;
    flap.position.set(side * (width / 2 - flapWidth / 2 - 0.08), 0.068, -2.12);
    flap.rotation.z = side * -4 * DEG;
    lid.add(flap);
    flap.add(horizontalPlate("pink_printed_folded_side_flap_outer_edge", flapWidth, flapDepth, 0.046, materials.pinkDark, [0, 0, 0], 0.025));
    flap.add(horizontalPlate("white_food_contact_inside_of_inward_flap", flapWidth - 0.12, flapDepth - 0.2, 0.012, materials.whiteFood, [side * -0.035, 0.038, 0.02], 0.018));
    flap.add(ringOnPanel(`side_flap_locking_hole_${side > 0 ? "right" : "left"}`, 0.075, 0.012, materials.kraftEdge, [0, 0.076, -0.66], [Math.PI / 2, 0, 0]));
  }

  addText(lid, "OrinsCare", 0.28, 0.006, materials.whiteCoated, [0, 0.095, -2.8], [-Math.PI / 2, 0, 0]);
  addText(group, "OrinsCare", 0.16, 0.004, materials.whiteCoated, [0, 0.36, depth / 2 + wall + 0.01], [0, 0, 0]);

  for (const z of [-2.05, 2.05]) {
    group.add(creaseLine(`floor_fold_score_line_z_${z}`, width - 0.45, materials.crease, [0, 0.045, z], [0, 0, Math.PI / 2], 0.006));
  }
  for (const x of [-2.85, 2.85]) {
    group.add(creaseLine(`floor_fold_score_line_x_${x}`, depth - 0.55, materials.crease, [x, 0.047, 0], [Math.PI / 2, 0, 0], 0.006));
  }
  addSmallNoiseDiscs(group, 48, [-2.8, 2.8, -1.8, 1.8, 0.052, 0.01], materials.crease, 0.008);

  return centeredScene(group);
}

function createPizza() {
  const group = new Group();
  group.name = "orinscare_pizza_v6_realistic_six_slices";
  const radius = 2.04;
  const gap = 0.018;
  for (let i = 0; i < 6; i += 1) {
    const start = i * Math.PI / 3 + gap;
    const end = (i + 1) * Math.PI / 3 - gap;
    const slice = new Group();
    slice.name = `individual_slice_${i + 1}`;
    slice.add(mesh("baked_dough_wedge_body", wedgeGeometry(radius, start, end, 0.08), materials.crust, [0, 0.05, 0], [-Math.PI / 2, 0, 0]));
    slice.add(mesh("uneven_melted_cheese_surface", wedgeGeometry(radius * 0.9, start + 0.04, end - 0.04, 0.026), materials.cheese, [0, 0.105 + rand() * 0.012, 0], [-Math.PI / 2, 0, 0]));
    group.add(slice);
  }

  for (let i = 0; i < 72; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = 1.82 + rand() * 0.18;
    const crust = mesh(
      `lumpy_raised_crust_piece_${i}`,
      new SphereGeometry(0.09 + rand() * 0.04, 10, 8),
      materials.crust,
      [Math.cos(a) * r, 0.18 + rand() * 0.035, Math.sin(a) * r],
      [0, 0, 0],
    );
    crust.scale.set(1.4, 0.42 + rand() * 0.14, 0.72);
    crust.rotation.y = -a;
    group.add(crust);
  }

  const toppingTypes = [
    ["pineapple_chunk", materials.pineapple, () => new BoxLikeChunkGeometry(0.18, 0.08, 0.13)],
    ["red_pepper_piece", materials.sauce, () => new BoxLikeChunkGeometry(0.2, 0.045, 0.075)],
    ["pale_meat_chunk", materials.chicken, () => new SphereGeometry(0.09, 8, 6)],
    ["cheese_blister", materials.cheese, () => new SphereGeometry(0.06, 10, 6)],
    ["char_spot", materials.char, () => new CylinderGeometry(0.035, 0.045, 0.008, 8)],
  ];

  for (let i = 0; i < 210; i += 1) {
    const [name, mat, factory] = toppingTypes[Math.floor(rand() * toppingTypes.length)];
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 1.55;
    const item = mesh(`${name}_${i}`, factory(), mat, [Math.cos(a) * r, 0.19 + rand() * 0.08, Math.sin(a) * r], [rand() * 0.4, rand() * Math.PI, rand() * 0.2]);
    if (name === "red_pepper_piece") item.scale.set(1, 0.6, 1.8);
    if (name === "char_spot") item.rotation.set(Math.PI / 2, 0, rand() * Math.PI);
    group.add(item);
  }

  group.add(mesh("subtle_oil_sheen_thin_uneven_surface", new CylinderGeometry(1.72, 1.72, 0.006, 96), material("transparent_oil_sheen", "#fff0b0", 0.18, 0, { transparent: true, opacity: 0.16 }), [0, 0.205, 0]));
  return centeredScene(group);
}

function wedgeGeometry(radius, start, end, thickness) {
  const shape = new Shape();
  shape.moveTo(0, 0);
  const segments = 24;
  for (let i = 0; i <= segments; i += 1) {
    const a = MathUtils.lerp(start, end, i / segments);
    shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  shape.lineTo(0, 0);
  const geo = new ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSize: 0.015,
    bevelThickness: 0.012,
    bevelSegments: 1,
    curveSegments: 8,
  });
  geo.translate(0, 0, -thickness / 2);
  geo.computeVertexNormals();
  return geo;
}

function BoxLikeChunkGeometry(w, h, d) {
  const geo = plateGeometry(w, d, h, 0.025, 0.01);
  geo.rotateX(Math.PI / 2);
  return geo;
}

function createCakePad() {
  const group = new Group();
  group.name = "orinscare_cake_pad_v6_realistic_layered_board";
  group.add(mesh("lower_kraft_paperboard_core_visible_layer", new CylinderGeometry(1.82, 1.82, 0.16, 128), materials.kraftEdge, [0, 0, 0]));
  group.add(mesh("top_gold_laminated_film_subtle_reflection", new CylinderGeometry(1.8, 1.8, 0.035, 128), materials.goldFilm, [0, 0.1, 0]));
  group.add(mesh("bottom_silver_laminated_film", new CylinderGeometry(1.8, 1.8, 0.025, 128), materials.silverFilm, [0, -0.1, 0]));
  group.add(mesh("rounded_outer_crimped_edge", new TorusGeometry(1.82, 0.055, 12, 160), materials.kraftEdge, [0, 0.025, 0], [Math.PI / 2, 0, 0]));
  for (const r of [0.55, 0.95, 1.32, 1.62]) {
    group.add(mesh(`concentric_embossed_press_line_${r}`, new TorusGeometry(r, 0.01, 8, 128), materials.crease, [0, 0.124, 0], [Math.PI / 2, 0, 0]));
  }
  for (let i = 0; i < 72; i += 1) {
    const a = (i / 72) * Math.PI * 2;
    const tab = mesh("tiny_clean_wave_edge_press_mark", new CylinderGeometry(0.012, 0.012, 0.11, 6), materials.crease, [Math.cos(a) * 1.82, 0.06, Math.sin(a) * 1.82], [Math.PI / 2, 0, -a]);
    group.add(tab);
  }
  return centeredScene(group);
}

function createPaperCup() {
  const group = new Group();
  group.name = "orinscare_paper_cup_v6_realistic_hollow_tapered";
  const profile = [
    new Vector2(0.58, 0),
    new Vector2(0.66, 0.1),
    new Vector2(0.94, 2.7),
    new Vector2(1.0, 3.0),
    new Vector2(0.96, 3.08),
    new Vector2(0.88, 3.0),
    new Vector2(0.61, 0.14),
    new Vector2(0.54, 0.05),
  ];
  const body = mesh("single_wall_hollow_tapered_cup_body_with_visible_thickness", new LatheGeometry(profile, 128), materials.paperCup, [0, 0, 0]);
  group.add(body);
  group.add(mesh("rolled_rim_thick_round_paper_lip", new TorusGeometry(0.96, 0.055, 16, 128), materials.whiteCoated, [0, 3.02, 0], [Math.PI / 2, 0, 0]));
  group.add(mesh("bottom_foot_ring", new TorusGeometry(0.58, 0.035, 12, 96), materials.kraftEdge, [0, 0.09, 0], [Math.PI / 2, 0, 0]));
  group.add(mesh("vertical_paper_seam_slight_overlap", plateGeometry(0.035, 2.55, 0.012, 0.01), materials.crease, [0, 1.45, 0.895], [0, 0, 0]));
  addText(group, "OrinsCare", 0.17, 0.005, materials.pinkPrint, [0, 1.72, 0.935], [0, 0, 0]);
  for (let i = 0; i < 34; i += 1) {
    const a = rand() * Math.PI * 2;
    const y = 0.45 + rand() * 2.2;
    const r = 0.64 + (y / 3.05) * 0.33;
    group.add(mesh(`subtle_vertical_cup_paper_fiber_${i}`, new CylinderGeometry(0.003, 0.003, 0.25 + rand() * 0.28, 5), materials.crease, [Math.cos(a) * r, y, Math.sin(a) * r], [Math.PI / 2, 0, -a]));
  }
  return centeredScene(group);
}

function createDonutBox() {
  const group = new Group();
  group.name = "orinscare_donut_box_v6_realistic_window_bakery_box";
  const width = 4.9;
  const depth = 3.35;
  const wallH = 0.62;
  group.add(horizontalPlate("donut_box_bottom_white_food_contact", width, depth, 0.08, materials.whiteFood, [0, 0, 0], 0.06));
  group.add(mesh("front_wall_with_insert_slots_pink", notchWallGeometry(width, wallH, 0.07, 0.28), materials.pinkPrint, [0, wallH / 2, depth / 2 + 0.04]));
  group.add(mesh("back_hinge_wall_pink", plateGeometry(width, wallH, 0.07, 0.02), materials.pinkPrint, [0, wallH / 2, -depth / 2 - 0.04]));
  group.add(mesh("left_side_wall_pink", plateGeometry(depth, wallH, 0.07, 0.02), materials.pinkPrint, [-width / 2 - 0.04, wallH / 2, 0], [0, Math.PI / 2, 0]));
  group.add(mesh("right_side_wall_pink", plateGeometry(depth, wallH, 0.07, 0.02), materials.pinkPrint, [width / 2 + 0.04, wallH / 2, 0], [0, Math.PI / 2, 0]));
  const lid = new Group();
  lid.name = "open_lid_with_real_clear_pet_window";
  lid.position.set(0, wallH, -depth / 2 - 0.05);
  lid.rotation.x = 58 * DEG;
  group.add(lid);
  lid.add(horizontalPlate("donut_lid_pink_printed_frame", width, 3.0, 0.065, materials.pinkPrint, [0, 0.02, -1.5], 0.05));
  lid.add(horizontalPlate("clear_pet_window_panel_slight_thickness", 2.65, 1.55, 0.018, materials.pet, [0, 0.066, -1.5], 0.08));
  lid.add(horizontalPlate("inside_white_lid_food_surface", width - 0.18, 2.85, 0.01, materials.whiteFood, [0, -0.032, -1.5], 0.04));
  for (const x of [-1.45, 0, 1.45]) {
    group.add(mesh(`molded_donut_recess_ring_${x}`, new TorusGeometry(0.54, 0.045, 12, 64), materials.whiteCoated, [x, 0.12, 0.2], [Math.PI / 2, 0, 0]));
    group.add(mesh(`donut_cup_depressed_shadow_${x}`, new CylinderGeometry(0.46, 0.48, 0.018, 64), materials.crease, [x, 0.095, 0.2]));
  }
  addText(lid, "OrinsCare", 0.18, 0.005, materials.whiteCoated, [0, 0.084, -2.38], [-Math.PI / 2, 0, 0]);
  return centeredScene(group);
}

function createCosmeticBox() {
  const group = new Group();
  group.name = "orinscare_cosmetic_box_v6_realistic_folding_carton";
  const w = 1.55;
  const d = 1.05;
  const h = 3.4;
  group.add(mesh("front_panel_pink_window_frame", plateGeometry(w, h, 0.06, 0.025), materials.pinkPrint, [0, h / 2, d / 2]));
  group.add(mesh("back_panel_pink_with_fold_scores", plateGeometry(w, h, 0.06, 0.025), materials.pinkDark, [0, h / 2, -d / 2]));
  group.add(mesh("left_side_panel_kraft_edge_visible", plateGeometry(d, h, 0.06, 0.025), materials.pinkPrint, [-w / 2, h / 2, 0], [0, Math.PI / 2, 0]));
  group.add(mesh("right_side_panel_pink_with_vertical_seam", plateGeometry(d, h, 0.06, 0.025), materials.pinkPrint, [w / 2, h / 2, 0], [0, Math.PI / 2, 0]));
  group.add(mesh("transparent_pet_display_window", plateGeometry(0.85, 1.55, 0.018, 0.05), materials.pet, [0, 1.95, d / 2 + 0.035]));
  group.add(mesh("top_flap_open_with_insert_tongue", plateGeometry(w, 0.85, 0.055, 0.025), materials.pinkPrint, [0, h + 0.2, -0.18], [62 * DEG, 0, 0]));
  group.add(mesh("bottom_tucked_flap", plateGeometry(w, 0.42, 0.055, 0.02), materials.kraftEdge, [0, -0.06, 0.2], [-12 * DEG, 0, 0]));
  addText(group, "OrinsCare", 0.16, 0.004, materials.whiteCoated, [0, 2.95, d / 2 + 0.04], [0, 0, 0]);
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) {
    group.add(creaseLine(`vertical_carton_score_${x}`, h - 0.2, materials.crease, [x, h / 2, d / 2 + 0.045], [0, 0, 0], 0.004));
  }
  return centeredScene(group);
}

function createInnerTray() {
  const group = new Group();
  group.name = "orinscare_cosmetic_inner_tray_v6_realistic_vacuum_formed";
  group.add(horizontalPlate("vacuum_formed_tray_outer_flange", 4.4, 2.45, 0.12, materials.pulpTray, [0, 0, 0], 0.16));
  group.add(horizontalPlate("lower_recessed_tray_floor", 3.95, 2.02, 0.045, materials.pulpTray, [0, 0.07, 0], 0.12));
  const pockets = [
    ["round_bottle_pocket", -1.35, 0.22, 0.48, "circle"],
    ["tube_slot_long_rounded", 0.05, 0.28, 0.42, "slot"],
    ["cream_jar_round_pocket", 1.28, 0.28, 0.38, "circle"],
    ["small_cap_pocket", 1.75, -0.62, 0.22, "circle"],
  ];
  for (const [name, x, z, r, type] of pockets) {
    if (type === "slot") {
      group.add(horizontalPlate(`${name}_smooth_depressed_floor`, 1.65, 0.5, 0.035, materials.whiteCoated, [x, 0.125, z], 0.24));
      group.add(mesh(`${name}_rounded_filleted_rim`, new TorusGeometry(0.48, 0.035, 12, 96), materials.pulpTray, [x - 0.58, 0.16, z], [Math.PI / 2, 0, 0]));
      group.add(mesh(`${name}_rounded_filleted_rim_other`, new TorusGeometry(0.48, 0.035, 12, 96), materials.pulpTray, [x + 0.58, 0.16, z], [Math.PI / 2, 0, 0]));
    } else {
      group.add(mesh(`${name}_smooth_depressed_floor`, new CylinderGeometry(r, r * 0.96, 0.035, 64), materials.whiteCoated, [x, 0.12, z]));
      group.add(mesh(`${name}_rounded_filleted_rim`, new TorusGeometry(r, 0.035, 14, 80), materials.pulpTray, [x, 0.16, z], [Math.PI / 2, 0, 0]));
    }
  }
  for (const x of [-1.92, -0.72, 0.72, 1.92]) {
    group.add(horizontalPlate(`support_rib_under_tray_${x}`, 0.08, 2.0, 0.04, materials.crease, [x, 0.155, 0], 0.03));
  }
  group.add(horizontalPlate("finger_pull_notch_front", 0.58, 0.16, 0.035, materials.whiteCoated, [0, 0.18, 1.11], 0.08));
  return centeredScene(group);
}

function centeredScene(model) {
  model.traverse((object) => {
    if (object instanceof Mesh) {
      object.castShadow = false;
      object.receiveShadow = false;
      if (object.material?.isMeshStandardMaterial) {
        object.material.vertexColors = !!object.geometry.getAttribute("color");
      }
    }
  });
  const scene = new Scene();
  scene.name = model.name;
  scene.add(model);
  return scene;
}

function countStats(scene) {
  let vertices = 0;
  let triangles = 0;
  let meshes = 0;
  scene.updateMatrixWorld(true);
  const box = new Box3().setFromObject(scene);
  scene.traverse((object) => {
    if (object instanceof Mesh) {
      meshes += 1;
      const position = object.geometry.getAttribute("position");
      const index = object.geometry.getIndex();
      vertices += position?.count ?? 0;
      triangles += index ? index.count / 3 : (position?.count ?? 0) / 3;
    }
  });
  const size = new Vector3();
  box.getSize(size);
  return {
    meshes,
    vertices: Math.round(vertices),
    triangles: Math.round(triangles),
    size: size.toArray().map((value) => Number(value.toFixed(3))),
  };
}

async function exportGLB(scene, filename) {
  const exporter = new GLTFExporter();
  const arrayBuffer = await exporter.parseAsync(scene, {
    binary: true,
    trs: false,
    onlyVisible: true,
    includeCustomExtensions: false,
  });
  const outputPath = path.join(outDir, filename);
  await writeFile(outputPath, Buffer.from(arrayBuffer));
  const fileStat = await stat(outputPath);
  return {
    path: `/models/${filename}`,
    bytes: fileStat.size,
    ...countStats(scene),
  };
}

const definitions = [
  ["box", "Pizza box", "orinscare_box_v6_realistic.glb", createPizzaBox],
  ["pizza", "Six-slice pizza", "orinscare_pizza_v6_realistic.glb", createPizza],
  ["cake-pad", "Cake pad", "orinscare_cake_pad_v6_realistic.glb", createCakePad],
  ["paper-cup", "Paper cup", "orinscare_paper_cup_v6_realistic.glb", createPaperCup],
  ["donut-box", "Donut box", "orinscare_donut_box_v6_realistic.glb", createDonutBox],
  ["cosmetic-box", "Cosmetic box", "orinscare_cosmetic_box_v6_realistic.glb", createCosmeticBox],
  ["cosmetic-tray", "Cosmetic inner tray", "orinscare_cosmetic_inner_tray_v6_realistic.glb", createInnerTray],
];

await mkdir(outDir, { recursive: true });

const manifest = [];
for (const [id, label, filename, factory] of definitions) {
  const scene = factory();
  const stats = await exportGLB(scene, filename);
  manifest.push({
    id,
    label,
    filename,
    path: stats.path,
    webFilename: filename.replace(/\.glb$/, ".web.glb"),
    webPath: stats.path.replace(/\.glb$/, ".web.glb"),
    ...stats,
  });
  console.log(`${filename}: ${stats.triangles} tris, ${stats.vertices} verts, ${Math.round(stats.bytes / 1024)} KB`);
}

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(`${manifestPath}.tmp`, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifest written to ${path.relative(root, manifestPath)}`);
