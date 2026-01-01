"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useId } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import CloseButton from "@/components/ui/CloseButton";

export default function RegistreerimineBody({ openLoginModal = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const scrollRef = useRef(null);

  const handleClose = () => {
    router.push(localizePath("/", locale));
  };

  const toRelative = (u) => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "http://local";
      const url = new URL(u, base);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch { return String(u || "/"); }
  };
  const nextUrl = toRelative(searchParams?.get("next") || localizePath("/vestlus", locale));

  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const initialForm = {
    email: "",
    pin: "",
    role: "",
    agree: false,
    guideAck: false,
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pin"
          ? value.replace(/\D/g, "").slice(0, PIN_MAX)
          : type === "checkbox"
          ? checked
          : value,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          pin: form.pin,
          role: form.role,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        // /api/register/route.js tagastab 'message'
        setError(payload?.message || payload?.error || t("auth.register.error.failed"));
        return;
      }
      setSuccessMessage(
        t("auth.register.success_message", {
          email: form.email.trim(),
        })
      );
      setForm((prev) => ({
        ...initialForm,
        role: prev.role,
      }));
      router.refresh();
    } catch (err) {
      console.error("Register error", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setSubmitting(false);
    }
  }

  const { canScrollUp, canScrollDown, getItemClassName, recompute } =
    CenteredScrollPicker({
      containerRef: scrollRef,
      itemSelector: ".register-step",
      neighborDistance: 1,
      lockWheelToSteps: false,
      settleOnScroll: false,
      enableArrowKeys: true,
      allowArrowKeysInInputs: true,
      captureArrowKeys: true,
      settleMs: 0,
      maxStepPerSettle: 999,
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
      setScrollPad((prev) => (prev === nextPad ? prev : nextPad));
    };

    updatePad();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updatePad) : null;
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
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      router.push(localizePath("/", locale));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, locale]);

  return (
    <div className="main-content glass-box register-scroll" lang={locale}>
      <CloseButton onClick={handleClose} ariaLabel={t("common.close")} />
      <div className="csp-overlayTitle register-scroll__title" aria-hidden="false">
        <h1 className="glass-title">{t("auth.register.title")}</h1>
      </div>

      <div
        className={`a11y-modal__scrim a11y-modal__scrim--top csp-scrim csp-scrim--top csp-scrim--chevron ${
          canScrollUp ? "is-visible" : ""
        }`}
        aria-hidden="true"
      />
      <div
        className={`a11y-modal__scrim a11y-modal__scrim--bottom csp-scrim csp-scrim--bottom csp-scrim--chevron ${
          canScrollDown ? "is-visible" : ""
        }`}
        aria-hidden="true"
      />

      <div
        ref={scrollRef}
        className="register-scroll__body csp-container"
        style={{ "--csp-pad": `${scrollPad}px` }}
        tabIndex={0}
        aria-label={t("auth.register.title")}
      >
        <form className="glass-form register-form" onSubmit={handleSubmit} autoComplete="off">
          <section className={`register-step csp-step ${getItemClassName(0)}`}>
            <input
              type="email"
              id="email"
              name="email"
              className="input-modern input-email-top"
              placeholder={t("auth.email_placeholder")}
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </section>

          <section className={`register-step csp-step ${getItemClassName(1)}`}>
            <input
              type="password"
              id="pin"
              name="pin"
              className="input-modern"
              placeholder={t("auth.pin_placeholder", { min: PIN_MIN, max: PIN_MAX })}
              value={form.pin}
              onChange={handleChange}
              required
              minLength={PIN_MIN}
              maxLength={PIN_MAX}
              autoComplete="off"
              inputMode="numeric"
              pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
            />
          </section>

          <section className={`register-step csp-step ${getItemClassName(2)}`}>
            <div className="glass-label glass-label-radio" id={roleLabelId}>
              {roleLabelText}
            </div>
            <div
              className="glass-radio-group"
              role="radiogroup"
              aria-labelledby={roleLabelId}
              aria-describedby={roleHintId}
            >
              <div id={roleHintId} className="sr-only">
                {t(
                  "auth.register.role_hint",
                  "Vali roll nooleklahvidega. Valikud: Sotsiaalt€ô€ô spetsialist v€æi Eluk€¬simusega p€ô€ôrduja.",
                )}
              </div>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="SOCIAL_WORKER"
                  checked={form.role === "SOCIAL_WORKER"}
                  onChange={handleChange}
                  required
                />
                <span className="glass-radio-label-text">{t("role.worker")}</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="CLIENT"
                  checked={form.role === "CLIENT"}
                  onChange={handleChange}
                />
                <span className="glass-radio-label-text">{t("role.client")}</span>
              </label>
            </div>
          </section>

          <section className={`register-step csp-step ${getItemClassName(3)}`}>
            <label className="glass-checkbox">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                required
              />
              <span className="checkbox-text">
                <RichText
                  value={t("auth.register.agreement")}
                  replacements={{
                    terms: {
                      open: `<a class="link-brand-inline" href="${localizePath("/kasutustingimused", locale)}">`,
                      close: "</a>",
                    },
                    privacy: {
                      open: `<a class="link-brand-inline" href="${localizePath("/privaatsustingimused", locale)}">`,
                      close: "</a>",
                    },
                  }}
                />
              </span>
            </label>
          </section>

          <section className={`register-step csp-step ${getItemClassName(4)}`}>
            <label className="glass-checkbox">
              <input
                type="checkbox"
                name="guideAck"
                checked={form.guideAck}
                onChange={handleChange}
                required
              />
              <span className="checkbox-text">
                <RichText
                  value={t("auth.register.guide_ack")}
                  replacements={{
                    guide: {
                      open: `<a class="link-brand-inline" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>",
                    },
                  }}
                />
              </span>
            </label>
          </section>

          <section className={`register-step csp-step ${getItemClassName(5)}`}>
            {error && (
              <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div role="status" className="glass-note glass-note--success" style={{ marginBottom: "0.75rem" }}>
                {successMessage}
              </div>
            )}
            <button className="btn-base register-submit" type="submit" disabled={submitting}>
              <span>{submitting ? t("auth.register.submitting") : t("auth.register.submit")}</span>
            </button>
          </section>

          <section className={`register-step csp-step ${getItemClassName(6)}`}>
            <div className="register-login-row">
              <button
                type="button"
                className="link-brand-inline register-login-link"
                onClick={() => openLoginModal?.()}
                aria-label={t("auth.login.title")}
              >
                {t("auth.login.title")}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
