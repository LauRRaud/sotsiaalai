"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import {
  WORKER_FRAMEWORK_DOCX_HREF,
  WORKER_FRAMEWORK_REVIEW_STORAGE_KEY,
  WORKER_FRAMEWORK_SIGNED_HREF,
  WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY
} from "@/lib/frameworkAcceptances";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";

const shellClassName =
  "framework-page-shell relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-[1rem] py-[1rem] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:[--mobile-glass-card-gap:clamp(0.14rem,0.8vw,0.22rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-[0.14rem]";
const panelClassName =
  `relative z-[21] w-full !max-w-[clamp(35rem,57vw,50rem)] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[border:var(--glass-modal-border)] [background:var(--glass-modal-bg)] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] ` +
  `shadow-[var(--framework-panel-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] [scrollbar-gutter:stable_both-edges] px-[1.45rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.46rem,1.8vw,0.62rem)] max-[768px]:rounded-[1.2rem] max-[768px]:px-[0.46rem] max-[768px]:pb-[0.76rem] ${glassPageMobileCardClassName}`;
const headerClassName = "invite-modal-title-wrap mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]";
const headerInnerClassName =
  "grid w-full max-w-[clamp(34rem,58vw,48rem)] gap-[0.75rem] px-[0.15rem] max-[768px]:max-w-none max-[768px]:px-0";
const titleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const titleClassName =
  `framework-title invite-modal-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ${glassPageTitleClassName} ` +
  `w-full max-[768px]:!mt-0 max-[768px]:!mb-0`;
const leadClassName =
  "m-0 text-left text-[1.08rem] leading-[1.68] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.08rem]";
const bodyClassName =
  "framework-body mx-auto grid w-full max-w-[clamp(34rem,58vw,48rem)] gap-[1rem] px-[0.15rem] pt-[0.55rem] pb-[1.2rem] max-[768px]:w-full max-[768px]:max-w-none max-[768px]:gap-[0.82rem] max-[768px]:px-[0.12rem] max-[768px]:pb-[0.92rem]";
const surfaceClassName =
  "rounded-[1.15rem] border border-[var(--chat-invite-list-border,rgba(248,253,255,0.16))] bg-[rgba(30,32,38,0.42)] text-[color:var(--pt-120)] shadow-[var(--framework-panel-shadow,var(--chat-invite-shadow,var(--input-shadow)))] [.theme-light_&]:border-transparent [.theme-light_&]:bg-[rgba(255,255,255,0.58)] [.theme-light_&]:text-[#1f2937] [.theme-light_&]:shadow-[var(--input-shadow)]";
const introCardClassName =
  `framework-intro-card ${surfaceClassName} grid gap-[0.9rem] px-[1.25rem] py-[1.15rem] max-[768px]:gap-[0.72rem] max-[768px]:px-[0.72rem] max-[768px]:py-[0.82rem]`;
const sectionTitleClassName =
  "m-0 text-[1.14rem] font-[650] tracking-[0.01em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const introTextClassName =
  "m-0 text-[1.14rem] leading-[1.68] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.16rem]";
const documentCardClassName =
  `framework-document-card ${surfaceClassName} mx-auto grid w-full max-w-[clamp(33rem,56vw,47rem)] gap-[1rem] px-[1.55rem] py-[1.22rem] max-[768px]:w-full max-[768px]:max-w-[min(100%,27.5rem)] max-[768px]:gap-[0.78rem] max-[768px]:px-[0.72rem] max-[768px]:py-[0.82rem]`;
const documentStackClassName = "grid gap-[0.82rem]";
const docHeadingClassName =
  "m-0 pt-[0.55rem] text-[1.26rem] font-[680] leading-[1.3] tracking-[0.01em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const docSubheadingClassName =
  "m-0 pt-[0.2rem] text-[1.1rem] font-[640] leading-[1.45] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const docLabelClassName =
  "m-0 pt-[0.15rem] text-[1.02rem] font-[650] tracking-[0.01em] text-[color:var(--glass-modal-text-soft,var(--pt-120))]";
const docParagraphClassName =
  "m-0 text-[1.08rem] leading-[1.72] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.08rem]";
const docListClassName =
  "m-0 grid gap-[0.55rem] pl-[1.45rem] text-[1.08rem] leading-[1.68] max-[768px]:pl-[1.15rem]";
