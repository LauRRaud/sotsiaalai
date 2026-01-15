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
  const list = String(raw)
    .split(/[,;\n\r]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(list)];
}

export default function InviteModal() {
  const { data: session } = useSession();
  const { t } = useI18n();
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
  const paymentOptions = [
    { value: "self_paid", label: t("invite.pay.self", "Tal on oma tellimus") },
    { value: "sponsored_by_host", label: t("invite.pay.host", "Tasun tema eest") },
  ];

  useEffect(() => {
    const handler = (e) => {
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
      setError(t("invite.room_title_required", "Lisa ruumile nimi enne kutsete saatmist."));
      return;
    }
    if (!roomId && !trimmedHostName) {
      setError(t("invite.host_name_required", "Lisa oma nimi enne kutsete saatmist."));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: parsed,
          payment_mode: paymentMode || undefined,
          room_id: roomId || undefined,
          room_title: trimmedRoomTitle || undefined,
          host_display_name: !roomId ? trimmedHostName || undefined : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Kutse saatmine eba€ænnestus");
      }
      setMessage(t("invite.success", "Kutsed saadetud"));
      setEmails("");
      if (!roomId && data?.roomId) {
        setRoomId(data.roomId);
      }
      loadInvites();
    } catch (err) {
      setError(err?.message || "Kutse saatmine eba€ænnestus");
    } finally {
      setBusy(false);
    }
  }

  async function action(id, kind) {
    try {
      const url = kind === "resend" ? `/api/invites/${id}/resend` : `/api/invites/${id}/revoke`;
      const res = await fetch(url, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.message || "Viga");
      await loadInvites();
    } catch (err) {
      setError(err?.message || "Tegevus eba€ænnestus");
    }
  }

  function formatStatus(inv) {
    if (inv.status === "ACCEPTED" && inv.acceptedBillingSource) {
      return inv.acceptedBillingSource === "SELF" ? "Liitunud (oma plaan)" : "Liitunud (sponsoreeritud)";
    }
    return inv.status;
  }

  if (!open) return null;

  return (
    <Modal
      open={open}
      variant="glass"
      onClose={() => setOpen(false)}
      closeOnOverlayClick
      aria-label={t("invite.title", "Lisa inimesi")}
      contentClassName="relative text-[1.05rem] leading-[1.35] tracking-[0.03rem]"
    >
      <IconButton
        className="absolute right-[0.2rem] top-[0.2rem]"
        label={t("common.close", "Sulge")}
        onClick={() => setOpen(false)}
      />
      <header className="mb-[1.25rem] flex items-start justify-center gap-[0.75rem]">
        <h2 className="glass-title w-full text-center text-[1.7rem] tracking-[0.03em] text-[color:var(--glass-modal-title-color)] [text-shadow:var(--glass-modal-title-shadow)]">
          {t("invite.eyebrow", "Grupivestlus")}
        </h2>
      </header>

      <div className="grid gap-[1.6rem]">
        {!session?.user?.id ? (
          <div className="grid gap-[1rem]">
            <p>{t("invite.login_required", "Kutsumiseks logi sisse.")}</p>
          </div>
        ) : (
          <form className="grid gap-[1rem]" onSubmit={submit}>
            {!roomId ? (
              <>
                <label className="font-semibold tracking-[0.03em]" htmlFor="invite-room-title">
                  {t("invite.room_title", "Ruumi nimi")}
                </label>
                <Input
                  id="invite-room-title"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  disabled={busy}
                />
                <label className="font-semibold tracking-[0.03em]" htmlFor="invite-host-name">
                  {t("invite.host_name", "Sinu nimi vestluses")}
                </label>
                <Input
                  id="invite-host-name"
                  value={hostDisplayName}
                  onChange={(e) => setHostDisplayName(e.target.value)}
                  placeholder={t("invite.host_name_ph", "Nt Kert")}
                  disabled={busy}
                />
              </>
            ) : null}
            <label className="font-semibold tracking-[0.03em]" htmlFor="invite-emails">
              {t("invite.classic.emails", "Lisa inimesi vestlusesse")}
            </label>
            <Input
              id="invite-emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder={t("invite.classic.emails_ph", "E-post (eralda komaga)")}
              disabled={busy}
            />
            <p className="mt-[0.65rem] text-center text-[1.08rem] font-semibold tracking-[0.02em]">
              {t("invite.classic.payment", "Tellimuse olemasolu")}
            </p>
            <SegmentedControl
              name="payment"
              value={paymentMode}
              options={paymentOptions}
              onChange={setPaymentMode}
              disabled={busy}
            />

            {error ? (
              <p className="text-center text-[color:#fca5a5]" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-center text-[color:#a7f3d0]" role="status">
                {message}
              </p>
            ) : null}

            <div className="mt-[0.65rem] mb-[1rem] flex justify-center">
              <Button type="submit" className="min-w-[9.5rem]" disabled={busy}>
                {busy ? t("invite.sending", "Saadan...") : t("invite.send", "SAADA KUTSE")}
              </Button>
            </div>
          </form>
        )}

        <Panel variant="secondary" padding="sm">
          <div className="flex items-center justify-between gap-[0.75rem]">
            <span className="text-[1.05rem] font-[650] tracking-[0.02em]">
              {t("invite.list", "Kutsed")}
            </span>
            <Button type="button" onClick={loadInvites} disabled={loadingList}>
              {loadingList ? t("invite.loading", "Laen...") : t("invite.refresh", "V€Ÿrskenda")}
            </Button>
          </div>
          {invites.length === 0 ? (
            <p className="mt-[0.5rem] opacity-80">{t("invite.empty", "Kutsete nimekiri on t€¬hi")}</p>
          ) : (
            <div className="invite-table invite-table--classic mt-[0.5rem]">
              <div className="invite-row invite-row--head">
                <span>{t("invite.table.email", "Email")}</span>
                <span>{t("invite.table.payer", "Maksja")}</span>
                <span>{t("invite.table.status", "Staatus")}</span>
                <span></span>
              </div>
              {invites.map((inv) => (
                <div className="invite-row" key={inv.id}>
                  <span>{inv.inviteeEmail}</span>
                  <span>
                    {inv.paymentMode === "SPONSORED_BY_HOST"
                      ? t("invite.payer.host", "Tasun tema eest")
                      : t("invite.payer.self", "Tal on oma tellimus")}
                  </span>
                  <span>{formatStatus(inv)}</span>
                  <span className="invite-row__actions invite-classic__row-actions">
                    {inv.status === "SENT" ? (
                      <>
                        <Button type="button" onClick={() => action(inv.id, "resend")}>
                          {t("invite.resend", "Saada uuesti")}
                        </Button>
                        <Button type="button" onClick={() => action(inv.id, "revoke")}>
                          {t("buttons.cancel", "T€¬hista")}
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
