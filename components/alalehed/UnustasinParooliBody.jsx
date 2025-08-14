"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UnustasinParooliBody() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      alert("Palun sisesta oma e-posti aadress!");
      return;
    }
    // Tulevikus: API-päring taastelinki saatmiseks
    setSubmitted(true);
  }

  return (
<div className="main-content glass-box reset-box">
          <h1 className="glass-title reset-title">Parooli taastamine</h1>
          {submitted ? (
            <p className="midtext reset-info">
              Kui sisestasid kehtiva aadressi, saadeti sinna taastelink.<br />
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
                />
              </label>
              <button className="reset-btn" type="submit">
                <span>Saada taastelink</span>
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

          <footer className="alaleht-footer reset-footer">
            SotsiaalAI &copy; 2025
          </footer>
        </div>
  );
}
