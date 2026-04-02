"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import { cn } from "@/components/ui/cn";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import AivalgeLogo from "@/public/logo/aivalge.svg";
import SaimustLogo from "@/public/logo/saimust.svg";
import SmustLogo from "@/public/logo/smust.svg";
import SaivalgeLogo from "@/public/logo/saivalge.svg";
const HomeAboutSection = dynamic(
  () => import("@/components/HomeSections/HomeAboutSection"),
  { loading: () => null }
);
const HomeFooter = dynamic(
  () => import("@/components/HomeSections/HomeFooter"),
  { loading: () => null }
);
let homeIntroSeen = false;
const HOME_RETURN_FROM_CHAT_KEY = "sotsiaalai:home-return-from-chat";
const INTRO_ANIMATION_DELAY_MS = 1500;
const BLUR_REVEAL_DELAY_MS = 1850;
const CARD_FADE_DURATION_MS = 2400;
const CARD_FADE_DELAY_MS = 500;
const HOME_FOOTER_STAGGER_MS = 220;
const CARD_FLIP_TO_BACK_MS = 1250;
const CARD_FLIP_TO_FRONT_MS = 1250;
const CARD_AUTO_PREVIEW_DURATION_MS =
  CARD_FLIP_TO_BACK_MS + CARD_FLIP_TO_FRONT_MS;
