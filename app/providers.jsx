"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import AccessibilityProvider from "@/components/accessibility/AccessibilityProvider";
import I18nProvider from "@/components/i18n/I18nProvider";
import { clearStaleScrollLock } from "@/lib/scrollLock";

function RouteScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() || "";

  useEffect(() => {
    if (typeof document === "undefined") return;
    clearStaleScrollLock();
  }, [pathname, searchKey]);

  return null;
}
export default function Providers({
  children,
  initialLocale = "et",
  messages = {},
  session = null,
  initialA11yPrefs = null
}) {
  return <SessionProvider session={session} refetchOnWindowFocus={false}>
      <I18nProvider initialLocale={initialLocale} messages={messages}>
        <AccessibilityProvider initialPrefs={initialA11yPrefs}>
          <RouteScrollReset />
          {children}
        </AccessibilityProvider>
      </I18nProvider>
    </SessionProvider>;
}
