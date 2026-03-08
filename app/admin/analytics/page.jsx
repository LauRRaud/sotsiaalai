import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authConfig } from "@/auth";
import { serverT } from "@/lib/i18n/serverMessages";
import { getLocaleFromCookies } from "@/lib/i18n";
import { localizePath } from "@/lib/localizePath";
import { unstable_noStore as noStore } from "next/cache";
import AdminAnalyticsClient from "./AdminAnalyticsClient";
const shellClassName =
  "glass-box mx-auto my-[clamp(0.85rem,2.8vw,2.2rem)] flex w-[min(100%,96vw)] max-w-[clamp(60rem,92vw,98rem)] " +
  "flex-col gap-[clamp(0.9rem,2vw,1.3rem)] rounded-[1.65rem] border border-[color:var(--glass-border-color)] " +
  "px-[clamp(1.05rem,2.7vw,2.4rem)] pt-[clamp(0.9rem,2.2vw,1.25rem)] pb-[clamp(1rem,2.8vw,1.9rem)] " +
  "text-[1.05rem] text-[color:var(--admin-text)] shadow-[var(--glass-shell-shadow,var(--admin-shadow))] " +
  "max-md:w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-0.7rem)] max-md:max-w-none " +
  "max-md:my-[0.35rem] max-md:rounded-[1.35rem] max-md:px-[clamp(0.85rem,3.8vw,1.2rem)] " +
  "max-md:pt-[calc(env(safe-area-inset-top,0px)+0.95rem)] max-md:pb-[calc(env(safe-area-inset-bottom,0px)+1.1rem)]";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const metadata = {
  title: serverT("en", "admin.pages.analytics.meta_title", undefined, "Analytics - SotsiaalAI"),
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};
export default async function AdminAnalyticsPage() {
  noStore();
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const session = await getServerSession(authConfig);
  if (!session) {
    const params = new URLSearchParams({
      callbackUrl: localizePath("/admin/analytics", locale)
    });
    redirect(`/api/auth/signin?${params.toString()}`);
  }
  const isAdmin = !!session?.user?.isAdmin || String(session?.user?.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) redirect(localizePath("/", locale));
  return <div className={shellClassName}>
      <AdminAnalyticsClient />
    </div>;
}
