"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import LoginModal from "@/components/LoginModal";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import AutoFitPageTitle from "@/components/ui/AutoFitPageTitle";
import {
  glassPageBackMobileBottomCenterClassName,
  glassPageCloseClassName,
  glassPageRingCenteredClassName,
  glassPageShellCenteredClassName,
  glassPageTitleClassName,
  glassPageTitleMobileHeaderClassName
} from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";

const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName =
  `${glassPageTitleClassName} ${glassPageTitleMobileHeaderClassName} subpage-mobile-title subpage-mobile-title--static`;
const ringClassName = cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable");
const contentClassName =
  "mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-4";
const inputClassName = "w-full max-w-[22rem]";
const inputBaseClassName =
  "w-full rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow-hover,var(--input-shadow))] hover:[background:var(--input-bg-hover)] hover:shadow-[var(--input-shadow-hover,var(--input-shadow))] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed text-[1.25rem] py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
const primaryActionButtonClassName =
  "max-w-[22rem] whitespace-normal text-center leading-[1.2] px-[1.6rem] py-[1.05rem] text-[1.18rem] " +
  "max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]";

export default function UuendaPinBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();
  const { t, locale } = useI18n();

  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const [currentPin, setCurrentPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  const backLabel = t("buttons.back_previous");
  const returnToProfile = searchParams?.get("return") === "profile";
  const profileReturnPath = localizePath("/vestlus?profile=1", locale);
  const handleBack = () =>
    returnToProfile
      ? pushWithTransition(router, profileReturnPath, {
          glassRingTilt: "left",
          waitForGlassRingTilt: true,
          persistGlassRingTilt: false
        })
      : typeof window !== "undefined" && window.history.length > 1
        ? backWithTransition(router, {
            glassRingTilt: "left",
            waitForGlassRingTilt: true,
            persistGlassRingTilt: false
          })
        : pushWithTransition(router, localizePath("/profiil", locale), {
            glassRingTilt: "left",
            waitForGlassRingTilt: true,
            persistGlassRingTilt: false
          });
  const handleClose = () =>
    returnToProfile
      ? pushWithTransition(router, profileReturnPath, {
          glassRingTilt: "left",
          waitForGlassRingTilt: true,
          persistGlassRingTilt: false
        })
      : pushWithTransition(router, localizePath("/profiil", locale), {
          glassRingTilt: "left",
          waitForGlassRingTilt: true,
          persistGlassRingTilt: false
        });

  const pinLabel = t("profile.new_pin_label");
  const currentPinLabel = t("profile.current_pin_label");
  const confirmPinLabel = t("profile.confirm_pin_label");
  const usernameLabel = t("profile.email");
  const usernameAutoFill = session?.user?.email || "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (status !== "authenticated") {
      setError(t("profile.login_to_view"));
      setLoginOpen(true);
      return;
    }

    const currentClean = currentPin.replace(/\D/g, "").slice(0, PIN_MAX);
    const nextClean = nextPin.replace(/\D/g, "").slice(0, PIN_MAX);
    const confirmClean = confirmPin.replace(/\D/g, "").slice(0, PIN_MAX);

    if (!currentClean) {
      setError(t("profile.errors.current_pin_required"));
      return;
    }
    if (!nextClean || !confirmClean) {
      setError(t("profile.errors.pin_required"));
      return;
    }
    if (!/^\d{4,8}$/.test(nextClean)) {
      setError(
        t("profile.errors.pin_invalid", {
          min: PIN_MIN,
          max: PIN_MAX
        })
      );
      return;
    }
    if (nextClean !== confirmClean) {
      setError(t("profile.errors.pin_mismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: currentClean,
          password: nextClean,
          locale
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        setError(
          resolveApiMessage({
            payload,
            t,
            fallbackKey: "profile.update_failed"
          })
        );
        return;
      }
      setCurrentPin("");
      setNextPin("");
      setConfirmPin("");
      setSuccess(t("profile.success_pin_updated"));
    } catch (err) {
      console.error("update pin error", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section lang={locale} className={pageShellClassName}>
      <GlassRing className={ringClassName}>
        <CloseButton
          onClick={handleClose}
          ariaLabel={t("buttons.close")}
          className={cn(glassPageCloseClassName, "max-[768px]:hidden")}
        />
        <BackButton
          onClick={handleBack}
          ariaLabel={backLabel}
          holdPressedVisualDisabled
          className={glassPageBackMobileBottomCenterClassName}
        />
        <AutoFitPageTitle className={titleClassName} minFontPx={18} disableFit>
          {t("profile.change_password_cta")}
        </AutoFitPageTitle>
        <div className={contentClassName}>
          {status === "unauthenticated" ? <div className="flex w-full flex-col items-center gap-6 text-center">
              <p role="alert" className="text-[color:#fca5a5]">
                {t("profile.login_to_view")}
              </p>
              <Button type="button" variant="primary" className={primaryActionButtonClassName} onClick={() => setLoginOpen(true)}>
                <span>{t("auth.login.title")}</span>
              </Button>
            </div> : <form className="flex w-full flex-col items-center gap-7 text-center" onSubmit={handleSubmit} autoComplete="on" aria-busy={loading ? "true" : "false"}>
              <label htmlFor="pin-username" className="sr-only">
                {usernameLabel}
              </label>
              <input id="pin-username" name="username" type="text" autoComplete="username" value={usernameAutoFill} readOnly tabIndex={-1} className="sr-only" />
              <label htmlFor="current-pin" className="sr-only">
                {currentPinLabel}
              </label>
              <input type="password" id="current-pin" name="current-pin" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={currentPinLabel} value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="current-password" disabled={loading} />
              <label htmlFor="next-pin" className="sr-only">
                {pinLabel}
              </label>
              <input type="password" id="next-pin" name="next-pin" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={pinLabel} value={nextPin} onChange={e => setNextPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="new-password" disabled={loading} />
              <label htmlFor="confirm-pin" className="sr-only">
                {confirmPinLabel}
              </label>
              <input type="password" id="confirm-pin" name="confirm-pin" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={confirmPinLabel} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="new-password" disabled={loading} />
              {error ? <p role="alert" className="text-[color:#fca5a5]">
                  {error}
                </p> : null}
              {!error && success ? <p role="status" className="text-[color:#a7f3d0]">
                  {success}
                </p> : null}
              <div className="mt-[clamp(1.8rem,4.6vh,3rem)] flex justify-center">
                <Button type="submit" variant="primary" className={primaryActionButtonClassName} disabled={loading}>
                  <span>{loading ? t("profile.saving") : t("buttons.save")}</span>
                </Button>
              </div>
            </form>}
        </div>
      </GlassRing>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} suppressRedirect onAuthSuccess={() => {
      setLoginOpen(false);
      router.refresh();
    }} />
    </section>
  );
}
