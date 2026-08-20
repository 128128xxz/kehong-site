import fs from "node:fs";

const PUBLIC_REF_PATTERN = new RegExp("[\\\"']((?:/(?:images|media|models)/)[^\\\"'\\\`)>\\s]+)", "g");

function isNextDynamicSegment(segment) {
  return /^:[A-Za-z][A-Za-z0-9_-]*(?:[?*+])?$/.test(segment)
    || /^\[\[?\.\.\.[A-Za-z][A-Za-z0-9_-]*\]\]?$/.test(segment);
}

export function classifyPublicReference(ref) {
  if (typeof ref !== "string" || !ref) return { kind: "ignored", reason: "not-a-reference" };
  if (/^(?:https?:|data:|blob:|\/\/)/i.test(ref)) return { kind: "ignored", reason: "external-or-embedded" };
  if (ref.includes("\${")) return { kind: "dynamic", reason: "template-expression" };

  const pathOnly = ref.split(/[?#]/, 1)[0];
  const match = pathOnly.match(/^\/([^/]+)\/(.+)$/);
  if (!match) return { kind: "ignored", reason: "outside-public-asset-roots" };

  const segments = match[2].split("/");
  if (segments.some(isNextDynamicSegment)) {
    return { kind: "dynamic", reason: "next-dynamic-route-pattern" };
  }
  if (!/^(?:images|media|models)$/.test(match[1])) {
    return { kind: "ignored", reason: "outside-public-asset-roots" };
  }
  if (segments.some((segment) => segment === "*" || segment.includes(":"))) {
    return { kind: "physical", reason: "literal-path-marker" };
  }
  return { kind: "physical", reason: "literal-public-path" };
}

export function extractPublicReferences(text) {
  return [...text.matchAll(PUBLIC_REF_PATTERN)].map((match) => match[1]);
}

export function publicAssetPath(root, ref) {
  const pathOnly = ref.split(/[?#]/, 1)[0];
  return new URL("file://" + root + "/public" + pathOnly).pathname;
}

export function findMissingPublicReferences(root, refs) {
  return [...new Set(refs)].filter((ref) => {
    return classifyPublicReference(ref).kind === "physical"
      && !fs.existsSync(publicAssetPath(root, ref));
  });
}
