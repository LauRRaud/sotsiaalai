import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authConfig } from "@/auth";
import { serverT } from "@/lib/i18n/serverMessages";
import { getLocaleFromCookies } from "@/lib/i18n";
import { localizePath } from "@/lib/localizePath";
import { unstable_noStore as noStore } from "next/cache";
import AdminAnalyticsClient from "./AdminAnalyticsClient";
const shellClassName = "mx-auto my-[clamp(1.4rem,4vw,2.6rem)] flex w-[min(100%,86vw)] max-w-[clamp(32rem,70vw,50rem)] flex-col gap-[0.9em] rounded-[1.5em] bg-[color:var(--glass-surface-bg)] text-[1.22rem] text-[color:var(--admin-text)] backdrop-blur-[var(--glass-blur-radius)] px-[clamp(1.8rem,4.5vw,2.6rem)] pt-[clamp(0.8rem,2.5vw,1.3rem)] pb-[clamp(1.2rem,3.5vw,2rem)] max-md:w-full max-md:max-w-none max-md:rounded-none max-md:my-0 max-md:px-[clamp(1rem,4vw,1.5rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.6rem)] max-md:pb-[clamp(2rem,8vw,2.9rem)]";
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
