"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";

function uuid() {
  return (
    (typeof window !== "undefined" && window.crypto?.randomUUID?.()) ||
    `conv-${Date.now()}`
  );
}

export default function ChatSidebar() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const fetchList = useCallback(async () => {
    setError("");
    abortRef.current?.abort();                         // tühista eelmine
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const r = await fetch("/api/chat/conversations", {
        cache: "no-store",
        signal: ac.signal,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) {
        throw new Error(data?.message || "Laadimine ebaõnnestus");
      }
      setItems(Array.isArray(data.conversations) ? data.conversations : []);
    } catch (e) {
      if (e?.name !== "AbortError") {
        setError(e?.message || "Laadimine ebaõnnestus");
      }
    }
  }, []);

  useEffect(() => {
    fetchList();
    // võimalda teistelt komponentidelt värskendada
    const onExternalRefresh = () => fetchList();
    window.addEventListener("sotsiaalai:refresh-conversations", onExternalRefresh);
    return () => {
      window.removeEventListener("sotsiaalai:refresh-conversations", onExternalRefresh);
      abortRef.current?.abort();
    };
  }, [fetchList]);

  const onPick = useCallback((id) => {
    window.dispatchEvent(
      new CustomEvent("sotsiaalai:switch-conversation", { detail: { convId: id } })
    );
    window.dispatchEvent(
      new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: false } })
    );
  }, []);

  const onNew = useCallback(async () => {
    if (busy) return;
    setBusy(true);
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
      fetchList();
    } catch (e) {
      setError(e?.message || "Uue vestluse loomine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, [busy, fetchList, onPick]);

  const onDelete = useCallback(
    async (id) => {
      if (!id) return;
      if (!confirm("Kas kustutada see vestlus?")) return;
      setBusy(true);
      setError("");
      try {
        const r = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.ok === false) {
          throw new Error(data?.message || "Kustutamine ebaõnnestus");
        }
        await fetchList();
      } catch (e) {
        setError(e?.message || "Kustutamine ebaõnnestus");
      } finally {
        setBusy(false);
      }
    },
    [fetchList]
  );

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [items]
  );

  return (
    <nav className="cs-container" aria-label="Vestluste loend" aria-busy={busy ? "true" : "false"}>
      {/* Ülariba: Uus vestlus + Refresh */}
      <div className="cs-actions">
        <button
          className="cs-btn cs-btn--primary"
          onClick={onNew}
          disabled={busy}
        >
          Uus vestlus
        </button>

        <button
          className="cs-refresh"
          onClick={fetchList}
          disabled={busy}
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

      <ul className="cs-list" role="list" aria-live="polite">
        {sorted.length === 0 ? (
          <li className="cs-empty">
            Vestlusi pole.{" "}
            <button
              className="cs-btn cs-btn--primary"
              onClick={onNew}
              disabled={busy}
              style={{ marginLeft: 8 }}
            >
              Loo esimene
            </button>
          </li>
        ) : (
          sorted.map((c) => (
            <li key={c.id} className="cs-item">
              <button
                className="cs-link"
                onClick={() => onPick(c.id)}
                title={c.preview || c.title || "Vestlus"}
              >
                <div className="cs-title">{c.title || "Vestlus"}</div>
                <div className="cs-time">
                  {new Date(c.updatedAt).toLocaleString()}
                </div>
              </button>

              <button
                className="cs-delete"
                onClick={() => onDelete(c.id)}
                aria-label="Kustuta vestlus"
                title="Kustuta"
                disabled={busy}
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
          ))
        )}
      </ul>
    </nav>
  );
}
