# Effective CSS audit — 2026-06-13

Crawled 12 routes × 6 themes × 4 viewports against http://localhost:3000.
Universe: 3242 rule-selectors. States pass: on.

> Candidates, NOT a delete list. Verify each through the snapshot gate.
> JS-mounted states (modals, empty/error views, [data-state]) and reserved/
> test-guarded CSS will appear here — they are not dead. `✓` = also flagged by
> the static css:audit (class not a token in source) = highest confidence.

## Dead — element never renders — 2911
_Base selector matched zero elements on any page/theme/viewport._

- ✓ `app\styles\features\documents\ui.css:264` — `.documents-dropdown--align-start .documents-dropdown-menu`
- ✓ `app\styles\features\documents\ui.css:269` — `.documents-dropdown--align-end .documents-dropdown-menu`
- ✓ `app\styles\features\documents\ui.css:274` — `.documents-dropdown--open-up .documents-dropdown-menu`
-   `app\styles\base\animations.css:79` — `.pin-keypad__button--bounce`
-   `app\styles\base\animations.css:87` — `.pin-keypad__button--bounce` _(@media (prefers-reduced-motion: reduce))_
-   `app\styles\base\backgrounds.css:29` — `.space-backdrop[data-mode="light"]`
-   `app\styles\base\backgrounds.css:91` — `[data-bg-layer][data-mobile-bends="pending"] .bg-bends-layer`
-   `app\styles\base\backgrounds.css:146` — `[data-bg-layer][data-parallax="on"] .bg-space-layer`
-   `app\styles\base\backgrounds.css:149` — `[data-bg-layer][data-parallax="on"] .bg-bends-layer`
-   `app\styles\base\backgrounds.css:153` — `[data-bg-layer][data-parallax="on"][data-mobile-bends="pending"] .bg-bends-layer`
-   `app\styles\base\backgrounds.css:157` — `[data-bg-layer][data-parallax="on"] .bg-particles-layer`
-   `app\styles\base\backgrounds.css:160` — `[data-bg-layer][data-particles-parallax="on"] .bg-particles-layer`
-   `app\styles\base\backgrounds.css:180` — `html[data-theme-switching="1"] [data-bg-layer] .bg-bends-layer`
-   `app\styles\base\core.css:94` — `.splash-cursor`
-   `app\styles\base\core.css:102` — `.click-pulse-cursor`
-   `app\styles\base\core.css:118` — `.click-pulse-cursor.is-active`
-   `app\styles\base\core.css:125` — `html[data-ui-scale="mac"] .click-pulse-cursor` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:125` — `html[data-ui-scale="lg"] .click-pulse-cursor` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:131` — `html[data-ui-scale="mac"] .home-scroll-cue .home-scroll-cue-mouse` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:131` — `html[data-ui-scale="lg"] .home-scroll-cue .home-scroll-cue-mouse` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:137` — `html[data-ui-scale="mac"] .home-scroll-cue .home-scroll-cue-arrow` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:142` — `html[data-ui-scale="lg"] .home-scroll-cue .home-scroll-cue-arrow` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:147` — `html[data-ui-scale="mac"] .home-scroll-cue .home-scroll-cue-arrow svg` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:152` — `html[data-ui-scale="lg"] .home-scroll-cue .home-scroll-cue-arrow svg` _(@media (min-width: 769px))_
-   `app\styles\base\core.css:226` — `.click-pulse-cursor` _(@media (prefers-reduced-motion: reduce))_
-   `app\styles\base\core.css:232` — `.click-pulse-cursor` _(@media (hover: none), (pointer: coarse))_
-   `app\styles\base\core.css:237` — `html[data-reduce-transparency="1"]`
-   `app\styles\base\core.css:242` — `html[data-reduce-transparency="1"].theme-light`
-   `app\styles\base\core.css:249` — `html[data-reduce-transparency="1"].theme-mid`
-   `app\styles\base\core.css:256` — `html[data-reduce-transparency="1"]:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"])`
-   `app\styles\base\core.css:263` — `html[data-reduce-transparency="1"].theme-night`
-   `app\styles\base\core.css:270` — `html[data-reduce-transparency="1"][data-contrast="hc"]`
-   `app\styles\base\core.css:277` — `html[data-reduce-transparency="1"] :is(
    [class*="backdrop-blur-"],
    [class*="backdrop-filter:blur("],
    [class*="-webkit-backdrop-filter:blur("],
    .glass-box,
    .glass-ring,
    .chat-mask-layer,
    .profile-mask-layer
  )`
-   `app\styles\base\core.css:290` — `html[data-reduce-transparency="1"] :is(.glass-box, .glass-ring, .chat-mask-layer, .profile-mask-layer)::before`
-   `app\styles\base\core.css:290` — `html[data-reduce-transparency="1"] :is(.glass-box, .glass-ring, .chat-mask-layer, .profile-mask-layer)::after`
-   `app\styles\base\layout.css:1` — `html.modal-open`
-   `app\styles\base\layout.css:1` — `body.modal-open`
-   `app\styles\base\layout.css:6` — `html.chat-analysis-scroll-open`
-   `app\styles\base\layout.css:6` — `body.chat-analysis-scroll-open`
-   `app\styles\base\layout.css:11` — `html.framework-page-scroll-lock`
-   `app\styles\base\layout.css:11` — `body.framework-page-scroll-lock`
-   `app\styles\base\layout.css:17` — `html.modal-open`
-   `app\styles\base\layout.css:26` — `main#main > .main-content.glass-box`
-   `app\styles\base\layout.css:30` — `.main-content`
-   `app\styles\base\layout.css:37` — `.home-footer-logo-base path:last-of-type`
-   `app\styles\base\layout.css:40` — `.home-footer-metallic-ai`
-   `app\styles\base\typography.css:2` — `.glass-section`
-   `app\styles\base\typography.css:10` — `b`
-   `app\styles\base\typography.css:26` — `.chat-send-btn`
-   `app\styles\base\typography.css:26` — `.chat-send-btn.stop`
-   `app\styles\base\typography.css:32` — `input[type="text"]`
-   `app\styles\base\typography.css:32` — `input[type="email"]`
-   `app\styles\base\typography.css:32` — `input[type="password"]`
-   `app\styles\base\typography.css:32` — `input[type="number"]`
-   `app\styles\base\typography.css:32` — `input[type="search"]`
- ✓ `app\styles\features\service-map\desktop.css:3183` — `.leaflet-control-attribution`
- ✓ `app\styles\theme\hc.css:3` — `.skip-link`
- ✓ `app\styles\theme\hc.css:11` — `.skip-link:focus`
- ✓ `app\styles\theme\hc.css:23` — `.skip-link` _(@media (max-width: 768px))_
-   `app\styles\base\typography.css:32` — `.chat-input-field`
-   `app\styles\base\typography.css:45` — `.chat-input-field::placeholder`
-   `app\styles\base\typography.css:50` — `.glass-box`
-   `app\styles\base\typography.css:55` — `:root:not(.theme-light) .glass-box a`
-   `app\styles\components\invite-modal.css:3` — `.invite-modal-overlay.person-invite-modal-overlay`
-   `app\styles\components\invite-modal.css:11` — `.invite-modal-content.person-invite-modal-content`
-   `app\styles\components\invite-modal.css:18` — `.invite-modal-overlay.person-invite-modal-overlay.invite-modal-overlay--workspace` _(@media (min-width: 768px))_
-   `app\styles\components\invite-modal.css:26` — `.invite-modal-content--workspace` _(@media (min-width: 768px))_
-   `app\styles\components\journey.css:1` — `.journey-morph-panel`
-   `app\styles\components\journey.css:5` — `.journey-review-panel`
-   `app\styles\components\journey.css:9` — `.journey-empty-start`
-   `app\styles\components\journey.css:16` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper.journey-empty-orbit-wrapper`
-   `app\styles\components\journey.css:28` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper.journey-empty-orbit-wrapper
  .journey-empty-orbit-label`
-   `app\styles\components\journey.css:40` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper.journey-empty-orbit-wrapper
  .journey-empty-orbit-icon`
-   `app\styles\components\journey.css:46` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper.journey-empty-orbit-wrapper
  .profile-orbit-menu__center.dock-item:is(:hover, :focus-visible)
  .journey-empty-orbit-icon`
-   `app\styles\components\journey.css:52` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper.journey-empty-orbit-wrapper
  .profile-orbit-menu__center.dock-item:disabled`
-   `app\styles\components\journey.css:59` — `.journey-empty-start` _(@media (max-width: 48em))_
-   `app\styles\components\journey.css:59` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper.journey-empty-orbit-wrapper` _(@media (max-width: 48em))_
-   `app\styles\components\journey.css:100` — `.journey-morph-panel` _(@media (prefers-reduced-motion: reduce))_
-   `app\styles\components\journey.css:100` — `.journey-review-panel` _(@media (prefers-reduced-motion: reduce))_
-   `app\styles\components\selected-listing.css:3` — `.selected-listing-body`
-   `app\styles\components\selected-listing.css:50` — `.selected-listing-body`
-   `app\styles\components\selected-listing.css:55` — `.selected-listing-body--inline`
-   `app\styles\components\selected-listing.css:61` — `.selected-listing-body--inline > *`
-   `app\styles\components\selected-listing.css:61` — `.selected-listing-body--inline .selected-listing-panel--inline`
-   `app\styles\components\selected-listing.css:67` — `.selected-listing-modal-overlay`
-   `app\styles\components\selected-listing.css:75` — `.selected-listing-modal-content`
-   `app\styles\components\selected-listing.css:81` — `.selected-listing-body`
-   `app\styles\components\selected-listing.css:88` — `.selected-listing-body > *`
-   `app\styles\components\workspace-help-listings.css:3` — `.help-listings-scroll`
-   `app\styles\components\workspace-help-listings.css:50` — `.help-listings-scroll`
-   `app\styles\components\workspace-help-listings.css:56` — `.help-listings-scroll > *`
-   `app\styles\components\workspace-help-listings.css:56` — `.help-listings-item-card`
-   `app\styles\components\workspace-help-listings.css:63` — `:root:not(.theme-light):not(.theme-mid)
  .help-listings-modal-content
  .help-listings-panel`
-   `app\styles\components\workspace-help-listings.css:85` — `html[data-contrast="hc"]
  .help-listings-modal-content
  .help-listings-panel`
-   `app\styles\components\workspace-help-listings.css:93` — `.help-listings-modal-overlay`
-   `app\styles\components\workspace-help-listings.css:101` — `.help-listings-modal-content`
-   `app\styles\components\workspace-help-listings.css:108` — `.help-listings-modal-overlay.help-listings-modal-overlay--workspace` _(@media (min-width: 768px))_
-   `app\styles\components\workspace-help-listings.css:116` — `.help-listings-modal-content--workspace` _(@media (min-width: 768px))_
-   `app\styles\features\chat\focus.css:3` — `body:is(
    .invite-modal-open,
    .help-listings-modal-open,
    .selected-listing-modal-open
  )
  .chat-page-shell`
-   `app\styles\features\chat\hc.css:4` — `html[data-contrast="hc"] .chat-mobile-topnav span`
-   `app\styles\features\chat\hc.css:8` — `html[data-contrast="hc"] .chat-mobile-topnav button[data-chat-mobile-topnav-button="1"]`
-   `app\styles\features\chat\hc.css:8` — `html[data-contrast="hc"] .chat-mobile-topnav button[data-chat-mobile-topnav-button="1"]:is(:hover, :focus, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:8` — `html[data-contrast="hc"] .chat-mobile-topnav button[data-chat-mobile-topnav-button="1"]::before`
-   `app\styles\features\chat\hc.css:8` — `html[data-contrast="hc"] .chat-mobile-topnav button[data-chat-mobile-topnav-button="1"]::after`
-   `app\styles\features\chat\hc.css:21` — `html[data-contrast="hc"] body .chat-scroll-down-btn`
-   `app\styles\features\chat\hc.css:21` — `html[data-contrast="hc"] body .chat-scroll-down-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:31` — `html[data-contrast="hc"] body .chat-scroll-down-btn:focus-visible`
-   `app\styles\features\chat\hc.css:35` — `html[data-contrast="hc"] body .chat-scroll-down-icon`
-   `app\styles\features\chat\hc.css:39` — `body .chat-analysis-close-btn`
-   `app\styles\features\chat\hc.css:39` — `body .chat-analysis-close-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:57` — `html[data-contrast="hc"] body .chat-inputbar`
-   `app\styles\features\chat\hc.css:63` — `html[data-contrast="hc"] body .chat-inputbar:hover:not(:focus-within)`
-   `app\styles\features\chat\hc.css:68` — `html[data-contrast="hc"] body .chat-inputbar:focus-within`
-   `app\styles\features\chat\hc.css:73` — `html[data-contrast="hc"] body .chat-page-shell .chat-inputbar`
-   `app\styles\features\chat\hc.css:77` — `html[data-contrast="hc"] body .chat-inputbar .chat-input-field`
-   `app\styles\features\chat\hc.css:85` — `html[data-contrast="hc"] body :is(.chat-msg-user, .chat-msg-ai)`
-   `app\styles\features\chat\hc.css:89` — `html[data-contrast="hc"] body .chat-inputbar .chat-input-field::placeholder`
-   `app\styles\features\chat\hc.css:94` — `html[data-contrast="hc"] body .chat-inputbar .chat-input-field:focus-visible`
-   `app\styles\features\chat\hc.css:98` — `html[data-contrast="hc"] body .chat-inputbar .chat-listen-btn svg`
-   `app\styles\features\chat\hc.css:98` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn .chat-send-glyph`
-   `app\styles\features\chat\hc.css:98` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn .chat-send-stop-glyph`
-   `app\styles\features\chat\hc.css:98` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn .chat-mic-glyph`
-   `app\styles\features\chat\hc.css:105` — `html[data-contrast="hc"] body .chat-input-row .chat-side-control-btn svg :is(path, circle, line, rect, ellipse, polyline, polygon)`
-   `app\styles\features\chat\hc.css:109` — `html[data-contrast="hc"] body .chat-input-row .chat-side-control-btn svg [fill]:not([fill="none"])`
-   `app\styles\features\chat\hc.css:113` — `html[data-contrast="hc"] body .chat-tools-menu .chat-tools-item`
-   `app\styles\features\chat\hc.css:121` — `html[data-contrast="hc"] body :is(.chat-tools-menu, .chat-msg-user-bubble)`
-   `app\styles\features\chat\hc.css:131` — `html[data-contrast="hc"] body .chat-tools-surface-popover`
-   `app\styles\features\chat\hc.css:142` — `html[data-contrast="hc"] body .chat-tools-menu .chat-tools-item:hover`
-   `app\styles\features\chat\hc.css:142` — `html[data-contrast="hc"] body .chat-tools-menu .chat-tools-item:focus-visible`
-   `app\styles\features\chat\hc.css:151` — `html[data-contrast="hc"] body .chat-tools-menu .chat-tools-item svg :is(path, circle, line, rect, ellipse, polyline, polygon)`
-   `app\styles\features\chat\hc.css:155` — `html[data-contrast="hc"] body .chat-tools-menu .chat-tools-item svg [fill]:not([fill="none"])`
-   `app\styles\features\chat\hc.css:159` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-overlay-card`
-   `app\styles\features\chat\hc.css:235` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-upload-modal-card`
-   `app\styles\features\chat\hc.css:247` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-overlay-card.chat-analysis-upload-modal-card`
-   `app\styles\features\chat\hc.css:258` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-overlay-card :is(p, span, div, strong, em)`
-   `app\styles\features\chat\hc.css:262` — `html[data-contrast="hc"] body .chat-analysis-overlay-hint`
-   `app\styles\features\chat\hc.css:268` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-close-btn`
-   `app\styles\features\chat\hc.css:268` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-close-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:273` — `html[data-contrast="hc"] body :is(.chat-inputbar .chat-listen-btn, .chat-inputbar .chat-side-control-btn, .chat-input-row .chat-side-control-btn)`
-   `app\styles\features\chat\hc.css:283` — `html[data-contrast="hc"] body :is(.chat-inputbar .chat-listen-btn, .chat-inputbar .chat-side-control-btn):is(:hover, :focus-visible)`
-   `app\styles\features\chat\hc.css:288` — `html[data-contrast="hc"]
  :is(
    .chat-left-actions button,
    .chat-right-actions button,
    .chat-mobile-topnav button
  ):focus-visible`
-   `app\styles\features\chat\hc.css:298` — `html[data-contrast="hc"] :is(.chat-left-actions, .chat-right-actions, .chat-mobile-topnav)`
-   `app\styles\features\chat\hc.css:302` — `html[data-contrast="hc"] .chat-mobile-topnav button`
-   `app\styles\features\chat\hc.css:313` — `html[data-contrast="hc"] .chat-mobile-topnav button:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:320` — `html[data-contrast="hc"] :is(.chat-left-actions, .chat-right-actions) button`
-   `app\styles\features\chat\hc.css:328` — `html[data-contrast="hc"]
  :is(.chat-left-actions, .chat-right-actions)
  button:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:337` — `html[data-contrast="hc"] .drawer-panel--chat-glass`
-   `app\styles\features\chat\hc.css:436` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-close-btn--chat`
-   `app\styles\features\chat\hc.css:444` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-close-btn--chat:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:452` — `html[data-contrast="hc"] .drawer-panel--chat-glass :is(.drawer-title, .drawer-chat-sidebar, .cs-title-text, .cs-preview)`
-   `app\styles\features\chat\hc.css:456` — `html[data-contrast="hc"] .drawer-panel--chat-glass .cs-time`
-   `app\styles\features\chat\hc.css:460` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-card .cs-open`
-   `app\styles\features\chat\hc.css:467` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-card .cs-open:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:474` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar`
-   `app\styles\features\chat\hc.css:486` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-card`
-   `app\styles\features\chat\hc.css:495` — `html[data-contrast="hc"] .drawer-panel--chat-glass .chat-sidebar-search-input`
-   `app\styles\features\chat\hc.css:499` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-card::before`
-   `app\styles\features\chat\hc.css:503` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-card > *`
-   `app\styles\features\chat\hc.css:508` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-card:is(:hover, :focus-within)`
-   `app\styles\features\chat\hc.css:515` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-card:is(:hover, :focus-within)::before`
-   `app\styles\features\chat\hc.css:519` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar .cs-delete`
-   `app\styles\features\chat\hc.css:528` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar .cs-delete .cs-trash-icon`
-   `app\styles\features\chat\hc.css:533` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar .cs-delete:is(:hover, :focus-visible)`
-   `app\styles\features\chat\hc.css:539` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar input`
-   `app\styles\features\chat\hc.css:547` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar input:is(:hover, :focus, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:554` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar input::placeholder`
-   `app\styles\features\chat\hc.css:559` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar .cs-delete .cs-trash-icon`
-   `app\styles\features\chat\hc.css:559` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar .cs-delete .cs-trash-icon :is(path, polyline, line)`
-   `app\styles\features\chat\hc.css:565` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-toggle-btn[data-control-type]`
-   `app\styles\features\chat\hc.css:584` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-toggle-btn[data-control-type][data-checked="true"]`
-   `app\styles\features\chat\hc.css:590` — `html[data-contrast="hc"] body .chat-inputbar:is(:hover, :focus-within)`
-   `app\styles\features\chat\hc.css:596` — `html[data-contrast="hc"] body :is(
  .chat-rail-icon-btn,
  .chat-input-row .chat-side-control-btn,
  .chat-inputbar .chat-listen-btn,
  .chat-inputbar .chat-dictate-btn,
  .chat-inputbar .chat-send-btn,
  .chat-inputbar .chat-tools-btn,
  .chat-inputbar .chat-document-attach-btn
)`
-   `app\styles\features\chat\hc.css:596` — `html[data-contrast="hc"] body :is(
  .chat-rail-icon-btn,
  .chat-input-row .chat-side-control-btn,
  .chat-inputbar .chat-listen-btn,
  .chat-inputbar .chat-dictate-btn,
  .chat-inputbar .chat-send-btn,
  .chat-inputbar .chat-tools-btn,
  .chat-inputbar .chat-document-attach-btn
):is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:621` — `html[data-contrast="hc"] body :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
)`
-   `app\styles\features\chat\hc.css:621` — `html[data-contrast="hc"] body :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
):is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:621` — `html[data-contrast="hc"] body :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
)::before`
-   `app\styles\features\chat\hc.css:621` — `html[data-contrast="hc"] body :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
)::after`
-   `app\styles\features\chat\hc.css:656` — `html[data-contrast="hc"] body .chat-msg-ai .chat-assistant-action-btn`
-   `app\styles\features\chat\hc.css:656` — `html[data-contrast="hc"] body .chat-msg-ai .chat-assistant-action-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\hc.css:656` — `html[data-contrast="hc"] body .chat-msg-ai .chat-assistant-action-btn::before`
-   `app\styles\features\chat\hc.css:656` — `html[data-contrast="hc"] body .chat-msg-ai .chat-assistant-action-btn::after`
-   `app\styles\features\chat\hc.css:669` — `html[data-contrast="hc"] body .chat-msg-ai .chat-assistant-action-btn`
-   `app\styles\features\chat\hc.css:673` — `html[data-contrast="hc"] body .chat-msg-ai .chat-assistant-action-btn svg :is(path, circle, line, rect, ellipse, polyline, polygon)`
-   `app\styles\features\chat\mobile.css:4` — `body.conversation-drawer-open .chat-page-shell` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:10` — `body.conversation-drawer-open .chat-right-actions` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:15` — `body.conversation-drawer-open .chat-mobile-topnav` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:20` — `.chat-page-shell .chat-container.chat-container--round` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:30` — `.chat-page-shell .chat-container.chat-container--round.chat-container--input-focus` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:38` — `.chat-page-shell .chat-container.chat-container--round.chat-container--workspace-open` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:48` — `.drawer-overlay` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:54` — `.drawer-panel--chat-glass` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:69` — `.drawer-panel--chat-glass::before` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:74` — `.drawer-panel--chat-glass .drawer-header` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:80` — `.drawer-panel--chat-glass .drawer-close-btn--chat` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:89` — `:root.theme-light .drawer-panel--chat-glass .drawer-close-btn--chat` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:93` — `:root.theme-light .drawer-panel--chat-glass` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:97` — `.chat-page-shell .chat-container .chat-mask-layer` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:97` — `.chat-page-shell .chat-container .chat-mask-tilt-fallback` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:108` — `.chat-page-shell .chat-container[data-chat-layout="mobile"] .chat-mask-layer` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:112` — `.chat-page-shell
    .chat-container[data-chat-layout="mobile"]:not(.chat-container--workspace-open)` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:121` — `.chat-page-shell .chat-container[data-chat-layout="mobile"].chat-container--workspace-open` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:126` — `.chat-page-shell .chat-container[data-chat-layout="mobile"] .chat-mask-tilt-fallback` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:148` — `.drawer-panel--chat-glass .drawer-content` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:153` — `.chat-right-actions` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:153` — `.chat-left-actions` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:171` — `.chat-left-actions` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:179` — `.chat-window__scroll` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:185` — `.chat-page-shell--analysis-scroll .chat-analysis-preview-wrap` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:189` — `.chat-page-shell--analysis-scroll .chat-analysis-preview` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:195` — `.chat-page-shell--analysis-scroll .chat-analysis-scroll-track` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:199` — `.chat-page-shell--analysis-scroll` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:208` — `.chat-msg-user` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:212` — `.chat-right-actions > nav` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:212` — `.chat-left-actions > nav` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:229` — `.chat-left-actions > nav` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:233` — `.chat-right-actions > nav button` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:233` — `.chat-left-actions > nav button` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:242` — `.chat-page-shell .chat-container[data-chat-layout="mobile"]` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:246` — `.chat-input-row:not(.chat-input-row--embedded)` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:261` — `.chat-input-row:not(.chat-input-row--embedded) .chat-side-controls` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:265` — `.chat-input-row:not(.chat-input-row--embedded) .chat-side-control-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:272` — `.chat-input-row:not(.chat-input-row--embedded) .chat-tools-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:276` — `.chat-input-row:not(.chat-input-row--embedded) .chat-inputbar` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:283` — `.chat-page-shell .chat-container[data-chat-layout="mobile"] .chat-window__scroll` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:294` — `html[data-platform="android"] .chat-input-row:not(.chat-input-row--embedded)` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:294` — `body[data-platform="android"] .chat-input-row:not(.chat-input-row--embedded)` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:319` — `html[data-platform="android"] .chat-input-row:not(.chat-input-row--embedded) .chat-side-control-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:319` — `body[data-platform="android"] .chat-input-row:not(.chat-input-row--embedded) .chat-side-control-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:325` — `html[data-platform="android"] .chat-input-row:not(.chat-input-row--embedded) .chat-inputbar` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:325` — `body[data-platform="android"] .chat-input-row:not(.chat-input-row--embedded) .chat-inputbar` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:331` — `html[data-platform="android"] body .chat-inputbar .chat-listen-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:331` — `html[data-platform="android"] body .chat-inputbar .chat-send-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:331` — `body[data-platform="android"] .chat-inputbar .chat-listen-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:331` — `body[data-platform="android"] .chat-inputbar .chat-send-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:342` — `html[data-platform="android"] body .chat-inputbar .chat-send-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:342` — `body[data-platform="android"] .chat-inputbar .chat-send-btn` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:351` — `.chat-input-row--embedded` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mobile.css:362` — `.chat-input-row--embedded .chat-inputbar` _(@media (max-width: 768px))_
-   `app\styles\features\chat\mono.css:1` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass`
-   `app\styles\features\chat\mono.css:15` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass :is(.drawer-chat-sidebar, .cs-title-text, .cs-preview)`
-   `app\styles\features\chat\mono.css:20` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass :is(.drawer-close-btn--chat, .drawer-close-btn--chat > span)`
-   `app\styles\features\chat\mono.css:25` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .drawer-title`
-   `app\styles\features\chat\mono.css:31` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .cs-time`
-   `app\styles\features\chat\mono.css:35` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .drawer-chat-card`
-   `app\styles\features\chat\mono.css:41` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .drawer-chat-card:is(:hover, :focus-within)`
-   `app\styles\features\chat\mono.css:47` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .drawer-chat-sidebar :is(.button, .btn, .drawer-pill-btn, .invite-primary-btn)`
-   `app\styles\features\chat\mono.css:54` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .drawer-chat-sidebar :is(.button, .btn, .drawer-pill-btn, .invite-primary-btn)::before`
-   `app\styles\features\chat\mono.css:58` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .drawer-chat-sidebar :is(.button, .btn, .drawer-pill-btn, .invite-primary-btn):is(:hover, :focus-visible)`
-   `app\styles\features\chat\mono.css:64` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-input`
-   `app\styles\features\chat\mono.css:74` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field`
-   `app\styles\features\chat\mono.css:88` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field::before`
-   `app\styles\features\chat\mono.css:88` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field::after`
-   `app\styles\features\chat\mono.css:88` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field > .edgeLight`
-   `app\styles\features\chat\mono.css:95` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field:is(:hover, :focus-within)`
-   `app\styles\features\chat\mono.css:104` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-input::placeholder`
-   `app\styles\features\chat\mono.css:109` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .cs-delete`
-   `app\styles\features\chat\mono.css:116` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .cs-delete:is(:hover, :focus-visible)`
-   `app\styles\features\chat\mono.css:123` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .cs-trash-icon`
-   `app\styles\features\chat\mono.css:123` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .cs-trash-icon :is(path, polyline, line)`
-   `app\styles\features\chat\mono.css:130` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-rail-icon-btn, .chat-side-control-btn, .chat-tools-btn, .chat-document-attach-btn, .chat-listen-btn, .chat-send-btn, .chat-assistant-action-btn, .chat-dictate-btn)`
-   `app\styles\features\chat\mono.css:134` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-rail-icon-btn, .chat-side-control-btn, .chat-tools-btn, .chat-document-attach-btn, .chat-listen-btn, .chat-send-btn, .chat-assistant-action-btn, .chat-dictate-btn) :is(svg, path, circle, rect, line, polyline, polygon)`
-   `app\styles\features\chat\mono.css:139` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-rail-icon-btn, .chat-side-control-btn, .chat-tools-btn, .chat-document-attach-btn, .chat-listen-btn, .chat-send-btn, .chat-assistant-action-btn, .chat-dictate-btn) :is(path, circle, rect, polygon)[fill]:not([fill="none"])`
-   `app\styles\features\chat\mono.css:143` — `:root.theme-mono:not([data-contrast="hc"]) .chat-rail-icon-btn .back-icon-dot`
-   `app\styles\features\chat\mono.css:148` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-rail-icon-btn, .chat-side-control-btn, .chat-tools-btn, .chat-document-attach-btn, .chat-listen-btn, .chat-send-btn, .chat-assistant-action-btn, .chat-dictate-btn) :is(circle.back-icon-dot)[fill]`
-   `app\styles\features\chat\mono.css:153` — `:root.theme-mono:not([data-contrast="hc"]) .chat-rail-icon-btn .back-icon-dot.back-icon-dot--outline`
-   `app\styles\features\chat\mono.css:153` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-rail-icon-btn, .chat-side-control-btn, .chat-tools-btn, .chat-document-attach-btn, .chat-listen-btn, .chat-send-btn, .chat-assistant-action-btn, .chat-dictate-btn) :is(circle.back-icon-dot.back-icon-dot--outline)[fill]`
-   `app\styles\features\chat\mono.css:158` — `:root.theme-mono:not([data-contrast="hc"]) .chat-rail-icon-btn:is(:hover, :focus-visible) .back-icon-dot.back-icon-dot--outline`
-   `app\styles\features\chat\mono.css:158` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-rail-icon-btn, .chat-side-control-btn, .chat-tools-btn, .chat-document-attach-btn, .chat-listen-btn, .chat-send-btn, .chat-assistant-action-btn, .chat-dictate-btn):is(:hover, :focus-visible) :is(circle.back-icon-dot.back-icon-dot--outline)[fill]`
-   `app\styles\features\chat\mono.css:163` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
)`
-   `app\styles\features\chat\mono.css:163` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
):is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\mono.css:163` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
)::before`
-   `app\styles\features\chat\mono.css:163` — `:root.theme-mono:not([data-contrast="hc"]) :is(.chat-left-actions, .chat-right-actions) :is(
  .chat-rail-icon-btn,
  button,
  [class*="Rail_item"],
  [class*="Rail_iconBtn"]
)::after`
-   `app\styles\features\chat\mono.css:198` — `:root.theme-mono:not([data-contrast="hc"]) :is([class*="LeftRail_tooltip"], [class*="RightRail_tooltip"])`
-   `app\styles\features\chat\mono.css:208` — `:root.theme-mono:not([data-contrast="hc"]) .chat-page-shell [role="tooltip"]`
-   `app\styles\features\chat\mono.css:216` — `:root.theme-mono:not([data-contrast="hc"]) body .chat-input-row .chat-side-control-btn`
-   `app\styles\features\chat\mono.css:216` — `:root.theme-mono:not([data-contrast="hc"]) body .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\mono.css:216` — `:root.theme-mono:not([data-contrast="hc"]) body .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\mono.css:222` — `:root.theme-mono:not([data-contrast="hc"]):not(.theme-light):not(.theme-mid):not([data-contrast="hc"]) .chat-page-shell .chat-composer-glow-shell`
-   `app\styles\features\chat\mono.css:222` — `:root.theme-mono:not([data-contrast="hc"]) .chat-page-shell .chat-composer-glow-shell`
-   `app\styles\features\chat\mono.css:242` — `:root.theme-mono:not([data-contrast="hc"]):not(.theme-light):not(.theme-mid):not([data-contrast="hc"]) .chat-page-shell .chat-composer-glow-shell:hover`
-   `app\styles\features\chat\mono.css:242` — `:root.theme-mono:not([data-contrast="hc"]) .chat-page-shell .chat-composer-glow-shell:hover`
-   `app\styles\features\chat\mono.css:255` — `:root.theme-mono:not([data-contrast="hc"]) body .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\mono.css:255` — `:root.theme-mono:not([data-contrast="hc"]) body .chat-inputbar:focus-within .chat-send-btn`
-   `app\styles\features\chat\mono.css:255` — `:root.theme-mono:not([data-contrast="hc"]) body .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\mono.css:255` — `:root.theme-mono:not([data-contrast="hc"]) body .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\mono.css:266` — `:root.theme-mono:not([data-contrast="hc"]) .chat-tools-menu`
-   `app\styles\features\chat\mono.css:273` — `:root.theme-mono:not([data-contrast="hc"]) .chat-tools-menu .chat-tools-item`
-   `app\styles\features\chat\mono.css:277` — `:root.theme-mono:not([data-contrast="hc"]) .chat-tools-menu .chat-tools-item :is(svg, path, circle, rect, line, polyline, polygon)`
-   `app\styles\features\chat\mono.css:282` — `:root.theme-mono:not([data-contrast="hc"]) .chat-tools-menu .chat-tools-item :is(path, circle, rect, polygon)[fill]:not([fill="none"])`
-   `app\styles\features\chat\mono.css:286` — `:root.theme-mono:not([data-contrast="hc"]) .chat-tools-menu .chat-tools-item:is(:hover, :focus-visible)`
-   `app\styles\features\chat\mono.css:293` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field`
-   `app\styles\features\chat\mono.css:302` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass.glass-field-hole-surface > :not(.glass-hole-mask-layer):not(.modal-close-btn):not(.login-modal-close):not(.back-button)`
-   `app\styles\features\chat\mono.css:307` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass.glass-field-hole-surface::before`
-   `app\styles\features\chat\mono.css:316` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field:is(:hover, :focus-within)`
-   `app\styles\features\chat\mono.css:322` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field :is(input, textarea, select, .ui-glow-control)`
-   `app\styles\features\chat\mono.css:329` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field::before`
-   `app\styles\features\chat\mono.css:329` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field::after`
-   `app\styles\features\chat\mono.css:329` — `:root.theme-mono:not([data-contrast="hc"]) .drawer-panel--chat-glass .chat-sidebar-search-glow.ui-glow-field > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:3` — `.chat-container--input-focus`
-   `app\styles\features\chat\shell.css:3` — `.chat-container--workspace-open`
-   `app\styles\features\chat\shell.css:3` — `.chat-page-shell
  .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)`
-   `app\styles\features\chat\shell.css:30` — `.chat-page-shell` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:36` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--input-focus` _(@media (min-width: 768px) and (max-width: 1440px))_
-   `app\styles\features\chat\shell.css:42` — `.chat-msg-user`
-   `app\styles\features\chat\shell.css:42` — `.chat-msg-user-bubble`
-   `app\styles\features\chat\shell.css:42` — `.chat-msg-user-bubble > *`
-   `app\styles\features\chat\shell.css:49` — `.chat-msg-ai`
-   `app\styles\features\chat\shell.css:54` — `.chat-msg-user-bubble`
-   `app\styles\features\chat\shell.css:54` — `.chat-msg-user-bubble > *`
-   `app\styles\features\chat\shell.css:61` — `.chat-msg-ai`
-   `app\styles\features\chat\shell.css:61` — `.chat-msg-ai :is(p, li, div)`
-   `app\styles\features\chat\shell.css:68` — `.chat-container--workspace-open .chat-window__scroll`
-   `app\styles\features\chat\shell.css:73` — `.chat-container--input-focus .chat-window`
-   `app\styles\features\chat\shell.css:73` — `.chat-page-shell
  .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)
  .chat-window`
-   `app\styles\features\chat\shell.css:91` — `.chat-container--input-focus .chat-window__scroll`
-   `app\styles\features\chat\shell.css:91` — `.chat-page-shell
  .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)
  .chat-window__scroll`
-   `app\styles\features\chat\shell.css:143` — `.drawer-chat-sidebar__list`
-   `app\styles\features\chat\shell.css:181` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--input-focus
    .chat-back-button` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:181` — `.chat-page-shell
    .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)
    .chat-back-button` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:190` — `.chat-page-shell .chat-container--round .chat-back-button .back-icon-arrow` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:194` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--input-focus
    .chat-back-button
    .back-icon-arrow` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:194` — `.chat-page-shell
    .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)
    .chat-back-button
    .back-icon-arrow` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:205` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--input-focus
    .chat-back-button:hover
    .back-icon-arrow` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:205` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--input-focus
    .chat-back-button:focus-visible
    .back-icon-arrow` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:205` — `.chat-page-shell
    .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)
    .chat-back-button:hover
    .back-icon-arrow` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:205` — `.chat-page-shell
    .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)
    .chat-back-button:focus-visible
    .back-icon-arrow` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:224` — `.chat-page-shell .chat-container.chat-container--round` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:258` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--input-focus` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:258` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--workspace-open` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:258` — `.chat-page-shell
    .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:282` — `.chat-page-shell
    .chat-container.chat-container--round.chat-container--input-focus
    .chat-window` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:282` — `.chat-page-shell
    .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)
    .chat-window` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:295` — `.chat-page-shell .chat-container--round .chat-right-actions` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:299` — `.chat-page-shell .chat-container--round` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:303` — `.chat-page-shell .chat-container--round::-webkit-scrollbar` _(@media (min-width: 768px))_
-   `app\styles\features\chat\shell.css:310` — `.chat-page-shell .chat-container.chat-container--round` _(@media (min-width: 768px) and (max-width: 1440px) and (max-height: 840px))_
-   `app\styles\features\chat\shell.css:323` — `.chat-page-shell .chat-container.chat-container--round.chat-container--input-focus` _(@media (min-width: 768px) and (max-width: 1440px) and (max-height: 840px))_
-   `app\styles\features\chat\shell.css:323` — `.chat-page-shell .chat-container.chat-container--round.chat-container--workspace-open` _(@media (min-width: 768px) and (max-width: 1440px) and (max-height: 840px))_
-   `app\styles\features\chat\shell.css:323` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within)` _(@media (min-width: 768px) and (max-width: 1440px) and (max-height: 840px))_
-   `app\styles\features\chat\shell.css:345` — `.chat-page-shell .chat-container.chat-container--round.chat-container--input-focus .chat-window` _(@media (min-width: 768px) and (max-width: 1440px) and (max-height: 840px))_
-   `app\styles\features\chat\shell.css:345` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-window` _(@media (min-width: 768px) and (max-width: 1440px) and (max-height: 840px))_
-   `app\styles\features\chat\shell.css:355` — `html[data-reduce-motion="1"] .chat-page-shell .chat-container.chat-container--round`
-   `app\styles\features\chat\shell.css:355` — `html[data-reduce-motion="1"] .chat-page-shell .chat-container.chat-container--round.chat-container--input-focus`
-   `app\styles\features\chat\shell.css:355` — `html[data-reduce-motion="1"] .chat-page-shell .chat-container.chat-container--round.chat-container--workspace-open`
-   `app\styles\features\chat\shell.css:361` — `.chat-page-shell
  .chat-container.chat-container--round.chat-container--workspace-restore-no-transition`
-   `app\styles\features\chat\shell.css:366` — `.chat-analysis-overlay .chat-analysis-overlay-card`
-   `app\styles\features\chat\shell.css:385` — `:root.theme-light .chat-page-shell`
-   `app\styles\features\chat\shell.css:392` — `:root.theme-mid .chat-page-shell`
-   `app\styles\features\chat\shell.css:399` — `:root.theme-night .chat-page-shell`
-   `app\styles\features\chat\shell.css:406` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night) .chat-page-shell`
-   `app\styles\features\chat\shell.css:413` — `:root.theme-mono:not([data-contrast="hc"]) .chat-page-shell`
-   `app\styles\features\chat\shell.css:422` — `html[data-contrast="hc"] .chat-page-shell`
-   `app\styles\features\chat\shell.css:431` — `body .chat-input-row .chat-side-control-btn`
-   `app\styles\features\chat\shell.css:439` — `body .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\shell.css:439` — `body .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\shell.css:451` — `body .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\shell.css:461` — `body .chat-inputbar .chat-send-btn > .chat-send-icon-anchor`
-   `app\styles\features\chat\shell.css:471` — `body .chat-input-row .chat-side-control-btn svg`
-   `app\styles\features\chat\shell.css:477` — `body .chat-inputbar .chat-listen-btn svg`
-   `app\styles\features\chat\shell.css:482` — `body .chat-inputbar .chat-send-btn .chat-send-glyph`
-   `app\styles\features\chat\shell.css:490` — `body .chat-inputbar .chat-send-btn .chat-send-stop-glyph`
-   `app\styles\features\chat\shell.css:496` — `body .chat-inputbar .chat-send-btn .chat-mic-glyph`
-   `app\styles\features\chat\shell.css:501` — `body .chat-inputbar .chat-dictate-btn`
-   `app\styles\features\chat\shell.css:501` — `body .chat-inputbar .chat-dictate-btn:hover`
-   `app\styles\features\chat\shell.css:501` — `body .chat-inputbar .chat-dictate-btn:focus-visible`
-   `app\styles\features\chat\shell.css:501` — `body .chat-inputbar .chat-dictate-btn:active`
-   `app\styles\features\chat\shell.css:501` — `body .chat-inputbar .chat-dictate-btn:hover svg`
-   `app\styles\features\chat\shell.css:501` — `body .chat-inputbar .chat-dictate-btn:focus-visible svg`
-   `app\styles\features\chat\shell.css:510` — `body .chat-inputbar .chat-send-btn[data-empty-disabled="true"]`
-   `app\styles\features\chat\shell.css:510` — `body .chat-inputbar .chat-send-btn[data-empty-disabled="true"][aria-disabled="true"]`
-   `app\styles\features\chat\shell.css:510` — `body .chat-inputbar .chat-send-btn[data-empty-disabled="true"]:disabled`
-   `app\styles\features\chat\shell.css:517` — `.chat-container--input-focus .chat-inputbar`
-   `app\styles\features\chat\shell.css:517` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar`
-   `app\styles\features\chat\shell.css:522` — `:root:not(.theme-light):not(.theme-mid):not([data-contrast="hc"]) .chat-page-shell .chat-composer-glow-shell`
-   `app\styles\features\chat\shell.css:546` — `:root:not(.theme-light):not(.theme-mid):not([data-contrast="hc"]) .chat-page-shell .chat-composer-glow-shell:hover`
-   `app\styles\features\chat\shell.css:558` — `.chat-page-shell .chat-composer-glow-shell:focus-within:not(:hover) > .edgeLight`
-   `app\styles\features\chat\shell.css:558` — `.chat-page-shell .chat-composer-glow-shell:focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:563` — `:root.theme-light .chat-page-shell .chat-composer-glow-shell`
-   `app\styles\features\chat\shell.css:571` — `:root.theme-light .chat-page-shell .chat-composer-glow-shell:hover`
-   `app\styles\features\chat\shell.css:580` — `:root.theme-light .chat-page-shell .chat-composer-glow-shell > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:585` — `:root.theme-light .chat-page-shell .chat-composer-glow-shell:hover > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:590` — `:root.theme-light .chat-page-shell .chat-composer-glow-shell:focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:590` — `:root.theme-light .chat-container--input-focus .chat-composer-glow-shell:not(:hover) > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:590` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-composer-glow-shell:not(:hover) > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:596` — `:root.theme-mid .chat-composer-glow-shell > .edgeLight`
-   `app\styles\features\chat\shell.css:596` — `:root.theme-mid .chat-composer-glow-shell > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:601` — `html[data-contrast="hc"] .chat-composer-glow-shell > .edgeLight`
-   `app\styles\features\chat\shell.css:601` — `html[data-contrast="hc"] .chat-composer-glow-shell > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:606` — `html[data-contrast="hc"] .chat-composer-glow-shell`
-   `app\styles\features\chat\shell.css:623` — `html[data-contrast="hc"] .chat-page-shell .chat-composer-glow-shell:hover`
-   `app\styles\features\chat\shell.css:633` — `html[data-contrast="hc"] .chat-page-shell .chat-composer-glow-shell > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:633` — `html[data-contrast="hc"] .chat-page-shell .chat-composer-glow-shell:focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:639` — `:root:not(.theme-light):not(.theme-mid):not([data-contrast="hc"]) .chat-page-shell .chat-composer-glow-shell .chat-inputbar`
-   `app\styles\features\chat\shell.css:647` — `.chat-container--input-focus .chat-inputbar > .chat-listen-btn`
-   `app\styles\features\chat\shell.css:647` — `.chat-container--input-focus .chat-inputbar > .chat-send-btn`
-   `app\styles\features\chat\shell.css:647` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar > .chat-listen-btn`
-   `app\styles\features\chat\shell.css:647` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar > .chat-send-btn`
-   `app\styles\features\chat\shell.css:672` — `.chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame`
-   `app\styles\features\chat\shell.css:688` — `.chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:692` — `:root.theme-light .chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:692` — `:root.theme-mid .chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:697` — `.chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame:is(:hover, :focus-visible) > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:701` — `.chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame[data-empty-disabled="true"] > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:701` — `.chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame:disabled > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:701` — `.chat-page-shell .chat-inputbar .chat-send-btn.ui-glow-button-frame[aria-disabled="true"] > [class*="edgeLight"]`
-   `app\styles\features\chat\shell.css:707` — `.chat-container--input-focus .chat-inputbar > .chat-listen-btn`
-   `app\styles\features\chat\shell.css:707` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar > .chat-listen-btn`
-   `app\styles\features\chat\shell.css:712` — `.chat-container--input-focus .chat-inputbar > .chat-send-btn`
-   `app\styles\features\chat\shell.css:712` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar > .chat-send-btn`
-   `app\styles\features\chat\shell.css:717` — `.chat-container--input-focus .chat-inputbar > .chat-listen-btn svg`
-   `app\styles\features\chat\shell.css:717` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar > .chat-listen-btn svg`
-   `app\styles\features\chat\shell.css:723` — `.chat-container--input-focus .chat-inputbar > .chat-listen-btn:hover svg`
-   `app\styles\features\chat\shell.css:723` — `.chat-container--input-focus .chat-inputbar > .chat-listen-btn:focus-visible svg`
-   `app\styles\features\chat\shell.css:723` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar > .chat-listen-btn:hover svg`
-   `app\styles\features\chat\shell.css:723` — `.chat-page-shell .chat-container.chat-container--round.chat-layout-desktop:has(.chat-inputbar:focus-within) .chat-inputbar > .chat-listen-btn:focus-visible svg`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"]) body .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"]) body .chat-inputbar:focus-within .chat-send-btn`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"]) body .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"]) body .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"])
  body
  .chat-inputbar
  .chat-send-btn[data-recording="true"]`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"])
  body
  .chat-inputbar
  .chat-send-btn[data-recording-complete="true"]`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"]) body .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"]) body .chat-inputbar .chat-listen-btn:hover`
