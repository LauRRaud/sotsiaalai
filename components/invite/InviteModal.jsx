"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Panel from "@/components/ui/Panel";
import SegmentedControl from "@/components/ui/SegmentedControl";
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
    t
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
  const [invites, setInvites] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const paymentOptions = [{
    value: "self_paid",
    label: t("invite.pay.self")
  }, {
    value: "sponsored_by_host",
    label: t("invite.pay.host")
  }];
  useEffect(() => {
    const handler = e => {
      setRoomId(e?.detail?.roomId || null);
      setOpen(true);
    };
    window.addEventListener("sotsiaalai:open-invite", handler);
    return () => window.removeEventListener("sotsiaalai:open-invite", handler);
  }, []);
  useEffect(() => {
    if (open && !roomId) {
      setRoomTitle("");
      setHostDisplayName("");
    }
  }, [open, roomId]);
  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.toggle("modal-open", open);
    document.body.classList.toggle("invite-modal-open", open);
    root.classList.toggle("modal-open", open);
    root.classList.toggle("invite-modal-open", open);
    return () => {
      document.body.classList.remove("modal-open");
      document.body.classList.remove("invite-modal-open");
      root.classList.remove("modal-open");
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
      setError("");
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
    setBusy(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emails: parsed,
          payment_mode: paymentMode || undefined,
          room_id: roomId || undefined,
          room_title: trimmedRoomTitle || undefined,
          host_display_name: !roomId ? trimmedHostName || undefined : undefined
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || t("invite.send_failed"));
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
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.message || t("invite.error_generic"));
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
  return <Modal open={open} variant="glass" onClose={() => setOpen(false)} closeOnOverlayClick aria-label={t("invite.title")} contentClassName="relative text-[1.05rem] leading-[1.35] tracking-[0.03rem]">
      <IconButton className="absolute right-[0.35rem] top-[0.35rem] border-0" label={t("common.close")} onClick={() => setOpen(false)} />
      <header className="mb-[0.6rem] flex items-start justify-center gap-[0.75rem]">
        <h2 className="w-full text-center text-[1.7rem] font-[400] tracking-[0.03em] text-[color:var(--glass-modal-title-color)] [text-shadow:var(--glass-modal-title-shadow)] font-[family:var(--font-aino-headline)]">
          {t("invite.eyebrow")}
        </h2>
      </header>

      <div className="grid gap-[1.6rem]">
        {!session?.user?.id ? <div className="grid gap-[1rem]">
            <p>{t("invite.login_required")}</p>
          </div> : <form className="grid gap-[1rem]" onSubmit={submit}>
            {!roomId ? <>
                <Input id="invite-room-title" value={roomTitle} onChange={e => setRoomTitle(e.target.value)} disabled={busy} placeholder={t("invite.room_title")} aria-label={t("invite.room_title")} />
                <Input id="invite-host-name" value={hostDisplayName} onChange={e => setHostDisplayName(e.target.value)} disabled={busy} placeholder={t("invite.host_name")} aria-label={t("invite.host_name")} />
              </> : null}
            <Input id="invite-emails" value={emails} onChange={e => setEmails(e.target.value)} placeholder={t("invite.classic.emails_ph")} aria-label={t("invite.classic.emails")} disabled={busy} />
            <SegmentedControl className="[--seg-card-bg-hover:var(--input-bg-hover)] [--seg-card-text-hover:var(--input-text)]" name="payment" value={paymentMode} options={paymentOptions} onChange={setPaymentMode} disabled={busy} />

            {error ? <p className="text-center text-[color:#fca5a5]" role="alert">
                {error}
              </p> : null}
            {message ? <p className="text-center text-[color:#a7f3d0]" role="status">
                {message}
              </p> : null}

            <div className="mt-[0.65rem] mb-[1rem] flex justify-center">
              <Button type="submit" className="min-w-[9.5rem]" disabled={busy}>
                {busy ? t("invite.sending") : t("invite.send")}
              </Button>
            </div>
          </form>}

        <Panel variant="secondary" padding="sm">
          <div className="flex items-center justify-between gap-[0.75rem]">
            <span className="text-[1.05rem] font-[650] tracking-[0.02em]">
              {t("invite.list")}
            </span>
            <Button type="button" onClick={loadInvites} disabled={loadingList}>
              {loadingList ? t("invite.loading") : t("invite.refresh")}
            </Button>
          </div>
          {invites.length === 0 ? (
            <p className="mt-[0.5rem] opacity-80">{t("invite.empty")}</p>
          ) : (
            <div className="mt-[0.5rem] grid gap-[0.6rem] text-[0.98rem]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] items-center gap-[0.75rem] text-[0.85rem] uppercase tracking-[0.08em] opacity-70">
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
                        <Button type="button" onClick={() => action(inv.id, "resend")}>
                          {t("invite.resend")}
                        </Button>
                        <Button type="button" onClick={() => action(inv.id, "revoke")}>
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
