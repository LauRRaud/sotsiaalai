"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BorderGlow from "@/components/ui/BorderGlow";
import Button from "@/components/ui/Button";
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import GlowField, { fieldEdgeGlowStyle } from "@/components/ui/GlowField";
import Modal from "@/components/ui/Modal";
import OptionCard from "@/components/ui/OptionCard";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";
import {
  glassFormInputBaseClassName,
  glassSubpageCardClassName,
  glassSubpageContentWideClassName,
  glassSubpagePanelWideClassName,
  glassSubpageSurfaceScopeClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName,
} from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
const inviteLinkClassName =
  "font-[inherit] no-underline text-[color:var(--link-gold)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)]";

function parseEmails(raw) {
  if (!raw) return [];
  const list = String(raw)
    .split(/[,;\n\r]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(list)];
}
function formatEuroAmount(amount, locale = "et") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${Number(amount || 0).toFixed(2)} EUR`;
  }
}

const INVITE_TILT_CLOSE_MS = 540;
const sponsoredCheckoutDisabled = ["false", "0", "off"].includes(
  String(process.env.NEXT_PUBLIC_SPONSORED_INVITE_CHECKOUT_OPEN || "false")
    .trim()
    .toLowerCase(),
);
const inviteFieldInputClassName =
  `${glassFormInputBaseClassName} text-[1.28rem] tracking-[0.02em] placeholder:text-[1.12rem] placeholder:tracking-[0.02em] ` +
  "duration-[720ms] max-[768px]:text-[1.34rem] max-[768px]:tracking-[0.024em] max-[768px]:placeholder:text-[1.2rem] max-[768px]:placeholder:tracking-[0.022em] max-[768px]:min-h-[3.2rem] max-[768px]:py-[0.84rem]";
const inviteFieldGlowClassName =
  "invite-glow-field ui-glow-field service-map-toolbar__glow-field " +
  "[--input-bg:var(--workspace-elevated-card-bg)] " +
  "[--input-bg-hover:var(--workspace-elevated-card-bg)] " +
  "[--input-bg-focus:var(--workspace-elevated-card-bg)] " +
  "[--input-flat-bg:var(--workspace-elevated-card-bg)] " +
  "[--input-flat-bg-hover:var(--workspace-elevated-card-bg)] " +
  "[--opaque-panel-bg:var(--workspace-elevated-card-bg)] " +
  "[--opaque-panel-bg-hover:var(--workspace-elevated-card-bg)]";

function InviteGlowPanel({ children, className = "" }) {
  return (
    <BorderGlow
      className={`invite-glow-panel ${className}`.trim()}
      edgeSensitivity={24}
      glowColor="358 82 72"
      backgroundColor="var(--subpage-card-bg, #120F17)"
      borderRadius={16}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      edgeOnly
      style={fieldEdgeGlowStyle}
    >
      {children}
    </BorderGlow>
  );
}

export default function InviteModal({ embedded = false, onBack = null, hideHeader = false } = {}) {
  const { data: session } = useSession();
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(embedded);
  const [openSource, setOpenSource] = useState(embedded ? "workspace" : "");
  const [roomId, setRoomId] = useState(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [hostDisplayName, setHostDisplayName] = useState("");
  const [emails, setEmails] = useState("");
  const [paymentMode, setPaymentMode] = useState("SELF_PAID");
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [targetRole, setTargetRole] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [sponsoredCheckoutAgreed, setSponsoredCheckoutAgreed] = useState(false);
  const closeTimerRef = useRef(null);
  const formatSentenceCase = (text) => {
    const raw = typeof text === "string" ? text.trim() : "";
    if (!raw) return text;
    if (raw !== raw.toUpperCase()) return text;
    const lower = raw.toLocaleLowerCase(locale || "et");
    return `${lower.charAt(0).toLocaleUpperCase(locale || "et")}${lower.slice(1)}`;
  };
  const sendLabel = formatSentenceCase(t("invite.send"));
  const sponsoredSelected = paymentMode === "SPONSORED_BY_HOST";
  const isWorkspaceReturn = embedded || openSource === "workspace";
  const inviteDesktopSizeClassName = isWorkspaceReturn
    ? "min-[769px]:!min-h-0"
    : "!h-[min(calc(100dvh-1.25rem),clamp(36rem,82vh,52rem))] !min-h-0 !max-h-[calc(100dvh-1.25rem)]";
  const inviteHeaderTitle = t("invite.eyebrow");
  const standaloneMobileSurfaceClassName = isWorkspaceReturn
    ? ""
    : "max-[768px]:!max-w-none max-[768px]:mx-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] " +
      "max-[768px]:!w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] " +
      "max-[768px]:rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] " +
      "max-[768px]:px-[var(--glass-ring-pad-x,clamp(calc(1.8*var(--base-rem)),5vw,calc(3.2*var(--base-rem))))] " +
      "max-[768px]:pt-[var(--glass-ring-pad-top,clamp(calc(0.4*var(--base-rem)),1.4vh,calc(1.1*var(--base-rem))))] " +
      "max-[768px]:pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)]";
  const inviteModalContentClassName =
    `invite-modal-content person-invite-modal-content mobile-keep-desktop-glass-cards mx-auto ${isWorkspaceReturn ? workspaceGuidePanelClassName : "glass-subpage-surface !w-[min(calc(100vw-2rem),clamp(36rem,76vw,48rem))] !max-w-[min(calc(100vw-2rem),clamp(36rem,76vw,48rem))]"} relative !max-h-none !overflow-hidden ` +
    `!flex min-h-0 ${inviteDesktopSizeClassName} !flex-col overscroll-contain [-webkit-overflow-scrolling:touch] ` +
    `${isWorkspaceReturn ? "" : "pt-[0.35rem] !pb-[1rem]"} text-[1.12rem] leading-[1.35] tracking-[0.03rem] max-[768px]:text-[1.18rem] max-[768px]:leading-[1.4] ` +
    `[--glass-modal-bg:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] ` +
    `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
    `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] shadow-[var(--glass-shell-shadow,none)] ` +
    `${isWorkspaceReturn ? "" : glassSubpageSurfaceScopeClassName} ` +
    `${standaloneMobileSurfaceClassName} ` +
    `${isWorkspaceReturn ? "invite-modal-content--workspace " : ""}` +
    `${embedded ? "invite-modal-content--embedded " : ""}` +
    `${closing ? `pointer-events-none ${isWorkspaceReturn ? "" : "motion-safe:animate-[glassRingTiltFromLeft_540ms_cubic-bezier(0.42,0,0.58,1)_both]"}` : ""}`;
  const inviteModalBodyClassName =
    `${isWorkspaceReturn ? workspaceGuidePanelScrollClassName : glassSubpageContentWideClassName} invite-modal-scroll flex min-h-0 flex-1 flex-col gap-[1.14rem] overflow-x-hidden overflow-y-visible overscroll-contain ${isWorkspaceReturn ? "" : "px-[0.78rem] pt-[0.98rem] pb-[0.5rem]"} max-[768px]:gap-[1.05rem] max-[768px]:px-[0.05rem]`;
  const inviteFormClassName = `mx-auto grid w-full max-w-[36rem] gap-[1.08rem] max-[768px]:max-w-[23rem] max-[768px]:gap-[1rem] ${
    sponsoredSelected ? "pb-[1.6rem] max-[768px]:pb-[1.25rem]" : ""
  }`;
  const inviteFieldWrapClassName =
    "invite-field-hole-target mx-auto w-full max-w-[36rem] max-[768px]:max-w-[23rem] rounded-[999px]";
  const mobileInviteInputClassName = inviteFieldInputClassName;
  const inviteInputClassName =
    `${mobileInviteInputClassName} ` +
    "text-[color:var(--input-text)] light:text-[#17212b] light:placeholder:text-[#3b4a59] [.theme-mid_&]:text-[#263343] [.theme-mid_&]:placeholder:text-[#4a5a6b] hc:text-[color:var(--hc-accent)] hc:placeholder:text-[color:var(--hc-accent)]";
  const invitePrimaryButtonClassName =
    "!min-h-[3.05rem] !px-[1.15rem] !py-[0.78rem] !text-[1.12rem] !tracking-[0.03rem] " +
    "max-[768px]:!min-h-[3.2rem] max-[768px]:!text-[1.18rem]";
  const sponsoredAmount = Number(process.env.NEXT_PUBLIC_INVITE_SPONSORED_AMOUNT || 4);
  const sponsoredAmountLabel = formatEuroAmount(
    Number.isFinite(sponsoredAmount) && sponsoredAmount > 0 ? sponsoredAmount : 4,
    locale,
  );
  const sponsoredRoleOptions = [
    {
      value: "SOCIAL_WORKER",
      label: `${t("invite.sponsored.role.worker")} - ${sponsoredAmountLabel}`,
    },
    {
      value: "CLIENT",
      label: `${t("invite.sponsored.role.client")} - ${sponsoredAmountLabel}`,
    },
  ];
  const inviteOptionButtonClassName = primarySegmentedButtonClassName;
  const inviteRefreshButtonClassName =
    "!min-h-[2.22rem] !px-[0.98rem] !py-[0.28rem] !text-[1.12rem] !tracking-[0.026em] max-[768px]:!min-h-[2.2rem] max-[768px]:!w-auto max-[768px]:!min-w-[7rem] max-[768px]:!justify-center max-[768px]:!self-center max-[768px]:!px-[0.78rem] max-[768px]:!py-[0.2rem] max-[768px]:!text-[1.03rem] max-[768px]:!tracking-[0.024em]";
  const inviteSponsorToggleClassName =
    "!inline-flex !w-fit !justify-center !justify-self-center !self-center !mt-[0.56rem] !min-h-[2.72rem] !rounded-[1.6rem] !px-[1.05rem] !py-[0.64rem] !text-[1.06rem] !leading-[1.2] " +
    "[--seg-control-size:1.42rem] [--seg-check-size:1.1rem] " +
    "[&>span.shrink-0]:-translate-y-[0.08rem] " +
    `${inviteOptionButtonClassName} ` +
    "max-[768px]:!mt-[0.58rem] max-[768px]:!min-h-[2.9rem] max-[768px]:!rounded-[1.45rem] max-[768px]:!text-[1.12rem]";
  const inviteRoleCardClassName =
    "!w-[min(100%,18.2rem)] !max-w-none !mx-auto !min-h-[2.88rem] !justify-center !rounded-[1.55rem] !px-[1.15rem] !py-[0.66rem] !text-[1.12rem] !leading-[1.2] text-center max-[768px]:!w-[min(100%,18.2rem)] max-[768px]:!max-w-none max-[768px]:!rounded-[1.45rem] max-[768px]:!text-[1.16rem] max-[768px]:!px-[1rem] " +
    `[&>span:last-child]:justify-center [&>span:last-child]:text-center [&>span:last-child]:[text-wrap:balance] ` +
    inviteOptionButtonClassName;
  const inviteSponsoredUnifiedPanelClassName =
    `${glassSubpagePanelWideClassName} px-[0.35rem] py-[0.15rem] ` +
    "text-[color:var(--pt-120)] max-[768px]:max-w-none max-[768px]:px-0 max-[768px]:py-0";
  const inviteSponsoredCardBodyClassName =
    "grid gap-[0.68rem] pt-[0.95rem] text-[color:var(--pt-150)] light:text-[color:var(--input-text)]";
  const inviteSponsoredSectionTitleClassName =
    "m-0 mb-[0.58rem] text-center text-[1.16rem] font-[500] tracking-[0.006em] leading-[1.34] text-[color:var(--glass-modal-text)] max-[768px]:mb-[0.68rem] max-[768px]:text-[1.12rem]";
  const inviteSponsoredDividerClassName =
    "mt-[0.9rem] mb-[0.15rem] h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.16)_12%,rgba(255,255,255,0.16)_88%,rgba(255,255,255,0)_100%)] [.theme-light_&]:bg-[linear-gradient(90deg,rgba(122,58,56,0)_0%,rgba(122,58,56,0.12)_12%,rgba(122,58,56,0.12)_88%,rgba(122,58,56,0)_100%)]";
  const inviteSponsoredCheckboxClassName =
    "fancy-checkbox--otp fancy-checkbox--multiline w-full justify-start " +
    "[--otp-check-shape:var(--glass-modal-text,var(--pt-150))] [--otp-check-tick:var(--title-color,var(--brand-primary))] [--otp-check-text:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
    "hc:[--otp-check-shape:var(--hc-accent)] hc:[--otp-check-tick:var(--hc-accent)] hc:[--otp-check-text:var(--hc-accent)] " +
    "[--otp-check-box-size:1.78rem] [--otp-check-font-size:1.08rem] [--otp-check-line-height:1.5] [--otp-check-text-max-width:min(100%,30rem)] [--otp-check-box-offset:0.08rem] " +
    "[&_.box]:translate-y-[-0.08rem] min-[769px]:ml-[0.9rem] min-[769px]:[--otp-check-text-max-width:min(100%,24rem)]";
  const inviteSponsoredCheckoutFooterClassName =
    "mt-[0.95rem] pt-[0.05rem] flex justify-center max-[768px]:mt-[0.88rem]";
  const inviteSponsoredToggleCardClassName =
    inviteSponsorToggleClassName;
  const inviteEmailsRequiredError = error === t("invite.error.emails_required");
  const inviteEmailInputClassName = `${inviteInputClassName} ${
    inviteEmailsRequiredError
      ? "[--input-border:1px_solid_rgba(208,116,108,0.28)] light:[--input-border:1px_solid_rgba(185,89,82,0.24)] [.theme-mid_&]:[--input-border:1px_solid_rgba(166,94,89,0.24)] [.theme-night_&]:[--input-border:1px_solid_rgba(232,190,190,0.24)] hc:[--input-border:1px_solid_var(--hc-accent)]"
      : ""
  }`;
  const inviteFieldErrorClassName =
    "mt-[0.48rem] px-[0.12rem] text-left text-[0.94rem] leading-[1.35] tracking-[0.006em] " +
    "text-[rgba(255,223,218,0.94)] light:text-[#b2615d] [.theme-mid_&]:text-[#a65e59] [.theme-night_&]:text-[rgba(232,190,190,0.92)] hc:text-[color:var(--hc-accent)]";
  const inviteNoticeBaseClassName =
    "pointer-events-none absolute left-1/2 bottom-[calc(100%+0.7rem)] z-[3] -translate-x-1/2 " +
    "w-fit max-w-[min(32rem,calc(100%-1rem))] whitespace-normal text-center rounded-full border " +
    "px-[1rem] py-[0.54rem] text-[0.98rem] leading-[1.28] shadow-[0_8px_18px_rgba(15,23,42,0.1)] " +
    "backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)] max-[768px]:max-w-[min(92vw,24rem)]";
  const inviteErrorNoticeClassName =
    `${inviteNoticeBaseClassName} ` +
    "border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] text-[rgba(255,223,218,0.96)] " +
    "[.theme-night_&]:border-[rgba(130,176,228,0.2)] [.theme-night_&]:bg-[rgba(12,20,34,0.84)] [.theme-night_&]:text-[rgba(226,238,255,0.94)] " +
    "light:border-[rgba(185,89,82,0.18)] light:bg-[rgba(255,249,248,0.94)] light:text-[#b2615d] " +
    "[.theme-mid_&]:border-[rgba(132,72,68,0.18)] [.theme-mid_&]:bg-[rgba(251,242,239,0.9)] [.theme-mid_&]:text-[#a65e59]";
  const inviteSuccessNoticeClassName =
    `${inviteNoticeBaseClassName} ` +
    "border-[rgba(88,148,118,0.22)] bg-[rgba(18,44,34,0.82)] text-[rgba(223,246,236,0.96)] " +
    "[.theme-night_&]:border-[rgba(104,178,154,0.2)] [.theme-night_&]:bg-[rgba(10,28,26,0.84)] [.theme-night_&]:text-[rgba(220,245,236,0.95)] " +
    "light:border-[rgba(88,148,118,0.18)] light:bg-[rgba(247,252,249,0.94)] light:text-[#4d7b67] " +
    "[.theme-mid_&]:border-[rgba(100,136,114,0.2)] [.theme-mid_&]:bg-[rgba(246,250,247,0.9)] [.theme-mid_&]:text-[#537563]";
  const inviteListCardClassName =
    `${sponsoredSelected ? "mt-[1.25rem] max-[768px]:mt-[0.9rem]" : "mt-[1.45rem] max-[768px]:mt-[1rem]"} mx-auto w-full max-w-[36rem] max-[768px]:max-w-[23rem] rounded-[1rem] px-[0.92rem] py-[0.82rem] max-[768px]:px-[0.86rem] max-[768px]:py-[0.78rem] text-[color:var(--pt-120)] ` +
    "[color:var(--subpage-card-text)] shadow-[var(--subpage-card-shadow)]";
  const inviteListRowClassName =
    `invite-list-row grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem] ` +
    `max-[768px]:grid-cols-1 max-[768px]:gap-[0.52rem] max-[768px]:rounded-[0.92rem] max-[768px]:p-[0.78rem] ${glassSubpageCardClassName}`;
  const inviteCheckoutAgreementReplacements = useMemo(
    () => ({
      terms: {
        open: `<a href="${localizePath("/kasutustingimused", locale)}" class="${inviteLinkClassName}">`,
        close: "</a>",
      },
      privacy: {
        open: `<a href="${localizePath("/privaatsustingimused", locale)}" class="${inviteLinkClassName}">`,
        close: "</a>",
      },
    }),
    [locale],
  );
  useEffect(() => {
    if (embedded) return undefined;
    const handler = (e) => {
      setRoomId(e?.detail?.roomId || null);
      setOpenSource(String(e?.detail?.source || "").trim().toLowerCase());
      if (closeTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setClosing(false);
      setOpen(true);
    };
    window.addEventListener("sotsiaalai:open-invite", handler);
    return () => window.removeEventListener("sotsiaalai:open-invite", handler);
  }, [embedded]);
  useEffect(() => {
    if (embedded) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const invitePayment = String(params.get("invitePayment") || "")
      .trim()
      .toLowerCase();
    if (!invitePayment) return;
    setOpen(true);
    setOpenSource("");
    setRoomId(params.get("roomId") || null);
    if (invitePayment === "success") {
      setMessage(t("invite.sponsored.payment_success"));
      setError("");
    } else if (invitePayment === "canceled") {
      setError(t("invite.sponsored.payment_canceled"));
      setMessage("");
    } else if (invitePayment === "failed") {
      setError(t("invite.sponsored.payment_failed"));
      setMessage("");
    }
  }, [embedded, t]);
  useEffect(() => {
    if (open && !roomId) {
      setRoomTitle("");
      setHostDisplayName("");
    }
  }, [open, roomId]);
  useEffect(() => {
    if (paymentMode !== "SPONSORED_BY_HOST") {
      setTargetRole(null);
      setSponsoredCheckoutAgreed(false);
    }
  }, [paymentMode]);
  useEffect(() => {
    if (embedded) return undefined;
    const root = document.documentElement;
    document.body.classList.toggle("modal-open", open);
    root.classList.toggle("modal-open", open);
    document.body.classList.toggle("invite-modal-open", open);
    root.classList.toggle("invite-modal-open", open);
    return () => {
      document.body.classList.remove("modal-open");
      root.classList.remove("modal-open");
      document.body.classList.remove("invite-modal-open");
      root.classList.remove("invite-modal-open");
    };
  }, [embedded, open]);
  useEffect(() => {
    return () => {
      if (closeTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);
  const shouldReduceMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      if (document?.documentElement?.dataset?.reduceMotion === "1") return true;
      return Boolean(
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
      );
    } catch {
      return false;
    }
  }, []);
  const handleClose = useCallback(() => {
    if (embedded) {
      onBack?.();
      return;
    }
    const shouldReturnToWorkspace = isWorkspaceReturn;
    const restoreWorkspace = () => {
      if (!shouldReturnToWorkspace || typeof window === "undefined") return;
      try {
        window.dispatchEvent(new CustomEvent("sotsiaalai:restore-workspace-from-modal", {
          detail: { source: "invite" }
        }));
      } catch {}
    };
    if (closeTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (shouldReduceMotion()) {
      setClosing(false);
      setOpen(false);
      setOpenSource("");
      restoreWorkspace();
      return;
    }
    if (shouldReturnToWorkspace) {
      setClosing(false);
      setOpen(false);
      setOpenSource("");
      restoreWorkspace();
      return;
    }
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      setOpen(false);
      setOpenSource("");
      closeTimerRef.current = null;
      restoreWorkspace();
    }, INVITE_TILT_CLOSE_MS);
  }, [embedded, isWorkspaceReturn, onBack, shouldReduceMotion]);
  const loadInvites = useCallback(async () => {
    if (!roomId) {
      setInvites([]);
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    try {
      const url = new URL("/api/invites", window.location.origin);
      if (roomId) url.searchParams.set("room_id", roomId);
      const res = await fetch(url.toString());
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.invites) {
        setInvites(data.invites);
      }
    } catch (err) {
      console.error("invite list", err);
    } finally {
      setLoadingList(false);
    }
  }, [roomId]);
  useEffect(() => {
    if (open) loadInvites();
  }, [open, roomId, loadInvites]);
  const emailsParsed = useMemo(() => parseEmails(emails), [emails]);
  const multipleEmailsForSponsored = emailsParsed.length > 1;
  const startSponsoredFlow = useCallback(() => {
    setError("");
    setMessage("");
    if (multipleEmailsForSponsored) {
      setError(t("invite.error.sponsored_single_email_required"));
      return;
    }
    setTargetRole(null);
    setSponsoredCheckoutAgreed(false);
    setPaymentMode("SPONSORED_BY_HOST");
  }, [multipleEmailsForSponsored, t]);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const parsed = emailsParsed;
    if (!parsed.length) {
      setError(t("invite.error.emails_required"));
      return;
    }
    const trimmedRoomTitle = roomTitle.trim();
    const trimmedHostName = hostDisplayName.trim();
    if (!roomId && !trimmedRoomTitle) {
      setError(t("invite.room_title_required"));
      return;
    }
    if (!roomId && !trimmedHostName) {
      setError(t("invite.host_name_required"));
      return;
    }
    if (paymentMode === "SPONSORED_BY_HOST" && parsed.length !== 1) {
      setError(t("invite.error.sponsored_single_email_required"));
      return;
    }
    if (paymentMode === "SPONSORED_BY_HOST" && !targetRole) {
      setError(t("invite.error.sponsor_plan_required"));
      return;
    }
    if (paymentMode === "SPONSORED_BY_HOST" && sponsoredCheckoutDisabled) {
      setError(t("invite.error.checkout_temporarily_disabled"));
      return;
    }
    if (paymentMode === "SPONSORED_BY_HOST" && !sponsoredCheckoutAgreed) {
      setError(t("invite.error.checkout_terms_required"));
      return;
    }
    setBusy(true);
    try {
      if (paymentMode === "SPONSORED_BY_HOST") {
        const res = await fetch("/api/invites/sponsored/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emails: parsed,
            lang: locale,
            payment_mode: paymentMode,
            room_id: roomId || undefined,
            room_title: trimmedRoomTitle || undefined,
            host_display_name: !roomId
              ? trimmedHostName || undefined
              : undefined,
            targetRole,
            acceptedTerms: sponsoredCheckoutAgreed,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(
            resolveApiMessage({
              payload: data,
              t,
              fallbackKey: "invite.send_failed",
            }),
          );
        }
        const checkoutUrl =
          typeof data?.checkoutUrl === "string" ? data.checkoutUrl.trim() : "";
        if (!checkoutUrl) {
          throw new Error(t("subscription.error.payment_start"));
        }
        if (!roomId && data?.roomId) {
          setRoomId(data.roomId);
        }
        setMessage(t("subscription.payment.redirect_demo"));
        if (typeof window !== "undefined") {
          window.location.assign(checkoutUrl);
        }
        return;
      }

      const res = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: parsed,
          lang: locale,
          payment_mode: paymentMode || undefined,
          room_id: roomId || undefined,
          room_title: trimmedRoomTitle || undefined,
          host_display_name: !roomId ? trimmedHostName || undefined : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(
          resolveApiMessage({
            payload: data,
            t,
            fallbackKey: "invite.send_failed",
          }),
        );
      }
      setMessage(t("invite.success"));
      setEmails("");
      if (!roomId && data?.roomId) {
        setRoomId(data.roomId);
      }
      loadInvites();
    } catch (err) {
      setError(err?.message || t("invite.send_failed"));
    } finally {
      setBusy(false);
    }
  }
  async function action(id, kind) {
    try {
      const url =
        kind === "resend"
          ? `/api/invites/${id}/resend`
          : `/api/invites/${id}/revoke`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(
          resolveApiMessage({
            payload: data,
            t,
            fallbackKey: "invite.error_generic",
          }),
        );
      }
      await loadInvites();
    } catch (err) {
      setError(err?.message || t("invite.action_failed"));
    }
  }
  function formatStatus(inv) {
    if (inv.status === "ACCEPTED" && inv.acceptedBillingSource) {
      return inv.acceptedBillingSource === "SELF"
        ? t("invite.status.accepted_self")
        : t("invite.status.accepted_sponsored");
    }
    return inv.status;
  }
  if (!open) return null;
  const content = (
    <div className={inviteModalContentClassName}>
      {!hideHeader ? (
        <GlassSubpageHeader
          onBack={handleClose}
          backAriaLabel={t("buttons.back")}
          titleAs="h2"
          backClassName="!z-[145]"
          titleWrapClassName={isWorkspaceReturn ? "invite-workspace-title-wrap" : undefined}
          rightSlot={
            <DashboardInfoTrigger
              infoId="invites"
              title={inviteHeaderTitle}
              className={`${dashboardInfoTriggerCornerClassName} !z-[146]`}
            />
          }
        >
          {inviteHeaderTitle}
        </GlassSubpageHeader>
      ) : null}

      <div className={inviteModalBodyClassName}>
        {!session?.user?.id ? (
          <div className="grid gap-[1rem]">
            <p>{t("invite.login_required")}</p>
          </div>
        ) : (
          <form className={inviteFormClassName} onSubmit={submit}>
            {!roomId ? (
              <>
                <div className={inviteFieldWrapClassName}>
                  <GlowField className={inviteFieldGlowClassName}>
                    <input
                      id="invite-room-title"
                      value={roomTitle}
                      onChange={(e) => setRoomTitle(e.target.value)}
                      disabled={busy}
                      placeholder={t("invite.room_title")}
                      aria-label={t("invite.room_title")}
                      className={`${inviteInputClassName} ui-glow-control`}
                    />
                  </GlowField>
                </div>
                <div className={inviteFieldWrapClassName}>
                  <GlowField className={inviteFieldGlowClassName}>
                    <input
                      id="invite-host-name"
                      value={hostDisplayName}
                      onChange={(e) => setHostDisplayName(e.target.value)}
                      disabled={busy}
                      placeholder={t("invite.host_name_ph")}
                      aria-label={t("invite.host_name")}
                      className={`${inviteInputClassName} ui-glow-control`}
                    />
                  </GlowField>
                </div>
              </>
            ) : null}
            <div className={inviteFieldWrapClassName}>
              <GlowField className={inviteFieldGlowClassName}>
                <input
                  id="invite-emails"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder={t("invite.classic.emails_ph")}
                  aria-label={t("invite.classic.emails")}
                  aria-invalid={inviteEmailsRequiredError ? "true" : undefined}
                  aria-describedby={inviteEmailsRequiredError ? "invite-emails-error" : undefined}
                  disabled={busy}
                  className={`${inviteEmailInputClassName} ui-glow-control`}
                />
              </GlowField>
              {inviteEmailsRequiredError ? (
                <p id="invite-emails-error" className={inviteFieldErrorClassName}>
                  {t("invite.error.emails_required")}
                </p>
              ) : null}
            </div>
            <div className="grid gap-[0.7rem]">
              <OptionCard
                type="checkbox"
                name="sponsoredInvite"
                value="SPONSORED_BY_HOST"
                checked={sponsoredSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    startSponsoredFlow();
                    return;
                  }
                  setError("");
                  setMessage("");
                  setPaymentMode("SELF_PAID");
                  }}
                  disabled={busy}
                  className={inviteSponsoredToggleCardClassName}
                  fitTextLines={3}
                >
                <span className="text-center [text-wrap:balance]">
                  {t("invite.pay.host")}
                </span>
              </OptionCard>

              {sponsoredSelected ? (
                <div
                  id="invite-sponsored-panel"
                  className={inviteSponsoredUnifiedPanelClassName}
                >
                  <div className={inviteSponsoredCardBodyClassName}>
                    <div className="grid gap-[1.04rem] mt-[0.2rem]">
                      {sponsoredRoleOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          type="radio"
                          name="targetRole"
                          value={option.value}
                          checked={targetRole === option.value}
                          onChange={(e) => setTargetRole(e.target.value)}
                          disabled={busy}
                          className={inviteRoleCardClassName}
                          fitTextLines={2}
                        >
                          <span className="text-center [text-wrap:balance]">
                            {option.label}
                          </span>
                        </OptionCard>
                      ))}
                    </div>
                    <div className={inviteSponsoredDividerClassName} />
                    <div className="grid gap-[0.28rem] pt-[0.08rem]">
                      <p className={inviteSponsoredSectionTitleClassName}>
                        {t("invite.sponsored.checkout.title")}
                      </p>
                      <div className="flex">
                        <FancyCheckbox
                          id="invite-sponsored-consent"
                          name="inviteSponsoredConsent"
                          checked={sponsoredCheckoutAgreed}
                          disabled={busy}
                          onChange={(next) => setSponsoredCheckoutAgreed(next)}
                          label={
                            <RichText
                              as="span"
                              value={t("invite.sponsored.checkout.agreement")}
                              replacements={inviteCheckoutAgreementReplacements}
                              className="block"
                            />
                          }
                          className={inviteSponsoredCheckboxClassName}
                        />
                      </div>
                      <div className={inviteSponsoredCheckoutFooterClassName}>
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          className={`${invitePrimaryButtonClassName} invite-primary-btn`}
                          disabled={sponsoredCheckoutDisabled || busy || !targetRole || !sponsoredCheckoutAgreed}
                        >
                          {busy
                            ? t("invite.sending")
                            : t("invite.sponsored.confirm_and_pay")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {((error && !inviteEmailsRequiredError) || message || !sponsoredSelected) ? (
              <div className="relative mt-[0.72rem] mb-[0.2rem] flex justify-center max-[768px]:mt-[0.7rem] max-[768px]:mb-[0.15rem]">
                {error && !inviteEmailsRequiredError ? (
                  <p className={inviteErrorNoticeClassName} role="alert">
                    {error}
                  </p>
                ) : null}
                {message ? (
                  <p className={inviteSuccessNoticeClassName} role="status">
                    {message}
                  </p>
                ) : null}
                {!sponsoredSelected ? (
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className={`${invitePrimaryButtonClassName} invite-primary-btn`}
                    disabled={busy}
                  >
                    {busy ? t("invite.sending") : sendLabel}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </form>
        )}

        <InviteGlowPanel
          className={`invite-list-panel ${inviteListCardClassName} ${
            invites.length === 0
              ? "min-h-[12rem] max-h-none max-[768px]:min-h-[10.5rem] max-[768px]:max-h-none overflow-visible"
              : "min-h-[12rem] max-h-[min(40dvh,21rem)] max-[768px]:min-h-[10.5rem] max-[768px]:max-h-[min(28dvh,15.5rem)] overflow-y-auto"
          } [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0`}
        >
          <div className="flex items-center justify-between gap-[0.75rem] max-[768px]:grid max-[768px]:grid-cols-[minmax(0,1fr)_auto] max-[768px]:items-center max-[768px]:gap-[0.5rem]">
            <span className="text-[1.18rem] font-[650] tracking-[0.03em] max-[768px]:text-[1.18rem] max-[768px]:tracking-[0.03em]">
              {t("invite.list")}
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className={`${inviteRefreshButtonClassName} invite-primary-btn invite-refresh-btn`}
              onClick={loadInvites}
              disabled={loadingList}
            >
              {loadingList ? t("invite.loading") : t("invite.refresh")}
            </Button>
          </div>
          {invites.length === 0 ? (
            <p className="mt-[0.5rem] block text-[1.16rem] tracking-[0.02em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-80 light:text-[#1f2937] max-[768px]:text-[1.22rem] max-[768px]:tracking-[0.024em]">
              {t("invite.empty")}
            </p>
          ) : (
            <div className="mt-[0.5rem] grid gap-[0.6rem] text-[1.08rem] tracking-[0.016em] max-[768px]:text-[1.14rem] max-[768px]:tracking-[0.02em]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem] text-[0.98rem] uppercase tracking-[0.09em] opacity-70 max-[768px]:hidden">
                <span>{t("invite.table.email")}</span>
                <span>{t("invite.table.payer")}</span>
                <span>{t("invite.table.status")}</span>
                <span></span>
              </div>
              {invites.map((inv) => (
                <div
                  className={inviteListRowClassName}
                  key={inv.id}
                >
                  <div className="min-w-0">
                    <span className="hidden text-[0.82rem] uppercase tracking-[0.08em] opacity-65 max-[768px]:block">
                      {t("invite.table.email")}
                    </span>
                    <span className="break-words">{inv.inviteeEmail}</span>
                  </div>
                  <div>
                    <span className="hidden text-[0.82rem] uppercase tracking-[0.08em] opacity-65 max-[768px]:block">
                      {t("invite.table.payer")}
                    </span>
                    <span>
                      {inv.paymentMode === "SPONSORED_BY_HOST"
                        ? t("invite.payer.host")
                        : t("invite.payer.self")}
                    </span>
                  </div>
                  <div>
                    <span className="hidden text-[0.82rem] uppercase tracking-[0.08em] opacity-65 max-[768px]:block">
                      {t("invite.table.status")}
                    </span>
                    <span>{formatStatus(inv)}</span>
                  </div>
                  <span className="flex items-center justify-end gap-[0.5rem] max-[768px]:justify-start max-[768px]:pt-[0.1rem]">
                    {inv.status === "SENT" ? (
                      <>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => action(inv.id, "resend")}
                        >
                          {t("invite.resend")}
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => action(inv.id, "revoke")}
                        >
                          {t("buttons.cancel")}
                        </Button>
                      </>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          )}
        </InviteGlowPanel>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="workspace-feature-embedded">
        {content}
      </div>
    );
  }

  return (
    <Modal
      open={open}
      variant="glass"
      onClose={handleClose}
      closeOnOverlayClick={!closing}
      aria-label={inviteHeaderTitle}
      className={
        open
          ? `invite-modal-overlay person-invite-modal-overlay z-[140] ${isWorkspaceReturn ? "overflow-y-auto" : "overflow-hidden"} overscroll-contain ${isWorkspaceReturn ? "items-start" : "items-center"} py-[clamp(1rem,3vh,1.75rem)] max-[768px]:p-0 max-[768px]:items-start ${isWorkspaceReturn ? "invite-modal-overlay--workspace" : ""}`
          : undefined
      }
      contentClassName={inviteModalContentClassName}
    >
      {content.props.children}
    </Modal>
  );
}
