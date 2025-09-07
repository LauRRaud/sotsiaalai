// components/HomePage.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import DarkModeToggleWrapper from "@/components/DarkModeToggleWrapper";
import Space from "@/components/Space";
import {
  CircularRingLeft,
  CircularRingRight,
} from "@/components/TextAnimations/CircularText/CircularText";

export default function HomePage() {
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Magnet/flip lippud
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);

  // Udu/tera “armimine” (millal lubame taustal animatsiooni alustada)
  const [bgArmed, setBgArmed] = useState(false);

  // Intro animatsioon ainult esimesel külastusel (sama tab)
  const [skipIntro, setSkipIntro] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setSkipIntro(true);
      return;
    }
    const seen = sessionStorage.getItem("seenIntro");
    if (seen) {
      setSkipIntro(true);   // ära mängi intro't
    } else {
      setSkipIntro(false);  // mängi intro't
      sessionStorage.setItem("seenIntro", "1");
    }
  }, []);

  // Dark/Light režiimi tuvastus (<html> klass)
  const [mode, setMode] = useState("dark"); // turvaline vaikimisi SSR-i vastu
  useEffect(() => {
    const html = document.documentElement;
    const update = () => setMode(html.classList.contains("dark-mode") ? "dark" : "light");
    const mo = new MutationObserver(update);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    update();
    return () => mo.disconnect();
  }, []);

  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  // Võta fade-in lõpud event'iga
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

  // magnetReady → alles siis, kui mõlemad fade'id valmis + 150ms puhver
  useEffect(() => {
    if (leftFadeDone && rightFadeDone) {
      const t = setTimeout(() => setMagnetReady(true), 150);
      return () => clearTimeout(t);
    }
    setMagnetReady(false);
  }, [leftFadeDone, rightFadeDone]);

  // Udu/tera aktiveerimine pärast kaartide fade’i + fontide valmidust
  useEffect(() => {
    let r1, r2, timer;
    const arm = () => {
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          timer = setTimeout(() => setBgArmed(true), 400); // 300–600ms “magus koht”
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

  // body klass modali jaoks
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

  return (
    <>
      {/* Taust: udu/grain on alati DOM-is; animatsioon käivitub, kui bgArmed === true */}
      <Space
        mode={mode}               // "dark" | "light"
        fog={true}                // hoia udu DOM-is stabiilsuse huvides
        animateFog={bgArmed}      // animatsiooni trigger (pärast kaartide fade'i)
        grain={bgArmed}           // tera samamoodi
        fogAppearDelayMs={180}    // sisemine delay
        fogAppearDurMs={2000}     // sujuv udu tõus
        skipIntro={skipIntro}     // mängi ainult esimesel külastusel
      />

      <DarkModeToggleWrapper position="top-center" top="0.5rem" hidden={isLoginOpen} />

      <div className="main-content relative">
        {/* VASAK KAART */}
        <div className="side left">
          <div
            className={`three-d-card float-card left ${flipClass} ${leftFlipping ? "is-flipping" : ""}`}
            onMouseEnter={onLeftEnter}
            onMouseLeave={onLeftLeave}
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

                      <img
                        src="/logo/aivalge.svg"
                        alt="Aivalge logo"
                        className="card-logo-bg card-logo-bg-left"
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                        draggable={false}
                      />

                      <div className="centered-front-outer" aria-hidden="true" />
                    </div>
                  )}
                </Magnet>
              </div>

              <div
                className="card-face back"
                tabIndex={0}
                onClick={() => flipAllowed && setIsLoginOpen(true)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && flipAllowed) setIsLoginOpen(true);
                }}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div
                  className={["centered-back-left", !leftFadeDone ? "fade-in" : "", "glow-static"].join(" ")}
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

                  <img
                    src="/logo/saimust.svg"
                    alt="Saimust logo"
                    className="card-logo-bg card-logo-bg-left-back"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    draggable={false}
                  />

                  <div className="centered-back-outer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAREM KAART */}
        <div className="side right">
          <div
            className={`three-d-card float-card right ${flipClass} ${rightFlipping ? "is-flipping" : ""}`}
            onMouseEnter={onRightEnter}
            onMouseLeave={onRightLeave}
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

                      <img
                        src="/logo/smust.svg"
                        alt="Smust logo"
                        className="card-logo-bg card-logo-bg-right"
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                        draggable={false}
                      />

                      <div className="centered-front-outer" aria-hidden="true" />
                    </div>
                  )}
                </Magnet>
              </div>

              <div
                className="card-face back"
                tabIndex={0}
                onClick={() => flipAllowed && setIsLoginOpen(true)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && flipAllowed) setIsLoginOpen(true);
                }}
                style={!flipAllowed ? { pointerEvents: "none" } : {}}
              >
                <div
                  className={["centered-back-right", !rightFadeDone ? "fade-in" : "", "glow-static"].join(" ")}
                  style={{ position: "relative" }}
                >
                  <div className="card-title back">
                    <span className="brand-title brand-title-right">KÜSI NÕU</span>
                  </div>

                  <div className="card-note right-back">
                    Leia selgus ja kindlustunne
                    <br />
                    elulistes sotsiaalküsimustes.
                  </div>

                  <img
                    src="/logo/saivalge.svg"
                    alt="Saivalge logo"
                    className="card-logo-bg card-logo-bg-right-back"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    draggable={false}
                  />

                  <div className="centered-back-outer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jalus + Meist link – defer-fade klassid jäävad */}
      <footer className="footer-column relative">
        <Link
          href="/meist"
          className="footer-link footer-link-headline defer-fade delay-1"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          MEIST
        </Link>

        <img
          src="/logo/logomust.svg"
          alt="SotsiaalAI logo"
          className="footer-logo-img defer-fade delay-2 dim"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          style={{ opacity: 0, visibility: "hidden" }}
        />
      </footer>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
