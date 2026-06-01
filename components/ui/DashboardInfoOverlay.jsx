"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/I18nProvider";
import IconButton from "@/components/ui/IconButton";
import { chatDrawerCloseButtonClassName } from "@/components/ui/chatDrawerCloseButtonStyles";
import { cn } from "@/components/ui/cn";
import {
  glassSubpageHeaderClassName,
  glassSubpageTitleClassName,
  glassSubpageTitleWrapClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles";
import { getDashboardInfoContent } from "@/lib/dashboardInfoContent";
import styles from "./PageInfoButton.module.css";

function InfoIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--page-info-ring-color,currentColor)"
      strokeWidth="1.18"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="6.35" opacity="0.9" />
      <path d="M12 11.35v4" opacity="0.9" />
      <circle cx="12" cy="8.55" r="0.82" fill="var(--page-info-dot-color,currentColor)" stroke="none" opacity="0.9" />
    </svg>
  );
}

const triggerClassName =
  "inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-center rounded-full border-0 bg-transparent p-0 text-[color:var(--title-color,var(--brand-primary,#c57171))] shadow-none outline-none transform-gpu transition-transform duration-[260ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:scale-[1.08] focus-visible:scale-[1.08] focus-visible:ring-[3px] focus-visible:ring-[color:var(--covision-focus-ring,var(--btn-primary-focus-ring-color,rgba(197,113,113,0.28)))] active:scale-[0.98] hc:text-[color:var(--hc-accent)]";

export const dashboardInfoTriggerCornerClassName =
  `${styles.cornerTrigger} dashboard-info-trigger-corner`;

const overlayClassName =
  "dashboard-info-overlay fixed inset-0 z-[170] flex items-center justify-center bg-transparent p-0 max-[768px]:items-start";

const panelClassName =
  "dashboard-info-panel workspace-guide-panel workspace-scroll-surface glass-subpage-surface relative flex w-[var(--workspace-glass-inline-size,var(--workspace-glass-shell-inline-size,min(calc(100vw-2rem),clamp(36rem,76vw,54rem))))] h-[var(--workspace-glass-block-size,min(52rem,calc(100dvh-2rem)))] max-h-[var(--workspace-glass-block-size,calc(100dvh-2rem))] flex-col overflow-hidden rounded-[2rem] " +
  "text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
  "px-[clamp(1.15rem,2.4vw,1.7rem)] pt-[clamp(0.4rem,1vh,0.72rem)] pb-[clamp(0.95rem,2vh,1.3rem)] outline-none max-[768px]:mt-[calc(var(--mobile-safe-top,env(safe-area-inset-top,0px))+0.35rem)] max-[768px]:mx-[max(0.35rem,env(safe-area-inset-left,0px))] max-[768px]:w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-0.7rem)] max-[768px]:h-[calc(var(--glass-mobile-root-vh,100dvh)-var(--mobile-safe-top,env(safe-area-inset-top,0px))-var(--mobile-safe-bottom,env(safe-area-inset-bottom,0px))-0.7rem)] max-[768px]:max-h-[calc(var(--glass-mobile-root-vh,100dvh)-var(--mobile-safe-top,env(safe-area-inset-top,0px))-var(--mobile-safe-bottom,env(safe-area-inset-bottom,0px))-0.7rem)] max-[768px]:rounded-[1.45rem] max-[768px]:px-[1rem] max-[768px]:pt-[0.72rem] max-[768px]:pb-[calc(env(safe-area-inset-bottom,0px)+0.95rem)]";

const contentClassName = `dashboard-info-content ${workspaceGuidePanelScrollClassName}`;

const contentStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "100%",
  minHeight: 0,
  flex: "1 1 auto",
  margin: "0 auto",
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
  scrollbarWidth: "none",
  padding: "0 clamp(1rem, 2.1vw, 1.45rem) 0.32rem"
};

const basePanelStyle = {
  background: "var(--glass-ring-sheen, none), var(--glass-ring-surface-bg, var(--glass-surface-bg, rgba(0, 0, 0, 0.25)))",
  boxShadow: "var(--glass-shell-shadow, none)",
  backdropFilter: "blur(1rem) saturate(112%)",
  WebkitBackdropFilter: "blur(1rem) saturate(112%)"
};

const overlayCloseStyle = {
  top: "calc(var(--workspace-guide-panel-overscan-top, 0px) + 0.72rem)",
  right: "0.72rem"
};

const introBlockStyle = {
  display: "grid",
  gap: "clamp(1.55rem, 3.5vh, 2.2rem)",
  paddingBottom: "clamp(1.15rem, 2.7vh, 1.6rem)"
};

