// app/admin/rag/page.jsx  (NextAuth v4)
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import RagAdminPanel from "@/components/admin/RagAdminPanel";

export const metadata = {
  title: "RAG andmebaasi haldus — SotsiaalAI",
  description: "Laadi üles ja halda RAG materjale.",
};

export default async function AdminRagPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
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
