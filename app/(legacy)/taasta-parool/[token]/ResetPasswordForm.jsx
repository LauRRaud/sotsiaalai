"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
export default function ResetPasswordForm({
  token
}) {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!pin || !confirm) {
      setError(t("auth.resetForm.errors.required"));
      return;
    }
    if (pin !== confirm) {
      setError(t("auth.resetForm.errors.mismatch"));
      return;
    }
    if (!/^\d{4,8}$/.test(pin)) {
      setError(t("auth.resetForm.errors.pinLength", {
        min: PIN_MIN,
        max: PIN_MAX
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          pin
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || t("auth.resetForm.errors.updateFailed"));
        return;
      }
      setSuccess(true);
      setPin("");
      setConfirm("");
      router.refresh();
    } catch (err) {
      console.error("password reset update error", err);
      setError(t("auth.resetForm.errors.server"));
    } finally {
      setLoading(false);
    }
  }
  return <div className="main-content glass-box reset-box" lang={locale}>
      <h1 className="glass-title mb-[0.65em] text-center text-[2.05em] leading-[1.2] tracking-[0.03em] text-[color:#f2e3d4]">
        {t("auth.resetForm.title")}
      </h1>
      {success ? <div className="flex flex-col items-center">
          <p className="mt-8 text-center text-[1.1em] font-light leading-[1.56] tracking-[0.03em] text-[color:var(--pt-light)] mb-6">
            {t("auth.resetForm.success")}
          </p>
          <Link href={localizePath("/", locale)} className="btn-primary" style={{
        textAlign: "center"
      }}>
            {t("buttons.back_home")}
          </Link>
        </div> : <form className="flex w-full flex-col items-center gap-[0.7em] mb-[0.2em]" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="pin" className="flex w-full justify-center">
            <input type="password" id="pin" name="pin" className="reset-input" placeholder={t("auth.resetForm.fields.pin", {
          min: PIN_MIN,
          max: PIN_MAX
        })} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} autoComplete="new-password" disabled={loading} />
          </label>
          <label htmlFor="confirm" className="flex w-full justify-center">
            <input type="password" id="confirm" name="confirm" className="reset-input" placeholder={t("auth.resetForm.fields.confirm")} value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} autoComplete="new-password" disabled={loading} />
          </label>
          {error && <div role="alert" className="glass-note mb-3">
              {error}
            </div>}
          <button className="btn-primary mt-[0.35em] min-w-[10.5rem] self-center whitespace-normal px-[1.05em] py-[0.48em] text-[1.02em] transition-opacity disabled:cursor-wait disabled:opacity-[0.82]" type="submit" disabled={loading}>
            <span>
              {loading ? t("auth.resetForm.submitting") : t("auth.resetForm.submit")}
            </span>
          </button>
        </form>}
      <div className="mt-4 flex items-center justify-center">
        <button type="button" className="back-arrow-btn" onClick={() => pushWithTransition(router, localizePath("/", locale))} aria-label={t("buttons.back_home")}>
          <span className="back-arrow-circle"></span>
        </button>
      </div>
      <footer className="alaleht-footer mt-4 pb-3 pt-2 text-center opacity-95">
        {t("about.footer.note")}
      </footer>
    </div>;
}