const introTextStyle = {
  margin: 0,
  textAlign: "left",
  fontSize: "1.12rem",
  lineHeight: 1.58,
  letterSpacing: 0,
  color: "var(--glass-modal-text, var(--glass-surface-text, #f2f2f2))"
};

const detailsListStyle = {
  display: "grid",
  gap: "0.75rem",
  width: "100%",
  paddingBottom: "0.55rem"
};

const detailSectionStyle = {
  display: "grid",
  gap: "0.54rem",
  padding: "0.34rem 0",
  border: 0,
  background: "transparent",
  boxShadow: "none"
};

const UNDERLAY_HIDE_SELECTOR = [
  ".chat-container--workspace-open",
  ".workspace-dashboard-panel",
  ".workspace-feature-page-shell",
  ".workspace-feature-panel",
  ".materials-page-shell",
  ".materials-page-content",
  ".documents-workspace-shell",
  ".covision-page-surface",
  ".materials-page-surface",
  ".service-map-page-panel",
  ".help-listings-modal-overlay",
  ".help-listings-modal-content",
  ".invite-modal-overlay",
  ".invite-modal-content",
  ".person-invite-modal-content",
  ".selected-listing-modal-overlay",
  ".selected-listing-modal-content"
].join(",");

const SURFACE_SOURCE_SELECTOR = [
  ".workspace-guide-panel",
  ".glass-subpage-surface",
  ".workspace-feature-panel",
  ".documents-workspace-shell",
  ".materials-page-content",
  ".covision-page-surface",
  ".service-map-page-panel",
  ".help-listings-modal-content",
  ".invite-modal-content",
  ".person-invite-modal-content",
  ".selected-listing-modal-content",
  ".workspace-dashboard-panel",
  ".chat-container--workspace-open",
  ".glass-ring",
  ".glass-box"
].join(",");

const SURFACE_CSS_VARIABLES = [
  "--glass-modal-text",
  "--glass-surface-text",
  "--glass-surface-bg",
  "--glass-ring-surface-bg",
  "--glass-ring-sheen",
  "--glass-shell-shadow",
  "--glass-blur-radius",
  "--glass-modal-blur",
  "--subpage-card-text",
  "--title-color",
  "--brand-primary",
  "--glass-modal-title-shadow",
  "--workspace-glass-inline-size",
  "--workspace-glass-shell-inline-size",
  "--workspace-glass-block-size",
  "--workspace-subpage-back-left",
  "--workspace-subpage-back-top",
  "--workspace-subpage-header-margin-bottom",
  "--workspace-subpage-title-margin-top",
  "--workspace-subpage-title-margin-bottom",
  "--documents-page-text",
  "--documents-page-strong",
  "--documents-page-muted",
  "--documents-heading-color",
  "--documents-accent",
  "--documents-elevated-bg",
  "--documents-elevated-bg-hover",
  "--documents-elevated-border",
  "--documents-elevated-border-hover",
  "--documents-elevated-shadow",
  "--documents-panel-bg",
  "--documents-surface-panel-bg",
  "--documents-surface-panel-text",
  "--documents-glass-backdrop-filter",
  "--documents-strong-shadow"
];

function isUsableSurfaceStyle(style) {
  if (!style) return false;
  const background = style.background || "";
  const color = style.backgroundColor || "";
  const hasVisibleBackground =
    color !== "rgba(0, 0, 0, 0)" &&
    color !== "transparent";
  const hasGlassLayer =
    background.includes("var(") ||
    background.includes("gradient") ||
    (!background.startsWith("rgba(0, 0, 0, 0)") && background !== "none");
  return hasVisibleBackground || hasGlassLayer;
}

function findSurfaceSource(source) {
  if (typeof window === "undefined" || !(source instanceof HTMLElement)) return source;
  const dashboardPanel = source.closest?.(".workspace-dashboard-panel");
  if (dashboardPanel) {
    return dashboardPanel.closest?.(".chat-container--workspace-open") || dashboardPanel;
  }
  let node = source.closest?.(SURFACE_SOURCE_SELECTOR) || source;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (isUsableSurfaceStyle(style)) return node;
    node = node.parentElement;
  }
  return source.closest?.(SURFACE_SOURCE_SELECTOR) || source;
}

