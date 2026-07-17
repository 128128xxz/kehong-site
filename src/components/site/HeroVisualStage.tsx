"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, MousePointer2, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { heroScenes, visualText } from "@/data/visuals";

type HeroSceneId = (typeof heroScenes)[number]["id"];

export default function HeroVisualStage() {
  const locale = useLocale();
  const [activeId, setActiveId] = useState<HeroSceneId>(heroScenes[0].id);
  const activeIndex = useMemo(
    () => heroScenes.findIndex((scene) => scene.id === activeId),
    [activeId],
  );
  const active = heroScenes[activeIndex] ?? heroScenes[0];

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const index = heroScenes.findIndex((scene) => scene.id === current);
        return heroScenes[(index + 1) % heroScenes.length].id;
      });
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-lg border border-white/18 bg-black/12 shadow-2xl shadow-black/25">
      <div className="absolute inset-0">
        <Image
          key={active.image}
          src={active.image}
          alt={visualText(active.title, locale)}
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 90vw"
          className="object-cover transition duration-300 ease-out animate-kenburns"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,19,.82),rgba(23,23,19,.18)_45%,rgba(23,23,19,.42)),linear-gradient(180deg,rgba(23,23,19,.04),rgba(23,23,19,.88))]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/88 via-black/42 to-transparent" />
      </div>

      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/18 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-black/15 backdrop-blur-xl">
        <MousePointer2 className="size-3.5 text-[#e8c06c]" />
        {locale === "zh" ? "悬停切换展项" : "Hover to switch"}
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-16 text-white">
        <div data-hero-info className="ml-[calc(34%+1.25rem)] max-w-[380px]">
          <div className="flex items-center justify-between gap-4">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#e8c06c]">
              <Sparkles className="size-4" />
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {visualText(active.kicker, locale)}
            </p>
            <ArrowUpRight className="size-5 text-[#e8c06c]" />
          </div>
          <p className="mt-2 text-xl font-black leading-tight text-white">
            {visualText(active.title, locale)}
          </p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#f7f0df]/62">
            {active.metric}
          </p>
        </div>
      </div>

      <div className="absolute left-4 top-16 grid w-[230px] max-w-[34%] gap-2">
        {heroScenes.map((scene, index) => {
          const isActive = scene.id === active.id;

          return (
            <button
              key={scene.id}
              type="button"
              data-hero-option
              aria-pressed={isActive}
              onPointerEnter={() => setActiveId(scene.id)}
              onMouseEnter={() => setActiveId(scene.id)}
              onFocus={() => setActiveId(scene.id)}
              onClick={() => setActiveId(scene.id)}
              className={`group grid h-[58px] grid-cols-[46px_1fr] items-center gap-2 rounded-md border p-1.5 text-left shadow-xl shadow-black/10 backdrop-blur-xl transition duration-200 ${
                isActive
                  ? "border-[#e8c06c]/70 bg-white/16 text-white shadow-xl shadow-black/24"
                  : "border-white/14 bg-black/26 text-[#f7f0df]/74 hover:border-white/34 hover:bg-white/10"
              }`}
            >
              <span className="relative h-[46px] overflow-hidden rounded-md">
                <Image
                  src={scene.image}
                  alt=""
                  fill
                  sizes="46px"
                  className="object-cover transition duration-200 group-hover:scale-105"
                />
              </span>
              <span>
                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-[#e8c06c]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-0.5 block text-xs font-bold leading-4">
                  {visualText(scene.kicker, locale)}
                </span>
                <span className="mt-2 block h-0.5 overflow-hidden rounded-full bg-white/12">
                  <span
                    className={`block h-full w-full origin-left rounded-full bg-[#e8c06c] transition-transform duration-200 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                    }`}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="absolute inset-x-6 bottom-6 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent" />
    </div>
  );
}
