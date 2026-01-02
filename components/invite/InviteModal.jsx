"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";

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
  const [emails, setEmails] = useState("");
  const [relationship, setRelationship] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [invites, setInvites] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setRoomId(e?.detail?.roomId || null);
      setOpen(true);
    };
    window.addEventListener("sotsiaalai:open-invite", handler);
    return () => window.removeEventListener("sotsiaalai:open-invite", handler);
  }, []);

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
    setBusy(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: parsed,
          relationship_type: relationship || undefined,
          payment_mode: paymentMode || undefined,
          room_id: roomId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Kutse saatmine ebaõnnestus");
      }
      setMessage(t("invite.success", "Kutsed saadetud"));
      setEmails("");
      loadInvites();
    } catch (err) {
      setError(err?.message || "Kutse saatmine ebaõnnestus");
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
      setError(err?.message || "Tegevus ebaõnnestus");
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
    <div className="invite-modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
      <div
        className="invite-modal invite-modal--classic invite-modal--chat-glass"
        role="dialog"
        aria-modal="true"
        aria-label={t("invite.title", "Lisa inimesi")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="invite-modal__header invite-classic__header">
          <h2 className="invite-classic__title glass-title invite-classic__title--hero">
            {t("invite.eyebrow", "Grupivestlus")}
          </h2>
          <button
            type="button"
            className="invite-modal__close invite-classic__close modal-close-btn"
            onClick={() => setOpen(false)}
            aria-label={t("common.close", "Sulge")}
          >
          </button>
        </header>

        <div className="invite-modal__content invite-classic__content">
          {!session?.user?.id ? (
            <div className="invite-classic__body">
              <p>{t("invite.login_required", "Kutsumiseks logi sisse.")}</p>
            </div>
          ) : (
            <form className="invite-classic__body" onSubmit={submit}>
              <label className="invite-classic__label" htmlFor="invite-emails">
                {t("invite.classic.emails", "Lisa inimesi vestlusesse")}
              </label>
              <input
                id="invite-emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="invite-classic__input"
                placeholder={t("invite.classic.emails_ph", "E-post (eralda komaga)")}
                disabled={busy}
              />
              <p className="invite-classic__section-title">{t("invite.classic.relationship", "Kellega on tegu?")}</p>
              <div className="invite-choice-group">
                <label className={`invite-choice-card ${relationship === "colleague" ? "is-checked" : ""}`}>
                  <input
                    type="radio"
                    name="relationship"
                    value="colleague"
                    checked={relationship === "colleague"}
                    onChange={() => setRelationship("colleague")}
                    disabled={busy}
                  />
                  <span>{t("invite.rel.colleague", "Kolleeg")}</span>
                </label>
                <label className={`invite-choice-card ${relationship === "client" ? "is-checked" : ""}`}>
                  <input
                    type="radio"
                    name="relationship"
                    value="client"
                    checked={relationship === "client"}
                    onChange={() => setRelationship("client")}
                    disabled={busy}
                  />
                  <span>{t("invite.rel.client", "Klient")}</span>
                </label>
              </div>

              <p className="invite-classic__section-title">{t("invite.classic.payment", "Tellimuse olemasolu")}</p>
              <div className="invite-choice-group">
                <label className={`invite-choice-card ${paymentMode === "self_paid" ? "is-checked" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="self_paid"
                    checked={paymentMode === "self_paid"}
                    onChange={() => setPaymentMode("self_paid")}
                    disabled={busy}
                  />
                  <span>{t("invite.pay.self", "Tal on oma tellimus")}</span>
                </label>
                <label className={`invite-choice-card ${paymentMode === "sponsored_by_host" ? "is-checked" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="sponsored_by_host"
                    checked={paymentMode === "sponsored_by_host"}
                    onChange={() => setPaymentMode("sponsored_by_host")}
                    disabled={busy}
                  />
                  <span>{t("invite.pay.host", "Tasun tema eest")}</span>
                </label>
              </div>

              {error ? (
                <p className="invite-classic__status invite-classic__status--error" role="alert">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="invite-classic__status invite-classic__status--ok" role="status">
                  {message}
                </p>
              ) : null}

              <div className="invite-classic__actions">
                <button type="submit" className="btn-base invite-classic__submit" disabled={busy}>
                  {busy ? t("invite.sending", "Saadan...") : t("invite.send", "SAADA KUTSE")}
                </button>
              </div>
            </form>
          )}

          <div className="invite-list invite-classic__list">
            <div className="invite-classic__list-header">
              <span className="invite-classic__list-title">{t("invite.list", "Kutsed")}</span>
              <button type="button" className="btn-base invite-classic__refresh" onClick={loadInvites} disabled={loadingList}>
                {loadingList ? t("invite.loading", "Laen...") : t("invite.refresh", "Värskenda")}
              </button>
            </div>
            {invites.length === 0 ? (
              <p className="invite-classic__empty">{t("invite.empty", "Kutsete nimekiri on tühi")}</p>
            ) : (
              <div className="invite-table invite-table--classic">
                <div className="invite-row invite-row--head">
                  <span>{t("invite.table.email", "Email")}</span>
                  <span>{t("invite.table.role", "Roll")}</span>
                  <span>{t("invite.table.payer", "Maksja")}</span>
                  <span>{t("invite.table.status", "Staatus")}</span>
                  <span></span>
                </div>
                {invites.map((inv) => (
                  <div className="invite-row" key={inv.id}>
                    <span>{inv.inviteeEmail}</span>
                    <span>{inv.relationshipType === "CLIENT" ? t("invite.rel.client", "Klient") : t("invite.rel.colleague", "Kolleeg")}</span>
                    <span>{inv.paymentMode === "SPONSORED_BY_HOST" ? t("invite.payer.host", "Tasun tema eest") : t("invite.payer.self", "Tal on oma tellimus")}</span>
                    <span>{formatStatus(inv)}</span>
                    <span className="invite-row__actions invite-classic__row-actions">
                      {inv.status === "SENT" ? (
                        <>
                          <button type="button" className="btn-base" onClick={() => action(inv.id, "resend")}>
                            {t("invite.resend", "Saada uuesti")}
                          </button>
                          <button type="button" className="btn-base" onClick={() => action(inv.id, "revoke")}>
                            {t("buttons.cancel", "Tühista")}
                          </button>
                        </>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}









