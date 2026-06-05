import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("account settings modal uses full mobile card height instead of desktop ring height", () => {
  const css = read("app/styles/mobile/subpage-title-system.css");
  const source = read("components/alalehed/ProfiilBody.jsx");

  assert.match(source, /account-settings-modal-content[\s\S]*?!h-\[var\(--ring-diameter/);
  assert.match(source, /max-\[768px\]:\[--account-settings-mobile-height:calc\(var\(--glass-mobile-root-vh,100dvh\)/);
  assert.match(source, /max-\[768px\]:!h-\[var\(--account-settings-mobile-height\)\]/);
  assert.match(source, /max-\[768px\]:!max-h-\[var\(--account-settings-mobile-height\)\]/);
  assert.match(
    css,
    /\.invite-modal-content\.account-settings-modal-content\.glass-mobile-card\.mobile-keep-desktop-glass-cards\s*\{[\s\S]*?--account-settings-mobile-height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*100dvh\)[\s\S]*?height:\s*var\(--account-settings-mobile-height\)\s*!important;[\s\S]*?max-height:\s*var\(--account-settings-mobile-height\)\s*!important;/
  );
  assert.match(
    css,
    /\.account-settings-modal-content \.invite-modal-scroll\s*\{[\s\S]*?flex:\s*1 1 auto\s*!important;[\s\S]*?height:\s*auto\s*!important;[\s\S]*?max-height:\s*none\s*!important;[\s\S]*?min-height:\s*0\s*!important;/
  );
});

test("mobile page titles use one stable shadow token during fit and final render", () => {
  const css = read("app/styles/mobile/subpage-title-system.css");

  assert.match(css, /--mobile-header-title-shadow:\s*var\(--glass-modal-title-shadow,\s*none\);/);
  assert.match(
    css,
    /:is\([\s\S]*?\.account-settings-modal-content[\s\S]*?\)\s*:is\([\s\S]*?\.account-modal-title,[\s\S]*?\.subscription-page-title[\s\S]*?\)\s*\{[\s\S]*?font-size:\s*var\(--mobile-header-title-font\)\s*!important;[\s\S]*?text-shadow:\s*var\(--mobile-header-title-shadow\)\s*!important;/
  );
});
