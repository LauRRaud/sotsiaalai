"use client";

import Link from "next/link";

import BackButton from "@/components/ui/BackButton";
import {
  glassPageBackTopLeftClassName
} from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";

import { getRagAdminCopy } from "./ragAdminCopy";
import {
  ragAdminPageShellClassName,
  ragAdminShellCardClassName,
  ragAdminShellDividerClassName,
  ragAdminShellInnerClassName,
  ragAdminShellNavClassName,
  ragAdminShellNavLinkClassName,
  ragAdminShellTitleClassName
} from "./ragAdminShellStyles";

const NAV_KEYS = ["documents", "ingest", "kov", "organizations", "sourcePackages"];

export default function RagAdminLandingWorkspace({ locale }) {
  const copy = getRagAdminCopy(locale);

  return (
    <section className={ragAdminPageShellClassName}>
      <div className={`${ragAdminShellInnerClassName} max-w-[56rem]`}>
        <div className={ragAdminShellCardClassName}>
          <BackButton
            ariaLabel={locale?.startsWith("et") ? "Tagasi" : "Back"}
            className={glassPageBackTopLeftClassName}
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.assign(localizePath("/", locale));
              }
            }}
          />

          <h1 className={ragAdminShellTitleClassName}>{copy.heading}</h1>
          <div className={ragAdminShellDividerClassName} />

          <nav className={ragAdminShellNavClassName} aria-label={copy.heading}>
            {NAV_KEYS.map(key => (
              <Link
                key={key}
                prefetch={false}
                href={localizePath(`/admin/rag/${key === "documents" ? "documents" : key === "sourcePackages" ? "source-packages" : key}`)}
                className={ragAdminShellNavLinkClassName}
              >
                <span>{copy.nav[key]}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
