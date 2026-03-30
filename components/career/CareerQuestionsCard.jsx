"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getCareerUiText } from "@/lib/career-agent/careerText.js";

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function sanitizePrompt(prompt, uiText) {
  const rawPrompt = hasText(prompt) ? prompt.trim() : "";
  if (!rawPrompt) return rawPrompt;

  const phrasesToStrip = [
    "Palun vasta jah või ei.",
    "Please answer yes or no.",
    "Пожалуйста, ответьте да или нет.",
    uiText?.question?.answerInNextMessage,
    uiText?.question?.booleanAnswerInNextMessage,
    uiText?.question?.exitModeHint,
  ]
    .filter(hasText)
    .map((value) => escapeRegex(value.trim()));

  if (!phrasesToStrip.length) return rawPrompt;

  const stripPattern = new RegExp(`\\s*(?:${phrasesToStrip.join("|")})\\s*`, "giu");
  return rawPrompt.replace(stripPattern, " ").replace(/\s+/g, " ").trim();
}

function buildOptionsText(question, uiText) {
  const labels = toSafeArray(question?.options)
    .map(normalizeOption)
    .filter(Boolean)
    .map((option) => option.label)
    .filter(hasText);

  if (!labels.length) return "";
  const prefix = hasText(uiText?.question?.optionsPrefix)
    ? uiText.question.optionsPrefix
    : "Valikud:";
  return `${prefix} ${labels.join(", ")}.`;
}

function QuestionItem({ question, uiText }) {
  const prompt =
    sanitizePrompt(question?.prompt || uiText.question.defaultTitle, uiText) ||
    uiText.question.defaultTitle;
  const optionsText = buildOptionsText(question, uiText);
  const composedText = [prompt, optionsText].filter(hasText).join(" ");

  return (
    <article className="py-[0.1rem]">
      <div className="whitespace-pre-wrap text-[1em] font-inherit leading-inherit tracking-inherit">
        {composedText}
      </div>
    </article>
  );
}

export default function CareerQuestionsCard({ questions = [] }) {
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
          uiText={uiText}
        />
      ))}
    </div>
  );
}
