"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import DarkModeToggleWrapper from "@/components/DarkModeToggleWrapper";
import {
  CircularRingLeft,
  CircularRingRight,
} from "@/components/TextAnimations/CircularText/CircularText";
import Image from "next/image";

// Load Space only on the client, after hydration
const Space = dynamic(() => import("@/components/Space"), { ssr: false });

export default function HomePage() {
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Magnet/flip flags
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);

  // Background anim gating
  const [bgArmed, setBgArmed] = useState(false);

  // Intro animation only on first visit (tab scope)
  const [skipIntro, setSkipIntro] = useState(true);
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) {
        setSkipIntro(true);
        return;
      }
      const seen = sessionStorage.getItem("seenIntro");
      if (seen) {
        setSkipIntro(true);
      } else {
        setSkipIntro(false);
        sessionStorage.setItem("seenIntro", "1");
      }
    } catch {
      setSkipIntro(true);
    }
  }, []);

  // Dark/Light mode detection via <html> class
  const [mode, setMode] = useState("dark");
  useEffect(() => {
    const html = document.documentElement;
    const update = () =>
      setMode(html.classList.contains("dark-mode") ? "dark" : "light");
    const mo = new MutationObserver(update);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    update();
    return () => mo.disconnect();
  }, []);

  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  // Capture fade-in end events
  useEffect(() => {
    const onLeftEnd = (e) => {
      if (e?.target?.classList?.contains?.("glass-card")) setLeftFadeDone(true);
    };
    const onRightEnd = (e) => {
      if (e?.target?.classList?.contains?.("glass-card")) setRightFadeDone(true);
    };

    const l = leftCardRef.current;
    const r = rightCardRef.current;
    l?.addEventListener("animationend", onLeftEnd);
    r?.addEventListener("animationend", onRightEnd);
    return () => {
      l?.removeEventListener("animationend", onLeftEnd);
      r?.removeEventListener("animationend", onRightEnd);
    };
  }, []);

  // Enable magnet once both fades done (+small buffer)
  useEffect(() => {
    if (leftFadeDone && rightFadeDone) {
      const t = setTimeout(() => setMagnetReady(true), 150);
      return () => clearTimeout(t);
    }
    setMagnetReady(false);
  }, [leftFadeDone, rightFadeDone]);

  // Arm background after card fades and fonts settle (if any)
  useEffect(() => {
    let r1, r2, timer;
    const arm = () => {
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          timer = setTimeout(() => setBgArmed(true), 400);
        });
      });
    };
    if (leftFadeDone && rightFadeDone) {
      if (document.fonts?.ready) {
        document.fonts.ready.then(arm);
      } else {
        arm();
      }
    } else {
      setBgArmed(false);
    }
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      clearTimeout(timer);
    };
  }, [leftFadeDone, rightFadeDone]);

  // Body class for modal state
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

  // Helper: open modal on mobile tap
  const handleMobileTap = () => {
    if (window.innerWidth <= 768) {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      {/* Background */}
      <Space
        mode={mode}
        fog={true}
        animateFog={bgArmed}
        grain={bgArmed}
        fogAppearDelayMs={180}
        fogAppearDurMs={2000}
        skipIntro={skipIntro}
      />

      <DarkModeToggleWrapper
        position="top-center"
        top="0.5rem"
        hidden={isLoginOpen}
      />

      <div className="main-content relative">
        {/* LEFT CARD */}
        <div className="side left">
          <div
            className={`three-d-card float-card left ${flipClass} ${
              leftFlipping ? "is-flipping" : ""
            }`}
            onMouseEnter={onLeftEnter}
            onMouseLeave={onLeftLeave}
            onClick={handleMobileTap} // 👈 mobiilis avab login
          >
            <div className="card-wrapper">
              <div className="card-face front">
                <Magnet
                  padding={80}
                  magnetStrength={18}
                  disabled={isLoginOpen || !magnetReady || leftFlipping}
                >
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
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && flipAllowed)
                    setIsLoginOpen(true);
                }}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div
                  className={[
                    "centered-back-left",
                    !leftFadeDone ? "fade-in" : "",
                    "glow-static",
                  ].join(" ")}
                  style={{ position: "relative" }}
                >
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
                    loading="lazy"
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
            className={`three-d-card float-card right ${flipClass} ${
              rightFlipping ? "is-flipping" : ""
            }`}
            onMouseEnter={onRightEnter}
            onMouseLeave={onRightLeave}
            onClick={handleMobileTap} // 👈 mobiilis avab login
          >
            <div className="card-wrapper">
              <div className="card-face front">
                <Magnet
                  padding={80}
                  magnetStrength={18}
                  disabled={isLoginOpen || !magnetReady || rightFlipping}
                >
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
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && flipAllowed)
                    setIsLoginOpen(true);
                }}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div
                  className={[
                    "centered-back-right",
                    !rightFadeDone ? "fade-in" : "",
                    "glow-static",
                  ].join(" ")}
                  style={{ position: "relative" }}
                >
                  <div className="card-title back">
                    <span className="brand-title brand-title-right">
                      KÜSI NÕU
                    </span>
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
                    loading="lazy"
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

      {/* Footer */}
      <footer className="footer-column relative">
        <Link
          href="/meist"
          className="footer-link footer-link-headline defer-fade delay-1"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          MEIST
        </Link>

        <Image
          src="/logo/logomust.svg"
          alt="SotsiaalAI logo"
          className="footer-logo-img defer-fade delay-2 dim"
          draggable={false}
          loading="lazy"
          width={240}
          height={80}
          style={{ opacity: 0, visibility: "hidden" }}
        />
      </footer>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
