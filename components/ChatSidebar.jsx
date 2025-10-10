"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

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

  const fetchList = useCallback(async () => {
    setError("");
    try {
      const r = await fetch("/api/chat/conversations", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok || !data?.ok)
        throw new Error(data?.message || "Laadimine ebaõnnestus");
      setItems(Array.isArray(data.conversations) ? data.conversations : []);
    } catch (e) {
      setError(e?.message || "Laadimine ebaõnnestus");
    }
  }, []);

  useEffect(() => {
    fetchList();
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
    setBusy(true);
    setError("");
    const id = uuid();
    try {
      await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: "CLIENT" }),
      });
      onPick(id);
      fetchList();
    } catch (e) {
      setError(e?.message || "Uue vestluse loomine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, [fetchList, onPick]);

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
        if (!r.ok || data?.ok === false)
          throw new Error(data?.message || "Kustutamine ebaõnnestus");
        await fetchList();
      } catch (e) {
        setError(e?.message || "Kustutamine ebaõnnestus");
      } finally {
        setBusy(false);
      }
    },
    [fetchList]
  );

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [items]);

  return (
    <nav className="cs-container" aria-label="Vestluste loend">
      <div className="cs-actions">
        <button
          className="cs-btn cs-btn--primary"
          onClick={onNew}
          disabled={busy}
          aria-busy={busy ? "true" : "false"}
        >
          Uus vestlus
        </button>
        <button
          className="cs-btn cs-btn--ghost"
          onClick={fetchList}
          disabled={busy}
          aria-label="Värskenda"
          title="Värskenda"
        >
          ⟳
        </button>
      </div>

      {error && <div className="cs-error" role="alert">{error}</div>}

      <ul className="cs-list" role="list" aria-live="polite">
        {sorted.length === 0 ? (
          <li className="cs-empty">Vestlusi pole.</li>
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
                className="cs-btn cs-btn--ghost cs-delete"
                onClick={() => onDelete(c.id)}
                aria-label="Kustuta vestlus"
                title="Kustuta"
              >
                🗑
              </button>
            </li>
          ))
        )}
      </ul>
    </nav>
  );
}
