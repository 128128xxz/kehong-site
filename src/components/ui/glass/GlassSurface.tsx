import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { GlassIntensity, GlassTone, GlassVariant } from "./glassTokens";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassVariant;
  tone?: GlassTone;
  intensity?: GlassIntensity;
  interactive?: boolean;
};

/** Shared material wrapper. Decorative layers are CSS-only; children remain real DOM. */
export function GlassSurface({
  className,
  variant = "panel",
  tone = "neutral",
  intensity = "medium",
  interactive = false,
  ...props
}: Props) {
  return (
    <div
      {...props}
      className={cn("kh-glass-surface", className)}
      data-glass-variant={variant}
      data-glass-tone={tone}
      data-glass-intensity={intensity}
      data-glass-interactive={interactive ? "true" : undefined}
    />
  );
}
