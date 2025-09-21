"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ModalConfirm from "@/components/ui/ModalConfirm";

const STATUS_LABELS = {
  ACTIVE: "Aktiivne",
  CANCELED: "Lõppenud",
  PAST_DUE: "Maksmata",
  NONE: "Puudub",
};

export default function TellimusBody() {
  const { data: session, status: sessionStatus } = useSession();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [mutating, setMutating] = useState(false);

  const roleLabel = useMemo(() => {
    const role = session?.user?.role;
    if (role === "SOCIAL_WORKER") return "Spetsialist";
    if (role === "ADMIN") return "Administraator";
    return "Eluküsimusega pöörduja";
  }, [session?.user?.role]);

  const email = session?.user?.email ?? session?.user?.name ?? "kasutaja@email.ee";

  const statusKey = subscription?.status ?? (session?.user?.subActive ? "ACTIVE" : "NONE");
  const statusLabel = STATUS_LABELS[statusKey] ?? STATUS_LABELS.NONE;

  const expiryLabel = useMemo(() => {
    if (!subscription?.validUntil) return "—";
    return new Date(subscription.validUntil).toLocaleDateString("et-EE");
  }, [subscription?.validUntil]);

  const fetchSubscription = useCallback(async () => {
    if (sessionStatus !== "authenticated") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscription", { cache: "no-store" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || "Tellimuse andmete laadimine ebaõnnestus.");
        setSubscription(null);
      } else {
        setSubscription(payload.subscription ?? null);
      }
    } catch (err) {
      console.error("subscription GET", err);
      setError("Server ei vasta. Palun proovi uuesti.");
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  async function startSubscription() {
    setMutating(true);
    setError("");
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "kuutellimus" }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || "Tellimuse käivitamine ebaõnnestus.");
        return;
      }
      setSubscription(payload.subscription ?? null);
    } catch (err) {
      console.error("subscription POST", err);
      setError("Server ei vasta. Palun proovi uuesti.");
    } finally {
      setMutating(false);
    }
  }

  async function cancelSubscription() {
    setMutating(true);
    setError("");
    try {
      const res = await fetch("/api/subscription", { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || "Tellimuse tühistamine ebaõnnestus.");
        return;
      }
      setSubscription(payload.subscription ?? null);
    } catch (err) {
      console.error("subscription DELETE", err);
      setError("Server ei vasta. Palun proovi uuesti.");
    } finally {
      setMutating(false);
      setShowCancel(false);
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="main-content glass-box">
        <h1 className="glass-title">Halda tellimust</h1>
        <p style={{ padding: "1rem" }}>Laen tellimuse andmeid…</p>
      </div>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <div className="main-content glass-box">
        <h1 className="glass-title">Halda tellimust</h1>
        <p style={{ padding: "1rem" }}>Peate esmalt sisse logima.</p>
      </div>
    );
  }

  return (
    <>
      <div className="main-content glass-box">
        <h1 className="glass-title">Halda tellimust</h1>

        <div className="tellimus-status-center">
          <div className="tellimus-status-label">Tellimuse staatus</div>
          <span className={`tellimus-status-pill status-${statusKey?.toLowerCase?.()}`}>
            {statusLabel}
          </span>
        </div>

        <div className="tellimus-info-list">
          <div>
            <b>Roll:</b> {roleLabel}
          </div>
          <div>
            <b>Kuutasu:</b> 7.99 €
          </div>
          <div>
            <b>Kehtiv kuni:</b> {statusKey === "ACTIVE" ? expiryLabel : "—"}
          </div>
          <div>
            <b>E-post:</b> {email}
          </div>
        </div>

        {error && (
          <div role="alert" className="glass-note" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div className="tellimus-btn-center">
          {statusKey === "ACTIVE" ? (
            <button className="btn-danger" onClick={() => setShowCancel(true)} disabled={mutating}>
              {mutating ? "Tühistan…" : "Tühista tellimus"}
            </button>
          ) : (
            <button className="btn-primary" onClick={startSubscription} disabled={mutating}>
              {mutating ? "Käivitan…" : "Alusta tellimist"}
            </button>
          )}
        </div>

        <div className="back-btn-wrapper">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => window.history.back()}
            aria-label="Tagasi"
          >
            <span className="back-arrow-circle"></span>
          </button>
        </div>

        <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
      </div>

      {showCancel && (
        <ModalConfirm
          message="Kas oled kindel, et soovid tellimuse tühistada?"
          confirmLabel={mutating ? "Tühistan…" : "Jah, tühista"}
          cancelLabel="Katkesta"
          onConfirm={cancelSubscription}
          onCancel={() => setShowCancel(false)}
          disabled={mutating}
        />
      )}
    </>
  );
}
