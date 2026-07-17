"use client";

import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, RoundedBox, useGLTF, useTexture } from "@react-three/drei";
import {
  Box,
  CakeSlice,
  Check,
  Coffee,
  Donut,
  Eye,
  Layers3,
  MessageCircle,
  PackageOpen,
  Rotate3D,
  Sparkles,
} from "lucide-react";
import { useLocale } from "next-intl";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  Box3,
  DoubleSide,
  Mesh,
  PCFSoftShadowMap,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Material,
  type Object3D,
} from "three";
import { contact } from "@/data/company";
import { showcaseImages } from "@/data/visuals";

type Localized = { en: string; zh: string };
type ProductId = (typeof studioProducts)[number]["id"];
type MaterialId = (typeof materialOptions)[number]["id"];
type FinishId = (typeof finishOptions)[number]["id"];
type Quantity = (typeof quantityOptions)[number];
type FocusMode = (typeof focusModes)[number]["id"];

const studioProducts = [
  {
    id: "pizza-box",
    icon: PackageOpen,
    bg: showcaseImages.orinsFoodBoxReal,
    accent: "#e8c06c",
    title: { en: "Pizza Box", zh: "披萨盒" },
    subtitle: {
      en: "Drag a food-safe pizza box with open lid, liner, vents and optional pizza inside.",
      zh: "可拖拽披萨盒模型，展示开盖、内衬、通风孔和可开关的披萨食物。",
    },
    stats: ["Vent holes", "Food liner", "E-flute wall", "Print face"],
  },
  {
    id: "cake-board",
    icon: CakeSlice,
    bg: showcaseImages.cakeBoardReal,
    accent: "#e8c06c",
    title: { en: "Cake Board", zh: "蛋糕垫片" },
    subtitle: {
      en: "Metallic cake boards with paper core, raised rim and optional cake display.",
      zh: "金银蛋糕垫片模型，展示纸芯、边缘工艺和可开关蛋糕展示。",
    },
    stats: ["Gold / silver face", "Rigid core", "Grease proof", "Custom shape"],
  },
  {
    id: "donut-box",
    icon: Donut,
    bg: showcaseImages.webDonutBoxes,
    accent: "#e8c06c",
    title: { en: "Donut Box", zh: "甜甜圈盒" },
    subtitle: {
      en: "Bakery box with window film, tray walls, insert positions and optional donuts.",
      zh: "甜甜圈烘焙盒模型，展示透明开窗、托盘墙、内托位置和甜甜圈。",
    },
    stats: ["Clear window", "Insert tray", "Oil-proof liner", "Retail display"],
  },
  {
    id: "paper-cup",
    icon: Coffee,
    bg: showcaseImages.webPaperCupStacks,
    accent: "#e8c06c",
    title: { en: "Paper Cup", zh: "纸杯" },
    subtitle: {
      en: "Tapered paper cup with sleeve, rolled rim, inner coating and lifted lid view.",
      zh: "纸杯模型展示杯套、卷边、内层淋膜和可拆杯盖结构。",
    },
    stats: ["Cup fan", "PE / PLA coating", "Rolled rim", "Sleeve paper"],
  },
  {
    id: "honeycomb",
    icon: Layers3,
    bg: showcaseImages.webCorrugatedSheet,
    accent: "#bd8752",
    title: { en: "Honeycomb Paper", zh: "蜂窝纸卷" },
    subtitle: {
      en: "Cushioning roll with layered paper texture, pull-out sheet and wrapped product view.",
      zh: "蜂窝纸卷模型，展示层状纹理、拉出纸张和包裹保护效果。",
    },
    stats: ["Roll supply", "Cushioning", "Protective wrap", "Export packing"],
  },
  {
    id: "display-box",
    icon: Box,
    bg: showcaseImages.webKraftGiftBox,
    accent: "#171713",
    title: { en: "Display Box", zh: "展示盒" },
    subtitle: {
      en: "Brand display box with elevated panels, foil line and sample presentation.",
      zh: "展示盒模型，带立体面板、烫金线条和样品陈列视角。",
    },
    stats: ["Gift structure", "Foil line", "Embossed logo", "Color matching"],
  },
] as const;

const materialOptions = [
  {
    id: "white",
    label: { en: "Food white card", zh: "食品级白卡" },
    shell: "#f8f3e7",
    liner: "#fffdf6",
    edge: "#c89a66",
    paper: "#d7b282",
  },
  {
    id: "kraft",
    label: { en: "Kraft corrugated", zh: "牛皮坑纸" },
    shell: "#c48b52",
    liner: "#e4c59a",
    edge: "#85562e",
    paper: "#b8783c",
  },
  {
    id: "gold",
    label: { en: "Gold / silver board", zh: "金银卡纸" },
    shell: "#d8aa43",
    liner: "#f5e3a6",
    edge: "#84611f",
    paper: "#d0a54d",
  },
  {
    id: "coated",
    label: { en: "Coated cup paper", zh: "淋膜杯纸" },
    shell: "#eaf4f2",
    liner: "#ffffff",
    edge: "#7fb3bd",
    paper: "#bcd7d5",
  },
] as const;

