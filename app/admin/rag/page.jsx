// app/admin/rag/page.jsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import dynamic from "next/dynamic";
import { unstable_noStore as noStore } from "next/cache";

const RagAdminPanel = dynamic(() => import("@/components/admin/RagAdminPanel"), {
  ssr: false,
  loading: () => <div style={{ opacity: 0.75 }}>Laen paneeli...</div>,
});
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const metadata = {
  title: "RAG andmebaasi haldus - SotsiaalAI",
  description: "Laadi ules ja halda RAG materjale.",
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
      className="main-content glass-box glass-left admin-page admin-page--rag"
      aria-labelledby="rag-admin-title"
      lang="et"
    >
      <h1 id="rag-admin-title" className="glass-title">
        RAG andmebaasi haldus
      </h1>
      {/* Kliendikomponent ("use client") laetakse eraldi chunkina */}
      <RagAdminPanel />
      <div className="back-btn-wrapper">
        <Link href="/meist" className="back-arrow-btn" aria-label="Tagasi">
          <span className="back-arrow-circle" />
        </Link>
      </div>
    </div>
  );
}




