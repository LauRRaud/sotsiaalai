import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mono theme is wired through globals, layout and accessibility provider", () => {
  const globals = read("app/styles/globals.css");
  const layout = read("app/layout.js");
  const provider = read("components/accessibility/AccessibilityProvider.jsx");

  assert.match(globals, /@import url\("\.\/theme\/mono\.css"\);/);
  assert.match(layout, /rawTheme === "mono"/);
  assert.match(layout, /const initialTheme = initialA11yPrefs\?\.theme \|\| "mono";/);
  assert.match(layout, /data-theme-mode=\{initialTheme\}/);
  assert.match(layout, /initialTheme === "mono" \? "theme-mono"/);
  assert.match(provider, /theme:\s*"mono"/);
  assert.match(provider, /html\.setAttribute\("data-theme-mode", forceDark \? "dark" : theme\);/);
  assert.match(provider, /const attrTheme = html\.getAttribute\("data-theme-mode"\);/);
  assert.match(provider, /let theme = resolveThemeFromDom\(html\) \|\| DEFAULT_PREFS\.theme;/);
  assert.match(provider, /theme === "mono"/);
  assert.match(provider, /html\.classList\.toggle\("theme-mono", shouldBeMono\)/);
});

test("profile orbital theme switch includes mono before high contrast", () => {
  const profile = read("components/alalehed/ProfiilBody.jsx");

  assert.match(profile, /const modeSequence = \["light", "mid", "dark", "night", "mono", "hc"\]/);
  assert.match(profile, /function ThemeMonoDockIcon/);
  assert.match(profile, /nextMode === "mono"[\s\S]*?<ThemeMonoDockIcon/);
});

