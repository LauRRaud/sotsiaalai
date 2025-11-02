// app/admin/rag/page.jsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import RagAdminPanel from "@/components/admin/RagAdminPanel"; // otse import – see on "use client" komponendis lubatud
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const metadata = {
  title: "RAG andmebaasi haldus — SotsiaalAI",
  description: "Laadi üles ja halda RAG materjale.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};
export default async function AdminRagPage() {
  noStore(); // väldi SSR cache’i
  const session = await getServerSession(authConfig);
  // Pole sisse logitud -> suuna loginile ja pärast tagasi siia
  if (!session) {
    const params = new URLSearchParams({ callbackUrl: "/admin/rag" });
    redirect(`/api/auth/signin?${params.toString()}`);
  }
  const isAdmin =
    session.user?.isAdmin === true ||
    String(session.user?.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) {
    redirect("/"); // sisse logitud, aga pole admin
  }
  return (
    <div
      className="main-content glass-box glass-left"
      aria-labelledby="rag-admin-title"
      lang="et"
    >
      <h1 id="rag-admin-title" className="glass-title">
        RAG andmebaasi haldus
      </h1>
      <p className="glass-lead" style={{ marginBottom: "1.5rem" }}>
        Lisa, uuenda ja taasindekseeri materjale, mida vestlusassistent kasutab.
      </p>
      {/* Kliendikomponent (\"use client\") võib olla Server Componenti sees */}
      <Suspense fallback={<div style={{ opacity: 0.75 }}>Laen paneeli…</div>}>
        <RagAdminPanel />
      </Suspense>
    </div>
  );
}
