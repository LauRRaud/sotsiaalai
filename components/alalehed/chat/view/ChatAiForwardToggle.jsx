const aiToggleRowClassName =
  "mt-[0.08rem] mx-auto flex w-full items-center justify-end " +
  "max-w-[min(100%,calc(var(--chat-input-max-w,100%)+var(--chat-composer-side-control-size,3.15rem)+0.58rem))] " +
  "pr-[clamp(0.8rem,2.7vw,1.5rem)] max-[768px]:mt-[0.04rem] max-[768px]:pr-[clamp(0.7rem,3vw,1rem)]";
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
