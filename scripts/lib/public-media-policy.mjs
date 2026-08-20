const DISALLOWED_PATH = /(^|[\/_-])(ai|ai-generated|generated-by-ai|generated_with_ai|gpt|chatgpt|ai-representative)([\/_-]|$)|generated-by-ai|generated_with_ai/i;
const NEUTRAL_FILENAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/;

export function isDisallowedPublicMediaPath(value) {
  return DISALLOWED_PATH.test(String(value || ""));
}

export function isNeutralMediaFilename(value) {
  return NEUTRAL_FILENAME.test(String(value || "")) && !isDisallowedPublicMediaPath(value);
}

export function hasLegacyImageStatus(value) {
  return String(value || "").includes("ai-representative");
}
