"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import BorderGlow from "@/components/ui/BorderGlow";
import { cn } from "@/components/ui/cn";
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import { AddPersonIcon } from "@/components/ui/icons/ChatIcons";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import AdminRoleViewCycleButton from "@/components/workspace/AdminRoleViewCycleButton";
import styles from "./WorkspacePanel.module.css";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";
const DASHBOARD_VIEW_ROLES = Object.freeze([
  "CLIENT",
  "SOCIAL_WORKER",
  "SERVICE_PROVIDER"
]);
const WORKSPACE_ROUTE_PREFETCH_PATHS = Object.freeze([
  "/documents",
  "/dokreziim",
  "/eelpoordumised",
  "/kovisioon",
  "/materjalid",
  "/teenusekaart",
  "/teenuseprofiil"
]);

function DashboardCardIcon({ type }) {
  const serviceMapId = useId().replaceAll(":", "");
  const serviceMapCutoutMaskId = `${serviceMapId}-service-map-cutout`;
  const serviceMapLogoMaskId = `${serviceMapId}-service-map-logo`;

  if (type === "document") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M6.85 3.35h6.35l5.55 5.55v9.35a2.18 2.18 0 0 1-2.18 2.18H6.85a2.18 2.18 0 0 1-2.18-2.18V5.53a2.18 2.18 0 0 1 2.18-2.18Z" stroke="currentColor" strokeWidth="1.48" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.2 3.35v3.82a1.78 1.78 0 0 0 1.78 1.78h3.77" stroke="currentColor" strokeWidth="1.48" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.05 12.1h7.4M8.05 14.7h7.4M8.05 17.3h5.55" stroke="currentColor" strokeWidth="1.42" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "compose") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M5.15 17.75 5.8 14l8.92-8.92a2.05 2.05 0 0 1 2.9 0l1.3 1.3a2.05 2.05 0 0 1 0 2.9L10 18.2l-3.75.65a.96.96 0 0 1-1.1-1.1Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m13.35 6.45 4.2 4.2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "help-request") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M12 21.2c-.9 0-1.85-.48-2.5-1.25C6.35 16.2 4.3 12.35 4.3 9.65a7.7 7.7 0 0 1 15.4 0c0 2.7-2.05 6.55-5.2 10.3-.65.77-1.6 1.25-2.5 1.25Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.45 8.45a1.95 1.95 0 1 1 2.85 1.72c-.9.47-1.3 1.03-1.3 1.92v.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15.25h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "help-offer") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M12 21.2c-.9 0-1.85-.48-2.5-1.25C6.35 16.2 4.3 12.35 4.3 9.65a7.7 7.7 0 0 1 15.4 0c0 2.7-2.05 6.55-5.2 10.3-.65.77-1.6 1.25-2.5 1.25Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6.8v6M9 9.8h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "map") {
    return (
      <svg className={styles.serviceMapInlineIcon} viewBox="0 0 34.12 32.89" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <mask id={serviceMapCutoutMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="34.12" height="32.89">
            <rect width="34.12" height="32.89" fill="#fff" />
            <path d="M19.8,19.68c-.66,0-1.34-.34-1.82-.91-2.32-2.75-3.84-5.6-3.84-7.58,0-3.13,2.54-5.66,5.66-5.66,3.12,0,5.66,2.53,5.66,5.66,0,1.98-1.52,4.83-3.84,7.58-.48.57-1.16.91-1.82.91Z" fill="#000" stroke="#000" strokeWidth="2.35" strokeLinejoin="round" />
          </mask>
          <mask id={serviceMapLogoMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="34.12" height="32.89">
            <rect width="34.12" height="32.89" fill="#000" />
            <path mask={`url(#${serviceMapCutoutMaskId})`} d="M25.07,29.15c-.51.01-1.09-.72-1.14-.79-1.3-1.66-2.07-2.01-3.39-2.74-.87-.56-1.65-.45-2.73-.1-1.22.52-2.07,1.02-1.57-.74.13-.5.29-1.31-.02-1.68-.32-.46-1.39.29-2.16-.26-.6-.41-1.12-1.14-1.24-1.87-.12-.33.16-1.01.22-1.42-.01-.39-.47-.66-.39-1.11.15-.61-.13-1.37.15-2.05.51-.82,1.7-.88,2.38-1.46.28-.19.57-.4.89-.53,1.22-.39,2.07-.61,3.32-.62.67-.02,1.19-.36,1.68-.63,2.69-.43,5.69,1.47,8.46,1.2.63,0,1.72-.07,1.1.88-.43.68-.84,1.72-1.58,2.15-1.52.58-2.69.73-1.91,2.72.74,1.84,1.38,3.99,2.24,5.75.49.98-.34,1.57-.75,2.39-.46.78-1.56.07-2.21.45-.46.27-.95.35-1.26.43l-.09.02Z" stroke="#fff" strokeWidth="1.35" strokeMiterlimit="10" />
            <path d="M19.8,19.68c-.66,0-1.34-.34-1.82-.91-2.32-2.75-3.84-5.6-3.84-7.58,0-3.13,2.54-5.66,5.66-5.66,3.12,0,5.66,2.53,5.66,5.66,0,1.98-1.52,4.83-3.84,7.58-.48.57-1.16.91-1.82.91Z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.85,12.25v2.75" stroke="#fff" strokeWidth="1.72" strokeLinecap="round" />
            <path d="M19.8,9.15h.01" stroke="#fff" strokeWidth="2.08" strokeLinecap="round" />
            <path mask={`url(#${serviceMapCutoutMaskId})`} d="M5.34,23.68c-.81.85-.03,2.26.79.86.28-.52.41-1.22.84-1.49.42-.29,1.03-.07,1.45-.22.8-.26,1.36-1.1,2.13-1.45.16-.11.43-.24.29-.48-.47-.71-1.35-1.18-2.24-1.13-.47-.08-.87-.16-1.38.07-.44.14-.91.46-1.3.63-.32.13-.79-.08-.97.06-.23.25.39.96,0,1.25-.27.32-.22.64.15.98.3.26.85.61.29.87l-.06.05Z" stroke="#fff" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
            <path mask={`url(#${serviceMapCutoutMaskId})`} d="M8.52,18.64c-.64-.19-.17-1.53-.97-1.54-.74-.01-1.5-.88-.19-.76.53.05.95-.27,1.22-.67.12-.18.24-.41.44-.39.27,0,.39.43.54.61.14.17.39.2.57.31.32.21.71.8.56,1.14-.04.09-.25.3-.43.41-.18.11-.27.19-.46.21-.19.02-.38.11-.54.29-.18.19-.4.35-.64.41h-.09Z" stroke="#fff" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
          </mask>
        </defs>
        <rect width="34.12" height="32.89" fill="currentColor" mask={`url(#${serviceMapLogoMaskId})`} />
      </svg>
    );
  }
  if (type === "service-profile") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M5.85 4.45h12.3a1.75 1.75 0 0 1 1.75 1.75v11.6a1.75 1.75 0 0 1-1.75 1.75H5.85A1.75 1.75 0 0 1 4.1 17.8V6.2a1.75 1.75 0 0 1 1.75-1.75Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8.45" cy="9.1" r="1.5" stroke="currentColor" strokeWidth="1.55" />
        <path d="M6.3 15.05c.42-1.62 1.14-2.4 2.15-2.4s1.73.78 2.15 2.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.7 8.15h4.45M12.7 11.25h4.45M12.7 14.35h3.25" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "room") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M6.8 14h4.8c1.9 0 3.35.9 3.9 2.35.45 1.15.35 2.25.18 3.05-.45 1.8-2.6 2.35-6.48 2.35s-6.03-.55-6.48-2.35c-.17-.8-.27-1.9.18-3.05C3.45 14.9 4.9 14 6.8 14Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.2" cy="6.7" r="3.65" stroke="currentColor" strokeWidth="1.55" />
        <path d="M21.1 18.9v-1.7c0-1.55-1.35-2.9-3.3-3.3M15.3 3.9a3.2 3.2 0 0 1-.08 6.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "invite") {
    return <AddPersonIcon strokeColor="currentColor" />;
  }
  if (type === "materials") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M6.85 3.35h6.35l5.55 5.55v9.35a2.18 2.18 0 0 1-2.18 2.18H6.85a2.18 2.18 0 0 1-2.18-2.18V5.53a2.18 2.18 0 0 1 2.18-2.18Z" stroke="currentColor" strokeWidth="1.48" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.2 3.35v3.82a1.78 1.78 0 0 0 1.78 1.78h3.77" stroke="currentColor" strokeWidth="1.48" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15.08v-4.75" stroke="currentColor" strokeWidth="1.42" strokeLinecap="round" />
        <path d="m9.25 13.08 2.75-2.75 2.75 2.75" stroke="currentColor" strokeWidth="1.42" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.85 15.28v2.12h8.3v-2.12" stroke="currentColor" strokeWidth="1.42" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M8.3 14.15h7.4c2.25 0 4.05 1.8 4.05 4.05v.35c0 1.2-.97 2.17-2.17 2.17H6.42c-1.2 0-2.17-.97-2.17-2.17v-.35c0-2.25 1.8-4.05 4.05-4.05Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7.55" r="4.15" stroke="currentColor" strokeWidth="1.55" />
      <path d="M16.95 9.1h3.9M18.9 7.15v3.9" stroke="currentColor" strokeWidth="1.72" strokeLinecap="round" />
    </svg>
  );
}

