import AutoFitPageTitle from "@/components/ui/AutoFitPageTitle";

const chatAlertClassName =
  "mt-[0.5rem] mb-[0.75rem] self-center mx-auto text-center " +
  "w-fit max-w-[min(30rem,calc(100%-2.2rem))] whitespace-normal " +
  "rounded-[999px] border px-[1.05rem] py-[0.62rem] text-[0.92rem] font-[600] leading-[1.38] " +
  "shadow-[0_10px_18px_rgba(0,0,0,0.14)] border-[rgba(231,112,100,0.3)] " +
  "bg-[linear-gradient(135deg,rgba(52,19,21,0.97)_0%,rgba(33,15,20,0.95)_100%)] text-[#fff3ef] " +
  "light:border-[rgba(122,58,56,0.22)] light:bg-[linear-gradient(180deg,rgba(255,248,246,0.99)_0%,rgba(244,234,231,0.98)_100%)] light:text-[#4e201e] " +
  "[.theme-mid_&]:border-[rgba(122,58,56,0.22)] [.theme-mid_&]:bg-[linear-gradient(180deg,rgba(255,246,243,0.98)_0%,rgba(241,227,223,0.97)_100%)] [.theme-mid_&]:text-[#562826]";

const floatingRecordingAlertClassName =
  "pointer-events-none absolute left-1/2 z-[86] -translate-x-1/2 " +
  "bottom-[clamp(1.15rem,3.2vh,1.9rem)] max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] " +
  "mb-0 mt-0";

const recordingNoticeClassName =
  "mt-[0.5rem] mb-[0.75rem] self-center mx-auto text-center " +
  "w-fit max-w-[min(30rem,calc(100%-2.2rem))] whitespace-normal " +
  "px-[0.15rem] py-0 text-[1.05rem] font-[500] leading-[1.38] " +
  "text-[color:var(--title-color,var(--brand-primary))] [text-shadow:none] " +
  "border-0 bg-transparent shadow-none backdrop-blur-0 [-webkit-backdrop-filter:none]";

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
    "chat-room-title subpage-mobile-title subpage-mobile-title--static mx-auto max-w-[min(30rem,calc(100%-2.2rem))] text-center mt-[-0.6rem] mb-[0.9rem] " +
    "text-[1.25rem] leading-[1.08] tracking-[0.02em] text-[color:var(--pt-200)] " +
    "max-[768px]:mt-[calc(env(safe-area-inset-top,0px)+2rem)] max-[768px]:mb-[0.62rem]";

  return <>
    {isRoomMode && roomTitle ? <AutoFitPageTitle as="div" className={roomTitleClassName} minFontPx={17} disableFit>
      {roomTitle}
    </AutoFitPageTitle> : null}
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
  return <div role="alert" className={`${recordingNoticeClassName} ${floating ? floatingRecordingAlertClassName : ""}`.trim()}>
    {recordingError}
  </div>;
}
