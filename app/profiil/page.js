import { cookies } from "next/headers";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
import HomeAboutSection from "@/components/HomeSections/HomeAboutSection";
import HomeFooter from "@/components/HomeSections/HomeFooter";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.profile || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/profiil",
    title: meta.title || "Profile - SotsiaalAI",
    description: meta.description || ""
  });
}
export default function Page() {
  return <div className="relative flex min-h-[100dvh] w-full flex-col items-stretch">
      <section className="flex flex-1 items-center justify-center px-[clamp(1rem,3vw,1.75rem)] py-[clamp(3rem,4vh,5rem)]">
        <ProfiilBody />
      </section>
      <HomeAboutSection />
      <HomeFooter />
    </div>;
}