const finishOptions = [
  { id: "matte", label: { en: "Matte", zh: "哑膜" }, roughness: 0.82, metalness: 0.02 },
  { id: "foil", label: { en: "Foil", zh: "烫金" }, roughness: 0.32, metalness: 0.46 },
  { id: "emboss", label: { en: "Emboss", zh: "压纹" }, roughness: 0.68, metalness: 0.08 },
  { id: "window", label: { en: "Window", zh: "开窗" }, roughness: 0.2, metalness: 0.02 },
] as const;

const focusModes = [
  { id: "showcase", label: { en: "Showcase", zh: "展示" }, body: { en: "Brand-facing view", zh: "品牌展示视角" } },
  { id: "structure", label: { en: "Structure", zh: "结构" }, body: { en: "Layer and wall detail", zh: "分层与纸墙细节" } },
  { id: "food", label: { en: "Food", zh: "食物" }, body: { en: "Food fit preview", zh: "食品适配预览" } },
  { id: "macro", label: { en: "Macro", zh: "细节" }, body: { en: "Close-up material feel", zh: "近景材质质感" } },
] as const;

const quantityOptions = ["500", "1000", "3000", "10000+"] as const;

const downloadedModels = {
  pizzaBox: "/models/orinscare_box_v6_realistic.web.glb",
  pizzaSlice: "/models/orinscare_pizza_v6_realistic.web.glb",
  cakePad: "/models/orinscare_cake_pad_v6_realistic.web.glb",
  donutBox: "/models/orinscare_donut_box_v6_realistic.web.glb",
  paperCup: "/models/orinscare_paper_cup_v6_realistic.web.glb",
  displayBox: "/models/orinscare_cosmetic_box_v6_realistic.web.glb",
  displayTray: "/models/orinscare_cosmetic_inner_tray_v6_realistic.web.glb",
  cake: "/models/poly-pizza/birthday-cake.glb",
} as const;

const studioPreviewImage = "/images/web/studio-pizza-preview.webp";

function localized(copy: Localized, locale: string) {
  return locale === "zh" ? copy.zh : copy.en;
}

function cloneAndTuneMaterial(material: Material) {
  const cloned = material.clone();
  const pbrMaterial = cloned as Material & {
    envMapIntensity?: number;
    roughness?: number;
    metalness?: number;
  };
  const materialName = cloned.name.toLowerCase();

  if ("envMapIntensity" in pbrMaterial) {
    pbrMaterial.envMapIntensity = 0.85;
  }

  if ("roughness" in pbrMaterial && materialName.includes("paper")) {
    pbrMaterial.roughness = Math.max(pbrMaterial.roughness ?? 0.72, 0.72);
  }

  if ("metalness" in pbrMaterial) {
    pbrMaterial.metalness = pbrMaterial.metalness ?? 0;
  }

  cloned.needsUpdate = true;
  return cloned;
}

function preservePbrScene(scene: Object3D) {
  const cloned = scene.clone(true);

  cloned.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((material) => cloneAndTuneMaterial(material))
      : cloneAndTuneMaterial(mesh.material);
  });

  return cloned;
}

function DownloadedModel({
  src,
  targetSize,
  position,
  rotation = [0, 0, 0],
  fitBy = "max",
  origin = "center",
}: {
  src: string;
  targetSize: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  fitBy?: "max" | "x" | "y" | "z";
  origin?: "center" | "native-floor";
}) {
  const gltf = useGLTF(src);

  const model = useMemo(() => {
    const cloned = preservePbrScene(gltf.scene);

    const bounds = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    const fitAxis =
      fitBy === "x"
        ? size.x
        : fitBy === "y"
          ? size.y
          : fitBy === "z"
          ? size.z
          : Math.max(size.x, size.y, size.z);
    const scale = targetSize / (fitAxis || 1);
    cloned.scale.setScalar(scale);

    if (origin === "native-floor") {
      cloned.position.set(0, -bounds.min.y * scale, 0);
    } else {
      cloned.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }

    return cloned;
  }, [fitBy, gltf.scene, origin, targetSize]);

  return (
    <group position={position} rotation={rotation}>
      <primitive object={model} />
    </group>
  );
}

