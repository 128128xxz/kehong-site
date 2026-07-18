"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ResilientImageProps = Omit<ImageProps, "alt"> & {
  fallbackSrc: string;
  alt: string;
};

/**
 * Keeps a designed, paper-relevant image visible when an optimized asset is
 * unavailable at runtime. The fallback is intentionally another local asset,
 * so the layout never collapses into a blank or black media block.
 */
export default function ResilientImage({ fallbackSrc, src, alt, ...props }: ResilientImageProps) {
  const [currentSrc, setCurrentSrc] = useState<ImageProps["src"]>(src);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
