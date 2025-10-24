"use client";
import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

const OPTIONS = [
  { code: "et", label: "Eesti" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" }
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (code) => {
    if (code === locale) return;
    startTransition(() => {
      const query = searchParams.toString();
      const target = query ? `${pathname}?${query}` : pathname;
      router.replace(target, { locale: code });
    });
  };

  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          className={`px-3 py-2 border rounded ${locale === code ? "border-black" : "border-gray-300"}`}
          disabled={isPending && locale !== code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