-   `app\styles\features\chat\shell.css:731` — `:root:not(.theme-light):not([data-contrast="hc"]) body .chat-inputbar .chat-listen-btn:focus-visible`
-   `app\styles\features\chat\shell.css:750` — `html[data-contrast="hc"] body .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\shell.css:758` — `html[data-contrast="hc"] body .chat-input-row .chat-side-control-btn`
-   `app\styles\features\chat\shell.css:758` — `html[data-contrast="hc"] body .chat-input-row .chat-side-control-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\shell.css:758` — `html[data-contrast="hc"] body .chat-inputbar .chat-dictate-btn`
-   `app\styles\features\chat\shell.css:758` — `html[data-contrast="hc"] body .chat-inputbar .chat-dictate-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\shell.css:758` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\shell.css:758` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\chat\shell.css:770` — `html[data-contrast="hc"] body .chat-inputbar .chat-listen-btn:hover`
-   `app\styles\features\chat\shell.css:770` — `html[data-contrast="hc"] body .chat-inputbar .chat-listen-btn:focus-visible`
-   `app\styles\features\chat\shell.css:770` — `html[data-contrast="hc"] body .chat-inputbar .chat-listen-btn:active`
-   `app\styles\features\chat\shell.css:778` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn.invite-primary-btn`
-   `app\styles\features\chat\shell.css:852` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn.invite-primary-btn:hover`
-   `app\styles\features\chat\shell.css:852` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn.invite-primary-btn:focus-visible`
-   `app\styles\features\chat\shell.css:859` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn.invite-primary-btn:active`
-   `app\styles\features\chat\shell.css:865` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn`
-   `app\styles\features\chat\shell.css:874` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn::before`
-   `app\styles\features\chat\shell.css:878` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn:is(:hover, :focus-visible)`
-   `app\styles\features\chat\shell.css:885` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn:active`
-   `app\styles\features\chat\themes.css:8` — `:root.theme-light .drawer-panel`
-   `app\styles\features\chat\themes.css:12` — `:root.theme-light .drawer-panel .drawer-header strong`
-   `app\styles\features\chat\themes.css:16` — `:root.theme-light .drawer-panel .drawer-chat-card`
-   `app\styles\features\chat\themes.css:22` — `:root.theme-light .drawer-panel .drawer-chat-card .cs-delete`
-   `app\styles\features\chat\themes.css:26` — `:root.theme-light .drawer-close`
-   `app\styles\features\chat\themes.css:30` — `:root.theme-light .drawer-panel .cs-preview`
-   `app\styles\features\chat\themes.css:34` — `:root.theme-light .drawer-panel .cs-time`
-   `app\styles\features\chat\themes.css:38` — `:root.theme-light .drawer-panel .cs-title-text`
-   `app\styles\features\chat\themes.css:42` — `:root.theme-light .drawer-panel .cs-title-badge`
-   `app\styles\features\chat\themes.css:48` — `:root.theme-light .drawer-panel .cs-delete`
-   `app\styles\features\chat\themes.css:55` — `:root.theme-light .drawer-panel .cs-delete:hover`
-   `app\styles\features\chat\themes.css:55` — `:root.theme-light .drawer-panel .cs-delete:focus-visible`
-   `app\styles\features\chat\themes.css:63` — `:root.theme-light .drawer-panel .cs-trash-icon`
-   `app\styles\features\chat\themes.css:68` — `:root.theme-light :is(.chat-tools-menu, .chat-tools-surface-popover)`
-   `app\styles\features\chat\themes.css:76` — `:root.theme-light:not(.theme-mid) .chat-analysis-upload-modal-card`
-   `app\styles\features\chat\themes.css:84` — `:root.theme-light:not(.theme-mid) .chat-analysis-preview-card`
-   `app\styles\features\chat\themes.css:105` — `:root.theme-light .chat-inputbar`
-   `app\styles\features\chat\themes.css:105` — `:root.theme-light .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\themes.css:105` — `:root.theme-light .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:162` — `:root.theme-light .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\themes.css:162` — `:root.theme-light .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:173` — `:root.theme-light .chat-inputbar`
-   `app\styles\features\chat\themes.css:177` — `:root.theme-light .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\themes.css:184` — `:root.theme-light .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:194` — `:root.theme-light .chat-inputbar:hover:not(:focus-within)`
-   `app\styles\features\chat\themes.css:194` — `:root.theme-light .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:200` — `:root.theme-light .chat-inputbar:hover`
-   `app\styles\features\chat\themes.css:205` — `:root.theme-light .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:210` — `:root.theme-light .chat-inputbar .chat-input-field`
-   `app\styles\features\chat\themes.css:216` — `:root.theme-light .chat-inputbar .chat-input-field::placeholder`
-   `app\styles\features\chat\themes.css:221` — `:root.theme-light .chat-inputbar:focus-within .chat-send-btn`
-   `app\styles\features\chat\themes.css:231` — `:root.theme-light .chat-inputbar:focus-within .chat-listen-btn`
-   `app\styles\features\chat\themes.css:238` — `:root.theme-light .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\themes.css:238` — `:root.theme-light .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\themes.css:238` — `:root.theme-light .chat-inputbar .chat-send-btn:active`
-   `app\styles\features\chat\themes.css:251` — `:root.theme-light .chat-inputbar .chat-listen-btn:hover`
-   `app\styles\features\chat\themes.css:251` — `:root.theme-light .chat-inputbar .chat-listen-btn:focus-visible`
-   `app\styles\features\chat\themes.css:251` — `:root.theme-light .chat-inputbar .chat-listen-btn:active`
-   `app\styles\features\chat\themes.css:259` — `:root.theme-light .chat-inputbar .chat-listen-btn:active`
-   `app\styles\features\chat\themes.css:259` — `:root.theme-light .chat-inputbar .chat-send-btn:active`
-   `app\styles\features\chat\themes.css:266` — `:root.theme-light .chat-inputbar .chat-listen-btn:active`
-   `app\styles\features\chat\themes.css:272` — `:root.theme-light .chat-container--input-focus .chat-inputbar`
-   `app\styles\features\chat\themes.css:272` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar`
-   `app\styles\features\chat\themes.css:278` — `:root.theme-light .chat-container--input-focus .chat-inputbar:hover`
-   `app\styles\features\chat\themes.css:278` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar:hover`
-   `app\styles\features\chat\themes.css:283` — `:root.theme-light .chat-container--input-focus .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:283` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:289` — `:root.theme-light .chat-container--input-focus .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:289` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:300` — `:root.theme-light .chat-container--input-focus .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\themes.css:300` — `:root.theme-light .chat-container--input-focus .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\themes.css:300` — `:root.theme-light .chat-container--input-focus .chat-inputbar .chat-send-btn:active`
-   `app\styles\features\chat\themes.css:300` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\themes.css:300` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\themes.css:300` — `:root.theme-light .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar .chat-send-btn:active`
-   `app\styles\features\chat\themes.css:315` — `:root.theme-light .chat-msg-ai`
-   `app\styles\features\chat\themes.css:319` — `:root.theme-light .chat-inputbar .chat-send-btn[data-recording="true"]`
-   `app\styles\features\chat\themes.css:326` — `:root.theme-light
  .chat-inputbar
  .chat-send-btn[data-recording-complete="true"]`
-   `app\styles\features\chat\themes.css:337` — `:root.theme-mid .chat-msg-user-bubble`
-   `app\styles\features\chat\themes.css:344` — `:root.theme-mid .chat-page-shell [class*="leftRail"] [class*="iconBtnActive"]`
-   `app\styles\features\chat\themes.css:344` — `:root.theme-mid .chat-page-shell [class*="rightRail"] [class*="iconBtnActive"]`
-   `app\styles\features\chat\themes.css:350` — `:root.theme-mid .drawer-panel .drawer-chat-card`
-   `app\styles\features\chat\themes.css:350` — `:root.theme-mid .drawer-chat-card`
-   `app\styles\features\chat\themes.css:357` — `:root.theme-mid .drawer-panel .drawer-chat-card .cs-delete`
-   `app\styles\features\chat\themes.css:357` — `:root.theme-mid .drawer-chat-card .cs-delete`
-   `app\styles\features\chat\themes.css:362` — `:root.theme-mid .chat-inputbar`
-   `app\styles\features\chat\themes.css:362` — `:root.theme-mid .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\themes.css:362` — `:root.theme-mid .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:397` — `:root.theme-mid .chat-inputbar`
-   `app\styles\features\chat\themes.css:404` — `:root.theme-mid .chat-inputbar::before`
-   `app\styles\features\chat\themes.css:416` — `:root.theme-mid .chat-inputbar > *`
-   `app\styles\features\chat\themes.css:421` — `:root.theme-mid .chat-inputbar:hover:not(:focus-within)`
-   `app\styles\features\chat\themes.css:421` — `:root.theme-mid .chat-inputbar:hover`
-   `app\styles\features\chat\themes.css:428` — `:root.theme-mid .chat-inputbar:hover::before`
-   `app\styles\features\chat\themes.css:428` — `:root.theme-mid .chat-inputbar:focus-within::before`
-   `app\styles\features\chat\themes.css:428` — `:root.theme-mid .chat-container--input-focus .chat-inputbar::before`
-   `app\styles\features\chat\themes.css:428` — `:root.theme-mid .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar::before`
-   `app\styles\features\chat\themes.css:435` — `:root.theme-mid .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:441` — `:root.theme-mid .chat-container--input-focus .chat-inputbar`
-   `app\styles\features\chat\themes.css:441` — `:root.theme-mid .chat-container--input-focus .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:441` — `:root.theme-mid .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar`
-   `app\styles\features\chat\themes.css:441` — `:root.theme-mid .chat-page-shell .chat-container.chat-container--round:has(.chat-inputbar:focus-within) .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:449` — `:root.theme-mid .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\themes.css:456` — `:root.theme-mid .chat-inputbar:focus-within .chat-listen-btn`
-   `app\styles\features\chat\themes.css:462` — `:root.theme-mid .chat-inputbar .chat-listen-btn:hover`
-   `app\styles\features\chat\themes.css:462` — `:root.theme-mid .chat-inputbar .chat-listen-btn:focus-visible`
-   `app\styles\features\chat\themes.css:470` — `:root.theme-mid .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:478` — `:root.theme-mid .chat-inputbar .chat-send-btn::before`
-   `app\styles\features\chat\themes.css:493` — `:root.theme-mid .chat-inputbar .chat-send-btn > *`
-   `app\styles\features\chat\themes.css:498` — `:root.theme-mid .chat-inputbar:focus-within .chat-send-btn`
-   `app\styles\features\chat\themes.css:504` — `:root.theme-mid .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\themes.css:504` — `:root.theme-mid .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\themes.css:512` — `:root.theme-mid .chat-inputbar:focus-within .chat-send-btn::before`
-   `app\styles\features\chat\themes.css:512` — `:root.theme-mid .chat-inputbar .chat-send-btn:hover::before`
-   `app\styles\features\chat\themes.css:512` — `:root.theme-mid .chat-inputbar .chat-send-btn:focus-visible::before`
-   `app\styles\features\chat\themes.css:518` — `:root.theme-mid :is(.chat-tools-menu, .chat-tools-surface-popover)`
-   `app\styles\features\chat\themes.css:526` — `:root.theme-mid .chat-tools-menu .chat-tools-item`
-   `app\styles\features\chat\themes.css:530` — `:root.theme-mid .chat-tools-menu .chat-tools-item:hover`
-   `app\styles\features\chat\themes.css:530` — `:root.theme-mid .chat-tools-menu .chat-tools-item:focus-visible`
-   `app\styles\features\chat\themes.css:535` — `:root.theme-mid .chat-analysis-upload-modal-card`
-   `app\styles\features\chat\themes.css:543` — `:root.theme-mid .chat-analysis-preview-card`
-   `app\styles\features\chat\themes.css:564` — `:root.theme-mid .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:564` — `:root.theme-mid .chat-inputbar:focus-within .chat-send-btn`
-   `app\styles\features\chat\themes.css:564` — `:root.theme-mid .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\themes.css:564` — `:root.theme-mid .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\themes.css:571` — `:root.theme-light.theme-mid .drawer-panel .cs-delete`
-   `app\styles\features\chat\themes.css:578` — `:root.theme-light.theme-mid .drawer-panel .cs-delete:hover`
-   `app\styles\features\chat\themes.css:578` — `:root.theme-light.theme-mid .drawer-panel .cs-delete:focus-visible`
-   `app\styles\features\chat\themes.css:588` — `:root.theme-light.theme-mid .drawer-panel .cs-trash-icon`
-   `app\styles\features\chat\themes.css:595` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"])
  :is(
    .chat-tools-menu,
    .chat-tools-surface-popover,
    .chat-analysis-upload-modal-card,
    .chat-msg-user-bubble
  )`
-   `app\styles\features\chat\themes.css:609` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"])
  .drawer-chat-sidebar
  .drawer-chat-card`
-   `app\styles\features\chat\themes.css:617` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"])
  .drawer-chat-sidebar
  .drawer-pill-btn`
-   `app\styles\features\chat\themes.css:644` — `:root:not(.theme-light):not(.theme-mid) .drawer-panel--chat-glass`
-   `app\styles\features\chat\themes.css:668` — `:root:not(.theme-light) .chat-input-row`
-   `app\styles\features\chat\themes.css:683` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar`
-   `app\styles\features\chat\themes.css:692` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar:hover:not(:focus-within)`
-   `app\styles\features\chat\themes.css:700` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar:focus-within`
-   `app\styles\features\chat\themes.css:708` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-listen-btn`
-   `app\styles\features\chat\themes.css:726` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-send-btn`
-   `app\styles\features\chat\themes.css:746` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-send-btn:hover`
-   `app\styles\features\chat\themes.css:746` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-send-btn:focus-visible`
-   `app\styles\features\chat\themes.css:753` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-listen-btn:hover`
-   `app\styles\features\chat\themes.css:753` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-listen-btn:focus-visible`
-   `app\styles\features\chat\themes.css:761` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-listen-btn svg`
-   `app\styles\features\chat\themes.css:768` — `:root:not(.theme-light):not(.theme-mid)
  .chat-inputbar
  .chat-listen-btn:hover
  svg`
-   `app\styles\features\chat\themes.css:768` — `:root:not(.theme-light):not(.theme-mid)
  .chat-inputbar
  .chat-listen-btn:focus-visible
  svg`
-   `app\styles\features\chat\themes.css:781` — `:root:not(.theme-light):not(.theme-mid) .chat-listen-btn[data-speaking="true"]`
-   `app\styles\features\chat\themes.css:785` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-send-btn[data-recording="true"]`
-   `app\styles\features\chat\themes.css:785` — `:root:not(.theme-light):not(.theme-mid)
  .chat-inputbar
  .chat-send-btn[data-recording-complete="true"]`
-   `app\styles\features\chat\themes.css:792` — `:root:not(.theme-light):not(.theme-mid) .chat-inputbar .chat-send-btn[data-recording="true"]`
-   `app\styles\features\chat\themes.css:797` — `:root:not(.theme-light):not(.theme-mid)
  .chat-inputbar
  .chat-send-btn[data-recording-complete="true"]`
-   `app\styles\features\chat\themes.css:806` — `:root.theme-night
  .drawer-chat-sidebar
  .drawer-chat-card`
-   `app\styles\features\chat\themes.css:816` — `:root.theme-night
  :is(
    .chat-tools-menu,
    .chat-tools-surface-popover,
    .chat-analysis-upload-modal-card,
    .chat-msg-user-bubble
  )`
-   `app\styles\features\documents\agent.css:1` — `.documents-agent-layout`
-   `app\styles\features\documents\agent.css:11` — `.documents-agent-card`
-   `app\styles\features\documents\agent.css:20` — `.documents-agent-card:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:24` — `.documents-panel:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:24` — `.documents-card:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:24` — `.documents-subsection-stack:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:24` — `.documents-shell-surface:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:24` — `.documents-library-panel:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:24` — `.rag-admin-card:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:35` — `.documents-tool-card-header:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:35` — `.documents-upload-control:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:35` — `.documents-controls-grid:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:35` — `.rag-admin-toolbar:has(.documents-dropdown.is-open)`
-   `app\styles\features\documents\agent.css:44` — `.documents-agent-card--full`
-   `app\styles\features\documents\agent.css:48` — `.documents-agent-card-header`
-   `app\styles\features\documents\agent.css:56` — `.documents-agent-card-copy`
-   `app\styles\features\documents\agent.css:61` — `.documents-agent-copy`
-   `app\styles\features\documents\agent.css:68` — `.documents-agent-card-actions`
-   `app\styles\features\documents\agent.css:76` — `.documents-agent-inline-link`
-   `app\styles\features\documents\agent.css:80` — `.documents-agent-documents`
-   `app\styles\features\documents\agent.css:85` — `.documents-agent-document`
-   `app\styles\features\documents\agent.css:89` — `.documents-agent-document-top`
-   `app\styles\features\documents\agent.css:97` — `.documents-agent-row-actions`
-   `app\styles\features\documents\agent.css:105` — `.documents-agent-row-actions--left`
-   `app\styles\features\documents\agent.css:109` — `.documents-agent-empty`
-   `app\styles\features\documents\agent.css:115` — `.documents-agent-empty--inline`
-   `app\styles\features\documents\agent.css:125` — `.documents-agent-empty--inline .documents-selection-chip`
-   `app\styles\features\documents\agent.css:135` — `.documents-agent-empty--inline > p`
-   `app\styles\features\documents\agent.css:145` — `.documents-agent-goal-groups`
-   `app\styles\features\documents\agent.css:150` — `.documents-agent-goal-group`
-   `app\styles\features\documents\agent.css:156` — `.documents-agent-goal-group--template`
-   `app\styles\features\documents\agent.css:165` — `.documents-agent-template-row`
-   `app\styles\features\documents\agent.css:171` — `.documents-agent-template-copy`
-   `app\styles\features\documents\agent.css:176` — `.documents-agent-template-description`
-   `app\styles\features\documents\agent.css:185` — `.documents-agent-template-control`
-   `app\styles\features\documents\agent.css:189` — `.documents-agent-template-note`
-   `app\styles\features\documents\agent.css:193` — `.documents-agent-chip-row`
-   `app\styles\features\documents\agent.css:199` — `.documents-agent-field-label`
-   `app\styles\features\documents\agent.css:207` — `.documents-agent-goal-group > .documents-agent-template-description`
-   `app\styles\features\documents\agent.css:207` — `.documents-agent-template-copy > .documents-agent-template-description`
-   `app\styles\features\documents\agent.css:207` — `.documents-agent-select-grid > .documents-agent-goal-group--full > .documents-agent-template-description`
-   `app\styles\features\documents\agent.css:216` — `.documents-agent-select-grid`
-   `app\styles\features\documents\agent.css:222` — `.documents-agent-select-field`
-   `app\styles\features\documents\agent.css:228` — `.documents-agent-textarea`
-   `app\styles\features\documents\agent.css:235` — `.documents-agent-conversation-meta`
-   `app\styles\features\documents\agent.css:240` — `.documents-agent-conversation-shell`
-   `app\styles\features\documents\agent.css:251` — `.documents-agent-conversation-main`
-   `app\styles\features\documents\agent.css:258` — `.documents-agent-conversation-window`
-   `app\styles\features\documents\agent.css:273` — `:root:not(.theme-light):not(.theme-mid)
  .documents-agent-conversation-window`
-   `app\styles\features\documents\agent.css:279` — `:root.theme-night .documents-agent-conversation-window`
-   `app\styles\features\documents\agent.css:284` — `.documents-agent-conversation-window .chat-window__scroll`
-   `app\styles\features\documents\agent.css:294` — `.documents-agent-composer-slot`
-   `app\styles\features\documents\agent.css:308` — `.documents-agent-composer-slot .chat-input-row`
-   `app\styles\features\documents\agent.css:317` — `.documents-agent-composer-slot .chat-inputbar`
-   `app\styles\features\documents\agent.css:328` — `:root.theme-light .documents-workspace-page--library .documents-agent-composer-slot .chat-inputbar`
-   `app\styles\features\documents\agent.css:333` — `:root.theme-light .documents-workspace-page--library .documents-agent-composer-slot .chat-inputbar .chat-send-btn`
-   `app\styles\features\documents\agent.css:339` — `.documents-agent-composer-slot .chat-inputbar:hover:not(:focus-within)`
-   `app\styles\features\documents\agent.css:339` — `.documents-agent-composer-slot .chat-inputbar:focus-within`
-   `app\styles\features\documents\agent.css:346` — `.documents-agent-composer-slot .chat-input-field`
-   `app\styles\features\documents\agent.css:351` — `.documents-agent-composer-slot .chat-inputbar:not(:focus-within) .chat-input-field`
-   `app\styles\features\documents\agent.css:356` — `.documents-agent-glow-window`
-   `app\styles\features\documents\agent.css:356` — `.documents-agent-glow-composer`
-   `app\styles\features\documents\agent.css:373` — `.documents-agent-glow-window:hover`
-   `app\styles\features\documents\agent.css:373` — `.documents-agent-glow-window:focus-within`
-   `app\styles\features\documents\agent.css:373` — `.documents-agent-glow-composer:hover`
-   `app\styles\features\documents\agent.css:373` — `.documents-agent-glow-composer:focus-within`
-   `app\styles\features\documents\agent.css:385` — `:root.theme-light :is(.documents-agent-glow-window, .documents-agent-glow-composer) > .edgeLight`
-   `app\styles\features\documents\agent.css:385` — `:root.theme-mid :is(.documents-agent-glow-window, .documents-agent-glow-composer) > .edgeLight`
-   `app\styles\features\documents\agent.css:390` — `html[data-contrast="hc"] :is(.documents-agent-glow-window, .documents-agent-glow-composer) > .edgeLight`
-   `app\styles\features\documents\agent.css:394` — `.documents-agent-glow-window`
-   `app\styles\features\documents\agent.css:398` — `.documents-agent-glow-window .documents-agent-conversation-main`
-   `app\styles\features\documents\agent.css:405` — `.documents-agent-glow-window .documents-agent-conversation-window`
-   `app\styles\features\documents\agent.css:416` — `:root:not(.theme-light):not(.theme-mid)
  .documents-agent-glow-window
  .documents-agent-conversation-window`
-   `app\styles\features\documents\agent.css:416` — `:root.theme-night
  .documents-agent-glow-window
  .documents-agent-conversation-window`
