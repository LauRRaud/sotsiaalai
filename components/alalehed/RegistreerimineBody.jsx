"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useId } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import OptionCard from "@/components/ui/OptionCard";
import RichText from "@/components/i18n/RichText";
import AppLink from "@/components/ui/Link";
import { localizePath } from "@/lib/localizePath";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.6rem,4.4vw,2.8rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "text-center text-[clamp(1.9rem,1.2rem+1.6vw,2.5rem)] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const contentClassName = "mt-0 flex w-full flex-1 min-h-0 flex-col items-center pb-[clamp(1rem,3vh,1.8rem)]";
const scrollClassName = "relative flex-1 w-full max-w-[clamp(18rem,40vw,26rem)] min-h-0 overflow-y-auto overflow-x-visible px-[0.6rem] text-left csp-container csp-no-neighbor-click mx-auto";
const inputClassName = "w-full text-[color:var(--pt-50)] placeholder:text-[color:var(--pt-200)] light:text-[color:var(--input-text)]";
const backButtonClassName = "absolute left-[calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] top-[51.5%] inline-flex h-[5.7rem] w-[5.7rem] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.15] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
const inputBaseClassName = "w-full rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow)] hover:[background:var(--input-bg-hover)] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed text-[1.25rem] py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
const buttonBaseClassName = "inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.35rem] py-[0.8rem] text-[1.2rem] font-[500] tracking-[0.02em] min-h-[2.85rem] select-none relative transition-[transform,background,border-color,box-shadow,color] duration-150 ease-out cursor-pointer backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const buttonPrimaryClassName = "text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] [border:var(--btn-primary-border)] shadow-[var(--btn-primary-shadow)] hover:[background:var(--btn-primary-bg-hover)] hover:[border:var(--btn-primary-border-hover)] hover:-translate-y-[1px] focus-visible:[background:var(--btn-primary-bg-hover)] focus-visible:[border:var(--btn-primary-border-hover)] focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:translate-y-[1px] active:[background:var(--btn-primary-bg-active)] active:[border:var(--btn-primary-border-active)] active:shadow-[var(--btn-primary-shadow-active)]";
const linkInlineClassName =
  "inline-block text-[0.95em] font-[500] tracking-[0.02em] px-[0.18em] py-[0.02em] rounded-[0.32em] border-[2px] border-transparent no-underline " +
  "text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "transition-[border-color,box-shadow,color] duration-150 " +
  "hover:text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "hover:border-[color:var(--link-brand-border-hover,#e1a0a0)] " +
  "hover:shadow-[0_0_0.4375rem_0_var(--link-brand-shadow-hover,rgba(175,170,163,0.4))] " +
  "focus-visible:outline-none " +
  "focus-visible:border-[color:var(--link-brand-border-hover,#e1a0a0)] " +
  "focus-visible:shadow-[0_0_0.4375rem_0_var(--link-brand-shadow-hover,rgba(175,170,163,0.4))] " +
  "light:text-[color:var(--link-color)] light:border-transparent " +
  "light:hover:text-[color:var(--link-color)] light:hover:border-[color:var(--link-color)] " +
  "light:focus-visible:text-[color:var(--link-color)] light:focus-visible:border-[color:var(--link-color)]";
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
    const getCssPx = (el, varName) => {
      const raw = window.getComputedStyle(el).getPropertyValue(varName).trim();
      if (!raw) return 0;
      const value = Number.parseFloat(raw);
      return Number.isFinite(value) ? value : 0;
    };
    const updatePad = () => {
      const snapEl = scrollEl.querySelector(".register-step");
      if (!snapEl) return;
      const itemH = snapEl.getBoundingClientRect().height || 0;
      const titleOffset = getCssPx(scrollEl, "--csp-title-offset");
      const viewH = Math.max(0, (scrollEl.clientHeight || 0) - titleOffset);
      if (!viewH || !itemH) return;
      const nextPad = Math.max(0, Math.floor((viewH - itemH) / 2));
      setScrollPad(prev => prev === nextPad ? prev : nextPad);
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
      <div className={circleClassName} style={{
      "--csp-chevron-top": "-1.4rem",
      "--csp-chevron-bottom": "-1.4rem"
    }}>
        <button type="button" className={backButtonClassName} onClick={handleClose} aria-label={t("buttons.back_home")}>
          <span className={backIconClassName} />
        </button>
        <div className="csp-overlayTitle" style={{
        "--csp-title-top": "2.7rem"
      }} aria-hidden="true">
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
          <div ref={scrollRef} className={scrollClassName} style={{
          "--csp-pad-top": `${Math.max(0, scrollPad)}px`,
          "--csp-pad-bottom": `${Math.max(0, scrollPad)}px`,
          "--csp-active-scale": "1",
          "--csp-neighbor-scale": "0.92",
          "--csp-hidden-scale": "0.86",
          "--csp-neighbor-opacity": "0.15",
          "--csp-hidden-opacity": "0"
        }} tabIndex={0} aria-label={t("auth.register.title")}>
            <form className="flex flex-col gap-8" onSubmit={handleSubmit} autoComplete="off">
              <section className={`register-step csp-step ${getItemClassName(0)}`}>
                <input type="email" id="email" name="email" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={t("auth.email_placeholder")} value={form.email} onChange={handleChange} required autoComplete="username" />
              </section>

              <section className={`register-step csp-step ${getItemClassName(1)} -mt-4`}>
                <input type="password" id="pin" name="pin" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={t("auth.pin_placeholder", {
                min: PIN_MIN,
                max: PIN_MAX
              })} value={form.pin} onChange={handleChange} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="off" inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} />
              </section>

              <section className={`register-step csp-step ${getItemClassName(2)} mt-3`}>
                <div id={roleLabelId} className="mb-3 text-center text-[1.35rem] font-medium tracking-[0.02em] text-[color:var(--title-color,var(--brand-primary))]">
                  {roleLabelText}
                </div>
                <div className="flex flex-col gap-6" role="radiogroup" aria-labelledby={roleLabelId} aria-describedby={roleHintId}>
                  <div id={roleHintId} className="sr-only">
                    {t("auth.register.role_hint", "Vali roll nooleklahvidega. Valikud: SotsiaaltГ'кА?Г'кА? spetsialist vГ'кАзi ElukГ'какsimusega pГ'кА?Г'кА?rduja.")}
                  </div>
                <OptionCard type="radio" name="role" value="SOCIAL_WORKER" checked={form.role === "SOCIAL_WORKER"} onChange={handleChange} className="w-full text-[1.35rem] py-[1.1rem]">
                  {t("role.worker")}
                </OptionCard>
                <OptionCard type="radio" name="role" value="CLIENT" checked={form.role === "CLIENT"} onChange={handleChange} className="w-full text-[1.35rem] py-[1.1rem]">
                  {t("role.client")}
                </OptionCard>
                </div>
              </section>

              <section className={`register-step csp-step ${getItemClassName(3)}`}>
                <OptionCard type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="w-full text-[1.35rem] leading-[1.6]">
                    <RichText value={t("auth.register.agreement")} replacements={{
                    terms: {
                      open: `<a class="${linkInlineClassName}" href="${localizePath("/kasutustingimused", locale)}">`,
                      close: "</a>"
                    },
                    privacy: {
                      open: `<a class="${linkInlineClassName}" href="${localizePath("/privaatsustingimused", locale)}">`,
                      close: "</a>"
                    }
                  }} />
                </OptionCard>
              </section>

              <section className={`register-step csp-step ${getItemClassName(4)}`}>
                <OptionCard type="checkbox" name="guideAck" checked={form.guideAck} onChange={handleChange} className="w-full text-[1.35rem] leading-[1.6]">
                    <RichText value={t("auth.register.guide_ack")} replacements={{
                    guide1: {
                      open: `<a class="${linkInlineClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>"
                    },
                    guide2: {
                      open: `<a class="${linkInlineClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>"
                    }
                  }} />
                </OptionCard>
              </section>

              <section className={`register-step csp-step ${getItemClassName(5)} mt-3`}>
                {error && <div role="alert" className="rounded-[0.85rem] border border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.12)] px-[0.85rem] py-[0.65rem] text-[color:#fca5a5]">
                    {error}
                  </div>}
                {successMessage && <div role="status" className="rounded-[0.85rem] border border-[rgba(110,231,183,0.35)] bg-[rgba(16,185,129,0.12)] px-[0.85rem] py-[0.65rem] text-[color:#a7f3d0]">
                    {successMessage}
                  </div>}
                <div className="mt-2 flex justify-center">
                  <button type="submit" className={`${buttonBaseClassName} ${buttonPrimaryClassName}`.trim()} disabled={submitting} aria-disabled={submitting ? "true" : undefined}>
                    <span>
                      {submitting ? t("auth.register.submitting") : t("auth.register.submit")}
                    </span>
                  </button>
                </div>
              </section>

              <section className={`register-step csp-step ${getItemClassName(6)} -mt-3`}>
                <div className="flex justify-center text-[1.35rem]">
                  <AppLink href="#" onClick={e => {
                    e.preventDefault();
                    openLoginModal?.();
                  }} aria-label={t("auth.login.title")} className="[--link-brand-text:#c57171] [--link-brand-border-hover:#c57171] [--link-brand-shadow-hover:rgba(197,113,113,0.35)] light:[--link-color:#7A3A38]">
                      {t("auth.login.title")}
                  </AppLink>
                </div>
              </section>
            </form>
          </div>
        </div>
      </div>
    </section>;
}
