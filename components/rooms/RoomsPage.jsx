"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { pushWithTransition } from "@/lib/routeTransition";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import InviteModal from "@/components/invite/InviteModal";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackMobileBottomCenterClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
const pageShellClassName = `${glassPageShellCenteredClassName} max-md:py-0`;
const circleClassName = `${glassPageRingCenteredClassName} glass-ring--desktop-stable flex-col gap-4 overflow-auto overflow-x-hidden p-[clamp(1.4rem,3.5vh,2.2rem)] max-[48em]:pt-[clamp(1.2rem,3vh,2rem)]`;
const titleClassName = `${glassPageTitleClassName} w-full max-w-full`;
const contentClassName = "flex w-full flex-1 flex-col gap-4 overflow-hidden text-center";
const scrollAreaClassName = "flex-1 min-h-0 overflow-y-auto pb-[0.2rem] [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";
export default function RoomsPage() {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);
  const [confirmRoom, setConfirmRoom] = useState(null);
  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(locale || "et", {
    dateStyle: "medium",
    timeStyle: "short"
  }), [locale]);
  const roleLabel = useCallback(role => {
    const map = {
      OWNER: t("rooms.role.owner", "Omanik"),
      MODERATOR: t("rooms.role.moderator", "Moderaator"),
      MEMBER: t("rooms.role.member", "Liige"),
      ADMIN: t("rooms.role.admin", "Admin")
    };
    return map[role] || role || "";
  }, [t]);
  const formatTime = useCallback(value => {
    if (!value) return "";
    try {
      return timeFormatter.format(new Date(value));
    } catch {
      return "";
    }
  }, [timeFormatter]);
  const truncate = useCallback((text, max = 90) => {
    const safe = String(text || "").trim();
    if (!safe) return "";
    const suffix = "...";
    return safe.length > max ? `${safe.slice(0, Math.max(0, max - suffix.length))}${suffix}` : safe;
  }, []);
  const canInvite = useCallback(role => role === "OWNER" || role === "MODERATOR", []);
  const canLeave = useCallback(role => role === "MEMBER" || role === "MODERATOR", []);
  const canDelete = useCallback(role => role === "OWNER" || role === "ADMIN", []);
  const handleInvite = useCallback(roomId => {
    if (!roomId) return;
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:open-invite", {
        detail: {
          roomId
        }
      }));
    } catch {}
  }, []);
  const handleLeave = useCallback(async room => {
    if (!room?.id) return;
    setLeavingId(room.id);
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(room.id)}/leave`, {
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || t("rooms.leave_failed", "Ruumist lahkumine ebaõnnestus."));
      }
      setRooms(prev => prev.filter(r => r.id !== room.id));
    } catch (err) {
      console.warn("Room leave failed:", err);
      window.alert(err?.message || t("rooms.leave_failed", "Ruumist lahkumine ebaõnnestus."));
    } finally {
      setLeavingId(null);
    }
  }, [t]);
  const openDeleteConfirm = useCallback(room => {
    if (!room?.id) return;
    setConfirmRoom(room);
  }, []);
  const closeDeleteConfirm = useCallback(() => {
    if (deletingId) return;
    setConfirmRoom(null);
  }, [deletingId]);
  const confirmDelete = useCallback(async room => {
    const target = room?.id ? room : confirmRoom;
    if (!target?.id) return;
    setDeletingId(target.id);
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(target.id)}`, {
        method: "DELETE"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || t("rooms.delete_failed", "Kustutamine ebaõnnestus."));
      }
      setRooms(prev => prev.filter(r => r.id !== target.id));
    } catch (err) {
      console.warn("Room delete failed:", err);
      window.alert(err?.message || t("rooms.delete_failed", "Kustutamine ebaõnnestus."));
    } finally {
      setDeletingId(null);
      setConfirmRoom(null);
    }
  }, [confirmRoom, t]);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/rooms", {
          cache: "no-store"
        });
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
  const visibleRooms = rooms.filter(room => {
    if (!room?.id) return false;
    if (hiddenIds.has(String(room.id))) return false;
    const title = (room.title || "").toLowerCase();
    const hasContent = Boolean(room?.description || room?.lastMessage?.content || room?.unreadCount);
    if (!hasContent && (title === "vestlusruum" || title === "ruum")) return false;
    return true;
  });
  const effectiveRooms = visibleRooms.length === 1 && (visibleRooms[0].title || "").toLowerCase() === "vestlusruum" && !visibleRooms[0].description && !visibleRooms[0].lastMessage && !visibleRooms[0].unreadCount ? [] : visibleRooms;
  const actionBaseClass = "inline-flex items-center justify-center rounded-[0.6rem] border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] px-[0.65rem] py-[0.25rem] text-[0.75rem] font-semibold text-[color:var(--pt-120)] transition-[border-color,background,color,transform] duration-150 hover:border-[rgba(148,163,184,0.6)] hover:bg-[rgba(16,22,34,0.55)] focus-visible:border-[rgba(148,163,184,0.6)] focus-visible:bg-[rgba(16,22,34,0.55)] focus-visible:outline-none active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-55 [.theme-light_&]:border-[rgba(148,163,184,0.5)] [.theme-light_&]:bg-[rgba(255,255,255,0.9)] [.theme-light_&]:text-[#1f2937] [.theme-light_&:hover]:border-[rgba(148,163,184,0.7)] [.theme-light_&:hover]:bg-[rgba(255,255,255,1)] [.theme-light_&:focus-visible]:border-[rgba(148,163,184,0.7)] [.theme-light_&:focus-visible]:bg-[rgba(255,255,255,1)]";
  const actionDangerClass = `${actionBaseClass} border-[rgba(192,72,72,0.45)] text-[#ffd1d1] hover:border-[rgba(255,120,120,0.7)] hover:bg-[rgba(48,16,20,0.5)] hover:text-[#ffe1e1] focus-visible:border-[rgba(255,120,120,0.7)] focus-visible:bg-[rgba(48,16,20,0.5)] focus-visible:text-[#ffe1e1] [.theme-light_&]:border-[rgba(192,72,72,0.4)] [.theme-light_&]:text-[#7a2323] [.theme-light_&:hover]:border-[rgba(192,72,72,0.6)] [.theme-light_&:hover]:bg-[rgba(255,235,235,0.9)] [.theme-light_&:hover]:text-[#6b1d1d] [.theme-light_&:focus-visible]:border-[rgba(192,72,72,0.6)] [.theme-light_&:focus-visible]:bg-[rgba(255,235,235,0.9)] [.theme-light_&:focus-visible]:text-[#6b1d1d]`;
