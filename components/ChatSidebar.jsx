"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
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
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const abortRef = useRef(null);
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
      setCursor(null);
      setHasMore(false);
    }
    setBusy(true);
    try {
      const params = new URLSearchParams({
        limit: String(pageSize)
      });
      if (!reset && cursor) {
        params.set("cursor", cursor);
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
      setCursor(data.nextCursor || null);
      setHasMore(Boolean(data.nextCursor));
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
  }, [cursor, pageSize, t]);
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
        title: room.title || t("chat.sidebar.room_fallback", "Vestlusruum"),
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
    try {
      window.sessionStorage.setItem("sotsiaalai:chat:convId", item.id);
    } catch {}
    window.dispatchEvent(new CustomEvent("sotsiaalai:switch-conversation", {
      detail: {
        convId: item.id
      }
    }));
    window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", {
      detail: {
        open: false
      }
    }));
  }, [isEmbeddedChat, router, selectMode, updateChatUrl]);
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
      onPick(nextId);
      refreshAll();
    } catch (e) {
      setError(e?.message || t("chat.sidebar.error.create"));
    } finally {
      setCreating(false);
    }
  }, [busy, creating, refreshAll, onPick, t]);
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
      setError(t("chat.sidebar.error.delete", "Kustutamine ebaõnnestus."));
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
    if (!confirm(t("chat.sidebar.confirm.delete_selected", "Kustutada valitud vestlused?"))) {
      return;
    }
    const ids = Array.from(selectedIds);
    const result = await deleteConversationIds(ids);
    if (result.failed === 0) {
      setSelectedIds(new Set());
    }
  }, [deleteConversationIds, selectedIds, t]);
  const handleDeleteAll = useCallback(async () => {
    if (!confirm(t("chat.sidebar.confirm.delete_all", "Kustutada kõik vestlused?"))) {
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
  return <nav className="cs-container" aria-label={t("chat.sidebar.aria_list")} aria-busy={isLoading || creating ? "true" : "false"}>
      {}
      <div className="cs-actions">
        <Button variant="primary" size="sm" onClick={onNew} disabled={busy || creating} aria-busy={creating ? "true" : "false"}>
          {creating ? t("chat.sidebar.button.creating") : t("chat.sidebar.button.new")}
        </Button>
        <Button variant="primary" size="sm" onClick={toggleSelectMode} disabled={isActionBusy}>
          {selectMode ? t("chat.sidebar.selection.cancel", "Tühista") : t("chat.sidebar.selection.select", "Vali")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="h-[2.25rem] w-[2.25rem] rounded-full p-0"
          onClick={refreshAll}
          disabled={isLoading || creating}
          aria-label={t("chat.sidebar.button.refresh")}
          title={t("chat.sidebar.button.refresh")}
        >
          <svg className="cs-refresh-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </Button>
      </div>
      <div className="cs-actions-secondary">
        {selectMode ? <>
            <span className="cs-selection-count">
              {t("chat.sidebar.selection.count", "Valitud")}: {selectedCount}
            </span>
            <Button variant="danger" size="sm" onClick={handleDeleteSelected} disabled={!selectedCount || isActionBusy}>
              {t("chat.sidebar.selection.delete_selected", "Kustuta valitud")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteAll} disabled={isActionBusy}>
              {t("chat.sidebar.selection.delete_all", "Kustuta kõik")}
            </Button>
          </> : null}
      </div>
      {error && <div className="cs-error" role="alert" aria-live="assertive">
          {error}
        </div>}
      {isLoading && combinedItems.length === 0 && <ul className="cs-list" role="list" aria-hidden="true">
          {Array.from({
        length: 4
      }).map((_, i) => <li key={`s-${i}`} className="cs-item cs-item--skeleton">
              <div className="cs-skel-title" />
              <div className="cs-skel-time" />
            </li>)}
        </ul>}
      <ul className="cs-list" role="list" aria-live="polite">
        {!isLoading && sorted.length === 0 ? <li className="cs-empty">
            {t("chat.sidebar.empty")}
            <Button variant="primary" size="sm" onClick={onNew} disabled={creating} style={{
          marginLeft: 8
        }}>
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
        return <li key={`${c.kind}:${c.id}`} className={`cs-item${isActive ? " cs-item--active" : ""}`}>
                {selectMode && c.kind !== "room" ? <label className="cs-select" aria-label={t("chat.sidebar.selection.item", "Vali vestlus")}>
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelected(c.id)} disabled={isActionBusy} />
                    <span className="cs-select-box" aria-hidden="true" />
                  </label> : null}
                <button className={`cs-link${selectMode ? " cs-link--disabled" : ""}`} onClick={() => selectMode ? null : onPick(c)} title={c.preview || c.title || "Vestlus"} aria-current={isActive ? "true" : undefined} aria-disabled={selectMode ? "true" : undefined}>
                  <div className="cs-title">
                    <span className="cs-title-text">
                      {c.title || c.preview || t("chat.sidebar.item.fallback_title")}
                    </span>
                    {c.kind === "room" ? <span className="cs-title-badge">
                        {t("chat.sidebar.group_badge", "Grupivestlus")}
                      </span> : null}
                  </div>
                  {c.preview ? <div className="cs-preview">{c.preview}</div> : null}
                  <div className="cs-time">
                    {formatDateTime(c.lastActivityAt)}
                  </div>
                </button>
                {c.kind !== "room" && !selectMode ? <button className="cs-delete" onClick={() => onDelete(c.id)} aria-label={t("chat.sidebar.item.delete")} title={t("chat.sidebar.item.delete_title")} disabled={isActionBusy}>
                    <svg className="cs-trash-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button> : null}
              </li>;
      })}
      </ul>
      {hasMore && <div>
          <Button variant="primary" size="sm" onClick={fetchMore} disabled={busy || creating}>
            {t("chat.sidebar.button.more", "Lae veel")}
          </Button>
        </div>}
    </nav>;
}
