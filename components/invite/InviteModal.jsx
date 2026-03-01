"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import OptionCard from "@/components/ui/OptionCard";
import Panel from "@/components/ui/Panel";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";
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
  const mobileInviteInputClassName =
    "max-[48em]:!text-[1.16rem] max-[48em]:placeholder:!text-[1.08rem] max-[48em]:!min-h-[3.2rem] max-[48em]:!py-[0.84rem]";
  const invitePrimaryButtonClassName =
    "!min-h-[3.05rem] !px-[1.15rem] !py-[0.78rem] !text-[1.12rem] !tracking-[0.03rem] max-[48em]:!min-h-[3.2rem] max-[48em]:!text-[1.18rem]";
  const sponsoredRoleOptions = [{
    value: "SOCIAL_WORKER",
    label: t("invite.sponsored.role.worker")
  }, {
    value: "CLIENT",
    label: t("invite.sponsored.role.client")
  }];
  const inviteRefreshButtonClassName =
    "!min-h-[2rem] !px-[0.82rem] !py-[0.22rem] !text-[0.94rem] !tracking-[0.01em] max-[48em]:!min-h-[2.08rem] max-[48em]:!px-[0.88rem] max-[48em]:!py-[0.24rem] max-[48em]:!text-[0.98rem]";
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
  return <Modal open={open} variant="glass" onClose={() => setOpen(false)} closeOnOverlayClick aria-label={t("invite.title")} className={open ? "invite-modal-overlay max-[48em]:p-0 max-[48em]:items-stretch" : undefined} contentClassName="invite-modal-content relative overflow-x-hidden overflow-y-auto overscroll-contain pt-[0.35rem] !pb-[1rem] text-[1.12rem] leading-[1.35] tracking-[0.03rem] max-[48em]:text-[1.18rem] max-[48em]:leading-[1.4] [--input-text:var(--glass-modal-text)]">
      <BackButton onClick={() => setOpen(false)} ariaLabel={t("buttons.back")} className="absolute top-[0.55rem] left-[0.55rem] translate-x-0 translate-y-0 bottom-auto !h-[4rem] !w-[4rem] z-[92] [&>svg]:!h-[4rem] [&>svg]:!w-[4rem] max-[48em]:top-[calc(env(safe-area-inset-top,0px)+0.56rem)] max-[48em]:left-[calc(env(safe-area-inset-left,0px)+0.04rem)] max-[48em]:!h-[4.4rem] max-[48em]:!w-[4.4rem] max-[48em]:[&>svg]:!h-[4.4rem] max-[48em]:[&>svg]:!w-[4.4rem]" />
      <header className="mb-[0.35rem] flex items-start justify-center gap-[0.75rem]">
        <h2 className={`${glassPageTitleClassName} max-[48em]:!mt-[calc(env(safe-area-inset-top,0px)+2.55rem)]`}>
          {t("invite.eyebrow")}
        </h2>
      </header>

      <div className="invite-modal-scroll grid gap-[1.6rem] px-[1.15rem] pt-[0.9rem] pb-[0.4rem] max-[48em]:px-[0.2rem]">
        {!session?.user?.id ? <div className="grid gap-[1rem]">
            <p>{t("invite.login_required")}</p>
          </div> : <form className="grid gap-[1rem]" onSubmit={submit}>
            {!roomId ? <>
                <Input id="invite-room-title" value={roomTitle} onChange={e => setRoomTitle(e.target.value)} disabled={busy} placeholder={t("invite.room_title")} aria-label={t("invite.room_title")} className={mobileInviteInputClassName} />
                <Input id="invite-host-name" value={hostDisplayName} onChange={e => setHostDisplayName(e.target.value)} disabled={busy} placeholder={t("invite.host_name_ph")} aria-label={t("invite.host_name")} className={mobileInviteInputClassName} />
              </> : null}
            <Input id="invite-emails" value={emails} onChange={e => setEmails(e.target.value)} placeholder={t("invite.classic.emails_ph")} aria-label={t("invite.classic.emails")} disabled={busy} className={mobileInviteInputClassName} />
            <div className="mt-[0.6rem] grid grid-cols-2 gap-[0.6rem] max-[48em]:justify-items-center" role="radiogroup" aria-label={t("invite.pay.label")}>
            {paymentOptions.map(option => (
                <OptionCard key={option.value} type="radio" name="payment" value={option.value} checked={paymentMode === option.value} onChange={e => setPaymentMode(e.target.value)} disabled={busy} className="w-full max-w-[16rem] max-[48em]:w-[min(38vw,12.2rem)] !min-h-[3.05rem] !py-[0.78rem] !text-[1.02rem] !leading-[1.2] !tracking-[0.02rem] text-center justify-center max-[48em]:!text-[1.12rem] max-[48em]:!min-h-[2.9rem] max-[48em]:!pt-[0.52rem] max-[48em]:!pb-[0.2rem]">
                  <span className="text-center [text-wrap:balance]">{option.label}</span>
                </OptionCard>
              ))}
            </div>

            {paymentMode === "sponsored_by_host" && sponsoredStep ? <Panel variant="secondary" padding="sm" className="grid gap-[0.9rem] rounded-[1.05rem] border border-[var(--chat-invite-list-border,rgba(248,253,255,0.16))] bg-[rgba(255,255,255,0.42)] [.theme-night_&]:bg-[rgba(16,22,34,0.38)]">
                <div className="grid gap-[0.35rem] text-center">
                  <p className="text-[1.04rem] font-[650] tracking-[0.02em] max-[48em]:text-[1.12rem]">
                    {t("invite.sponsored.title")}
                  </p>
                  <p className="text-[0.98rem] opacity-80 max-[48em]:text-[1.05rem]">
                    {t("invite.sponsored.description")}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-[0.6rem]">
                  {sponsoredRoleOptions.map(option => (
                    <OptionCard key={option.value} type="radio" name="targetRole" value={option.value} checked={targetRole === option.value} onChange={e => setTargetRole(e.target.value)} disabled={busy} className="w-full !min-h-[3rem] !py-[0.72rem] !text-[1.02rem] justify-center text-center max-[48em]:!text-[1.1rem]">
                      <span className="text-center [text-wrap:balance]">{option.label}</span>
                    </OptionCard>
                  ))}
                </div>
                <p className="text-center text-[0.95rem] opacity-80 max-[48em]:text-[1.02rem]">
                  {t("invite.sponsored.one_month_note")}
                </p>
                <div className="flex justify-center">
                  <Button type="button" variant="primary" onClick={() => setSponsoredStep(false)}>
                    {t("buttons.back")}
                  </Button>
                </div>
              </Panel> : null}

            {error ? <p className="text-center text-[color:#fca5a5]" role="alert">
                {error}
              </p> : null}
            {message ? <p className="text-center text-[color:#a7f3d0]" role="status">
                {message}
              </p> : null}

            <div className="mt-[0.65rem] mb-[1rem] flex justify-center">
              <Button type="submit" variant="primary" size="md" className={`${invitePrimaryButtonClassName} invite-primary-btn`} disabled={busy}>
                {busy ? t("invite.sending") : paymentMode === "sponsored_by_host" && sponsoredStep ? t("invite.sponsored.confirm_and_pay") : sendLabel}
              </Button>
            </div>
          </form>}

        <Panel variant="secondary" padding="sm" className={`invite-list-panel ${inviteListCardClassName} min-h-[9.5rem] max-h-[min(48dvh,24rem)] max-[48em]:min-h-[8rem] max-[48em]:max-h-[min(32dvh,18rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0`}>
          <div className="flex items-center justify-between gap-[0.75rem]">
            <span className="text-[1.05rem] font-[650] tracking-[0.02em] max-[48em]:text-[1.14rem]">
              {t("invite.list")}
            </span>
            <Button type="button" variant="primary" size="sm" className={`${inviteRefreshButtonClassName} invite-refresh-btn`} onClick={loadInvites} disabled={loadingList}>
              {loadingList ? t("invite.loading") : t("invite.refresh")}
            </Button>
          </div>
          {invites.length === 0 ? (
            <p className="mt-[0.5rem] opacity-80 max-[48em]:text-[1.06rem]">{t("invite.empty")}</p>
          ) : (
            <div className="mt-[0.5rem] grid gap-[0.6rem] text-[0.98rem] max-[48em]:text-[1.05rem]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem] text-[0.85rem] uppercase tracking-[0.08em] opacity-70 max-[48em]:text-[0.94rem]">
                <span>{t("invite.table.email")}</span>
                <span>{t("invite.table.payer")}</span>
                <span>{t("invite.table.status")}</span>
                <span></span>
              </div>
              {invites.map(inv => (
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem]" key={inv.id}>
                  <span>{inv.inviteeEmail}</span>
                  <span>
                    {inv.paymentMode === "SPONSORED_BY_HOST" ? t("invite.payer.host") : t("invite.payer.self")}
                  </span>
                  <span>{formatStatus(inv)}</span>
                  <span className="flex items-center justify-end gap-[0.5rem]">
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
