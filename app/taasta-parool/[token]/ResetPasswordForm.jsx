"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError("Palun täida mõlemad parooliväljad.");
      return;
    }

    if (password !== confirm) {
      setError("Paroolid ei kattu.");
      return;
    }

    if (password.length < 6) {
      setError("Parool peab olema vähemalt 6 märki.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || "Parooli ei õnnestunud uuendada.");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirm("");
      router.refresh();
    } catch (err) {
      console.error("password reset update error", err);
      setError("Serveriga tekkis ühenduse viga. Palun proovi uuesti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main-content glass-box reset-box">
      <h1 className="glass-title reset-title">Sea uus parool</h1>
      {success ? (
        <div className="reset-success">
          <p className="midtext reset-info" style={{ marginBottom: "1.5rem" }}>
            Parool on edukalt uuendatud. Saad nüüd sisse logida oma uue parooliga.
          </p>
          <Link href="/" className="btn-primary" style={{ textAlign: "center" }}>
            Tagasi avalehele
          </Link>
        </div>
      ) : (
        <form className="reset-form" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="password" className="reset-label">
            <input
              type="password"
              id="password"
              name="password"
              className="reset-input"
              placeholder="Uus parool"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          <label htmlFor="confirm" className="reset-label">
            <input
              type="password"
              id="confirm"
              name="confirm"
              className="reset-input"
              placeholder="Korda parooli"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          {error && (
            <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
              {error}
            </div>
          )}

          <button className="reset-btn" type="submit" disabled={loading}>
            <span>{loading ? "Uuendame…" : "Uuenda parool"}</span>
          </button>
        </form>
      )}
      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push("/")}
          aria-label="Tagasi avalehele"
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer reset-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
