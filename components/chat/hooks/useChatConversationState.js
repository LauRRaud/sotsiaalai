import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_HISTORY = 8;
const GLOBAL_CONV_KEY = "sotsiaalai:chat:convId";

/* ---------- Brauseri pƒ?tƒ¦?Ž©sivus (sessionStorage) ---------- */
function makeChatStorage(key = "sotsiaalai:chat:v1") {
  const storage = typeof window !== "undefined" ? window.sessionStorage : null;
  function load() {
    if (!storage) return null;
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.messages) ? parsed.messages : null;
    } catch {
      return null;
    }
  }
  function save(messages) {
    if (!storage) return;
    try {
      const maxMsgs = 30;
      const maxChars = 10000;
      let total = 0;
      const trimmed = messages.slice(-maxMsgs).map((m) => {
        const t = String(m.text || "");
        if (total >= maxChars) return { ...m, text: "" };
        const room = maxChars - total;
        const cut = t.length > room ? t.slice(0, room) : t;
        total += cut.length;
        return { ...m, text: cut };
      });
      storage.setItem(key, JSON.stringify({ messages: trimmed }));
    } catch {}
  }
  function clear() {
    storage?.removeItem(key);
  }
  return { load, save, clear };
}

/* ---------- Throttle ---------- */
function throttle(fn, waitMs) {
  let last = 0;
  let timer = null;
  return (...args) => {
    const now = Date.now();
    const remaining = waitMs - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(...args);
      return;
    }
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      last = Date.now();
      fn(...args);
    }, remaining);
  };
}

