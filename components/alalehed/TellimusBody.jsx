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
      // DEMO: suuname “makselehele”
      alert("Suuname Maksekeskuse makselehele (demo)...");
      router.push("/tellimus?status=demo");
      router.refresh();
    } catch (err) {
      console.error("activate", err);
      setError("Makse algatamine ebaõnnestus.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="main-content glass-box glass-left tellimus-box" role="main" lang="et">
        <h1 className="glass-title">Tellimus</h1>
        <div className="content-narrow">
          <p className="glass-text" aria-live="polite">Laen tellimuse infot…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content glass-box glass-left tellimus-box" role="main" lang="et">
      <h1 className="glass-title">Tellimus</h1>

      <div className="content-narrow">
        {subActive ? (
          <>
            <p className="glass-text">
              Sinu tellimus on aktiivne. Kuutasu: 7,99 € / kuu.
            </p>
            <p className="glass-text" id="cancel-note">
              Tellimuse saad igal ajal tühistada oma profiililehelt või
              kirjutades aadressile{" "}
              <a href="mailto:info@sotsiaal.ai" className="link-brand">
                info@sotsiaal.ai
              </a>
              .
            </p>

            <div className="tellimus-btn-center">
              <Link
                href="/profiil"
                className="btn-primary"
                aria-describedby="cancel-note"
              >
                Ava profiil
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="glass-text" id="billing-info">
              SotsiaalAI teenus põhineb igakuise püsimaksega tellimusel.
              Kuutasu on 7,99 €. Makse sooritatakse automaatselt valitud
              makseviisil (nt kaart või pangalink) läbi Maksekeskuse.
            </p>

            <div className="glass-note" style={{ margin: "1.0rem 0" }} id="cancel-note">
              <p className="glass-text" style={{ margin: 0 }}>
                Tellimuse saad igal ajal tühistada oma profiililehelt või
                kirjutades aadressile{" "}
                <a href="mailto:info@sotsiaal.ai" className="link-brand">
                  info@sotsiaal.ai
                </a>
                .
              </p>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="glass-note">
                {error}
              </div>
            )}
            {success && !error && (
              <div role="status" aria-live="polite" className="glass-note glass-note--success">
                {success}
              </div>
            )}

            <div className="tellimus-btn-center">
              <button
                type="button"
                className="btn-primary"
                disabled={processing}
                aria-disabled={processing}
                aria-busy={processing}
                aria-describedby="billing-info cancel-note"
                onClick={handleActivate}
              >
                {processing ? "Suunan maksele…" : "Maksa ja aktiveeri tellimus"}
              </button>
            </div>
          </>
        )}
      </div>

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

      <footer className="alaleht-footer">SotsiaalAI © 2025</footer>
    </div>
  );
}
