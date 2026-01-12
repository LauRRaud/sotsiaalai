import { redirect } from "next/navigation";

export default function RoomPage({ params }) {
  const roomId = params?.roomId ? String(params.roomId) : "";
  if (roomId === "cmiunm4we0001goud9072nb9q") {
    redirect("/vestlus");
  }
  if (roomId) {
    redirect(`/vestlus?roomId=${encodeURIComponent(roomId)}`);
  }
  redirect("/vestlus");
}
