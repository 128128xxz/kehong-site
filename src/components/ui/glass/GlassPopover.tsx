import type { HTMLAttributes } from "react";
import { GlassSurface } from "./GlassSurface";

export function GlassPopover(props: HTMLAttributes<HTMLDivElement>) {
  return <GlassSurface {...props} variant="popover" tone="neutral" intensity="full" />;
}