function ProductModel({
  activeId,
  palette,
  finish,
  showFood,
  exploded,
  autoRotate,
  focusMode,
  textureUrl,
}: {
  activeId: ProductId;
  palette: (typeof materialOptions)[number];
  finish: (typeof finishOptions)[number];
  showFood: boolean;
  exploded: boolean;
  autoRotate: boolean;
  focusMode: FocusMode;
  textureUrl: string;
}) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current && autoRotate) {
      group.current.rotation.y += delta * 0.22;
    }
  });

  return (
    <group
      ref={group}
      scale={activeId === "pizza-box" ? (focusMode === "macro" ? 0.62 : 0.56) : focusMode === "macro" ? 0.7 : 0.6}
      rotation={[0, activeId === "pizza-box" ? -0.42 : -0.46, 0]}
      position={[activeId === "pizza-box" ? -0.08 : 0, activeId === "pizza-box" ? 0.02 : focusMode === "macro" ? 0.36 : 0.5, activeId === "pizza-box" ? 0.42 : 0]}
    >
      {activeId === "pizza-box" ? (
        <PizzaBox showFood={showFood} />
      ) : null}
      {activeId === "cake-board" ? (
        <CakeBoard palette={palette} finish={finish} showFood={showFood} exploded={exploded} />
      ) : null}
      {activeId === "donut-box" ? (
        <DonutBox palette={palette} finish={finish} exploded={exploded} />
      ) : null}
      {activeId === "paper-cup" ? (
        <PaperCup palette={palette} finish={finish} exploded={exploded} />
      ) : null}
      {activeId === "honeycomb" ? (
        <HoneycombRoll palette={palette} finish={finish} showFood={showFood} exploded={exploded} textureUrl={textureUrl} />
      ) : null}
      {activeId === "display-box" ? (
        <DisplayBox palette={palette} finish={finish} showFood={showFood} exploded={exploded} />
      ) : null}
    </group>
  );
}

function PaperMaterial({
  color,
  finish,
  side = DoubleSide,
  opacity = 1,
}: {
  color: string;
  finish: (typeof finishOptions)[number];
  side?: typeof DoubleSide;
  opacity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={finish.roughness}
      metalness={finish.metalness}
      side={side}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function PhotoPlane({
  url,
  args,
  position,
  rotation,
  opacity = 0.72,
}: {
  url: string;
  args: [number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  opacity?: number;
}) {
  const baseTexture = useTexture(url);
  const texture = useMemo(() => {
    const clonedTexture = baseTexture.clone();
    clonedTexture.colorSpace = SRGBColorSpace;
    clonedTexture.needsUpdate = true;
    return clonedTexture;
  }, [baseTexture]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={args} />
      <meshStandardMaterial
        map={texture}
        roughness={0.48}
        metalness={0.02}
        transparent
        opacity={opacity}
        side={DoubleSide}
      />
    </mesh>
  );
}

function PizzaBoxProduct({ showFood }: { showFood: boolean }) {
  const box = useGLTF(downloadedModels.pizzaBox);
  const pizza = useGLTF(downloadedModels.pizzaSlice);
  const boxScene = useMemo(() => preservePbrScene(box.scene), [box.scene]);
  const pizzaScene = useMemo(() => preservePbrScene(pizza.scene), [pizza.scene]);

  return (
    <group name="pizza_box_and_pizza_shared_origin" position={[0, 0, 0]}>
      <primitive object={boxScene} position={[0, 0, 0]} />
      {showFood ? <primitive object={pizzaScene} position={[0, 0, 0]} /> : null}
    </group>
  );
}

function PizzaBox({ showFood }: { showFood: boolean }) {
  return (
    <group>
      <PizzaBoxProduct showFood={showFood} />

      <Html position={[3.15, 0.54, 2.05]} distanceFactor={2.7} zIndexRange={[8, 0]}>
        <Hotspot side="right">食品接触面</Hotspot>
      </Html>
      <Html position={[-2.62, 2.48, -1.42]} distanceFactor={2.7} zIndexRange={[8, 0]}>
        <Hotspot side="left">印刷外层</Hotspot>
      </Html>
    </group>
  );
}

function DonutBox({
  palette,
  finish,
  exploded,
}: {
  palette: (typeof materialOptions)[number];
  finish: (typeof finishOptions)[number];
  exploded: boolean;
}) {
  const lift = exploded ? 0.24 : 0;

  return (
    <group>
      <RoundedBox args={[4.3, 0.08, 3.3]} radius={0.05} smoothness={5} position={[0, -0.04, 0]}>
        <PaperMaterial color={palette.liner} finish={finish} />
      </RoundedBox>

      <DownloadedModel
        src={downloadedModels.donutBox}
        targetSize={3.72}
        position={[0, 1.34 + lift, 0]}
        rotation={[0, -0.24, 0]}
      />

      <Html position={[1.35, 1.15 + lift, -1.55]} distanceFactor={8}>
        <Hotspot>透明开窗</Hotspot>
      </Html>
      <Html position={[-1.35, 0.78, 1.22]} distanceFactor={8}>
        <Hotspot>内托定位</Hotspot>
      </Html>
    </group>
  );
}

function CakeBoard({
  palette,
  finish,
  showFood,
  exploded,
}: {
  palette: (typeof materialOptions)[number];
  finish: (typeof finishOptions)[number];
  showFood: boolean;
  exploded: boolean;
}) {
  const layerGap = exploded ? 0.18 : 0.04;

  return (
    <group>
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[1.72, 1.72, 0.06, 96]} />
        <PaperMaterial color={palette.edge} finish={finish} />
      </mesh>
      <DownloadedModel
        src={downloadedModels.cakePad}
        targetSize={3.0}
        position={[0, 0.1 + layerGap, 0]}
        rotation={[0, 0.12, 0]}
      />
      {showFood ? (
        <DownloadedModel
          src={downloadedModels.cake}
          targetSize={1.28}
          position={[0, 0.62 + layerGap * 2, 0]}
          rotation={[0, 0.28, 0]}
        />
      ) : null}

      <Html position={[1.2, 0.8, 0.35]} distanceFactor={8}>
        <Hotspot>防油表面</Hotspot>
      </Html>
      <Html position={[-1.1, 0.42, -0.6]} distanceFactor={8}>
        <Hotspot>纸芯层</Hotspot>
      </Html>
    </group>
  );
}

function PaperCup({
  palette,
  finish,
  exploded,
}: {
  palette: (typeof materialOptions)[number];
  finish: (typeof finishOptions)[number];
  exploded: boolean;
}) {
  const lift = exploded ? 0.26 : 0;

  return (
    <group>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.06, 96]} />
        <PaperMaterial color={palette.paper} finish={finish} />
      </mesh>
      <DownloadedModel
        src={downloadedModels.paperCup}
        targetSize={3.0}
        position={[exploded ? -0.18 : 0, 1.48 + lift, exploded ? 0.1 : 0]}
        rotation={[0, -0.2, 0]}
      />
      <Html position={[0.8, 1.15, 0.2]} distanceFactor={8}>
        <Hotspot>卷边结构</Hotspot>
      </Html>
      <Html position={[-0.9, 0.6, 0.35]} distanceFactor={8}>
        <Hotspot>杯套印刷</Hotspot>
      </Html>
    </group>
  );
}

