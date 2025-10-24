// app/start/page.jsx
import { Link, redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";

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

export async function generateMetadata() {
  const t = await getTranslations("start.metadata");
  return {
    title: t("title"),
    description: t("description")
  };
}

export default async function StartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/registreerimine?reason=not-logged-in");
  }

  const role = session.user.role || (session.user.isAdmin ? "ADMIN" : null);

  // mitte-adminid suuname otse vestlusesse
  if (role !== "ADMIN") {
    redirect("/vestlus");
  }

  const t = await getTranslations("start");

  return (
    <div className="main-content glass-box glass-left" aria-labelledby="start-title">
      <h1 id="start-title" className="glass-title">{t("heading")}</h1>
      <p className="glass-lead" style={{ marginBottom: "1.5rem" }}>
        {t("lead")}
      </p>

      <div
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <StartCard href="/admin/rag" title={t("cards.rag.title")}>
          {t("cards.rag.description")}
        </StartCard>
        <StartCard href="/vestlus" title={t("cards.chat.title")}>
          {t("cards.chat.description")}
        </StartCard>
      </div>
    </div>
  );
}