const metaItemClass = "text-[0.78rem] text-[color:var(--pt-200)] before:content-['|'] before:mx-[0.35rem] before:ml-[0.1rem] before:text-[rgba(148,163,184,0.7)] first:before:content-none [.theme-light_&]:text-[#475569]";
const modalTitleClassName = "text-center text-[1.45rem] leading-[1.2] tracking-[0.02em] text-[color:var(--title-color,var(--brand-primary))] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
  return <>
    <section className={pageShellClassName}>
      <GlassRing className={circleClassName} role="region" aria-label={t("rooms.aria", "Ruumid")}>
        <BackButton
          onClick={() => pushWithTransition(router, "/vestlus")}
          ariaLabel={t("rooms.back_to_chats", "Tagasi vestlustesse")}
          className={glassPageBackMobileBottomCenterClassName}
        />
        <h1 className={titleClassName}>
          {t("rooms.title", "Ruumid")}
        </h1>
          <div className={contentClassName}>
            {loading ? <p className="mx-auto w-[min(28rem,90%)] text-center leading-[1.45] [.theme-light_&]:text-[color:var(--text-strong)]" aria-busy="true">
                {t("rooms.loading", "Laadin ruume...")}
              </p> : effectiveRooms.length === 0 ? <p className="mx-auto w-[min(28rem,90%)] text-center text-[1.15rem] leading-[1.45] [.theme-light_&]:text-[color:var(--text-strong)]">
                {t("rooms.empty", "Ruumid puuduvad. Grupivestluse jaoks lisa vestlusesse inimene.")}
              </p> : <div className={scrollAreaClassName}>
                <ul className="mx-auto grid w-[min(30rem,88%)] list-none gap-[0.85rem] p-0 text-left" role="list">
                  {effectiveRooms.map(room => <li key={room.id} className="m-0 p-0">
                      <div className="flex flex-col gap-[0.6rem] rounded-[1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,14,24,0.32)] p-[0.75rem_0.85rem] text-[color:var(--pt-120)] shadow-[0_0.4rem_1rem_rgba(0,0,0,0.25)] transition-[transform,border-color,background,box-shadow] duration-150 hover:-translate-y-[1px] hover:border-[rgba(148,163,184,0.4)] hover:bg-[rgba(16,22,34,0.4)] hover:shadow-[0_0.55rem_1.35rem_rgba(0,0,0,0.32)] focus-within:-translate-y-[1px] focus-within:border-[rgba(148,163,184,0.4)] focus-within:bg-[rgba(16,22,34,0.4)] focus-within:shadow-[0_0.55rem_1.35rem_rgba(0,0,0,0.32)] [.theme-light_&]:border-[rgba(148,163,184,0.35)] [.theme-light_&]:bg-[rgba(255,255,255,0.85)] [.theme-light_&]:text-[#1f2937] [.theme-light_&]:shadow-[0_0.35rem_0.9rem_rgba(15,23,42,0.12)] [.theme-light_&:hover]:border-[rgba(148,163,184,0.55)] [.theme-light_&:hover]:bg-[rgba(255,255,255,0.96)] [.theme-light_&:hover]:shadow-[0_0.5rem_1.1rem_rgba(15,23,42,0.16)] [.theme-light_&:focus-within]:border-[rgba(148,163,184,0.55)] [.theme-light_&:focus-within]:bg-[rgba(255,255,255,0.96)] [.theme-light_&:focus-within]:shadow-[0_0.5rem_1.1rem_rgba(15,23,42,0.16)]">
                        <Link prefetch={false} href={`/vestlus?roomId=${encodeURIComponent(room.id)}`} className="grid w-full gap-[0.45rem] text-inherit no-underline">
                          <div className="flex items-center justify-between gap-[0.8rem]">
                            <div className="text-[1.05rem] font-semibold text-[color:var(--pt-40)] [.theme-light_&]:text-[#0f172a]">
                              {room.title || t("rooms.fallback_title", "Ruum")}
                            </div>
                            {room.unreadCount ? <span className="min-w-[1.6rem] rounded-full border border-[rgba(192,72,72,0.35)] bg-[rgba(192,72,72,0.25)] px-[0.45rem] py-[0.15rem] text-center text-[0.75rem] font-semibold text-[#ffd1d1]" aria-label={t("rooms.unread", "Uusi")}>
                                {room.unreadCount}
                              </span> : null}
                          </div>
                          {room.description ? <div className="text-[0.88rem] text-[color:var(--pt-200)] [.theme-light_&]:text-[#475569]">
                              {room.description}
                            </div> : null}
                          <div className="flex flex-wrap gap-[0.45rem] text-[0.78rem] text-[color:var(--pt-200)] [.theme-light_&]:text-[#475569]">
                            {room.role ? <span className={metaItemClass}>
                                {t("rooms.role_label", "Roll")}:{" "}
                                {roleLabel(room.role)}
                              </span> : null}
                            {Number.isFinite(room.memberCount) ? <span className={metaItemClass}>
                                {t("rooms.members_label", "Liikmeid")}:{" "}
                                {room.memberCount}
                              </span> : null}
                            {room.unreadCount ? <span className={`${metaItemClass} text-[#ffd1d1]`}>
                                {t("rooms.unread", "Uusi")}: {room.unreadCount}
                              </span> : null}
                          </div>
                          {room.lastMessage?.content ? <div className="flex items-baseline justify-between gap-[0.75rem] text-[0.82rem] text-[color:var(--pt-180)] [.theme-light_&]:text-[#475569]">
                              <span className="min-w-0 flex-1">
                                {truncate(room.lastMessage.content)}
                              </span>
                              {room.lastMessage?.createdAt ? <span className="flex-none text-[0.75rem] text-[rgba(148,163,184,0.8)] [.theme-light_&]:text-[rgba(71,85,105,0.8)]">
                                  {formatTime(room.lastMessage.createdAt)}
                                </span> : null}
                          </div> : <div className="text-[0.82rem] text-[rgba(148,163,184,0.7)]">
                            {t("rooms.last_empty", "Veel sõnumeid pole")}
                          </div>}
                        </Link>
                        {canInvite(room.role) || canLeave(room.role) || canDelete(room.role) ? <div className="flex justify-end gap-[0.4rem]">
                            {canInvite(room.role) ? <button type="button" className={actionBaseClass} onClick={() => handleInvite(room.id)}>
                                {t("rooms.invite", "Kutsu")}
                              </button> : null}
                            {canLeave(room.role) ? <button type="button" className={actionBaseClass} onClick={() => handleLeave(room)} disabled={leavingId === room.id}>
                                {leavingId === room.id ? t("rooms.leave_busy", "Lahkun...") : t("rooms.leave", "Lahku")}
                              </button> : null}
                            {canDelete(room.role) ? <button type="button" className={actionDangerClass} onClick={() => openDeleteConfirm(room)}>
                                {t("rooms.delete", "Kustuta")}
                              </button> : null}
                          </div> : null}
                      </div>
                    </li>)}
                </ul>
              </div>}
          </div>
      </GlassRing>
    </section>
      <Modal open={!!confirmRoom} onClose={closeDeleteConfirm} closeOnOverlayClick={!deletingId} aria-labelledby="rooms-delete-title">
        {confirmRoom ? <div className="flex flex-col gap-4 text-[color:var(--pt-50)] light:text-[color:var(--text-strong)]">
            <h2 id="rooms-delete-title" className={modalTitleClassName}>
              {t("rooms.delete_title", "Kustuta ruum")}
            </h2>
            <p className="text-[1.05rem] leading-[1.5] text-[color:var(--pt-120)] light:text-[color:var(--text-strong)]">
              {t("rooms.delete_confirm", 'Kustuta ruum "{name}"? See kustutab sõnumeid ja kutsed.').replace("{name}", confirmRoom.title || t("rooms.fallback_title", "Ruum"))}
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeDeleteConfirm} disabled={deletingId === confirmRoom.id}>
                {t("rooms.cancel", "Tühista")}
              </Button>
              <Button type="button" variant="primary" onClick={() => confirmDelete(confirmRoom)} disabled={deletingId === confirmRoom.id}>
                {deletingId === confirmRoom.id ? t("rooms.delete_busy", "Kustutan...") : t("rooms.delete", "Kustuta")}
              </Button>
            </div>
          </div> : null}
      </Modal>
      <InviteModal />
    </>;
}