function HoneycombRoll({
  palette,
  finish,
  showFood,
  exploded,
  textureUrl,
}: {
  palette: (typeof materialOptions)[number];
  finish: (typeof finishOptions)[number];
  showFood: boolean;
  exploded: boolean;
  textureUrl: string;
}) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.55, 0.7, 0]}>
        <torusGeometry args={[0.74, 0.18, 24, 96]} />
        <PaperMaterial color={palette.paper} finish={finish} />
      </mesh>
      <PhotoPlane
        url={textureUrl}
        args={[1.1, 1.1]}
        position={[-0.55, 0.72, 0.22]}
        rotation={[0, 0, 0]}
        opacity={0.42}
      />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.55, 0.7, 0]}>
        <torusGeometry args={[0.45, 0.055, 18, 96]} />
        <meshStandardMaterial color="#f8f2e2" roughness={0.72} />
      </mesh>
      {Array.from({ length: 11 }).map((_, index) => (
        <RoundedBox
          key={index}
          args={[0.08, 0.02, 2.5]}
          radius={0.008}
          position={[0.45 + index * 0.15, 0.28 + Math.sin(index) * 0.02, 0]}
          rotation={[0, 0, exploded ? Math.sin(index) * 0.05 : 0]}
        >
          <PaperMaterial color={index % 2 ? palette.liner : palette.shell} finish={finish} />
        </RoundedBox>
      ))}
      {showFood ? (
        <RoundedBox args={[1.0, 0.48, 0.82]} radius={0.04} smoothness={4} position={[1.4, 0.62, 0]}>
          <meshStandardMaterial color="#fbf7ec" roughness={0.64} />
        </RoundedBox>
      ) : null}
      <Html position={[0.9, 0.78, 1.08]} distanceFactor={8}>
        <Hotspot>缓冲拉伸</Hotspot>
      </Html>
    </group>
  );
}

function DisplayBox({
  palette,
  finish,
  showFood,
  exploded,
}: {
  palette: (typeof materialOptions)[number];
  finish: (typeof finishOptions)[number];
  showFood: boolean;
  exploded: boolean;
}) {
  const lift = exploded ? 0.36 : 0;

  return (
    <group>
      <RoundedBox args={[3.35, 0.08, 2.5]} radius={0.06} smoothness={6} position={[0, -0.04, 0]}>
        <PaperMaterial color={palette.shell} finish={finish} />
      </RoundedBox>
      <DownloadedModel
        src={downloadedModels.displayBox}
        targetSize={3.7}
        position={[-0.52, 1.82 + lift, -0.02]}
        rotation={[0, -0.22, 0]}
      />
      {showFood ? (
        <DownloadedModel
          src={downloadedModels.displayTray}
          targetSize={2.95}
          position={[0.74, 0.25, exploded ? 0.34 : 0.02]}
          rotation={[0, -0.22, 0]}
        />
      ) : null}
      <Html position={[1.1, 1.4 + lift, -1.4]} distanceFactor={8}>
        <Hotspot>烫金展示面</Hotspot>
      </Html>
    </group>
  );
}

function Hotspot({
  children,
  side = "right",
}: {
  children: React.ReactNode;
  side?: "left" | "right";
}) {
  return (
    <span className={`studio-callout studio-callout--${side}`}>
      {children}
    </span>
  );
}

