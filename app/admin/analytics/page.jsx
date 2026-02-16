import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authConfig } from "@/auth";
import { serverT } from "@/lib/i18n/serverMessages";
import { getLocaleFromCookies } from "@/lib/i18n";
import { localizePath } from "@/lib/localizePath";
import { unstable_noStore as noStore } from "next/cache";
import AdminAnalyticsClient from "./AdminAnalyticsClient";
const shellClassName = "glass-box mx-auto my-[clamp(1.1rem,3vw,2.2rem)] flex w-[min(100%,94vw)] max-w-[clamp(54rem,86vw,88rem)] flex-col gap-4 rounded-[1.5rem] border border-[color:var(--glass-border-color)] px-[clamp(1.25rem,2.8vw,2.3rem)] pt-[clamp(0.75rem,2vw,1.1rem)] pb-[clamp(1.1rem,3vw,1.8rem)] text-[1.05rem] text-[color:var(--admin-text)] max-md:w-full max-md:max-w-none max-md:my-0 max-md:rounded-none max-md:border-x-0 max-md:px-[clamp(0.85rem,3.8vw,1.3rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.3rem)] max-md:pb-[calc(env(safe-area-inset-bottom,0px)+1.8rem)]";
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
