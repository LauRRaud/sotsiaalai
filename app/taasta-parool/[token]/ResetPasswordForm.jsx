"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "mt-[clamp(2.2rem,5.6vh,3.4rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)]";
const contentClassName = "mt-[clamp(2.2rem,5.2vh,3.2rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-5 text-center";
const inputClassName = "w-full max-w-[22rem]";
const backButtonClassName = "absolute left-[calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] top-1/2 inline-flex h-[5.7rem] w-[5.7rem] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.15] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
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
  const backLabel = t("buttons.back_home");
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
  return (
    <section className={pageShellClassName} lang={locale}>
      <div className={circleClassName}>
        <button
          type="button"
          className={backButtonClassName}
          onClick={() => pushWithTransition(router, localizePath("/", locale))}
          aria-label={backLabel}
        >
          <span className={backIconClassName} aria-hidden="true" />
          <span className="sr-only">{backLabel}</span>
        </button>
        <h1 className={titleClassName}>{t("auth.resetForm.title")}</h1>
        <div className={contentClassName}>
          {success ? (
            <div className="flex flex-col items-center gap-6">
              <p className="text-center text-[1.05rem] leading-[1.6] opacity-80">
                {t("auth.resetForm.success")}
              </p>
              <Button as="a" href={localizePath("/", locale)} variant="primary" size="lg">
                {t("buttons.back_home")}
              </Button>
            </div>
          ) : (
            <form className="flex w-full flex-col items-center gap-4" onSubmit={handleSubmit} autoComplete="off">
              <label htmlFor="pin" className="sr-only">
                {t("auth.resetForm.fields.pin", { min: PIN_MIN, max: PIN_MAX })}
              </label>
              <Input
                type="password"
                id="pin"
                name="pin"
                size="lg"
                className={inputClassName}
                placeholder={t("auth.resetForm.fields.pin", { min: PIN_MIN, max: PIN_MAX })}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))}
                required
                minLength={PIN_MIN}
                autoComplete="new-password"
                disabled={loading}
              />
              <label htmlFor="confirm" className="sr-only">
                {t("auth.resetForm.fields.confirm")}
              </label>
              <Input
                type="password"
                id="confirm"
                name="confirm"
                size="lg"
                className={inputClassName}
                placeholder={t("auth.resetForm.fields.confirm")}
                value={confirm}
                onChange={e => setConfirm(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))}
                required
                minLength={PIN_MIN}
                autoComplete="new-password"
                disabled={loading}
              />
              {error && (
                <p role="alert" className="text-center text-[color:#fca5a5]">
                  {error}
                </p>
              )}
              <div className="mt-[0.5rem] flex justify-center">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? t("auth.resetForm.submitting") : t("auth.resetForm.submit")}
                </Button>
              </div>
            </form>
          )}
          <footer className="pt-3 text-center opacity-80">{t("about.footer.note")}</footer>
        </div>
      </div>
    </section>
  );
}
