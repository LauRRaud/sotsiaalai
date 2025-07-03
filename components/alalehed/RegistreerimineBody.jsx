"use client";
import { useState } from "react";
import Link from "next/link";

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
    <div className="page-bg-gradient">
      <div className="glass-box" role="main" aria-labelledby="registreeru-title">
        <h1 id="registreeru-title" className="glass-title">
          Loo konto
        </h1>

        <form
          className="glass-form"
          autoComplete="off"
          onSubmit={handleSubmit}
          role="form"
          aria-labelledby="registreeru-title"
        >
          <label htmlFor="email" className="glass-label">
            E-post
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
            Parool
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

          <div className="glass-label" style={{ margin: "1.1em 0 0.55em" }}>
            Roll:
          </div>
          <div
            className="glass-radio-group"
            role="radiogroup"
            aria-labelledby="registreeru-title"
          >
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

          <label className="glass-checkbox" style={{ margin: "1.3em 0 1.6em" }}>
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
              className="link-brand"
            >
              kasutajatingimustega
            </a>
            &nbsp;ja&nbsp;
            <a
              href="/privaatsustingimused"
              target="_blank"
              rel="noopener noreferrer"
              className="link-brand"
            >
              privaatsuspoliitikaga
            </a>
          </label>

          <button className="btn-primary" type="submit">
            Registreeru
          </button>
        </form>

        <div className="glass-bottom-link">
          <span>Mul on juba konto?</span>
          <button
            type="button"
            className="link-brand"
            onClick={openLoginModal}
            tabIndex={0}
          >
            Logi sisse
          </button>
        </div>

        <Link href="/" className="back-link">
          &larr; Avalehele
        </Link>

        <footer className="alaleht-footer">
          Sotsiaal.AI &copy; 2025
        </footer>
      </div>
    </div>
  );
}
