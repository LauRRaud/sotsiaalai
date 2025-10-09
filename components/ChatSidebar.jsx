"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

/**
 * Peidetav külgriba, mis:
 * - laeb kasutaja vestlused (/api/chat/conversations, GET)
 * - võimaldab luua uue vestluse (/api/chat/conversations, POST)
 * - võimaldab kustutada valitud vestluse (/api/chat/conversations/:id, DELETE)
 *
 * Props:
 * - currentId: string | null      (aktiivne vestlus)
 * - onSelect: (id: string) => void (kui kasutaja valib nimekirjast)
 * - onNewConversation?: (id: string) => void (pärast uue loomist)
 */
export default function ChatSidebar({ currentId, onSelect, onNewConversation }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // {id,title,updatedAt,role,status,preview}
  const [error, setError] = useState(null);

  const sorted = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [items]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/chat/conversations", { cache: "no-store" });
      const data = await r.json().catch(() => null);
      if (!r.ok || !data?.ok) throw new Error(data?.message || "Loetelu laadimine ebaõnnestus.");
      setItems(Array.isArray(data.conversations) ? data.conversations : []);
    } catch (e) {
      setError(e?.message || "Viga vestluste laadimisel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void fetchList();
  }, [open, fetchList]);

  const handleNew = useCallback(async () => {
    try {
      const id =
        (typeof window !== "undefined" && window.crypto?.randomUUID?.()) ||
        String(Date.now());
      const body = { id, role: "CLIENT" }; // rolli võib soovi korral muuta
      const r = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok || !data?.ok) {
        throw new Error(data?.message || "Uue vestluse loomine ebaõnnestus.");
      }
      // lisa nimekirja etteotsa (optimistlik)
      setItems((prev) => {
        const next = [data.conversation, ...prev.filter((x) => x.id !== data.conversation.id)];
        return next;
      });
      onSelect?.(id);
      onNewConversation?.(id);
      setOpen(false); // peida külgriba, et kasutaja saaks kohe chattida
    } catch (e) {
      setError(e?.message || "Viga uue vestluse loomisel.");
    }
  }, [onNewConversation, onSelect]);

  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;
      const sure = window.confirm("Kas soovid selle vestluse kustutada?");
      if (!sure) return;

      try {
        const r = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        const data = await r.json().catch(() => null);
        if (!r.ok || !data?.ok) throw new Error(data?.message || "Kustutamine ebaõnnestus.");
        setItems((prev) => prev.filter((x) => x.id !== id));
        // kui kustutati praegu aktiivne, siis vali (vajadusel) viimane allesjäänu
        if (currentId === id) {
          const fallback = sorted.find((x) => x.id !== id)?.id || null;
          if (fallback) onSelect?.(fallback);
        }
      } catch (e) {
        setError(e?.message || "Viga vestluse kustutamisel.");
      }
    },
    [currentId, onSelect, sorted],
  );

  return (
    <>
      {/* Toggle nupp (ülemisse vasakusse nurka) */}
      <button
        type="button"
        className="chat-sidebar-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open ? "true" : "false"}
        aria-controls="chat-sidebar"
        title={open ? "Sulge vestluste loend" : "Ava vestluste loend"}
      >
        {/* hamburger-ico */}
        <span className="bar" /><span className="bar" /><span className="bar" />
      </button>

      {/* Külgriba paneel */}
      <aside
        id="chat-sidebar"
        className={`chat-sidebar ${open ? "open" : ""}`}
        aria-hidden={open ? "false" : "true"}
      >
        <div className="chat-sidebar-header">
          <h2>Vestlused</h2>
          <div className="actions">
            <button className="btn btn-new" onClick={handleNew} title="Uus vestlus">
              + Uus
            </button>
            <button className="btn btn-refresh" onClick={fetchList} title="Värskenda">
              ↻
            </button>
            <button className="btn btn-close" onClick={() => setOpen(false)} title="Sulge">
              ✕
            </button>
          </div>
        </div>

        {error ? (
          <div className="chat-sidebar-error" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="chat-sidebar-loading">Laen…</div>
        ) : (
          <ul className="chat-sidebar-list" role="listbox" aria-label="Varasemad vestlused">
            {sorted.length === 0 ? (
              <li className="empty">Vestlusi veel pole.</li>
            ) : (
              sorted.map((c) => {
                const active = c.id === currentId;
                return (
                  <li
                    key={c.id}
                    className={`item ${active ? "active" : ""}`}
                    role="option"
                    aria-selected={active ? "true" : "false"}
                  >
                    <button
                      className="item-main"
                      onClick={() => {
                        onSelect?.(c.id);
                        setOpen(false);
                      }}
                      title={c.title || "Vestlus"}
                    >
                      <div className="title">{c.title || "Vestlus"}</div>
                      <div className="meta">
                        <time dateTime={c.updatedAt}>
                          {new Date(c.updatedAt).toLocaleString()}
                        </time>
                        <span className="role">{c.role}</span>
                      </div>
                    </button>
                    <button
                      className="item-del"
                      onClick={() => handleDelete(c.id)}
                      aria-label="Kustuta vestlus"
                      title="Kustuta vestlus"
                    >
                      🗑
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </aside>

      {/* Stiilid – lihtne, et sul oleks kohe toimiv UI. Kohanda vastavalt oma CSS-ile. */}
      <style jsx>{`
        .chat-sidebar-toggle {
          position: absolute;
          top: 14px;
          left: 14px;
          width: 38px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          cursor: pointer;
        }
        .chat-sidebar-toggle .bar {
          display: block;
          width: 16px;
          height: 2px;
          background: currentColor;
        }

        .chat-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100dvh;
          width: min(92vw, 360px);
          max-width: 360px;
          transform: translateX(-100%);
          transition: transform 200ms ease;
          background: rgba(18, 18, 22, 0.92);
          color: #f2f2f2;
          border-right: 1px solid rgba(255,255,255,0.15);
          z-index: 60;
          display: flex;
          flex-direction: column;
        }
        .chat-sidebar.open { transform: translateX(0); }

        .chat-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .chat-sidebar-header h2 {
          margin: 0;
          font-size: 1.05rem;
        }
        .chat-sidebar-header .actions {
          display: inline-flex;
          gap: 6px;
        }
        .btn {
          padding: 6px 10px;
          font-size: 0.85rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          color: #fff;
          cursor: pointer;
        }
        .btn:hover { background: rgba(255,255,255,0.12); }
        .btn-close { padding-inline: 8px; }

        .chat-sidebar-error,
        .chat-sidebar-loading {
          padding: 10px 12px;
          font-size: 0.9rem;
        }
        .chat-sidebar-error {
          color: #ff9c9c;
          background: rgba(231,76,60,0.12);
          border-top: 1px solid rgba(231,76,60,0.35);
          border-bottom: 1px solid rgba(231,76,60,0.35);
        }

        .chat-sidebar-list {
          list-style: none;
          margin: 0;
          padding: 8px;
          overflow: auto;
          flex: 1 1 auto;
        }
        .chat-sidebar-list .empty {
          opacity: 0.75;
          padding: 8px 6px;
          font-size: 0.92rem;
        }
        .item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 6px;
          align-items: start;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid transparent;
        }
        .item.active {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.16);
        }
        .item + .item { margin-top: 6px; }
        .item-main {
          text-align: left;
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
        }
        .item-main .title {
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.2;
          margin-bottom: 2px;
        }
        .item-main .meta {
          font-size: 0.78rem;
          opacity: 0.8;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .item-del {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          padding: 6px 8px;
          color: #ffb3b3;
          cursor: pointer;
        }
        .item-del:hover {
          background: rgba(231, 76, 60, 0.16);
          border-color: rgba(231, 76, 60, 0.35);
        }
      `}</style>
    </>
  );
}
