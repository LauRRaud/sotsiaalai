"use client";

import dynamic from "next/dynamic";
import Space from "@/components/Space";
const Particles = dynamic(() => import("@/components/backgrounds/Particles"), { ssr: false });
const SplashCursor = dynamic(() => import("@/components/SplashCursor"), { ssr: false });

export default function BackgroundLayer() {
  return (
    <>
      <Space
        palette={{
          baseTop: "#070b16",
          baseBottom: "#070b16",
          accentA: "#0a1224",
          accentB: "#0a1224",
        }}
        intensity={0.4}
        grain
        fog
        fogStrength={0.3}
        fogHeightVmax={20}
        fogOffsetVmax={0}
        fogBlobSizeVmax={70}
        fogPairSpreadVmax={22}
        fogHorizontalShiftVmax={-35}
      />
      <Particles className="particles-container" />
      {/* hiire splash-efekt üle sisu (zIndex määratud komponendis) */}
      <SplashCursor />
    </>
  );
}