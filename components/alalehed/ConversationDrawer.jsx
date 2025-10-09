"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

/**
 * ConversationDrawer
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSelect: (conv) => void                 // kasutaja valib vestluse loendist
 * - currentConvId?: string | null            // aktiivne vestlus (highlight)
 * - onNew?: (conv) => void                   // kui "Uus vestlus" õnnestub (võid jätta ära — fallback kasutab onSelect)
 * - onDeleteLocal?: (convId) => void         // valikuline, võimaldab vanema komponendi lokaalset puhastust
 *
 * Märkus: eeldab järgmisi API-sid:
 *   GET  /api/chat/conversations
 *   POST /api/chat/new
 *   POST /api/chat/delete  { convId }
 */

export default function ConversationDrawer({
  isOpen,
  onClose,
  onSelect,
  currentConvId = null,
  onNew,
  onDeleteLocal,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null); // delete spinner ühele reale

  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const searchRef = useRef(null);

  // Lae loend
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const r = await fetch("/api/chat/conversations", { cache: "no-store" });
      if (!r.ok) throw new Error((await r.text()) || "Loendi laadimine ebaõnnestus");
      const data = await r.json();
      const arr = Array.isArray(data?.items) ? data.items : [];
      setItems(arr);
    } catch (e) {
      setErrorMsg(e?.message || "Viga vestluste laadimisel.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ava korral fookusta ja lae
  useEffect(() => {
    if (isOpen) {
      void fetchConversations();
      // väike viive, et animatsiooniga koos fookustada
      setTimeout(() => {
        searchRef.current?.focus();
      }, 180);
    }
  }, [isOpen, fetchConversations]);

  // ESC sulgemiseks
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay =
        `${it.title || ""} ${it.lastMessageSnippet || ""} ${it.id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  async function handleNew() {
    setErrorMsg(null);
    try {
      const r = await fetch("/api/chat/new", { method: "POST" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) throw new Error(data?.message || "Uue vestluse loomine ebaõnnestus.");
      const conv = data?.conv || null;
      if (conv) {
        setItems((prev) => [conv, ...prev]);
        if (onNew) onNew(conv);
        else onSelect?.(conv);
        onClose?.();
      }
    } catch (e) {
      setErrorMsg(e?.message || "Ei õnnestunud uut vestlust luua.");
    }
  }

  async function handleDelete(convId) {
    if (!convId) return;
    const sure = window.confirm("Kas soovid selle vestluse jäädavalt kustutada?");
    if (!sure) return;
    setBusyId(convId);
    setErrorMsg(null);
    try {
      const r = await fetch("/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convId }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) throw new Error(data?.message || "Kustutamine ebaõnnestus.");
      setItems((prev) => prev.filter((x) => x.id !== convId));
      onDeleteLocal?.(convId);
    } catch (e) {
      setErrorMsg(e?.message || "Ei õnnestunud vestlust kustutada.");
    } finally {
      setBusyId(null);
    }
  }

  function formatTime(ts) {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleString("et-EE", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(ts);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={(e) => {
          if (e.target === backdropRef.current) onClose?.();
        }}
        aria-hidden={!isOpen}
        className="convdrawer-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(1px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity .18s ease",
          zIndex: 60,
        }}
      />

      {/* Drawer panel (left) */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="convdrawer-title"
        className="convdrawer-panel glass-box"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100dvh",
          width: "min(92vw, 420px)",
          transform: isOpen ? "translateX(0)" : "translateX(-105%)",
          transition: "transform .2s ease",
          background: "var(--glass-bg, rgba(20,22,31,0.75))",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
          zIndex: 61,
          display: "grid",
          gridTemplateRows: "auto auto 1fr auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <img
            src="/logo/LOGO.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
            style={{ opacity: 0.9 }}
          />
          <h2 id="convdrawer-title" className="glass-title" style={{ fontSize: 18, margin: 0 }}>
            Vestlused
          </h2>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Sulge"
            className="btn-ghost"
            style={ghostBtnStyle}
          >
            ✕
          </button>
        </div>

        {/* Search + New */}
        <div
          style={{
            padding: "10px 12px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Otsi pealkirja või sisu järgi…"
            aria-label="Otsi vestlust"
            className="input"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleNew}
            className="btn"
            title="Uus vestlus"
            aria-label="Uus vestlus"
            style={primaryBtnStyle}
          >
            + Uus
          </button>
        </div>

        {/* Error */}
        {errorMsg ? (
          <div role="alert" style={errorBoxStyle}>
            {errorMsg}
          </div>
        ) : null}

        {/* List */}
        <div
          role="list"
          aria-busy={loading ? "true" : "false"}
          className="conv-list u-mobile-scroll"
          style={{ overflow: "auto", padding: 8 }}
        >
          {loading && items.length === 0 ? (
            <div style={{ padding: "10px 8px", opacity: 0.8 }}>Laen…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "10px 8px", opacity: 0.8 }}>
              {query ? "Tulemusi ei leitud." : "Vestlusi veel pole."}
            </div>
          ) : (
            filtered.map((it) => {
              const active = it.id === currentConvId;
              return (
                <div
                  key={it.id}
                  role="listitem"
                  className="conv-item"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 8,
                    padding: "10px 10px",
                    marginBottom: 6,
                    borderRadius: 10,
                    border: active
                      ? "1px solid rgba(99,188,255,0.7)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: active ? "rgba(99,188,255,0.08)" : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect?.(it);
                      onClose?.();
                    }}
                    className="conv-main"
                    style={{
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      padding: 0,
                      outline: "none",
                      cursor: "pointer",
                    }}
                    aria-current={active ? "true" : "false"}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 14,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "24ch",
                        }}
                        title={it.title || "Vestlus"}
                      >
                        {it.title || "Vestlus"}
                      </strong>
                      <span style={{ fontSize: 12, opacity: 0.75 }}>
                        {formatTime(it.updatedAt || it.createdAt)}
                      </span>
                    </div>
                    {it.lastMessageSnippet ? (
                      <div
                        style={{
                          fontSize: 13,
                          opacity: 0.85,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "42ch",
                        }}
                        title={it.lastMessageSnippet}
                      >
                        {it.lastMessageSnippet}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, opacity: 0.6 }}>—</div>
                    )}
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleDelete(it.id)}
                      className="btn-ghost"
                      aria-label="Kustuta vestlus"
                      title="Kustuta vestlus"
                      disabled={busyId === it.id}
                      style={ghostBtnStyle}
                    >
                      {busyId === it.id ? "…" : "Kustuta"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={fetchConversations}
            className="btn-ghost"
            title="Värskenda"
            aria-label="Värskenda"
            style={ghostBtnStyle}
          >
            ↻ Värskenda
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            aria-label="Sulge loend"
            style={primaryBtnStyle}
          >
            Sulge
          </button>
        </div>
      </aside>
    </>
  );
}

/* ------------------ Väikesed inlined stiilid (sobituvad sinu klaas-UI-ga) ------------------ */
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "inherit",
  outline: "none",
};

const primaryBtnStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(99,188,255,0.6)",
  background: "rgba(99,188,255,0.12)",
  color: "inherit",
  cursor: "pointer",
};

const ghostBtnStyle = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

const errorBoxStyle = {
  margin: "8px 12px",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(231,76,60,0.35)",
  background: "rgba(231,76,60,0.12)",
  color: "#ff9c9c",
  fontSize: "0.9rem",
};