const CARD_AUTO_PREVIEW_INTERVAL_MS = 15000;
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
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
  const { t, locale } = useI18n();
  const [homeEntryState] = useState(() => {
    let shouldSkipIntro = homeIntroSeen;
    let returnedFromChat = false;
    if (!shouldSkipIntro && typeof window !== "undefined") {
      try {
        returnedFromChat = Boolean(
          window.sessionStorage.getItem(HOME_RETURN_FROM_CHAT_KEY)
        );
        if (returnedFromChat) {
          window.sessionStorage.removeItem(HOME_RETURN_FROM_CHAT_KEY);
        }
      } catch {}
      shouldSkipIntro = shouldSkipIntro || returnedFromChat;
    }
    if (shouldSkipIntro) {
      homeIntroSeen = true;
    }
    return {
      initialSkipIntro: shouldSkipIntro,
      returnedFromChat
    };
  });
  const initialSkipIntro = homeEntryState.initialSkipIntro;
  const returnedFromChat = homeEntryState.returnedFromChat;
  const [hasSeenIntro] = useState(() => initialSkipIntro);
  const [leftFadeDone, setLeftFadeDone] = useState(() => initialSkipIntro);
  const [rightFadeDone, setRightFadeDone] = useState(() => initialSkipIntro);
  const [introStart, setIntroStart] = useState(() => initialSkipIntro);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [mobileFlipReady, setMobileFlipReady] = useState({
    left: false,
    right: false
  });
  const [pendingExitSide, setPendingExitSide] = useState(null);
  const [leftPhase, setLeftPhase] = useState("front");
  const [rightPhase, setRightPhase] = useState("front");
  const [leftBlurRevealReady, setLeftBlurRevealReady] = useState(() => initialSkipIntro);
  const [rightBlurRevealReady, setRightBlurRevealReady] = useState(() => initialSkipIntro);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [scrollCueEntered, setScrollCueEntered] = useState(false);
  const [isHomeOverlayOpen, setIsHomeOverlayOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [homeA11yReady, setHomeA11yReady] = useState(() => initialSkipIntro);
  const [showHomeBottomSections, setShowHomeBottomSections] = useState(() => initialSkipIntro);
  const [showHomeFooter, setShowHomeFooter] = useState(() => initialSkipIntro);
  const [autoPreviewActive, setAutoPreviewActive] = useState(false);
  const [_leftCardEl, setLeftCardEl] = useState(null);
  const [_rightCardEl, setRightCardEl] = useState(null);
  const leftCardWrapRef = useRef(null);
  const rightCardWrapRef = useRef(null);
  const leftFlipTimeoutRef = useRef(null);
  const rightFlipTimeoutRef = useRef(null);
  const suppressFlipRef = useRef(false);
  const lastClickSideRef = useRef(null);
  const timeoutIdsRef = useRef(new Set());
  const registerTimeout = useCallback((callback, delay) => {
    if (typeof window === "undefined") return null;
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutIdsRef.current.add(timeoutId);
    return timeoutId;
  }, []);
  const clearRegisteredTimeout = useCallback(timeoutId => {
    if (timeoutId == null || typeof window === "undefined") return;
    window.clearTimeout(timeoutId);
    timeoutIdsRef.current.delete(timeoutId);
  }, []);
  const clearLeftFlipTimeout = useCallback(() => {
    clearRegisteredTimeout(leftFlipTimeoutRef.current);
    leftFlipTimeoutRef.current = null;
  }, [clearRegisteredTimeout]);
  const clearRightFlipTimeout = useCallback(() => {
    clearRegisteredTimeout(rightFlipTimeoutRef.current);
    rightFlipTimeoutRef.current = null;
  }, [clearRegisteredTimeout]);
  const isAuthed = status === "authenticated" && !!session;
  const leftCardAriaLabel = isAuthed
    ? t("home.card.specialist.chat_aria")
    : t("home.card.specialist.login_aria");
  const rightCardAriaLabel = isAuthed
    ? t("home.card.client.chat_aria")
    : t("home.card.client.login_aria");
  const isAdmin = useMemo(() => {
    const u = session?.user;
    const role = typeof u?.role === "string" ? u.role.toLowerCase() : "";
    const perms = Array.isArray(u?.permissions) ? u.permissions : [];
    return Boolean(u?.isAdmin || u?.is_admin || role === "admin" || perms.includes("admin"));
  }, [session]);
  const flipToBackMs = CARD_FLIP_TO_BACK_MS;
  const flipToFrontMs = CARD_FLIP_TO_FRONT_MS;
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
    router.push(localizePath("/vestlus", locale));
  }, [isAuthed, isLoginOpen, locale, markChatEnterFromHome, router, status]);
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
    if (homeA11yReady || typeof window === "undefined") return;
    const activate = () => setHomeA11yReady(true);
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 24) activate();
    };
    const onKeyDown = event => {
      if (event.defaultPrevented) return;
      if (["Tab", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        activate();
      }
    };
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("wheel", activate, {
      passive: true
    });
    window.addEventListener("touchmove", activate, {
      passive: true
    });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", activate);
      window.removeEventListener("touchmove", activate);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [homeA11yReady]);
  useEffect(() => {
    homeIntroSeen = true;
  }, []);
  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    return () => {
      timeoutIds.forEach(timeoutId => {
        window.clearTimeout(timeoutId);
      });
      timeoutIds.clear();
    };
  }, []);
  useEffect(() => {
    if (!introStart || initialSkipIntro) return;
    const leftBlurTimer = registerTimeout(() => {
      setLeftBlurRevealReady(true);
    }, BLUR_REVEAL_DELAY_MS);
    const rightBlurTimer = registerTimeout(
      () => setRightBlurRevealReady(true),
      BLUR_REVEAL_DELAY_MS
    );
    const leftDoneTimer = registerTimeout(
      () => setLeftFadeDone(true),
      CARD_FADE_DELAY_MS + CARD_FADE_DURATION_MS
    );
    const rightDoneTimer = registerTimeout(
      () => setRightFadeDone(true),
      CARD_FADE_DELAY_MS + CARD_FADE_DURATION_MS
    );
    return () => {
      clearRegisteredTimeout(leftBlurTimer);
      clearRegisteredTimeout(rightBlurTimer);
      clearRegisteredTimeout(leftDoneTimer);
      clearRegisteredTimeout(rightDoneTimer);
    };
  }, [clearRegisteredTimeout, initialSkipIntro, introStart, registerTimeout]);
  useEffect(() => {
    if (prefs.reduceMotion) {
      setLeftFadeDone(true);
      setRightFadeDone(true);
      setLeftBlurRevealReady(true);
      setRightBlurRevealReady(true);
      setIntroStart(true);
    }
  }, [prefs.reduceMotion]);
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
    if (typeof document === "undefined") return;
    const body = document.body;
    const updateOverlayState = () => {
      const hasOverlay =
        body.classList.contains("home-profile-open") ||
        body.classList.contains("modal-open") ||
        body.classList.contains("login-modal-open") ||
        body.dataset.a11yScrollLock === "1";
      setIsHomeOverlayOpen(Boolean(isMobile && hasOverlay));
    };
    updateOverlayState();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(updateOverlayState);
    observer.observe(body, {
      attributes: true,
      attributeFilter: ["class", "data-a11y-scroll-lock"]
    });
    return () => observer.disconnect();
  }, [isMobile]);
  useIsomorphicLayoutEffect(() => {
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
    registerTimeout(() => startExitToChat(side), 0);
  }, [isLoginOpen, pendingExitSide, registerTimeout, session, startExitToChat, status]);
  useEffect(() => {
    suppressFlipRef.current = false;
  }, []);
  const skipIntroAnimations = hasSeenIntro || prefs.reduceMotion;
  const introPending = !introStart && !skipIntroAnimations;
  const cardsIntroDone = leftFadeDone && rightFadeDone;
  const scrollCueReady = leftFadeDone && rightFadeDone;
  const showScrollCueNow =
    (isMobile ? scrollCueReady : showScrollCue && scrollCueEntered) &&
    !(isHomeOverlayOpen || isLoginOpen);
  const shouldFadeLeft = introStart && !skipIntroAnimations && !leftFadeDone;
  const shouldFadeRight = introStart && !skipIntroAnimations && !rightFadeDone;
  useEffect(() => {
    if (!prefsHydrated) return;
    if (skipIntroAnimations) {
      setIntroStart(true);
      return;
    }
    const delayTimer = registerTimeout(() => setIntroStart(true), INTRO_ANIMATION_DELAY_MS);
    return () => clearRegisteredTimeout(delayTimer);
  }, [clearRegisteredTimeout, prefsHydrated, registerTimeout, skipIntroAnimations]);
  useEffect(() => {
    if (!scrollCueReady) {
      setScrollCueEntered(false);
      return;
    }
    let raf = 0;
    let timer = null;
    raf = window.requestAnimationFrame(() => {
      timer = registerTimeout(() => setScrollCueEntered(true), 120);
    });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      clearRegisteredTimeout(timer);
    };
  }, [clearRegisteredTimeout, registerTimeout, scrollCueReady]);
  useEffect(() => {
    const shouldShow = !isLoginOpen && cardsIntroDone;
    if (!shouldShow) {
      setShowHomeBottomSections(false);
      setShowHomeFooter(false);
      return;
    }
    setShowHomeBottomSections(true);
    const footerTimer = registerTimeout(
      () => setShowHomeFooter(true),
      HOME_FOOTER_STAGGER_MS
    );
    return () => clearRegisteredTimeout(footerTimer);
  }, [cardsIntroDone, clearRegisteredTimeout, isLoginOpen, registerTimeout]);
  const flipAllowed = leftFadeDone && rightFadeDone && !isLoginOpen;
  const cardInteractionAllowed = flipAllowed && !autoPreviewActive;
  const leftBackInteractive = isMobile ? cardInteractionAllowed : cardInteractionAllowed && !leftFlipping;
  const rightBackInteractive = isMobile ? cardInteractionAllowed : cardInteractionAllowed && !rightFlipping;
  const suppressCardHoverFxClassName = isHomeOverlayOpen ?
    "[&:hover_.card-face.front>.glass-card]:[animation:none] " +
      "[&:focus-within_.card-face.front>.glass-card]:[animation:none] " +
      "[&:hover_.card-face.front>.glass-card]:[box-shadow:none] " +
      "[&:focus-within_.card-face.front>.glass-card]:[box-shadow:none] " +
      "[&:hover_.card-face.back>.centered-back-left]:[animation:none] " +
      "[&:focus-within_.card-face.back>.centered-back-left]:[animation:none] " +
      "[&:hover_.card-face.back>.centered-back-right]:[animation:none] " +
      "[&:focus-within_.card-face.back>.centered-back-right]:[animation:none] " +
      "[&:hover_.card-face.back>.centered-back-left]:[box-shadow:none] " +
      "[&:focus-within_.card-face.back>.centered-back-left]:[box-shadow:none] " +
      "[&:hover_.card-face.back>.centered-back-right]:[box-shadow:none] " +
      "[&:focus-within_.card-face.back>.centered-back-right]:[box-shadow:none]" : null;
  const onLeftEnter = () => {
    if (suppressFlipRef.current) return;
    if (!cardInteractionAllowed) return;
    if (!isMobile) {
      clearLeftFlipTimeout();
      setLeftFlipping(true);
      setLeftPhase("flippingToBack");
      leftFlipTimeoutRef.current = registerTimeout(() => {
        setLeftFlipping(false);
        leftFlipTimeoutRef.current = null;
      }, flipToBackMs);
    }
  };
  const onLeftLeave = () => {
    if (suppressFlipRef.current) return;
    if (!cardInteractionAllowed) return;
    if (!isMobile) {
      clearLeftFlipTimeout();
      setLeftFlipping(true);
      setLeftPhase("flippingToFront");
      leftFlipTimeoutRef.current = registerTimeout(() => {
        setLeftFlipping(false);
        leftFlipTimeoutRef.current = null;
      }, flipToFrontMs);
    }
  };
  const onRightEnter = () => {
    if (suppressFlipRef.current) return;
    if (!cardInteractionAllowed) return;
    if (!isMobile) {
      clearRightFlipTimeout();
      setRightFlipping(true);
      setRightPhase("flippingToBack");
      rightFlipTimeoutRef.current = registerTimeout(() => {
        setRightFlipping(false);
        rightFlipTimeoutRef.current = null;
      }, flipToBackMs);
    }
  };
  const onRightLeave = () => {
    if (suppressFlipRef.current) return;
    if (!cardInteractionAllowed) return;
    if (!isMobile) {
      clearRightFlipTimeout();
      setRightFlipping(true);
      setRightPhase("flippingToFront");
      rightFlipTimeoutRef.current = registerTimeout(() => {
        setRightFlipping(false);
        rightFlipTimeoutRef.current = null;
      }, flipToFrontMs);
    }
  };
  const handleCardBackClick = side => e => {
    if (!cardInteractionAllowed) return;
    e?.stopPropagation?.();
    if (!isMobile) {
      startExitToChat(side);
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
  const handleCardTap = side => event => {
    if (!cardInteractionAllowed) return;
    if (!isMobile) {
      startExitToChat(side);
      return;
    }
    // Mobile fallback: if the card is already flipped, treat tap as an action tap.
    // This avoids missed back-face clicks caused by 3D/pointer-event edge cases.
    if (mobileFlipReady[side]) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      setMobileFlipReady({
        left: false,
        right: false
      });
      startExitToChat(side);
      return;
    }
    const setFlip = side === "left" ? setLeftFlipping : setRightFlipping;
    const flipDuration = flipToBackMs;
    setFlip(true);
    registerTimeout(() => setFlip(false), flipDuration);
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
    if (!cardInteractionAllowed) return;
    if (isMobile) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    startExitToChat(side);
  };
  const handleCardAccessibilityKeyDown = side => event => {
    if (!cardInteractionAllowed) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleCardTap(side)(event);
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
    setHomeA11yReady(true);
    const target = document.getElementById("meist");
    if (!target) return;
    target.scrollIntoView({
      behavior: prefs.reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  }, [prefs.reduceMotion]);
  useEffect(() => {
    if (
      prefs.reduceMotion ||
      isMobile ||
      !cardsIntroDone ||
      isLoginOpen ||
      isHomeOverlayOpen ||
      leftFlipping ||
      rightFlipping ||
      leftPhase !== "front" ||
      rightPhase !== "front" ||
      autoPreviewActive
    ) {
      return;
    }
    const previewTimer = registerTimeout(() => {
      setAutoPreviewActive(true);
      registerTimeout(() => {
        setAutoPreviewActive(false);
      }, CARD_AUTO_PREVIEW_DURATION_MS);
    }, CARD_AUTO_PREVIEW_INTERVAL_MS);
    return () => clearRegisteredTimeout(previewTimer);
  }, [
    autoPreviewActive,
    cardsIntroDone,
    clearRegisteredTimeout,
    isHomeOverlayOpen,
    isLoginOpen,
    isMobile,
    leftFlipping,
    leftPhase,
    prefs.reduceMotion,
    registerTimeout,
    rightFlipping,
    rightPhase
  ]);
  const onLeftTransitionEnd = e => {
    if (e?.propertyName !== "transform") return;
    clearLeftFlipTimeout();
    setLeftFlipping(false);
    setLeftPhase(p => p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p);
  };
  const onRightTransitionEnd = e => {
    if (e?.propertyName !== "transform") return;
    clearRightFlipTimeout();
    setRightFlipping(false);
    setRightPhase(p => p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p);
  };
  const cardWrapClassName =
    "card-wrapper relative w-full h-full [transform-style:preserve-3d] " +
    "[transition-property:transform] [transition-duration:var(--flip-ms)] " +
    "[transition-timing-function:var(--flip-ease)] [will-change:auto] [border-radius:inherit] " +
    "data-[phase=flippingToFront]:[transition-duration:var(--flip-front-ms,var(--flip-ms))]";
  const leftCardWrapClassName =
    cardWrapClassName +
    " data-[phase=back]:[transform:rotateY(180deg)]" +
    " data-[phase=flippingToBack]:[transform:rotateY(180deg)]";
  const rightCardWrapClassName =
    cardWrapClassName +
    " data-[phase=back]:[transform:rotateY(-180deg)]" +
    " data-[phase=flippingToBack]:[transform:rotateY(-180deg)]";
  const leftCardClassName = cn(
    "three-d-card left relative mx-auto grid place-items-center rounded-full aspect-square " +
      "w-[calc(var(--card-size)*0.94)] [perspective:78rem] overflow-visible",
    "float-card animate-[float-vertical_6.7s_ease-in-out_infinite] [will-change:transform]",
    cardInteractionAllowed ? "cursor-[var(--cursor-pointer)]" : "cursor-[var(--cursor-default)]",
    "[&.is-flipping_.card-wrapper]:[will-change:transform] " +
      "[&.is-flipping_.card-face.front>.glass-card]:[animation-play-state:paused]",
    suppressCardHoverFxClassName,
    isHomeOverlayOpen ? "opacity-0 invisible pointer-events-none" : null,
    leftFlipping ? "is-flipping" : null,
    autoPreviewActive ? "is-auto-rotating" : null,
    mobileFlipReady.left ? "mobile-flipped-left" : null
  );
  const rightCardClassName = cn(
    "three-d-card right relative mx-auto grid place-items-center rounded-full aspect-square " +
      "w-[calc(var(--card-size)*0.94)] [perspective:78rem] overflow-visible",
    "float-card animate-[float-vertical_6.7s_ease-in-out_infinite] [will-change:transform]",
    cardInteractionAllowed ? "cursor-[var(--cursor-pointer)]" : "cursor-[var(--cursor-default)]",
    "[&.is-flipping_.card-wrapper]:[will-change:transform] " +
      "[&.is-flipping_.card-face.front>.glass-card]:[animation-play-state:paused]",
    suppressCardHoverFxClassName,
    isHomeOverlayOpen ? "opacity-0 invisible pointer-events-none" : null,
    rightFlipping ? "is-flipping" : null,
    autoPreviewActive ? "is-auto-rotating" : null,
    mobileFlipReady.right ? "mobile-flipped-right" : null
  );
  const handleLoginSuccess = useCallback(() => {
    const side = pendingExitSide || lastClickSideRef.current;
    if (!side) return;
    setPendingExitSide(null);
    startExitToChat(side, {
      force: true
    });
  }, [pendingExitSide, startExitToChat]);
  return <>
      <div className={cn("relative flex min-h-[100dvh] w-full flex-col [overflow-y:visible]", "homepage-root", "homepage-scroll", returnedFromChat ? "home-return-from-chat" : null, introPending ? "intro-pending" : null)}>
        <section onClick={handleBackgroundTap} className="relative touch-pan-y">
          <h1
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-1/2 top-[max(env(safe-area-inset-top,0px),0.08rem)] z-[30] -translate-x-1/2",
              "w-[min(94vw,56rem)] px-4 text-center font-bold uppercase tracking-[0.04em]",
              "text-[clamp(0.95rem,1.3vw,1.9rem)] text-[color:color-mix(in_srgb,var(--home-scroll-cue-color,var(--home-title-color,var(--brand-primary)))_68%,white_32%)]"
            )}
          >
            Avame peagi!
          </h1>
          <div className={cn("home-hero-shell", "relative z-20 flex flex-1 items-center justify-between gap-[clamp(1.5rem,5vw,5rem)] box-border pointer-events-none max-w-full max-[768px]:flex-col max-[768px]:gap-[clamp(1.2rem,4vw,1.8rem)] max-[768px]:px-[clamp(1rem,4vw,1.5rem)] max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.6rem)] max-[768px]:pb-[clamp(5rem,12vw,7rem)] max-[768px]:min-h-[auto]")}>
            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[768px]:min-h-[auto] max-[768px]:w-full max-[768px]:px-4 max-[768px]:py-4", "side")}>
              <div ref={leftCardWrapRef} data-phase={leftPhase} className={cn(leftCardClassName, "home-card-a11y-button")} onMouseEnter={onLeftEnter} onMouseLeave={onLeftLeave} onClick={handleCardTap("left")} role="link" aria-label={leftCardAriaLabel} aria-disabled={!cardInteractionAllowed} tabIndex={cardInteractionAllowed ? 0 : -1} onKeyDown={handleCardAccessibilityKeyDown("left")}>
                <div className={cn(leftCardWrapClassName)} data-phase={leftPhase} onTransitionEnd={onLeftTransitionEnd} onClick={handleCardClick("left")}>
                  <span className={cn("card-blur-layer absolute [inset:var(--home-card-blur-inset,0px)] rounded-full pointer-events-none z-0 [clip-path:circle(var(--home-card-blur-radius,50%)_at_50%_50%)] [transform:translateZ(0)_scale(var(--home-card-blur-scale,1))] [backface-visibility:visible] [-webkit-backface-visibility:visible] [backdrop-filter:blur(var(--home-card-blur,0.75rem))_saturate(var(--home-card-saturate,120%))] [-webkit-backdrop-filter:blur(var(--home-card-blur,0.75rem))_saturate(var(--home-card-saturate,120%))] [transition:opacity_600ms_cubic-bezier(0.22,0.61,0.36,1),transform_var(--flip-ms,1100ms)_var(--flip-ease,cubic-bezier(0.22,0.61,0.36,1))]", returnedFromChat ? "[transition:none]" : null, leftBlurRevealReady || leftFadeDone ? "opacity-100" : "opacity-0", introPending ? "!opacity-0 invisible" : null)} aria-hidden="true" />
                  <div className={cn("card-face", "front", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(0deg)]")} aria-hidden="true">
                    <div ref={setLeftCardEl} className={cn("glass-card", "glass-card-light", "left-card-primary", "relative w-full h-full aspect-square rounded-full mx-auto flex flex-col items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent isolate overflow-hidden [box-shadow:none] [transform:translate3d(0,0,0)] [transform-origin:50%_50%] [transition:opacity_var(--fade-ms)_ease,box-shadow_360ms_ease] before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[1] before:bg-[url('/logo/kerahele.svg')] dark:before:bg-[url('/logo/kerahele-dark.svg')] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-light-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform] after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:z-0 after:[background:var(--home-card-surface-bg,rgba(255,255,255,0.08))] after:[backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))] after:[-webkit-backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))]", returnedFromChat ? "[transition:none]" : null, introPending ? "opacity-0" : null, shouldFadeLeft ? "fade-in opacity-0" : null, leftFadeDone ? "fade-in-done" : null)} style={shouldFadeLeft ? {
                      animationName: "cardFadeIn",
                      animationDuration: "2.4s",
                      animationTimingFunction: "cubic-bezier(0.61,0,0.19,1)",
                      animationDelay: `${CARD_FADE_DELAY_MS}ms`,
                      animationFillMode: "forwards"
                    } : undefined}>
                      <CircularRingLeft className={cn(isMobile || leftFadeDone ? "is-visible" : "", "relative z-[2]")} />
                      <AivalgeLogo className={cn("absolute left-[48%] top-1/2 block max-w-full h-auto w-[min(var(--card-logo-front-left),calc(100%-var(--card-logo-safe-gap)))] -translate-x-1/2 -translate-y-1/2 opacity-75 pointer-events-none origin-center transform-gpu transition-none z-[3] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]")} aria-hidden="true" />
                    </div>
                  </div>

                  <div className={cn("card-face", "back", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]", leftPhase === "front" || leftPhase === "flippingToFront" ? "pointer-events-none" : "pointer-events-auto")} aria-hidden="true" tabIndex={-1} onClick={leftBackInteractive ? handleCardBackClick("left") : undefined} onBlur={handleCardBackBlur("left")} onKeyDown={e => {
                  if (!leftBackInteractive) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    startExitToChat("left");
                  }
                }} style={!leftBackInteractive ? {
                  pointerEvents: "none"
                } : {}} data-interactive={leftBackInteractive ? "true" : "false"}>
                    <div className={cn("centered-back-left", "relative w-full h-full aspect-square rounded-full mx-auto flex items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent isolate overflow-hidden [box-shadow:none] transition-[box-shadow] duration-[320ms] ease-out before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[1] before:bg-[url('/logo/kerahele.svg')] dark:before:bg-[url('/logo/kerahele-dark.svg')] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-light-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform] after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:z-0 after:[background:var(--home-card-surface-bg,rgba(255,255,255,0.08))] after:[backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))] after:[-webkit-backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))]", returnedFromChat ? "[transition:none]" : null, introPending ? "opacity-0" : null, shouldFadeLeft ? "fade-in" : null)} style={shouldFadeLeft ? {
                      animationName: "cardFadeIn",
                      animationDuration: "2.4s",
                      animationTimingFunction: "cubic-bezier(0.61,0,0.19,1)",
                      animationDelay: `${CARD_FADE_DELAY_MS}ms`,
                      animationFillMode: "forwards"
                    } : undefined}>
                      <h2 className={cn("font-headline font-normal uppercase tracking-[0.1em] leading-[1.6] [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] [font-variant-ligatures:none] relative z-[4] text-center mx-auto w-fit max-w-full [text-align-last:center] mt-0 [font-size:clamp(0.98rem,calc(var(--card-size)*0.069),1.8rem)] text-[#323232] [text-shadow:0_0.4rem_0.4rem_rgba(0,0,0,0.5)] -translate-y-[0.25em] max-[768px]:-translate-y-[0.45em]")}>
                        {t("home.card.specialist.title")}
                      </h2>
                      <SaimustLogo className={cn("absolute left-1/2 top-[74%] block max-w-[10rem] h-auto w-[calc(var(--card-logo-back)*0.9)] -translate-x-1/2 -translate-y-1/2 opacity-75 pointer-events-none origin-center transform-gpu z-[3]")} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[768px]:min-h-[auto] max-[768px]:w-full max-[768px]:px-4 max-[768px]:py-4", "side")}>
              <div ref={rightCardWrapRef} data-phase={rightPhase} className={cn(rightCardClassName, "home-card-a11y-button")} onMouseEnter={onRightEnter} onMouseLeave={onRightLeave} onClick={handleCardTap("right")} role="link" aria-label={rightCardAriaLabel} aria-disabled={!cardInteractionAllowed} tabIndex={cardInteractionAllowed ? 0 : -1} onKeyDown={handleCardAccessibilityKeyDown("right")}>
                <div className={cn(rightCardWrapClassName)} data-phase={rightPhase} onTransitionEnd={onRightTransitionEnd} onClick={handleCardClick("right")}>
                  <span className={cn("card-blur-layer absolute [inset:var(--home-card-blur-inset,0px)] rounded-full pointer-events-none z-0 [clip-path:circle(var(--home-card-blur-radius,50%)_at_50%_50%)] [transform:translateZ(0)_scale(var(--home-card-blur-scale,1))] [backface-visibility:visible] [-webkit-backface-visibility:visible] [backdrop-filter:blur(var(--home-card-blur,0.75rem))_saturate(var(--home-card-saturate,120%))] [-webkit-backdrop-filter:blur(var(--home-card-blur,0.75rem))_saturate(var(--home-card-saturate,120%))] [transition:opacity_600ms_cubic-bezier(0.22,0.61,0.36,1),transform_var(--flip-ms,1100ms)_var(--flip-ease,cubic-bezier(0.22,0.61,0.36,1))]", returnedFromChat ? "[transition:none]" : null, rightBlurRevealReady || rightFadeDone ? "opacity-100" : "opacity-0", introPending ? "!opacity-0 invisible" : null)} aria-hidden="true" />
                  <div className={cn("card-face", "front", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(0deg)]")} aria-hidden="true">
                    <div ref={setRightCardEl} className={cn("glass-card", "glass-card-dark", "right-card-primary", "relative w-full h-full aspect-square rounded-full mx-auto flex flex-col items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent isolate overflow-hidden [box-shadow:none] [transform:translate3d(0,0,0)] [transform-origin:50%_50%] [transition:opacity_var(--fade-ms)_ease,box-shadow_360ms_ease] before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[1] before:bg-[url('/logo/keratume.svg')] dark:before:bg-[url('/logo/keratume-dark.svg')] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-dark-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform] after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:z-0 after:[background:var(--home-card-surface-bg,rgba(255,255,255,0.08))] after:[backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))] after:[-webkit-backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))]", returnedFromChat ? "[transition:none]" : null, introPending ? "opacity-0" : null, shouldFadeRight ? "fade-in opacity-0" : null, rightFadeDone ? "fade-in-done" : null)} style={shouldFadeRight ? {
                      animationName: "cardFadeIn",
                      animationDuration: "2.4s",
                      animationTimingFunction: "cubic-bezier(0.61,0,0.19,1)",
                      animationDelay: `${CARD_FADE_DELAY_MS}ms`,
                      animationFillMode: "forwards"
                    } : undefined}>
                      <CircularRingRight className={cn(isMobile || rightFadeDone ? "is-visible" : "", "relative z-[2]")} />
                      <SmustLogo className={cn("absolute left-1/2 top-1/2 block max-w-full h-auto w-[min(var(--card-logo-front-right),calc(100%-var(--card-logo-safe-gap)))] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none origin-center transform-gpu transition-none z-[3] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]")} aria-hidden="true" />
                    </div>
                  </div>

                  <div className={cn("card-face", "back", "absolute inset-0 grid place-items-center rounded-full z-[1] isolate [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]", rightPhase === "front" || rightPhase === "flippingToFront" ? "pointer-events-none" : "pointer-events-auto")} aria-hidden="true" tabIndex={-1} onClick={rightBackInteractive ? handleCardBackClick("right") : undefined} onBlur={handleCardBackBlur("right")} onKeyDown={e => {
                  if (!rightBackInteractive) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    startExitToChat("right");
                  }
                }} style={!rightBackInteractive ? {
                  pointerEvents: "none"
                } : {}} data-interactive={rightBackInteractive ? "true" : "false"}>
                    <div className={cn("centered-back-right", "relative w-full h-full aspect-square rounded-full mx-auto flex items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent isolate overflow-hidden [box-shadow:none] transition-[box-shadow] duration-[320ms] ease-out before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[1] before:bg-[url('/logo/keratume.svg')] dark:before:bg-[url('/logo/keratume-dark.svg')] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-dark-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform] after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:z-0 after:[background:var(--home-card-surface-bg,rgba(255,255,255,0.08))] after:[backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))] after:[-webkit-backdrop-filter:blur(var(--home-card-surface-blur,1.1rem))_saturate(var(--home-card-surface-saturate,115%))]", returnedFromChat ? "[transition:none]" : null, introPending ? "opacity-0" : null, shouldFadeRight ? "fade-in" : null)} style={shouldFadeRight ? {
                      animationName: "cardFadeIn",
                      animationDuration: "2.4s",
                      animationTimingFunction: "cubic-bezier(0.61,0,0.19,1)",
                      animationDelay: `${CARD_FADE_DELAY_MS}ms`,
                      animationFillMode: "forwards"
                    } : undefined}>
                      <h2 className={cn("font-headline font-normal uppercase tracking-[0.1em] leading-[1.6] [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] [-webkit-font-smoothing:antialiased] [font-variant-ligatures:none] relative z-[4] text-center mx-auto w-fit max-w-full [text-align-last:center] mt-0 [font-size:clamp(0.94rem,calc(var(--card-size)*0.065),1.7rem)] text-[#c57171] opacity-80 [text-shadow:0_0.5rem_0.3rem_rgba(0,0,0,0.6)] -translate-y-[0.25em] max-[768px]:-translate-y-[0.45em]")}>
                        {t("home.card.client.title")}
                      </h2>
                      <SaivalgeLogo className={cn("absolute left-1/2 top-[74%] block max-w-[10rem] h-auto w-[calc(var(--card-logo-back)*0.9)] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none origin-center transform-gpu z-[3]")} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {scrollCueReady ? <div className={cn("home-scroll-cue", "absolute left-1/2 bottom-[clamp(-0.6rem,1.2vh,0.3rem)] max-[768px]:bottom-[clamp(1rem,4.4vh,2.2rem)] -translate-x-1/2 translate-y-2 z-[50] pointer-events-none opacity-0 transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none", showScrollCueNow ? "opacity-100 translate-y-0" : null)} aria-hidden="true">
              <a className={cn("home-scroll-cue-link", "inline-flex flex-col items-center gap-0 px-[0.35rem] py-[0.4rem] max-[768px]:px-[0.35rem] max-[768px]:py-[0.2rem] max-[768px]:p-0 max-[768px]:tracking-[0.06em] rounded-full border-0 bg-transparent leading-[1] no-underline pointer-events-auto backdrop-filter-none [-webkit-backdrop-filter:none] text-[color:var(--home-scroll-cue-color)] hover:text-[color:var(--home-scroll-cue-color)] focus-visible:text-[color:var(--home-scroll-cue-color)]")} href="#meist" onClick={handleScrollCueClick} aria-label={t("home.nav.about")} tabIndex={-1}>
                <span className="sr-only">{t("home.nav.about")}</span>
                <span className={cn("home-scroll-cue-mouse", "inline-flex w-[2.6rem] h-[2.5rem] text-[color:inherit] opacity-80 max-[768px]:hidden max-[768px]:opacity-0 max-[768px]:invisible")} aria-hidden="true">
                  <svg viewBox="0 0 24 36" role="presentation" className="w-full h-full fill-none stroke-current [stroke-width:2] [stroke-linecap:round] [stroke-linejoin:round] [transform:scaleX(1.2)] [transform-origin:center]">
                    <rect x="5.5" y="2.5" width="13" height="31" rx="6.5" />
                    <line x1="12" y1="7" x2="12" y2="13" />
                  </svg>
                </span>
                <span className={cn("home-scroll-cue-arrow", "inline-flex w-[2.7rem] h-[2.7rem] max-[768px]:w-[clamp(4.35rem,18.6vw,6.2rem)] max-[768px]:h-[clamp(4.35rem,18.6vw,6.2rem)] -mt-[0.35rem] max-[768px]:mt-[-0.45rem] max-[768px]:mt-[-0.35rem] opacity-90 relative overflow-visible [transform:var(--home-scroll-cue-arrow-transform,rotate(180deg))] [animation:var(--home-scroll-cue-arrow-animation,home-scroll-bounce_2s_ease-in-out_infinite)] motion-reduce:animate-none max-[768px]:[--home-scroll-cue-arrow-animation:home-scroll-blink_1.4s_ease-in-out_infinite] max-[768px]:[--home-scroll-cue-arrow-before-transform:scale(0.62)]")} aria-hidden="true">
                  <ChevronIcon direction="up" className="absolute inset-0 h-full w-full pointer-events-none [transform:var(--home-scroll-cue-arrow-before-transform,scale(0.52))] [transform-origin:center]" />
                </span>
              </a>
            </div> : null}
        </section>
        {showHomeBottomSections ? <div>
            <HomeAboutSection id="meist" showAdminLinks={isAuthed && isAdmin} />
            {showHomeFooter ? <HomeFooter /> : null}
          </div> : null}
      </div>
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} suppressRedirect onAuthSuccess={handleLoginSuccess} />
    </>;
}
