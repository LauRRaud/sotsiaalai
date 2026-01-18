"use client";

import { SessionProvider } from "next-auth/react";
import AccessibilityProvider from "@/components/accessibility/AccessibilityProvider";
import I18nProvider from "@/components/i18n/I18nProvider";
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
          {children}
        </AccessibilityProvider>
      </I18nProvider>
    </SessionProvider>;
}