const aiToggleRowClassName =
  "inline-flex max-w-full translate-y-[0.16rem] items-center justify-end";
const aiToggleLabelClassName =
  "inline-flex items-center gap-[0.44rem] text-left text-[0.95rem] leading-[1.2] " +
  "text-[color:var(--pt-120)] cursor-pointer select-none";
const aiToggleInputClassName =
  "ui-checkbox-glass h-[0.88rem] w-[0.88rem] shrink-0 rounded-[0.34rem] " +
  "[--ui-checkbox-shadow:none] [--ui-checkbox-shadow-hover:none] [--ui-checkbox-shadow-checked:none] " +
  "[&::after]:h-[0.62rem] [&::after]:w-[0.34rem] [&::after]:border-r-[2.4px] [&::after]:border-b-[2.4px]";

export default function ChatAiForwardToggle({
  t,
  focusActive,
  isRoomMode,
  sendToAssistant,
  setSendToAssistant,
  aiNote,
  className = ""
}) {
  if (!isRoomMode || !focusActive) return null;

  return <div className={`${aiToggleRowClassName} ${className}`.trim()}>
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
