import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

import { authConfig } from "@/auth";
import BackIcon from "@/components/ui/icons/BackIcon";
import {
  glassPageBackTopLeftClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { getLocaleFromCookies } from "@/lib/i18n";
import { serverT } from "@/lib/i18n/serverMessages";
import { localizePath } from "@/lib/localizePath";

import AdminFrameworkAcceptancesClient from "./AdminFrameworkAcceptancesClient";

const shellClassName =
  "mx-auto my-[clamp(1.1rem,3vw,2.2rem)] flex w-full max-w-[60rem] flex-col gap-2 px-[clamp(1rem,2.1vw,1.7rem)] pt-[clamp(0.75rem,2vw,1.1rem)] pb-[clamp(0.6rem,1.8vw,1rem)] text-[1.05rem] text-[color:var(--admin-text)] max-md:w-full max-md:max-w-none max-md:my-0 max-md:px-[clamp(0.85rem,3.8vw,1.3rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.3rem)] max-md:pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]";
const pageHeaderClassName =
  "invite-modal-title-wrap relative mb-[0.35rem] flex min-h-[5rem] items-start justify-center gap-[0.75rem] text-center max-[768px]:min-h-0";
const mobileTitleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const headingClassName =
  `invite-modal-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ` +
  `${glassPageTitleClassName} w-full max-[768px]:!mt-0 max-[768px]:!mb-0`;
const subtitleClassName =
  "mx-auto mt-[0.2rem] max-w-[62ch] text-center text-[0.94rem] leading-[1.5] text-[color:var(--admin-muted)]";
const backButtonClassName = `${glassPageBackTopLeftClassName} !z-[30] pointer-events-auto`;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const metadata = {
  title: serverT(
    "en",
    "admin.pages.framework_acceptances.meta_title",
    undefined,
    "Framework acceptances - SotsiaalAI"
  ),
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

function getPageCopy(locale) {
  if (locale === "et") {
    return {
      heading: "Tööalase kasutuse kinnitused",
      subtitle: "Admini auditivaade kasutajate tööalase kasutuse ja andmetöötluse kinnitustele."
    };
  }
  if (locale === "ru") {
    return {
      heading: "Подтверждения рабочего использования",
      subtitle: "Админский аудит-представление подтверждений рабочего использования и обработки данных."
    };
  }
  return {
    heading: "Framework acceptances",
    subtitle: "Admin audit view for professional-use and data-processing confirmations."
  };
}

export default async function AdminFrameworkAcceptancesPage() {
  noStore();
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const session = await getServerSession(authConfig);
  if (!session) {
    const params = new URLSearchParams({
      callbackUrl: localizePath("/admin/framework-acceptances", locale)
    });
    redirect(`/api/auth/signin?${params.toString()}`);
  }
  const isAdmin = session.user?.isAdmin === true || String(session.user?.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) {
    redirect(localizePath("/", locale));
  }

  const copy = getPageCopy(locale);

  return (
    <section className="documents-workspace mx-auto w-full px-[clamp(0.4rem,1.4vw,0.9rem)] py-[clamp(0.5rem,1.6vw,1rem)]">
      <div className={shellClassName}>
        <header className={pageHeaderClassName}>
          <Link
            prefetch={false}
            href={localizePath("/#meist", locale)}
            className={backButtonClassName}
            aria-label={serverT(locale, "admin.common.back", undefined, "Back")}
          >
            <BackIcon className="h-[4.35rem] w-[4.35rem] min-[769px]:h-[4.75rem] min-[769px]:w-[4.75rem]" />
          </Link>
          <div className={mobileTitleWrapClassName}>
            <div className="grid w-full justify-items-center">
              <h1 className={headingClassName}>{copy.heading}</h1>
              <p className={subtitleClassName}>{copy.subtitle}</p>
            </div>
          </div>
        </header>
        <AdminFrameworkAcceptancesClient />
      </div>
    </section>
  );
}
