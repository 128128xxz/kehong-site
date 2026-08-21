import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import {
  IBM_Plex_Mono,
  Instrument_Serif,
  Inter,
  Noto_Sans_Thai,
  Noto_Serif_Thai,
  Space_Grotesk,
  ZCOOL_XiaoWei,
} from "next/font/google";
import "../globals.css";
import UIMaterialPreview from "@/components/site/UIMaterialPreview";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-plex-mono", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: "normal", variable: "--font-instrument-serif", display: "swap" });
const zcoolXiaoWei = ZCOOL_XiaoWei({ subsets: ["latin"], weight: "400", variable: "--font-zcool-xiaowei", display: "swap" });
const notoSerifThai = Noto_Serif_Thai({ subsets: ["thai"], weight: ["400", "600"], variable: "--font-noto-serif-thai", display: "swap" });
const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"], weight: ["400", "500"], variable: "--font-noto-sans-thai", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/media/brand/kehong-favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/media/brand/kehong-tab-icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/media/brand/kehong-tab-icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/media/brand/kehong-tab-icon-48.png", type: "image/png", sizes: "48x48" },
    ],
    shortcut: "/media/brand/kehong-favicon.ico",
    apple: [{ url: "/media/brand/kehong-apple-touch-icon-180.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" dir="ltr" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} ${instrumentSerif.variable} ${zcoolXiaoWei.variable} ${notoSerifThai.variable} ${notoSansThai.variable}`}><head><meta name="theme-color" content="#171713" /></head><body className="antialiased"><UIMaterialPreview />{children}</body></html>;
}
