import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.profile || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/profiil",
    title: meta.title || "Minu profiil – SotsiaalAI",
    description: meta.description || "",
  });
}
export default async function Page() {
  // SSR: anna SessionProvider'ile juba serverisessioon (see on juba layoutis)
  // ning proovi tuua ka esmane profiili info, et vältida kliendipoolset
  // lühiajalist "Laen profiili…" ekraanivälgatust.
  const session = await getServerSession(authConfig);
  let initialProfile = null;
  try {
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: String(session.user.id) },
        select: { email: true, role: true },
      });
      if (user) initialProfile = { email: user.email || "", role: user.role || null };
    }
  } catch {}
  return <ProfiilBody initialProfile={initialProfile} />;
}
