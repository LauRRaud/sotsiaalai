"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModalConfirm from "@/components/ui/ModalConfirm";

export default function ProfiilBody() {
  const [email, setEmail] = useState("email@domeen.ee");
  const [password, setPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [userRole, setUserRole] = useState("specialist");
  const router = useRouter();

  // Rolli kuvamise map
  const roleMap = {
    specialist: "Spetsialist",
    user: "Eluküsimusega pöörduja",
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("saai_roll");
    if (storedRole) setUserRole(storedRole);

    const storedEmail = localStorage.getItem("saai_email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  function handleSave(e) {
    e.preventDefault();
    localStorage.setItem("saai_email", email);
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
    <main className="main-content profile-page">
      <div
        className="glass-box"
        role="main"
        aria-labelledby="profile-title"
        lang="et"
      >
        <h1 id="profile-title" className="glass-title">
          Minu profiil
        </h1>

        <div className="profile-header-center">
          <span className="profile-role-pill">{roleMap[userRole] || "—"}</span>
          <Link href="/tellimus" className="link-brand profile-tellimus-link">
            Halda tellimust
          </Link>
        </div>

        <form onSubmit={handleSave} className="glass-form profile-form-vertical">
          <label htmlFor="email" className="glass-label">
            E-post
          </label>
          <input
            className="input-modern"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className="glass-label">
            Uus parool (soovi korral)
          </label>
          <input
            className="input-modern"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="profile-btn-row">
            <button type="submit" className="btn-primary btn-profile-save">
              Salvesta
            </button>
            <button
              type="button"
              className="btn-primary btn-profile-logout"
              onClick={handleLogout}
            >
              Logi välja
            </button>
          </div>
        </form>

        {/* Tagasi vestlusesse */}
        <div className="back-btn-wrapper">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => router.push("/vestlus")}
            aria-label="Tagasi vestlusesse"
          >
            <span className="back-arrow-circle"></span>
          </button>
        </div>

        {/* Kustuta konto */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="button"
            type="button"
            onClick={() => setShowDelete(true)}
          >
            <svg viewBox="0 0 448 512" className="svgIcon">
              <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
            </svg>
          </button>
        </div>

        <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>

        {/* Modal korduvkasutatava komponendiga */}
        {showDelete && (
          <ModalConfirm
            message="Kas oled kindel, et soovid konto kustutada?"
            confirmLabel="Jah, kustuta"
            cancelLabel="Katkesta"
            onConfirm={handleDelete}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </div>
    </main>
  );
}
