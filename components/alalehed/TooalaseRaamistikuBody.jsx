"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import Panel from "@/components/ui/Panel";
import {
  glassPageBackTopLeftClassName,
  glassPageShellCenteredClassName,
  glassPageMobileCardClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageCardClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import {
  getWorkerFrameworkDocxHref,
  WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY,
  WORKER_FRAMEWORK_REGISTER_CONTEXT_STORAGE_KEY,
  WORKER_FRAMEWORK_REVIEW_STORAGE_KEY,
  WORKER_FRAMEWORK_SIGNED_HREF,
  WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY
} from "@/lib/frameworkAcceptances";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";

const shellClassName =
  `${glassPageShellCenteredClassName} framework-page-shell ${glassPrimaryButtonToneClassName} ` +
  "relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-[1rem] py-[1rem] max-[768px]:[--mobile-glass-card-gap:clamp(0.14rem,0.8vw,0.22rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-[0.14rem]";
const panelClassName =
  `framework-surface-panel relative z-[21] w-full !max-w-[50rem] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] [scrollbar-gutter:stable_both-edges] px-[1.45rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.38rem,1.5vw,0.54rem)] max-[768px]:rounded-[1.2rem] max-[768px]:px-[0.38rem] max-[768px]:pb-[0.76rem] ${glassPageMobileCardClassName}`;
const headerClassName = "invite-modal-title-wrap mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]";
const titleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const titleClassName =
  `invite-modal-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ${glassPageTitleClassName} ` +
  `w-full max-[768px]:!mt-0 max-[768px]:!mb-0`;
const leadClassName =
  "m-0 text-left text-[1.08rem] leading-[1.68] tracking-[0.018em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.08rem]";
const bodyClassName =
  "framework-body mx-auto grid w-full max-w-none gap-[0.88rem] px-[0.05rem] pt-[0.48rem] pb-[1.1rem] max-[768px]:w-full max-[768px]:max-w-none max-[768px]:gap-[0.76rem] max-[768px]:px-0 max-[768px]:pb-[0.88rem]";
const introCardClassName =
  "framework-intro-card grid gap-[0.82rem] px-[0.52rem] py-[0.88rem] max-[768px]:gap-[0.7rem] max-[768px]:px-[0.36rem] max-[768px]:py-[0.72rem]";
const sectionTitleClassName =
  "m-0 text-[1.28rem] font-[500] leading-[1.34] tracking-[0.01em] text-[color:var(--title-color,var(--brand-primary))]";
const introTextClassName =
  "m-0 text-[1.14rem] leading-[1.68] tracking-[0.018em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.16rem]";
const documentCardClassName =
  "framework-document-card mx-auto grid w-full max-w-none gap-[0.92rem] px-[0.52rem] py-[0.98rem] max-[768px]:w-full max-[768px]:max-w-none max-[768px]:gap-[0.76rem] max-[768px]:px-[0.36rem] max-[768px]:py-[0.74rem]";
const confirmPanelClassName =
  "framework-confirm-panel invite-list-panel mt-[0.55rem] grid gap-[0.85rem] rounded-[1rem] !border-0 !shadow-none [background:var(--chat-card-surface-night-standard-bg,var(--chat-card-surface-standard-bg,var(--subpage-card-bg)))] [color:var(--subpage-card-text)] " +
  "max-[768px]:gap-[0.72rem] max-[768px]:!p-[0.78rem]";
const documentStackClassName = "grid gap-[0.82rem]";
const documentHtmlClassName =
  "framework-document-html overflow-x-auto text-[1.08rem] leading-[1.72] tracking-[0.018em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
  "[&_p]:m-0 [&_p]:mb-[0.82rem] [&_em]:text-[color:var(--glass-modal-text-soft,var(--pt-120))] " +
  "[&_h1]:m-0 [&_h1]:pt-[1.05rem] [&_h1]:pb-[0.25rem] [&_h1]:text-[1.36rem] [&_h1]:font-[500] [&_h1]:leading-[1.32] [&_h1]:tracking-[0.01em] [&_h1]:text-[color:var(--title-color,var(--brand-primary))] " +
  "[&_h2]:m-0 [&_h2]:pt-[0.75rem] [&_h2]:pb-[0.2rem] [&_h2]:text-[1.22rem] [&_h2]:font-[500] [&_h2]:leading-[1.45] [&_h2]:text-[color:var(--title-color,var(--brand-primary))] " +
  "[&_ol]:my-[0.72rem] [&_ol]:grid [&_ol]:gap-[0.5rem] [&_ol]:pl-[1.55rem] [&_ul]:my-[0.72rem] [&_ul]:grid [&_ul]:gap-[0.5rem] [&_ul]:pl-[1.55rem] [&_li]:pl-[0.15rem] " +
  "[&_table]:my-[1.1rem] [&_table]:w-full [&_table]:min-w-[38rem] [&_table]:border-collapse [&_table]:text-[0.98rem] [&_table]:leading-[1.48] [&_table]:tracking-[0.01em] " +
  "[&_td]:border [&_td]:border-white/20 [&_td]:px-[0.7rem] [&_td]:py-[0.55rem] [&_td]:align-top [&_td]:text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
  "[&_th]:border [&_th]:border-white/25 [&_th]:px-[0.7rem] [&_th]:py-[0.58rem] [&_th]:text-left [&_th]:font-[600] [&_th]:text-[color:var(--title-color,var(--brand-primary))] " +
  "[&_tr:first-child_td]:font-[600] [&_tr:first-child_td]:text-[color:var(--title-color,var(--brand-primary))] max-[768px]:text-[1.08rem] max-[768px]:[&_table]:min-w-[34rem] max-[768px]:[&_td]:px-[0.55rem] max-[768px]:[&_td]:py-[0.48rem]";
const docHeadingClassName =
  "m-0 pt-[0.55rem] text-[1.36rem] font-[500] leading-[1.32] tracking-[0.01em] text-[color:var(--title-color,var(--brand-primary))]";
const docSubheadingClassName =
  "m-0 pt-[0.2rem] text-[1.22rem] font-[500] leading-[1.45] text-[color:var(--title-color,var(--brand-primary))]";
const docLabelClassName =
  "m-0 pt-[0.15rem] text-[1.1rem] font-[500] tracking-[0.01em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const docParagraphClassName =
  "m-0 text-[1.08rem] leading-[1.72] tracking-[0.018em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.08rem]";
const docListClassName =
  "m-0 grid gap-[0.55rem] pl-[1.45rem] text-[1.08rem] leading-[1.68] tracking-[0.018em] max-[768px]:pl-[1.15rem]";
const docCheckRowClassName =
  `grid gap-[0.5rem] rounded-[0.95rem] px-[0.9rem] py-[0.75rem] ${glassSubpageCardClassName}`;
const docCheckRowOptionsClassName = "flex flex-wrap items-center gap-x-[1rem] gap-y-[0.45rem]";
const docCheckOptionClassName =
  "inline-flex items-center gap-[0.45rem] text-[1rem] leading-[1.35] tracking-[0.016em] text-[color:var(--glass-modal-text-soft,var(--pt-120))]";
const docCheckMarkerClassName =
  "inline-flex h-[1rem] w-[1rem] shrink-0 items-center justify-center rounded-[0.22rem] border border-current opacity-85";
const docChecklistClassName = "grid gap-[0.6rem]";
const docChecklistItemClassName =
  "flex items-start gap-[0.55rem] text-[1.08rem] leading-[1.68] tracking-[0.018em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const actionRowClassName =
  "mx-auto flex w-full max-w-none flex-nowrap items-center justify-center gap-[0.7rem] pt-[0.82rem] pb-[1rem] max-[768px]:grid max-[768px]:w-full max-[768px]:max-w-none max-[768px]:grid-cols-1 max-[768px]:pt-[0.74rem] max-[768px]:pb-[0.9rem]";
const actionButtonClassName =
  "!inline-flex !w-fit !justify-center !justify-self-center !self-center !min-h-[3.05rem] !rounded-[1.6rem] !px-[1.15rem] !py-[0.78rem] !text-[1.12rem] !leading-[1.2] !tracking-[0.03rem] " +
  "max-[768px]:!w-fit max-[768px]:!min-h-[3.2rem] max-[768px]:!rounded-[1.45rem] max-[768px]:!px-[1rem] max-[768px]:!py-[0.82rem] max-[768px]:!text-[1.18rem]";
const frameworkCheckboxRowClassName =
  "fancy-checkbox--otp fancy-checkbox--multiline w-full justify-start " +
  "[--otp-check-shape:var(--glass-modal-text,var(--pt-150))] [--otp-check-tick:var(--title-color,var(--brand-primary))] [--otp-check-text:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
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
          if (index === 0) {
            return (
              <h3 key={`${block.type}-${index}`} className={docHeadingClassName}>
                {block.text}
              </h3>
            );
          }

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
                    <span aria-hidden="true" className={docCheckMarkerClassName} />
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
                  <span aria-hidden="true" className={`${docCheckMarkerClassName} mt-[0.22rem] shrink-0`} />
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
  const fallbackCopy = getNormalizedIntroCopy(locale);
  const compactIntroCopy = {
    et: {
      introTitle: "Andmete töötlemise kokkuleppe allalaadimine ja kinnitus",
      lead:
        "Laadi raamleping alla või loe täisteksti allpool. Kinnituse saad salvestada pärast raamlepingu ja allkirjastatud DigiDoc-faili allalaadimist.",
      paragraphs: [
        "SotsiaalAI platvormi kasutamiseks ei ole vaja lepingut. Lepinguline raamistik on mõeldud tööülesannete jaoks, kus SotsiaalAI abil töödeldakse kliendi või muu isiku isikuandmeid."
      ]
    },
    en: {
      introTitle: "Data-processing agreement download and confirmation",
      lead:
        "Download the framework agreement or read the full text below. You can save the confirmation after downloading the agreement and the signed DigiDoc file.",
      paragraphs: [
        "You do not need an agreement to use the SotsiaalAI platform. The contractual framework is intended for work tasks where SotsiaalAI is used to process a client's or another person's personal data."
      ]
    },
    ru: {
      introTitle: "Скачивание и подтверждение соглашения об обработке данных",
      lead:
        "Скачайте рамочный договор или прочитайте полный текст ниже. Подтверждение можно сохранить после скачивания договора и подписанного файла DigiDoc.",
      paragraphs: [
        "Для использования платформы SotsiaalAI договор не требуется. Договорная рамка предназначена для рабочих задач, в которых с помощью SotsiaalAI обрабатываются персональные данные клиента или другого лица."
      ]
    }
  };

  return compactIntroCopy[locale] || {
    ...fallbackCopy,
    paragraphs: []
  };
}

