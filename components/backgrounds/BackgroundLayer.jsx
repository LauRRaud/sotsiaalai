'use client';

import dynamic from "next/dynamic";
import { memo } from "react";

// NB! Tee õiged rajad vastavalt sinu struktuurile:
const Particles    = dynamic(() => import("./Particles"), { ssr: false });            // components/backgrounds/Particles.jsx
const Space        = dynamic(() => import("../Space"), { ssr: false });               // components/Space.jsx
const SplashCursor = dynamic(() => import("../SplashCursor"), { ssr: false });        // components/SplashCursor.jsx

function BackgroundLayer() {
  return (
    <>
      <div id="bg-stack" className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <Space />
        <Particles />
      </div>
      <div id="fx-stack" className="fixed inset-0 -z-10" aria-hidden="true">
        <SplashCursor />
      </div>
    </>
  );
}

export default memo(BackgroundLayer);