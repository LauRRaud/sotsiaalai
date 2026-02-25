const chatAlertClassName =
  "mt-[0.5rem] mb-[0.75rem] self-center mx-auto text-center " +
  "w-fit max-w-[min(30rem,calc(100%-2.2rem))] whitespace-normal " +
  "rounded-[999px] border border-[rgba(231,112,100,0.34)] " +
  "bg-[linear-gradient(135deg,rgba(110,32,31,0.38)_0%,rgba(92,29,31,0.26)_48%,rgba(74,24,27,0.22)_100%)] " +
  "px-[1.05rem] py-[0.62rem] text-[0.92rem] leading-[1.32] text-[#ffb3aa] " +
  "shadow-[0_10px_18px_rgba(0,0,0,0.24)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] " +
  "light:border-[rgba(190,88,80,0.28)] light:bg-[rgba(255,233,231,0.76)] light:text-[#8c3c38]";

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
    {isCrisis ? <div role="alert" className={chatAlertClassName}>
      {crisisText}
    </div> : null}
    {errorBanner ? <div role="alert" className={chatAlertClassName}>
      {errorBanner}
    </div> : null}
    {isRoomMode && roomBlocked ? <div className={chatAlertClassName} role="alert">
      {t("chat.room.blocked")}
    </div> : null}
    {isRoomMode && roomAuthRequired ? <div className={chatAlertClassName} role="alert">
      {t("chat.room.auth_required")}
    </div> : null}
  </>;
}

export function ChatRecordingNotice({
  recordingError
}) {
  if (!recordingError) return null;
  return <div role="alert" className={chatAlertClassName}>
    {recordingError}
  </div>;
}