-   `app\styles\features\documents\agent.css:426` — `.documents-agent-glow-window .documents-agent-conversation-window .chat-window__scroll`
-   `app\styles\features\documents\agent.css:430` — `.documents-agent-glow-composer`
-   `app\styles\features\documents\agent.css:434` — `.documents-agent-glow-composer .chat-inputbar`
-   `app\styles\features\documents\agent.css:442` — `.documents-agent-glow-composer .chat-inputbar:hover:not(:focus-within)`
-   `app\styles\features\documents\agent.css:442` — `.documents-agent-glow-composer .chat-inputbar:focus-within`
-   `app\styles\features\documents\agent.css:449` — `.documents-agent-dropdown .documents-dropdown-trigger`
-   `app\styles\features\documents\agent.css:453` — `.documents-agent-dropdown .documents-dropdown-menu`
-   `app\styles\features\documents\agent.css:458` — `.documents-agent-result`
-   `app\styles\features\documents\agent.css:463` — `.documents-agent-result-pane`
-   `app\styles\features\documents\agent.css:467` — `.documents-agent-content-pane`
-   `app\styles\features\documents\agent.css:473` — `.documents-subsection-stack.documents-panel`
-   `app\styles\features\documents\agent.css:473` — `.documents-shell-surface`
-   `app\styles\features\documents\agent.css:473` — `.documents-agent-content-pane`
-   `app\styles\features\documents\agent.css:473` — `.documents-agent-card`
-   `app\styles\features\documents\agent.css:481` — `.documents-agent-section-shell`
-   `app\styles\features\documents\agent.css:492` — `.documents-agent-pane-empty`
-   `app\styles\features\documents\agent.css:503` — `.documents-agent-pane-empty > p`
-   `app\styles\features\documents\agent.css:507` — `.documents-agent-result-empty`
-   `app\styles\features\documents\agent.css:518` — `.documents-agent-result-empty > p`
-   `app\styles\features\documents\agent.css:522` — `.documents-agent-results-list`
-   `app\styles\features\documents\agent.css:527` — `.documents-agent-result-row`
-   `app\styles\features\documents\agent.css:532` — `.documents-agent-result-row-top`
-   `app\styles\features\documents\agent.css:540` — `.documents-agent-result-meta`
-   `app\styles\features\documents\agent.css:546` — `.documents-agent-result-content`
-   `app\styles\features\documents\agent.css:551` — `.documents-agent-refine-copy`
-   `app\styles\features\documents\agent.css:556` — `.documents-agent-quick-actions`
-   `app\styles\features\documents\agent.css:566` — `.documents-agent-version-list`
-   `app\styles\features\documents\agent.css:571` — `.documents-agent-version-card`
-   `app\styles\features\documents\agent.css:578` — `.documents-agent-version-card.is-active`
-   `app\styles\features\documents\agent.css:583` — `.documents-agent-version-top`
-   `app\styles\features\documents\agent.css:591` — `.documents-agent-source-card`
-   `app\styles\features\documents\agent.css:597` — `.documents-agent-source-card:hover`
-   `app\styles\features\documents\agent.css:597` — `.documents-agent-source-card:focus-visible`
-   `app\styles\features\documents\agent.css:603` — `.documents-agent-source-list`
-   `app\styles\features\documents\agent.css:608` — `.documents-agent-summary`
-   `app\styles\features\documents\agent.css:614` — `.documents-agent-start-help`
-   `app\styles\features\documents\agent.css:619` — `.documents-controls-grid` _(@media (min-width: 44rem))_
-   `app\styles\features\documents\agent.css:623` — `.documents-agent-handoff-bar` _(@media (min-width: 44rem))_
-   `app\styles\features\documents\agent.css:627` — `.documents-agent-template-row` _(@media (min-width: 44rem))_
-   `app\styles\features\documents\agent.css:631` — `.documents-agent-template-control` _(@media (min-width: 44rem))_
-   `app\styles\features\documents\agent.css:636` — `.documents-document-row-bottom` _(@media (min-width: 44rem))_
-   `app\styles\features\documents\agent.css:643` — `.documents-agent-select-grid` _(@media (min-width: 62rem))_
-   `app\styles\features\documents\agent.css:648` — `.documents-agent-select-grid > .documents-agent-goal-group--full` _(@media (min-width: 62rem))_
-   `app\styles\features\documents\agent.css:655` — `.documents-agent-conversation-shell` _(@media (max-width: 768px))_
-   `app\styles\features\documents\agent.css:659` — `.documents-agent-conversation-window` _(@media (max-width: 768px))_
-   `app\styles\features\documents\agent.css:659` — `.documents-agent-composer-slot` _(@media (max-width: 768px))_
-   `app\styles\features\documents\library.css:1` — `.documents-library-intro .documents-filter-row`
-   `app\styles\features\documents\library.css:5` — `.documents-library-intro`
-   `app\styles\features\documents\library.css:10` — `.documents-library-section`
-   `app\styles\features\documents\library.css:15` — `.documents-framework-banner`
-   `app\styles\features\documents\library.css:28` — `.documents-workspace-page--library .documents-framework-banner.documents-notice`
-   `app\styles\features\documents\library.css:37` — `.dashboard-info-panel .documents-framework-banner--info.documents-notice`
-   `app\styles\features\documents\library.css:44` — `.dashboard-info-panel .documents-framework-banner--info .documents-framework-banner-actions`
-   `app\styles\features\documents\library.css:48` — `.documents-framework-banner-copy`
-   `app\styles\features\documents\library.css:53` — `.documents-framework-banner .documents-subsection-title`
-   `app\styles\features\documents\library.css:57` — `.documents-framework-banner .documents-subsection-description`
-   `app\styles\features\documents\library.css:62` — `.documents-framework-banner-actions`
-   `app\styles\features\documents\library.css:69` — `.documents-library-list-header`
-   `app\styles\features\documents\library.css:77` — `.documents-library-upload-block`
-   `app\styles\features\documents\library.css:82` — `.documents-agent-section`
-   `app\styles\features\documents\library.css:88` — `.documents-section-body > .documents-agent-section`
-   `app\styles\features\documents\library.css:93` — `.documents-agent-handoff-bar`
-   `app\styles\features\documents\library.css:99` — `.documents-agent-handoff-button`
-   `app\styles\features\documents\library.css:103` — `.documents-tool-card-header`
-   `app\styles\features\documents\library.css:111` — `.documents-tool-card-header--inline`
-   `app\styles\features\documents\library.css:115` — `.documents-upload-form`
-   `app\styles\features\documents\library.css:120` — `.documents-upload-surface`
-   `app\styles\features\documents\library.css:129` — `.documents-upload-grid`
-   `app\styles\features\documents\library.css:135` — `.documents-upload-control`
-   `app\styles\features\documents\library.css:140` — `.documents-upload-label`
-   `app\styles\features\documents\library.css:145` — `.documents-upload-dropzone`
-   `app\styles\features\documents\library.css:155` — `.documents-upload-dropzone.is-active .documents-upload-dropzone-trigger`
-   `app\styles\features\documents\library.css:160` — `.documents-upload-dropzone-trigger`
-   `app\styles\features\documents\library.css:175` — `.documents-upload-dropzone-trigger:hover`
-   `app\styles\features\documents\library.css:175` — `.documents-upload-dropzone-trigger:focus-visible`
-   `app\styles\features\documents\library.css:182` — `.documents-upload-dropzone-title`
-   `app\styles\features\documents\library.css:188` — `.documents-upload-dropzone-help`
-   `app\styles\features\documents\library.css:194` — `.documents-upload-selected`
-   `app\styles\features\documents\library.css:200` — `.documents-upload-inline-actions`
-   `app\styles\features\documents\library.css:205` — `.documents-upload-submit-row`
-   `app\styles\features\documents\library.css:210` — `.documents-panel-link`
-   `app\styles\features\documents\library.css:218` — `.documents-library-filters`
-   `app\styles\features\documents\library.css:223` — `.documents-controls-grid`
-   `app\styles\features\documents\library.css:228` — `.documents-primary-button--compact`
-   `app\styles\features\documents\library.css:233` — `.documents-dropdown--kind`
-   `app\styles\features\documents\library.css:239` — `.documents-upload-control--kind`
-   `app\styles\features\documents\library.css:244` — `.documents-selection-chip`
-   `app\styles\features\documents\library.css:248` — `.documents-upload-submit`
-   `app\styles\features\documents\library.css:252` — `.documents-upload-submit`
-   `app\styles\features\documents\library.css:257` — `.documents-row-actions`
-   `app\styles\features\documents\library.css:264` — `.documents-library-list`
-   `app\styles\features\documents\library.css:269` — `.documents-document-row`
-   `app\styles\features\documents\library.css:273` — `.documents-document-row-top`
-   `app\styles\features\documents\library.css:281` — `.documents-document-row-main`
-   `app\styles\features\documents\library.css:289` — `.documents-document-row-side`
-   `app\styles\features\documents\library.css:295` — `.documents-document-row-title`
-   `app\styles\features\documents\library.css:302` — `.documents-document-row-bottom`
-   `app\styles\features\documents\library.css:308` — `.documents-document-row-selection`
-   `app\styles\features\documents\library.css:312` — `.documents-inline-check`
-   `app\styles\features\documents\library.css:321` — `.documents-inline-check--allow`
-   `app\styles\features\documents\library.css:327` — `.documents-checkbox`
-   `app\styles\features\documents\library.css:331` — `.documents-row-help`
-   `app\styles\features\documents\library.css:336` — `.documents-row-help--inline`
-   `app\styles\features\documents\library.css:341` — `.documents-select-card`
-   `app\styles\features\documents\library.css:355` — `.documents-select-card-copy`
-   `app\styles\features\documents\library.css:361` — `.documents-select-card .documents-checkbox`
-   `app\styles\features\documents\library.css:366` — `.documents-row-spacer`
-   `app\styles\features\documents\library.css:370` — `.documents-artifact-snippet`
-   `app\styles\features\documents\mobile.css:10` — `.documents-workspace-page` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:18` — `.documents-workspace-page--documents` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:18` — `.documents-workspace-page--agent` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:34` — `.documents-workspace-shell` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:39` — `.documents-workspace-page--documents :is(
    .documents-library-panel,
    .documents-shell-surface,
    .documents-framework-banner.documents-notice
  )` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:39` — `.documents-workspace-page--documents.documents-workspace-page--library .documents-framework-banner.documents-notice` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:39` — `.documents-workspace-page--agent :is(
    .documents-agent-card,
    .documents-agent-content-pane,
    .documents-agent-result,
    .documents-shell-surface
  )` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:59` — `.documents-workspace-page--documents .documents-page-shell` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:59` — `.documents-workspace-page--agent .documents-page-shell` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:72` — `.documents-workspace-page--documents :is(
    .documents-library-panel,
    .documents-shell-surface,
    .documents-framework-banner.documents-notice
  )` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:72` — `.documents-workspace-page--agent :is(
    .documents-agent-card,
    .documents-agent-content-pane,
    .documents-agent-result,
    .documents-shell-surface
  )` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:88` — `.documents-workspace-page--documents .documents-grid` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:88` — `.documents-workspace-page--agent .documents-grid` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:88` — `.documents-workspace-page--agent .documents-agent-layout` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:94` — `.documents-workspace-page--documents .documents-section-stack` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:94` — `.documents-workspace-page--documents .documents-section-body` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:94` — `.documents-workspace-page--documents .documents-subsection-stack` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:94` — `.documents-workspace-page--documents .documents-framework-banner` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:94` — `.documents-workspace-page--documents .documents-agent-section` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:102` — `.documents-workspace-page--documents .documents-mobile-panel-stack` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:106` — `.documents-workspace-page--documents .documents-framework-banner-copy` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:106` — `.documents-workspace-page--documents .documents-subsection-copy` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:111` — `.documents-workspace-page--documents .documents-framework-banner-actions` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:111` — `.documents-workspace-page--documents .documents-upload-form` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:116` — `.documents-workspace-page--documents .documents-artifact-filter-row` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:120` — `.documents-workspace-page--agent .documents-agent-layout` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:124` — `.documents-workspace-page--agent :is(
    .documents-agent-card,
    .documents-agent-content-pane,
    .documents-agent-result,
    .documents-agent-goal-groups,
    .documents-agent-select-grid,
    .documents-agent-conversation-meta,
    .documents-agent-conversation-shell
  )` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:136` — `.documents-workspace-page--agent :is(
    .documents-agent-card-copy,
    .documents-agent-template-copy,
    .documents-agent-refine-copy
  )` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:144` — `.documents-workspace-page--agent :is(
    .documents-agent-goal-group,
    .documents-agent-template-row,
    .documents-agent-documents,
    .documents-agent-row-actions,
    .documents-agent-card-actions,
    .documents-agent-chip-row,
    .documents-agent-summary
  )` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:156` — `.documents-primary-button` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:156` — `.documents-secondary-button` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:156` — `.documents-danger-button` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:164` — `.documents-page-header-row` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:168` — `.documents-tool-card-header` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:168` — `.documents-tool-card-header--inline` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:174` — `.documents-filter-row` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:178` — `.documents-admin-role-menu` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:183` — `.documents-admin-role-menu .workspace-role-cycle-button` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:190` — `.documents-controls-grid` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:194` — `.documents-upload-grid` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:198` — `.documents-upload-control--kind` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:204` — `.documents-dropdown--kind` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:210` — `.documents-framework-banner` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:214` — `.documents-framework-banner-actions` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:218` — `.documents-framework-banner-actions > *` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:222` — `.documents-upload-submit-row` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:226` — `.documents-upload-submit-row > *` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:230` — `.documents-upload-submit` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:234` — `.documents-agent-template-row` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:234` — `.documents-agent-select-grid` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:239` — `.documents-agent-template-control` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:245` — `.documents-panel` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:245` — `.documents-subpanel` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:245` — `.documents-card` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:251` — `.documents-agent-handoff-bar` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:251` — `.documents-document-row-top` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:251` — `.documents-document-row-bottom` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:251` — `.documents-agent-document-top` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:251` — `.documents-agent-version-top` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:261` — `.documents-inline-check--allow` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:267` — `.documents-document-row-side` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:273` — `.documents-row-help` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:277` — `.documents-row-actions` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mobile.css:281` — `.documents-agent-card-actions` _(@media (max-width: 768px))_
-   `app\styles\features\documents\mono.css:80` — `:root.theme-mono:not([data-contrast="hc"]) .documents-workspace :is(.documents-field, .documents-dropdown-trigger, .documents-form-input, .documents-agent-textarea)`
-   `app\styles\features\documents\mono.css:87` — `:root.theme-mono:not([data-contrast="hc"]) .documents-workspace :is(.documents-field, .documents-dropdown-trigger, .documents-form-input, .documents-agent-textarea):is(:hover, :focus-visible, :focus-within, .is-open)`
-   `app\styles\features\documents\mono.css:92` — `:root.theme-mono:not([data-contrast="hc"]) :is(.documents-workspace .documents-dropdown-menu, .documents-dropdown-menu.documents-dropdown-menu--portal:not(.pre-inquiry-dropdown-menu))`
-   `app\styles\features\documents\mono.css:101` — `:root.theme-mono:not([data-contrast="hc"]) :is(.documents-workspace .documents-dropdown-item, .documents-dropdown-menu.documents-dropdown-menu--portal:not(.pre-inquiry-dropdown-menu) .documents-dropdown-item)`
-   `app\styles\features\documents\mono.css:106` — `:root.theme-mono:not([data-contrast="hc"]) :is(.documents-workspace .documents-dropdown-item:hover, .documents-workspace .documents-dropdown-item:focus-visible, .documents-dropdown-menu.documents-dropdown-menu--portal:not(.pre-inquiry-dropdown-menu) .documents-dropdown-item:hover, .documents-dropdown-menu.documents-dropdown-menu--portal:not(.pre-inquiry-dropdown-menu) .documents-dropdown-item:focus-visible)`
-   `app\styles\features\documents\mono.css:110` — `:root.theme-mono:not([data-contrast="hc"]) :is(.documents-workspace .documents-dropdown-item.is-active, .documents-dropdown-menu.documents-dropdown-menu--portal:not(.pre-inquiry-dropdown-menu) .documents-dropdown-item.is-active)`
-   `app\styles\features\documents\ui.css:1` — `.documents-panel`
-   `app\styles\features\documents\ui.css:12` — `.documents-shell-surface`
-   `app\styles\features\documents\ui.css:19` — `.documents-page-shell`
-   `app\styles\features\documents\ui.css:29` — `.documents-page-shell--content`
-   `app\styles\features\documents\ui.css:42` — `.documents-workspace-page--library .documents-page-shell.workspace-guide-panel-scroll`
-   `app\styles\features\documents\ui.css:46` — `.documents-workspace-page--library .documents-page-shell.workspace-guide-panel-scroll > *`
-   `app\styles\features\documents\ui.css:51` — `.documents-workspace-shell--embedded > .documents-grid.workspace-guide-panel-scroll`
-   `app\styles\features\documents\ui.css:69` — `.documents-workspace-shell--embedded
    > .documents-grid.workspace-guide-panel-scroll
    > .workspace-scroll-back-button` _(@media (min-width: 769px))_
-   `app\styles\features\documents\ui.css:76` — `.documents-workspace-shell--embedded
    > .documents-grid.workspace-guide-panel-scroll
    > .dashboard-info-trigger-corner` _(@media (min-width: 769px))_
-   `app\styles\features\documents\ui.css:84` — `.documents-workspace-shell.workspace-guide-panel
  > .documents-grid.workspace-guide-panel-scroll
  > .documents-admin-role-menu`
-   `app\styles\features\documents\ui.css:91` — `.documents-workspace-page--library :is(
  .documents-framework-banner.documents-notice,
  .documents-library-panel,
  .documents-agent-card,
  .documents-agent-content-pane,
  .documents-agent-result,
  .documents-shell-surface
)`
-   `app\styles\features\documents\ui.css:102` — `.documents-admin-role-menu`
-   `app\styles\features\documents\ui.css:112` — `.documents-admin-role-menu--viewport`
-   `app\styles\features\documents\ui.css:119` — `.documents-admin-role-menu .workspace-role-cycle-button`
-   `app\styles\features\documents\ui.css:145` — `.documents-admin-role-menu .workspace-role-cycle-button:hover`
-   `app\styles\features\documents\ui.css:145` — `.documents-admin-role-menu .workspace-role-cycle-button:focus-visible`
-   `app\styles\features\documents\ui.css:152` — `.documents-admin-role-menu .workspace-role-cycle-button:disabled`
-   `app\styles\features\documents\ui.css:158` — `:root.theme-light .documents-admin-role-menu .workspace-role-cycle-button`
-   `app\styles\features\documents\ui.css:158` — `:root.theme-mid .documents-admin-role-menu .workspace-role-cycle-button`
-   `app\styles\features\documents\ui.css:167` — `.documents-workspace-page--library .documents-surface-panel`
-   `app\styles\features\documents\ui.css:179` — `.documents-workspace-page--library:is(
  .documents-workspace-page--documents,
  .documents-workspace-page--agent
) .documents-workspace-shell.workspace-guide-panel`
-   `app\styles\features\documents\ui.css:190` — `.documents-workspace-page--library:is(
  .documents-workspace-page--documents,
  .documents-workspace-page--agent
) .documents-surface-panel`
-   `app\styles\features\documents\ui.css:202` — `.documents-card`
-   `app\styles\features\documents\ui.css:210` — `.documents-subpanel`
-   `app\styles\features\documents\ui.css:218` — `.documents-inline-section`
-   `app\styles\features\documents\ui.css:223` — `.documents-content`
-   `app\styles\features\documents\ui.css:236` — `.documents-form-input`
-   `app\styles\features\documents\ui.css:249` — `.documents-field option`
-   `app\styles\features\documents\ui.css:253` — `.documents-field--textarea`
-   `app\styles\features\documents\ui.css:279` — `.documents-dropdown.is-open`
-   `app\styles\features\documents\ui.css:325` — `.documents-dropdown-label.is-placeholder`
-   `app\styles\features\documents\ui.css:336` — `.documents-dropdown-icon.is-open`
-   `app\styles\features\documents\ui.css:340` — `.documents-dropdown-menu`
-   `app\styles\features\documents\ui.css:359` — `.documents-dropdown-item`
-   `app\styles\features\documents\ui.css:382` — `.documents-dropdown-item:hover`
-   `app\styles\features\documents\ui.css:382` — `.documents-dropdown-item:focus-visible`
-   `app\styles\features\documents\ui.css:387` — `.documents-dropdown-item.is-active`
-   `app\styles\features\documents\ui.css:393` — `.documents-dropdown-item:active`
-   `app\styles\features\documents\ui.css:397` — `.documents-dropdown-item + .documents-dropdown-item`
-   `app\styles\features\documents\ui.css:401` — `.documents-chip`
-   `app\styles\features\documents\ui.css:414` — `.documents-chip:hover`
-   `app\styles\features\documents\ui.css:414` — `.documents-chip:focus-visible`
-   `app\styles\features\documents\ui.css:420` — `.documents-chip:active`
-   `app\styles\features\documents\ui.css:424` — `.documents-chip.is-active`
-   `app\styles\features\documents\ui.css:430` — `.documents-chip-count`
-   `app\styles\features\documents\ui.css:440` — `:root.theme-mid .documents-chip.is-active`
-   `app\styles\features\documents\ui.css:444` — `.documents-link-button`
-   `app\styles\features\documents\ui.css:448` — `.documents-link-button:hover`
-   `app\styles\features\documents\ui.css:448` — `.documents-link-button:focus-visible`
-   `app\styles\features\documents\ui.css:453` — `.documents-primary-button`
-   `app\styles\features\documents\ui.css:462` — `.documents-secondary-button`
-   `app\styles\features\documents\ui.css:475` — `.documents-secondary-button:is(:hover, :focus-visible)`
-   `app\styles\features\documents\ui.css:481` — `.documents-upload-choose-button`
-   `app\styles\features\documents\ui.css:494` — `.documents-upload-choose-button:is(:hover, :focus-visible)`
-   `app\styles\features\documents\ui.css:499` — `.documents-danger-button`
-   `app\styles\features\documents\ui.css:512` — `.documents-danger-button:is(:hover, :focus-visible)`
-   `app\styles\features\documents\ui.css:517` — `.documents-notice`
-   `app\styles\features\documents\ui.css:525` — `.documents-notice--info`
-   `app\styles\features\documents\ui.css:531` — `.documents-notice--success`
-   `app\styles\features\documents\ui.css:537` — `.documents-notice--muted`
-   `app\styles\features\documents\ui.css:544` — `.documents-subsection-stack.documents-panel`
-   `app\styles\features\documents\ui.css:544` — `.documents-shell-surface`
-   `app\styles\features\documents\ui.css:544` — `.documents-agent-content-pane`
-   `app\styles\features\documents\ui.css:544` — `.documents-agent-card`
-   `app\styles\features\documents\ui.css:544` — `.documents-framework-banner.documents-notice`
-   `app\styles\features\documents\ui.css:554` — `.documents-notice--warning`
-   `app\styles\features\documents\ui.css:560` — `.documents-notice--error`
-   `app\styles\features\documents\ui.css:566` — `.documents-empty-state`
-   `app\styles\features\documents\ui.css:575` — `.documents-meta-text`
-   `app\styles\features\documents\ui.css:582` — `.documents-results-summary`
-   `app\styles\features\documents\ui.css:588` — `.documents-primary-button:disabled`
-   `app\styles\features\documents\ui.css:588` — `.documents-primary-button[aria-disabled="true"]`
-   `app\styles\features\documents\ui.css:588` — `.documents-secondary-button:disabled`
-   `app\styles\features\documents\ui.css:588` — `.documents-secondary-button[aria-disabled="true"]`
-   `app\styles\features\documents\ui.css:595` — `.documents-strong-text`
-   `app\styles\features\documents\ui.css:599` — `.documents-source-pill`
-   `app\styles\features\documents\ui.css:694` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-workspace-card,
  .documents-panel,
  .documents-subpanel,
  .documents-card,
  .documents-surface-panel,
  .documents-framework-banner,
  .documents-agent-goal-group--template,
  .documents-agent-quick-actions,
  .documents-select-card,
  .documents-content
)`
-   `app\styles\features\documents\ui.css:711` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-workspace-card,
  .documents-panel,
  .documents-subpanel,
  .documents-card,
  .documents-surface-panel,
  .documents-framework-banner,
  .documents-notice,
  .documents-content
).\!border-0`
-   `app\styles\features\documents\ui.css:724` — `html[data-contrast="hc"] .documents-workspace .documents-panel-link`
-   `app\styles\features\documents\ui.css:724` — `html[data-contrast="hc"] .documents-workspace .documents-panel-link:is(:hover, :focus-visible, :active)`
-   `app\styles\features\documents\ui.css:733` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-field,
  .documents-dropdown-trigger,
  .documents-dropdown-menu,
  .documents-form-input,
  .documents-agent-textarea
)`
-   `app\styles\features\documents\ui.css:745` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-field,
  .documents-dropdown-trigger,
  .documents-form-input,
  .documents-agent-textarea
)`
-   `app\styles\features\documents\ui.css:754` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-field,
  .documents-dropdown-trigger,
  .documents-form-input,
  .documents-agent-textarea
)::placeholder`
-   `app\styles\features\documents\ui.css:763` — `html[data-contrast="hc"] .documents-workspace .documents-dropdown-menu`
-   `app\styles\features\documents\ui.css:767` — `html[data-contrast="hc"] .documents-workspace .documents-dropdown-item`
-   `app\styles\features\documents\ui.css:773` — `html[data-contrast="hc"] .documents-workspace .documents-dropdown-item:hover`
-   `app\styles\features\documents\ui.css:773` — `html[data-contrast="hc"] .documents-workspace .documents-dropdown-item:focus-visible`
-   `app\styles\features\documents\ui.css:779` — `html[data-contrast="hc"] .documents-workspace .documents-dropdown-item.is-active`
-   `app\styles\features\documents\ui.css:784` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-chip,
  .documents-source-pill
)`
-   `app\styles\features\documents\ui.css:794` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-chip.is-active,
  .documents-agent-version-card.is-active
)`
-   `app\styles\features\documents\ui.css:802` — `html[data-contrast="hc"] .documents-workspace [data-control-type]`
-   `app\styles\features\documents\ui.css:825` — `html[data-contrast="hc"] .documents-workspace [data-control-type]::before`
-   `app\styles\features\documents\ui.css:830` — `html[data-contrast="hc"] .documents-workspace [data-control-type]:is(:hover, :focus-visible)`
-   `app\styles\features\documents\ui.css:837` — `html[data-contrast="hc"] .documents-workspace [data-control-type][data-checked="true"]`
-   `app\styles\features\documents\ui.css:844` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-primary-button,
  .documents-secondary-button,
  .documents-danger-button,
  .documents-upload-choose-button,
  .documents-admin-role-menu .workspace-role-cycle-button
)`
-   `app\styles\features\documents\ui.css:857` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-primary-button,
  .documents-secondary-button,
  .documents-danger-button,
  .documents-upload-choose-button
):is(:hover, :focus-visible, :active)`
-   `app\styles\features\documents\ui.css:867` — `html[data-contrast="hc"] .documents-workspace :is(
  .documents-notice--info,
  .documents-notice--success,
  .documents-notice--warning,
  .documents-notice--error,
  .documents-notice--muted,
  .documents-empty-state
)`
-   `app\styles\features\documents\ui.css:880` — `html[data-contrast="hc"] .documents-workspace-page--library :is(
  .documents-framework-banner.documents-notice,
  .documents-library-panel,
  .documents-shell-surface,
  .documents-panel.documents-surface-panel,
  .documents-subsection-stack.documents-panel
)`
-   `app\styles\features\documents\ui.css:890` — `html[data-contrast="hc"] .documents-workspace-page--library .documents-page-shell`
-   `app\styles\features\documents\ui.css:898` — `html[data-contrast="hc"] .documents-workspace .documents-agent-conversation-window`
-   `app\styles\features\documents\ui.css:904` — `html[data-contrast="hc"] .documents-workspace .documents-agent-glow-window`
-   `app\styles\features\documents\ui.css:912` — `html[data-contrast="hc"] .documents-workspace .documents-agent-composer-slot .chat-inputbar`
-   `app\styles\features\documents\ui.css:920` — `html[data-contrast="hc"] .documents-workspace .documents-agent-composer-slot .chat-input-field`
-   `app\styles\features\documents\ui.css:925` — `html[data-contrast="hc"] .documents-workspace .documents-agent-composer-slot .chat-input-field::placeholder`
-   `app\styles\features\documents\ui.css:929` — `html[data-contrast="hc"] .documents-workspace-page--library`
-   `app\styles\features\documents\ui.css:941` — `html[data-contrast="hc"] .documents-workspace-page--library :is(
  .documents-framework-banner.documents-notice,
  .documents-library-panel,
  .documents-shell-surface,
  .documents-agent-content-pane,
  .documents-agent-card,
  .documents-panel.documents-surface-panel,
  .documents-subsection-stack.documents-panel
)`
-   `app\styles\features\documents\workspace.css:243` — `.documents-workspace-shell`
-   `app\styles\features\documents\workspace.css:252` — `.documents-workspace-shell--documents`
-   `app\styles\features\documents\workspace.css:256` — `.documents-workspace-shell--artifacts`
-   `app\styles\features\documents\workspace.css:262` — `.documents-workspace-shell--agent`
-   `app\styles\features\documents\workspace.css:269` — `.documents-workspace-shell--embedded`
-   `app\styles\features\documents\workspace.css:277` — `.documents-workspace-shell--embedded > .documents-grid`
-   `app\styles\features\documents\workspace.css:289` — `.documents-workspace-shell--embedded .documents-surface-panel`
-   `app\styles\features\documents\workspace.css:300` — `.documents-workspace-shell--embedded :is(
  .documents-panel,
  .documents-library-panel,
  .documents-shell-surface,
  .documents-subsection-stack
)`
-   `app\styles\features\documents\workspace.css:317` — `.documents-workspace-shell.workspace-guide-panel > .documents-grid`
-   `app\styles\features\documents\workspace.css:330` — `.documents-workspace-shell.workspace-guide-panel > .documents-grid.workspace-guide-panel-scroll`
-   `app\styles\features\documents\workspace.css:335` — `.documents-workspace-page`
-   `app\styles\features\documents\workspace.css:340` — `.documents-workspace-page--documents`
-   `app\styles\features\documents\workspace.css:340` — `.documents-workspace-page--agent`
-   `app\styles\features\documents\workspace.css:355` — `.documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:381` — `:root.theme-light .documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:412` — `:root.theme-mid .documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:444` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"]) .documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:515` — `:root.theme-night .documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:564` — `.documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:584` — `:root.theme-light .documents-workspace.documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:584` — `:root.theme-mid .documents-workspace.documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:584` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"]) .documents-workspace.documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:584` — `:root.theme-night .documents-workspace.documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:584` — `html[data-contrast="hc"] .documents-workspace.documents-workspace-page--library`
-   `app\styles\features\documents\workspace.css:609` — `.documents-workspace-content`
-   `app\styles\features\documents\workspace.css:614` — `.documents-panel--primary`
-   `app\styles\features\documents\workspace.css:619` — `.documents-page-header`
-   `app\styles\features\documents\workspace.css:628` — `.documents-page-header-row`
-   `app\styles\features\documents\workspace.css:637` — `.documents-section-title`
-   `app\styles\features\documents\workspace.css:646` — `.documents-subsection-title`
-   `app\styles\features\documents\workspace.css:656` — `.documents-section-title` _(@media (max-width: 768px))_
-   `app\styles\features\documents\workspace.css:656` — `.documents-subsection-title` _(@media (max-width: 768px))_
-   `app\styles\features\documents\workspace.css:663` — `.documents-section-description`
-   `app\styles\features\documents\workspace.css:672` — `.documents-grid`
-   `app\styles\features\documents\workspace.css:677` — `.documents-section-stack`
-   `app\styles\features\documents\workspace.css:682` — `.documents-section-body`
-   `app\styles\features\documents\workspace.css:687` — `.documents-subsection-stack`
-   `app\styles\features\documents\workspace.css:692` — `.documents-subsection-copy`
-   `app\styles\features\documents\workspace.css:698` — `.documents-subsection-description`
-   `app\styles\features\documents\workspace.css:705` — `.documents-filter-row`
-   `app\styles\features\home\desktop.css:2` — `.homepage-root
    :is(.glass-card, .glass-card-dark, .centered-back-left, .centered-back-right)` _(@supports (box-shadow: 0 0 6px rgba(0, 0, 0, 0.1)))_
-   `app\styles\features\home\desktop.css:7` — `.homepage-root
    :is(
      .three-d-card[data-phase="flippingToBack"],
      .three-d-card.mobile-flipped-left,
      .three-d-card.mobile-flipped-right
    )
    .card-face.front
    :is(.glass-card, .glass-card-dark)` _(@supports (box-shadow: 0 0 6px rgba(0, 0, 0, 0.1)))_
-   `app\styles\features\home\desktop.css:19` — `.bottom-logo-breathe`
-   `app\styles\features\home\desktop.css:38` — `html[data-reduce-motion="1"] .bottom-logo-breathe`
-   `app\styles\features\home\desktop.css:43` — `.bottom-logo-breathe` _(@media (prefers-reduced-motion: reduce))_
-   `app\styles\features\home\desktop.css:48` — `[class*="home-logo-shine-rect"]`
-   `app\styles\features\home\desktop.css:52` — `.homepage-root :is(.home-card-bg-kerahele, .home-card-bg-keratume)::before`
-   `app\styles\features\home\desktop.css:56` — `:root.theme-night .homepage-root .home-card-bg-kerahele::before`
-   `app\styles\features\home\desktop.css:56` — `:root.theme-night .homepage-root .home-card-bg-keratume::before`
-   `app\styles\features\home\desktop.css:56` — `html[data-contrast="hc"] .homepage-root .home-card-bg-kerahele::before`
-   `app\styles\features\home\desktop.css:56` — `html[data-contrast="hc"] .homepage-root .home-card-bg-keratume::before`
-   `app\styles\features\home\desktop.css:64` — `:root:not(.theme-light):not(.theme-mid) .homepage-root .home-card-bg-kerahele::before` _(@media (prefers-color-scheme: dark))_
-   `app\styles\features\home\desktop.css:64` — `:root:not(.theme-light):not(.theme-mid) .homepage-root .home-card-bg-keratume::before` _(@media (prefers-color-scheme: dark))_
-   `app\styles\features\home\desktop.css:70` — `.homepage-root .home-card-front-logo-ai [class*="home-logo-shine-rect"]`
-   `app\styles\features\home\desktop.css:78` — `.homepage-root .home-card-front-logo-smust [class*="home-logo-shine-rect"]`
-   `app\styles\features\home\desktop.css:86` — `.homepage-root .home-card-front-logo [class*="home-logo-shine-rect"]`
-   `app\styles\features\home\desktop.css:201` — `html[data-reduce-motion="1"] .homepage-root .home-card-front-logo [class*="home-logo-shine-rect"]`
-   `app\styles\features\home\desktop.css:206` — `.homepage-root .home-card-front-logo [class*="home-logo-shine-sweep"]`
-   `app\styles\features\home\desktop.css:211` — `.homepage-root .home-card-front-logo [class*="home-logo-shine-rect"]` _(@media (prefers-reduced-motion: reduce))_
-   `app\styles\features\home\desktop.css:217` — `.homepage-root .home-bottom-sections-preintro`
-   `app\styles\features\home\desktop.css:217` — `.homepage-root .home-footer-preintro`
-   `app\styles\features\home\desktop.css:222` — `.homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:235` — `.homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:250` — `:root.theme-light:not(.theme-mid) .homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:255` — `:root.theme-light:not(.theme-mid) .homepage-root .home-about-panel` _(@media (min-width: 48.001em))_
-   `app\styles\features\home\desktop.css:262` — `:root.theme-light:not(.theme-mid) .homepage-root .home-before-links`
-   `app\styles\features\home\desktop.css:266` — `:root.theme-light:not(.theme-mid) .homepage-root .home-before-links :is(.home-quick-link, .home-quick-link svg, .home-quick-label)`
-   `app\styles\features\home\desktop.css:270` — `:root.theme-mid .homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:275` — `:root.theme-mid .homepage-root .home-about-panel` _(@media (min-width: 48.001em))_
-   `app\styles\features\home\desktop.css:282` — `:root.theme-mid .homepage-root .home-before-links`
-   `app\styles\features\home\desktop.css:286` — `:root.theme-mid .homepage-root .home-before-links :is(.home-quick-link, .home-quick-link svg, .home-quick-label)`
-   `app\styles\features\home\desktop.css:290` — `:root.theme-mid .homepage-root .home-before-contact-copy`
-   `app\styles\features\home\desktop.css:290` — `:root.theme-mid .homepage-root .home-before-contact-copy :is(p, span, div)`
-   `app\styles\features\home\desktop.css:295` — `.homepage-root .home-before-links .home-quick-label`
-   `app\styles\features\home\desktop.css:302` — `.homepage-root .home-before-links .home-quick-link:is(:hover, :focus-visible) + .home-quick-label`
-   `app\styles\features\home\desktop.css:306` — `.homepage-root .home-before-links .home-quick-link:is(:hover, :focus-visible) + .home-quick-label::after`
-   `app\styles\features\home\desktop.css:310` — `.homepage-root .home-before-carousel-arrow`
-   `app\styles\features\home\desktop.css:314` — `html[data-contrast="hc"] .homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:318` — `:root.theme-night:not(.theme-mid) .homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:322` — `.homepage-root .home-before-contact-button`
-   `app\styles\features\home\desktop.css:329` — `.homepage-root .home-before-contact-copy :is(a[x-apple-data-detectors], a[href^="tel:"], a[href^="mailto:"])`
-   `app\styles\features\home\desktop.css:334` — `.homepage-root .home-before-contact-copy :is(a[x-apple-data-detectors], a[href^="tel:"], a[href^="mailto:"]) *`
-   `app\styles\features\home\desktop.css:339` — `.homepage-root .home-about-panel` _(@media (min-width: 48.001em))_
-   `app\styles\features\home\desktop.css:352` — `.homepage-root .home-about-panel` _(@media (min-width: 48.001em))_
-   `app\styles\features\home\desktop.css:360` — `.homepage-root .home-card-a11y-button`
-   `app\styles\features\home\desktop.css:365` — `html[data-ui-profile="mac"] .homepage-root .three-d-card.left`
-   `app\styles\features\home\desktop.css:365` — `html[data-ui-profile="mac"] .homepage-root .three-d-card.right`
-   `app\styles\features\home\desktop.css:365` — `html[data-ui-scale="mac"] .homepage-root .three-d-card.left`
-   `app\styles\features\home\desktop.css:365` — `html[data-ui-scale="mac"] .homepage-root .three-d-card.right`
-   `app\styles\features\home\desktop.css:372` — `.homepage-root .home-card-a11y-button:focus-visible`
-   `app\styles\features\home\desktop.css:378` — `.homepage-root .home-card-a11y-button:focus-visible::after`
-   `app\styles\features\home\desktop.css:388` — `html[data-contrast="hc"] .homepage-root .home-card-a11y-button:focus-visible`
-   `app\styles\features\home\desktop.css:393` — `html[data-contrast="hc"] .homepage-root .home-card-a11y-button:focus-visible::after`
-   `app\styles\features\home\desktop.css:398` — `.homepage-root
  :is(
    .three-d-card[data-phase="flippingToBack"],
    .three-d-card.mobile-flipped-left,
    .three-d-card.mobile-flipped-right
  )
  .card-face.back
  :is(.centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:409` — `.homepage-root
  :is(
    .three-d-card[data-phase="back"],
    .three-d-card.mobile-flipped-left,
    .three-d-card.mobile-flipped-right
  )
  .card-face.back
  :is(.centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:420` — `.homepage-root .three-d-card[data-phase="flippingToFront"] .card-face.back
  :is(.centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:425` — `.homepage-root .three-d-card[data-phase="flippingToFront"] .card-face.front
  :is(.glass-card, .glass-card-dark)`
-   `app\styles\features\home\desktop.css:431` — `.homepage-root .three-d-card.is-auto-rotating`
-   `app\styles\features\home\desktop.css:435` — `.homepage-root .three-d-card.is-auto-rotating .card-face.front
  :is(.glass-card, .glass-card-dark)`
-   `app\styles\features\home\desktop.css:440` — `.homepage-root .three-d-card.is-auto-rotating .card-face.back
  :is(.centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:445` — `.homepage-root .three-d-card.is-auto-rotating .card-wrapper`
-   `app\styles\features\home\desktop.css:450` — `.homepage-root .three-d-card.right.is-auto-rotating .card-wrapper`
-   `app\styles\features\home\desktop.css:454` — `.homepage-root .three-d-card > .card-wrapper`
-   `app\styles\features\home\desktop.css:458` — `.homepage-root .home-card-rotating-backdrop`
-   `app\styles\features\home\desktop.css:476` — `.homepage-root .home-card-rotating-backdrop-front`
-   `app\styles\features\home\desktop.css:481` — `.homepage-root .home-card-rotating-backdrop-back`
-   `app\styles\features\home\desktop.css:486` — `.homepage-root .home-card-rotating-backdrop-hidden`
-   `app\styles\features\home\desktop.css:490` — `.homepage-root .home-card-rotating-backdrop-reveal`
-   `app\styles\features\home\desktop.css:494` — `.homepage-root .home-card-rotating-backdrop-ready`
-   `app\styles\features\home\desktop.css:498` — `:root
  .homepage-root
  .three-d-card:is(:hover, :focus-within, :active)
  .home-card-rotating-backdrop`
-   `app\styles\features\home\desktop.css:522` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"])
  .homepage-root
  .three-d-card
  .card-face.front
  :is(.glass-card, .glass-card-dark)`
-   `app\styles\features\home\desktop.css:532` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"])
  .homepage-root
  .three-d-card
  .card-face.back
  :is(.centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:543` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"])
  .homepage-root
  .three-d-card
  .card-face
  :is(.glass-card, .glass-card-dark, .centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:543` — `:root.theme-night:not(.theme-mid) .homepage-root .three-d-card .card-face :is(.glass-card, .glass-card-dark, .centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:543` — `html[data-contrast="hc"]:not(.theme-mid) .homepage-root .three-d-card .card-face :is(.glass-card, .glass-card-dark, .centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:556` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"])
  .homepage-root
  .three-d-card:not(.is-auto-rotating):is(:hover, :focus-within, :active)
  .card-face
  :is(.glass-card, .glass-card-dark, .centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:556` — `:root.theme-night:not(.theme-mid) .homepage-root .three-d-card:not(.is-auto-rotating):is(:hover, :focus-within, :active) .card-face :is(.glass-card, .glass-card-dark, .centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:556` — `html[data-contrast="hc"]:not(.theme-mid) .homepage-root .three-d-card:not(.is-auto-rotating):is(:hover, :focus-within, :active) .card-face :is(.glass-card, .glass-card-dark, .centered-back-left, .centered-back-right)`
-   `app\styles\features\home\desktop.css:605` — `.homepage-root .home-about-scrollbox`
-   `app\styles\features\home\desktop.css:618` — `.homepage-root .home-about-panel .home-about-scrollbox`
-   `app\styles\features\home\desktop.css:625` — `.homepage-root .home-about-scrollbox > *`
-   `app\styles\features\home\desktop.css:632` — `.homepage-root .home-about-scrollbox::-webkit-scrollbar`
-   `app\styles\features\home\desktop.css:638` — `.homepage-root .home-about-scrollbox`
-   `app\styles\features\home\desktop.css:638` — `.homepage-root .home-about-scrollbox :is(p, div, strong, b, a, span)`
-   `app\styles\features\home\desktop.css:650` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"])
  .homepage-root
  .home-about-panel`
-   `app\styles\features\home\desktop.css:650` — `:root.theme-night:not(.theme-mid) .homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:650` — `html[data-contrast="hc"]:not(.theme-mid) .homepage-root .home-about-panel`
-   `app\styles\features\home\desktop.css:659` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"])
  .homepage-root
  .home-about-panel:is(:hover, :focus-within, :active)`
-   `app\styles\features\home\desktop.css:659` — `:root.theme-night:not(.theme-mid) .homepage-root .home-about-panel:is(:hover, :focus-within, :active)`
-   `app\styles\features\home\desktop.css:659` — `html[data-contrast="hc"]:not(.theme-mid) .homepage-root .home-about-panel:is(:hover, :focus-within, :active)`
-   `app\styles\features\home\mobile.css:3` — `body.homepage .homepage-root` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:13` — `.homepage-root .home-footer-logo-wrap` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:18` — `.homepage-root > div > footer` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:24` — `.homepage-root .home-card-front-logo [class*="home-logo-shine-rect"]` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:30` — `.homepage-root .home-before-links` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:48` — `.homepage-root .home-before-carousel-arrow` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:77` — `.homepage-root .home-before-carousel-arrow--prev` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:81` — `.homepage-root .home-before-carousel-arrow--next` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:85` — `.homepage-root .home-before-carousel-arrow:is(:hover, :focus-visible, :active)` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:91` — `.homepage-root .home-before-carousel-arrow:active` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:95` — `.homepage-root .home-before-carousel-arrow svg` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:105` — `.homepage-root .home-before-link-list` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:139` — `.homepage-root .home-before-link-list:focus-visible` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:144` — `.homepage-root .home-before-link-list::-webkit-scrollbar` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:148` — `.homepage-root .home-before-link-item` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:161` — `.homepage-root .home-before-link-item[data-quick-visibility="hidden"]` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:166` — `.homepage-root
    .home-before-link-item:is(
      [data-quick-visibility="active"],
      [data-quick-visibility="adjacent"]
    )` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:174` — `.homepage-root .home-before-link-item:is(:first-child, :last-child)` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:178` — `.homepage-root .home-before-link-item .home-quick-link` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:185` — `.homepage-root .home-before-link-item .home-quick-link svg` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:198` — `.homepage-root .home-before-link-item[data-active="true"] .home-quick-link svg` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:203` — `.homepage-root .home-before-link-item .home-quick-label` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:230` — `.homepage-root .home-before-link-item .home-quick-label::after` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:234` — `.homepage-root .home-before-link-item[data-active="true"] .home-quick-label` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:240` — `.homepage-root .home-before-links + *` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:246` — `.homepage-root .home-about-panel` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:250` — `:root.theme-light:not(.theme-mid) .homepage-root .home-about-panel` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:254` — `:root.theme-mid .homepage-root .home-about-panel` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:258` — `html[data-contrast="hc"] .homepage-root .home-about-panel` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:262` — `:root.theme-night:not(.theme-mid) .homepage-root .home-about-panel` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:266` — `.homepage-root .home-about-panel` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:275` — `.homepage-root .home-about-scrollbox` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:295` — `body.homepage:is(.modal-open, .login-modal-open, .home-profile-open)
    .homepage-root
    .three-d-card` _(@media (max-width: 768px))_
-   `app\styles\features\home\mobile.css:295` — `body.homepage[data-a11y-scroll-lock="1"] .homepage-root .three-d-card` _(@media (max-width: 768px))_
-   `app\styles\features\home\themes.css:8` — `:root.theme-light body.homepage`
-   `app\styles\features\home\themes.css:39` — `:root.theme-light:not(.theme-mid) body.homepage`
-   `app\styles\features\home\themes.css:43` — `:root.theme-light:not(.theme-mid) body.homepage .homepage-root`
-   `app\styles\features\home\themes.css:50` — `:root.theme-mid body.homepage`
-   `app\styles\features\home\themes.css:74` — `:root.theme-mid .homepage-root .home-about-title`
-   `app\styles\features\home\themes.css:78` — `:root.theme-mid .home-scroll-cue .home-scroll-cue-mouse`
-   `app\styles\features\home\themes.css:78` — `:root.theme-mid .home-scroll-cue .home-scroll-cue-arrow`
-   `app\styles\features\home\themes.css:83` — `:root.theme-mid .home-footer-logo`
-   `app\styles\features\home\themes.css:89` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"]) body.homepage`
-   `app\styles\features\home\themes.css:89` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"]) .homepage-root`
-   `app\styles\features\home\themes.css:116` — `:root.theme-night .home-footer-logo`
-   `app\styles\features\home\themes.css:122` — `:root.theme-mono:not([data-contrast="hc"]) body.homepage`
-   `app\styles\features\home\themes.css:122` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root`
-   `app\styles\features\home\themes.css:136` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .home-about-panel`
-   `app\styles\features\home\themes.css:143` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .home-before-links .home-quick-link`
-   `app\styles\features\home\themes.css:143` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .home-before-links .home-quick-link svg`
-   `app\styles\features\home\themes.css:149` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root :is(
  .home-link,
  .home-link:is(:hover, :focus-visible, :active),
  .home-scroll-cue-link,
  .home-scroll-cue-link:is(:hover, :focus-visible, :active),
  .home-before-contact-copy a,
  .home-before-contact-copy a:is(:hover, :focus-visible, :active)
)`
-   `app\styles\features\home\themes.css:165` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .home-before-links .home-quick-label`
-   `app\styles\features\home\themes.css:170` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .home-card-face-content::before`
-   `app\styles\features\home\themes.css:174` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .home-about-title`
-   `app\styles\features\policy\mobile.css:34` — `.guide-rich-text ol` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:39` — `.guide-rich-text ul` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:43` — `.guide-rich-text li` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:47` — `.guide-quickstart-rich-text` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:51` — `.guide-quickstart-rich-text p` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:51` — `.guide-quickstart-rich-text ol` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:51` — `.guide-quickstart-rich-text ul` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:58` — `.guide-quickstart-rich-text li` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:63` — `.policy-scroll-page-scroller` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\features\policy\mobile.css:69` — `.policy-scroll-page-ring::before`
-   `app\styles\features\policy\mobile.css:73` — `.policy-scroll-page-ring .glass-policy-content`
-   `app\styles\features\policy\mobile.css:73` — `.policy-scroll-page-ring .glass-policy-content--expanded`
-   `app\styles\features\policy\mobile.css:73` — `.policy-scroll-page-ring .guide-policy-content`
-   `app\styles\features\policy\mobile.css:73` — `.policy-scroll-page-ring .policy-page-content`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-scroller.glass-policy-scroll`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-scroller.glass-ring-scroll`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-scroller.glass-ring-scroll--open`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-scroller.glass-policy-scroll--expanded`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-ring .policy-scroll-page-scroller.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-ring .policy-scroll-page-scroller.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll--open`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-ring .policy-scroll-page-scroller.policy-page-scroll.glass-policy-scroll.glass-ring-scroll`
-   `app\styles\features\policy\mobile.css:88` — `.policy-scroll-page-ring .policy-scroll-page-scroller.policy-page-scroll.glass-policy-scroll.glass-ring-scroll--open`
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-scroller.glass-policy-scroll` _(@media (max-width: 768px))_
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-scroller.glass-ring-scroll` _(@media (max-width: 768px))_
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-scroller.glass-ring-scroll--open` _(@media (max-width: 768px))_
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-scroller.glass-policy-scroll--expanded` _(@media (max-width: 768px))_
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-ring .policy-scroll-page-scroller.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll` _(@media (max-width: 768px))_
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-ring .policy-scroll-page-scroller.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll--open` _(@media (max-width: 768px))_
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-ring .policy-scroll-page-scroller.policy-page-scroll.glass-policy-scroll.glass-ring-scroll` _(@media (max-width: 768px))_
-   `app\styles\features\policy\mobile.css:139` — `.policy-scroll-page-ring .policy-scroll-page-scroller.policy-page-scroll.glass-policy-scroll.glass-ring-scroll--open` _(@media (max-width: 768px))_
-   `app\styles\features\policy\pages.css:1` — `.glass-ring-expandable`
-   `app\styles\features\policy\pages.css:11` — `.glass-ring-expandable--open`
-   `app\styles\features\policy\pages.css:57` — `.materials-page-content.glass-subpage-surface`
-   `app\styles\features\policy\pages.css:57` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)`
-   `app\styles\features\policy\pages.css:65` — `.glass-ring-expandable--open`
-   `app\styles\features\policy\pages.css:76` — `.glass-policy-expand-shape.glass-ring-expandable--open`
-   `app\styles\features\policy\pages.css:81` — `.glass-ring-scroll`
-   `app\styles\features\policy\pages.css:95` — `.glass-ring-scroll:not(.glass-ring-scroll--open)`
-   `app\styles\features\policy\pages.css:118` — `.glass-ring-scroll--open`
-   `app\styles\features\policy\pages.css:150` — `.glass-policy-content.glass-ring-content` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:154` — `.glass-policy-content.glass-ring-content--open` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:158` — `.glass-policy-scroll-bottom-arc.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:170` — `.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:216` — `.glass-policy-scroll.glass-ring-scroll--open` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:260` — `.glass-ring-content`
-   `app\styles\features\policy\pages.css:270` — `.glass-ring-content--open`
-   `app\styles\features\policy\pages.css:276` — `.glass-ring-content:not(.glass-ring-content--open)`
-   `app\styles\features\policy\pages.css:281` — `.guide-rich-text ol`
-   `app\styles\features\policy\pages.css:281` — `.guide-rich-text ul`
-   `app\styles\features\policy\pages.css:286` — `.guide-rich-text ol`
-   `app\styles\features\policy\pages.css:290` — `.guide-rich-text ul`
-   `app\styles\features\policy\pages.css:294` — `.guide-rich-text li`
-   `app\styles\features\policy\pages.css:298` — `.guide-quickstart-rich-text`
-   `app\styles\features\policy\pages.css:302` — `.guide-quickstart-rich-text p`
-   `app\styles\features\policy\pages.css:302` — `.guide-quickstart-rich-text ol`
-   `app\styles\features\policy\pages.css:302` — `.guide-quickstart-rich-text ul`
-   `app\styles\features\policy\pages.css:309` — `.guide-quickstart-rich-text li`
-   `app\styles\features\policy\pages.css:315` — `.guide-quickstart-section` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:319` — `.guide-quickstart-rich-text` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:323` — `.guide-quickstart-rich-text p` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:323` — `.guide-quickstart-rich-text ol` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:323` — `.guide-quickstart-rich-text ul` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:330` — `.guide-quickstart-rich-text li` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:336` — `#terms-title`
-   `app\styles\features\policy\pages.css:336` — `#privacy-title`
-   `app\styles\features\policy\pages.css:336` — `#kasutusjuhend-title`
-   `app\styles\features\policy\pages.css:347` — `#terms-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:347` — `#privacy-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:347` — `#kasutusjuhend-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:354` — `[lang="ru"] #terms-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:354` — `[lang="ru"] #privacy-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:354` — `[lang="ru"] #kasutusjuhend-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:367` — `[lang="ru"] #terms-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:367` — `[lang="ru"] #kasutusjuhend-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:374` — `[lang="ru"] #privacy-title` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:385` — `.policy-mobile-lower.glass-ring` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:414` — `.policy-mobile-lower.glass-ring.glass-ring-expandable--open` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:427` — `.guide-policy-content.glass-ring-content:not(.glass-ring-content--open)`
-   `app\styles\features\policy\pages.css:427` — `.policy-page-content.glass-ring-content:not(.glass-ring-content--open)`
-   `app\styles\features\policy\pages.css:434` — `.guide-policy-content.glass-ring-content--open`
-   `app\styles\features\policy\pages.css:434` — `.policy-page-content.glass-ring-content--open`
-   `app\styles\features\policy\pages.css:441` — `.glass-policy-content--expanded`
-   `app\styles\features\policy\pages.css:447` — `.guide-policy-content.glass-ring-content--open` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:447` — `.policy-page-content.glass-ring-content--open` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:453` — `.glass-policy-content--expanded` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:494` — `.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll--open`
-   `app\styles\features\policy\pages.css:494` — `.policy-page-scroll.glass-policy-scroll.glass-ring-scroll--open`
-   `app\styles\features\policy\pages.css:583` — `.glass-policy-scroll--expanded`
-   `app\styles\features\policy\pages.css:595` — `.privacy-page-footer` _(@media (min-width: 768px))_
-   `app\styles\features\policy\pages.css:602` — `.glass-policy-expand-shape` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:606` — `.glass-policy-expand-shape::before` _(@media (min-width: 769px))_
-   `app\styles\features\policy\pages.css:627` — `.glass-policy-expand-shape.glass-ring-expandable--open::before` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:2` — `.policy-mobile-lower.glass-ring` _(@media (min-width: 768px) and (max-width: 1440px))_
-   `app\styles\features\policy\responsive.css:29` — `.glass-policy-scroll-bottom-arc.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 768px) and (max-width: 1440px))_
-   `app\styles\features\policy\responsive.css:33` — `.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 768px) and (max-width: 1440px))_
-   `app\styles\features\policy\responsive.css:77` — `.glass-policy-scroll.glass-ring-scroll--open` _(@media (min-width: 768px) and (max-width: 1440px))_
-   `app\styles\features\policy\responsive.css:135` — `.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 1440px) and (min-height: 928px))_
-   `app\styles\features\policy\responsive.css:135` — `.policy-page-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 1440px) and (min-height: 928px))_
-   `app\styles\features\policy\responsive.css:146` — `.glass-ring-expandable` _(@media (min-width: 768px))_
-   `app\styles\features\policy\responsive.css:156` — `.glass-ring-expandable--open` _(@media (min-width: 768px))_
-   `app\styles\features\policy\responsive.css:162` — `.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll--open`
-   `app\styles\features\policy\responsive.css:162` — `.policy-page-scroll.glass-policy-scroll.glass-ring-scroll--open`
-   `app\styles\features\policy\responsive.css:193` — `.guide-policy-scroll > footer`
-   `app\styles\features\policy\responsive.css:193` — `.policy-page-scroll > footer.policy-page-footer`
-   `app\styles\features\policy\responsive.css:198` — `.guide-policy-ring--layout-init`
-   `app\styles\features\policy\responsive.css:198` — `.guide-policy-ring--layout-init::before`
-   `app\styles\features\policy\responsive.css:198` — `.guide-policy-content--layout-init`
-   `app\styles\features\policy\responsive.css:198` — `.guide-policy-scroll--layout-init`
-   `app\styles\features\policy\responsive.css:206` — `.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)
  > footer`
-   `app\styles\features\policy\responsive.css:206` — `.policy-page-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)
  > footer.policy-page-footer`
-   `app\styles\features\policy\responsive.css:216` — `.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:216` — `.policy-page-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:221` — `.guide-policy-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)
    > footer` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:221` — `.policy-page-scroll.glass-policy-scroll.glass-ring-scroll:not(.glass-ring-scroll--open)
    > footer.policy-page-footer` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:231` — `.policy-scroll-page-ring.workspace-guide-panel.glass-subpage-surface` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:241` — `.policy-scroll-page-ring.workspace-guide-panel.glass-subpage-surface::after` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:275` — `.policy-scroll-page-ring.workspace-guide-panel.glass-subpage-surface
    > .glass-policy-content.glass-ring-content` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:290` — `.policy-scroll-page-ring.workspace-guide-panel.glass-subpage-surface
    > .glass-policy-content.glass-ring-content
    > .policy-scroll-page-scroller.workspace-guide-panel-scroll` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:325` — `.policy-scroll-page-ring.workspace-guide-panel.glass-subpage-surface
    .policy-scroll-page-scroller.workspace-guide-panel-scroll
    :is(.policy-section-heading, .policy-section-body)` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:332` — `.policy-scroll-page-ring.workspace-guide-panel.glass-subpage-surface
    .policy-scroll-page-scroller.workspace-guide-panel-scroll
    > .workspace-scroll-back-button` _(@media (min-width: 769px))_
-   `app\styles\features\policy\responsive.css:342` — `html[data-contrast="hc"]
    .policy-scroll-page-ring.workspace-guide-panel.glass-subpage-surface::after` _(@media (min-width: 769px))_
-   `app\styles\features\profile\hc.css:3` — `html[data-contrast="hc"] .profile-orbit-mobile-chevron`
-   `app\styles\features\profile\hc.css:3` — `html[data-contrast="hc"] .profile-orbit-item-label`
-   `app\styles\features\profile\hc.css:3` — `html[data-contrast="hc"] .profile-orbit-item-icon`
-   `app\styles\features\profile\hc.css:3` — `html[data-contrast="hc"] .profile-orbit-mobile-action__label`
-   `app\styles\features\profile\hc.css:3` — `html[data-contrast="hc"] .profile-orbit-stack-label`
-   `app\styles\features\profile\hc.css:11` — `html[data-contrast="hc"]
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  :is(.profile-orbit-mobile-action .dock-icon, .profile-orbit-stack-bubble .dock-icon)`
-   `app\styles\features\profile\hc.css:17` — `html[data-contrast="hc"]
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  :is(.profile-orbit-item-icon, .profile-orbit-mobile-action .dock-icon, .profile-orbit-stack-bubble .dock-icon)
  svg`
-   `app\styles\features\profile\hc.css:24` — `html[data-contrast="hc"]
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  :is(.profile-orbit-item-icon, .profile-orbit-mobile-action .dock-icon, .profile-orbit-stack-bubble .dock-icon)
  svg
  [fill]:not([fill="none"])`
-   `app\styles\features\profile\hc.css:32` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper`
-   `app\styles\features\profile\hc.css:138` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__center.dock-item`
-   `app\styles\features\profile\hc.css:149` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  :is(.profile-orbit-menu__item, .profile-orbit-stack-bubble, .profile-orbit-mobile-action).dock-item`
-   `app\styles\features\profile\hc.css:161` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  :is(.profile-orbit-menu__item, .profile-orbit-stack-bubble, .profile-orbit-mobile-action).dock-item:is(
    :hover,
    :focus-visible,
    :active,
    [data-orbit-mobile-active="true"]
  )`
-   `app\styles\features\profile\hc.css:174` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__item.dock-item`
-   `app\styles\features\profile\hc.css:181` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__center-shell`
-   `app\styles\features\profile\hc.css:188` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__center.dock-item`
-   `app\styles\features\profile\hc.css:200` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__center-shell:hover`
-   `app\styles\features\profile\hc.css:200` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__center-shell:focus-within`
-   `app\styles\features\profile\hc.css:211` — `html[data-contrast="hc"]
  body
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__center.dock-item:is(
    :hover,
    :focus-visible,
    :active
  )`
-   `app\styles\features\profile\hc.css:224` — `html[data-contrast="hc"]
  body
  .profile-orbit-stack-item`
-   `app\styles\features\profile\hc.css:234` — `html[data-contrast="hc"]
  body
  .profile-orbit-stack-item:is(
    :hover,
    :focus-visible,
    :active
  )`
-   `app\styles\features\profile\hc.css:247` — `html[data-contrast="hc"]
  body
  .profile-orbit-stack-bubble.dock-item`
-   `app\styles\features\profile\hc.css:247` — `html[data-contrast="hc"]
  body
  .profile-orbit-stack-bubble.dock-item:is(:hover, :focus-visible, :active)`
-   `app\styles\features\profile\hc.css:262` — `html[data-contrast="hc"]
  body
  .profile-orbit-mobile-panel
  .profile-orbit-mobile-visual`
-   `app\styles\features\profile\hc.css:272` — `html[data-contrast="hc"]
    body
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (min-width: 48.001em))_
-   `app\styles\features\profile\mobile.css:4` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 640px))_
-   `app\styles\features\profile\mobile.css:36` — `.profile-container.glass-ring` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:44` — `.profile-container.glass-ring .profile-mask-layer` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:44` — `.profile-container.glass-ring[data-orbit-open="true"] .profile-mask-layer` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:53` — `.profile-container.glass-ring[data-orbit-open="true"]` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:58` — `.profile-container.glass-ring[data-orbit-open="true"] .profile-mask-layer` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:62` — `.profile-orbit-menu.is-mobile` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:66` — `.profile-orbit-menu.is-mobile .profile-orbit-menu__slot` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:69` — `.profile-orbit-menu.is-mobile .dock-label` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:79` — `.profile-orbit-menu.is-mobile
    .profile-orbit-menu__item.dock-item::before` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:79` — `.profile-orbit-menu.is-mobile
    :is(
      .profile-orbit-menu__item,
      .profile-orbit-mobile-action
    ).dock-item::after` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:89` — `.profile-orbit-menu.is-mobile
    .profile-orbit-mobile-action.dock-item::before` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:94` — `html[data-contrast="hc"]
    .profile-orbit-menu.is-mobile
    .profile-orbit-mobile-action.dock-item::after` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:102` — `:root.theme-light
    .profile-orbit-mobile-panel
    .profile-orbit-mobile-action.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:108` — `:root.theme-light:not(.theme-mid)
    .profile-orbit-stack-bubble.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:108` — `:root.theme-light:not(.theme-mid)
    .profile-orbit-mobile-panel
    .profile-orbit-mobile-action.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:132` — `:root.theme-mid .profile-orbit-stack-bubble.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:132` — `:root.theme-mid
    .profile-orbit-mobile-panel
    .profile-orbit-mobile-action.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:141` — `:root.theme-mid .profile-orbit-stack-bubble.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:141` — `:root.theme-mid
    .profile-orbit-mobile-panel
    .profile-orbit-mobile-action.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:167` — `.profile-orbit-menu[data-mobile-variant="stack"].is-open
    .profile-orbit-menu__center` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:175` — `.profile-orbit-menu[data-mobile-variant="stack"].is-open
    .profile-orbit-menu__center-pulse` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:182` — `.profile-orbit-menu[data-mobile-variant="stack"]
    .profile-orbit-menu__center.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:189` — `.profile-container.glass-ring
    .profile-orbit-menu
    .profile-orbit-menu__center-shell` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:208` — `.profile-container.glass-ring
    .profile-orbit-menu:not(.is-open)
    .profile-orbit-menu__center-pulse` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:222` — `.profile-container.glass-ring
    .profile-orbit-menu:not(.is-open)
    .profile-orbit-menu__center` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:230` — `.profile-container.glass-ring
    .profile-orbit-menu:not(.is-open)
    .profile-orbit-menu__center::before` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:230` — `.profile-container.glass-ring
    .profile-orbit-menu:not(.is-open)
    .profile-orbit-menu__hub-icon` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:239` — `.profile-orbit-stack-backdrop` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:243` — `.profile-orbit-stack-panel` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:284` — `.profile-orbit-stack-fade` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:305` — `.profile-orbit-stack-fade--top` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:308` — `.profile-orbit-stack-fade--bottom` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:312` — `.profile-orbit-stack-list` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:339` — `.profile-orbit-stack-list::-webkit-scrollbar` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:343` — `.profile-orbit-stack-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:353` — `.profile-orbit-stack-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:357` — `.profile-orbit-stack-bubble.dock-item` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:378` — `.profile-orbit-stack-bubble .dock-icon` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:385` — `.profile-orbit-stack-bubble .dock-icon svg` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:394` — `.profile-orbit-stack-bubble .dock-icon svg.profile-theme-mode-icon` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:398` — `.profile-orbit-stack-bubble .dock-icon .profile-orbit-back-icon` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:403` — `.profile-orbit-stack-bubble .dock-icon svg [fill]:not([fill="none"])` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:406` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.dock-item
    > .profile-orbit-static-glow` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:406` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.dock-item:is(:hover, :focus-visible, :active)
    > .profile-orbit-static-glow` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:415` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.profile-orbit-edge-glow.dock-item
    > [class*="edgeLight"]` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:415` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.profile-orbit-edge-glow.dock-item
    > [class*="edgeLight"]::before` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:415` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.profile-orbit-edge-glow.dock-item::before` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:415` — `.profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.profile-orbit-edge-glow.dock-item::after` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:430` — `:root.theme-light:not(.theme-mid)
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.dock-item:is(:hover, :focus-visible, :active)` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:439` — `:root.theme-mid
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.dock-item:is(:hover, :focus-visible, :active)` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:446` — `:is(
      :root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"]),
      :root.theme-night
    )
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.dock-item:is(:hover, :focus-visible, :active)` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:446` — `html[data-contrast="hc"]
    body
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-stack-bubble.dock-item:is(:hover, :focus-visible, :active)` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:461` — `.profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:475` — `.profile-orbit-stack-item[data-key="theme"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:475` — `.profile-orbit-stack-item[data-key="preferences"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:479` — `.profile-orbit-stack-item[data-key="theme"]
    .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:479` — `.profile-orbit-stack-item[data-key="preferences"]
    .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:486` — `.profile-container.glass-ring .profile-role-row` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:490` — `.profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:495` — `html[data-platform="android"] .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:495` — `body[data-platform="android"] .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:501` — `.profile-container.glass-ring .profile-orbit-menu .profile-orbit-menu__center-shell` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:505` — `.profile-container.glass-ring .profile-orbit-menu:not(.is-open) .profile-orbit-menu__center::before` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:505` — `.profile-container.glass-ring .profile-orbit-menu:not(.is-open) .profile-orbit-menu__hub-icon` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:512` — `.profile-container.glass-ring .profile-nav-overlay .profile-logout-wrap` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:516` — `html.profile-orbit-open .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:516` — `body.profile-orbit-open .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:522` — `html[data-platform="android"].profile-orbit-open .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:522` — `body[data-platform="android"].profile-orbit-open .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\features\profile\mobile.css:530` — `html[data-reduce-motion="1"] .profile-container.glass-ring .profile-orbit-menu .profile-orbit-menu__center-shell`
-   `app\styles\features\profile\mobile.css:530` — `html[data-reduce-motion="1"] .profile-container.glass-ring .profile-orbit-menu .profile-orbit-menu__center`
-   `app\styles\features\profile\mobile.css:530` — `html[data-reduce-motion="1"] .profile-container.glass-ring .profile-orbit-menu .profile-orbit-menu__center::before`
-   `app\styles\features\profile\mono.css:3` — `:root.theme-mono:not([data-contrast="hc"]):not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper`
-   `app\styles\features\profile\mono.css:3` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper`
-   `app\styles\features\profile\mono.css:27` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper :is(.profile-orbit-menu__item, .profile-orbit-stack-bubble, .profile-orbit-mobile-action).dock-item`
-   `app\styles\features\profile\mono.css:51` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-menu__center.dock-item`
-   `app\styles\features\profile\mono.css:55` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-item-icon`
-   `app\styles\features\profile\mono.css:55` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-mobile-action.dock-item .dock-icon`
-   `app\styles\features\profile\mono.css:60` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-item-label`
-   `app\styles\features\profile\mono.css:60` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-mobile-action__label`
-   `app\styles\features\profile\mono.css:60` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-stack-label`
-   `app\styles\features\profile\mono.css:66` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-item-icon :is(svg, path, circle, rect, line, polyline, polygon)`
-   `app\styles\features\profile\mono.css:66` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-mobile-action.dock-item .dock-icon :is(svg, path, circle, rect, line, polyline, polygon)`
-   `app\styles\features\profile\mono.css:72` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-item-icon :is(path, circle, rect, polygon)[fill]:not([fill="none"])`
-   `app\styles\features\profile\mono.css:72` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-mobile-action.dock-item .dock-icon :is(path, circle, rect, polygon)[fill]:not([fill="none"])`
-   `app\styles\features\profile\mono.css:77` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-static-glow`
-   `app\styles\features\service-map\desktop.css:98` — `.workspace-feature-panel:not(.service-map-page-panel) > header`
-   `app\styles\features\service-map\desktop.css:102` — `.workspace-feature-panel:not(.service-map-page-panel) > .workspace-feature-content`
-   `app\styles\features\service-map\desktop.css:111` — `.service-profile-glow-field`
-   `app\styles\features\service-map\desktop.css:130` — `.service-profile-glow-field:hover`
-   `app\styles\features\service-map\desktop.css:139` — `.service-profile-glow-field:focus-within:not(:hover) > .edgeLight`
-   `app\styles\features\service-map\desktop.css:139` — `.service-profile-glow-field:focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\features\service-map\desktop.css:144` — `.service-profile-glow-field:has(.documents-dropdown.is-open)`
-   `app\styles\features\service-map\desktop.css:148` — `.service-profile-glow-control`
-   `app\styles\features\service-map\desktop.css:148` — `.service-profile-glow-dropdown .documents-dropdown-trigger`
-   `app\styles\features\service-map\desktop.css:159` — `.service-profile-glow-control`
-   `app\styles\features\service-map\desktop.css:163` — `.service-profile-glow-control--textarea`
-   `app\styles\features\service-map\desktop.css:168` — `.service-profile-glow-dropdown .documents-dropdown-trigger`
-   `app\styles\features\service-map\desktop.css:172` — `.service-profile-glow-dropdown .documents-dropdown-label`
-   `app\styles\features\service-map\desktop.css:176` — `.service-profile-glow-dropdown .documents-dropdown-icon`
-   `app\styles\features\service-map\desktop.css:180` — `.service-profile-glow-dropdown-menu`
-   `app\styles\features\service-map\desktop.css:200` — `.service-profile-glow-dropdown-menu .documents-dropdown-item`
-   `app\styles\features\service-map\desktop.css:215` — `.service-profile-glow-dropdown-menu .documents-dropdown-item:is(:hover, :focus-visible, .is-active)`
-   `app\styles\features\service-map\desktop.css:220` — `:root.theme-light .service-profile-glow-field`
-   `app\styles\features\service-map\desktop.css:228` — `:root.theme-light:not(.theme-mid) .service-profile-form`
-   `app\styles\features\service-map\desktop.css:233` — `:root.theme-light:not(.theme-mid) .service-profile-glow-dropdown-menu`
-   `app\styles\features\service-map\desktop.css:243` — `:root.theme-light:not(.theme-mid) .service-profile-glow-dropdown-menu .documents-dropdown-item:is(:hover, :focus-visible, .is-active)`
-   `app\styles\features\service-map\desktop.css:248` — `:root.theme-mid .service-profile-glow-field`
-   `app\styles\features\service-map\desktop.css:256` — `:root.theme-mid .service-profile-form`
-   `app\styles\features\service-map\desktop.css:261` — `:root.theme-mid .service-profile-glow-dropdown-menu`
-   `app\styles\features\service-map\desktop.css:271` — `:root.theme-mid .service-profile-glow-dropdown-menu .documents-dropdown-item:is(:hover, :focus-visible, .is-active)`
-   `app\styles\features\service-map\desktop.css:276` — `:root.theme-light .service-profile-glow-field:hover`
-   `app\styles\features\service-map\desktop.css:283` — `:root.theme-mid .service-profile-glow-field:hover`
-   `app\styles\features\service-map\desktop.css:292` — `:root.theme-light .service-profile-glow-field > .edgeLight`
-   `app\styles\features\service-map\desktop.css:292` — `:root.theme-mid .service-profile-glow-field > .edgeLight`
-   `app\styles\features\service-map\desktop.css:297` — `html[data-contrast="hc"] .service-profile-glow-field`
-   `app\styles\features\service-map\desktop.css:302` — `html[data-contrast="hc"] .service-profile-glow-field > .edgeLight`
-   `app\styles\features\service-map\desktop.css:306` — `html[data-contrast="hc"] .service-profile-glow-dropdown-menu`
-   `app\styles\features\service-map\desktop.css:314` — `html[data-contrast="hc"] .service-profile-glow-dropdown-menu .documents-dropdown-item:is(:hover, :focus-visible, .is-active)`
-   `app\styles\features\service-map\desktop.css:319` — `.service-profile-address-field`
-   `app\styles\features\service-map\desktop.css:327` — `.service-profile-address-suggestions`
-   `app\styles\features\service-map\desktop.css:342` — `.service-profile-address-suggestion`
-   `app\styles\features\service-map\desktop.css:355` — `.service-profile-address-suggestion:hover`
-   `app\styles\features\service-map\desktop.css:355` — `.service-profile-address-suggestion:focus-visible`
-   `app\styles\features\service-map\desktop.css:361` — `.service-profile-address-suggestions__state`
-   `app\styles\features\service-map\desktop.css:361` — `.service-profile-address-selected`
-   `app\styles\features\service-map\desktop.css:370` — `.service-profile-address-suggestions__state`
-   `app\styles\features\service-map\desktop.css:374` — `.service-profile-address-selected`
-   `app\styles\features\service-map\desktop.css:378` — `.service-profile-form`
-   `app\styles\features\service-map\desktop.css:382` — `.service-profile-section`
-   `app\styles\features\service-map\desktop.css:390` — `.service-profile-section-title`
-   `app\styles\features\service-map\desktop.css:399` — `.service-profile-subsection`
-   `app\styles\features\service-map\desktop.css:407` — `.service-profile-subsection:last-child`
-   `app\styles\features\service-map\desktop.css:412` — `.service-profile-form :is(button.button, a.button)`
-   `app\styles\features\service-map\desktop.css:416` — `.service-profile-form :is(button.button, a.button) > span`
-   `app\styles\features\service-map\desktop.css:420` — `.service-profile-form :is(button.button, a.button)[data-variant="secondary"]`
-   `app\styles\features\service-map\desktop.css:427` — `.service-profile-form :is(button.button, a.button)[data-variant="secondary"]:is(:hover, :focus-visible)`
-   `app\styles\features\service-map\desktop.css:431` — `.service-profile-field-stack`
-   `app\styles\features\service-map\desktop.css:437` — `.service-profile-field-group`
-   `app\styles\features\service-map\desktop.css:447` — `.service-profile-nested-card`
-   `app\styles\features\service-map\desktop.css:458` — `.service-profile-secondary-action`
-   `app\styles\features\service-map\desktop.css:465` — `.service-profile-subsection > .grid > .button`
-   `app\styles\features\service-map\desktop.css:473` — `.service-profile-location-choice-list`
-   `app\styles\features\service-map\desktop.css:479` — `.service-profile-location-choice`
-   `app\styles\features\service-map\desktop.css:487` — `.service-profile-location-choice .box`
-   `app\styles\features\service-map\desktop.css:493` — `.service-profile-location-choice .svg`
-   `app\styles\features\service-map\desktop.css:498` — `.service-profile-location-choice .text`
-   `app\styles\features\service-map\desktop.css:505` — `.service-profile-field-help`
-   `app\styles\features\service-map\desktop.css:505` — `.service-profile-address-hint`
-   `app\styles\features\service-map\desktop.css:514` — `.service-profile-address-hint`
-   `app\styles\features\service-map\desktop.css:518` — `.service-profile-choice-chips`
-   `app\styles\features\service-map\desktop.css:525` — `.service-profile-choice-chip`
-   `app\styles\features\service-map\desktop.css:542` — `.service-profile-choice-chip:is(:hover, :focus-visible)`
-   `app\styles\features\service-map\desktop.css:547` — `.service-profile-choice-chip.is-selected`
-   `app\styles\features\service-map\desktop.css:554` — `.service-profile-choice-chip__mark`
-   `app\styles\features\service-map\desktop.css:566` — `.service-profile-chip-summary`
-   `app\styles\features\service-map\desktop.css:574` — `.service-profile-map-state`
-   `app\styles\features\service-map\desktop.css:580` — `.service-profile-map-state__label`
-   `app\styles\features\service-map\desktop.css:588` — `:root.theme-light .service-profile-address-suggestions`
-   `app\styles\features\service-map\desktop.css:588` — `:root.theme-mid .service-profile-address-suggestions`
-   `app\styles\features\service-map\desktop.css:596` — `html[data-contrast="hc"] .service-profile-address-suggestions`
-   `app\styles\features\service-map\desktop.css:644` — `html[data-contrast="hc"] .workspace-feature-panel .workspace-feature-field`
-   `app\styles\features\service-map\desktop.css:652` — `html[data-contrast="hc"] .workspace-feature-panel .workspace-feature-field::placeholder`
-   `app\styles\features\service-map\desktop.css:656` — `html[data-contrast="hc"] .workspace-feature-panel select.workspace-feature-field option`
-   `app\styles\features\service-map\desktop.css:661` — `html[data-contrast="hc"] .workspace-feature-panel :is(
  .workspace-feature-card,
  .workspace-feature-chip,
  .pre-inquiry-recipient-type-card,
  .workspace-feature-admin-role,
  .workspace-feature-toggle-row,
  .workspace-feature-list-card,
  .workspace-feature-badge
)`
-   `app\styles\features\service-map\desktop.css:676` — `html[data-contrast="hc"] .workspace-feature-panel :is(
  .workspace-feature-card,
  .workspace-feature-chip,
  .pre-inquiry-recipient-type-card,
  .workspace-feature-admin-role,
  .workspace-feature-toggle-row,
  .workspace-feature-list-card
):is(:hover, :focus-visible, :focus-within)`
-   `app\styles\features\service-map\desktop.css:687` — `html[data-contrast="hc"] .workspace-feature-panel :is(
  .workspace-feature-card,
  .workspace-feature-list-card,
  .workspace-feature-chip,
  .pre-inquiry-recipient-type-card,
  .workspace-feature-admin-role,
  .workspace-feature-toggle-row,
  .workspace-feature-badge
).\!border-0`
-   `app\styles\features\service-map\desktop.css:699` — `html[data-contrast="hc"] .workspace-feature-panel :is(.workspace-feature-glow-card, .workspace-feature-card)`
-   `app\styles\features\service-map\desktop.css:704` — `html[data-contrast="hc"] .workspace-feature-panel .workspace-feature-action-btn`
-   `app\styles\features\service-map\desktop.css:704` — `html[data-contrast="hc"] .workspace-feature-panel .workspace-feature-action-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\features\service-map\desktop.css:712` — `.workspace-feature-card`
-   `app\styles\features\service-map\desktop.css:721` — `.workspace-feature-card :is(p, span, label, h2, h3)`
-   `app\styles\features\service-map\desktop.css:725` — `.workspace-feature-field`
-   `app\styles\features\service-map\desktop.css:737` — `.workspace-feature-field:hover`
-   `app\styles\features\service-map\desktop.css:737` — `.workspace-feature-field:focus`
-   `app\styles\features\service-map\desktop.css:743` — `.workspace-feature-field::placeholder`
-   `app\styles\features\service-map\desktop.css:748` — `select.workspace-feature-field`
-   `app\styles\features\service-map\desktop.css:752` — `select.workspace-feature-field option`
-   `app\styles\features\service-map\desktop.css:757` — `.workspace-feature-chip`
-   `app\styles\features\service-map\desktop.css:757` — `.workspace-feature-admin-role`
-   `app\styles\features\service-map\desktop.css:757` — `.workspace-feature-toggle-row`
-   `app\styles\features\service-map\desktop.css:757` — `.workspace-feature-list-card`
-   `app\styles\features\service-map\desktop.css:769` — `.workspace-feature-toggle-row--flat`
-   `app\styles\features\service-map\desktop.css:776` — `.workspace-feature-chip:hover`
-   `app\styles\features\service-map\desktop.css:776` — `.workspace-feature-chip:focus-visible`
-   `app\styles\features\service-map\desktop.css:776` — `.workspace-feature-list-card:hover`
-   `app\styles\features\service-map\desktop.css:776` — `.workspace-feature-list-card:focus-visible`
-   `app\styles\features\service-map\desktop.css:776` — `.workspace-feature-toggle-row:hover`
-   `app\styles\features\service-map\desktop.css:776` — `.workspace-feature-toggle-row:focus-within`
-   `app\styles\features\service-map\desktop.css:787` — `.workspace-feature-list-card[data-selected="true"]`
-   `app\styles\features\service-map\desktop.css:795` — `.workspace-feature-list-card[data-selected="true"]:is(:hover, :focus-visible)`
-   `app\styles\features\service-map\desktop.css:799` — `.pre-inquiry-workspace`
-   `app\styles\features\service-map\desktop.css:803` — `.pre-inquiry-start-panel`
-   `app\styles\features\service-map\desktop.css:807` — `.pre-inquiry-start-options`
-   `app\styles\features\service-map\desktop.css:807` — `.pre-inquiry-path-grid`
-   `app\styles\features\service-map\desktop.css:814` — `.pre-inquiry-start-card`
-   `app\styles\features\service-map\desktop.css:814` — `.pre-inquiry-path-card`
-   `app\styles\features\service-map\desktop.css:820` — `.pre-inquiry-start-card:disabled`
-   `app\styles\features\service-map\desktop.css:825` — `.pre-inquiry-stepbar`
-   `app\styles\features\service-map\desktop.css:831` — `.pre-inquiry-step`
-   `app\styles\features\service-map\desktop.css:847` — `.pre-inquiry-step span`
-   `app\styles\features\service-map\desktop.css:858` — `.pre-inquiry-step strong`
-   `app\styles\features\service-map\desktop.css:867` — `.pre-inquiry-step[data-active="true"]`
-   `app\styles\features\service-map\desktop.css:872` — `.pre-inquiry-guided-layout`
-   `app\styles\features\service-map\desktop.css:879` — `.pre-inquiry-overview-card`
-   `app\styles\features\service-map\desktop.css:884` — `.pre-inquiry-active-step`
-   `app\styles\features\service-map\desktop.css:888` — `.pre-inquiry-workspace > :where(.workspace-feature-glow-card, .pre-inquiry-details) + :where(.workspace-feature-glow-card, .pre-inquiry-details)`
-   `app\styles\features\service-map\desktop.css:892` — `.pre-inquiry-section-card`
-   `app\styles\features\service-map\desktop.css:896` — `.pre-inquiry-section-card + .pre-inquiry-section-card`
-   `app\styles\features\service-map\desktop.css:900` — `.pre-inquiry-intro`
-   `app\styles\features\service-map\desktop.css:900` — `.pre-inquiry-compact-grid`
-   `app\styles\features\service-map\desktop.css:907` — `.pre-inquiry-compact-grid`
-   `app\styles\features\service-map\desktop.css:911` — `.pre-inquiry-field`
-   `app\styles\features\service-map\desktop.css:923` — `.pre-inquiry-field > span`
-   `app\styles\features\service-map\desktop.css:927` — `.pre-inquiry-field:has(.documents-dropdown.is-open)`
-   `app\styles\features\service-map\desktop.css:931` — `.pre-inquiry-dropdown`
-   `app\styles\features\service-map\desktop.css:948` — `:root.theme-light:not(.theme-mid) .pre-inquiry-dropdown`
-   `app\styles\features\service-map\desktop.css:963` — `:root.theme-mid .pre-inquiry-dropdown`
-   `app\styles\features\service-map\desktop.css:978` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"]) .pre-inquiry-dropdown`
-   `app\styles\features\service-map\desktop.css:993` — `:root.theme-night .pre-inquiry-dropdown`
-   `app\styles\features\service-map\desktop.css:1008` — `:root.theme-mono:not([data-contrast="hc"]) .pre-inquiry-dropdown`
-   `app\styles\features\service-map\desktop.css:1023` — `html[data-contrast="hc"] .pre-inquiry-dropdown`
-   `app\styles\features\service-map\desktop.css:1038` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-trigger`
-   `app\styles\features\service-map\desktop.css:1047` — `.workspace-feature-dropdown.pre-inquiry-dropdown.is-open`
-   `app\styles\features\service-map\desktop.css:1051` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-trigger:hover`
-   `app\styles\features\service-map\desktop.css:1051` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-trigger:focus-visible`
-   `app\styles\features\service-map\desktop.css:1051` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-trigger.is-open`
-   `app\styles\features\service-map\desktop.css:1058` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-label`
-   `app\styles\features\service-map\desktop.css:1064` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-label.is-placeholder`
-   `app\styles\features\service-map\desktop.css:1064` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-icon`
-   `app\styles\features\service-map\desktop.css:1069` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-menu`
-   `app\styles\features\service-map\desktop.css:1069` — `.documents-dropdown-menu.pre-inquiry-dropdown-menu`
-   `app\styles\features\service-map\desktop.css:1085` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-item`
-   `app\styles\features\service-map\desktop.css:1085` — `.documents-dropdown-menu.pre-inquiry-dropdown-menu .documents-dropdown-item`
-   `app\styles\features\service-map\desktop.css:1093` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-item:hover`
-   `app\styles\features\service-map\desktop.css:1093` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-item:focus-visible`
-   `app\styles\features\service-map\desktop.css:1093` — `.documents-dropdown-menu.pre-inquiry-dropdown-menu .documents-dropdown-item:hover`
-   `app\styles\features\service-map\desktop.css:1093` — `.documents-dropdown-menu.pre-inquiry-dropdown-menu .documents-dropdown-item:focus-visible`
-   `app\styles\features\service-map\desktop.css:1100` — `.workspace-feature-dropdown.pre-inquiry-dropdown .documents-dropdown-item.is-active`
-   `app\styles\features\service-map\desktop.css:1100` — `.documents-dropdown-menu.pre-inquiry-dropdown-menu .documents-dropdown-item.is-active`
-   `app\styles\features\service-map\desktop.css:1106` — `.pre-inquiry-field-hint`
-   `app\styles\features\service-map\desktop.css:1113` — `.pre-inquiry-extra-grid`
-   `app\styles\features\service-map\desktop.css:1120` — `.pre-inquiry-extra-grid label`
-   `app\styles\features\service-map\desktop.css:1120` — `.pre-inquiry-extra-grid .service-profile-glow-field`
-   `app\styles\features\service-map\desktop.css:1126` — `.pre-inquiry-extra-grid .documents-field--textarea`
-   `app\styles\features\service-map\desktop.css:1134` — `.pre-inquiry-recipient-controls`
-   `app\styles\features\service-map\desktop.css:1141` — `.pre-inquiry-recipient-types`
-   `app\styles\features\service-map\desktop.css:1150` — `.pre-inquiry-recipient-type-card`
-   `app\styles\features\service-map\desktop.css:1173` — `:root.theme-light .pre-inquiry-recipient-type-card.ui-glow-option-card-frame`
-   `app\styles\features\service-map\desktop.css:1173` — `:root.theme-mid .pre-inquiry-recipient-type-card.ui-glow-option-card-frame`
-   `app\styles\features\service-map\desktop.css:1179` — `:root.theme-mid .pre-inquiry-recipient-type-card.ui-glow-option-card-frame`
-   `app\styles\features\service-map\desktop.css:1184` — `.pre-inquiry-recipient-type-card:hover`
-   `app\styles\features\service-map\desktop.css:1184` — `.pre-inquiry-recipient-type-card:focus-visible`
-   `app\styles\features\service-map\desktop.css:1184` — `.pre-inquiry-recipient-type-card[data-focus-visible="true"]`
-   `app\styles\features\service-map\desktop.css:1184` — `.pre-inquiry-recipient-type-card[data-checked="true"]`
-   `app\styles\features\service-map\desktop.css:1194` — `:root.theme-light .pre-inquiry-recipient-type-card.ui-glow-option-card-frame:is(:hover, :focus-visible, [data-focus-visible="true"], [data-checked="true"])`
-   `app\styles\features\service-map\desktop.css:1194` — `:root.theme-mid .pre-inquiry-recipient-type-card.ui-glow-option-card-frame:is(:hover, :focus-visible, [data-focus-visible="true"], [data-checked="true"])`
-   `app\styles\features\service-map\desktop.css:1199` — `:root.theme-mid .pre-inquiry-recipient-type-card.ui-glow-option-card-frame:is(:hover, :focus-visible, [data-focus-visible="true"], [data-checked="true"])`
-   `app\styles\features\service-map\desktop.css:1203` — `.pre-inquiry-recipient-type-card[data-checked="true"]::before`
-   `app\styles\features\service-map\desktop.css:1203` — `.pre-inquiry-recipient-type-card:hover::before`
-   `app\styles\features\service-map\desktop.css:1203` — `.pre-inquiry-recipient-type-card:focus-visible::before`
-   `app\styles\features\service-map\desktop.css:1203` — `.pre-inquiry-recipient-type-card[data-focus-visible="true"]::before`
-   `app\styles\features\service-map\desktop.css:1210` — `.pre-inquiry-recipient-type-card .pre-inquiry-recipient-type-card__label`
-   `app\styles\features\service-map\desktop.css:1215` — `.pre-inquiry-recipient-controls > label`
-   `app\styles\features\service-map\desktop.css:1221` — `.pre-inquiry-start-options` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1221` — `.pre-inquiry-path-grid` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1221` — `.pre-inquiry-stepbar` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1221` — `.pre-inquiry-guided-layout` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1228` — `.pre-inquiry-overview-card` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1232` — `.pre-inquiry-step strong` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1236` — `.pre-inquiry-compact-grid` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1240` — `.pre-inquiry-recipient-controls` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1244` — `.pre-inquiry-recipient-types` _(@media (max-width: 680px))_
-   `app\styles\features\service-map\desktop.css:1249` — `.pre-inquiry-recipient-selected-label`
-   `app\styles\features\service-map\desktop.css:1253` — `.pre-inquiry-draft-textarea`
-   `app\styles\features\service-map\desktop.css:1257` — `.pre-inquiry-draft-textarea textarea`
-   `app\styles\features\service-map\desktop.css:1261` — `.workspace-feature-admin-role`
-   `app\styles\features\service-map\desktop.css:1271` — `.workspace-feature-admin-role .workspace-role-cycle-button`
-   `app\styles\features\service-map\desktop.css:1296` — `.workspace-feature-admin-role .workspace-role-cycle-button:hover`
-   `app\styles\features\service-map\desktop.css:1296` — `.workspace-feature-admin-role .workspace-role-cycle-button:focus-visible`
-   `app\styles\features\service-map\desktop.css:1305` — `.workspace-feature-admin-role--floating`
-   `app\styles\features\service-map\desktop.css:1321` — `.workspace-feature-admin-role--viewport`
-   `app\styles\features\service-map\desktop.css:1328` — `.workspace-feature-admin-role--floating .workspace-role-cycle-button`
-   `app\styles\features\service-map\desktop.css:1340` — `.workspace-feature-admin-role--floating .workspace-role-cycle-button:hover`
-   `app\styles\features\service-map\desktop.css:1340` — `.workspace-feature-admin-role--floating .workspace-role-cycle-button:focus-visible`
-   `app\styles\features\service-map\desktop.css:1349` — `:root.theme-light .workspace-feature-admin-role--floating .workspace-role-cycle-button`
-   `app\styles\features\service-map\desktop.css:1349` — `:root.theme-mid .workspace-feature-admin-role--floating .workspace-role-cycle-button`
-   `app\styles\features\service-map\desktop.css:1385` — `.workspace-feature-dropdown .documents-dropdown-label.is-placeholder`
-   `app\styles\features\service-map\desktop.css:1390` — `.workspace-feature-dropdown .documents-dropdown-menu`
-   `app\styles\features\service-map\desktop.css:1399` — `.workspace-feature-dropdown .documents-dropdown-item`
-   `app\styles\features\service-map\desktop.css:1405` — `.workspace-feature-dropdown .documents-dropdown-item:hover`
-   `app\styles\features\service-map\desktop.css:1405` — `.workspace-feature-dropdown .documents-dropdown-item:focus-visible`
-   `app\styles\features\service-map\desktop.css:1410` — `.workspace-feature-dropdown .documents-dropdown-item.is-active`
-   `app\styles\features\service-map\desktop.css:1415` — `.service-profile-publish-layout`
-   `app\styles\features\service-map\desktop.css:1422` — `.service-profile-publish-side`
-   `app\styles\features\service-map\desktop.css:1429` — `.service-profile-publish-help`
-   `app\styles\features\service-map\desktop.css:1434` — `.service-profile-publish-checks`
-   `app\styles\features\service-map\desktop.css:1443` — `.service-profile-publish-check`
-   `app\styles\features\service-map\desktop.css:1454` — `.service-profile-publish-check > span:first-child`
-   `app\styles\features\service-map\desktop.css:1465` — `.service-profile-publish-check.is-ok > span:first-child`
-   `app\styles\features\service-map\desktop.css:1470` — `.service-profile-publish-check.is-warning > span:first-child`
-   `app\styles\features\service-map\desktop.css:1475` — `.service-profile-publish-save`
-   `app\styles\features\service-map\desktop.css:1480` — `.service-profile-publish-layout` _(@media (max-width: 900px))_
-   `app\styles\features\service-map\desktop.css:1484` — `.service-profile-publish-save` _(@media (max-width: 900px))_
-   `app\styles\features\service-map\desktop.css:1489` — `.workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1502` — `.workspace-feature-fancy-checkbox .box`
-   `app\styles\features\service-map\desktop.css:1511` — `.workspace-feature-fancy-checkbox .tick`
-   `app\styles\features\service-map\desktop.css:1515` — `.workspace-feature-fancy-checkbox .text`
-   `app\styles\features\service-map\desktop.css:1520` — `.workspace-feature-toggle-row .text`
-   `app\styles\features\service-map\desktop.css:1524` — `.workspace-feature-toggle-row .text > span`
-   `app\styles\features\service-map\desktop.css:1528` — `.workspace-feature-toggle-row .text > span > span:first-child`
-   `app\styles\features\service-map\desktop.css:1532` — `.workspace-feature-toggle-row .text > span > span:last-child:not(:first-child)`
-   `app\styles\features\service-map\desktop.css:1537` — `.workspace-feature-fancy-checkbox .workspace-feature-receiving-checkbox-label`
-   `app\styles\features\service-map\desktop.css:1541` — `.workspace-feature-receiving-checkbox`
-   `app\styles\features\service-map\desktop.css:1545` — `.workspace-feature-receiving-checkbox.fancy-checkbox--top .box`
-   `app\styles\features\service-map\desktop.css:1545` — `.workspace-feature-receiving-checkbox.fancy-checkbox--multiline .box`
-   `app\styles\features\service-map\desktop.css:1550` — `.workspace-feature-receiving-checkbox .svg`
-   `app\styles\features\service-map\desktop.css:1555` — `.workspace-feature-receiving-checkbox .tick`
-   `app\styles\features\service-map\desktop.css:1559` — `:root.theme-light:not(.theme-mid) .workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1564` — `:root.theme-mid .workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1569` — `:root.theme-night .workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1569` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"]) .workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1575` — `html[data-contrast="hc"] .workspace-feature-panel .workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1580` — `.workspace-feature-fancy-checkbox:hover .box`
-   `app\styles\features\service-map\desktop.css:1580` — `.workspace-feature-fancy-checkbox:focus-within .box`
-   `app\styles\features\service-map\desktop.css:1586` — `.service-profile-form .workspace-feature-toggle-row.workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1586` — `.service-profile-form .service-profile-location-choice.workspace-feature-fancy-checkbox`
-   `app\styles\features\service-map\desktop.css:1594` — `.service-profile-form .workspace-feature-fancy-checkbox .box`
-   `app\styles\features\service-map\desktop.css:1600` — `.service-profile-form .workspace-feature-fancy-checkbox .svg`
-   `app\styles\features\service-map\desktop.css:1605` — `.service-profile-form .workspace-feature-fancy-checkbox .tick`
-   `app\styles\features\service-map\desktop.css:1609` — `.service-profile-form .workspace-feature-toggle-row .text`
-   `app\styles\features\service-map\desktop.css:1613` — `.service-profile-form .workspace-feature-toggle-row .text > span > span:first-child`
-   `app\styles\features\service-map\desktop.css:1618` — `.service-profile-form .workspace-feature-toggle-row .text > span > span:last-child:not(:first-child)`
-   `app\styles\features\service-map\desktop.css:1623` — `.service-profile-form .service-profile-location-choice .text`
-   `app\styles\features\service-map\desktop.css:1628` — `.workspace-feature-badge`
-   `app\styles\features\service-map\desktop.css:1634` — `.service-map-page-panel.service-map-page-panel`
-   `app\styles\features\service-map\desktop.css:1659` — `:root.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1659` — `body.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1664` — `:root.theme-light.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1664` — `:root.theme-light body.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1669` — `:root.theme-mid.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1669` — `:root.theme-mid body.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1674` — `:root.theme-night.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1674` — `:root.theme-night body.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1679` — `html[data-contrast="hc"].service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1679` — `html[data-contrast="hc"] body.service-map-page-active`
-   `app\styles\features\service-map\desktop.css:1684` — `:root:not(.theme-light) .service-map-page-panel.service-map-page-panel`
-   `app\styles\features\service-map\desktop.css:1688` — `:root.theme-night .service-map-page-panel.service-map-page-panel`
-   `app\styles\features\service-map\desktop.css:1692` — `:root.theme-mid .service-map-page-panel.service-map-page-panel`
-   `app\styles\features\service-map\desktop.css:1696` — `:root.theme-light:not(.theme-mid) .service-map-page-panel.service-map-page-panel`
-   `app\styles\features\service-map\desktop.css:1700` — `.service-map-page-header`
-   `app\styles\features\service-map\desktop.css:1704` — `.service-map-page-content`
-   `app\styles\features\service-map\desktop.css:1711` — `.service-map-workspace`
-   `app\styles\features\service-map\desktop.css:1770` — `:root:not(.theme-light) .service-map-workspace`
-   `app\styles\features\service-map\desktop.css:1774` — `.service-map-workspace--toolbar-feedback`
-   `app\styles\features\service-map\desktop.css:1779` — `.service-map-workspace--toolbar-feedback .service-map-workspace__filters-shell`
-   `app\styles\features\service-map\desktop.css:1794` — `.service-map-workspace--toolbar-feedback .service-map-workspace__info.service-map-workspace__info`
-   `app\styles\features\service-map\desktop.css:1809` — `.service-map-workspace--toolbar-feedback .service-map-workspace__info.service-map-workspace__info svg`
-   `app\styles\features\service-map\desktop.css:1814` — `.service-map-workspace__map`
-   `app\styles\features\service-map\desktop.css:1832` — `.service-map-workspace__filters`
-   `app\styles\features\service-map\desktop.css:1832` — `.service-map-workspace__role`
-   `app\styles\features\service-map\desktop.css:1832` — `.service-map-workspace__status`
-   `app\styles\features\service-map\desktop.css:1839` — `.service-map-workspace__filters`
-   `app\styles\features\service-map\desktop.css:1850` — `.service-map-workspace__filters--collapsed`
-   `app\styles\features\service-map\desktop.css:1858` — `.service-map-workspace__filters-shell`
-   `app\styles\features\service-map\desktop.css:1882` — `html[data-theme-switching="1"] .service-map-workspace__filters-shell`
-   `app\styles\features\service-map\desktop.css:1882` — `html[data-theme-switching="1"] .service-map-workspace__filters-shell::before`
-   `app\styles\features\service-map\desktop.css:1887` — `.service-map-workspace__filters-shell::before`
-   `app\styles\features\service-map\desktop.css:1891` — `.service-map-workspace__filters--collapsed .service-map-workspace__filters-shell`
-   `app\styles\features\service-map\desktop.css:1900` — `.service-map-toolbar__identity`
-   `app\styles\features\service-map\desktop.css:1912` — `.service-map-toolbar__back`
-   `app\styles\features\service-map\desktop.css:1932` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__back`
-   `app\styles\features\service-map\desktop.css:1936` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__identity`
-   `app\styles\features\service-map\desktop.css:1942` — `.service-map-toolbar__back::before`
-   `app\styles\features\service-map\desktop.css:1946` — `.service-map-toolbar__back:hover`
-   `app\styles\features\service-map\desktop.css:1946` — `.service-map-toolbar__back:focus-visible`
-   `app\styles\features\service-map\desktop.css:1952` — `:root:not(.theme-light) .service-map-toolbar__back`
-   `app\styles\features\service-map\desktop.css:1958` — `:root:not(.theme-light) .service-map-toolbar__back:hover`
-   `app\styles\features\service-map\desktop.css:1958` — `:root:not(.theme-light) .service-map-toolbar__back:focus-visible`
-   `app\styles\features\service-map\desktop.css:1964` — `.service-map-toolbar__back svg`
-   `app\styles\features\service-map\desktop.css:1970` — `.service-map-toolbar__back svg > g`
-   `app\styles\features\service-map\desktop.css:1974` — `.service-map-workspace--toolbar-feedback .service-map-workspace__info.service-map-workspace__info svg`
-   `app\styles\features\service-map\desktop.css:1979` — `.service-map-toolbar__content`
-   `app\styles\features\service-map\desktop.css:1992` — `.service-map-workspace__filters--collapsed .service-map-toolbar__content`
-   `app\styles\features\service-map\desktop.css:2000` — `.service-map-workspace__back`
-   `app\styles\features\service-map\desktop.css:2006` — `.service-map-workspace__back` _(@media (min-width: 769px))_
-   `app\styles\features\service-map\desktop.css:2011` — `.service-map-toolbar__body`
-   `app\styles\features\service-map\desktop.css:2025` — `.service-map-toolbar__fields`
-   `app\styles\features\service-map\desktop.css:2025` — `.service-map-toolbar__types`
-   `app\styles\features\service-map\desktop.css:2030` — `.service-map-toolbar__resultsblock`
-   `app\styles\features\service-map\desktop.css:2044` — `.service-map-toolbar__resultsblock:empty`
-   `app\styles\features\service-map\desktop.css:2048` — `.service-map-workspace__toggle`
-   `app\styles\features\service-map\desktop.css:2079` — `.service-map-workspace__info.service-map-workspace__info`
-   `app\styles\features\service-map\desktop.css:2093` — `.service-map-workspace__info.service-map-workspace__info svg`
-   `app\styles\features\service-map\desktop.css:2098` — `:root.theme-light .service-map-workspace__toggle`
-   `app\styles\features\service-map\desktop.css:2098` — `:root.theme-mid .service-map-workspace__toggle`
-   `app\styles\features\service-map\desktop.css:2103` — `.service-map-workspace__toggle svg`
-   `app\styles\features\service-map\desktop.css:2110` — `.service-map-workspace__toggle:hover`
-   `app\styles\features\service-map\desktop.css:2110` — `.service-map-workspace__toggle:focus-visible`
-   `app\styles\features\service-map\desktop.css:2120` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle`
-   `app\styles\features\service-map\desktop.css:2128` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:hover`
-   `app\styles\features\service-map\desktop.css:2128` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:focus-visible`
-   `app\styles\features\service-map\desktop.css:2134` — `.service-map-workspace__filters--collapsed .service-map-workspace__toggle`
-   `app\styles\features\service-map\desktop.css:2154` — `.service-map-workspace__toggle` _(@media (min-width: 769px))_
-   `app\styles\features\service-map\desktop.css:2158` — `.service-map-workspace__info.service-map-workspace__info` _(@media (min-width: 769px))_
-   `app\styles\features\service-map\desktop.css:2162` — `.service-map-workspace__filters--collapsed` _(@media (min-width: 769px))_
-   `app\styles\features\service-map\desktop.css:2167` — `.service-map-workspace__filters--collapsed .service-map-workspace__filters-shell` _(@media (min-width: 769px))_
-   `app\styles\features\service-map\desktop.css:2176` — `.service-map-workspace__filters--collapsed .service-map-toolbar__content` _(@media (min-width: 769px))_
-   `app\styles\features\service-map\desktop.css:2184` — `:root:not(.theme-light) .service-map-workspace__toggle`
-   `app\styles\features\service-map\desktop.css:2188` — `:root:not(.theme-light) .service-map-workspace__toggle:hover`
-   `app\styles\features\service-map\desktop.css:2188` — `:root:not(.theme-light) .service-map-workspace__toggle:focus-visible`
-   `app\styles\features\service-map\desktop.css:2193` — `.service-map-workspace__role`
-   `app\styles\features\service-map\desktop.css:2203` — `.service-map-workspace__role .workspace-feature-admin-role`
-   `app\styles\features\service-map\desktop.css:2214` — `.service-map-workspace__role .workspace-role-cycle-button`
-   `app\styles\features\service-map\desktop.css:2220` — `.service-map-workspace__status`
-   `app\styles\features\service-map\desktop.css:2237` — `.service-map-toolbar__fields`
-   `app\styles\features\service-map\desktop.css:2245` — `.service-map-toolbar__field`
-   `app\styles\features\service-map\desktop.css:2251` — `.service-map-toolbar__glow-field`
-   `app\styles\features\service-map\desktop.css:2257` — `:root.theme-light:not(.theme-mid) .service-map-toolbar__results .workspace-feature-list-card.ui-glow-button-frame`
-   `app\styles\features\service-map\desktop.css:2257` — `:root.theme-mid .service-map-toolbar__results .workspace-feature-list-card.ui-glow-button-frame`
-   `app\styles\features\service-map\desktop.css:2262` — `.service-map-toolbar__field--keyword`
-   `app\styles\features\service-map\desktop.css:2266` — `.service-map-toolbar__field--region`
-   `app\styles\features\service-map\desktop.css:2270` — `.service-map-toolbar__fields label > span`
-   `app\styles\features\service-map\desktop.css:2279` — `.service-map-toolbar__fields .workspace-feature-field`
-   `app\styles\features\service-map\desktop.css:2287` — `.service-map-toolbar__input`
-   `app\styles\features\service-map\desktop.css:2301` — `.service-map-toolbar__glow-field .service-map-toolbar__input`
-   `app\styles\features\service-map\desktop.css:2306` — `.service-map-toolbar__input--keyword`
-   `app\styles\features\service-map\desktop.css:2311` — `.service-map-toolbar__input--region`
-   `app\styles\features\service-map\desktop.css:2316` — `.service-map-toolbar__types`
-   `app\styles\features\service-map\desktop.css:2326` — `.service-map-toolbar__type-card`
-   `app\styles\features\service-map\desktop.css:2338` — `.service-map-toolbar__type-card .service-map-toolbar__type-label`
-   `app\styles\features\service-map\desktop.css:2343` — `.service-map-toolbar__results`
-   `app\styles\features\service-map\desktop.css:2362` — `.service-map-toolbar__results::-webkit-scrollbar`
-   `app\styles\features\service-map\desktop.css:2366` — `.service-map-toolbar__results::-webkit-scrollbar-track`
-   `app\styles\features\service-map\desktop.css:2370` — `.service-map-toolbar__results::-webkit-scrollbar-thumb`
-   `app\styles\features\service-map\desktop.css:2375` — `.service-map-toolbar__results .service-map-toolbar__result-button`
-   `app\styles\features\service-map\desktop.css:2398` — `.service-map-toolbar__results .service-map-toolbar__result-button::before`
-   `app\styles\features\service-map\desktop.css:2410` — `.service-map-toolbar__results .service-map-toolbar__result-button .service-map-result-card__title`
-   `app\styles\features\service-map\desktop.css:2418` — `.service-map-toolbar__results .service-map-toolbar__result-button .service-map-result-card__title`
-   `app\styles\features\service-map\desktop.css:2427` — `.service-map-toolbar__results .service-map-toolbar__result-button:hover`
-   `app\styles\features\service-map\desktop.css:2427` — `.service-map-toolbar__results .service-map-toolbar__result-button:focus-visible`
-   `app\styles\features\service-map\desktop.css:2427` — `.service-map-toolbar__results .service-map-toolbar__result-button[data-selected="true"]`
-   `app\styles\features\service-map\desktop.css:2438` — `.service-map-toolbar__results .service-map-toolbar__result-button:hover::before`
-   `app\styles\features\service-map\desktop.css:2438` — `.service-map-toolbar__results .service-map-toolbar__result-button:focus-visible::before`
-   `app\styles\features\service-map\desktop.css:2438` — `.service-map-toolbar__results .service-map-toolbar__result-button[data-selected="true"]::before`
-   `app\styles\features\service-map\desktop.css:2444` — `:root .service-map-toolbar__results .service-map-toolbar__result-button.ui-glow-button-frame`
-   `app\styles\features\service-map\desktop.css:2444` — `:root .service-map-toolbar__results .service-map-toolbar__result-button.ui-glow-button-frame:is(:hover, :focus-visible, :active, [data-selected="true"])`
-   `app\styles\features\service-map\desktop.css:2449` — `.service-map-leaflet-shell`
-   `app\styles\features\service-map\desktop.css:2460` — `.service-map-workspace .service-map-leaflet-shell`
-   `app\styles\features\service-map\desktop.css:2468` — `.service-map-workspace .service-map-leaflet`
-   `app\styles\features\service-map\desktop.css:2476` — `.service-map-leaflet`
-   `app\styles\features\service-map\desktop.css:2488` — `.service-map-leaflet.leaflet-container`
-   `app\styles\features\service-map\desktop.css:2497` — `.service-map-leaflet .leaflet-pane`
-   `app\styles\features\service-map\desktop.css:2497` — `.service-map-leaflet .leaflet-map-pane`
-   `app\styles\features\service-map\desktop.css:2497` — `.service-map-leaflet .leaflet-tile-pane`
-   `app\styles\features\service-map\desktop.css:2497` — `.service-map-leaflet .leaflet-tile-container`
-   `app\styles\features\service-map\desktop.css:2504` — `.service-map-leaflet .leaflet-div-icon`
-   `app\styles\features\service-map\desktop.css:2509` — `.service-map-leaflet__status`
-   `app\styles\features\service-map\desktop.css:2524` — `.service-map-leaflet__legend`
-   `app\styles\features\service-map\desktop.css:2543` — `.service-map-leaflet__legend-item`
-   `app\styles\features\service-map\desktop.css:2553` — `.service-map-leaflet__legend-marker`
-   `app\styles\features\service-map\desktop.css:2559` — `.service-map-leaflet__legend-marker .service-map-leaflet__marker`
-   `app\styles\features\service-map\desktop.css:2565` — `.service-map-leaflet__marker`
-   `app\styles\features\service-map\desktop.css:2592` — `.service-map-leaflet__marker::before`
-   `app\styles\features\service-map\desktop.css:2596` — `.service-map-leaflet__marker-shape`
-   `app\styles\features\service-map\desktop.css:2605` — `.service-map-leaflet__marker-pin`
-   `app\styles\features\service-map\desktop.css:2612` — `.service-map-leaflet__marker-hole`
-   `app\styles\features\service-map\desktop.css:2617` — `.service-map-leaflet__marker-label`
-   `app\styles\features\service-map\desktop.css:2628` — `.service-map-leaflet__marker--help-offer .service-map-leaflet__marker-label`
-   `app\styles\features\service-map\desktop.css:2635` — `.service-map-leaflet__marker--kov`
-   `app\styles\features\service-map\desktop.css:2640` — `.service-map-leaflet__marker--provider`
-   `app\styles\features\service-map\desktop.css:2645` — `.service-map-leaflet__marker--help-request`
-   `app\styles\features\service-map\desktop.css:2653` — `.service-map-leaflet__marker--help-offer`
-   `app\styles\features\service-map\desktop.css:2662` — `.service-map-leaflet__marker--mixed`
-   `app\styles\features\service-map\desktop.css:2669` — `.service-map-leaflet__marker--group`
-   `app\styles\features\service-map\desktop.css:2673` — `.service-map-leaflet__marker--selected`
-   `app\styles\features\service-map\desktop.css:2679` — `.service-map-leaflet__legend-marker .service-map-leaflet__marker-label`
-   `app\styles\features\service-map\desktop.css:2683` — `.service-map-leaflet__popup .leaflet-popup-content-wrapper`
-   `app\styles\features\service-map\desktop.css:2698` — `.service-map-leaflet__popup .leaflet-popup-content-wrapper::before`
-   `app\styles\features\service-map\desktop.css:2710` — `.service-map-leaflet__popup .leaflet-popup-content`
-   `app\styles\features\service-map\desktop.css:2719` — `.service-map-leaflet__popup--group .leaflet-popup-content`
-   `app\styles\features\service-map\desktop.css:2723` — `.service-map-leaflet__popup .leaflet-popup-tip`
-   `app\styles\features\service-map\desktop.css:2730` — `.service-map-leaflet__popup.leaflet-popup`
-   `app\styles\features\service-map\desktop.css:2734` — `.service-map-leaflet.leaflet-fade-anim .service-map-leaflet__popup.leaflet-popup`
-   `app\styles\features\service-map\desktop.css:2739` — `.service-map-leaflet__popup .leaflet-popup-close-button`
-   `app\styles\features\service-map\desktop.css:2763` — `.service-map-leaflet__popup .leaflet-popup-close-button:hover`
-   `app\styles\features\service-map\desktop.css:2763` — `.service-map-leaflet__popup .leaflet-popup-close-button:focus-visible`
-   `app\styles\features\service-map\desktop.css:2770` — `.service-map-popup`
-   `app\styles\features\service-map\desktop.css:2782` — `.service-map-popup--group`
-   `app\styles\features\service-map\desktop.css:2789` — `.service-map-popup--help`
-   `app\styles\features\service-map\desktop.css:2793` — `.service-map-popup__eyebrow`
-   `app\styles\features\service-map\desktop.css:2803` — `.service-map-popup__privacy-note`
-   `app\styles\features\service-map\desktop.css:2810` — `.service-map-popup__contacts`
-   `app\styles\features\service-map\desktop.css:2822` — `.service-map-popup__contacts::-webkit-scrollbar`
-   `app\styles\features\service-map\desktop.css:2827` — `.service-map-popup__contact`
-   `app\styles\features\service-map\desktop.css:2840` — `.service-map-popup__contact[data-selected="true"]`
-   `app\styles\features\service-map\desktop.css:2845` — `.service-map-popup__contact-button`
-   `app\styles\features\service-map\desktop.css:2860` — `.service-map-popup__contact-button:focus-visible`
-   `app\styles\features\service-map\desktop.css:2865` — `.service-map-popup__contact-title`
-   `app\styles\features\service-map\desktop.css:2872` — `.service-map-popup__contact-description`
-   `app\styles\features\service-map\desktop.css:2872` — `.service-map-popup__contact-meta`
-   `app\styles\features\service-map\desktop.css:2880` — `.service-map-popup__contact-meta`
-   `app\styles\features\service-map\desktop.css:2889` — `.service-map-popup__contact-email`
-   `app\styles\features\service-map\desktop.css:2893` — `.service-map-popup__contact-actions`
-   `app\styles\features\service-map\desktop.css:2903` — `.service-map-leaflet__popup .service-map-popup__actions.service-map-popup__contact-actions a`
-   `app\styles\features\service-map\desktop.css:2909` — `:root.theme-light:not(.theme-mid) .service-map-workspace`
-   `app\styles\features\service-map\desktop.css:2913` — `:root.theme-mid .service-map-workspace`
-   `app\styles\features\service-map\desktop.css:2917` — `:root.theme-night .service-map-workspace`
-   `app\styles\features\service-map\desktop.css:2924` — `:root.theme-mono:not([data-contrast="hc"]) .service-map-workspace`
-   `app\styles\features\service-map\desktop.css:2931` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"]) .service-map-workspace`
-   `app\styles\features\service-map\desktop.css:2938` — `html[data-contrast="hc"] .service-map-leaflet__popup .leaflet-popup-content-wrapper`
-   `app\styles\features\service-map\desktop.css:2938` — `html[data-contrast="hc"] .service-map-leaflet__popup .leaflet-popup-tip`
-   `app\styles\features\service-map\desktop.css:2948` — `html[data-contrast="hc"] .service-map-leaflet__popup .leaflet-popup-content-wrapper::before`
-   `app\styles\features\service-map\desktop.css:2954` — `.service-map-leaflet__popup .service-map-popup :is(h3, h4, p)`
-   `app\styles\features\service-map\desktop.css:2958` — `.service-map-popup__title`
-   `app\styles\features\service-map\desktop.css:2967` — `.service-map-popup__body`
-   `app\styles\features\service-map\desktop.css:2967` — `.service-map-popup__meta`
-   `app\styles\features\service-map\desktop.css:2975` — `.service-map-popup__body`
-   `app\styles\features\service-map\desktop.css:2983` — `.service-map-popup__meta`
-   `app\styles\features\service-map\desktop.css:2990` — `.service-map-popup__label`
-   `app\styles\features\service-map\desktop.css:2998` — `.service-map-popup__meta > span:last-child`
-   `app\styles\features\service-map\desktop.css:3003` — `.service-map-popup__services`
-   `app\styles\features\service-map\desktop.css:3009` — `.service-map-popup__services-title`
-   `app\styles\features\service-map\desktop.css:3017` — `.service-map-popup__service`
-   `app\styles\features\service-map\desktop.css:3026` — `.service-map-popup__service-title`
-   `app\styles\features\service-map\desktop.css:3034` — `.service-map-popup__service-body`
-   `app\styles\features\service-map\desktop.css:3034` — `.service-map-popup__service-meta`
-   `app\styles\features\service-map\desktop.css:3042` — `.service-map-popup__access-path`
-   `app\styles\features\service-map\desktop.css:3048` — `.service-map-popup__access-path-title`
-   `app\styles\features\service-map\desktop.css:3056` — `.service-map-popup__access-path-body`
-   `app\styles\features\service-map\desktop.css:3056` — `.service-map-popup__access-path-note`
-   `app\styles\features\service-map\desktop.css:3064` — `.service-map-popup__access-path-note`
-   `app\styles\features\service-map\desktop.css:3068` — `.service-map-popup__access-path-meta`
-   `app\styles\features\service-map\desktop.css:3073` — `.service-map-popup__actions`
-   `app\styles\features\service-map\desktop.css:3081` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button)`
-   `app\styles\features\service-map\desktop.css:3108` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button)::before`
-   `app\styles\features\service-map\desktop.css:3119` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button)`
-   `app\styles\features\service-map\desktop.css:3123` — `:root:not(.theme-light):not(.theme-mid) .service-map-leaflet__popup .service-map-popup__actions :is(a, button)`
-   `app\styles\features\service-map\desktop.css:3133` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button) > span`
-   `app\styles\features\service-map\desktop.css:3139` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button):is(:hover, :focus-visible)::before`
-   `app\styles\features\service-map\desktop.css:3143` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button):is(:hover, :focus-visible)`
-   `app\styles\features\service-map\desktop.css:3149` — `:root:not(.theme-light):not(.theme-mid) .service-map-leaflet__popup .service-map-popup__actions :is(a, button):is(:hover, :focus-visible)`
-   `app\styles\features\service-map\desktop.css:3159` — `html[data-contrast="hc"] .service-map-leaflet__popup .service-map-popup__actions :is(a, button):is(:hover, :focus-visible)`
-   `app\styles\features\service-map\desktop.css:3168` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button):active`
-   `app\styles\features\service-map\desktop.css:3174` — `.service-map-leaflet__popup .service-map-popup__actions :is(a, button):active::before`
-   `app\styles\features\service-map\desktop.css:3178` — `.service-map-leaflet__popup .service-map-popup__actions button:disabled`
-   `app\styles\features\service-map\desktop.css:3188` — `.service-map-leaflet .leaflet-bottom.leaflet-right`
-   `app\styles\features\service-map\desktop.css:3193` — `.service-map-leaflet .leaflet-control-attribution`
-   `app\styles\features\service-map\desktop.css:3204` — `:root.theme-mid .service-map-leaflet .leaflet-control-attribution`
-   `app\styles\features\service-map\desktop.css:3209` — `.service-map-leaflet .leaflet-control-attribution a`
-   `app\styles\features\service-map\desktop.css:3213` — `.pre-inquiry-agent-chat`
-   `app\styles\features\service-map\desktop.css:3231` — `.pre-inquiry-agent-chat .documents-agent-conversation-shell`
-   `app\styles\features\service-map\desktop.css:3236` — `.pre-inquiry-agent-chat .documents-agent-glow-window`
-   `app\styles\features\service-map\desktop.css:3236` — `.pre-inquiry-agent-chat .documents-agent-glow-composer`
-   `app\styles\features\service-map\desktop.css:3243` — `.pre-inquiry-agent-chat .documents-agent-glow-window:hover`
-   `app\styles\features\service-map\desktop.css:3243` — `.pre-inquiry-agent-chat .documents-agent-glow-window:focus-within`
-   `app\styles\features\service-map\desktop.css:3243` — `.pre-inquiry-agent-chat .documents-agent-glow-composer:hover`
-   `app\styles\features\service-map\desktop.css:3243` — `.pre-inquiry-agent-chat .documents-agent-glow-composer:focus-within`
-   `app\styles\features\service-map\desktop.css:3250` — `.pre-inquiry-agent-chat .documents-agent-conversation-window`
-   `app\styles\features\service-map\desktop.css:3259` — `.pre-inquiry-agent-chat .documents-agent-composer-slot`
-   `app\styles\features\service-map\desktop.css:3265` — `.pre-inquiry-agent-chat .documents-agent-composer-slot .chat-inputbar`
-   `app\styles\features\service-map\desktop.css:3269` — `.pre-inquiry-agent-chat .documents-agent-composer-slot .chat-input-field`
-   `app\styles\features\service-map\desktop.css:3274` — `.pre-inquiry-agent-chat .documents-agent-composer-slot .chat-input-field::placeholder`
-   `app\styles\features\service-map\desktop.css:3279` — `.pre-inquiry-agent-chat .documents-agent-conversation-window .chat-window__scroll`
-   `app\styles\features\service-map\desktop.css:3284` — `.service-map-workspace` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3288` — `.service-map-workspace__map` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3292` — `.service-map-workspace__filters` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3301` — `.service-map-workspace__filters-shell` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3309` — `.service-map-toolbar__identity` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3315` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__body` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3325` — `.service-map-toolbar__resultsblock` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3330` — `.service-map-toolbar__fields` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3330` — `.service-map-toolbar__types` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3336` — `.service-map-workspace__role` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3343` — `.workspace-feature-admin-role--floating` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3348` — `.workspace-feature-admin-role--floating .workspace-role-cycle-button` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3355` — `.service-map-toolbar__results` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\desktop.css:3359` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__results` _(@media (max-width: 1180px))_
-   `app\styles\features\service-map\mobile.css:3` — `.service-map-page-panel.service-map-page-panel` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:14` — `.service-map-workspace` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:28` — `html[data-contrast="hc"] .service-map-workspace` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:28` — `:root[data-contrast="hc"] .service-map-workspace` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:37` — `.service-map-toolbar__identity` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:41` — `.service-map-workspace__back` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:45` — `.service-map-workspace__map` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:55` — `.service-map-workspace__filters` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:66` — `.service-map-workspace__filters--collapsed` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:73` — `.service-map-workspace__filters--collapsed .service-map-workspace__filters-shell` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:80` — `.service-map-workspace__filters-shell` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:96` — `.service-map-workspace__filters-shell--toolbar-feedback` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:102` — `.service-map-workspace--toolbar-feedback .service-map-workspace__filters-shell` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:108` — `.service-map-toolbar__content` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:116` — `.service-map-toolbar__body` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:124` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__body` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:128` — `.service-map-toolbar__fields` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:134` — `.service-map-toolbar__field--keyword` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:134` — `.service-map-toolbar__field--region` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:139` — `.service-map-toolbar__input` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:143` — `.service-map-toolbar__input--keyword` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:143` — `.service-map-toolbar__input--region` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:149` — `.service-map-toolbar__types` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:157` — `.service-map-toolbar__type-card` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:168` — `.service-map-toolbar__type-card .service-map-toolbar__type-label` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:177` — `.service-map-toolbar__resultsblock` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:183` — `.service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:200` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:200` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:hover` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:200` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:focus-visible` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:212` — `.service-map-workspace__filters--collapsed .service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:230` — `.service-map-workspace__toggle svg` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:235` — `.service-map-toolbar__results` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:250` — `.service-map-toolbar__results .workspace-feature-list-card` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:261` — `.service-map-toolbar__results .workspace-feature-list-card .service-map-result-card__title` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:268` — `.service-map-leaflet .leaflet-top.leaflet-left` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:274` — `.service-map-leaflet__legend` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:280` — `.service-map-leaflet .leaflet-control-attribution` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:284` — `.service-map-workspace__role` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:292` — `.service-map-workspace__role .workspace-feature-admin-role` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:297` — `.service-map-workspace__role .workspace-role-cycle-button` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:304` — `.service-map-workspace__status` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:313` — `.service-map-leaflet__status` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:323` — `.service-map-leaflet__popup--group .leaflet-popup-content` _(@media (max-width: 520px))_
-   `app\styles\features\service-map\mobile.css:327` — `.service-map-popup--group` _(@media (max-width: 520px))_
-   `app\styles\features\service-map\mobile.css:332` — `.service-map-popup__contacts` _(@media (max-width: 520px))_
-   `app\styles\features\service-map\mobile.css:336` — `.service-map-popup__contact` _(@media (max-width: 520px))_
-   `app\styles\features\service-map\mobile.css:340` — `.service-map-popup__contact-actions` _(@media (max-width: 520px))_
-   `app\styles\features\service-map\mobile.css:349` — `.service-map-workspace` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:355` — `.service-map-workspace__filters` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:364` — `.service-map-workspace__filters--collapsed` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:371` — `.service-map-workspace__filters-shell` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:375` — `.service-map-workspace__filters-shell--toolbar-feedback` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:381` — `.service-map-workspace--toolbar-feedback .service-map-workspace__filters-shell` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:385` — `.service-map-toolbar__type-card` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:391` — `.service-map-workspace__filters h2` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:396` — `.service-map-workspace__filters label` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:400` — `.service-map-workspace__filters input` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:407` — `.service-map-workspace__toggle` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:425` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:425` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:hover` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:425` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:focus-visible` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:436` — `.service-map-workspace__toggle svg` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:441` — `.service-map-leaflet .leaflet-top.leaflet-left` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:447` — `.service-map-workspace__role` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:453` — `.service-map-workspace__status` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:461` — `.service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:461` — `.service-map-workspace__filters--collapsed .service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:474` — `.service-map-workspace__info.service-map-workspace__info` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:484` — `.service-map-workspace__info.service-map-workspace__info svg` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:489` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:489` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:hover` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:489` — `.service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:focus-visible` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:503` — `.service-map-workspace__filters-shell` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:515` — `.service-map-workspace` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:526` — `.service-map-workspace .service-map-workspace__back.service-map-workspace__back` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:532` — `.service-map-workspace__map` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:545` — `.service-map-toolbar__identity` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:553` — `.service-map-toolbar__back` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:560` — `.service-map-toolbar__back svg` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:565` — `.service-map-workspace .service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:565` — `.service-map-workspace .service-map-workspace__toggle:hover` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:565` — `.service-map-workspace .service-map-workspace__toggle:focus-visible` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:565` — `.service-map-workspace .service-map-workspace__filters--collapsed .service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:565` — `.service-map-workspace .service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:565` — `.service-map-workspace .service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:hover` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:565` — `.service-map-workspace .service-map-workspace__filters:not(.service-map-workspace__filters--collapsed) .service-map-workspace__toggle:focus-visible` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:578` — `.service-map-workspace--toolbar-feedback .service-map-workspace__info.service-map-workspace__info` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:585` — `.service-map-workspace__filters-shell` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:592` — `.service-map-workspace--toolbar-feedback .service-map-workspace__filters-shell` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:596` — `.service-map-toolbar__content` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:600` — `.service-map-toolbar__body` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:607` — `.service-map-toolbar__fields` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:614` — `.service-map-toolbar__field` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:618` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__fields` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:623` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__field--keyword` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:623` — `.service-map-workspace--toolbar-feedback .service-map-toolbar__field--region` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:628` — `.service-map-toolbar__glow-field` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:632` — `.service-map-toolbar__input` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:639` — `.service-map-toolbar__types` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:646` — `.service-map-toolbar__types .service-map-toolbar__type-card:nth-child(3)` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:650` — `.service-map-toolbar__type-card` _(@media (max-width: 768px))_
-   `app\styles\features\service-map\mobile.css:660` — `.service-map-workspace` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:668` — `.service-map-toolbar__types` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:674` — `.service-map-workspace__filters-shell` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:674` — `.service-map-workspace--toolbar-feedback .service-map-workspace__filters-shell` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:679` — `.service-map-toolbar__fields` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:684` — `.service-map-toolbar__input` _(@media (max-width: 560px))_
-   `app\styles\features\service-map\mobile.css:690` — `.service-map-toolbar__type-card` _(@media (max-width: 560px))_
-   `app\styles\mobile\accessibility-modal-fields.css:4` — `.a11y-language-fieldset--single` _(@media (max-width: 768px))_
-   `app\styles\mobile\accessibility-modal-fields.css:8` — `.a11y-textscale-fieldset` _(@media (max-width: 768px))_
-   `app\styles\mobile\accessibility-modal-fields.css:13` — `.a11y-contrast-fieldset` _(@media (max-width: 768px))_
-   `app\styles\mobile\accessibility-touch.css:4` — `.a11y-language-fieldset--single` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:9` — `.a11y-language-fieldset--wrap` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:14` — `.a11y-textscale-fieldset` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:21` — `.a11y-textscale-options` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:27` — `.a11y-contrast-fieldset` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:33` — `.register-content` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:37` — `.register-scroll` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:37` — `.rooms-scroll` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:45` — `.register-form` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:50` — `.register-form > .register-step` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:55` — `.register-form > .register-step:last-child` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:59` — `.register-alert` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:67` — `:root:not(.theme-light) .register-alert` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:74` — `.register-input` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:81` — `.register-scroll .register-input` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:88` — `:root.theme-mid .register-step--field` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:95` — `:root.theme-mid .register-step--field .register-input` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:100` — `.register-input-shell` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:107` — `:root.theme-mid .register-step--field .register-input-shell--mid` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:122` — `:root.theme-mid .register-step--field .register-input-shell--mid:hover` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:122` — `:root.theme-mid .register-step--field .register-input-shell--mid:focus-within` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:132` — `:root.theme-mid .register-step--field .register-input-mid-shell` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:145` — `:root.theme-mid .register-step--field .register-input-mid-shell::placeholder` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:151` — `:root.theme-mid .register-step--field .register-input-mid-shell:hover` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:151` — `:root.theme-mid .register-step--field .register-input-mid-shell:focus` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:151` — `:root.theme-mid .register-step--field .register-input-mid-shell:focus-visible` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:159` — `.register-role-options` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:163` — `.register-option-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:163` — `.register-checkbox-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:171` — `.register-option-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:179` — `.register-checkbox-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:190` — `.register-copy` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:195` — `html[data-platform="android"] .register-option-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:195` — `body[data-platform="android"] .register-option-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:206` — `html[data-platform="android"] .register-checkbox-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:206` — `body[data-platform="android"] .register-checkbox-card` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:219` — `html[data-platform="android"] .register-copy` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:219` — `body[data-platform="android"] .register-copy` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:226` — `.register-submit` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:238` — `.register-submit .register-submit-label` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:244` — `.register-back-button` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:257` — `.register-back-button > svg` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:262` — `.register-scroll.csp-container` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:262` — `.rooms-scroll.csp-container` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:262` — `.a11y-csp-scroll.csp-container` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:277` — `.register-scroll.csp-container .csp-item` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:277` — `.rooms-scroll.csp-container .csp-item` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:283` — `.a11y-csp-scroll.csp-container .csp-item` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:288` — `.a11y-csp-scroll.csp-container .a11y-save-step` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:293` — `.register-scroll.csp-container` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\accessibility-touch.css:293` — `.rooms-scroll.csp-container` _(@media (max-width: 768px) and (pointer: coarse))_
-   `app\styles\mobile\background-home.css:35` — `[data-bg-layer][data-page="subpage"][data-mobile-bends="pending"] .bg-bends-layer` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:40` — `[data-bg-layer][data-page="home"][data-mobile-bends="pending"] .bg-bends-layer` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:49` — `[data-bg-layer][data-page="home"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:52` — `[data-bg-layer][data-page="home"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:52` — `[data-bg-layer][data-page="home"] .bg-space-layer` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:52` — `[data-bg-layer][data-page="home"] .space-backdrop` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:61` — `[data-bg-layer][data-page="home"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:110` — `html.theme-light:has(
        [data-bg-layer][data-page="home"]
      )` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:110` — `html.theme-light:has(
        [data-bg-layer][data-page="home"]
      )
      body.app-root` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:119` — `html.theme-mid:has(
        [data-bg-layer][data-page="home"]
      )` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:119` — `html.theme-mid:has(
        [data-bg-layer][data-page="home"]
      )
      body.app-root` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:128` — `html.theme-night:has(
        [data-bg-layer][data-page="home"]
      )` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:128` — `html.theme-night:has(
        [data-bg-layer][data-page="home"]
      )
      body.app-root` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:137` — `html.theme-mono:not([data-contrast="hc"]):has(
        [data-bg-layer][data-page="home"]
      )` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:137` — `html.theme-mono:not([data-contrast="hc"]):has(
        [data-bg-layer][data-page="home"]
      )
      body.app-root` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:137` — `html:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):has(
        [data-bg-layer][data-page="home"]
      )` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:137` — `html:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):has(
        [data-bg-layer][data-page="home"]
      )
      body.app-root` _(@supports selector(html:has([data-bg-layer][data-page="home"])))_
-   `app\styles\mobile\background-home.css:154` — `[data-bg-layer][data-page="home"] .bg-space-layer` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:154` — `[data-bg-layer][data-page="home"] .space-backdrop` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:161` — `[data-bg-layer][data-page="home"] .bg-space-layer` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:161` — `[data-bg-layer][data-page="home"] .space-backdrop` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:168` — `.homepage-root .home-about-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:168` — `.homepage-root .home-about-scrollbox` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:168` — `.homepage-root .home-about-scrollbox > *` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:202` — `.glass-ring` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:202` — `.invite-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:202` — `.person-invite-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:202` — `.account-settings-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:216` — `.glass-ring::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:221` — `.glass-field-hole-surface` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:225` — `.glass-field-hole-surface > .glass-hole-mask-layer` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:235` — `.glass-field-hole-surface
    > :not(.glass-hole-mask-layer):not(.modal-close-btn):not(.login-modal-close):not(.back-button)` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:250` — `.main-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:259` — `.side` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:264` — `.float-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:268` — `.three-d-card.mobile-flipped-left .card-wrapper` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:271` — `.three-d-card.mobile-flipped-right .card-wrapper` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:274` — `.three-d-card.mobile-flipped-left .card-face.back` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:274` — `.three-d-card.mobile-flipped-right .card-face.back` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:278` — `.three-d-card.mobile-flipped-left .card-face.front` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:278` — `.three-d-card.mobile-flipped-right .card-face.front` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:282` — `.homepage-root .three-d-card.mobile-flipped-left` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:282` — `.homepage-root .three-d-card.mobile-flipped-right` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:286` — `.centered-back-left` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:286` — `.centered-back-right` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:299` — `.centered-back-left .home-card-face-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:299` — `.centered-back-right .home-card-face-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:305` — `.centered-back-left h2` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:305` — `.centered-back-right h2` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:309` — `.splash-cursor` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:315` — `.three-d-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:321` — `.homepage-root .three-d-card.float-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:325` — `html[data-reduce-motion="1"] .homepage-root .three-d-card.float-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:329` — `html[data-reduce-motion="1"] .homepage-root .three-d-card .card-wrapper` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:332` — `.homepage-root .three-d-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:337` — `.homepage-root .home-hero-section` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:341` — `.home-hero-shell` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:346` — `.homepage-root` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:351` — `html:not([data-contrast="hc"]) .homepage-root .left-card-primary .circular-text-line` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:351` — `html:not([data-contrast="hc"]) .homepage-root .centered-back-left h2` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:356` — `html:not([data-contrast="hc"]) .homepage-root .right-card-primary .circular-text-line` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:356` — `html:not([data-contrast="hc"]) .homepage-root .centered-back-right h2` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:362` — `html:not([data-contrast="hc"]) .homepage-root
    :is(.left-card-primary, .right-card-primary, .centered-back-left, .centered-back-right)
    > svg:not(.circular-text-svg)` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:370` — `.glass-box` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:382` — `.circular-text-line` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:387` — `.word1` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:387` — `.word2` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:387` — `.word3` _(@media (max-width: 768px))_
-   `app\styles\mobile\background-home.css:393` — `.circular-text-svg.circular-ring` _(@media (max-width: 768px))_
-   `app\styles\mobile\chat-bootstrap.css:3` — `html[data-layout="mobile"] .chat-page-shell .chat-container[data-chat-container="true"]`
-   `app\styles\mobile\chat-bootstrap.css:7` — `html[data-layout="mobile"] .chat-page-shell .chat-input-row:not(.chat-input-row--embedded)`
-   `app\styles\mobile\foundations.css:49` — `body.homepage` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:49` — `html[data-initial-page="home"] body.app-root` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:73` — `body.homepage` _(@supports (height: 100lvh))_
-   `app\styles\mobile\foundations.css:73` — `html[data-initial-page="home"] body.app-root` _(@supports (height: 100lvh))_
-   `app\styles\mobile\foundations.css:87` — `html[data-initial-page="home"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:98` — `html[data-initial-page="home"]` _(@supports (height: 100lvh))_
-   `app\styles\mobile\foundations.css:179` — `.homepage-root` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:190` — `.homepage-root::-webkit-scrollbar` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:195` — `.drawer-close-btn--chat.modal-close-btn` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:200` — `.drawer-close-btn--chat.modal-close-btn::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:218` — `.glass-ring` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:265` — `:root.theme-mid .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:265` — `:root.theme-light .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:265` — `:root.theme-night .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:265` — `:root.theme-mono .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:265` — `.glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\foundations.css:289` — `.click-pulse-cursor` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:4` — `.profile-orbit-stack-fade` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:9` — `.profile-orbit-stack-panel::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:9` — `.profile-orbit-stack-panel::after` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:9` — `html[data-platform="android"] .profile-orbit-stack-panel::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:9` — `html[data-platform="android"] .profile-orbit-stack-panel::after` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:9` — `body[data-platform="android"] .profile-orbit-stack-panel::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:9` — `body[data-platform="android"] .profile-orbit-stack-panel::after` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:23` — `.profile-orbit-stack-panel::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:23` — `html[data-platform="android"] .profile-orbit-stack-panel::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:23` — `body[data-platform="android"] .profile-orbit-stack-panel::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:29` — `.profile-orbit-stack-panel::after` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:29` — `html[data-platform="android"] .profile-orbit-stack-panel::after` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:29` — `body[data-platform="android"] .profile-orbit-stack-panel::after` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:37` — `.homepage-root .home-about-scrollbox` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:37` — `.homepage-root .home-about-scrollbox :is(p, div, strong, b, a, span)` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:49` — `.homepage-root .home-about-scrollbox .home-about-features-link-row` _(@media (max-width: 768px))_
-   `app\styles\mobile\home-scroll.css:54` — `.direct-scroll-surface`
-   `app\styles\mobile\invite-workspace.css:4` — `.help-listings-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\invite-workspace.css:11` — `.invite-modal-overlay.person-invite-modal-overlay:not(.invite-modal-overlay--workspace)`
-   `app\styles\mobile\invite-workspace.css:19` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)`
-   `app\styles\mobile\invite-workspace.css:26` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)
  > .invite-modal-scroll:not(.workspace-guide-panel-scroll)`
-   `app\styles\mobile\invite-workspace.css:34` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)
  .invite-list-panel`
-   `app\styles\mobile\invite-workspace.css:45` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)` _(@media (max-height: 760px) and (min-width: 769px))_
-   `app\styles\mobile\invite-workspace.css:52` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)
    > .invite-modal-scroll:not(.workspace-guide-panel-scroll)` _(@media (max-height: 760px) and (min-width: 769px))_
-   `app\styles\mobile\invite-workspace.css:59` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)
    .invite-list-panel` _(@media (max-height: 760px) and (min-width: 769px))_
-   `app\styles\mobile\invite-workspace.css:67` — `.workspace-dashboard-panel .workspace-feature-embedded > :is(
  .help-listings-modal-content--embedded,
  .invite-modal-content--embedded
)`
-   `app\styles\mobile\invite-workspace.css:97` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
  .help-listings-panel,
  .help-listings-item-card,
  .invite-glow-panel,
  .invite-list-panel,
  .invite-list-row
)`
-   `app\styles\mobile\invite-workspace.css:111` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
  .help-listings-body,
  .help-listings-panel,
  .invite-modal-scroll,
  .invite-list-panel
)`
-   `app\styles\mobile\invite-workspace.css:124` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
  .help-listings-panel,
  .help-listings-item-card,
  .invite-list-panel,
  .invite-list-row
)`
-   `app\styles\mobile\invite-workspace.css:137` — `.workspace-dashboard-panel .workspace-feature-embedded
  .invite-glow-panel
  > [class*="edgeLight"]`