function StudioReadyMarker({ onReady, readyKey }: { onReady: (key: string) => void; readyKey: string }) {
  useEffect(() => {
    onReady(readyKey);
  }, [onReady, readyKey]);

  return null;
}

function StudioLoadingFallback({ locale }: { locale: string }) {
  return (
    <Html center>
      <div className="studio-loading-card">
        <Rotate3D className="size-7 text-[#e8c06c]" />
        <span className="text-sm font-black">
          {locale === "zh" ? "正在加载 3D 产品预览" : "Loading 3D product preview"}
        </span>
        <span className="text-xs leading-5 text-[#f7f0df]/66">
          {locale === "zh" ? "加载完成后可查看产品结构与细节。" : "Once loaded, you can review the product structure and details."}
        </span>
      </div>
    </Html>
  );
}

export default function Product3DStudio({
  autoStart = false,
  initialProductId = "pizza-box",
}: {
  autoStart?: boolean;
  initialProductId?: ProductId;
}) {
  const locale = useLocale();
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<ProductId>(initialProductId);
  const [materialId, setMaterialId] = useState<MaterialId>("white");
  const [finishId, setFinishId] = useState<FinishId>("matte");
  const [quantity, setQuantity] = useState<Quantity>("3000");
  const [focusMode, setFocusMode] = useState<FocusMode>("showcase");
  const [showFood, setShowFood] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [studioLoaded, setStudioLoaded] = useState(autoStart);
  const [readyKeyLoaded, setReadyKeyLoaded] = useState<string | null>(null);
  const [isCompact3d, setIsCompact3d] = useState(false);

  const active = useMemo(
    () => studioProducts.find((product) => product.id === activeId) ?? studioProducts[0],
    [activeId],
  );
  const palette = materialOptions.find((item) => item.id === materialId) ?? materialOptions[0];
  const finish = finishOptions.find((item) => item.id === finishId) ?? finishOptions[0];
  const focus = focusModes.find((mode) => mode.id === focusMode) ?? focusModes[0];
  const readyKey = `${active.id}-${focusMode}-${showFood}-${exploded}`;
  const modelReady = studioLoaded && readyKeyLoaded === readyKey;
  const markModelReady = useCallback((key: string) => setReadyKeyLoaded(key), []);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const syncCompactMode = () => {
      const isCompact = compactQuery.matches;

      setIsCompact3d(isCompact);
      if (isCompact) {
        setStudioLoaded(false);
        setAutoRotate(false);
      }
    };

    syncCompactMode();

    if (typeof compactQuery.addEventListener === "function") {
      compactQuery.addEventListener("change", syncCompactMode);
      return () => compactQuery.removeEventListener("change", syncCompactMode);
    }

    compactQuery.addListener(syncCompactMode);
    return () => compactQuery.removeListener(syncCompactMode);
  }, []);

  useEffect(() => {
    if (studioLoaded || isCompact3d || !canvasShellRef.current) return;

    const shouldLoadAfterExplicitRequest = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches;
    if (!shouldLoadAfterExplicitRequest) return;

    const loadTimer = window.setTimeout(() => {
      setStudioLoaded(true);
    }, 320);

    return () => {
      window.clearTimeout(loadTimer);
    };
  }, [studioLoaded, isCompact3d]);

  const quoteMessage = encodeURIComponent(
    `${locale === "zh" ? "你好科宏，我想咨询这个包装产品：" : "Hello Kehong, I would like to discuss this packaging product:"}
- ${localized(active.title, locale)}
- ${localized(palette.label, locale)}
- ${localized(finish.label, locale)}
- ${localized(focus.label, locale)}
- ${locale === "zh" ? "食品展示" : "Food display"}: ${showFood ? (locale === "zh" ? "包含" : "included") : locale === "zh" ? "不包含" : "not included"}
- ${locale === "zh" ? "结构视图" : "Structure view"}: ${exploded ? (locale === "zh" ? "展开" : "expanded") : locale === "zh" ? "标准" : "standard"}
- ${locale === "zh" ? "预计数量" : "Estimated quantity"}: ${quantity}`,
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${quoteMessage}`;

  return (
    <section
      id="studio"
      className="texture-ink relative isolate -mt-10 overflow-hidden bg-[#171713] px-4 pb-20 pt-14 text-white sm:-mt-12 sm:px-6 sm:pt-20 lg:mt-0 lg:min-h-screen lg:px-8 lg:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-16 transition-opacity duration-200"
          style={{
            backgroundImage: `url(${active.bg})`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_26%,rgba(198,154,72,.16),transparent_30%),linear-gradient(90deg,rgba(23,23,19,.96),rgba(37,36,30,.78)_45%,rgba(23,23,19,.95)),linear-gradient(180deg,rgba(23,23,19,.76),rgba(23,23,19,.92))]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-44 bg-[linear-gradient(180deg,rgba(23,23,19,.97),rgba(23,23,19,.82)_58%,rgba(23,23,19,0))]" />
      <div className="pointer-events-none absolute left-4 right-4 top-3 z-20 flex items-center justify-between rounded-full border border-white/12 bg-[#171713]/76 px-3 py-2 text-[11px] font-black text-white shadow-2xl shadow-black/25 backdrop-blur-xl sm:hidden">
        <span className="inline-flex items-center gap-2">
          <Rotate3D className="size-3.5 text-[#e8c06c]" />
          {locale === "zh" ? "3D 产品预览" : "3D Product Preview"}
        </span>
        <span className="text-[#e8c06c]">{locale === "zh" ? "产品结构" : "Product structure"}</span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#e8c06c] backdrop-blur-xl">
              <Sparkles className="size-4" />
              {locale === "zh" ? "产品结构预览" : "Product structure preview"}
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              {locale === "zh"
                ? "像拿到实样一样确认结构、尺寸和食品适配。"
                : "Review structure, size and food-service fit in an interactive product preview."}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/64">
            {locale === "zh"
                ? "通过产品预览确认结构、尺寸与应用方向；桌面端可进一步查看 3D 细节。"
                : "Review structure, scale and application options in the preview, then open the detailed 3D view on desktop."}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="premium-depth hidden rounded-lg border border-white/12 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:sticky lg:top-24 lg:block lg:max-h-[640px] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <PackageOpen className="size-4 text-[#e8c06c]" />
                {locale === "zh" ? "产品模型" : "Product model"}
              </div>
              <span className="rounded-full bg-[#e8c06c]/16 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#e8c06c]">
                {locale === "zh" ? "可查看" : "Available"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {studioProducts.map((product) => {
                const Icon = product.icon;
                const isActive = product.id === active.id;

                return (
	                  <button
	                    key={product.id}
	                    type="button"
	                    data-testid={`studio-product-${product.id}`}
	                    aria-pressed={isActive}
	                    onClick={() => setActiveId(product.id)}
                    className={`group min-h-12 rounded-md border px-2.5 py-2 text-left text-[11px] font-black leading-4 transition ${
                      isActive
                        ? "border-[#e8c06c]/80 bg-[#e8c06c] text-[#171713]"
                        : "border-white/12 bg-white/6 text-[#f7f0df]/76 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0" />
                      {localized(product.title, locale)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-md border border-white/12 bg-[#171713]/58 p-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e8c06c]">
                {localized(active.title, locale)}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#f7f0df]/70">
                {localized(active.subtitle, locale)}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {active.stats.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-md border border-white/10 bg-white/7 px-2 py-1.5 text-[10px] font-bold text-[#f7f0df]/76 shadow-inner shadow-white/5"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7f0df]/62">
                {locale === "zh" ? "样品视角" : "Sample view"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {focusModes.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === focusMode}
                    onClick={() => {
                      setFocusMode(item.id);
                      if (item.id === "structure") setExploded(true);
                      if (item.id === "food") setShowFood(true);
                    }}
                    className={`rounded-md border px-2.5 py-2 text-left transition ${
                      item.id === focusMode
                        ? "border-white/40 bg-white text-[#171713]"
                        : "border-white/12 bg-white/6 text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-[10px] font-black text-[#e8c06c]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1 block text-xs font-black">
                      {localized(item.label, locale)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <ControlToggle
                active={showFood}
                icon={CakeSlice}
                label={locale === "zh" ? "食物展示" : "Food display"}
                onClick={() => setShowFood((value) => !value)}
              />
              <ControlToggle
                active={exploded}
                icon={Layers3}
                label={locale === "zh" ? "展开结构" : "Expand layers"}
                onClick={() => setExploded((value) => !value)}
              />
              <ControlToggle
                active={autoRotate}
                icon={Rotate3D}
                label={locale === "zh" ? "自动旋转" : "Auto rotate"}
                onClick={() => setAutoRotate((value) => !value)}
              />
            </div>

            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7f0df]/62">
                {locale === "zh" ? "纸材 / 工艺 / 数量" : "Material / finish / qty"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {materialOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === materialId}
                    onClick={() => setMaterialId(item.id)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                      item.id === materialId
                        ? "border-[#e8c06c] bg-[#e8c06c] text-[#171713]"
                        : "border-white/12 bg-white/6 text-white hover:bg-white/10"
                    }`}
                  >
                    {localized(item.label, locale)}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {finishOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === finishId}
                    onClick={() => setFinishId(item.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${
                      item.id === finishId
                        ? "border-white/40 bg-white text-[#171713]"
                        : "border-white/12 bg-white/6 text-white hover:bg-white/10"
                    }`}
                  >
                    {item.id === finishId ? <Check className="size-3.5" /> : null}
                    {localized(item.label, locale)}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {quantityOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={item === quantity}
                    onClick={() => setQuantity(item)}
                    className={`rounded-full border px-2 py-2 text-xs font-bold transition ${
                      item === quantity
                        ? "border-[#e8c06c] bg-[#e8c06c] text-[#171713]"
                        : "border-white/12 bg-white/6 text-white hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-3 rounded-md border border-white/8 bg-white/5 px-3 py-2 text-[10px] font-semibold leading-4 text-white/38">
              {locale === "zh"
                ? "示例品牌仅用于结构展示，印刷内容可按客户品牌定制。"
                : "The sample brand is for structure preview only; printing can be customized for your brand."}
            </p>

            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e8c06c] px-5 py-3 text-sm font-black text-[#171713] transition hover:bg-[#f3d182]"
            >
              <MessageCircle className="size-4" />
              {locale === "zh" ? "咨询此产品" : "Discuss this product"}
            </a>
          </aside>

          <div
            data-studio-canvas
            ref={canvasShellRef}
            className="studioCanvasWrap premium-depth relative min-h-[500px] overflow-hidden rounded-lg border shadow-xl sm:min-h-[620px] lg:h-[660px]"
          >
            <Image
              src={studioPreviewImage}
              alt={locale === "zh" ? "披萨盒 3D 结构静态预览" : "Pizza box 3D structure preview"}
              fill
              priority={false}
              sizes="(min-width: 1024px) 68vw, 100vw"
              className={`pointer-events-none absolute inset-0 z-[1] object-cover transition-opacity duration-300 ${
                isCompact3d ? "opacity-100" : modelReady ? "opacity-0" : "opacity-55"
              }`}
            />
            {studioLoaded ? (
              <Canvas
                frameloop={autoRotate || !modelReady ? "always" : "demand"}
                shadows
                dpr={[1, 2]}
                camera={{
                  position: focusMode === "macro" ? [4.1, 2.2, 4.8] : [4.8, 2.7, 5.6],
                  fov: focusMode === "macro" ? 32 : 34,
                  near: 0.1,
                  far: 100,
                }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                onCreated={({ gl }) => {
                  gl.outputColorSpace = SRGBColorSpace;
                  gl.toneMapping = ACESFilmicToneMapping;
                  gl.toneMappingExposure = 1.05;
                  gl.shadowMap.enabled = true;
                  gl.shadowMap.type = PCFSoftShadowMap;
                }}
                className="absolute inset-0"
              >
                <Suspense fallback={<StudioLoadingFallback locale={locale} />}>
                  <ambientLight intensity={0.25} />
                  <directionalLight
                    position={[3.5, 5, 4]}
                    intensity={1.6}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                  />
                  <directionalLight position={[-4, 2, -3]} intensity={0.45} />
                  <Environment preset="studio" />
                  <ProductModel
                    activeId={active.id}
                    palette={palette}
                    finish={finish}
                    showFood={showFood}
                    exploded={exploded}
                    autoRotate={autoRotate}
                    focusMode={focusMode}
                    textureUrl={active.bg}
                  />
                  <StudioReadyMarker
                    onReady={markModelReady}
                    readyKey={readyKey}
                  />
                  <ContactShadows
                    position={[0, -0.04, 0]}
                    opacity={0.32}
                    scale={8}
                    blur={2.4}
                    far={3}
                    resolution={768}
                    color="#2b261e"
                  />
                  <OrbitControls
                    enableDamping
                    enableZoom
                    enablePan={false}
                    minDistance={4.6}
                    maxDistance={7.2}
                    minPolarAngle={Math.PI / 5}
                    maxPolarAngle={Math.PI / 2.25}
                    target={[0, 0.55, 0]}
                  />
                </Suspense>
              </Canvas>
            ) : isCompact3d ? (
              <div
                data-testid="studio-static-preview"
                className="absolute inset-0 z-20 flex items-end px-4 pb-4 text-left sm:px-5 sm:pb-5"
              >
                <div className="premium-depth w-full rounded-lg border border-white/55 bg-white/88 p-4 text-[#171713] shadow-xl shadow-black/18">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a6b1f]">
                        {locale === "zh" ? "手机端预览" : "Mobile preview"}
                      </p>
                      <p className="mt-1 text-base font-black">
                        {locale === "zh" ? "轻量实样图，桌面端可拖拽 3D" : "Light real preview, desktop supports 3D drag"}
                      </p>
                    </div>
                    <Rotate3D className="mt-1 size-6 shrink-0 text-[#9a6b1f]" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4c4b43]/76">
                    {locale === "zh"
                      ? "手机端展示轻量预览图，桌面端支持拖拽旋转 3D 结构。示例品牌仅用于结构展示，印刷内容可按客户品牌定制。"
                      : "Mobile shows a lightweight preview image. Desktop supports drag-rotate 3D structure. Sample branding is for structure display only."}
                  </p>
                  <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
                    {studioProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setActiveId(product.id)}
                        className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black ${
                          product.id === active.id
                            ? "border-[#171713] bg-[#171713] text-white"
                            : "border-[#d9d2be] bg-white text-[#4c4b43]"
                        }`}
                      >
                        {localized(product.title, locale)}
                      </button>
                    ))}
                  </div>
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white"
                  >
                    <MessageCircle className="size-4 text-[#e8c06c]" />
                    {locale === "zh" ? "咨询此产品" : "Discuss this product"}
                  </a>
                </div>
              </div>
            ) : (
              <button
                type="button"
                data-testid="studio-load-3d"
                onClick={() => setStudioLoaded(true)}
                className="absolute inset-0 z-20 grid place-items-center px-5 text-center"
              >
                <span className="premium-depth inline-flex max-w-sm flex-col items-center gap-3 rounded-lg border border-white/18 bg-[#171713]/72 px-5 py-5 text-white shadow-xl shadow-black/20 transition active:scale-[0.99]">
                  <Rotate3D className="size-8 text-[#e8c06c]" />
                  <span className="text-lg font-black">
                    {locale === "zh" ? "查看可交互 3D 预览" : "View interactive 3D preview"}
                  </span>
                  <span className="text-sm leading-6 text-[#f7f0df]/68">
                    {locale === "zh"
                      ? "加载后可拖拽查看产品结构与细节。"
                      : "Drag the model after loading to review product structure and details."}
                  </span>
                </span>
              </button>
            )}

            {studioLoaded && !modelReady && !isCompact3d ? (
              <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center px-5">
                <div className="studio-loading-card">
                  <Rotate3D className="size-7 text-[#e8c06c]" />
                  <span className="text-sm font-black">
                    {locale === "zh" ? "正在加载 3D 产品预览" : "Loading 3D product preview"}
                  </span>
                  <span className="text-xs leading-5 text-[#f7f0df]/66">
                    {locale === "zh" ? "加载完成后可查看产品结构与细节。" : "Once loaded, you can review the product structure and details."}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 rounded-full border border-black/8 bg-white/72 px-3 py-2 text-[#171713] shadow-xl shadow-black/8 backdrop-blur-xl">
                <span className="kh-status-dot inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8c06c]">
                  {studioLoaded ? locale === "zh" ? "3D 产品" : "3D product" : locale === "zh" ? "产品预览" : "Product preview"}
                </span>
                <span className="h-4 w-px bg-black/12" />
                <span className="text-xs font-black text-[#171713]">
                  {localized(active.title, locale)}
                </span>
                <span className="hidden text-xs font-semibold text-[#4c4b43]/72 sm:inline">
                  {localized(focus.label, locale)}
                </span>
              </div>

              <div className="rounded-full border border-black/8 bg-white/68 px-4 py-2 text-xs font-black text-[#4c4b43] shadow-xl shadow-black/8 backdrop-blur-xl">
                  {isCompact3d
                  ? locale === "zh"
                      ? "产品预览"
                      : "Product preview"
                  : locale === "zh"
                    ? "拖拽旋转 · 产品光影"
                    : "Drag rotate · product lighting"}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10 hidden gap-2 rounded-lg border border-black/8 bg-white/68 p-2 shadow-xl shadow-black/8 backdrop-blur-xl md:grid md:grid-cols-4">
              {focusModes.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFocusMode(item.id)}
                  className={`rounded-md border px-3 py-2 text-left transition ${
                    item.id === focusMode
                      ? "border-[#9a6b1f]/40 bg-[#e8c06c]/38"
                      : "border-black/8 bg-white/36 hover:bg-white/62"
                  }`}
                >
                  <span className="text-[10px] font-black text-[#e8c06c]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-sm font-black text-[#171713]">
                    {localized(item.label, locale)}
                  </span>
                  <span className="mt-1 hidden text-xs leading-5 text-[#4c4b43]/70 lg:block">
                    {localized(item.body, locale)}
                  </span>
                </button>
              ))}
            </div>

            <div className="pointer-events-none absolute right-6 top-24 hidden rounded-full border border-black/8 bg-white/70 px-3 py-2 text-xs font-black text-[#9a6b1f] shadow-xl shadow-black/8 backdrop-blur-xl lg:inline-flex">
              <Eye className="mr-2 size-4" />
              {locale === "zh" ? "产品细节预览" : "Product detail preview"}
            </div>
            <div className="pointer-events-none absolute bottom-24 left-5 z-10 hidden max-w-sm rounded-md border border-black/8 bg-white/70 px-3 py-2 text-xs font-bold leading-5 text-[#4c4b43] shadow-xl shadow-black/8 backdrop-blur-xl md:block">
              {locale === "zh"
                ? "示例品牌仅用于结构展示，印刷内容可按客户品牌定制。"
                : "Sample brand is for structure display only; printing can be customized."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlToggle({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof CakeSlice;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-3 text-sm font-black transition ${
        active
          ? "border-[#e8c06c]/70 bg-[#e8c06c]/16 text-white"
          : "border-white/12 bg-white/6 text-[#f7f0df]/72 hover:bg-white/10"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="size-4 text-[#e8c06c]" />
        {label}
      </span>
      <span
        className={`h-5 w-9 rounded-full border p-0.5 transition ${
          active ? "border-[#e8c06c] bg-[#e8c06c]" : "border-white/20 bg-white/8"
        }`}
      >
        <span
          className={`block size-3.5 rounded-full bg-white transition ${
            active ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
