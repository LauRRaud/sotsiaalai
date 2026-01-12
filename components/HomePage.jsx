// components/HomePage.jsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import useT from "@/components/i18n/useT";
import ConversationDrawer from "@/components/alalehed/ConversationDrawer";
import ChatSidebar from "@/components/ChatSidebar";
import ChatBody from "@/components/alalehed/ChatBody";

// UUS: Meist avalehele (embedded)
import MeistBody from "./alalehed/MeistBody";

// Inline SVG (SVGR)
import AivalgeLogo from "@/public/logo/aivalge.svg";
import SaimustLogo from "@/public/logo/saimust.svg";
import SmustLogo from "@/public/logo/smust.svg";
import SaivalgeLogo from "@/public/logo/saivalge.svg";
import Logomust from "@/public/logo/logomust.svg";

let homeIntroSeen = false;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { prefs } = useAccessibility();
  const t = useT();

  const [hasSeenIntro] = useState(() => homeIntroSeen);
  const [leftFadeDone, setLeftFadeDone] = useState(() => prefs.reduceMotion || hasSeenIntro);
  const [rightFadeDone, setRightFadeDone] = useState(() => prefs.reduceMotion || hasSeenIntro);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [leftFlipping, setLeftFlipping] = useState(false);
  const [rightFlipping, setRightFlipping] = useState(false);
  const [magnetReady, setMagnetReady] = useState(false);
  const [mobileFlipReady, setMobileFlipReady] = useState({ left: false, right: false });
  const [pendingExitSide, setPendingExitSide] = useState(null);
  const [exitState, setExitState] = useState(null);
  const [homeChatOpen, setHomeChatOpen] = useState(false);
  const [homeChatSide, setHomeChatSide] = useState(null);
  const [chatOpenDeferred, setChatOpenDeferred] = useState(false);

  const [leftPhase, setLeftPhase] = useState("front");
  const [rightPhase, setRightPhase] = useState("front");

  const [showScrollCue, setShowScrollCue] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  const [leftCardEl, setLeftCardEl] = useState(null);
  const [rightCardEl, setRightCardEl] = useState(null);
  const leftCardWrapRef = useRef(null);
  const rightCardWrapRef = useRef(null);
  const chatProbeRef = useRef(null);
  const exitTimerRef = useRef(null);
  const suppressFlipRef = useRef(false);
  const lastClickSideRef = useRef(null);



  const isAuthed = status === "authenticated" && !!session;
  const urlMode = searchParams?.get("mode") || "";
  const urlRoomId = searchParams?.get("roomId") || null;

  const isAdmin = useMemo(() => {
    const u = session?.user;
    const role = typeof u?.role === "string" ? u.role.toLowerCase() : "";
    const perms = Array.isArray(u?.permissions) ? u.permissions : [];
    return Boolean(u?.isAdmin || u?.is_admin || role === "admin" || perms.includes("admin"));
  }, [session]);

  const flipToBackMs = 1200;
  const flipToFrontMs = 1100;
  const exitDurationMs = prefs.reduceMotion ? 0 : 1100;
  const isExiting = Boolean(exitState);
  const exitSide = exitState?.side;
  const exitVars = exitState?.vars;

  const markChatEnterFromHome = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("sotsiaalai:chat-enter-from-home", String(Date.now()));
    } catch {}
  }, []);

  const syncHomeChatUrl = useCallback(
    (open, opts = {}) => {
      if (typeof window === "undefined") return;
      const { roomId, profile } = opts;
      const hasRoomId = Object.prototype.hasOwnProperty.call(opts, "roomId");
      const hasProfile = Object.prototype.hasOwnProperty.call(opts, "profile");
      const url = new URL(window.location.href);
      if (open) {
        url.searchParams.set("mode", "chat");
        if (hasRoomId) {
          if (roomId) url.searchParams.set("roomId", roomId);
          else url.searchParams.delete("roomId");
        }
        if (hasProfile) {
          if (profile) url.searchParams.set("profile", profile);
          else url.searchParams.delete("profile");
        }
      } else {
        url.searchParams.delete("mode");
        url.searchParams.delete("roomId");
        url.searchParams.delete("profile");
      }
      const qs = url.searchParams.toString();
      router.replace(qs ? `${url.pathname}?${qs}` : url.pathname);
    },
    [router]
  );
  const computeExitVars = useCallback(
    (side) => {
      const cardNode = side === "left" ? leftCardWrapRef.current : rightCardWrapRef.current;
      if (!cardNode || typeof window === "undefined") return null;
      const rect = cardNode.getBoundingClientRect();
      if (!rect?.width || !rect?.height) return null;
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const minViewport = Math.min(window.innerWidth, window.innerHeight);
      let targetCenterX = window.innerWidth / 2;
      let targetCenterY = window.innerHeight / 2;
      let targetSize = Math.min(1200, Math.max(640, minViewport * 0.88));
      const probeRect = chatProbeRef.current?.getBoundingClientRect?.();
      if (probeRect && probeRect.width > 0 && probeRect.height > 0) {
        targetCenterX = probeRect.left + probeRect.width / 2;
        targetCenterY = probeRect.top + probeRect.height / 2;
        targetSize = Math.min(probeRect.width, probeRect.height);
      }
      const dx = targetCenterX - cardCenterX;
      const dy = targetCenterY - cardCenterY;
      const scale = Math.max(1, targetSize / rect.width);
      const zDepth = Math.min(240, Math.max(120, minViewport * 0.18));
      return {
        x: `${dx.toFixed(2)}px`,
        y: `${dy.toFixed(2)}px`,
        scale: scale.toFixed(3),
        z: `${Math.round(zDepth)}px`,
      };
    },
    []
  );

  const startExitToChat = useCallback(
    (side, opts = {}) => {
      const forceAuth = opts.force === true;
      if (isExiting || (isLoginOpen && !forceAuth)) return;
      if (status === "loading" && !forceAuth) return;

      lastClickSideRef.current = side;
      if (!isAuthed && !forceAuth) {
        setPendingExitSide(side);
        setIsLoginOpen(true);
        return;
      }

      markChatEnterFromHome();
      suppressFlipRef.current = true;
      setChatOpenDeferred(true);
      syncHomeChatUrl(true, { roomId: null, profile: null });
      setHomeChatSide(side);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);

      const vars = computeExitVars(side);
      if (!vars || exitDurationMs === 0) {
        setHomeChatOpen(true);
        setChatOpenDeferred(false);
        return;
      }
      setExitState({
        side,
        vars,
      });
      exitTimerRef.current = window.setTimeout(() => {
        setExitState(null);
        setHomeChatOpen(true);
        setChatOpenDeferred(false);
      }, exitDurationMs);
    },
    [computeExitVars, exitDurationMs, isAuthed, isExiting, isLoginOpen, markChatEnterFromHome, status, syncHomeChatUrl]
  );
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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    leftCardEl?.addEventListener("animationend", onLeftEnd);
    rightCardEl?.addEventListener("animationend", onRightEnd);
    return () => {
      leftCardEl?.removeEventListener("animationend", onLeftEnd);
      rightCardEl?.removeEventListener("animationend", onRightEnd);
    };
  }, [leftCardEl, rightCardEl]);

  useEffect(() => {
    if (prefs.reduceMotion) {
      setLeftFadeDone(true);
      setRightFadeDone(true);
      setMagnetReady(false);
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
    return () => {
      document.body.classList.remove("homepage");
    };
  }, []);

  useEffect(() => {
    if (!isLoginOpen) return;
    setMobileFlipReady({ left: false, right: false });
  }, [isLoginOpen]);
  useEffect(() => {
    if (status === "loading") return;
    if (urlMode === "chat") {
      if (isAuthed) {
        if (!homeChatOpen && !isExiting && !chatOpenDeferred) setHomeChatOpen(true);
      } else {
        setHomeChatOpen(false);
      }
      return;
    }
    if (homeChatOpen) setHomeChatOpen(false);
    if (exitState) setExitState(null);
    setHomeChatSide(null);
    setChatOpenDeferred(false);
  }, [chatOpenDeferred, exitState, homeChatOpen, isAuthed, isExiting, status, urlMode]);

  useEffect(() => {
    if (!pendingExitSide || status !== "authenticated" || !session) return;
    if (isLoginOpen) setIsLoginOpen(false);
    const side = pendingExitSide;
    setPendingExitSide(null);
    window.setTimeout(() => startExitToChat(side), 0);
  }, [isLoginOpen, pendingExitSide, session, startExitToChat, status]);
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
  }, []);
  useEffect(() => {
    if (!isExiting) suppressFlipRef.current = false;
  }, [isExiting]);

  const skipIntroAnimations = prefs.reduceMotion || hasSeenIntro;
  const footerFadeClass = skipIntroAnimations ? "" : "defer-fade defer-from-bottom delay-2";
  const flipAllowed = leftFadeDone && rightFadeDone && !isLoginOpen && !isExiting && !homeChatOpen;
  const leftInteractive = flipAllowed && !leftFlipping && !isLoginOpen;
  const rightInteractive = flipAllowed && !rightFlipping && !isLoginOpen;
  const flipClass = !isMobile && flipAllowed ? "flip-allowed" : "";

  const onLeftEnter = () => {
    if (isExiting || suppressFlipRef.current) return;
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToBack");
      setTimeout(() => setLeftFlipping(false), flipToBackMs);
    }
  };
  const onLeftLeave = () => {
    if (isExiting || suppressFlipRef.current) return;
    if (!isMobile) {
      setLeftFlipping(true);
      setLeftPhase("flippingToFront");
      setTimeout(() => setLeftFlipping(false), flipToFrontMs);
    }
  };
  const onRightEnter = () => {
    if (isExiting || suppressFlipRef.current) return;
    if (!isMobile) {
      setRightFlipping(true);
      setRightPhase("flippingToBack");
      setTimeout(() => setRightFlipping(false), flipToBackMs);
    }
  };
  const onRightLeave = () => {
    if (isExiting || suppressFlipRef.current) return;
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

  const handleCardTap = (side) => (_e) => {
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
      const next = !prev[side] ? { left: side === "left", right: side === "right" } : { left: false, right: false };
      if (side === "left") setLeftPhase(!prev[side] ? "flippingToBack" : "flippingToFront");
      else setRightPhase(!prev[side] ? "flippingToBack" : "flippingToFront");
      return next;
    });
  };

  const resetMobileCards = useCallback(() => {
    setMobileFlipReady({ left: false, right: false });
  }, []);
  const handleBackgroundTap = useCallback(
    (event) => {
      if (!isMobile || isExiting || homeChatOpen) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest?.(".three-d-card")) return;
      resetMobileCards();
    },
    [homeChatOpen, isExiting, isMobile, resetMobileCards]
  );

  const handleScrollCueClick = useCallback(
    (event) => {
      event.preventDefault();
      if (typeof document === "undefined") return;
      const target = document.getElementById("meist");
      if (!target) return;
      target.scrollIntoView({ behavior: prefs.reduceMotion ? "auto" : "smooth", block: "start" });
    },
    [prefs.reduceMotion]
  );

  const onLeftTransitionEnd = (e) => {
    if (e?.propertyName !== "transform") return;
    setLeftPhase((p) => (p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p));
  };
  const onRightTransitionEnd = (e) => {
    if (e?.propertyName !== "transform") return;
    setRightPhase((p) => (p === "flippingToBack" ? "back" : p === "flippingToFront" ? "front" : p));
  };
  const handleHomeChatClose = useCallback(() => {
    const backSide = homeChatSide || lastClickSideRef.current;
    syncHomeChatUrl(false);
    setHomeChatOpen(false);
    if (backSide) {
      const vars = computeExitVars(backSide);
      setChatOpenDeferred(true);
      setExitState({ side: backSide, vars, reverse: true });
      window.setTimeout(() => {
        setExitState(null);
        setChatOpenDeferred(false);
      }, exitDurationMs);
    } else {
      setExitState(null);
      setChatOpenDeferred(false);
    }
    suppressFlipRef.current = false;
  }, [computeExitVars, exitDurationMs, homeChatSide, syncHomeChatUrl]);
  const handleLoginSuccess = useCallback(() => {
    const side = pendingExitSide || lastClickSideRef.current;
    if (!side) return;
    setPendingExitSide(null);
    setIsLoginOpen(false);
    window.setTimeout(() => startExitToChat(side, { force: true }), 0);
  }, [pendingExitSide, startExitToChat]);

  useEffect(() => {
    document.body.classList.toggle("home-chat-open", homeChatOpen);
    return () => document.body.classList.remove("home-chat-open");
  }, [homeChatOpen]);
  return (
    <>
      <div className={`homepage-root homepage-scroll${isExiting ? " home-exit" : ""}${exitState?.reverse ? " home-exit-reverse" : ""}${homeChatOpen ? " home-chat-open" : ""}`}>
        {/* HERO (ainult kaardid + taust) */}
        <section className="home-hero" onClick={handleBackgroundTap}>
          <div className="main-content relative">
            {/* LEFT CARD */}
            <div className="side left">
              <div
                ref={leftCardWrapRef}
                className={`three-d-card float-card left ${flipClass} ${leftFlipping ? "is-flipping" : ""} ${
                  mobileFlipReady.left ? "mobile-flipped-left" : ""
                }${exitSide === "left" ? " home-exit-target" : ""}`}
                onMouseEnter={onLeftEnter}
                onMouseLeave={onLeftLeave}
                onClick={handleCardTap("left")}
                style={
                  isExiting && exitSide === "left"
                    ? {
                        "--home-exit-x": exitVars?.x,
                        "--home-exit-y": exitVars?.y,
                        "--home-exit-scale": exitVars?.scale,
                        "--home-exit-z": exitVars?.z,
                        "--home-exit-dur": `${exitDurationMs}ms`,
                      }
                    : undefined
                }
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
                          ref={setLeftCardEl}
                          className={[
                            "glass-card glass-card-light left-card-primary",
                            !leftFadeDone ? "fade-in" : "",
                            leftFadeDone ? "fade-in-done" : "",
                            leftFadeDone && isActive ? "glow-active" : "",
                          ].join(" ")}
                          style={{ position: "relative" }}
                        >
                          <CircularRingLeft className={isMobile || leftFadeDone ? "is-visible" : ""} />
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
                          if (e.key === "Enter" || e.key === " ") startExitToChat("left");
                        }}
                        style={!leftInteractive ? { pointerEvents: "none" } : {}}
                        data-interactive={leftInteractive ? "true" : "false"}
                      >
                        <div className={["centered-back-left", !leftFadeDone ? "fade-in" : "", "glow-static"].join(" ")}>
                          <h2 className="headline-bold">{t("home.card.specialist.title")}</h2>
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
                }${exitSide === "right" ? " home-exit-target" : ""}`}
                onMouseEnter={onRightEnter}
                onMouseLeave={onRightLeave}
                onClick={handleCardTap("right")}
                style={
                  isExiting && exitSide === "right"
                    ? {
                        "--home-exit-x": exitVars?.x,
                        "--home-exit-y": exitVars?.y,
                        "--home-exit-scale": exitVars?.scale,
                        "--home-exit-z": exitVars?.z,
                        "--home-exit-dur": `${exitDurationMs}ms`,
                      }
                    : undefined
                }
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
                          ref={setRightCardEl}
                          className={[
                            "glass-card glass-card-dark right-card-primary",
                            !rightFadeDone ? "fade-in" : "",
                            rightFadeDone ? "fade-in-done" : "",
                            rightFadeDone && isActive ? "glow-active" : "",
                          ].join(" ")}
                          style={{ position: "relative" }}
                        >
                          <CircularRingRight className={isMobile || rightFadeDone ? "is-visible" : ""} />
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
                          if (e.key === "Enter" || e.key === " ") startExitToChat("right");
                        }}
                        style={!rightInteractive ? { pointerEvents: "none" } : {}}
                        data-interactive={rightInteractive ? "true" : "false"}
                      >
                        <div className={["centered-back-right", !rightFadeDone ? "fade-in" : "", "glow-static"].join(" ")}>
                          <h2 className="headline-bold">{t("home.card.client.title")}</h2>
                          <SaivalgeLogo className="card-logo-bg card-logo-bg-right-back" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  )}
                </Magnet>
              </div>
            </div>
          </div>

          <div className="home-chat-overlay" aria-hidden="true">
            <div ref={chatProbeRef} className="home-chat-probe">
              <div className="chat-page-shell">
                <div className="glass-box chat-container chat-container--round" />
              </div>
            </div>
          </div>

          {homeChatOpen ? (
            <div className="home-chat-slot" data-side={homeChatSide || undefined}>
              <ConversationDrawer>
                <ChatSidebar />
              </ConversationDrawer>
              <ChatBody roomId={urlRoomId} onBackHome={handleHomeChatClose} embedded />
            </div>
          ) : null}

          <div className={`home-scroll-cue${showScrollCue ? " is-visible" : ""}`} aria-hidden={!showScrollCue}>
            <a className="home-scroll-cue-link" href="#meist" onClick={handleScrollCueClick}>
              <span className="home-scroll-cue-mouse" aria-hidden="true">
                <svg viewBox="0 0 24 36" role="presentation">
                  <rect x="5.5" y="2.5" width="13" height="31" rx="6.5" />
                  <line x1="12" y1="7" x2="12" y2="13" />
                </svg>
              </span>
              <span className="home-scroll-cue-arrow" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* MEIST (tekst samal lehel, ilma glass-boxita) */}
        <section id="meist" className="home-section home-about">
          <div className="home-section-inner">
            <MeistBody embedded isAdmin={isAuthed && isAdmin} />
          </div>
        </section>

        {/* LINGID */}
        <section className="home-section home-links" aria-label={t("nav.main")}>
          <div className="home-section-inner">
            <h2 className="home-section-title text-center text-[clamp(1.35rem,2.4vw,1.75rem)] font-[var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-medium tracking-[0.018em] mt-[clamp(1rem,2.4vw,1.8rem)] mb-[0.65rem] mx-0 [color:var(--home-prose-color)]">
              {t("about.cta.title")}
            </h2>
            <ul className="flex flex-wrap items-center justify-center list-none p-0 mt-[0.35rem] mb-0 mx-0 gap-x-[1.05rem] gap-y-[0.45rem]">
              <li>
                <Link href="/kasutusjuhend" className="link-brand home-link">
                  {t("about.guide.jump_link")}
                </Link>
              </li>
              <li>
                <Link href="/kasutustingimused" className="link-brand home-link">
                  {t("about.links.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privaatsustingimused" className="link-brand home-link">
                  {t("about.links.privacy")}
                </Link>
              </li>

              {/* Varjatud admin-lingid: ainult sisse logides + admin */}
              {isAuthed && isAdmin ? (
                <>
                  <li>
                    <Link href="/admin/analytics" className="link-brand home-link">
                      {t("about.links.analytics")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/rag" className="link-brand home-link">
                      {t("about.links.admin")}
                    </Link>
                  </li>
                </>
              ) : null}
            </ul>
          </div>
        </section>

        {/* LOGO (mitte klikitav) */}
        <footer className="home-footer">
          <div className="home-footer-inner">
            <a href="mailto:info@sotsiaal.ai" className="home-footer-email link-brand home-link">
              info@sotsiaal.ai
            </a>
            <Logomust
              className={["home-footer-logo", "dim", footerFadeClass].filter(Boolean).join(" ")}
              role="img"
              aria-label={t("home.footer.logo_alt")}
            />
          </div>
        </footer>
      </div>

      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        suppressRedirect
        onAuthSuccess={handleLoginSuccess}
      />
    </>
  );
}



