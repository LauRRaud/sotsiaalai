import "../../styles/components/documents-workspace.shared.css";
import "../../styles/components/documents-ui.shared.css";
import "../../styles/mobile/documents-ui.css";
import "../../styles/theme/mono.documents.css";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

import { authConfig } from "@/auth";
import BackIcon from "@/components/ui/icons/BackIcon";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassSubpageTitleWrapClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { getLocaleFromCookies } from "@/lib/i18n";
import { serverT } from "@/lib/i18n/serverMessages";
import { localizePath } from "@/lib/localizePath";

import AdminFrameworkAcceptancesClient from "./AdminFrameworkAcceptancesClient";

const shellClassName =
  "framework-page-shell relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-[1rem] py-[1rem] text-[color:var(--documents-page-text)] max-[768px]:justify-start max-[768px]:px-[0.25rem] max-[768px]:py-[0.5rem]";
const panelClassName =
  `relative z-[21] w-full !max-w-[clamp(52rem,78vw,78rem)] max-h-[calc(100dvh-2rem)] overflow-x-visible overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[border:var(--glass-modal-border)] [background:var(--glass-modal-bg)] text-[color:var(--documents-page-text)] ` +
  `shadow-[var(--glass-modal-shadow)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] px-[1.45rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:rounded-[1.45rem] max-[768px]:px-[1rem] max-[768px]:pb-[1rem] ${glassPageMobileCardClassName}`;
const pageHeaderClassName =
  "invite-modal-title-wrap mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]";
const headerInnerClassName =
  "grid w-full max-w-[clamp(52rem,78vw,78rem)] gap-[0.75rem] px-[0.15rem] max-[768px]:max-w-none max-[768px]:px-[0.1rem]";
const mobileTitleWrapClassName = glassSubpageTitleWrapClassName;
const headingClassName =
  `rooms-page-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ` +
  `${glassPageTitleClassName} w-full`;
const subtitleClassName =
  "m-0 text-left text-[1.02rem] leading-[1.68] text-[color:var(--documents-page-text)]/85 max-[768px]:text-[1.02rem]";
const backButtonClassName = `${glassPageBackTopLeftClassName} scroll-reactive-back !z-[30] pointer-events-auto`;

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

function _getPageCopy(locale) {
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

  return (
    <section className="documents-workspace documents-workspace-page">
      <div className={shellClassName}>
        <div className={panelClassName}>
          <Link
            prefetch={false}
            href={localizePath("/#meist", locale)}
            className={backButtonClassName}
            aria-label={serverT(locale, "admin.common.back", undefined, "Back")}
          >
            <BackIcon className="h-[4.35rem] w-[4.35rem] min-[769px]:h-[4.75rem] min-[769px]:w-[4.75rem]" />
          </Link>

          <header className={pageHeaderClassName}>
            <div className={headerInnerClassName}>
              <div className={mobileTitleWrapClassName}>
                <h1 className={headingClassName}>
                  {serverT(locale, "admin.framework_acceptances.title", undefined, "Framework acceptances")}
                </h1>
              </div>
              <p className={subtitleClassName}>
                {serverT(
                  locale,
                  "admin.framework_acceptances.subtitle",
                  undefined,
                  "Admin audit view for professional-use and data-processing confirmations."
                )}
              </p>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-[clamp(52rem,78vw,78rem)] gap-[1rem] px-[0.15rem] pt-[0.55rem] pb-[1.2rem] max-[768px]:max-w-none max-[768px]:gap-[0.82rem] max-[768px]:px-[0.1rem] max-[768px]:pb-[1rem]">
            <AdminFrameworkAcceptancesClient />
          </div>
        </div>
      </div>
    </section>
  );
}
