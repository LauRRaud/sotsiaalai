// components/LanguageSwitcher.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripLocaleFromPath } from "@/lib/localizePath";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const stripped = stripLocaleFromPath(pathname) || "/";
  const { t } = useI18n();

  const hrefET = `/et${stripped === "/" ? "" : stripped}`;
  const hrefRU = `/ru${stripped === "/" ? "" : stripped}`;
  const hrefEN = `/en${stripped === "/" ? "" : stripped}`;

  const labelET = t("common.languages.et", "ET");
  const labelRU = t("common.languages.ru", "RU");
  const labelEN = t("common.languages.en", "EN");

  return (
    <nav className="flex gap-2" aria-label={t("common.ui_language", "Language switcher")}> 
      <Link href={hrefET} aria-label={labelET}>{labelET}</Link>
      <Link href={hrefRU} aria-label={labelRU}>{labelRU}</Link>
      <Link href={hrefEN} aria-label={labelEN}>{labelEN}</Link>
    </nav>
  );
}
