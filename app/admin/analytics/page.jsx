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
  "mx-auto my-[clamp(1.1rem,3vw,2.2rem)] flex w-full max-w-[60rem] flex-col gap-2 px-[clamp(1rem,2.1vw,1.7rem)] pt-[clamp(0.75rem,2vw,1.1rem)] pb-[clamp(0.6rem,1.8vw,1rem)] text-[1.05rem] text-[color:var(--admin-text)] max-md:w-full max-md:max-w-none max-md:my-0 max-md:px-[clamp(0.85rem,3.8vw,1.3rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.3rem)] max-md:pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]";
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
  return (
    <section className="documents-workspace mx-auto w-full px-[clamp(0.4rem,1.4vw,0.9rem)] py-[clamp(0.5rem,1.6vw,1rem)]">
      <div className={shellClassName}>
        <AdminAnalyticsClient />
      </div>
    </section>
  );
}
