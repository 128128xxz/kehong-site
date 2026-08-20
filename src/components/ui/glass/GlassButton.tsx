import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
};

export function GlassButton({ className, tone = "primary", ...props }: Props) {
  return (
    <button
      {...props}
      className={cn("kh-button", tone === "primary" ? "kh-button-primary" : "kh-button-secondary", "kh-glass-button", className)}
      data-glass-variant={tone === "primary" ? "primary-button" : "secondary-button"}
    />
  );
}
