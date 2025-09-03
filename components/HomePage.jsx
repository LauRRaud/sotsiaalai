"use client";
import { useEffect, useState, useRef } from "react";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import DarkModeToggleWrapper from "@/components/DarkModeToggleWrapper";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";

export default function HomePage() {
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Flip throttling lipud
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const flipEndMs = 500;

  function onLeftEnter() { setLeftFlipping(true); }
  function onLeftLeave() { setTimeout(() => setLeftFlipping(false), flipEndMs); }
  function onRightEnter() { setRightFlipping(true); }
  function onRightLeave() { setTimeout(() => setRightFlipping(false), flipEndMs); }

  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    const leftHandler = () => setLeftFadeDone(true);
    const rightHandler = () => setRightFadeDone(true);
    const lc = leftCardRef.current;
    const rc = rightCardRef.current;
    if (lc) lc.addEventListener("animationend", leftHandler);
    if (rc) rc.addEventListener("animationend", rightHandler);
    return () => {
      if (lc) lc.removeEventListener("animationend", leftHandler);
      if (rc) rc.removeEventListener("animationend", rightHandler);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", isLoginOpen);
    return () => document.body.classList.remove("modal-open");
  }, [isLoginOpen]);

  const flipAllowed = leftFadeDone && rightFadeDone;
  const flipClass = flipAllowed ? "flip-allowed" : "";

  return (
    <>
      <DarkModeToggleWrapper position="top-center" top="0.5rem" hidden={isLoginOpen} />

      <div className="main-content relative z-0">
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
                  disabled={isLoginOpen || !flipAllowed || leftFlipping}
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
                        alt="aivalge logo"
                        className="card-logo-bg card-logo-bg-left"
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
                  disabled={isLoginOpen || !flipAllowed || rightFlipping}
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
                        alt="smust logo"
                        className="card-logo-bg card-logo-bg-right"
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

      <footer className="footer-column relative z-0">
        <Link href="/meist" className="footer-link footer-link-headline">MEIST</Link>
        <img src="/logo/logomust.svg" alt="SotsiaalAI logo" className="footer-logo-img" />
      </footer>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
