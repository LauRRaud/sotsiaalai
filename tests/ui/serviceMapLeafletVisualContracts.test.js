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

test("service map Leaflet groups entries that share one coordinate", () => {
  const css = read("app/styles/components/service-map.css");
  const leafletSource = read("components/workspace/ServiceMapLeaflet.jsx");

  assert.match(leafletSource, /function groupedEntriesByCoordinates/);
  assert.match(leafletSource, /markerGroupRefs/);
  assert.match(leafletSource, /createGroupedPopupContent/);
  assert.match(leafletSource, /service-map-popup--group/);
  assert.match(leafletSource, /group\.entries\.length > 99 \? "99\+"/);
  assert.match(css, /\.service-map-leaflet__marker--group\s*\{/);
  assert.match(css, /\.service-map-popup__contacts\s*\{[\s\S]*?overflow-y:\s*auto/);
  assert.match(css, /\.service-map-popup__contacts\s*\{[\s\S]*?max-height:\s*min\(11rem,\s*calc\(100vh - 18\.5rem\)\)/);
  assert.match(css, /\.service-map-popup__contacts\s*\{[\s\S]*?scrollbar-gutter:\s*stable both-edges/);
  assert.match(leafletSource, /offset:\s*\[0,\s*-18\]/);
});

test("service map popup glass is applied on the wrapper immediately", () => {
  const css = read("app/styles/components/service-map.css");
  const leafletSource = read("components/workspace/ServiceMapLeaflet.jsx");
  const workspaceSource = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(css, /--service-map-popup-glass-bg:\s*var\(\s*--workspace-feature-surface-strong,/);
  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background-color:[\s\S]*?var\(--opaque-panel-bg,[\s\S]*?var\(--workspace-feature-surface-strong,[\s\S]*?#111827[\s\S]*?\)\)\s*!important[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.match(css, /:root\.theme-light:not\(\.theme-mid\) \.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background-color:\s*rgb\(255,\s*255,\s*255\)\s*!important/);
  assert.match(css, /:root\.theme-mid \.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background-color:\s*rgb\(242,\s*232,\s*228\)\s*!important/);
  assert.match(css, /:root:not\(\.theme-light\):not\(\.theme-mid\) \.service-map-leaflet__popup \.leaflet-popup-content-wrapper,[\s\S]*?background-color:\s*rgb\(17,\s*24,\s*39\)\s*!important/);
  assert.doesNotMatch(css, /theme-mid[\s\S]{0,120}rgba\(242,\s*232,\s*228,\s*0\./);
  assert.match(
    css,
    /\.service-map-leaflet\.leaflet-fade-anim \.service-map-leaflet__popup\.leaflet-popup\s*\{[\s\S]*?opacity:\s*1\s*!important[\s\S]*?transition:\s*none\s*!important/
  );
  assert.match(
    leafletSource,
    /mapRef\.current\.closePopup\?\.\(\);\s*markerLayerRef\.current\.clearLayers\(\);/
  );
  assert.match(leafletSource, /fadeAnimation:\s*false/);
  assert.match(leafletSource, /function groupForEntryId/);
  assert.match(
    leafletSource,
    /if \(!selectedEntryId\) \{\s*mapRef\.current\.closePopup\?\.\(\);\s*return;\s*\}/
  );
  assert.match(
    leafletSource,
    /selectedMarker\.isPopupOpen\?\.\(\)[\s\S]*?selectedMarker\.setPopupContent\(createGroupedPopupContent/
  );
  assert.match(
    leafletSource,
    /popupOpenFrameRef\.current = window\.requestAnimationFrame\(\(\) => \{[\s\S]*?mapRef\.current\?\.closePopup\?\.\(\);[\s\S]*?selectedMarker\.openPopup\(\);/
  );
  assert.match(
    workspaceSource,
    /const handleEntryTypeChange = useCallback\(\(event\) => \{\s*setSelectedEntryId\(""\);\s*setEntryType\(event\.target\.value\);/
  );
  assert.match(
    workspaceSource,
    /style=\{\{\s*backdropFilter:\s*"blur\(var\(--service-map-glass-blur\)\) saturate\(160%\)",\s*WebkitBackdropFilter:\s*"blur\(var\(--service-map-glass-blur\)\) saturate\(160%\)"/
  );
});

test("service map close button and toolbar controls keep the intended brand/control surfaces", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-close-button\s*\{[\s\S]*?color:\s*var\(--workspace-feature-accent,\s*var\(--title-color,\s*#c57171\)\)\s*!important/
  );
  assert.match(css, /--service-map-control-glass-bg:\s*var\(\s*--subpage-card-bg,/);
  assert.match(
    css,
    /\.service-map-workspace__filters:not\(\.service-map-workspace__filters--collapsed\) \.service-map-workspace__toggle\s*\{[\s\S]*?var\(--service-map-control-glass-bg\)/
  );
});

test("service map toolbar controls inherit shared glow and option-card interaction contracts", () => {
  const css = read("app/styles/components/service-map.css");
  const glassCss = read("app/styles/components/glass.css");
  const typeCardBlock = cssBlock(css, ".service-map-toolbar__type-card");

  assert.match(css, /--service-map-control-shadow:\s*var\(--btn-primary-shadow\)/);
  assert.match(css, /--service-map-control-shadow-hover:\s*var\(--btn-primary-shadow-hover\)/);
  assert.match(
    glassCss,
    /:root\.theme-light \.ui-glow-field > \[class\*="edgeLight"\],[\s\S]*?:root\.theme-mid \.ui-glow-field > \[class\*="edgeLight"\]\s*\{[\s\S]*?display:\s*block\s*!important/
  );
  assert.match(
    glassCss,
    /:root\.theme-light \.ui-glow-option-card-frame > \[class\*="edgeLight"\],[\s\S]*?:root\.theme-mid \.ui-glow-option-card-frame > \[class\*="edgeLight"\]\s*\{[\s\S]*?display:\s*block\s*!important/
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
  assert.doesNotMatch(typeCardBlock, /background:/);
  assert.doesNotMatch(typeCardBlock, /box-shadow:/);
  assert.doesNotMatch(typeCardBlock, /transition:/);
  assert.doesNotMatch(css, /\.service-map-toolbar__type-card:hover,[\s\S]*?background:/);
  assert.doesNotMatch(css, /:root\.theme-mid \.service-map-toolbar__glow-field\.ui-glow-field:hover/);
  assert.doesNotMatch(css, /:root\.theme-light \.service-map-toolbar__glow-field\.ui-glow-field[\s\S]*?box-shadow:\s*var\(--service-map-control-shadow\)\s*!important/);
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
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__back\s*\{[\s\S]*?top:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ 0\.53rem\)\s*!important[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.37rem\)\s*!important[\s\S]*?display:\s*flex\s*!important/
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
    /<GlassSubpageHeader[\s\S]*?onBack=\{handleWorkspaceBack\}[\s\S]*?backAriaLabel=\{text\(t,\s*"buttons\.back_previous",\s*"Tagasi"\)\}/
  );
  assert.match(source, /backClassName=\{styles\.backButton\}/);
  assert.match(css, /^\.backButton\s*\{[\s\S]*?left:\s*0\.55rem\s*!important;[\s\S]*?top:\s*0\.05rem\s*!important;/m);
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.backButton\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem - 1rem\)\s*!important;[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\) \+ 0\.2rem -[\s\S]*?var\(--chat-pad-top,\s*1rem\)[\s\S]*?\)\s*!important;/
  );
  assert.doesNotMatch(source, /glassPageBackTopLeftClassName/);
});

test("service map multi-line mobile toolbar stays compact and gives provider tab enough width", () => {
  const css = read("app/styles/components/service-map.css");
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell--toolbar-feedback\s*\{[\s\S]*?gap:\s*0\.5rem[\s\S]*?padding-bottom:\s*0\.46rem/
  );
  assert.match(
    css,
    /\.service-map-toolbar__types\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.5fr\) minmax\(0,\s*1\.18fr\) minmax\(0,\s*0\.58fr\)/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__body\s*\{[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/
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
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-toolbar__type-card\s*\{[\s\S]*?font-size:\s*0\.74rem/
  );
  assert.match(
    css,
    /\.service-map-toolbar__results\s*\{[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(10\.5rem,\s*1fr\)\)[\s\S]*?padding:\s*0\.12rem 0\.24rem 0\.32rem/
  );
  assert.match(source, /const SERVICE_MAP_RESULT_BUTTON_LIMIT = 56;/);
  assert.match(source, /filteredEntries\.slice\(0,\s*SERVICE_MAP_RESULT_BUTTON_LIMIT\)\.map/);
  assert.doesNotMatch(
    source,
    /name="service-map-entry-type"[\s\S]*?fitTextLines/
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

test("service map mobile route keeps the glass page panel, removes particles, and lets the map fill the panel", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const css = read("app/styles/components/service-map.css");
  const colorBendsExcludedPaths = backgroundLayer.match(
    /const COLOR_BENDS_EXCLUDED_PATHS = new Set\(\[([\s\S]*?)\]\);/
  )?.[1] || "";

  assert.doesNotMatch(
    colorBendsExcludedPaths,
    /["']\/teenusekaart["']/
  );
  assert.match(
    backgroundLayer,
    /PARTICLES_EXCLUDED_PATHS[\s\S]*?["']\/teenusekaart["']/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-page-panel\.service-map-page-panel\s*\{[\s\S]*?inset:\s*0\s*!important[\s\S]*?border-radius:\s*0[\s\S]*?background:\s*var\(--mobile-common-glass-surface-bg,[\s\S]*?\)\s*!important[\s\S]*?backdrop-filter:\s*blur\(var\(--glass-blur-radius,\s*1rem\)\)\s*!important/
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
    /\.service-map-toolbar__resultsblock\s*\{[\s\S]*?min-height:\s*var\(--service-map-results-row-height\)/
  );
  assert.match(
    css,
    /\.service-map-toolbar__resultsblock:empty\s*\{[\s\S]*?display:\s*none/
  );
  assert.match(
    css,
    /\.service-map-toolbar__resultsblock\s*\{[\s\S]*?transform:\s*none/
  );
  assert.match(
    css,
    /\.service-map-toolbar__results\s*\{[\s\S]*?height:\s*auto[\s\S]*?max-height:\s*min\(10\.4rem,[\s\S]*?padding:\s*0\.12rem 0\.24rem 0\.32rem/
  );
  assert.match(
    css,
    /\.service-map-workspace--toolbar-feedback \.service-map-workspace__filters-shell\s*\{[\s\S]*?padding-bottom:\s*0\.38rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell--toolbar-feedback\s*\{[\s\S]*?padding-bottom:\s*0\.46rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__results\s*\{[\s\S]*?padding:\s*0\.08rem 0\.12rem 0\.12rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__results\s*\{[\s\S]*?height:\s*auto[\s\S]*?max-height:\s*none[\s\S]*?overflow-x:\s*visible[\s\S]*?overflow-y:\s*visible/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__results \.workspace-feature-list-card\s*\{[\s\S]*?max-height:\s*none/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell\s*\{[\s\S]*?max-height:\s*calc\(100dvh - env\(safe-area-inset-top,\s*0px\) - env\(safe-area-inset-bottom,\s*0px\) - 1\.12rem\)/
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-workspace__filters-shell--toolbar-feedback\s*\{[\s\S]*?padding-bottom:\s*0\.48rem/
  );
  assert.match(source, /const workspaceRef = useRef\(null\);/);
  assert.match(source, /const filtersShellRef = useRef\(null\);/);
  assert.match(source, /const hasResultFilter = Boolean\(keyword\.trim\(\) \|\| region\.trim\(\)\);/);
  assert.match(source, /entry\.address/);
  assert.match(source, /entry\.providerProfile\?\.serviceAreas/);
  assert.match(source, /const showResults = !loading && !error && hasResultFilter && filteredEntries\.length > 0;/);
  assert.doesNotMatch(source, /hasToolbarFeedback/);
  assert.match(source, /"service-map-workspace--toolbar-feedback"/);
  assert.match(source, /"service-map-workspace__filters-shell--toolbar-feedback"/);
  assert.doesNotMatch(
    source,
    /<div className="service-map-toolbar__resultsblock">[\s\S]*?loading \|\| error/
  );
  assert.match(
    source,
    /\{error \? \(\s*<div className="service-map-workspace__status" role="status" aria-live="polite">/
  );
  assert.match(source, /new ResizeObserver\(syncPanelHeight\)/);
  assert.match(css, /--service-map-panel-height:\s*7\.83rem/);
  assert.match(css, /--service-map-map-panel-gap:\s*0\.6rem/);
  assert.match(css, /--service-map-map-top:\s*calc\(var\(--service-map-panel-top\) \+ var\(--service-map-panel-height\) \+ var\(--service-map-map-panel-gap\)\)/);
  assert.match(css, /--service-map-map-max-height:\s*48rem/);
  assert.match(css, /\.service-map-workspace__map\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 4rem\),\s*100rem\)/);
  assert.match(css, /\.service-map-workspace__filters\s*\{[\s\S]*?width:\s*fit-content/);
  assert.match(css, /\.service-map-workspace__filters-shell\s*\{[\s\S]*?width:\s*auto/);
  assert.match(css, /\.service-map-toolbar__content\s*\{[\s\S]*?width:\s*100%/);
  assert.match(css, /\.service-map-toolbar__results\s*\{[\s\S]*?justify-content:\s*center[\s\S]*?overflow-x:\s*hidden[\s\S]*?overflow-y:\s*auto/);
});

test("service map popup and desktop one-line toolbar preserve glass and back alignment", () => {
  const css = read("app/styles/components/service-map.css");
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    css,
    /--service-map-popup-glass-bg:\s*var\(\s*--workspace-feature-surface-strong,/
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
    /\.service-map-workspace--toolbar-feedback \.service-map-workspace__filters-shell\s*\{[\s\S]*?align-items:\s*flex-start/
  );
  assert.match(
    css,
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-workspace--toolbar-feedback \.service-map-toolbar__identity\s*\{[\s\S]*?position:\s*relative[\s\S]*?top:\s*auto[\s\S]*?left:\s*auto/
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
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-toolbar__body\s*\{[\s\S]*?display:\s*flex[\s\S]*?flex-wrap:\s*nowrap[\s\S]*?justify-content:\s*center/
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
    /\.service-map-workspace--toolbar-feedback \.service-map-toolbar__back\s*\{[\s\S]*?margin-top:\s*-0\.34rem/
  );
  assert.doesNotMatch(source, /hasToolbarFeedback/);
  assert.match(source, /"service-map-workspace--toolbar-feedback"/);
  assert.doesNotMatch(
    css,
    /:root\.theme-light:not\(\.theme-mid\) \.service-map-toolbar__type-card\.ui-glow-option-card-frame,[\s\S]*?:root\.theme-mid \.service-map-toolbar__type-card\.ui-glow-option-card-frame\s*\{[\s\S]*?border:/
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
  assert.match(filtersShell, /background:\s*[\s\S]*?var\(--glass-ring-sheen,\s*none\)/);
  assert.match(filtersShell, /background:\s*[\s\S]*?var\(--service-map-panel-glass-bg\)/);
  assert.match(filtersShell, /box-shadow:\s*var\(--service-map-panel-shadow\)\s*!important/);
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell\s*\{[\s\S]*?backdrop-filter:\s*blur\(var\(--service-map-glass-blur\)\) saturate\(160%\)\s*!important/
  );
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

  assert.match(
    rootBlock,
    /--service-map-glass-bg:\s*var\(\s*--glass-ring-surface-bg,\s*var\(\s*--glass-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\s*\)\s*\)/
  );
  assert.match(
    rootBlock,
    /--service-map-panel-glass-bg:\s*var\(\s*--service-map-glass-bg\s*\)/
  );
  assert.match(rootBlock, /--service-map-panel-glass-overlay-bg:\s*transparent/);
  assert.match(
    rootBlock,
    /--service-map-glass-blur:\s*var\(--glass-modal-blur,\s*var\(--glass-blur-radius,\s*1rem\)\)/
  );
  assert.match(filtersShell, /background:\s*[\s\S]*?var\(--service-map-panel-glass-bg\)/);
  assert.match(rootBlock, /--service-map-panel-shadow:\s*var\(--service-map-glass-shadow\)/);
  assert.doesNotMatch(rootBlock, /--service-map-panel-edge-stroke/);
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?html\[data-contrast="hc"\] \.service-map-workspace[\s\S]*?--service-map-panel-glass-bg:\s*#000/
  );
});
