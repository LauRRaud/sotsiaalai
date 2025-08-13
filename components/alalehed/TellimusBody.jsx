"use client";
import { useState, useEffect } from "react";

export default function TellimusBody() {
  const [status, setStatus] = useState("puudub");
  const [role, setRole] = useState("specialist");
  const [email, setEmail] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("saai_roll");
    if (storedRole) setRole(storedRole);
    const storedEmail = localStorage.getItem("saai_email");
    if (storedEmail) setEmail(storedEmail);
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
    <>
<div className="main-content glass-box">
        {/* Lehe pealkiri */}
        <h1 className="glass-title">Halda tellimust</h1>

        {/* Tellimuse staatus */}
        <div className="tellimus-status-center">
          <div className="tellimus-status-label">Tellimuse staatus</div>
          <span className={`tellimus-status-pill status-${status}`}>
            {status === "aktiivne" ? "Aktiivne" : status === "lõppenud" ? "Lõppenud" : "Puudub"}
          </span>
        </div>

        {/* Tellimuse detailid */}
        <div className="tellimus-info-list">
          <div>
            <b>Roll:</b>{" "}
            {role === "specialist" ? "Spetsialist" : "Eluküsimusega pöörduja"}
          </div>
          <div>
            <b>Kuutasu:</b> 7.99 €
          </div>
          <div>
            <b>Kehtiv kuni:</b>{" "}
            {status === "aktiivne" ? "30.08.2025" : "—"}
          </div>
          <div>
            <b>E-post:</b> {email || "kasutaja@email.ee"}
          </div>
        </div>

        {/* Peamine nupp keskel */}
        <div className="tellimus-btn-center">
          {status !== "aktiivne" ? (
            <button className="btn-primary" onClick={handleMaksa}>
              Alusta tellimist
            </button>
          ) : (
            <button className="btn-danger" onClick={handleCancel}>
              Tühista tellimus
            </button>
          )}
        </div>

        {/* Tagasi-nupp */}
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

        <footer className="alaleht-footer">
          SotsiaalAI &copy; 2025
        </footer>
      </div>

      {showCancel && (
        <div className="modal-confirm" role="dialog" aria-modal="true">
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
    </>
  );
}
