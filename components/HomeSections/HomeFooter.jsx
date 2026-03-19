"use client";

import Logomust from "@/public/logo/logomust.svg";
import useT from "@/components/i18n/useT";
import { cn } from "@/components/ui/cn";

export default function HomeFooter({ className, logoClassName }) {
  const t = useT();
  return (
    <footer
      className={cn(
        "relative z-30 flex w-full justify-center px-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.1rem)] touch-pan-y pointer-events-none bg-transparent border-0 outline-none shadow-none",
        className
      )}
    >
      <div
        className={cn(
          "flex w-[min(92vw,58rem)] flex-col items-center justify-center gap-[0.35rem] pointer-events-none bg-transparent border-0 outline-none shadow-none"
        )}
      >
        <Logomust
          className={cn(
            "home-footer-logo pointer-events-none w-[clamp(18rem,34vw,28rem)] h-auto opacity-[0.8] mt-[2.6rem]",
            logoClassName
          )}
          aria-hidden="true"
          focusable="false"
          style={{ "--end-op": "0.8" }}
        />
        <p className="m-0 max-w-[min(92vw,58rem)] text-center text-[0.82rem] leading-[1.35] tracking-[0.01em] text-[color:var(--footer-text-muted,#aeb7c5)] opacity-80 max-[768px]:text-[0.78rem]">
          {t("footer.legal")}
        </p>
      </div>
    </footer>
  );
}
