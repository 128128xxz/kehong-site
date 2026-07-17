"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Center, ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Eye, Gauge, Layers3, PackageOpen, Rotate3D } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { ACESFilmicToneMapping, Mesh, SRGBColorSpace, type Group } from "three";
import manifest from "@/data/orinscareModelManifest.json";

const zhLabels: Record<string, string> = {
  box: "披萨盒",
  pizza: "六片披萨",
  "cake-pad": "蛋糕垫片",
  "paper-cup": "纸杯",
  "donut-box": "甜甜圈盒",
  "cosmetic-box": "化妆品彩盒",
  "cosmetic-tray": "化妆品内托",
};

const cameraPresets = {
  front: { label: "Front", position: [7, 4.8, 8] as [number, number, number] },
  side: { label: "Side", position: [-8, 4.2, 3.5] as [number, number, number] },
  top: { label: "Top", position: [0.1, 9.5, 0.1] as [number, number, number] },
} as const;

type PreviewMode = "single" | "all";
type CameraPreset = keyof typeof cameraPresets;
type ModelItem = (typeof manifest)[number];

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return `${Math.round(bytes / 1024)} KB`;
}

function ModelAsset({
  item,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
}: {
  item: ModelItem;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}) {
  const gltf = useGLTF(item.webPath);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true) as Group;
    cloned.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return cloned;
  }, [gltf.scene]);

  return <primitive object={scene} position={position} rotation={rotation} scale={scale} />;
}

function SinglePreview({ item }: { item: ModelItem }) {
  return (
    <Bounds fit clip observe margin={1.2}>
      <Center top>
        <ModelAsset item={item} />
      </Center>
    </Bounds>
  );
}

function AllModelsPreview() {
  const boxItem = manifest.find((item) => item.id === "box")!;
  const pizzaItem = manifest.find((item) => item.id === "pizza")!;
  const cakePadItem = manifest.find((item) => item.id === "cake-pad")!;
  const paperCupItem = manifest.find((item) => item.id === "paper-cup")!;
  const donutBoxItem = manifest.find((item) => item.id === "donut-box")!;
  const cosmeticBoxItem = manifest.find((item) => item.id === "cosmetic-box")!;
  const trayItem = manifest.find((item) => item.id === "cosmetic-tray")!;

  return (
    <Bounds fit clip observe margin={1.28}>
      <group>
        <group position={[0, 0, 0]} scale={0.58}>
          <ModelAsset item={boxItem} />
          <ModelAsset item={pizzaItem} position={[0.02, 0.18, 0.38]} />
        </group>
        <ModelAsset item={cakePadItem} position={[-4.2, 0, -2.4]} scale={0.62} />
        <ModelAsset item={donutBoxItem} position={[4.1, 0, -2.0]} scale={0.58} rotation={[0, -0.28, 0]} />
        <ModelAsset item={paperCupItem} position={[-4.2, 0, 2.35]} scale={0.72} />
        <ModelAsset item={cosmeticBoxItem} position={[3.3, 0, 2.25]} scale={0.72} rotation={[0, -0.35, 0]} />
        <ModelAsset item={trayItem} position={[0.5, 0, 3.15]} scale={0.66} />
      </group>
    </Bounds>
  );
}

function SceneContent({ mode, item }: { mode: PreviewMode; item: ModelItem }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight intensity={0.85} color="#fff3dd" groundColor="#4f4637" />
      <directionalLight position={[4, 7, 5]} intensity={1.7} castShadow />
      <Environment preset="warehouse" />
      {mode === "single" ? <SinglePreview item={item} /> : <AllModelsPreview />}
      <ContactShadows
        opacity={0.34}
        scale={12}
        blur={2.4}
        far={5}
        resolution={512}
        color="#2b261e"
        position={[0, -0.02, 0]}
      />
      <OrbitControls enableDamping makeDefault minDistance={2.4} maxDistance={12} />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d9d2be] bg-white/72 p-3 shadow-lg shadow-black/5">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8f6b33]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#171713]">{value}</p>
    </div>
  );
}

