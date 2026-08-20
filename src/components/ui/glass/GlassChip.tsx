import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassChip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cn("kh-glass-chip", className)} data-glass-variant="chip" />;
}
