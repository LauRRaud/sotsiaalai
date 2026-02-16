import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authConfig } from "@/auth";
import { serverT } from "@/lib/i18n/serverMessages";
import { getLocaleFromCookies } from "@/lib/i18n";
import { localizePath } from "@/lib/localizePath";
import { unstable_noStore as noStore } from "next/cache";
import CardTitle from "@/components/ui/CardTitle";
import BackIcon from "@/components/ui/icons/BackIcon";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import RagAdminClient from "./RagAdminClient";
const shellClassName = "glass-box mx-auto my-[clamp(1.1rem,3vw,2.2rem)] flex w-[min(100%,94vw)] max-w-[clamp(54rem,86vw,88rem)] flex-col gap-2 rounded-[1.5rem] border border-[color:var(--glass-border-color)] px-[clamp(1.25rem,2.8vw,2.3rem)] pt-[clamp(0.75rem,2vw,1.1rem)] pb-[clamp(0.6rem,1.8vw,1rem)] text-[1.05rem] text-[color:var(--admin-text)] [--rag-text:var(--admin-text)] [--rag-muted:var(--admin-muted)] max-md:w-full max-md:max-w-none max-md:my-0 max-md:rounded-none max-md:border-x-0 max-md:px-[clamp(0.85rem,3.8vw,1.3rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.3rem)] max-md:pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]";
const headingClassName = `${glassPageTitleClassName} !mt-0 !mb-1 !px-0 !text-left !whitespace-normal !text-[clamp(1.55rem,2.5vw,2.1rem)] !tracking-[0.02em] max-[48em]:!text-[clamp(1.72rem,7vw,2.35rem)] max-[48em]:!leading-[1.06] max-[48em]:!mt-0 max-[48em]:!mb-0`;
const guideCardClassName = "relative overflow-hidden rounded-[1rem] border border-[color:var(--glass-border-color,var(--admin-border))] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--admin-surface)_78%,var(--glass-surface-bg)_22%),color-mix(in_srgb,var(--admin-surface-2)_84%,transparent))] p-[clamp(0.85rem,2.2vw,1.05rem)] text-[color:var(--admin-text)]";
const guideTitleClassName = "m-0 text-[1.06rem] font-[650] tracking-[0.01em]";
const guideListClassName = "m-[0.45rem_0_0] grid gap-[0.35rem] pl-[1.1rem] text-[0.94rem] text-[color:var(--admin-muted)] leading-[1.35]";
const backButtonClassName = "inline-flex h-[4.6rem] w-[4.6rem] items-center justify-center bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.08] focus-visible:outline-none active:scale-[0.98]";
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
  return <div className={shellClassName} aria-labelledby="rag-admin-title">
      <CardTitle as="h1" id="rag-admin-title" className={headingClassName}>
        {serverT(locale, "admin.pages.rag.heading", undefined, "RAG Admin")}
      </CardTitle>
      <RagAdminClient />
      <div className={guideCardClassName} aria-label="RAG admin kasutusjuhis">
        <h2 className={guideTitleClassName}>Kasutusjuhis</h2>
        <ul className={guideListClassName}>
          <li>
            <strong>Ingest URL:</strong> lisa veebilink koos pealkirja, kirjelduse, siltide ja sihtrühmaga.
          </li>
          <li>
            <strong>PDF + metadata:</strong> lae PDF ja JSON metadata, kontrolli enne saatmist nupuga "Validate metadata JSON".
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
      <div className="flex justify-center pt-1">
        <Link
          prefetch={false}
          href={localizePath("/#meist", locale)}
          className={backButtonClassName}
          aria-label={serverT(locale, "admin.common.back", undefined, "Back")}
        >
          <BackIcon className="h-[4.2rem] w-[4.2rem]" />
        </Link>
      </div>
    </div>;
}
