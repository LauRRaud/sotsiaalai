"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
function uuid() {
  const rnd = typeof window !== "undefined" && window.crypto?.randomUUID?.() || null;
  return rnd ? `conv-${rnd}` : `conv-${Date.now()}`;
}
function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}
export default function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [roomItems, setRoomItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [roomsBusy, setRoomsBusy] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const abortRef = useRef(null);
  const cursorRef = useRef(null);
  const roomsAbortRef = useRef(null);
  const visibilityThrottleRef = useRef({
    timer: null,
    last: 0
  });
  const {
    t
  } = useI18n();
  const pageSize = useMemo(() => {
    if (typeof window === "undefined") return 30;
    return window.innerWidth < 640 ? 15 : 30;
  }, []);
  const fetchList = useCallback(async ({
    reset
  } = {
    reset: false
  }) => {
    setError("");
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    if (reset) {
      setItems([]);
      cursorRef.current = null;
      setHasMore(false);
    }
    setBusy(true);
    try {
      const params = new URLSearchParams({
        limit: String(pageSize)
      });
      if (!reset && cursorRef.current) {
        params.set("cursor", cursorRef.current);
      }
      const r = await fetch(`/api/chat/conversations?${params.toString()}`, {
        cache: "no-store",
        signal: ac.signal
      });
      const data = await r.json().catch(() => ({
        ok: false,
        conversations: []
      }));
      if (!r.ok || !data?.ok) {
        throw new Error(data?.message || t("chat.sidebar.error.load"));
      }
      const newItems = Array.isArray(data.conversations) ? data.conversations : [];
      setItems(prev => reset ? newItems : [...prev, ...newItems]);
      const nextCursor = data.nextCursor || null;
      cursorRef.current = nextCursor;
      setHasMore(Boolean(nextCursor));
      if (data?.degraded) {
        setError(data.message || t("chat.sidebar.error.history"));
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        setError(e?.message || t("chat.sidebar.error.load"));
      }
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setBusy(false);
    }
  }, [pageSize, t]);
  const fetchRooms = useCallback(async () => {
    roomsAbortRef.current?.abort();
    const ac = new AbortController();
    roomsAbortRef.current = ac;
    setRoomsBusy(true);
    try {
      const r = await fetch("/api/rooms", {
        cache: "no-store",
        signal: ac.signal
      });
      const data = await r.json().catch(() => ({
        ok: false,
        rooms: []
      }));
      if (!r.ok || !data?.ok) {
        throw new Error(data?.message || "Rooms fetch failed");
      }
      const normalized = Array.isArray(data.rooms) ? data.rooms.map(room => ({
        id: room.id,
        title: room.title || t("chat.sidebar.room_fallback"),
        preview: room?.lastMessage?.content || "",
        lastActivityAt: room?.lastMessage?.createdAt || null,
        kind: "room"
      })) : [];
      setRoomItems(normalized);
    } catch (e) {
      if (e?.name !== "AbortError") {
        console.warn("Rooms load failed:", e);
      }
    } finally {
      if (roomsAbortRef.current === ac) roomsAbortRef.current = null;
      setRoomsBusy(false);
    }
  }, [t]);
  const refreshAll = useCallback(() => {
    fetchList({
      reset: true
    });
    fetchRooms();
  }, [fetchList, fetchRooms]);
  const scheduleVisibilityRefresh = useCallback(() => {
    const state = visibilityThrottleRef.current;
    const now = Date.now();
    const wait = 2000;
    const remaining = wait - (now - state.last);
    const run = () => {
      state.last = Date.now();
      state.timer = null;
      refreshAll();
    };
    if (remaining <= 0) {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      run();
    } else if (!state.timer) {
      state.timer = setTimeout(run, remaining);
    }
  }, [refreshAll]);
  useEffect(() => {
    const throttleState = visibilityThrottleRef.current;
    refreshAll();
    const onExternalRefresh = () => refreshAll();
    window.addEventListener("sotsiaalai:refresh-conversations", onExternalRefresh);
    const handleVisibilityEvent = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState === "visible") {
        scheduleVisibilityRefresh();
      }
    };
    window.addEventListener("focus", handleVisibilityEvent);
    document.addEventListener("visibilitychange", handleVisibilityEvent);
    return () => {
      window.removeEventListener("sotsiaalai:refresh-conversations", onExternalRefresh);
      window.removeEventListener("focus", handleVisibilityEvent);
      document.removeEventListener("visibilitychange", handleVisibilityEvent);
      if (throttleState?.timer) {
        clearTimeout(throttleState.timer);
        throttleState.timer = null;
      }
      abortRef.current?.abort();
      roomsAbortRef.current?.abort();
    };
  }, [refreshAll, scheduleVisibilityRefresh]);
  useEffect(() => {
    if (!selectMode) return;
    setSelectedIds(prev => {
      if (!prev.size) return prev;
      const allowed = new Set(items.map(item => item.id));
      const next = new Set();
      prev.forEach(id => {
        if (allowed.has(id)) next.add(id);
      });
      return next;
    });
  }, [items, selectMode]);
  const fetchMore = useCallback(() => {
    if (busy || creating || !hasMore) return;
    fetchList({
      reset: false
    });
  }, [busy, creating, hasMore, fetchList]);
  const toggleSelectMode = useCallback(() => {
    setSelectMode(prev => {
      const next = !prev;
      if (!next) setSelectedIds(new Set());
      return next;
    });
  }, []);
  const toggleSelected = useCallback(id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);
  const isEmbeddedChat = searchParams?.get("mode") === "chat";
  const updateChatUrl = useCallback(nextRoomId => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "chat");
    if (nextRoomId) url.searchParams.set("roomId", nextRoomId);else url.searchParams.delete("roomId");
    const qs = url.searchParams.toString();
    const nextPath = qs ? `${url.pathname}?${qs}` : url.pathname;
    if (nextPath === `${pathname}${window.location.search}`) return;
    router.replace(nextPath);
  }, [pathname, router]);
  const activateConversation = useCallback((conversationId, {
    force = false
  } = {}) => {
    const id = String(conversationId || "").trim();
    if (!id) return;
    if (selectMode && !force) return;
    try {
      window.sessionStorage.setItem("sotsiaalai:chat:convId", id);
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:switch-conversation", {
        detail: {
          convId: id
        }
      }));
    } catch {}
    if (pathname?.startsWith("/vestlus") && searchParams?.get("roomId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("roomId");
      const qs = params.toString();
      router.replace(qs ? `/vestlus?${qs}` : "/vestlus");
    }
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", {
        detail: {
          open: false
        }
      }));
    } catch {}
  }, [pathname, router, searchParams, selectMode]);
  const onPick = useCallback(item => {
    if (!item?.id) return;
    if (selectMode) return;
    if (item.kind === "room") {
      if (isEmbeddedChat) {
        updateChatUrl(String(item.id));
      } else {
        router.push(`/vestlus?roomId=${encodeURIComponent(item.id)}`);
      }
      window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", {
        detail: {
          open: false
        }
      }));
      return;
    }
    activateConversation(item.id);
  }, [activateConversation, isEmbeddedChat, router, selectMode, updateChatUrl]);
  const onNew = useCallback(async () => {
    if (busy || creating) return;
    setCreating(true);
    setError("");
    const id = uuid();
    try {
      const r = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          role: "CLIENT"
        })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) {
        throw new Error(data?.message || t("chat.sidebar.error.create"));
      }
      const nextId = data?.conversation?.id || id;
      activateConversation(nextId, {
        force: true
      });
      refreshAll();
    } catch (e) {
      setError(e?.message || t("chat.sidebar.error.create"));
    } finally {
      setCreating(false);
    }
  }, [activateConversation, busy, creating, refreshAll, t]);
  const onDelete = useCallback(async id => {
    if (!id) return;
    if (!confirm(t("chat.sidebar.confirm.delete"))) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) {
        throw new Error(data?.message || t("chat.sidebar.error.delete"));
      }
      refreshAll();
      try {
        const current = window.sessionStorage.getItem("sotsiaalai:chat:convId");
        if (current === id) {
          window.sessionStorage.removeItem("sotsiaalai:chat:convId");
        }
      } catch {}
    } catch (e) {
      setError(e?.message || t("chat.sidebar.error.delete"));
    } finally {
      setBusy(false);
    }
  }, [refreshAll, t]);
  const fetchAllConversationIds = useCallback(async () => {
    const ids = [];
    let nextCursor = null;
    let loops = 0;
    do {
      const params = new URLSearchParams({
        limit: "100"
      });
      if (nextCursor) params.set("cursor", nextCursor);
      const r = await fetch(`/api/chat/conversations?${params.toString()}`, {
        cache: "no-store"
      });
      const data = await r.json().catch(() => ({
        ok: false,
        conversations: []
      }));
      if (!r.ok || !data?.ok) {
        throw new Error(data?.message || t("chat.sidebar.error.load"));
      }
      const list = Array.isArray(data.conversations) ? data.conversations : [];
      list.forEach(row => {
        if (row?.id) ids.push(row.id);
      });
      nextCursor = data.nextCursor || null;
      loops += 1;
    } while (nextCursor && loops < 50);
    return ids;
  }, [t]);
  const deleteConversationIds = useCallback(async ids => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (!unique.length) return {
      deleted: 0,
      failed: 0
    };
    setBulkDeleting(true);
    setError("");
    const failures = [];
    for (const id of unique) {
      try {
        const r = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.ok === false) {
          throw new Error(data?.message || t("chat.sidebar.error.delete"));
        }
      } catch (e) {
        failures.push({
          id,
          error: e
        });
      }
    }
    if (failures.length) {
      setError(t("chat.sidebar.error.delete"));
    }
    try {
      const current = window.sessionStorage.getItem("sotsiaalai:chat:convId");
      if (current && unique.includes(current)) {
        window.sessionStorage.removeItem("sotsiaalai:chat:convId");
      }
    } catch {}
    refreshAll();
    setBulkDeleting(false);
    return {
      deleted: unique.length - failures.length,
      failed: failures.length
    };
  }, [refreshAll, t]);
  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIds.size) return;
    if (!confirm(t("chat.sidebar.confirm.delete_selected"))) {
      return;
    }
    const ids = Array.from(selectedIds);
    const result = await deleteConversationIds(ids);
    if (result.failed === 0) {
      setSelectedIds(new Set());
    }
  }, [deleteConversationIds, selectedIds, t]);
  const handleDeleteAll = useCallback(async () => {
    if (!confirm(t("chat.sidebar.confirm.delete_all"))) {
      return;
    }
    let ids = [];
    try {
      ids = await fetchAllConversationIds();
    } catch (e) {
      setError(e?.message || t("chat.sidebar.error.delete"));
      return;
    }
    const result = await deleteConversationIds(ids);
    if (result.failed === 0) {
      setSelectedIds(new Set());
      setSelectMode(false);
    }
  }, [deleteConversationIds, fetchAllConversationIds, t]);
  const safeDate = v => {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  };
  const combinedItems = useMemo(() => {
    const convItems = items.map(item => ({
      ...item,
      kind: "conversation"
    }));
    return [...convItems, ...roomItems];
  }, [items, roomItems]);
  const sorted = useMemo(() => [...combinedItems].sort((a, b) => safeDate(b?.lastActivityAt) - safeDate(a?.lastActivityAt)), [combinedItems]);
  const isLoading = busy || roomsBusy;
  const isActionBusy = busy || creating || bulkDeleting;
  const selectedCount = selectedIds.size;
  const messageCardClassNameCommon =
    "drawer-chat-card flex w-full flex-col gap-[0.6rem] rounded-[1rem] border border-[rgba(255,255,255,0.08)] " +
    "bg-[rgba(10,14,24,0.32)] p-[0.75rem_0.85rem] max-[48em]:p-[0.9rem_0.95rem] text-[color:var(--pt-120)] " +
    "shadow-[0_0.4rem_1rem_rgba(0,0,0,0.25)] transition-[transform,border-color,background,box-shadow] duration-150 " +
    "hover:-translate-y-[1px] hover:border-[rgba(148,163,184,0.4)] hover:bg-[rgba(16,22,34,0.4)] hover:shadow-[0_0.55rem_1.35rem_rgba(0,0,0,0.32)] " +
    "focus-within:-translate-y-[1px] focus-within:border-[rgba(148,163,184,0.4)] focus-within:bg-[rgba(16,22,34,0.4)] focus-within:shadow-[0_0.55rem_1.35rem_rgba(0,0,0,0.32)] " +
    "[.theme-light_&]:border-[rgba(148,163,184,0.35)] [.theme-light_&]:bg-[rgba(255,255,255,0.85)] [.theme-light_&]:text-[#1f2937] [.theme-light_&]:shadow-[0_0.35rem_0.9rem_rgba(15,23,42,0.12)] [.theme-light_&:hover]:border-[rgba(148,163,184,0.55)] [.theme-light_&:hover]:bg-[rgba(255,255,255,0.96)] [.theme-light_&:hover]:shadow-[0_0.5rem_1.1rem_rgba(15,23,42,0.16)] [.theme-light_&:focus-within]:border-[rgba(148,163,184,0.55)] [.theme-light_&:focus-within]:bg-[rgba(255,255,255,0.96)] [.theme-light_&:focus-within]:shadow-[0_0.5rem_1.1rem_rgba(15,23,42,0.16)]";
  const messageActiveVariant =
    "drawer-chat-card--active border-[rgba(148,163,184,0.45)] bg-[rgba(18,24,36,0.48)] shadow-[0_0.6rem_1.45rem_rgba(0,0,0,0.36)] [.theme-light_&]:border-[rgba(148,163,184,0.62)] [.theme-light_&]:bg-[rgba(255,255,255,0.98)]";
  const previewTextClassName =
    "text-[1rem] max-[48em]:text-[1.12rem] leading-[1.5] text-[color:var(--pt-200)] [.theme-light_&]:text-[#475569]";
  const timeTextClassName =
    "text-[0.9rem] max-[48em]:text-[1.02rem] text-[rgba(148,163,184,0.8)] [.theme-light_&]:text-[rgba(71,85,105,0.8)]";
  const deleteBtnClassName =
    "inline-flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.65rem] border border-[rgba(148,163,184,0.42)] bg-[rgba(15,23,42,0.16)] p-0 text-[rgba(203,213,225,0.9)] transition-[border-color,background,color,transform] duration-150 hover:border-[rgba(255,120,120,0.72)] hover:bg-[rgba(48,16,20,0.5)] hover:text-[#ffe1e1] focus-visible:border-[rgba(255,120,120,0.72)] focus-visible:bg-[rgba(48,16,20,0.5)] focus-visible:text-[#ffe1e1] focus-visible:outline-none active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-55 [.theme-light_&]:border-[rgba(148,163,184,0.42)] [.theme-light_&]:bg-[rgba(255,255,255,0.8)] [.theme-light_&]:text-[rgba(71,85,105,0.9)] [.theme-light_&:hover]:border-[rgba(192,72,72,0.62)] [.theme-light_&:hover]:bg-[rgba(255,235,235,1)] [.theme-light_&:hover]:text-[#6b1d1d] [.theme-light_&:focus-visible]:border-[rgba(192,72,72,0.62)] [.theme-light_&:focus-visible]:bg-[rgba(255,235,235,1)] [.theme-light_&:focus-visible]:text-[#6b1d1d]";
  const loadMoreBtnClassName =
    "inline-flex h-[1.8rem] w-[2rem] items-center justify-center border-0 bg-transparent p-0 text-[#c57171] light:text-[#7a3a38] " +
    "transition-[opacity,transform] duration-150 hover:-translate-y-[1px] hover:opacity-100 focus-visible:-translate-y-[1px] focus-visible:opacity-100 focus-visible:outline-none " +
    "disabled:cursor-not-allowed disabled:opacity-45";
  const compactActionBtnClassName =
    "!text-[1.04rem] !tracking-[0.01em] !whitespace-nowrap " +
    "max-[48em]:!text-[1.34rem] max-[48em]:!leading-[1.08] max-[48em]:!px-[1.28rem] max-[48em]:!min-h-[3.36rem] " +
    "max-[26em]:!text-[1.2rem] max-[26em]:!px-[1.02rem]";
  const compactRefreshBtnClassName =
    "px-[0.82rem] max-[48em]:!px-[1.18rem] max-[48em]:!min-h-[3.36rem]";
  const sidebarContentWidthClassName = "w-full max-w-[20.6rem] max-[48em]:max-w-none mx-auto";
  return <nav className="drawer-chat-sidebar flex h-full flex-1 flex-col items-center gap-3 px-[0.35rem] pb-[0.4rem] pt-[0.7rem] max-[48em]:pt-[0.9rem] text-[color:var(--pt-100)] light:text-[#1f2937]" aria-label={t("chat.sidebar.aria_list")} aria-busy={isLoading || creating ? "true" : "false"}>
      <div className={`${sidebarContentWidthClassName} flex flex-nowrap items-center justify-center gap-2 max-[48em]:gap-[0.72rem]`}>
        <Button variant="primary" size="sm" className={compactActionBtnClassName} onClick={onNew} disabled={busy || creating} aria-busy={creating ? "true" : "false"}>
          {creating ? t("chat.sidebar.button.creating") : <>
              <span className="max-[26em]:hidden">{t("chat.sidebar.button.new")}</span>
              <span className="hidden max-[26em]:inline">{t("chat.sidebar.button.new_short")}</span>
            </>}
        </Button>
        <Button variant="primary" size="sm" className={compactActionBtnClassName} onClick={toggleSelectMode} disabled={isActionBusy}>
          {selectMode ? <>
              <span className="max-[26em]:hidden">{t("chat.sidebar.selection.cancel")}</span>
              <span className="hidden max-[26em]:inline">{t("chat.sidebar.selection.cancel_short")}</span>
            </> : <>
              <span className="max-[26em]:hidden">{t("chat.sidebar.selection.select")}</span>
              <span className="hidden max-[26em]:inline">{t("chat.sidebar.selection.select_short")}</span>
            </>}
        </Button>
        <Button variant="primary" size="sm" onClick={refreshAll} disabled={isLoading || creating} aria-label={t("chat.sidebar.button.refresh")} title={t("chat.sidebar.button.refresh")} className={compactRefreshBtnClassName}>
          <svg className="h-5 w-5 max-[48em]:h-[1.74rem] max-[48em]:w-[1.74rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 15-6.2" />
            <polyline points="18 3 18 9 12 9" />
            <path d="M21 12a9 9 0 0 1-15 6.2" />
            <polyline points="6 21 6 15 12 15" />
          </svg>
        </Button>
      </div>
      {selectMode ? <div className={`${sidebarContentWidthClassName} flex items-center justify-center gap-2 max-[48em]:gap-[0.58rem]`}>
          <Button variant="primary" size="sm" className={`px-[0.7rem] ${compactActionBtnClassName}`} onClick={handleDeleteSelected} disabled={!selectedCount || isActionBusy}>
            <span className="max-[26em]:hidden">{t("chat.sidebar.selection.delete_selected")}</span>
            <span className="hidden max-[26em]:inline">{t("chat.sidebar.selection.delete_selected_short")}</span>
          </Button>
          <Button variant="primary" size="sm" className={`px-[0.7rem] ${compactActionBtnClassName}`} onClick={handleDeleteAll} disabled={isActionBusy}>
            <span className="max-[26em]:hidden">{t("chat.sidebar.selection.delete_all")}</span>
            <span className="hidden max-[26em]:inline">{t("chat.sidebar.selection.delete_all_short")}</span>
          </Button>
        </div> : null}
      {error ? <div className={`${sidebarContentWidthClassName} rounded-[0.85rem] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-3 py-2 text-sm text-[#ff9c9c] light:border-[rgba(231,76,60,0.4)] light:bg-[rgba(255,255,255,0.75)] light:text-[#7a2323]`} role="alert" aria-live="assertive">
          {error}
        </div> : null}
      {isLoading && combinedItems.length === 0 ? <div className={`${sidebarContentWidthClassName} flex flex-col gap-2 py-2`}>
          {Array.from({ length: 4 }).map((_, i) => <div key={`s-${i}`} className="flex flex-col gap-2 rounded-[0.85rem] border-0 bg-[rgba(255,255,255,0.02)] p-3">
                <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-[rgba(255,255,255,0.08)] via-[rgba(255,255,255,0.18)] to-[rgba(255,255,255,0.08)] animate-pulse" />
                <div className="h-2 w-1/3 rounded-full bg-gradient-to-r from-[rgba(255,255,255,0.08)] via-[rgba(255,255,255,0.18)] to-[rgba(255,255,255,0.08)] animate-pulse" />
              </div>)}
        </div> : null}
      <ul className={`${sidebarContentWidthClassName} drawer-chat-sidebar__list list-none m-0 pl-0 flex flex-1 flex-col items-stretch gap-3 max-[48em]:gap-[0.95rem] overflow-y-auto pr-0 mt-[0.12rem] max-[48em]:mt-[0.38rem] pt-[1.38rem] max-[48em]:pt-[2.05rem] pb-[0.8rem] [scrollbar-width:none] [scroll-padding-top:clamp(1.35rem,4.2vw,2.1rem)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.6)_3.2%,#000_8.4%,#000_90.8%,rgba(0,0,0,0.82)_94.9%,rgba(0,0,0,0.45)_98.2%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.6)_3.2%,#000_8.4%,#000_90.8%,rgba(0,0,0,0.82)_94.9%,rgba(0,0,0,0.45)_98.2%,transparent_100%)] [-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [mask-size:100%_100%] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0`}>
        {!isLoading && sorted.length === 0 ? <li className="flex w-full items-center justify-between gap-3 rounded-[1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,14,24,0.32)] px-3 py-4 [.theme-light_&]:border-[rgba(148,163,184,0.35)] [.theme-light_&]:bg-[rgba(255,255,255,0.85)]">
            <span>{t("chat.sidebar.empty")}</span>
            <Button variant="primary" size="sm" onClick={onNew} disabled={creating}>
              {t("chat.sidebar.empty_cta")}
            </Button>
          </li> : sorted.map(c => {
          const isActive = (() => {
            try {
              if (c.kind === "room") return false;
              const current = window.sessionStorage.getItem("sotsiaalai:chat:convId");
              return current === c.id;
            } catch {
              return false;
            }
          })();
          return <li key={`${c.kind}:${c.id}`} className={`${messageCardClassNameCommon} ${isActive ? messageActiveVariant : ""}`}>
              <div className="flex items-start gap-3">
                {selectMode && c.kind !== "room" ? <label className="mt-[0.1rem] flex h-6 w-6 max-[48em]:h-7 max-[48em]:w-7 items-center justify-center">
                      <input type="checkbox" className="peer sr-only" checked={selectedIds.has(c.id)} onChange={() => toggleSelected(c.id)} disabled={isActionBusy} />
                      <span aria-hidden="true" className="relative flex h-[20px] w-[20px] max-[48em]:h-[26px] max-[48em]:w-[26px] items-center justify-center rounded-[0.4rem] border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] text-[color:var(--seg-radio-dot-bg)] transition-[border-color,box-shadow,background] duration-150 ease-out peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] max-[48em]:h-[21px] max-[48em]:w-[21px] scale-90 opacity-0 transition-[opacity,transform] duration-150 ease-out" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 12.5l4 4 8-8" />
                        </svg>
                      </span>
                    </label> : null}
                <button className="flex min-w-0 w-full flex-1 flex-col gap-[0.45rem] bg-transparent p-0 text-left border-0 appearance-none" onClick={() => selectMode ? null : onPick(c)} title={c.preview || c.title || "Vestlus"} aria-current={isActive ? "true" : undefined} aria-disabled={selectMode ? "true" : undefined}>
                  <div className="flex flex-wrap items-center justify-start gap-2">
                    <span className="text-[1.2rem] max-[48em]:text-[1.38rem] font-semibold text-[rgba(242,241,239,0.94)] [.theme-light_&]:text-[rgba(31,41,55,0.92)]">
                      {c.title || c.preview || t("chat.sidebar.item.fallback_title")}
                    </span>
                    {c.kind === "room" ? <span className="rounded-full border border-[rgba(255,255,255,0.4)] px-2 py-[0.15rem] text-[0.65rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.85)] light:border-[rgba(148,163,184,0.4)] light:text-[rgba(55,65,81,0.8)]">
                        {t("chat.sidebar.group_badge")}
                      </span> : null}
                  </div>
                  {c.preview ? <div className={previewTextClassName}>
                      {c.preview}
                    </div> : null}
                  <div className={timeTextClassName}>
                    {formatDateTime(c.lastActivityAt)}
                  </div>
                </button>
              </div>
              {c.kind !== "room" && !selectMode ? <div className="flex justify-end">
                  <button className={`${deleteBtnClassName} cs-delete`} onClick={() => onDelete(c.id)} aria-label={t("chat.sidebar.item.delete")} title={t("chat.sidebar.item.delete_title")} disabled={isActionBusy}>
                    <svg className="cs-trash-icon h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div> : null}
            </li>
        })}
      </ul>
      {hasMore ? <div className={`${sidebarContentWidthClassName} flex w-full justify-center pt-[0.08rem]`}>
          <button type="button" className={loadMoreBtnClassName} onClick={fetchMore} disabled={busy || creating} aria-label={t("chat.sidebar.button.more")} title={t("chat.sidebar.button.more")}>
            <ChevronIcon direction="down" className="h-[1rem] w-[1.68rem]" />
          </button>
        </div> : null}
    </nav>;

}
