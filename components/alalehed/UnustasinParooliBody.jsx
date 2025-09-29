"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UnustasinParooliBody() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
        setError("");
    if (!email) {
      setError("Palun sisesta oma e-posti aadress.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload?.error || "Taastelinki ei õnnestunud saata.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("password reset request error", err);
      setError("Serveriga tekis ühenduse viga. Palun proovi uuesti.");
    } finally {
      setLoading(false);
    }
  }

  return (
 <div className="main-content glass-box reset-box">
      <h1 className="glass-title reset-title">Parooli taastamine</h1>
      {submitted ? (
        <p className="midtext reset-info">
          Kui sisestasid kehtiva aadressi, saatsime sinna taastelinki sisaldava kirja.
          <br />
          Kontrolli ka rämpsposti kausta!
        </p>
      ) : (
        <form className="reset-form" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="email" className="reset-label">
            <input
              type="email"
              id="email"
              name="email"
              className="reset-input"
              placeholder="Sinu@email.ee"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </label>
          {error && (
            <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
              {error}
            </div>
          )}
        <button className="reset-btn" type="submit" disabled={loading}>
            <span>{loading ? "Saadame…" : "Saada taastelink"}</span>
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
