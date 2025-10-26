import { pathToFileURL } from "url";
import { generateMessageTypes, getMessageKeySets } from "./generate-message-types.mjs";

function ensureKeyParity(keySets) {
  const locales = Object.keys(keySets);
  const reference = keySets[locales[0]];
  const issues = [];

  for (const locale of locales.slice(1)) {
    const set = keySets[locale];
    const missing = [...reference].filter((key) => !set.has(key));
    const extras = [...set].filter((key) => !reference.has(key));
    if (missing.length || extras.length) {
      issues.push({ locale, missing, extras });
    }
  }
  return issues;
}

export function checkMessages() {
  const { union } = generateMessageTypes();
  const keySets = getMessageKeySets();
  const issues = ensureKeyParity(keySets);

  if (issues.length) {
    issues.forEach(({ locale, missing, extras }) => {
      if (missing.length) {
        console.error(`[i18n] ${locale} missing keys:\n  - ${missing.join("\n  - ")}`);
      }
      if (extras.length) {
        console.error(`[i18n] ${locale} has extra keys:\n  - ${extras.join("\n  - ")}`);
      }
    });
    throw new Error("Message catalogs are inconsistent across locales.");
  }

  console.log(`✓ i18n messages verified (${union.size} keys)`);
}

if (pathToFileURL(process.argv[1]).href === import.meta.url) {
  checkMessages();
}
