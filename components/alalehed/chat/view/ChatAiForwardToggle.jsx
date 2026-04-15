const aiToggleRowClassName =
  "mt-[0.18rem] mx-auto flex w-full max-w-[min(93%,45rem)] items-start justify-start " +
  "pl-[calc(var(--chat-composer-side-control-size)+clamp(0.38rem,1.1vw,0.72rem))] " +
  "pr-[clamp(0.8rem,2.7vw,1.5rem)] max-[768px]:mt-[0.14rem] max-[768px]:pl-[calc(var(--chat-composer-side-control-size)+0.18rem)]";
const aiToggleLabelClassName =
  "inline-flex items-center gap-[0.58rem] text-left text-[0.95rem] leading-[1.2] " +
  "text-[color:var(--pt-120)] cursor-pointer select-none";
const aiToggleInputClassName = "ui-checkbox-glass h-[1.05rem] w-[1.05rem] shrink-0";

export default function ChatAiForwardToggle({
  t,
  focusActive,
  isRoomMode,
  sendToAssistant,
  setSendToAssistant,
  aiNote
}) {
  if (!isRoomMode || !focusActive) return null;

  return <div className={aiToggleRowClassName}>
    <label className={aiToggleLabelClassName}>
      <input type="checkbox" className={aiToggleInputClassName} checked={sendToAssistant} onChange={e => setSendToAssistant(e.target.checked)} aria-describedby="chat-ai-hint" />
      <span className="pt-[0.02rem] text-[0.95rem] leading-[1.2] text-[color:var(--pt-120)]">
        {t("chat.ai_toggle.label")}
      </span>
    </label>
    <span id="chat-ai-hint" className="sr-only">
      {aiNote}
    </span>
  </div>;
}
