"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import SplashCursor from "@/components/SplashCursor";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";

const Particles = dynamic(() => import("@/components/backgrounds/Particles"), { ssr: false });

export default function HomePage() {
  const [fadeInDone, setFadeInDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    // Fade-in lõpp peale animatsiooni
    const handle = () => setFadeInDone(true);
    if (leftCardRef.current) leftCardRef.current.addEventListener("animationend", handle);
    if (rightCardRef.current) rightCardRef.current.addEventListener("animationend", handle);
    return () => {
      if (leftCardRef.current) leftCardRef.current.removeEventListener("animationend", handle);
      if (rightCardRef.current) rightCardRef.current.removeEventListener("animationend", handle);
    };
  }, []);

  const fadeClass = !fadeInDone ? "fade-in" : "";

  return (
    <>
      {/* Tausta gradient */}
      <div className="background-gradient" aria-hidden="true" />

      {/* Osakeste kiht */}
      <Particles
        particleColors={["#4851fa", "#a133e1", "#18181866", "#e2e2e2"]}
        particleCount={170}
        particleSpread={25}
        speed={0.04}
        particleBaseSize={700}
        sizeRandomness={0.9}
        alphaParticles={true}
        moveParticlesOnHover={false}
        disableRotation={false}
        className="particles-container"
      />

      <div className="main-content">
        {/* Vasak kaart */}
        <div className="side left">
          <div className="three-d-card float-card left">
            <div className="card-wrapper">
              {/* Esikülg – Magnet ainult siin */}
              <div className="card-face front" style={{ pointerEvents: isLoginOpen ? "none" : "auto" }}>
                <Magnet padding={80} magnetStrength={18} disabled={isLoginOpen}>
                  {({ isActive }) => (
                    <div
                      ref={leftCardRef}
                      className={[
                        "glass-card glass-card-light left-card-primary",
                        fadeClass,
                        fadeInDone && isActive ? "glow-active" : ""
                      ].join(" ")}
                      tabIndex={-1}
                    >
                      <img src="/logo/smust.svg" alt="smust logo" className="card-logo-bg card-logo-bg-left" />
                      <div className="card-title">
                        <span className="brand-title brand-title-left">SotsiaalAI</span>
                      </div>
                      <div className="card-content">
                        <div className="card-headline">
                          <span className="headline-bold">Sotsiaaltöö<br />spetsialistile</span>
                          <div className="card-info-bottom">
                            <span className="card-description">Info, seadused ja nõuanded.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Magnet>
              </div>
              {/* Tagakülg – ilma Magnetita, ilma JS või style'deta */}
              <div
                className="card-face back"
                tabIndex={0}
                onClick={() => setIsLoginOpen(true)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && setIsLoginOpen(true)}
              >
                <div className={[
                  "glass-card glass-card-light left-card-primary centered-back",
                  fadeClass,
                  "glow-static"
                ].join(" ")}>
                  <img src="/logo/saimust.svg" alt="saimust logo" className="card-logo-bg card-logo-bg-left-back" />
                  <div className="centered-back-outer" />
                  <div className="card-title back">
                    <span className="brand-title brand-title-left">Küsi nõu</span>
                  </div>
                  <div className="card-note left-back">
                    Sinu usaldusväärne töövahend<br />sotsiaalvaldkonna küsimustes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parem kaart */}
        <div className="side right">
          <div className="three-d-card float-card right">
            <div className="card-wrapper">
              {/* Esikülg – Magnet ainult siin */}
              <div className="card-face front" style={{ pointerEvents: isLoginOpen ? "none" : "auto" }}>
                <Magnet padding={80} magnetStrength={18} disabled={isLoginOpen}>
                  {({ isActive }) => (
                    <div
                      ref={rightCardRef}
                      className={[
                        "glass-card glass-card-dark right-card-primary",
                        fadeClass,
                        fadeInDone && isActive ? "glow-active" : ""
                      ].join(" ")}
                      tabIndex={-1}
                    >
                      <img src="/logo/aivalge.svg" alt="aivalge logo" className="card-logo-bg card-logo-bg-right" />
                      <div className="card-title">
                        <span className="brand-title brand-title-right">SotsiaalA&lt;B&gt;I</span>
                      </div>
                      <div className="card-content">
                        <div className="card-headline">
                          <span className="headline-bold">Eluküsimusega<br />pöördujale</span>
                          <div className="card-info-bottom">
                            <span className="card-description">Õigused, võimalused ja tugi.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Magnet>
              </div>
              {/* Tagakülg – ilma Magnetita, ilma JS või style'deta */}
              <div
                className="card-face back"
                tabIndex={0}
                onClick={() => setIsLoginOpen(true)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && setIsLoginOpen(true)}
              >
                <div className={[
                  "glass-card glass-card-dark right-card-primary centered-back",
                  fadeClass,
                  "glow-static"
                ].join(" ")}>
                  <img src="/logo/saivalge.svg" alt="saivalge logo" className="card-logo-bg card-logo-bg-right-back" />
                  <div className="centered-back-outer" />
                  <div className="card-title back">
                    <span className="brand-title brand-title-right">Küsi nõu</span>
                  </div>
                  <div className="card-note right-back">
                    Leia selgus ja kindlustunne<br />elulistes sotsiaalküsimustes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jalus */}
      <footer className="footer-row">
        <div className="footer-left">Sotsiaal.AI &copy; 2025</div>
        <div className="footer-right">
          <a href="/meist" className="footer-link">Meist</a>
        </div>
      </footer>

      {/* SplashCursor – alati pärast kaarte ja enne modali */}
      <SplashCursor />

      {/* LoginModal – kõige ees */}
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
