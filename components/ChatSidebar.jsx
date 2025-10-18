"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";

/* ---------- Utils ---------- */

function uuid() {
  const rnd =
    (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || null;
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
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/* ---------- Component ---------- */

export default function ChatSidebar() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const abortRef = useRef(null);
  const visibilityThrottleRef = useRef({ timer: null, last: 0 });

  // (soovi korral saab seda hiljem kasutada, hetkel pole otseselt tarvis)
  const activeConvId = useMemo(() => {
    try {
      return window.sessionStorage.getItem("sotsiaalai:chat:convId") || null;
    } catch {
      return null;
    }
  }, []);

  const fetchList = useCallback(async () => {
    setError("");
    // tühista eelmine
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setBusy(true);
    try {
      const r = await fetch("/api/chat/conversations", {
        cache: "no-store",
        signal: ac.signal,
      });
      const data = await r
        .json()
        .catch(() => ({ ok: false, conversations: [] }));
      if (!r.ok || !data?.ok) {
        throw new Error(data?.message || "Laadimine ebaõnnestus");
      }
      setItems(Array.isArray(data.conversations) ? data.conversations : []);
      if (data?.degraded) {
        setError(data.message || "Vestluste ajalugu ei ole praegu saadaval.");
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        setError(e?.message || "Laadimine ebaõnnestus");
      }
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setBusy(false);
    }
  }, []);

  const scheduleVisibilityRefresh = useCallback(() => {
    const state = visibilityThrottleRef.current;
    const now = Date.now();
    const wait = 2000;
    const remaining = wait - (now - state.last);

    const run = () => {
      state.last = Date.now();
      state.timer = null;
      fetchList();
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
  }, [fetchList]);

  // esmane laadimine + välised värskendused
  useEffect(() => {
    fetchList();

    const onExternalRefresh = () => fetchList();
    window.addEventListener(
      "sotsiaalai:refresh-conversations",
      onExternalRefresh,
    );

    // värskenda, kui tab aktsioonilt naaseb (throttlinguga)
    const handleVisibilityEvent = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState === "visible") {
        scheduleVisibilityRefresh();
      }
    };
    window.addEventListener("focus", handleVisibilityEvent);
    document.addEventListener("visibilitychange", handleVisibilityEvent);

    return () => {
      window.removeEventListener(
        "sotsiaalai:refresh-conversations",
        onExternalRefresh,
      );
      window.removeEventListener("focus", handleVisibilityEvent);
      document.removeEventListener("visibilitychange", handleVisibilityEvent);
      const { timer } = visibilityThrottleRef.current;
      if (timer) {
        clearTimeout(timer);
        visibilityThrottleRef.current.timer = null;
      }
      abortRef.current?.abort();
    };
  }, [fetchList, scheduleVisibilityRefresh]); // NB: mõlemad viited on stabiilsed

  const onPick = useCallback((id) => {
    try {
      window.sessionStorage.setItem("sotsiaalai:chat:convId", id);
    } catch {}
    window.dispatchEvent(
      new CustomEvent("sotsiaalai:switch-conversation", { detail: { convId: id } }),
    );
    window.dispatchEvent(
      new CustomEvent("sotsiaalai:toggle-conversations", {
        detail: { open: false },
      }),
    );
  }, []);

  const onNew = useCallback(
    async () => {
      if (busy || creating) return;
      setCreating(true);
      setError("");
      const id = uuid();
      try {
        const r = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, role: "CLIENT" }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.ok === false) {
          throw new Error(data?.message || "Uue vestluse loomine ebaõnnestus");
        }
        onPick(id);
        await fetchList();
      } catch (e) {
        setError(e?.message || "Uue vestluse loomine ebaõnnestus");
      } finally {
        setCreating(false);
      }
    },
    [busy, creating, fetchList, onPick],
  );

  const onDelete = useCallback(
    async (id) => {
      if (!id) return;
      if (!confirm("Kas kustutada see vestlus?")) return;
      setBusy(true);
      setError("");
      try {
        const r = await fetch(
          `/api/chat/conversations/${encodeURIComponent(id)}`,
          { method: "DELETE" },
        );
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.ok === false) {
          throw new Error(data?.message || "Kustutamine ebaõnnestus");
        }
        await fetchList();

        // kui kustutati aktiivne, tühjenda valik
        try {
          const current = window.sessionStorage.getItem("sotsiaalai:chat:convId");
          if (current === id) {
            window.sessionStorage.removeItem("sotsiaalai:chat:convId");
          }
        } catch {}
      } catch (e) {
        setError(e?.message || "Kustutamine ebaõnnestus");
      } finally {
        setBusy(false);
      }
    },
    [fetchList],
  );

  const safeDate = (v) => {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
    // 0 nihutab puuduva updatedAt-i lõppu
  };

  const sorted = useMemo(
    () => [...items].sort((a, b) => safeDate(b?.updatedAt) - safeDate(a?.updatedAt)),
    [items],
  );

  return (
    <nav
      className="cs-container"
      aria-label="Vestluste loend"
      aria-busy={busy || creating ? "true" : "false"}
    >
      {/* Ülariba: Uus vestlus + Refresh */}
      <div className="cs-actions">
        <button
          className="cs-btn cs-btn--primary"
          onClick={onNew}
          disabled={busy || creating}
          aria-busy={creating ? "true" : "false"}
        >
          {creating ? "Loon…" : "Uus vestlus"}
        </button>

        <button
          className="cs-refresh"
          onClick={fetchList}
          disabled={busy || creating}
          aria-label="Värskenda"
          title="Värskenda"
        >
          <svg
            className="cs-refresh-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="cs-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {(busy && items.length === 0) && (
        <ul className="cs-list" role="list" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={`s-${i}`} className="cs-item cs-item--skeleton">
              <div className="cs-skel-title" />
              <div className="cs-skel-time" />
            </li>
          ))}
        </ul>
      )}

      <ul className="cs-list" role="list" aria-live="polite">
        {!busy && sorted.length === 0 ? (
          <li className="cs-empty">
            Vestlusi pole.
            <button
              className="cs-btn cs-btn--primary"
              onClick={onNew}
              disabled={creating}
              style={{ marginLeft: 8 }}
            >
              Loo esimene
            </button>
          </li>
        ) : (
          sorted.map((c) => {
            const isActive = (() => {
              try {
                const current = window.sessionStorage.getItem("sotsiaalai:chat:convId");
                return current === c.id;
              } catch {
                return false;
              }
            })();

            return (
              <li
                key={c.id}
                className={`cs-item${isActive ? " cs-item--active" : ""}`}
                aria-selected={isActive ? "true" : "false"}
              >
                <button
                  className="cs-link"
                  onClick={() => onPick(c.id)}
                  title={c.preview || c.title || "Vestlus"}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div className="cs-title">
                    {c.title || c.preview || "Vestlus"}
                  </div>
                  <div className="cs-time">
                    {formatDateTime(c.updatedAt)}
                  </div>
                </button>

                <button
                  className="cs-delete"
                  onClick={() => onDelete(c.id)}
                  aria-label="Kustuta vestlus"
                  title="Kustuta"
                  disabled={busy || creating}
                >
                  <svg
                    className="cs-trash-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </nav>
  );
}
