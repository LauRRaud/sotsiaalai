"use client";

import { useCallback, useEffect, useState } from "react";
import PaperclipLight from "@/public/logo/papercliphele.svg";
import PaperclipDark from "@/public/logo/paperclip.svg";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import { cn } from "@/components/ui/cn";

export default function ChatComposer({
  t,
  isLightTheme,
  acceptAttr,
  ensureAnalysisPanelVisible,
  fileInputRef,
  onFileChange,
  inputBarRef,
  inputRef,
  onFocusInput,
  onBlurInput,
  isGenerating,
  isStreamingAny,
  isRoomMode,
  roomBlocked,
  roomAuthRequired,
  onStop,
  onSend,
  speakLatestReply,
  canSpeakLatest,
  isSpeaking,
  recording,
  recordingPulse,
  handleMic,
  draftApiRef,
}) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!draftApiRef) return;
    draftApiRef.current = {
      appendText: (txt) => {
        const s = String(txt ?? "").trim();
        if (!s) return;
        setDraft((prev) => (prev ? `${prev} ${s}` : s));
      },
      clear: () => setDraft(""),
    };
    return () => {
      if (draftApiRef.current) draftApiRef.current = null;
    };
  }, [draftApiRef]);

  const hasInput = Boolean(draft.trim());

  const submitSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (isGenerating) return;

    const ok = await onSend(trimmed);
    if (ok) setDraft("");
  }, [draft, isGenerating, onSend]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isGenerating) {
        onStop?.(e);
        return;
      }
      void submitSend();
    },
    [isGenerating, onStop, submitSend]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating && draft.trim()) {
          void submitSend();
        }
      }
    },
    [draft, isGenerating, submitSend]
  );

  return (
    <form
      className={cn(
        "chat-input-row flex w-full items-center gap-[0.1rem] px-[var(--chat-hpad)]",
        "[--inputbar-h:3.2rem] [--chat-action-size:calc(var(--inputbar-h)-0.2rem)] [--chat-action-pad:calc((var(--inputbar-h)-var(--chat-action-size))/2)]"
      )}
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <button
        type="button"
        className="chat-attach-btn group h-[3.2rem] w-[3.2rem] min-h-[3.2rem] min-w-[3.2rem] flex-[0_0_3.2rem] appearance-none border-0 bg-transparent p-0 shadow-none outline-none transition-none hover:transform-none focus-visible:transform-none active:transform-none"
        aria-label={t("chat.upload.aria")}
        title={t("chat.upload.tooltip")}
        onClick={() => {
          ensureAnalysisPanelVisible();
        }}
      >
        {isLightTheme ? (
          <PaperclipLight
            className="chat-attach-icon h-[2.8rem] w-[2.8rem] opacity-85 transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110"
            aria-hidden="true"
            role="img"
          />
        ) : (
          <PaperclipDark
            className="chat-attach-icon h-[2.8rem] w-[2.8rem] opacity-85 transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110"
            aria-hidden="true"
            role="img"
          />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        onChange={onFileChange}
        className="hidden"
      />

      <label htmlFor="chat-input" className="sr-only">
        {t("chat.input.label")}
      </label>

      <div
        className={cn(
          "chat-inputbar chat-inputbar--mobile u-mobile-reset-position grid flex-1 grid-cols-[1fr_auto_auto] items-center gap-x-[0.28rem] min-h-[var(--inputbar-h)] border-[2px] border-[rgba(84,95,115,0.55)] bg-[rgba(10,14,24,0.22)] rounded-[999px] px-[var(--chat-action-pad,0.2rem)] pl-[0.625rem] transition-[border-color,box-shadow,background] duration-150 [--chat-hover-soft:rgba(210,215,225,0.26)] [--chat-hover-outer:rgba(210,215,225,0.16)]",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.06),_0_0.45rem_1.05rem_rgba(5,8,15,0.18)]",
          "hover:border-[rgba(84,95,115,0.68)] hover:bg-[rgba(15,19,25,0.38)] hover:shadow-[0_0_2px_var(--chat-hover-soft),_0_0_6px_var(--chat-hover-outer)]",
          "focus-within:border-[rgba(84,95,115,0.75)] focus-within:bg-[rgba(15,19,25,0.38)] focus-within:shadow-[0_0_2px_var(--chat-hover-soft),_0_0_6px_var(--chat-hover-outer)]",
          "light:bg-[#f8f8f8] light:border-0 light:shadow-[0_4px_12px_rgba(0,0,0,0.12)] light:text-[#111827]",
          "light:hover:bg-[#ffffff] light:hover:shadow-[0_6px_16px_rgba(0,0,0,0.14)] light:focus-within:bg-[#ffffff] light:focus-within:shadow-[0_6px_16px_rgba(0,0,0,0.14)]"
        )}
        ref={inputBarRef}
      >
        <div className="chat-input-field-wrap">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
            className={cn(
              "chat-input-field w-full resize-none border-0 bg-transparent px-[0.2rem] py-[0.4rem] text-[1.05rem] text-[color:var(--pt-150)] outline-none",
              "placeholder:text-[color:var(--pt-200)] light:text-[color:color-mix(in_srgb,#111827_72%,#4b5563_28%)] light:caret-[color:color-mix(in_srgb,#111827_72%,#4b5563_28%)] light:font-[500]",
              "light:placeholder:text-transparent light:placeholder:opacity-0"
            )}
            disabled={isGenerating || (isRoomMode && (roomBlocked || roomAuthRequired))}
            rows={1}
          />
        </div>
        <button
          type="button"
          className={cn(
            "chat-send-btn chat-listen-btn inline-flex h-[var(--chat-action-size)] w-[var(--chat-action-size)] min-h-[var(--chat-action-size)] min-w-[var(--chat-action-size)] items-center justify-center rounded-full border-[2px] border-[rgba(84,95,115,0.55)] bg-[rgba(10,14,24,0.22)] transition-[transform,background] duration-150",
            "hover:bg-[rgba(10,14,24,0.30)]",
            "data-[speaking=true]:shadow-[0_0_0_1px_rgba(148,163,184,0.22),_0_0_6px_rgba(84,95,115,0.45)]",
            "light:bg-[#f8f8f8] light:border-0 light:shadow-none light:text-[#111827] light:hover:bg-[#ffffff]"
          )}
          aria-label={t("chat.listen.last_reply")}
          title={t("chat.listen.title")}
          onClick={speakLatestReply}
          disabled={!canSpeakLatest}
          data-speaking={isSpeaking ? "true" : "false"}
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[1.3rem] w-[1.3rem]"
          >
            <path d="M11 5L6 9H2v6h4l5 4z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </button>
        {hasInput || isGenerating || isStreamingAny ? (
          <button
            type="submit"
            className={cn(
              "chat-send-btn inline-flex h-[var(--chat-action-size)] w-[var(--chat-action-size)] min-h-[var(--chat-action-size)] min-w-[var(--chat-action-size)] items-center justify-center rounded-full border-[2px] border-[rgba(84,95,115,0.55)] bg-[rgba(10,14,24,0.22)] transition-[transform,background] duration-150",
              "hover:bg-[rgba(10,14,24,0.26)]",
              "data-[recording=true]:border-[rgba(255,92,92,0.9)] data-[recording=true]:shadow-[0_0_0_1px_rgba(255,92,92,0.35),_0_0_12px_rgba(255,92,92,0.25)]",
              "light:bg-[#f8f8f8] light:border-0 light:shadow-none light:text-[#111827] light:hover:bg-[#ffffff]",
              (isGenerating || isStreamingAny) ? "chat-send-btn--active" : null
            )}
            aria-label={isGenerating ? t("chat.send.stop") : t("chat.send.send")}
            title={isGenerating ? t("chat.send.title_stop") : t("chat.send.title_send")}
            disabled={(isRoomMode && (roomBlocked || roomAuthRequired)) || (!hasInput && !isGenerating && !isStreamingAny)}
            data-loader-active={(isGenerating || isStreamingAny) ? "true" : "false"}
            data-recording={recording ? "true" : "false"}
          >
            <SotsiaalAILoader
              animated={isGenerating || isStreamingAny}
              ariaHidden
              className="send-loader"
              showBottomGlow={false}
            />
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              "chat-send-btn inline-flex h-[var(--chat-action-size)] w-[var(--chat-action-size)] min-h-[var(--chat-action-size)] min-w-[var(--chat-action-size)] items-center justify-center rounded-full border-[2px] border-[rgba(84,95,115,0.55)] bg-[rgba(10,14,24,0.22)] transition-[transform,background] duration-150",
              "hover:bg-[rgba(10,14,24,0.26)]",
              "data-[recording=true]:border-[rgba(255,92,92,0.9)] data-[recording=true]:shadow-[0_0_0_1px_rgba(255,92,92,0.35),_0_0_12px_rgba(255,92,92,0.25)]",
              "light:bg-[#f8f8f8] light:border-0 light:shadow-none light:text-[#111827] light:hover:bg-[#ffffff]",
              recording ? "chat-send-btn--active" : null
            )}
            aria-label={recording ? t("chat.mic.stop") : t("chat.mic.start")}
            title={recording ? t("chat.mic.stop") : t("chat.mic.start")}
            onClick={handleMic}
            disabled={isRoomMode && (roomBlocked || roomAuthRequired)}
            data-speaking={recording ? "true" : "false"}
            data-recording={recording ? "true" : "false"}
            data-recording-complete={recordingPulse ? "true" : "false"}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[1.6rem] w-[1.6rem]"
            >
              <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
