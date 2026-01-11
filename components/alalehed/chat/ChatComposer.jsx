"use client";

import { useCallback, useEffect, useState } from "react";
import PaperclipLight from "@/public/logo/papercliphele.svg";
import PaperclipDark from "@/public/logo/paperclip.svg";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";

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
    <form className="chat-input-row" onSubmit={handleSubmit} autoComplete="off">
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

      <div className="chat-inputbar chat-inputbar--mobile u-mobile-reset-position" ref={inputBarRef}>
        <div className="chat-input-field-wrap">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
            className="chat-input-field"
            disabled={isGenerating || (isRoomMode && (roomBlocked || roomAuthRequired))}
            rows={1}
          />
        </div>
        <button
          type="button"
          className="chat-send-btn chat-listen-btn"
          aria-label={t("chat.listen.last_reply", "Kuula viimast vastust")}
          title={t("chat.listen.title", "Kuula viimast assistendi vastust")}
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
            className={`chat-send-btn${(isGenerating || isStreamingAny) ? " chat-send-btn--active" : ""}`}
            aria-label={
              isGenerating ? t("chat.send.stop", "Peata vastus") : t("chat.send.send", "Saada sõnum")
            }
            title={
              isGenerating ? t("chat.send.title_stop", "Peata vastus") : t("chat.send.title_send", "Saada (Enter)")
            }
            disabled={(isRoomMode && (roomBlocked || roomAuthRequired)) || (!hasInput && !isGenerating && !isStreamingAny)}
            data-loader-active={(isGenerating || isStreamingAny) ? "true" : "false"}
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
            className={`chat-send-btn${recording ? " chat-send-btn--active" : ""}`}
            aria-label={recording ? t("chat.mic.stop", "Lõpeta salvestus") : t("chat.mic.start", "Alusta dikteerimist")}
            title={recording ? t("chat.mic.stop", "Lõpeta salvestus") : t("chat.mic.start", "Alusta dikteerimist")}
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
