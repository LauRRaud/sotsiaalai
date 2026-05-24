"use client";

import { ChevronDown, ChevronUp, Hand, Mic, MicOff, Phone, PhoneOff, Square } from "lucide-react";
import { useState } from "react";

import { useRoomCall } from "@/components/rooms/useRoomCall";
import { cn } from "@/components/ui/cn";

const RECORDING_PURPOSE_OPTIONS = [
  ["GENERAL_SUMMARY", "kokkuvõtte koostamine"],
  ["CASE_SUMMARY", "juhtumikokkuvõtte mustand"],
  ["PRE_ASSESSMENT_SUMMARY", "eelpöördumise kokkuvõte"],
  ["STAR_HELPER", "STAR-i sisestamise abimaterjal"],
  ["COVISION_SUMMARY", "kovisiooni kokkuvõte"],
  ["MENTORING_SUMMARY", "mentorluskohtumise kokkuvõte"],
  ["OTHER", "muu eesmärk"]
];

function text(t, key, fallback, values = undefined) {
  if (typeof t !== "function") return fallback;
  return values ? t(key, values, fallback) : t(key, fallback);
}

function pluralSpeak(t, count) {
  if (count === 1) return text(t, "calls.speak.one", "1 soovib sõna");
  return text(t, "calls.speak.many", `${count} soovivad sõna`, { count });
}

function buttonClass(kind = "neutral") {
  return cn(
    "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
    kind === "primary" && "bg-emerald-600 text-white hover:bg-emerald-700",
    kind === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
    kind === "neutral" && "border border-white/18 bg-white/10 text-white hover:bg-white/16",
    kind === "light" && "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
  );
}

function recordingStatusText(recording) {
  if (!recording) return "";
  if (recording.status === "DECLINED") return "Salvestamist ei alustatud";
  if (recording.status === "READY_TO_RECORD") return "Salvestus on valmis käivitamiseks";
  if (recording.status === "ACTIVE") return "Salvestamine käib";
  if (recording.status === "COMPLETED") return "Salvestamine lõpetati";
  if (recording.status === "FAILED") return "Salvestus ebaõnnestus";
  if (recording.status === "REQUESTED") return `Ootame nõusolekuid: ${recording.consentedCount || 0}/${recording.requiredCount || 0}`;
  if (recording.status === "STOPPED") return "Salvestamise taotlus tühistati";
  return "";
}

