"use client";

import { usePathname } from "next/navigation";
import Logomust from "@/public/logo/logomust.svg";
import useT from "@/components/i18n/useT";
import { cn } from "@/components/ui/cn";

const HIDE_PREFIXES = ["/admin"];

function shouldHideFooter(pathname) {
  if (!pathname) return false;
  return HIDE_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export default function PageFooter({ className }) {
  const pathname = usePathname();
  const t = useT();

  if (shouldHideFooter(pathname)) return null;

  return (
    <footer className={cn("site-footer", className)} aria-hidden="false">
      <div className="site-footer-inner flex flex-col gap-[0.55rem]">
        <span className="site-footer-logo-wrap" aria-hidden="true">
          <Logomust
            className="site-footer-logo"
            focusable="false"
          />
        </span>
        <p className="m-0 max-w-[min(92vw,58rem)] text-center text-[0.82rem] leading-[1.35] tracking-[0.01em] text-[color:var(--footer-text-muted,#aeb7c5)] opacity-80 max-[768px]:text-[0.78rem]">
          {t("footer.legal")}
        </p>
      </div>
    </footer>
  );
}
