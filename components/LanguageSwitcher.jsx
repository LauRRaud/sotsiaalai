// components/LanguageSwitcher.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripLocaleFromPath } from "@/lib/localizePath";

export default function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const stripped = stripLocaleFromPath(pathname) || "/";

  const hrefET = `/et${stripped === "/" ? "" : stripped}`;
  const hrefRU = `/ru${stripped === "/" ? "" : stripped}`;
  const hrefEN = `/en${stripped === "/" ? "" : stripped}`;

  return (
    <nav className="flex gap-2" aria-label="Language switcher">
      <Link href={hrefET}>ET</Link>
      <Link href={hrefRU}>RU</Link>
      <Link href={hrefEN}>EN</Link>
    </nav>
  );
}
