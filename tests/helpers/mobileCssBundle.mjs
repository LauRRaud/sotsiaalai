import { readFileSync } from "node:fs";

const MOBILE_CSS_FILES = [
  "app/styles/mobile/foundations.css",
  "app/styles/mobile/touch-controls.css",
  "app/styles/mobile/background-home.css",
  "app/styles/mobile/profile-orbit.css",
  "app/styles/mobile/platform-android.css",
  "app/styles/mobile/modal-chat-accessibility.css",
  "app/styles/mobile/accessibility-touch.css",
  "app/styles/mobile/motion.css",
  "app/styles/mobile/title-sizing.css",
  "app/styles/mobile/home-scroll.css",
  "app/styles/mobile/scroll-panels.css",
  "app/styles/mobile/invite-workspace.css",
];

export function readMobileCssBundle() {
  return MOBILE_CSS_FILES.map((path) =>
    readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")
  ).join("\n");
}
