"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { getCareerUiText } from "@/lib/career-agent/careerText.js";

const careerChoiceButtonClassName =
  "max-w-[22rem] whitespace-normal text-center leading-[1.2] px-[1.6rem] py-[1.05rem] text-[1.18rem] " +
  "max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]";

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOption(option) {
  if (typeof option === "string") {
    const trimmed = option.trim();
    return trimmed ? { value: trimmed, label: trimmed } : null;
  }

  if (!option || typeof option !== "object") return null;

  const rawValue = option.value ?? option.id ?? null;
  const value =
    typeof rawValue === "string" || typeof rawValue === "number"
      ? String(rawValue).trim()
      : null;
  const label = hasText(option.label) ? option.label.trim() : value;

  if (!value || !label) return null;
  return { value, label };
}

function ChoiceButton({ selected = false, disabled = false, onClick, children }) {
  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      disabled={disabled}
      onClick={onClick}
      className={`${careerChoiceButtonClassName} ${selected ? "!shadow-[var(--btn-primary-shadow-hover)]" : ""}`.trim()}
    >
      {children}
    </Button>
  );
}

function BooleanQuestion({ question, onAnswer, uiText }) {
  if (typeof onAnswer !== "function") return null;

  return (
    <div className="mt-[0.55rem] ml-auto flex w-fit max-w-full flex-wrap justify-end gap-[0.45rem] pr-[clamp(0.8rem,1.6vw,1.25rem)]">
      <ChoiceButton onClick={() => onAnswer(question, true, uiText.question.yes)}>
        {uiText.question.yes}
      </ChoiceButton>
      <ChoiceButton onClick={() => onAnswer(question, false, uiText.question.no)}>
        {uiText.question.no}
      </ChoiceButton>
    </div>
  );
}

function SingleSelectQuestion({ question, onAnswer, uiText }) {
  const options = useMemo(
    () => toSafeArray(question?.options).map(normalizeOption).filter(Boolean),
    [question?.options]
  );

  if (!options.length) {
    return <TextQuestion question={question} onAnswer={onAnswer} uiText={uiText} />;
  }

  if (typeof onAnswer !== "function") return null;

  return (
    <div className="mt-[0.55rem] ml-auto flex w-fit max-w-full flex-wrap justify-end gap-[0.45rem] pr-[clamp(0.8rem,1.6vw,1.25rem)]">
      {options.map((option) => (
        <ChoiceButton
          key={option.value}
          onClick={() => onAnswer(question, option.value, option.label)}
        >
          {option.label}
        </ChoiceButton>
      ))}
    </div>
  );
}

function MultiSelectQuestion({ question, onAnswer, uiText }) {
  const options = useMemo(
    () => toSafeArray(question?.options).map(normalizeOption).filter(Boolean),
    [question?.options]
  );
  const [selectedValues, setSelectedValues] = useState([]);

  if (!options.length) {
    return <TextQuestion question={question} onAnswer={onAnswer} uiText={uiText} />;
  }

  if (typeof onAnswer !== "function") return null;

  function toggleValue(value) {
    setSelectedValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedValues.length) return;

    const selectedLabels = options
      .filter((option) => selectedValues.includes(option.value))
      .map((option) => option.label);

    onAnswer(question, selectedValues, selectedLabels.join(", "));
  }

  return (
    <form className="mt-[0.55rem] ml-auto grid w-full max-w-[34rem] justify-items-end gap-[0.5rem] pr-[clamp(0.8rem,1.6vw,1.25rem)]" onSubmit={handleSubmit}>
      <div className="flex w-full flex-wrap justify-end gap-[0.45rem]">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <ChoiceButton
              key={option.value}
              selected={selected}
              onClick={() => toggleValue(option.value)}
            >
              {option.label}
            </ChoiceButton>
          );
        })}
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-[0.6rem]">
        <div className="text-right text-[0.8rem] opacity-80">
          {uiText.question.selectionHint}
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!selectedValues.length}
        >
          {uiText.question.confirmSelection}
        </Button>
      </div>
    </form>
  );
}

