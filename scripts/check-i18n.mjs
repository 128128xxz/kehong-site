import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localeSource = fs.readFileSync(path.join(root, "src/i18n/locales.ts"), "utf8");
const locales = [...localeSource.matchAll(/^\s{2}([a-z]{2}):\s*\{/gmu)].map((match) => match[1]);
const expectedLocales = ["en", "zh", "id", "vi", "th", "ms"];
const errors = [];

if (JSON.stringify(locales) !== JSON.stringify(expectedLocales)) {
  errors.push(`Active locales differ from the expected six-locale set: ${locales.join(", ")}`);
}

function flatten(value, prefix = "", output = new Map()) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, output);
  } else {
    output.set(prefix, value);
  }
  return output;
}

function placeholders(value) {
  return [...String(value).matchAll(/\{[^{}]+\}/gu)].map((match) => match[0]).sort();
}

const messages = new Map();
for (const locale of expectedLocales) {
  const file = path.join(root, "dictionary", `${locale}.json`);
  if (!fs.existsSync(file)) {
    errors.push(`Missing dictionary: dictionary/${locale}.json`);
    continue;
  }
  try {
    messages.set(locale, flatten(JSON.parse(fs.readFileSync(file, "utf8"))));
  } catch (error) {
    errors.push(`Invalid JSON in dictionary/${locale}.json: ${error.message}`);
  }
}

const base = messages.get("en");
if (base) {
  for (const locale of expectedLocales.filter((item) => item !== "en")) {
    const current = messages.get(locale);
    if (!current) continue;
    for (const [key, value] of base) {
      if (!current.has(key)) {
        errors.push(`${locale} is missing ${key}`);
        continue;
      }
      const translated = current.get(key);
      if (translated === null || translated === "") errors.push(`${locale} has an empty value at ${key}`);
      if (placeholders(value).join("|") !== placeholders(translated).join("|")) {
        errors.push(`${locale} has mismatched placeholders at ${key}`);
      }
    }
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, locales: expectedLocales, keyCount: base?.size ?? 0 }));
}
