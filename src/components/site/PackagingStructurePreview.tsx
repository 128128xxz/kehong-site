"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Center, ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Eye, PackageOpen, Rotate3D } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ACESFilmicToneMapping, Mesh, SRGBColorSpace, type Group } from "three";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { buildInquiryContactHref } from "@/lib/inquiryContext";

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
export default function PackagingStructurePreview({ locale }: { locale: string }) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("front");
  // Start with the deterministic image fallback. WebGL capability is only
  // known after hydration; mounting Canvas optimistically can crash headless
  // browsers before the capability check has a chance to switch to fallback.
  const [canRender3d, setCanRender3d] = useState(false);
  const camera = cameraPresets[cameraPreset];
  const zh = locale === "zh";

  useEffect(() => {
    const canvas = document.createElement("canvas");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only WebGL capability check.
    setCanRender3d(Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  }, []);

  return (
    <main className="texture-paper min-h-screen px-4 py-8 text-(--kh-ink) sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="kh-mono mb-5 flex flex-wrap items-center gap-2 text-xs text-(--kh-muted)">
          <span>{zh ? "首页" : "Home"}</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-(--kh-ink)">{zh ? "3D结构展厅" : "3D Packaging Studio"}</span>
        </nav>
        <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="kh-panel premium-depth p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-(--kh-ink) text-(--kh-brass-soft)">
                <PackageOpen className="size-5" />
              </span>
              <div>
                <p className="kh-eyebrow">{zh ? "3D包装工具" : "3D Packaging Tool"}</p>
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  {zh ? "3D结构展厅" : "3D Packaging Studio"}
                </h1>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-(--kh-muted)">
              {zh
                ? "在线查看包装结构、折线和开启方式，便于在打样前确认结构。"
                : "Explore packaging structures, fold lines and opening methods before sampling."}
            </p>

            <dl className="mt-6 space-y-4 border-t border-(--kh-line) pt-5 text-sm leading-6 text-(--kh-muted)">
              <div>
                <dt className="font-bold text-(--kh-ink)">{zh ? "当前盒型" : "Current carton"}</dt>
                <dd>{zh ? "开盖式披萨/外带纸板盒" : "Open-lid pizza / takeaway paperboard carton"}</dd>
              </div>
              <div>
                <dt className="font-bold text-(--kh-ink)">{zh ? "结构查看" : "Structure review"}</dt>
                <dd>{zh ? "检查面板、折线、闭合方式和内衬适配。" : "Inspect panel layout, folds, closure and liner fit."}</dd>
              </div>
            </dl>
            <Link href={buildInquiryContactHref({ interest: "structure-review" })} className="kh-button kh-button-primary mt-6 w-full">
              {zh ? "申请结构/刀线评审" : "Request a structure / dieline review"}
            </Link>
          </aside>

          <section className="premium-depth overflow-hidden rounded-lg texture-ink">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-(--kh-brass-soft)" />
                <span className="text-sm font-bold">
                  {zh ? "3D 结构/开盒状态" : "3D structure / Open carton"}
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
                    {zh ? ({ front: "正面", side: "侧面", top: "顶部" } as const)[id as CameraPreset] : preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-[560px] min-h-[70dvh]">
              {canRender3d ? <Canvas
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
              </Canvas> : <div className="grid h-full place-items-center p-6 text-center"><Image src="/media/shared/pizza-box-structure-preview-reference.png" alt={zh ? "开盖式纸盒结构参考图" : "Open carton structure reference"} width={1600} height={1200} className="max-h-full max-w-full rounded-md object-contain" /><p className="sr-only">{zh ? "当前浏览器不支持 3D 查看器，已显示结构参考图。" : "Your browser does not support the 3D viewer. A structure reference is shown instead."}</p></div>}
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/12 bg-(--kh-ink)/70 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-black/20">
                <span className="inline-flex items-center gap-2">
                  <Rotate3D className="size-4 text-(--kh-brass-soft)" />
                  {zh ? "旋转与缩放" : "Drag to rotate, wheel to zoom"}
                </span>
                <span>{zh ? "结构沟通参考" : "Structure review reference"}</span>
              </div>
            </div>
          </section>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoCard label={zh ? "包装结构" : "Packaging structure"} value={zh ? "开盖式纸板盒" : "Open-lid paperboard carton"} />
          <InfoCard label={zh ? "交互" : "Interaction"} value={zh ? "旋转与缩放" : "Rotate and zoom"} />
          <InfoCard label={zh ? "下一步" : "Next step"} value={zh ? "提交结构、刀线或定制需求" : "Share a structure, dieline or customization brief"} />
        </section>
      </div>
    </main>
  );
}