-   `app\styles\mobile\invite-workspace.css:144` — `.workspace-dashboard-panel .workspace-feature-embedded
  .invite-list-panel`
-   `app\styles\mobile\invite-workspace.css:151` — `.workspace-dashboard-panel
  .workspace-feature-embedded
  > .help-listings-modal-content--embedded::before`
-   `app\styles\mobile\invite-workspace.css:151` — `.workspace-dashboard-panel
  .workspace-feature-embedded
  > .invite-modal-content--embedded::before`
-   `app\styles\mobile\invite-workspace.css:162` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
  .help-listings-modal-content--embedded .help-listings-body,
  .invite-modal-content--embedded .invite-modal-scroll
)`
-   `app\styles\mobile\invite-workspace.css:171` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
  .help-listings-modal-content--embedded .help-listings-scroll,
  .help-listings-modal-content--embedded .selected-listing-body,
  .invite-modal-content--embedded .invite-modal-scroll
)`
-   `app\styles\mobile\invite-workspace.css:180` — `.workspace-dashboard-panel .covision-page-body.workspace-guide-panel-scroll`
-   `app\styles\mobile\invite-workspace.css:185` — `.workspace-dashboard-panel .covision-page-body .covision-glow-card`
-   `app\styles\mobile\invite-workspace.css:190` — `.workspace-dashboard-panel .covision-page-body .covision-glow-card > [class*="edgeLight"]`
-   `app\styles\mobile\invite-workspace.css:195` — `.workspace-dashboard-panel
  .documents-workspace-shell--embedded
  > .documents-grid.workspace-guide-panel-scroll`
