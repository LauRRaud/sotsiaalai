"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import AutoFitPageTitle from "@/components/ui/AutoFitPageTitle";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import OptionCard from "@/components/ui/OptionCard";
import Panel from "@/components/ui/Panel";
import { glassPageBackTopLeftClassName, glassPageMobileCardClassName, glassPageTitleClassName, glassPageTitleMobileHeaderClassName } from "@/components/ui/glassPageStyles";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";

function parseEmails(raw) {
  if (!raw) return [];
  const list = String(raw).split(/[,;\n\r]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  return [...new Set(list)];
}
export default function InviteModal() {
  const {
    data: session
  } = useSession();
  const {
    t,
    locale
  } = useI18n();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [hostDisplayName, setHostDisplayName] = useState("");
  const [emails, setEmails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sponsoredStep, setSponsoredStep] = useState(false);
  const [targetRole, setTargetRole] = useState("CLIENT");
  const [invites, setInvites] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const paymentOptions = [{
    value: "self_paid",
    label: t("invite.pay.self")
  }, {
    value: "sponsored_by_host",
    label: t("invite.pay.host")
  }];
  const formatSentenceCase = text => {
    const raw = typeof text === "string" ? text.trim() : "";
    if (!raw) return text;
    if (raw !== raw.toUpperCase()) return text;
    const lower = raw.toLocaleLowerCase(locale || "et");
    return `${lower.charAt(0).toLocaleUpperCase(locale || "et")}${lower.slice(1)}`;
  };
  const sendLabel = formatSentenceCase(t("invite.send"));
  const inviteModalContentClassName =
    `invite-modal-content person-invite-modal-content !w-[min(100%,62vw)] !max-w-[clamp(30rem,54vw,38rem)] relative overflow-x-hidden overflow-y-auto overscroll-contain ` +
    `pt-[0.35rem] !pb-[1rem] text-[1.12rem] leading-[1.35] tracking-[0.03rem] max-[768px]:text-[1.18rem] max-[768px]:leading-[1.4] ` +
    `[--input-text:var(--glass-modal-text)] ${glassPageMobileCardClassName}`;
  const inviteModalTitleClassName =
    `invite-modal-title subpage-mobile-title ${glassPageTitleClassName} ${glassPageTitleMobileHeaderClassName} w-full`;
  const inviteModalBodyClassName =
    "invite-modal-scroll mx-auto grid w-full max-w-[clamp(18rem,44vw,31rem)] gap-[1.6rem] px-[1.15rem] pt-[0.9rem] pb-[0.4rem] max-[768px]:max-w-none max-[768px]:gap-[1.25rem] max-[768px]:px-[0.05rem]";
  const inviteFormClassName = "grid gap-[1rem] max-[768px]:gap-[0.95rem]";
  const mobileInviteInputClassName =
    "!text-[1.28rem] !tracking-[0.02em] placeholder:!text-[1.12rem] placeholder:!tracking-[0.02em] max-[768px]:!text-[1.34rem] max-[768px]:!tracking-[0.024em] max-[768px]:placeholder:!text-[1.2rem] max-[768px]:placeholder:!tracking-[0.022em] max-[768px]:!min-h-[3.2rem] max-[768px]:!py-[0.84rem]";
  const invitePrimaryButtonClassName =
    "!min-h-[3.05rem] !px-[1.15rem] !py-[0.78rem] !text-[1.12rem] !tracking-[0.03rem] max-[768px]:!min-h-[3.2rem] max-[768px]:!text-[1.18rem]";
  const sponsoredRoleOptions = [{
    value: "SOCIAL_WORKER",
    label: t("invite.sponsored.role.worker")
  }, {
    value: "CLIENT",
    label: t("invite.sponsored.role.client")
  }];
  const inviteRefreshButtonClassName =
    "!min-h-[2.22rem] !px-[0.98rem] !py-[0.28rem] !text-[1.12rem] !tracking-[0.026em] max-[768px]:!min-h-[2.2rem] max-[768px]:!w-auto max-[768px]:!min-w-[9rem] max-[768px]:!justify-center max-[768px]:!self-center max-[768px]:!px-[0.94rem] max-[768px]:!py-[0.24rem] max-[768px]:!text-[1.14rem] max-[768px]:!tracking-[0.03em]";
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
    "rounded-[1rem] border-[var(--chat-invite-list-border,rgba(248,253,255,0.16))] bg-[rgba(30,32,38,0.42)] [.theme-night_&]:bg-[rgba(16,22,34,0.4)] " +
    "text-[color:var(--pt-120)] shadow-[var(--chat-invite-shadow,var(--input-shadow))] " +
    "[.theme-light_&]:border-transparent [.theme-light_&]:bg-[rgba(255,255,255,0.58)] [.theme-light_&]:text-[#1f2937] [.theme-light_&]:shadow-[var(--input-shadow)]";
  useEffect(() => {
    const handler = e => {
      setRoomId(e?.detail?.roomId || null);
      setOpen(true);
    };
    window.addEventListener("sotsiaalai:open-invite", handler);
    return () => window.removeEventListener("sotsiaalai:open-invite", handler);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const invitePayment = String(params.get("invitePayment") || "").trim().toLowerCase();
    if (!invitePayment) return;
    setOpen(true);
    setRoomId(params.get("roomId") || null);
    setSponsoredStep(false);
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
    if (paymentMode !== "sponsored_by_host") {
      setSponsoredStep(false);
      setTargetRole("CLIENT");
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
    if (paymentMode === "sponsored_by_host" && parsed.length !== 1) {
      setError(t("invite.error.sponsored_single_email_required"));
      return;
    }
    if (paymentMode === "sponsored_by_host" && !sponsoredStep) {
      setSponsoredStep(true);
      return;
    }
    setBusy(true);
    try {
      if (paymentMode === "sponsored_by_host") {
        const res = await fetch("/api/invites/sponsored/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            emails: parsed,
            lang: locale,
            room_id: roomId || undefined,
            room_title: trimmedRoomTitle || undefined,
            host_display_name: !roomId ? trimmedHostName || undefined : undefined,
            targetRole
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(resolveApiMessage({
            payload: data,
            t,
            fallbackKey: "invite.send_failed"
          }));
        }
        const checkoutUrl = typeof data?.checkoutUrl === "string" ? data.checkoutUrl.trim() : "";
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emails: parsed,
          lang: locale,
          payment_mode: paymentMode || undefined,
          room_id: roomId || undefined,
          room_title: trimmedRoomTitle || undefined,
          host_display_name: !roomId ? trimmedHostName || undefined : undefined
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(resolveApiMessage({
          payload: data,
          t,
          fallbackKey: "invite.send_failed"
        }));
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
      const url = kind === "resend" ? `/api/invites/${id}/resend` : `/api/invites/${id}/revoke`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          locale
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(resolveApiMessage({
          payload: data,
          t,
          fallbackKey: "invite.error_generic"
        }));
      }
      await loadInvites();
    } catch (err) {
      setError(err?.message || t("invite.action_failed"));
    }
  }
  function formatStatus(inv) {
    if (inv.status === "ACCEPTED" && inv.acceptedBillingSource) {
      return inv.acceptedBillingSource === "SELF" ? t("invite.status.accepted_self") : t("invite.status.accepted_sponsored");
    }
    return inv.status;
  }
  if (!open) return null;
  return <Modal open={open} variant="glass" onClose={() => setOpen(false)} closeOnOverlayClick aria-label={t("invite.title")} className={open ? "invite-modal-overlay person-invite-modal-overlay max-[768px]:p-0 max-[768px]:items-stretch" : undefined} contentClassName={inviteModalContentClassName}>
      <BackButton onClick={() => setOpen(false)} ariaLabel={t("buttons.back")} className={glassPageBackTopLeftClassName} />
      <header className="invite-modal-title-wrap mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]">
        <AutoFitPageTitle as="h2" className={inviteModalTitleClassName} minFontPx={18}>
          {t("invite.eyebrow")}
        </AutoFitPageTitle>
      </header>

      <div className={inviteModalBodyClassName}>
        {!session?.user?.id ? <div className="grid gap-[1rem]">
            <p>{t("invite.login_required")}</p>
          </div> : <form className={inviteFormClassName} onSubmit={submit}>
            {!roomId ? <>
                <Input id="invite-room-title" value={roomTitle} onChange={e => setRoomTitle(e.target.value)} disabled={busy} placeholder={t("invite.room_title")} aria-label={t("invite.room_title")} className={mobileInviteInputClassName} />
                <Input id="invite-host-name" value={hostDisplayName} onChange={e => setHostDisplayName(e.target.value)} disabled={busy} placeholder={t("invite.host_name_ph")} aria-label={t("invite.host_name")} className={mobileInviteInputClassName} />
              </> : null}
            <Input id="invite-emails" value={emails} onChange={e => setEmails(e.target.value)} placeholder={t("invite.classic.emails_ph")} aria-label={t("invite.classic.emails")} disabled={busy} className={mobileInviteInputClassName} />
            <div className="mt-[0.6rem] grid grid-cols-2 gap-[0.6rem] max-[768px]:grid-cols-1" role="radiogroup" aria-label={t("invite.pay.label")}>
            {paymentOptions.map(option => (
                <OptionCard key={option.value} type="radio" name="payment" value={option.value} checked={paymentMode === option.value} onChange={e => setPaymentMode(e.target.value)} disabled={busy} className="w-full max-w-[16rem] max-[768px]:max-w-none max-[768px]:w-full !min-h-[3.05rem] !py-[0.78rem] !text-[1.08rem] !leading-[1.2] !tracking-[0.025em] text-center justify-center max-[768px]:!text-[1.18rem] max-[768px]:!tracking-[0.03em] max-[768px]:!min-h-[3rem] max-[768px]:!pt-[0.68rem] max-[768px]:!pb-[0.46rem]">
                  <span className="text-center tracking-[0.025em] max-[768px]:tracking-[0.03em] [text-wrap:balance]">{option.label}</span>
                </OptionCard>
              ))}
            </div>

            {paymentMode === "sponsored_by_host" && sponsoredStep ? <Panel variant="secondary" padding="sm" className="grid gap-[0.9rem] rounded-[1.05rem] border border-[var(--chat-invite-list-border,rgba(248,253,255,0.16))] bg-[rgba(255,255,255,0.42)] [.theme-night_&]:bg-[rgba(16,22,34,0.38)]">
                <div className="grid gap-[0.35rem] text-center">
                  <p className="text-[1.04rem] font-[650] tracking-[0.02em] max-[768px]:text-[1.12rem]">
                    {t("invite.sponsored.title")}
                  </p>
                  <p className="text-[0.98rem] opacity-80 max-[768px]:text-[1.05rem]">
                    {t("invite.sponsored.description")}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-[0.6rem]">
                  {sponsoredRoleOptions.map(option => (
                    <OptionCard key={option.value} type="radio" name="targetRole" value={option.value} checked={targetRole === option.value} onChange={e => setTargetRole(e.target.value)} disabled={busy} className="w-full !min-h-[3rem] !py-[0.72rem] !text-[1.02rem] justify-center text-center max-[768px]:!text-[1.1rem]">
                      <span className="text-center [text-wrap:balance]">{option.label}</span>
                    </OptionCard>
                  ))}
                </div>
                <p className="text-center text-[0.95rem] opacity-80 max-[768px]:text-[1.02rem]">
                  {t("invite.sponsored.one_month_note")}
                </p>
                <div className="flex justify-center">
                  <Button type="button" variant="primary" onClick={() => setSponsoredStep(false)}>
                    {t("buttons.back")}
                  </Button>
                </div>
              </Panel> : null}

            <div className="relative mt-[1.25rem] mb-[1rem] flex justify-center">
              {error ? <p className={inviteErrorNoticeClassName} role="alert">
                  {error}
                </p> : null}
              {message ? <p className={inviteSuccessNoticeClassName} role="status">
                  {message}
                </p> : null}
              <Button type="submit" variant="primary" size="md" className={`${invitePrimaryButtonClassName} invite-primary-btn`} disabled={busy}>
                {busy ? t("invite.sending") : paymentMode === "sponsored_by_host" && sponsoredStep ? t("invite.sponsored.confirm_and_pay") : sendLabel}
              </Button>
            </div>
          </form>}

        <Panel variant="secondary" padding="sm" className={`invite-list-panel ${inviteListCardClassName} min-h-[7.8rem] max-h-[min(38dvh,18rem)] max-[768px]:min-h-[6.9rem] max-[768px]:max-h-[min(24dvh,13.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0`}>
          <div className="flex items-center justify-between gap-[0.75rem] max-[768px]:flex-col max-[768px]:items-start">
            <span className="text-[1.18rem] font-[650] tracking-[0.03em] max-[768px]:text-[1.24rem] max-[768px]:tracking-[0.034em]">
              {t("invite.list")}
            </span>
            <Button type="button" variant="primary" size="sm" className={`${inviteRefreshButtonClassName} invite-refresh-btn`} onClick={loadInvites} disabled={loadingList}>
              {loadingList ? t("invite.loading") : t("invite.refresh")}
            </Button>
          </div>
          {invites.length === 0 ? (
            <p className="mt-[0.5rem] text-[1.16rem] tracking-[0.02em] opacity-80 max-[768px]:text-[1.22rem] max-[768px]:tracking-[0.024em]">{t("invite.empty")}</p>
          ) : (
            <div className="mt-[0.5rem] grid gap-[0.6rem] text-[1.08rem] tracking-[0.016em] max-[768px]:text-[1.14rem] max-[768px]:tracking-[0.02em]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem] text-[0.98rem] uppercase tracking-[0.09em] opacity-70 max-[768px]:hidden">
                <span>{t("invite.table.email")}</span>
                <span>{t("invite.table.payer")}</span>
                <span>{t("invite.table.status")}</span>
                <span></span>
              </div>
              {invites.map(inv => (
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem] max-[768px]:grid-cols-1 max-[768px]:gap-[0.52rem] max-[768px]:rounded-[0.92rem] max-[768px]:border max-[768px]:border-[rgba(248,253,255,0.12)] max-[768px]:bg-[rgba(255,255,255,0.08)] max-[768px]:p-[0.78rem] [.theme-light_&]:max-[768px]:border-[rgba(148,163,184,0.18)] [.theme-light_&]:max-[768px]:bg-[rgba(255,255,255,0.38)]" key={inv.id}>
                  <div className="min-w-0">
                    <span className="hidden text-[0.82rem] uppercase tracking-[0.08em] opacity-65 max-[768px]:block">{t("invite.table.email")}</span>
                    <span className="break-words">{inv.inviteeEmail}</span>
                  </div>
                  <div>
                    <span className="hidden text-[0.82rem] uppercase tracking-[0.08em] opacity-65 max-[768px]:block">{t("invite.table.payer")}</span>
                    <span>
                    {inv.paymentMode === "SPONSORED_BY_HOST" ? t("invite.payer.host") : t("invite.payer.self")}
                    </span>
                  </div>
                  <div>
                    <span className="hidden text-[0.82rem] uppercase tracking-[0.08em] opacity-65 max-[768px]:block">{t("invite.table.status")}</span>
                    <span>{formatStatus(inv)}</span>
                  </div>
                  <span className="flex items-center justify-end gap-[0.5rem] max-[768px]:justify-start max-[768px]:pt-[0.1rem]">
                    {inv.status === "SENT" ? (
                      <>
                        <Button type="button" variant="primary" onClick={() => action(inv.id, "resend")}>
                          {t("invite.resend")}
                        </Button>
                        <Button type="button" variant="primary" onClick={() => action(inv.id, "revoke")}>
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
    </Modal>;
}
