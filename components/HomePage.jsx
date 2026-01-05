// components/HomePage.jsx
"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import useT from "@/components/i18n/useT";
import { triggerRouteTransition } from "@/lib/routeTransition";

function MagnetFallback({ children }) {
  return typeof children === "function" ? children({ isActive: false }) : children;
}

const Magnet = dynamic(() => import("@/components/Animations/Magnet/Magnet"), {
  ssr: false,
  loading: (props) => <MagnetFallback {...props} />,
});
const CircularRingLeft = dynamic(
  () => import("@/components/TextAnimations/CircularText/CircularText").then((mod) => mod.CircularRingLeft),
  { ssr: false },
);
const CircularRingRight = dynamic(
  () => import("@/components/TextAnimations/CircularText/CircularText").then((mod) => mod.CircularRingRight),
  { ssr: false },
);
const ShinyText = dynamic(
  () => import("@/components/effects/TextAnimations/ShinyText/ShinyText"),
  { ssr: false },
);

// Inline SVG (SVGR) imports – failid peaksid olema src/assets/logo/*.svg
import AivalgeLogo from "@/public/logo/aivalge.svg";
import SaimustLogo from "@/public/logo/saimust.svg";
import SmustLogo from "@/public/logo/smust.svg";
import SaivalgeLogo from "@/public/logo/saivalge.svg";
import Logomust from "@/public/logo/logomust.svg";

