"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
const HOME_RETURN_FROM_CHAT_KEY = "sotsiaalai:home-return-from-chat";
const HOME_FULL_INTRO = "full";
const HOME_SOFT_INTRO = "soft";
const INTRO_ANIMATION_DELAY_MS = 1500;
const CARD_FADE_DURATION_MS = 2400;
const CARD_FADE_DELAY_MS = 500;
const SOFT_FADE_DELAY_MS = 40;
const SOFT_FADE_DURATION_MS = 600;
const HOME_FOOTER_STAGGER_MS = 220;
const HOME_FULL_INTRO_REVEAL_FALLBACK_MS =
  INTRO_ANIMATION_DELAY_MS + CARD_FADE_DELAY_MS + CARD_FADE_DURATION_MS + 800;
const CARD_FLIP_TO_BACK_MS = 1250;
const CARD_FLIP_TO_FRONT_MS = 1250;
const CARD_AUTO_PREVIEW_PAUSE_MS = 2000;
const CARD_AUTO_PREVIEW_DURATION_MS =
  CARD_FLIP_TO_BACK_MS + CARD_AUTO_PREVIEW_PAUSE_MS + CARD_FLIP_TO_FRONT_MS;
const CARD_AUTO_PREVIEW_INTERVAL_MS = 15000;
const LEFT_CARD_TITLE_SWAP_INTERVAL_MS = 2500;
const LEFT_CARD_TITLE_FADE_MS = 400;
const homeCardFadeStyle = {
  animationName: "cardFadeIn",
  animationDuration: "2.4s",
  animationTimingFunction: "cubic-bezier(0.61,0,0.19,1)",
  animationDelay: `${CARD_FADE_DELAY_MS}ms`,
  animationFillMode: "forwards"
};
const homeCardKeraheleBgStyle = {
  "--home-card-bg-image": "url('/logo/kerahele.svg')",
  "--home-card-bg-image-dark": "url('/logo/kerahele-dark.svg')"
};
const homeCardKeratumeBgStyle = {
  "--home-card-bg-image": "url('/logo/keratume.svg')",
  "--home-card-bg-image-dark": "url('/logo/keratume-dark.svg')"
};
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function HomePage({ initialIntroVariant = HOME_FULL_INTRO } = {}) {
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
  const initialIntroMode =
    initialIntroVariant === HOME_SOFT_INTRO ? HOME_SOFT_INTRO : HOME_FULL_INTRO;
  const [introMode, setIntroMode] = useState(initialIntroMode);
  const [leftFadeDone, setLeftFadeDone] = useState(false);
  const [rightFadeDone, setRightFadeDone] = useState(false);
  const [introStart, setIntroStart] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [LoginModalComponent, setLoginModalComponent] = useState(null);
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [mobileFlipReady, setMobileFlipReady] = useState({
    left: false,
    right: false
  });
  const [pendingExitSide, setPendingExitSide] = useState(null);
  const [leftPhase, setLeftPhase] = useState("front");
  const [rightPhase, setRightPhase] = useState("front");
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [scrollCueEntered, setScrollCueEntered] = useState(false);
  const [isHomeOverlayOpen, setIsHomeOverlayOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [homeA11yReady, setHomeA11yReady] = useState(initialIntroMode !== HOME_FULL_INTRO);
  const [showHomeBottomSections, setShowHomeBottomSections] = useState(initialIntroMode !== HOME_FULL_INTRO);
  const [showHomeFooter, setShowHomeFooter] = useState(initialIntroMode !== HOME_FULL_INTRO);
  const [autoPreviewActive, setAutoPreviewActive] = useState(false);
  const [autoPreviewBackVisible, setAutoPreviewBackVisible] = useState(false);
  const [leftCardTitleIndex, setLeftCardTitleIndex] = useState(0);
  const [leftCardTitleVisible, setLeftCardTitleVisible] = useState(true);
  const [_leftCardEl, setLeftCardEl] = useState(null);
  const [_rightCardEl, setRightCardEl] = useState(null);
  const leftCardWrapRef = useRef(null);
  const rightCardWrapRef = useRef(null);
  const homeRootRef = useRef(null);
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
  const leftCardTitle = leftCardTitleIndex === 1
    ? {
        line1: t("home.card.service_provider.title_line1"),
        line2: t("home.card.service_provider.title_line2")
      }
    : {
        line1: t("home.card.specialist.title"),
        line2: ""
      };
  const isAdmin = useMemo(() => {
    const u = session?.user;
    const role = typeof u?.role === "string" ? u.role.toLowerCase() : "";
    const perms = Array.isArray(u?.permissions) ? u.permissions : [];
    return Boolean(u?.isAdmin || u?.is_admin || role === "admin" || perms.includes("admin"));
  }, [session]);
  const flipToBackMs = CARD_FLIP_TO_BACK_MS;
  const flipToFrontMs = CARD_FLIP_TO_FRONT_MS;
  const startSoftIntroState = useCallback(() => {
    setIntroMode(HOME_SOFT_INTRO);
    setIntroStart(false);
    setLeftFadeDone(false);
    setRightFadeDone(false);
    setHomeA11yReady(true);
    setShowHomeBottomSections(true);
    setShowHomeFooter(true);
  }, []);
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
    if (!isLoginOpen || LoginModalComponent) return;
    let cancelled = false;
    import("@/components/LoginModal").then(module => {
      if (!cancelled) {
        setLoginModalComponent(() => module.default);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [LoginModalComponent, isLoginOpen]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const mobile =
        window.matchMedia?.("(max-width: 768px)")?.matches ??
        window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") check();
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    window.addEventListener("pageshow", check);
    window.visualViewport?.addEventListener("resize", check);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const restoreTimers = [80, 220, 520].map(delay => window.setTimeout(check, delay));
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      window.removeEventListener("pageshow", check);
      window.visualViewport?.removeEventListener("resize", check);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      restoreTimers.forEach(timer => window.clearTimeout(timer));
    };
  }, [isLoginOpen]);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let swapTimeoutId = null;
    const intervalId = window.setInterval(() => {
      if (prefs.reduceMotion) {
        setLeftCardTitleIndex(index => (index + 1) % 2);
        return;
      }
      setLeftCardTitleVisible(false);
      swapTimeoutId = window.setTimeout(() => {
        setLeftCardTitleIndex(index => (index + 1) % 2);
        setLeftCardTitleVisible(true);
        swapTimeoutId = null;
      }, LEFT_CARD_TITLE_FADE_MS);
    }, LEFT_CARD_TITLE_SWAP_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
      if (swapTimeoutId != null) window.clearTimeout(swapTimeoutId);
    };
  }, [prefs.reduceMotion]);
  useEffect(() => {
    const root = homeRootRef.current;
    const onScroll = () => {
      const y = Math.max(
        typeof window !== "undefined" ? window.scrollY || document.documentElement.scrollTop || 0 : 0,
        root?.scrollTop || 0
      );
      setShowScrollCue(y < (isMobile ? 14 : 10));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    root?.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      root?.removeEventListener("scroll", onScroll);
    };
  }, [isMobile]);
  useEffect(() => {
    if (typeof window === "undefined" || !isMobile) return;
    const canScrollElement = (element, deltaY) => {
      if (!(element instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(element);
      const scrollable = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
      if (!scrollable) return false;
      if (deltaY > 0) return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
      if (deltaY < 0) return element.scrollTop > 0;
      return false;
    };
    const hasScrollableAncestor = (target, deltaY) => {
      let node = target instanceof HTMLElement ? target : null;
      while (node && node !== document.body && node !== document.documentElement) {
        if (canScrollElement(node, deltaY)) return true;
        node = node.parentElement;
      }
      return false;
    };
    const onWheel = event => {
      if (!event.deltaY || isHomeOverlayOpen || isLoginOpen) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (hasScrollableAncestor(event.target, event.deltaY)) return;
      const beforeY = window.scrollY || document.documentElement.scrollTop || 0;
      window.requestAnimationFrame(() => {
        const afterY = window.scrollY || document.documentElement.scrollTop || 0;
        if (Math.abs(afterY - beforeY) > 0.5) return;
        window.scrollBy({
          top: event.deltaY,
          left: 0,
          behavior: "auto"
        });
      });
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isHomeOverlayOpen, isLoginOpen, isMobile]);
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
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    let returnedFromChat = false;
    try {
      returnedFromChat = Boolean(
        window.sessionStorage.getItem(HOME_RETURN_FROM_CHAT_KEY)
      );
      if (returnedFromChat) {
        window.sessionStorage.removeItem(HOME_RETURN_FROM_CHAT_KEY);
      }
    } catch {}
    if (!returnedFromChat) return;
    startSoftIntroState();
  }, [startSoftIntroState]);
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
    if (!introStart || prefs.reduceMotion) return;
    const fadeDurationMs =
      introMode === HOME_FULL_INTRO ? CARD_FADE_DELAY_MS + CARD_FADE_DURATION_MS : SOFT_FADE_DURATION_MS;
    const leftDoneTimer = registerTimeout(
      () => setLeftFadeDone(true),
      fadeDurationMs
    );
    const rightDoneTimer = registerTimeout(
      () => setRightFadeDone(true),
      fadeDurationMs
    );
    return () => {
      clearRegisteredTimeout(leftDoneTimer);
      clearRegisteredTimeout(rightDoneTimer);
    };
  }, [clearRegisteredTimeout, introMode, introStart, prefs.reduceMotion, registerTimeout]);
  useEffect(() => {
    if (prefs.reduceMotion) {
      setIntroMode(HOME_SOFT_INTRO);
      setLeftFadeDone(true);
      setRightFadeDone(true);
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
        body.dataset.a11yScrollLock === "1" ||
        (isMobile &&
          (body.classList.contains("modal-open") ||
            body.classList.contains("login-modal-open")));
      setIsHomeOverlayOpen(Boolean(hasOverlay));
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
  const isFullIntro = introMode === HOME_FULL_INTRO && !prefs.reduceMotion;
  const isSoftIntro = introMode === HOME_SOFT_INTRO && !prefs.reduceMotion;
  const introPending = !introStart && (isFullIntro || isSoftIntro);
  const cardsIntroDone = leftFadeDone && rightFadeDone;
  const scrollCueReady = leftFadeDone && rightFadeDone;
  const showScrollCueNow =
    showScrollCue &&
    (isMobile ? scrollCueReady : scrollCueEntered) &&
    !(isHomeOverlayOpen || isLoginOpen);
  const shouldFadeLeft = introStart && isFullIntro && !leftFadeDone;
  const shouldFadeRight = introStart && isFullIntro && !rightFadeDone;
  const getHomeCardIntroStyle = shouldFade => (shouldFade ? homeCardFadeStyle : undefined);
  useEffect(() => {
    if (!prefsHydrated) return;
    if (!isFullIntro && !isSoftIntro) {
      setIntroStart(true);
      return;
    }
    const delayMs = isFullIntro ? INTRO_ANIMATION_DELAY_MS : SOFT_FADE_DELAY_MS;
    const delayTimer = registerTimeout(() => setIntroStart(true), delayMs);
    return () => clearRegisteredTimeout(delayTimer);
  }, [clearRegisteredTimeout, isFullIntro, isSoftIntro, prefsHydrated, registerTimeout]);
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
    if (introMode !== HOME_FULL_INTRO) {
      setShowHomeBottomSections(true);
      setShowHomeFooter(true);
      return;
    }
    let footerTimer = null;
    const revealHomeBottomSections = () => {
      setShowHomeBottomSections(true);
      footerTimer = registerTimeout(
        () => setShowHomeFooter(true),
        HOME_FOOTER_STAGGER_MS
      );
    };
    const shouldShow = !isLoginOpen && cardsIntroDone;
    if (!shouldShow) {
      setShowHomeBottomSections(false);
      setShowHomeFooter(false);
      const fallbackTimer = registerTimeout(() => {
        if (!isLoginOpen) revealHomeBottomSections();
      }, HOME_FULL_INTRO_REVEAL_FALLBACK_MS);
      return () => {
        clearRegisteredTimeout(fallbackTimer);
        clearRegisteredTimeout(footerTimer);
      };
    }
    revealHomeBottomSections();
    return () => clearRegisteredTimeout(footerTimer);
  }, [cardsIntroDone, clearRegisteredTimeout, introMode, isLoginOpen, isMobile, prefs.reduceMotion, registerTimeout]);
  const flipAllowed = leftFadeDone && rightFadeDone && !isLoginOpen;
  const cardInteractionAllowed = flipAllowed && !autoPreviewActive;
  const autoPreviewBackInteractive = !isMobile && flipAllowed && autoPreviewActive && autoPreviewBackVisible;
  const leftBackInteractive = isMobile ? cardInteractionAllowed : autoPreviewBackInteractive || cardInteractionAllowed && !leftFlipping;
  const rightBackInteractive = isMobile ? cardInteractionAllowed : autoPreviewBackInteractive || cardInteractionAllowed && !rightFlipping;
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
    if (!cardInteractionAllowed && !autoPreviewBackInteractive) return;
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
      setAutoPreviewBackVisible(false);
      registerTimeout(() => {
        setAutoPreviewBackVisible(true);
      }, CARD_FLIP_TO_BACK_MS);
      registerTimeout(() => {
        setAutoPreviewBackVisible(false);
      }, CARD_FLIP_TO_BACK_MS + CARD_AUTO_PREVIEW_PAUSE_MS);
      registerTimeout(() => {
        setAutoPreviewBackVisible(false);
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
  const rotatingBackdropBaseClassName = "home-card-rotating-backdrop";
  const getBackdropClassName = (shouldFade, fadeDone, side) =>
    cn(
      rotatingBackdropBaseClassName,
      side === "front" ?
        "home-card-rotating-backdrop-front" :
        "home-card-rotating-backdrop-back",
      introPending ? "home-card-rotating-backdrop-hidden" : null,
      shouldFade && !fadeDone ? "home-card-rotating-backdrop-reveal" : null,
      fadeDone ? "home-card-rotating-backdrop-ready" : null
    );
  const leftFrontBackdropClassName = getBackdropClassName(
    shouldFadeLeft,
    leftFadeDone,
    "front"
  );
  const leftBackBackdropClassName = getBackdropClassName(
    shouldFadeLeft,
    leftFadeDone,
    "back"
  );
  const rightFrontBackdropClassName = getBackdropClassName(
    shouldFadeRight,
    rightFadeDone,
    "front"
  );
  const rightBackBackdropClassName = getBackdropClassName(
    shouldFadeRight,
    rightFadeDone,
    "back"
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
      <div ref={homeRootRef} className={cn("relative flex min-h-[100dvh] max-[768px]:min-h-[var(--glass-mobile-root-vh,100dvh)] w-full flex-col [overflow-y:visible]", "homepage-root", "homepage-scroll", introPending ? "intro-pending" : null)}>
        <section onClick={handleBackgroundTap} className="home-hero-section relative touch-pan-y">
          <div className={cn(
            "absolute left-1/2 top-[calc(env(safe-area-inset-top,0px)+clamp(1rem,3.6vh,2.5rem))] z-[60] -translate-x-1/2",
            "pointer-events-none select-none px-[clamp(1rem,3vw,1.55rem)] py-[0.48rem]",
            "text-center font-headline text-[clamp(0.825rem,2.1vw,1.725rem)] font-normal uppercase leading-none tracking-[0.16em] text-[color:var(--home-title-color)]",
            "transition-[opacity,visibility] duration-300 ease-out max-[768px]:top-[calc(env(safe-area-inset-top,0px)+0.8rem)] max-[768px]:tracking-[0.16em]",
            isHomeOverlayOpen || isLoginOpen ? "opacity-0 invisible" : "opacity-100 visible"
          )}>
            {t("home.opening_banner")}
          </div>
          <div className={cn("home-hero-shell", "relative z-20 flex flex-1 items-center justify-between gap-[clamp(1.5rem,5vw,5rem)] box-border pointer-events-none max-w-full max-[768px]:flex-col max-[768px]:gap-[clamp(1.2rem,4vw,1.8rem)] max-[768px]:px-[clamp(1rem,4vw,1.5rem)] max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.6rem)] max-[768px]:pb-[clamp(5rem,12vw,7rem)] max-[768px]:min-h-[auto]")}>
            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[768px]:min-h-[auto] max-[768px]:w-full max-[768px]:px-4 max-[768px]:py-4", "side")}>
              <div ref={leftCardWrapRef} data-phase={leftPhase} className={cn(leftCardClassName, "home-card-a11y-button")} onMouseEnter={onLeftEnter} onMouseLeave={onLeftLeave} onClick={handleCardTap("left")} role="link" aria-label={leftCardAriaLabel} aria-disabled={!cardInteractionAllowed} tabIndex={cardInteractionAllowed ? 0 : -1} onKeyDown={handleCardAccessibilityKeyDown("left")}>
                <div className={cn(leftCardWrapClassName)} data-phase={leftPhase} onTransitionEnd={onLeftTransitionEnd} onClick={handleCardClick("left")}>
                  <div aria-hidden="true" className={leftFrontBackdropClassName} />
                  <div aria-hidden="true" className={leftBackBackdropClassName} />
                  <div className={cn("card-face", "front", "absolute inset-0 grid place-items-center rounded-full z-[1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(0deg)]")} aria-hidden="true">
                    <div className={cn("glass-card", "glass-card-light", "left-card-primary", "relative w-full h-full aspect-square rounded-full mx-auto overflow-visible [box-shadow:none] [transform:translate3d(0,0,0)] [transform-origin:50%_50%] [transition:opacity_var(--fade-ms)_ease,box-shadow_360ms_ease]", introPending ? "opacity-0" : null, shouldFadeLeft ? "fade-in opacity-0" : null, leftFadeDone ? "fade-in-done" : null)} style={getHomeCardIntroStyle(shouldFadeLeft)}>
                      <div ref={setLeftCardEl} className="home-card-face-content home-card-bg-kerahele relative w-full h-full aspect-square rounded-full mx-auto flex flex-col items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent overflow-hidden before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[2] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-light-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform]" style={homeCardKeraheleBgStyle}>
                        <CircularRingLeft className={cn(isMobile || leftFadeDone || introMode === HOME_SOFT_INTRO ? "is-visible" : "", "relative z-[4]")} />
                        <AivalgeLogo className={cn("home-card-front-logo home-card-front-logo-ai absolute left-[48%] top-1/2 block max-w-full h-auto w-[min(var(--card-logo-front-left),calc(100%-var(--card-logo-safe-gap)))] -translate-x-1/2 -translate-y-1/2 opacity-75 pointer-events-none origin-center transform-gpu transition-none z-[5] overflow-visible [overflow:visible] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]")} aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  <div className={cn("card-face", "back", "absolute inset-0 grid place-items-center rounded-full z-[1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]", (leftPhase === "front" || leftPhase === "flippingToFront") && !autoPreviewBackVisible ? "pointer-events-none" : "pointer-events-auto")} aria-hidden="true" onClick={leftBackInteractive ? handleCardBackClick("left") : undefined} style={!leftBackInteractive ? {
                  pointerEvents: "none"
                } : {}} data-interactive={leftBackInteractive ? "true" : "false"}>
                    <div className={cn("centered-back-left", "relative w-full h-full aspect-square rounded-full mx-auto overflow-visible [box-shadow:none] transition-[box-shadow] duration-[320ms] ease-out", introPending ? "opacity-0" : null, shouldFadeLeft ? "fade-in" : null)} style={getHomeCardIntroStyle(shouldFadeLeft)}>
                      <div className="home-card-face-content home-card-bg-kerahele relative w-full h-full aspect-square rounded-full mx-auto flex items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent overflow-hidden before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[2] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-light-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform]" style={homeCardKeraheleBgStyle}>
                        <h2 className={cn("font-headline font-normal uppercase tracking-[0.1em] leading-[1.6] [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] [font-variant-ligatures:none] relative z-[5] flex min-h-[3.2em] flex-col items-center justify-center text-center mx-auto w-fit max-w-full [text-align-last:center] mt-0 [font-size:clamp(0.98rem,calc(var(--card-size)*0.069),1.8rem)] text-[#323232] [text-shadow:0_0.32rem_0.36rem_rgba(0,0,0,0.34)] -translate-y-[0.25em] max-[768px]:-translate-y-[0.45em] transition-opacity duration-[400ms] ease-in-out", leftCardTitleVisible ? "opacity-100" : "opacity-0")}>
                          {leftCardTitle.line2 ? <>
                              <span>{leftCardTitle.line1}</span>
                              <span>{leftCardTitle.line2}</span>
                            </> : leftCardTitle.line1}
                        </h2>
                        <SaimustLogo className={cn("home-card-back-logo home-card-back-logo-left absolute left-1/2 top-[74%] block max-w-[10rem] h-auto w-[calc(var(--card-logo-back)*0.9)] -translate-x-1/2 -translate-y-1/2 opacity-75 pointer-events-none origin-center transform-gpu z-[5]")} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn("relative box-border flex min-w-0 flex-1 flex-col items-center justify-center px-6 py-8 min-h-[100dvh] pointer-events-auto touch-pan-y max-[768px]:min-h-[auto] max-[768px]:w-full max-[768px]:px-4 max-[768px]:py-4", "side")}>
              <div ref={rightCardWrapRef} data-phase={rightPhase} className={cn(rightCardClassName, "home-card-a11y-button")} onMouseEnter={onRightEnter} onMouseLeave={onRightLeave} onClick={handleCardTap("right")} role="link" aria-label={rightCardAriaLabel} aria-disabled={!cardInteractionAllowed} tabIndex={cardInteractionAllowed ? 0 : -1} onKeyDown={handleCardAccessibilityKeyDown("right")}>
                <div className={cn(rightCardWrapClassName)} data-phase={rightPhase} onTransitionEnd={onRightTransitionEnd} onClick={handleCardClick("right")}>
                  <div aria-hidden="true" className={rightFrontBackdropClassName} />
                  <div aria-hidden="true" className={rightBackBackdropClassName} />
                  <div className={cn("card-face", "front", "absolute inset-0 grid place-items-center rounded-full z-[1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(0deg)]")} aria-hidden="true">
                    <div className={cn("glass-card", "glass-card-dark", "right-card-primary", "relative w-full h-full aspect-square rounded-full mx-auto overflow-visible [box-shadow:none] [transform:translate3d(0,0,0)] [transform-origin:50%_50%] [transition:opacity_var(--fade-ms)_ease,box-shadow_360ms_ease]", introPending ? "opacity-0" : null, shouldFadeRight ? "fade-in opacity-0" : null, rightFadeDone ? "fade-in-done" : null)} style={getHomeCardIntroStyle(shouldFadeRight)}>
                      <div ref={setRightCardEl} className="home-card-face-content home-card-bg-keratume relative w-full h-full aspect-square rounded-full mx-auto flex flex-col items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent overflow-hidden before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[2] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-dark-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform]" style={homeCardKeratumeBgStyle}>
                        <CircularRingRight className={cn(isMobile || rightFadeDone || introMode === HOME_SOFT_INTRO ? "is-visible" : "", "relative z-[4]")} />
                        <SmustLogo className={cn("home-card-front-logo home-card-front-logo-smust absolute left-1/2 top-1/2 block max-w-full h-auto w-[min(var(--card-logo-front-right),calc(100%-var(--card-logo-safe-gap)))] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none origin-center transform-gpu transition-none z-[5] overflow-visible [overflow:visible] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]")} aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  <div className={cn("card-face", "back", "absolute inset-0 grid place-items-center rounded-full z-[1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]", (rightPhase === "front" || rightPhase === "flippingToFront") && !autoPreviewBackVisible ? "pointer-events-none" : "pointer-events-auto")} aria-hidden="true" onClick={rightBackInteractive ? handleCardBackClick("right") : undefined} style={!rightBackInteractive ? {
                  pointerEvents: "none"
                } : {}} data-interactive={rightBackInteractive ? "true" : "false"}>
                    <div className={cn("centered-back-right", "relative w-full h-full aspect-square rounded-full mx-auto overflow-visible [box-shadow:none] transition-[box-shadow] duration-[320ms] ease-out", introPending ? "opacity-0" : null, shouldFadeRight ? "fade-in" : null)} style={getHomeCardIntroStyle(shouldFadeRight)}>
                      <div className="home-card-face-content home-card-bg-keratume relative w-full h-full aspect-square rounded-full mx-auto flex items-center justify-center box-border p-[2em] bg-clip-padding bg-transparent overflow-hidden before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[2] before:bg-no-repeat before:bg-center before:bg-[length:106%_106%] before:opacity-[var(--home-card-dark-opacity)] before:[filter:none] before:[transform-origin:50%_50%] before:[transform:scale(1)] before:[will-change:opacity,transform]" style={homeCardKeratumeBgStyle}>
                        <h2 className={cn("font-headline font-normal uppercase tracking-[0.1em] leading-[1.6] [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] [-webkit-font-smoothing:antialiased] [font-variant-ligatures:none] relative z-[5] text-center mx-auto w-fit max-w-full [text-align-last:center] mt-0 [font-size:clamp(0.94rem,calc(var(--card-size)*0.065),1.7rem)] text-[#c57171] opacity-80 [text-shadow:0_0.42rem_0.34rem_rgba(0,0,0,0.46)] -translate-y-[0.25em] max-[768px]:-translate-y-[0.45em]")}>
                          {t("home.card.client.title")}
                        </h2>
                        <SaivalgeLogo className={cn("home-card-back-logo home-card-back-logo-right absolute left-1/2 top-[74%] block max-w-[10rem] h-auto w-[calc(var(--card-logo-back)*0.9)] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none origin-center transform-gpu z-[5]")} aria-hidden="true" />
                      </div>
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
        <div
          className={cn("home-bottom-sections", !showHomeBottomSections ? "home-bottom-sections-preintro" : null)}
          aria-hidden={!showHomeBottomSections}
        >
            <HomeAboutSection id="meist" showAdminLinks={isAuthed && isAdmin} />
            <div className={cn("home-footer-shell", !showHomeFooter ? "home-footer-preintro" : null)}>
              <HomeFooter />
            </div>
          </div>
      </div>
      {LoginModalComponent ? <LoginModalComponent open={isLoginOpen} onClose={() => setIsLoginOpen(false)} suppressRedirect onAuthSuccess={handleLoginSuccess} /> : null}
    </>;
}
