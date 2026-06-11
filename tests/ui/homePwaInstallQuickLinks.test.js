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
  assert.match(source, /const \[quickInstallAvailable, setQuickInstallAvailable\] = useState\(false\)/);
  assert.match(source, /window\.matchMedia\?\.\("\(max-width: 768px\)"\)/);
  assert.match(source, /window\.matchMedia\?\.\("\(display-mode: standalone\)"\)/);
  assert.match(source, /window\.matchMedia\?\.\("\(display-mode: fullscreen\)"\)/);
  assert.match(source, /window\.navigator\?\.standalone === true/);
  assert.match(source, /setQuickInstallAvailable\(!isStandaloneDisplay\(\)\)/);
  assert.match(source, /window\.addEventListener\("appinstalled", handleAppInstalled\)/);
  assert.match(source, /\.\.\(quickInstallAvailable[\s\S]*?\? quickInstallTarget === "desktop"/);
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

test("home quick links fit the six public icons on one desktop row", () => {
  assert.match(source, /showAdminLinks\s*\?\s*"grid grid-cols-\[repeat\(6,clamp\(4\.8rem,6vw,5\.4rem\)\)\] justify-between"/);
  assert.match(source, /:\s*"flex flex-nowrap justify-between gap-x-0"/);
  assert.match(source, /:\s*"w-\[clamp\(4\.8rem,6vw,5\.4rem\)\] min-w-\[clamp\(4\.8rem,6vw,5\.4rem\)\] flex-none"/);
  assert.match(source, /const \[useQuickCarouselVisibility, setUseQuickCarouselVisibility\] = useState\(false\)/);
  assert.match(source, /if \(!useQuickCarouselVisibility\) return "active"/);
});

test("home quick carousel removes the installed PWA slot and keeps labels stable while arrows scroll", () => {
  const homeCss = readFileSync(new URL("../../app/styles/features/home/desktop.css", import.meta.url), "utf8");

  assert.match(source, /const quickCarouselProgrammaticRef = useRef\(false\)/);
  assert.match(source, /const quickCarouselSettleTimerRef = useRef\(0\)/);
  assert.match(source, /if \(quickCarouselProgrammaticRef\.current\) return;/);
  assert.match(source, /quickCarouselProgrammaticRef\.current = true;[\s\S]*?centerQuickItem\(list,\s*target,\s*behavior\);[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?quickCarouselProgrammaticRef\.current = false;/);
  assert.match(source, /const isMobileCarousel =[\s\S]*?window\.matchMedia\?\.\("\(max-width: 768px\)"\)/);
  assert.match(source, /reduceMotion === "1" \|\| isMobileCarousel[\s\S]*?\? "auto"[\s\S]*?: "smooth"/);
  assert.match(source, /data-home-quick-type=\{item\.type \|\| "link"\}/);
  assert.match(source, /const quickLinkKeys = quickLinkSignature \? quickLinkSignature\.split\("\|"\) : \[\]/);
  assert.match(source, /const fallbackKey = quickLinkKeys\.includes\("privacy"\) \? "privacy" : quickLinkKeys\[0\]/);
  assert.doesNotMatch(homeCss, /home-before-link-item\[data-home-quick-type="install"\][\s\S]*?visibility:\s*hidden\s*!important/);
});

test("home mobile quick carousel loads with privacy focused", () => {
  assert.match(source, /const activeQuickKeyRef = useRef\("privacy"\)/);
  assert.match(source, /const \[activeQuickKey, setActiveQuickKey\] = useState\("privacy"\)/);
  assert.match(source, /window\.addEventListener\("pageshow",\s*updateInstallTarget\)/);
  assert.match(source, /list\.querySelector\('\[data-home-quick-key="privacy"\]'\)/);
  assert.match(source, /applyActiveKey\(items,\s*target\?\.dataset\?\.homeQuickKey \|\| "privacy"\)/);
  assert.match(source, /\[90,\s*260,\s*620,\s*1120,\s*1800,\s*2600\]\.forEach\(\(delay\) => \{/);
  assert.match(source, /if \(!target \|\| list\.clientWidth <= 0 \|\| target\.offsetWidth <= 0\) \{/);
  assert.match(source, /const layoutObserver =[\s\S]*?new ResizeObserver\(\(\) => scheduleInitialCenter\(\)\)/);
  assert.match(source, /window\.addEventListener\("pageshow",\s*handlePageRestore\)/);
  assert.match(source, /document\.addEventListener\("visibilitychange",\s*handleVisibilityChange\)/);
  assert.match(source, /quickCarouselProgrammaticRef\.current = true;[\s\S]*?centerQuickItem\(list,\s*target,\s*behavior\);/);
  assert.match(source, /const clearInitialTimers = \(\) => \{[\s\S]*?initialTimers\.splice\(0\)\.forEach\(\(timer\) => window\.clearTimeout\(timer\)\)/);
  assert.match(source, /clearInitialTimers\(\);[\s\S]*?centerInitialItem\(\);/);
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
