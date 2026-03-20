"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import OptionCard from "@/components/ui/OptionCard";
import Panel from "@/components/ui/Panel";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassPageTitleClassName,
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
const INVITE_TILT_CLOSE_MS = 540;
export default function InviteModal() {
  const { data: session } = useSession();
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
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
  const inviteModalContentClassName =
    `invite-modal-content person-invite-modal-content !w-[min(100%,62vw)] !max-w-[clamp(30rem,54vw,38rem)] relative overflow-x-hidden overflow-y-auto overscroll-contain ` +
    `pt-[0.35rem] !pb-[1rem] text-[1.12rem] leading-[1.35] tracking-[0.03rem] max-[768px]:text-[1.18rem] max-[768px]:leading-[1.4] ` +
    `[--input-text:var(--glass-modal-text)] ${glassPageMobileCardClassName} ` +
    `${closing ? "pointer-events-none motion-safe:animate-[glassRingTiltFromLeft_540ms_cubic-bezier(0.42,0,0.58,1)_both]" : ""}`;
  const inviteModalTitleClassName = `invite-modal-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ${glassPageTitleClassName} w-full max-[768px]:!mt-0 max-[768px]:!mb-0`;
  const inviteModalBodyClassName =
    "invite-modal-scroll mx-auto grid w-full max-w-[clamp(18rem,44vw,31rem)] gap-[1.6rem] px-[1.15rem] pt-[0.9rem] pb-[0.4rem] max-[768px]:max-w-none max-[768px]:gap-[1.25rem] max-[768px]:px-[0.05rem]";
  const inviteFormClassName = `grid gap-[1rem] max-[768px]:gap-[0.95rem] ${
    sponsoredSelected ? "pb-[1.6rem] max-[768px]:pb-[1.25rem]" : ""
  }`;
  const mobileInviteInputClassName =
    "!text-[1.28rem] !tracking-[0.02em] placeholder:!text-[1.12rem] placeholder:!tracking-[0.02em] max-[768px]:!text-[1.34rem] max-[768px]:!tracking-[0.024em] max-[768px]:placeholder:!text-[1.2rem] max-[768px]:placeholder:!tracking-[0.022em] max-[768px]:!min-h-[3.2rem] max-[768px]:!py-[0.84rem]";
  const invitePrimaryButtonClassName =
    "!min-h-[3.05rem] !px-[1.15rem] !py-[0.78rem] !text-[1.12rem] !tracking-[0.03rem] max-[768px]:!min-h-[3.2rem] max-[768px]:!text-[1.18rem]";
  const sponsoredRoleOptions = [
    {
      value: "SOCIAL_WORKER",
      label: t("invite.sponsored.role.worker"),
    },
    {
      value: "CLIENT",
      label: t("invite.sponsored.role.client"),
    },
  ];
  const inviteOptionButtonClassName =
    "[--seg-card-bg:var(--btn-primary-bg)] [--seg-card-bg-hover:var(--btn-primary-bg-hover)] [--seg-card-bg-selected:var(--btn-primary-bg-hover)] " +
    "[--seg-card-text:var(--btn-primary-text,var(--input-text))] [--seg-card-text-hover:var(--title-color,var(--brand-primary))] [--seg-card-text-selected:var(--title-color,var(--brand-primary))] " +
    "[--seg-card-shadow:var(--btn-primary-shadow)] [--seg-card-shadow-hover:var(--btn-primary-shadow-hover)] [--seg-card-shadow-selected:var(--btn-primary-shadow-hover)] " +
    "[--seg-card-border:transparent] [--seg-card-border-width:0px] [--seg-card-duration:560ms] [--seg-card-ease:cubic-bezier(0.22,0.61,0.36,1)] " +
    "[border:var(--btn-primary-border)] hover:[border:var(--btn-primary-border-hover)] focus-visible:[border:var(--btn-primary-border-hover)] data-[checked=true]:[border:var(--btn-primary-border-hover)] " +
    "backdrop-blur-[10px] backdrop-saturate-[120%] " +
    "!transition-[border-color,box-shadow,color] !duration-[560ms] !ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "hover:shadow-[var(--seg-card-shadow-hover)] focus-visible:shadow-[var(--seg-card-shadow-hover)] data-[checked=true]:shadow-[var(--seg-card-shadow-selected)]";
  const inviteRefreshButtonClassName =
    "!min-h-[2.22rem] !px-[0.98rem] !py-[0.28rem] !text-[1.12rem] !tracking-[0.026em] max-[768px]:!min-h-[2.2rem] max-[768px]:!w-auto max-[768px]:!min-w-[9rem] max-[768px]:!justify-center max-[768px]:!self-center max-[768px]:!px-[0.94rem] max-[768px]:!py-[0.24rem] max-[768px]:!text-[1.14rem] max-[768px]:!tracking-[0.03em]";
  const inviteSponsorToggleClassName =
    "!inline-flex !w-fit !justify-self-center !self-center !min-h-[2.72rem] !rounded-[1.6rem] !px-[1.05rem] !py-[0.64rem] !text-[1.06rem] !leading-[1.2] " +
    "[--seg-control-size:1.42rem] [--seg-check-size:1.1rem] " +
    "[&>span.shrink-0]:-translate-y-[0.08rem] " +
    "max-[768px]:!min-h-[2.9rem] max-[768px]:!rounded-[1.45rem] max-[768px]:!text-[1.12rem] " +
    inviteOptionButtonClassName;
  const inviteRoleCardClassName =
    "!w-[min(100%,18.2rem)] !mx-auto !min-h-[2.88rem] !justify-center !rounded-[1.55rem] !px-[1.15rem] !py-[0.66rem] !text-[1.12rem] !leading-[1.2] text-center max-[768px]:!w-full max-[768px]:!max-w-none max-[768px]:!rounded-[1.45rem] max-[768px]:!text-[1.16rem] max-[768px]:!px-[1rem] " +
    inviteOptionButtonClassName;
  const inviteSponsoredUnifiedPanelClassName =
    "mx-auto w-full max-w-[min(35rem,100%)] px-[0.5rem] py-[0.15rem] " +
    "text-[color:var(--pt-120)] max-[768px]:max-w-[min(31rem,100%)] max-[768px]:px-0 max-[768px]:py-0";
  const inviteSponsoredCardBodyClassName =
    "grid gap-[0.68rem] pt-[0.95rem] text-[color:var(--pt-150)] light:text-[color:var(--input-text)]";
  const inviteSponsoredSectionTitleClassName =
    "m-0 mb-[0.58rem] text-center text-[1.16rem] font-[500] tracking-[0.006em] leading-[1.34] text-[color:var(--glass-modal-text)] max-[768px]:mb-[0.68rem] max-[768px]:text-[1.12rem]";
  const inviteSponsoredDividerClassName =
    "mt-[0.9rem] mb-[0.15rem] h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.16)_12%,rgba(255,255,255,0.16)_88%,rgba(255,255,255,0)_100%)] [.theme-light_&]:bg-[linear-gradient(90deg,rgba(122,58,56,0)_0%,rgba(122,58,56,0.12)_12%,rgba(122,58,56,0.12)_88%,rgba(122,58,56,0)_100%)]";
  const inviteSponsoredCheckboxClassName =
    "fancy-checkbox--otp fancy-checkbox--multiline w-full justify-start " +
    "[--otp-check-shape:var(--glass-modal-text,var(--pt-150))] [--otp-check-tick:var(--title-color,var(--brand-primary))] [--otp-check-text:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
    "[--otp-check-box-size:1.66rem] [--otp-check-font-size:1.08rem] [--otp-check-line-height:1.5] [--otp-check-text-max-width:min(100%,30rem)] [--otp-check-box-offset:0.08rem] " +
    "[&_.box]:translate-y-[-0.08rem] min-[769px]:ml-[0.9rem] min-[769px]:[--otp-check-text-max-width:min(100%,24rem)]";
  const inviteSponsoredCheckoutFooterClassName =
    "mt-[0.95rem] pt-[0.05rem] flex justify-center max-[768px]:mt-[0.88rem]";
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
    `${sponsoredSelected ? "mt-[0.55rem] max-[768px]:mt-[0.45rem]" : "mt-[0.55rem]"} rounded-[1rem] text-[color:var(--pt-120)] ` +
    "[.theme-light_&]:text-[#1f2937] [.theme-light_&]:shadow-[var(--input-shadow)]";
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
    const handler = (e) => {
      setRoomId(e?.detail?.roomId || null);
      if (closeTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setClosing(false);
      setOpen(true);
    };
    window.addEventListener("sotsiaalai:open-invite", handler);
    return () => window.removeEventListener("sotsiaalai:open-invite", handler);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const invitePayment = String(params.get("invitePayment") || "")
      .trim()
      .toLowerCase();
    if (!invitePayment) return;
    setOpen(true);
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
  }, [t]);
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
  }, [open]);
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
    if (closeTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (shouldReduceMotion()) {
      setClosing(false);
      setOpen(false);
      return;
    }
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      setOpen(false);
      closeTimerRef.current = null;
    }, INVITE_TILT_CLOSE_MS);
  }, [shouldReduceMotion]);
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
  return (
    <Modal
      open={open}
      variant="glass"
      onClose={handleClose}
      closeOnOverlayClick={!closing}
      aria-label={t("invite.title")}
      className={
        open
          ? "invite-modal-overlay person-invite-modal-overlay z-[140] max-[768px]:p-0 max-[768px]:items-stretch"
          : undefined
      }
      contentClassName={inviteModalContentClassName}
    >
      <BackButton
        onClick={handleClose}
        ariaLabel={t("buttons.back")}
        className={`${glassPageBackTopLeftClassName} !z-[145] pointer-events-auto`}
      />
      <header className="invite-modal-title-wrap mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]">
        <div className="policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]">
          <h2 className={inviteModalTitleClassName}>{t("invite.eyebrow")}</h2>
        </div>
      </header>

      <div className={inviteModalBodyClassName}>
        {!session?.user?.id ? (
          <div className="grid gap-[1rem]">
            <p>{t("invite.login_required")}</p>
          </div>
        ) : (
          <form className={inviteFormClassName} onSubmit={submit}>
            {!roomId ? (
              <>
                <Input
                  id="invite-room-title"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  disabled={busy}
                  placeholder={t("invite.room_title")}
                  aria-label={t("invite.room_title")}
                  className={mobileInviteInputClassName}
                />
                <Input
                  id="invite-host-name"
                  value={hostDisplayName}
                  onChange={(e) => setHostDisplayName(e.target.value)}
                  disabled={busy}
                  placeholder={t("invite.host_name_ph")}
                  aria-label={t("invite.host_name")}
                  className={mobileInviteInputClassName}
                />
              </>
            ) : null}
            <Input
              id="invite-emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder={t("invite.classic.emails_ph")}
              aria-label={t("invite.classic.emails")}
              disabled={busy}
              className={mobileInviteInputClassName}
            />
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
                className={inviteSponsorToggleClassName}
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
                          disabled={busy || !targetRole || !sponsoredCheckoutAgreed}
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

            {error || message || !sponsoredSelected ? (
              <div className="relative mt-[0.95rem] mb-[0.85rem] flex justify-center max-[768px]:mt-[0.82rem]">
                {error ? (
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

        <Panel
          variant="secondary"
          padding="sm"
          className={`invite-list-panel ${inviteListCardClassName} ${
            invites.length === 0
              ? "min-h-[9rem] max-h-none max-[768px]:min-h-[8.6rem] max-[768px]:max-h-none overflow-visible"
              : "min-h-[9.6rem] max-h-[min(40dvh,19rem)] max-[768px]:min-h-[8.2rem] max-[768px]:max-h-[min(26dvh,14.5rem)] overflow-y-auto"
          } [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0`}
        >
          <div className="flex items-center justify-between gap-[0.75rem] max-[768px]:flex-col max-[768px]:items-start">
            <span className="text-[1.18rem] font-[650] tracking-[0.03em] max-[768px]:text-[1.24rem] max-[768px]:tracking-[0.034em]">
              {t("invite.list")}
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className={`${inviteRefreshButtonClassName} invite-refresh-btn`}
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
                  className="invite-list-row grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem] max-[768px]:grid-cols-1 max-[768px]:gap-[0.52rem] max-[768px]:rounded-[0.92rem] max-[768px]:border max-[768px]:border-[rgba(248,253,255,0.1)] max-[768px]:bg-[rgba(10,14,22,0.4)] max-[768px]:p-[0.78rem] [.theme-night_&]:max-[768px]:border-[rgba(166,190,230,0.1)] [.theme-night_&]:max-[768px]:bg-[rgba(10,16,26,0.44)] [.theme-light_&]:max-[768px]:border-[rgba(148,163,184,0.18)] [.theme-light_&]:max-[768px]:bg-[rgba(255,255,255,0.38)]"
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
        </Panel>
      </div>
    </Modal>
  );
}
