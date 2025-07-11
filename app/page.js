"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";

const Particles = dynamic(() => import("@/components/backgrounds/Particles"), { ssr: false });

export default function HomePage() {
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
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
      <Particles className="particles-container" />
      <div className="main-content">
        {/* Vasak kaart */}
        <div className="side left">
          <div className={`three-d-card float-card left ${flipClass}`}>
            <div className="card-wrapper">
              <div className="card-face front">
                <Magnet
                  padding={80}
                  magnetStrength={18}
                  disabled={isLoginOpen || !flipAllowed}
                >
                  {({ isActive }) => (
                    <div
                      ref={leftCardRef}
                      className={[
                        "glass-card glass-card-light left-card-primary",
                        !leftFadeDone ? "fade-in" : "",
                        leftFadeDone && isActive ? "glow-active" : "",
                      ].join(" ")}
                      style={{ position: "relative" }} // OLULINE
                    >
                      <div className="card-title">
                        <span className="brand-title brand-title-left">SotsiaalAI</span>
                      </div>
                      <div className="card-content">
                        <span className="headline-bold">Sotsiaaltöö<br />spetsialistile</span>
                        <span className="card-description">Info, seadused ja nõuanded.</span>
                      </div>
                      {/* LOGO alati täpselt kaardi keskel */}
                      <img
                        src="/logo/smust.svg"
                        alt="smust logo"
                        className="card-logo-bg card-logo-bg-left"
                        draggable={false}
                      />
                    </div>
                  )}
                </Magnet>
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
                  "centered-back-left",
                  !leftFadeDone ? "fade-in" : "",
                  "glow-static"
                ].join(" ")} style={{ position: "relative" }}>
                  <div className="card-title back">
                    <span className="brand-title brand-title-left">Küsi nõu</span>
                  </div>
                  <div className="card-note left-back">
                    Sinu usaldusväärne töövahend<br />sotsiaalvaldkonna küsimustes.
                  </div>
                  <img
                    src="/logo/saimust.svg"
                    alt="saimust logo"
                    className="card-logo-bg card-logo-bg-left-back"
                    draggable={false}
                  />
                  <div className="centered-back-outer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parem kaart */}
        <div className="side right">
          <div className={`three-d-card float-card right ${flipClass}`}>
            <div className="card-wrapper">
              <div className="card-face front">
                <Magnet
                  padding={80}
                  magnetStrength={18}
                  disabled={isLoginOpen || !flipAllowed}
                >
                  {({ isActive }) => (
                    <div
                      ref={rightCardRef}
                      className={[
                        "glass-card glass-card-dark right-card-primary",
                        !rightFadeDone ? "fade-in" : "",
                        rightFadeDone && isActive ? "glow-active" : "",
                      ].join(" ")}
                      style={{ position: "relative" }} // OLULINE
                    >
                      <div className="card-title">
                        <span className="brand-title brand-title-right">SotsiaalA&lt;B&gt;I</span>
                      </div>
                      <div className="card-content">
                        <span className="headline-bold">Eluküsimusega<br />pöördujale</span>
                        <span className="card-description">Õigused, võimalused ja tugi.</span>
                      </div>
                      <img
                        src="/logo/aivalge.svg"
                        alt="aivalge logo"
                        className="card-logo-bg card-logo-bg-right"
                        draggable={false}
                      />
                    </div>
                  )}
                </Magnet>
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
                  "centered-back-right",
                  !rightFadeDone ? "fade-in" : "",
                  "glow-static"
                ].join(" ")} style={{ position: "relative" }}>
                  <div className="card-title back">
                    <span className="brand-title brand-title-right">Küsi nõu</span>
                  </div>
                  <div className="card-note right-back">
                    Leia selgus ja kindlustunne<br />elulistes sotsiaalküsimustes.
                  </div>
                  <img
                    src="/logo/saivalge.svg"
                    alt="saivalge logo"
                    className="card-logo-bg card-logo-bg-right-back"
                    draggable={false}
                  />
                  <div className="centered-back-outer" />
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
