import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalizeUrl, validateManifest } from "../../scripts/search-index/lib.mjs";

const key = "1e2355a1eb736793a342e4b8e2c503cf";

describe("search notification safeguards", () => {
  it("keeps the public IndexNow key file exact and outside the sitemap routes", () => {
    const keyFile = path.join(process.cwd(), "public", `${key}.txt`);
    expect(readFileSync(keyFile, "utf8").trim()).toBe(key);
    expect(keyFile).not.toContain("sitemap");
  });

  it("does not expose a secret-like token in notification source", () => {
    const source = readFileSync(path.join(process.cwd(), "scripts/search-index/submit-baidu.mjs"), "utf8");
    expect(source).not.toMatch(/BAIDU_PUSH_TOKEN\s*[:=]\s*["'][^"']+["']/u);
    expect(source).toContain("SKIPPED_TOKEN_MISSING");
  });

  it("rejects query, preview, API and redirect URLs before submission", () => {
    expect(() => validateManifest({ urls: [{ url: "https://www.kehong.tech/en/news?utm_source=test", change_type: "updated", http_status: 200 }] })).toThrow(/query\/hash/iu);
    expect(() => validateManifest({ urls: [{ url: "https://preview.vercel.app/en/news", change_type: "updated", http_status: 200 }] })).toThrow(/origin/iu);
    expect(() => validateManifest({ urls: [{ url: "https://www.kehong.tech/api/health", change_type: "updated", http_status: 200 }] })).toThrow(/private route/iu);
    expect(() => validateManifest({ urls: [{ url: "https://www.kehong.tech/en/news", change_type: "updated", http_status: 308 }] })).toThrow(/redirect/iu);
    expect(canonicalizeUrl("https://www.kehong.tech/en/news/")).toBe("https://www.kehong.tech/en/news");
  });
});
