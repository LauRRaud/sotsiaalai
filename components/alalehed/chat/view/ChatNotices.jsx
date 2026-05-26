import AutoFitPageTitle from "@/components/ui/AutoFitPageTitle";
import {
  glassPageTitleClassName,
  glassPageTitleMobileHeaderClassName,
  glassPageTitleProminentClassName
} from "@/components/ui/glassPageStyles";

export function getCompactRoomTitle(roomTitle) {
  const source = String(roomTitle || "").trim();
  if (!source) return "";

  const withoutLocation = source.split(/\s[-–—]\s/)[0]?.trim() || source;
  const compact = withoutLocation.replace(/\s+(soov|pakkumine)\b.*$/iu, "").trim();

  return compact || withoutLocation || source;
}

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

const roomOriginNoticeClassName =
  "mt-[0.18rem] mb-[0.28rem] self-center mx-auto text-center " +
  "max-w-[min(34rem,calc(100%-2.2rem))] whitespace-normal " +
  "border-0 bg-transparent px-0 py-0 shadow-none backdrop-blur-0 [-webkit-backdrop-filter:none] " +
  "text-[0.82rem] font-[620] leading-[1.34] " +
  "text-[color:var(--pt-220,var(--title-color,var(--brand-primary,#c57171)))]";

function readText(t, key, fallback) {
  if (typeof t !== "function") return fallback;
  try {
    const value = t(key);
    return typeof value === "string" && value && value !== key ? value : fallback;
  } catch {
    return fallback;
  }
}

function roomOriginText(t, origin) {
  const type = String(origin?.type || "").trim().toUpperCase();
  const label = String(origin?.label || "").trim();
  const textByType = {
    MANUAL_INVITE: readText(t, "rooms.origin.manualInvite", "Ruum loodi käsitsi kutse kaudu."),
    PRE_INQUIRY: readText(t, "rooms.origin.preInquiry", "Ruum loodi eelpöördumise järel."),
    HELP_MATCH: readText(t, "rooms.origin.helpMatch", "Ruum loodi abisoovi ja abipakkumise sobituse põhjal."),
    SERVICE_PROVIDER_INQUIRY: readText(t, "rooms.origin.serviceProviderInquiry", "Ruum loodi teenusega seotud pöördumise põhjal."),
    JOURNEY: readText(t, "rooms.origin.journey", "Ruum on seotud Teekonna töövooga, kuid privaatset Teekonda ei jagata automaatselt."),
    UNKNOWN: readText(t, "rooms.origin.unknown", "Ruumil ei ole määratud päritolu.")
  };
  return textByType[type] || label || textByType.UNKNOWN;
}

function shouldShowRoomOriginPrivacy(origin) {
  return ["PRE_INQUIRY", "SERVICE_PROVIDER_INQUIRY", "JOURNEY"].includes(String(origin?.type || "").trim().toUpperCase());
}

export function ChatTopNotices({
  t,
  isRoomMode,
  roomTitle,
  roomOrigin,
  hideRoomTitle = false,
  isCrisis,
  crisisText,
  errorBanner
}) {
  const displayRoomTitle = getCompactRoomTitle(roomTitle);
  const roomTitleClassName =
    `chat-room-title subpage-mobile-title subpage-mobile-title--static ${glassPageTitleClassName} ${glassPageTitleMobileHeaderClassName} ${glassPageTitleProminentClassName} ` +
    "mx-auto w-full max-w-[min(36rem,calc(100%-2.2rem))] " +
    "min-[769px]:!text-[2.5rem] min-[769px]:mt-[clamp(2.95rem,7.2vh,4.75rem)] min-[769px]:mb-[0.22rem] " +
    "max-[768px]:!text-[clamp(1.76rem,6.2vw,2.08rem)] " +
    "max-[768px]:max-w-[calc(100%-1.8rem)] max-[768px]:mt-[calc(env(safe-area-inset-top,0px)+2.7rem)] " +
    "max-[768px]:mb-[0.08rem]";

  return <>
    {isRoomMode && !hideRoomTitle && displayRoomTitle ? <AutoFitPageTitle as="div" className={roomTitleClassName} minFontPx={18} disableFit>
      {displayRoomTitle}
    </AutoFitPageTitle> : null}
    {isRoomMode && roomOrigin ? <div className={roomOriginNoticeClassName}>
      <span>{roomOriginText(t, roomOrigin)}</span>
      {shouldShowRoomOriginPrivacy(roomOrigin) ? (
        <span> {readText(t, "rooms.origin.privacyNote", "Ruumi liikmed näevad ainult ruumis jagatud infot ja kasutaja kinnitatud eelinfot. Privaatset Teekonda ega assistendivestlust ei jagata automaatselt.")}</span>
      ) : null}
    </div> : null}
    {isCrisis ? <div role="alert" className={chatAlertClassName}>
      {crisisText}
    </div> : null}
    {errorBanner ? <div role="alert" className={chatAlertClassName}>
      {errorBanner}
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
