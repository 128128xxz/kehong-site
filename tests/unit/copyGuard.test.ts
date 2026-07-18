import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const bannedPublicCopy = [
  "Review the structure before you quote",
  "Bring your packaging requirement into production",
  "Finished structures ready for real applications",
  "Best Quality",
  "Best Price",
  "One-Stop Service",
] as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.(?:ts|tsx|json)$/.test(entry.name) ? [absolute] : [];
  });
}

describe("approved public copy", () => {
  it("does not reintroduce retired English phrases", () => {
    const source = sourceFiles(path.join(process.cwd(), "src"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    for (const phrase of bannedPublicCopy) expect(source).not.toContain(phrase);
  });
});