-   `app\styles\mobile\invite-workspace.css:195` — `.workspace-dashboard-panel .materials-page-body.workspace-guide-panel-scroll`
-   `app\styles\mobile\invite-workspace.css:202` — `.workspace-dashboard-panel .documents-workspace-shell--embedded :is(
  .documents-panel,
  .documents-surface-panel,
  .documents-library-panel,
  .documents-shell-surface
)`
-   `app\styles\mobile\invite-workspace.css:221` — `.workspace-dashboard-panel .documents-workspace-shell--embedded :is(
  .documents-library-panel,
  .documents-shell-surface
)`
-   `app\styles\mobile\invite-workspace.css:229` — `.workspace-dashboard-panel :is(
  .workspace-feature-embedded,
  .workspace-feature-embedded > .workspace-feature-content.workspace-guide-panel-scroll,
  .workspace-feature-embedded > .help-listings-modal-content--embedded,
  .workspace-feature-embedded > .invite-modal-content--embedded,
  .documents-workspace-shell--embedded,
  .documents-workspace-shell--embedded > .documents-grid.workspace-guide-panel-scroll,
  .materials-page-body.workspace-guide-panel-scroll,
  .covision-page-body.workspace-guide-panel-scroll
)`
-   `app\styles\mobile\login-modal.css:4` — `#login-modal` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-modal.css:28` — `.login-modal-box .login-modal-close.modal-close-btn` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-modal.css:33` — `.login-modal-box .login-modal-close.modal-close-btn::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-otp-close.css:4` — `.login-modal-root.login-modal--otp .modal-close-btn` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-otp-close.css:4` — `.login-modal-root.login-modal--otp .login-modal-close` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-otp-close.css:4` — `.login-modal-root.login-modal--otp > button[aria-label]` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-otp-close.css:21` — `.login-modal-root.login-modal--otp .modal-close-btn::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-otp-close.css:21` — `.login-modal-root.login-modal--otp .login-modal-close::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\login-otp-close.css:21` — `.login-modal-root.login-modal--otp > button[aria-label]::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:4` — `.invite-modal-overlay.person-invite-modal-overlay` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:10` — `.invite-modal-content.person-invite-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:14` — `:is(
      .invite-modal-content,
      .subscription-modal-content,
      .help-listings-modal-content,
      .selected-listing-modal-content
    )` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:50` — `.invite-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:50` — `.subscription-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:50` — `.help-listings-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:61` — `.invite-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:72` — `.subscription-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:72` — `.help-listings-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:72` — `.selected-listing-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:85` — `.selected-listing-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:94` — `.subscription-page-shell` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:94` — `.materials-page-shell` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.subscription-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.materials-page-body` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.materials-page-content
    :is(
      .materials-upload-panel,
      .materials-admin-panel,
      .materials-upload-panel > div,
      .materials-upload-panel form,
      .materials-upload-panel textarea,
      .materials-admin-panel > div
    )` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.help-listings-body` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.help-listings-modal-content .glass-subpage-header` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.help-listings-modal-content
    :is(.help-listings-panel, .help-listings-item-card)` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.selected-listing-body` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:99` — `.selected-listing-modal-content :is(.glass-subpage-header + div, .panel)` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:119` — `.help-listings-modal-content .help-listings-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:140` — `html[data-contrast="hc"] .help-listings-modal-content .help-listings-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:146` — `.help-listings-modal-content .help-listings-item-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:153` — `:root.theme-light:not(.theme-mid) .invite-modal-content` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:203` — `:root.theme-mid
    :is(
      .invite-modal-content,
      .person-invite-modal-content,
      .update-pin-content,
      .update-email-content,
      .reset-password-content,
      .register-content
    )
    :is(
      input:not([type="button"]):not([type="submit"]):not([type="reset"]):not(
          [type="checkbox"]
        ):not([type="radio"]):not([type="file"]):not([type="hidden"]),
      select,
      textarea
    )` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:231` — `:root.theme-mid
    :is(
      .invite-modal-content,
      .person-invite-modal-content,
      .update-pin-content,
      .update-email-content,
      .reset-password-content,
      .register-content
    )
    :is(
      input:not([type="button"]):not([type="submit"]):not([type="reset"]):not(
          [type="checkbox"]
        ):not([type="radio"]):not([type="file"]):not([type="hidden"]),
      select,
      textarea
    ):is(:hover, :focus, :focus-visible, :active)` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:260` — `.invite-modal-content .invite-modal-scroll` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:268` — `.account-settings-modal-content .invite-modal-scroll` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:274` — `.framework-page-shell .framework-body` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:279` — `.framework-page-shell .framework-intro-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\modal-surfaces.css:279` — `.framework-page-shell .framework-document-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\motion.css:4` — `.home-scroll-cue-arrow` _(@media (prefers-reduced-motion: reduce))_
