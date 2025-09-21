"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ModalConfirm from "@/components/ui/ModalConfirm";

const ROLE_MAP = {
  ADMIN: "Administraator",
  SOCIAL_WORKER: "Spetsialist",
  CLIENT: "Eluküsimusega pöörduja",
};

export default function ProfiilBody() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchParams = useSearchParams();
  const registrationReason = searchParams?.get("reason");

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || "Profiili laadimine ebaõnnestus.");
          return;
        }
        setEmail(payload?.user?.email ?? "");
      } catch (err) {
        console.error("profile GET", err);
        setError("Server ei vasta. Palun proovi uuesti.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  async function handleSave(e) {
    e.preventDefault();
    if (status !== "authenticated") return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: password || undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || "Profiili uuendamine ebaõnnestus.");
        return;
      }
      setSuccess("Muudatused salvestatud.");
      setPassword("");
      router.refresh();
    } catch (err) {
      console.error("profile PUT", err);
      setError("Server ei vasta. Palun proovi uuesti.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="main-content glass-box glass-left">
        <h1 className="glass-title">Minu profiil</h1>
        <p style={{ padding: "1rem" }}>Laen profiili…</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    const reason = registrationReason || "not-logged-in";
    const reasonText = reason === "no-sub"
      ? "Logi sisse ja aktiveeri tellimus, et profiili vaadata."
      : "Profiili vaatamiseks logi sisse.";

    return (
      <div className="main-content glass-box glass-left">
        <h1 className="glass-title">Minu profiil</h1>
        <p style={{ padding: "1rem" }}>{reasonText}</p>
        <div className="back-btn-wrapper">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => router.push("/registreerimine")}
            aria-label="Logi sisse"
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </div>
    );
  }

  const roleLabel = ROLE_MAP[session?.user?.role] ?? "—";

  return (
    <div className="main-content glass-box glass-left" role="main" aria-labelledby="profile-title" lang="et">
      <h1 id="profile-title" className="glass-title">
        Minu profiil
      </h1>

      <div className="profile-header-center">
        <span className="profile-role-pill">{roleLabel}</span>
        <Link href="/tellimus" className="link-brand profile-tellimus-link">
          Halda tellimust
        </Link>
      </div>

      <form onSubmit={handleSave} className="glass-form profile-form-vertical">
        <label htmlFor="email" className="glass-label">
          E-post
        </label>
        <input
          className="input-modern"
          type="email"
          id="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" className="glass-label">
          Uus parool (soovi korral)
        </label>
        <input
          className="input-modern"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
        />

        {error && (
          <div role="alert" className="glass-note" style={{ marginTop: "0.75rem" }}>
            {error}
          </div>
        )}
        {success && !error && (
          <div role="status" className="glass-note glass-note--success" style={{ marginTop: "0.75rem" }}>
            {success}
          </div>
        )}

        <div className="profile-btn-row">
          <button type="submit" className="btn-primary btn-profile-save" disabled={saving}>
            {saving ? "Salvestan…" : "Salvesta"}
          </button>
          <button
            type="button"
            className="btn-primary btn-profile-logout"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logi välja
          </button>
        </div>
      </form>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push("/vestlus")}
          aria-label="Tagasi vestlusesse"
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="button" type="button" onClick={() => setShowDelete(true)}>
          <svg viewBox="0 0 448 512" className="svgIcon">
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
          </svg>
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>

      {showDelete && (
        <ModalConfirm
          message="Konto kustutamine pole veel saadaval."
          confirmLabel="Sulge"
          cancelLabel=""
          onConfirm={() => setShowDelete(false)}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
