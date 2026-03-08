import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authConfig } from "@/auth";
import { serverT } from "@/lib/i18n/serverMessages";
import { getLocaleFromCookies } from "@/lib/i18n";
import { localizePath } from "@/lib/localizePath";
import { unstable_noStore as noStore } from "next/cache";
import BackIcon from "@/components/ui/icons/BackIcon";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import RagAdminClient from "./RagAdminClient";
const shellClassName =
  "documents-panel documents-panel--primary mx-auto my-[clamp(1.1rem,3vw,2.2rem)] flex w-full max-w-[60rem] flex-col gap-2 rounded-[1.5rem] border px-[clamp(1rem,2.1vw,1.7rem)] pt-[clamp(0.75rem,2vw,1.1rem)] pb-[clamp(0.6rem,1.8vw,1rem)] text-[1.05rem] text-[color:var(--admin-text)] max-md:w-full max-md:max-w-none max-md:my-0 max-md:rounded-none max-md:border-x-0 max-md:px-[clamp(0.85rem,3.8vw,1.3rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.3rem)] max-md:pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]";
const pageHeaderClassName = "relative flex min-h-[5rem] items-start justify-center px-[clamp(4.8rem,9vw,6.1rem)] pt-[0.1rem] text-center max-[768px]:min-h-0 max-[768px]:px-0 max-[768px]:pt-0";
const headingClassName = `${glassPageTitleClassName} !mt-0 !mb-0 !px-0 !text-center !whitespace-normal !text-[clamp(1.72rem,2.9vw,2.35rem)] !tracking-[0.03em] max-[768px]:!text-[clamp(1.92rem,8vw,2.6rem)] max-[768px]:!leading-[1.06] max-[768px]:!mt-0 max-[768px]:!mb-0`;
const guideCardClassName = "documents-subpanel relative overflow-hidden rounded-[1rem] p-[clamp(0.85rem,2.2vw,1.05rem)] text-[color:var(--admin-text)]";
const guideTitleClassName = "m-0 text-[1.06rem] font-[650] tracking-[0.01em]";
const guideListClassName = "m-[0.45rem_0_0] grid gap-[0.35rem] pl-[1.1rem] text-[0.94rem] text-[color:var(--admin-muted)] leading-[1.35]";
const backButtonClassName =
  "absolute left-0 top-[-0.15rem] z-[2] inline-flex !h-[4.85rem] !w-[4.85rem] items-center justify-center bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.08] focus-visible:outline-none active:scale-[0.98] min-[769px]:!h-[5.3rem] min-[769px]:!w-[5.3rem] max-[768px]:top-0 max-[768px]:left-[0.04rem]";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const metadata = {
  title: serverT("en", "admin.pages.rag.meta_title", undefined, "RAG Admin - SotsiaalAI"),
  description: serverT(
    "en",
    "admin.pages.rag.meta_description",
    undefined,
    "Upload and manage RAG materials."
  ),
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};
export default async function AdminRagPage() {
  noStore();
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const session = await getServerSession(authConfig);
  if (!session) {
    const params = new URLSearchParams({
      callbackUrl: localizePath("/admin/rag", locale)
    });
    redirect(`/api/auth/signin?${params.toString()}`);
  }
  const isAdmin = session.user?.isAdmin === true || String(session.user?.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) {
    redirect(localizePath("/", locale));
  }
  return <section className="documents-workspace mx-auto w-full px-[clamp(0.4rem,1.4vw,0.9rem)] py-[clamp(0.5rem,1.6vw,1rem)]"><div className={shellClassName} aria-labelledby="rag-admin-title">
      <header className={pageHeaderClassName}>
        <Link
          prefetch={false}
          href={localizePath("/#meist", locale)}
          className={backButtonClassName}
          aria-label={serverT(locale, "admin.common.back", undefined, "Back")}
        >
          <BackIcon className="h-[4.35rem] w-[4.35rem] min-[769px]:h-[4.75rem] min-[769px]:w-[4.75rem]" />
        </Link>
        <h1 id="rag-admin-title" className={headingClassName}>
          {serverT(locale, "admin.pages.rag.heading", undefined, "RAG Admin")}
        </h1>
      </header>
      <RagAdminClient />
      <div className={guideCardClassName} aria-label="RAG admin kasutusjuhis">
        <h2 className={guideTitleClassName}>Kasutusjuhis</h2>
        <ul className={guideListClassName}>
          <li>
            <strong>Ingest URL:</strong> lisa veebilink koos pealkirja, kirjelduse, siltide ja sihtrühmaga.
          </li>
          <li>
            <strong>PDF + metadata:</strong> lae PDF ja JSON metadata, kontrolli enne saatmist nupuga
            {" "}
            &quot;Validate metadata JSON&quot;.
          </li>
          <li>
            <strong>Articles ingest:</strong> kasuta seda siis, kui tahad sama dokumendi alla lisada artiklite kaupa lõigud.
          </li>
          <li>
            <strong>Documents:</strong> otsi, filtreeri ja sorteeri materjale; vali mitu kirjet korraga reindeximiseks.
          </li>
          <li>
            <strong>Detail vaade:</strong> ava materjal, et muuta metat või kustutada kirje.
          </li>
          <li>
            <strong>Run self-test:</strong> käivita kiire süsteemi kontroll, kui ingest või otsing käitub ootamatult.
          </li>
        </ul>
      </div>
    </div></section>;
}
