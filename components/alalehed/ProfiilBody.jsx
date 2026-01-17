"use client";

import Image from "next/image";
import SunIcon from "@/public/logo/sun.svg";
import EyeIcon from "@/public/logo/silma.svg";
import MoonIcon from "@/public/logo/kuu.svg";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import ModalConfirm from "@/components/ui/ModalConfirm";
import { useI18n } from "@/components/i18n/I18nProvider";
import OrbitalMenu from "@/components/effects/Components/OrbitalMenu/OrbitalMenu";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import { cn } from "@/components/ui/cn";
import styles from "./ProfiilBody.module.css";

const ROLE_KEYS = {
  ADMIN: "role.admin",
  SOCIAL_WORKER: "role.worker",
  CLIENT: "role.client",
};

function ProfileShell({
  locale,
  children,
  role = "region",
  ariaLabelledby,
  innerRef,
  embedded = false,
  theme = "dark",
}) {
  const containerClass = cn(
    styles.profileContainer,
    embedded ? styles.profileContainerEmbedded : null,
    embedded ? "profile-container profile-container--embedded" : null,
  );
  const container = (
    <div
      className={containerClass}
      role={role}
      aria-labelledby={ariaLabelledby}
      ref={innerRef}
      lang={embedded ? locale : undefined}
      data-theme={theme}
    >
      {children}
    </div>
  );

  if (embedded) {
    return container;
  }

  return (
    <div className={styles.profilePageShell} lang={locale}>
      {container}
    </div>
  );
}

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
    <EyeIcon
      className="profile-eye-icon"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
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