function getNormalizedIntroCopy(locale) {
  if (locale === "ru") {
    return {
      introTitle: "Для чего нужен этот документ?",
      lead:
        "Документ объединяет разрешение на профессиональное использование SotsiaalAI, основные правила, подтверждение работника и соглашение об обработке данных. Прокрутите вниз, чтобы прочитать документ на сайте.",
      paragraphs: [
        "Если SotsiaalAI используется в рабочих задачах с данными клиента или другого лица, до начала работы организация должна убедиться, что использование необходимо, разрешено и соответствует ее инструкциям.",
        "Подтверждение на платформе является подтверждением на уровне пользователя. Основание профессионального использования и соглашение об обработке данных вступают в силу в объеме, указанном в рамочном договоре после его подписания сторонами."
      ]
    };
  }

  if (locale === "en") {
    return {
      introTitle: "What is this document for?",
      lead:
        "This document combines the SotsiaalAI professional-use permission, the main use rules, the worker confirmation, and the data-processing agreement. Scroll down to read the document on the web.",
      paragraphs: [
        "If SotsiaalAI is used in work tasks with client or other personal data, the organisation must first make sure that the use is necessary, permitted, and aligned with its instructions.",
        "The confirmation given in the platform is a user-level confirmation. The professional-use basis and the data-processing agreement take effect within the scope described in the framework agreement after the parties sign it."
      ]
    };
  }

  return {
    introTitle: "Milleks see dokument on?",
    lead:
      "Dokument koondab SotsiaalAI tööalase kasutuse loa, kasutamise põhireeglid, töötaja kinnituse ning andmete töötlemise kokkuleppe ühte faili. Keri alla, et dokumenti veebis lugeda.",
    paragraphs: [
      "Kui SotsiaalAI-d kasutatakse tööülesannetes kliendi või muu isiku andmetega, tuleb enne alustamist veenduda, et kasutamine on vajalik, lubatud ja organisatsiooni juhistega kooskõlas.",
      "Platvormis antav kinnitus on kasutaja tasandi kinnitus. Tööalase kasutuse alus ja andmetöötluse kokkulepe jõustuvad raamlepingus kirjeldatud ulatuses pärast poolte allkirjastamist."
    ]
  };
}

