"use client";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import ModalConfirm from "@/components/ui/ModalConfirm";
import { useI18n } from "@/components/i18n/I18nProvider";
import Dock from "@/components/effects/Components/Dock/Dock";
import { localizePath } from "@/lib/localizePath";
const ROLE_KEYS = {
  ADMIN: "role.admin",
  SOCIAL_WORKER: "role.worker",
  CLIENT: "role.client",
};

function EmailDockIcon({ isHovered: _isHovered, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="M4.5 7.25 12 12.25 19.5 7.25" />
    </svg>
  );
}

function PinDockIcon({ isHovered: _isHovered, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g transform="translate(12 12) scale(1.05) translate(-12 -12) translate(0 0.35)">
        <rect x="4.5" y="8.5" width="15" height="9" rx="2.2" ry="2.2" />
        <path d="M7.5 8.5V6.5a4.5 4.5 0 0 1 9 0v2" />
        <circle cx="12" cy="13" r="0.9" fill="currentColor" />
        <path d="M12 13.7v1.2" stroke="currentColor" />
      </g>
    </svg>
  );
}

function PreferencesDockIcon({ isHovered: _isHovered, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.75v1.7M12 19.55v1.7M4.45 4.45l1.2 1.2M18.35 18.35l1.2 1.2M2.75 12h1.7M19.55 12h1.7M4.45 19.55l1.2-1.2M18.35 5.65l1.2-1.2" />
    </svg>
  );
}

function SubscriptionDockIcon({ isHovered: _isHovered, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      shapeRendering="geometricPrecision"
    >
      <rect x="4.3" y="4.8" width="15.4" height="14.4" rx="2.6" />
      <path d="M6.7 9.5h10.6" />
      <path d="M9 14.2l2.1 2.4 4.1-4.6" />
    </svg>
  );
}

function DeleteDockIcon({ isHovered: _isHovered, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M4 6h16M10 10v6M14 10v6" />
      <path d="M9 6l.6-1.4A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.4.6L15 6m3 0-.8 11.6a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 6" />
    </svg>
  );
}

