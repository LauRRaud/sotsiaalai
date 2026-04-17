"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import CareerQuestionsCard from "@/components/career/CareerQuestionsCard";
import { getCareerUiText } from "@/lib/career-agent/careerText.js";
import { CAREER_RESPONSE_KINDS } from "@/lib/career-agent/core/careerResponseTemplates.js";

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasMeaningfulDocumentStep(documentStep) {
  if (!documentStep || typeof documentStep !== "object") return false;
  if (hasText(documentStep.flow) || hasText(documentStep.documentFlow)) return true;
  if (hasText(documentStep.reason)) return true;
  if (typeof documentStep.missingInputCount === "number" && documentStep.missingInputCount > 0) {
    return true;
  }

  const status = String(documentStep.status || "").trim().toLowerCase();
  return Boolean(status && status !== "not_suggested");
}

function SectionTitle({ children }) {
  if (!hasText(children)) return null;

  return (
    <div className="text-[1em] font-inherit leading-inherit tracking-inherit">
      {children}
    </div>
  );
}

function BulletList({ items = [] }) {
  const safeItems = toSafeArray(items).filter(hasText);
  if (!safeItems.length) return null;

  return (
    <ul className="mt-[0.55rem] grid gap-[0.35rem] list-disc pl-[1.1rem] text-[1em] leading-inherit tracking-inherit">
      {safeItems.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function MetaLine({ items = [] }) {
  const safeItems = toSafeArray(items).filter(hasText);
  if (!safeItems.length) return null;

  return (
    <div className="mt-[0.12rem] text-[0.82rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)]">
      {safeItems.join(" | ")}
    </div>
  );
}

function ExternalLink({ href, label = "Open" }) {
  if (!hasText(href)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-[0.55rem] inline-flex items-center justify-center rounded-full border border-[rgba(240,240,240,0.35)] bg-[rgba(14,20,32,0.18)] px-[0.72rem] py-[0.34rem] text-[0.88rem] font-medium leading-[1.2] text-[color:var(--pt-150)] no-underline transition-colors duration-150 hover:bg-[rgba(14,20,32,0.3)] focus-visible:bg-[rgba(14,20,32,0.3)] light:border-[rgba(15,23,42,0.16)] light:bg-[rgba(255,255,255,0.72)] light:text-[color:var(--input-text)]"
    >
      {label}
    </a>
  );
}

function StudyPlacesBlock({ items = [], title }) {
  const safeItems = toSafeArray(items).filter(
    (item) => item && (hasText(item.provider) || hasText(item.label))
  );
  if (!safeItems.length) return null;

  return (
    <div className="mt-[0.5rem]">
      <div className="text-[0.84rem] font-semibold uppercase tracking-[0.08em] opacity-80">
        {title}
      </div>
      <ul className="mt-[0.35rem] grid gap-[0.28rem] text-[0.92rem] leading-[1.45]">
        {safeItems.map((item, index) => (
          <li key={`${item?.url || item?.label || item?.provider}-${index}`}>
            {item?.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--pt-150)] no-underline hover:underline light:text-[color:var(--input-text)]"
              >
                {item?.provider || item?.label}
              </a>
            ) : (
              item?.provider || item?.label
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileSummaryBlock({ profileSummary, uiText }) {
  if (!profileSummary || typeof profileSummary !== "object") return null;

  const identity = profileSummary.identity || {};
  const goals = profileSummary.goals || {};
  const workStatus = profileSummary.workStatus || {};
  const selfAnalysis = profileSummary.selfAnalysis || {};
  const directions = profileSummary.directions || {};

  const rows = [
    identity.displayName
      ? `${uiText.profile.name}: ${identity.displayName}`
      : null,
    identity.location ? `${uiText.profile.location}: ${identity.location}` : null,
    goals.primaryGoal ? `${uiText.profile.primaryGoal}: ${goals.primaryGoal}` : null,
    goals.preferredNextStep
      ? `${uiText.profile.nextStep}: ${goals.preferredNextStep}`
      : null,
    workStatus.currentStatus
      ? `${uiText.profile.currentStatus}: ${workStatus.currentStatus}`
      : null,
    toSafeArray(selfAnalysis.strengths).length > 0
      ? `${uiText.profile.strengths}: ${toSafeArray(selfAnalysis.strengths).join(", ")}`
      : null,
    toSafeArray(directions.immediateTargets).length > 0
      ? `${uiText.profile.directions}: ${toSafeArray(directions.immediateTargets).join(", ")}`
      : null,
  ].filter(hasText);

  const draftText = hasText(profileSummary.draftText)
    ? profileSummary.draftText
    : null;

  if (!rows.length && !draftText) return null;

  return (
    <div className="mt-[0.5rem]">
      {rows.length > 0 ? <BulletList items={rows} /> : null}
      {draftText ? (
        <div className={rows.length > 0 ? "mt-[0.55rem]" : ""}>
          <div className="text-[0.86rem] font-semibold uppercase tracking-[0.08em] opacity-80">
            {uiText?.profile?.draft || "Current draft"}
          </div>
          <div className="mt-[0.28rem] whitespace-pre-wrap text-[0.96rem] leading-[1.55]">
            {draftText}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CardGrid({ cards = [], renderCard, cardClassName = "" }) {
  const safeCards = toSafeArray(cards);
  if (!safeCards.length) return null;

  return (
    <div className="mt-[0.7rem] grid gap-[0.6rem]">
      {safeCards.map((card, index) => (
        <article
          key={card?.id || card?.title || index}
          className={`rounded-[1rem] border border-[rgba(240,240,240,0.18)] bg-[rgba(14,20,32,0.26)] px-[0.95rem] py-[0.8rem] light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.82)] ${cardClassName}`.trim()}
        >
          {renderCard(card)}
        </article>
      ))}
    </div>
  );
}

function renderDirectionCard(card, uiText) {
  const meta = [
    hasText(card?.type) ? card.type : null,
    hasText(card?.code) ? card.code : null,
  ].filter(hasText);
  const context = [
    hasText(card?.field) ? card.field : null,
    hasText(card?.group) ? card.group : null,
  ].filter(hasText);

  return (
    <>
      <div className="text-[0.98rem] font-semibold leading-[1.35]">
        {card?.title || uiText.direction.defaultTitle}
      </div>
      <MetaLine items={meta} />
      {context.length > 0 ? (
        <div className="mt-[0.35rem] text-[0.9rem] opacity-85">{context.join(" · ")}</div>
      ) : null}
      <BulletList items={card?.rationale} />
      {toSafeArray(card?.missingRequirements).length > 0 ? (
        <div className="mt-[0.5rem]">
          <div className="text-[0.84rem] font-semibold uppercase tracking-[0.08em] opacity-80">
            {uiText.direction.missingTitle}
          </div>
          <BulletList items={card?.missingRequirements} />
        </div>
      ) : null}
      <StudyPlacesBlock
        items={card?.studyPlaces}
        title={uiText.direction?.studyTitle || "Where to study"}
      />
      <ExternalLink href={card?.linkUrl} label={uiText.direction?.openLink || "Open role"} />
    </>
  );
}

function renderOptionCard(card, uiText) {
  const meta = [
    hasText(card?.fitLabel) ? card.fitLabel : null,
    typeof card?.score === "number" ? `${uiText.option.score}: ${card.score}` : null,
    hasText(card?.code) ? card.code : null,
  ].filter(hasText);
  const context = [
    hasText(card?.field) ? card.field : null,
    hasText(card?.group) ? card.group : null,
  ].filter(hasText);

  return (
    <>
      <div className="text-[0.98rem] font-semibold leading-[1.35]">
        {card?.title || uiText.option.defaultTitle}
      </div>
      <MetaLine items={meta} />
      {context.length > 0 ? (
        <div className="mt-[0.35rem] text-[0.9rem] opacity-85">{context.join(" · ")}</div>
      ) : null}
      <BulletList items={card?.whyItFits} />
      {toSafeArray(card?.whatIsMissing).length > 0 ? (
        <div className="mt-[0.5rem]">
          <div className="text-[0.84rem] font-semibold uppercase tracking-[0.08em] opacity-80">
            {uiText.option.missingTitle}
          </div>
          <BulletList items={card?.whatIsMissing} />
        </div>
      ) : null}
      {hasText(card?.nextStep) ? (
        <div className="mt-[0.5rem] text-[0.9rem] font-medium">
          {uiText.option.nextStep}: {card.nextStep}
        </div>
      ) : null}
      <StudyPlacesBlock
        items={card?.studyPlaces}
        title={uiText.option?.studyTitle || "Where to study"}
      />
      <ExternalLink href={card?.linkUrl} label={uiText.option?.openLink || "Open role"} />
    </>
  );
}

function renderActionCard(card, uiText) {
  const meta = [
    hasText(card?.type) ? card.type : null,
    hasText(card?.priority) ? `${uiText.action.priority}: ${card.priority}` : null,
    hasText(card?.status) ? `${uiText.action.status}: ${card.status}` : null,
  ].filter(hasText);

  return (
    <>
      <div className="text-[0.98rem] font-semibold leading-[1.35]">
        {card?.title || uiText.action.defaultTitle}
      </div>
      {meta.length > 0 ? (
        <div className="mt-[0.12rem] text-[0.82rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)]">
          {meta.join(" | ")}
        </div>
      ) : null}
      {hasText(card?.description) ? (
        <div className="mt-[0.42rem] whitespace-pre-wrap text-[0.95rem] leading-[1.5]">
          {card.description}
        </div>
      ) : null}
      <BulletList items={card?.rationale} />
      {card?.documentSuggestion?.flow ? (
        <div className="mt-[0.5rem] text-[0.88rem] font-medium">
          {uiText.action.documentFlow}: {card.documentSuggestion.flow}
        </div>
      ) : null}
    </>
  );
}

function renderDocumentStep(documentStep, uiText) {
  if (!hasMeaningfulDocumentStep(documentStep)) return null;

  const rows = [
    hasText(documentStep.flow) ? `${uiText.document.flow}: ${documentStep.flow}` : null,
    hasText(documentStep.status) ? `${uiText.document.status}: ${documentStep.status}` : null,
    typeof documentStep.missingInputCount === "number"
      ? `${uiText.document.missingInputCount}: ${documentStep.missingInputCount}`
      : null,
  ].filter(hasText);

  return <BulletList items={rows} />;
}

function renderGeneratedDocument(generatedDocument, uiText) {
  if (!generatedDocument || typeof generatedDocument !== "object") return null;

  const document = generatedDocument.document;
  if (!document || typeof document !== "object") return null;
  const persistedArtifact =
    generatedDocument.persistedArtifact &&
    typeof generatedDocument.persistedArtifact === "object"
      ? generatedDocument.persistedArtifact
      : null;
  const isDownloadReady = Boolean(
    persistedArtifact?.canDownload && persistedArtifact?.downloadUrl
  );

  const title = hasText(document.title) ? document.title : null;
  const documentType = hasText(document.documentType) ? document.documentType : null;
  const subject = hasText(document.subject) ? document.subject : null;
  const body = hasText(document.body) ? document.body : null;
  const excerpt =
    body && body.length > 1200 ? `${body.slice(0, 1200).trim()}\n\n...` : body;

  if (!title && !documentType && !excerpt) return null;

  return (
    <article className="mt-[0.7rem] rounded-[1rem] border border-[rgba(240,240,240,0.18)] bg-[rgba(14,20,32,0.26)] px-[0.95rem] py-[0.85rem] light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.82)]">
      {title ? (
        <div className="text-[0.98rem] font-semibold leading-[1.35]">{title}</div>
      ) : null}
      {documentType ? (
        <div className="mt-[0.12rem] text-[0.82rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)]">
          {documentType}
        </div>
      ) : null}
      {subject ? (
        <div className="mt-[0.35rem] text-[0.92rem] font-medium leading-[1.45]">
          {uiText.document.subject}: {subject}
        </div>
      ) : null}
      {excerpt ? (
        <div className="mt-[0.45rem] whitespace-pre-wrap text-[0.94rem] leading-[1.5]">
          {excerpt}
        </div>
      ) : null}
      {persistedArtifact?.openUrl ? (
        <div className="mt-[0.65rem] flex flex-wrap items-center gap-[0.5rem]">
          <div className="grid gap-[0.18rem] text-[0.86rem] opacity-80">
            <div>
              {isDownloadReady
                ? uiText.document.finalReady
                : uiText.document.draftReady}
            </div>
            <div>
              {persistedArtifact.destination === "documents"
                ? uiText.document.savedToDocuments
                : uiText.document.savedToBuilder}
            </div>
            {!isDownloadReady ? (
              <div>{uiText.document.reviewAndConfirm}</div>
            ) : null}
          </div>
          <a
            href={persistedArtifact.openUrl}
            className="inline-flex items-center justify-center rounded-full border border-[rgba(240,240,240,0.35)] bg-[rgba(14,20,32,0.3)] px-[0.72rem] py-[0.34rem] text-[0.88rem] font-medium leading-[1.2] text-[color:var(--pt-150)] no-underline transition-colors duration-150 hover:bg-[rgba(14,20,32,0.42)] focus-visible:bg-[rgba(14,20,32,0.42)] light:border-[rgba(15,23,42,0.16)] light:bg-[rgba(255,255,255,0.8)] light:text-[color:var(--input-text)]"
          >
            {persistedArtifact.destination === "documents"
              ? uiText.document.openDocuments
              : uiText.document.openBuilder}
          </a>
          {isDownloadReady ? (
            <a
              href={persistedArtifact.downloadUrl}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(240,240,240,0.35)] bg-[rgba(14,20,32,0.18)] px-[0.72rem] py-[0.34rem] text-[0.88rem] font-medium leading-[1.2] text-[color:var(--pt-150)] no-underline transition-colors duration-150 hover:bg-[rgba(14,20,32,0.3)] focus-visible:bg-[rgba(14,20,32,0.3)] light:border-[rgba(15,23,42,0.16)] light:bg-[rgba(255,255,255,0.72)] light:text-[color:var(--input-text)]"
            >
              {uiText.document.download}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function renderBody(response, onQuestionAnswer, uiText) {
  switch (response?.kind) {
    case CAREER_RESPONSE_KINDS.QUESTION_SET:
      return (
        <CareerQuestionsCard
          questions={response.questions}
          onAnswer={onQuestionAnswer}
        />
      );

    case CAREER_RESPONSE_KINDS.PROFILE_CONFIRMATION:
      return (
        <>
          <ProfileSummaryBlock profileSummary={response.profileSummary} uiText={uiText} />
          <CareerQuestionsCard
            questions={response.questions}
            onAnswer={onQuestionAnswer}
          />
        </>
      );

    case CAREER_RESPONSE_KINDS.DIRECTION_SHORTLIST:
      return (
        <CardGrid
          cards={response.cards}
          cardClassName="border-[rgba(197,113,113,0.18)] bg-[rgba(14,20,32,0.12)] shadow-none light:border-[rgba(122,58,56,0.14)] light:bg-[rgba(255,248,244,0.56)]"
          renderCard={(card) => renderDirectionCard(card, uiText)}
        />
      );

    case CAREER_RESPONSE_KINDS.OPTION_ANALYSIS:
      return (
        <CardGrid
          cards={response.cards}
          renderCard={(card) => renderOptionCard(card, uiText)}
        />
      );

    case CAREER_RESPONSE_KINDS.ACTION_PLAN:
      return (
        <CardGrid
          cards={response.cards}
          renderCard={(card) => renderActionCard(card, uiText)}
        />
      );

    case CAREER_RESPONSE_KINDS.DOCUMENT_FLOW:
      return (
        <>
          {renderDocumentStep(response.documentStep, uiText)}
          <CareerQuestionsCard
            questions={response.questions}
            onAnswer={onQuestionAnswer}
          />
        </>
      );

    case CAREER_RESPONSE_KINDS.HANDOFF:
      return <BulletList items={response.bullets} />;

    case CAREER_RESPONSE_KINDS.SUMMARY:
    case CAREER_RESPONSE_KINDS.WARNING:
    case CAREER_RESPONSE_KINDS.INFO:
    default:
      return <BulletList items={response.bullets} />;
  }
}

function CareerResponseCard({
  response,
  label = null,
  documentStep = null,
  generatedDocument = null,
  onQuestionAnswer = null,
  uiText,
}) {
  if (!response || typeof response !== "object") return null;

  const isQuestionLike =
    response.kind === CAREER_RESPONSE_KINDS.QUESTION_SET ||
    response.kind === CAREER_RESPONSE_KINDS.PROFILE_CONFIRMATION;
  const isPlainTextLike =
    isQuestionLike ||
    response.kind === CAREER_RESPONSE_KINDS.WARNING;
  const showTitle =
    hasText(response.title) &&
    !isQuestionLike &&
    response.kind !== CAREER_RESPONSE_KINDS.WARNING;
  const showMessage = hasText(response.message) && !isQuestionLike;

  return (
    <section className="w-full">
      {hasText(label) ? (
        <div className="mb-[0.26rem] text-[0.78rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)]">
          {label}
        </div>
      ) : null}
      {showTitle ? <SectionTitle>{response.title}</SectionTitle> : null}
      {showMessage ? (
        <div
          className={
            isPlainTextLike
              ? "whitespace-pre-wrap text-[1em] leading-inherit tracking-inherit opacity-95"
              : showTitle
              ? "mt-[0.35rem] whitespace-pre-wrap text-[1em] leading-inherit tracking-inherit opacity-95"
              : "whitespace-pre-wrap text-[1em] leading-inherit tracking-inherit opacity-95"
          }
        >
          {response.message}
        </div>
      ) : null}
      {renderBody(response, onQuestionAnswer, uiText)}
      {!response.documentStep && hasMeaningfulDocumentStep(documentStep)
        ? renderDocumentStep(documentStep, uiText)
        : null}
      {generatedDocument ? renderGeneratedDocument(generatedDocument, uiText) : null}
    </section>
  );
}

export default function CareerMessageRenderer({
  response = null,
  secondaryResponse = null,
  documentStep = null,
  generatedDocument = null,
  onQuestionAnswer = null,
}) {
  const { locale } = useI18n();
  const uiText = useMemo(() => getCareerUiText(locale), [locale]);

  if (!response && !secondaryResponse && !documentStep && !generatedDocument) {
    return null;
  }

  return (
    <div className="mt-[0.55rem] grid gap-[0.65rem]">
      {response || documentStep || generatedDocument ? (
        <CareerResponseCard
          response={response || {}}
          documentStep={documentStep}
          generatedDocument={generatedDocument}
          onQuestionAnswer={onQuestionAnswer}
          uiText={uiText}
        />
      ) : null}
      {secondaryResponse ? (
        <CareerResponseCard
          response={secondaryResponse}
          label={uiText.followUpLabel}
          onQuestionAnswer={onQuestionAnswer}
          uiText={uiText}
        />
      ) : null}
    </div>
  );
}
