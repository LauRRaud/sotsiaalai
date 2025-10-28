// components/HomePage.jsx
"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";
import Image from "next/image";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import useT from "@/components/i18n/useT";

export default function HomePage() {
  const { prefs } = useAccessibility();
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);
  const [mobileFlipReady, setMobileFlipReady] = useState({ left: false, right: false });

  const [isMobile, setIsMobile] = useState(false); // ← NEW

  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);
  const t = useT();

  // detect mobile once + on resize
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // .fade-in end flags
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

  // Reduced-motion: mark fade completed immediately
  useEffect(() => {
    if (prefs.reduceMotion) {
      setLeftFadeDone(true);
      setRightFadeDone(true);
      setMagnetReady(false);
    }
  }, [prefs.reduceMotion]);

  // enable Magnet after both fade-ins
  useEffect(() => {
    if (leftFadeDone && rightFadeDone) {
      const t = setTimeout(() => setMagnetReady(true), 150);
      return () => clearTimeout(t);
    }
    setMagnetReady(false);
  }, [leftFadeDone, rightFadeDone]);

  // lock body scroll when modal open
  useEffect(() => {
    document.body.classList.toggle("modal-open", isLoginOpen);
    return () => document.body.classList.remove("modal-open");
  }, [isLoginOpen]);

  useEffect(() => {
    if (!isLoginOpen) return;
    setMobileFlipReady({ left: false, right: false });
  }, [isLoginOpen]);

  const flipAllowed = leftFadeDone && rightFadeDone;
  // IMPORTANT: desktop gets hover flip; mobile does not
  // Reduced motion: allow flipping, but transitions are globally minimized by CSS
  const flipClass = !isMobile && flipAllowed ? "flip-allowed" : "";
  const flipEndMs = 333;

  // desktop hover handlers – no-op on mobile
  const onLeftEnter  = () => { if (!isMobile) setLeftFlipping(true); };
  const onLeftLeave  = () => { if (!isMobile) setTimeout(() => setLeftFlipping(false), flipEndMs); };
  const onRightEnter = () => { if (!isMobile) setRightFlipping(true); };
  const onRightLeave = () => { if (!isMobile) setTimeout(() => setRightFlipping(false), flipEndMs); };

  const handleCardBackClick = (side) => (e) => {
    if (!flipAllowed) return;
    if (!isMobile) { setIsLoginOpen(true); return; }
    e?.stopPropagation?.();
    if (!mobileFlipReady[side]) {
      setMobileFlipReady({ left: side === "left", right: side === "right" });
      e?.currentTarget?.focus?.();
      return;
    }
    setMobileFlipReady({ left: false, right: false });
    setIsLoginOpen(true);
  };

  const handleCardBackBlur = (side) => () => {
    setMobileFlipReady((prev) => ({ ...prev, [side]: false }));
  };

  // tap: mobile → toggle flip; desktop → open modal immediately
  const handleCardTap = (side) => () => {
    if (!flipAllowed) return;
    if (!isMobile) { setIsLoginOpen(true); return; }
    setMobileFlipReady((prev) =>
      !prev[side]
        ? { left: side === "left", right: side === "right" } // 1st tap → flip
        : { left: false, right: false }                      // 2nd tap on same side → reset (back-side handler opens modal)
    );
  };
  const resetMobileCards = useCallback(() => {
    setMobileFlipReady({ left: false, right: false });
  }, []);

  const handleBackgroundTap = useCallback((event) => {
    if (!isMobile) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest?.(".three-d-card")) return;
    resetMobileCards();
  }, [isMobile, resetMobileCards]);


  return (
    <>
      <div className="homepage-root" onClick={handleBackgroundTap}>
        {/* Desktop: MEIST ülal keskel (mobiilis eraldi CSS-iga logo kohal) */}
        {!isMobile && (
          <nav className="top-center-nav" aria-label={t("nav.main")}>
            <Link
              id="nav-meist"
              href="/meist"
              className="footer-link-headline top-center-link defer-fade defer-from-top delay-1 dim"
            >
              {t("nav.about")}
            </Link>
          </nav>
        )}
        <div className="main-content relative">
          {/* LEFT CARD */}
          <div className="side left">
            <div
              className={`three-d-card float-card left ${flipClass} ${leftFlipping ? "is-flipping" : ""} ${
                mobileFlipReady.left ? "mobile-flipped-left" : ""
              }`}
              onMouseEnter={onLeftEnter}
              onMouseLeave={onLeftLeave}
              onClick={handleCardTap("left")}
            >
              <div className="card-wrapper">
                {/* FRONT */}
                <div className="card-face front">
                  <Magnet padding={80} magnetStrength={18} disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || leftFlipping}>
                    {({ isActive }) => (
                      <div
                        ref={leftCardRef}
                        className={[
                          "glass-card glass-card-light left-card-primary",
                          !leftFadeDone ? "fade-in" : "",
                          leftFadeDone ? "fade-in-done" : "",
                          leftFadeDone && isActive ? "glow-active" : "",
                        ].join(" ")}
                        style={{ position: "relative" }}
                      >
                        <CircularRingLeft className={leftFadeDone ? "ct-visible" : ""} />
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
                      </div>
                    )}
                  </Magnet>
                </div>
  
                {/* BACK */}
                <div
                  className="card-face back"
                  role="button"
                  aria-label={t("home.card.specialist.aria")}
                  tabIndex={0}
                  onClick={handleCardBackClick("left")}
                  onBlur={handleCardBackBlur("left")}
                  onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && flipAllowed) setIsLoginOpen(true); }}
                  style={!flipAllowed ? { pointerEvents: "none" } : {}}
                >
                  <div className={["centered-back-left", !leftFadeDone ? "fade-in" : "", "glow-static"].join(" ")}>
                    <h2 className="headline-bold">{t("home.card.specialist.title")}</h2>
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
              className={`three-d-card float-card right ${flipClass} ${rightFlipping ? "is-flipping" : ""} ${
                mobileFlipReady.right ? "mobile-flipped-right" : ""
              }`}
              onMouseEnter={onRightEnter}
              onMouseLeave={onRightLeave}
              onClick={handleCardTap("right")}
            >
              <div className="card-wrapper">
                {/* FRONT */}
                <div className="card-face front">
                  <Magnet padding={80} magnetStrength={18} disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || rightFlipping}>
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
                        <CircularRingRight className={rightFadeDone ? "ct-visible" : ""} />
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
                      </div>
                    )}
                  </Magnet>
                </div>
  
                {/* BACK */}
                <div
                  className="card-face back"
                  role="button"
                  aria-label={t("home.card.client.aria")}
                  tabIndex={0}
                  onClick={handleCardBackClick("right")}
                  onBlur={handleCardBackBlur("right")}
                  onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && flipAllowed) setIsLoginOpen(true); }}
                  style={!flipAllowed ? { pointerEvents: "none" } : {}}
                >
                  <div className={["centered-back-right", !rightFadeDone ? "fade-in" : "", "glow-static"].join(" ")}>
                    <h2 className="headline-bold">{t("home.card.client.title")}</h2>
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
        <footer className={`footer-column relative${isMobile ? " footer-column-mobile" : ""}`}>
          {isMobile && (
            <nav className="footer-bottom-nav" aria-label={t("nav.main")}>
              <Link
                id="nav-meist"
                href="/meist"
                className="footer-link-headline top-center-link defer-fade defer-from-bottom delay-1 dim"
              >
                {t("nav.about")}
              </Link>
            </nav>
          )}
          <Image
            src="/logo/logomust.svg"
            alt={t("home.footer.logo_alt")}
            id="footer-logo-img"
            className="footer-logo-img defer-fade defer-from-bottom delay-2 dim"
            draggable={false}
            loading="eager"
            fetchPriority="high"
            width={240}
            height={80}
          />
        </footer>
      </div>
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
