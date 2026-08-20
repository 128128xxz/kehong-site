import type { HTMLAttributes } from "react";
import { GlassSurface } from "./GlassSurface";

export function GlassPanel(props: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface {...props} variant="panel" />;
}