-   `app\styles\mobile\panel-surfaces.css:4` — `html[data-layout="mobile"].theme-mid body[data-layout="mobile"]
    .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:4` — `html[data-layout="mobile"].theme-light body[data-layout="mobile"]
    .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:4` — `html[data-layout="mobile"].theme-night body[data-layout="mobile"]
    .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:4` — `html[data-layout="mobile"].theme-mono body[data-layout="mobile"]
    .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:4` — `html[data-layout="mobile"] body[data-layout="mobile"]
    .glass-ring.glass-ring--desktop-stable` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:4` — `.glass-ring` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:4` — `.workspace-dashboard-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:57` — `html[data-layout="mobile"] body[data-layout="mobile"]
    .workspace-dashboard-panel
    .workspace-dashboard-card[class*="card_document_drafting"]
    [class*="cardIcon"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:66` — `html[data-layout="mobile"] body[data-layout="mobile"]
    .workspace-dashboard-panel
    .workspace-dashboard-card[class*="card_document_drafting"]
    [class*="cardTitle"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:78` — `html[data-layout="mobile"] body[data-layout="mobile"]
    .policy-scroll-page-ring.policy-mobile-tall` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:86` — `html[data-layout="mobile"] body[data-layout="mobile"]
    .policy-scroll-page-ring.policy-mobile-tall
    .policy-scroll-page-scroller` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:95` — `html[data-layout="mobile"] body[data-layout="mobile"]
    .policy-scroll-page-ring.policy-mobile-tall::before` _(@media (max-width: 768px))_
-   `app\styles\mobile\panel-surfaces.css:95` — `html[data-layout="mobile"] body[data-layout="mobile"]
    .policy-scroll-page-ring.policy-mobile-tall::after` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:4` — `html[data-platform="android"] .policy-section-heading` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:4` — `body[data-platform="android"] .policy-section-heading` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:16` — `html[data-platform="android"] .policy-section-body` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:16` — `body[data-platform="android"] .policy-section-body` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:25` — `html[data-platform="android"] .policy-page-scroll` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:25` — `body[data-platform="android"] .policy-page-scroll` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:31` — `html[data-platform="android"] .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:31` — `body[data-platform="android"] .profile-container.glass-ring .profile-email-dock-wrapper.profile-orbit-menu-wrapper` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:42` — `html[data-platform="android"] .profile-container.glass-ring .profile-mobile-action-stack` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:42` — `body[data-platform="android"] .profile-container.glass-ring .profile-mobile-action-stack` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:48` — `html[data-platform="android"] .profile-orbit-stack-list` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:48` — `body[data-platform="android"] .profile-orbit-stack-list` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:59` — `html[data-platform="android"] .profile-orbit-stack-backdrop` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:59` — `body[data-platform="android"] .profile-orbit-stack-backdrop` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:67` — `html[data-platform="android"] .profile-orbit-stack-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:67` — `body[data-platform="android"] .profile-orbit-stack-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:96` — `html[data-platform="android"] .profile-orbit-stack-fade` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:96` — `body[data-platform="android"] .profile-orbit-stack-fade` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:104` — `html[data-platform="android"] .profile-orbit-stack-fade--top` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:104` — `body[data-platform="android"] .profile-orbit-stack-fade--top` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:109` — `html[data-platform="android"] .profile-orbit-stack-fade--bottom` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:109` — `body[data-platform="android"] .profile-orbit-stack-fade--bottom` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:114` — `html[data-platform="android"] :is(.profile-orbit-stack-fade--top, .profile-orbit-stack-fade--bottom)` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:114` — `body[data-platform="android"] :is(.profile-orbit-stack-fade--top, .profile-orbit-stack-fade--bottom)` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:126` — `html[data-platform="android"] .profile-orbit-stack-item` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:126` — `body[data-platform="android"] .profile-orbit-stack-item` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:131` — `html[data-platform="android"] .profile-orbit-stack-bubble.dock-item` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:131` — `body[data-platform="android"] .profile-orbit-stack-bubble.dock-item` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:137` — `html[data-platform="android"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:137` — `body[data-platform="android"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:150` — `html[data-platform="android"] .profile-orbit-stack-item[data-key="my_help_requests"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:150` — `html[data-platform="android"] .profile-orbit-stack-item[data-key="my_help_offers"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:150` — `body[data-platform="android"] .profile-orbit-stack-item[data-key="my_help_requests"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:150` — `body[data-platform="android"] .profile-orbit-stack-item[data-key="my_help_offers"] .profile-orbit-stack-label` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:165` — `html[data-platform="android"] .profile-container.glass-ring .profile-mobile-action-stack .profile-logout-button` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:165` — `body[data-platform="android"] .profile-container.glass-ring .profile-mobile-action-stack .profile-logout-button` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:171` — `html[data-platform="android"] .profile-container.glass-ring .profile-mobile-action-stack .profile-logout-icon` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:171` — `body[data-platform="android"] .profile-container.glass-ring .profile-mobile-action-stack .profile-logout-icon` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:177` — `.profile-container.glass-ring .profile-nav-overlay .profile-mobile-action-stack` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:195` — `.profile-container.glass-ring .profile-nav-overlay .profile-mobile-action-stack > *` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:201` — `.profile-container.glass-ring .profile-nav-overlay .profile-logout-wrap` _(@media (max-width: 768px))_
-   `app\styles\mobile\platform-android.css:213` — `.a11y-screenprofile-option--bottom`
-   `app\styles\mobile\register.css:4` — `section[lang="ru"] .register-checkbox-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\register.css:8` — `section[lang="ru"] .register-agree-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\register.css:12` — `section[lang="ru"] .register-guide-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\register.css:16` — `section[lang="en"] .register-checkbox-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\register.css:20` — `section[lang="en"] .register-guide-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\register.css:24` — `section[lang="et"] .register-checkbox-card` _(@media (max-width: 768px))_
-   `app\styles\mobile\scroll-panels.css:38` — `.invite-modal-content--workspace.workspace-guide-panel.glass-subpage-surface`
-   `app\styles\mobile\scroll-panels.css:45` — `.invite-modal-content--workspace.workspace-guide-panel.glass-subpage-surface
  > .invite-modal-scroll.workspace-guide-panel-scroll`
-   `app\styles\mobile\scroll-panels.css:53` — `.invite-modal-content--workspace.workspace-guide-panel.glass-subpage-surface
  .invite-list-panel`
-   `app\styles\mobile\scroll-panels.css:167` — `.glass-full-panel-mobile-header` _(@media (max-width: 768px))_
-   `app\styles\mobile\scroll-panels.css:176` — `:is(.documents-workspace-page--documents, .documents-workspace-page--agent)` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:24` — `.policy-scroll-page-scroller` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:51` — `.workspace-dashboard-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:51` — `.workspace-dashboard-panel .workspace-guide-panel-scroll` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:80` — `.workspace-dashboard-panel` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:80` — `.workspace-dashboard-panel .workspace-guide-panel-scroll` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:113` — `.policy-scroll-page-scroller` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:134` — `.rag-admin-shell-card .rag-admin-shell-back` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:153` — `.admin-framework-acceptances-page` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:217` — `:is(.glass-ring, .subscription-modal-content, .account-settings-modal-content)
    > :is(.glass-subpage-title-wrap, .policy-mobile-title-wrap)` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:289` — `.glass-title-register` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:293` — `.glass-title-register-ru` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:297` — `.subpage-mobile-title[data-fit-ready="0"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:297` — `.policy-mobile-title[data-fit-ready="0"]` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:363` — `.invite-modal-content.account-settings-modal-content.glass-mobile-card.mobile-keep-desktop-glass-cards` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:376` — `.account-settings-modal-content .account-modal-title-wrap` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:380` — `.account-settings-modal-content .invite-modal-scroll` _(@media (max-width: 768px))_
-   `app\styles\mobile\subpage-title-system.css:389` — `.chat-mobile-topnav .mobile-shared-topnav-title` _(@media (max-width: 768px))_
-   `app\styles\mobile\touch-controls.css:4` — `:is(
      .person-invite-modal-content,
      .register-content,
      .a11y-modal-shell .a11y-csp-scroll,
      .invite-modal-content
    ) [data-control-type][data-checked="false"]:active` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:16` — `:is(
      .person-invite-modal-content,
      .register-content,
      .a11y-modal-shell .a11y-csp-scroll,
      .invite-modal-content
    ) [data-control-type][data-checked="false"]:active::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:25` — `.person-invite-modal-content [data-control-type]:active::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:29` — `:is(.register-content, .a11y-modal-shell .a11y-csp-scroll, .chat-analysis-overlay)
    [data-control-type]` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:35` — `:is(
      .register-content,
      .a11y-modal-shell .a11y-csp-scroll,
      .invite-modal-content,
      .chat-analysis-overlay
    )
    [data-control-type]` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:54` — `:is(
      .person-invite-modal-content [data-control-type][data-checked="true"]:active,
      .register-content [data-control-type][data-checked="true"],
      .register-content [data-control-type][data-checked="true"]:active,
      .a11y-modal-shell .a11y-csp-scroll [data-control-type][data-checked="true"],
      .a11y-modal-shell .a11y-csp-scroll [data-control-type][data-checked="true"]:active,
      .invite-modal-content [data-control-type][data-checked="true"],
      .chat-analysis-overlay [data-control-type][data-checked="true"],
      .chat-analysis-overlay .chat-analysis-toggle-btn[data-control-type][data-checked="true"]:is(:hover, :focus-visible, :active)
    )` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:70` — `:is(
      .register-content,
      .a11y-modal-shell .a11y-csp-scroll,
      .chat-analysis-overlay
    )
    [data-control-type][data-checked="true"]::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:79` — `:is(.register-content, .a11y-modal-shell .a11y-csp-scroll)
    [data-control-type][data-checked="true"]:active::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:84` — `.invite-modal-content [data-control-type][data-checked="true"]::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:88` — `.invite-modal-content [data-control-type][data-checked="true"]:active` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:95` — `.invite-modal-content [data-control-type][data-checked="true"]:active::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:99` — `.chat-analysis-overlay [data-control-type]` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:106` — `.chat-analysis-overlay :is(button.button, a.button)[data-variant="primary"]` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:115` — `.chat-analysis-overlay .chat-analysis-toggle-btn[data-control-type]::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:115` — `.chat-analysis-overlay .chat-analysis-action-btn.button[data-variant="primary"]::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:122` — `.chat-analysis-overlay .chat-analysis-toggle-btn[data-control-type]` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:122` — `.chat-analysis-overlay .chat-analysis-action-btn.button[data-variant="primary"]` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:130` — `.chat-analysis-overlay .chat-analysis-action-btn.button[data-variant="primary"]:active` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:130` — `.chat-analysis-overlay .chat-analysis-action-btn.button[data-variant="primary"]:active::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:130` — `.chat-analysis-overlay .chat-analysis-toggle-btn[data-control-type]:active` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\mobile\touch-controls.css:130` — `.chat-analysis-overlay .chat-analysis-toggle-btn[data-control-type]:active::before` _(@media (hover: none) and (pointer: coarse))_
-   `app\styles\shared\glass-core.css:4` — `.glass-box`
-   `app\styles\shared\glass-core.css:27` — `.glass-box.chat-container`
-   `app\styles\shared\glass-core.css:31` — `:root .glass-box:not(.chat-container):not(.profile-container)`
-   `app\styles\shared\glass-core.css:36` — `.glass-box p`
-   `app\styles\shared\glass-core.css:46` — `.glass-section p`
-   `app\styles\shared\glass-core.css:54` — `.glass-section p:last-child`
-   `app\styles\shared\glass-core.css:57` — `.install-section`
-   `app\styles\shared\glass-core.css:60` — `.install-section p`
-   `app\styles\shared\glass-core.css:106` — `.glass-subpage-back-button--anchored`
-   `app\styles\shared\glass-core.css:115` — `.ui-checkbox-glass`
-   `app\styles\shared\glass-core.css:115` — `.documents-checkbox`
-   `app\styles\shared\glass-core.css:137` — `.ui-checkbox-glass:hover`
-   `app\styles\shared\glass-core.css:137` — `.documents-checkbox:hover`
-   `app\styles\shared\glass-core.css:144` — `.ui-checkbox-glass::after`
-   `app\styles\shared\glass-core.css:144` — `.documents-checkbox::after`
-   `app\styles\shared\glass-core.css:157` — `.ui-checkbox-glass:checked`
-   `app\styles\shared\glass-core.css:157` — `.documents-checkbox:checked`
-   `app\styles\shared\glass-core.css:164` — `.ui-checkbox-glass:checked::after`
-   `app\styles\shared\glass-core.css:164` — `.documents-checkbox:checked::after`
-   `app\styles\shared\glass-core.css:170` — `.ui-checkbox-glass:focus-visible`
-   `app\styles\shared\glass-core.css:170` — `.documents-checkbox:focus-visible`
-   `app\styles\shared\glass-core.css:177` — `.ui-checkbox-glass:checked:focus-visible`
-   `app\styles\shared\glass-core.css:177` — `.documents-checkbox:checked:focus-visible`
-   `app\styles\shared\glass-core.css:182` — `.ui-checkbox-glass:disabled`
-   `app\styles\shared\glass-core.css:182` — `.documents-checkbox:disabled`
-   `app\styles\shared\glass-core.css:188` — `.ui-checkbox-glass:active`
-   `app\styles\shared\glass-core.css:188` — `.documents-checkbox:active`
-   `app\styles\shared\glass-subpage.css:4` — `.glass-ring`
-   `app\styles\shared\glass-subpage.css:63` — `.glass-ring::before`
-   `app\styles\shared\glass-subpage.css:178` — `.glass-subpage-surface:not(.help-listings-modal-content--embedded):not(.invite-modal-content--embedded)
  :is(
    .help-listings-panel,
    .help-listings-item-card,
    .invite-list-panel,
    .invite-list-row
  )`
