"use client";
import { useState, useEffect } from "react";

export default function TellimusBody() {
  // Staatus on alguses "puudub"
  const [status, setStatus] = useState("puudub");
  const [role, setRole] = useState("specialist");
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("saai_roll");
    if (storedRole) setRole(storedRole);
  }, []);

  function handleMaksa() {
    setStatus("aktiivne");
    alert("Maksekeskuse makseleht avaneks siin! (demo)");
  }

  function handleCancel() {
    setShowCancel(true);
  }

  function confirmCancel() {
    setShowCancel(false);
    setStatus("lõppenud");
    alert("Tellimus tühistatud! (demo)");
  }

  return (
    <div className="page-bg-gradient">
      <div className="alaleht-inner">
        <div className="glass-box">
          <h1 className="glass-title">Halda tellimust</h1>
          <div className="tellimus-info-list">
            <div>
              <b>Tellimuse staatus:</b>{" "}
              <span className={`tellimus-status-pill status-${status}`}>
                {status === "aktiivne"
                  ? "Aktiivne"
                  : status === "lõppenud"
                  ? "Lõppenud"
                  : "Pole tellimust"}
              </span>
            </div>
            <div>
              <b>Roll:</b>{" "}
              {role === "specialist" ? "Spetsialist" : "Eluküsimusega pöörduja"}
            </div>
            <div>
              <b>Kuutasu:</b> 7.99 € / kuu
            </div>
            <div>
              <b>Kehtiv kuni:</b>{" "}
              {status === "aktiivne" ? "30.08.2025" : "—"}
            </div>
            <div>
              <b>E-post:</b>{" "}
              {localStorage.getItem("saai_email") || "kasutaja@email.ee"}
            </div>
          </div>

          {status !== "aktiivne" && (
            <button className="btn-primary" onClick={handleMaksa}>
              Maksa ja aktiveeri tellimus
            </button>
          )}

          {status === "aktiivne" && (
            <button className="btn-danger" onClick={handleCancel}>
              Tühista tellimus
            </button>
          )}

          <div className="back-btn-wrapper">
            <button
              type="button"
              className="back-arrow-btn"
              onClick={() => window.history.back()}
              aria-label="Tagasi"
            >
              <span className="back-arrow-circle"></span>
            </button>
          </div>

          <footer className="alaleht-footer">Sotsiaal.AI &copy; 2025</footer>
        </div>
      </div>

      {/* Tühistamise kinnitusmodal */}
      {showCancel && (
        <div className="modal-confirm">
          <p>Kas oled kindel, et soovid tellimuse tühistada?</p>
          <div className="btn-row">
            <button className="btn-danger" onClick={confirmCancel}>
              Jah, tühista
            </button>
            <button
              className="btn-tertiary"
              onClick={() => setShowCancel(false)}
            >
              Katkesta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
