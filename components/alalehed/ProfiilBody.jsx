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
    <div className="profiil-hero">
      <div className="profiil-inner">
        <div className="profiil-box">
          <h1 className="alaleht-title">Minu profiil</h1>
          <form className="profiil-block" onSubmit={handleSave}>
            <div className="profile-label">E-post</div>
            <input
              className="profile-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="profile-label">Uus parool</div>
            <input
              className="profile-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Jäta tühjaks, kui ei muuda"
            />

            <div className="profile-subscription">
              <button
                type="button"
                className="profile-vieworder"
                onClick={() => alert("Tellimuse detailid (demo)!")}
              >
                Vaata tellimust
              </button>
            </div>

            <div className="profile-actions">
              <button type="submit" className="profile-save">
                Salvesta
              </button>
              <button
                type="button"
                className="profile-logout"
                onClick={handleLogout}
              >
                Logi välja
              </button>
            </div>

            <button
              type="button"
              className="profile-delete"
              onClick={() => setShowDelete(true)}
            >
              Kustuta konto
            </button>
          </form>

          {showDelete && (
            <div className="profile-delete-modal">
              <div className="profile-delete-content">
                <p>Oled ikka kindel, et soovid oma konto kustutada? Seda ei saa tagasi võtta.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "1em", marginTop: "1.2em" }}>
                  <button
                    className="profile-delete-confirm"
                    onClick={handleDelete}
                  >
                    Jah, kustuta
                  </button>
                  <button
                    className="profile-delete-cancel"
                    onClick={() => setShowDelete(false)}
                  >
                    Loobu
                  </button>
                </div>
              </div>
            </div>
          )}

          <Link href="/vestlus" className="back-link">
            &larr; Tagasi vestlusesse
          </Link>
        </div>
      </div>
    </div>
  );
}
