"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistreerimineBody({ openLoginModal }) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "specialist",
    agree: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Palun täida kõik väljad!");
      return;
    }
    if (!form.agree) {
      alert("Pead nõustuma kasutajatingimustega ja privaatsuspoliitikaga!");
      return;
    }
    alert(
      "Registreerimine õnnestus! (demo)\nRoll: " +
        (form.role === "specialist" ? "Spetsialist" : "Abivajaja")
    );
  }

  return (
    <div className="page-bg-gradient">
      <div className="alaleht-inner">
        <div className="glass-box">
          <h1 className="glass-title">Loo konto</h1>
          <form className="glass-form" onSubmit={handleSubmit} autoComplete="off">
            <label htmlFor="email" className="glass-label">
              <input
                type="email"
                id="email"
                name="email"
                className="input-modern"
                placeholder="sinu@email.ee"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </label>
            <label htmlFor="password" className="glass-label">
              <input
                type="password"
                id="password"
                name="password"
                className="input-modern"
                placeholder="Vali parool"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </label>
            <div className="glass-label glass-label-radio">
              Roll:
            </div>
            <div className="glass-radio-group" role="radiogroup">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="specialist"
                  checked={form.role === "specialist"}
                  onChange={handleChange}
                />
                Sotsiaaltöö spetsialist
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="abivajaja"
                  checked={form.role === "abivajaja"}
                  onChange={handleChange}
                />
                Eluküsimusega pöörduja
              </label>
            </div>
            <label className="glass-checkbox">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                required
              />
              <span>
                Nõustun{" "}
                <a
                  href="/kasutustingimused"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-brand"
                >
                  kasutajatingimustega
                </a>
                {" ja "}
                <a
                  href="/privaatsustingimused"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-brand"
                  style={{ whiteSpace: "nowrap" }}
                >
                  privaatsuspoliitikaga
                </a>
              </span>
            </label>
            <button className="btn-primary">
              <span>Registreeru</span>
            </button>
          </form>
<div className="glass-bottom-link">
  <span className="midtext" style={{marginRight: '0.17em'}}>Mul on juba konto?</span>
  <a
    href="#"
    className="link-brand"
    onClick={(e) => {
      e.preventDefault();
      openLoginModal();
    }}
  >
    Logi sisse
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
