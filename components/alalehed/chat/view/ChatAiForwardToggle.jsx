const aiToggleRowClassName =
  "inline-flex max-w-full items-center justify-end";
const aiToggleLabelClassName =
  "inline-flex items-center gap-[0.52rem] text-left text-[0.95rem] leading-[1.2] " +
  "text-[color:var(--pt-120)] cursor-pointer select-none";
const aiToggleInputClassName =
  "ui-checkbox-glass h-[1.05rem] w-[1.05rem] shrink-0 [--ui-checkbox-shadow:none] [--ui-checkbox-shadow-hover:none] [--ui-checkbox-shadow-checked:none]";

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
