"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    setStatusMsg("");
    setError("");
  }, [token]);

  if (!token) {
    return (
      <main id="main" className="main-content glass-box profile-container">
        <h1 className="glass-title">Kutse link puudub</h1>
        <p>Palun ava kutselink oma e-postist.</p>
      </main>
    );
  }

  async function accept() {
    setBusy(true);
    setError("");
    setStatusMsg("");
    try {
      const res = await fetch(`/api/invites/${encodeURIComponent(token)}/accept`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        const msg = data?.message || "Liitumine ebaõnnestus";
        throw new Error(msg);
      }
      setStatusMsg("Liitumine õnnestus");
      if (data?.roomId) {
        router.push(`/vestlus?roomId=${encodeURIComponent(data.roomId)}`);
      } else {
        router.push("/vestlus");
      }
    } catch (err) {
      setError(err?.message || "Liitumine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="main-content glass-box profile-container">
      <h1 className="glass-title">Liitu vestlusega</h1>
      <p className="glass-lead">Kinnitame kutse ja lisame sind ruumi.</p>

      {status !== "authenticated" ? (
        <div className="glass-section">
          <p>Logi sisse või loo konto, et liituda.</p>
          <button type="button" className="btn-primary" onClick={() => signIn()}>
            Logi sisse
          </button>
        </div>
      ) : (
        <div className="glass-section">
          <p>Oled sisse logitud kasutajana {session?.user?.email || session?.user?.id}.</p>
          <button type="button" className="btn-primary" onClick={accept} disabled={busy}>
            {busy ? "Liidan..." : "Liitu"}
          </button>
        </div>
      )}

      {statusMsg ? (
        <div className="glass-note glass-note--success" role="status">
          {statusMsg}
        </div>
      ) : null}
      {error ? (
        <div className="glass-note glass-note--error" role="alert">
          {error}
        </div>
      ) : null}
    </main>
  );
}