export default function ProfiilBody({ initialProfile = null }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { prefs, openModal: openA11y } = useAccessibility();
  const { t, locale } = useI18n();
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [initialEmail, setInitialEmail] = useState(
    (initialProfile?.email || "").trim().toLowerCase()
  );
  const [hasPassword, setHasPassword] = useState(!!initialProfile?.hasPassword);
  const [showDelete, setShowDelete] = useState(false);
  // Kui serverist tuli profiil, siis väldi kliendi "loading" vaadet
  const [loading, setLoading] = useState(!initialProfile);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isTouchActions, setIsTouchActions] = useState(false);
  // E-posti põhine parooli muutmine toimub eraldi lehel (/unustasin-pin)
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutIconState, setLogoutIconState] = useState("idle"); // idle | logging-out
  const [loginOpen, setLoginOpen] = useState(false);
  const searchParams = useSearchParams();
  const registrationReason = searchParams?.get("reason");
  const isAuthed = status === "authenticated" || !!session?.user;
  const isLightTheme = prefs?.theme === "light";
  const roleLabel = t(ROLE_KEYS[session?.user?.role] || "role.unknown");
  const emailLabel = t("profile.email");

  const profileContainerRef = useRef(null);
  const rolePillRef = useRef(null);
  const emailFieldRef = useRef(null);

  useLayoutEffect(() => {
    const box = profileContainerRef.current;
    const pill = rolePillRef.current;
    const emailEl = emailFieldRef.current;
    if (!box || !pill) return;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const encodeSvgMask = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    let lastMask = "";
    const roundedRectPath = (x, y, width, height, radius) => {
      const r = clamp(radius, 0, Math.min(width, height) / 2);
      const right = x + width;
      const bottom = y + height;
      return [
        `M ${x + r} ${y}`,
        `H ${right - r}`,
        `A ${r} ${r} 0 0 1 ${right} ${y + r}`,
        `V ${bottom - r}`,
        `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
        `H ${x + r}`,
        `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`,
        `V ${y + r}`,
        `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
        "Z",
      ].join(" ");
    };
    const updateHole = () => {
      const boxRect = box.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      if (!boxRect.width || !boxRect.height || !pillRect.width || !pillRect.height) return;

      const hasLightTheme = document?.documentElement?.classList?.contains?.("theme-light");
      if (hasLightTheme) {
        const fallbackMask = "linear-gradient(#fff, #fff)";
        if (lastMask !== fallbackMask) {
          box.style.setProperty("--profile-role-hole-mask", fallbackMask);
          lastMask = fallbackMask;
        }
        return;
      }

      const centerXRaw = pillRect.left - boxRect.left + pillRect.width / 2;
      const centerYRaw = pillRect.top - boxRect.top + pillRect.height / 2;

      const styles = window.getComputedStyle(box);
      const wRatio = Number.parseFloat(styles.getPropertyValue("--profile-role-hole-w")) || 0.62;
      const hRatio = Number.parseFloat(styles.getPropertyValue("--profile-role-hole-h")) || 0.11;
      const minW = Number.parseFloat(styles.getPropertyValue("--profile-role-hole-min-w")) || 320;
      const maxW = Number.parseFloat(styles.getPropertyValue("--profile-role-hole-max-w")) || 560;
      const minH = Number.parseFloat(styles.getPropertyValue("--profile-role-hole-min-h")) || 54;
      const maxH = Number.parseFloat(styles.getPropertyValue("--profile-role-hole-max-h")) || 84;
      const radiusPxRaw = Number.parseFloat(styles.getPropertyValue("--profile-role-hole-r"));

      const holeHeight = Math.round(clamp(boxRect.width * hRatio, minH, maxH));

      const baseWidth = clamp(boxRect.width * wRatio, minW, maxW);
      let textWidthTarget = 0;
      try {
        const pillStyles = window.getComputedStyle(pill);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.font = `${pillStyles.fontWeight} ${pillStyles.fontSize} ${pillStyles.fontFamily}`;
          const measured = ctx.measureText(pill.textContent || "").width;
          const pad = clamp(holeHeight * 1.35, 36, 64);
          textWidthTarget = measured + pad;
        }
      } catch {}

      const holeWidth = Math.round(clamp(Math.max(baseWidth, textWidthTarget), minW, maxW));
      const holeRadius = Math.round(
        clamp(
          Number.isFinite(radiusPxRaw) ? radiusPxRaw : holeHeight / 2,
          0,
          Math.min(holeWidth, holeHeight) / 2
        )
      );

      const topRaw = centerYRaw - holeHeight / 2;

      const centerX = Math.round(clamp(centerXRaw, holeWidth / 2, boxRect.width - holeWidth / 2));
      const top = Math.round(clamp(topRaw, 0, boxRect.height - holeHeight));

      box.style.setProperty("--profile-role-hole-width", `${holeWidth}px`);
      box.style.setProperty("--profile-role-hole-height", `${holeHeight}px`);
      box.style.setProperty("--profile-role-hole-x", `${centerX}px`);
      box.style.setProperty("--profile-role-hole-top", `${top}px`);

      const boxWidth = Math.round(boxRect.width);
      const boxHeight = Math.round(boxRect.height);
      const holeX = Math.round(clamp(centerX - holeWidth / 2, 0, boxWidth - holeWidth));
      const holeY = top;
      const outerPath = `M 0 0 H ${boxWidth} V ${boxHeight} H 0 Z`;
      const holePath = roundedRectPath(holeX, holeY, holeWidth, holeHeight, holeRadius);
      let emailHolePath = "";
      if (!hasLightTheme && emailEl) {
        const emailRect = emailEl.getBoundingClientRect();
        if (emailRect.width && emailRect.height) {
          const emailHoleW = Math.round(emailRect.width);
          const emailHoleH = Math.round(emailRect.height);
          const emailHoleX = Math.round(
            clamp(emailRect.left - boxRect.left, 0, boxWidth - emailHoleW)
          );
          const emailHoleY = Math.round(
            clamp(emailRect.top - boxRect.top, 0, boxHeight - emailHoleH)
          );
          const emailRadiusRaw = Number.parseFloat(window.getComputedStyle(emailEl).borderTopLeftRadius);
          const emailRadius = Math.round(
            clamp(
              Number.isFinite(emailRadiusRaw) ? emailRadiusRaw : emailHoleH / 2,
              0,
              Math.min(emailHoleW, emailHoleH) / 2
            )
          );
          emailHolePath = ` ${roundedRectPath(emailHoleX, emailHoleY, emailHoleW, emailHoleH, emailRadius)}`;
        }
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxWidth} ${boxHeight}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePath}${emailHolePath}"/></svg>`;
      const mask = encodeSvgMask(svg);
      if (mask !== lastMask) {
        box.style.setProperty("--profile-role-hole-mask", mask);
        lastMask = mask;
      }
    };

    let raf = window.requestAnimationFrame(updateHole);
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateHole);
    };

    window.addEventListener("resize", scheduleUpdate);
    let intervalId;
    if (process.env.NODE_ENV !== "production") {
      intervalId = window.setInterval(scheduleUpdate, 350);
    }
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleUpdate);
      ro.observe(box);
      ro.observe(pill);
    }
    document.fonts?.ready?.then?.(scheduleUpdate).catch?.(() => {});

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduleUpdate);
      if (intervalId) window.clearInterval(intervalId);
      ro?.disconnect?.();
    };
  }, [status, loading, loadFailed, locale, session?.user?.role, prefs?.theme, roleLabel]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: coarse), (max-width: 520px)");
    const applyMatch = (mq) => setIsTouchActions(mq.matches);
    const handleChange = (event) => applyMatch(event);
    applyMatch(media);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoginOpen(true);
    }
  }, [status]);

  const actionItems = [
    {
      key: "email",
      icon: <EmailDockIcon />,
      label: t("profile.update_email_cta", "Uuenda e-post"),
      onClick: () => router.push(localizePath("/uuenda-epost", locale)),
    },
    {
      key: "pin",
      icon: <PinDockIcon />,
      label: t("profile.change_password_cta", "Uuenda parool"),
      onClick: () => router.push(localizePath("/uuenda-pin", locale)),
    },
    {
      key: "preferences",
      icon: <PreferencesDockIcon />,
      label: t("profile.preferences.title"),
      onClick: () => openA11y?.(),
    },
    {
      key: "subscription",
      icon: <SubscriptionDockIcon />,
      label: t("profile.manage_subscription"),
      onClick: () => router.push(localizePath("/tellimus", locale)),
    },
    {
      key: "delete",
      icon: <DeleteDockIcon />,
      label: t("profile.delete_account"),
      onClick: () => {
        setError("");
        setSuccess("");
        setDeleting(false);
        setShowDelete(true);
      },
    },
  ];
  const logoutIconSrc =
    logoutIconState === "logging-out"
      ? isLightTheme
        ? "/logo/onoffrohelinehele.svg"
        : "/logo/onoffroheline.svg"
      : isLightTheme
      ? "/logo/onoffhallhele.svg"
      : "/logo/onoffhall.svg";

  const handleLogout = async () => {
    if (loggingOut) return;
    setError("");
    setSuccess("");
    setLogoutIconState("logging-out");
    setLoggingOut(true);
    try {
      await signOut({ callbackUrl: localizePath("/", locale) });
    } catch (err) {
      console.error("profile logout", err);
      setError(t("profile.server_unreachable"));
      setLoggingOut(false);
      setLogoutIconState("idle");
    }
  };
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      setLoadFailed(false);
      return;
    }
    // Kui server andis juba profiili, kasuta seda ja väldi lisapäringut
    if (initialProfile && typeof initialProfile.email === "string") {
      setEmail(initialProfile.email || "");
      setInitialEmail((initialProfile.email || "").trim().toLowerCase());
      setHasPassword(!!initialProfile.hasPassword);
      setLoadFailed(false);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoadFailed(false);
        const res = await fetch("/api/profile", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || payload?.message || t("profile.load_failed"));
          setLoadFailed(true);
          return;
        }
        setEmail(payload?.user?.email ?? "");
        setInitialEmail(((payload?.user?.email ?? "")).trim().toLowerCase());
        setHasPassword(!!payload?.user?.hasPassword);
      } catch (err) {
        console.error("profile GET", err);
        setError(t("profile.server_unreachable"));
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [status, t, initialProfile]);
  // Parooli muutmine: suuname parooli taastamise lehele, kus küsitakse e-post
  if (isAuthed && ((status === "loading" && !initialProfile) || loading)) {
    return (
      <div className="main-content glass-box glass-left profile-container" lang={locale}>
        <h1 className="glass-title">{t("profile.title")}</h1>
        <p style={{ padding: "1rem" }}>{t("profile.loading")}</p>
      </div>
    );
  }
  if (!isAuthed) {
    const reason = registrationReason || "not-logged-in";
    const reasonText =
      reason === "no-sub"
        ? t("profile.login_to_manage_sub")
        : t("profile.login_to_view");
    return (
      <>
        <div className="main-content glass-box glass-left profile-container" lang={locale}>
          <h1 className="glass-title">{t("profile.title")}</h1>
          <p style={{ padding: "1rem" }}>{reasonText}</p>
          <div className="back-btn-wrapper">
            <button
              type="button"
              className="back-arrow-btn"
              onClick={() => setLoginOpen(true)}
              aria-label={t("auth.login.title")}
            >
              <span className="back-arrow-circle" />
            </button>
          </div>
        </div>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    );
  }
  if (loadFailed) {
    return (
      <div
        className="main-content glass-box glass-left profile-container"
        role="region"
        aria-labelledby="profile-title"
        lang={locale}
      >
        <h1 id="profile-title" className="glass-title">
          {t("profile.title")}
        </h1>
        <div className="profile-error-state">
          <div
            role="alert"
            className="glass-note glass-note--center profile-error-note"
          >
            {error || t("profile.load_failed")}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="main-content glass-box glass-left profile-container"
      role="region"
      aria-labelledby="profile-title"
      lang={locale}
      ref={profileContainerRef}
    >
      <h1 id="profile-title" className="glass-title">
        {t("profile.title")}
      </h1>
      <div className="profile-header-center">
        <span
          ref={rolePillRef}
          className="profile-role-pill"
          style={{ marginBottom: "0.1em" }}
        >
          {roleLabel}
        </span>
      </div>
      <div className="glass-form profile-form-vertical">
        <div className="profile-email-field" ref={emailFieldRef}>
          <label htmlFor="email" className="sr-only">
            {emailLabel}
          </label>
          <input
            className="input-modern"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            aria-label={emailLabel}
            readOnly
          />
        </div>
        <div className="profile-email-dock-wrapper">
          {isTouchActions ? (
            <div className="profile-email-card-grid">
              {actionItems.map(({ key, icon, label, onClick }) => (
                <button
                  key={`profile-action-${key}`}
                  type="button"
                  className="profile-email-card"
                  onClick={onClick}
                >
                  <span className="profile-email-card__icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="profile-email-card__label">{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <Dock
              items={actionItems.map(({ key, icon, label, onClick }) => ({
                icon,
                label,
                onClick,
                key,
              }))}
              panelHeight={84}
              dockHeight={112}
              baseItemSize={56}
              magnification={66}
              distance={140}
              spring={{ mass: 0.28, stiffness: 190, damping: 18 }}
              labelOffset={6}
              className="profile-email-dock"
              staticHeight
              ariaLabel={t("profile.actions_label", "Profiili toimingud")}
            />
          )}
        </div>
        {error && (
          <div
            role="alert"
            className="glass-note"
            style={{ marginTop: "0.75rem" }}
          >
            {error}
          </div>
        )}
        {success && !error && (
          <div
            role="status"
            className="glass-note glass-note--success"
            style={{ marginTop: "0.75rem" }}
          >
            {success}
          </div>
        )}
        <div
          className="profile-btn-row profile-btn-row--back-logout"
          style={{ marginTop: "1.5rem", marginBottom: "0rem" }}
        >
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => router.push("/vestlus")}
            aria-label={t("profile.back_to_chat")}
          >
            <span className="back-arrow-circle"></span>
          </button>
          <button
            type="button"
            className={`profile-logout-icon-btn profile-logout-icon-btn--${logoutIconState}`}
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label={t("profile.logout")}
          >
            <Image src={logoutIconSrc} className="profile-logout-icon" alt="" width={74} height={74} aria-hidden="true" />
            <span className="profile-logout-label">{t("profile.logout")}</span>
            <span className="sr-only">{t("profile.logout")}</span>
          </button>
        </div>
      </div>
      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
      {showDelete && (
        <ModalConfirm
          message={t("profile.delete_confirm")}
          confirmLabel={
            deleting
              ? t("profile.deleting")
              : t("profile.delete_account")
          }
          cancelLabel={t("buttons.cancel")}
          onConfirm={async () => {
            if (deleting) return;
            setError("");
            setSuccess("");
            setDeleting(true);
            try {
              const res = await fetch("/api/profile", { method: "DELETE" });
              const payload = await res.json().catch(() => ({}));
              if (!res.ok) {
                setError(payload?.error || payload?.message || t("profile.delete_failed"));
                setDeleting(false);
                return;
              }
              setShowDelete(false);
              const signOutResult = await signOut({
                redirect: false,
                callbackUrl: localizePath("/", locale),
              });
              const redirectUrl =
                signOutResult?.url || localizePath("/", locale);
              window.location.href = redirectUrl;
            } catch (err) {
              console.error("profile DELETE", err);
              setError(t("profile.server_unreachable"));
              setDeleting(false);
            }
          }}
          onCancel={() => {
            if (deleting) return;
            setShowDelete(false);
          }}
          disabled={deleting}
        />
      )}
    </div>
  );
}
