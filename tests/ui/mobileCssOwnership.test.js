import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readCssSourceBundle } from "../helpers/cssSourceBundle.mjs";

function read(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home mobile scroll CSS stays home-owned", async () => {
  const globalMobileCss = await read("app/styles/mobile.css");
  const homeIndexCss = await read("app/styles/features/home/index.css");
  const homeScrollCss = await read("app/styles/features/home/home-scroll.css");

  assert.doesNotMatch(globalMobileCss, /features\/home\/home-scroll\.css/);
  assert.match(homeIndexCss, /@import url\("\.\/home-scroll\.css"\);/);
  assert.doesNotMatch(homeScrollCss, /\.profile-orbit-stack-/);
  assert.doesNotMatch(homeScrollCss, /\.direct-scroll-surface/);
});

test("shared and profile mobile rules live beside their owners", async () => {
  const scrollPanelsCss = readCssSourceBundle("app/styles/mobile/scroll-panels.css");
  const profileMobileCss = await read("app/styles/features/profile/mobile.css");

  assert.match(scrollPanelsCss, /\.direct-scroll-surface\s*\{[\s\S]*?padding-top:\s*0\s*!important/);
  assert.match(profileMobileCss, /\.profile-orbit-stack-fade\s*\{[\s\S]*?display:\s*none\s*!important/);
  assert.match(profileMobileCss, /\.profile-orbit-stack-panel::before/);
});


test("policy tall and admin mobile header rules are route-owned", async () => {
  const globalMobileCss = await read("app/styles/mobile.css");
  const panelSurfacesCss = await read("app/styles/mobile/panel-surfaces.css");
  const subpageTitleCss = await read("app/styles/mobile/subpage-title-system.css");
  const policyHeaderCss = await read("app/styles/features/policy/mobile-header.css");
  const chatIndexCss = await read("app/styles/features/chat/index.css");
  const chatTopnavCss = await read("app/styles/features/chat/mobile-topnav.css");
  const policyIndexCss = await read("app/styles/features/policy/index.css");
  const policyTallCss = await read("app/styles/features/policy/mobile-tall.css");
  const documentsIndexCss = await read("app/styles/features/documents/index.css");
  const documentsAdminHeaderCss = await read("app/styles/features/documents/admin-mobile-header.css");
  const serviceMapIndexCss = await read("app/styles/features/service-map/index.css");
  const serviceMapHeaderCss = await read("app/styles/features/service-map/mobile-header.css");
  const subpageHeaderLayoutCss = await read("app/styles/mobile/subpage-header/layout.css");

  assert.doesNotMatch(globalMobileCss, /mobile-tall\.css|admin-mobile-header\.css/);
  assert.doesNotMatch(panelSurfacesCss, /policy-mobile-tall/);
  assert.doesNotMatch(subpageTitleCss, /rag-admin-shell-card|admin-framework-acceptances-page|policy-scroll-page-scroller|chat-mobile-topnav/);
  assert.doesNotMatch(subpageHeaderLayoutCss, /service-map-workspace__(?:back|info)/);

  assert.match(policyIndexCss, /@import url\("\.\/mobile-header\.css"\);/);
  assert.match(policyIndexCss, /@import url\("\.\/mobile-tall\.css"\);/);
  assert.match(policyHeaderCss, /\.policy-scroll-page-scroller/);
  assert.match(chatIndexCss, /@import url\("\.\/mobile-topnav\.css"\);/);
  assert.match(chatTopnavCss, /\.chat-mobile-topnav \.mobile-shared-topnav-title/);
  assert.match(serviceMapIndexCss, /@import url\("\.\/mobile-header\.css"\);/);
  assert.match(serviceMapHeaderCss, /\.service-map-workspace__back/);
  assert.match(serviceMapHeaderCss, /\.service-map-workspace__info/);
  assert.match(policyTallCss, /\.policy-scroll-page-ring\.policy-mobile-tall/);

  assert.match(documentsIndexCss, /@import url\("\.\/admin-mobile-header\.css"\);/);
  assert.match(documentsAdminHeaderCss, /\.rag-admin-shell-card/);
  assert.match(documentsAdminHeaderCss, /\.admin-framework-acceptances-page/);
});
