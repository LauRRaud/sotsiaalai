"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useId } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import OptionCard from "@/components/ui/OptionCard";
import RichText from "@/components/i18n/RichText";
import AppLink from "@/components/ui/Link";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName =
  `${glassPageTitleClassName} max-[48em]:!mt-0 max-[48em]:!mb-0 max-[48em]:!px-0`;
const contentClassName = "register-content mt-0 flex w-full flex-1 min-h-0 flex-col items-center pb-[clamp(1rem,3vh,1.8rem)]";
const scrollClassName = "register-scroll relative flex-1 w-full max-w-[clamp(18rem,39vw,25.2rem)] min-h-0 overflow-y-auto overflow-x-visible px-[0.6rem] text-left csp-container csp-no-neighbor-click mx-auto";
const registerTextClassName = "register-copy text-[1.25rem] leading-[1.45] text-[color:var(--pt-50)] light:text-[color:var(--input-text)]";
const inputClassName = `w-full ${registerTextClassName} placeholder:text-[color:var(--pt-200)]`;
const pinInputClassName = "placeholder:text-[#6b7280] light:placeholder:text-[#4b5563]";
const checkboxCardClassName = "register-checkbox-card w-full text-[1.05rem] leading-[1.42] px-[1.05rem] py-[0.9rem] text-[color:var(--pt-50)] light:text-[color:var(--input-text)]";
const registerControlVarsClassName = "[--seg-control-size:24px] [--seg-radio-dot-size:10px] [--seg-check-size:22px] [--seg-control-radius:0.5rem]";
const registerButtonClassName = "register-submit px-[1.85rem] py-[1rem] text-[1.28rem]";
const registerStepClassName = "register-step csp-step !min-h-0 !py-[0.36rem]";
const inputBaseClassName = "register-input w-full rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow-hover,var(--input-shadow))] hover:[background:var(--input-bg-hover)] hover:shadow-[var(--input-shadow-hover,var(--input-shadow))] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
export default function RegistreerimineBody({
  openLoginModal = null
}) {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const scrollRef = useRef(null);
  const handleClose = () => {
    pushWithTransition(router, localizePath("/", locale));
  };
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const initialForm = {
    email: "",
    pin: "",
    role: "",
    agree: false,
    guideAck: false
  };
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [scrollPad, setScrollPad] = useState(0);
  const [scrollPadTop, setScrollPadTop] = useState(0);
  const [scrollPadBottom, setScrollPadBottom] = useState(0);
  const roleLabelId = useId();
  const roleHintId = useId();
  const roleLabelText = t("auth.register.role_label_question", "Kes oled?");
  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "pin" ? value.replace(/\\D/g, "").slice(0, PIN_MAX) : type === "checkbox" ? checked : value
    }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!form.role) {
      setError(t("auth.register.error.role_required", "Vali roll."));
      return;
    }
    if (!form.agree || !form.guideAck) {
      setError(t("auth.register.error.agree_required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email.trim(),
          pin: form.pin,
          role: form.role
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.message || payload?.error || t("auth.register.error.failed"));
        return;
      }
      setSuccessMessage(t("auth.register.success_message", {
        email: form.email.trim()
      }));
      setForm(prev => ({
        ...initialForm,
        role: prev.role
      }));
      router.refresh();
    } catch (err) {
      console.error("Register error", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setSubmitting(false);
    }
  }
  const {
    canScrollUp,
    canScrollDown,
    scrollDirection,
    getItemClassName,
    recompute
  } = CenteredScrollPicker({
    containerRef: scrollRef,
    itemSelector: ".register-step",
    neighborDistance: 1,
    lockWheelToSteps: true,
    settleOnScroll: true,
    enableArrowKeys: true,
    allowArrowKeysInInputs: true,
    captureArrowKeys: true,
    settleMs: 0,
    maxStepPerSettle: 999
  });
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const updatePad = () => {
      const snapEl = scrollEl.querySelector(".register-step");
      if (!snapEl) return;
      const itemH = snapEl.getBoundingClientRect().height || 0;
      const viewH = Math.max(0, scrollEl.clientHeight || 0);
      if (!viewH || !itemH) return;
      const nextPad = Math.max(0, Math.floor((viewH - itemH) / 2));
      setScrollPad(prev => prev === nextPad ? prev : nextPad);
      const liftPx = typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 11;
      const nextTop = Math.max(0, nextPad - liftPx);
      const nextBottom = Math.max(0, nextPad + liftPx);
      setScrollPadTop(prev => prev === nextTop ? prev : nextTop);
      setScrollPadBottom(prev => prev === nextBottom ? prev : nextBottom);
    };
    updatePad();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updatePad) : null;
    ro?.observe(scrollEl);
    window.addEventListener("resize", updatePad);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", updatePad);
    };
  }, []);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      recompute("auto");
    });
    return () => cancelAnimationFrame(raf);
  }, [recompute]);
  useEffect(() => {
    const onKey = e => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      pushWithTransition(router, localizePath("/", locale));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, locale]);
  return <section className={pageShellClassName} lang={locale}>
      <GlassRing className="register-mobile-ring md:mt-0 md:mb-0 [--csp-chevron-top:-1.4rem] [--csp-chevron-bottom:-1.4rem]">
        <BackButton onClick={handleClose} ariaLabel={t("buttons.back_home")} className={glassPageBackClassName} />
        <div className="csp-overlayTitle [--csp-title-top:2.7rem] max-[48em]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+2.35rem)]" aria-hidden="true">
          <h1 className={titleClassName}>{t("auth.register.title")}</h1>
        </div>

        <div className={`csp-scrim csp-scrim--wide csp-scrim--top csp-scrim--chevron ${"is-visible"} ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <span className="csp-chevron-icon" />
          </span>
        </div>
        <div className={`csp-scrim csp-scrim--wide csp-scrim--bottom csp-scrim--chevron ${"is-visible"} ${scrollDirection === "up" ? "is-muted" : ""} ${canScrollDown ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <span className="csp-chevron-icon" />
          </span>
        </div>

        <div className={contentClassName}>
          <div ref={scrollRef} className={`${scrollClassName} [--csp-active-scale:1] [--csp-neighbor-scale:0.92] [--csp-hidden-scale:0.86] [--csp-neighbor-opacity:0.15] [--csp-hidden-opacity:0] max-[48em]:[--csp-neighbor-opacity:0] max-[48em]:[--csp-hidden-opacity:0]`} style={{
          "--csp-pad-top": `${Math.max(0, scrollPadTop || scrollPad)}px`,
          "--csp-pad-bottom": `${Math.max(0, scrollPadBottom || scrollPad)}px`
        }} tabIndex={0} aria-label={t("auth.register.title")}>
            <form className="register-form flex flex-col gap-[2rem]" onSubmit={handleSubmit} autoComplete="off">
              <section className={`${registerStepClassName} ${getItemClassName(0)}`}>
                <input type="email" id="email" name="email" className={`${inputBaseClassName} ${inputClassName} ${pinInputClassName}`.trim()} placeholder={t("auth.email_placeholder")} value={form.email} onChange={handleChange} required autoComplete="username" />
              </section>

              <section className={`${registerStepClassName} ${getItemClassName(1)}`}>
                <input type="password" id="pin" name="pin" className={`${inputBaseClassName} ${inputClassName} ${pinInputClassName}`.trim()} placeholder={t("auth.pin_placeholder", {
                min: PIN_MIN,
                max: PIN_MAX
              })} value={form.pin} onChange={handleChange} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="off" inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} />
              </section>

              <section className={`${registerStepClassName} ${getItemClassName(2)}`}>
                <div id={roleLabelId} className="mb-[0.9rem] text-center text-[1.35rem] font-medium tracking-[0.02em] text-[color:var(--title-color,var(--brand-primary))]">
                  {roleLabelText}
                </div>
                <div className="register-role-options flex flex-col gap-[0.75rem]" role="radiogroup" aria-labelledby={roleLabelId} aria-describedby={roleHintId}>
                  <div id={roleHintId} className="sr-only">
                    {t("auth.register.role_hint", "Vali roll nooleklahvidega. Valikud: SotsiaaltГ'кА?Г'кА? spetsialist vГ'кАзi ElukГ'какsimusega pГ'кА?Г'кА?rduja.")}
                  </div>
                <OptionCard type="radio" name="role" value="SOCIAL_WORKER" checked={form.role === "SOCIAL_WORKER"} onChange={handleChange} className={`register-option-card w-full ${registerTextClassName} py-[1.1rem] ${registerControlVarsClassName}`}>
                  {t("role.worker")}
                </OptionCard>
                <OptionCard type="radio" name="role" value="CLIENT" checked={form.role === "CLIENT"} onChange={handleChange} className={`register-option-card w-full ${registerTextClassName} py-[1.1rem] ${registerControlVarsClassName}`}>
                  {t("role.client")}
                </OptionCard>
                </div>
              </section>

              <section className={`${registerStepClassName} ${getItemClassName(3)}`}>
                <OptionCard type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className={`register-agree-card ${checkboxCardClassName} ${registerControlVarsClassName}`}>
                    <RichText value={t("auth.register.agreement")} replacements={{
                    terms: {
                      open: `<a class="${linkBrandInlineClass}" href="${localizePath("/kasutustingimused", locale)}">`,
                      close: "</a>"
                    },
                    privacy: {
                      open: `<a class="${linkBrandInlineClass}" href="${localizePath("/privaatsustingimused", locale)}">`,
                      close: "</a>"
                    }
                  }} />
                </OptionCard>
              </section>

              <section className={`${registerStepClassName} ${getItemClassName(4)}`}>
                <OptionCard type="checkbox" name="guideAck" checked={form.guideAck} onChange={handleChange} className={`register-guide-card ${checkboxCardClassName} ${registerControlVarsClassName}`}>
                    <RichText value={t("auth.register.guide_ack")} replacements={{
                    guide1: {
                      open: `<a class="${linkBrandInlineClass}" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>"
                    },
                    guide2: {
                      open: `<a class="${linkBrandInlineClass}" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>"
                    }
                  }} />
                </OptionCard>
              </section>

              <section className={`${registerStepClassName} ${getItemClassName(5)}`}>
                {error && <div role="alert" className="rounded-[0.85rem] border border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.12)] px-[0.85rem] py-[0.65rem] text-[color:#fca5a5]">
                    {error}
                  </div>}
                {successMessage && <div role="status" className="rounded-[0.85rem] border border-[rgba(110,231,183,0.35)] bg-[rgba(16,185,129,0.12)] px-[0.85rem] py-[0.65rem] text-[color:#a7f3d0]">
                    {successMessage}
                  </div>}
                <div className="flex justify-center">
                  <Button type="submit" variant="primary" className={registerButtonClassName} disabled={submitting}>
                    <span>
                      {submitting ? t("auth.register.submitting") : t("auth.register.submit")}
                    </span>
                  </Button>
                </div>
              </section>

              <section className={`${registerStepClassName} ${getItemClassName(6)}`}>
                <div className={`flex justify-center ${registerTextClassName}`}>
                  <AppLink href="#" onClick={e => {
                    e.preventDefault();
                    openLoginModal?.();
                  }} aria-label={t("auth.login.title")} className="text-[1em] [--link-brand-text:#c57171] [--link-brand-border-hover:#c57171] [--link-brand-shadow-hover:rgba(197,113,113,0.35)] light:[--link-color:#7A3A38]">
                      {t("auth.login.title")}
                  </AppLink>
                </div>
              </section>
            </form>
          </div>
        </div>
      </GlassRing>
    </section>;
}
