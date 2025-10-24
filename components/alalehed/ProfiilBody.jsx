// app/profiil/ProfiilBody.jsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import ModalConfirm from "@/components/ui/ModalConfirm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import ProfilePreferencesForm from "@/components/preferences/ProfilePreferencesForm";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";

export default function ProfiilBody() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [preferencesError, setPreferencesError] = useState("");
  const [initialPreferences, setInitialPreferences] = useState(DEFAULT_PREFERENCES);

  const searchParams = useSearchParams();
  const registrationReason = searchParams?.get("reason");

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      setPrefsLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || t("profile.load_failed"));
          return;
        }
        setEmail(payload?.user?.email ?? "");
      } catch (err) {
        console.error("profile GET", err);
        setError(t("profile.server_unreachable"));
      } finally {
        setLoading(false);
      }
    })();

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/prefs/accessibility", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setPreferencesError(payload?.message || t("profile.update_failed"));
          }
          return;
        }
        const prefs = payload?.preferences ?? {};
        if (!cancelled) {
          setInitialPreferences({
            locale: prefs.locale ?? DEFAULT_PREFERENCES.locale,
            contrast: prefs.contrast ?? DEFAULT_PREFERENCES.contrast,
            fontSize: prefs.fontSize ?? DEFAULT_PREFERENCES.fontSize,
            motion: prefs.motion ?? DEFAULT_PREFERENCES.motion,
          });
          setPreferencesError("");
        }
      } catch (err) {
        console.error("profile prefs GET", err);
        if (!cancelled) {
          setPreferencesError(t("profile.update_failed"));
        }
      } finally {
        if (!cancelled) {
          setPrefsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, t]);

  async function handleSave(e) {
    e.preventDefault();
    if (status !== "authenticated") return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: password || undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || t("profile.update_failed"));
        return;
      }
      setSuccess(t("profile.saved_ok"));
      setPassword("");
      router.refresh();
    } catch (err) {
      console.error("profile PUT", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="main-content glass-box glass-left">
        <h1 className="glass-title">{t("profile.title")}</h1>
        <p style={{ padding: "1rem" }}>{t("profile.loading")}</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    const reason = registrationReason || "not-logged-in";
    const reasonText =
      reason === "no-sub"
        ? t("profile.login_to_manage_sub")
        : t("profile.login_to_view");

    return (
      <div className="main-content glass-box glass-left">
        <h1 className="glass-title">{t("profile.title")}</h1>
        <p style={{ padding: "1rem" }}>{reasonText}</p>
        <div className="back-btn-wrapper">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => router.push("/registreerimine")}
            aria-label={t("profile.login")}
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </div>
    );
  }

  // Rolli silt tõlgetega
  const roleKey =
    session?.user?.role === "ADMIN"
      ? "role.admin"
      : session?.user?.role === "SOCIAL_WORKER"
      ? "role.worker"
      : session?.user?.role === "CLIENT"
      ? "role.client"
      : "role.unknown";
  const roleLabel = t(roleKey);

  return (
    <div className="main-content glass-box glass-left" role="main" aria-labelledby="profile-title">
      <h1 id="profile-title" className="glass-title">
        {t("profile.title")}
      </h1>

      <div className="profile-header-center">
        <span className="profile-role-pill">{roleLabel}</span>
        <Link href="/tellimus" className="link-brand profile-tellimus-link">
          {t("profile.manage_subscription")}
        </Link>
      </div>

      {/* Keelevahetus sektsioon */}
      <section aria-labelledby="lang-section-title" className="glass-form profile-form-vertical" style={{ marginTop: "1rem" }}>
        <h2 id="lang-section-title" className="glass-label" style={{ marginBottom: ".25rem" }}>
          {t("profile.ui_language")}
        </h2>
        <LanguageSwitcher />
      </section>

      {!prefsLoading && !preferencesError ? (
        <ProfilePreferencesForm initialPreferences={initialPreferences} />
      ) : prefsLoading ? (
        <div className="profile-preferences__loading">{t("profile.loading")}</div>
      ) : (
        <div className="profile-preferences__error">{preferencesError}</div>
      )}

      <form onSubmit={handleSave} className="glass-form profile-form-vertical">
        <label htmlFor="email" className="glass-label">
          {t("profile.email")}
        </label>
        <input
          className="input-modern"
          type="email"
          id="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" className="glass-label">
          {t("profile.new_password_optional")}
        </label>
        <input
          className="input-modern"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
        />

        {error && (
          <div role="alert" className="glass-note" style={{ marginTop: "0.75rem" }}>
            {error}
          </div>
        )}
        {success && !error && (
          <div role="status" className="glass-note glass-note--success" style={{ marginTop: "0.75rem" }}>
            {success}
          </div>
        )}

        <div className="profile-btn-row">
          <button type="submit" className="btn-primary btn-profile-save" disabled={saving}>
            {saving ? t("profile.saving") : t("profile.save")}
          </button>
          <button
            type="button"
            className="btn-primary btn-profile-logout"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            {t("profile.logout")}
          </button>
        </div>
      </form>

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

      {/* Konto kustutamise nupp */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="button"
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setDeleting(false);
            setShowDelete(true);
          }}
          aria-label={t("profile.delete_account")}
          title={t("profile.delete_account")}
        >
          <svg viewBox="0 0 448 512" className="svgIcon" aria-hidden="true" focusable="false">
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
          </svg>
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>

      {showDelete && (
        <ModalConfirm
          message={t("profile.delete_confirm")}
          confirmLabel={deleting ? t("profile.deleting") : t("profile.delete_account")}
          cancelLabel={t("common.cancel")}
          onConfirm={async () => {
            if (deleting) return;
            setError("");
            setSuccess("");
            setDeleting(true);
            try {
              const res = await fetch("/api/profile", { method: "DELETE" });
              const payload = await res.json().catch(() => ({}));
              if (!res.ok) {
                setError(payload?.error || t("profile.delete_failed"));
                setDeleting(false);
                return;
              }

              setShowDelete(false);
              const signOutResult = await signOut({ redirect: false, callbackUrl: "/" });
              const redirectUrl = signOutResult?.url || "/";
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