const docCheckRowClassName =
  "grid gap-[0.5rem] rounded-[0.95rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-[0.9rem] py-[0.75rem] [.theme-light_&]:border-[rgba(148,163,184,0.18)] [.theme-light_&]:bg-[rgba(255,255,255,0.5)]";
const docCheckRowOptionsClassName = "flex flex-wrap items-center gap-x-[1rem] gap-y-[0.45rem]";
const docCheckOptionClassName =
  "inline-flex items-center gap-[0.42rem] text-[1rem] leading-[1.35] text-[color:var(--glass-modal-text-soft,var(--pt-120))]";
const docCheckBoxClassName =
  "inline-flex h-[1.05rem] w-[1.05rem] items-center justify-center rounded-[0.24rem] border border-current text-[0.76rem] leading-none opacity-90";
const docChecklistClassName = "grid gap-[0.6rem]";
const docChecklistItemClassName =
  "flex items-start gap-[0.55rem] text-[1.08rem] leading-[1.68] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const actionRowClassName =
  "mx-auto flex w-full max-w-[26rem] flex-wrap items-center justify-center gap-[0.7rem] pt-[0.25rem] pb-[0.55rem] max-[768px]:grid max-[768px]:w-full max-[768px]:max-w-none max-[768px]:grid-cols-1 max-[768px]:pb-[0.7rem]";
const actionButtonClassName =
  "!min-h-[2.82rem] !px-[1.15rem] !py-[0.72rem] !text-[1.08rem] !leading-[1.12] max-[768px]:!w-full max-[768px]:!text-[1.1rem]";
