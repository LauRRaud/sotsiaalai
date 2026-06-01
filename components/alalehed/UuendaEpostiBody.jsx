"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import LoginModal from "@/components/LoginModal";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import GlowField from "@/components/ui/GlowField";
import useGlassFieldHoleMask from "@/components/ui/useGlassFieldHoleMask";
import { glassFormInputBaseClassName, glassPageBackMobileBottomCenterClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName =
  `${glassPageTitleClassName} subpage-mobile-title policy-mobile-title policy-mobile-title--static max-[768px]:!mt-0 max-[768px]:!mb-0`;
const mobileTitleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const ringClassName = cn(
  glassPageRingCenteredClassName,
  "glass-ring--desktop-stable mobile-keep-desktop-glass-cards [--glass-ring-surface-bg:var(--glass-surface-bg,rgba(0,0,0,0.25))]"
);
const contentClassName = "update-email-content relative z-[1] mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(21rem,62vw,32rem)] min-[769px]:max-[1120px]:max-w-[clamp(20rem,56vw,29.4rem)] flex-col gap-4";
const inputClassName = "w-full max-w-[26.25rem] min-[769px]:max-[1120px]:max-w-[24.9rem] max-[768px]:max-w-[min(100%,26.25rem)]";
const inputBaseClassName = `${glassFormInputBaseClassName} text-[1.25rem] py-[0.95rem] px-[1.5rem] min-h-[3.6rem]`;
const primaryActionButtonClassName =
  "max-w-[22rem] whitespace-normal text-center leading-[1.2] px-[1.6rem] py-[1.05rem] text-[1.18rem] " +
  "max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]";
const UPDATE_EMAIL_FIELD_HOLE_SELECTORS = [".update-email-content .ui-glow-field"];
export default function UuendaEpostiBody() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const {
    t,
    locale
  } = useI18n();
  const ringRef = useRef(null);
  const maskLayerRef = useRef(null);
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  useGlassFieldHoleMask({
    rootRef: ringRef,
    maskLayerRef,
    selectors: UPDATE_EMAIL_FIELD_HOLE_SELECTORS,
    enabled: true,
  });
  const errorId = error ? "update-email-error" : undefined;
  const backLabel = t("buttons.back_previous");
  const pinPlaceholder = t("profile.email_update.pin_placeholder");
  const usernameLabel = t("profile.email");
  const usernameAutoFill =
    (currentEmail || session?.user?.email || email || "").trim().toLowerCase();
  const searchParams = useSearchParams();
  const returnToProfile = searchParams?.get("return") === "profile";
  const returnToOrbitMenu = returnToProfile && searchParams?.get("orbit") === "1";
  const profileReturnPath = localizePath(returnToOrbitMenu ? "/profiil?orbit=1" : "/vestlus?profile=1", locale);
  const handleBack = () => returnToProfile ? pushWithTransition(router, profileReturnPath, {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  }) : typeof window !== "undefined" && window.history.length > 1 ? backWithTransition(router, {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  }) : pushWithTransition(router, localizePath("/profiil", locale), {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  });
  useEffect(() => {
    if (status !== "authenticated") return;
    let isActive = true;
    const loadCurrentEmail = async () => {
      try {
        const res = await fetch("/api/profile", {
          cache: "no-store"
        });
        const payload = await res.json().catch(() => ({}));
        if (!isActive) return;
        if (res.ok) {
          setCurrentEmail(payload?.user?.email || "");
        }
      } catch (err) {
        console.error("update email profile load", err);
      }
    };
    loadCurrentEmail();
    return () => {
      isActive = false;
    };
  }, [status]);
  useEffect(() => {
    if (status !== "unauthenticated") return;
    setError("");
  }, [status]);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (status !== "authenticated") {
      setError(t("profile.login_to_view"));
      setLoginOpen(true);
      return;
    }
    const nextEmail = email.trim().toLowerCase();
    const pinClean = pin.replace(/\D/g, "");
    if (!nextEmail) {
      setError(t("profile.email_update.error_email_required"));
      return;
    }
    if (!nextEmail.includes("@")) {
      setError(t("profile.email_update.error_email_invalid"));
      return;
    }
    if (!pinClean) {
      setError(t("profile.email_update.error_pin_required"));
      return;
    }
    if (pinClean.length < PIN_MIN || pinClean.length > PIN_MAX) {
      setError(t("profile.email_update.error_pin_length", {
        min: PIN_MIN,
        max: PIN_MAX
      }));
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
          email: nextEmail,
          currentPassword: pinClean,
          locale
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        setError(resolveApiMessage({
          payload,
          t,
          fallbackKey: "profile.email_update.error_failed"
        }));
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("update email error", err);
      setError(t("profile.email_update.error_failed"));
    } finally {
      setLoading(false);
    }
  }
  const unauthenticated = status === "unauthenticated";
  return <section lang={locale} className={pageShellClassName}>
      <GlassRing ref={ringRef} className={cn(ringClassName, "glass-field-hole-surface")}>
        <div ref={maskLayerRef} className="glass-hole-mask-layer" aria-hidden="true" />
        <BackButton onClick={handleBack} ariaLabel={backLabel} holdPressedVisualDisabled className={`${glassPageBackMobileBottomCenterClassName} scroll-reactive-back`} />
        <div className={mobileTitleWrapClassName}>
          <h1 className={titleClassName}>
            {t("profile.email_update.title")}
          </h1>
        </div>
        <div className={contentClassName}>
          {unauthenticated ? <div className="flex w-full flex-col items-center gap-6 text-center">
              <p className="text-[color:#fca5a5]">
                {t("profile.login_to_view")}
              </p>
              <Button type="button" variant="primary" className={primaryActionButtonClassName} onClick={() => setLoginOpen(true)}>
                <span>{t("auth.login.title")}</span>
              </Button>
            </div> : submitted ? <div className="flex flex-col gap-4 text-center">
              <p className="auth-success-text">
                {t("profile.email_update.success")}
              </p>
            </div> : <form className="flex w-full flex-col items-center gap-7 text-center" onSubmit={handleSubmit} autoComplete="on" aria-busy={loading ? "true" : "false"}>
              <input aria-label={usernameLabel} id="email-username" name="username" type="email" autoComplete="username" value={usernameAutoFill} readOnly tabIndex={-1} className="sr-only" />
              <label htmlFor="current-email" className="sr-only">
                {t("profile.email_update.current_placeholder")}
              </label>
              <GlowField className={inputClassName}>
                <input type="email" id="current-email" name="current-email" className={cn(inputBaseClassName, "ui-glow-control")} placeholder={t("profile.email_update.current_placeholder")} value={currentEmail} readOnly aria-readonly="true" autoComplete="username" inputMode="email" />
              </GlowField>
              <label htmlFor="email" className="sr-only">
                {t("profile.email_update.new_placeholder")}
              </label>
              <GlowField className={inputClassName}>
                <input type="email" id="email" name="email" className={cn(inputBaseClassName, "ui-glow-control")} placeholder={t("profile.email_update.new_placeholder")} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" inputMode="email" disabled={loading} aria-invalid={error ? "true" : "false"} aria-describedby={errorId} />
              </GlowField>
              <label htmlFor="pin" className="sr-only">
                {t("profile.email_update.pin_placeholder")}
              </label>
              <GlowField className={inputClassName}>
                <input type="password" id="pin" name="pin" className={cn(inputBaseClassName, "ui-glow-control")} placeholder={pinPlaceholder} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="current-password" disabled={loading} />
              </GlowField>
              {error && <p id={errorId} role="alert" className="text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.8rem,4.6vh,3rem)] flex justify-center">
                <Button type="submit" variant="primary" className={primaryActionButtonClassName} disabled={loading}>
                  <span>
                    {loading ? t("profile.email_update.submitting") : t("profile.email_update.submit")}
                  </span>
                </Button>
              </div>
            </form>}
        </div>
      </GlassRing>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} suppressRedirect onAuthSuccess={() => {
      setLoginOpen(false);
      router.refresh();
    }} />
    </section>;
}