test("mono theme renders black and gray glass, icons, controls and home/about tokens", () => {
  const mono = read("app/styles/theme/mono.css");
  const orbital = read("components/effects/Components/OrbitalMenu/OrbitalMenu.css");
  const infoButton = read("components/ui/PageInfoButton.module.css");
  const leftRail = read("components/chat/LeftRail.module.css");
  const rightRail = read("components/chat/RightRail.module.css");
  const workspacePanel = read("components/chat/WorkspacePanel.module.css");
  const darkTheme = read("app/styles/theme/dark.css");
  const documentsMode = read("app/styles/components/documents-mode.css");
  const serviceMap = read("app/styles/components/service-map.css");
  const loginModal = read("components/LoginModal.jsx");
  const inviteModal = read("components/invite/InviteModal.jsx");

  assert.match(mono, /:root\.theme-mono/);
  assert.match(mono, /--forest-bg-top:\s*#2f2f2f/);
  assert.match(mono, /--forest-highlight:\s*#c8c8c8/);
  assert.match(mono, /--forest-title:\s*#c57171/);
  assert.match(mono, /--forest-icon:\s*rgba\(230,\s*230,\s*230/);
  assert.match(mono, /--glass-ring-surface-bg:\s*rgba\(20,\s*20,\s*20,\s*0\.62\)/);
  assert.match(mono, /--link-gold:\s*var\(--forest-title\)/);
  assert.doesNotMatch(mono, /#7A3A38|#1b3a2f|rgba\(238,\s*228,\s*222|rgba\(206,\s*221,\s*195/);
  assert.match(mono, /--home-panel-bg:\s*var\(--glass-ring-surface-bg\)/);
  assert.match(mono, /--home-card-mono-filter:\s*grayscale\(1\)\s*saturate\(0\)/);
  assert.match(mono, /--home-card-back-mono-filter:\s*grayscale\(1\)\s*saturate\(0\)/);
  assert.match(mono, /--home-card-circular-text-left:\s*rgba\(57,\s*57,\s*57,\s*0\.6\)/);
  assert.match(mono, /\.home-card-face-content::before\s*\{[\s\S]*?filter:\s*var\(--home-card-mono-filter\) !important;/);
  assert.match(mono, /\.centered-back-left, \.centered-back-right\)[\s\S]*?filter:\s*var\(--home-card-back-mono-filter\) !important;/);
  assert.match(mono, /\.left-card-primary \.desc-ring-left \.circular-text-line\s*\{[\s\S]*?color:\s*var\(--home-card-circular-text-left\) !important;/);
  assert.match(mono, /\.right-card-primary \.desc-ring-right \.circular-text-line\s*\{[\s\S]*?color:\s*var\(--home-card-circular-text-right\) !important;/);
  assert.match(mono, /\.centered-back-right h2\s*\{[\s\S]*?color:\s*var\(--home-card-back-title-right\) !important;/);
  assert.doesNotMatch(mono, /\.home-card-back-logo\s*\{[\s\S]*?filter:\s*grayscale\(1\)\s*saturate\(0\)/);
  assert.match(mono, /\.home-about-title\s*\{[\s\S]*?color:\s*var\(--forest-title\) !important;/);
  assert.match(mono, /\.home-before-links \.home-quick-link,[\s\S]*?\.home-before-links \.home-quick-link svg\s*\{[\s\S]*?color:\s*var\(--forest-title\) !important;/);
  assert.match(mono, /\.homepage-root :is\([\s\S]*?\.home-link,[\s\S]*?\.home-scroll-cue-link,[\s\S]*?\.home-before-contact-copy a[\s\S]*?\)\s*\{[\s\S]*?color:\s*var\(--forest-title\) !important;[\s\S]*?-webkit-text-fill-color:\s*var\(--forest-title\) !important;/);
  assert.match(mono, /\.home-before-links \.home-quick-label\s*\{[\s\S]*?color:\s*var\(--forest-highlight\) !important;[\s\S]*?-webkit-text-fill-color:\s*var\(--forest-highlight\) !important;/);
  assert.match(mono, /\.guide-policy-scroll a,[\s\S]*?\.guide-rich-link[\s\S]*?\)\s*\{[\s\S]*?color:\s*var\(--forest-title\) !important;[\s\S]*?-webkit-text-fill-color:\s*var\(--forest-title\) !important;/);
  assert.match(mono, /\.drawer-panel--chat-glass\s*\{[\s\S]*?--drawer-glass-bg:\s*var\(--glass-ring-surface-bg\)/);
  assert.match(mono, /\.drawer-panel--chat-glass \.drawer-title\s*\{[\s\S]*?color:\s*var\(--forest-title\) !important;/);
  assert.match(mono, /--mono-field-hole-bg:\s*transparent;/);
  assert.match(mono, /--mono-field-hole-border:\s*0 solid transparent;/);
  assert.match(mono, /--mono-field-hole-shadow:[\s\S]*?0 6px 16px rgba\(0,\s*0,\s*0,\s*0\.26\),[\s\S]*?0 18px 24px -18px rgba\(230,\s*230,\s*230,\s*0\.22\);/);
  assert.match(mono, /--mono-field-hole-shadow-hover:[\s\S]*?0 6px 16px rgba\(0,\s*0,\s*0,\s*0\.28\),[\s\S]*?0 18px 24px -18px rgba\(230,\s*230,\s*230,\s*0\.26\);/);
  assert.match(mono, /\.drawer-panel--chat-glass \.chat-sidebar-search-glow\.ui-glow-field\s*\{[\s\S]*?min-height:\s*3\.12rem;[\s\S]*?border-radius:\s*999px !important;/);
  assert.match(inviteModal, /"invite-glow-field ui-glow-field service-map-toolbar__glow-field "/);
  assert.match(inviteModal, /className=\{`\$\{inviteRefreshButtonClassName\} invite-primary-btn invite-refresh-btn`\}/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) :is\([\s\S]*?\.drawer-panel--chat-glass \.chat-sidebar-search-glow\.ui-glow-field,[\s\S]*?\.update-pin-content \.ui-glow-field,[\s\S]*?\.update-email-content \.ui-glow-field[\s\S]*?\)\s*\{[\s\S]*?--card-bg:\s*var\(--mono-field-hole-bg\) !important;[\s\S]*?background:\s*var\(--mono-field-hole-bg\) !important;[\s\S]*?box-shadow:\s*var\(--mono-field-hole-shadow\) !important;/);
  assert.doesNotMatch(mono, /data-glass-field-hole="invite"/);
  assert.doesNotMatch(mono, /data-glass-field-hole='invite'/);
  assert.doesNotMatch(mono, /:is\([\s\S]*?\.register-input\.ui-glow-field,[\s\S]*?\.drawer-panel--chat-glass \.chat-sidebar-search-glow\.ui-glow-field/);
  assert.match(mono, /\.ui-glow-option-card-frame\s*\{[\s\S]*?--seg-card-bg-hover:\s*var\(--seg-card-bg\) !important;[\s\S]*?--seg-card-shadow-hover:\s*var\(--seg-card-shadow\) !important;/);
  assert.match(mono, /\.ui-glow-option-card-frame:is\(:hover, :focus-visible, :focus-within, :active\):not\(\.ui-glow-option-card-frame--disabled\)\s*\{[\s\S]*?background:\s*var\(--seg-card-bg\) !important;[\s\S]*?box-shadow:\s*var\(--seg-card-shadow\) !important;/);
  assert.doesNotMatch(mono, /#login-modal :is\([\s\S]*?#otp-code-input[\s\S]*?#trusted-device-name/);
  assert.doesNotMatch(loginModal, /useGlassFieldHoleMask/);
  assert.doesNotMatch(loginModal, /glass-field-hole-surface/);
  assert.doesNotMatch(loginModal, /glass-hole-mask-layer/);
  assert.match(mono, /\.drawer-panel--chat-glass \.chat-sidebar-search-glow\.ui-glow-field::before,[\s\S]*?\.drawer-panel--chat-glass \.chat-sidebar-search-glow\.ui-glow-field > \.edgeLight\s*\{[\s\S]*?display:\s*block !important;[\s\S]*?opacity:\s*1 !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) :is\([\s\S]*?\.drawer-panel--chat-glass \.chat-sidebar-search-glow\.ui-glow-field[\s\S]*?\):is\(:hover, :focus-within\)\s*\{[\s\S]*?box-shadow:\s*var\(--mono-field-hole-shadow-hover\) !important;/);
  assert.match(mono, /\.drawer-panel--chat-glass \.chat-sidebar-search-input\s*\{[\s\S]*?min-height:\s*3\.12rem !important;[\s\S]*?background:\s*transparent !important;[\s\S]*?padding:\s*0\.74rem 1\.28rem !important;/);
  assert.match(mono, /--profile-logout-outer-stroke:\s*var\(--forest-title\)/);
  assert.match(mono, /--profile-logout-arrow-stroke:\s*var\(--forest-title\)/);
  assert.match(mono, /--profile-logout-label:\s*#c8c8c8/);
  assert.match(mono, /--forest-orbit-surface:/);
  assert.match(mono, /--forest-floating-surface:/);
  assert.match(mono, /--forest-tooltip-surface:/);
  assert.match(mono, /--chat-rail-tooltip-bg:\s*var\(--forest-tooltip-surface\)/);
  assert.doesNotMatch(mono, /--chat-rail-tooltip-bg:\s*var\(--forest-floating-surface\)/);
  assert.doesNotMatch(mono, /--chat-tools-panel-bg:\s*var\(--forest-floating-surface\)/);
  assert.match(mono, /--forest-input-surface:/);
  assert.match(mono, /--orbit-accent:\s*#c57171/);
  assert.match(mono, /\.profile-orbit-menu__center\.dock-item\s*\{[\s\S]*?color:\s*var\(--orbit-accent,\s*#c57171\)/);
  assert.match(mono, /--btn-primary-bg:\s*var\(--forest-orbit-surface\)/);
  assert.match(mono, /--btn-primary-text-hover:\s*var\(--forest-title-soft\)/);
  assert.match(mono, /--seg-card-text-hover:\s*var\(--forest-title-soft\)/);
  assert.match(mono, /--seg-card-text-selected:\s*var\(--forest-title-soft\)/);
  assert.match(mono, /--form-surface:\s*var\(--forest-input-surface\)/);
  assert.match(mono, /--input-bg:\s*var\(--form-surface\)/);
  assert.match(mono, /--chat-icon-dark:\s*var\(--forest-title\)/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) button:has\(\.back-icon-arrow\)[\s\S]*?--back-arrow-color:\s*var\(--forest-title\)/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) button:has\(\.back-icon-arrow\)[\s\S]*?--back-dot-color:\s*var\(--forest-title\)/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.chat-rail-icon-btn \.back-icon-dot \{[\s\S]*?fill:\s*var\(--forest-title\) !important;/);
  assert.match(mono, /--chat-tools-panel-bg:\s*var\(--forest-tooltip-surface\)/);
  assert.match(mono, /--chat-tools-item-hover-bg:\s*var\(--forest-tooltip-surface-hover\)/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.chat-tools-menu \{[\s\S]*?background:\s*var\(--forest-tooltip-surface\)/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.chat-tools-surface-popover\s*\{[\s\S]*?background:\s*var\(--forest-tooltip-surface\) !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) #login-modal \.login-help-popover\s*\{[\s\S]*?background:\s*var\(--forest-tooltip-surface\) !important;[\s\S]*?color:\s*var\(--forest-highlight\) !important;/);
  assert.match(mono, /--forest-tooltip-surface:\s*[\s\S]*?linear-gradient\(180deg,\s*rgb\(48,\s*48,\s*48\)/);
  assert.match(mono, /--forest-tooltip-surface-hover:\s*[\s\S]*?rgb\(46,\s*46,\s*46\)/);
  assert.match(darkTheme, /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\.theme-mono\):not\(\[data-contrast="hc"\]\)[\s\S]*?\.chat-tools-menu/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.chat-tools-menu \.chat-tools-item\s*\{[\s\S]*?color:\s*var\(--forest-highlight\) !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.chat-tools-menu \.chat-tools-item :is\(svg, path, circle, rect, line, polyline, polygon\)\s*\{[\s\S]*?stroke:\s*var\(--forest-title\) !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) body \.chat-inputbar \.chat-send-btn[\s\S]*?--btn-primary-bg:\s*var\(--forest-orbit-surface\) !important/);
  assert.match(mono, /--home-title-color:\s*var\(--forest-title\)/);
  assert.match(mono, /--home-scroll-cue-color:\s*var\(--forest-title\)/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) :is\(\.button, \.btn, \.invite-primary-btn[\s\S]*?background:\s*var\(--btn-primary-bg\) !important/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) :is\(\.button, \.btn, \.invite-primary-btn[\s\S]*?:is\(:hover, :focus-visible\) \{[\s\S]*?color:\s*var\(--btn-primary-text-hover,\s*var\(--forest-title-soft\)\) !important/);
  assert.match(darkTheme, /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\.theme-mono\):not\(\[data-contrast="hc"\]\)[\s\S]*?:is\(\.invite-refresh-btn, \.materials-surface-button\)/);
  assert.match(darkTheme, /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\.theme-mono\) \.materials-page-shell/);
  assert.match(documentsMode, /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\.theme-mono\):not\(\[data-contrast="hc"\]\) \.documents-workspace-page--library/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.materials-page-shell\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--forest-input-surface\) !important;[\s\S]*?--input-bg:\s*var\(--forest-input-surface\) !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.workspace-dashboard-panel \.materials-page-body\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--forest-input-surface\) !important;[\s\S]*?--input-bg:\s*var\(--forest-input-surface\) !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.workspace-dashboard-panel \.materials-page-body :is\([\s\S]*?\.materials-comment-glow-field\.ui-glow-field,[\s\S]*?\.materials-comment-box,[\s\S]*?\.materials-comment-glow-field \.ui-glow-control[\s\S]*?\)\s*\{[\s\S]*?background:\s*var\(--forest-input-surface\) !important;[\s\S]*?background-image:\s*var\(--forest-input-surface\) !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.documents-workspace\s*\{[\s\S]*?--documents-dropdown-bg:\s*var\(--forest-tooltip-surface\);[\s\S]*?--documents-dropdown-item-bg:\s*rgb\(28,\s*28,\s*28\);/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) :is\(\.documents-workspace \.documents-dropdown-menu,[\s\S]*?background-color:\s*rgb\(28,\s*28,\s*28\) !important;[\s\S]*?opacity:\s*1 !important;/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.workspace-feature-dropdown:not\(\.pre-inquiry-dropdown\) \.documents-dropdown-menu\s*\{[\s\S]*?background-color:\s*rgb\(28,\s*28,\s*28\) !important;[\s\S]*?opacity:\s*1 !important;/);
  assert.match(serviceMap, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.pre-inquiry-dropdown/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.workspace-feature-panel[\s\S]*?--workspace-feature-accent:\s*var\(--forest-title\)/);
  assert.match(mono, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.drawer-panel--chat-glass :is\(\.drawer-close-btn--chat, \.drawer-close-btn--chat > span\)\s*\{[\s\S]*?color:\s*var\(--forest-title\) !important;/);
  assert.match(infoButton, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.trigger \{[\s\S]*?--page-info-ring-color:\s*var\(--forest-title,\s*#c57171\);[\s\S]*?--page-info-dot-color:\s*var\(--forest-title,\s*#c57171\);/);
  assert.match(infoButton, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.closeButton \{[\s\S]*?color:\s*var\(--forest-title,\s*#c57171\);/);
  assert.match(leftRail, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.tooltip \{[\s\S]*?color:\s*var\(--forest-highlight,\s*#c8c8c8\);[\s\S]*?background:\s*linear-gradient\(180deg,\s*rgb\(48,\s*48,\s*48\)/);
  assert.match(rightRail, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.tooltip \{[\s\S]*?color:\s*var\(--forest-highlight,\s*#c8c8c8\);[\s\S]*?background:\s*linear-gradient\(180deg,\s*rgb\(48,\s*48,\s*48\)/);
  assert.match(workspacePanel, /:global\(:root\.theme-mono\) \.cardIcon\s*\{[\s\S]*?color:\s*var\(--forest-title,\s*#c57171\);/);
  assert.match(workspacePanel, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.card\s*\{[\s\S]*?--border-glow-enter-duration:\s*1\.05s;[\s\S]*?--border-glow-exit-duration:\s*1\.35s;[\s\S]*?--glow-color:\s*rgba\(230,\s*230,\s*230,\s*0\.46\) !important;[\s\S]*?--glow-color-10:\s*rgba\(230,\s*230,\s*230,\s*0\.055\) !important;/);
  assert.match(workspacePanel, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.card\s*\{[\s\S]*?box-shadow 720ms cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/);
  assert.match(workspacePanel, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.card::after\s*\{[\s\S]*?rgba\(245,\s*245,\s*245,\s*0\.58\)[\s\S]*?0 0 15px rgba\(230,\s*230,\s*230,\s*0\.1\)/);
  assert.match(workspacePanel, /:global\(:root\.theme-mono:not\(\[data-contrast="hc"\]\)\) \.card > :global\(\[class\*="edgeLight"\]\)::before\s*\{[\s\S]*?0 0 16px 1px rgba\(230,\s*230,\s*230,\s*0\.13\)/);
  assert.match(workspacePanel, /:global\(:root\.theme-mono\) \.cardTitle\s*\{[\s\S]*?color:\s*var\(--forest-highlight,\s*#c8c8c8\);/);
  assert.match(orbital, /:root\.theme-mono[\s\S]*?var\(--forest-highlight,\s*#c8c8c8\)/);
  assert.match(orbital, /:root\.theme-mono:not\(\[data-contrast="hc"\]\)[\s\S]*?\.profile-orbit-menu__center\.dock-item\s*\{[\s\S]*?color:\s*var\(--orbit-accent,\s*#c57171\)/);
  assert.match(orbital, /:root\.theme-mono:not\(\[data-contrast="hc"\]\)[\s\S]*?\.profile-orbit-item-label[\s\S]*?color:\s*var\(--forest-highlight,\s*#c8c8c8\) !important;/);
  assert.match(orbital, /:root\.theme-mono:not\(\[data-contrast="hc"\]\)[\s\S]*?\.profile-orbit-item-icon[\s\S]*?color:\s*var\(--forest-title,\s*#c57171\) !important;/);
  assert.match(orbital, /var\(--forest-orbit-surface/);
  assert.match(loginModal, /const isMonoTheme = prefs\?\.theme === "mono";/);
  assert.match(loginModal, /isMonoTheme[\s\S]*?var\(--forest-orbit-surface/);
  assert.match(loginModal, /isMonoTheme[\s\S]*?0 5px 12px rgba\(7,\s*7,\s*7,\s*0\.26\), inset 0 0 0 1px rgba\(214,\s*214,\s*214,\s*0\.13\)/);
  assert.match(loginModal, /isNightTheme[\s\S]*?0 5px 12px rgba\(4,\s*9,\s*18,\s*0\.22\), inset 0 0 0 1px rgba\(198,\s*222,\s*255,\s*0\.12\)/);
  assert.match(loginModal, /isMidTheme[\s\S]*?0 5px 10px rgba\(42,\s*23,\s*20,\s*0\.12\), inset 0 0 0 1px rgba\(255,\s*255,\s*255,\s*0\.16\)/);
  assert.match(loginModal, /const pinGlossOpacityBase = isLightTheme \? isMidTheme \? "0\.075"/);
  assert.match(loginModal, /const pinGlossOpacityButton = isLightTheme \? isMidTheme \? "0\.06"/);
  assert.match(loginModal, /const pinKeyOutline = "transparent";/);
  assert.match(loginModal, /const pinKeyRimTop = "transparent";/);
  assert.match(loginModal, /const pinKeyRimBottom = "transparent";/);
  assert.match(loginModal, /"--otp-copy-text": isMidTheme[\s\S]*?isMonoTheme[\s\S]*?var\(--forest-highlight,\s*#c8c8c8\)/);
  assert.match(loginModal, /"--otp-panel-bg": "var\(--glass-ring-surface-bg,\s*rgba\(20,\s*20,\s*20,\s*0\.62\)\)"/);
});

test("mono background uses grayscale color bends with stronger opacity", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");

  assert.doesNotMatch(backgroundLayer, /effectiveTheme === "mono"[\s\S]*?\["#eee4de"\]/);
  assert.doesNotMatch(backgroundLayer, /effectiveTheme === "mono"[\s\S]*?\["#5a3438"\]/);
  assert.match(backgroundLayer, /effectiveTheme === "mono"[\s\S]*?\["#3d3d3d"\]/);
  assert.doesNotMatch(backgroundLayer, /effectiveTheme === "mono"[\s\S]*?\?\s*0\.56/);
  assert.match(backgroundLayer, /const COLOR_BENDS_OPACITY_MONO = 0\.78;/);
  assert.match(backgroundLayer, /effectiveTheme === "mono"\s*\?\s*COLOR_BENDS_OPACITY_MONO/);
});

test("mono theme labels are available in all locales", () => {
  const expectedLabels = new Map([
    ["et", "Mono"],
    ["en", "Mono"],
    ["ru", "Mono"]
  ]);

  for (const locale of ["et", "en", "ru"]) {
    const messages = JSON.parse(read(`messages/${locale}.json`));
    assert.equal(messages.profile.theme_mode.mono, expectedLabels.get(locale));
    assert.equal(messages.accessibility.options.theme.mono, expectedLabels.get(locale));
  }
});
