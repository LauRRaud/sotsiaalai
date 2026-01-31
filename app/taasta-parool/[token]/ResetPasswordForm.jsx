"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageShellClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";

const pageShellClassName = glassPageShellClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = "mt-[clamp(2.2rem,5.2vh,3.2rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-5 text-center";
const inputClassName = "w-full max-w-[22rem]";
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
      <GlassRing>
        <BackButton
          onClick={() => pushWithTransition(router, localizePath("/", locale))}
          ariaLabel={backLabel}
          className={glassPageBackClassName}
        />
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
      </GlassRing>
    </section>
  );
}
