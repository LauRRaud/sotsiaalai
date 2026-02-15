const CHAT_LAYOUT_BASE_VARS = Object.freeze({
  "--chat-diameter": "var(--profile-diameter)",
  "--chat-window-max-w": "clamp(19.4rem, 42.5vw, 28.2rem)",
  "--chat-window-shift-x": "clamp(-0.2rem, -0.42vw, -0.08rem)",
  "--chat-window-top-offset": "0.65rem",
  "--chat-window-pad-top": "clamp(2.4rem, 4.8vh, 3.4rem)",
  "--chat-window-pad-bottom": "calc(clamp(2.2rem, 4.5dvh, 3.4rem) + 2.35rem)",
  "--chat-window-top-safe": "clamp(4.2rem, 7.2vh, 6.6rem)",
  "--chat-window-bottom-gap": "1.9rem",
  "--chat-window-shift-y": "0rem",
  "--chat-scroll-down-offset": "0.2rem",
  "--chat-content-top-offset": "5.2rem",
  "--chat-content-spacer": "7.4rem",
  "--chat-content-bottom-spacer": "0.35rem",
  "--chat-input-shift": "calc(clamp(1.5rem, 3.8dvh, 2.5rem) + 0.9rem)",
  "--chat-input-focus-shift": "0.85rem",
  "--chat-window-focus-shift": "0rem",
  "--chat-inputbar-left-pull": "-1.1rem",
  "--chat-attach-left-pull": "-1.15rem",
  "--chat-hpad-left": "var(--chat-hpad)",
  "--chat-hpad-right": "var(--chat-hpad)",
  "--chat-input-max-w": "clamp(8.2rem, 23vw, 15.8rem)",
  "--chat-ai-offset": "clamp(1.35rem, 3vw, 2.4rem)",
  "--chat-hpad": "clamp(2.2rem, 6vw, 3.4rem)",
  "--hud-edge": "clamp(1.05rem, 2.5vw, 1.55rem)",
  "--hud-icon": "clamp(3rem, 5vw, 3.3rem)",
  "--hud-edge-safe": "calc(var(--hud-edge) + env(safe-area-inset-top, 0px))",
  "--hud-edge-left": "env(safe-area-inset-left, 0px)",
  "--hud-edge-right": "env(safe-area-inset-right, 0px)",
  "--glass-edge-left": "clamp(0.1rem, 1.2vw, 0.8rem)",
  "--glass-edge-right": "clamp(0.1rem, 1.2vw, 0.8rem)",
  "--rail-inset": "0.2rem",
  "--chat-back-inset": "clamp(0.2rem, 1vw, 0.6rem)",
  "--chat-nav-top": "50%",
  "--chat-pad-top": "clamp(1.6rem, 4.2vw, 2.6rem)",
  "--chat-pad-bottom": "clamp(3.2rem, 7vh, 5rem)",
  "--chat-logo-height": "clamp(12rem, 32vw, 26rem)",
  "--chat-logo-y": "clamp(5.2rem, 23vh, 12.2rem)",
  "--chat-mobile-back-top": "calc(env(safe-area-inset-top, 0px) + 0.56rem)",
  "--chat-mobile-back-size": "4.4rem",
  "--chat-mobile-show-size": "3.78rem",
  "--chat-mobile-show-icon-size": "3.46rem",
  "--chat-mobile-rail-size": "clamp(3.1rem, 10.2vw, 3.55rem)",
  "--chat-mobile-hud-center-y": "calc(var(--chat-mobile-back-top) + (var(--chat-mobile-back-size) / 2))",
  "--chat-mobile-show-top": "calc(var(--chat-mobile-hud-center-y) - (var(--chat-mobile-show-size) / 2))",
  "--chat-mobile-rail-top": "calc(var(--chat-mobile-hud-center-y) - (var(--chat-mobile-rail-size) / 2))",
  "--inputbar-h": "3.2rem"
});