export default function TooalaseRaamistikuBody({ frameworkDocument }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const panelRef = useRef(null);
  const introCopy = getIntroCopy(locale);
  const frameworkDocxHref = getWorkerFrameworkDocxHref(locale);
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
  const [isRegisterContext, setIsRegisterContext] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");

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
    const registerContext =
      window.sessionStorage.getItem(WORKER_FRAMEWORK_REGISTER_CONTEXT_STORAGE_KEY) === "1";
    setIsRegisterContext(registerContext);
    if (registerContext) {
      setConfirmChecked(
        window.sessionStorage.getItem(WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY) === "1"
      );
    }
  }, []);

  useEffect(() => {
    void loadFrameworkStatus();
  }, [loadFrameworkStatus]);

  const handleBack = () => {
    if (isClosing) return;
    setIsClosing(true);

    if (typeof window !== "undefined" && window.history.length > 1) {
      backWithTransition(router, {
        glassRingTilt: "left",
        waitForGlassRingTilt: true,
        persistGlassRingTilt: false
      });
      return;
    }

    pushWithTransition(
      router,
      localizePath(isRegisterContext ? "/registreerimine" : "/", locale),
      {
        glassRingTilt: "left",
        waitForGlassRingTilt: true,
        persistGlassRingTilt: false
      }
    );
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
      if (isRegisterConfirmationMode) {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY, "1");
        }
        setConfirmChecked(true);
        setSaveNotice(t("documents.framework_acceptance.register_saved_notice"));
        return;
      }

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
  const isRegisterConfirmationMode = isRegisterContext && !frameworkStatus.authenticated;
  const canConfirmFramework = frameworkStatus.eligible || isRegisterConfirmationMode;
  const acceptedAtText = acceptance?.acceptedAt ? new Date(acceptance.acceptedAt).toLocaleString(locale || "et") : "";
  const documentTitle = frameworkDocument?.title || t("auth.register.worker_framework_title");
  const fullDocumentBlocks = [
    ...(frameworkDocument?.prefaceBlocks || []),
    ...(frameworkDocument?.documentBlocks || [])
  ];
  const documentHtml = frameworkDocument?.html || "";

  return (
    <section className={shellClassName} lang={locale} onWheel={handleShellWheel}>
      <div
        ref={panelRef}
        className={`${panelClassName} ${isClosing ? "pointer-events-none [--glass-ring-tilt-angle-left:-3deg] motion-safe:animate-[glassRingTiltFromLeft_540ms_cubic-bezier(0.42,0,0.58,1)_both]" : ""}`}
      >
        <BackButton
          onClick={handleBack}
          ariaLabel={t("buttons.back_previous")}
          className={`${glassPageBackTopLeftClassName} !z-[30] pointer-events-auto`}
        />

        <header className={headerClassName}>
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
              <Button
                as="a"
                href={frameworkDocxHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className={actionButtonClassName}
              >
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
            <Panel variant="subpage" padding="sm" className={confirmPanelClassName}>
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
                    disabled={!canConfirmFramework || savePending}
                    onChange={(next) => setConfirmChecked(next)}
                    label={t("auth.register.worker_framework_ack")}
                    className={frameworkCheckboxRowClassName}
                  />
                  {canConfirmFramework ? (
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
                  ) : (
                    <p className={introTextClassName}>
                      {frameworkStatus.authenticated
                        ? t("documents.framework_acceptance.worker_only")
                        : t("documents.framework_acceptance.auth_required")}
                    </p>
                  )}
                </>
              ) : null}
              {saveNotice ? <p className={introTextClassName}>{saveNotice}</p> : null}
            </Panel>
          </section>

          <section
            className={documentCardClassName}
            aria-label={documentTitle}
          >
            {documentHtml ? (
              <div className={documentHtmlClassName} dangerouslySetInnerHTML={{ __html: documentHtml }} />
            ) : (
              <div className={documentStackClassName}>
                <FrameworkBlocks blocks={fullDocumentBlocks} />
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
