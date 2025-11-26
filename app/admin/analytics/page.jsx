import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { unstable_noStore as noStore } from "next/cache";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata = {
  title: "Analytics · SotsiaalAI",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminAnalyticsPage() {
  noStore();
  const session = await getServerSession(authConfig);
  if (!session) {
    const params = new URLSearchParams({ callbackUrl: "/admin/analytics" });
    redirect(`/api/auth/signin?${params.toString()}`);
  }
  const isAdmin = !!session?.user?.isAdmin || String(session?.user?.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) redirect("/");

  return (
    <div className="main-content glass-box glass-left">
      <AnalyticsDashboard />
    </div>
  );
}
