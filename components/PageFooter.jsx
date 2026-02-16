"use client";

import { usePathname } from "next/navigation";
import Logomust from "@/public/logo/logomust.svg";
import { cn } from "@/components/ui/cn";

const HIDE_PREFIXES = ["/admin"];

function shouldHideFooter(pathname) {
  if (!pathname) return false;
  return HIDE_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export default function PageFooter({ className }) {
  const pathname = usePathname();

  if (shouldHideFooter(pathname)) return null;

  return (
    <footer className={cn("site-footer", className)} aria-hidden="false">
      <div className="site-footer-inner">
        <Logomust
          className="site-footer-logo"
          aria-hidden="true"
          focusable="false"
        />
      </div>
    </footer>
  );
}