let homeIntroSeen = false;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { prefs } = useAccessibility();

  const [hasSeenIntro] = useState(() => homeIntroSeen);
  const [leftFadeDone, setLeftFadeDone] = useState(() => prefs.reduceMotion || hasSeenIntro);
  const [rightFadeDone, setRightFadeDone] = useState(() => prefs.reduceMotion || hasSeenIntro);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);
  const [mobileFlipReady, setMobileFlipReady] = useState({ left: false, right: false });
  const [exitState, setExitState] = useState(null);
  const [exitPrepSide, setExitPrepSide] = useState(null);
  const [pendingExitSide, setPendingExitSide] = useState(null);

  const [leftPhase, setLeftPhase] = useState("front");
  const [rightPhase, setRightPhase] = useState("front");

  const [isMobile, setIsMobile] = useState(false);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);
  const leftCardWrapRef = useRef(null);
  const rightCardWrapRef = useRef(null);
  const exitTimerRef = useRef(null);
  const exitPrepTimerRef = useRef(null);

  const t = useT();

  const isAuthed = status === "authenticated" && session;
  const flipToBackMs = 1200;
  const flipToFrontMs = 1100;
  const exitDurationMs = prefs.reduceMotion ? 0 : 1100;
  const exitFlipMs = prefs.reduceMotion ? 0 : flipToFrontMs;
  const exitScalePct = 0.6;
  const exitMorphDelayMs = prefs.reduceMotion ? 0 : Math.round(exitDurationMs * exitScalePct);
  const exitMorphMs = prefs.reduceMotion ? 0 : Math.max(360, Math.round(exitDurationMs * (1 - exitScalePct)));
  const isExiting = Boolean(exitState);
  const exitSide = exitState?.side;
  const exitVars = exitState?.vars;
  const isPreparingExit = Boolean(exitPrepSide);
  const markChatEnterFromHome = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("sotsiaalai:chat-enter-from-home", String(Date.now()));
    } catch {}
  }, []);

  const startExitToChat = useCallback(
    (side) => {
      if (isExiting || isPreparingExit || isLoginOpen) return;
      if (status === "loading") return;
      if (!isAuthed) {
        setPendingExitSide(side);
        setIsLoginOpen(true);
        return;
      }
      markChatEnterFromHome();
      const shouldFlipFront =
        side === "left"
          ? leftPhase !== "front" || mobileFlipReady.left
          : rightPhase !== "front" || mobileFlipReady.right;
      const flipDelayMs = shouldFlipFront ? exitFlipMs : 0;
      const delayMs = Math.max(0, Math.round(flipDelayMs + exitDurationMs));
      triggerRouteTransition({ delayMs, opacity: 0, href: "/vestlus" });
      if (exitDurationMs === 0) {
        router.push("/vestlus");
        return;
      }
      if (shouldFlipFront) {
        if (side === "left") {
          setLeftPhase("front");
        } else {
          setRightPhase("front");
        }
        setExitPrepSide(side);
        setMobileFlipReady({ left: false, right: false });
      }
      if (exitPrepTimerRef.current) window.clearTimeout(exitPrepTimerRef.current);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);

      const beginExit = () => {
        const node = side === "left" ? leftCardWrapRef.current : rightCardWrapRef.current;
        if (!node) {
          setExitPrepSide(null);
          router.push("/vestlus");
          return;
        }
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = centerX - window.innerWidth / 2;
        const dy = centerY - window.innerHeight / 2;
        const minViewport = Math.min(window.innerWidth, window.innerHeight);
        let targetSize = Math.min(1200, Math.max(640, minViewport * 0.88));
        try {
          const probe = document.createElement("div");
          probe.style.position = "fixed";
          probe.style.left = "-9999px";
          probe.style.top = "-9999px";
          probe.style.width = "var(--chat-diameter)";
          probe.style.height = "var(--chat-diameter)";
          probe.style.visibility = "hidden";
          probe.style.pointerEvents = "none";
          document.body.appendChild(probe);
          const measured = probe.getBoundingClientRect().width;
          probe.remove();
          if (Number.isFinite(measured) && measured > 0) targetSize = measured;
        } catch {}
        const remPx = Number.parseFloat(
          typeof window !== "undefined"
            ? window.getComputedStyle(document.documentElement).fontSize
            : "16",
        );
        const clampMin = 0.7 * remPx;
        const clampMax = 1.3 * remPx;
        const clampMid = 0.019 * window.innerHeight;
        const padTop = Math.min(clampMax, Math.max(clampMin, clampMid));
        const targetCenterY = Math.max(window.innerHeight / 2, padTop + targetSize / 2);
        const targetOffsetY = targetCenterY - window.innerHeight / 2;
        const scale = Math.max(1, targetSize / rect.width);
        const zDepth = Math.min(240, Math.max(120, minViewport * 0.18));
        setExitPrepSide(null);
        setExitState({
          side,
          vars: {
            x: `${dx.toFixed(2)}px`,
            y: `${dy.toFixed(2)}px`,
            scale: scale.toFixed(3),
            z: `${Math.round(zDepth)}px`,
            toY: `${targetOffsetY.toFixed(2)}px`,
          },
        });
        exitTimerRef.current = window.setTimeout(() => {
          router.push("/vestlus");
        }, exitDurationMs);
      };

      if (flipDelayMs > 0) {
        exitPrepTimerRef.current = window.setTimeout(beginExit, flipDelayMs);
      } else {
        beginExit();
      }
    },
    [
      exitDurationMs,
      exitFlipMs,
      isAuthed,
      isExiting,
      isPreparingExit,
      isLoginOpen,
      leftPhase,
      mobileFlipReady.left,
      mobileFlipReady.right,
      markChatEnterFromHome,
      rightPhase,
      router,
      status,
    ],
  );

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    homeIntroSeen = true;
  }, []);


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

  useEffect(() => {
    if (prefs.reduceMotion) {
      setLeftFadeDone(true);
      setRightFadeDone(true);
      setMagnetReady(false);
    }
  }, [prefs.reduceMotion]);

  useEffect(() => {
    if (leftFadeDone && rightFadeDone) {
      const t = setTimeout(() => setMagnetReady(true), 150);
      return () => clearTimeout(t);
    }
    setMagnetReady(false);
  }, [leftFadeDone, rightFadeDone]);

  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.toggle("modal-open", isLoginOpen);
    root.classList.toggle("modal-open", isLoginOpen);
    return () => {
      document.body.classList.remove("modal-open");
      root.classList.remove("modal-open");
    };
  }, [isLoginOpen]);

  useEffect(() => {
    document.body.classList.add("homepage");
    return () => {
      document.body.classList.remove("homepage");
    };
  }, []);

  useEffect(() => {
    if (!isLoginOpen) return;
    setMobileFlipReady({ left: false, right: false });
  }, [isLoginOpen]);

  useEffect(() => {
    return () => {
      if (exitPrepTimerRef.current) window.clearTimeout(exitPrepTimerRef.current);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!pendingExitSide || status !== "authenticated" || !session) return;
    if (isExiting || isPreparingExit) return;
    if (isLoginOpen) setIsLoginOpen(false);
    const side = pendingExitSide;
    setPendingExitSide(null);
    window.setTimeout(() => {
      startExitToChat(side);
    }, 0);
  }, [isExiting, isLoginOpen, isPreparingExit, pendingExitSide, session, startExitToChat, status]);

  const skipIntroAnimations = prefs.reduceMotion || hasSeenIntro;
  const footerFadeClass = skipIntroAnimations ? "" : "defer-fade defer-from-bottom delay-2";
  const flipAllowed = leftFadeDone && rightFadeDone && !isLoginOpen && !isExiting && !isPreparingExit;
  const leftInteractive = flipAllowed && !leftFlipping && !isLoginOpen;
  const rightInteractive = flipAllowed && !rightFlipping && !isLoginOpen;
  const flipClass = !isMobile && flipAllowed ? "flip-allowed" : "";

  const onLeftEnter = () => {
    if (isExiting || isPreparingExit) return;
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToBack");
      setTimeout(() => setLeftFlipping(false), flipToBackMs);
    }
  };
  const onLeftLeave = () => {
    if (isExiting || isPreparingExit) return;
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToFront");
      setTimeout(() => setLeftFlipping(false), flipToFrontMs);
    }
  };
  const onRightEnter = () => {
    if (isExiting || isPreparingExit) return;
    if (!isMobile) {
      setRightFlipping(true);
      setRightPhase("flippingToBack");
      setTimeout(() => setRightFlipping(false), flipToBackMs);
    }
  };
  const onRightLeave = () => {
    if (isExiting || isPreparingExit) return;
    if (!isMobile) {
      setRightFlipping(true);
      setRightPhase("flippingToFront");
      setTimeout(() => setRightFlipping(false), flipToFrontMs);
    }
  };

  const handleCardBackClick = (side) => (e) => {
    if (!flipAllowed) return;
    e?.stopPropagation?.();
    if (!isMobile) {
      startExitToChat(side);
      return;
    }
    if (!mobileFlipReady[side]) {
      setMobileFlipReady({ left: side === "left", right: side === "right" });
      e?.currentTarget?.focus?.();
      return;
    }
    setMobileFlipReady({ left: false, right: false });
    startExitToChat(side);
  };

  const handleCardBackBlur = (side) => () => {
    setMobileFlipReady((prev) => ({ ...prev, [side]: false }));
  };

  const handleCardTap = (side) => () => {
    if (!flipAllowed) return;
    if (!isMobile) {
      startExitToChat(side);
      return;
    }
    const setFlip = side === "left" ? setLeftFlipping : setRightFlipping;
    const flipDuration = mobileFlipReady[side] ? flipToFrontMs : flipToBackMs;
    setFlip(true);
    setTimeout(() => setFlip(false), flipDuration);
    setMobileFlipReady((prev) => {
      const next = !prev[side]
        ? { left: side === "left", right: side === "right" }
        : { left: false, right: false };
      if (side === "left") {
        setLeftPhase(!prev[side] ? "flippingToBack" : "flippingToFront");
      } else {
        setRightPhase(!prev[side] ? "flippingToBack" : "flippingToFront");
      }
      return next;
    });
  };

  const resetMobileCards = useCallback(() => {
    setMobileFlipReady({ left: false, right: false });
  }, []);

  const handleBackgroundTap = useCallback(
    (event) => {
      if (!isMobile || isExiting || isPreparingExit) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest?.(".three-d-card")) return;
      resetMobileCards();
    },
    [isExiting, isMobile, isPreparingExit, resetMobileCards],
  );

  const onLeftTransitionEnd = (e) => {
    if (e?.propertyName !== "transform") return;
    setLeftPhase((p) => (p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p));
  };
  const onRightTransitionEnd = (e) => {
    if (e?.propertyName !== "transform") return;
    setRightPhase((p) => (p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p));
  };

  return (
    <>
      <div
        className={`homepage-root${isPreparingExit ? " home-exit-prep" : ""}${isExiting ? " home-exit" : ""}`}
        onClick={handleBackgroundTap}
        style={{
          "--home-exit-dur": `${exitDurationMs}ms`,
          "--home-exit-flip": `${exitFlipMs}ms`,
          "--home-exit-morph-delay": `${exitMorphDelayMs}ms`,
          "--home-exit-morph-ms": `${exitMorphMs}ms`,
          "--home-exit-from-x": exitVars?.x,
          "--home-exit-from-y": exitVars?.y,
          "--home-exit-scale": exitVars?.scale,
          "--home-exit-to-y": exitVars?.toY,
          "--home-exit-to-x": "0px",
        }}
      >

        <div className="main-content relative">
          {/* LEFT CARD */}
          <div className="side left">
            <div
              ref={leftCardWrapRef}
              className={`three-d-card float-card left ${flipClass} ${leftFlipping ? "is-flipping" : ""} ${
                mobileFlipReady.left ? "mobile-flipped-left" : ""
              }${exitPrepSide === "left" ? " home-exit-prep-target" : ""}${exitSide === "left" ? " home-exit-target" : ""}`}
              onMouseEnter={onLeftEnter}
              onMouseLeave={onLeftLeave}
              onClick={handleCardTap("left")}
              style={
                isExiting && exitSide === "left"
                  ? {
                      "--home-exit-from-x": exitVars?.x,
                      "--home-exit-from-y": exitVars?.y,
                      "--home-exit-scale": exitVars?.scale,
                      "--home-exit-z": exitVars?.z,
                    }
                  : undefined
              }
            >
              <Magnet
                padding={80}
                magnetStrength={18}
                disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || leftFlipping || isExiting || isPreparingExit}
              >
                {({ isActive }) => (
                  <div className="card-wrapper" data-phase={leftPhase} onTransitionEnd={onLeftTransitionEnd}>
                    {/* FRONT */}
                    <div className="card-face front">
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
                        <CircularRingLeft className={isMobile || leftFadeDone ? "is-visible" : ""} />
                        {/* Inline SVG logo (front left) */}
                        <AivalgeLogo className="card-logo-bg card-logo-bg-left" aria-hidden="true" />
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      className="card-face back"
                      role="button"
                      aria-label={t("home.card.specialist.aria")}
                      aria-disabled={!leftInteractive}
                      aria-busy={!leftInteractive}
                      tabIndex={leftInteractive ? 0 : -1}
                      onClick={leftInteractive ? handleCardBackClick("left") : undefined}
                      onBlur={handleCardBackBlur("left")}
                      onKeyDown={(e) => {
                        if (!leftInteractive) return;
                        if (e.key === "Enter" || e.key === " ") {
                          startExitToChat("left");
                        }
                      }}
                      style={!leftInteractive ? { pointerEvents: "none" } : {}}
                      data-interactive={leftInteractive ? "true" : "false"}
                    >
                      <div className={["centered-back-left", !leftFadeDone ? "fade-in" : "", "glow-static"].join(" ")}>
                        <h2 className="headline-bold">{t("home.card.specialist.title")}</h2>
                        {/* Inline SVG logo (back left) */}
                        <SaimustLogo className="card-logo-bg card-logo-bg-left-back" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                )}
              </Magnet>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="side right">
            <div
              ref={rightCardWrapRef}
              className={`three-d-card float-card right ${flipClass} ${rightFlipping ? "is-flipping" : ""} ${
                mobileFlipReady.right ? "mobile-flipped-right" : ""
              }${exitPrepSide === "right" ? " home-exit-prep-target" : ""}${exitSide === "right" ? " home-exit-target" : ""}`}
              onMouseEnter={onRightEnter}
              onMouseLeave={onRightLeave}
              onClick={handleCardTap("right")}
              style={
                isExiting && exitSide === "right"
                  ? {
                      "--home-exit-from-x": exitVars?.x,
                      "--home-exit-from-y": exitVars?.y,
                      "--home-exit-scale": exitVars?.scale,
                      "--home-exit-z": exitVars?.z,
                    }
                  : undefined
              }
            >
              <Magnet
                padding={80}
                magnetStrength={18}
                disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || rightFlipping || isExiting || isPreparingExit}
              >
                {({ isActive }) => (
                  <div className="card-wrapper" data-phase={rightPhase} onTransitionEnd={onRightTransitionEnd}>
                    {/* FRONT */}
                    <div className="card-face front">
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
                        <CircularRingRight className={isMobile || rightFadeDone ? "is-visible" : ""} />
                        {/* Inline SVG logo (front right) */}
                        <SmustLogo className="card-logo-bg card-logo-bg-right" aria-hidden="true" />
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      className="card-face back"
                      role="button"
                      aria-label={t("home.card.client.aria")}
                      aria-disabled={!rightInteractive}
                      aria-busy={!rightInteractive}
                      tabIndex={rightInteractive ? 0 : -1}
                      onClick={rightInteractive ? handleCardBackClick("right") : undefined}
                      onBlur={handleCardBackBlur("right")}
                      onKeyDown={(e) => {
                        if (!rightInteractive) return;
                        if (e.key === "Enter" || e.key === " ") {
                          startExitToChat("right");
                        }
                      }}
                      style={!rightInteractive ? { pointerEvents: "none" } : {}}
                      data-interactive={rightInteractive ? "true" : "false"}
                    >
                      <div className={["centered-back-right", !rightFadeDone ? "fade-in" : "", "glow-static"].join(" ")}>
                        <h2 className="headline-bold">{t("home.card.client.title")}</h2>
                        {/* Inline SVG logo (back right) */}
                        <SaivalgeLogo className="card-logo-bg card-logo-bg-right-back" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                )}
              </Magnet>
            </div>
          </div>
        </div>

        {/* Footer (logo) */}
        <footer className={`footer-column relative${isMobile ? " footer-column-mobile" : ""}`}>
          <nav className="footer-bottom-nav footer-floating-nav" aria-label={t("nav.main")}></nav>
          {/* Inline footer logo */}
          <div className="footer-logo-stack">
            <Link
              href="/meist"
              className={["footer-meist-word", skipIntroAnimations ? "" : "footer-meist-word--animate"].filter(Boolean).join(" ")}
              aria-label={t("nav.about")}
            >
              <ShinyText text={t("nav.about")} speed={14.5} disabled={prefs.reduceMotion} className="footer-meist-shine" />
            </Link>
            <Link href="/meist" className="footer-logo-link" aria-label={t("nav.about")}>
              <Logomust
                className={["footer-logo-img", "dim", footerFadeClass].filter(Boolean).join(" ")}
                role="img"
                aria-label={t("home.footer.logo_alt")}
              />
            </Link>
          </div>
        </footer>
      </div>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} suppressRedirect />
    </>
  );
}
