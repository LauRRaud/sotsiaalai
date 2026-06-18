import { readFileSync } from "node:fs";

const MOBILE_CSS_FILES = [
  "app/styles/mobile/foundations.css",
  "app/styles/mobile/touch-controls.css",
  "app/styles/features/home/background.css",
  "app/styles/features/home/mobile.css",
  "app/styles/mobile/register.css",
  "app/styles/features/profile/mobile.css",
  "app/styles/mobile/platform-android.css",
  "app/styles/mobile/accessibility-modal-fields.css",
  "app/styles/mobile/login-modal.css",
  "app/styles/mobile/modal-surfaces.css",
  "app/styles/features/chat/mobile.css",
  "app/styles/mobile/accessibility-touch.css",
  "app/styles/mobile/motion.css",
  "app/styles/mobile/subpage-title-system.css",
  "app/styles/mobile/login-otp-close.css",
  "app/styles/features/home/home-scroll.css",
  "app/styles/mobile/scroll-panels.css",
  "app/styles/mobile/invite-workspace.css",
];

export function readMobileCssBundle() {
  return MOBILE_CSS_FILES.map((path) =>
    readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")
  ).join("\n");
}
