import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { pushWithTransition } from "@/lib/routeTransition";

const ROLL_MS = 560;

export function useChatProfileRoll({
  embedded,
  router,
  showSourcesPanel,
  setShowSourcesPanel,
  setInputFocused,
  inputRef
}) {
  const searchParams = useSearchParams();
  const initialProfileOpen = embedded && searchParams?.get("profile") === "1";
  const [profileOpen, setProfileOpen] = useState(() => initialProfileOpen);
  const [_rollDirection, setRollDirection] = useState("right");
  const [isRolling, setIsRolling] = useState(false);
  const rollTimerRef = useRef(null);
  const rollSwapTimerRef = useRef(null);

  const syncProfileUrl = useCallback(open => {
    if (!embedded || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (open) {
      url.searchParams.set("profile", "1");
    } else {
      url.searchParams.delete("profile");
    }
    window.history.replaceState({
      profileOpen: open
    }, "", `${url.pathname}${url.search}${url.hash}`);
  }, [embedded]);

  const triggerRoll = useCallback((direction, open) => {
    if (isRolling) return;
    setRollDirection(direction);
    setIsRolling(true);
    if (showSourcesPanel) setShowSourcesPanel(false);
    setInputFocused(false);
    try {
      inputRef.current?.blur?.();
    } catch {}
    if (rollSwapTimerRef.current) window.clearTimeout(rollSwapTimerRef.current);
    const swapDelay = Math.round(ROLL_MS * 0.35);
    rollSwapTimerRef.current = window.setTimeout(() => {
      setProfileOpen(open);
      syncProfileUrl(open);
    }, swapDelay);
    if (rollTimerRef.current) window.clearTimeout(rollTimerRef.current);
    rollTimerRef.current = window.setTimeout(() => setIsRolling(false), ROLL_MS);
  }, [
    inputRef,
    isRolling,
    setInputFocused,
    setShowSourcesPanel,
    showSourcesPanel,
    syncProfileUrl
  ]);

  const openProfile = useCallback(() => {
    if (!embedded) {
      pushWithTransition(router, "/profiil");
      return;
    }
    triggerRoll("right", true);
  }, [embedded, router, triggerRoll]);

  const closeProfile = useCallback(() => {
    if (!embedded) return;
    triggerRoll("left", false);
  }, [embedded, triggerRoll]);

  const toggleProfile = useCallback(() => {
    if (profileOpen) {
      closeProfile();
      return;
    }
    openProfile();
  }, [closeProfile, openProfile, profileOpen]);

  useEffect(() => {
    if (!embedded || typeof document === "undefined") return;
    document.body.classList.toggle("home-profile-open", profileOpen);
    return () => document.body.classList.remove("home-profile-open");
  }, [embedded, profileOpen]);

  useEffect(() => {
    if (!embedded) return;
    const wantsProfile = searchParams?.get("profile") === "1";
    if (wantsProfile === profileOpen || isRolling) return;
    setProfileOpen(wantsProfile);
  }, [embedded, isRolling, profileOpen, searchParams]);

  useEffect(() => {
    return () => {
      if (rollSwapTimerRef.current) window.clearTimeout(rollSwapTimerRef.current);
      if (rollTimerRef.current) window.clearTimeout(rollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!embedded) return;
    const shouldOpen = searchParams?.get("profile") === "1";
    if (typeof shouldOpen !== "boolean") return;
    setProfileOpen(prev => {
      if (prev === shouldOpen) return prev;
      return shouldOpen;
    });
    if (shouldOpen) setRollDirection("right");
  }, [embedded, searchParams]);

  return {
    profileOpen,
    isRolling,
    openProfile,
    closeProfile,
    toggleProfile
  };
}
