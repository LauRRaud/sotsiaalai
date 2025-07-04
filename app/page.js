"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";

const Particles = dynamic(() => import("@/components/backgrounds/Particles"), { ssr: false });

const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  border: 0,
};

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

export default function HomePage() {
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [touchDevice, setTouchDevice] = useState(false);

  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    setTouchDevice(isTouchDevice());

    const leftHandler = () => setLeftFadeDone(true);
    const rightHandler = () => setRightFadeDone(true);

    if (leftCardRef.current) leftCardRef.current.addEventListener("animationend", leftHandler);
    if (rightCardRef.current) rightCardRef.current.addEventListener("animationend", rightHandler);

    return () => {
      if (leftCardRef.current) leftCardRef.current.removeEventListener("animationend", leftHandler);
      if (rightCardRef.current) rightCardRef.current.removeEventListener("animationend", rightHandler);
    };
  }, []);

  const flipAllowed = leftFadeDone && rightFadeDone;
  const flipClass = flipAllowed ? "flip-allowed" : "";

  return (
    <>
      <div className="background-gradient" aria-hidden="true" />
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
          <div
            className={`three-d-card float-card left ${flipClass}`}
            tabIndex={flipAllowed ? 0 : -1}
            aria-label="SotsiaalAI – Sotsiaaltöö spetsialistile"
            onKeyDown={e => {
              if ((e.key === "Enter" || e.key === " ") && !isLoginOpen && flipAllowed) {
                setIsLoginOpen(true);
              }
            }}
          >
            <div className="card-wrapper">
              {/* Esikülg */}
              <div className="card-face front" style={{ pointerEvents: isLoginOpen || !flipAllowed ? "none" : "auto" }}>
                <Magnet
                  padding={80}
                  magnetStrength={18}
                  disabled={isLoginOpen || touchDevice}
                >
                  {({ isActive }) => (
                    <div
                      ref={leftCardRef}
                      className={[
                        "glass-card glass-card-light left-card-primary",
                        !leftFadeDone ? "fade-in" : "",
                        leftFadeDone && isActive ? "glow-active" : ""
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
                      {/* SR-only nupp */}
                      <button
                        style={srOnlyStyles}
                        tabIndex={0}
                        aria-label="Ava vestlus – küsi nõu"
                        onClick={() => setIsLoginOpen(true)}
                      >
                        Küsi nõu
                      </button>
                    </div>
                  )}
                </Magnet>
                {/* Mobiilis nähtav nupp */}
                <button
                  className="mobile-ask-btn"
                  onClick={() => setIsLoginOpen(true)}
                  tabIndex={0}
                  aria-label="Ava vestlus – küsi nõu"
                  disabled={!flipAllowed}
                >
                  Küsi nõu
                </button>
              </div>
              {/* Tagakülg */}
              <div
                className="card-face back"
                tabIndex={0}
                onClick={() => flipAllowed && setIsLoginOpen(true)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && flipAllowed && setIsLoginOpen(true)}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div className={[
                  "glass-card glass-card-light left-card-primary centered-back",
                  !leftFadeDone ? "fade-in" : "",
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
          <div
            className={`three-d-card float-card right ${flipClass}`}
            tabIndex={flipAllowed ? 0 : -1}
            aria-label="SotsiaalA<B>I – Eluküsimusega pöördujale"
            onKeyDown={e => {
              if ((e.key === "Enter" || e.key === " ") && !isLoginOpen && flipAllowed) {
                setIsLoginOpen(true);
              }
            }}
          >
            <div className="card-wrapper">
              {/* Esikülg */}
              <div className="card-face front" style={{ pointerEvents: isLoginOpen || !flipAllowed ? "none" : "auto" }}>
                <Magnet
                  padding={80}
                  magnetStrength={18}
                  disabled={isLoginOpen || touchDevice}
                >
                  {({ isActive }) => (
                    <div
                      ref={rightCardRef}
                      className={[
                        "glass-card glass-card-dark right-card-primary",
                        !rightFadeDone ? "fade-in" : "",
                        rightFadeDone && isActive ? "glow-active" : ""
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
                      {/* SR-only nupp */}
                      <button
                        style={srOnlyStyles}
                        tabIndex={0}
                        aria-label="Ava vestlus – küsi nõu"
                        onClick={() => setIsLoginOpen(true)}
                      >
                        Küsi nõu
                      </button>
                    </div>
                  )}
                </Magnet>
                {/* Mobiilis nähtav nupp */}
                <button
                  className="mobile-ask-btn"
                  onClick={() => setIsLoginOpen(true)}
                  tabIndex={0}
                  aria-label="Ava vestlus – küsi nõu"
                  disabled={!flipAllowed}
                >
                  Küsi nõu
                </button>
              </div>
              {/* Tagakülg */}
              <div
                className="card-face back"
                tabIndex={0}
                onClick={() => flipAllowed && setIsLoginOpen(true)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && flipAllowed && setIsLoginOpen(true)}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div className={[
                  "glass-card glass-card-dark right-card-primary centered-back",
                  !rightFadeDone ? "fade-in" : "",
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

      <footer className="footer-row">
        <div className="footer-left">Sotsiaal.AI &copy; 2025</div>
        <div className="footer-right">
          <a href="/meist" className="footer-link">Meist</a>
        </div>
      </footer>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
