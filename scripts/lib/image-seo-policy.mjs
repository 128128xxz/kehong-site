export const filenameForbidden = /(?:^|[-_])(?:ai|gpt|uuid)(?:[-_]|$)|(?:ai-generated|generated-by-ai|generated_with_ai|chatgpt|ai-representative)/iu;
export const genericStem = /^(?:image|img|picture|photo|product|material|sample|main|banner|hero|new-image|final-image|final-final|untitled|copy|generated|asset|uuid)(?:-\d+)?$/iu;
export const keywordStuffing = /(?:manufacturer|supplier|wholesale|china|oem|odm|best|premium|cheap|price|exporter|certified)/iu;

export function isSemanticFilename(filename) {
  const stem = filename.replace(/\.[^.]+$/u, "");
  return /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/u.test(filename)
    && !filenameForbidden.test(filename)
    && !genericStem.test(stem)
    && filename.length <= 90
    && !filename.includes("--")
    && !keywordStuffing.test(filename);
}

export function repeatedKeywordCount(filename) {
  const words = filename.replace(/\.[^.]+$/u, "").split("-").filter(Boolean);
  return Math.max(...words.map((word) => words.filter((candidate) => candidate === word).length), 0);
}
