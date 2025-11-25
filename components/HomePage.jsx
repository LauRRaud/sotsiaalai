// components/HomePage.jsx
"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import useT from "@/components/i18n/useT";
import Image from "next/image";
import SunIcon from "@/public/logo/päike.svg";
import MoonIcon from "@/public/logo/kuu.svg";

// Inline SVG (SVGR) imports – failid peaksid olema src/assets/logo/*.svg
import AivalgeLogo from "@/public/logo/aivalge.svg";
import SaimustLogo from "@/public/logo/saimust.svg";
import SmustLogo from "@/public/logo/smust.svg";
import SaivalgeLogo from "@/public/logo/saivalge.svg";
import Logomust from "@/public/logo/logomust.svg";

function ThemeToggleIcon({ theme }) {
  const nextIsDark = theme === "light";
  const size = nextIsDark ? 42 : 70;
  return (
    <span className="sun-and-moon" aria-hidden="true">
      {nextIsDark ? (
        <MoonIcon width={size} height={size} className="themeIcon themeIcon-moon" />
      ) : (
        <SunIcon width={size} height={size} className="themeIcon themeIcon-sun" />
      )}
    </span>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { prefs, setPrefs } = useAccessibility();

  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);
  const [mobileFlipReady, setMobileFlipReady] = useState({ left: false, right: false });

  // Theme mirrors accessibility prefs (light/dark)
  const [theme, setTheme] = useState(() => (prefs?.theme === "light" ? "light" : "dark"));

  const [leftPhase, setLeftPhase] = useState("front");
  const [rightPhase, setRightPhase] = useState("front");

  const [isMobile, setIsMobile] = useState(false);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  const t = useT();

  const goChatIfAuthed = () => {
    if (status === "authenticated" && session) {
      router.push("/vestlus");
      return true;
    }
    return false;
  };

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [theme]);

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
    document.body.classList.toggle("modal-open", isLoginOpen);
    return () => document.body.classList.remove("modal-open");
  }, [isLoginOpen]);

  useEffect(() => {
    if (!isLoginOpen) return;
    setMobileFlipReady({ left: false, right: false });
  }, [isLoginOpen]);

  useEffect(() => {
    if (isLoginOpen && status === "authenticated" && session) {
      setIsLoginOpen(false);
      router.push("/vestlus");
    }
  }, [isLoginOpen, status, session, router]);

  useEffect(() => {
    const currentTheme = prefs.theme === "light" ? "light" : "dark";
    if (theme !== currentTheme) {
      setTheme(currentTheme);
    }
  }, [prefs.theme, theme]);


  const skipIntroAnimations = prefs.reduceMotion;
  const desktopFadeClass = skipIntroAnimations ? "" : "defer-fade defer-from-top delay-1";
  const bottomFadeClass = skipIntroAnimations ? "" : "defer-fade defer-from-bottom delay-1";
  const footerFadeClass = skipIntroAnimations ? "" : "defer-fade defer-from-bottom delay-2";
  const flipAllowed = leftFadeDone && rightFadeDone && !isLoginOpen;
  const leftInteractive = flipAllowed && !leftFlipping && !isLoginOpen;
  const rightInteractive = flipAllowed && !rightFlipping && !isLoginOpen;
  const flipClass = !isMobile && flipAllowed ? "flip-allowed" : "";
  const themeToggleAria =
    theme === "light"
      ? t("nav.toggle_dark") || "Lülita tume režiim"
      : t("nav.toggle_light") || "Lülita hele režiim";
  const flipEndMs = 1200;

  const onLeftEnter = () => {
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToBack");
      setTimeout(() => setLeftFlipping(false), flipEndMs);
    }
  };
  const onLeftLeave = () => {
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToFront");
      setTimeout(() => setLeftFlipping(false), flipEndMs);
    }
  };
  const onRightEnter = () => {
    if (!isMobile) {
      setRightFlipping(true);
      setRightPhase("flippingToBack");
      setTimeout(() => setRightFlipping(false), flipEndMs);
    }
  };
  const onRightLeave = () => {
    if (!isMobile) {
      setRightFlipping(true);
      setRightPhase("flippingToFront");
      setTimeout(() => setRightFlipping(false), flipEndMs);
    }
  };

  const handleThemeClick = (event) => {
    const wantsLight = !!event?.target?.checked;
    const nextTheme = wantsLight ? "light" : "dark";
    setTheme(nextTheme);
    setPrefs?.({ theme: nextTheme });
  };

  const handleCardBackClick = (side) => (e) => {
    if (!flipAllowed) return;
    if (status === "loading") return;
    if (goChatIfAuthed()) return;
    if (!isMobile) {
      setIsLoginOpen(true);
      return;
    }
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

  const handleCardTap = (side) => () => {
    if (!flipAllowed) return;
    if (!isMobile) {
      if (status === "loading") return;
      if (goChatIfAuthed()) return;
      setIsLoginOpen(true);
      return;
    }
    const setFlip = side === "left" ? setLeftFlipping : setRightFlipping;
    setFlip(true);
    setTimeout(() => setFlip(false), flipEndMs);
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
      if (!isMobile) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest?.(".three-d-card")) return;
      resetMobileCards();
    },
    [isMobile, resetMobileCards],
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
      <div className="homepage-root" onClick={handleBackgroundTap}>
        {!isMobile && (
          <nav className="top-center-nav" aria-label={t("nav.main")}>
            <div className="top-center-actions">
              <label
                className={["top-center-link", "themeToggle", "st-sunMoonThemeToggleBtn", desktopFadeClass].filter(Boolean).join(" ")}
                aria-label={themeToggleAria}
              >
                <input
                  type="checkbox"
                  className="themeToggleInput"
                  checked={theme === "light"}
                  onChange={handleThemeClick}
                  aria-pressed={theme === "light"}
                />
                <ThemeToggleIcon theme={theme} />
              </label>
            </div>
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
              <Magnet
                padding={80}
                magnetStrength={18}
                disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || leftFlipping}
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
                          if (status !== "loading" && !goChatIfAuthed()) setIsLoginOpen(true);
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
              className={`three-d-card float-card right ${flipClass} ${rightFlipping ? "is-flipping" : ""} ${
                mobileFlipReady.right ? "mobile-flipped-right" : ""
              }`}
              onMouseEnter={onRightEnter}
              onMouseLeave={onRightLeave}
              onClick={handleCardTap("right")}
            >
              <Magnet
                padding={80}
                magnetStrength={18}
                disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || rightFlipping}
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
                          if (status !== "loading" && !goChatIfAuthed()) setIsLoginOpen(true);
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
          <nav className="footer-bottom-nav footer-floating-nav" aria-label={t("nav.main")}>
            <div className="top-center-actions">
              <Link
                id="nav-meist"
                href="/meist"
                className={["top-center-link", "nav-meist-link", bottomFadeClass, "dim"].filter(Boolean).join(" ")}
              >
                <span className="nav-meist-wrap">
                  <Image
                    src="/logo/pallhele.svg"
                    alt={t("nav.about")}
                    width={80}
                    height={80}
                    className="nav-meist-icon"
                    priority
                  />
                  <span className="nav-meist-text">{t("nav.about")}</span>
                </span>
              </Link>
              {isMobile && (
                <label
                  className={["top-center-link", "themeToggle", "st-sunMoonThemeToggleBtn", bottomFadeClass].filter(Boolean).join(" ")}
                  aria-label={themeToggleAria}
                >
                <input
                  type="checkbox"
                  className="themeToggleInput"
                  checked={theme === "light"}
                  onChange={handleThemeClick}
                  aria-pressed={theme === "light"}
                />
                <ThemeToggleIcon theme={theme} />
              </label>
            )}
            </div>
          </nav>
          {/* Inline footer logo */}
          <Logomust
            className={["footer-logo-img", footerFadeClass, "dim"].filter(Boolean).join(" ")}
            role="img"
            aria-label={t("home.footer.logo_alt")}
          />
        </footer>
      </div>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

