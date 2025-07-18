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
    localStorage.setItem("saai_roll", form.role);
    localStorage.setItem("saai_email", form.email);
    router.push("/tellimus");
  }

  return (
    <div className="page-bg-gradient">
      <div className="alaleht-inner">
        <div className="glass-box">
          <h1 className="glass-title">Loo konto</h1>
          <form className="glass-form" onSubmit={handleSubmit} autoComplete="off">
<label htmlFor="email" className="glass-label first-input-label">
<input
  type="email"
  id="email"
  name="email"
  className="input-modern input-email-top"
                placeholder="Sinu@email.ee"
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
                placeholder="Parool"
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
                  value="eluküsimusega"
                  checked={form.role === "eluküsimusega"}
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
  <span className="checkbox-text">
    <span>
      <span className="agree-word">Nõustun </span>
      <a
        href="/kasutustingimused"
        target="_blank"
        rel="noopener noreferrer"
        className="link-brand"
      >
        kasutajatingimuste
      </a>
      <span className="and-word"> ja </span>
      <a
        href="/privaatsustingimused"
        target="_blank"
        rel="noopener noreferrer"
        className="link-brand"
      >
        privaatsuspoliitikaga
      </a>
    </span>
  </span>
</label>
            <button className="btn-primary" type="submit">
              <span>Registreeru</span>
            </button>
          </form>

          <div className="glass-bottom-link">
            <span className="midtext" style={{ marginRight: '0.17em' }}>Mul on juba konto?</span>
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
            SotsiaalAI &copy; 2025
          </footer>
        </div>
      </div>
    </div>
  );
}
