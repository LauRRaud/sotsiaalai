import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = {
  title: "Järgmine samm — SotsiaalAI",
  description: "Vali, kuhu edasi liikuda pärast sisselogimist.",
};

const cardStyle = {
  display: "block",
  padding: "1.5rem",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(13,16,24,0.65)",
  color: "#f5f7ff",
  textDecoration: "none",
  transition: "transform 0.2s ease, border-color 0.2s ease",
};

function StartCard({ href, title, children }) {
  return (
    <Link href={href} style={cardStyle}>
      <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>{title}</h2>
      <p style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{children}</p>
    </Link>
  );
}

export default async function StartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/registreerimine?reason=not-logged-in");
  }

  const role = session.user.role || (session.user.isAdmin ? "ADMIN" : null);

  if (role !== "ADMIN") {
    redirect("/vestlus");
  }

  return (
    <div className="main-content glass-box glass-left" aria-labelledby="start-title" lang="et">
      <h1 id="start-title" className="glass-title">Tere tulemast tagasi</h1>
      <p className="glass-lead" style={{ marginBottom: "1.5rem" }}>
        Vali, millise tööriistaga jätkad.
      </p>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <StartCard href="/admin/rag" title="RAG andmebaasi haldus">
          Laadi üles uusi materjale, halda allikaid ja jälgi indeksi staatust.
        </StartCard>
        <StartCard href="/vestlus" title="Vestlusassistendiga">
          Testi assistenti ja vii vestlusi, kasutades rollipõhist RAG-konteksti.
        </StartCard>
      </div>
    </div>
  );
}
