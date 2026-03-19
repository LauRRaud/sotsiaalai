"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getCareerUiText } from "@/lib/career-agent/i18n/careerUi.js";

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

function choiceButtonClassName(selected = false) {
  return [
    "inline-flex min-h-[2.15rem] items-center justify-center rounded-full border px-[0.78rem] py-[0.3rem]",
    "text-[0.88rem] leading-[1.2] transition-colors duration-150",
    selected
      ? "border-[rgba(197,113,113,0.6)] bg-[rgba(197,113,113,0.16)] text-[color:var(--pt-100)] light:border-[rgba(122,58,56,0.22)] light:bg-[rgba(122,58,56,0.1)] light:text-[#3f241f]"
      : "border-[rgba(240,240,240,0.18)] bg-[rgba(14,20,32,0.18)] text-[color:var(--pt-150)] hover:bg-[rgba(14,20,32,0.26)] light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.84)] light:text-[color:var(--input-text)] light:hover:bg-[rgba(255,255,255,0.92)]",
  ].join(" ");
}

function SubmitButton({ disabled = false, children }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={[
        "inline-flex min-h-[2.15rem] items-center justify-center rounded-full px-[0.9rem] py-[0.3rem]",
        "text-[0.88rem] font-medium leading-[1.2] transition-opacity duration-150",
        "bg-[rgba(197,113,113,0.16)] text-[color:var(--pt-100)]",
        "light:bg-[rgba(122,58,56,0.1)] light:text-[#3f241f]",
        disabled ? "cursor-not-allowed opacity-45" : "opacity-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function QuestionMeta({ question, uiText }) {
  const parts = [];

  if (hasText(question?.type)) parts.push(question.type);
  if (question?.required) parts.push(uiText.question.required);
  if (question?.requiresAffirmative) parts.push(uiText.question.affirmative);

  if (!parts.length) return null;

  return (
    <div className="mt-[0.24rem] text-[0.78rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)]">
      {parts.join(" | ")}
    </div>
  );
}

function BooleanQuestion({ question, onAnswer, uiText }) {
  if (typeof onAnswer !== "function") return null;

  return (
    <div className="mt-[0.55rem] flex flex-wrap gap-[0.45rem]">
      <button
        type="button"
        className={choiceButtonClassName(false)}
        onClick={() => onAnswer(question, true, uiText.question.yes)}
      >
        {uiText.question.yes}
      </button>
      <button
        type="button"
        className={choiceButtonClassName(false)}
        onClick={() => onAnswer(question, false, uiText.question.no)}
      >
        {uiText.question.no}
      </button>
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
    <div className="mt-[0.55rem] flex flex-wrap gap-[0.45rem]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={choiceButtonClassName(false)}
          onClick={() => onAnswer(question, option.value, option.label)}
        >
          {option.label}
        </button>
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
    <form className="mt-[0.55rem] grid gap-[0.5rem]" onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-[0.45rem]">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className={choiceButtonClassName(selected)}
              onClick={() => toggleValue(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-[0.6rem]">
        <div className="text-[0.8rem] opacity-80">
          {uiText.question.selectionHint}
        </div>
        <SubmitButton disabled={!selectedValues.length}>
          {uiText.question.confirmSelection}
        </SubmitButton>
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
    <form className="mt-[0.55rem] grid gap-[0.5rem]" onSubmit={handleSubmit}>
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
      <div className="flex items-center justify-between gap-[0.6rem]">
        <div className="text-[0.8rem] opacity-80">
          {uiText.question.replyInChatHint}
        </div>
        <SubmitButton disabled={!trimmed}>
          {uiText.question.submitAnswer}
        </SubmitButton>
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
    <article className="rounded-[0.95rem] border border-[rgba(240,240,240,0.18)] bg-[rgba(14,20,32,0.22)] px-[0.9rem] py-[0.82rem] light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.82)]">
      <div className="text-[0.96rem] font-medium leading-[1.45]">
        {question?.prompt || uiText.question.defaultTitle}
      </div>
      <QuestionMeta question={question} uiText={uiText} />
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
    <div className="mt-[0.65rem] grid gap-[0.55rem]">
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
