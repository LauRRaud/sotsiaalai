"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useRoomMessages(roomId, pollMs = 3000) {
  const [messages, setMessages] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [useSse, setUseSse] = useState(false);
  const cursorRef = useRef(null);
  const timerRef = useRef(null);
  const esRef = useRef(null);
  const retryRef = useRef(2000);

  const load = useCallback(
    async (reset = false) => {
      if (!roomId) return;
      const url = new URL(`/api/rooms/${roomId}/messages`, window.location.origin);
      if (!reset && cursorRef.current) url.searchParams.set("cursor", cursorRef.current);
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
      const items = data.messages || [];
      if (reset) setMessages(items.reverse());
      else setMessages((prev) => [...items.reverse(), ...prev]);
      cursorRef.current = data.nextCursor || null;
    },
    [roomId],
  );

  const connectSse = useCallback(() => {
    if (!roomId || blocked || authRequired) return;
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
        setTimeout(() => connectSse(), delay);
      }
    };
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "message" && data.message) {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "delete" && data.id) {
          setMessages((prev) => prev.filter((m) => m.id !== data.id));
        }
      } catch {}
    };
  }, [roomId, blocked, authRequired, load, pollMs]);

  useEffect(() => {
    load(true);
    timerRef.current = setInterval(() => load(false), pollMs);
    connectSse();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (esRef.current) esRef.current.close();
    };
  }, [roomId, pollMs, load, connectSse]);

  return {
    messages,
    blocked,
    authRequired,
    reload: () => load(true),
    setMessages,
    useSse,
  };
}