function captureSurfaceStyle(source) {
  if (typeof window === "undefined" || !(source instanceof HTMLElement)) return undefined;
  const surface = findSurfaceSource(source);
  const computed = window.getComputedStyle(surface);
  const next = {};
  const rect = surface.getBoundingClientRect();
  if (rect.width > 0) {
    next.width = `${rect.width}px`;
    next.maxWidth = `${rect.width}px`;
    next["--dashboard-info-panel-width"] = `${rect.width}px`;
  }
  if (rect.height > 0) {
    next.height = `${rect.height}px`;
    next.maxHeight = `${rect.height}px`;
    next["--dashboard-info-panel-height"] = `${rect.height}px`;
    if (window.matchMedia?.("(min-width: 769px)")?.matches) {
      const viewportHeight =
        document.documentElement?.getBoundingClientRect?.().height || window.innerHeight;
      const centeredTop = Math.max(0, (viewportHeight - rect.height) / 2);
      const centeredOffset = rect.top - centeredTop;
      if (Math.abs(centeredOffset) > 0.5) {
        next.top = `${centeredOffset}px`;
      }
    }
  }
  if (computed.borderRadius && computed.borderRadius !== "0px") {
    next.borderRadius = computed.borderRadius;
  }
  for (const name of SURFACE_CSS_VARIABLES) {
    const value = computed.getPropertyValue(name).trim();
    if (value) next[name] = value;
  }
  const sourceTitleWrap = surface.querySelector?.(".glass-subpage-title-wrap");
  if (sourceTitleWrap instanceof HTMLElement) {
    const titleWrapStyle = window.getComputedStyle(sourceTitleWrap);
    const titleWrapRect = sourceTitleWrap.getBoundingClientRect();
    const surfacePaddingTop = parseFloat(computed.paddingTop || "0") || 0;
    const titleWrapExtraTop = Math.max(0, titleWrapRect.top - rect.top - surfacePaddingTop);
    next["--dashboard-info-title-wrap-padding-top"] = titleWrapStyle.paddingTop || "0px";
    next["--dashboard-info-title-wrap-padding-bottom"] = titleWrapStyle.paddingBottom || "0px";
    next["--dashboard-info-title-wrap-extra-top"] = `${titleWrapExtraTop}px`;
  }
  const sourceTitle = surface.querySelector?.(".glass-subpage-title");
  if (sourceTitle instanceof HTMLElement) {
    const titleStyle = window.getComputedStyle(sourceTitle);
    next["--workspace-subpage-title-margin-top"] = titleStyle.marginTop || "0px";
    next["--workspace-subpage-title-margin-bottom"] = titleStyle.marginBottom || "0px";
  }
  if (isUsableSurfaceStyle(computed)) {
    next.background = computed.background;
    next["--dashboard-info-surface-background"] = computed.background;
  }
  if (computed.boxShadow && computed.boxShadow !== "none") {
    next.boxShadow = computed.boxShadow;
    next["--dashboard-info-surface-shadow"] = computed.boxShadow;
  }
  const backdrop = computed.backdropFilter || computed.webkitBackdropFilter;
  if (backdrop && backdrop !== "none") {
    next.backdropFilter = backdrop;
    next.WebkitBackdropFilter = backdrop;
  }
  return Object.keys(next).length ? next : undefined;
}

const sectionTitleClassName =
  "m-0 text-[clamp(1.32rem,1.75vw,1.5rem)] font-[500] leading-[1.16] tracking-[0.013em] text-[color:var(--documents-heading-color,var(--title-color,var(--brand-accent,#c57171)))] max-[768px]:text-[clamp(1.62rem,5.7vw,1.9rem)] max-[768px]:tracking-[0.018em]";

const bodyTextClassName =
  "m-0 text-[1.03rem] leading-[1.56] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.88] max-[768px]:text-[1rem] max-[768px]:leading-[1.5]";

function getFocusable(root) {
  if (!root) return [];
  const nodes = root.querySelectorAll([
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "iframe",
    "object",
    "embed",
    "[contenteditable]",
    "[tabindex]:not([tabindex='-1'])"
  ].join(","));
  return Array.from(nodes).filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
}

