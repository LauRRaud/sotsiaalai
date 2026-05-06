"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import {
  glassPageBackTopLeftClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { AddPersonIcon } from "@/components/ui/icons/ChatIcons";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import WorkspaceRoleCycleButton from "@/components/workspace/WorkspaceRoleCycleButton";
import styles from "./WorkspacePanel.module.css";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";
const DASHBOARD_VIEW_ROLES = Object.freeze([
  "CLIENT",
  "SOCIAL_WORKER",
  "SERVICE_PROVIDER"
]);

function DashboardCardIcon({ type }) {
  if (type === "document") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M7 3.8h6.35L18 8.45V19a1.6 1.6 0 0 1-1.6 1.6H7A1.6 1.6 0 0 1 5.4 19V5.4A1.6 1.6 0 0 1 7 3.8Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.35 3.8v4.65H18" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.6 12.1h6.8M8.6 15.35h5.2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
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
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M9 18.65 4.7 20.1V6.1L9 4.65m0 14V4.65m0 14 6 1.8m-6-15.8 6 1.8m0 14V6.45m0 14 4.3-1.45v-14L15 6.45" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9.15h.01M12 12.15h.01M12 15.15h.01" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "service-profile") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M6.15 4.2h11.7a1.75 1.75 0 0 1 1.75 1.75v12.1a1.75 1.75 0 0 1-1.75 1.75H6.15a1.75 1.75 0 0 1-1.75-1.75V5.95A1.75 1.75 0 0 1 6.15 4.2Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.25 9.35h9.5L15.7 6.7H8.3L7.25 9.35Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12.45h8M8 15.35h4.45" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        <path d="m14.65 16.25 1.25 1.25 2.15-2.45" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
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
        <path d="M7 3.8h6.35L18 8.45V19a1.6 1.6 0 0 1-1.6 1.6H7A1.6 1.6 0 0 1 5.4 19V5.4A1.6 1.6 0 0 1 7 3.8Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.35 3.8v4.65H18" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.5 17.15v-5.2M9.35 14.1l2.15-2.15 2.15 2.15" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
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
  onClose
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

  const transitionOptions = useMemo(
    () => ({
      glassRingTilt: "right",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    }),
    []
  );

  const navigateTo = useCallback(
    path => {
      const shouldRestoreWorkspace = !String(path || "").startsWith("/vestlus");
      if (shouldRestoreWorkspace && typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
            JSON.stringify({ ts: Date.now() })
          );
        } catch {}
      }
      onClose?.();
      pushWithTransition(router, localizePath(path, locale), transitionOptions);
    },
    [locale, onClose, router, transitionOptions]
  );

  const openHelpPanel = useCallback(
    panelKey => {
      onClose?.();
      if (typeof window === "undefined") return;
      window.requestAnimationFrame(() => {
        try {
          window.dispatchEvent(
            new CustomEvent("sotsiaalai:open-help-listings", {
              detail: { panelKey, source: "workspace" }
            })
          );
        } catch {}
      });
    },
    [onClose]
  );

  const openInvite = useCallback(() => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      try {
        window.dispatchEvent(
          new CustomEvent("sotsiaalai:open-invite", {
            detail: { source: "workspace" }
          })
        );
      } catch {}
    });
  }, []);

  useEffect(() => {
    setDashboardRole(defaultDashboardRole);
  }, [defaultDashboardRole]);

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
          : [[
              makeCard({
                key: "document_drafting",
                icon: "compose",
                title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
                meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tooruum"),
                onClick: () => navigateTo("/dokreziim")
              }, { requiresPaid: true })
            ]]),
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
          makeCard({
            key: "add_person",
            icon: "invite",
            title: text(t, "chat.workspace.cards.add_person.title", "Kutsed"),
            meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
            onClick: openInvite
          }, { requiresPaid: true })
        ],
        ...(!isClientView
          ? [[
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
            ]]
          : []),
        [serviceMapCard]
      ];

  return (
    <section
      className={styles.panel}
      role="region"
      aria-labelledby="chat-workspace-title"
    >
      <BackButton
        onClick={onClose}
        ariaLabel={text(t, "buttons.back_previous", "Tagasi")}
        holdPressedVisualDisabled
        className={cn(glassPageBackTopLeftClassName, styles.backButton)}
      />
      {isAdmin ? (
        <div className={styles.roleMenu}>
          <WorkspaceRoleCycleButton
            t={t}
            value={dashboardRole}
            onChange={nextRole => setDashboardRole(normalizeDashboardRole(nextRole))}
            ariaLabel={text(t, "chat.workspace.view_role.label", "Töölaua vaade")}
          />
        </div>
      ) : null}
      <header className={styles.titleWrap}>
        <h1 id="chat-workspace-title" className={cn(glassPageTitleClassName, styles.title)}>
          {text(t, "chat.workspace.title", "Töölaud")}
        </h1>
      </header>

      <div className={styles.grid}>
        {cardRows.map((row, index) => (
          <div
            key={`row-${index + 1}`}
            className={cn(styles.row, row.length === 1 && styles.rowSingle)}
          >
            {row.map(card => (
              <button
                key={card.key}
                type="button"
                className={cn(styles.card, styles[`card_${card.key}`], card.disabled && styles.cardDisabled)}
                onClick={card.disabled ? undefined : card.onClick}
                disabled={card.disabled}
                aria-disabled={card.disabled ? "true" : "false"}
              >
                <span className={styles.cardIcon} aria-hidden="true">
                  <DashboardCardIcon type={card.icon} />
                </span>
                <span className={styles.cardCopy}>
                  <span className={styles.cardTitle}>{card.title}</span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
