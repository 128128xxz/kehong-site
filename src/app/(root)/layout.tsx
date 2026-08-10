import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/brand/kehong-favicon-v2.ico", type: "image/x-icon", sizes: "any" },
      { url: "/brand/kehong-tab-icon-v2-16.png", type: "image/png", sizes: "16x16" },
      { url: "/brand/kehong-tab-icon-v2-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/kehong-tab-icon-v2-48.png", type: "image/png", sizes: "48x48" },
    ],
    shortcut: "/brand/kehong-favicon-v2.ico",
    apple: [{ url: "/brand/kehong-apple-touch-icon-v2.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" dir="ltr" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}><head><meta name="theme-color" content="#171713" /></head><body className="antialiased">{children}</body></html>;
}