export default function RoomCallBar({
  roomId,
  userId,
  isLightTheme = false,
  t,
  basePath = "",
  contextType = "ROOM",
  allowRecordingControls = true,
  recordingAllowed = true
}) {
  const [expanded, setExpanded] = useState(false);
  const [recordingPurpose, setRecordingPurpose] = useState("GENERAL_SUMMARY");
  const [recordingPurposeText, setRecordingPurposeText] = useState("");
  const {
    call,
    config,
    canModerate,
    joined,
    micMuted,
    activeSpeakRequest,
    busy,
    error,
    connectionState,
    start,
    join,
    leave,
    end,
    setMuted,
    toggleSpeakRequest,
    resolveSpeakRequest,
    requestRecordingConsent,
    respondRecordingConsent,
    cancelRecordingRequest,
    startRecording,
    stopRecording
  } = useRoomCall(roomId, userId, { basePath });

  if (!roomId) return null;

  const unavailable = config.provider === "livekit" && config.providerAvailable === false;
  const participants = call?.participants || [];
  const speakRequests = call?.speakRequests || [];
  const recording = call?.recording || null;
  const recordingControlsEnabled = allowRecordingControls && recordingAllowed && call?.recordingAllowed !== false && contextType !== "COVISION";
  const requesterName = recording?.requesterName || text(t, "calls.recording_requester_fallback", "Kõne osaleja");
  const myRecordingConsent = recording?.myConsent || (recording?.consents || []).find(consent => consent.userId === userId) || null;
  const showConsentDialog = joined && recording?.status === "REQUESTED" && myRecordingConsent?.status === "REQUESTED";
  const recordingStatus = recordingStatusText(recording);
  const speakCount = speakRequests.length;
  const isMock = config.provider === "mock";
  const shellClass = cn(
    "relative z-10 mx-auto mb-2 flex w-[min(100%,46rem)] flex-col gap-2 rounded-lg border px-2.5 py-2 shadow-sm backdrop-blur-md",
    isLightTheme
      ? "border-slate-200 bg-white/86 text-slate-900"
      : "border-white/14 bg-slate-950/42 text-white"
  );
  const iconTone = isLightTheme ? "text-emerald-700" : "text-emerald-300";
  const neutralKind = isLightTheme ? "light" : "neutral";

  return (
    <section className={shellClass} aria-label="Helikõne">
      <div className="flex min-h-8 items-center gap-2">
        <div className={cn("flex h-8 w-8 flex-none items-center justify-center rounded-md", isLightTheme ? "bg-emerald-50" : "bg-emerald-400/12")}>
          <Phone className={cn("h-4 w-4", iconTone)} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
          {call ? text(t, "calls.active", "Helikõne aktiivne") : text(t, "calls.title", "Helikõne")}
          </div>
          <div className={cn("truncate text-xs", isLightTheme ? "text-slate-600" : "text-white/68")}>
            {unavailable
              ? text(t, "calls.not_configured", "Helikõne teenus ei ole veel seadistatud.")
              : call
                ? `${participants.length}/${call.maxParticipants || config.maxParticipants || 8} ${text(t, "calls.participants_short", "osalejat")}${speakCount ? `, ${pluralSpeak(t, speakCount)}` : ""}${recordingStatus ? `, ${recordingStatus}` : ""}`
                : text(t, "calls.start_audio", "Alusta helikõnet")}
            {isMock && process.env.NODE_ENV === "development" ? ` · ${text(t, "calls.mock_mode", "mock mode")}` : ""}
          </div>
        </div>

        {!call ? (
          <button type="button" className={buttonClass("primary")} onClick={start} disabled={busy || unavailable}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{text(t, "calls.start", "Alusta")}</span>
          </button>
        ) : joined ? (
          <>
            <button type="button" className={buttonClass(neutralKind)} onClick={() => setMuted(!micMuted)} disabled={busy}>
              {micMuted ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
              <span className="hidden md:inline">{micMuted ? text(t, "calls.mic_off", "Mikrofon väljas") : text(t, "calls.mic_on", "Mikrofon sees")}</span>
            </button>
            <button type="button" className={buttonClass(neutralKind)} onClick={toggleSpeakRequest} disabled={busy}>
              <Hand className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">{activeSpeakRequest ? text(t, "calls.cancel_short", "Tühista") : text(t, "calls.request_to_speak", "Soovin sõna")}</span>
            </button>
            <button type="button" className={buttonClass("danger")} onClick={leave} disabled={busy}>
              <PhoneOff className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{text(t, "calls.leave", "Lahku")}</span>
            </button>
          </>
        ) : (
          <button type="button" className={buttonClass("primary")} onClick={join} disabled={busy || unavailable}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{text(t, "calls.join", "Liitu")}</span>
          </button>
        )}

        {call ? (
          <button type="button" className={buttonClass(neutralKind)} onClick={() => setExpanded(value => !value)} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            <span className="sr-only">{text(t, "calls.open_details", "Ava helikõne detailid")}</span>
          </button>
        ) : null}
      </div>

      {error ? (
        <div className={cn("rounded-md px-2 py-1 text-xs", isLightTheme ? "bg-rose-50 text-rose-700" : "bg-rose-400/12 text-rose-100")}>
          {error === "call.livekit_not_configured" ? text(t, "calls.not_configured", "Helikõne teenus ei ole veel seadistatud.") : error}
        </div>
      ) : null}

      {joined && connectionState && connectionState !== "idle" && connectionState !== "connected" ? (
        <div className={cn("text-xs", isLightTheme ? "text-slate-500" : "text-white/62")}>
          {text(t, "calls.connection", "Ühendus")}: {connectionState}
        </div>
      ) : null}

      {recordingControlsEnabled && recording?.status === "REQUESTED" ? (
        <div className={cn("rounded-md px-2 py-1 text-xs", isLightTheme ? "bg-amber-50 text-amber-800" : "bg-amber-400/14 text-amber-100")}>
          {text(t, "calls.recording_consent_pending", "Salvestamise nõusolekut küsitakse")} · {recordingStatus}
        </div>
      ) : null}

      {recordingControlsEnabled && recording?.status === "DECLINED" ? (
        <div className={cn("rounded-md px-2 py-1 text-xs", isLightTheme ? "bg-rose-50 text-rose-700" : "bg-rose-400/12 text-rose-100")}>
          {text(t, "calls.recording_declined", "Salvestamist ei alustatud, sest kõik osapooled ei nõustunud.")}
        </div>
      ) : null}

      {recordingControlsEnabled && recording?.status === "READY_TO_RECORD" ? (
        <div className={cn("rounded-md px-2 py-1 text-xs", isLightTheme ? "bg-emerald-50 text-emerald-800" : "bg-emerald-400/14 text-emerald-100")}>
          {text(t, "calls.recording_ready", "Salvestus on valmis käivitamiseks")}
        </div>
      ) : null}

      {recordingControlsEnabled && recording?.status === "ACTIVE" ? (
        <div className={cn("rounded-md px-2 py-1 text-xs font-semibold", isLightTheme ? "bg-rose-50 text-rose-700" : "bg-rose-400/12 text-rose-100")}>
          {text(t, "calls.recording_active", "Salvestamine käib")}
        </div>
      ) : null}

      {recordingControlsEnabled && recording?.status === "COMPLETED" ? (
        <div className={cn("rounded-md px-2 py-1 text-xs", isLightTheme ? "bg-slate-100 text-slate-700" : "bg-white/10 text-white/78")}>
          {text(t, "calls.recording_completed", "Salvestamine lõpetati")}
        </div>
      ) : null}

      {recordingControlsEnabled && recording?.status === "FAILED" ? (
        <div className={cn("rounded-md px-2 py-1 text-xs", isLightTheme ? "bg-rose-50 text-rose-700" : "bg-rose-400/12 text-rose-100")}>
          {text(t, "calls.recording_failed", "Salvestus ebaõnnestus")}
        </div>
      ) : null}

      {recordingControlsEnabled && showConsentDialog ? (
        <div className={cn("rounded-md border p-3 text-sm", isLightTheme ? "border-amber-200 bg-amber-50 text-slate-900" : "border-amber-300/25 bg-amber-300/12 text-white")}>
          <p className="font-semibold">{text(t, "calls.recording_consent_intro", `${requesterName} soovib selle helikõne salvestada.`, { requesterName })}</p>
          <p className="mt-2">{text(t, "calls.recording_consent_purpose", `Salvestust kasutatakse ainult märgitud eesmärgil: ${recording.purposeLabel}.`, { recordingPurpose: recording.purposeLabel })}</p>
          <p className="mt-2">
            {text(t, "calls.recording_consent_body", "Salvestus võib sisaldada isikuandmeid või tundlikku infot. Salvestus tehakse kättesaadavaks ainult õigustatud kasutajatele SotsiaalAI dokumentide vaates. Salvestust ei transkribeerita ega kasutata kokkuvõtte koostamiseks automaatselt; need tegevused käivitatakse eraldi kasutaja toiminguna.")}
          </p>
          <p className="mt-2">{text(t, "calls.recording_consent_question", "Kas nõustud selle kõne salvestamisega?")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={buttonClass("primary")} disabled={busy} onClick={() => respondRecordingConsent(recording.id, "CONSENTED")}>
              {text(t, "calls.recording_consent_yes", "Nõustun salvestamisega")}
            </button>
            <button type="button" className={buttonClass(isLightTheme ? "light" : "neutral")} disabled={busy} onClick={() => respondRecordingConsent(recording.id, "DECLINED")}>
              {text(t, "calls.recording_consent_no", "Ei nõustu")}
            </button>
          </div>
        </div>
      ) : null}

      {expanded && call ? (
        <div className={cn("grid gap-3 border-t pt-2 md:grid-cols-2", isLightTheme ? "border-slate-200" : "border-white/12")}>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-normal opacity-70">{text(t, "calls.participants", "Osalejad")}</div>
            <div className="space-y-1">
              {participants.length ? participants.map(participant => (
                <div key={participant.id || participant.userId} className={cn("flex items-center justify-between rounded-md px-2 py-1 text-sm", isLightTheme ? "bg-slate-50" : "bg-white/8")}>
                  <span className="truncate">{participant.displayName || text(t, "calls.participant", "Osaleja")}</span>
                  <span className="ml-2 inline-flex items-center gap-1 text-xs opacity-72">
                    {participant.micMuted ? <MicOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Mic className="h-3.5 w-3.5" aria-hidden="true" />}
                    {participant.role === "HOST" ? text(t, "calls.host", "host") : text(t, "calls.participant_lower", "osaleja")}
                  </span>
                </div>
              )) : (
                <div className="text-sm opacity-70">{text(t, "calls.no_participants", "Osalejaid pole.")}</div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-normal opacity-70">{text(t, "calls.speak_requests", "Sõnasoovid")}</div>
            <div className="space-y-1">
              {speakRequests.length ? speakRequests.map((request, index) => (
                <div key={request.id} className={cn("flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm", isLightTheme ? "bg-slate-50" : "bg-white/8")}>
                  <span className="truncate">{index + 1}. {request.displayName || text(t, "calls.participant", "Osaleja")}</span>
                  {canModerate ? (
                    <button type="button" className={buttonClass(neutralKind)} onClick={() => resolveSpeakRequest(request.id)}>
                      <Square className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{text(t, "calls.resolve", "Lahenda")}</span>
                    </button>
                  ) : null}
                </div>
              )) : (
                <div className="text-sm opacity-70">{text(t, "calls.no_speak_requests", "Sõnasoove pole.")}</div>
              )}
            </div>
            {canModerate ? (
              <button type="button" className={cn(buttonClass("danger"), "mt-2")} onClick={end} disabled={busy}>
                <PhoneOff className="h-4 w-4" aria-hidden="true" />
                <span>{text(t, "calls.end", "Lõpeta kõne")}</span>
              </button>
            ) : null}
          </div>

          <div className={cn("md:col-span-2 flex flex-col gap-2 rounded-md px-2 py-2 text-xs", isLightTheme ? "bg-slate-50 text-slate-600" : "bg-white/8 text-white/68")}>
            {!recordingControlsEnabled ? (
              <span>
                {text(
                  t,
                  contextType === "COVISION" ? "covision.room.audio_no_recording" : "calls.covision_no_recording",
                  "Kovisiooni helivestlust ei salvestata, ei transkribeerita ja heli ei saadeta AI-le."
                )}
              </span>
            ) : null}
            {recordingControlsEnabled ? (
              <>
            <span>{text(t, "calls.recording_notice", "Kõne ei salvestu vaikimisi. Salvestamine vajab kõigi nõutud osapoolte nõusolekut.")}</span>
            {recording ? (
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{recordingStatus || recording.status}</span>
                <span>{text(t, "calls.recording_purpose", "Eesmärk")}: {recording.purposeLabel}</span>
                {recording.consents?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {recording.consents.map(consent => (
                      <span key={consent.id || consent.userId} className={cn("rounded px-1.5 py-0.5", isLightTheme ? "bg-white text-slate-700" : "bg-white/10 text-white/78")}>
                        {(consent.displayName || text(t, "calls.participant", "Osaleja"))}: {consent.status}
                      </span>
                    ))}
                  </div>
                ) : null}
                {canModerate && ["REQUESTED", "READY_TO_RECORD"].includes(recording.status) ? (
                  <button type="button" className={buttonClass(neutralKind)} disabled={busy} onClick={() => cancelRecordingRequest(recording.id)}>
                    {text(t, "calls.recording_cancel", "Tühista salvestamise taotlus")}
                  </button>
                ) : null}
                {canModerate && recording.status === "READY_TO_RECORD" ? (
                  <button type="button" className={buttonClass("primary")} disabled={busy} onClick={() => startRecording(recording.id)}>
                    {text(t, "calls.recording_start", "Alusta salvestamist")}
                  </button>
                ) : null}
                {canModerate && recording.status === "ACTIVE" ? (
                  <button type="button" className={buttonClass("danger")} disabled={busy} onClick={() => stopRecording(recording.id)}>
                    {text(t, "calls.recording_stop", "Lõpeta salvestamine")}
                  </button>
                ) : null}
              </div>
            ) : canModerate ? (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                <select
                  className={cn("h-9 rounded-md border px-2 text-xs", isLightTheme ? "border-slate-200 bg-white text-slate-900" : "border-white/16 bg-slate-950/70 text-white")}
                  value={recordingPurpose}
                  onChange={event => setRecordingPurpose(event.target.value)}
                >
                  {RECORDING_PURPOSE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input
                  className={cn("h-9 rounded-md border px-2 text-xs", isLightTheme ? "border-slate-200 bg-white text-slate-900" : "border-white/16 bg-slate-950/70 text-white")}
                  value={recordingPurposeText}
                  onChange={event => setRecordingPurposeText(event.target.value)}
                  placeholder={text(t, "calls.recording_purpose_text", "Eesmärgi täpsustus")}
                />
                <button
                  type="button"
                  className={buttonClass(neutralKind)}
                  disabled={busy}
                  onClick={() => requestRecordingConsent({ purpose: recordingPurpose, purposeText: recordingPurposeText })}
                >
                  <span>{text(t, "calls.request_recording_consent", "Taotle salvestamise nõusolekut")}</span>
                </button>
              </div>
            ) : (
              <span>{text(t, "calls.recording_moderator_only", "Salvestamise nõusolekut saab küsida host või moderaator.")}</span>
            )}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
