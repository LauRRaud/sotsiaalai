"use client";

import Logomust from "@/public/logo/logomust.svg";
import MetallicPaint from "@/components/MetallicPaint";
import { cn } from "@/components/ui/cn";

export default function HomeFooter({ className, logoClassName }) {
  return (
    <footer
      className={cn(
        "relative z-50 flex w-full justify-center px-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.1rem)] touch-pan-y pointer-events-none bg-transparent border-0 outline-none shadow-none",
        className
      )}
    >
      <div
        className={cn(
          "flex w-[min(92vw,58rem)] flex-col items-center justify-center gap-[0.35rem] pointer-events-none bg-transparent border-0 outline-none shadow-none"
        )}
      >
        <span
          className={cn(
            "home-footer-logo-wrap bottom-logo-breathe pointer-events-none relative block w-[clamp(18rem,34vw,28rem)] aspect-[271.7/48] mt-[2.6rem]",
            logoClassName
          )}
          aria-hidden="true"
        >
          <Logomust
            className="home-footer-logo home-footer-logo-base block h-auto w-full opacity-[0.8]"
            focusable="false"
          />
          <span className="home-footer-metallic-ai pointer-events-none absolute inset-0 block opacity-90" aria-hidden="true">
            <MetallicPaint
              imageSrc="/logo/logomust-ai-mask.svg"
              className="home-footer-metallic-ai-canvas block h-full w-full"
              tintColor="#f5f5f4"
              darkColor="#d2ccc4"
              seed={27.35}
              scale={1.72}
              refraction={0.009}
              blur={0.026}
              liquid={0.78}
              speed={0.11}
              brightness={1.22}
              contrast={0.1}
              angle={-68}
              lightColor="#f5f5f4"
              patternSharpness={0.66}
              chromaticSpread={0}
              waveAmplitude={0.46}
              noiseScale={0.22}
              distortion={0.12}
              contour={0.055}
            />
          </span>
        </span>
      </div>
    </footer>
  );
}
