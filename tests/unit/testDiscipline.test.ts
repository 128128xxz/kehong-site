import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function testSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? testSources(absolute) : /\.(?:test|spec)\.tsx?$/u.test(entry.name) ? [absolute] : [];
  });
}

describe("test discipline", () => {
  it("contains no skipped, focused, or fixme test declarations", () => {
    const source = testSources(path.join(process.cwd(), "tests")).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/\b(?:test|describe|it)\s*\.\s*(?:skip|only|fixme)\s*\(/u);
  });
});