function renderDetail(section, extra) {
  return (
    <section key={section.title} style={detailSectionStyle}>
      <h3 className={sectionTitleClassName}>{section.title}</h3>
      {section.body ? <p className={bodyTextClassName}>{section.body}</p> : null}
      {section.items?.length ? (
        <ul className="m-0 grid gap-[0.36rem] pl-[1.08rem] text-[1.01rem] leading-[1.48] opacity-[0.88] max-[768px]:text-[0.98rem]">
          {section.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
      {extra ? <div className="mt-[0.28rem]">{extra}</div> : null}
    </section>
  );
}

function DashboardInfoOverlay({ open, onClose, infoId, label = "Ava info", title, surfaceStyle, detailExtras }) {
  const [portalRoot, setPortalRoot] = useState(null);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const titleId = useId();
  const { t } = useI18n();
  const content = useMemo(() => getDashboardInfoContent(t, infoId), [infoId, t]);
  const displayTitle = title || content?.title;
  const panelStyle = useMemo(() => ({
    ...basePanelStyle,
    ...surfaceStyle
  }), [surfaceStyle]);
  const hasTitleMetrics = Boolean(surfaceStyle?.["--dashboard-info-title-wrap-padding-top"]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    let root = document.querySelector('[data-dashboard-info-root="true"]');
    let created = false;
    if (!root) {
      root = document.createElement("div");
      root.setAttribute("data-dashboard-info-root", "true");
      document.body.appendChild(root);
      created = true;
    }
    setPortalRoot(root);
    return () => {
      if (created && root?.parentNode) root.parentNode.removeChild(root);
      setPortalRoot(null);
    };
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined" || !portalRoot) return undefined;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const siblings = Array.from(document.body.children).filter((el) => el !== portalRoot);
    const underlayTargets = Array.from(document.querySelectorAll(UNDERLAY_HIDE_SELECTOR))
      .filter((el) => !portalRoot.contains(el));
    const previousOverflow = document.body.style.overflow;
    const previousUnderlayVisibility = new Map();
    document.body.style.overflow = "hidden";

    const initialFocusTarget = closeRef.current || panelRef.current;
    try {
      initialFocusTarget?.focus?.({ preventScroll: true });
    } catch {
      initialFocusTarget?.focus?.();
    }

    for (const el of siblings) {
      try {
        el.setAttribute("aria-hidden", "true");
        if ("inert" in el) {
          el.inert = true;
        }
      } catch {}
    }

    for (const el of underlayTargets) {
      try {
        previousUnderlayVisibility.set(el, el.style.visibility);
        el.style.visibility = "hidden";
      } catch {}
    }

    const focusTimer = window.setTimeout(() => {
      const target = closeRef.current || panelRef.current;
      try {
        target?.focus?.({ preventScroll: true });
      } catch {
        target?.focus?.();
      }
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      for (const el of underlayTargets) {
        try {
          el.style.visibility = previousUnderlayVisibility.get(el) || "";
        } catch {}
      }
      for (const el of siblings) {
        try {
          el.removeAttribute("aria-hidden");
          if ("inert" in el) {
            el.inert = false;
          }
        } catch {}
      }
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && opener.isConnected) {
        try {
          opener.focus({ preventScroll: true });
        } catch {
          opener.focus();
        }
      }
    };
  }, [open, portalRoot]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable(panelRef.current);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !panelRef.current?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (active === last || !panelRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, open]);

  if (!open || !portalRoot || !content) return null;

  return createPortal(
    <div
      className={overlayClassName}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={label}
        tabIndex={-1}
        className={cn(panelClassName, hasTitleMetrics && "dashboard-info-panel--with-title-metrics")}
        style={panelStyle}
      >
        <IconButton
          ref={closeRef}
          onClick={onClose}
          className={chatDrawerCloseButtonClassName}
          style={overlayCloseStyle}
          label={typeof t === "function" ? t("buttons.close", "Sulge") : "Sulge"}
        />
        <div className={contentClassName} style={contentStyle}>
          <div style={introBlockStyle}>
            <header className={glassSubpageHeaderClassName}>
              <div className={glassSubpageTitleWrapClassName}>
                <h2 id={titleId} className={glassSubpageTitleClassName}>
                  {displayTitle}
                </h2>
              </div>
            </header>
            <p style={introTextStyle}>
              {content.intro}
            </p>
          </div>
          <div style={detailsListStyle}>
            {content.details.map((section, index) => renderDetail(section, detailExtras?.[index]))}
          </div>
        </div>
      </section>
    </div>,
    portalRoot
  );
}

export function DashboardInfoTrigger({
  infoId,
  label = "Ava info",
  className,
  dialogLabel,
  title,
  style,
  detailExtras
}) {
  const [open, setOpen] = useState(false);
  const [surfaceStyle, setSurfaceStyle] = useState(undefined);
  const usesCornerPosition = String(className || "").includes(styles.cornerTrigger);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open ? "true" : "false"}
        onClick={(event) => {
          setSurfaceStyle(captureSurfaceStyle(event.currentTarget));
          setOpen(true);
        }}
        className={cn(styles.trigger, triggerClassName, className)}
        style={usesCornerPosition ? {
          position: "absolute",
          right: "var(--mobile-header-info-right, var(--workspace-subpage-back-left, 0.55rem))",
          top: "var(--mobile-header-control-info-top, calc(var(--workspace-guide-panel-overscan-top, 0px) + var(--workspace-subpage-back-top, 0.55rem) + 0.425rem))",
          zIndex: 35,
          ...style
        } : style}
      >
        <InfoIcon className="h-full w-full overflow-visible" />
      </button>
      <DashboardInfoOverlay
        open={open}
        onClose={() => setOpen(false)}
        infoId={infoId}
        label={dialogLabel || label}
        title={title}
        surfaceStyle={surfaceStyle}
        detailExtras={detailExtras}
      />
    </>
  );
}
