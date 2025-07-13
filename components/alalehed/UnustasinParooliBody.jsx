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
    console.log("Taastelink saadetud:", email);
    setSubmitted(true);
  }

  return (
    <div className="page-bg-gradient">
      <div className="alaleht-inner">
        <div className="glass-box">
          <h1 className="glass-title">Parooli taastamine</h1>
          {submitted ? (
            <p className="midtext" style={{marginTop: "2em"}}>
              Kui sisestasid kehtiva aadressi, saadeti sinna taastelink.<br />
              Kontrolli ka rämpsposti kausta!
            </p>
          ) : (
            <form className="glass-form" onSubmit={handleSubmit} autoComplete="off">
              <label htmlFor="email" className="glass-label">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-modern"
                  placeholder="sinu@email.ee"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </label>
              <button className="btn-primary" type="submit">
                <span>Saada taastelink</span>
              </button>
            </form>
          )}

          <div className="glass-bottom-link">
            <span className="midtext" style={{marginRight: '0.17em'}}>Tead parooli?</span>
            <a
              href="#"
              className="link-brand"
              onClick={(e) => {
                e.preventDefault();
                router.push("/");
              }}
            >
              Tagasi avalehele
            </a>
          </div>

          {/* Tagasi avalehele noole-nupp */}
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

          <footer className="alaleht-footer">
            Sotsiaal.AI &copy; 2025
          </footer>
        </div>
      </div>
    </div>
  );
}
