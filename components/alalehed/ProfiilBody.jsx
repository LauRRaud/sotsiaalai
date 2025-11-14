"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
      <path d="M12 2v5" />
      <rect x="7" y="7" width="10" height="7" rx="1.5" />
      <path d="M9 14v2.5a3 3 0 0 0 6 0V14" />
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
  const { openModal: openA11y } = useAccessibility();
  const { t, locale } = useI18n();
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [initialEmail, setInitialEmail] = useState(
    (initialProfile?.email || "").trim().toLowerCase()
  );
  const [hasPassword, setHasPassword] = useState(!!initialProfile?.hasPassword);
  const [showDelete, setShowDelete] = useState(false);
  // Kui serverist tuli profiil, siis väldi kliendi "loading" vaadet
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isTouchActions, setIsTouchActions] = useState(false);
  // E-posti põhine parooli muutmine toimub eraldi lehel (/unustasin-pin)
  const [deleting, setDeleting] = useState(false);
  const searchParams = useSearchParams();
  const registrationReason = searchParams?.get("reason");
  const isAuthed = status === "authenticated" || !!session?.user;

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
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    // Kui server andis juba profiili, kasuta seda ja väldi lisapäringut
    if (initialProfile && typeof initialProfile.email === "string") {
      setEmail(initialProfile.email || "");
      setInitialEmail((initialProfile.email || "").trim().toLowerCase());
      setHasPassword(!!initialProfile.hasPassword);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || payload?.message || t("profile.load_failed"));
          return;
        }
        setEmail(payload?.user?.email ?? "");
        setInitialEmail(((payload?.user?.email ?? "")).trim().toLowerCase());
        setHasPassword(!!payload?.user?.hasPassword);
      } catch (err) {
        console.error("profile GET", err);
        setError(t("profile.server_unreachable"));
      } finally {
        setLoading(false);
      }
    })();
  }, [status, t, initialProfile]);
  // Parooli muutmine: suuname parooli taastamise lehele, kus küsitakse e-post
  if (isAuthed && ((status === "loading" && !initialProfile) || loading)) {
    return (
      <div className="main-content glass-box glass-left" lang={locale}>
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
      <div className="main-content glass-box glass-left" lang={locale}>
        <h1 className="glass-title">{t("profile.title")}</h1>
        <p style={{ padding: "1rem" }}>{reasonText}</p>
        <div className="back-btn-wrapper">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() =>
              router.push(localizePath("/registreerimine", locale))
            }
            aria-label={t("auth.login.title")}
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </div>
    );
  }
  const roleLabel = t(ROLE_KEYS[session?.user?.role] || "role.unknown");
  const emailLabel = t("profile.email");
  return (
    <div
      className="main-content glass-box glass-left"
      role="main"
      aria-labelledby="profile-title"
      lang={locale}
    >
      <h1 id="profile-title" className="glass-title">
        {t("profile.title")}
      </h1>
      <div className="profile-header-center">
        <span className="profile-role-pill">{roleLabel}</span>
      </div>
      <div className="glass-form profile-form-vertical">
        <div className="profile-email-field">
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
              panelHeight={64}
              dockHeight={96}
              baseItemSize={44}
              magnification={68}
              distance={140}
              className="profile-email-dock"
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
        <div className="profile-btn-row" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn-primary btn-profile-logout btn-glass"
            onClick={() =>
              signOut({ callbackUrl: localizePath("/", locale) })
            }
          >
            {t("profile.logout")}
          </button>
        </div>
      </div>
      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push("/vestlus")}
          aria-label={t("profile.back_to_chat")}
        >
          <span className="back-arrow-circle"></span>
        </button>
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