function TextQuestion({ question, onAnswer, uiText }) {
  const [draft, setDraft] = useState("");
  const isLongText = question?.type === "long_text";
  const trimmed = draft.trim();

  if (typeof onAnswer !== "function") return null;

  function handleSubmit(event) {
    event.preventDefault();
    if (!trimmed) return;
    onAnswer(question, trimmed, trimmed);
    setDraft("");
  }

  return (
    <form className="mt-[0.55rem] ml-auto grid w-full max-w-[34rem] justify-items-end gap-[0.5rem] pr-[clamp(0.8rem,1.6vw,1.25rem)]" onSubmit={handleSubmit}>
      {isLongText ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder={uiText.question.textPlaceholder}
          className="w-full resize-y rounded-[0.9rem] border border-[rgba(240,240,240,0.16)] bg-[rgba(14,20,32,0.18)] px-[0.85rem] py-[0.72rem] text-[0.94rem] leading-[1.5] outline-none light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.88)]"
        />
      ) : (
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={uiText.question.textPlaceholder}
          className="w-full rounded-full border border-[rgba(240,240,240,0.16)] bg-[rgba(14,20,32,0.18)] px-[0.85rem] py-[0.62rem] text-[0.94rem] leading-[1.4] outline-none light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.88)]"
        />
      )}
      <div className="flex w-full flex-wrap items-center justify-end gap-[0.6rem]">
        <div className="text-right text-[0.8rem] opacity-80">
          {uiText.question.replyInChatHint}
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!trimmed}
        >
          {uiText.question.submitAnswer}
        </Button>
      </div>
    </form>
  );
}

function QuestionAnswerUI({ question, onAnswer, uiText }) {
  switch (question?.type) {
    case "boolean":
      return <BooleanQuestion question={question} onAnswer={onAnswer} uiText={uiText} />;
    case "single_select":
      return <SingleSelectQuestion question={question} onAnswer={onAnswer} uiText={uiText} />;
    case "multi_select":
      return <MultiSelectQuestion question={question} onAnswer={onAnswer} uiText={uiText} />;
    case "short_text":
    case "long_text":
    default:
      return <TextQuestion question={question} onAnswer={onAnswer} uiText={uiText} />;
  }
}

function QuestionItem({ question, onAnswer, uiText }) {
  const options = toSafeArray(question?.options).map(normalizeOption).filter(Boolean);

  return (
    <article className="py-[0.1rem]">
      <div className="whitespace-pre-wrap text-[1em] font-inherit leading-inherit tracking-inherit">
        {question?.prompt || uiText.question.defaultTitle}
      </div>
      {typeof onAnswer === "function" ? (
        <QuestionAnswerUI question={question} onAnswer={onAnswer} uiText={uiText} />
      ) : options.length > 0 ? (
        <div className="mt-[0.55rem] flex flex-wrap gap-[0.35rem]">
          {options.map((option) => (
            <span
              key={option.value}
              className="rounded-full border border-[rgba(240,240,240,0.2)] px-[0.58rem] py-[0.16rem] text-[0.82rem] light:border-[rgba(15,23,42,0.14)]"
            >
              {option.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-[0.48rem] text-[0.84rem] opacity-80">
          {uiText.question.answerInNextMessage}
        </div>
      )}
    </article>
  );
}

export default function CareerQuestionsCard({
  questions = [],
  onAnswer = null,
}) {
  const { locale } = useI18n();
  const uiText = useMemo(() => getCareerUiText(locale), [locale]);
  const safeQuestions = toSafeArray(questions).filter(
    (question) => question && typeof question === "object"
  );

  if (!safeQuestions.length) return null;

  return (
    <div className="mt-[0.55rem] grid gap-[0.45rem]">
      {safeQuestions.map((question) => (
        <QuestionItem
          key={question?.id || question?.prompt}
          question={question}
          onAnswer={onAnswer}
          uiText={uiText}
        />
      ))}
    </div>
  );
}
