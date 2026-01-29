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
  inputFocused = false
}) {
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (!draftApiRef) return;
    draftApiRef.current = {
      appendText: txt => {
        const s = String(txt ?? "").trim();
        if (!s) return;
        setDraft(prev => prev ? `${prev} ${s}` : s);
      },
      clear: () => setDraft("")
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
  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (isGenerating) {
      onStop?.(e);
      return;
    }
    void submitSend();
  }, [isGenerating, onStop, submitSend]);
  const handleKeyDown = useCallback(e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && draft.trim()) {
        void submitSend();
      }
    }
  }, [draft, isGenerating, submitSend]);
  const inputRowStyle = {
    "--inputbar-h": "3.2rem",
    "--chat-input-shift": "1.8rem",
    "--chat-input-max-w": inputFocused
      ? "clamp(15.5rem, 50vw, 30rem)"
      : "clamp(9.5rem, 26vw, 18rem)"
  };
  const inputRowClassName =
    "chat-input-row relative z-[80] mt-[clamp(3.1rem,7.4vh,5.4rem)] flex w-full items-center justify-center gap-[0.1rem] px-[var(--chat-hpad)] translate-y-[var(--chat-input-shift,0.9rem)]";
  const inputBarClassName =
    "chat-inputbar relative grid w-full max-w-[min(100%,var(--chat-input-max-w))] " +
    "flex-[1_1_var(--chat-input-max-w)] grid-cols-[1fr_auto_auto] items-center gap-x-[0.28rem] " +
    "min-h-[var(--inputbar-h)] rounded-full border-2 border-transparent light:border-[rgba(84,95,115,0.55)] " +
    "bg-[rgba(10,14,24,0.22)] light:bg-[rgba(255,255,255,0.92)] " +
    "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_0.45rem_1.05rem_rgba(5,8,15,0.18)] " +
    "transition-[border-color,box-shadow,background,max-width,flex-basis] duration-[520ms] ease-out " +
    "hover:bg-[rgba(15,19,25,0.38)] focus-within:bg-[rgba(15,19,25,0.38)] " +
    "px-[0.625rem] pr-[0.1rem] pointer-events-auto z-[65]";
  const inputFieldWrapClassName = "min-w-0 w-full pr-[0.2rem]";
  const inputFieldClassName =
    "chat-input-field w-full resize-none appearance-none bg-transparent text-[1.05rem] " +
    "text-[color:var(--pt-150)] light:text-[color:var(--text-strong,#1f2937)] " +
    "outline-none border-0 shadow-none placeholder:opacity-0 " +
    "light:placeholder:opacity-100 light:placeholder:text-[color:var(--input-placeholder)]";
  const actionButtonClassName =
    "chat-listen-btn relative z-[2] h-[48px] w-[48px] min-h-[48px] min-w-[48px] flex-[0_0_48px] rounded-full border-0 " +
    "bg-transparent !shadow-none " +
    "flex items-center justify-center text-white " +
    "transition-[border-color,box-shadow] duration-150 ease-out " +
    "pointer-events-auto " +
    "data-[speaking=true]:shadow-[0_0_0_1px_rgba(148,163,184,0.22),0_0_6px_rgba(84,95,115,0.45)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  const sendButtonClassName =
    "chat-send-btn relative z-[2] h-[48px] w-[48px] min-h-[48px] min-w-[48px] flex-[0_0_48px] rounded-full border-0 " +
    "bg-[rgba(10,14,24,0.22)] light:!bg-[#f8f8f8] " +
    "flex items-center justify-center text-[color:var(--pt-150)] light:!text-[#111827] overflow-hidden leading-none " +
    "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_0.45rem_1.05rem_rgba(5,8,15,0.18)] " +
    "light:!shadow-[0_4px_12px_rgba(0,0,0,0.12)] " +
    "px-[6px] py-[1px] " +
    "transition-[border-color,box-shadow] duration-150 ease-out " +
    "pointer-events-auto " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  return <form className={inputRowClassName} style={inputRowStyle} onSubmit={handleSubmit} autoComplete="off">
      <button type="button" className="chat-attach-btn group h-[3.2rem] w-[3.2rem] min-h-[3.2rem] min-w-[3.2rem] flex-[0_0_3.2rem] appearance-none border-0 bg-transparent p-0 shadow-none outline-none transition-none" aria-label={t("chat.upload.aria")} title={t("chat.upload.tooltip")} onClick={() => {
      ensureAnalysisPanelVisible?.();
    }}>
        {isLightTheme ? <PaperclipLight className="h-[2.8rem] w-[2.8rem] opacity-85 transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110" aria-hidden="true" role="img" /> : <PaperclipDark className="h-[2.8rem] w-[2.8rem] opacity-85 transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110" aria-hidden="true" role="img" />}
      </button>

      <input ref={fileInputRef} type="file" accept={acceptAttr} onChange={onFileChange} className="hidden" />

      <label htmlFor="chat-input" className="sr-only">
        {t("chat.input.label")}
      </label>

      <div className={inputBarClassName} ref={inputBarRef}>
        <div className={inputFieldWrapClassName}>
          <textarea id="chat-input" ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onFocus={onFocusInput} onBlur={onBlurInput} className={inputFieldClassName} disabled={isGenerating || isRoomMode && (roomBlocked || roomAuthRequired)} rows={1} />
        </div>
        <button type="button" className={actionButtonClassName} aria-label={t("chat.listen.last_reply")} title={t("chat.listen.title")} onClick={speakLatestReply} disabled={!canSpeakLatest} data-speaking={isSpeaking ? "true" : "false"}>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[1.7rem] w-[1.7rem] text-[#c57171] light:text-[#7a3a38]">
            <path d="M11 5L6 9H2v6h4l5 4z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </button>
        {hasInput || isGenerating || isStreamingAny ? <button type="submit" className={sendButtonClassName} aria-label={isGenerating ? t("chat.send.stop") : t("chat.send.send")} title={isGenerating ? t("chat.send.title_stop") : t("chat.send.title_send")} disabled={isRoomMode && (roomBlocked || roomAuthRequired) || !hasInput && !isGenerating && !isStreamingAny} data-loader-active={isGenerating || isStreamingAny ? "true" : "false"}>
            <SotsiaalAILoader size={10} animated={isGenerating || isStreamingAny} ariaHidden className="h-[0.625rem] w-[0.625rem]" showBottomGlow={false} style={{
          "--glow-opacity-base": 0,
          "--glow-opacity-peak": 0
        }} />
          </button> : <button type="button" className={sendButtonClassName} aria-label={recording ? t("chat.mic.stop") : t("chat.mic.start")} title={recording ? t("chat.mic.stop") : t("chat.mic.start")} onClick={handleMic} disabled={isRoomMode && (roomBlocked || roomAuthRequired)} data-speaking={recording ? "true" : "false"} data-recording={recording ? "true" : "false"} data-recording-complete={recordingPulse ? "true" : "false"}>
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[1.6rem] w-[1.6rem] text-[#c57171] light:text-[#7a3a38]">
              <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>}
      </div>
    </form>;
}
