import { useEffect, useState } from "react";
import InviteModal from "@/components/invite/InviteModal";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import RightRail from "@/components/chat/RightRail";
import LeftRail from "@/components/chat/LeftRail";
import ChatAnalysisPanel from "./ChatAnalysisPanel";
import ChatComposer from "./ChatComposer";
import ConversationView from "./ConversationView";
import ChatSourcesPanel from "./ChatSourcesPanel";
import { glassPageBackMobileBottomCenterClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import ChatMobileRailButton from "./view/ChatMobileRailButton";
import ChatAiForwardToggle from "./view/ChatAiForwardToggle";
import { ChatRecordingNotice, ChatTopNotices } from "./view/ChatNotices";

const ENTRY_SETTLE_MS = 620;
const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";

export default function ChatBodyView({
  embedded,
  t,
  locale,
  profileOpen,
  closeProfile,
  isEntering,
  focusActive,
  chatContainerRef,
  chatContainerClassName,
  chatRingStyle,
  useMaskedChatSurface,
  handleBackHome,
  mobileRailVisible,
  showMobileRail,
  mobileRailInteractionLocked,
  isLightTheme,
  roomId,
  inputFocused,
  isMobile,
  sourcesButtonRef,
  toggleSourcesPanel,
  showSourcesPanel,
  sourcesPulse,
  conversationSources,
  hasConversationSources,
  toggleProfile,
  analysis,
  isRoomMode,
  roomTitle,
  isCrisis,
  crisisText,
  errorBanner,
  roomBlocked,
  roomAuthRequired,
  chatWindowRef,
  isStreamingAny,
  hiddenCount,
  pageSize,
  onRevealOlder,
  canHideOlder,
  onHideOlder,
  onJumpToBottom,
  messageItems,
  onWindowDoubleClick,
  chatAnalysisPanelProps,
  inputBarRef,
  inputRef,
  onFocusComposer,
  onBlurInput,
  isGenerating,
  onStop,
  onSend,
  onSendDeepResearch,
  onArmDeepResearch,
  onCancelDeepResearchMode,
  onConsumeDeepResearchMode,
  onDeepResearchEmptySubmit,
  speakLatestReply,
  canSpeakLatest,
  isSpeaking,
  recording,
  recordingPulse,
  handleMic,
  composerDraftApiRef,
  sendToAssistant,
  setSendToAssistant,
  aiNote,
  recordingError,
  closeSourcesPanel,
  analysisPanelWidth,
  maskLayerRef
}) {
  const [entrySettleActive, setEntrySettleActive] = useState(false);

  useEffect(() => {
    if (embedded) {
      setEntrySettleActive(false);
      return;
    }
    let timeoutId = 0;
    const handleTiltState = event => {
      if (event?.detail?.active) {
        setEntrySettleActive(false);
      }
    };
    if (Boolean(window[TILT_ACTIVE_FLAG_KEY])) {
      setEntrySettleActive(false);
      return;
    }
    window.addEventListener(ROUTE_TILT_STATE_EVENT, handleTiltState);
    const isMobileViewport =
      window.matchMedia?.("(max-width: 768px)")?.matches ?? window.innerWidth <= 768;
    const motionReduced =
      document?.documentElement?.dataset?.reduceMotion === "1" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (motionReduced || isMobileViewport) {
      setEntrySettleActive(false);
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, handleTiltState);
      return;
    }
    setEntrySettleActive(true);
    timeoutId = window.setTimeout(() => {
      setEntrySettleActive(false);
    }, ENTRY_SETTLE_MS);
    return () => {
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, handleTiltState);
      window.clearTimeout(timeoutId);
    };
  }, [embedded]);

  const showChatFace = !profileOpen;
  const showProfileFace = profileOpen;
  const chatFaceClass = null;
  const profileFaceClass = null;

  return <>
    <InviteModal />
    <div className={cn("chat-page-shell grid place-items-center min-h-[100dvh] h-[100dvh] p-0 overflow-y-hidden overflow-x-visible max-[768px]:overflow-hidden [overflow-anchor:none] max-[768px]:overscroll-none max-[768px]:place-items-stretch", isEntering ? "chat-entering" : null, focusActive ? "chat-page-shell--input-focus place-items-center pt-0 pb-0 [scroll-padding-top:0] [scroll-padding-bottom:0]" : null)}>
      <>
        {showChatFace ? <div className={chatFaceClass ?? undefined} aria-hidden={profileOpen ? "true" : "false"}>
          <div className="relative overflow-visible">
            <GlassRing className={cn(chatContainerClassName, entrySettleActive ? "glass-content-settle" : null)} style={chatRingStyle} role="region" aria-label={t("chat.page_label")} ref={chatContainerRef} data-chat-container="true" data-chat-theme={isLightTheme ? "light" : "dark"} data-chat-layout={isMobile ? "mobile" : "desktop"} data-chat-layout-focus={focusActive ? "true" : "false"}>
              {useMaskedChatSurface ? <div ref={maskLayerRef} className="chat-mask-layer absolute inset-0 z-0 rounded-[inherit] pointer-events-none bg-[color:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] [mask-image:var(--chat-input-hole-mask,none)] [-webkit-mask-image:var(--chat-input-hole-mask,none)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]" aria-hidden="true" /> : null}
              {useMaskedChatSurface ? (
                <div className="chat-mask-tilt-fallback absolute inset-0 z-0 rounded-[inherit] pointer-events-none" aria-hidden="true">
                  <div className="mask-pane mask-pane--top" />
                  <div className="mask-pane mask-pane--bottom" />
                  <div className="mask-pane mask-pane--left" />
                  <div className="mask-pane mask-pane--right" />
                </div>
              ) : null}
              {!profileOpen && isMobile ? <BackButton onClick={handleBackHome} ariaLabel={t("chat.back_to_home")} className={cn(glassPageBackMobileBottomCenterClassName, "chat-back-button pointer-events-auto z-[120] touch-manipulation max-[768px]:!z-[95]")} iconClassName="group-hover:!scale-[1.01] group-focus-visible:!scale-[1.01]" /> : null}
              {!profileOpen && !mobileRailVisible ? <ChatMobileRailButton isLightTheme={isLightTheme} onShowMobileRail={showMobileRail} disabled={mobileRailInteractionLocked} ariaLabel={t("chat.show_quick_actions")} /> : null}

              <LeftRail t={t} locale={locale} isLightTheme={isLightTheme} inputFocused={profileOpen ? false : (isMobile ? inputFocused : focusActive)} sourcesButtonRef={sourcesButtonRef} toggleSourcesPanel={toggleSourcesPanel} showSourcesPanel={showSourcesPanel} sourcesPulse={sourcesPulse} conversationSources={conversationSources} hasConversationSources={hasConversationSources} onBackHome={handleBackHome} embedded={embedded} suspendPointerEvents={analysis.showAnalysisPanel && analysis.analysisPanelMode === "overlay" || mobileRailInteractionLocked} />
              <RightRail t={t} locale={locale} roomId={roomId} isLightTheme={isLightTheme} inputFocused={profileOpen ? false : (isMobile ? inputFocused : focusActive)} sourcesButtonRef={sourcesButtonRef} toggleSourcesPanel={toggleSourcesPanel} showSourcesPanel={showSourcesPanel} sourcesPulse={sourcesPulse} conversationSources={conversationSources} hasConversationSources={hasConversationSources} onProfileToggle={toggleProfile} embedded={embedded} suppressTooltip={analysis.showAnalysisPanel} suspendPointerEvents={analysis.showAnalysisPanel && analysis.analysisPanelMode === "overlay" || mobileRailInteractionLocked} mobileVisible={mobileRailVisible} />

              <ChatTopNotices t={t} isRoomMode={isRoomMode} roomTitle={roomTitle} isCrisis={isCrisis} crisisText={crisisText} errorBanner={errorBanner} roomBlocked={roomBlocked} roomAuthRequired={roomAuthRequired} />

              <ConversationView t={t} chatWindowRef={chatWindowRef} isStreamingAny={isStreamingAny} hiddenCount={hiddenCount} pageSize={pageSize} onRevealOlder={onRevealOlder} canHideOlder={canHideOlder} onHideOlder={onHideOlder} onJumpToBottom={onJumpToBottom} messageItems={messageItems} onWindowDoubleClick={onWindowDoubleClick} mainClassName={focusActive ? "mb-[clamp(0.6rem,1.6vh,1.3rem)] [transform:translateY(var(--chat-window-focus-shift,0rem))]" : "mb-[clamp(0.5rem,1.4vh,1.1rem)] [transform:translateY(0)]"} isMobile={isMobile} isLightTheme={isLightTheme} hasConversationSources={hasConversationSources} conversationSourcesCount={conversationSources.length} toggleSourcesPanel={toggleSourcesPanel} showSourcesPanel={showSourcesPanel} sourcesPulse={sourcesPulse} sourcesButtonRef={sourcesButtonRef} />

              {analysis.showAnalysisPanel && !analysis.uploadPreview ? <ChatAnalysisPanel {...chatAnalysisPanelProps} /> : null}

              <ChatComposer t={t} locale={locale} isLightTheme={isLightTheme} acceptAttr={analysis.acceptAttr} ensureAnalysisPanelVisible={analysis.ensureAnalysisPanelVisible} fileInputRef={analysis.fileInputRef} onFileChange={analysis.onFileChange} inputBarRef={inputBarRef} inputRef={inputRef} onFocusInput={onFocusComposer} onBlurInput={onBlurInput} isGenerating={isGenerating} isStreamingAny={isStreamingAny} isRoomMode={isRoomMode} roomBlocked={roomBlocked} roomAuthRequired={roomAuthRequired} onStop={onStop} onSend={onSend} onSendDeepResearch={onSendDeepResearch} onArmDeepResearch={onArmDeepResearch} onCancelDeepResearchMode={onCancelDeepResearchMode} onConsumeDeepResearchMode={onConsumeDeepResearchMode} onDeepResearchEmptySubmit={onDeepResearchEmptySubmit} speakLatestReply={speakLatestReply} canSpeakLatest={canSpeakLatest} isSpeaking={isSpeaking} recording={recording} recordingPulse={recordingPulse} handleMic={handleMic} draftApiRef={composerDraftApiRef} inputFocused={focusActive} isMobile={isMobile} />

              <ChatAiForwardToggle t={t} focusActive={focusActive} isRoomMode={isRoomMode} sendToAssistant={sendToAssistant} setSendToAssistant={setSendToAssistant} aiNote={aiNote} />
              <ChatRecordingNotice recordingError={recordingError} />

              <footer className="relative mt-[0.35rem] flex min-h-[1.6rem] flex-none justify-center max-[768px]:mt-[0.55rem] max-[768px]:min-h-[1.1rem] max-[768px]:pb-[0.15rem]" />
              <ChatSourcesPanel open={showSourcesPanel} t={t} conversationSources={conversationSources} onClose={closeSourcesPanel} returnFocusRef={sourcesButtonRef} />
            </GlassRing>
            {analysis.showAnalysisPanel && analysis.uploadPreview ? <div className="mt-[2.4rem] mx-auto" style={analysisPanelWidth ? {
              width: `${analysisPanelWidth}px`,
              maxWidth: `${analysisPanelWidth}px`
            } : undefined}>
              <ChatAnalysisPanel {...chatAnalysisPanelProps} />
            </div> : null}
          </div>
        </div> : null}
        {showProfileFace ? <div className={profileFaceClass ?? undefined} aria-hidden={profileOpen ? "false" : "true"}>
          <ProfiilBody embedded isActive={profileOpen} onBack={closeProfile} />
        </div> : null}
      </>
    </div>
  </>;
}
