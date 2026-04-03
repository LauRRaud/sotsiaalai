import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
export function useSpeech({
  locale,
  latestAiText,
  onAppendText,
  onTranscribeAudio,
  onError,
  t
}) {
  const [speechReady, setSpeechReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingPulse, setRecordingPulse] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const synthesisRef = useRef(null);
  const audioRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingPulseTimerRef = useRef(null);
  const recordingLevelRef = useRef(0);
  const recordingStartedAtRef = useRef(0);
  const audioContextRef = useRef(null);
  const audioMeterTimerRef = useRef(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const tr = useCallback(key => {
    if (typeof t === "function") {
      const value = t(key);
      if (typeof value === "string" && value.trim()) return value;
    }
    return key;
  }, [t]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    synthesisRef.current = window.speechSynthesis || null;
    const synth = synthesisRef.current;
    function handleVoicesChanged() {
      setSpeechReady(true);
    }
    if (synth) {
      synth.addEventListener("voiceschanged", handleVoicesChanged);
      synth.getVoices();
      setSpeechReady(true);
      return () => synth.removeEventListener("voiceschanged", handleVoicesChanged);
    }
  }, []);
  useEffect(() => () => {
    try {
      synthesisRef.current?.cancel?.();
    } catch {}
    try {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audioRef.current = null;
      }
    } catch {}
    try {
      recorderRef.current?.stop?.();
    } catch {}
    try {
      recorderRef.current?.stream?.getTracks?.().forEach(t => t.stop && t.stop());
    } catch {}
  }, []);
  const stopSpeaking = useCallback(() => {
    try {
      synthesisRef.current?.cancel?.();
    } catch {}
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      } catch {}
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);
  const speakWithBrowser = useCallback(text => {
    if (typeof window === "undefined") return;
    const synth = synthesisRef.current;
    if (!synth || !text) return;
    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices() || [];
      const normLocale = (locale || "").toLowerCase();
      const base = normLocale.split("-")[0] || normLocale;
      const prefs = base === "et" ? [normLocale, "et-ee", "et", "en-us", "en"] : base === "ru" ? [normLocale, "ru-ru", "ru", "en-us", "en", "et-ee", "et"] : base === "en" ? [normLocale, "en-us", "en-gb", "en", "et-ee", "et", "ru-ru", "ru"] : [normLocale, base, "en-us", "en", "et-ee", "et", "ru-ru", "ru"].filter(Boolean);
      const pick = prefs.map(pref => voices.find(v => (v.lang || "").toLowerCase().startsWith(pref))).find(Boolean);
      if (pick) {
        utterance.voice = pick;
        utterance.lang = pick.lang || normLocale || "en-US";
      } else {
        utterance.lang = normLocale || "en-US";
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synth.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [locale]);
  const speakLatestReply = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = latestAiText;
    if (!text) return;
    const base = (locale || "").toLowerCase().split("-")[0];
    if (base === "ru" || base === "en") {
      stopSpeaking();
      speakWithBrowser(text);
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text.slice(0, 4500),
          locale
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok && data?.audioContent) {
        const src = `data:${data.contentType || "audio/mpeg"};base64,${data.audioContent}`;
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.onended = () => {
          audioRef.current = null;
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          audioRef.current = null;
          setIsSpeaking(false);
        };
        await audio.play();
        return;
      }
    } catch {}
    stopSpeaking();
    speakWithBrowser(text);
  }, [isSpeaking, latestAiText, locale, speakWithBrowser, stopSpeaking]);
  const triggerRecordingPulse = useCallback(() => {
    if (recordingPulseTimerRef.current) {
      clearTimeout(recordingPulseTimerRef.current);
    }
    setRecordingPulse(true);
    recordingPulseTimerRef.current = setTimeout(() => {
      setRecordingPulse(false);
      recordingPulseTimerRef.current = null;
    }, 600);
  }, []);
  const stopRecording = useCallback(() => {
    try {
      recorderRef.current?.stop?.();
    } catch {}
    try {
      recorderRef.current?.stream?.getTracks?.().forEach(t => t.stop && t.stop());
    } catch {}
    recorderRef.current = null;
    setRecording(false);
  }, []);
  const stopAudioMeter = useCallback(() => {
    if (audioMeterTimerRef.current) {
      clearInterval(audioMeterTimerRef.current);
      audioMeterTimerRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  }, []);
  const startAudioMeter = useCallback(stream => {
    const AudioContextClass = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
    if (!AudioContextClass) return;
    try {
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      audioMeterTimerRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          sum += Math.abs(data[i] - 128);
        }
        const avg = sum / data.length;
        if (avg > recordingLevelRef.current) recordingLevelRef.current = avg;
      }, 120);
    } catch {}
  }, []);
  const handleMic = useCallback(async () => {
    if (recording) {
      stopRecording();
      stopAudioMeter();
      return;
    }
    setRecordingError(null);
    if (recordingPulseTimerRef.current) {
      clearTimeout(recordingPulseTimerRef.current);
      recordingPulseTimerRef.current = null;
    }
    setRecordingPulse(false);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setRecordingError(tr("chat.mic.unsupported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      recordingLevelRef.current = 0;
      recordingStartedAtRef.current = Date.now();
      startAudioMeter(stream);
      recordingChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.ondataavailable = e => {
        if (e?.data?.size) recordingChunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        setRecording(false);
        stopAudioMeter();
        triggerRecordingPulse();
        const blob = new Blob(recordingChunksRef.current, {
          type: rec.mimeType || "audio/webm"
        });
        if (!blob.size) return;
        const durationMs = Math.max(0, Date.now() - recordingStartedAtRef.current);
        const maxLevel = recordingLevelRef.current;
        if (maxLevel < 3.5 && durationMs > 500) {
          setRecordingError(tr("chat.mic.silence"));
          return;
        }
        try {
          if (typeof onTranscribeAudio === "function") {
            const result = await onTranscribeAudio({
              blob,
              mimeType: rec.mimeType || "audio/webm",
              fileName: "audio.webm",
              locale: locale || "auto"
            });
            const nextText = String(result?.appendText || "").trim();
            if (nextText) onAppendText?.(nextText);
          } else {
            const fd = new FormData();
            fd.append("audio", blob, "audio.webm");
            fd.append("locale", locale || "auto");
            const res = await fetch("/api/stt", {
              method: "POST",
              body: fd
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.ok === false || !data?.text) {
              throw new Error(resolveApiMessage({
                payload: data,
                t: key => tr(key),
                fallbackKey: "chat.mic.error",
                fallbackText: tr("chat.mic.error")
              }));
            }
            onAppendText?.(data.text);
          }
        } catch (err) {
          setRecordingError(err?.message || tr("chat.mic.error"));
        }
      };
      rec.start();
      setRecording(true);
    } catch {
      setRecordingError(tr("chat.mic.cannot_start"));
      stopRecording();
      stopAudioMeter();
    }
  }, [locale, onAppendText, onTranscribeAudio, recording, startAudioMeter, stopAudioMeter, stopRecording, tr, triggerRecordingPulse]);
  useEffect(() => {
    return () => {
      if (recordingPulseTimerRef.current) {
        clearTimeout(recordingPulseTimerRef.current);
      }
      stopAudioMeter();
    };
  }, [stopAudioMeter]);
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);
  return useMemo(() => ({
    speechReady,
    isSpeaking,
    speakLatestReply,
    stopSpeaking,
    recording,
    recordingPulse,
    recordingError,
    handleMic
  }), [speechReady, isSpeaking, speakLatestReply, stopSpeaking, recording, recordingPulse, recordingError, handleMic]);
}
