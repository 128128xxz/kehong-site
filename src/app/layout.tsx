import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * One site-wide icon source for every locale and App Router route. The static
 * App Router compatibility files are kept in sync with these versioned assets.
 */
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
  return <html lang="en"><body>{children}</body></html>;
}
