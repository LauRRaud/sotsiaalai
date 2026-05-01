"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPageTitleClassName,
  glassPrimaryButtonToneClassName
} from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-[1rem] py-[1rem] max-[768px]:[--mobile-glass-card-gap:clamp(0.14rem,0.8vw,0.22rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-[0.14rem]";

const panelClassName =
  `relative z-[21] w-full !max-w-[72rem] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] [scrollbar-gutter:stable_both-edges] px-[1.35rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.38rem,1.5vw,0.54rem)] max-[768px]:rounded-[1.2rem] max-[768px]:px-[0.38rem] max-[768px]:pb-[0.76rem] ${glassPageMobileCardClassName}`;

const headerClassName =
  "invite-modal-title-wrap mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]";
const titleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const titleClassName =
  `invite-modal-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ${glassPageTitleClassName} ` +
  "w-full max-[768px]:!mt-0 max-[768px]:!mb-0";
const bodyClassName =
  "mx-auto grid w-full gap-[1.1rem] px-[0.05rem] pt-[0.48rem] pb-[1.1rem] max-[768px]:gap-[0.82rem] max-[768px]:px-0 max-[768px]:pb-[0.88rem]";
const introClassName =
  "mx-auto m-0 max-w-[52rem] text-center text-[1.14rem] leading-[1.58] tracking-[0.018em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:px-[0.5rem] max-[768px]:text-[1.15rem]";
const tableWrapClassName =
  "w-full overflow-x-auto overscroll-x-contain rounded-[1.1rem] [scrollbar-gutter:stable] max-[768px]:rounded-[0.9rem]";
const tableClassName =
  "w-full min-w-[52rem] border-collapse text-left text-[1.05rem] leading-[1.5] tracking-[0.006em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:min-w-[48rem] max-[768px]:text-[1rem]";
const tableHeadCellClassName =
  "border-b border-[rgba(255,255,255,0.16)] px-[0.72rem] py-[0.72rem] font-[700] text-[color:var(--title-color,var(--brand-primary))] light:border-[rgba(122,58,56,0.16)]";
const tableCellClassName =
  "border-b border-[rgba(255,255,255,0.08)] px-[0.72rem] py-[0.78rem] align-middle light:border-[rgba(122,58,56,0.1)]";
const featureCellClassName = `${tableCellClassName} w-[36%] font-[500]`;
const planCellClassName = `${tableCellClassName} w-[21.33%] text-center`;
const priceClassName =
  "font-[700] text-[1.08em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const actionClassName =
  "!min-h-[2.62rem] !px-[1rem] !py-[0.64rem] !text-[0.98rem] !leading-[1.14] max-[768px]:!min-h-[2.8rem] max-[768px]:!text-[1rem] max-[768px]:!px-[0.8rem]";
const checkClassName =
  "inline-flex min-h-[1.65rem] min-w-[1.65rem] items-center justify-center text-[1.32rem] font-[700] text-[color:var(--title-color,var(--brand-primary))]";
const mutedClassName = "text-[color:var(--pt-180,#cbd5e1)] light:text-[color:var(--text-muted,#6b625c)]";
const noteClassName =
  "mx-auto m-0 max-w-[58rem] px-[0.3rem] text-left text-[1.04rem] leading-[1.58] tracking-[0.012em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:px-[0.55rem] max-[768px]:text-[1.06rem]";

const featureRows = [
  {
    key: "help",
    values: ["included", "included", "included"]
  },
  {
    key: "knowledge_base",
    values: ["dash", "included", "included"]
  },
  {
    key: "assistants_agents",
    values: ["dash", "included", "included"]
  },
  {
    key: "sources",
    values: ["dash", "included", "included"]
  },
  {
    key: "drafting",
    values: ["dash", "limited", "included"]
  },
  {
    key: "analysis",
    values: ["dash", "limited", "included"]
  },
  {
    key: "research",
    values: ["dash", "limited", "included"]
  },
  {
    key: "rooms",
    values: ["dash", "limited", "included"]
  },
  {
    key: "documents",
    values: ["dash", "dash", "included"]
  }
];

function PlanValue({ value, t }) {
  if (value === "included") {
    return (
      <span className={checkClassName} aria-label={t("about.pricing.values.included")}>
        &#10003;
      </span>
    );
  }
  if (value === "limited") {
    return <span className={mutedClassName}>{t("about.pricing.values.limited")}</span>;
  }
  return <span className={mutedClassName} aria-label={t("about.pricing.values.not_included")}>-</span>;
}

export default function HinnastusBody() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const panelRef = useRef(null);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const body = document.body;

    root?.classList.add("framework-page-scroll-lock");
    body?.classList.add("framework-page-scroll-lock");

    return () => {
      root?.classList.remove("framework-page-scroll-lock");
      body?.classList.remove("framework-page-scroll-lock");
    };
  }, []);

  const transitionOptions = {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      backWithTransition(router, transitionOptions);
      return;
    }

    pushWithTransition(router, localizePath("/", locale), transitionOptions);
  };

  const handleShellWheel = useCallback((event) => {
    const panel = panelRef.current;
    const target = event.target;
    if (!panel || panel.contains(target)) return;

    const maxScrollTop = panel.scrollHeight - panel.clientHeight;
    if (maxScrollTop <= 0) return;

    event.preventDefault();
    panel.scrollTop = Math.max(0, Math.min(maxScrollTop, panel.scrollTop + event.deltaY));
  }, []);

  const openRegistration = (pathname) => {
    pushWithTransition(router, localizePath(pathname, locale), {
      glassRingTilt: "right",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  };

  const actions = [
    { key: "free", path: "/registreerimine" },
    { key: "client", path: "/registreerimine?role=client" },
    { key: "worker", path: "/registreerimine?role=specialist" }
  ];

  return (
    <section className={shellClassName} lang={locale} onWheel={handleShellWheel}>
      <div ref={panelRef} className={panelClassName}>
        <BackButton
          onClick={handleBack}
          ariaLabel={t("buttons.back_previous")}
          className={`${glassPageBackTopLeftClassName} !z-[30] pointer-events-auto`}
        />

        <header className={headerClassName}>
          <div className={titleWrapClassName}>
            <h1 id="hinnastus-title" className={titleClassName}>
              {t("about.pricing.title")}
            </h1>
          </div>
        </header>

        <div className={bodyClassName}>
          <p className={introClassName}>{t("about.pricing.intro")}</p>

          <div className={tableWrapClassName}>
            <table className={tableClassName} aria-labelledby="hinnastus-title">
              <thead>
                <tr>
                  <th className={tableHeadCellClassName} scope="col">
                    {t("about.pricing.columns.feature")}
                  </th>
                  <th className={cn(tableHeadCellClassName, "text-center")} scope="col">
                    {t("about.pricing.columns.free")}
                  </th>
                  <th className={cn(tableHeadCellClassName, "text-center")} scope="col">
                    {t("about.pricing.columns.client")}
                  </th>
                  <th className={cn(tableHeadCellClassName, "text-center")} scope="col">
                    {t("about.pricing.columns.worker")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className={featureCellClassName} scope="row">
                    {t("about.pricing.rows.price")}
                  </th>
                  <td className={planCellClassName}>
                    <span className={priceClassName}>{t("about.pricing.prices.free")}</span>
                  </td>
                  <td className={planCellClassName}>
                    <span className={priceClassName}>{t("about.pricing.prices.client")}</span>
                  </td>
                  <td className={planCellClassName}>
                    <span className={priceClassName}>{t("about.pricing.prices.worker")}</span>
                  </td>
                </tr>
                <tr>
                  <th className={featureCellClassName} scope="row">
                    {t("about.pricing.rows.start")}
                  </th>
                  {actions.map((action) => (
                    <td key={action.key} className={planCellClassName}>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className={actionClassName}
                        onClick={() => openRegistration(action.path)}
                      >
                        {t(`about.pricing.actions.${action.key}`)}
                      </Button>
                    </td>
                  ))}
                </tr>
                {featureRows.map((row) => (
                  <tr key={row.key}>
                    <th className={featureCellClassName} scope="row">
                      {t(`about.pricing.features.${row.key}`)}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={`${row.key}-${index}`} className={planCellClassName}>
                        <PlanValue value={value} t={t} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={noteClassName}>{t("about.pricing.note")}</p>
        </div>
      </div>
    </section>
  );
}
