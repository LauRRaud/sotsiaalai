import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("profile dim theme icon reads as a restrained sunrise or sunset", () => {
  const profileBody = read("components/alalehed/ProfiilBody.jsx");

  assert.match(profileBody, /function ThemeMidDockIcon/);
  assert.match(profileBody, /strokeWidth="1\.52"/);
  assert.match(profileBody, /M4\.1 12\.75h15\.8/);
  assert.match(profileBody, /M6\.8 12\.75a5\.2 5\.2 0 0 1 10\.4 0/);
  assert.match(profileBody, /M5\.7 15\.5h12\.6/);
  assert.match(profileBody, /<ThemeMidDockIcon width=\{33\} height=\{33\}/);
  assert.doesNotMatch(profileBody, /ThemeMidDockIcon width=\{30\} height=\{30\} className="scale-\[1\.12\]"/);
  assert.doesNotMatch(profileBody, /<circle cx="12" cy="12" r="6\.25"/);
  assert.doesNotMatch(profileBody, /M12 5\.75a6\.25 6\.25 0 0 0 0 12\.5z/);
  assert.doesNotMatch(profileBody, /mid-sun-disc-clip/);
  assert.doesNotMatch(profileBody, /clipPath="url\(#mid-sun/);
});

test("profile theme mode icons use the shared mobile orbital icon sizing", () => {
  const profileBody = read("components/alalehed/ProfiilBody.jsx");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(
    profileBody,
    /<ThemeMidDockIcon width=\{33\} height=\{33\} className="profile-theme-mode-icon profile-theme-mid-icon" \/>/
  );
  assert.match(
    mobileCss,
    /\.profile-orbit-stack-bubble\s+\.dock-icon\s+svg\s*\{[\s\S]*?width:\s*78%;[\s\S]*?height:\s*78%;/
  );
  assert.match(
    read("components/effects/Components/OrbitalMenu/OrbitalMenu.css"),
    /\.profile-orbit-mobile-action\.dock-item\s+\.dock-icon\s+svg\s*\{[\s\S]*?width:\s*68%;[\s\S]*?height:\s*68%;/
  );
  assert.doesNotMatch(
    mobileCss,
    /\.profile-orbit-(?:stack-bubble|mobile-action)\s+\.dock-icon\s+\.profile-theme-mode-icon/
  );
  assert.doesNotMatch(
    mobileCss,
    /\.profile-orbit-(?:stack-bubble|mobile-action)\s+\.dock-icon\s+\.profile-theme-mid-icon/
  );
});

test("profile mobile orbit stack keeps semantic classes on every theme mode icon", () => {
  const profileBody = read("components/alalehed/ProfiilBody.jsx");

  assert.match(profileBody, /<ThemeHighContrastDockIcon width=\{27\} height=\{27\} className="profile-theme-mode-icon" \/>/);
  assert.match(profileBody, /<ThemeSunDockIcon width=\{26\} height=\{26\} className="profile-theme-mode-icon" \/>/);
  assert.match(profileBody, /<ThemeMoonDockIcon width=\{26\} height=\{26\} className="profile-theme-mode-icon" showStars=\{nextMode === "night"\} \/>/);
});
