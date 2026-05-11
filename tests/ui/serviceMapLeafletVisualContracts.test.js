import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function cssBlock(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] || "";
}

test("service map Leaflet markers do not inherit the default div icon plate", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.service-map-leaflet \.leaflet-div-icon\s*\{[\s\S]*?border:\s*0\s*!important[\s\S]*?background:\s*transparent\s*!important/
  );
});

test("service map popup glass is applied on the wrapper immediately", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(css, /--service-map-popup-glass-bg:\s*rgba\(32,\s*36,\s*43,\s*0\.82\)/);
  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background-color:[\s\S]*?var\(--service-map-popup-glass-bg\)\s*!important[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.match(
    css,
    /\.service-map-leaflet\.leaflet-fade-anim \.service-map-leaflet__popup\.leaflet-popup\s*\{[\s\S]*?opacity:\s*1\s*!important[\s\S]*?transition:\s*none\s*!important/
  );
});

test("service map close button and toolbar controls keep the intended brand/control surfaces", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-close-button\s*\{[\s\S]*?color:\s*var\(--workspace-feature-accent,\s*var\(--title-color,\s*#c57171\)\)\s*!important/
  );
  assert.match(css, /--service-map-control-glass-bg:\s*color-mix\(/);
  assert.match(
    css,
    /\.service-map-workspace__filters:not\(\.service-map-workspace__filters--collapsed\) \.service-map-workspace__toggle\s*\{[\s\S]*?var\(--service-map-control-glass-bg\)/
  );
});

test("service map toolbar controls keep compact shadows without suppressing light and mid edge glow", () => {
  const css = read("app/styles/components/service-map.css");
  const glassCss = read("app/styles/components/glass.css");

  assert.match(
    css,
    /--service-map-control-shadow:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.22\),\s*0 2px 5px rgba\(15,\s*23,\s*42,\s*0\.075\)/
  );
  assert.match(
    css,
    /--service-map-control-shadow:[\s\S]*?0 0 0 1px rgba\(122,\s*58,\s*56,\s*0\.08\)/
  );
  assert.match(
    css,
    /--service-map-control-shadow-hover:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.28\),\s*0 3px 7px rgba\(15,\s*23,\s*42,\s*0\.09\)/
  );
  assert.match(
    css,
    /--service-map-control-shadow-hover:[\s\S]*?0 0 0 1px rgba\(122,\s*58,\s*56,\s*0\.18\)[\s\S]*?0 0 18px rgba\(197,\s*113,\s*113,\s*0\.09\)/
  );
  assert.match(
    glassCss,
    /:root\.theme-light \.ui-glow-field > \[class\*="edgeLight"\],[\s\S]*?:root\.theme-mid \.ui-glow-field > \[class\*="edgeLight"\]\s*\{[\s\S]*?display:\s*block\s*!important/
  );
  assert.match(
    glassCss,
    /:root\.theme-light \.ui-glow-option-card-frame > \[class\*="edgeLight"\],[\s\S]*?:root\.theme-mid \.ui-glow-option-card-frame > \[class\*="edgeLight"\]\s*\{[\s\S]*?display:\s*block\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light \.service-map-toolbar__glow-field\.ui-glow-field > \[class\*="edgeLight"\],[\s\S]*?:root\.theme-mid \.service-map-toolbar__results \.workspace-feature-list-card\.ui-glow-button-frame > \[class\*="edgeLight"\]\s*\{[\s\S]*?display:\s*block\s*!important/
  );
  assert.doesNotMatch(
    css,
    /\.service-map-toolbar__glow-field\s*>\s*\[class\*="edgeLight"\],[\s\S]*?\.service-map-toolbar__type-card\s*>\s*\[class\*="edgeLight"\][\s\S]*?display:\s*none\s*!important/
  );
  assert.doesNotMatch(
    css,
    /:root\.theme-light \.service-map-toolbar__glow-field\.ui-glow-field\s*>\s*\[class\*="edgeLight"\],[\s\S]*?:root\.theme-mid \.service-map-toolbar__type-card\.ui-glow-option-card-frame\s*>\s*\[class\*="edgeLight"\]\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.doesNotMatch(
    css,
    /:root\.theme-light \.service-map-toolbar__glow-field\.ui-glow-field::after,[\s\S]*?:root\.theme-mid \.service-map-toolbar__results \.workspace-feature-list-card::after\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.doesNotMatch(css, /--edge-proximity:\s*100/);
  assert.doesNotMatch(css, /--cursor-angle:\s*90deg/);
  assert.match(
    css,
    /\.service-map-toolbar__type-card\s*\{[\s\S]*?transition:[\s\S]*?background 560ms cubic-bezier\(0\.22,\s*0\.61,\s*0\.36,\s*1\)/
  );
  assert.match(
    css,
    /\.service-map-toolbar__type-card:hover,[\s\S]*?background:\s*var\(--btn-primary-bg-hover/
  );
  assert.match(
    css,
    /:root\.theme-mid \.service-map-toolbar__glow-field\.ui-glow-field:hover,[\s\S]*?background:\s*var\(--mid-pill-surface-bg-hover/
  );
  assert.match(
    css,
    /:root\.theme-light \.service-map-toolbar__glow-field\.ui-glow-field[\s\S]*?box-shadow:\s*var\(--service-map-control-shadow\)\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light \.service-map-toolbar__type-card\.ui-glow-option-card-frame[\s\S]*?box-shadow:\s*var\(--service-map-control-shadow\)\s*!important/
  );
});

test("service map back button uses desktop toolbar panel and mobile page anchor", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/components/service-map.css");

  assert.match(
    source,
    /className=\{cn\(glassPageBackTopLeftClassName,\s*"service-map-workspace__back"\)\}/
  );
  assert.match(source, /className="service-map-toolbar__back"/);
  assert.match(
    css,
    /\.service-map-workspace__back\s*\{[\s\S]*?z-index:\s*450\s*!important/
  );
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.service-map-workspace__back\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__identity\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    css,
    /\.service-map-toolbar__back\s*\{[\s\S]*?background:\s*transparent\s*!important[\s\S]*?box-shadow:\s*none\s*!important/
  );
});

test("workspace dashboard back button keeps the same shared page anchor", () => {
  const source = read("components/chat/WorkspacePanel.jsx");
  const css = read("components/chat/WorkspacePanel.module.css");

  assert.match(
    source,
    /className=\{cn\(glassPageBackTopLeftClassName,\s*styles\.backButton\)\}/
  );
  assert.match(css, /\.backButton\s*\{[^}]*z-index:\s*92\s*!important/);
  assert.doesNotMatch(css, /^\.backButton\s*\{[^}]*\bleft:/m);
  assert.doesNotMatch(css, /^\.backButton\s*\{[^}]*\btop:/m);
});

test("service map multi-line mobile toolbar stays compact and gives provider tab enough width", () => {
  const css = read("app/styles/components/service-map.css");
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?gap:\s*0\.5rem[\s\S]*?padding-bottom:\s*0\.46rem/
  );
  assert.match(
    css,
    /\.service-map-toolbar__types\s*\{[\s\S]*?grid-template-columns:\s*minmax\(5\.25rem,\s*1fr\) minmax\(6\.9rem,\s*1\.28fr\) minmax\(3\.35rem,\s*0\.62fr\)/
  );
  assert.match(
    css,
    /\.service-map-toolbar__type-card\s*\{[\s\S]*?font-size:\s*0\.82rem[\s\S]*?letter-spacing:\s*0/
  );
  assert.match(
    css,
    /\.service-map-toolbar__type-card \.service-map-toolbar__type-label\s*\{[\s\S]*?text-wrap:\s*nowrap[\s\S]*?white-space:\s*nowrap/
  );
  assert.match(
    css,
    /\.service-map-toolbar__results\s*\{[\s\S]*?padding:\s*0\.08rem 0\.22rem 0\.08rem/
  );
  assert.doesNotMatch(source, /service-map-result-card__type/);
});

test("service map result cards use toolbar control styling without shadows", () => {
  const css = read("app/styles/components/service-map.css");
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const resultButton = cssBlock(css, ".service-map-toolbar__results .service-map-toolbar__result-button");

  assert.match(
    source,
    /"workspace-feature-list-card button invite-primary-btn service-map-toolbar__result-button ui-glow-button-frame ui-glow-button-control/
  );
  assert.match(
    resultButton,
    /border:\s*var\(--btn-primary-border/
  );
  assert.match(
    resultButton,
    /background:\s*var\(--btn-primary-bg/
  );
  assert.match(resultButton, /min-height:\s*3\.15rem/);
  assert.match(resultButton, /padding:\s*0\.66rem 0\.72rem/);
  assert.match(
    resultButton,
    /box-shadow:\s*none\s*!important/
  );
  assert.match(
    css,
    /\.service-map-toolbar__results \.service-map-toolbar__result-button:hover,[\s\S]*?box-shadow:\s*none\s*!important/
  );
  assert.match(
    css,
    /:root \.service-map-toolbar__results \.service-map-toolbar__result-button\.ui-glow-button-frame,[\s\S]*?box-shadow:\s*none\s*!important/
  );
  assert.doesNotMatch(
    resultButton,
    /var\(--seg-card-bg/
  );
  assert.doesNotMatch(
    resultButton,
    /box-shadow:\s*var\(--btn-primary-shadow/
  );
});

test("service map mobile route removes animated overlays and lets the map fill the panel", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const css = read("app/styles/components/service-map.css");

  assert.match(
    backgroundLayer,
    /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?["']\/teenusekaart["']/
  );
  assert.match(
    backgroundLayer,
    /PARTICLES_EXCLUDED_PATHS[\s\S]*?["']\/teenusekaart["']/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-page-panel\.service-map-page-panel\s*\{[\s\S]*?inset:\s*0\s*!important[\s\S]*?border-radius:\s*0[\s\S]*?background:\s*var\(--service-map-map-bg,\s*#eef0ef\)\s*!important[\s\S]*?backdrop-filter:\s*none/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace\s*\{[\s\S]*?--service-map-map-radius:\s*0px[\s\S]*?--service-map-mobile-map-inset:\s*0px/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__map\s*\{[\s\S]*?inset:\s*var\(--service-map-mobile-map-inset\)[\s\S]*?border-radius:\s*var\(--service-map-map-radius\)[\s\S]*?box-shadow:\s*none/
  );
});

test("service map clears its global page-active state before delayed back navigation", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /function clearServiceMapPageState\(\)\s*\{[\s\S]*?service-map-page-active/);
  assert.match(source, /return \(\) => \{\s*clearServiceMapPageState\(\);\s*\};/);
  assert.match(source, /const handleServiceMapBack = useCallback\(\(\) => \{\s*clearServiceMapPageState\(\);\s*onBack\?\.\(\);/);
  assert.match(source, /onClick=\{handleServiceMapBack\}/);
});

test("service map mobile inputs keep 16px text to avoid browser focus zoom", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__input\s*\{[\s\S]*?font-size:\s*16px/
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-workspace__filters input\s*\{[\s\S]*?font-size:\s*16px\s*!important/
  );
});

test("service map results do not force oversized panel bottom padding", () => {
  const css = read("app/styles/components/service-map.css");
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    css,
    /\.service-map-toolbar__resultsblock\s*\{[\s\S]*?align-self:\s*start/
  );
  assert.match(
    css,
    /\.service-map-toolbar__resultsblock\s*\{[\s\S]*?transform:\s*translateX\(-1\.9rem\)/
  );
  assert.match(
    css,
    /\.service-map-toolbar__results\s*\{[\s\S]*?min-height:\s*0[\s\S]*?padding:\s*0\.08rem 0\.22rem 0\.08rem/
  );
  assert.match(
    css,
    /\.service-map-workspace:has\(\.service-map-toolbar__results\) \.service-map-workspace__filters-shell\s*\{[\s\S]*?padding-bottom:\s*0\.38rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?padding-bottom:\s*0\.46rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__results\s*\{[\s\S]*?padding:\s*0\.08rem 0\.12rem 0\.12rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?padding-bottom:\s*0\.48rem/
  );
  assert.match(source, /const workspaceRef = useRef\(null\);/);
  assert.match(source, /const filtersShellRef = useRef\(null\);/);
  assert.match(source, /new ResizeObserver\(syncPanelHeight\)/);
  assert.match(css, /--service-map-panel-height:\s*4\.7rem/);
  assert.match(css, /--service-map-map-panel-gap:\s*0\.6rem/);
  assert.match(css, /--service-map-map-top:\s*calc\(var\(--service-map-panel-top\) \+ var\(--service-map-panel-height\) \+ var\(--service-map-map-panel-gap\)\)/);
  assert.match(css, /--service-map-map-max-height:\s*48rem/);
  assert.match(css, /\.service-map-workspace__map\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 4rem\),\s*100rem\)/);
  assert.match(css, /\.service-map-workspace__filters\s*\{[\s\S]*?width:\s*fit-content/);
  assert.match(css, /\.service-map-workspace__filters-shell\s*\{[\s\S]*?width:\s*auto/);
  assert.match(css, /\.service-map-toolbar__content\s*\{[\s\S]*?width:\s*max-content/);
  assert.match(css, /\.service-map-toolbar__results\s*\{[\s\S]*?justify-content:\s*center[\s\S]*?overflow-x:\s*auto[\s\S]*?overflow-y:\s*hidden/);
});

test("service map popup and two-line toolbar preserve glass and back alignment", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /--service-map-popup-glass-bg:\s*rgba\(32,\s*36,\s*43,\s*0\.82\)/
  );
  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background-clip:\s*padding-box[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.match(
    css,
    /\.service-map-workspace__filters-shell\s*\{[\s\S]*?align-items:\s*center/
  );
  assert.match(
    css,
    /\.service-map-workspace:has\(\.service-map-toolbar__results\) \.service-map-workspace__filters-shell\s*\{[\s\S]*?align-items:\s*flex-start/
  );
  assert.match(
    css,
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-workspace__filters-shell\s*\{[\s\S]*?align-items:\s*center[\s\S]*?justify-content:\s*center[\s\S]*?width:\s*min\(calc\(100vw - 2rem\),\s*30rem\)/
  );
  assert.match(
    css,
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-toolbar__identity\s*\{[\s\S]*?position:\s*absolute[\s\S]*?left:\s*0\.28rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-toolbar__body\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)[\s\S]*?justify-items:\s*center/
  );
  assert.match(
    css,
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-toolbar__resultsblock\s*\{[\s\S]*?transform:\s*none/
  );
  assert.match(
    css,
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-toolbar__fields,\s*\n\s*\.service-map-toolbar__types\s*\{[\s\S]*?justify-self:\s*center/
  );
  assert.match(
    css,
    /\.service-map-toolbar__identity\s*\{[\s\S]*?align-self:\s*flex-start[\s\S]*?padding-top:\s*0/
  );
  assert.match(
    css,
    /\.service-map-workspace:has\(\.service-map-toolbar__results\) \.service-map-toolbar__back\s*\{[\s\S]*?margin-top:\s*-0\.34rem/
  );
  assert.match(
    css,
    /:root\.theme-light:not\(\.theme-mid\) \.service-map-toolbar__type-card\.ui-glow-option-card-frame,[\s\S]*?:root\.theme-mid \.service-map-toolbar__type-card\.ui-glow-option-card-frame\s*\{[\s\S]*?border:\s*1px solid rgba\(122,\s*58,\s*56,\s*0\.12\)\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light:not\(\.theme-mid\) \.service-map-toolbar__results \.workspace-feature-list-card\.ui-glow-button-frame,[\s\S]*?:root\.theme-mid \.service-map-toolbar__results \.workspace-feature-list-card\.ui-glow-button-frame\s*\{[\s\S]*?border:\s*1px solid rgba\(122,\s*58,\s*56,\s*0\.12\)\s*!important/
  );
});

test("service map mobile map edge does not expose a blue Leaflet fallback seam", () => {
  const css = read("app/styles/components/service-map.css");

  assert.doesNotMatch(css, /background:\s*#a8d5e0\s*!important/);
  assert.match(css, /--service-map-map-bg:\s*#eef0ef/);
  assert.match(
    css,
    /\.service-map-leaflet(?:\.leaflet-container)?\s*\{[\s\S]*?background:\s*var\(--service-map-map-bg\)\s*!important/
  );
});

test("service map toolbar uses flat glass while map canvas stays edge-free", () => {
  const css = read("app/styles/components/service-map.css");
  const filtersShell = cssBlock(css, ".service-map-workspace__filters-shell");
  const mapFrame = cssBlock(css, ".service-map-workspace__map");
  const leafletShell = cssBlock(css, ".service-map-leaflet-shell");
  const leaflet = cssBlock(css, ".service-map-leaflet");

  assert.match(filtersShell, /border:\s*0\s*!important/);
  assert.match(filtersShell, /background:\s*var\(--service-map-panel-glass-bg\)/);
  assert.match(filtersShell, /box-shadow:\s*var\(--service-map-panel-shadow\)\s*!important/);
  assert.doesNotMatch(css, /\.service-map-workspace__filters-shell::after/);
  assert.doesNotMatch(css, /--service-map-panel-edge-stroke/);
  assert.match(mapFrame, /border:\s*0\s*!important/);
  assert.match(mapFrame, /box-shadow:\s*none\s*!important/);
  assert.match(leafletShell, /border:\s*0\s*!important/);
  assert.match(leafletShell, /box-shadow:\s*none\s*!important/);
  assert.match(leaflet, /border:\s*0\s*!important/);
  assert.match(leaflet, /box-shadow:\s*none\s*!important/);
});

test("service map filter panel uses shared glass background in standard themes, while high contrast remains black", () => {
  const css = read("app/styles/components/service-map.css");
  const rootBlock = cssBlock(css, ".service-map-workspace");
  const filtersShell = cssBlock(css, ".service-map-workspace__filters-shell");
  const mobileDarkBlock =
    css.match(
      /@media \(max-width:\s*768px\)[\s\S]*?:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\[data-contrast="hc"\]\) \.service-map-workspace\s*\{([\s\S]*?)\n  \}/
    )?.[1] || "";
  const mobileNightBlock =
    css.match(
      /@media \(max-width:\s*768px\)[\s\S]*?:root\.theme-night \.service-map-workspace\s*\{([\s\S]*?)\n  \}/
    )?.[1] || "";

  assert.match(
    rootBlock,
    /--service-map-panel-glass-bg:\s*var\(\s*--glass-ring-surface-bg,\s*var\(\s*--glass-surface-bg/
  );
  assert.match(rootBlock, /--service-map-panel-glass-overlay-bg:\s*transparent/);
  assert.match(filtersShell, /background:\s*var\(--service-map-panel-glass-bg\)/);
  assert.match(rootBlock, /--service-map-panel-shadow:\s*var\(--service-map-glass-shadow\)/);
  assert.doesNotMatch(rootBlock, /--service-map-panel-edge-stroke/);
  assert.doesNotMatch(mobileDarkBlock, /--service-map-panel-glass-bg/);
  assert.doesNotMatch(mobileDarkBlock, /--service-map-panel-glass-overlay-bg/);
  assert.doesNotMatch(mobileNightBlock, /--service-map-panel-glass-bg/);
  assert.doesNotMatch(mobileNightBlock, /--service-map-panel-glass-overlay-bg/);
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?html\[data-contrast="hc"\] \.service-map-workspace[\s\S]*?--service-map-panel-glass-bg:\s*#000/
  );
});
