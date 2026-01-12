// app/start/page.jsx — NextAuth v4
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import { localizePath } from "@/lib/localizePath";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.start || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/start",
    title: meta.title || "Järgmine samm — SotsiaalAI",
    description: meta.description || "",
  });
}
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
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const session = await getServerSession(authConfig);
  const messages = getMessagesSync(locale);
  const startCopy = messages?.start || {};
  const cards = startCopy.cards || {};
  if (!session?.user) {
    redirect(localizePath("/registreerimine?reason=not-logged-in", locale));
  }
  const role = session.user.role || (session.user.isAdmin ? "ADMIN" : null);
  // mitte-adminid suuname otse vestlusesse
  if (role !== "ADMIN") {
    redirect(localizePath("/vestlus", locale));
  }
  return (
    <div
      className="main-content glass-box glass-left"
      aria-labelledby="start-title"
      lang={locale}
    >
      <h1 id="start-title" className="glass-title">
        {startCopy.heading || "Tere tulemast tagasi"}
      </h1>
      <p className="glass-lead" style={{ marginBottom: "1.5rem" }}>
        {startCopy.lead || "Vali, millise tööriistaga jätkad."}
      </p>
      <div
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <StartCard
          href={localizePath("/admin/rag", locale)}
          title={cards.rag?.title || "RAG andmebaasi haldus"}
        >
          {cards.rag?.description ||
            "Laadi üles uusi materjale, halda allikaid ja jälgi indeksi staatust."}
        </StartCard>
        <StartCard
          href={localizePath("/vestlus", locale)}
          title={cards.chat?.title || "Vestlusassistendiga"}
        >
          {cards.chat?.description ||
            "Testi assistenti ja vii vestlusi, kasutades rollipõhist RAG-konteksti."}
        </StartCard>
      </div>
    </div>
  );
}
