"use client";
import { useState } from "react";

export default function RegistreerimineBody({ openLoginModal }) {
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
    <div className="registreeru-leht">
      <div className="registreeru-bg" />

      <div className="registreeru-box" role="main" aria-labelledby="registreeru-title">
        <h1 id="registreeru-title" className="registreeru-title">Loo konto</h1>

        <form className="registreeru-form" autoComplete="off" onSubmit={handleSubmit}>
          <label className="registreeru-label" htmlFor="email">
            E-post
            <input
              type="email"
              id="email"
              name="email"
              className="registreeru-input"
              placeholder="sinu@email.ee"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </label>

          <label className="registreeru-label" htmlFor="password">
            Parool
            <input
              type="password"
              id="password"
              name="password"
              className="registreeru-input"
              placeholder="Vali parool"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </label>

          <div className="registreeru-label" style={{ marginBottom: "0.55em", marginTop: "1.1em" }}>
            Roll:
          </div>
          <div className="registreeru-rollid" role="radiogroup" aria-labelledby="registreeru-title">
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

          <label className="registreeru-noustun">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              required
            />
            Nõustun&nbsp;
            <a
              href="/kasutustingimused"
              target="_blank"
              rel="noopener noreferrer"
            >
              kasutajatingimustega
            </a>
            &nbsp;ja&nbsp;
            <a
              href="/privaatsustingimused"
              target="_blank"
              rel="noopener noreferrer"
            >
              privaatsuspoliitikaga
            </a>
          </label>

          <button className="registreeru-submit" type="submit">
            Registreeru
          </button>
        </form>

        <div className="registreeru-bottom-link">
          <span>Mul on juba konto?</span>
          <button
            type="button"
            className="registreeru-login-link"
            onClick={openLoginModal}
            tabIndex={0}
          >
            Logi sisse
          </button>
        </div>
      </div>
    </div>
  );
}