export default function OrinscareModelPreview({ locale }: { locale: string }) {
  const [selectedId, setSelectedId] = useState(manifest[0]?.id ?? "box");
  const [mode, setMode] = useState<PreviewMode>("single");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("front");
  const selected = manifest.find((item) => item.id === selectedId) ?? manifest[0];
  const totalTriangles = manifest.reduce((sum, item) => sum + item.triangles, 0);
  const totalWebSize = manifest.reduce((sum, item) => sum + item.webBytes, 0);
  const camera = cameraPresets[cameraPreset];

  return (
    <main className="texture-paper min-h-screen bg-[#f6f4ec] px-4 py-8 text-[#171713] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-lg border border-[#d9d2be] bg-white/72 p-4 shadow-xl shadow-black/8 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#171713] text-[#e8c06c]">
                <PackageOpen className="size-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9a6b1f]">OrinsCare v6 GLB</p>
                <h1 className="text-2xl font-black sm:text-3xl">
                  {locale === "zh" ? "模型资产检查页" : "Model asset review"}
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#4c4b43]">
              {locale === "zh"
                ? "这里直接加载 public/models 里的新版 GLB，用来检查纸板厚度、折痕、开窗、材质和披萨盒组合关系。"
                : "This page loads the new GLB files directly from public/models for checking paper thickness, folds, windows, materials and pizza-box alignment."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`min-h-11 rounded-full border px-4 text-sm font-black transition active:scale-[0.99] ${
                  mode === "single"
                    ? "border-[#171713] bg-[#171713] text-white"
                    : "border-[#d9d2be] bg-white text-[#171713] hover:border-[#8f6b33]"
                }`}
              >
                {locale === "zh" ? "单个模型" : "Single"}
              </button>
              <button
                type="button"
                onClick={() => setMode("all")}
                className={`min-h-11 rounded-full border px-4 text-sm font-black transition active:scale-[0.99] ${
                  mode === "all"
                    ? "border-[#171713] bg-[#171713] text-white"
                    : "border-[#d9d2be] bg-white text-[#171713] hover:border-[#8f6b33]"
                }`}
              >
                {locale === "zh" ? "组合查看" : "All models"}
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              {manifest.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setMode("single");
                  }}
                  className={`grid min-h-14 grid-cols-[1fr_auto] items-center gap-3 rounded-lg border px-4 text-left transition active:scale-[0.99] ${
                    item.id === selected.id && mode === "single"
                      ? "border-[#e8c06c] bg-[#171713] text-white"
                      : "border-[#d9d2be] bg-white/78 text-[#171713] hover:border-[#8f6b33]"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-black">
                      {locale === "zh" ? zhLabels[item.id] : item.label}
                    </span>
                    <span className="mt-1 block text-xs font-semibold opacity-70">{item.webFilename}</span>
                  </span>
                  <span className="rounded-full bg-[#e8c06c] px-3 py-1 text-xs font-black text-[#171713]">
                    {formatSize(item.webBytes)}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="overflow-hidden rounded-lg border border-[#d9d2be] bg-[#171713] shadow-2xl shadow-black/16">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-[#e8c06c]" />
                <span className="text-sm font-black">
                  {mode === "single"
                    ? locale === "zh"
                      ? zhLabels[selected.id]
                      : selected.label
                    : locale === "zh"
                      ? "七个新版模型组合预览"
                      : "Seven-model grouped preview"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(cameraPresets).map(([id, preset]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCameraPreset(id as CameraPreset)}
                    className={`min-h-9 rounded-full border px-3 text-xs font-black transition active:scale-[0.98] ${
                      id === cameraPreset
                        ? "border-[#e8c06c] bg-[#e8c06c] text-[#171713]"
                        : "border-white/16 bg-white/8 text-white hover:bg-white/14"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-[560px] min-h-[70dvh]">
              <Canvas
                key={`${mode}-${selected.id}-${cameraPreset}`}
                shadows
                camera={{ position: camera.position, fov: cameraPreset === "top" ? 36 : 42, near: 0.1, far: 100 }}
                gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
                onCreated={({ gl }) => {
                  gl.outputColorSpace = SRGBColorSpace;
                  gl.toneMapping = ACESFilmicToneMapping;
                  gl.toneMappingExposure = 1.02;
                }}
              >
                <Suspense fallback={null}>
                  <SceneContent mode={mode} item={selected} />
                </Suspense>
              </Canvas>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/12 bg-[#171713]/68 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-black/20">
                <span className="inline-flex items-center gap-2">
                  <Rotate3D className="size-4 text-[#e8c06c]" />
                  {locale === "zh" ? "鼠标拖拽旋转，滚轮缩放" : "Drag to rotate, wheel to zoom"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Layers3 className="size-4 text-[#e8c06c]" />
                  ACES / sRGB / soft shadow
                </span>
              </div>
            </div>
          </section>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="GLB" value={formatSize(selected.bytes)} />
          <StatCard label="Web GLB" value={formatSize(selected.webBytes)} />
          <StatCard label="Triangles" value={selected.triangles.toLocaleString()} />
          <StatCard label="Vertices" value={selected.vertices.toLocaleString()} />
          <StatCard label="Size XYZ" value={selected.size.join(" / ")} />
        </section>

        <section className="mt-5 rounded-lg border border-[#d9d2be] bg-white/72 p-4 shadow-xl shadow-black/6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#171713] text-[#e8c06c]">
              <Gauge className="size-5" />
            </span>
            <div>
              <p className="text-sm font-black">
                {locale === "zh" ? "总压缩版体积" : "Total web-optimized size"}: {formatSize(totalWebSize)}
              </p>
              <p className="text-sm text-[#4c4b43]">
                {locale === "zh"
                  ? `七个模型合计 ${totalTriangles.toLocaleString()} triangles。压缩版使用兼容型量化优化，未强制依赖 Draco/Meshopt 解码器。`
                  : `${totalTriangles.toLocaleString()} triangles across seven assets. Web files use compatible quantization without requiring Draco/Meshopt decoders.`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

