"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import {
  glassPageBackTopLeftClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import styles from "./WorkspacePanel.module.css";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";

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
  if (type === "room") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M6.8 14h4.8c1.9 0 3.35.9 3.9 2.35.45 1.15.35 2.25.18 3.05-.45 1.8-2.6 2.35-6.48 2.35s-6.03-.55-6.48-2.35c-.17-.8-.27-1.9.18-3.05C3.45 14.9 4.9 14 6.8 14Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.2" cy="6.7" r="3.65" stroke="currentColor" strokeWidth="1.55" />
        <path d="M21.1 18.9v-1.7c0-1.55-1.35-2.9-3.3-3.3M15.3 3.9a3.2 3.2 0 0 1-.08 6.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "materials") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M7.1 4.1h6.3l3.5 3.5v10.8a1.5 1.5 0 0 1-1.5 1.5H7.1a1.5 1.5 0 0 1-1.5-1.5V5.6a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.4 4.1v3.5h3.5M11.2 16.1V10.6M8.95 12.85l2.25-2.25 2.25 2.25" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M8.3 14.15h7.4c2.25 0 4.05 1.8 4.05 4.05v.35c0 1.2-.97 2.17-2.17 2.17H6.42c-1.2 0-2.17-.97-2.17-2.17v-.35c0-2.25 1.8-4.05 4.05-4.05Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7.55" r="4.15" stroke="currentColor" strokeWidth="1.55" />
      <path d="M17.6 7.35h3M19.1 5.85v3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function text(t, key, fallback) {
  return typeof t === "function" ? t(key, fallback) : fallback;
}

export default function WorkspacePanel({
  t,
  locale = "et",
  userRole = "",
  userActualRole = "",
  isAdmin = false,
  onClose
}) {
  const router = useRouter();

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
    if (typeof window === "undefined") return undefined;
    const onKeyDown = event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const providerRole =
    String(userActualRole || userRole || "").trim().toUpperCase() === "SERVICE_PROVIDER";
  const canUseServiceProfile = Boolean(isAdmin || providerRole);

  const cards = [
    {
      key: "documents",
      icon: "document",
      title: text(t, "chat.workspace.cards.documents.title", "Dokumendid"),
      meta: text(t, "chat.workspace.cards.documents.meta", "Teek"),
      onClick: () => navigateTo("/documents")
    },
    {
      key: "document_drafting",
      icon: "compose",
      title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
      meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tööruum"),
      onClick: () => navigateTo("/dokreziim")
    },
    {
      key: "pre_inquiries",
      icon: "compose",
      title: text(t, "chat.workspace.cards.pre_inquiries.title", "Eelpöördumine"),
      meta: text(t, "chat.workspace.cards.pre_inquiries.meta", "Pöördumise mustand"),
      onClick: () => navigateTo("/eelpoordumised")
    },
    {
      key: "help_requests",
      icon: "help-request",
      title: text(t, "chat.workspace.cards.help_requests.title", "Abisoovid"),
      meta: text(t, "chat.workspace.cards.help_requests.meta", "Kuulutused"),
      onClick: () => openHelpPanel("help_requests")
    },
    {
      key: "help_offers",
      icon: "help-offer",
      title: text(t, "chat.workspace.cards.help_offers.title", "Abipakkumised"),
      meta: text(t, "chat.workspace.cards.help_offers.meta", "Pakkumised"),
      onClick: () => openHelpPanel("help_offers")
    },
    {
      key: "add_person",
      icon: "invite",
      title: text(t, "chat.workspace.cards.add_person.title", text(t, "nav.add_person", "Lisa inimene")),
      meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
      onClick: openInvite
    },
    {
      key: "service_map",
      icon: "map",
      title: text(t, "chat.workspace.cards.service_map.title", "Teenusekaart"),
      meta: text(t, "chat.workspace.cards.service_map.meta", "Kaardivaade"),
      onClick: () => navigateTo("/teenusekaart")
    },
    {
      key: "kovision",
      icon: "room",
      title: text(t, "chat.workspace.cards.kovision.title", "Kovisioon"),
      meta: text(t, "chat.workspace.cards.kovision.meta", "Ruumid"),
      onClick: () => navigateTo("/ruum")
    },
    {
      key: "materials",
      icon: "materials",
      title: text(t, "chat.workspace.cards.materials.title", "Materjalide lisamine"),
      meta: text(t, "chat.workspace.cards.materials.meta", "Andmebaas"),
      onClick: () => navigateTo("/materjalid")
    },
    ...(canUseServiceProfile
      ? [{
          key: "service_profile",
          icon: "profile",
          title: text(t, "chat.workspace.cards.service_profile.title", "Teenuseprofiil"),
          meta: text(t, "chat.workspace.cards.service_profile.meta_provider", "Teenuseosutaja"),
          onClick: () => navigateTo("/teenuseprofiil")
        }]
      : [])
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
      <header className={styles.titleWrap}>
        <h1 id="chat-workspace-title" className={cn(glassPageTitleClassName, styles.title)}>
          {text(t, "chat.workspace.title", "Töölaud")}
        </h1>
      </header>

      <div className={styles.grid}>
        {cards.map(card => (
          <button
            key={card.key}
            type="button"
            className={cn(styles.card, styles[`card_${card.key}`])}
            onClick={card.onClick}
          >
            <span className={styles.cardIcon} aria-hidden="true">
              <DashboardCardIcon type={card.icon} />
            </span>
            <span className={styles.cardCopy}>
              <span className={styles.cardTitle}>{card.title}</span>
              <span className={styles.cardMeta}>{card.meta}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
