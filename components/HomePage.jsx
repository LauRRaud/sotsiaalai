"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import { cn } from "@/components/ui/cn";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import useT from "@/components/i18n/useT";
import styles from "./HomePage.module.css";
import AivalgeLogo from "@/public/logo/aivalge.svg";
import SaimustLogo from "@/public/logo/saimust.svg";
import SmustLogo from "@/public/logo/smust.svg";
import SaivalgeLogo from "@/public/logo/saivalge.svg";
import HomeAboutSection from "@/components/HomeSections/HomeAboutSection";
import HomeFooter from "@/components/HomeSections/HomeFooter";
let homeIntroSeen = false;
const INTRO_ANIMATION_DELAY_MS = 1500;
export default function HomePage() {
  const {
    data: session,
    status
  } = useSession();
  const router = useRouter();
  const {
    prefs,
    hydrated: prefsHydrated
  } = useAccessibility();
  const t = useT();
  const [hasSeenIntro] = useState(() => homeIntroSeen);
  const initialSkipIntro = hasSeenIntro;
  const [leftFadeDone, setLeftFadeDone] = useState(() => initialSkipIntro);
  const [rightFadeDone, setRightFadeDone] = useState(() => initialSkipIntro);
  const [introStart, setIntroStart] = useState(() => initialSkipIntro);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);
  const [mobileFlipReady, setMobileFlipReady] = useState({
    left: false,
    right: false
  });
  const [pendingExitSide, setPendingExitSide] = useState(null);
  const [leftPhase, setLeftPhase] = useState("front");
  const [rightPhase, setRightPhase] = useState("front");
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [scrollCueEntered, setScrollCueEntered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [_leftCardEl, setLeftCardEl] = useState(null);
  const [_rightCardEl, setRightCardEl] = useState(null);
  const leftCardWrapRef = useRef(null);
  const rightCardWrapRef = useRef(null);
  const suppressFlipRef = useRef(false);
  const lastClickSideRef = useRef(null);
  const isAuthed = status === "authenticated" && !!session;
  const isAdmin = useMemo(() => {
    const u = session?.user;
    const role = typeof u?.role === "string" ? u.role.toLowerCase() : "";
    const perms = Array.isArray(u?.permissions) ? u.permissions : [];
    return Boolean(u?.isAdmin || u?.is_admin || role === "admin" || perms.includes("admin"));
  }, [session]);
  const flipToBackMs = 1200;
  const flipToFrontMs = 1100;
  const markChatEnterFromHome = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("sotsiaalai:chat-enter-from-home", String(Date.now()));
    } catch {}
  }, []);
  const startExitToChat = useCallback((side, opts = {}) => {
    const forceAuth = opts.force === true;
    if (isLoginOpen && !forceAuth) return;
    if (status === "loading" && !forceAuth) return;
    lastClickSideRef.current = side;
    if (!isAuthed && !forceAuth) {
      setPendingExitSide(side);
      setIsLoginOpen(true);
      return;
    }
    markChatEnterFromHome();
    suppressFlipRef.current = true;
    router.push("/vestlus");
  }, [isAuthed, isLoginOpen, markChatEnterFromHome, router, status]);
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    const onScroll = () => {
      const y = typeof window !== "undefined" ? window.scrollY || document.documentElement.scrollTop || 0 : 0;
      setShowScrollCue(y < 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    homeIntroSeen = true;
  }, []);
  useEffect(() => {
    if (!introStart || initialSkipIntro) return;
    const fadeTotalMs = 2950;
    const doneTimer = window.setTimeout(() => {
      setLeftFadeDone(true);
      setRightFadeDone(true);
    }, fadeTotalMs);
    return () => window.clearTimeout(doneTimer);
  }, [introStart, initialSkipIntro]);
  useEffect(() => {
    if (prefs.reduceMotion) {
      setLeftFadeDone(true);
      setRightFadeDone(true);
      setMagnetReady(false);
      setIntroStart(true);
    }
  }, [prefs.reduceMotion]);
  useEffect(() => {
    if (leftFadeDone && rightFadeDone) {
      const tt = setTimeout(() => setMagnetReady(true), 150);
      return () => clearTimeout(tt);
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
    document.body.classList.add(styles.homeCursorScope);
    return () => {
      document.body.classList.remove("homepage");
      document.body.classList.remove(styles.homeCursorScope);
    };
  }, []);
  useEffect(() => {
    if (!isLoginOpen) return;
    setMobileFlipReady({
      left: false,
      right: false
    });
  }, [isLoginOpen]);
  useEffect(() => {
    if (!pendingExitSide || status !== "authenticated" || !session) return;
    if (isLoginOpen) setIsLoginOpen(false);
    const side = pendingExitSide;
    setPendingExitSide(null);
    window.setTimeout(() => startExitToChat(side), 0);
  }, [isLoginOpen, pendingExitSide, session, startExitToChat, status]);
  useEffect(() => {
    suppressFlipRef.current = false;
  }, []);
  const skipIntroAnimations = hasSeenIntro || prefs.reduceMotion;
  const scrollCueReady = leftFadeDone && rightFadeDone;
  const shouldFadeIn = introStart && !skipIntroAnimations && !(leftFadeDone && rightFadeDone);
  const footerFadeClass = skipIntroAnimations ? "" : cn(styles["defer-fade"], styles["defer-from-bottom"], styles["delay-2"]);
  useEffect(() => {
    if (!prefsHydrated) return;
    if (skipIntroAnimations) {
      setIntroStart(true);
      return;
    }
    const delayTimer = window.setTimeout(() => setIntroStart(true), INTRO_ANIMATION_DELAY_MS);
    return () => window.clearTimeout(delayTimer);
  }, [prefsHydrated, skipIntroAnimations]);
  useEffect(() => {
    if (!scrollCueReady) {
      setScrollCueEntered(false);
      return;
    }
    let raf = 0;
    let timer = 0;
    raf = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => setScrollCueEntered(true), 120);
    });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
    };
  }, [scrollCueReady]);
  const flipAllowed = leftFadeDone && rightFadeDone && !isLoginOpen;
  const leftInteractive = flipAllowed && !leftFlipping && !isLoginOpen;
  const rightInteractive = flipAllowed && !rightFlipping && !isLoginOpen;
  const flipClass = !isMobile && flipAllowed ? styles["flip-allowed"] : "";
  const onLeftEnter = () => {
    if (suppressFlipRef.current) return;
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToBack");
      setTimeout(() => setLeftFlipping(false), flipToBackMs);
    }
  };
  const onLeftLeave = () => {
    if (suppressFlipRef.current) return;
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToFront");
      setTimeout(() => setLeftFlipping(false), flipToFrontMs);
    }
  };
  const onRightEnter = () => {
    if (suppressFlipRef.current) return;
    if (!isMobile) {
      setRightFlipping(true);
      setRightPhase("flippingToBack");
      setTimeout(() => setRightFlipping(false), flipToBackMs);
    }
  };
  const onRightLeave = () => {
    if (suppressFlipRef.current) return;
    if (!isMobile) {
      setRightFlipping(true);
      setRightPhase("flippingToFront");
      setTimeout(() => setRightFlipping(false), flipToFrontMs);
    }
  };
  const handleCardBackClick = side => e => {
    if (!flipAllowed) return;
    e?.stopPropagation?.();
    if (!isMobile) {
      startExitToChat(side);
      return;
    }
    if (!mobileFlipReady[side]) {
      setMobileFlipReady({
        left: side === "left",
        right: side === "right"
      });
      e?.currentTarget?.focus?.();
      return;
    }
    setMobileFlipReady({
      left: false,
      right: false
    });
    startExitToChat(side);
  };
  const handleCardBackBlur = side => () => {
    setMobileFlipReady(prev => ({
      ...prev,
      [side]: false
    }));
  };
  const handleCardTap = side => _e => {
    if (!flipAllowed) return;
    if (!isMobile) {
      startExitToChat(side);
      return;
    }
    const setFlip = side === "left" ? setLeftFlipping : setRightFlipping;
    const flipDuration = mobileFlipReady[side] ? flipToFrontMs : flipToBackMs;
    setFlip(true);
    setTimeout(() => setFlip(false), flipDuration);
    setMobileFlipReady(prev => {
      const next = !prev[side] ? {
        left: side === "left",
        right: side === "right"
      } : {
        left: false,
        right: false
      };
      if (side === "left") setLeftPhase(!prev[side] ? "flippingToBack" : "flippingToFront");else setRightPhase(!prev[side] ? "flippingToBack" : "flippingToFront");
      return next;
    });
  };
  const handleCardClick = side => event => {
    if (!flipAllowed) return;
    if (isMobile) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    startExitToChat(side);
  };
  const resetMobileCards = useCallback(() => {
    setMobileFlipReady({
      left: false,
      right: false
    });
  }, []);
  const handleBackgroundTap = useCallback(event => {
    if (!isMobile) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest?.(`.${styles["three-d-card"]}`)) return;
    resetMobileCards();
  }, [isMobile, resetMobileCards]);
  const handleScrollCueClick = useCallback(event => {
    event.preventDefault();
    if (typeof document === "undefined") return;
    const target = document.getElementById("meist");
    if (!target) return;
    target.scrollIntoView({
      behavior: prefs.reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  }, [prefs.reduceMotion]);
  const onLeftTransitionEnd = e => {
    if (e?.propertyName !== "transform") return;
    setLeftPhase(p => p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p);
  };
  const onRightTransitionEnd = e => {
    if (e?.propertyName !== "transform") return;
    setRightPhase(p => p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p);
  };
  const handleLoginSuccess = useCallback(() => {
    const side = pendingExitSide || lastClickSideRef.current;
    if (!side) return;
    setPendingExitSide(null);
    setIsLoginOpen(false);
    window.setTimeout(() => startExitToChat(side, {
      force: true
    }), 0);
  }, [pendingExitSide, startExitToChat]);
  return <>
      <div className={cn("relative flex min-h-[100dvh] w-full flex-col [overflow-y:visible]", styles["homepage-root"], styles["homepage-scroll"], styles.homeCursorScope, !introStart && !skipIntroAnimations ? styles["intro-pending"] : null)}>
        <section onClick={handleBackgroundTap} className="relative touch-pan-y">
          <div className={cn("relative z-20 flex flex-1 items-center justify-between gap-[clamp(1.5rem,5vw,5rem)] box-border pointer-events-none max-w-full max-[48em]:flex-col max-[48em]:gap-[clamp(1.2rem,4vw,1.8rem)] max-[48em]:px-[clamp(1rem,4vw,1.5rem)] max-[48em]:pt-[calc(env(safe-area-inset-top,0px)+2.6rem)] max-[48em]:pb-[clamp(5rem,12vw,7rem)] max-[48em]:min-h-[auto]", styles["home-hero-shell"])}>
            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[48em]:min-h-[auto] max-[48em]:w-full max-[48em]:px-4 max-[48em]:py-4", styles.side, styles.left)}>
              <div ref={leftCardWrapRef} className={cn(styles["three-d-card"], styles["float-card"], styles.left, flipClass, leftFlipping ? styles["is-flipping"] : null, mobileFlipReady.left ? styles["mobile-flipped-left"] : null)} onMouseEnter={onLeftEnter} onMouseLeave={onLeftLeave} onClick={handleCardTap("left")}>
                <Magnet padding={80} magnetStrength={18} disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || leftFlipping}>
                  {({ isActive: _isActive }) => <div className={cn(styles["card-wrapper"], _isActive ? styles["magnet-active"] : null)} data-phase={leftPhase} onTransitionEnd={onLeftTransitionEnd} onClick={handleCardClick("left")}>
                      <div className={cn(styles["card-face"], styles.front)}>
                        <div ref={setLeftCardEl} className={cn(styles["glass-card"], styles["glass-card-light"], "left-card-primary", shouldFadeIn ? styles["fade-in"] : null, leftFadeDone ? styles["fade-in-done"] : null)} style={{
                      position: "relative"
                    }}>
                          <CircularRingLeft className={isMobile || leftFadeDone ? "is-visible" : ""} />
                          <AivalgeLogo className={cn(styles["card-logo-bg"], styles["card-logo-bg-left"])} aria-hidden="true" />
                        </div>
                      </div>

                      <div className={cn(styles["card-face"], styles.back)} role="button" aria-label={t("home.card.specialist.aria")} aria-disabled={!leftInteractive} aria-busy={!leftInteractive} tabIndex={leftInteractive ? 0 : -1} onClick={leftInteractive ? handleCardBackClick("left") : undefined} onBlur={handleCardBackBlur("left")} onKeyDown={e => {
                    if (!leftInteractive) return;
                    if (e.key === "Enter" || e.key === " ") startExitToChat("left");
                  }} style={!leftInteractive ? {
                    pointerEvents: "none"
                  } : {}} data-interactive={leftInteractive ? "true" : "false"}>
                        <div className={cn(styles["centered-back-left"], shouldFadeIn ? styles["fade-in"] : null)}>
                          <h2 className={styles["headline-bold"]}>
                            {t("home.card.specialist.title")}
                          </h2>
                          <SaimustLogo className={cn(styles["card-logo-bg"], styles["card-logo-bg-left-back"])} aria-hidden="true" />
                        </div>
                      </div>
                    </div>}
                </Magnet>
              </div>
            </div>

            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[48em]:min-h-[auto] max-[48em]:w-full max-[48em]:px-4 max-[48em]:py-4", styles.side, styles.right)}>
              <div ref={rightCardWrapRef} className={cn(styles["three-d-card"], styles["float-card"], styles.right, flipClass, rightFlipping ? styles["is-flipping"] : null, mobileFlipReady.right ? styles["mobile-flipped-right"] : null)} onMouseEnter={onRightEnter} onMouseLeave={onRightLeave} onClick={handleCardTap("right")}>
                <Magnet padding={80} magnetStrength={18} disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || rightFlipping}>
                  {({ isActive: _isActive }) => <div className={cn(styles["card-wrapper"], _isActive ? styles["magnet-active"] : null)} data-phase={rightPhase} onTransitionEnd={onRightTransitionEnd} onClick={handleCardClick("right")}>
                      <div className={cn(styles["card-face"], styles.front)}>
                        <div ref={setRightCardEl} className={cn(styles["glass-card"], styles["glass-card-dark"], "right-card-primary", shouldFadeIn ? styles["fade-in"] : null, rightFadeDone ? styles["fade-in-done"] : null)} style={{
                      position: "relative"
                    }}>
                          <CircularRingRight className={isMobile || rightFadeDone ? "is-visible" : ""} />
                          <SmustLogo className={cn(styles["card-logo-bg"], styles["card-logo-bg-right"])} aria-hidden="true" />
                        </div>
                      </div>

                      <div className={cn(styles["card-face"], styles.back)} role="button" aria-label={t("home.card.client.aria")} aria-disabled={!rightInteractive} aria-busy={!rightInteractive} tabIndex={rightInteractive ? 0 : -1} onClick={rightInteractive ? handleCardBackClick("right") : undefined} onBlur={handleCardBackBlur("right")} onKeyDown={e => {
                    if (!rightInteractive) return;
                    if (e.key === "Enter" || e.key === " ") startExitToChat("right");
                  }} style={!rightInteractive ? {
                    pointerEvents: "none"
                  } : {}} data-interactive={rightInteractive ? "true" : "false"}>
                        <div className={cn(styles["centered-back-right"], shouldFadeIn ? styles["fade-in"] : null)}>
                          <h2 className={styles["headline-bold"]}>
                            {t("home.card.client.title")}
                          </h2>
                          <SaivalgeLogo className={cn(styles["card-logo-bg"], styles["card-logo-bg-right-back"])} aria-hidden="true" />
                        </div>
                      </div>
                    </div>}
                </Magnet>
              </div>
            </div>
          </div>

          {scrollCueReady ? <div className={cn(styles["home-scroll-cue"], showScrollCue && scrollCueEntered ? styles["is-visible"] : null)} aria-hidden={!showScrollCue}>
              <a className={styles["home-scroll-cue-link"]} href="#meist" onClick={handleScrollCueClick}>
                <span className={styles["home-scroll-cue-mouse"]} aria-hidden="true">
                  <svg viewBox="0 0 24 36" role="presentation">
                    <rect x="5.5" y="2.5" width="13" height="31" rx="6.5" />
                    <line x1="12" y1="7" x2="12" y2="13" />
                  </svg>
                </span>
                <span className={styles["home-scroll-cue-arrow"]} aria-hidden="true" />
              </a>
            </div> : null}
        </section>
        <HomeAboutSection id="meist" showAdminLinks={isAuthed && isAdmin} />
        <HomeFooter logoClassName={footerFadeClass} />
      </div>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} suppressRedirect onAuthSuccess={handleLoginSuccess} />
    </>;
}

