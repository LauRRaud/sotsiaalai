import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookies } from "@/lib/i18n";
import { localizePath } from "@/lib/localizePath";
export default async function RoomPage({
  params
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const chatPath = localizePath("/vestlus", locale);
  const roomId = params?.roomId ? String(params.roomId).trim() : "";
  if (roomId) {
    redirect(`${chatPath}?roomId=${encodeURIComponent(roomId)}`);
  }
  redirect(chatPath);
}
