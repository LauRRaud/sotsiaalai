"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfiilBody() {
  const [loading, setLoading] = useState(true);
  const [subActive, setSubActive] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setError("");
        const res = await fetch("/api/subscription", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || "Tellimuse oleku päring ebaõnnestus.");
          return;
        }
        setSubActive(payload?.subscription?.status === "active");
      } catch (e) {
        console.error("profile/subscription GET", e);
        setError("Server ei vastanud. Palun proovi hiljem uuesti.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCancel() {
    try {
      setCancelling(true);
      setError("");
      setStatusMsg("");

      // NB! Kui sul on päris API, siis kasuta:
      // const res = await fetch("/api/subscription/cancel", { method: "POST" });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data?.error || "Tühistamine ebaõnnestus.");

      // Demo-/mock-käitumine:
      await new Promise((r) => setTimeout(r, 700));
      setSubActive(false);
      setStatusMsg("Tellimus on tühistatud. Juurdepääs kestab kuni arveldusperioodi lõpuni.");
    } catch (e) {
      console.error("subscription/cancel", e);
      setError("Tellimuse tühistamine ebaõnnestus. Palun proovi uuesti või kirjuta info@sotsiaal.ai.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="main-content glass-box glass-left" role="main" lang="et">
      <h1 className="glass-title">Profiil</h1>

      <Link href="/tellimus" className="link-brand profile-tellimus-link">
        Halda tellimust
      </Link>

      {/* Maksekeskuse läbipaistvusnõue – selge, nähtav tekst */}
      <p className="glass-note" style={{ marginTop: "1rem", textAlign: "center" }}>
        Sinu SotsiaalAI tellimus on <strong>igakuine püsimakse</strong> hinnaga <strong>7,99 € / kuu</strong>.
        Tellimust saab igal ajal tühistada siinsamas profiililehel või kirjutades
        aadressile <a href="mailto:info@sotsiaal.ai">info@sotsiaal.ai</a>.
      </p>

      {loading ? (
        <p style={{ padding: "1rem" }}>Laen profiili andmeid…</p>
      ) : (
        <>
          {error && (
            <div role="alert" className="glass-note">
              {error}
            </div>
          )}

          {statusMsg && !error && (
            <div role="status" className="glass-note glass-note--success">
              {statusMsg}
            </div>
          )}

          {subActive ? (
            <div className="profile-subscription-block">
              <p className="glass-text">
                Tellimuse staatus: <strong>aktiivne</strong>. Kuutasu: <strong>7,99 €</strong>.
              </p>
              <div className="tellimus-btn-center" style={{ gap: ".75rem" }}>
                <Link href="/tellimus" className="btn-secondary">
                  Muuda makseviisi / vaata arveldust
                </Link>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleCancel}
                  disabled={cancelling}
                  aria-busy={cancelling}
                >
                  {cancelling ? "Tühistan…" : "Tühista tellimus"}
                </button>
              </div>
              <p className="glass-muted" style={{ marginTop: ".75rem", textAlign: "center" }}>
                Tühistamisel peatub automaatne püsimakse alates <em>järgmise arveldusperioodi algusest</em>.
              </p>
            </div>
          ) : (
            <div className="profile-subscription-block">
              <p className="glass-text">
                Sul ei ole aktiivset tellimust. SotsiaalAI täisvõimalused avanevad
                igakuise püsimaksega (7,99 € / kuu).
              </p>
              <div className="tellimus-btn-center">
                <Link href="/tellimus" className="btn-primary">
                  Aktiveeri tellimus
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
