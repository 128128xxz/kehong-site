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
  "看得见的加工能力，服务海外项目",
  "稳定的打样与交付协同",
  "可核对的能力",
  "不展示未经核实的产能数据",
  "核对与推进",
  "围绕已确认规格协调",
  "电商与专业供应链",
  "出品流程",
  "D · 回复路径",
  "231 个产品",
  "231 products",
  "未经核验的文件不公开展示",
  "图片 / 尺寸 / 材质 / 数量",
  "Converting capability you can verify",
  "Industries & buyer paths",
  "E-commerce & professional",
  "dependable sampling and delivery coordination",
  "Verified workflow points",
  "We do not publish unverified capacity figures",
  "Equipment and workflows are coordinated",
  "Photo / size / material / quantity",
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
