import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const source = readFileSync(
  new URL("../../components/HomeSections/HomeAboutSection.jsx", import.meta.url),
  "utf8"
);
const registrarSource = readFileSync(
  new URL("../../components/pwa/ServiceWorkerRegistrar.jsx", import.meta.url),
  "utf8"
);
const enMessages = JSON.parse(
  readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8")
);
const ruMessages = JSON.parse(
  readFileSync(new URL("../../messages/ru.json", import.meta.url), "utf8")
);

test("home quick links expose separate PWA install actions for desktop and mobile", () => {
  assert.match(source, /key:\s*"install-desktop"[\s\S]*?installTarget:\s*"desktop"/);
  assert.match(source, /key:\s*"install-mobile"[\s\S]*?installTarget:\s*"mobile"/);
  assert.match(source, /const \[quickInstallTarget, setQuickInstallTarget\] = useState\("desktop"\)/);
  assert.match(source, /window\.matchMedia\?\.\("\(max-width: 768px\)"\)/);
  assert.match(source, /\.\.\(quickInstallTarget === "desktop"\s*\?/);
  assert.match(source, /<InstallAppLink[\s\S]*?variant="quickIcon"[\s\S]*?installTarget=\{item\.installTarget\}/);
});

test("home quick links include desktop and mobile download icons with a short visible label", () => {
  assert.match(source, /name === "install-desktop"/);
  assert.match(source, /name === "install-mobile"/);
  assert.match(source, /h-\[clamp\(3\.78rem,5vw,4\.42rem\)\]/);
  assert.match(source, /min-h-\[clamp\(6\.5rem,7\.9vw,7\.15rem\)\]/);
  assert.match(source, /pt-\[0\.26rem\]/);
  assert.match(source, /mt-\[0\.12rem\]/);
  assert.match(source, /max-\[768px\]:mt-\[0\.08rem\]/);
  assert.match(source, /const installIconProps = \{\s*\.\.\.commonProps,\s*strokeWidth: 1\.02\s*\}/);
  assert.match(source, /<svg \{\.\.\.installIconProps\}>[\s\S]*?<rect x="5\.7" y="4\.55" width="12\.6" height="8\.75" rx="1\.12" \/>/);
  assert.match(source, /<rect x="5\.7" y="4\.55" width="12\.6" height="8\.75" rx="1\.12" \/>/);
  assert.match(source, /<path d="m4\.05 18\.85 1\.2-3\.05h13\.5l1\.2 3\.05H4\.05Z" \/>/);
  assert.match(source, /overflow-visible/);
  assert.match(source, /viewBox:\s*"0 0 24 24"/);
  assert.match(source, /installLabel\s*=\s*locale === "et" \? "Paigalda"/);
  assert.match(source, /ariaLabel:\s*t\("pwa\.cta_desktop"\)/);
  assert.match(source, /ariaLabel:\s*t\("pwa\.cta_mobile"\)/);
  assert.match(source, /ariaLabel=\{item\.ariaLabel \|\| item\.label\}/);
  assert.match(source, /allowDesktopInstructions=\{item\.installTarget !== "desktop"\}/);
  assert.match(source, /const installLabel =\s*locale === "et" \? "Paigalda" : locale === "ru" \? "Установить" : "Install"/);
});

test("home quick link labels stay short in English and Russian", () => {
  assert.equal(enMessages.about.links.terms, "Terms");
  assert.equal(enMessages.about.links.privacy, "Privacy");
  assert.equal(enMessages.about.links.admin, "RAG");
  assert.equal(ruMessages.about.links.terms, "Условия");
  assert.equal(ruMessages.about.links.privacy, "Конфиденциальность");
  assert.equal(ruMessages.about.links.admin, "RAG");
  assert.match(source, /: "Confirmations";/);
  assert.match(source, /\? "Подтверждения"/);
});

test("PWA install prompt is captured before lazy home quick links mount", () => {
  assert.match(registrarSource, /window\.addEventListener\("beforeinstallprompt"/);
  assert.match(registrarSource, /window\.__deferredPWAInstallPrompt\s*=\s*event/);
  assert.match(registrarSource, /new Event\("pwa-install-prompt-ready"\)/);
});
