"use client";
import { useState } from "react";
import Link from "next/link";

export default function ProfiilBody() {
  const [email, setEmail] = useState("email@domeen.ee");
  const [password, setPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const userRole = "Spetsialist"; // või "Abivajaja"

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

        <form onSubmit={handleSave} className="glass-form profile-form-vertical">

          {/* Rolli kuvamine nagu label */}
          <label className="glass-label" style={{marginTop: 0}}>Roll</label>
          <div className="input-modern" style={{marginBottom: "1.1em", color: "#fff", fontWeight: 500}}>
            {userRole}
          </div>

          <label htmlFor="email" className="glass-label">E-post</label>
          <input
            className="input-modern"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className="glass-label">Uus parool (soovi korral)</label>
          <input
            className="input-modern"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="profile-btn-row">
            <button type="submit" className="btn-primary">Salvesta</button>
            <button type="button" className="btn-secondary" onClick={handleLogout}>Logi välja</button>
          </div>
        </form>

        <button
          className="profile-order-btn"
          type="button"
          onClick={() => alert("Tellimuse info (demo)!")}
        >
          Vaata tellimust
        </button>

<Link href="/vestlus" className="back-link" tabIndex={0}>
  &larr; Tagasi vestlusesse
</Link>

        <button
          className="delete-link"
          type="button"
          onClick={() => setShowDelete(true)}
        >
          Kustuta konto
        </button>

        {showDelete && (
          <div className="modal-confirm">
            <p>Kas oled kindel, et soovid konto kustutada?</p>
            <div className="btn-row">
              <button className="btn-danger" onClick={handleDelete}>Jah, kustuta</button>
              <button className="btn-tertiary" onClick={() => setShowDelete(false)}>Katkesta</button>
            </div>
          </div>
        )}

        <footer className="alaleht-footer">
          Sotsiaal.AI &copy; 2025
        </footer>
      </div>
    </div>
  );
}
