import { createNavigation } from "next-intl/navigation";

export const locales = ["et", "en", "ru"];
export const localePrefix = "always";

export const { Link, redirect, usePathname, useRouter, getPathname, permanentRedirect } =
  createNavigation({
    locales,
    localePrefix
  });