export function useChatConversationState({
  isRoomMode,
  roomId: _roomId,
  isGenerating,
  setErrorBanner: _setErrorBanner,
  setIsCrisis,
  t: _t,
  locale,
  userId,
  userRole,
  normalizeSources,
  getVisibleMessages,
}) {
  const storageKey = useMemo(() => {
    const uid = userId || "anon";
    const loc = locale || "et";
    return `sotsiaalai:chat:${uid}:${(userRole || "CLIENT").toLowerCase()}:${loc}:v1`;
  }, [userId, userRole, locale]);

  const chatStore = useMemo(() => makeChatStorage(storageKey), [storageKey]);

  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);

  const mountedRef = useRef(false);
  const messageIdRef = useRef(1);
  const messagesRef = useRef(messages);
  const convIdRef = useRef(convId);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    convIdRef.current = convId;
  }, [convId]);

  useEffect(() => {
    mountedRef.current = true;

    // Lae pƒ?tƒ¦?Ž©sivus ja eemalda tƒ?tƒ¦?Ž©hjad tekstid
    const stored = chatStore.load();
    if (stored && stored.length) {
      let nextId = 1;
      const hydrated = stored
        .filter((m) => typeof m?.text === "string" && m.text.trim().length > 0)
        .map((m) => ({ ...m, id: nextId++ }));
      messageIdRef.current = nextId;
      setMessages(hydrated);
    }

    const idFromGlobal =
      typeof window !== "undefined" ? window.sessionStorage.getItem(GLOBAL_CONV_KEY) : null;
    const idFromPerUser =
      typeof window !== "undefined" ? window.sessionStorage.getItem(`${storageKey}:convId`) : null;
    const initialConvId =
      idFromGlobal ||
      idFromPerUser ||
      (typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : String(Date.now()));
    setConvId(initialConvId);
    if (typeof window !== "undefined") {
      if (!idFromGlobal) window.sessionStorage.setItem(GLOBAL_CONV_KEY, initialConvId);
      if (!idFromPerUser) window.sessionStorage.setItem(`${storageKey}:convId`, initialConvId);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [chatStore, storageKey]);

  useEffect(() => {
    if (!convId) return;
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(GLOBAL_CONV_KEY, convId);
      window.sessionStorage.setItem(`${storageKey}:convId`, convId);
    } catch {}
  }, [convId, storageKey]);

  const appendMessage = useCallback((msg) => {
    const id = messageIdRef.current++;
    const createdAt = msg?.createdAt || Date.now();
    setMessages((prev) => [...prev, { ...msg, id, createdAt }]);
    return id;
  }, []);

  const saveMessages = useCallback(
    (nextMessages) => {
      try {
        chatStore.save(nextMessages);
      } catch {}
    },
    [chatStore]
  );

  const mutateMessage = useCallback((id, updater) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx === -1) return prev;
      const current = prev[idx];
      const updated = updater(current);
      if (!updated || updated === current) return prev;
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, []);

  const visibleForHistory = useMemo(() => {
    if (typeof getVisibleMessages === "function") {
      return getVisibleMessages(messages);
    }
    return messages;
  }, [getVisibleMessages, messages]);

  const historyPayload = useMemo(() => {
    const recent = visibleForHistory.slice(-MAX_HISTORY);
    const relevant = isRoomMode
      ? recent.filter((m) => m.role === "ai" || m.aiVisible)
      : recent;
    return relevant.map((m) => ({
      role: m.role === "member" ? "user" : m.role,
      text: m.text,
    }));
  }, [visibleForHistory, isRoomMode]);

  const saveTimerRef = useRef(null);
  const saveIdleRef = useRef(null);

  useEffect(() => {
    if (!mountedRef.current) return;

    // Streaming'u ajal v?hem agressiivne (v?hem sessionStorage write'e)
    const delay = isGenerating ? 1500 : 250;

    // cleanup eelmisest
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (
      saveIdleRef.current &&
      typeof window !== "undefined" &&
      typeof window.cancelIdleCallback === "function"
    ) {
      window.cancelIdleCallback(saveIdleRef.current);
      saveIdleRef.current = null;
    }

    const runSave = () => {
      try {
        chatStore.save(messagesRef.current);
      } catch {}
    };

    // esmalt debounce (delay), siis tee save idle ajal kui v?imalik
    saveTimerRef.current = setTimeout(() => {
      if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
        saveIdleRef.current = window.requestIdleCallback(
          () => {
            saveIdleRef.current = null;
            runSave();
          },
          { timeout: 1000 },
        );
      } else {
        runSave();
      }
    }, delay);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (
        saveIdleRef.current &&
        typeof window !== "undefined" &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(saveIdleRef.current);
        saveIdleRef.current = null;
      }
    };
  }, [chatStore, isGenerating, messages]);

  const hydrateFromServer = useCallback(
    async (cancelledRef) => {
      const id = convIdRef.current;
      if (!id) return;
      try {
        const r = await fetch(`/api/chat/run?convId=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const data = await r.json();
        if (!data?.ok) return;
        if (cancelledRef?.current) return;

        const currentGlobalId =
          typeof window !== "undefined" ? window.sessionStorage.getItem(GLOBAL_CONV_KEY) : id;
        if (id !== currentGlobalId) return;

        const serverText = String(data.text || "");
        const serverTextTrim = serverText.trim();
        const serverSources =
          typeof normalizeSources === "function" ? normalizeSources(data.sources ?? []) : [];
        const serverCrisis = !!data.isCrisis;
        const serverMessages = Array.isArray(data.messages) ? data.messages : [];

        setIsCrisis?.(serverCrisis);

        if (serverMessages.length) {
          setMessages(() => {
            let nextId = 1;
            const mapped = serverMessages
              .map((msg) => {
                const normalizedRole =
                  msg.role === "user" ? "user" : msg.role === "ai" ? "ai" : null;
                if (!normalizedRole) return null;
                return {
                  id: nextId++,
                  role: normalizedRole,
                  text: typeof msg.text === "string" ? msg.text : "",
                  sources:
                    normalizedRole === "ai"
                      ? typeof normalizeSources === "function"
                        ? normalizeSources(msg.sources ?? [])
                        : undefined
                      : undefined,
                  isStreaming: false,
                };
              })
              .filter(Boolean);
            messageIdRef.current = nextId;
            return mapped;
          });
          return;
        }

        if (!serverTextTrim) return;

        setMessages((prev) => {
          const next = [...prev];
          let aiIdx = -1;
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "ai") {
              aiIdx = i;
              break;
            }
          }
          if (aiIdx === -1) {
            next.push({
              id: (next.at(-1)?.id ?? 0) + 1,
              role: "ai",
              text: serverTextTrim,
              sources: serverSources,
              isStreaming: false,
            });
          } else {
            const cur = next[aiIdx];
            if (serverTextTrim.length > (cur.text || "").length) {
              next[aiIdx] = {
                ...cur,
                text: serverTextTrim,
                sources: serverSources,
                isStreaming: false,
              };
            }
          }
          return next;
        });
      } catch {}
    },
    [normalizeSources, setIsCrisis]
  );

  useEffect(() => {
    if (!convId) return;
    const cancelledRef = { current: false };
    hydrateFromServer(cancelledRef);
    const throttled = throttle(() => {
      if (document.visibilityState === "visible") hydrateFromServer(cancelledRef);
    }, 2500);
    window.addEventListener("focus", throttled);
    document.addEventListener("visibilitychange", throttled);
    return () => {
      cancelledRef.current = true;
      window.removeEventListener("focus", throttled);
      document.removeEventListener("visibilitychange", throttled);
    };
  }, [convId, hydrateFromServer]);

  return {
    convId,
    setConvId,
    messages,
    setMessages,
    saveMessages,
    appendMessage,
    mutateMessage,
    historyPayload,
    hydrateFromServer,
  };
}
