"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Center, ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Eye, Layers3, PackageOpen, Rotate3D } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { ACESFilmicToneMapping, Mesh, SRGBColorSpace, type Group } from "three";

const cameraPresets = {
  front: { label: "Front", position: [7, 4.8, 8] as [number, number, number] },
  side: { label: "Side", position: [-8, 4.2, 3.5] as [number, number, number] },
  top: { label: "Top", position: [0.1, 9.5, 0.1] as [number, number, number] },
} as const;

type CameraPreset = keyof typeof cameraPresets;

function StructureAsset() {
  const gltf = useGLTF("/models/kehong-reference-pizza-box.glb");
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true) as Group;
    cloned.traverse((node) => {
      const mesh = node as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return cloned;
  }, [gltf.scene]);

  return <primitive object={scene} />;
}

function StructureScene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight intensity={0.85} color="#fff3dd" groundColor="#4f4637" />
      <directionalLight position={[4, 7, 5]} intensity={1.7} castShadow />
      <Environment preset="warehouse" />
      <Bounds fit clip observe margin={1.2}>
        <Center>
          <StructureAsset />
        </Center>
      </Bounds>
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="kh-panel p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--kh-brass)">{label}</p>
      <p className="mt-1 text-sm font-bold text-(--kh-ink)">{value}</p>
    </div>
  );
}

/** This page intentionally exposes only Kehong's reference visual and its matching structure model. */
export default function OrinscareModelPreview({ locale }: { locale: string }) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("front");
  const camera = cameraPresets[cameraPreset];

  return (
    <main className="texture-paper min-h-screen px-4 py-8 text-(--kh-ink) sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="kh-panel premium-depth p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-(--kh-ink) text-(--kh-brass-soft)">
                <PackageOpen className="size-5" />
              </span>
              <div>
                <p className="kh-eyebrow">Kehong packaging studio</p>
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  {locale === "zh" ? "包装结构预览" : "Packaging structure preview"}
                </h1>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-(--kh-muted)">
              {locale === "zh"
                ? "这是直接加载的 GLB 模型，用于检查盖板、开孔、折线、锁扣与内外层关系。"
                : "This page loads a GLB model directly for inspecting the lid, perforations, folds, locking tabs and inner/outer layers."}
            </p>

            <div className="kh-panel mt-5 flex items-center gap-3 p-4">
              <Layers3 className="size-5 text-(--kh-brass)" />
              <div>
                <p className="text-sm font-bold text-(--kh-ink)">{locale === "zh" ? "真实 GLB 资产" : "GLB model asset"}</p>
                <p className="text-xs font-semibold text-(--kh-muted)">kehong-reference-pizza-box.glb · 2.54 MB</p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 border-t border-(--kh-line) pt-5 text-sm leading-6 text-(--kh-muted)">
              <div>
                <dt className="font-bold text-(--kh-ink)">{locale === "zh" ? "当前盒型" : "Current carton"}</dt>
                <dd>{locale === "zh" ? "开盖式披萨／外卖纸盒" : "Open-lid pizza / takeaway paperboard carton"}</dd>
              </div>
              <div>
                <dt className="font-bold text-(--kh-ink)">{locale === "zh" ? "结构模式" : "Structure mode"}</dt>
                <dd>{locale === "zh" ? "可旋转查看；为沟通结构而设，不替代生产刀模。" : "Rotatable for structure discussion; it is not a production dieline."}</dd>
              </div>
            </dl>
          </aside>

          <section className="premium-depth overflow-hidden rounded-lg texture-ink">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-(--kh-brass-soft)" />
                <span className="text-sm font-bold">
                  {locale === "zh" ? "3D 结构 / 开盒状态" : "3D structure / Open carton"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(cameraPresets).map(([id, preset]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCameraPreset(id as CameraPreset)}
                    className={`min-h-9 rounded-md border px-3 text-xs font-bold transition active:scale-[0.98] ${
                      id === cameraPreset
                        ? "border-(--kh-brass-soft) bg-(--kh-brass-soft) text-(--kh-ink)"
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
                key={cameraPreset}
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
                  <StructureScene />
                </Suspense>
              </Canvas>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/12 bg-(--kh-ink)/70 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-black/20">
                <span className="inline-flex items-center gap-2">
                  <Rotate3D className="size-4 text-(--kh-brass-soft)" />
                  {locale === "zh" ? "鼠标拖拽旋转，滚轮缩放" : "Drag to rotate, wheel to zoom"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Layers3 className="size-4 text-(--kh-brass-soft)" />
                  GLB / ACES / sRGB / soft shadow
                </span>
              </div>
            </div>
          </section>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoCard label="Asset" value="kehong-reference-pizza-box.glb" />
          <InfoCard label={locale === "zh" ? "交互" : "Interaction"} value={locale === "zh" ? "旋转与缩放" : "Rotate and zoom"} />
          <InfoCard label={locale === "zh" ? "品牌素材" : "Brand assets"} value={locale === "zh" ? "不含第三方标识" : "No third-party marks"} />
        </section>
      </div>
    </main>
  );
}