function text(t, key, fallback) {
  return typeof t === "function" ? t(key, fallback) : fallback;
}

function normalizeDashboardRole(role, fallback = "SOCIAL_WORKER") {
  const normalized = String(role || "").trim().toUpperCase();
  return DASHBOARD_VIEW_ROLES.includes(normalized) ? normalized : fallback;
}

export default function WorkspacePanel({
  t,
  locale = "et",
  userRole = "",
  userActualRole = "",
  isAdmin = false,
  subActive = false,
  onClose,
  visible = true
}) {
  const router = useRouter();
  const defaultDashboardRole = useMemo(() => {
    const actualRole = String(userActualRole || "").trim().toUpperCase();
    const currentRole = String(userRole || "").trim().toUpperCase();
    if (DASHBOARD_VIEW_ROLES.includes(actualRole)) return actualRole;
    if (DASHBOARD_VIEW_ROLES.includes(currentRole)) return currentRole;
    return "SOCIAL_WORKER";
  }, [userActualRole, userRole]);
  const [dashboardRole, setDashboardRole] = useState(defaultDashboardRole);
  const [roleMenuPortalTarget, setRoleMenuPortalTarget] = useState(null);

  const navigateTo = useCallback(
    path => {
      const shouldRestoreWorkspace = !String(path || "").startsWith("/vestlus");
      const href = localizePath(path, locale);
      if (shouldRestoreWorkspace && typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
            JSON.stringify({ ts: Date.now() })
          );
        } catch {}
      }
      try {
        router.prefetch?.(href);
      } catch {}
      pushWithTransition(router, href);
    },
    [locale, router]
  );

  const handleWorkspaceBack = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const openHelpPanel = useCallback(
    panelKey => {
      if (typeof window === "undefined") return;
      onClose?.();
      try {
        window.dispatchEvent(
          new CustomEvent("sotsiaalai:open-help-listings", {
            detail: { panelKey, source: "workspace" }
          })
        );
      } catch {}
    },
    [onClose]
  );

  const openInvite = useCallback(() => {
    if (typeof window === "undefined") return;
    onClose?.();
    try {
      window.dispatchEvent(
        new CustomEvent("sotsiaalai:open-invite", {
          detail: { source: "workspace" }
        })
      );
    } catch {}
  }, [onClose]);

  useEffect(() => {
    setDashboardRole(defaultDashboardRole);
  }, [defaultDashboardRole]);

  useEffect(() => {
    setRoleMenuPortalTarget(document.body);
    return () => setRoleMenuPortalTarget(null);
  }, []);

  useEffect(() => {
    if (!visible || typeof router.prefetch !== "function") return;
    for (const path of WORKSPACE_ROUTE_PREFETCH_PATHS) {
      try {
        router.prefetch(localizePath(path, locale));
      } catch {}
    }
  }, [locale, router, visible]);

  const handleDashboardRoleChanged = useCallback((user = {}) => {
    setDashboardRole(normalizeDashboardRole(user?.effectiveRole || user?.adminViewRole));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onKeyDown = event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const activeRole = isAdmin
    ? dashboardRole
    : normalizeDashboardRole(userActualRole || userRole || "", "CLIENT");
  const isClientView = activeRole === "CLIENT";
  const isProviderView = activeRole === "SERVICE_PROVIDER";
  const hasPaidAccess = Boolean(isAdmin || subActive);

  const makeCard = useCallback(
    (card, { requiresPaid = false } = {}) => ({
      ...card,
      disabled: Boolean(requiresPaid && !hasPaidAccess)
    }),
    [hasPaidAccess]
  );

  const serviceMapCard = makeCard({
    key: "service_map",
    icon: "map",
    title: text(t, "chat.workspace.cards.service_map.title", "Teenusekaart"),
    meta: text(t, "chat.workspace.cards.service_map.meta", "Kaardivaade"),
    onClick: () => navigateTo("/teenusekaart")
  });

  const cardRows = isProviderView
    ? [
        [
          makeCard({
            key: "help_requests",
            icon: "help-request",
            title: text(t, "chat.workspace.cards.help_requests.title", "Abisoovid"),
            meta: text(t, "chat.workspace.cards.help_requests.meta", "Kuulutused"),
            onClick: () => openHelpPanel("help_requests")
          }),
          makeCard({
            key: "help_offers",
            icon: "help-offer",
            title: text(t, "chat.workspace.cards.help_offers.title", "Abipakkumised"),
            meta: text(t, "chat.workspace.cards.help_offers.meta", "Pakkumised"),
            onClick: () => openHelpPanel("help_offers")
          })
        ],
        [
          serviceMapCard,
          makeCard({
            key: "service_profile",
            icon: "service-profile",
            title: text(t, "chat.workspace.cards.service_profile.title", "Teenuseprofiil"),
            meta: text(t, "chat.workspace.cards.service_profile.meta", "Profiil"),
            onClick: () => navigateTo("/teenuseprofiil")
          }, { requiresPaid: true })
        ],
        [
          makeCard({
            key: "documents",
            icon: "document",
            title: text(t, "chat.workspace.cards.documents.title", "Dokumendid"),
            meta: text(t, "chat.workspace.cards.documents.meta", "Teek"),
            onClick: () => navigateTo("/documents")
          }, { requiresPaid: true }),
          makeCard({
            key: "document_drafting",
            icon: "compose",
            title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
            meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tooruum"),
            onClick: () => navigateTo("/dokreziim")
          }, { requiresPaid: true })
        ],
        [
          makeCard({
            key: "pre_inquiries",
            icon: "compose",
            title: text(t, "chat.workspace.cards.pre_inquiries.title_staff", "Pöördumised"),
            meta: text(t, "chat.workspace.cards.pre_inquiries.meta_staff", "Saabunud ja saadetud"),
            onClick: () => navigateTo("/eelpoordumised")
          }, { requiresPaid: true }),
          makeCard({
            key: "add_person",
            icon: "invite",
            title: text(t, "chat.workspace.cards.add_person.title", "Kutsed"),
            meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
            onClick: openInvite
          }, { requiresPaid: true })
        ],
        [
          makeCard({
            key: "materials",
            icon: "materials",
            title: text(t, "chat.workspace.cards.materials.title", "Materjalid"),
            meta: text(t, "chat.workspace.cards.materials.meta", "Andmebaas"),
            onClick: () => navigateTo("/materjalid")
          }, { requiresPaid: true })
        ]
      ]
    : [
        [
          makeCard({
            key: "help_requests",
            icon: "help-request",
            title: text(t, "chat.workspace.cards.help_requests.title", "Abisoovid"),
            meta: text(t, "chat.workspace.cards.help_requests.meta", "Kuulutused"),
            onClick: () => openHelpPanel("help_requests")
          }),
          makeCard({
            key: "help_offers",
            icon: "help-offer",
            title: text(t, "chat.workspace.cards.help_offers.title", "Abipakkumised"),
            meta: text(t, "chat.workspace.cards.help_offers.meta", "Pakkumised"),
            onClick: () => openHelpPanel("help_offers")
          })
        ],
        ...(!isClientView
          ? [[
              makeCard({
                key: "documents",
                icon: "document",
                title: text(t, "chat.workspace.cards.documents.title", "Dokumendid"),
                meta: text(t, "chat.workspace.cards.documents.meta", "Teek"),
                onClick: () => navigateTo("/documents")
              }, { requiresPaid: true }),
              makeCard({
                key: "document_drafting",
                icon: "compose",
                title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
                meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tooruum"),
                onClick: () => navigateTo("/dokreziim")
              }, { requiresPaid: true })
            ]]
          : []),
        [
          makeCard({
            key: "pre_inquiries",
            icon: "compose",
            title: isClientView
              ? text(t, "chat.workspace.cards.pre_inquiries.title_client", "Eelpöördumine")
              : text(t, "chat.workspace.cards.pre_inquiries.title_staff", "Pöördumised"),
            meta: isClientView
              ? text(t, "chat.workspace.cards.pre_inquiries.meta_client", "Pöördumise mustand")
              : text(t, "chat.workspace.cards.pre_inquiries.meta_staff", "Saabunud ja saadetud"),
            onClick: () => navigateTo("/eelpoordumised")
          }, { requiresPaid: true }),
          isClientView
            ? makeCard({
                key: "document_drafting",
                icon: "compose",
                title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
                meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tooruum"),
                onClick: () => navigateTo("/dokreziim")
              }, { requiresPaid: true })
            : makeCard({
                key: "add_person",
                icon: "invite",
                title: text(t, "chat.workspace.cards.add_person.title", "Kutsed"),
                meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
                onClick: openInvite
              }, { requiresPaid: true })
        ],
        ...(isClientView
          ? [[
              makeCard({
                key: "add_person",
                icon: "invite",
                title: text(t, "chat.workspace.cards.add_person.title", "Kutsed"),
                meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
                onClick: openInvite
              }, { requiresPaid: true }),
              serviceMapCard
            ]]
          : [
            [
              makeCard({
                key: "kovision",
                icon: "room",
                title: text(t, "chat.workspace.cards.kovision.title", "Kovisioon"),
                meta: text(t, "chat.workspace.cards.kovision.meta", "Ruumid"),
                onClick: () => navigateTo("/kovisioon")
              }, { requiresPaid: true }),
              makeCard({
                key: "materials",
                icon: "materials",
                title: text(t, "chat.workspace.cards.materials.title", "Materjalid"),
                meta: text(t, "chat.workspace.cards.materials.meta", "Andmebaas"),
                onClick: () => navigateTo("/materjalid")
              }, { requiresPaid: true })
            ],
            [serviceMapCard]
          ])
      ];

  const roleMenu = isAdmin ? (
    <div className={styles.roleMenu}>
      <AdminRoleViewCycleButton
        t={t}
        locale={locale}
        value={dashboardRole}
        onRoleChanged={handleDashboardRoleChanged}
        ariaLabel={text(t, "chat.workspace.view_role.label", "Töölaua vaade")}
      />
    </div>
  ) : null;

  return (
    <>
      {visible && roleMenuPortalTarget && roleMenu
        ? createPortal(roleMenu, roleMenuPortalTarget)
        : null}
      <section
        className={cn("workspace-dashboard-panel", styles.panel)}
        data-visible={visible ? "true" : "false"}
        role="region"
        aria-labelledby="chat-workspace-title"
      >
      <GlassSubpageHeader
        onBack={handleWorkspaceBack}
        backAriaLabel={text(t, "buttons.back_previous", "Tagasi")}
        anchorBack={false}
        backClassName={styles.backButton}
        holdPressedVisualDisabled
        titleId="chat-workspace-title"
        rightSlot={
          <DashboardInfoTrigger
            infoId="workspace"
            title={text(t, "chat.workspace.title", "Töölaud")}
            className={dashboardInfoTriggerCornerClassName}
            style={{ top: "0.475rem" }}
          />
        }
      >
        {text(t, "chat.workspace.title", "Töölaud")}
      </GlassSubpageHeader>

      <div className={styles.grid}>
        {cardRows.map((row, index) => (
          <div
            key={`row-${index + 1}`}
            className={cn(styles.row, row.length === 1 && styles.rowSingle)}
          >
            {row.map(card => (
              <BorderGlow
                key={card.key}
                as="button"
                type="button"
                className={cn("workspace-dashboard-card", styles.card, styles[`card_${card.key}`], card.disabled && styles.cardDisabled)}
                onClick={card.disabled ? undefined : card.onClick}
                disabled={card.disabled}
                aria-disabled={card.disabled ? "true" : "false"}
                edgeSensitivity={30}
                glowColor="358 82 72"
                backgroundColor="#120F17"
                borderRadius={13}
                glowRadius={42}
                glowIntensity={0.72}
                coneSpread={20}
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
                fillOpacity={0}
                edgeOnly
              >
                <span className={styles.cardIcon} aria-hidden="true">
                  <DashboardCardIcon type={card.icon} />
                </span>
                <span className={styles.cardCopy}>
                  <span className={styles.cardTitle}>{card.title}</span>
                </span>
              </BorderGlow>
            ))}
          </div>
        ))}
      </div>
      </section>
    </>
  );
}
