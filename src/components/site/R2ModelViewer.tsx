"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Center, ContactShadows, Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { AlertTriangle, Rotate3D } from "lucide-react";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import { ACESFilmicToneMapping, Material, Mesh, SRGBColorSpace, Texture, type Group, type Object3D } from "three";
import type { R2Model } from "@/data/r2Models";

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

function cloneMaterial(material: Material) {
  const cloned = material.clone();
  const record = cloned as unknown as Record<string, unknown>;
  for (const key of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap", "alphaMap", "bumpMap", "displacementMap", "envMap"]) {
    const texture = record[key];
    if (texture && typeof texture === "object" && (texture as Texture).isTexture) record[key] = (texture as Texture).clone();
  }
  return cloned;
}

function disposeObject3D(root: Object3D) {
  const disposedTextures = new Set<Texture>();
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (!material) return;
      const record = material as unknown as Record<string, unknown>;
      Object.values(record).forEach((value) => {
        if (value && typeof value === "object" && (value as Texture).isTexture) {
          const texture = value as Texture;
          if (!disposedTextures.has(texture)) {
            disposedTextures.add(texture);
            texture.dispose();
          }
        }
      });
      material.dispose();
    });
  });
}

function LoadedR2Model({ model }: { model: R2Model }) {
  const gltf = useGLTF(model.src) as { scene: Group };
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true) as Group;
    cloned.traverse((node) => {
      const mesh = node as Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry = mesh.geometry.clone();
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(cloneMaterial) : cloneMaterial(mesh.material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    return cloned;
  }, [gltf.scene]);

  useEffect(() => {
    if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    return () => {
      // React Strict Mode probes effects with an immediate cleanup/setup pair
      // in development. Deferring disposal avoids destroying the live scene
      // during that probe while still releasing the old model on a switch.
      cleanupTimer.current = setTimeout(() => {
        disposeObject3D(scene);
        useGLTF.clear(model.src);
      }, 0);
    };
  }, [model.src, scene]);

  return <primitive object={scene} />;
}

function LoadingModel() {
  const { progress } = useProgress();
  return <Html center><div className="rounded-lg border border-white/15 bg-black/35 px-5 py-4 text-center text-white backdrop-blur-sm" role="status" aria-live="polite"><span aria-hidden="true" className="mx-auto block size-6 animate-spin rounded-full border-2 border-white/25 border-t-(--kh-brass-soft)" /><p className="mt-2 text-sm font-semibold">Loading selected structure</p><p className="mt-1 text-xs text-white/70">{Math.round(progress)}%</p></div></Html>;
}

class ErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.hasError ? null : this.props.children; }
}

function R2Scene({ model, controlsRef }: { model: R2Model; controlsRef: RefObject<OrbitControlsRef | null> }) {
  useEffect(() => {
    const timer = window.setTimeout(() => controlsRef.current?.saveState(), 1500);
    return () => window.clearTimeout(timer);
  }, [controlsRef, model.src]);

  return <><ambientLight intensity={0.7} /><hemisphereLight intensity={0.9} color="#fff3dd" groundColor="#4d453b" /><directionalLight position={[4, 7, 5]} intensity={1.8} castShadow /><directionalLight position={[-4, 3, -4]} intensity={0.55} color="#bcd5ce" /><Bounds fit clip observe margin={1.35}><Center><LoadedR2Model model={model} /></Center></Bounds><ContactShadows opacity={0.3} scale={12} blur={2.5} far={5} resolution={512} color="#201b16" position={[0, -0.02, 0]} /><OrbitControls ref={controlsRef} enableDamping makeDefault minDistance={1.2} maxDistance={16} /> </>;
}

export default function R2ModelViewer({ model, zh }: { model: R2Model; zh: boolean }) {
  const [canRender3d, setCanRender3d] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const controlsRef = useRef<OrbitControlsRef | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only WebGL capability check.
    setCanRender3d(Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  }, []);
  const retry = () => { setHasError(false); setRetryKey((key) => key + 1); };

  return <div className="relative h-[560px] min-h-0 sm:h-[640px] lg:h-[720px]" data-testid="r2-model-viewer" data-model-id={model.id}>
    {canRender3d && !hasError ? <ErrorBoundary key={`${model.src}-${retryKey}`} onError={() => setHasError(true)}><Canvas shadows camera={{ position: [6.8, 4.8, 7.8], fov: 42, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.outputColorSpace = SRGBColorSpace; gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.08; }}><Suspense fallback={<LoadingModel />}><R2Scene model={model} controlsRef={controlsRef} /></Suspense></Canvas><button type="button" onClick={() => controlsRef.current?.reset()} className="absolute right-4 top-4 rounded-md border border-white/15 bg-black/45 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-(--kh-brass-soft)" aria-label={zh ? "重置视图" : "Reset view"}>{zh ? "重置视图" : "Reset view"}</button></ErrorBoundary> : <div className="grid h-full place-items-center p-5 text-center">{model.poster ? <Image src={model.poster} alt="" width={1200} height={900} className="max-h-full max-w-full rounded-md object-contain opacity-90" /> : <div className="rounded-lg border border-white/10 bg-white/6 px-5 py-4 text-sm text-white/70">{zh ? "当前模型没有加载海报" : "A loading poster is not available for this model."}</div>}</div>}
    {hasError ? <div className="absolute inset-0 grid place-items-center bg-(--kh-ink)/85 p-6 text-center text-white"><div><AlertTriangle className="mx-auto size-7 text-(--kh-brass-soft)" /><p className="mt-3 font-semibold">{zh ? "模型暂时无法加载" : "This structure could not be loaded"}</p><button type="button" onClick={retry} className="kh-button kh-button-light mt-4 min-h-9">{zh ? "重新加载" : "Retry"}</button></div></div> : null}
    <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/12 bg-(--kh-ink)/72 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/20"><span className="inline-flex items-center gap-2"><Rotate3D className="size-4 text-(--kh-brass-soft)" />{zh ? "拖动旋转，滚轮缩放" : "Drag to rotate, wheel to zoom"}</span><span>{zh ? "真实 R2 结构模型" : "R2 structure model"}</span></div>
  </div>;
}
