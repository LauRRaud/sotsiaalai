"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoginModal from "@/components/LoginModal";
import { pushWithTransition } from "@/lib/routeTransition";

const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "mt-[clamp(2.2rem,5.6vh,3.4rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)]";
const contentClassName = "mt-[clamp(2.2rem,5.2vh,3.2rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-5 text-center";
const inputClassName = "w-full max-w-[22rem]";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t, locale } = useI18n();
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    setStatusMsg("");
    setError("");
  }, [token]);

  const joinErrorText = t("join.error", "Liitumine ebaĆµnnestus");

  async function accept() {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError(t("join.name_required", "Palun sisesta oma nimi."));
      return;
    }
    setBusy(true);
    setError("");
    setStatusMsg("");
    try {
      const res = await fetch(`/api/invites/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          display_name: trimmedName
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        const msg = data?.message || joinErrorText;
        throw new Error(msg);
      }
      setStatusMsg(t("join.success", "Liitumine Ćµnnestus"));
      if (data?.roomId) {
        pushWithTransition(router, `/vestlus?roomId=${encodeURIComponent(data.roomId)}`);
      } else {
        pushWithTransition(router, "/vestlus");
      }
    } catch (err) {
      setError(err?.message || joinErrorText);
    } finally {
      setBusy(false);
    }
  }

  const handleSubmit = event => {
    event.preventDefault();
    accept();
  };

  return (
    <section lang={locale} className={pageShellClassName}>
      <div className={circleClassName}>
        <h1 className={titleClassName}>
          {token ? t("join.heading", "Liitu vestlusega") : t("join.missing_title", "Kutse link puudub")}
        </h1>
        <div className={contentClassName}>
          {!token ? (
            <p className="text-center text-[0.98rem] opacity-80">
              {t("join.missing_description", "Palun ava kutselink oma e-postist.")}
            </p>
          ) : (
            <>
              <p className="text-center text-[0.98rem] opacity-80">
                {t("join.lead", "Kinnitame kutse ja lisame sind ruumi.")}
              </p>
              {status !== "authenticated" ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-center text-[0.98rem] opacity-80">
                    {t("join.signin_prompt", "Logi sisse vĆµi loo konto, et liituda.")}
                  </p>
                  <Button type="button" onClick={() => setLoginOpen(true)}>
                    {t("join.signin", "Logi sisse")}
                  </Button>
                </div>
              ) : (
                <form className="flex w-full flex-col items-center gap-4" onSubmit={handleSubmit}>
                  <p className="text-center text-[0.98rem] opacity-80">
                    {t("join.logged_in_as", "Oled sisse logitud kasutajana {email}.", {
                      email: session?.user?.email || session?.user?.id
                    })}
                  </p>
                  <label className="text-center text-[1.05rem] font-medium tracking-[0.03em]" htmlFor="join-display-name">
                    {t("join.name_label", "Sinu nimi vestluses")}
                  </label>
                  <Input
                    id="join-display-name"
                    size="lg"
                    className={inputClassName}
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    disabled={busy}
                  />
                  <div className="mt-[0.5rem] flex justify-center">
                    <Button type="submit" disabled={busy}>
                      {busy ? t("join.joining", "Liidan...") : t("join.join_button", "Liitu")}
                    </Button>
                  </div>
                </form>
              )}
              {statusMsg ? (
                <p className="text-center text-[color:#a7f3d0]" role="status">
                  {statusMsg}
                </p>
              ) : null}
              {error ? (
                <p className="text-center text-[color:#fca5a5]" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} suppressRedirect />
      </div>
    </section>
  );
}
