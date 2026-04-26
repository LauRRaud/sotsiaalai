"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import BackButton from "@/components/ui/BackButton";
import { glassPageBackTopLeftClassName } from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";

import { getRagAdminCopy } from "./ragAdminCopy";
import RagAdminRemediationContext from "./RagAdminRemediationContext";
import {
  ragAdminPageShellClassName,
  ragAdminShellCardClassName,
  ragAdminShellDividerClassName,
  ragAdminShellInnerClassName,
  ragAdminShellNavClassName,
  ragAdminShellNavLinkClassName,
  ragAdminShellSubtitleClassName,
  ragAdminShellTitleClassName
} from "./ragAdminShellStyles";

const NAV_ORDER = ["documents", "ingest", "kov", "organizations"];

function buildNav(locale, copy) {
  const localized = path => localizePath(path, locale);

  return {
    documents: {
      href: localized("/admin/rag/documents"),
      label: copy.nav.documents
    },
    ingest: {
      href: localized("/admin/rag/ingest"),
      label: copy.nav.ingest
    },
    kov: {
      href: localized("/admin/rag/kov"),
      label: copy.nav.kov
    },
    organizations: {
      href: localized("/admin/rag/organizations"),
      label: copy.nav.organizations
    }
  };
}

export default function RagAdminPageFrame({
  locale,
  activeKey = "documents",
  title,
  subtitle,
  children
}) {
  const router = useRouter();
  const copy = getRagAdminCopy(locale);
  const nav = buildNav(locale, copy);

  return (
    <section className={ragAdminPageShellClassName}>
      <div className={`${ragAdminShellInnerClassName} max-w-[56rem] text-[color:var(--documents-page-text)]`}>
        <div className={ragAdminShellCardClassName}>
          <BackButton
            ariaLabel={locale?.startsWith("et") ? "Tagasi" : "Back"}
            className={glassPageBackTopLeftClassName}
            onClick={() => router.push(localizePath("/", locale))}
          />

          <h1 className={ragAdminShellTitleClassName}>{title || copy.heading}</h1>
          {subtitle ? <p className={ragAdminShellSubtitleClassName}>{subtitle}</p> : null}
          <div className={ragAdminShellDividerClassName} />

          <nav className={ragAdminShellNavClassName} aria-label={copy.heading}>
            {NAV_ORDER.map(key => {
              const item = nav[key];
              const isActive = activeKey === key;

              return (
                <Link
                  key={key}
                  prefetch={false}
                  href={item.href}
                  className={ragAdminShellNavLinkClassName}
                  data-checked={isActive ? "true" : "false"}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <RagAdminRemediationContext locale={locale} />
        </div>

        {children}
      </div>
    </section>
  );
}
