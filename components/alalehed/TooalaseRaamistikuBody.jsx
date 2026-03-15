"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";

const FRAMEWORK_SIGNED_HREF = "/legal/SotsiaalAI_raamdokument.asice";
const FRAMEWORK_DOCX_HREF = "/legal/SotsiaalAI_raamdokument.docx";

const shellClassName =
  "framework-page-shell relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-[1rem] py-[1rem] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:justify-start max-[768px]:px-[0.25rem] max-[768px]:py-[0.5rem]";
const panelClassName =
  `relative z-[21] w-full !max-w-[clamp(48rem,74vw,70rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[border:var(--glass-modal-border)] [background:var(--glass-modal-bg)] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] ` +
  `shadow-[var(--glass-modal-shadow)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] px-[1.45rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:rounded-[1.45rem] max-[768px]:px-[1rem] max-[768px]:pb-[1rem] ${glassPageMobileCardClassName}`;
const headerClassName = "mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]";
const headerInnerClassName =
  "grid w-full max-w-[42rem] gap-[0.75rem] px-[2.8rem] text-center max-[768px]:max-w-none max-[768px]:px-[clamp(1rem,4vw,1.4rem)]";
const titleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const titleClassName =
  `${glassPageTitleClassName} w-full max-[768px]:!mt-0 max-[768px]:!mb-0 min-[769px]:!mt-[1.05rem] min-[769px]:!mb-[0.35rem]`;
const leadClassName =
  "mx-auto max-w-[44rem] text-center text-[1.04rem] leading-[1.55] text-[color:var(--glass-modal-text-soft,var(--pt-120))] max-[768px]:text-[1.08rem]";
const bodyClassName =
  "mx-auto grid w-full max-w-[clamp(38rem,66vw,58rem)] gap-[1rem] px-[0.15rem] pt-[0.55rem] pb-[0.2rem] max-[768px]:max-w-none max-[768px]:gap-[0.82rem] max-[768px]:px-[0.1rem]";
const surfaceClassName =
  "rounded-[1.15rem] border border-[var(--chat-invite-list-border,rgba(248,253,255,0.16))] bg-[rgba(30,32,38,0.42)] text-[color:var(--pt-120)] shadow-[var(--chat-invite-shadow,var(--input-shadow))] [.theme-light_&]:border-transparent [.theme-light_&]:bg-[rgba(255,255,255,0.58)] [.theme-light_&]:text-[#1f2937] [.theme-light_&]:shadow-[var(--input-shadow)]";
const introCardClassName = `${surfaceClassName} grid gap-[0.9rem] px-[1.25rem] py-[1.15rem] max-[768px]:gap-[0.75rem] max-[768px]:px-[1rem] max-[768px]:py-[0.95rem]`;
const sectionTitleClassName =
  "m-0 text-[1.08rem] font-[650] tracking-[0.01em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const introTextClassName =
  "m-0 text-[1rem] leading-[1.62] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.05rem]";
const prefaceClassName = `${surfaceClassName} grid gap-[0.72rem] px-[1.25rem] py-[1.1rem] max-[768px]:px-[1rem] max-[768px]:py-[0.92rem]`;
const documentCardClassName = `${surfaceClassName} grid gap-[0.9rem] px-[1.25rem] py-[1.15rem] max-[768px]:gap-[0.8rem] max-[768px]:px-[1rem] max-[768px]:py-[0.95rem]`;
const documentStackClassName = "grid gap-[0.82rem]";
const docHeadingClassName =
  "m-0 pt-[0.55rem] text-[1.16rem] font-[680] leading-[1.3] tracking-[0.01em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const docSubheadingClassName =
  "m-0 pt-[0.2rem] text-[1.03rem] font-[640] leading-[1.45] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const docLabelClassName =
  "m-0 pt-[0.15rem] text-[0.98rem] font-[650] uppercase tracking-[0.05em] text-[color:var(--glass-modal-text-soft,var(--pt-120))]";
const docParagraphClassName =
  "m-0 text-[1rem] leading-[1.65] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.04rem]";
const docListClassName = "m-0 grid gap-[0.5rem] pl-[1.3rem] text-[1rem] leading-[1.6] max-[768px]:pl-[1.1rem]";
const actionRowClassName =
  "flex flex-wrap items-center gap-[0.7rem] pt-[0.25rem] max-[768px]:grid max-[768px]:grid-cols-1";
const actionButtonClassName =
  "!min-h-[2.82rem] !px-[1.15rem] !py-[0.72rem] !text-[1rem] !leading-[1.12] max-[768px]:!w-full max-[768px]:!text-[1.08rem]";

