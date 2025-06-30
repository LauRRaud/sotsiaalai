"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProfiilBody() {
  const [email, setEmail] = useState("email@domeen.ee");
  const [password, setPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    alert("Muudatused salvestatud! (demo)");
    setPassword("");
  }
  function handleLogout() {
    alert("Logitud välja! (demo)");
  }
  function handleDelete() {
    setShowDelete(false);
    alert("Konto kustutatud! (demo)");
  }

  return (
    <div className="page-bg-gradient">
      <div className="glass-box" role="main" aria-labelledby="profile-title">
        <h1 id="profile-title" className="glass-title">
          Minu profiil
        </h1>
        <form
          className="profile-form-vertical"
          onSubmit={handleSave}
          autoComplete="off"
        >
          <label htmlFor="email" className="glass-label">
            E-post
          </label>
          <input
            id="email"
            className="input-modern profile-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="glass-label">
            Uus parool
          </label>
          <input
            id="password"
            className="input-modern profile-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Jäta tühjaks, kui ei muuda"
          />

          <div className="profile-btn-row">
            <button type="submit" className="btn-primary">
              Salvesta
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleLogout}
            >
              Logi välja
            </button>
          </div>

          <button
            type="button"
            className="btn-tertiary profile-order-btn"
            onClick={() => alert("Tellimuse detailid (demo)!")}
          >
            Vaata tellimust
          </button>

          <Link href="/vestlus" className="back-link profile-back-link">
            &larr; Tagasi vestlusesse
          </Link>
        </form>

        {/* Kustuta konto link */}
        <button
          type="button"
          className="delete-link"
          onClick={() => setShowDelete(true)}
          tabIndex={0}
        >
          Kustuta konto
        </button>

        {/* Konto kustutamise modaal */}
        {showDelete && (
          <div className="modal-overlay">
            <div className="glass-modal modal-confirm">
              <p>
                Oled ikka kindel, et soovid oma konto kustutada? Seda ei saa tagasi võtta.
              </p>
              <div className="btn-row" style={{ marginTop: "1.3em" }}>
                <button className="btn-danger" onClick={handleDelete}>
                  Jah, kustuta
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowDelete(false)}
                >
                  Loobu
                </button>
              </div>
            </div>
          </div>
        )}
        <footer className="alaleht-footer">Sotsiaal.AI &copy; 2025</footer>
      </div>
    </div>
  );
}