export default function ProfiilBody({
  initialProfile = null,
  embedded = false,
  isActive = true,
  onBack,
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { prefs, setPrefs, openModal: openA11y } = useAccessibility();
  const { t, locale } = useI18n();

  const [_hasPassword, setHasPassword] = useState(!!initialProfile?.hasPassword);
  const [showDelete, setShowDelete] = useState(false);

  const [loading, setLoading] = useState(!initialProfile);
  const [loadFailed, setLoadFailed] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutIconState, setLogoutIconState] = useState("idle");
  const [loginOpen, setLoginOpen] = useState(false);

  const searchParams = useSearchParams();
  const registrationReason = searchParams?.get("reason");

  const isAuthed = status === "authenticated" || !!session?.user;
  const isLightTheme = prefs?.theme === "light";

  const roleLabel = t(ROLE_KEYS[session?.user?.role] || "role.unknown");
  const profileContainerRef = useRef(null);
  const rolePillRef = useRef(null);

  useLayoutEffect(() => {
    const box = profileContainerRef.current;
    const pill = rolePillRef.current;
    if (!box || !pill) return;
    const rollCard = box.closest?.(".chat-roll-card");

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const encodeSvgMask = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    const getLocalRect = (el, root) => {
      if (!el || !root) return null;
      const w = el.offsetWidth || Math.round(el.getBoundingClientRect().width);
      const h = el.offsetHeight || Math.round(el.getBoundingClientRect().height);
      if (!w || !h) return null;
      let x = 0;
      let y = 0;
      let node = el;
      while (node && node !== root) {
        x += node.offsetLeft || 0;
        y += node.offsetTop || 0;
        node = node.offsetParent;
      }
      if (node !== root) {
        const rootRect = root.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        x = rect.left - rootRect.left;
        y = rect.top - rootRect.top;
      }
      return {
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h),
      };
    };
    let lastMask = "";
    let lastRoleMask = "";
    let lastRollMask = "";
    let raf = 0;

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

    const buildMask = (rootW, rootH, holeRect, radius) => {
      if (!rootW || !rootH || !holeRect?.w || !holeRect?.h) return null;
      const outerPath = `M 0 0 H ${rootW} V ${rootH} H 0 Z`;
      const holePath = roundedRectPath(
        clamp(holeRect.x, 0, rootW),
        clamp(holeRect.y, 0, rootH),
        clamp(holeRect.w, 0, rootW - holeRect.x),
        clamp(holeRect.h, 0, rootH - holeRect.y),
        radius
      );
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rootW} ${rootH}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePath}"/></svg>`;
      return encodeSvgMask(svg);
    };

    const updateMask = () => {
      const boxW = Math.round(
        box.offsetWidth || box.getBoundingClientRect().width
      );
      const boxH = Math.round(
        box.offsetHeight || box.getBoundingClientRect().height
      );
      if (!boxW || !boxH) return;

      const pillLocal = getLocalRect(pill, box);
      if (!pillLocal) return;

      const rollW = rollCard
        ? Math.round(rollCard.offsetWidth || rollCard.getBoundingClientRect().width)
        : 0;
      const rollH = rollCard
        ? Math.round(rollCard.offsetHeight || rollCard.getBoundingClientRect().height)
        : 0;
      const pillLocalRoll = rollCard ? getLocalRect(pill, rollCard) : null;

      const pillRadiusRaw = Number.parseFloat(
        window.getComputedStyle(pill).borderTopLeftRadius
      );
      const pillRadius = Number.isFinite(pillRadiusRaw) ? pillRadiusRaw : pillLocal.h / 2;
      const mask = buildMask(boxW, boxH, pillLocal, pillRadius);
      const rollMask = rollCard
        ? buildMask(rollW, rollH, pillLocalRoll, pillRadius)
        : null;

      if (mask && mask !== lastMask) {
        box.style.setProperty("--profile-role-hole-mask", mask);
        lastMask = mask;
      }

      if (mask && mask !== lastRoleMask) {
        box.style.setProperty("--profile-role-only-mask", mask);
        lastRoleMask = mask;
      }

      if (rollCard && rollMask && rollMask !== lastRollMask) {
        rollCard.style.setProperty("--roll-hole-mask-profile", rollMask);
        lastRollMask = rollMask;
      }
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateMask);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);

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
      ro?.disconnect?.();
    };
  }, [embedded, isActive, prefs?.theme, roleLabel]);

  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (embedded && !isActive) return;
    setLoginOpen(true);
  }, [embedded, isActive, status]);

  useEffect(() => {
    if (embedded && !isActive) setLoginOpen(false);
  }, [embedded, isActive]);

  const logoutIconSrc =
    logoutIconState === "logging-out"
      ? isLightTheme
        ? "/logo/onoffrohelinehele.svg"
        : "/logo/onoffroheline.svg"
      : isLightTheme
      ? "/logo/onoffhallhele.svg"
      : "/logo/onoffhall.svg";

  const themeActionLabel = isLightTheme
    ? t("accessibility.options.theme.dark")
    : t("accessibility.options.theme.light");

  const orbitItems = [
    {
      key: "theme",
      icon: isLightTheme ? (
        <MoonIcon width={26} height={26} className="profile-orbit-menu__theme-icon" />
      ) : (
        <SunIcon width={26} height={26} className="profile-orbit-menu__theme-icon" />
      ),
      label: themeActionLabel,
      labelPos: "left",
      keepOpen: true,
      onClick: () => {
        const nextTheme = isLightTheme ? "dark" : "light";
        setPrefs?.({ theme: nextTheme });
      },
    },
    {
      key: "pin",
      icon: <PinDockIcon />,
      label: t("profile.change_password_cta"),
      labelPos: "up",
      onClick: () =>
        pushWithTransition(
          router,
          localizePath(`/uuenda-pin${embedded ? "?return=profile" : ""}`, locale)
        ),
    },
    {
      key: "email",
      icon: <EmailDockIcon />,
      label: t("profile.update_email_cta"),
      labelPos: "up",
      onClick: () =>
        pushWithTransition(
          router,
          localizePath(`/uuenda-epost${embedded ? "?return=profile" : ""}`, locale)
        ),
    },
    {
      key: "delete",
      icon: <DeleteDockIcon />,
      label: t("profile.delete_account"),
      labelPos: "right",
      onClick: () => {
        setError("");
        setSuccess("");
        setDeleting(false);
        setShowDelete(true);
      },
    },
    {
      key: "subscription",
      icon: <SubscriptionDockIcon />,
      label: t("profile.manage_subscription"),
      labelPos: "down",
      onClick: () =>
        pushWithTransition(
          router,
          localizePath(`/tellimus${embedded ? "?return=profile" : ""}`, locale)
        ),
    },
    {
      key: "preferences",
      icon: <PreferencesDockIcon />,
      label: t("profile.preferences.title"),
      labelPos: "down",
      onClick: () => openA11y?.(),
    },
  ];

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
    } finally {
      setLoggingOut(false);
      setLogoutIconState("idle");
    }
  };

  useEffect(() => {
    if (embedded && !isActive) return;
    if (status === "loading") return;

    if (status !== "authenticated") {
      setLoading(false);
      setLoadFailed(false);
      return;
    }

    if (initialProfile) {
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
        setHasPassword(!!payload?.user?.hasPassword);
      } catch (err) {
        console.error("profile GET", err);
        setError(t("profile.server_unreachable"));
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [embedded, initialProfile, isActive, status, t]);

  const handleBack = useCallback(() => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }
    pushWithTransition(router, "/vestlus");
  }, [onBack, router]);


  if (isAuthed && ((status === "loading" && !initialProfile) || loading)) {
    return (
      <ProfileShell locale={locale} embedded={embedded} theme={isLightTheme ? "light" : "dark"}>
        <h1 className={styles.profileTitle}>{t("profile.title")}</h1>
        <p className={styles.profileLoading}>
          {t("profile.loading")}
        </p>
      </ProfileShell>
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
        <ProfileShell locale={locale} embedded={embedded} theme={isLightTheme ? "light" : "dark"}>
          <h1 className={styles.profileTitle}>{t("profile.title")}</h1>
          <p className={styles.profileNote}>{reasonText}</p>
          <div className={styles.profileBtnRow}>
            <button
              type="button"
              className={styles.backButton}
              onClick={embedded ? handleBack : () => setLoginOpen(true)}
              aria-label={embedded ? t("profile.back_to_chat") : t("auth.login.title")}
            >
              <span className={styles.backIcon} />
            </button>
          </div>
        </ProfileShell>

        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    );
  }

  if (loadFailed) {
    return (
      <ProfileShell
        locale={locale}
        ariaLabelledby="profile-title"
        embedded={embedded}
        theme={isLightTheme ? "light" : "dark"}
      >
        <h1 id="profile-title" className={styles.profileTitle}>
          {t("profile.title")}
        </h1>
        <div className={styles.profileErrorState}>
          <div role="alert" className={cn(styles.profileNote, styles.profileNoteCenter)}>
            {error || t("profile.load_failed")}
          </div>
        </div>
      </ProfileShell>
    );
  }


  return (
    <ProfileShell
      locale={locale}
      ariaLabelledby="profile-title"
      innerRef={profileContainerRef}
      embedded={embedded}
      theme={isLightTheme ? "light" : "dark"}
    >
      <h1 id="profile-title" className={styles.profileTitle}>
        {t("profile.title")}
      </h1>

      <div className={styles.profileHeaderCenter}>
        <span
          ref={rolePillRef}
          className={styles.profileRolePill}
        >
          {roleLabel}
        </span>
      </div>

      <div className={styles.profileForm}>
        <div className={styles.profileOrbitWrapper}>
          <OrbitalMenu
            items={orbitItems}
            ariaLabel={t("profile.actions_label")}
            toggleLabelOpen={t("profile.actions_label")}
            toggleLabelClose={t("buttons.close")}
          />
        </div>

        {error && (
          <div role="alert" className={cn(styles.profileNote, styles.profileNoteRow)}>
            {error}
          </div>
        )}

        {success && !error && (
          <div
            role="status"
            className={cn(styles.profileNote, styles.profileNoteRow)}
          >
            {success}
          </div>
        )}

        <div className={styles.profileBtnRow}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBack}
            aria-label={t("profile.back_to_chat")}
          >
            <span className={styles.backIcon}></span>
          </button>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label={t("profile.logout")}
          >
            <Image
              src={logoutIconSrc}
              className={styles.logoutIcon}
              alt=""
              width={74}
              height={74}
              aria-hidden="true"
            />
            <span className={styles.logoutLabel}>{t("profile.logout")}</span>
            <span className="sr-only">{t("profile.logout")}</span>
          </button>
        </div>
      </div>

      {showDelete && (
        <ModalConfirm
          message={t("profile.delete_confirm")}
          confirmLabel={deleting ? t("profile.deleting") : t("profile.delete_account")}
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

              const redirectUrl = signOutResult?.url || localizePath("/", locale);
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
    </ProfileShell>
  );
}



