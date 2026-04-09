import Link from "next/link";

import { localizePath } from "@/lib/localizePath";

import { getRagAdminCopy } from "./ragAdminCopy";

const outerClassName =
  "relative overflow-hidden rounded-[1.7rem] border border-[color:var(--glass-border-color,var(--documents-card-border))] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--documents-card-bg)_74%,rgba(255,255,255,0.1)_26%),color-mix(in_srgb,var(--documents-subpanel-bg)_70%,rgba(255,255,255,0.05)_30%))] p-[clamp(1rem,2.4vw,1.45rem)] shadow-[0_24px_75px_rgba(10,18,32,0.16)] backdrop-blur-[18px]";
const outerGlowClassName =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_36%)]";
const innerClassName = "relative z-[1] grid gap-4";
const gridClassName = "grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))]";
const cardClassName =
  "group relative block overflow-hidden rounded-[1.35rem] border border-[color:var(--documents-card-border)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--documents-content-bg)_78%,rgba(255,255,255,0.12)_22%),color-mix(in_srgb,var(--documents-card-bg)_82%,transparent))] p-[1.15rem] text-inherit no-underline shadow-[0_14px_45px_rgba(10,18,32,0.12)] transition-transform duration-150 ease-out hover:-translate-y-[2px]";
const cardGlowClassName =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_35%)] opacity-80";
const cardTitleClassName = "relative z-[1] text-[1.18rem] font-semibold tracking-[-0.02em] text-[color:var(--documents-page-text)]";
const cardBodyClassName = "relative z-[1] mt-3 text-[0.95rem] leading-[1.62] text-[color:var(--documents-page-muted)]";
const cardLinkClassName =
  "relative z-[1] mt-6 inline-flex min-h-[2.9rem] items-center rounded-[999px] border border-[color:var(--documents-accent)] bg-[color-mix(in_srgb,var(--documents-accent)_16%,rgba(255,255,255,0.08)_84%)] px-4 py-2 text-[0.94rem] font-semibold text-[color:var(--documents-page-text)] no-underline transition-transform duration-150 ease-out group-hover:-translate-y-[1px]";

export default function RagAdminLandingCards({ locale }) {
  const copy = getRagAdminCopy(locale);

  return (
    <section className={outerClassName}>
      <div className={outerGlowClassName} />
      <div className={innerClassName}>
        <div className={gridClassName}>
          {copy.landing.cards.map(card => (
            <Link key={card.href} prefetch={false} href={localizePath(card.href, locale)} className={cardClassName}>
              <div className={cardGlowClassName} />
              <h2 className={cardTitleClassName}>{card.title}</h2>
              <p className={cardBodyClassName}>{card.body}</p>
              <span className={cardLinkClassName}>
                {card.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
