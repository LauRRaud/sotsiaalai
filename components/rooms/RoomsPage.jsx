"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { pushWithTransition } from "@/lib/routeTransition";
import InviteModal from "@/components/invite/InviteModal";

export default function RoomsPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);
  const [confirmRoom, setConfirmRoom] = useState(null);
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || "et", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale]
  );

  const roleLabel = useCallback(
    (role) => {
      const map = {
        OWNER: t("rooms.role.owner", "Omanik"),
        MODERATOR: t("rooms.role.moderator", "Moderaator"),
        MEMBER: t("rooms.role.member", "Liige"),
        ADMIN: t("rooms.role.admin", "Admin"),
      };
      return map[role] || role || "";
    },
    [t]
  );

  const formatTime = useCallback(
    (value) => {
      if (!value) return "";
      try {
        return timeFormatter.format(new Date(value));
      } catch {
        return "";
      }
    },
    [timeFormatter]
  );

  const truncate = useCallback((text, max = 90) => {
    const safe = String(text || "").trim();
    if (!safe) return "";
    const suffix = "...";
    return safe.length > max ? `${safe.slice(0, Math.max(0, max - suffix.length))}${suffix}` : safe;
  }, []);

  const canInvite = useCallback((role) => role === "OWNER" || role === "MODERATOR", []);
  const canLeave = useCallback((role) => role === "MEMBER" || role === "MODERATOR", []);
  const canDelete = useCallback((role) => role === "OWNER" || role === "ADMIN", []);

  const handleInvite = useCallback((roomId) => {
    if (!roomId) return;
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:open-invite", { detail: { roomId } }));
    } catch {}
  }, []);

  const handleLeave = useCallback(
    async (room) => {
      if (!room?.id) return;
      setLeavingId(room.id);
      try {
        const res = await fetch(`/api/rooms/${encodeURIComponent(room.id)}/leave`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || t("rooms.leave_failed", "Ruumist lahkumine ebaonnestus."));
        }
        setRooms((prev) => prev.filter((r) => r.id !== room.id));
      } catch (err) {
        console.warn("Room leave failed:", err);
        window.alert(err?.message || t("rooms.leave_failed", "Ruumist lahkumine ebaonnestus."));
      } finally {
        setLeavingId(null);
      }
    },
    [t]
  );

  const openDeleteConfirm = useCallback((room) => {
    if (!room?.id) return;
    setConfirmRoom(room);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (deletingId) return;
    setConfirmRoom(null);
  }, [deletingId]);

  const confirmDelete = useCallback(
    async (room) => {
      const target = room?.id ? room : confirmRoom;
      if (!target?.id) return;
      setDeletingId(target.id);
      try {
        const res = await fetch(`/api/rooms/${encodeURIComponent(target.id)}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || t("rooms.delete_failed", "Kustutamine ebaonnestus."));
        }
        setRooms((prev) => prev.filter((r) => r.id !== target.id));
      } catch (err) {
        console.warn("Room delete failed:", err);
        window.alert(err?.message || t("rooms.delete_failed", "Kustutamine ebaonnestus."));
      } finally {
        setDeletingId(null);
        setConfirmRoom(null);
      }
    },
    [confirmRoom, t]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/rooms", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || "Rooms fetch failed");
        }
        if (!cancelled) setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      } catch (err) {
        if (!cancelled) setRooms([]);
        console.warn("Rooms load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hiddenIds = new Set(["cmiunm4we0001goud9072nb9q"]);
  const visibleRooms = rooms.filter((room) => {
    if (!room?.id) return false;
    if (hiddenIds.has(String(room.id))) return false;
    const title = (room.title || "").toLowerCase();
    const hasContent = Boolean(room?.description || room?.lastMessage?.content || room?.unreadCount);
    if (!hasContent && (title === "vestlusruum" || title === "ruum")) return false;
    return true;
  });

  const effectiveRooms =
    visibleRooms.length === 1 &&
    (visibleRooms[0].title || "").toLowerCase() === "vestlusruum" &&
    !visibleRooms[0].description &&
    !visibleRooms[0].lastMessage &&
    !visibleRooms[0].unreadCount
      ? []
      : visibleRooms;

  return (
    <div className="rooms-page-shell">
      <section className="main-content glass-box rooms-shell rooms-container" role="region" aria-label={t("rooms.aria", "Ruumid")}>
        <h1 className="glass-title rooms-title">{t("rooms.title", "Ruumid")}</h1>

        {loading ? (
          <p className="rooms-empty" aria-busy="true">
            {t("rooms.loading", "Laadin ruume...")}
          </p>
        ) : effectiveRooms.length === 0 ? (
          <p className="rooms-empty">
            {t("rooms.empty", "Ruumid puuduvad. Grupivestluse jaoks lisa vestlusesse inimene.")}
          </p>
        ) : (
          <ul className="rooms-list" role="list">
            {effectiveRooms.map((room) => (
              <li key={room.id} className="rooms-list-item">
                <div className="rooms-card">
                  <Link href={`/vestlus?roomId=${encodeURIComponent(room.id)}`} className="rooms-card__link">
                    <div className="rooms-card__header">
                      <div className="rooms-card__title">
                        {room.title || t("rooms.fallback_title", "Ruum")}
                      </div>
                      {room.unreadCount ? (
                        <span className="rooms-card__badge" aria-label={t("rooms.unread", "Uusi")}>
                          {room.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    {room.description ? (
                      <div className="rooms-card__desc">{room.description}</div>
                    ) : null}
                    <div className="rooms-card__meta">
                      {room.role ? (
                        <span className="rooms-card__meta-item">
                          {t("rooms.role_label", "Roll")}: {roleLabel(room.role)}
                        </span>
                      ) : null}
                      {Number.isFinite(room.memberCount) ? (
                        <span className="rooms-card__meta-item">
                          {t("rooms.members_label", "Liikmeid")}: {room.memberCount}
                        </span>
                      ) : null}
                      {room.unreadCount ? (
                        <span className="rooms-card__meta-item rooms-card__meta-item--unread">
                          {t("rooms.unread", "Uusi")}: {room.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    {room.lastMessage?.content ? (
                      <div className="rooms-card__last">
                        <span className="rooms-card__last-text">
                          {truncate(room.lastMessage.content)}
                        </span>
                        {room.lastMessage?.createdAt ? (
                          <span className="rooms-card__last-time">
                            {formatTime(room.lastMessage.createdAt)}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rooms-card__last rooms-card__last--empty">
                        {t("rooms.last_empty", "Veel sonumeid pole")}
                      </div>
                    )}
                  </Link>
                  {canInvite(room.role) || canLeave(room.role) || canDelete(room.role) ? (
                    <div className="rooms-card__actions">
                      {canInvite(room.role) ? (
                        <button
                          type="button"
                          className="rooms-card__action"
                          onClick={() => handleInvite(room.id)}
                        >
                          {t("rooms.invite", "Kutsu")}
                        </button>
                      ) : null}
                      {canLeave(room.role) ? (
                        <button
                          type="button"
                          className="rooms-card__action"
                          onClick={() => handleLeave(room)}
                          disabled={leavingId === room.id}
                        >
                          {leavingId === room.id
                            ? t("rooms.leave_busy", "Lahkun...")
                            : t("rooms.leave", "Lahku")}
                        </button>
                      ) : null}
                      {canDelete(room.role) ? (
                        <button
                          type="button"
                          className="rooms-card__action rooms-card__action--danger"
                          onClick={() => openDeleteConfirm(room)}
                        >
                          {t("rooms.delete", "Kustuta")}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="back-btn-wrapper rooms-back-btn">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => pushWithTransition(router, "/vestlus")}
            aria-label={t("rooms.back_to_chats", "Tagasi vestlustesse")}
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </section>
      {confirmRoom ? (
        <div className="modal-backdrop" role="presentation" onClick={closeDeleteConfirm}>
          <div
            className="modal-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rooms-delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="rooms-delete-title" className="glass-title">
              {t("rooms.delete_title", "Kustuta ruum")}
            </h2>
            <p className="modal-confirm-text">
              {t("rooms.delete_confirm", 'Kustuta ruum "{name}"? See kustutab sonumid ja kutsed.').replace(
                "{name}",
                confirmRoom.title || t("rooms.fallback_title", "Ruum")
              )}
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn-base"
                onClick={closeDeleteConfirm}
                disabled={deletingId === confirmRoom.id}
              >
                {t("rooms.cancel", "Tuhista")}
              </button>
              <button
                type="button"
                className="btn-base btn-modal-primary"
                onClick={() => confirmDelete(confirmRoom)}
                disabled={deletingId === confirmRoom.id}
              >
                {deletingId === confirmRoom.id
                  ? t("rooms.delete_busy", "Kustutan...")
                  : t("rooms.delete", "Kustuta")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <InviteModal />
    </div>
  );
}





