import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { unstable_noStore as noStore } from "next/cache";
import CardTitle from "@/components/ui/CardTitle";
import RagAdminClient from "./RagAdminClient";
const shellClassName = "mx-auto my-[clamp(1.4rem,3vw,2.4rem)] flex w-[min(100%,92vw)] max-w-[clamp(46rem,78vw,68rem)] flex-col gap-[0.9em] rounded-[1.5em] bg-[color:var(--glass-surface-bg)] px-[clamp(1.8rem,3.6vw,2.6rem)] pt-[clamp(0.8rem,2.2vw,1.2rem)] pb-[clamp(1.2rem,3.4vw,2rem)] text-[1.12rem] text-[color:var(--admin-text)] backdrop-blur-[var(--glass-blur-radius)] [--rag-text:var(--admin-text)] [--rag-muted:var(--admin-muted)] max-md:w-full max-md:max-w-none max-md:rounded-none max-md:my-0 max-md:px-[clamp(1rem,4vw,1.5rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.6rem)] max-md:pb-[clamp(2rem,8vw,2.9rem)]";
const backButtonClassName = "inline-flex h-[5.2rem] w-[5.2rem] items-center justify-center bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.12] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[4.8rem] w-[4.8rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')]";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const metadata = {
  title: "RAG andmebaasi haldus - SotsiaalAI",
  description: "Laadi ules ja halda RAG materjale.",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};
export default async function AdminRagPage() {
  noStore();
  const session = await getServerSession(authConfig);
  if (!session) {
    const params = new URLSearchParams({
      callbackUrl: "/admin/rag"
    });
    redirect(`/api/auth/signin?${params.toString()}`);
  }
  const isAdmin = session.user?.isAdmin === true || String(session.user?.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) {
    redirect("/");
  }
  return <div className={shellClassName} aria-labelledby="rag-admin-title" lang="et">
      <CardTitle as="h1" id="rag-admin-title" className="text-[clamp(1.35rem,2.4vw,2rem)]">
        RAG andmebaasi haldus
      </CardTitle>
      <RagAdminClient />
      <div className="flex justify-center">
        <Link href="/#meist" className={backButtonClassName} aria-label="Tagasi">
          <span className={backIconClassName} aria-hidden="true" />
        </Link>
      </div>
    </div>;
}