function FrameworkBlocks({ blocks = [] }) {
  return (
    <div className={documentStackClassName}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`${block.type}-${index}`} className={docHeadingClassName}>
              {block.text}
            </h3>
          );
        }

        if (block.type === "subheading") {
          return (
            <h4 key={`${block.type}-${index}`} className={docSubheadingClassName}>
              {block.text}
            </h4>
          );
        }

        if (block.type === "label") {
          return (
            <p key={`${block.type}-${index}`} className={docLabelClassName}>
              {block.text}
            </p>
          );
        }

        if (block.type === "bulletList" || block.type === "checkList") {
          return (
            <ul key={`${block.type}-${index}`} className={docListClassName}>
              {block.items.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`} className={docParagraphClassName}>
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className={docParagraphClassName}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function getIntroCopy(locale) {
  if (locale === "ru") {
    return {
      lead:
        "На этой странице можно заранее прочитать весь рамочный документ рабочего использования и обработки данных перед подтверждением в регистрации.",
      paragraphs: [
        "Этот документ объединяет в одном месте правила рабочего использования, подтверждение работника, контрольные точки по защите данных и, при необходимости, условия обработки данных от имени организации.",
        "Если работодатель или организация хочет разрешить использование SotsiaalAI с идентифицируемыми данными клиента или другого лица, документ нужно сначала просмотреть, а при необходимости скачать подписанную версию и согласовать её внутри организации.",
        "Отметка работника в регистрации сама по себе не делает документ автоматически обязательным для организации. Для этого может потребоваться отдельное подписание или иное доказуемое электронное акцептование."
      ]
    };
  }

  if (locale === "en") {
    return {
      lead:
        "This page lets you review the full professional-use and data-processing framework before giving the confirmation in registration.",
      paragraphs: [
        "The document brings together professional-use rules, worker acknowledgement, data protection checkpoints and, where needed, processor terms for organisation-side use.",
        "If an employer or organisation wants to allow SotsiaalAI to be used with identifiable client or other personal data, the framework should be reviewed first and the signed version downloaded where needed for internal coordination.",
        "A worker-level checkbox in registration does not by itself make the framework automatically binding on the organisation. That may require separate signing or another provable electronic acceptance."
      ]
    };
  }

  return {
    lead:
      "Siin lehel saad enne kinnituse andmist kogu tööalase kasutuse ja andmetöötluse raamdokumendi läbi lugeda.",
    paragraphs: [
      "Dokument koondab ühte kohta tööalase kasutuse reeglid, töötaja kinnituse, andmekaitse kontrollpunktid ning vajaduse korral SotsiaalAI volitatud töötleja tingimused organisatsiooni nimel kasutamise puhuks.",
      "Kui tööandja või organisatsioon soovib lubada SotsiaalAI kasutamist kliendi või muu isiku tuvastatavate andmetega, tuleks dokument enne kasutuse alustamist üle vaadata ning vajaduse korral laadida alla meiepoolne allkirjastatud versioon.",
      "Töötaja tasandi kinnitamine registreerimisel ei muuda dokumenti automaatselt organisatsiooni suhtes siduvaks. Selleks võib olla vaja eraldi allkirjastamist või muud tõendatavat elektroonilist aktsepteerimist."
    ]
  };
}

export default function TooalaseRaamistikuBody({ frameworkDocument }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const introCopy = getIntroCopy(locale);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      backWithTransition(router, {
        glassRingTilt: "left",
        waitForGlassRingTilt: true,
        persistGlassRingTilt: false
      });
      return;
    }
    pushWithTransition(router, localizePath("/", locale), {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  };

  return (
    <section className={shellClassName} lang={locale}>
      <div className={panelClassName}>
        <BackButton
          onClick={handleBack}
          ariaLabel={t("buttons.back_previous")}
          className={`${glassPageBackTopLeftClassName} !z-[30] pointer-events-auto`}
        />

        <header className={headerClassName}>
          <div className={headerInnerClassName}>
            <div className={titleWrapClassName}>
              <h1 id="worker-framework-title" className={titleClassName}>
                {t("auth.register.worker_framework_title")}
              </h1>
            </div>
            <p className={leadClassName}>{introCopy.lead}</p>
          </div>
        </header>

        <div className={bodyClassName}>
          <section className={introCardClassName} aria-labelledby="framework-intro-title">
            <h2 id="framework-intro-title" className={sectionTitleClassName}>
              {locale === "et" ? "Milleks see dokument on?" : locale === "ru" ? "Для чего нужен этот документ?" : "What is this document for?"}
            </h2>
            {introCopy.paragraphs.map((paragraph, index) => (
              <p key={index} className={introTextClassName}>
                {paragraph}
              </p>
            ))}
            <div className={actionRowClassName}>
              <Button as="a" href={FRAMEWORK_SIGNED_HREF} download variant="primary" className={actionButtonClassName}>
                {t("auth.register.worker_framework_download_signed")}
              </Button>
              <Button as="a" href={FRAMEWORK_DOCX_HREF} download variant="primary" className={actionButtonClassName}>
                {t("auth.register.worker_framework_download_docx")}
              </Button>
            </div>
          </section>

          {frameworkDocument?.prefaceBlocks?.length ? (
            <section className={prefaceClassName} aria-labelledby="framework-preface-title">
              <h2 id="framework-preface-title" className={sectionTitleClassName}>
                {locale === "et" ? "Dokumendi sissejuhatus" : locale === "ru" ? "Введение документа" : "Document introduction"}
              </h2>
              <FrameworkBlocks blocks={frameworkDocument.prefaceBlocks} />
            </section>
          ) : null}

          <section className={documentCardClassName} aria-labelledby="framework-document-title">
            <h2 id="framework-document-title" className={sectionTitleClassName}>
              {frameworkDocument?.title || t("auth.register.worker_framework_title")}
            </h2>
            <FrameworkBlocks blocks={frameworkDocument?.documentBlocks || []} />
          </section>
        </div>
      </div>
    </section>
  );
}
