"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoginModal from "@/components/LoginModal";
import { pushWithTransition } from "@/lib/routeTransition";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    setStatusMsg("");
    setError("");
  }, [token]);

  const joinErrorText = t("join.error", "Liitumine ebaõnnestus");

  if (!token) {
    return (
      <main id="main" className="main-content glass-box profile-container">
        <h1 className="glass-title">{t("join.missing_title", "Kutse link puudub")}</h1>
        <p>{t("join.missing_description", "Palun ava kutselink oma e-postist.")}</p>
      </main>
    );
  }

  async function accept() {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError(t("join.name_required", "Palun sisesta oma nimi."));
      return;
    }
    setBusy(true);
    setError("");
    setStatusMsg("");
    try {
      const res = await fetch(`/api/invites/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: trimmedName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        const msg = data?.message || joinErrorText;
        throw new Error(msg);
      }
      setStatusMsg(t("join.success", "Liitumine õnnestus"));
      if (data?.roomId) {
        pushWithTransition(router, `/vestlus?roomId=${encodeURIComponent(data.roomId)}`);
      } else {
        pushWithTransition(router, "/vestlus");
      }
    } catch (err) {
      setError(err?.message || joinErrorText);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="main-content glass-box profile-container">
      <h1 className="glass-title">{t("join.heading", "Liitu vestlusega")}</h1>
      <p className="glass-lead">{t("join.lead", "Kinnitame kutse ja lisame sind ruumi.")}</p>

      {status !== "authenticated" ? (
        <div className="glass-section">
          <p>{t("join.signin_prompt", "Logi sisse või loo konto, et liituda.")}</p>
          <Button type="button" onClick={() => setLoginOpen(true)}>
            {t("join.signin", "Logi sisse")}
          </Button>
        </div>
      ) : (
        <div className="glass-section">
          <p>
            {t("join.logged_in_as", "Oled sisse logitud kasutajana {email}.", {
              email: session?.user?.email || session?.user?.id,
            })}
          </p>
          <label className="mt-[1rem] block font-semibold tracking-[0.03em]" htmlFor="join-display-name">
            {t("join.name_label", "Sinu nimi vestluses")}
          </label>
          <Input
            id="join-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={busy}
          />
          <Button type="button" onClick={accept} disabled={busy}>
            {busy ? t("join.joining", "Liidan...") : t("join.join_button", "Liitu")}
          </Button>
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
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} suppressRedirect />
    </main>
  );
}
