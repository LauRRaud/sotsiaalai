import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("profile orbital route actions hide the menu before pushing routes", () => {
  const source = read("components/alalehed/ProfiilBody.jsx");

  assert.match(source, /const \[orbitNavigating,\s*setOrbitNavigating\]\s*=\s*useState\(false\);/);
  assert.match(
    source,
    /const navigateFromOrbit = useCallback\(path => \{[\s\S]*?setOrbitNavigating\(true\);[\s\S]*?setOrbitOpen\(false\);[\s\S]*?window\.requestAnimationFrame\(navigate\);/
  );
  assert.match(source, /key:\s*"pin"[\s\S]*?onClick:\s*\(\)\s*=>\s*navigateFromOrbit\(/);
  assert.match(source, /key:\s*"email"[\s\S]*?onClick:\s*\(\)\s*=>\s*navigateFromOrbit\(/);
  assert.match(source, /key:\s*"subscription"[\s\S]*?onClick:\s*\(\)\s*=>\s*navigateFromOrbit\(/);
  assert.match(
    source,
    /className=\{cn\(orbitLayerClassName,\s*orbitNavigating \? "!opacity-0 !pointer-events-none" : null\)\}/
  );
});