const frameworkCheckboxRowClassName =
  "fancy-checkbox--otp fancy-checkbox--multiline w-full justify-start " +
  "[--otp-check-shape:var(--glass-modal-text,var(--pt-150))] [--otp-check-tick:#7A3A38] [--otp-check-text:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
  "[--otp-check-box-size:1.45rem] [--otp-check-font-size:1.08rem] [--otp-check-line-height:1.46] [--otp-check-text-max-width:100%] [--otp-check-text-max-width-mobile:100%] [--otp-check-box-offset:0.08rem]";

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

        if (block.type === "checkOptionsRow") {
          return (
            <div key={`${block.type}-${index}`} className={docCheckRowClassName}>
              <div className={docCheckRowOptionsClassName}>
                {block.options.map((option, optionIndex) => (
                  <span key={`${index}-${optionIndex}`} className={docCheckOptionClassName}>
                    <span className={docCheckBoxClassName} aria-hidden="true">
                      □
                    </span>
                    <span>{option}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "checkList") {
          return (
            <div key={`${block.type}-${index}`} className={docChecklistClassName}>
              {block.items.map((item, itemIndex) => (
                <div key={`${index}-${itemIndex}`} className={docChecklistItemClassName}>
                  <span className={`${docCheckBoxClassName} mt-[0.22rem] shrink-0`} aria-hidden="true">
                    □
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "bulletList") {
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
  return getNormalizedIntroCopy(locale);
}

function getNormalizedIntroCopy(locale) {
  if (locale === "ru") {
    return {
      introTitle: "Для чего нужен этот документ?",
      lead:
        "Документ описывает условия профессионального использования SotsiaalAI и основные принципы защиты данных. Прокрутите вниз, чтобы прочитать документ на сайте.",
      paragraphs: [
        "Если SotsiaalAI используется в рабочих задачах с персональными данными клиента или другого лица, до начала работы необходимо ознакомиться с рамочным документом и подписать подписанный SotsiaalAI рамочный документ вместе со своим работодателем или организацией.",
        "Подтверждение, данное на платформе, является отдельным подтверждением на уровне пользователя. Оно сохраняется в системе вместе с учетной записью, ролью, датой и временем, позже видно пользователю в разделе Documents, но не заменяет рамочный документ, который должен быть оформлен с работодателем или организацией."
      ]
    };
  }

  if (locale === "en") {
    return {
      introTitle: "What is this document for?",
      lead:
        "This document explains SotsiaalAI professional-use terms and the main data protection principles. Scroll down to read the document on the web.",
      paragraphs: [
        "If SotsiaalAI is used in work tasks with client or other personal data, the framework must be reviewed before starting and the SotsiaalAI-signed framework document must be signed together with the employer or organisation.",
        "The confirmation given in the platform is a separate user-level confirmation. It is stored in the system together with the account, role, date and time, is later visible to the user in Documents, but does not replace the framework document that must be completed with the employer or organisation."
      ]
    };
  }

  return {
    introTitle: "Milleks see dokument on?",
    lead:
      "Dokument selgitab SotsiaalAI tööalase kasutuse tingimusi ja peamisi andmekaitse põhimõtteid. Keri alla, et dokumenti veebis lugeda.",
    paragraphs: [
      "Kui SotsiaalAI-d kasutatakse tööülesannetes kliendi või muu isiku andmetega, tuleb enne alustamist tutvuda raamistikuga ning allkirjastada SotsiaalAI allkirjastatud raamdokument koos oma tööandja või asutusega.",
      "Platvormis antav kinnitus on sellest eraldi kasutaja tasandi kinnitus. See salvestatakse süsteemis koos konto, rolli, kuupäeva ja kellaajaga, on hiljem kasutajale nähtav ka Dokumentides, kuid ei asenda tööandja või asutusega vormistatavat raamdokumenti."
    ]
  };
}

export default function TooalaseRaamistikuBody({ frameworkDocument }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const introCopy = getIntroCopy(locale);
  const frameworkTitle = t("auth.register.worker_framework_title");
  const frameworkTitleMobileLines =
    locale === "et"
      ? (() => {
          const lastSpaceIndex = frameworkTitle.lastIndexOf(" ");
          if (lastSpaceIndex <= 0) return [frameworkTitle];
          return [
            frameworkTitle.slice(0, lastSpaceIndex),
            frameworkTitle.slice(lastSpaceIndex + 1)
          ];
        })()
      : null;
  const [frameworkStatus, setFrameworkStatus] = useState({
    loading: true,
    authenticated: false,
    eligible: false,
    acceptance: null
  });
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");

  const loadFrameworkStatus = useCallback(async () => {
    setFrameworkStatus((current) => ({
      ...current,
      loading: true
    }));

    try {
      const response = await fetch("/api/framework-acceptances/worker", {
        cache: "no-store",
        headers: {
          "x-ui-locale": locale
        }
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || t("documents.framework_acceptance.load_failed"));
      }

      setFrameworkStatus({
        loading: false,
        authenticated: payload?.authenticated === true,
        eligible: payload?.eligible === true,
        acceptance: payload?.acceptance || null
      });
      setSaveError("");
    } catch (error) {
      setFrameworkStatus({
        loading: false,
        authenticated: false,
        eligible: false,
        acceptance: null
      });
      setSaveError(error?.message || t("documents.framework_acceptance.load_failed"));
    }
  }, [locale, t]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timestamp =
      window.sessionStorage.getItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY) || new Date().toISOString();
    window.sessionStorage.setItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY, timestamp);
  }, []);

  useEffect(() => {
    void loadFrameworkStatus();
  }, [loadFrameworkStatus]);

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

  const handleSignedDownload = () => {
    if (typeof window === "undefined") return;
    const timestamp =
      window.sessionStorage.getItem(WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY) ||
      new Date().toISOString();
    window.sessionStorage.setItem(WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY, timestamp);
  };

  const handleSaveAcceptance = async () => {
    if (savePending) return;

    setSavePending(true);
    setSaveError("");
    setSaveNotice("");

    try {
      const frameworkReviewOpenedAt =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY) || null
          : null;
      const frameworkSignedDownloadedAt =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY) || null
          : null;

      const response = await fetch("/api/framework-acceptances/worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          locale,
          frameworkReviewOpenedAt,
          frameworkSignedDownloadedAt
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || t("documents.framework_acceptance.save_failed"));
      }

      setFrameworkStatus({
        loading: false,
        authenticated: true,
        eligible: true,
        acceptance: payload?.acceptance || null
      });
      setConfirmChecked(false);
      setSaveNotice(
        payload?.created
          ? t("documents.framework_acceptance.saved_notice")
          : t("documents.framework_acceptance.already_confirmed")
      );
    } catch (error) {
      setSaveError(error?.message || t("documents.framework_acceptance.save_failed"));
    } finally {
      setSavePending(false);
    }
  };

  const acceptance = frameworkStatus.acceptance || null;
  const isAccepted = acceptance?.accepted === true;
  const acceptedAtText = acceptance?.acceptedAt ? new Date(acceptance.acceptedAt).toLocaleString(locale || "et") : "";

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
                {locale === "et" ? (
                  <>
                    <span className="max-[768px]:hidden">{frameworkTitle}</span>
                    <span className="hidden max-[768px]:block">
                      <span className="block">{frameworkTitleMobileLines?.[0] || frameworkTitle}</span>
                      {frameworkTitleMobileLines?.[1] ? <span className="block">{frameworkTitleMobileLines[1]}</span> : null}
                    </span>
                  </>
                ) : (
                  frameworkTitle
                )}
              </h1>
            </div>
          </div>
        </header>

        <div className={bodyClassName}>
          <section className={introCardClassName} aria-labelledby="framework-intro-title">
            <h2 id="framework-intro-title" className={sectionTitleClassName}>
              {introCopy.introTitle}
            </h2>
            <p className={leadClassName}>{introCopy.lead}</p>
            {introCopy.paragraphs.map((paragraph, index) => (
              <p key={index} className={introTextClassName}>
                {paragraph}
              </p>
            ))}
            <div className={actionRowClassName}>
              <Button as="a" href={WORKER_FRAMEWORK_DOCX_HREF} download variant="primary" className={actionButtonClassName}>
                {t("auth.register.worker_framework_download_docx")}
              </Button>
              <Button
                as="a"
                href={WORKER_FRAMEWORK_SIGNED_HREF}
                download
                onClick={handleSignedDownload}
                variant="primary"
                className={actionButtonClassName}
              >
                {t("auth.register.worker_framework_download_signed")}
              </Button>
            </div>
            <div className={`${surfaceClassName} grid gap-[0.85rem] px-[1rem] py-[0.95rem] max-[768px]:gap-[0.72rem] max-[768px]:px-[0.72rem] max-[768px]:py-[0.82rem]`}>
              {frameworkStatus.loading ? (
                <p className={introTextClassName}>{t("documents.loading")}</p>
              ) : null}
              {!frameworkStatus.loading && saveError ? (
                <p className={introTextClassName}>{saveError}</p>
              ) : null}
              {!frameworkStatus.loading && frameworkStatus.eligible && isAccepted ? (
                <>
                  <p className={introTextClassName}>
                    {t("documents.framework_acceptance.manage_confirmed", { date: acceptedAtText })}
                  </p>
                  <div className={actionRowClassName}>
                    {acceptance?.documentDownloadUrl ? (
                      <Button as="a" href={acceptance.documentDownloadUrl} variant="primary" className={actionButtonClassName}>
                        {t("documents.framework_acceptance.download_record")}
                      </Button>
                    ) : null}
                    <Button
                      as="a"
                      href={WORKER_FRAMEWORK_SIGNED_HREF}
                      download
                      onClick={handleSignedDownload}
                      variant="primary"
                      className={actionButtonClassName}
                    >
                      {t("auth.register.worker_framework_download_signed")}
                    </Button>
                  </div>
                </>
              ) : null}
              {!frameworkStatus.loading && !isAccepted ? (
                <>
                  <FancyCheckbox
                    id="framework-page-ack"
                    name="frameworkAck"
                    checked={confirmChecked}
                    disabled={!frameworkStatus.eligible || savePending}
                    onChange={(next) => setConfirmChecked(next)}
                    label={t("auth.register.worker_framework_ack")}
                    className={frameworkCheckboxRowClassName}
                  />
                  {frameworkStatus.eligible ? (
                    <div className={actionRowClassName}>
                      <Button
                        type="button"
                        onClick={handleSaveAcceptance}
                        disabled={!confirmChecked || savePending}
                        variant="primary"
                        className={actionButtonClassName}
                      >
                        {savePending
                          ? t("documents.framework_acceptance.confirm_saving")
                          : t("documents.framework_acceptance.confirm_now")}
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : null}
              {saveNotice ? <p className={introTextClassName}>{saveNotice}</p> : null}
            </div>
          </section>

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
