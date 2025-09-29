// app/admin/rag/page.jsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// ⬇️ vali õige import vastavalt failinimele
// import RagAdminPanel from "@/components/admin/RagAdminPanel";
import RagAdminPanel from "@/components/admin/ragadminpanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "RAG andmebaasi haldus — SotsiaalAI",
  description: "Laadi üles ja halda RAG materjale.",
};

export default async function AdminRagPage() {
  const session = await getServerSession(authOptions);

  // Pole sisse logitud -> suuna loginile ja tagasi siia
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
    <div className="main-content glass-box glass-left" aria-labelledby="rag-admin-title" lang="et">
      <h1 id="rag-admin-title" className="glass-title">RAG andmebaasi haldus</h1>
      <p className="glass-lead" style={{ marginBottom: "1.5rem" }}>
        Lisa, uuenda ja taasingesta materjale, mida vestlusassistent kasutab.
      </p>
      <RagAdminPanel />
    </div>
  );
}
