"use client";

import { useSearchParams } from "next/navigation";

import { buildRemediationContext } from "./remediationContext";

const shellClassName =
  "mt-3 grid gap-2 rounded-[12px] border border-[color-mix(in_srgb,var(--documents-accent)_42%,var(--documents-card-border)_58%)] " +
  "bg-[color-mix(in_srgb,var(--documents-accent)_10%,var(--documents-subpanel-bg)_90%)] px-3 py-2 text-[color:var(--documents-page-text)]";
const headClassName = "flex flex-wrap items-start justify-between gap-2";
const titleClassName = "text-[0.9rem] font-[700]";
const bodyClassName = "text-[0.82rem] leading-[1.42] text-[color:var(--documents-page-muted)]";
const chipWrapClassName = "flex flex-wrap gap-1.5";
const chipClassName =
  "inline-flex max-w-full items-center rounded-full border border-[color:var(--documents-card-border)] bg-[color:var(--documents-content-bg)] px-2 py-0.5 text-[0.75rem] font-[650] text-[color:var(--documents-page-text)]";
const labelClassName = "text-[0.72rem] font-[700] uppercase tracking-[0.06em] text-[color:var(--documents-page-muted)]";
const metaGridClassName = "grid gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]";
const metaItemClassName = "min-w-0 rounded-[10px] border border-[color:var(--documents-card-border)] bg-[color:var(--documents-content-bg)] px-2 py-1.5";
const metaValueClassName = "truncate text-[0.78rem] font-[650] text-[color:var(--documents-page-text)]";

export default function RagAdminRemediationContext({ locale = "en" }) {
  const searchParams = useSearchParams();
  const context = buildRemediationContext(searchParams, locale);
  const et = String(locale || "").toLowerCase().startsWith("et");

  if (!context) return null;

  return (
    <section className={shellClassName} aria-label={et ? "Parandustöö kontekst" : "Remediation context"}>
      <div className={headClassName}>
        <div>
          <div className={titleClassName}>{et ? "Quality queue parandustöö" : "Quality queue fix context"}</div>
          <div className={bodyClassName}>
            {et
              ? "See vaade avati admin analytics quality queue lingilt. Allpool on paranduse siht ja väljad, mida kontrollida."
              : "This view was opened from an admin analytics quality queue link. The target and fields to review are shown below."}
          </div>
        </div>
        <span className={chipClassName}>{context.actionLabel}</span>
      </div>

      {context.fieldLabels.length > 0 ? (
        <div className={chipWrapClassName}>
          <span className={labelClassName}>{et ? "Väljad" : "Fields"}</span>
          {context.fieldLabels.map(field => (
            <span key={field} className={chipClassName}>{field}</span>
          ))}
        </div>
      ) : null}

      {context.recommendedFieldLabels.length > 0 ? (
        <div className={chipWrapClassName}>
          <span className={labelClassName}>{et ? "Soovituslikud" : "Recommended"}</span>
          {context.recommendedFieldLabels.map(field => (
            <span key={field} className={chipClassName}>{field}</span>
          ))}
        </div>
      ) : null}

      {context.focus || context.fileKey ? (
        <div className={chipWrapClassName}>
          <span className={labelClassName}>{et ? "Fookus" : "Focus"}</span>
          {context.focus ? <span className={chipClassName}>{context.focus}</span> : null}
          {context.fileKey ? <span className={chipClassName}>file_key: {context.fileKey}</span> : null}
        </div>
      ) : null}

      {context.identifiers.length > 0 ? (
        <div className={metaGridClassName}>
          {context.identifiers.map(([key, value]) => (
            <div key={key} className={metaItemClassName}>
              <div className={labelClassName}>{key}</div>
              <div className={metaValueClassName} title={value}>{value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
