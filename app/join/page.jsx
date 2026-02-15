"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoginModal from "@/components/LoginModal";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { pushWithTransition } from "@/lib/routeTransition";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";

const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const titleClassName = glassPageTitleClassName;
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

  const joinErrorText = t("join.error");

  async function accept() {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError(t("join.name_required"));
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
        const msg = resolveApiMessage({
          payload: data,
          t,
          fallbackKey: "join.error",
          fallbackText: joinErrorText
        });
        throw new Error(msg);
      }
      setStatusMsg(t("join.success"));
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
      <GlassRing>
        <h1 className={titleClassName}>
          {token ? t("join.heading") : t("join.missing_title")}
        </h1>
        <div className={contentClassName}>
          {!token ? (
            <p className="text-center text-[0.98rem] opacity-80">
              {t("join.missing_description")}
            </p>
          ) : (
            <>
              <p className="text-center text-[0.98rem] opacity-80">
                {t("join.lead")}
              </p>
              {status !== "authenticated" ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-center text-[0.98rem] opacity-80">
                    {t("join.signin_prompt")}
                  </p>
                  <Button type="button" onClick={() => setLoginOpen(true)}>
                    {t("join.signin")}
                  </Button>
                </div>
              ) : (
                <form className="flex w-full flex-col items-center gap-4" onSubmit={handleSubmit}>
                  <p className="text-center text-[0.98rem] opacity-80">
                    {t("join.logged_in_as", {
                      email: session?.user?.email || session?.user?.id
                    })}
                  </p>
                  <label className="text-center text-[1.05rem] font-medium tracking-[0.03em]" htmlFor="join-display-name">
                    {t("join.name_label")}
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
                      {busy ? t("join.joining") : t("join.join_button")}
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
      </GlassRing>
    </section>
  );
}
