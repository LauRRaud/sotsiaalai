"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Magnet from "@/components/Animations/Magnet/Magnet";
import LoginModal from "@/components/LoginModal";
import AppLink from "@/components/ui/Link";
import { cn } from "@/components/ui/cn";
import { CircularRingLeft, CircularRingRight } from "@/components/TextAnimations/CircularText/CircularText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import useT from "@/components/i18n/useT";
import ConversationDrawer from "@/components/alalehed/ConversationDrawer";
import ChatSidebar from "@/components/ChatSidebar";
import ChatBody from "@/components/alalehed/ChatBody";

import MeistBody from "./alalehed/MeistBody";
import styles from "./HomePage.module.css";

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
  const [homeChatOpen, setHomeChatOpen] = useState(false);
  const [homeChatSide, setHomeChatSide] = useState(null);
  const [chatOpenDeferred, setChatOpenDeferred] = useState(false);
  const pendingUrlModeRef = useRef(null);

  const [leftPhase, setLeftPhase] = useState("front");
  const [rightPhase, setRightPhase] = useState("front");

  const [showScrollCue, setShowScrollCue] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  const [leftCardEl, setLeftCardEl] = useState(null);
  const [rightCardEl, setRightCardEl] = useState(null);
  const leftCardWrapRef = useRef(null);
  const rightCardWrapRef = useRef(null);
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
  const startExitToChat = useCallback(
    (side, opts = {}) => {
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
      pendingUrlModeRef.current = "chat";
      setChatOpenDeferred(true);
      syncHomeChatUrl(true, { roomId: null, profile: null });
      setHomeChatSide(side);
      setHomeChatOpen(true);
    },
    [isAuthed, isLoginOpen, markChatEnterFromHome, status, syncHomeChatUrl]
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
      if (e?.target?.classList?.contains?.(styles["glass-card"])) setLeftFadeDone(true);
    };
    const onRightEnd = (e) => {
      if (e?.target?.classList?.contains?.(styles["glass-card"])) setRightFadeDone(true);
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
    document.body.classList.add(styles.homeCursorScope);
    return () => {
      document.body.classList.remove("homepage");
      document.body.classList.remove(styles.homeCursorScope);
    };
  }, []);

  useEffect(() => {
    if (!isLoginOpen) return;
    setMobileFlipReady({ left: false, right: false });
  }, [isLoginOpen]);
  useEffect(() => {
    if (status === "loading") return;
    if (pendingUrlModeRef.current) {
      if (urlMode === pendingUrlModeRef.current) {
        pendingUrlModeRef.current = null;
        setChatOpenDeferred(false);
      } else {
        return;
      }
    }
    if (urlMode === "chat") {
      if (isAuthed) {
        if (!homeChatOpen && !chatOpenDeferred) setHomeChatOpen(true);
      } else {
        setHomeChatOpen(false);
      }
      return;
    }
    if (homeChatOpen) setHomeChatOpen(false);
    setHomeChatSide(null);
    setChatOpenDeferred(false);
  }, [chatOpenDeferred, homeChatOpen, isAuthed, status, urlMode]);

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

  const skipIntroAnimations = prefs.reduceMotion || hasSeenIntro;
  const footerFadeClass = skipIntroAnimations
    ? ""
    : cn(styles["defer-fade"], styles["defer-from-bottom"], styles["delay-2"]);
  const flipAllowed = leftFadeDone && rightFadeDone && !isLoginOpen && !homeChatOpen;
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
  const handleCardClick = (side) => (event) => {
    if (!flipAllowed) return;
    if (isMobile) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    startExitToChat(side);
  };

  const resetMobileCards = useCallback(() => {
    setMobileFlipReady({ left: false, right: false });
  }, []);
  const handleBackgroundTap = useCallback(
    (event) => {
      if (!isMobile || homeChatOpen) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest?.(`.${styles["three-d-card"]}`)) return;
      resetMobileCards();
    },
    [homeChatOpen, isMobile, resetMobileCards]
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
    syncHomeChatUrl(false);
    setHomeChatOpen(false);
    pendingUrlModeRef.current = "";
    setChatOpenDeferred(true);
    suppressFlipRef.current = false;
  }, [syncHomeChatUrl]);
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
      <div
        className={cn(
          styles["homepage-root"],
          styles["homepage-scroll"],
          styles.homeCursorScope,
          homeChatOpen ? styles["home-chat-open"] : null
        )}
      >
        <section className={styles["home-hero"]} onClick={handleBackgroundTap}>
          <div className={cn(styles["main-content"], "relative")}>
            <div className={cn(styles.side, styles.left)}>
              <div
                ref={leftCardWrapRef}
                className={cn(
                  styles["three-d-card"],
                  styles["float-card"],
                  styles.left,
                  flipClass,
                  leftFlipping ? styles["is-flipping"] : null,
                  mobileFlipReady.left ? styles["mobile-flipped-left"] : null
                )}
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
                    <div
                      className={styles["card-wrapper"]}
                      data-phase={leftPhase}
                      onTransitionEnd={onLeftTransitionEnd}
                      onClick={handleCardClick("left")}
                    >
                      <div className={cn(styles["card-face"], styles.front)}>
                        <div
                          ref={setLeftCardEl}
                          className={cn(
                            styles["glass-card"],
                            styles["glass-card-light"],
                            "left-card-primary",
                            !leftFadeDone ? styles["fade-in"] : null,
                            leftFadeDone ? styles["fade-in-done"] : null,
                            leftFadeDone && isActive ? "glow-active" : null
                          )}
                          style={{ position: "relative" }}
                        >
                          <CircularRingLeft className={isMobile || leftFadeDone ? "is-visible" : ""} />
                          <AivalgeLogo
                            className={cn(styles["card-logo-bg"], styles["card-logo-bg-left"])}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <div
                        className={cn(styles["card-face"], styles.back)}
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
                        <div
                          className={cn(
                            styles["centered-back-left"],
                            !leftFadeDone ? styles["fade-in"] : null,
                            "glow-static"
                          )}
                        >
                          <h2 className={styles["headline-bold"]}>{t("home.card.specialist.title")}</h2>
                          <SaimustLogo
                            className={cn(styles["card-logo-bg"], styles["card-logo-bg-left-back"])}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Magnet>
              </div>
            </div>

            <div className={cn(styles.side, styles.right)}>
              <div
                ref={rightCardWrapRef}
                className={cn(
                  styles["three-d-card"],
                  styles["float-card"],
                  styles.right,
                  flipClass,
                  rightFlipping ? styles["is-flipping"] : null,
                  mobileFlipReady.right ? styles["mobile-flipped-right"] : null
                )}
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
                    <div
                      className={styles["card-wrapper"]}
                      data-phase={rightPhase}
                      onTransitionEnd={onRightTransitionEnd}
                      onClick={handleCardClick("right")}
                    >
                      <div className={cn(styles["card-face"], styles.front)}>
                        <div
                          ref={setRightCardEl}
                          className={cn(
                            styles["glass-card"],
                            styles["glass-card-dark"],
                            "right-card-primary",
                            !rightFadeDone ? styles["fade-in"] : null,
                            rightFadeDone ? styles["fade-in-done"] : null,
                            rightFadeDone && isActive ? "glow-active" : null
                          )}
                          style={{ position: "relative" }}
                        >
                          <CircularRingRight className={isMobile || rightFadeDone ? "is-visible" : ""} />
                          <SmustLogo
                            className={cn(styles["card-logo-bg"], styles["card-logo-bg-right"])}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <div
                        className={cn(styles["card-face"], styles.back)}
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
                        <div
                          className={cn(
                            styles["centered-back-right"],
                            !rightFadeDone ? styles["fade-in"] : null,
                            "glow-static"
                          )}
                        >
                          <h2 className={styles["headline-bold"]}>{t("home.card.client.title")}</h2>
                          <SaivalgeLogo
                            className={cn(styles["card-logo-bg"], styles["card-logo-bg-right-back"])}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Magnet>
              </div>
            </div>
          </div>

          {homeChatOpen ? (
            <div className={styles["home-chat-slot"]} data-side={homeChatSide || undefined}>
              <ConversationDrawer>
                <ChatSidebar />
              </ConversationDrawer>
              <ChatBody roomId={urlRoomId} onBackHome={handleHomeChatClose} embedded />
            </div>
          ) : null}

          {!homeChatOpen ? (
            <div
              className={cn(styles["home-scroll-cue"], showScrollCue ? styles["is-visible"] : null)}
              aria-hidden={!showScrollCue}
            >
              <a className={styles["home-scroll-cue-link"]} href="#meist" onClick={handleScrollCueClick}>
                <span className={styles["home-scroll-cue-mouse"]} aria-hidden="true">
                  <svg viewBox="0 0 24 36" role="presentation">
                    <rect x="5.5" y="2.5" width="13" height="31" rx="6.5" />
                    <line x1="12" y1="7" x2="12" y2="13" />
                  </svg>
                </span>
                <span className={styles["home-scroll-cue-arrow"]} aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </section>

        <section id="meist" className={cn(styles["home-section"], styles["home-about"])}>
          <div className={styles["home-section-inner"]}>
            <MeistBody embedded isAdmin={isAuthed && isAdmin} />
          </div>
        </section>

        <section className={cn(styles["home-section"], styles["home-links"])} aria-label={t("nav.main")}>
          <div className={styles["home-section-inner"]}>
            <h2
              className={cn(
                styles["home-section-title"],
                "text-center text-[clamp(1.35rem,2.4vw,1.75rem)] font-[var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-medium tracking-[0.018em] mt-[clamp(1rem,2.4vw,1.8rem)] mb-[0.65rem] mx-0 [color:var(--home-prose-color)]"
              )}
            >
              {t("about.cta.title")}
            </h2>
            <ul className="flex flex-wrap items-center justify-center list-none p-0 mt-[0.35rem] mb-0 mx-0 gap-x-[1.05rem] gap-y-[0.45rem]">
              <li>
                <AppLink href="/kasutusjuhend" className={styles["home-link"]}>
                  {t("about.guide.jump_link")}
                </AppLink>
              </li>
              <li>
                <AppLink href="/kasutustingimused" className={styles["home-link"]}>
                  {t("about.links.terms")}
                </AppLink>
              </li>
              <li>
                <AppLink href="/privaatsustingimused" className={styles["home-link"]}>
                  {t("about.links.privacy")}
                </AppLink>
              </li>

              {isAuthed && isAdmin ? (
                <>
                  <li>
                    <AppLink href="/admin/analytics" className={styles["home-link"]}>
                      {t("about.links.analytics")}
                    </AppLink>
                  </li>
                  <li>
                    <AppLink href="/admin/rag" className={styles["home-link"]}>
                      {t("about.links.admin")}
                    </AppLink>
                  </li>
                </>
              ) : null}
            </ul>
          </div>
        </section>

        <footer className={styles["home-footer"]}>
          <div className={styles["home-footer-inner"]}>
            <AppLink href="mailto:info@sotsiaal.ai" className={cn(styles["home-footer-email"], styles["home-link"])}>
              info@sotsiaal.ai
            </AppLink>
            <Logomust
              className={cn(styles["home-footer-logo"], footerFadeClass)}
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