-   `app\styles\shared\glass-subpage.css:208` — `.glass-ring` _(@media (min-width: 769px))_
-   `app\styles\shared\glass-subpage.css:312` — `.materials-page-shell` _(@media (min-width: 769px))_
-   `app\styles\shared\glass-subpage.css:318` — `.materials-page-content.glass-subpage-surface` _(@media (min-width: 769px))_
-   `app\styles\shared\glass-subpage.css:318` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)` _(@media (min-width: 769px))_
-   `app\styles\shared\glass-subpage.css:332` — `.materials-page-content.glass-subpage-surface` _(@media (min-width: 769px))_
-   `app\styles\shared\glass-subpage.css:338` — `.invite-modal-overlay.person-invite-modal-overlay:not(.invite-modal-overlay--workspace)` _(@media (min-width: 769px))_
-   `app\styles\shared\glass-subpage.css:344` — `.invite-modal-content.person-invite-modal-content.glass-subpage-surface:not(.invite-modal-content--workspace)` _(@media (min-width: 769px))_
-   `app\styles\shared\glass-subpage.css:395` — `.dashboard-info-panel.workspace-guide-panel.glass-subpage-surface`
-   `app\styles\shared\glass-subpage.css:408` — `.dashboard-info-panel.workspace-guide-panel.glass-subpage-surface
  > .dashboard-info-content.workspace-guide-panel-scroll`
-   `app\styles\shared\glass-subpage.css:419` — `.dashboard-info-panel--with-title-metrics
  .glass-subpage-title-wrap`
-   `app\styles\shared\glass-subpage.css:425` — `html[data-reduce-transparency="1"] .dashboard-info-panel.workspace-guide-panel.glass-subpage-surface`
-   `app\styles\shared\glass-subpage.css:429` — `.workspace-guide-panel > header`
-   `app\styles\shared\login-a11y.css:4` — `:root.login-modal-open`
-   `app\styles\shared\login-a11y.css:4` — `body.login-modal-open`
-   `app\styles\shared\login-a11y.css:12` — `:root.login-modal-open`
-   `app\styles\shared\login-a11y.css:16` — `.modal-close-btn`
-   `app\styles\shared\login-a11y.css:42` — `.modal-close-btn::before`
-   `app\styles\shared\login-a11y.css:55` — `.modal-close-btn:hover`
-   `app\styles\shared\login-a11y.css:55` — `.modal-close-btn:focus-visible`
-   `app\styles\shared\login-a11y.css:60` — `.modal-close-btn:active`
-   `app\styles\shared\login-a11y.css:64` — `.modal-close-btn:focus-visible`
-   `app\styles\shared\login-a11y.css:68` — `.scroll-reactive-shell .csp-overlayTitle`
-   `app\styles\shared\login-a11y.css:75` — `.scroll-reactive-shell[data-scrolled="1"] .csp-overlayTitle`
-   `app\styles\shared\login-a11y.css:81` — `.a11y-modal-shell .csp-overlayTitle`
-   `app\styles\shared\login-a11y.css:81` — `.a11y-modal-shell[data-scrolled="1"] .csp-overlayTitle`
-   `app\styles\shared\login-a11y.css:86` — `.a11y-modal-shell::before`
-   `app\styles\shared\login-a11y.css:108` — `body[data-a11y-scroll-lock="1"] .profile-orbit-layer`
-   `app\styles\shared\login-a11y.css:108` — `body[data-a11y-scroll-lock="1"] .profile-orbit-menu__center-shell`
-   `app\styles\shared\login-a11y.css:108` — `body[data-a11y-scroll-lock="1"] .profile-orbit-menu__center-pulse`
-   `app\styles\shared\login-a11y.css:118` — `.glass-title-register`
-   `app\styles\shared\login-a11y.css:123` — `.glass-title-register-ru`
-   `app\styles\shared\login-a11y.css:130` — `.a11y-modal-shell` _(@media (min-width: 769px))_
-   `app\styles\shared\login-a11y.css:163` — `.scroll-reactive-back` _(@media (min-width: 769px))_
-   `app\styles\shared\login-a11y.css:167` — `.scroll-reactive-shell .csp-chevron-frame` _(@media (min-width: 769px))_
-   `app\styles\shared\login-a11y.css:173` — `.scroll-reactive-shell .csp-chevron-icon` _(@media (min-width: 769px))_
-   `app\styles\shared\login-a11y.css:178` — `.scroll-reactive-shell .csp-scrim--chevron.is-muted .csp-chevron-frame` _(@media (min-width: 769px))_
-   `app\styles\shared\login-a11y.css:183` — `.scroll-reactive-shell .csp-scrim--chevron.is-hidden .csp-chevron-frame` _(@media (min-width: 769px))_
-   `app\styles\shared\login-a11y.css:189` — `.login-modal-box .login-modal-close.modal-close-btn`
-   `app\styles\shared\login-a11y.css:201` — `.login-modal-box .login-modal-close.modal-close-btn:hover`
-   `app\styles\shared\login-a11y.css:201` — `.login-modal-box .login-modal-close.modal-close-btn:focus-visible`
-   `app\styles\shared\login-a11y.css:201` — `.login-modal-box .login-modal-close.modal-close-btn:active`
-   `app\styles\shared\login-a11y.css:208` — `.login-modal-box .login-modal-close.modal-close-btn::before` _(@media (min-width: 769px))_
-   `app\styles\shared\login-a11y.css:213` — `:root.theme-light .login-modal-box .login-modal-close.modal-close-btn`
-   `app\styles\shared\login-a11y.css:217` — `.auth-success-text`
-   `app\styles\shared\login-a11y.css:221` — `:root.theme-light .auth-success-text`
-   `app\styles\shared\login-a11y.css:221` — `:root.theme-mid .auth-success-text`
-   `app\styles\shared\login-a11y.css:290` — `.register-input-mid-shell:is(:-webkit-autofill, :autofill)`
-   `app\styles\shared\login-a11y.css:290` — `.register-input-mid-shell:is(:-webkit-autofill, :autofill):hover`
-   `app\styles\shared\login-a11y.css:290` — `.register-input-mid-shell:is(:-webkit-autofill, :autofill):focus`
-   `app\styles\shared\login-a11y.css:290` — `.register-input-mid-shell:is(:-webkit-autofill, :autofill):focus-visible`
-   `app\styles\shared\login-a11y.css:290` — `.register-input-mid-shell:is(:-webkit-autofill, :autofill):active`
-   `app\styles\shared\login-a11y.css:306` — `#login-modal .login-help-popover`
-   `app\styles\shared\login-a11y.css:314` — `:root.theme-light #login-modal .login-help-popover`
-   `app\styles\shared\login-a11y.css:320` — `:root.theme-mid #login-modal .login-help-popover`
-   `app\styles\shared\login-a11y.css:326` — `:root:not(.theme-light):not(.theme-mid) #login-modal .login-help-popover`
-   `app\styles\shared\register.css:5` — `.glass-box a`
-   `app\styles\shared\register.css:8` — `.glass-box a:hover`
-   `app\styles\shared\register.css:8` — `.glass-box a:focus`
-   `app\styles\shared\register.css:11` — `.glass-section p strong`
-   `app\styles\shared\register.css:16` — `.register-checkbox-card .register-policy-link`
-   `app\styles\shared\register.css:16` — `.register-checkbox-card .register-policy-link:hover`
-   `app\styles\shared\register.css:16` — `.register-checkbox-card .register-policy-link:active`
-   `app\styles\shared\register.css:16` — `.register-checkbox-card .register-policy-link:focus-visible`
-   `app\styles\shared\register.css:50` — `:root.theme-light .register-checkbox-card .register-policy-link`
-   `app\styles\shared\register.css:50` — `:root.theme-light .register-checkbox-card .register-policy-link:hover`
-   `app\styles\shared\register.css:50` — `:root.theme-light .register-checkbox-card .register-policy-link:active`
-   `app\styles\shared\register.css:50` — `:root.theme-light .register-checkbox-card .register-policy-link:focus-visible`
-   `app\styles\shared\register.css:57` — `.register-checkbox-card`
-   `app\styles\shared\register.css:57` — `.register-checkbox-card:hover`
-   `app\styles\shared\register.css:57` — `.register-checkbox-card:focus-within`
-   `app\styles\shared\register.css:57` — `.register-checkbox-card[data-checked="true"]`
-   `app\styles\shared\register.css:57` — `.register-checkbox-card[data-checked="true"]:hover`
-   `app\styles\shared\register.css:57` — `.register-checkbox-card[data-checked="true"]:focus-within`
-   `app\styles\shared\register.css:66` — `:root.theme-light .register-checkbox-card`
-   `app\styles\shared\register.css:66` — `:root.theme-light .register-checkbox-card:hover`
-   `app\styles\shared\register.css:66` — `:root.theme-light .register-checkbox-card:focus-within`
-   `app\styles\shared\register.css:66` — `:root.theme-light .register-checkbox-card[data-checked="true"]`
-   `app\styles\shared\register.css:66` — `:root.theme-light .register-checkbox-card[data-checked="true"]:hover`
-   `app\styles\shared\register.css:66` — `:root.theme-light .register-checkbox-card[data-checked="true"]:focus-within`
-   `app\styles\shared\register.css:75` — `.register-option-card`
-   `app\styles\shared\register.css:75` — `.register-checkbox-card`
-   `app\styles\shared\register.css:84` — `:root:not(.theme-light):not(.theme-mid) .register-option-card`
-   `app\styles\shared\register.css:84` — `:root:not(.theme-light):not(.theme-mid) .register-checkbox-card`
-   `app\styles\shared\register.css:100` — `:root:not(.theme-light):not(.theme-mid) .invite-primary-btn`
-   `app\styles\shared\register.css:109` — `:root:not(.theme-light) .invite-sponsor-toggle-card`
-   `app\styles\shared\register.css:124` — `:root:not(.theme-light):not(.theme-mid) .invite-primary-btn:active::before`
-   `app\styles\shared\register.css:124` — `:root:not(.theme-light) .invite-sponsor-toggle-card:active::before`
-   `app\styles\shared\register.css:129` — `.register-option-card[data-checked="true"]`
-   `app\styles\shared\register.css:129` — `.register-checkbox-card[data-checked="true"]`
-   `app\styles\shared\register.css:139` — `.register-option-card[data-checked="true"]`
-   `app\styles\shared\register.css:139` — `.register-option-card[data-checked="true"] > span:last-child`
-   `app\styles\shared\register.css:144` — `.register-role-options .register-role-button`
-   `app\styles\shared\register.css:171` — `.register-role-options .register-role-button::before`
-   `app\styles\shared\register.css:183` — `.register-role-options .register-role-button.register-option-card[data-checked="true"]`
-   `app\styles\shared\register.css:187` — `.register-role-options .register-role-button:hover::before`
-   `app\styles\shared\register.css:187` — `.register-role-options .register-role-button:focus-visible::before`
-   `app\styles\shared\register.css:187` — `.register-role-options .register-role-button[data-checked="true"]::before`
-   `app\styles\shared\register.css:193` — `.register-role-options .register-role-button:hover`
-   `app\styles\shared\register.css:193` — `.register-role-options .register-role-button:focus-visible`
-   `app\styles\shared\register.css:193` — `.register-role-options .register-role-button[data-checked="true"]`
-   `app\styles\shared\register.css:201` — `.register-role-options .register-role-button:focus-visible`
-   `app\styles\shared\register.css:205` — `.register-role-options .register-role-button:active`
-   `app\styles\shared\register.css:221` — `.register-role-options .register-role-button > span`
-   `app\styles\shared\register.css:228` — `.register-role-options .register-role-button.register-option-card`
-   `app\styles\shared\register.css:234` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]`
-   `app\styles\shared\register.css:234` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]:hover`
-   `app\styles\shared\register.css:252` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]::before`
-   `app\styles\shared\register.css:252` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]:hover::before`
-   `app\styles\shared\register.css:258` — `.register-agree-card.register-checkbox-card`
-   `app\styles\shared\register.css:258` — `.register-guide-card.register-checkbox-card`
-   `app\styles\shared\register.css:265` — `html[data-contrast="hc"] .register-input .ui-glow-control`
-   `app\styles\shared\register.css:265` — `html[data-contrast="hc"] .register-input .ui-glow-control:is(:hover, :focus, :focus-visible, :active)`
-   `app\styles\shared\register.css:273` — `.register-checkbox-card .register-policy-link:hover`
-   `app\styles\shared\register.css:273` — `.register-checkbox-card .register-policy-link:focus-visible`
-   `app\styles\shared\register.css:281` — `.register-agree-card > span:last-child`
-   `app\styles\shared\register.css:281` — `.register-guide-card > span:last-child`
-   `app\styles\shared\register.css:290` — `section[lang="ru"] .register-checkbox-card`
-   `app\styles\shared\register.css:295` — `section[lang="ru"] .register-agree-card`
-   `app\styles\shared\register.css:300` — `section[lang="ru"] .register-guide-card`
-   `app\styles\shared\register.css:305` — `section[lang="ru"] .register-guide-card > span:last-child`
-   `app\styles\shared\register.css:309` — `section[lang="ru"] .register-agree-card > span:last-child`
-   `app\styles\shared\register.css:313` — `section[lang="ru"] .register-guide-card .register-policy-link`
-   `app\styles\shared\register.css:320` — `section[lang="en"] .register-checkbox-card`
-   `app\styles\shared\register.css:325` — `section[lang="et"] .register-checkbox-card`
-   `app\styles\shared\register.css:330` — `section[lang="en"] .register-guide-card`
-   `app\styles\shared\register.css:336` — `section[lang="ru"] .register-guide-card` _(@media (min-width: 769px))_
-   `app\styles\shared\register.css:341` — `section[lang="en"] .register-guide-card` _(@media (min-width: 769px))_
-   `app\styles\shared\register.css:346` — `section[lang="en"] .register-guide-card > span:last-child` _(@media (min-width: 769px))_
-   `app\styles\shared\register.css:352` — `.register-submit-wrap` _(@media (min-width: 769px))_
-   `app\styles\shared\ui-glow.css:5` — `.ui-glow-field`
-   `app\styles\shared\ui-glow.css:24` — `.ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:33` — `:root:not(.theme-light):not(.theme-mid) .ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:43` — `:root:not(.theme-light):not(.theme-mid) .ui-glow-field:not(:hover)`
-   `app\styles\shared\ui-glow.css:53` — `.ui-glow-field:focus-within:not(:hover) > .edgeLight`
-   `app\styles\shared\ui-glow.css:53` — `.ui-glow-field:focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:58` — `.ui-glow-control`
-   `app\styles\shared\ui-glow.css:98` — `.ui-glow-button-frame:focus-within:not(:hover) > .edgeLight`
-   `app\styles\shared\ui-glow.css:98` — `.ui-glow-button-frame:focus-within:not(:hover) > .ui-glow-button-soft-edge`
-   `app\styles\shared\ui-glow.css:98` — `.ui-glow-button-frame--disabled > .edgeLight`
-   `app\styles\shared\ui-glow.css:98` — `.ui-glow-button-frame--disabled > .ui-glow-button-soft-edge`
-   `app\styles\shared\ui-glow.css:140` — `:root.theme-light .ui-glow-button-frame > .edgeLight`
-   `app\styles\shared\ui-glow.css:140` — `:root.theme-mid .ui-glow-button-frame > .edgeLight`
-   `app\styles\shared\ui-glow.css:168` — `:root.theme-light .ui-glow-button-frame:hover:not(.ui-glow-button-frame--disabled) > .ui-glow-button-soft-edge`
-   `app\styles\shared\ui-glow.css:168` — `:root.theme-mid .ui-glow-button-frame:hover:not(.ui-glow-button-frame--disabled) > .ui-glow-button-soft-edge`
-   `app\styles\shared\ui-glow.css:176` — `html[data-contrast="hc"] .ui-glow-button-frame > .edgeLight`
-   `app\styles\shared\ui-glow.css:181` — `.ui-glow-option-card-frame`
-   `app\styles\shared\ui-glow.css:190` — `.ui-glow-option-card-frame:focus-within:not(:hover) > .edgeLight`
-   `app\styles\shared\ui-glow.css:190` — `.ui-glow-option-card-frame:focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:190` — `.ui-glow-option-card-frame:focus-within:not(:hover)::after`
-   `app\styles\shared\ui-glow.css:190` — `.ui-glow-option-card-frame--disabled > .edgeLight`
-   `app\styles\shared\ui-glow.css:190` — `.ui-glow-option-card-frame--disabled > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:190` — `.ui-glow-option-card-frame--disabled::after`
-   `app\styles\shared\ui-glow.css:199` — `:is(.workspace-feature-glow-card, .materials-glow-card, .invite-glow-panel):focus-within:not(:hover) > .edgeLight`
-   `app\styles\shared\ui-glow.css:199` — `:is(.workspace-feature-glow-card, .materials-glow-card, .invite-glow-panel):focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:199` — `:is(.workspace-feature-glow-card, .materials-glow-card, .invite-glow-panel):focus-within:not(:hover)::after`
-   `app\styles\shared\ui-glow.css:205` — `.workspace-feature-glow-card > .edgeLight`
-   `app\styles\shared\ui-glow.css:205` — `.workspace-feature-glow-card > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:205` — `.workspace-feature-glow-card::after`
-   `app\styles\shared\ui-glow.css:205` — `.materials-glow-card > .edgeLight`
-   `app\styles\shared\ui-glow.css:205` — `.materials-glow-card > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:205` — `.materials-glow-card::after`
-   `app\styles\shared\ui-glow.css:214` — `.materials-glow-card`
-   `app\styles\shared\ui-glow.css:214` — `.invite-glow-panel`
-   `app\styles\shared\ui-glow.css:214` — `.invite-glow-field`
-   `app\styles\shared\ui-glow.css:214` — `.materials-comment-glow-field`
-   `app\styles\shared\ui-glow.css:221` — `.invite-glow-field`
-   `app\styles\shared\ui-glow.css:239` — `.invite-glow-field:hover`
-   `app\styles\shared\ui-glow.css:239` — `.invite-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:250` — `:root.theme-light .invite-glow-field`
-   `app\styles\shared\ui-glow.css:250` — `:root.theme-mid .invite-glow-field`
-   `app\styles\shared\ui-glow.css:262` — `:root.theme-light .invite-glow-field:hover`
-   `app\styles\shared\ui-glow.css:262` — `:root.theme-light .invite-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:262` — `:root.theme-mid .invite-glow-field:hover`
-   `app\styles\shared\ui-glow.css:262` — `:root.theme-mid .invite-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:275` — `:root.theme-mid .invite-glow-field`
-   `app\styles\shared\ui-glow.css:279` — `:root.theme-mid .invite-glow-field:hover`
-   `app\styles\shared\ui-glow.css:279` — `:root.theme-mid .invite-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:286` — `.invite-glow-panel`
-   `app\styles\shared\ui-glow.css:296` — `:root:not(.theme-light):not(.theme-mid) .invite-glow-panel.invite-list-panel`
-   `app\styles\shared\ui-glow.css:306` — `.materials-comment-glow-field`
-   `app\styles\shared\ui-glow.css:316` — `:root:not(.theme-light):not(.theme-mid) .materials-comment-glow-field.ui-glow-field`
-   `app\styles\shared\ui-glow.css:325` — `:root:not(.theme-light):not(.theme-mid) .materials-comment-glow-field.ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:325` — `:root:not(.theme-light):not(.theme-mid) .materials-comment-glow-field.ui-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:332` — `:root:not(.theme-light):not(.theme-mid) .ui-glow-option-card-frame`
-   `app\styles\shared\ui-glow.css:342` — `:root:not(.theme-light):not(.theme-mid) .ui-glow-option-card-frame:hover:not(.ui-glow-option-card-frame--disabled)`
-   `app\styles\shared\ui-glow.css:353` — `:root:not(.theme-light):not(.theme-mid) .ui-glow-option-card-frame[data-focus-visible="true"]:not(:hover)`
-   `app\styles\shared\ui-glow.css:363` — `:root.theme-light .ui-glow-option-card-frame > .edgeLight`
-   `app\styles\shared\ui-glow.css:363` — `:root.theme-light .ui-glow-option-card-frame > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:363` — `:root.theme-mid .ui-glow-option-card-frame > .edgeLight`
-   `app\styles\shared\ui-glow.css:363` — `:root.theme-mid .ui-glow-option-card-frame > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:370` — `:root.theme-light .ui-glow-option-card-frame`
-   `app\styles\shared\ui-glow.css:370` — `:root.theme-mid .ui-glow-option-card-frame`
-   `app\styles\shared\ui-glow.css:381` — `:root.theme-light .ui-glow-option-card-frame:hover:not(.ui-glow-option-card-frame--disabled)`
-   `app\styles\shared\ui-glow.css:381` — `:root.theme-mid .ui-glow-option-card-frame:hover:not(.ui-glow-option-card-frame--disabled)`
-   `app\styles\shared\ui-glow.css:393` — `html[data-contrast="hc"] .ui-glow-option-card-frame > .edgeLight`
-   `app\styles\shared\ui-glow.css:393` — `html[data-contrast="hc"] .ui-glow-option-card-frame > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:398` — `:root.theme-light .ui-glow-field`
-   `app\styles\shared\ui-glow.css:409` — `:root.theme-mid .ui-glow-field`
-   `app\styles\shared\ui-glow.css:420` — `:root.theme-light .ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:430` — `:root.theme-mid .ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:442` — `:root.theme-light .ui-glow-field > .edgeLight`
-   `app\styles\shared\ui-glow.css:442` — `:root.theme-light .ui-glow-field > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:442` — `:root.theme-mid .ui-glow-field > .edgeLight`
-   `app\styles\shared\ui-glow.css:442` — `:root.theme-mid .ui-glow-field > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:449` — `:root.theme-light :is(.ui-glow-field, .invite-glow-field) > .edgeLight::before`
-   `app\styles\shared\ui-glow.css:449` — `:root.theme-light :is(.ui-glow-field, .invite-glow-field) > [class*="edgeLight"]::before`
-   `app\styles\shared\ui-glow.css:449` — `:root.theme-mid :is(.ui-glow-field, .invite-glow-field) > .edgeLight::before`
-   `app\styles\shared\ui-glow.css:449` — `:root.theme-mid :is(.ui-glow-field, .invite-glow-field) > [class*="edgeLight"]::before`
-   `app\styles\shared\ui-glow.css:460` — `html[data-contrast="hc"] .ui-glow-field`
-   `app\styles\shared\ui-glow.css:465` — `html[data-contrast="hc"] .ui-glow-field > .edgeLight`
-   `app\styles\shared\ui-glow.css:465` — `html[data-contrast="hc"] .ui-glow-field > [class*="edgeLight"]`
-   `app\styles\shared\ui-glow.css:483` — `html[data-contrast="hc"] .ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:492` — `.invite-glow-field.ui-glow-field`
-   `app\styles\shared\ui-glow.css:502` — `.invite-glow-field.ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:502` — `.invite-glow-field.ui-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:513` — `:root.theme-light .invite-glow-field.ui-glow-field`
-   `app\styles\shared\ui-glow.css:524` — `:root.theme-mid .invite-glow-field.ui-glow-field`
-   `app\styles\shared\ui-glow.css:535` — `:root.theme-light .invite-glow-field.ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:535` — `:root.theme-light .invite-glow-field.ui-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:546` — `:root.theme-mid .invite-glow-field.ui-glow-field:hover`
-   `app\styles\shared\ui-glow.css:546` — `:root.theme-mid .invite-glow-field.ui-glow-field:focus-within`
-   `app\styles\shared\ui-glow.css:568` — `html[data-contrast="hc"] .ui-glow-option-card-frame:hover:not(.ui-glow-option-card-frame--disabled)`
-   `app\styles\shared\ui-glow.css:577` — `html[data-contrast="hc"] .ui-glow-option-card-frame[data-checked="true"]`
-   `app\styles\shared\ui-glow.css:577` — `html[data-contrast="hc"] .ui-glow-option-card-frame[data-checked="true"]:hover`
-   `app\styles\shared\ui-glow.css:577` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]`
-   `app\styles\shared\ui-glow.css:577` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]:hover`
-   `app\styles\shared\ui-glow.css:597` — `html[data-contrast="hc"] .ui-glow-option-card-frame[data-checked="true"]::before`
-   `app\styles\shared\ui-glow.css:597` — `html[data-contrast="hc"] .ui-glow-option-card-frame[data-checked="true"]:hover::before`
-   `app\styles\shared\ui-glow.css:597` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]::before`
-   `app\styles\shared\ui-glow.css:597` — `html[data-contrast="hc"] .register-role-options .register-role-button.register-option-card[data-checked="true"]:hover::before`
-   `app\styles\shared\workspace-guide.css:31` — `:is(
      .invite-modal-content--workspace,
      .help-listings-modal-content--workspace
    ).workspace-guide-panel.glass-subpage-surface
    > .glass-subpage-header` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:39` — `.invite-modal-content--workspace.workspace-guide-panel.glass-subpage-surface` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:46` — `.invite-modal-content--workspace.workspace-guide-panel.glass-subpage-surface
    > .invite-modal-scroll.workspace-guide-panel-scroll` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:54` — `.invite-modal-content--workspace.workspace-guide-panel.glass-subpage-surface
    .invite-list-panel` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:62` — `.workspace-feature-embedded > :is(
      .help-listings-modal-content--embedded,
      .invite-modal-content--embedded
    ).workspace-guide-panel.glass-subpage-surface` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:91` — `.workspace-feature-embedded
    > .invite-modal-content--embedded.workspace-guide-panel.glass-subpage-surface
    .invite-list-panel` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:99` — `.workspace-dashboard-panel .workspace-feature-embedded > :is(
    .help-listings-modal-content--embedded,
    .invite-modal-content--embedded
  ).workspace-guide-panel.glass-subpage-surface::before` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:99` — `.workspace-dashboard-panel .workspace-feature-embedded > :is(
    .help-listings-modal-content--embedded,
    .invite-modal-content--embedded
  ).workspace-guide-panel.glass-subpage-surface::after` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:99` — `.workspace-dashboard-panel .workspace-feature-embedded > :is(
    .help-listings-modal-content--embedded,
    .invite-modal-content--embedded
  ).workspace-guide-panel.glass-subpage-surface > .glass-hole-mask-layer` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:116` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
    .help-listings-panel,
    .help-listings-item-card,
    .invite-glow-panel,
    .invite-list-panel,
    .invite-list-row
  )` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:135` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
    .help-listings-panel,
    .help-listings-item-card,
    .invite-glow-panel,
    .invite-list-panel,
    .invite-list-row
  )::before` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:135` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
    .help-listings-panel,
    .help-listings-item-card,
    .invite-glow-panel,
    .invite-list-panel,
    .invite-list-row
  )::after` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:135` — `.workspace-dashboard-panel .workspace-feature-embedded
    :is(.invite-glow-panel, .invite-list-panel)
    > [class*="edgeLight"]` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:157` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
    .help-listings-body,
    .help-listings-panel,
    .invite-modal-scroll,
    .invite-list-panel
  )` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:170` — `.workspace-dashboard-panel .workspace-feature-embedded .invite-list-panel` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:174` — `.workspace-dashboard-panel .workspace-feature-embedded :is(
    .help-listings-panel,
    .help-listings-empty,
    .help-listings-item-card,
    .invite-list-panel,
    .invite-list-row
  )` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:194` — `.help-listings-modal-content--workspace .help-listings-workspace-title-wrap` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:194` — `.invite-modal-content--workspace .invite-workspace-title-wrap` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:253` — `.materials-page-body.workspace-guide-panel-scroll` _(@media (min-width: 769px))_
-   `app\styles\shared\workspace-guide.css:258` — `:is(
      .workspace-feature-page-shell,
      .documents-workspace-page--documents,
      .documents-workspace-page--agent,
      .covision-page-shell,
      .invite-modal-content--workspace,
      .help-listings-modal-content--workspace
    )
    .workspace-guide-panel-scroll` _(@media (min-width: 769px))_
-   `app\styles\tailwind.css:10` — `.font-headline`
-   `app\styles\tailwind.css:14` — `.homeCursorScope`
-   `app\styles\tailwind.css:17` — `.homeCursorScope a`
-   `app\styles\tailwind.css:17` — `.homeCursorScope button`
-   `app\styles\tailwind.css:17` — `.homeCursorScope [role="button"]`
-   `app\styles\tailwind.css:17` — `.homeCursorScope label`
-   `app\styles\tailwind.css:17` — `.homeCursorScope summary`
-   `app\styles\tailwind.css:17` — `.homeCursorScope select`
-   `app\styles\tailwind.css:17` — `.homeCursorScope option`
-   `app\styles\tailwind.css:17` — `.homeCursorScope .cursor-pointer`
-   `app\styles\tailwind.css:17` — `.homeCursorScope .btn`
-   `app\styles\tailwind.css:17` — `.homeCursorScope .button`
-   `app\styles\tailwind.css:17` — `.homeCursorScope input[type="button"]`
-   `app\styles\tailwind.css:17` — `.homeCursorScope input[type="submit"]`
-   `app\styles\tailwind.css:17` — `.homeCursorScope input[type="reset"]`
-   `app\styles\tailwind.css:32` — `.homeCursorScope input`
-   `app\styles\tailwind.css:32` — `.homeCursorScope textarea`
-   `app\styles\tailwind.css:32` — `.homeCursorScope select`
-   `app\styles\tailwind.css:37` — `.invite-modal-overlay ~ .glass-box.chat-container`
-   `app\styles\theme\dark.css:181` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"])
  :is(
    .invite-list-panel,
    .invite-list-row,
    .materials-admin-panel,
    .materials-admin-row,
    .materials-comment-box
  )`
-   `app\styles\theme\dark.css:196` — `:root:not(.theme-light):not(.theme-mid):not(.theme-mono):not([data-contrast="hc"])
  .invite-glow-panel.invite-list-panel`
-   `app\styles\theme\dark.css:202` — `:root:not(.theme-light):not(.theme-mid):not(.theme-mono):not([data-contrast="hc"])
  .help-listings-modal-content
  .help-listings-panel`
-   `app\styles\theme\dark.css:216` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"])
  :is(.invite-refresh-btn, .materials-surface-button)`
-   `app\styles\theme\dark.css:243` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono) .materials-page-shell`
-   `app\styles\theme\dark.css:261` — `:root:not(.theme-light):not(.theme-mid) .framework-page-shell`
-   `app\styles\theme\dark.css:265` — `:root:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono)
  .materials-page-shell
  :is(.materials-upload-choose-button, .materials-upload-submit-button)`
-   `app\styles\theme\dark.css:322` — `:root:not(.theme-light)
  .profile-email-dock-wrapper:not(.profile-orbit-menu-wrapper)
  .dock-item`
-   `app\styles\theme\dark.css:322` — `:root:not(.theme-light)
  .profile-email-dock-wrapper:not(.profile-orbit-menu-wrapper)
  .dock-item:hover`
-   `app\styles\theme\dark.css:322` — `:root:not(.theme-light)
  .profile-email-dock-wrapper:not(.profile-orbit-menu-wrapper)
  .dock-item:focus-visible`
-   `app\styles\theme\dark.css:333` — `:root:not(.theme-light)
  .profile-email-dock-wrapper:not(.profile-orbit-menu-wrapper)
  .dock-item`
-   `app\styles\theme\dark.css:346` — `:root:not(.theme-light):not(.theme-mid)
  .login-modal-box.login-modal--otp
  .login-modal-shell`
-   `app\styles\theme\dark.css:355` — `:root:not(.theme-light):not(.theme-mid)
  .login-modal-box.login-modal--otp
  .fancy-checkbox--otp`
-   `app\styles\theme\dark.css:362` — `:root:not(.theme-light):not(.theme-mid)
  .login-modal-box.login-modal--otp
  .login-otp-remember.fancy-checkbox--otp
  .box`
-   `app\styles\theme\hc.css:39` — `body.homepage .home-card-a11y-button:focus-visible`
-   `app\styles\theme\hc.css:51` — `html[data-reduce-motion="1"] .glass-card.fade-in`
-   `app\styles\theme\hc.css:57` — `html[data-reduce-motion="1"] .circular-text-line`
-   `app\styles\theme\hc.css:60` — `html[data-reduce-motion="1"] .circular-text-svg .word1`
-   `app\styles\theme\hc.css:60` — `html[data-reduce-motion="1"] .circular-text-svg .word2`
-   `app\styles\theme\hc.css:60` — `html[data-reduce-motion="1"] .circular-text-svg .word3`
-   `app\styles\theme\hc.css:66` — `body[data-a11y-scroll-lock="1"] #main`
-   `app\styles\theme\hc.css:70` — `.three-d-card:has(.glass-card.fade-in)`
-   `app\styles\theme\hc.css:70` — `.three-d-card:has(.centered-back-left.fade-in)`
-   `app\styles\theme\hc.css:70` — `.three-d-card:has(.centered-back-right.fade-in)`
-   `app\styles\theme\hc.css:78` — `.three-d-card .card-face.back:focus`
-   `app\styles\theme\hc.css:315` — `html[data-contrast="hc"] .materials-page-shell`
-   `app\styles\theme\hc.css:337` — `html[data-ui-scale="mac"][data-contrast="hc"]`
-   `app\styles\theme\hc.css:337` — `html[data-ui-scale="lg"][data-contrast="hc"]`
-   `app\styles\theme\hc.css:357` — `html[data-contrast="hc"]:not(.theme-light) body.homepage`
-   `app\styles\theme\hc.css:357` — `html[data-contrast="hc"]:not(.theme-light) .homepage-root`
-   `app\styles\theme\hc.css:379` — `html[data-contrast="hc"] .homepage-root .home-about-panel`
-   `app\styles\theme\hc.css:383` — `html[data-contrast="hc"] :is(.register-success-shell, .error-page-shell)`
-   `app\styles\theme\hc.css:390` — `html[data-contrast="hc"] .register-success-shell .register-success-panel`
-   `app\styles\theme\hc.css:394` — `html[data-contrast="hc"] .register-success-shell .register-success-panel`
-   `app\styles\theme\hc.css:394` — `html[data-contrast="hc"] .register-success-shell .register-success-panel *`
-   `app\styles\theme\hc.css:399` — `html[data-contrast="hc"] .homepage-root :is(.home-about-scrollbox, .home-about-scrollbox *)`
-   `app\styles\theme\hc.css:403` — `html[data-contrast="hc"] .homepage-root .home-before-contact-copy`
-   `app\styles\theme\hc.css:403` — `html[data-contrast="hc"] .homepage-root .home-before-contact-copy *`
-   `app\styles\theme\hc.css:408` — `html[data-contrast="hc"] .homepage-root .home-before-contact-button`
-   `app\styles\theme\hc.css:408` — `html[data-contrast="hc"] .homepage-root .home-before-contact-button:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:415` — `html[data-contrast="hc"] .homepage-root .home-before-contact-button`
-   `app\styles\theme\hc.css:419` — `html[data-contrast="hc"] .homepage-root .home-before-contact-button:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:445` — `html[data-contrast="hc"] .back-icon-dot.back-icon-dot--outline`
-   `app\styles\theme\hc.css:450` — `html[data-contrast="hc"] button:is(:hover, :focus-visible) .back-icon-dot.back-icon-dot--outline`
-   `app\styles\theme\hc.css:454` — `html[data-contrast="hc"] .error-page-shell .error-page-description`
-   `app\styles\theme\hc.css:458` — `html[data-contrast="hc"] .profile-logout-icon path`
-   `app\styles\theme\hc.css:462` — `html[data-contrast="hc"] :is(
    .policy-section-body,
    .policy-page-scroll,
    .guide-policy-scroll,
    .policy-page-footer,
    .guide-rich-text,
    .guide-quickstart-rich-text
  )`
-   `app\styles\theme\hc.css:473` — `html[data-contrast="hc"]
  :is(.policy-section-body, .policy-page-scroll, .guide-policy-scroll)
  :is(p, li, ul, ol, div, span, strong, em, b, i, small)`
-   `app\styles\theme\hc.css:479` — `html[data-contrast="hc"] :is(.policy-page-scroll a, .guide-policy-scroll a)`
-   `app\styles\theme\hc.css:563` — `html[data-contrast="hc"] body .home-card-a11y-button`
-   `app\styles\theme\hc.css:563` — `html[data-contrast="hc"] body .home-card-a11y-button:is(:hover, :focus, :active)`
-   `app\styles\theme\hc.css:573` — `html[data-contrast="hc"] body .home-card-a11y-button:focus-visible`
-   `app\styles\theme\hc.css:599` — `html[data-contrast="hc"] .invite-modal-overlay.person-invite-modal-overlay`
-   `app\styles\theme\hc.css:604` — `html[data-contrast="hc"] body.invite-modal-open .chat-page-shell`
-   `app\styles\theme\hc.css:633` — `html[data-contrast="hc"] :is(
  .materials-upload-panel,
  .invite-list-panel,
  .materials-admin-panel,
  .materials-admin-row,
  .materials-comment-box
)`
-   `app\styles\theme\hc.css:642` — `html[data-contrast="hc"] .materials-page-shell :is(
  .materials-upload-panel,
  .materials-admin-panel
)`
-   `app\styles\theme\hc.css:649` — `html[data-contrast="hc"] :is(
  .invite-list-row,
  .help-listings-item-card
)`
-   `app\styles\theme\hc.css:655` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-overlay-card :is(.button, .btn)`
-   `app\styles\theme\hc.css:661` — `html[data-contrast="hc"] body .chat-analysis-overlay .documents-upload-choose-button`
-   `app\styles\theme\hc.css:670` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-overlay-card :is(.button, .btn):is(:hover, :focus-visible)`
-   `app\styles\theme\hc.css:675` — `html[data-contrast="hc"] body .chat-analysis-overlay .documents-upload-choose-button:is(:hover, :focus-visible)`
-   `app\styles\theme\hc.css:680` — `html[data-contrast="hc"] body .chat-analysis-overlay .chat-analysis-overlay-card :is(.button, .btn):active`
-   `app\styles\theme\hc.css:685` — `html[data-contrast="hc"] body .chat-analysis-overlay .documents-upload-choose-button:active`
-   `app\styles\theme\hc.css:690` — `html[data-contrast="hc"]
  body
  :is(.three-d-card, .glass-card, .card-face):focus-visible`
-   `app\styles\theme\hc.css:695` — `html[data-contrast="hc"] #nav-meist`
-   `app\styles\theme\hc.css:702` — `html[data-contrast="hc"] #nav-meist:hover`
-   `app\styles\theme\hc.css:702` — `html[data-contrast="hc"] #nav-meist:focus-visible`
-   `app\styles\theme\hc.css:707` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar :is(.button, .btn)`
-   `app\styles\theme\hc.css:713` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar :is(.button, .btn):is(:hover, :focus-visible)`
-   `app\styles\theme\hc.css:718` — `html[data-contrast="hc"] .drawer-panel--chat-glass .drawer-chat-sidebar :is(.button, .btn):active`
-   `app\styles\theme\hc.css:723` — `html[data-contrast="hc"] .homepage-root .home-about-title`
-   `app\styles\theme\hc.css:726` — `html[data-contrast="hc"] .subscription-content`
-   `app\styles\theme\hc.css:796` — `html[data-contrast="hc"] .subscription-content :is(
    h1,
    h2,
    h3,
    h4,
    p,
    span,
    label,
    legend,
    li,
    a,
    button,
    strong,
    em
  )`
-   `app\styles\theme\hc.css:813` — `html[data-contrast="hc"] .subscription-content :is(button, .button, .btn):not(.back-button):not(.chat-back-button):not(.profile-logout-button)`
-   `app\styles\theme\hc.css:818` — `html[data-contrast="hc"] .materials-page-content :is(button, .button, .btn)[data-variant="primary"]:not(.back-button):not(.chat-back-button):not(.profile-logout-button)`
-   `app\styles\theme\hc.css:824` — `html[data-contrast="hc"] .subscription-content :is(button, .button, .btn):not(.back-button):not(.chat-back-button):not(.glass-policy-back):not(.profile-logout-button):is(:hover, :focus-visible)`
-   `app\styles\theme\hc.css:828` — `html[data-contrast="hc"] .materials-page-content :is(button, .button, .btn)[data-variant="primary"]:not(.back-button):not(.chat-back-button):not(.glass-policy-back):not(.profile-logout-button):is(:hover, :focus-visible)`
-   `app\styles\theme\hc.css:833` — `html[data-contrast="hc"] .subscription-content :is(button, .button, .btn):not(.back-button):not(.chat-back-button):not(.glass-policy-back):not(.profile-logout-button):active`
-   `app\styles\theme\hc.css:837` — `html[data-contrast="hc"] .materials-page-content :is(button, .button, .btn)[data-variant="primary"]:not(.back-button):not(.chat-back-button):not(.glass-policy-back):not(.profile-logout-button):active`
-   `app\styles\theme\hc.css:842` — `html[data-contrast="hc"] :is(.subscription-modal-content, .invite-modal-content, .account-settings-modal-content) :is(.back-button, .account-settings-back-button, .chat-back-button, .glass-policy-back)`
-   `app\styles\theme\hc.css:842` — `html[data-contrast="hc"] :is(.subscription-modal-content, .invite-modal-content, .account-settings-modal-content) :is(.back-button, .account-settings-back-button, .chat-back-button, .glass-policy-back):is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:849` — `html[data-contrast="hc"] .subscription-content :is(.fancy-checkbox--otp .box, .fancy-checkbox--otp .tick)`
-   `app\styles\theme\hc.css:855` — `html[data-contrast="hc"] .subscription-content .fancy-checkbox--otp .text`
-   `app\styles\theme\hc.css:858` — `html[data-contrast="hc"] .subscription-content .subscription-active-panel`
-   `app\styles\theme\hc.css:863` — `html[data-contrast="hc"] .subscription-content :is(
    .subscription-copy-text,
    .subscription-info-text,
    .subscription-status-text,
    .subscription-active-summary,
    .subscription-active-note
  )`
-   `app\styles\theme\hc.css:872` — `html[data-contrast="hc"] .subscription-page-title`
-   `app\styles\theme\hc.css:875` — `html[data-contrast="hc"] .materials-page-shell :is(
    h1,
    h2,
    h3,
    h4,
    p,
    span,
    label,
    legend,
    li,
    a,
    button:not(.back-button),
    strong,
    em
  )`
-   `app\styles\theme\hc.css:892` — `html[data-contrast="hc"] .materials-page-shell .back-button`
-   `app\styles\theme\hc.css:892` — `html[data-contrast="hc"] .materials-page-shell .back-button:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:900` — `html[data-contrast="hc"] .materials-page-shell :is(textarea, input:not([type="hidden"]))`
-   `app\styles\theme\hc.css:905` — `html[data-contrast="hc"] .materials-page-shell :is(textarea, input:not([type="hidden"]))::placeholder`
-   `app\styles\theme\hc.css:908` — `html[data-contrast="hc"] .rooms-scroll :is(
    h1,
    h2,
    h3,
    h4,
    p,
    span,
    label,
    legend,
    li,
    a,
    button,
    strong,
    em
  )`
-   `app\styles\theme\hc.css:925` — `html[data-contrast="hc"] .rooms-delete-btn`
-   `app\styles\theme\hc.css:931` — `html[data-contrast="hc"] .rooms-delete-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:936` — `html[data-contrast="hc"] .rooms-delete-btn svg :is(path, polyline, line)`
-   `app\styles\theme\hc.css:939` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content
  )`
-   `app\styles\theme\hc.css:1044` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content
  )
  :is(h1, h2, h3, h4, p, span, label, legend, li, a, button, strong, em)`
-   `app\styles\theme\hc.css:1055` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content
  )
  :is(input, textarea, select, .register-input)`
-   `app\styles\theme\hc.css:1068` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content
  )
  :is(input, textarea, select, .register-input)::placeholder`
