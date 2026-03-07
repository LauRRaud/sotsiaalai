import { localizePath } from "./localizePath.js";

export function buildRoomChatPath(roomId, locale) {
  const normalizedRoomId = String(roomId || "").trim();
  const basePath = normalizedRoomId
    ? `/vestlus?roomId=${encodeURIComponent(normalizedRoomId)}`
    : "/vestlus";
  return localizePath(basePath, locale);
}
