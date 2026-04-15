const aiToggleRowClassName =
  "-mt-[0.48rem] mx-auto flex w-[min(100%,calc(var(--chat-input-max-w,100%)+var(--chat-composer-side-control-size,3.15rem)+clamp(0.34rem,1.9vw,0.58rem)))] items-center justify-end " +
  "pr-[clamp(0.02rem,0.2vw,0.08rem)] max-[768px]:-mt-[0.4rem] " +
  "max-[768px]:w-[min(100%,calc(var(--chat-input-max-w,100%)+var(--chat-composer-side-control-size,3.15rem)+clamp(0.22rem,1vw,0.36rem)))] max-[768px]:pr-0";
const aiToggleLabelClassName =
  "inline-flex items-center gap-[0.52rem] text-left text-[0.95rem] leading-[1.2] " +
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
      <span className="text-[0.95rem] leading-[1.2] text-[color:var(--pt-120)]">
        {t("chat.ai_toggle.label")}
      </span>
    </label>
    <span id="chat-ai-hint" className="sr-only">
      {aiNote}
    </span>
  </div>;
}
