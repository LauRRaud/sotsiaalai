"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

function uuid() {
  return (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || `conv-${Date.now()}`;
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
      if (!r.ok || !data?.ok) throw new Error(data?.message || "Laadimine ebaõnnestus");
      setItems(Array.isArray(data.conversations) ? data.conversations : []);
    } catch (e) {
      setError(e?.message || "Laadimine ebaõnnestus");
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const onPick = useCallback((id) => {
    // teavita ChatBody’d, et soovime teise vestluse peale minna
    window.dispatchEvent(new CustomEvent("sotsiaalai:switch-conversation", { detail: { convId: id } }));
    // sulge sahtel
    window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: false } }));
  }, []);

  const onNew = useCallback(async () => {
    setBusy(true); setError("");
    const id = uuid();
    try {
      await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: "CLIENT" }),
      });
      // vali kohe äsja loodud
      onPick(id);
      // refresh list (taustal)
      fetchList();
    } catch (e) {
      setError(e?.message || "Uue vestluse loomine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, [fetchList, onPick]);

  const onDelete = useCallback(async (id) => {
    if (!id) return;
    if (!confirm("Kas kustutada see vestlus?")) return;
    setBusy(true); setError("");
    try {
      const r = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) throw new Error(data?.message || "Kustutamine ebaõnnestus");
      await fetchList();
    } catch (e) {
      setError(e?.message || "Kustutamine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, [fetchList]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [items]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button className="btn primary small" onClick={onNew} disabled={busy}>Uus vestlus</button>
        <button
          className="btn ghost small"
          onClick={fetchList}
          disabled={busy}
          aria-label="Värskenda"
          title="Värskenda"
        >
          ⟳
        </button>
      </div>

      {error ? (
        <div style={{ color: "#ff9c9c", fontSize: 13, marginBottom: 8 }}>{error}</div>
      ) : null}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sorted.length === 0 ? (
          <li style={{ opacity: 0.8, fontSize: 14 }}>Vestlusi pole.</li>
        ) : (
          sorted.map((c) => (
            <li key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "8px 6px",
                  borderBottom: "1px solid rgba(255,255,255,.06)",
                }}>
              <button
                className="link-like"
                onClick={() => onPick(c.id)}
                style={{ textAlign: "left", flex: 1 }}
                title={c.preview || c.title}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title || "Vestlus"}</div>
                <div style={{ opacity: 0.75, fontSize: 12 }}>
                  {new Date(c.updatedAt).toLocaleString()}
                </div>
              </button>
              <button
                className="btn ghost small"
                onClick={() => onDelete(c.id)}
                aria-label="Kustuta"
                title="Kustuta vestlus"
              >
                🗑
              </button>
            </li>
          ))
        )}
      </ul>

      <style jsx>{`
        .link-like {
          padding: 0;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
