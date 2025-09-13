// components/home/ClientHomeShell.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";
import Image from "next/image";

export default function ClientHomeShell() {
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);

  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    const onLeftEnd = (e) => { if (e?.target?.classList?.contains?.("glass-card")) setLeftFadeDone(true); };
    const onRightEnd = (e) => { if (e?.target?.classList?.contains?.("glass-card")) setRightFadeDone(true); };
    const l = leftCardRef.current, r = rightCardRef.current;
    l?.addEventListener("animationend", onLeftEnd);
    r?.addEventListener("animationend", onRightEnd);
    return () => {
      l?.removeEventListener("animationend", onLeftEnd);
      r?.removeEventListener("animationend", onRightEnd);
    };
  }, []);

  useEffect(() => {
    if (leftFadeDone && rightFadeDone) {
      const t = setTimeout(() => setMagnetReady(true), 150);
      return () => clearTimeout(t);
    }
    setMagnetReady(false);
  }, [leftFadeDone, rightFadeDone]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", isLoginOpen);
    return () => document.body.classList.remove("modal-open");
  }, [isLoginOpen]);

  const flipAllowed = leftFadeDone && rightFadeDone;
  const flipClass = flipAllowed ? "flip-allowed" : "";
  const flipEndMs = 333;

  const onLeftEnter = () => setLeftFlipping(true);
  const onLeftLeave = () => setTimeout(() => setLeftFlipping(false), flipEndMs);
  const onRightEnter = () => setRightFlipping(true);
  const onRightLeave = () => setTimeout(() => setRightFlipping(false), flipEndMs);

  const handleMobileTap = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) setIsLoginOpen(true);
  };

  return (
    <>
      {/* Ülaserva MEIST link (keskel, fade from top, 0.5 nähtavus) */}
      <nav className="top-center-nav" aria-label="Peamenüü">
        <Link
          href="/meist"
          className="footer-link-headline top-center-link defer-fade defer-from-top delay-1 dim"
        >
          MEIST
        </Link>
      </nav>

      <div className="main-content relative">
        {/* LEFT CARD */}
        <div className="side left">
          <div
            className={`three-d-card float-card left ${flipClass} ${leftFlipping ? "is-flipping" : ""}`}
            onMouseEnter={onLeftEnter}
            onMouseLeave={onLeftLeave}
            onClick={handleMobileTap}
          >
            <div className="card-wrapper">
              <div className="card-face front">
                <Magnet padding={80} magnetStrength={18} disabled={isLoginOpen || !magnetReady || leftFlipping}>
                  {({ isActive }) => (
                    <div
                      ref={leftCardRef}
                      className={[
                        "glass-card glass-card-light left-card-primary",
                        !leftFadeDone ? "fade-in" : "",
                        leftFadeDone && isActive ? "glow-active" : "",
                      ].join(" ")}
                      style={{ position: "relative" }}
                    >
                      <div className="card-content">
                        <span className="headline-bold">
                          SOTSIAALTÖÖ
                          <br />
                          SPETSIALISTILE
                        </span>
                      </div>

                      <CircularRingLeft />

                      <Image
                        src="/logo/aivalge.svg"
                        alt=""
                        aria-hidden="true"
                        className="card-logo-bg card-logo-bg-left"
                        draggable={false}
                        priority
                        width={300}
                        height={300}
                      />

                      <div className="centered-front-outer" aria-hidden="true" />
                    </div>
                  )}
                </Magnet>
              </div>

              {/* Back */}
              <div
                className="card-face back"
                role="button"
                aria-label="Logi sisse spetsialistina"
                tabIndex={0}
                onClick={() => flipAllowed && setIsLoginOpen(true)}
                onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && flipAllowed) setIsLoginOpen(true); }}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div className={["centered-back-left", !leftFadeDone ? "fade-in" : "", "glow-static"].join(" ")} style={{ position: "relative" }}>
                  <div className="card-title back">
                    <span className="brand-title brand-title-left">KÜSI NÕU</span>
                  </div>
                  <div className="card-note left-back">
                    Sinu usaldusväärne töövahend
                    <br />
                    sotsiaalvaldkonna küsimustes.
                  </div>

                  <Image
                    src="/logo/saimust.svg"
                    alt=""
                    aria-hidden="true"
                    className="card-logo-bg card-logo-bg-left-back"
                    draggable={false}
                    loading="eager"
                    width={300}
                    height={300}
                  />

                  <div className="centered-back-outer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="side right">
          <div
            className={`three-d-card float-card right ${flipClass} ${rightFlipping ? "is-flipping" : ""}`}
            onMouseEnter={onRightEnter}
            onMouseLeave={onRightLeave}
            onClick={handleMobileTap}
          >
            <div className="card-wrapper">
              <div className="card-face front">
                <Magnet padding={80} magnetStrength={18} disabled={isLoginOpen || !magnetReady || rightFlipping}>
                  {({ isActive }) => (
                    <div
                      ref={rightCardRef}
                      className={[
                        "glass-card glass-card-dark right-card-primary",
                        !rightFadeDone ? "fade-in" : "",
                        rightFadeDone && isActive ? "glow-active" : "",
                      ].join(" ")}
                      style={{ position: "relative" }}
                    >
                      <div className="card-content">
                        <span className="headline-bold">
                          ELUKÜSIMUSEGA
                          <br />
                          PÖÖRDUJALE
                        </span>
                      </div>

                      <CircularRingRight />

                      <Image
                        src="/logo/smust.svg"
                        alt=""
                        aria-hidden="true"
                        className="card-logo-bg card-logo-bg-right"
                        draggable={false}
                        priority
                        width={300}
                        height={300}
                      />

                      <div className="centered-front-outer" aria-hidden="true" />
                    </div>
                  )}
                </Magnet>
              </div>

              {/* Back */}
              <div
                className="card-face back"
                role="button"
                aria-label="Logi sisse pöördujana"
                tabIndex={0}
                onClick={() => flipAllowed && setIsLoginOpen(true)}
                onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && flipAllowed) setIsLoginOpen(true); }}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div className={["centered-back-right", !rightFadeDone ? "fade-in" : "", "glow-static"].join(" ")} style={{ position: "relative" }}>
                  <div className="card-title back">
                    <span className="brand-title brand-title-right">KÜSI NÕU</span>
                  </div>
                  <div className="card-note right-back">
                    Leia selgus ja kindlustunne
                    <br />
                    elulistes sotsiaalküsimustes.
                  </div>

                  <Image
                    src="/logo/saivalge.svg"
                    alt=""
                    aria-hidden="true"
                    className="card-logo-bg card-logo-bg-right-back"
                    draggable={false}
                    loading="eager"
                    width={300}
                    height={300}
                  />

                  <div className="centered-back-outer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (ainult logo, alt fade, 0.5 nähtavus) */}
      <footer className="footer-column relative">
        <Image
          src="/logo/logomust.svg"
          alt="SotsiaalAI logo"
          className="footer-logo-img defer-fade defer-from-bottom delay-2 dim"
          draggable={false}
          loading="eager"
          fetchPriority="high"
          width={240}
          height={80}
        />
      </footer>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