-   `app\styles\theme\hc.css:1079` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content,
    .chat-analysis-overlay .chat-analysis-overlay-card
  )
  :is(button, .button, .btn, .invite-primary-btn, .invite-refresh-btn):not(.back-button):not(.chat-back-button):not(.glass-policy-back):not(.profile-logout-button):not(.chat-rail-icon-btn):not(.chat-send-btn):not(.chat-listen-btn):not(.chat-assistant-action-btn):not(.chat-dictate-btn):not(.chat-side-control-btn):not(.chat-tools-btn):not(.chat-document-attach-btn)`
-   `app\styles\theme\hc.css:1093` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content,
    .chat-analysis-overlay .chat-analysis-overlay-card
  )
  :is(button, .button, .btn, .invite-primary-btn, .invite-refresh-btn):not(.back-button):not(.chat-back-button):not(.glass-policy-back):not(.profile-logout-button):not(.chat-rail-icon-btn):not(.chat-send-btn):not(.chat-listen-btn):not(.chat-assistant-action-btn):not(.chat-dictate-btn):not(.chat-side-control-btn):not(.chat-tools-btn):not(.chat-document-attach-btn):is(:hover, :focus-visible)`
-   `app\styles\theme\hc.css:1106` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content,
    .chat-analysis-overlay .chat-analysis-overlay-card
  )
  :is(button, .button, .btn, .invite-primary-btn, .invite-refresh-btn):not(.back-button):not(.chat-back-button):not(.glass-policy-back):not(.profile-logout-button):not(.chat-rail-icon-btn):not(.chat-send-btn):not(.chat-listen-btn):not(.chat-assistant-action-btn):not(.chat-dictate-btn):not(.chat-side-control-btn):not(.chat-tools-btn):not(.chat-document-attach-btn):active`
-   `app\styles\theme\hc.css:1119` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content,
    .chat-analysis-overlay .chat-analysis-overlay-card
  )
  [data-control-type]`
-   `app\styles\theme\hc.css:1131` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content,
    .chat-analysis-overlay .chat-analysis-overlay-card
  )
  [data-control-type][data-checked="true"]`
-   `app\styles\theme\hc.css:1146` — `html[data-contrast="hc"] :is(
    .register-content,
    .invite-modal-content,
    .person-invite-modal-content,
    .update-pin-content,
    .update-email-content,
    .reset-password-content,
    .chat-analysis-overlay .chat-analysis-overlay-card
  )
  [data-control-type][data-checked="false"]`
-   `app\styles\theme\hc.css:1159` — `html[data-contrast="hc"] .invite-modal-content [data-control-type][data-checked="true"]`
-   `app\styles\theme\hc.css:1159` — `html[data-contrast="hc"] .person-invite-modal-content [data-control-type][data-checked="true"]`
-   `app\styles\theme\hc.css:1173` — `html[data-contrast="hc"] .invite-modal-content [data-control-type][data-checked="true"]::before`
-   `app\styles\theme\hc.css:1173` — `html[data-contrast="hc"] .person-invite-modal-content [data-control-type][data-checked="true"]::before`
-   `app\styles\theme\hc.css:1178` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn.button[data-variant="primary"]`
-   `app\styles\theme\hc.css:1186` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn.button[data-variant="primary"]::before`
-   `app\styles\theme\hc.css:1189` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn.button[data-variant="primary"]:is(:hover, :focus-visible)`
-   `app\styles\theme\hc.css:1195` — `html[data-contrast="hc"] body .chat-analysis-panel-card .chat-analysis-action-btn.button[data-variant="primary"]:active`
-   `app\styles\theme\hc.css:1201` — `html[data-contrast="hc"] .invite-modal-content .invite-list-panel`
-   `app\styles\theme\hc.css:1205` — `html[data-contrast="hc"] .invite-modal-content .invite-list-row`
-   `app\styles\theme\hc.css:1209` — `html[data-contrast="hc"] .help-listings-modal-content .help-listings-panel`
-   `app\styles\theme\hc.css:1217` — `html[data-contrast="hc"] .help-listings-modal-content .help-listings-item-card`
-   `app\styles\theme\hc.css:1223` — `html[data-contrast="hc"] .help-listings-modal-content .help-listings-item-card:is(:hover, :focus-visible, :focus-within)`
-   `app\styles\theme\hc.css:1228` — `html[data-contrast="hc"] #login-modal`
-   `app\styles\theme\hc.css:1259` — `html[data-contrast="hc"] #login-modal.login-modal--otp`
-   `app\styles\theme\hc.css:1267` — `html[data-contrast="hc"] #login-modal`
-   `app\styles\theme\hc.css:1287` — `html[data-contrast="hc"] #login-modal .login-modal-shell`
-   `app\styles\theme\hc.css:1291` — `html[data-contrast="hc"] #login-modal.login-modal--otp .login-modal-shell`
-   `app\styles\theme\hc.css:1295` — `html[data-contrast="hc"] #login-modal .login-modal-title`
-   `app\styles\theme\hc.css:1298` — `html[data-contrast="hc"] #login-modal :is(h1, h2, h3, h4, p, span, label, legend, li, a, button, strong, em)`
-   `app\styles\theme\hc.css:1301` — `html[data-contrast="hc"] #login-modal :is(input:not([type="hidden"]):not([aria-hidden="true"]), textarea, select)`
-   `app\styles\theme\hc.css:1308` — `html[data-contrast="hc"] #login-modal :is(input:not([type="hidden"]):not([aria-hidden="true"]), textarea, select)::placeholder`
-   `app\styles\theme\hc.css:1311` — `html[data-contrast="hc"] #login-modal.login-modal--otp .login-otp-content :is(p, span, label, strong, em, a, button)`
-   `app\styles\theme\hc.css:1314` — `html[data-contrast="hc"] #login-modal.login-modal--otp .login-otp-remember`
-   `app\styles\theme\hc.css:1319` — `html[data-contrast="hc"] #login-modal :is(.button, .btn, button[type="submit"], .no-click-pulse)`
-   `app\styles\theme\hc.css:1329` — `html[data-contrast="hc"] #login-modal :is(.button, .btn, button[type="submit"], .no-click-pulse):hover` _(@media (hover: hover))_
-   `app\styles\theme\hc.css:1335` — `html[data-contrast="hc"] #login-modal :is(.button, .btn, button[type="submit"], .no-click-pulse):focus-visible`
-   `app\styles\theme\hc.css:1342` — `html[data-contrast="hc"] #login-modal :is(.button, .btn, button[type="submit"], .no-click-pulse):active`
-   `app\styles\theme\hc.css:1347` — `html[data-contrast="hc"] #login-modal .no-click-pulse`
-   `app\styles\theme\hc.css:1350` — `html[data-contrast="hc"] #login-modal .login-keypad-btn`
-   `app\styles\theme\hc.css:1353` — `html[data-contrast="hc"] #login-modal .login-keypad-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1356` — `html[data-contrast="hc"] #login-modal :is(a, .home-link, .pin-layout-toggle)`
-   `app\styles\theme\hc.css:1356` — `html[data-contrast="hc"] #login-modal :is(a, .home-link, .pin-layout-toggle):is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1364` — `html[data-contrast="hc"] #login-modal .pin-layout-toggle`
-   `app\styles\theme\hc.css:1364` — `html[data-contrast="hc"] #login-modal .pin-layout-toggle:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1373` — `html[data-contrast="hc"] #login-modal :is(.button, .btn, button[type="submit"], .no-click-pulse):hover` _(@media (hover: none))_
-   `app\styles\theme\hc.css:1378` — `html[data-contrast="hc"] #login-modal .no-click-pulse:hover` _(@media (hover: none))_
-   `app\styles\theme\hc.css:1384` — `html[data-contrast="hc"] #login-modal :is(.login-modal-close.modal-close-btn, .login-help-close-btn, .login-email-icon-btn)`
-   `app\styles\theme\hc.css:1390` — `html[data-contrast="hc"] #login-modal :is(.login-modal-close.modal-close-btn, .login-help-close-btn, .login-email-icon-btn):is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1396` — `html[data-contrast="hc"] #login-modal .login-modal-close.modal-close-btn::before`
-   `app\styles\theme\hc.css:1399` — `html[data-contrast="hc"] #login-modal .login-email-icon :is(path, circle, line, rect, ellipse, polyline, polygon)`
-   `app\styles\theme\hc.css:1402` — `html[data-contrast="hc"] #login-modal .login-email-icon [fill]:not([fill="none"])`
-   `app\styles\theme\hc.css:1402` — `html[data-contrast="hc"] #login-modal .login-submit-icon [fill]:not([fill="none"])`
-   `app\styles\theme\hc.css:1406` — `html[data-contrast="hc"] #login-modal .login-submit-icon :is(path, circle, line, rect, ellipse, polyline, polygon)`
-   `app\styles\theme\hc.css:1409` — `html[data-contrast="hc"] #login-modal .login-submit-dots > span`
-   `app\styles\theme\hc.css:1413` — `html[data-contrast="hc"] #login-modal .login-help-popover`
-   `app\styles\theme\hc.css:1418` — `html[data-contrast="hc"] #login-modal :is(.fancy-checkbox--otp .box, .fancy-checkbox--otp .tick)`
-   `app\styles\theme\hc.css:1423` — `html[data-contrast="hc"] #login-modal :is(.fancy-checkbox--otp .text, #otp-deadline)`
-   `app\styles\theme\hc.css:1426` — `html[data-contrast="hc"] .a11y-modal-shell`
-   `app\styles\theme\hc.css:1429` — `html[data-contrast="hc"] .a11y-modal-shell .csp-chevron-icon`
-   `app\styles\theme\hc.css:1432` — `html[data-contrast="hc"] .register-mobile-ring .csp-chevron-icon`
-   `app\styles\theme\hc.css:1435` — `html[data-contrast="hc"] .a11y-modal-shell .a11y-csp-scroll`
-   `app\styles\theme\hc.css:1517` — `html[data-contrast="hc"] .a11y-modal-shell :is(.a11y-csp-scroll, .csp-overlayTitle)
  :is(h1, h2, h3, h4, p, span, label, legend, li, a, button, strong, em)`
-   `app\styles\theme\hc.css:1521` — `html[data-contrast="hc"] .a11y-modal-shell .a11y-csp-scroll :is(.button, .btn, button[type="submit"], input[type="submit"])`
-   `app\styles\theme\hc.css:1528` — `html[data-contrast="hc"] .a11y-modal-shell .a11y-csp-scroll :is(.button, .btn, button[type="submit"], input[type="submit"]):hover`
-   `app\styles\theme\hc.css:1532` — `html[data-contrast="hc"] .a11y-modal-shell .a11y-csp-scroll :is(.button, .btn, button[type="submit"], input[type="submit"]):focus-visible`
-   `app\styles\theme\hc.css:1536` — `html[data-contrast="hc"] .a11y-modal-shell .a11y-csp-scroll [data-control-type][data-checked="true"]`
-   `app\styles\theme\hc.css:1546` — `html[data-contrast="hc"] .a11y-modal-shell .a11y-csp-scroll [data-control-type][data-checked="false"]`
-   `app\styles\theme\hc.css:1549` — `html[data-contrast="hc"]
  body
  .profile-container.glass-ring`
-   `app\styles\theme\hc.css:1554` — `html[data-contrast="hc"]
  body
  .profile-role-row`
-   `app\styles\theme\hc.css:1560` — `html[data-contrast="hc"]
  body
  .profile-orbit-mobile-panel
  .profile-orbit-mobile-action.dock-item`
-   `app\styles\theme\hc.css:1560` — `html[data-contrast="hc"]
  body
  .profile-orbit-mobile-panel
  .profile-orbit-mobile-action.dock-item:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1560` — `html[data-contrast="hc"]
  body
  .profile-orbit-mobile-panel
  .profile-orbit-mobile-row.is-active
  .profile-orbit-mobile-action.dock-item`
-   `app\styles\theme\hc.css:1560` — `html[data-contrast="hc"]
  body
  .profile-orbit-mobile-panel
  .profile-orbit-mobile-action.dock-item[data-orbit-mobile-active="true"]`
-   `app\styles\theme\hc.css:1585` — `html[data-contrast="hc"] .desc-ring-left .circular-text-line`
-   `app\styles\theme\hc.css:1593` — `html[data-contrast="hc"] .desc-ring-right .circular-text-line`
-   `app\styles\theme\hc.css:1601` — `html[data-contrast="hc"] .centered-back-right h2`
-   `app\styles\theme\hc.css:1604` — `html[data-contrast="hc"] .centered-back-left h2`
-   `app\styles\theme\hc.css:1604` — `html[data-contrast="hc"] .centered-back-left h2 span`
-   `app\styles\theme\hc.css:1608` — `html[data-contrast="hc"] .desc-ring-left`
-   `app\styles\theme\hc.css:1608` — `html[data-contrast="hc"] .desc-ring-right`
-   `app\styles\theme\hc.css:1608` — `html[data-contrast="hc"] .desc-ring-left *`
-   `app\styles\theme\hc.css:1608` — `html[data-contrast="hc"] .desc-ring-right *`
-   `app\styles\theme\hc.css:1708` — `html[data-contrast="hc"] :is(
  .ui-glow-field,
  .materials-comment-glow-field,
  .service-map-toolbar__glow-field,
  .service-map-toolbar__type-card,
  .pre-inquiry-recipient-type-card,
  .invite-glow-field,
  .service-profile-glow-field,
  .workspace-feature-panel .workspace-feature-field,
  .documents-workspace :is(.documents-field, .documents-dropdown-trigger, .documents-form-input, .documents-agent-textarea)
)`
-   `app\styles\theme\hc.css:1726` — `html[data-contrast="hc"] :is(
  .ui-glow-field,
  .materials-comment-glow-field,
  .service-map-toolbar__glow-field,
  .service-map-toolbar__type-card,
  .pre-inquiry-recipient-type-card,
  .invite-glow-field,
  .service-profile-glow-field,
  .workspace-feature-panel .workspace-feature-field,
  .documents-workspace :is(.documents-field, .documents-dropdown-trigger, .documents-form-input, .documents-agent-textarea)
):is(:hover, :focus, :focus-within, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1743` — `html[data-contrast="hc"] :is(
  .ui-glow-field,
  .materials-comment-glow-field,
  .service-map-toolbar__glow-field,
  .invite-glow-field,
  .service-profile-glow-field,
  .workspace-feature-panel .workspace-feature-field,
  .documents-workspace :is(.documents-field, .documents-dropdown-trigger, .documents-form-input, .documents-agent-textarea)
) > :is(.edgeLight, [class*="edgeLight"])`
-   `app\styles\theme\hc.css:1758` — `html[data-contrast="hc"] :is(
  .ui-glow-field,
  .materials-comment-glow-field,
  .service-map-toolbar__glow-field,
  .service-map-toolbar__type-card,
  .pre-inquiry-recipient-type-card,
  .invite-glow-field,
  .service-profile-glow-field,
  .workspace-feature-panel .workspace-feature-field,
  .documents-workspace :is(.documents-field, .documents-dropdown-trigger, .documents-form-input, .documents-agent-textarea)
)::placeholder`
-   `app\styles\theme\hc.css:1773` — `html[data-contrast="hc"] .service-map-workspace .service-map-toolbar__input::placeholder`
-   `app\styles\theme\hc.css:1773` — `html[data-contrast="hc"] .service-map-page-panel .service-map-toolbar__input::placeholder`
-   `app\styles\theme\hc.css:1779` — `html[data-contrast="hc"] :is(
  .workspace-feature-card,
  .workspace-feature-chip,
  .workspace-feature-admin-role,
  .workspace-feature-toggle-row,
  .workspace-feature-list-card,
  .workspace-feature-badge,
  .documents-workspace-card,
  .documents-panel,
  .documents-subpanel,
  .documents-card,
  .documents-notice,
  .documents-empty-state,
  .invite-list-panel,
  .materials-upload-panel,
  .materials-admin-panel,
  .materials-admin-row,
  .help-listings-panel,
  .selected-listing-panel--inline
)`
-   `app\styles\theme\hc.css:1805` — `html[data-contrast="hc"] :is(
  .workspace-role-cycle-button,
  .documents-admin-role-menu .workspace-role-cycle-button
)`
-   `app\styles\theme\hc.css:1828` — `html[data-contrast="hc"] body .chat-inputbar`
-   `app\styles\theme\hc.css:1828` — `html[data-contrast="hc"] .documents-workspace .documents-agent-composer-slot .chat-inputbar`
-   `app\styles\theme\hc.css:1835` — `html[data-contrast="hc"] .chat-composer-glow-shell`
-   `app\styles\theme\hc.css:1835` — `html[data-contrast="hc"] .documents-agent-glow-composer`
-   `app\styles\theme\hc.css:1835` — `html[data-contrast="hc"] .documents-agent-glow-window`
-   `app\styles\theme\hc.css:1847` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn.invite-primary-btn`
-   `app\styles\theme\hc.css:1861` — `html[data-contrast="hc"] body .chat-inputbar .chat-send-btn.invite-primary-btn:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1888` — `html[data-contrast="hc"] .framework-page-shell .ui-glow-button-frame`
-   `app\styles\theme\hc.css:1888` — `html[data-contrast="hc"] .framework-page-shell .ui-glow-button-frame:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1899` — `html[data-contrast="hc"] .framework-page-shell .ui-glow-button-frame:is(:hover, :focus-visible, :active)`
-   `app\styles\theme\hc.css:1904` — `html[data-contrast="hc"] body :is(
  .ui-glow-field,
  .materials-comment-glow-field,
  .service-map-toolbar__glow-field,
  .service-map-toolbar__type-card,
  .invite-glow-field,
  .service-profile-glow-field,
  .workspace-feature-panel .workspace-feature-field,
  .documents-workspace :is(.documents-field, .documents-dropdown-trigger, .documents-form-input, .documents-agent-textarea)
):is([class*="BorderGlow-module"], [class*="ui-glow"])`
-   `app\styles\theme\hc.css:1937` — `html[data-contrast="hc"] body :is(
  .register-content,
  .invite-modal-content,
  .person-invite-modal-content,
  .a11y-modal-shell
) [data-control-type][data-checked="true"]`
-   `app\styles\theme\hc.css:1955` — `html[data-contrast="hc"] body :is(
  .register-content,
  .invite-modal-content,
  .person-invite-modal-content,
  .a11y-modal-shell
) [data-control-type][data-checked="true"]::before`
-   `app\styles\theme\hc.css:1965` — `html[data-contrast="hc"] body :is(button, [role="button"], label).ui-glow-option-card-frame[data-checked="true"]:not(.profile-orbit-menu__item):not(.profile-orbit-menu__center):not(.profile-orbit-mobile-action):not(.profile-orbit-stack-bubble):not(.chat-rail-icon-btn):not(.chat-send-btn):not(.chat-listen-btn):not(.chat-assistant-action-btn):not(.chat-dictate-btn):not(.chat-side-control-btn):not(.chat-tools-btn):not(.chat-document-attach-btn)`
-   `app\styles\theme\hc.css:1965` — `html[data-contrast="hc"] body :is(button, [role="button"], label).register-option-card[data-checked="true"]:not(.profile-orbit-menu__item):not(.profile-orbit-menu__center):not(.profile-orbit-mobile-action):not(.profile-orbit-stack-bubble):not(.chat-rail-icon-btn):not(.chat-send-btn):not(.chat-listen-btn):not(.chat-assistant-action-btn):not(.chat-dictate-btn):not(.chat-side-control-btn):not(.chat-tools-btn):not(.chat-document-attach-btn)`
-   `app\styles\theme\hc.css:1995` — `html[data-contrast="hc"] body .invite-list-panel`
-   `app\styles\theme\hc.css:2002` — `html[data-contrast="hc"] body .invite-list-panel:is(:hover, :focus-within, :focus-visible, :active)`
-   `app\styles\theme\hc.css:2008` — `html[data-contrast="hc"] body .invite-list-panel::before`
-   `app\styles\theme\hc.css:2008` — `html[data-contrast="hc"] body .invite-list-panel::after`
-   `app\styles\theme\hc.css:2008` — `html[data-contrast="hc"] body .invite-list-panel > :is(.edgeLight, [class*="edgeLight"])`
-   `app\styles\theme\hc.css:2017` — `html[data-contrast="hc"] body :is(
  .invite-modal-content,
  .person-invite-modal-content
) .invite-list-panel.invite-glow-panel`
-   `app\styles\theme\hc.css:2027` — `html[data-contrast="hc"] body :is(
  .invite-modal-content,
  .person-invite-modal-content
) .invite-list-panel.invite-glow-panel:is(:hover, :focus-within)`
-   `app\styles\theme\light.css:257` — `:root.theme-light:not(.theme-mid) .space-backdrop[data-mode="light"]`
-   `app\styles\theme\light.css:262` — `:root.theme-light:not(.theme-mid) .space-backdrop[data-mode="light"]::after`
-   `app\styles\theme\light.css:266` — `:root.theme-light:not(.theme-mid) .homepage-root .right-card-primary .desc-ring-right .circular-text-line`
-   `app\styles\theme\light.css:266` — `:root.theme-light:not(.theme-mid) .homepage-root .centered-back-right h2`
-   `app\styles\theme\light.css:271` — `:root.theme-light:not(.theme-mid) .homepage-root .centered-back-right h2`
-   `app\styles\theme\light.css:275` — `:root.theme-light .glass-box`
-   `app\styles\theme\light.css:283` — `:root.theme-light:not(.theme-mid)
    .profile-container.glass-ring
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-menu__center.dock-item` _(@media (min-width: 48.001em))_
-   `app\styles\theme\light.css:294` — `:root.theme-light:not(.theme-mid)
    .profile-container.glass-ring
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-menu__center.dock-item:is(:hover, :focus-visible, :active)` _(@media (min-width: 48.001em))_
-   `app\styles\theme\light.css:307` — `:root.theme-light:not(.theme-mid) .login-modal-box.login-modal--otp .login-modal-shell`
-   `app\styles\theme\light.css:315` — `:root.theme-light:not(.theme-mid)
  .login-modal-box.login-modal--otp
  .login-modal-shell
  p`
-   `app\styles\theme\light.css:321` — `:root.theme-light .drawer-panel .drawer-pill-btn.button[data-variant="primary"]`
-   `app\styles\theme\light.css:328` — `:root.theme-light
  .drawer-panel
  .drawer-pill-btn.button[data-variant="primary"]::before`
-   `app\styles\theme\light.css:334` — `html[data-ui-scale="mac"].theme-light`
-   `app\styles\theme\light.css:334` — `html[data-ui-scale="lg"].theme-light`
-   `app\styles\theme\light.css:351` — `:root.theme-light:not(.theme-mid)
  .materials-page-shell
  :is(.materials-upload-choose-button, .materials-upload-submit-button)`
-   `app\styles\theme\mid.css:248` — `:root.theme-mid .space-backdrop[data-mode="light"]`
-   `app\styles\theme\mid.css:274` — `:root.theme-mid .login-modal-box`
-   `app\styles\theme\mid.css:280` — `:root.theme-mid .login-modal-box.login-modal--otp .login-modal-shell`
-   `app\styles\theme\mid.css:291` — `:root.theme-mid .login-modal-box.login-modal--otp .login-modal-shell p`
-   `app\styles\theme\mid.css:295` — `:root.theme-mid .login-modal-box.login-modal--otp .fancy-checkbox--otp`
-   `app\styles\theme\mid.css:300` — `:root.theme-mid
  .login-modal-box.login-modal--otp
  .login-otp-remember.fancy-checkbox--otp
  .box`
-   `app\styles\theme\mid.css:307` — `:root.theme-mid .login-modal-box.login-modal--otp .home-link`
-   `app\styles\theme\mid.css:357` — `:root.theme-mid [data-control-type]:active::before`
-   `app\styles\theme\mid.css:375` — `:root.theme-mid body .ui-glow-field:hover`
-   `app\styles\theme\mid.css:375` — `:root.theme-mid body .ui-glow-field:focus-within`
-   `app\styles\theme\mid.css:375` — `:root.theme-mid body .invite-glow-field:hover`
-   `app\styles\theme\mid.css:375` — `:root.theme-mid body .invite-glow-field:focus-within`
-   `app\styles\theme\mid.css:382` — `:root.theme-mid .invite-sponsor-toggle-card`
-   `app\styles\theme\mid.css:400` — `:root.theme-mid .profile-email-dock-wrapper.profile-orbit-menu-wrapper`
-   `app\styles\theme\mid.css:405` — `:root.theme-mid :is(
  .glass-ring.glass-ring--desktop-stable,
  .policy-mobile-lower.glass-ring.glass-ring--desktop-stable,
  .guide-policy-ring.glass-ring.glass-ring--desktop-stable
)`
-   `app\styles\theme\mid.css:413` — `:root.theme-mid :is(
  .help-listings-modal-content,
  .invite-modal-content,
  .person-invite-modal-content,
  .materials-page-content,
  .chat-analysis-overlay .chat-analysis-overlay-card,
  .account-settings-modal-content,
  .subscription-modal-content
)`
-   `app\styles\theme\mid.css:426` — `:root.theme-mid
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  :is(
    .profile-orbit-menu__item,
    .profile-orbit-menu__center,
    .profile-orbit-stack-bubble,
    .profile-orbit-mobile-action
  ).dock-item`
-   `app\styles\theme\mid.css:475` — `:root.theme-mid
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  .profile-orbit-menu__center.dock-item`
-   `app\styles\theme\mid.css:481` — `:root.theme-mid
  .profile-email-dock-wrapper.profile-orbit-menu-wrapper
  :is(
    .profile-orbit-menu__item,
    .profile-orbit-menu__center,
    .profile-orbit-stack-bubble,
    .profile-orbit-mobile-action
  ).dock-item::before`
-   `app\styles\theme\mid.css:493` — `:root.theme-mid
    .profile-email-dock-wrapper.profile-orbit-menu-wrapper
    .profile-orbit-mobile-action.dock-item::after` _(@media (max-width: 768px))_
-   `app\styles\theme\mid.css:505` — `:root.theme-light.theme-mid .rooms-card`
-   `app\styles\theme\mid.css:512` — `:root.theme-light.theme-mid .rooms-action-btn`
-   `app\styles\theme\mid.css:518` — `:root.theme-light.theme-mid .rooms-action-btn:hover`
-   `app\styles\theme\mid.css:518` — `:root.theme-light.theme-mid .rooms-action-btn:focus-visible`
-   `app\styles\theme\mid.css:525` — `:root.theme-light.theme-mid .rooms-delete-btn`
-   `app\styles\theme\mid.css:531` — `:root.theme-light.theme-mid .rooms-unread-badge`
-   `app\styles\theme\mid.css:538` — `:root.theme-mid .modal-confirm-overlay`
-   `app\styles\theme\mid.css:544` — `:root.theme-mid .modal-confirm-content`
-   `app\styles\theme\mid.css:553` — `:root.theme-mid .modal-confirm-content p`
-   `app\styles\theme\mid.css:557` — `:root.theme-mid .modal-confirm-content .button[data-variant="danger"]`
-   `app\styles\theme\mid.css:561` — `:root.theme-mid .modal-confirm-content .button[data-variant="danger"]:hover`
-   `app\styles\theme\mid.css:561` — `:root.theme-mid .modal-confirm-content .button[data-variant="danger"]:focus-visible`
-   `app\styles\theme\mid.css:561` — `:root.theme-mid .modal-confirm-content .button[data-variant="danger"]:active`
-   `app\styles\theme\mid.css:567` — `:root.theme-mid .modal-confirm-content .button:not([data-variant="danger"])`
-   `app\styles\theme\mid.css:580` — `:root.theme-mid .modal-confirm-content .button:not([data-variant="danger"]):hover`
-   `app\styles\theme\mid.css:580` — `:root.theme-mid .modal-confirm-content .button:not([data-variant="danger"]):focus-visible`
-   `app\styles\theme\mid.css:593` — `:root.theme-mid
  .materials-page-shell
  :is(.materials-upload-choose-button, .materials-upload-submit-button)`
-   `app\styles\theme\mid.css:593` — `:root.theme-light.theme-mid
  .materials-page-shell
  :is(.materials-upload-choose-button, .materials-upload-submit-button)`
-   `app\styles\theme\mid.css:611` — `:root.theme-mid .materials-comment-box`
-   `app\styles\theme\mid.css:611` — `:root.theme-light.theme-mid .materials-comment-box`
-   `app\styles\theme\mono.css:268` — `:root.theme-mono:not([data-contrast="hc"]) :is(
  .guide-policy-scroll a,
  .guide-rich-link,
  .guide-rich-link:is(:hover, :focus-visible, :active)
)`
-   `app\styles\theme\mono.css:279` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root :is(.centered-back-left, .centered-back-right) .home-card-face-content::before`
-   `app\styles\theme\mono.css:283` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .left-card-primary .desc-ring-left .circular-text-line`
-   `app\styles\theme\mono.css:287` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .right-card-primary .desc-ring-right .circular-text-line`
-   `app\styles\theme\mono.css:291` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .centered-back-left h2`
-   `app\styles\theme\mono.css:295` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .centered-back-right h2`
-   `app\styles\theme\mono.css:326` — `:root.theme-mono:not([data-contrast="hc"]) .back-icon-dot.back-icon-dot--outline`
-   `app\styles\theme\mono.css:330` — `:root.theme-mono:not([data-contrast="hc"]) button:is(:hover, :focus-visible) .back-icon-dot.back-icon-dot--outline`
-   `app\styles\theme\mono.css:334` — `:root.theme-mono:not([data-contrast="hc"]) .modal-close-btn`
-   `app\styles\theme\mono.css:338` — `:root.theme-mono:not([data-contrast="hc"]) .chat-tools-surface-popover`
-   `app\styles\theme\mono.css:347` — `:root.theme-mono:not([data-contrast="hc"]) #login-modal .login-help-popover`
-   `app\styles\theme\mono.css:356` — `:root.theme-mono:not([data-contrast="hc"]) #login-modal .login-help-popover .login-help-close-btn`
-   `app\styles\theme\mono.css:376` — `:root.theme-mono:not([data-contrast="hc"]) .invite-refresh-btn`
-   `app\styles\theme\mono.css:400` — `:root.theme-mono:not([data-contrast="hc"]) .materials-page-shell`
-   `app\styles\theme\mono.css:419` — `:root.theme-mono:not([data-contrast="hc"]) .materials-page-shell :is(.materials-comment-box, .materials-comment-glow-field .ui-glow-control)`
-   `app\styles\theme\mono.css:426` — `:root.theme-mono:not([data-contrast="hc"]) .workspace-dashboard-panel .materials-page-body`
-   `app\styles\theme\mono.css:440` — `:root.theme-mono:not([data-contrast="hc"]) .workspace-dashboard-panel .materials-page-body :is(
  .materials-comment-glow-field.ui-glow-field,
  .materials-comment-box,
  .materials-comment-glow-field .ui-glow-control
)`
-   `app\styles\theme\mono.css:453` — `:root.theme-mono:not([data-contrast="hc"]) .workspace-dashboard-panel .materials-page-body :is(
  .materials-comment-glow-field.ui-glow-field:hover,
  .materials-comment-glow-field.ui-glow-field:focus-within,
  .materials-comment-box:is(:hover, :focus-visible, :focus-within),
  .materials-comment-glow-field .ui-glow-control:is(:hover, :focus-visible, :focus-within)
)`
-   `app\styles\theme\mono.css:465` — `:root.theme-mono:not([data-contrast="hc"]) .materials-page-shell :is(.materials-upload-choose-button, .materials-upload-submit-button, .materials-surface-button)`
-   `app\styles\theme\mono.css:502` — `:root.theme-mono:not([data-contrast="hc"]) .workspace-feature-dropdown:not(.pre-inquiry-dropdown) .documents-dropdown-menu`
-   `app\styles\theme\mono.css:514` — `:root.theme-mono:not([data-contrast="hc"]) .workspace-feature-dropdown:not(.pre-inquiry-dropdown) .documents-dropdown-item`
-   `app\styles\theme\mono.css:519` — `:root.theme-mono:not([data-contrast="hc"]) .workspace-feature-dropdown:not(.pre-inquiry-dropdown) .documents-dropdown-item:is(:hover, :focus-visible)`
-   `app\styles\theme\mono.css:523` — `:root.theme-mono:not([data-contrast="hc"]) .workspace-feature-dropdown:not(.pre-inquiry-dropdown) .documents-dropdown-item.is-active`
-   `app\styles\theme\mono.css:550` — `:root.theme-mono:not([data-contrast="hc"]) :is(.glass-ring.glass-ring--desktop-stable, .policy-mobile-lower.glass-ring.glass-ring--desktop-stable, .guide-policy-ring.glass-ring.glass-ring--desktop-stable)`
-   `app\styles\theme\mono.css:564` — `:root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow-field, .invite-glow-field)`
-   `app\styles\theme\mono.css:575` — `:root.theme-mono:not([data-contrast="hc"]) .ui-glow-field:hover`
-   `app\styles\theme\mono.css:575` — `:root.theme-mono:not([data-contrast="hc"]) .ui-glow-field:focus-within`
-   `app\styles\theme\mono.css:575` — `:root.theme-mono:not([data-contrast="hc"]) .invite-glow-field:hover`
-   `app\styles\theme\mono.css:575` — `:root.theme-mono:not([data-contrast="hc"]) .invite-glow-field:focus-within`
-   `app\styles\theme\mono.css:591` — `:root.theme-mono:not([data-contrast="hc"]) .ui-glow-option-card-frame:hover:not(.ui-glow-option-card-frame--disabled)`
-   `app\styles\theme\mono.css:602` — `:root.theme-mono:not([data-contrast="hc"]) .ui-glow-option-card-frame`
-   `app\styles\theme\mono.css:624` — `:root.theme-mono:not([data-contrast="hc"]) .ui-glow-option-card-frame:is(:hover, :focus-visible, :focus-within, :active):not(.ui-glow-option-card-frame--disabled)`
-   `app\styles\theme\mono.css:630` — `:root.theme-mono:not([data-contrast="hc"]) .ui-glow-option-card-frame:is(:hover, :focus-visible, :focus-within, :active):not(.ui-glow-option-card-frame--disabled)::before`
-   `app\styles\theme\mono.css:634` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-edge-glow > [class*="edgeLight"]::before`
-   `app\styles\theme\mono.css:646` — `:root.theme-mono:not([data-contrast="hc"]) :is(
  .update-pin-content .ui-glow-field,
  .update-email-content .ui-glow-field
)`
-   `app\styles\theme\mono.css:658` — `:root.theme-mono:not([data-contrast="hc"]) .glass-field-hole-surface`
-   `app\styles\theme\mono.css:665` — `:root.theme-mono:not([data-contrast="hc"]) .glass-field-hole-surface > .glass-hole-mask-layer`
-   `app\styles\theme\mono.css:685` — `:root.theme-mono:not([data-contrast="hc"]) #login-modal .login-modal-shell.glass-field-hole-surface > :not(.glass-hole-mask-layer):not(.modal-close-btn):not(.login-modal-close):not(.back-button)`
-   `app\styles\theme\mono.css:689` — `:root.theme-mono:not([data-contrast="hc"]) :is(
  .update-pin-content .ui-glow-field,
  .update-email-content .ui-glow-field
):is(:hover, :focus-within)`
-   `app\styles\theme\mono.css:698` — `:root.theme-mono:not([data-contrast="hc"]) :is(
  .update-pin-content .ui-glow-field,
  .update-email-content .ui-glow-field
) :is(input, textarea, select, .ui-glow-control)`
-   `app\styles\theme\mono.css:708` — `:root.theme-mono:not([data-contrast="hc"]) :is(
  .update-pin-content .ui-glow-field,
  .update-email-content .ui-glow-field
)::before`
-   `app\styles\theme\mono.css:708` — `:root.theme-mono:not([data-contrast="hc"]) :is(
  .update-pin-content .ui-glow-field,
  .update-email-content .ui-glow-field
)::after`
-   `app\styles\theme\mono.css:708` — `:root.theme-mono:not([data-contrast="hc"]) :is(
  .update-pin-content .ui-glow-field,
  .update-email-content .ui-glow-field
) > [class*="edgeLight"]`
-   `app\styles\theme\mono.css:778` — `:root.theme-mono:not([data-contrast="hc"]) :is(.workspace-feature-glow-card, .workspace-feature-card, .workspace-feature-list-card, .workspace-feature-chip, .workspace-feature-toggle-row, .workspace-feature-admin-role)`
-   `app\styles\theme\mono.css:782` — `:root.theme-mono:not([data-contrast="hc"]) :is(.workspace-feature-glow-card, .workspace-feature-card, .workspace-feature-list-card, .workspace-feature-chip, .workspace-feature-toggle-row, .workspace-feature-admin-role) > [class*="edgeLight"]::before`
-   `app\styles\theme\mono.css:791` — `:root.theme-mono:not([data-contrast="hc"]):not(.theme-light):not(.theme-mid):not(.theme-night):not([data-contrast="hc"]) .homepage-root .home-about-panel` _(@media (min-width: 48.001em))_
-   `app\styles\theme\mono.css:791` — `:root.theme-mono:not([data-contrast="hc"]) .homepage-root .home-about-panel` _(@media (min-width: 48.001em))_
-   `app\styles\theme\mono.css:798` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-stack-item` _(@media (max-width: 48em))_
-   `app\styles\theme\mono.css:798` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-stack-label` _(@media (max-width: 48em))_
-   `app\styles\theme\mono.css:798` — `:root.theme-mono:not([data-contrast="hc"]) .profile-email-dock-wrapper.profile-orbit-menu-wrapper .profile-orbit-stack-bubble.dock-item` _(@media (max-width: 48em))_
-   `app\styles\theme\night.css:218` — `:root.theme-night .homepage-root .home-about-panel` _(@media (min-width: 48.001em))_
-   `app\styles\theme\night.css:225` — `:root.theme-night
  :is(
    .invite-list-panel,
    .invite-list-row,
    .materials-admin-panel,
    .materials-admin-row,
    .materials-comment-box
  )`
-   `app\styles\theme\night.css:244` — `:root.theme-night
  :is(
    .help-listings-modal-content,
    .invite-modal-content,
    .materials-page-content
  )`
-   `app\styles\theme\night.css:254` — `:root.theme-night .materials-page-shell`
-   `app\styles\tokens.css:422` — `html[data-ui-scale="mac"]`
-   `app\styles\tokens.css:422` — `html[data-ui-scale="lg"]`
-   `app\styles\tokens.css:438` — `html[data-ui-profile="mac"]`
-   `app\styles\tokens.css:438` — `html[data-ui-scale="mac"]`
-   `app\styles\tokens.css:453` — `html[data-ui-profile="mac"]` _(@media (min-width: 1280px))_
-   `app\styles\tokens.css:453` — `html[data-ui-scale="mac"]` _(@media (min-width: 1280px))_
-   `app\styles\tokens.css:469` — `html[data-ui-profile="mac"]` _(@media (min-width: 1440px))_
-   `app\styles\tokens.css:469` — `html[data-ui-scale="mac"]` _(@media (min-width: 1440px))_
-   `app\styles\tokens.css:485` — `html[data-ui-profile="mac"]` _(@media (min-width: 1760px))_
-   `app\styles\tokens.css:485` — `html[data-ui-scale="mac"]` _(@media (min-width: 1760px))_
-   `app\styles\utilities\glass-ring-stable.shared.css:1` — `:root.theme-mid .glass-ring`
-   `app\styles\utilities\glass-ring-stable.shared.css:5` — `:root.theme-mid .glass-ring.glass-ring--desktop-stable`
-   `app\styles\utilities\glass-ring-stable.shared.css:10` — `.glass-ring--desktop-stable` _(@media (min-width: 768px) and (max-width: 1440px) and (max-height: 840px))_
-   `app\styles\utilities\helpers-invite-scrollbar.css:1` — `.invite-modal::-webkit-scrollbar`

## Dead — state changes nothing — 2
_Element exists, but forcing :hover/:active/:focus/:disabled changed no computed value._

-   `app\styles\shared\ui-glow.css:98` — `.ui-glow-button-frame:focus-within:not(:hover) > [class*="edgeLight"]`
-   `app\styles\theme\hc.css:75` — `#main:focus`
