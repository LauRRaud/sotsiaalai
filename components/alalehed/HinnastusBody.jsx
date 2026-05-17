"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import AppLink from "@/components/ui/Link";
import Button from "@/components/ui/Button";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import {
  glassFullPanelMobileHeaderClassName,
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName
} from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ${glassFullPanelMobileHeaderClassName} ` +
  "relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-[1rem] py-[1rem] max-[768px]:justify-start max-[768px]:px-0";

const panelClassName =
  `hinnastus-panel relative z-[21] w-full !max-w-[62rem] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] [scrollbar-gutter:stable_both-edges] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 px-[1.35rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[--glass-ring-pad-x:clamp(0.22rem,0.9vw,0.34rem)] max-[768px]:rounded-[1.05rem] max-[768px]:px-[0.28rem] max-[768px]:pb-[0.48rem] ${glassPageMobileCardClassName}`;

const bodyClassName =
  "mx-auto grid w-full gap-[0.5rem] px-[1rem] pt-[0.24rem] pb-[0.22rem] max-[768px]:gap-[0.38rem] max-[768px]:px-[0.48rem] max-[768px]:pb-[0.18rem]";
const introClassName =
  "mx-auto mb-[0.56rem] w-full max-w-[57rem] px-[0.4rem] text-left text-[1.13rem] leading-[1.58] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:mb-[0.46rem] max-[768px]:px-[0.28rem] max-[768px]:text-[1.05rem] max-[768px]:leading-[1.48]";
const featuresLinkClassName =
  `${linkBrandInlineClass} inline underline decoration-[0.08em] underline-offset-[0.16em] text-[1em] leading-[inherit] tracking-[inherit] text-[color:var(--title-color,var(--brand-primary))] [--link-brand-text:var(--title-color,var(--brand-primary))]`;
const tableWrapClassName =
  "w-full overflow-x-auto overscroll-x-contain rounded-[0.7rem] max-[768px]:rounded-[0.55rem]";
const tableClassName =
  "w-full min-w-full table-fixed border-collapse text-left text-[1.02rem] leading-[1.38] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:min-w-[46rem] max-[768px]:text-[0.96rem]";
const tableHeadCellClassName =
  "border-b border-[rgba(255,255,255,0.16)] px-[0.42rem] py-[0.46rem] font-[700] text-[color:var(--title-color,var(--brand-primary))] light:border-[rgba(122,58,56,0.16)]";
const tableCellClassName =
  "border-b border-[rgba(255,255,255,0.08)] px-[0.42rem] py-[0.5rem] align-middle light:border-[rgba(122,58,56,0.1)]";
const featureCellClassName = `${tableCellClassName} font-[500]`;
const planCellClassName = `${tableCellClassName} text-center`;
const priceClassName =
  "font-[700] text-[1.08em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const actionClassName =
  "!min-h-[2.22rem] !px-[0.72rem] !py-[0.48rem] !text-[0.94rem] !leading-[1.1] max-[768px]:!min-h-[2.25rem] max-[768px]:!text-[0.9rem] max-[768px]:!px-[0.55rem]";
const checkClassName =
  "inline-flex min-h-[1.42rem] min-w-[1.42rem] items-center justify-center text-[1.24rem] font-[700] text-[color:var(--title-color,var(--brand-primary))]";
const mutedClassName = "text-[color:var(--pt-180,#cbd5e1)] light:text-[color:var(--text-muted,#6b625c)]";
const noteClassName =
  "mx-auto mt-[0.72rem] w-full max-w-[57rem] px-[0.4rem] text-left text-[1.04rem] leading-[1.58] tracking-[0.012em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:mt-[0.56rem] max-[768px]:px-[0.28rem] max-[768px]:text-[1.06rem]";

const planKeys = ["free", "client", "worker", "provider"];
const planColumnClassName = "w-[17.5%]";

const featureRows = [
  {
    key: "workspace",
    values: ["simple", "client_view", "worker_view", "provider_view"]
  },
  {
    key: "help",
    values: ["included", "included", "included", "included"]
  },
  {
    key: "service_card",
    values: ["included", "included", "included", "included"]
  },
  {
    key: "knowledge_base",
    values: ["dash", "included", "included", "included"]
  },
  {
    key: "assistants_agents",
    values: ["dash", "included", "included", "included"]
  },
  {
    key: "sources",
    values: ["dash", "included", "included", "included"]
  },
  {
    key: "rooms",
    values: ["listing_only", "included", "included", "included"]
  },
  {
    key: "drafting",
    values: ["dash", "limited", "extended", "unlimited"]
  },
  {
    key: "analysis",
    values: ["dash", "limited", "extended", "unlimited"]
  },
  {
    key: "research",
    values: ["dash", "limited", "extended", "unlimited"]
  },
  {
    key: "documents",
    values: ["dash", "limited", "extended", "unlimited"]
  },
  {
    key: "pre_inquiry",
    values: ["dash", "included", "dash", "dash"]
  },
  {
    key: "intake",
    values: ["dash", "dash", "by_agreement", "included"]
  },
  {
    key: "kovisioon",
    values: ["dash", "dash", "included", "included"]
  },
  {
    key: "materials_adding",
    values: ["dash", "dash", "included", "included"]
  },
  {
    key: "service_card_listing",
    values: ["dash", "dash", "dash", "included"]
  },
  {
    key: "service_profile",
    values: ["dash", "dash", "dash", "included"]
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
  if (value === "dash") {
    return <span className={mutedClassName} aria-label={t("about.pricing.values.not_included")}>-</span>;
  }
  return <span className={mutedClassName}>{t(`about.pricing.values.${value}`)}</span>;
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

  const openFeatures = (event) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    event.preventDefault();
    pushWithTransition(router, localizePath("/voimalused", locale), {
      glassRingTilt: "right",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  };

  const actions = [
    { key: "free", type: "button", path: "/registreerimine" },
    { key: "client", type: "button", path: "/registreerimine?role=client" },
    { key: "worker", type: "button", path: "/registreerimine?role=specialist" },
    { key: "provider", type: "button", path: "/registreerimine?role=provider" }
  ];

  return (
    <section className={shellClassName} lang={locale} onWheel={handleShellWheel}>
      <div ref={panelRef} className={panelClassName}>
        <GlassSubpageHeader
          onBack={handleBack}
          backAriaLabel={t("buttons.back_previous")}
          titleId="hinnastus-title"
        >
          {t("about.pricing.title")}
        </GlassSubpageHeader>

        <div className={bodyClassName}>
          <p className={introClassName}>
            {t("about.pricing.intro")}{" "}
            <AppLink
              href="/voimalused"
              onClick={openFeatures}
              className={featuresLinkClassName}
            >
              {t("about.links.features")}
            </AppLink>
          </p>

          <div className={tableWrapClassName}>
            <table className={tableClassName} aria-labelledby="hinnastus-title">
              <colgroup>
                <col className="w-[30%]" />
                {planKeys.map((planKey) => (
                  <col key={planKey} className={planColumnClassName} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName} scope="col">
                    {t("about.pricing.columns.feature")}
                  </th>
                  {planKeys.map((planKey) => (
                    <th key={planKey} className={cn(tableHeadCellClassName, "text-center")} scope="col">
                      {t(`about.pricing.columns.${planKey}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className={featureCellClassName} scope="row">
                    {t("about.pricing.rows.price")}
                  </th>
                  {planKeys.map((planKey) => (
                    <td key={planKey} className={planCellClassName}>
                      <span className={priceClassName}>{t(`about.pricing.prices.${planKey}`)}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className={featureCellClassName} scope="row">
                    {t("about.pricing.rows.start")}
                  </th>
                  {actions.map((action) => (
                    <td key={action.key} className={planCellClassName}>
                      {action.type === "button" ? (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className={actionClassName}
                          onClick={() => openRegistration(action.path)}
                        >
                          {t(`about.pricing.actions.${action.key}`)}
                        </Button>
                      ) : (
                        <span className={mutedClassName}>{t(`about.pricing.actions.${action.key}`)}</span>
                      )}
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
