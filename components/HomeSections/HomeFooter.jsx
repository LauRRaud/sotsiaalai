"use client";

import Logomust from "@/public/logo/logomust.svg";
import { cn } from "@/components/ui/cn";
import useT from "@/components/i18n/useT";
import styles from "../HomePage.module.css";

export default function HomeFooter({ className, logoClassName }) {
  const t = useT();
  return (
    <footer
      className={cn(
        "relative z-30 flex w-full justify-center px-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.1rem)] touch-pan-y pointer-events-none",
        styles["home-footer"],
        className
      )}
    >
      <div
        className={cn(
          "flex w-[min(92vw,58rem)] flex-col items-center justify-center gap-[0.35rem] pointer-events-none",
          styles["home-footer-inner"]
        )}
      >
        <Logomust
          className={cn(styles["home-footer-logo"], "home-footer-logo", logoClassName, "pointer-events-none")}
          role="img"
          aria-label={t("home.footer.logo_alt")}
        />
      </div>
    </footer>
  );
}
