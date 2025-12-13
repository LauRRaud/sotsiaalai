"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function RoomsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <main id="main" className="main-content glass-box rooms-shell" role="region" aria-label={t("rooms.aria", "Ruumid")}>
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
        <ul className="rooms-simple-list" role="list">
          {effectiveRooms.map((room) => (
            <li key={room.id}>
              <Link href={`/vestlus?roomId=${encodeURIComponent(room.id)}`} className="rooms-simple-link">
                {room.title || t("rooms.fallback_title", "Ruum")}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="back-btn-wrapper rooms-back-btn">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push("/vestlus")}
          aria-label={t("rooms.back_to_chats", "Tagasi vestlustesse")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>
    </main>
  );
}
