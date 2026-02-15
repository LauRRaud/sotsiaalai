const chatNoteClassName = "mt-[0.5rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c] self-center text-center mx-auto w-full max-w-[min(38rem,100%)]";

export function ChatTopNotices({
  t,
  isRoomMode,
  roomTitle,
  isCrisis,
  crisisText,
  errorBanner,
  roomBlocked,
  roomAuthRequired
}) {
  return <>
    {isRoomMode && roomTitle ? <div className="text-center mt-[-0.6rem] mb-[0.9rem] text-[1.25rem] text-[color:var(--pt-200)] tracking-[0.02em]">
      {roomTitle}
    </div> : null}
    {isCrisis ? <div role="alert" className="mt-[0.35rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.65rem] text-[0.92rem] text-[#ff9c9c]">
      {crisisText}
    </div> : null}
    {errorBanner ? <div role="alert" className="mt-[0.5rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c] self-center text-center mx-auto w-full max-w-[min(38rem,100%)]">
      {errorBanner}
    </div> : null}
    {isRoomMode && roomBlocked ? <div className={chatNoteClassName} role="alert">
      {t("chat.room.blocked")}
    </div> : null}
    {isRoomMode && roomAuthRequired ? <div className={chatNoteClassName} role="alert">
      {t("chat.room.auth_required")}
    </div> : null}
  </>;
}

export function ChatRecordingNotice({
  recordingError
}) {
  if (!recordingError) return null;
  return <div role="alert" className={chatNoteClassName}>
    {recordingError}
  </div>;
}