const CHAT_LAYOUT_MOBILE_VARS = Object.freeze({
  "--chat-window-top-offset": "0rem",
  "--chat-window-pad-top": "clamp(0.32rem, 1vh, 0.65rem)",
  "--chat-window-pad-bottom": "calc(env(safe-area-inset-bottom, 0px) + 3.95rem)",
  "--chat-window-top-safe": "2.4rem",
  "--chat-window-bottom-gap": "1.35rem",
  "--chat-window-shift-y": "clamp(2.55rem, 7.1vh, 3.7rem)",
  "--chat-window-bottom-safe": "0rem",
  "--chat-window-fade-top": "clamp(0.55rem, 1.8vh, 0.95rem)",
  "--chat-window-fade-bottom": "clamp(1rem, 3.2vh, 1.7rem)",
  "--chat-scroll-down-offset": "-1.9rem",
  "--chat-content-top-offset": "0rem",
  "--chat-content-spacer": "0.95rem",
  "--chat-content-bottom-spacer": "0.55rem",
  "--chat-input-shift": "0rem",
  "--chat-inputbar-left-pull": "0rem",
  "--chat-attach-left-pull": "0rem",
  "--chat-hpad-left": "clamp(0.7rem, 3vw, 1rem)",
  "--chat-hpad-right": "clamp(0.7rem, 3vw, 1rem)",
  "--chat-hpad": "calc(max(var(--hud-edge-left), var(--hud-edge-right)) + var(--hud-icon) + 0.05rem)",
  "--chat-ai-offset": "clamp(2.2rem, 8vw, 3.6rem)",
  "--hud-edge": "clamp(0.55rem, 3vw, 0.95rem)",
  "--hud-icon": "clamp(2.65rem, 12vw, 3rem)",
  "--chat-nav-top": "clamp(2.8rem, 11vw, 4.2rem)",
  "--chat-pad-top": "clamp(0.75rem, 2vh, 1.1rem)",
  "--chat-pad-bottom": "clamp(0.5rem, 1.8vh, 0.9rem)",
  "--chat-logo-height": "clamp(9rem, 52vw, 18rem)",
  "--chat-logo-y": "clamp(3.6rem, 24vh, 9.4rem)",
  "--chat-mobile-back-top": "calc(env(safe-area-inset-top, 0px) + 0.56rem)",
  "--chat-mobile-back-size": "4.4rem",
  "--chat-mobile-show-size": "3.78rem",
  "--chat-mobile-show-icon-size": "3.46rem",
  "--chat-mobile-rail-size": "clamp(3.1rem, 10.2vw, 3.55rem)",
  "--chat-mobile-hud-center-y": "calc(var(--chat-mobile-back-top) + (var(--chat-mobile-back-size) / 2))",
  "--chat-mobile-show-top": "calc(var(--chat-mobile-hud-center-y) - (var(--chat-mobile-show-size) / 2))",
  "--chat-mobile-rail-top": "calc(var(--chat-mobile-hud-center-y) - (var(--chat-mobile-rail-size) / 2))"
});

const CHAT_LAYOUT_MOBILE_OVERRIDES = Object.freeze({
  "--chat-window-pad-top": "clamp(0.32rem, 1vh, 0.65rem)",
  "--chat-content-top-offset": "0rem",
  "--chat-content-spacer": "0.95rem",
  "--chat-content-bottom-spacer": "0.55rem"
});

const CHAT_LAYOUT_DESKTOP_FOCUS_OVERRIDES = Object.freeze({
  "--chat-diameter": "max(var(--profile-diameter), var(--chat-diameter-max))",
  "--chat-window-max-w": "clamp(20.1rem, 45.8vw, 30.9rem)",
  "--chat-window-shift-x": "clamp(-0.18rem, -0.36vw, -0.06rem)",
  "--chat-window-pad-top": "clamp(3.6rem, 6.4vh, 4.8rem)",
  "--chat-window-pad-bottom": "calc(clamp(1.6rem, 3.2dvh, 2.4rem) + 1.1rem)",
  "--chat-window-top-offset": "0.65rem",
  "--chat-window-bottom-gap": "0.4rem",
  "--chat-window-stack-shift": "calc(clamp(4rem, 7vh, 6rem) + 3.6rem)",
  "--chat-window-bottom-extend": "calc(clamp(16rem, 26vh, 20rem) + 3.6rem)",
  "--chat-scroll-button-shift": "calc(clamp(6rem, 10vh, 8rem) + 6.2rem)",
  "--chat-scroll-button-lift": "clamp(0.8rem, 1.4vh, 1.2rem)",
  "--chat-scroll-down-offset": "-1.0rem",
  "--chat-window-fade-bottom-focus": "clamp(1.1rem, 3vh, 1.8rem)",
  "--chat-input-row-gap": "clamp(2.6rem, 5.6vh, 3.9rem)",
  "--chat-input-max-w": "clamp(14rem, 42vw, 26rem)",
  "--chat-input-focus-shift": "-2.35rem",
  "--chat-attach-left-pull": "-1.65rem",
  "--chat-inputbar-left-pull": "-1.6rem",
  "--chat-hpad-right": "clamp(0.5rem, 1.4vw, 1rem)",
  "--chat-content-top-offset": "6.4rem",
  "--chat-content-spacer": "8.6rem",
  "--chat-content-bottom-spacer": "0.25rem"
});

const MOBILE_VIEWPORT_QUERY = "(max-width: 48em)";

function detectMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches ?? window.innerWidth <= 768;
}

function resolveChatLayoutVars({
  isMobile,
  focusActive
}) {
  return {
    ...CHAT_LAYOUT_BASE_VARS,
    ...(isMobile ? CHAT_LAYOUT_MOBILE_VARS : null),
    ...(isMobile ? CHAT_LAYOUT_MOBILE_OVERRIDES : null),
    ...(!isMobile && focusActive ? CHAT_LAYOUT_DESKTOP_FOCUS_OVERRIDES : null)
  };
}

export { MOBILE_VIEWPORT_QUERY, detectMobileViewport, resolveChatLayoutVars };
