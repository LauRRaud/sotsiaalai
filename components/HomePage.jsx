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
  const flipToBackMs = 1250;
  const flipToFrontMs = 1250;
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
      if (isMobile) {
        setShowScrollCue(true);
        return;
      }
      const y = typeof window !== "undefined" ? window.scrollY || document.documentElement.scrollTop || 0 : 0;
      setShowScrollCue(y < 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);
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
    document.body.classList.add("homeCursorScope");
    return () => {
      document.body.classList.remove("homepage");
      document.body.classList.remove("homeCursorScope");
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
  const showScrollCueNow = isMobile ? scrollCueReady : showScrollCue && scrollCueEntered;
  const shouldFadeIn = introStart && !skipIntroAnimations && !(leftFadeDone && rightFadeDone);
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
  const leftBackInteractive = isMobile ? flipAllowed : leftInteractive;
  const rightBackInteractive = isMobile ? flipAllowed : rightInteractive;
  const flipClass = !isMobile && flipAllowed ? "flip-allowed" : "";
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
    if (target?.closest?.(".three-d-card")) return;
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
      <div className={cn("relative flex min-h-[100dvh] w-full flex-col [overflow-y:visible]", "homepage-root", "homepage-scroll", !introStart && !skipIntroAnimations ? "intro-pending" : null)}>
        <section onClick={handleBackgroundTap} className="relative touch-pan-y">
          <div className={cn("home-hero-shell", "relative z-20 flex flex-1 items-center justify-between gap-[clamp(1.5rem,5vw,5rem)] box-border pointer-events-none max-w-full max-[48em]:flex-col max-[48em]:gap-[clamp(1.2rem,4vw,1.8rem)] max-[48em]:px-[clamp(1rem,4vw,1.5rem)] max-[48em]:pt-[calc(env(safe-area-inset-top,0px)+2.6rem)] max-[48em]:pb-[clamp(5rem,12vw,7rem)] max-[48em]:min-h-[auto]")}>
            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[48em]:min-h-[auto] max-[48em]:w-full max-[48em]:px-4 max-[48em]:py-4", "side")}>
              <div ref={leftCardWrapRef} className={cn("three-d-card", "left", "relative mx-auto grid place-items-center rounded-full aspect-square w-[calc(var(--card-size)*0.94)] [perspective:62.5rem] overflow-visible cursor-[var(--cursor-pointer)]", "float-card", flipClass, leftFlipping ? "is-flipping" : null, mobileFlipReady.left ? "mobile-flipped-left" : null)} onMouseEnter={onLeftEnter} onMouseLeave={onLeftLeave} onClick={handleCardTap("left")}>
                <Magnet padding={80} magnetStrength={18} disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || leftFlipping}>
                    {({ isActive: _isActive }) => <div className={cn("card-wrapper", "relative w-full h-full", _isActive ? "magnet-active" : null)} data-phase={leftPhase} onTransitionEnd={onLeftTransitionEnd} onClick={handleCardClick("left")}>
                      <span className={cn("card-blur-layer absolute inset-0 rounded-full pointer-events-none z-0")} aria-hidden="true" />
                      <div className={cn("card-face", "front", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate")}>
                        <div ref={setLeftCardEl} className={cn("glass-card", "glass-card-light", "left-card-primary", "relative w-full h-full aspect-square rounded-full mx-auto flex flex-col items-center justify-center box-border p-[2em] bg-clip-padding isolate overflow-hidden", shouldFadeIn ? "fade-in" : null, leftFadeDone ? "fade-in-done" : null)}>
                          <CircularRingLeft className={isMobile || leftFadeDone ? "is-visible" : ""} />
                          <AivalgeLogo className={cn("absolute left-[48%] top-1/2 block max-w-full h-auto w-[min(var(--card-logo-front-left),calc(100%-var(--card-logo-safe-gap)))] -translate-x-1/2 -translate-y-1/2 opacity-75 pointer-events-none origin-center transform-gpu transition-none z-[1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]")} aria-hidden="true" />
                        </div>
                      </div>

                      <div className={cn("card-face", "back", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate")} role="button" aria-label={t("home.card.specialist.aria")} aria-disabled={!leftBackInteractive} aria-busy={!leftBackInteractive} tabIndex={leftBackInteractive ? 0 : -1} onClick={leftBackInteractive ? handleCardBackClick("left") : undefined} onBlur={handleCardBackBlur("left")} onKeyDown={e => {
                    if (!leftBackInteractive) return;
                    if (e.key === "Enter" || e.key === " ") startExitToChat("left");
                  }} style={!leftBackInteractive ? {
                    pointerEvents: "none"
                  } : {}} data-interactive={leftBackInteractive ? "true" : "false"}>
                        <div className={cn("centered-back-left", "relative w-full h-full aspect-square rounded-full mx-auto flex items-center justify-center box-border p-[2em] bg-clip-padding overflow-hidden", shouldFadeIn ? "fade-in" : null)}>
                          <h2 className={cn("font-headline font-normal uppercase tracking-[0.1em] leading-[1.6] [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] [font-variant-ligatures:none] relative z-[4] text-center mx-auto w-fit max-w-full [text-align-last:center] mt-0 [font-size:clamp(0.98rem,calc(var(--card-size)*0.069),1.8rem)] text-[#323232] [text-shadow:0_0.4rem_0.4rem_rgba(0,0,0,0.5)] -translate-y-[0.25em]")}>
                            {t("home.card.specialist.title")}
                          </h2>
                          <SaimustLogo className={cn("absolute left-1/2 top-[74%] block max-w-[10rem] h-auto w-[calc(var(--card-logo-back)*0.9)] -translate-x-1/2 -translate-y-1/2 opacity-75 pointer-events-none origin-center transform-gpu")} aria-hidden="true" />
                        </div>
                      </div>
                    </div>}
                </Magnet>
              </div>
            </div>

            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[48em]:min-h-[auto] max-[48em]:w-full max-[48em]:px-4 max-[48em]:py-4", "side")}>
              <div ref={rightCardWrapRef} className={cn("three-d-card", "right", "relative mx-auto grid place-items-center rounded-full aspect-square w-[calc(var(--card-size)*0.94)] [perspective:62.5rem] overflow-visible cursor-[var(--cursor-pointer)]", "float-card", flipClass, rightFlipping ? "is-flipping" : null, mobileFlipReady.right ? "mobile-flipped-right" : null)} onMouseEnter={onRightEnter} onMouseLeave={onRightLeave} onClick={handleCardTap("right")}>
                <Magnet padding={80} magnetStrength={18} disabled={prefs.reduceMotion || isLoginOpen || !magnetReady || rightFlipping}>
                    {({ isActive: _isActive }) => <div className={cn("card-wrapper", "relative w-full h-full", _isActive ? "magnet-active" : null)} data-phase={rightPhase} onTransitionEnd={onRightTransitionEnd} onClick={handleCardClick("right")}>
                      <span className={cn("card-blur-layer absolute inset-0 rounded-full pointer-events-none z-0")} aria-hidden="true" />
                      <div className={cn("card-face", "front", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate")}>
                        <div ref={setRightCardEl} className={cn("glass-card", "glass-card-dark", "right-card-primary", "relative w-full h-full aspect-square rounded-full mx-auto flex flex-col items-center justify-center box-border p-[2em] bg-clip-padding isolate overflow-hidden", shouldFadeIn ? "fade-in" : null, rightFadeDone ? "fade-in-done" : null)}>
                          <CircularRingRight className={isMobile || rightFadeDone ? "is-visible" : ""} />
                          <SmustLogo className={cn("absolute left-1/2 top-1/2 block max-w-full h-auto w-[min(var(--card-logo-front-right),calc(100%-var(--card-logo-safe-gap)))] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none origin-center transform-gpu transition-none z-[1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]")} aria-hidden="true" />
                        </div>
                      </div>

                      <div className={cn("card-face", "back", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate")} role="button" aria-label={t("home.card.client.aria")} aria-disabled={!rightBackInteractive} aria-busy={!rightBackInteractive} tabIndex={rightBackInteractive ? 0 : -1} onClick={rightBackInteractive ? handleCardBackClick("right") : undefined} onBlur={handleCardBackBlur("right")} onKeyDown={e => {
                    if (!rightBackInteractive) return;
                    if (e.key === "Enter" || e.key === " ") startExitToChat("right");
                  }} style={!rightBackInteractive ? {
                    pointerEvents: "none"
                  } : {}} data-interactive={rightBackInteractive ? "true" : "false"}>
                        <div className={cn("centered-back-right", "relative w-full h-full aspect-square rounded-full mx-auto flex items-center justify-center box-border p-[2em] bg-clip-padding overflow-hidden", shouldFadeIn ? "fade-in" : null)}>
                          <h2 className={cn("font-headline font-normal uppercase tracking-[0.1em] leading-[1.6] [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] [font-variant-ligatures:none] relative z-[4] text-center mx-auto w-fit max-w-full [text-align-last:center] mt-0 [font-size:clamp(0.94rem,calc(var(--card-size)*0.065),1.7rem)] text-[color:var(--brand-primary)] opacity-80 [text-shadow:0_0.5rem_0.3rem_rgba(0,0,0,0.6)] -translate-y-[0.25em]")}>
                            {t("home.card.client.title")}
                          </h2>
                          <SaivalgeLogo className={cn("absolute left-1/2 top-[74%] block max-w-[10rem] h-auto w-[calc(var(--card-logo-back)*0.9)] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none origin-center transform-gpu")} aria-hidden="true" />
                        </div>
                      </div>
                    </div>}
                </Magnet>
              </div>
            </div>
          </div>

          {scrollCueReady ? <div className={cn("home-scroll-cue", "absolute left-1/2 bottom-[clamp(-0.6rem,1.2vh,0.3rem)] max-[48em]:bottom-[clamp(0.2rem,2.8vh,1.6rem)] -translate-x-1/2 translate-y-2 z-[20] pointer-events-none opacity-0 transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]", showScrollCueNow ? "opacity-100 translate-y-0" : null)} aria-hidden={!showScrollCueNow}>
              <a className={cn("home-scroll-cue-link", "inline-flex flex-col items-center gap-0 px-[0.35rem] py-[0.4rem] max-[48em]:px-[0.35rem] max-[48em]:py-[0.2rem] max-[768px]:p-0 max-[768px]:tracking-[0.06em] rounded-full border-0 bg-transparent leading-[1] no-underline pointer-events-auto backdrop-filter-none [-webkit-backdrop-filter:none] text-[color:var(--home-scroll-cue-color)] hover:text-[color:var(--home-scroll-cue-color)] focus-visible:text-[color:var(--home-scroll-cue-color)]")} href="#meist" onClick={handleScrollCueClick}>
                <span className={cn("home-scroll-cue-mouse", "inline-flex w-[2.6rem] h-[2.5rem] text-[color:inherit] opacity-80 max-[768px]:hidden max-[768px]:opacity-0 max-[768px]:invisible")} aria-hidden="true">
                  <svg viewBox="0 0 24 36" role="presentation">
                    <rect x="5.5" y="2.5" width="13" height="31" rx="6.5" />
                    <line x1="12" y1="7" x2="12" y2="13" />
                  </svg>
                </span>
                <span className={cn("home-scroll-cue-arrow", "inline-flex w-[2.7rem] h-[2.7rem] max-[48em]:w-[clamp(3.8rem,16vw,5.4rem)] max-[48em]:h-[clamp(3.8rem,16vw,5.4rem)] -mt-[0.35rem] max-[48em]:mt-[0.1rem] max-[768px]:mt-0 opacity-90 overflow-visible max-[48em]:[--home-scroll-cue-arrow-animation:home-scroll-blink_1.4s_ease-in-out_infinite] max-[48em]:[--home-scroll-cue-arrow-before-transform:scale(1.35)]")} aria-hidden="true" />
              </a>
            </div> : null}
        </section>
        <HomeAboutSection id="meist" showAdminLinks={isAuthed && isAdmin} />
        <HomeFooter />
      </div>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} suppressRedirect onAuthSuccess={handleLoginSuccess} />
    </>;
}




