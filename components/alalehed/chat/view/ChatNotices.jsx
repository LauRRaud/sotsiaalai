const chatAlertClassName =
  "mt-[0.5rem] mb-[0.75rem] self-center mx-auto text-center " +
  "w-fit max-w-[min(30rem,calc(100%-2.2rem))] whitespace-normal " +
  "rounded-[999px] border px-[1.05rem] py-[0.62rem] text-[0.92rem] leading-[1.32] " +
  "shadow-[0_10px_18px_rgba(0,0,0,0.18)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] " +
  "border-[rgba(231,112,100,0.24)] bg-[linear-gradient(135deg,rgba(52,19,21,0.74)_0%,rgba(33,15,20,0.68)_100%)] text-[rgba(255,230,225,0.96)] " +
  "light:border-[rgba(122,58,56,0.14)] light:bg-[linear-gradient(180deg,rgba(255,252,251,0.96)_0%,rgba(246,241,239,0.94)_100%)] light:text-[#6f3b38] " +
  "[.theme-mid_&]:border-[rgba(122,58,56,0.16)] [.theme-mid_&]:bg-[linear-gradient(180deg,rgba(253,248,246,0.92)_0%,rgba(244,234,231,0.88)_100%)] [.theme-mid_&]:text-[#71413d]";

const floatingRecordingAlertClassName =
  "pointer-events-none absolute left-1/2 z-[86] -translate-x-1/2 " +
  "bottom-[clamp(1.15rem,3.2vh,1.9rem)] max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] " +
  "mb-0 mt-0";

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
  const roomTitleClassName =
    "chat-room-title subpage-mobile-title mx-auto max-w-[min(30rem,calc(100%-2.2rem))] text-center mt-[-0.6rem] mb-[0.9rem] " +
    "text-[1.25rem] leading-[1.08] tracking-[0.02em] text-[color:var(--pt-200)] " +
    "max-[768px]:mt-[calc(env(safe-area-inset-top,0px)+2rem)] max-[768px]:mb-[0.62rem] " +
    "max-[768px]:[--subpage-title-font:clamp(1.1rem,4.15vw,1.28rem)] max-[768px]:[--subpage-title-font-android:clamp(0.98rem,3.7vw,1.12rem)]";

  return <>
    {isRoomMode && roomTitle ? <div className={roomTitleClassName}>
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
  recordingError,
  floating = false
}) {
  if (!recordingError) return null;
  return <div role="alert" className={`${chatAlertClassName} ${floating ? floatingRecordingAlertClassName : ""}`.trim()}>
    {recordingError}
  </div>;
}
