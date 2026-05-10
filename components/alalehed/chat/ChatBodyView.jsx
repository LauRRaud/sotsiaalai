import InviteModal from "@/components/invite/InviteModal";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
import GlassRing from "@/components/ui/GlassRing";
import RightRail from "@/components/chat/RightRail";
import LeftRail from "@/components/chat/LeftRail";
import ChatAnalysisPanel from "./ChatAnalysisPanel";
import ChatComposer from "./ChatComposer";
import ConversationView from "./ConversationView";
import ChatSourcesPanel from "./ChatSourcesPanel";
import WorkspacePanel from "@/components/chat/WorkspacePanel";
import { cn } from "@/components/ui/cn";
import { ChatRecordingNotice, ChatTopNotices } from "./view/ChatNotices";
import ChatMobileTopNav from "./view/ChatMobileTopNav";

export default function ChatBodyView({
  embedded,
  t,
  locale,
  profileOpen,
  closeProfile,
  workspaceOpen,
  workspaceSurfaceReady,
  onWorkspaceToggle,
  onWorkspaceClose,
  isEntering,
  focusActive,
  chatContainerRef,
  chatContainerClassName,
  chatRingStyle,
  useMaskedChatSurface,
  handleBackHome,
  mobileRailVisible,
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
  latestAnswerSources,
  allConversationSources,
  scopedSources,
  hasConversationSources,
  hasAllConversationSources: _hasAllConversationSources,
  rightRailActiveKey,
  toggleProfile,
  openProfileDirect,
  analysis,
  isRoomMode,
  roomTitle,
  hideRoomTitle,
  allowAssistantForward,
  isHelpMatchRoom,
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
  listingsPanelNode,
  selectedListingContextNode,
  onWindowDoubleClick,
  chatAnalysisPanelProps,
  inputRowRef,
  inputBarRef,
  inputRef,
  onFocusComposer,
  onBlurInput,
  isGenerating,
  userRole,
  userActualRole,
  isAdmin = false,
  subActive = false,
  onStop,
  onSend,
  onActivateInfoMode,
  onActivateDeepResearchMode,
  onActivateHelpRequestMode,
  onActivateHelpOfferMode,
  placeholderText,
  forcePlaceholderVisible = false,
  hideComposerTools,
  activeModeLabel,
  roomModeLabel,
  activeModeKey,
  documentFlowActive,
  suppressCareerCvPreview,
  onPickDocumentFile,
  voiceEnabled,
  recording,
  recordingPulse,
  handleMic,
  composerDraftApiRef,
  onDraftStateChange,
  onComposerLayoutChange,
  sendToAssistant,
  setSendToAssistant,
  aiNote,
  recordingError,
  closeSourcesPanel,
  analysisPanelWidth,
  maskLayerRef
}) {
  const showChatFace = !profileOpen;
  const showProfileFace = profileOpen;
  const chatFaceClass = null;
  const profileFaceClass = null;
  const showVisibleAnalysisPanel = analysis.showAnalysisPanel && !suppressCareerCvPreview;
  const panelSources = Array.isArray(scopedSources) ? scopedSources : null;
  const showWorkspaceFace = workspaceOpen;
  const showChatInterface = !workspaceOpen;

  return <>
    <InviteModal />
    <div className={cn("chat-page-shell grid place-items-center min-h-[100dvh] h-[100dvh] p-0 overflow-y-hidden overflow-x-visible max-[768px]:overflow-hidden [overflow-anchor:none] max-[768px]:overscroll-none max-[768px]:place-items-stretch", showVisibleAnalysisPanel && analysis.uploadPreview ? "chat-page-shell--analysis-scroll" : null, isEntering ? "chat-entering" : null, focusActive ? "chat-page-shell--input-focus place-items-center pt-0 pb-0 [scroll-padding-top:0] [scroll-padding-bottom:0]" : null)}>
      <>
        {showChatFace ? <div className={chatFaceClass ?? undefined} aria-hidden={profileOpen ? "true" : "false"}>
          <div className="relative overflow-visible">
            <GlassRing className={chatContainerClassName} style={chatRingStyle} role="region" aria-label={t("chat.page_label")} ref={chatContainerRef} data-chat-container="true" data-chat-theme={isLightTheme ? "light" : "dark"} data-chat-layout={isMobile ? "mobile" : "desktop"} data-chat-layout-focus={focusActive ? "true" : "false"}>
              {!showWorkspaceFace && useMaskedChatSurface && !isMobile ? <div ref={maskLayerRef} className="chat-mask-layer absolute inset-0 z-0 rounded-[inherit] pointer-events-none transform-gpu [transform:translateZ(0)] [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [will-change:transform,clip-path,-webkit-mask-image,mask-image] [background:var(--glass-ring-sheen,none),var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] [mask-image:var(--chat-input-hole-mask,none)] [-webkit-mask-image:var(--chat-input-hole-mask,none)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]" style={{
                maskImage: "none",
                WebkitMaskImage: "none"
              }} aria-hidden="true" /> : null}
              {!showWorkspaceFace && useMaskedChatSurface && isMobile ? (
                <div
                  ref={maskLayerRef}
                  className="chat-mask-tilt-fallback absolute inset-0 z-0 rounded-[inherit] pointer-events-none"
                  aria-hidden="true"
                />
              ) : null}
              {showChatInterface && !profileOpen && isMobile ? (
                <ChatMobileTopNav
                  t={t}
                  locale={locale}
                  isLightTheme={isLightTheme}
                  embedded={embedded}
                  handleBackHome={handleBackHome}
                  mobileRailInteractionLocked={
                    (showVisibleAnalysisPanel &&
                      analysis.analysisPanelMode === "overlay") ||
                    mobileRailInteractionLocked
                  }
                  rightRailActiveKey={workspaceOpen ? "workspace" : rightRailActiveKey}
                  toggleProfile={toggleProfile}
                  openProfileDirect={openProfileDirect}
                  workspaceOpen={workspaceOpen}
                  onWorkspaceToggle={onWorkspaceToggle}
                />
              ) : null}

              {showChatInterface && !isMobile ? <LeftRail t={t} locale={locale} isLightTheme={isLightTheme} inputFocused={profileOpen ? false : (isMobile ? inputFocused : focusActive)} onBackHome={handleBackHome} embedded={embedded} suspendPointerEvents={showVisibleAnalysisPanel && analysis.analysisPanelMode === "overlay" || mobileRailInteractionLocked} mobileVisible={mobileRailVisible} /> : null}
              {showChatInterface && !isMobile ? <RightRail t={t} locale={locale} isLightTheme={isLightTheme} inputFocused={profileOpen ? false : (isMobile ? inputFocused : focusActive)} onProfileToggle={toggleProfile} activeWorkspaceKey={rightRailActiveKey} embedded={embedded} suppressTooltip={showVisibleAnalysisPanel} suspendPointerEvents={showVisibleAnalysisPanel && analysis.analysisPanelMode === "overlay" || mobileRailInteractionLocked} mobileVisible={mobileRailVisible} workspaceOpen={workspaceOpen} onWorkspaceToggle={onWorkspaceToggle} /> : null}
              {showWorkspaceFace ? (
                <WorkspacePanel
                  t={t}
                  locale={locale}
                  userRole={userRole}
                  userActualRole={userActualRole}
                  isAdmin={isAdmin}
                  subActive={subActive}
                  onClose={onWorkspaceClose}
                  visible={workspaceSurfaceReady}
                />
              ) : null}
              {showChatInterface ? listingsPanelNode : null}
              {showChatInterface ? selectedListingContextNode : null}

              {showChatInterface ? <ChatTopNotices t={t} isRoomMode={isRoomMode} roomTitle={roomTitle} hideRoomTitle={hideRoomTitle} isCrisis={isCrisis} crisisText={crisisText} errorBanner={errorBanner} roomBlocked={roomBlocked} roomAuthRequired={roomAuthRequired} /> : null}

              {showChatInterface ? <ConversationView t={t} chatWindowRef={chatWindowRef} isStreamingAny={isStreamingAny} hiddenCount={hiddenCount} pageSize={pageSize} onRevealOlder={onRevealOlder} canHideOlder={canHideOlder} onHideOlder={onHideOlder} onJumpToBottom={onJumpToBottom} messageItems={messageItems} onWindowDoubleClick={onWindowDoubleClick} focusActive={focusActive} mainClassName={focusActive ? "mt-[var(--chat-window-main-offset,0rem)] mb-[var(--chat-window-main-bottom-overlap,clamp(0.6rem,1.6vh,1.3rem))] [transform:translateY(var(--chat-window-focus-shift,0rem))]" : "mt-[var(--chat-window-main-offset,0rem)] mb-[clamp(0.5rem,1.4vh,1.1rem)] [transform:translateY(0)]"} isMobile={isMobile} isLightTheme={isLightTheme} hasConversationSources={hasConversationSources} conversationSourcesCount={conversationSources.length} toggleSourcesPanel={toggleSourcesPanel} showSourcesPanel={showSourcesPanel} sourcesPulse={sourcesPulse} sourcesButtonRef={sourcesButtonRef} /> : null}

              {showChatInterface && showVisibleAnalysisPanel && !analysis.uploadPreview ? <ChatAnalysisPanel {...chatAnalysisPanelProps} /> : null}

              {showChatInterface ? <ChatComposer key={roomId ? `room:${roomId}:${isHelpMatchRoom ? "help" : "standard"}` : "chat:default"} t={t} locale={locale} isLightTheme={isLightTheme} hideTools={hideComposerTools} inputGlow placeholderText={placeholderText} forcePlaceholderVisible={forcePlaceholderVisible} acceptAttr={analysis.acceptAttr} ensureAnalysisPanelVisible={analysis.ensureAnalysisPanelVisible} fileInputRef={analysis.fileInputRef} onFileChange={analysis.onFileChange} inputRowRef={inputRowRef} inputBarRef={inputBarRef} inputRef={inputRef} onFocusInput={onFocusComposer} onBlurInput={onBlurInput} isGenerating={isGenerating} isStreamingAny={isStreamingAny} isRoomMode={isRoomMode} roomBlocked={roomBlocked} roomAuthRequired={roomAuthRequired} onStop={onStop} onSend={onSend} onActivateInfoMode={onActivateInfoMode} onActivateDeepResearchMode={onActivateDeepResearchMode} onActivateHelpRequestMode={onActivateHelpRequestMode} onActivateHelpOfferMode={onActivateHelpOfferMode} showDocumentAttachButton={documentFlowActive} onPickDocumentFile={onPickDocumentFile} voiceEnabled={voiceEnabled} recording={recording} recordingPulse={recordingPulse} handleMic={handleMic} draftApiRef={composerDraftApiRef} onDraftStateChange={onDraftStateChange} onLayoutChange={onComposerLayoutChange} inputFocused={inputFocused} isMobile={isMobile} activeModeLabel={activeModeLabel} roomModeLabel={roomModeLabel} activeModeKey={activeModeKey} focusActive={focusActive} allowAssistantForward={allowAssistantForward} isHelpMatchRoom={isHelpMatchRoom} sendToAssistant={sendToAssistant} setSendToAssistant={setSendToAssistant} aiNote={aiNote} /> : null}
              {showChatInterface ? <ChatRecordingNotice recordingError={recordingError} floating /> : null}

              {showChatInterface ? <footer className="relative mt-[0.35rem] flex min-h-[1.6rem] flex-none justify-center max-[768px]:mt-[0.55rem] max-[768px]:min-h-[1.1rem] max-[768px]:pb-[0.15rem]" /> : null}
              {showChatInterface ? <ChatSourcesPanel
                open={showSourcesPanel}
                t={t}
                conversationSources={panelSources || conversationSources}
                latestAnswerSources={panelSources || latestAnswerSources}
                allConversationSources={panelSources || allConversationSources}
                onClose={closeSourcesPanel}
                returnFocusRef={sourcesButtonRef}
              /> : null}
            </GlassRing>
            {showChatInterface && showVisibleAnalysisPanel && analysis.uploadPreview ? <div className="mt-[2.4rem] mx-auto" style={analysisPanelWidth ? {
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
