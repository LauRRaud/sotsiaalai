import { useCallback, useEffect, useRef, useState } from "react";
import { detectMobileViewport } from "../chatLayoutVars";

export function useChatMobileRail() {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileRailVisible, setMobileRailVisible] = useState(false);
  const [mobileRailInteractionLocked, setMobileRailInteractionLocked] = useState(false);
  const mobileModeRef = useRef(null);
  const mobileRailShowTimerRef = useRef(0);
  const mobileRailUnlockTimerRef = useRef(0);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const nextIsMobile = detectMobileViewport();
      setIsMobile(nextIsMobile);
      setMobileRailVisible(prev => {
        const prevMode = mobileModeRef.current;
        if (prevMode === null || prevMode !== nextIsMobile) {
          mobileModeRef.current = nextIsMobile;
          if (mobileRailShowTimerRef.current) {
            window.clearTimeout(mobileRailShowTimerRef.current);
            mobileRailShowTimerRef.current = 0;
          }
          if (mobileRailUnlockTimerRef.current) {
            window.clearTimeout(mobileRailUnlockTimerRef.current);
            mobileRailUnlockTimerRef.current = 0;
          }
          setMobileRailInteractionLocked(false);
          return nextIsMobile ? false : true;
        }
        return prev;
      });
    };

    update();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const showMobileRail = useCallback(() => {
    if (mobileRailInteractionLocked) return;
    setMobileRailInteractionLocked(true);
    if (mobileRailShowTimerRef.current) {
      window.clearTimeout(mobileRailShowTimerRef.current);
      mobileRailShowTimerRef.current = 0;
    }
    mobileRailShowTimerRef.current = window.setTimeout(() => {
      setMobileRailVisible(true);
      mobileRailShowTimerRef.current = 0;
    }, 140);
    if (mobileRailUnlockTimerRef.current) {
      window.clearTimeout(mobileRailUnlockTimerRef.current);
      mobileRailUnlockTimerRef.current = 0;
    }
    mobileRailUnlockTimerRef.current = window.setTimeout(() => {
      setMobileRailInteractionLocked(false);
      mobileRailUnlockTimerRef.current = 0;
    }, 620);
  }, [mobileRailInteractionLocked]);

  const hideMobileRail = useCallback(() => {
    if (!isMobile) return;
    if (mobileRailShowTimerRef.current) {
      window.clearTimeout(mobileRailShowTimerRef.current);
      mobileRailShowTimerRef.current = 0;
    }
    if (mobileRailUnlockTimerRef.current) {
      window.clearTimeout(mobileRailUnlockTimerRef.current);
      mobileRailUnlockTimerRef.current = 0;
    }
    setMobileRailInteractionLocked(true);
    setMobileRailVisible(false);
    mobileRailUnlockTimerRef.current = window.setTimeout(() => {
      setMobileRailInteractionLocked(false);
      mobileRailUnlockTimerRef.current = 0;
    }, 320);
  }, [isMobile]);

  useEffect(() => {
    return () => {
      if (mobileRailShowTimerRef.current) {
        window.clearTimeout(mobileRailShowTimerRef.current);
        mobileRailShowTimerRef.current = 0;
      }
      if (mobileRailUnlockTimerRef.current) {
        window.clearTimeout(mobileRailUnlockTimerRef.current);
        mobileRailUnlockTimerRef.current = 0;
      }
    };
  }, []);

  return {
    isMobile,
    mobileRailVisible,
    mobileRailInteractionLocked,
    showMobileRail,
    hideMobileRail
  };
}
