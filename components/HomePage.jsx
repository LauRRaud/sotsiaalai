// components/home/ClientHomeShell.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import {
  CircularRingLeft,
  CircularRingRight,
} from "@/components/TextAnimations/CircularText/CircularText";
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

  // kui kaardi .fade-in animatsioon lõpeb, märgime done
  useEffect(() => {
    const onLeftEnd = (e) => {
      if (e?.target?.classList?.contains?.("glass-card")) setLeftFadeDone(true);
    };
    const onRightEnd = (e) => {
      if (e?.target?.classList?.contains?.("glass-card")) setRightFadeDone(true);
    };
    const l = leftCardRef.current,
      r = rightCardRef.current;
    l?.addEventListener("animationend", onLeftEnd);
    r?.addEventListener("animationend", onRightEnd);
    return () => {
      l?.removeEventListener("animationend", onLeftEnd);
      r?.removeEventListener("animationend", onRightEnd);
    };
  }, []);

  // aktiveeri Magnet väike viive pärast mõlema fade-in’i
  useEffect(() => {
    if (leftFadeDone && rightFadeDone) {
      const t = setTimeout(() => setMagnetReady(true), 150);
      return () => clearTimeout(t);
    }
    setMagnetReady(false);
  }, [leftFadeDone, rightFadeDone]);

  // lukusta body kerimine modaliga
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
    if (typeof window !== "undefined" && window.innerWidth <= 768)
      setIsLoginOpen(true);
  };

  return (
    <>
      {/* Ülaserva MEIST link */}
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
            className={`three-d-card float-card left ${flipClass} ${
              leftFlipping ? "is-flipping" : ""
            }`}
            onMouseEnter={onLeftEnter}
            onMouseLeave={onLeftLeave}
            onClick={handleMobileTap}
          >
            <div className="card-wrapper">
              {/* FRONT */}
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
                        leftFadeDone ? "fade-in-done" : "",
                        // ⬇️ helendus ainult kui magnet aktiivne JA fade tehtud
                        leftFadeDone && isActive ? "glow-active" : "",
                      ].join(" ")}
                      style={{ position: "relative" }}
                    >
                      {/* ringtekst – näitame sujuvalt alles pärast fade-in’i */}
                      <CircularRingLeft className={leftFadeDone ? "ct-visible" : ""} />

                      {/* esikülje logo (nähtavust saad CSS-iga juhtida) */}
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

                      {/* pehme välimine halo, mis ise ka fade’ib sisse */}
                      <div className="centered-front-outer" aria-hidden="true" />
                    </div>
                  )}
                </Magnet>
              </div>

              {/* BACK (pealkiri tagaküljel) */}
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
                >
                  <span className="headline-bold">SOTSIAALTÖÖ SPETSIALISTILE</span>

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
            onClick={handleMobileTap}
          >
            <div className="card-wrapper">
              {/* FRONT */}
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
                        rightFadeDone ? "fade-in-done" : "",
                        rightFadeDone && isActive ? "glow-active" : "",
                      ].join(" ")}
                      style={{ position: "relative" }}
                    >
                      <CircularRingRight
                        className={rightFadeDone ? "ct-visible" : ""}
                      />

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

              {/* BACK (pealkiri tagaküljel) */}
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
                >
                  <span className="headline-bold">ELUKÜSIMUSEGA PÖÖRDUJALE</span>

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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (logo) */}
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
