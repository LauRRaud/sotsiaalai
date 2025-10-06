"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TellimusBody() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subActive, setSubActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/subscription", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || "Tellimuse oleku laadimine ebaõnnestus.");
          return;
        }
        setSubActive(payload?.subscription?.status === "active");
      } catch (err) {
        console.error("subscription GET", err);
        setError("Server ei vasta. Palun proovi uuesti.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleActivate() {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");
      // DEMO: redirect to Maksekeskus
      alert("Suuname Maksekeskuse makselehele (demo)...");
      router.push("/tellimus?status=demo");
    } catch (err) {
      console.error("activate", err);
      setError("Makse algatamine ebaõnnestus.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="main-content glass-box glass-left">
        <h1 className="glass-title">Tellimus</h1>
        <p style={{ padding: "1rem" }}>Laen tellimuse infot…</p>
      </div>
    );
  }

  return (
    <div className="main-content glass-box glass-left" role="main" lang="et">
      <h1 className="glass-title">Tellimus</h1>

      {subActive ? (
        <>
          <p className="glass-text">
            Sinu tellimus on aktiivne. Kuutasu: <strong>7,99 € / kuu</strong>.
          </p>
          <p className="glass-text">
            Kui soovid, saad tellimuse igal ajal tühistada oma profiililehelt
            või kirjutades e-posti aadressile{" "}
            <a href="mailto:info@sotsiaal.ai" className="link-brand">
              info@sotsiaal.ai
            </a>.
          </p>

          <div className="tellimus-btn-center">
            <Link href="/profiil" className="btn-primary">
              Ava profiil
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="glass-text">
            SotsiaalAI teenus põhineb <strong>igakuise püsimaksega tellimusel</strong>.
            Kuutasu on <strong>7,99 €</strong>. Makse sooritatakse automaatselt
            valitud makseviisil (nt kaart või pangalink) läbi Maksekeskuse.
          </p>

          <div className="glass-note" style={{ margin: "1.25rem 0", textAlign: "center" }}>
            <p>
              Tellimust saab igal ajal tühistada oma profiililehel või
              kirjutades aadressile{" "}
              <a href="mailto:info@sotsiaal.ai">info@sotsiaal.ai</a>.
            </p>
          </div>

          {error && (
            <div role="alert" className="glass-note">
              {error}
            </div>
          )}
          {success && !error && (
            <div role="status" className="glass-note glass-note--success">
              {success}
            </div>
          )}

          <div className="tellimus-btn-center">
            <button
              type="button"
              className="btn-primary"
              disabled={processing}
              onClick={handleActivate}
            >
              {processing ? "Suunan maksele…" : "Maksa ja aktiveeri tellimus"}
            </button>
          </div>
        </>
      )}

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push("/")}
          aria-label="Tagasi avalehele"
        >
          <span className="back-arrow-circle" />
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
