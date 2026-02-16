"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function toMillis(value) {
  const ms = new Date(value || 0).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function compareRoomMessagesAsc(a, b) {
  const ta = toMillis(a?.createdAt);
  const tb = toMillis(b?.createdAt);
  if (ta !== tb) return ta - tb;
  return String(a?.id || "").localeCompare(String(b?.id || ""));
}

function mergeById(prev, incoming) {
  const map = new Map();
  (Array.isArray(prev) ? prev : []).forEach(msg => {
    if (!msg?.id) return;
    map.set(msg.id, msg);
  });
  (Array.isArray(incoming) ? incoming : []).forEach(msg => {
    if (!msg?.id) return;
    const existing = map.get(msg.id);
    map.set(msg.id, existing ? {
      ...existing,
      ...msg
    } : msg);
  });
  return Array.from(map.values()).sort(compareRoomMessagesAsc);
}

export function useRoomMessages(roomId, pollMs = 3000) {
  const [messages, setMessages] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [useSse, setUseSse] = useState(false);
  const cursorRef = useRef(null);
  const timerRef = useRef(null);
  const esRef = useRef(null);
  const retryRef = useRef(2000);
  const reconnectTimerRef = useRef(null);
  const lastReadMarkAtRef = useRef(0);
  const markRead = useCallback(async (force = false) => {
    if (!roomId || blocked || authRequired) return;
    const now = Date.now();
    if (!force && now - lastReadMarkAtRef.current < 5000) return;
    lastReadMarkAtRef.current = now;
    try {
      await fetch(`/api/rooms/${roomId}/read`, {
        method: "PUT"
      });
    } catch {}
  }, [roomId, blocked, authRequired]);
  const load = useCallback(async (reset = false) => {
    if (!roomId) return;
    const url = new URL(`/api/rooms/${roomId}/messages`, window.location.origin);
    if (!reset && useSse && cursorRef.current) {
      url.searchParams.set("cursor", cursorRef.current);
    }
    const res = await fetch(url.toString());
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      setAuthRequired(true);
      setBlocked(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (res.status === 403) {
      setBlocked(true);
      setAuthRequired(false);
      return;
    }
    if (!res.ok || data?.ok === false) return;
    setAuthRequired(false);
    setBlocked(false);
    const items = Array.isArray(data.messages) ? data.messages.slice().reverse() : [];
    if (reset) {
      setMessages(items);
      cursorRef.current = data.nextCursor || null;
      void markRead(true);
      return;
    }
    setMessages(prev => mergeById(prev, items));
    void markRead(false);
  }, [roomId, useSse, markRead]);
  const connectSse = useCallback(() => {
    if (!roomId || blocked || authRequired) return;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (esRef.current) esRef.current.close();
    const es = new EventSource(`/api/rooms/${roomId}/messages/stream`);
    esRef.current = es;
    es.onopen = () => {
      setUseSse(true);
      retryRef.current = 2000;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    es.onerror = () => {
      setUseSse(false);
      if (!timerRef.current) {
        timerRef.current = setInterval(() => load(false), pollMs);
      }
      es.close();
      esRef.current = null;
      const delay = Math.min(30000, retryRef.current);
      retryRef.current = Math.min(30000, retryRef.current * 2);
      if (!blocked && !authRequired) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connectSse();
        }, delay);
      }
    };
    es.onmessage = ev => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "message" && data.message) {
          setMessages(prev => mergeById(prev, [data.message]));
          void markRead(false);
        } else if (data.type === "delete" && data.id) {
          setMessages(prev => prev.filter(m => m.id !== data.id));
        }
      } catch {}
    };
  }, [roomId, blocked, authRequired, load, pollMs, markRead]);
  useEffect(() => {
    lastReadMarkAtRef.current = 0;
  }, [roomId]);
  useEffect(() => {
    let cancelled = false;
    async function loadRoomTitle() {
      if (!roomId) {
        setRoomTitle("");
        return;
      }
      try {
        const res = await fetch(`/api/rooms/${roomId}/members`, {
          cache: "no-store"
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && data?.ok) {
          setRoomTitle(String(data.roomTitle || ""));
        }
      } catch {}
    }
    loadRoomTitle();
    load(true);
    timerRef.current = setInterval(() => load(false), pollMs);
    connectSse();
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (esRef.current) esRef.current.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [roomId, pollMs, load, connectSse]);
  return {
    messages,
    blocked,
    authRequired,
    roomTitle,
    reload: () => load(true),
    setMessages,
    useSse
  };
}
