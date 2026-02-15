const aiToggleLabelClassName = "flex items-center gap-[0.6rem] rounded-[0.95rem] border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] px-[0.8rem] py-[0.55rem] text-[0.95rem] text-[color:var(--pt-120)]";
const aiToggleInputClassName = "h-[1.05rem] w-[1.05rem] accent-[color:var(--brand-primary)]";

export default function ChatAiForwardToggle({
  t,
  focusActive,
  isRoomMode,
  sendToAssistant,
  setSendToAssistant,
  aiNote
}) {
  if (!isRoomMode || !focusActive) return null;

  return <div className="mt-[0.35rem] flex w-full max-w-[min(93%,45rem)] items-center justify-end gap-[0.45rem] mx-auto pl-[clamp(0.7rem,2.1vw,1.2rem)] pr-[clamp(0.8rem,2.7vw,1.5rem)]">
    <label className={aiToggleLabelClassName}>
      <input type="checkbox" className={aiToggleInputClassName} checked={sendToAssistant} onChange={e => setSendToAssistant(e.target.checked)} aria-describedby="chat-ai-hint" />
      <span className="text-[0.95rem] leading-[1.2] text-[color:var(--pt-120)]">
        {t("chat.ai_toggle.label")}
      </span>
    </label>
    <span id="chat-ai-hint" className="sr-only">
      {aiNote}
    </span>
  </div>;
}
