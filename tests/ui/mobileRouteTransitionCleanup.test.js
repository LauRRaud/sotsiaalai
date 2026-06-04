import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile route transitions clean workspace restore and background pause state on pathname changes", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");

  assert.match(chatBody, /import \{ usePathname,\s*useRouter,\s*useSearchParams \} from "next\/navigation";/);
  assert.match(chatBody, /const pathname = usePathname\(\);/);
  assert.match(
    chatBody,
    /useEffect\(\(\) => \{[\s\S]*?return \(\) => \{[\s\S]*?workspaceRestoreTransitionRafRef\.current[\s\S]*?workspaceSurfaceReadyTimerRef\.current[\s\S]*?workspaceRestoredOpenRef\.current = false;[\s\S]*?setWorkspaceSuppressOpenTransition\(false\);[\s\S]*?setWorkspaceSurfaceReady\(false\);[\s\S]*?\};[\s\S]*?\}, \[pathname\]\);/
  );
  assert.match(backgroundLayer, /routeKey = ""/);
  assert.match(backgroundLayer, /useEffect\(\(\) => \{[\s\S]*?setColorBendsPaused\(false\);[\s\S]*?\}, \[routeKey\]\);/);
  assert.match(backgroundLayer, /routeKey=\{normalizedPathname\}/);
});

test("mobile chat home return does not wait for glass tilt before routing", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");
  const handleBackHomeBlock =
    chatBody.match(/const handleBackHome = useCallback\(async \(\) => \{[\s\S]*?\n  \}, \[[^\]]+\]\);/)?.[0] || "";

  assert.match(handleBackHomeBlock, /const transitionOptions = isMobile/);
  assert.match(handleBackHomeBlock, /persistGlassRingTilt:\s*false/);
  assert.match(handleBackHomeBlock, /isMobile \? 1800 : 960/);
  assert.match(
    handleBackHomeBlock,
    /const transitionOptions = isMobile\s*\?\s*\{\s*persistGlassRingTilt:\s*false\s*\}\s*:\s*\{[\s\S]*?waitForGlassRingTilt:\s*true/
  );
});
