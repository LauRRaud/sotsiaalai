"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
import { localizePath, stripLocaleFromPath } from "@/lib/localizePath";
import { buildRoomChatPath } from "@/lib/roomPath";
import BorderGlow from "@/components/ui/BorderGlow";
import Button from "@/components/ui/Button";
import GlowField, { fieldEdgeGlowStyle } from "@/components/ui/GlowField";
import ModalConfirm from "@/components/ui/ModalConfirm";
import {
  glassFormInputBaseClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageCardClassName,
} from "@/components/ui/glassPageStyles";
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
function clearStoredConversationRefs(ids) {
  if (typeof window === "undefined") return;
  const deletedIds = new Set((Array.isArray(ids) ? ids : [ids]).map(id => String(id || "").trim()).filter(Boolean));
  if (!deletedIds.size) return;
  try {
    const current = window.sessionStorage.getItem("sotsiaalai:chat:convId");
    if (deletedIds.has(current)) {
      window.sessionStorage.removeItem("sotsiaalai:chat:convId");
    }
    const keysToRemove = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (!key) continue;
      const value = window.sessionStorage.getItem(key);
      if (key.endsWith(":convId") && deletedIds.has(value)) {
        keysToRemove.push(key);
        continue;
      }
      for (const id of deletedIds) {
        if (key.endsWith(`:messages:${id}`)) {
          keysToRemove.push(key);
          break;
        }
      }
    }
    keysToRemove.forEach(key => window.sessionStorage.removeItem(key));
  } catch {}
}
function notifyDeletedConversations(ids) {
  if (typeof window === "undefined") return;
  const deletedIds = (Array.isArray(ids) ? ids : [ids]).map(id => String(id || "").trim()).filter(Boolean);
  if (!deletedIds.length) return;
  try {
    window.dispatchEvent(new CustomEvent("sotsiaalai:conversations-deleted", {
      detail: {
        ids: deletedIds
      }
    }));
  } catch {}
}
export default function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { effectiveRole, isAdmin } = useEffectiveRole();
  const [items, setItems] = useState([]);
  const [roomItems, setRoomItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [roomsBusy, setRoomsBusy] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState(() => String(searchParams?.get("roomId") || "").trim() ? "groups" : "conversations");
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const isActionBusy = busy || creating || bulkDeleting;
  const abortRef = useRef(null);
  const cursorRef = useRef(null);
  const roomsAbortRef = useRef(null);
  const visibilityThrottleRef = useRef({
    timer: null,
    last: 0
  });
  const {
    t,
    locale
  } = useI18n();
  const normalizedPathname = useMemo(() => stripLocaleFromPath(pathname || "/"), [pathname]);
  const resolveErrorMessage = useCallback((payload, fallbackKey) => resolveApiMessage({
    payload,
    t,
    fallbackKey,
    fallbackText: typeof t === "function" ? t(fallbackKey) : fallbackKey
  }), [t]);
  const pageSize = useMemo(() => {
    if (typeof window === "undefined") return 30;
    return window.innerWidth < 640 ? 15 : 30;
  }, []);
  const conversationRole = useMemo(() => {
    const normalized = String(effectiveRole || "CLIENT").toUpperCase().trim();
    if (normalized === "SOCIAL_WORKER" || normalized === "CLIENT") {
      return normalized;
    }
    return "CLIENT";
  }, [effectiveRole]);
  const conversationListRole = useMemo(() => (isAdmin ? "ALL" : conversationRole), [conversationRole, isAdmin]);
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
      params.set("role", conversationListRole);
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
        throw new Error(resolveErrorMessage(data, "chat.sidebar.error.load"));
      }
      const newItems = Array.isArray(data.conversations) ? data.conversations : [];
      setItems(prev => reset ? newItems : [...prev, ...newItems]);
      const nextCursor = data.nextCursor || null;
      cursorRef.current = nextCursor;
      setHasMore(Boolean(nextCursor));
      if (data?.degraded) {
        setError(resolveErrorMessage(data, "chat.sidebar.error.history"));
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        setError(e?.message || t("chat.sidebar.error.load"));
      }
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setBusy(false);
    }
  }, [conversationListRole, pageSize, resolveErrorMessage, t]);
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
        throw new Error(resolveErrorMessage(data, "rooms.error"));
      }
      const normalized = Array.isArray(data.rooms) ? data.rooms.map(room => ({
        id: room.id,
        title: room.title || t("chat.sidebar.room_fallback"),
        preview: room?.lastMessage?.content || "",
        lastActivityAt: room?.lastMessage?.createdAt || null,
        isHelpMatchRoom: room?.isHelpMatchRoom === true,
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
  }, [resolveErrorMessage, t]);
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
    const onDrawerToggle = (event) => {
      const explicitOpen = event?.detail?.open;
      if (explicitOpen === false) return;
      refreshAll();
    };
    window.addEventListener("sotsiaalai:refresh-conversations", onExternalRefresh);
    window.addEventListener("sotsiaalai:toggle-conversations", onDrawerToggle);
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
      window.removeEventListener("sotsiaalai:toggle-conversations", onDrawerToggle);
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
  useEffect(() => {
    if (activeView === "conversations") return;
    if (!selectMode) return;
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [activeView, selectMode]);
  useEffect(() => {
    if (activeView === "conversations") return;
    if (!searchQuery) return;
    setSearchQuery("");
  }, [activeView, searchQuery]);
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:conversation-drawer-title", {
        detail: {
          title: activeView === "conversations" ? t("chat.menu.label") : t("chat.sidebar.sections.groups")
        }
      }));
    } catch {}
  }, [activeView, t]);
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
  const updateChatUrl = useCallback((nextRoomId, options = {}) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "chat");
    if (nextRoomId) {
      url.searchParams.set("roomId", nextRoomId);
      if (options?.isHelpMatchRoom === true) {
        url.searchParams.set("roomKind", "help-match");
      } else {
        url.searchParams.delete("roomKind");
      }
    } else {
      url.searchParams.delete("roomId");
      url.searchParams.delete("roomKind");
    }
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
    if (normalizedPathname.startsWith("/vestlus") && searchParams?.get("roomId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("roomId");
      const qs = params.toString();
      router.replace(localizePath(qs ? `/vestlus?${qs}` : "/vestlus", locale));
    }
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", {
        detail: {
          open: false
        }
      }));
    } catch {}
  }, [locale, normalizedPathname, router, searchParams, selectMode]);
  const onPick = useCallback(item => {
    if (!item?.id) return;
    if (selectMode) return;
      if (item.kind === "room") {
        const roomChatPath = buildRoomChatPath(item.id, locale, {
          isHelpMatchRoom: item.isHelpMatchRoom === true
        });
        if (isEmbeddedChat) {
          updateChatUrl(String(item.id), {
            isHelpMatchRoom: item.isHelpMatchRoom === true
          });
        } else {
          router.push(roomChatPath);
        }
      window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", {
        detail: {
          open: false
        }
      }));
      return;
    }
    activateConversation(item.id);
  }, [activateConversation, isEmbeddedChat, locale, router, selectMode, updateChatUrl]);
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
          role: conversationRole
        })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) {
        throw new Error(resolveErrorMessage(data, "chat.sidebar.error.create"));
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
  }, [activateConversation, busy, conversationRole, creating, refreshAll, resolveErrorMessage, t]);

  useEffect(() => {
    const onCreateConversation = () => {
      void onNew();
    };
    window.addEventListener("sotsiaalai:create-conversation", onCreateConversation);
    return () => window.removeEventListener("sotsiaalai:create-conversation", onCreateConversation);
  }, [onNew]);

  const deleteConversationById = useCallback(async id => {
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) {
        throw new Error(resolveErrorMessage(data, "chat.sidebar.error.delete"));
      }
      clearStoredConversationRefs(id);
      notifyDeletedConversations(id);
      refreshAll();
    } catch (e) {
      setError(e?.message || t("chat.sidebar.error.delete"));
    } finally {
      setBusy(false);
    }
  }, [refreshAll, resolveErrorMessage, t]);
  const onDelete = useCallback(id => {
    if (!id || isActionBusy) return;
    setConfirmState({
      kind: "single",
      id
    });
  }, [isActionBusy]);
  const fetchAllConversationIds = useCallback(async () => {
    const ids = [];
    let nextCursor = null;
    let loops = 0;
    do {
      const params = new URLSearchParams({
        limit: "100"
      });
      params.set("role", conversationListRole);
      if (nextCursor) params.set("cursor", nextCursor);
      const r = await fetch(`/api/chat/conversations?${params.toString()}`, {
        cache: "no-store"
      });
      const data = await r.json().catch(() => ({
        ok: false,
        conversations: []
      }));
      if (!r.ok || !data?.ok) {
        throw new Error(resolveErrorMessage(data, "chat.sidebar.error.load"));
      }
      const list = Array.isArray(data.conversations) ? data.conversations : [];
      list.forEach(row => {
        if (row?.id) ids.push(row.id);
      });
      nextCursor = data.nextCursor || null;
      loops += 1;
    } while (nextCursor && loops < 50);
    return ids;
  }, [conversationListRole, resolveErrorMessage]);
  const deleteConversationIds = useCallback(async ids => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (!unique.length) return {
      deleted: 0,
      failed: 0,
      deletedIds: []
    };
    setBulkDeleting(true);
    setError("");
    const failures = [];
    const deletedIds = [];
    if (unique.length > 1) {
      try {
        const r = await fetch("/api/chat/conversations", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ids: unique
          })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.ok === false) {
          throw new Error(resolveErrorMessage(data, "chat.sidebar.error.delete"));
        }
        deletedIds.push(...unique);
      } catch (e) {
        unique.forEach(id => failures.push({
            id,
            error: e
          }));
      }
    } else {
      for (const id of unique) {
        try {
          const r = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}`, {
            method: "DELETE"
          });
          const data = await r.json().catch(() => ({}));
          if (!r.ok || data?.ok === false) {
            throw new Error(resolveErrorMessage(data, "chat.sidebar.error.delete"));
          }
          deletedIds.push(id);
        } catch (e) {
          failures.push({
            id,
            error: e
          });
        }
      }
    }
    if (failures.length) {
      setError(t("chat.sidebar.error.delete"));
    }
    clearStoredConversationRefs(deletedIds);
    notifyDeletedConversations(deletedIds);
    refreshAll();
    setBulkDeleting(false);
    return {
      deleted: unique.length - failures.length,
      failed: failures.length,
      deletedIds
    };
  }, [refreshAll, resolveErrorMessage, t]);
  const handleDeleteSelected = useCallback(() => {
    if (!selectedIds.size || isActionBusy) return;
    setConfirmState({
      kind: "selected",
      ids: Array.from(selectedIds)
    });
  }, [isActionBusy, selectedIds]);
  const handleDeleteAll = useCallback(() => {
    if (isActionBusy) return;
    setConfirmState({
      kind: "all"
    });
  }, [isActionBusy]);
  const performDelete = useCallback(async state => {
    if (!state) return;
    if (state.kind === "single") {
      await deleteConversationById(state.id);
      return;
    }
    if (state.kind === "selected") {
      const ids = Array.isArray(state.ids) ? state.ids : [];
      const result = await deleteConversationIds(ids);
      if (result.failed === 0) {
        setSelectedIds(new Set());
      }
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
  }, [deleteConversationById, deleteConversationIds, fetchAllConversationIds, t]);
  const handleConfirmDelete = useCallback(() => {
    if (!confirmState) return;
    const state = confirmState;
    setConfirmState(null);
    void performDelete(state);
  }, [confirmState, performDelete]);
  const handleConfirmCancel = useCallback(() => {
    setConfirmState(null);
  }, []);
  const confirmMessage = useMemo(() => {
    if (!confirmState) return "";
    if (confirmState.kind === "single") return t("chat.sidebar.confirm.delete");
    if (confirmState.kind === "selected") return t("chat.sidebar.confirm.delete_selected");
    return t("chat.sidebar.confirm.delete_all");
  }, [confirmState, t]);
  const activeRoomId = String(searchParams?.get("roomId") || "").trim();
  useEffect(() => {
    if (!activeRoomId) return;
    setActiveView("groups");
  }, [activeRoomId]);
  const safeDate = v => {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  };
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const sortedConversations = useMemo(() => [...items].map(item => ({
    ...item,
    kind: "conversation"
  })).sort((a, b) => safeDate(b?.lastActivityAt) - safeDate(a?.lastActivityAt)), [items]);
  const sortedRooms = useMemo(() => [...roomItems].sort((a, b) => safeDate(b?.lastActivityAt) - safeDate(a?.lastActivityAt)), [roomItems]);
  const isConversationView = activeView === "conversations";
  const filteredConversations = useMemo(() => {
    if (!normalizedSearchQuery) return sortedConversations;
    return sortedConversations.filter(item => {
      const haystack = [item?.title, item?.preview, item?.id].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(normalizedSearchQuery);
    });
  }, [normalizedSearchQuery, sortedConversations]);
  const hasConversationSearch = isConversationView && Boolean(normalizedSearchQuery);
  const currentItems = isConversationView ? filteredConversations : sortedRooms;
  const currentBusy = isConversationView ? busy : roomsBusy;
  const isLoading = busy || roomsBusy;
  const selectedCount = selectedIds.size;
  const messageCardShellClassName =
    "w-full overflow-visible px-[0.3rem] max-[768px]:px-[0.28rem] py-[0.02rem]";
  const messageCardClassNameCommon =
    `drawer-chat-card flex w-full flex-col gap-[0.38rem] rounded-[0.5rem] p-[0.58rem_0.7rem] max-[768px]:p-[0.62rem_0.72rem] ${glassSubpageCardClassName}`;
  const messageActiveVariant = "";
  const previewTextClassName =
    "text-[0.95rem] max-[768px]:text-[1rem] leading-[1.38] text-[color:var(--drawer-preview-text,var(--text-strong))]";
  const timeTextClassName =
    "text-[0.78rem] max-[768px]:text-[0.88rem] leading-[1.2] text-[color:var(--drawer-time-text,rgba(148,163,184,0.8))] [.theme-light_&]:text-[rgba(71,85,105,0.8)]";
  const deleteBtnClassName =
    "group inline-flex h-[1.86rem] w-[1.86rem] max-[768px]:h-[2rem] max-[768px]:w-[2rem] items-center justify-center rounded-[0.5rem] border-[1.4px] border-[color:var(--drawer-delete-border,rgba(148,163,184,0.42))] [background:var(--drawer-delete-bg,rgba(32,34,42,0.22))] p-0 text-[color:var(--drawer-delete-text,rgba(203,213,225,0.9))] shadow-[var(--drawer-delete-shadow,0_8px_20px_rgba(15,23,42,0.12))] supports-[backdrop-filter:blur(0px)]:backdrop-blur-[14px] transition-[border-color,background,color,box-shadow] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-[color:var(--drawer-delete-border-hover,rgba(255,120,120,0.72))] hover:[background:var(--drawer-delete-bg-hover,var(--drawer-delete-bg,rgba(48,16,20,0.5)))] hover:text-[color:var(--drawer-delete-text-hover,#ffe1e1)] hover:shadow-[var(--drawer-delete-shadow-hover,var(--drawer-delete-shadow,0_10px_22px_rgba(15,23,42,0.16)))] focus-visible:border-[color:var(--drawer-delete-border-hover,rgba(255,120,120,0.72))] focus-visible:[background:var(--drawer-delete-bg-hover,var(--drawer-delete-bg,rgba(48,16,20,0.5)))] focus-visible:text-[color:var(--drawer-delete-text-hover,#ffe1e1)] focus-visible:shadow-[var(--drawer-delete-shadow-hover,var(--drawer-delete-shadow,0_10px_22px_rgba(15,23,42,0.16)))] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55";
  const loadMoreBtnClassName =
    "inline-flex h-[1.8rem] w-[2rem] items-center justify-center border-0 bg-transparent p-0 text-[#c57171] light:text-[#7a3a38] " +
    "transition-[opacity,transform] duration-150 hover:-translate-y-[1px] hover:opacity-100 focus-visible:-translate-y-[1px] focus-visible:opacity-100 focus-visible:outline-none " +
    "disabled:cursor-not-allowed disabled:opacity-45";
  const sidebarTopPrimaryButtonClassName =
    "invite-primary-btn !min-h-[2.42rem] !px-[0.86rem] !py-[0.48rem] !text-[0.98rem] !tracking-[0.012rem] !whitespace-nowrap " +
    "max-[768px]:!min-h-[2.52rem] max-[768px]:!px-[0.92rem] max-[768px]:!py-[0.52rem] max-[768px]:!text-[1.02rem] " +
    glassPrimaryButtonToneClassName;
  const sidebarTopIconButtonClassName =
    "invite-primary-btn !min-h-[2.42rem] !px-[0.74rem] !py-[0.48rem] max-[768px]:!min-h-[2.52rem] max-[768px]:!px-[0.74rem] max-[768px]:!py-[0.52rem] " +
    glassPrimaryButtonToneClassName;
  const sidebarPrimaryButtonClassName =
    "drawer-pill-btn invite-primary-btn !min-h-[2.42rem] !px-[0.86rem] !py-[0.48rem] !text-[0.98rem] !tracking-[0.012rem] !whitespace-nowrap " +
    "max-[768px]:!min-h-[2.52rem] max-[768px]:!px-[0.92rem] max-[768px]:!py-[0.52rem] max-[768px]:!text-[1.02rem] " +
    glassPrimaryButtonToneClassName;
  const searchInputShellClassName = "relative";
  const searchInputClassName =
    `${glassFormInputBaseClassName} text-[1.28rem] tracking-[0.02em] placeholder:text-[1.12rem] placeholder:tracking-[0.02em] ` +
    "chat-sidebar-search-input duration-[720ms] max-[768px]:text-[1.34rem] max-[768px]:tracking-[0.024em] max-[768px]:placeholder:text-[1.2rem] max-[768px]:placeholder:tracking-[0.022em] max-[768px]:min-h-[3.2rem] max-[768px]:py-[0.84rem]";
  const sidebarContentWidthClassName = "w-full max-w-[20.6rem] max-[768px]:max-w-none mx-auto";
  const sidebarInsetWidthClassName = `${sidebarContentWidthClassName} px-[0.42rem] max-[768px]:px-[0.4rem]`;
  const listViewportClassName = "mt-[-0.18rem] max-[768px]:mt-[-0.28rem] flex min-h-0 flex-1 flex-col overflow-visible rounded-[1.1rem]";
  const listScrollFrameClassName = "relative flex min-h-0 flex-1 flex-col overflow-visible rounded-[1.1rem]";
  const listClassName =
    "drawer-chat-sidebar__list list-none m-0 flex min-h-0 flex-1 flex-col items-stretch gap-2 overflow-y-auto px-0 pt-[0.28rem] max-[768px]:pt-[0.22rem] pb-[1.12rem] max-[768px]:pb-[0.36rem] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 " +
    "before:content-[''] before:block before:h-[0.05rem] max-[768px]:before:h-[0.04rem] after:content-[''] after:block after:h-[0.62rem] max-[768px]:after:h-[0.16rem]";
  const emptyStateClassName =
    `mx-[0.42rem] max-[768px]:mx-[0.4rem] flex items-center gap-3 rounded-[1rem] px-3 py-4 text-[color:var(--drawer-preview-text,var(--text-strong))] ${glassSubpageCardClassName}`;
  const renderLoadingSkeleton = (prefix, count = 3) => Array.from({ length: count }).map((_, i) => <div key={`${prefix}-${i}`} className="flex flex-col gap-2 rounded-[0.85rem] border-0 bg-[rgba(255,255,255,0.02)] p-3">
        <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-[rgba(255,255,255,0.08)] via-[rgba(255,255,255,0.18)] to-[rgba(255,255,255,0.08)] animate-pulse" />
        <div className="h-2 w-1/3 rounded-full bg-gradient-to-r from-[rgba(255,255,255,0.08)] via-[rgba(255,255,255,0.18)] to-[rgba(255,255,255,0.08)] animate-pulse" />
      </div>);
  const renderListItem = item => {
    const isRoom = item.kind === "room";
    const titleText = item.title || item.preview || t("chat.sidebar.item.fallback_title");
    const isActive = (() => {
      if (isRoom) {
        return activeRoomId === String(item.id || "");
      }
      try {
        const current = window.sessionStorage.getItem("sotsiaalai:chat:convId");
        return current === item.id;
      } catch {
        return false;
      }
    })();
    return <li key={`${item.kind}:${item.id}`} className={messageCardShellClassName}>
        <BorderGlow
          as="div"
          className={`ui-glow-option-card-frame drawer-chat-card-glow ${messageCardClassNameCommon} ${isActive ? messageActiveVariant : ""}`}
          edgeSensitivity={22}
          glowColor="358 82 72"
          backgroundColor="var(--subpage-card-bg)"
          borderRadius={8}
          glowRadius={48}
          glowIntensity={0.98}
          coneSpread={20}
          fillOpacity={0}
          edgeOnly
          style={{
            ...fieldEdgeGlowStyle,
            "--border-radius": "0.5rem"
          }}
        >
          <div className="flex items-center gap-2.5">
            {selectMode && !isRoom ? <label className="flex h-6 w-6 max-[768px]:h-7 max-[768px]:w-7 items-center justify-center">
                <input type="checkbox" className="peer sr-only" checked={selectedIds.has(item.id)} onChange={() => toggleSelected(item.id)} disabled={isActionBusy} />
                <span aria-hidden="true" className="relative flex h-[20px] w-[20px] max-[768px]:h-[26px] max-[768px]:w-[26px] items-center justify-center rounded-[0.4rem] border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] text-[color:var(--seg-radio-dot-bg)] transition-[border-color,box-shadow,background] duration-150 ease-out peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] max-[768px]:h-[21px] max-[768px]:w-[21px] scale-90 opacity-0 transition-[opacity,transform] duration-150 ease-out" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 12.5l4 4 8-8" />
                  </svg>
                </span>
              </label> : null}
            <div className="cs-open flex min-w-0 w-full flex-1 flex-col gap-[0.22rem] bg-transparent p-0 text-left border-0 appearance-none cursor-pointer" onClick={() => selectMode ? null : onPick(item)} onKeyDown={event => {
            if (selectMode) return;
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            onPick(item);
          }} title={item.preview || item.title || t("chat.sidebar.item.fallback_title")} role="button" tabIndex={selectMode ? -1 : 0} aria-current={isActive ? "true" : undefined} aria-disabled={selectMode ? "true" : undefined}>
              <div className="flex items-start justify-start">
                <span className="cs-title-text text-[1rem] max-[768px]:text-[1.08rem] leading-[1.24] font-medium text-[color:var(--drawer-title-text,var(--brand-primary,#c57171))] [.theme-light_&]:text-[color:var(--title-color,#7a3a38)] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                  {titleText}
                </span>
              </div>
              {isRoom && item.preview ? <div className={`cs-preview ${previewTextClassName}`}>
                  {item.preview}
                </div> : null}
              <div className="flex items-center gap-3">
                <div className={`cs-time shrink-0 ${timeTextClassName}`}>
                  {formatDateTime(item.lastActivityAt)}
                </div>
              </div>
            </div>
            {!isRoom && !selectMode ? <button type="button" className={`${deleteBtnClassName} cs-delete shrink-0`} onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              onDelete(item.id);
            }} aria-label={t("chat.sidebar.item.delete")} title={t("chat.sidebar.item.delete_title")} disabled={isActionBusy}>
                <svg className="cs-trash-icon h-[1.05rem] w-[1.05rem] max-[768px]:h-[1.14rem] max-[768px]:w-[1.14rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.82" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    </svg>
              </button> : null}
          </div>
        </BorderGlow>
      </li>;
  };
  return <>
    <nav className="drawer-chat-sidebar flex h-full flex-1 flex-col items-center gap-[0.62rem] px-[0.15rem] max-[768px]:px-[0.1rem] pb-[0.4rem] pt-[0.42rem] max-[768px]:pt-[0.54rem] text-[color:var(--pt-100)] light:text-[#1f2937]" aria-label={t("chat.sidebar.aria_list")} aria-busy={isLoading || creating ? "true" : "false"}>
      <div className={`${sidebarContentWidthClassName} flex flex-wrap items-center justify-center gap-[0.45rem] max-[768px]:gap-[0.5rem]`}>
        {isConversationView ? <Button variant="primary" size="md" className={sidebarTopPrimaryButtonClassName} onClick={onNew} disabled={busy || creating} aria-busy={creating ? "true" : "false"}>
            {creating ? t("chat.sidebar.button.creating") : <>
                <span>{t("chat.sidebar.button.new_short")}</span>
              </>}
          </Button> : null}
        {isConversationView ? <Button variant="primary" size="md" className={sidebarTopPrimaryButtonClassName} onClick={toggleSelectMode} disabled={isActionBusy}>
            {selectMode ? <>
                <span className="max-[416px]:hidden">{t("chat.sidebar.selection.cancel")}</span>
                <span className="hidden max-[416px]:inline">{t("chat.sidebar.selection.cancel_short")}</span>
              </> : <>
                <span className="max-[416px]:hidden">{t("chat.sidebar.selection.select")}</span>
                <span className="hidden max-[416px]:inline">{t("chat.sidebar.selection.select_short")}</span>
              </>}
        </Button> : null}
        <Button variant="primary" size="md" onClick={refreshAll} disabled={isLoading || creating} aria-label={t("chat.sidebar.button.refresh")} title={t("chat.sidebar.button.refresh")} className={sidebarTopIconButtonClassName}>
          <svg className="h-[1.08rem] w-[1.08rem] max-[768px]:h-[1.18rem] max-[768px]:w-[1.18rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 15-6.2" />
            <polyline points="18 3 18 9 12 9" />
            <path d="M21 12a9 9 0 0 1-15 6.2" />
            <polyline points="6 21 6 15 12 15" />
          </svg>
        </Button>
        <Button variant="primary" size="md" className={sidebarTopPrimaryButtonClassName} onClick={() => setActiveView(prev => prev === "conversations" ? "groups" : "conversations")} disabled={isLoading}>
          {isConversationView ? t("chat.sidebar.sections.groups") : t("chat.sidebar.sections.conversations")}
        </Button>
      </div>
      {isConversationView ? <div className={`${sidebarInsetWidthClassName} mt-[0.16rem] max-[768px]:mt-[0.22rem]`}>
          <div className={searchInputShellClassName}>
            <GlowField className="chat-sidebar-search-glow w-full">
              <input id="chat-sidebar-search" name="chat-sidebar-search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder={t("chat.sidebar.search.placeholder", "Otsi vestlusi...")} aria-label={t("chat.sidebar.search.label", "Otsi vestlusi")} className={`${searchInputClassName} ui-glow-control`} />
            </GlowField>
          </div>
        </div> : null}
      {selectMode && isConversationView ? <div className={`${sidebarContentWidthClassName} flex items-center justify-center gap-2 max-[768px]:gap-[0.58rem]`}>
          <Button variant="primary" size="md" className={sidebarPrimaryButtonClassName} onClick={handleDeleteSelected} disabled={!selectedCount || isActionBusy}>
            <span className="max-[416px]:hidden">{t("chat.sidebar.selection.delete_selected")}</span>
            <span className="hidden max-[416px]:inline">{t("chat.sidebar.selection.delete_selected_short")}</span>
          </Button>
          <Button variant="primary" size="md" className={sidebarPrimaryButtonClassName} onClick={handleDeleteAll} disabled={isActionBusy}>
            <span className="max-[416px]:hidden">{t("chat.sidebar.selection.delete_all")}</span>
            <span className="hidden max-[416px]:inline">{t("chat.sidebar.selection.delete_all_short")}</span>
          </Button>
        </div> : null}
      {error ? <div className={`${sidebarContentWidthClassName} rounded-[0.85rem] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-3 py-2 text-sm text-[#ff9c9c] light:border-[rgba(231,76,60,0.4)] light:bg-[rgba(255,255,255,0.75)] light:text-[#7a2323]`} role="alert" aria-live="assertive">
          {error}
        </div> : null}
      <div className={`${sidebarContentWidthClassName} flex min-h-0 w-full flex-1 flex-col`}>
        <div className={listViewportClassName} aria-label={isConversationView ? t("chat.sidebar.sections.conversations") : t("chat.sidebar.sections.groups")}>
          <div className={listScrollFrameClassName}>
            {currentBusy && currentItems.length === 0 ? <div className={`${listClassName} py-2`}>
                {renderLoadingSkeleton(isConversationView ? "conv" : "room", isConversationView ? 3 : 2)}
              </div> : <ul className={listClassName}>
                {!currentBusy && currentItems.length === 0 ? <li className={emptyStateClassName}>
                    <span>{hasConversationSearch ? t("chat.sidebar.search.no_matches", "Otsingule vastavaid vestlusi ei leitud.") : isConversationView ? t("chat.sidebar.empty") : t("rooms.empty")}</span>
                  </li> : currentItems.map(renderListItem)}
              </ul>}
          </div>
          {isConversationView && hasMore ? <div className="flex w-full justify-center pt-[0.5rem]">
              <button type="button" className={loadMoreBtnClassName} onClick={fetchMore} disabled={busy || creating} aria-label={t("chat.sidebar.button.more")} title={t("chat.sidebar.button.more")}>
                <ChevronIcon direction="down" className="h-[1rem] w-[1.68rem]" />
              </button>
            </div> : null}
        </div>
      </div>
    </nav>
    {confirmState ? <ModalConfirm
      message={confirmMessage}
      confirmLabel={t("buttons.delete")}
      cancelLabel={t("buttons.cancel")}
      confirmVariant="danger"
      cancelVariant="primary"
      onConfirm={handleConfirmDelete}
      onCancel={handleConfirmCancel}
      overlayClassName="!z-[140] !bg-transparent !backdrop-blur-0 !backdrop-saturate-100"
      contentClassName="chat-analysis-upload-modal-card !w-[min(100%,20.5rem)] !max-w-[20.5rem]"
    /> : null}
  </>;

}
