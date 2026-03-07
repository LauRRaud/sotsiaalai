"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider"
import { useEffectiveRole } from "@/components/auth/useEffectiveRole"
import { useI18n } from "@/components/i18n/I18nProvider"
import ChatComposer from "@/components/alalehed/chat/ChatComposer"
import ChatMessageItem from "@/components/alalehed/chat/ChatMessageItem"
import ConversationView from "@/components/alalehed/chat/ConversationView"
import { ChatRecordingNotice } from "@/components/alalehed/chat/view/ChatNotices"
import { detectMobileViewport } from "@/components/alalehed/chat/chatLayoutVars"
import DocumentsDropdown from "@/components/documents/DocumentsDropdown"
import BackButton from "@/components/ui/BackButton"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Panel from "@/components/ui/Panel"
import Textarea from "@/components/ui/Textarea"
import { useSpeech } from "@/components/chat/hooks/useSpeech"
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles"
import { linkBrandInlineClass } from "@/components/ui/linkStyles"
import { AGENT_ARTIFACT_TYPE_VALUES } from "@/lib/documents/constants"
import { clientTaskInstruction } from "@/lib/documents/agentTasks"
import {
  artifactStatusLabel,
  artifactTypeLabel,
  formatDate,
  formatFileSize,
  kindLabel,
  templateForLabel
} from "@/lib/documents/presentation"
import { localizePath } from "@/lib/localizePath"

const agentTitleClassName =
  `${glassPageTitleClassName} !mt-0 !mb-0 !px-0 !text-center !whitespace-normal ` +
  `!text-[clamp(1.9rem,3.6vw,2.6rem)] !leading-[1.06] !tracking-[0.02em] ` +
  `max-[768px]:!text-[clamp(1.95rem,7vw,2.45rem)] max-[768px]:!leading-[1.08] max-[768px]:!mt-0`

const chipBaseClassName =
  "documents-chip inline-flex min-h-[2.6rem] items-center justify-center rounded-full px-[0.9rem] py-[0.38rem] text-[1.02rem] leading-none"
const WORKSPACE_VERSION_LIMIT = 8
const CLIENT_MAX_DOCUMENTS = 2
const CLIENT_AGENT_TASK_OPTIONS = [
  { value: "LETTER_REQUEST", artifactType: "LETTER_DRAFT", labelKey: "documents.agent_workspace.client_tasks.letter_request" },
  { value: "LETTER_REPLY", artifactType: "LETTER_DRAFT", labelKey: "documents.agent_workspace.client_tasks.letter_reply" },
  { value: "FILL_FORM", artifactType: "OTHER", labelKey: "documents.agent_workspace.client_tasks.fill_form" }
]

function createWorkspaceMessage({ role, text, attachments = [] }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text: String(text || ""),
    attachments: Array.isArray(attachments) ? attachments : []
  }
}

function isTemplateCompatible(template, artifactType) {
  const templateType = String(template?.templateFor || "").trim().toUpperCase()
  const targetType = String(artifactType || "").trim().toUpperCase()
  return !templateType || templateType === "OTHER" || templateType === targetType
}

function templateOptionLabel(template, t) {
  const title = String(template?.title || template?.originalName || "").trim()
  const target = template?.templateFor ? templateForLabel(template.templateFor, t) : ""
  return target ? `${title} - ${target}` : title
}

function segmentedChipClassName(isActive) {
  return `${chipBaseClassName} ${isActive ? "is-active" : ""}`
}

function formatArtifactMessage(artifact, t) {
  if (!artifact) return ""
  const title = String(artifact?.title || "").trim()
  const content = String(artifact?.content || "").trim()
  if (title && content) return `${title}\n\n${content}`
  if (content) return content
  return title || t("documents.agent_workspace.result_empty")
}

function buildSourceAttachments(sources, t) {
  return Array.isArray(sources)
    ? sources
        .filter((source) => source?.id)
        .map((source) => ({
          label: source?.title || source?.originalName || t("documents.actions.download"),
          url: `/api/documents/${encodeURIComponent(source.id)}/download`,
          fileName: source?.originalName || undefined
        }))
    : []
}

export default function AgentModePage({ initialDocumentIds = [], initialArtifactId = "" }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const { prefs } = useAccessibility()
  const { effectiveRole, isAdmin, isRoleViewActive } = useEffectiveRole()
  const isClientRole = effectiveRole === "CLIENT"
  const documentsHref = localizePath("/documents", locale)
  const chatHref = localizePath("/vestlus", locale)
  const backHref = isClientRole ? chatHref : documentsHref
  const isLightTheme = prefs?.theme === "light" || prefs?.theme === "light-mono" || prefs?.theme === "mid"
  const roleScope = effectiveRole === "SOCIAL_WORKER" ? "worker" : "client"
  const roleViewLabel = t(effectiveRole === "SOCIAL_WORKER" ? "profile.role_short.worker" : "profile.role_short.client")
  const defaultAudience = effectiveRole === "CLIENT" ? "client" : "worker"
  const initialSelectedDocumentIds = useMemo(
    () => Array.from(new Set(initialDocumentIds.map((value) => String(value || "").trim()).filter(Boolean))),
    [initialDocumentIds]
  )
  const chatWindowRef = useRef(null)
  const inputBarRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const clientUploadInputRef = useRef(null)
  const composerDraftApiRef = useRef(null)
  const activeRequestAbortRef = useRef(null)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState(initialSelectedDocumentIds)
  const [documents, setDocuments] = useState([])
  const [templates, setTemplates] = useState([])
  const [missingDocumentIds, setMissingDocumentIds] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(selectedDocumentIds.length > 0)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState("")
  const [templatesError, setTemplatesError] = useState("")
  const [clientUploadError, setClientUploadError] = useState("")
  const [clientUploading, setClientUploading] = useState(false)
  const [recentArtifacts, setRecentArtifacts] = useState([])
  const [recentArtifactsLoading, setRecentArtifactsLoading] = useState(isClientRole)
  const [recentArtifactsError, setRecentArtifactsError] = useState("")

  const [outputType, setOutputType] = useState("REPORT_DRAFT")
  const [audience, setAudience] = useState(defaultAudience)
  const [audienceTouched, setAudienceTouched] = useState(false)
  const [tone, setTone] = useState("professional")
  const [language, setLanguage] = useState(locale || "et")
  const [length, setLength] = useState("standard")
  const [instruction, setInstruction] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [clientTask, setClientTask] = useState("LETTER_REQUEST")

  const [persistedArtifactId, setPersistedArtifactId] = useState(String(initialArtifactId || "").trim())
  const [workspaceResult, setWorkspaceResult] = useState(null)
  const [resultTitle, setResultTitle] = useState("")
  const [resultContent, setResultContent] = useState("")
  const [refineInstruction, setRefineInstruction] = useState("")
  const [artifactLoading, setArtifactLoading] = useState(Boolean(initialArtifactId))
  const [artifactError, setArtifactError] = useState("")

  const [starting, setStarting] = useState(false)
  const [refiningResult, setRefiningResult] = useState(false)
  const [savingResult, setSavingResult] = useState(false)
  const [approvingResult, setApprovingResult] = useState(false)
  const [runError, setRunError] = useState("")
  const [runFeedback, setRunFeedback] = useState(null)
  const [approvalNotice, setApprovalNotice] = useState(null)
  const [workspaceVersions, setWorkspaceVersions] = useState([])
  const [conversationMessages, setConversationMessages] = useState([])
  const [inputFocused, setInputFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  function createWorkspaceVersion({ kind, title, content, type, templateId = selectedTemplateId }) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      title: String(title || ""),
      content: String(content || ""),
      type: String(type || outputType || "REPORT_DRAFT"),
      templateId: String(templateId || ""),
      createdAt: new Date().toISOString()
    }
  }

  function resetWorkspaceVersionsFromResult(nextResult, kind = "generated") {
    const nextContent = String(nextResult?.content || "")
    if (!nextContent.trim()) {
      setWorkspaceVersions([])
      return
    }

    setWorkspaceVersions([
      createWorkspaceVersion({
        kind,
        title: nextResult?.title,
        content: nextContent,
        type: nextResult?.type,
        templateId: nextResult?.templateId
      })
    ])
  }

  function appendWorkspaceVersion({ kind, title, content, type, templateId = selectedTemplateId }) {
    const nextContent = String(content || "")
    if (!nextContent.trim()) return

    setWorkspaceVersions((current) => {
      const nextVersion = createWorkspaceVersion({ kind, title, content: nextContent, type, templateId })
      return [...current.slice(-(WORKSPACE_VERSION_LIMIT - 1)), nextVersion]
    })
  }

  function applyWorkspaceResult(nextResult) {
    setWorkspaceResult(nextResult)
    setResultTitle(String(nextResult?.title || ""))
    setResultContent(String(nextResult?.content || ""))
    setRefineInstruction("")
    if (nextResult?.type) setOutputType(String(nextResult.type))
    setSelectedTemplateId(String(nextResult?.templateId || ""))
  }

  function clearWorkspaceResult() {
    setWorkspaceResult(null)
    setResultTitle("")
    setResultContent("")
    setRefineInstruction("")
    setInstruction("")
    setPersistedArtifactId("")
    setArtifactError("")
    setWorkspaceVersions([])
    setConversationMessages([])
  }

  function buildWorkspaceHref(nextArtifactId = "") {
    const basePath = localizePath("/agendireziim", locale)
    const params = new URLSearchParams()
    if (selectedDocumentIds.length) params.set("documents", selectedDocumentIds.join(","))
    if (nextArtifactId) params.set("artifact", nextArtifactId)
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  function clearResultMessages() {
    if (runError) setRunError("")
    if (runFeedback) setRunFeedback(null)
    if (artifactError) setArtifactError("")
    if (approvalNotice) setApprovalNotice(null)
  }

  useEffect(() => {
    if (!approvalNotice) return undefined
    const timer = window.setTimeout(() => setApprovalNotice(null), 8000)
    return () => window.clearTimeout(timer)
  }, [approvalNotice])

  useEffect(() => {
    if (typeof window === "undefined") return undefined
    const updateMobileState = () => setIsMobile(detectMobileViewport())
    updateMobileState()
    const mobileQuery = window.matchMedia("(max-width: 768px)")
    mobileQuery.addEventListener?.("change", updateMobileState)
    window.addEventListener("resize", updateMobileState)
    return () => {
      mobileQuery.removeEventListener?.("change", updateMobileState)
      window.removeEventListener("resize", updateMobileState)
    }
  }, [])

  useEffect(() => () => {
    activeRequestAbortRef.current?.abort?.()
  }, [])

  useEffect(() => {
    if (!audienceTouched) {
      setAudience(defaultAudience)
    }
  }, [audienceTouched, defaultAudience])

  useEffect(() => {
    setSelectedDocumentIds(initialSelectedDocumentIds)
  }, [initialSelectedDocumentIds])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function loadDocuments() {
      if (!selectedDocumentIds.length) {
        setDocuments([])
        setMissingDocumentIds([])
        setDocumentsError("")
        setDocumentsLoading(false)
        return
      }

      setDocumentsLoading(true)
      setDocumentsError("")

      try {
        const results = await Promise.all(selectedDocumentIds.map(async (id) => {
          try {
            const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
              cache: "no-store",
              signal: controller.signal
            })
            const payload = await response.json().catch(() => ({}))
            if (!response.ok) {
              return {
                id,
                error: payload?.message || t("documents.errors.load_documents"),
                status: response.status
              }
            }
            return { id, document: payload?.document || null }
          } catch (error) {
            if (controller.signal.aborted) return { id, aborted: true }
            return {
              id,
              error: error?.message || t("documents.errors.load_documents")
            }
          }
        }))

        if (cancelled) return

        const nextDocuments = []
        const nextMissingIds = []
        let nextError = ""

        for (const result of results) {
          if (result?.document) {
            nextDocuments.push(result.document)
            continue
          }
          if (result?.aborted) continue
          nextMissingIds.push(result.id)
          if (!nextError && result?.status && ![403, 404].includes(result.status)) {
            nextError = result.error || t("documents.errors.load_documents")
          }
        }

        setDocuments(nextDocuments)
        setMissingDocumentIds(nextMissingIds)
        setDocumentsError(nextError)
      } finally {
        if (!cancelled) setDocumentsLoading(false)
      }
    }

    void loadDocuments()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [selectedDocumentIds, t])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function loadTemplates() {
      if (isClientRole) {
        setTemplates([])
        setTemplatesError("")
        setTemplatesLoading(false)
        return
      }

      setTemplatesLoading(true)
      setTemplatesError("")

      try {
        const params = new URLSearchParams({
          kind: "TEMPLATE",
          limit: "50"
        })
        const response = await fetch(`/api/documents?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.message || t("documents.errors.load_documents"))
        if (cancelled) return
        setTemplates(Array.isArray(payload?.documents) ? payload.documents : [])
      } catch (error) {
        if (controller.signal.aborted || cancelled) return
        setTemplates([])
        setTemplatesError(error?.message || t("documents.errors.load_documents"))
      } finally {
        if (!cancelled) setTemplatesLoading(false)
      }
    }

    void loadTemplates()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [isClientRole, t])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function loadRecentArtifacts() {
      if (!isClientRole) {
        setRecentArtifacts([])
        setRecentArtifactsError("")
        setRecentArtifactsLoading(false)
        return
      }

      setRecentArtifactsLoading(true)
      setRecentArtifactsError("")

      try {
        const response = await fetch("/api/documents/artifacts?limit=10", {
          cache: "no-store",
          signal: controller.signal
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.message || t("documents.artifacts.errors.list_failed"))
        if (cancelled) return
        setRecentArtifacts(Array.isArray(payload?.artifacts) ? payload.artifacts : [])
      } catch (error) {
        if (controller.signal.aborted || cancelled) return
        setRecentArtifacts([])
        setRecentArtifactsError(error?.message || t("documents.artifacts.errors.list_failed"))
      } finally {
        if (!cancelled) setRecentArtifactsLoading(false)
      }
    }

    void loadRecentArtifacts()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [isClientRole, t])

  useEffect(() => {
    setPersistedArtifactId(String(initialArtifactId || "").trim())
  }, [initialArtifactId])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function loadArtifact() {
      if (!persistedArtifactId) {
        setArtifactLoading(false)
        setArtifactError("")
        return
      }

      if (workspaceResult?.id === persistedArtifactId) {
        setArtifactLoading(false)
        setArtifactError("")
        return
      }

      setArtifactLoading(true)
      setArtifactError("")

      try {
        const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(persistedArtifactId)}`, {
          cache: "no-store",
          signal: controller.signal
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.message || t("documents.errors.load_artifact"))
        if (cancelled) return
        const nextArtifact = payload?.artifact || null
        applyWorkspaceResult(nextArtifact)
        const nextContent = String(nextArtifact?.content || "")
        if (nextContent.trim()) {
          setWorkspaceVersions([
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              kind: "loaded",
              title: String(nextArtifact?.title || ""),
              content: nextContent,
              type: String(nextArtifact?.type || "REPORT_DRAFT"),
              templateId: String(nextArtifact?.templateId || ""),
              createdAt: new Date().toISOString()
            }
          ])
        } else {
          setWorkspaceVersions([])
        }
      } catch (error) {
        if (controller.signal.aborted || cancelled) return
        applyWorkspaceResult(null)
        setWorkspaceVersions([])
        setArtifactError(error?.message || t("documents.errors.load_artifact"))
      } finally {
        if (!cancelled) setArtifactLoading(false)
      }
    }

    void loadArtifact()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [persistedArtifactId, t, workspaceResult?.id])

  const outputTypeOptions = useMemo(() => {
    if (isClientRole) {
      return CLIENT_AGENT_TASK_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
        artifactType: option.artifactType
      }))
    }

    return AGENT_ARTIFACT_TYPE_VALUES.map((value) => ({ value, label: artifactTypeLabel(value, t) }))
  }, [isClientRole, t])
  const audienceOptions = useMemo(
    () => [
      { value: "worker", label: t("chat.deep_research.scope_output_worker") },
      { value: "client", label: t("chat.deep_research.scope_output_client") }
    ],
    [t]
  )
  const toneOptions = useMemo(
    () => [
      { value: "professional", label: t("documents.agent_workspace.tones.professional") },
      { value: "supportive", label: t("documents.agent_workspace.tones.supportive") },
      { value: "plain", label: t("documents.agent_workspace.tones.plain") }
    ],
    [t]
  )
  const languageOptions = useMemo(
    () => [
      { value: "et", label: t("common.languages.et") },
      { value: "en", label: t("common.languages.en") },
      { value: "ru", label: t("common.languages.ru") }
    ],
    [t]
  )
  const lengthOptions = useMemo(
    () => [
      { value: "short", label: t("documents.agent_workspace.lengths.short") },
      { value: "standard", label: t("documents.agent_workspace.lengths.standard") },
      { value: "detailed", label: t("documents.agent_workspace.lengths.detailed") }
    ],
    [t]
  )

  const selectedCount = documents.length
  const selectedCountLimitReached = isClientRole && selectedCount >= CLIENT_MAX_DOCUMENTS
  const templateTargetType = String(workspaceResult?.type || outputType || "REPORT_DRAFT")
  const allowedTemplates = useMemo(() => templates.filter((template) => template.agentAllowed), [templates])
  const activeTemplate =
    allowedTemplates.find((template) => template.id === selectedTemplateId) ||
    (workspaceResult?.template && String(workspaceResult.template.id || "") === String(selectedTemplateId || "")
      ? workspaceResult.template
      : null)
  const compatibleTemplates = useMemo(() => {
    const base = allowedTemplates.filter((template) => isTemplateCompatible(template, templateTargetType))
    if (activeTemplate && !base.some((template) => template.id === activeTemplate.id)) {
      return [activeTemplate, ...base]
    }
    return base
  }, [activeTemplate, allowedTemplates, templateTargetType])
  const templateOptions = useMemo(
    () => compatibleTemplates.map((template) => ({ value: template.id, label: templateOptionLabel(template, t) })),
    [compatibleTemplates, t]
  )
  const templateDropdownOptions = useMemo(
    () => [{ value: "", label: t("documents.agent_workspace.template_none") }, ...templateOptions],
    [t, templateOptions]
  )
  const hasWorkspaceResult = Boolean(workspaceResult)
  const isWorkspaceResultSaved = Boolean(workspaceResult?.id)
  const canPersistResult = hasWorkspaceResult && resultContent.trim().length > 0
  const canClearWorkspaceResult = hasWorkspaceResult && !starting && !refiningResult && !savingResult && !approvingResult
  const hasDraftEdits =
    hasWorkspaceResult &&
    (String(resultTitle || "").trim() !== String(workspaceResult?.title || "").trim() ||
      String(resultContent || "") !== String(workspaceResult?.content || ""))
  const canRestoreSavedVersion =
    isWorkspaceResultSaved &&
    workspaceResult?.status === "DRAFT" &&
    hasDraftEdits &&
    !refiningResult &&
    !savingResult &&
    !approvingResult
  const canRunAlternateOutput =
    !isClientRole &&
    selectedCount > 0 &&
    instruction.trim().length > 0 &&
    !starting &&
    !refiningResult &&
    !savingResult &&
    !approvingResult
  const alternateOutputOptions = outputTypeOptions.filter((option) => option.value !== String(workspaceResult?.type || outputType || ""))
  const introText = selectedDocumentIds.length
    ? t(`documents.agent_handoff.agent_page_with_docs_${roleScope}`, { count: selectedDocumentIds.length })
    : t(`documents.agent_handoff.agent_page_empty_${roleScope}`)
  const activeArtifactDetailHref = !isClientRole && isWorkspaceResultSaved
    ? localizePath(`/documents/artifacts/${encodeURIComponent(workspaceResult.id)}`, locale)
    : ""
  const artifactResultsHref = !isClientRole ? localizePath("/documents?artifacts=all#artifacts", locale) : ""
  const isAgentBusy = starting || refiningResult
  const conversationIntroText = selectedCount
    ? t(`documents.agent_workspace.conversation_intro_with_docs_${roleScope}`, { count: selectedCount })
    : t(`documents.agent_workspace.conversation_intro_empty_${roleScope}`)
  const latestAiText = useMemo(() => {
    const currentWorkspaceText = String(resultContent || workspaceResult?.content || "").trim()
    if (currentWorkspaceText) return currentWorkspaceText
    const latestAssistantMessage = [...conversationMessages].reverse().find((entry) => entry.role === "ai" && String(entry.text || "").trim())
    if (latestAssistantMessage?.text) return latestAssistantMessage.text
    return ""
  }, [conversationMessages, resultContent, workspaceResult?.content])
  const {
    isSpeaking,
    speakLatestReply,
    recording,
    recordingPulse,
    recordingError,
    handleMic
  } = useSpeech({
    locale,
    latestAiText,
    onAppendText: (text) => composerDraftApiRef.current?.appendText?.(text),
    onError: setRunError,
    t
  })
  const canSpeakLatest = Boolean(String(latestAiText || "").trim())
  const conversationHelpText = isAgentBusy
    ? starting
      ? t("documents.agent_workspace.conversation_generating")
      : t("documents.agent_workspace.conversation_refining")
    : !selectedCount
      ? t(isClientRole ? "documents.agent_workspace.client_needs_documents" : "documents.agent_workspace.needs_documents")
      : hasWorkspaceResult && workspaceResult?.status === "DRAFT" && resultContent.trim()
        ? t("documents.agent_workspace.conversation_refine_help")
        : t("documents.agent_workspace.conversation_ready_help")
  const clientResultLabel =
    outputTypeOptions.find((option) => option.value === clientTask)?.label || t("documents.agent_workspace.client_tasks.letter_request")
  const agentConversationVars = useMemo(
    () => ({
      "--chat-window-max-w": "100%",
      "--chat-window-shift-x": "0rem",
      "--chat-window-shift-y": "0rem",
      "--chat-window-top-offset": "0rem",
      "--chat-window-pad-top": isMobile ? "0.4rem" : "0.7rem",
      "--chat-window-pad-bottom": isMobile ? "1.15rem" : "1.4rem",
      "--chat-window-top-safe": isMobile ? "0.65rem" : "0.85rem",
      "--chat-window-bottom-gap": "0rem",
      "--chat-window-mobile-extra-height": "0rem",
      "--chat-window-mobile-width-right": "0rem",
      "--chat-window-bottom-safe": "0rem",
      "--chat-window-fade-top": "0rem",
      "--chat-window-fade-bottom": "0rem",
      "--chat-window-pad-x": isMobile ? "0.52rem" : "0.9rem",
      "--chat-content-top-offset": "0rem",
      "--chat-content-spacer": isMobile ? "0.1rem" : "0.2rem",
      "--chat-content-bottom-spacer": isMobile ? "0.45rem" : "0.35rem",
      "--chat-input-shift": "0rem",
      "--chat-input-focus-shift": "0rem",
      "--chat-inputbar-left-pull": "0rem",
      "--chat-attach-left-pull": "0rem",
      "--chat-hpad-left": isMobile ? "0.08rem" : "0rem",
      "--chat-hpad-right": isMobile ? "0.08rem" : "0rem",
      "--chat-hpad": "0rem",
      "--chat-input-max-w": "100%",
      "--chat-vk-offset": "0px",
      "--inputbar-h": "3.2rem",
      "--chat-window-top-text-fade-extra": "0rem"
    }),
    [isMobile]
  )

  useEffect(() => {
    if (workspaceResult || !selectedTemplateId) return
    const selectedTemplate = allowedTemplates.find((template) => template.id === selectedTemplateId)
    if (!selectedTemplate || !isTemplateCompatible(selectedTemplate, outputType)) {
      setSelectedTemplateId("")
    }
  }, [allowedTemplates, outputType, selectedTemplateId, workspaceResult])

  useEffect(() => {
    if (!workspaceResult?.content || conversationMessages.length > 0) return
    setConversationMessages([
      createWorkspaceMessage({
        role: "ai",
        text: formatArtifactMessage(workspaceResult, t),
        attachments: buildSourceAttachments(workspaceResult.sources, t)
      })
    ])
  }, [conversationMessages.length, t, workspaceResult])

  function appendConversationMessage(message) {
    const nextMessage = createWorkspaceMessage(message)
    setConversationMessages((current) => [...current, nextMessage])
    return nextMessage
  }

  function removeConversationMessage(messageId) {
    setConversationMessages((current) => current.filter((entry) => entry.id !== messageId))
  }

  function handleJumpToBottom() {
    const node = chatWindowRef.current
    if (!node) return
    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth"
    })
  }

  function handleStopAgentRequest() {
    activeRequestAbortRef.current?.abort?.()
  }

  async function refreshRecentArtifacts() {
    if (!isClientRole) return

    try {
      const response = await fetch("/api/documents/artifacts?limit=10", {
        cache: "no-store",
        headers: { "x-ui-locale": locale }
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.artifacts.errors.list_failed"))
      setRecentArtifacts(Array.isArray(payload?.artifacts) ? payload.artifacts : [])
      setRecentArtifactsError("")
    } catch (error) {
      setRecentArtifactsError(error?.message || t("documents.artifacts.errors.list_failed"))
    }
  }

  async function handleClientUpload(event) {
    const file = event?.target?.files?.[0]
    event.target.value = ""
    if (!file) return

    if (selectedCount >= CLIENT_MAX_DOCUMENTS) {
      setClientUploadError(t("documents.agent_workspace.client_file_limit_reached", { count: CLIENT_MAX_DOCUMENTS }))
      return
    }

    setClientUploading(true)
    setClientUploadError("")
    clearResultMessages()

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("kind", "MATERIAL")

      const uploadResponse = await fetch("/api/documents", {
        method: "POST",
        headers: { "x-ui-locale": locale },
        body: formData
      })
      const uploadPayload = await uploadResponse.json().catch(() => ({}))
      if (!uploadResponse.ok) throw new Error(uploadPayload?.message || t("documents.errors.upload_failed"))

      const uploadedDocument = uploadPayload?.document || null
      if (!uploadedDocument?.id) throw new Error(t("documents.errors.upload_failed"))

      const allowResponse = await fetch(`/api/documents/${encodeURIComponent(uploadedDocument.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-ui-locale": locale
        },
        body: JSON.stringify({
          kind: "MATERIAL",
          agentAllowed: true
        })
      })
      const allowPayload = await allowResponse.json().catch(() => ({}))
      if (!allowResponse.ok) throw new Error(allowPayload?.message || t("documents.errors.update_failed"))

      const nextDocument = allowPayload?.document || uploadedDocument
      setDocuments((current) => [...current, nextDocument].slice(0, CLIENT_MAX_DOCUMENTS))
      setSelectedDocumentIds((current) =>
        Array.from(new Set([...current, nextDocument.id])).slice(0, CLIENT_MAX_DOCUMENTS)
      )
      setMissingDocumentIds((current) => current.filter((id) => id !== nextDocument.id))
      setRunFeedback({
        message: t("documents.agent_workspace.client_file_added", {
          title: nextDocument.title || nextDocument.originalName
        })
      })
    } catch (error) {
      setClientUploadError(error?.message || t("documents.errors.upload_failed"))
    } finally {
      setClientUploading(false)
    }
  }

  async function handleClientRemoveDocument(documentId) {
    const nextId = String(documentId || "").trim()
    if (!nextId) return

    clearResultMessages()
    try {
      await fetch(`/api/documents/${encodeURIComponent(nextId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-ui-locale": locale
        },
        body: JSON.stringify({ agentAllowed: false })
      })
    } catch {}

    setSelectedDocumentIds((current) => current.filter((id) => id !== nextId))
    setDocuments((current) => current.filter((document) => document.id !== nextId))
    setMissingDocumentIds((current) => current.filter((id) => id !== nextId))
    setRunFeedback({ message: t("documents.agent_workspace.client_file_removed") })
  }

  async function handleOpenClientArtifact(artifactId) {
    const nextArtifactId = String(artifactId || "").trim()
    if (!nextArtifactId) return

    clearResultMessages()
    setPersistedArtifactId(nextArtifactId)
    router.replace(buildWorkspaceHref(nextArtifactId), { scroll: false })
  }

  async function handleCopyRecentArtifact(artifactId) {
    try {
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}`, {
        cache: "no-store"
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.copy_failed"))
      await navigator.clipboard.writeText(String(payload?.artifact?.content || ""))
      setRunError("")
      setRunFeedback({ message: t("documents.feedback.copied") })
    } catch (error) {
      setRunFeedback(null)
      setRunError(error?.message || t("documents.errors.copy_failed"))
    }
  }

  async function handleDeleteClientArtifact(artifactId) {
    const nextArtifactId = String(artifactId || "").trim()
    if (!nextArtifactId) return

    clearResultMessages()

    try {
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(nextArtifactId)}`, {
        method: "DELETE",
        headers: { "x-ui-locale": locale }
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.artifacts.errors.delete_failed"))

      setRecentArtifacts((current) => current.filter((artifact) => artifact.id !== nextArtifactId))
      if (workspaceResult?.id === nextArtifactId) {
        clearWorkspaceResult()
        router.replace(buildWorkspaceHref(""), { scroll: false })
      }
      setRunFeedback({ message: t("documents.feedback.artifact_deleted") })
    } catch (error) {
      setRunError(error?.message || t("documents.artifacts.errors.delete_failed"))
    }
  }

  async function runGeneration({
    typeOverride = outputType,
    instructionOverride = instruction,
    historyKind = "generated",
    feedbackKey = "documents.agent_workspace.result_ready"
  } = {}) {
    const effectiveInstruction = String(instructionOverride || "").trim()
    if (!selectedCount || !effectiveInstruction || starting) return null

    setStarting(true)
    clearResultMessages()

    const controller = new AbortController()
    activeRequestAbortRef.current = controller

    try {
      const effectiveType = isClientRole
        ? CLIENT_AGENT_TASK_OPTIONS.find((option) => option.value === clientTask)?.artifactType || "LETTER_DRAFT"
        : typeOverride
      const nextInstruction = isClientRole
        ? `${clientTaskInstruction(clientTask)}\n\n${effectiveInstruction}`
        : effectiveInstruction
      const nextTemplate = allowedTemplates.find((template) => template.id === selectedTemplateId)
      const templateIdToUse = nextTemplate && isTemplateCompatible(nextTemplate, effectiveType) ? nextTemplate.id : ""
      const response = await fetch("/api/documents/artifacts/generate", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-ui-locale": locale
        },
        body: JSON.stringify({
          documentIds: documents.map((document) => document.id),
          type: effectiveType,
          templateId: isClientRole ? undefined : templateIdToUse || undefined,
          instruction: nextInstruction,
          audience,
          tone,
          language,
          length
        })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.create_artifact_failed"))

      const nextDraft = payload?.draft || null
      applyWorkspaceResult(nextDraft)
      resetWorkspaceVersionsFromResult(nextDraft, historyKind)
      setPersistedArtifactId("")
      setRunFeedback({ message: t(feedbackKey) })
      router.replace(buildWorkspaceHref(""), { scroll: false })
      if (isClientRole) await refreshRecentArtifacts()
      return nextDraft
    } catch (error) {
      if (error?.name === "AbortError") {
        setRunFeedback({ message: t("chat.error.interrupted") })
        return null
      }
      setRunError(error?.message || t("documents.errors.create_artifact_failed"))
      return null
    } finally {
      if (activeRequestAbortRef.current === controller) {
        activeRequestAbortRef.current = null
      }
      setStarting(false)
    }
  }

  async function handleRefine(refinementInstructionOverride = refineInstruction) {
    const effectiveRefinement = String(refinementInstructionOverride || "").trim()
    if (
      !hasWorkspaceResult ||
      workspaceResult?.status !== "DRAFT" ||
      !selectedCount ||
      !resultContent.trim() ||
      !effectiveRefinement ||
      refiningResult ||
      savingResult ||
      approvingResult
    ) {
      return null
    }

    setRefiningResult(true)
    clearResultMessages()

    const controller = new AbortController()
    activeRequestAbortRef.current = controller

    try {
      const effectiveType = isClientRole
        ? CLIENT_AGENT_TASK_OPTIONS.find((option) => option.value === clientTask)?.artifactType || "LETTER_DRAFT"
        : workspaceResult.type || outputType
      const response = await fetch("/api/documents/artifacts/refine", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-ui-locale": locale
        },
        body: JSON.stringify({
          documentIds: documents.map((document) => document.id),
          type: effectiveType,
          templateId: isClientRole ? undefined : selectedTemplateId || undefined,
          currentContent: resultContent,
          refinementInstruction: effectiveRefinement,
          audience,
          tone,
          language,
          length
        })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.artifacts.errors.update_failed"))

      const nextContent = String(payload?.content || "")
      const nextUpdatedAt = String(payload?.updatedAt || "")
      const nextDraft = workspaceResult
        ? {
            ...workspaceResult,
            title: resultTitle,
            content: nextContent,
            updatedAt: nextUpdatedAt || workspaceResult.updatedAt,
            templateId: selectedTemplateId || workspaceResult.templateId || ""
          }
        : null
      setResultContent(nextContent)
      setRefineInstruction("")
      appendWorkspaceVersion({
        kind: "refined",
        title: resultTitle,
        content: nextContent,
        type: effectiveType,
        templateId: isClientRole ? "" : selectedTemplateId
      })
      setRunFeedback({ message: t("documents.agent_workspace.refine_ready") })
      if (!workspaceResult?.id) {
        setWorkspaceResult((current) =>
          current
            ? {
                ...current,
                content: nextContent,
                updatedAt: nextUpdatedAt || current.updatedAt
              }
            : current
        )
      }
      return nextDraft
    } catch (error) {
      if (error?.name === "AbortError") {
        setRunFeedback({ message: t("chat.error.interrupted") })
        return null
      }
      setRunError(error?.message || t("documents.artifacts.errors.update_failed"))
      return null
    } finally {
      if (activeRequestAbortRef.current === controller) {
        activeRequestAbortRef.current = null
      }
      setRefiningResult(false)
    }
  }

  async function handleConversationSend(message) {
    const trimmed = String(message || "").trim()
    if (!trimmed) return false
    if (!selectedCount) {
      setRunError(t(isClientRole ? "documents.agent_workspace.client_needs_documents" : "documents.agent_workspace.needs_documents"))
      return false
    }

    const userMessage = appendConversationMessage({ role: "user", text: trimmed })

    const shouldRefine =
      hasWorkspaceResult &&
      workspaceResult?.status === "DRAFT" &&
      String(resultContent || "").trim().length > 0

    if (shouldRefine) {
      setRefineInstruction(trimmed)
      const nextDraft = await handleRefine(trimmed)
      if (!nextDraft?.content) {
        removeConversationMessage(userMessage.id)
        return false
      }
      appendConversationMessage({
        role: "ai",
        text: formatArtifactMessage(nextDraft, t),
        attachments: buildSourceAttachments(nextDraft.sources || workspaceResult?.sources, t)
      })
      return true
    }

    setInstruction(trimmed)
    const nextDraft = await runGeneration({
      typeOverride: outputType,
      instructionOverride: trimmed,
      historyKind: hasWorkspaceResult ? "rerun" : "generated",
      feedbackKey: isClientRole
        ? "documents.agent_workspace.client_result_ready"
        : hasWorkspaceResult
          ? "documents.agent_workspace.quick_result_ready"
          : "documents.agent_workspace.result_ready"
    })
    if (!nextDraft?.content) {
      removeConversationMessage(userMessage.id)
      return false
    }
    appendConversationMessage({
      role: "ai",
      text: formatArtifactMessage(nextDraft, t),
      attachments: buildSourceAttachments(nextDraft.sources, t)
    })
    return true
  }

  async function handleAlternateOutput(option) {
    if (!canRunAlternateOutput || !option?.value) return
    const userMessage = appendConversationMessage({
      role: "user",
      text: t("documents.agent_workspace.quick_action_button", { type: option.label })
    })
    const nextDraft = await runGeneration({
      typeOverride: option.value,
      instructionOverride: instruction,
      historyKind: "rerun",
      feedbackKey: "documents.agent_workspace.quick_result_ready"
    })
    if (!nextDraft?.content) {
      removeConversationMessage(userMessage.id)
      return
    }
    appendConversationMessage({
      role: "ai",
      text: formatArtifactMessage(nextDraft, t),
      attachments: buildSourceAttachments(nextDraft.sources, t)
    })
  }

  function handleRestoreSavedVersion() {
    if (!canRestoreSavedVersion) return
    clearResultMessages()
    setResultTitle(String(workspaceResult?.title || ""))
    setResultContent(String(workspaceResult?.content || ""))
    setRefineInstruction("")
    setSelectedTemplateId(String(workspaceResult?.templateId || ""))
    setRunFeedback({ message: t("documents.agent_workspace.saved_version_restored") })
  }

  function handleRestoreWorkspaceVersion(versionId) {
    const version = workspaceVersions.find((entry) => entry.id === versionId)
    if (!version) return
    clearResultMessages()
    setOutputType(String(version.type || outputType))
    setResultTitle(String(version.title || ""))
    setResultContent(String(version.content || ""))
    setRefineInstruction("")
    setSelectedTemplateId(String(version.templateId || ""))
    setRunFeedback({ message: t("documents.agent_workspace.version_restored") })
  }

  function handleClearWorkspaceResult() {
    if (!canClearWorkspaceResult) return
    clearResultMessages()
    clearWorkspaceResult()
    router.replace(buildWorkspaceHref(""), { scroll: false })
    setRunFeedback({ message: t(isClientRole ? "documents.agent_workspace.client_result_removed" : "documents.agent_workspace.result_removed") })
  }

  async function persistCurrentDraft({ suppressFeedback = false } = {}) {
    if (!workspaceResult || !resultContent.trim()) return null

    const requestHeaders = {
      "Content-Type": "application/json",
      "x-ui-locale": locale
    }
    const payload = {
      documentIds: documents.map((document) => document.id),
      type: workspaceResult.type || outputType,
      title: resultTitle,
      content: resultContent
    }

    if (selectedTemplateId) payload.templateId = selectedTemplateId
    if (isClientRole) delete payload.templateId

    const response = workspaceResult.id
      ? await fetch(`/api/documents/artifacts/${encodeURIComponent(workspaceResult.id)}`, {
          method: "PATCH",
          headers: requestHeaders,
          body: JSON.stringify({
            title: resultTitle,
            content: resultContent,
            templateId: selectedTemplateId || null
          })
        })
      : await fetch("/api/documents/artifacts", {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(payload)
        })

    const resultPayload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        resultPayload?.message ||
          (workspaceResult.id ? t("documents.artifacts.errors.update_failed") : t("documents.artifacts.errors.create_failed"))
      )
    }

    const nextArtifact = resultPayload?.artifact || null
    applyWorkspaceResult(nextArtifact)
    const nextArtifactId = String(nextArtifact?.id || "").trim()
    setPersistedArtifactId(nextArtifactId)
    setArtifactError("")
    if (nextArtifactId) router.replace(buildWorkspaceHref(nextArtifactId), { scroll: false })
    if (!suppressFeedback) {
      setRunFeedback({
        message:
          workspaceResult.id
            ? t(isClientRole ? "documents.agent_workspace.client_saved" : "documents.feedback.saved")
            : t(isClientRole ? "documents.agent_workspace.client_saved" : "documents.agent_workspace.saved_to_documents"),
        actionUrl: !isClientRole && nextArtifactId ? localizePath(`/documents/artifacts/${encodeURIComponent(nextArtifactId)}`, locale) : "",
        actionLabel: !isClientRole && nextArtifactId ? t("documents.agent_workspace.open_detail") : ""
      })
    }

    if (isClientRole) await refreshRecentArtifacts()
    return nextArtifact
  }

  async function handleSaveDraft() {
    if (!canPersistResult || savingResult || approvingResult) return

    setSavingResult(true)
    clearResultMessages()
    try {
      await persistCurrentDraft()
    } catch (error) {
      setRunError(error?.message || t("documents.artifacts.errors.create_failed"))
    } finally {
      setSavingResult(false)
    }
  }

  async function handleApprove() {
    if (!canPersistResult || savingResult || approvingResult) return

    setApprovingResult(true)
    clearResultMessages()
    try {
      const artifact = await persistCurrentDraft({ suppressFeedback: true })
      const artifactId = String(artifact?.id || "").trim()
      if (!artifactId) throw new Error(t("documents.artifacts.errors.create_failed"))

      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}/approve`, {
        method: "POST",
        headers: { "x-ui-locale": locale }
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.artifacts.errors.approve_failed"))

      applyWorkspaceResult(payload?.artifact || artifact)
      setPersistedArtifactId(artifactId)
      setApprovalNotice({
        message: t(isClientRole ? "documents.agent_workspace.client_finished" : "documents.feedback.approved"),
        downloadUrls: payload?.downloadUrls || payload?.artifact?.downloadUrls || {}
      })
      router.replace(buildWorkspaceHref(artifactId), { scroll: false })
      if (isClientRole) await refreshRecentArtifacts()
    } catch (error) {
      setRunError(error?.message || t("documents.artifacts.errors.approve_failed"))
    } finally {
      setApprovingResult(false)
    }
  }

  async function handleCopyResult() {
    try {
      await navigator.clipboard.writeText(String(resultContent || workspaceResult?.content || ""))
      setRunError("")
      setRunFeedback({ message: t("documents.feedback.copied") })
    } catch {
      setRunError(t("documents.errors.copy_failed"))
    }
  }

  function isWorkspaceVersionActive(version) {
    return String(version?.title || "").trim() === String(resultTitle || "").trim() && String(version?.content || "") === String(resultContent || "")
  }

  const conversationItems = useMemo(() => {
    const baseMessages = conversationMessages.length
      ? conversationMessages
      : [createWorkspaceMessage({ role: "ai", text: conversationIntroText })]

    const items = baseMessages.map((message) => (
      <ChatMessageItem
        key={message.id}
        role={message.role}
        text={message.text}
        attachments={message.attachments}
        t={t}
      />
    ))

    if (isAgentBusy) {
      items.push(
        <ChatMessageItem
          key="agent-mode-working"
          role="ai"
          text={starting ? t("documents.agent_workspace.conversation_generating") : t("documents.agent_workspace.conversation_refining")}
          t={t}
        />
      )
    }

    return items
  }, [conversationIntroText, conversationMessages, isAgentBusy, starting, t])

  function clientArtifactStatusLabel(status) {
    return t(
      status === "FINAL"
        ? "documents.agent_workspace.client_status_final"
        : "documents.agent_workspace.client_status_draft"
    )
  }

  return (
    <section className="documents-workspace documents-workspace-page">
      <div className="documents-workspace-shell documents-workspace-shell--agent">
        <Panel as="section" variant="secondary" padding="sm" className="documents-panel documents-panel--primary rounded-[1.3rem]">
          <BackButton
            onClick={() => router.push(backHref)}
            ariaLabel={isClientRole ? t("documents.agent_workspace.back_to_chat") : t("documents.back_to_documents")}
            className="documents-back-button absolute top-[0.55rem] left-[0.55rem] translate-x-0 translate-y-0 bottom-auto !h-[4rem] !w-[4rem] z-[92] [&>svg]:!h-[4rem] [&>svg]:!w-[4rem] max-[768px]:top-[calc(env(safe-area-inset-top,0px)+0.56rem)] max-[768px]:left-[calc(env(safe-area-inset-left,0px)+0.04rem)] max-[768px]:!h-[4.4rem] max-[768px]:!w-[4.4rem] max-[768px]:[&>svg]:!h-[4.4rem] max-[768px]:[&>svg]:!w-[4.4rem]"
          />
          <header className="documents-page-header documents-page-header--panel">
            <div className="documents-page-header-row">
              <div className="documents-page-heading">
                <h1 className={agentTitleClassName}>{t("chat.tools.agent_mode")}</h1>
                <p className="documents-page-description documents-agent-page-description">{introText}</p>
                {isAdmin && isRoleViewActive ? (
                  <div className="documents-notice documents-notice--muted mt-[0.8rem] rounded-[1rem] px-[1rem] py-[0.95rem] text-[0.95rem]">
                    {t("documents.agent_workspace.admin_notice", { role: roleViewLabel })}
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {documentsError ? <div className="documents-notice documents-notice--error rounded-[1rem] px-[1rem] py-[0.95rem]">{documentsError}</div> : null}
          {runError ? <div className="documents-notice documents-notice--error rounded-[1rem] px-[1rem] py-[0.95rem]">{runError}</div> : null}
          {artifactError ? <div className="documents-notice documents-notice--error rounded-[1rem] px-[1rem] py-[0.95rem]">{artifactError}</div> : null}
          {missingDocumentIds.length ? (
            <div className="documents-notice documents-notice--warning rounded-[1rem] px-[1rem] py-[0.95rem]">
              {t("documents.agent_workspace.missing_documents", { count: missingDocumentIds.length })}
            </div>
          ) : null}
          {runFeedback ? (
            <div className="documents-notice documents-notice--info flex flex-wrap items-center justify-between gap-[0.7rem] rounded-[1rem] px-[1rem] py-[0.95rem]">
              <span>{runFeedback.message}</span>
              <div className="flex items-center gap-[0.8rem]">
                {runFeedback.actionUrl ? <Link href={runFeedback.actionUrl} className="font-medium underline underline-offset-[0.22rem]">{runFeedback.actionLabel}</Link> : null}
                <button type="button" className="text-[0.88rem] underline underline-offset-[0.18rem]" onClick={() => setRunFeedback(null)}>{t("common.close")}</button>
              </div>
            </div>
          ) : null}
          {approvalNotice ? (
            <div className="documents-notice documents-notice--success flex flex-wrap items-center justify-between gap-[0.7rem] rounded-[1rem] px-[1rem] py-[0.95rem]">
              <span>{approvalNotice.message}</span>
              <div className="flex items-center gap-[0.8rem]">
                {approvalNotice.downloadUrls?.docx ? <a href={approvalNotice.downloadUrls.docx} className="font-medium underline underline-offset-[0.22rem]">{t("documents.actions.download_docx")}</a> : null}
                {approvalNotice.downloadUrls?.pdf ? <a href={approvalNotice.downloadUrls.pdf} className="font-medium underline underline-offset-[0.22rem]">{t("documents.actions.download_pdf")}</a> : null}
                <button type="button" className="text-[0.88rem] underline underline-offset-[0.18rem]" onClick={() => setApprovalNotice(null)}>{t("common.close")}</button>
              </div>
            </div>
          ) : null}

          <div className="documents-agent-layout">
            <Panel variant="secondary" padding="sm" className="documents-subpanel documents-agent-card rounded-[1rem]">
              <div className="documents-agent-card-copy">
                <h2 className="documents-section-title">
                  {t(isClientRole ? "documents.agent_workspace.client_task_title" : "documents.agent_workspace.goal_title")}
                </h2>
                <p className="documents-section-description documents-agent-copy">
                  {t(isClientRole ? "documents.agent_workspace.client_task_description" : "documents.agent_workspace.goal_description")}
                </p>
              </div>

              <div className="documents-agent-goal-groups">
                {!isClientRole ? (
                  <div className="documents-agent-goal-group documents-agent-goal-group--template">
                    <div className="documents-agent-template-row">
                      <div className="documents-agent-template-copy">
                        <span className="documents-meta-text documents-agent-field-label">{t("documents.agent_workspace.template_label")}</span>
                        <p className="documents-agent-template-description">{t("documents.agent_workspace.template_description")}</p>
                      </div>
                      <div className="documents-agent-template-control">
                      <DocumentsDropdown
                        ariaLabel={t("documents.agent_workspace.template_label")}
                        value={selectedTemplateId}
                        disabled={templatesLoading || (!compatibleTemplates.length && !selectedTemplateId)}
                        onChange={(nextValue) => {
                          setSelectedTemplateId(nextValue)
                          clearResultMessages()
                        }}
                        options={templateDropdownOptions}
                        placeholder={t("documents.agent_workspace.template_none")}
                        className="documents-agent-dropdown"
                      />
                      </div>
                    </div>
                    <p className="documents-meta-text documents-agent-template-note">
                      {templatesLoading
                        ? t("documents.agent_workspace.template_loading")
                        : templatesError
                          ? templatesError
                          : activeTemplate
                            ? t("documents.agent_workspace.template_selected", { title: activeTemplate.title || activeTemplate.originalName })
                            : compatibleTemplates.length
                              ? t("documents.agent_workspace.template_help")
                              : t("documents.agent_workspace.template_empty")}
                    </p>
                  </div>
                ) : null}

                <div className="documents-agent-goal-group">
                  <span className="documents-meta-text documents-agent-field-label">
                    {t(isClientRole ? "documents.agent_workspace.client_task_label" : "documents.agent_workspace.output_type_label")}
                  </span>
                  <div className="documents-agent-chip-row">
                    {outputTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={segmentedChipClassName((isClientRole ? clientTask : outputType) === option.value)}
                        onClick={() => {
                          if (isClientRole) {
                            setClientTask(option.value)
                          } else {
                            setOutputType(option.value)
                          }
                          clearResultMessages()
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!isClientRole ? (
                  <>
                    <div className="documents-agent-goal-group">
                      <span className="documents-meta-text documents-agent-field-label">{t("chat.deep_research.scope_output_label")}</span>
                      <div className="documents-agent-chip-row">
                        {audienceOptions.map((option) => (
                          <button
                                key={option.value}
                                type="button"
                                className={segmentedChipClassName(audience === option.value)}
                                onClick={() => {
                                  setAudienceTouched(true)
                                  setAudience(option.value)
                                  clearResultMessages()
                                }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="documents-agent-select-grid">
                      <label className="documents-agent-select-field">
                        <span className="documents-meta-text documents-agent-field-label">{t("documents.agent_workspace.tone_label")}</span>
                        <DocumentsDropdown
                          ariaLabel={t("documents.agent_workspace.tone_label")}
                          value={tone}
                          onChange={(nextValue) => {
                            setTone(nextValue)
                            clearResultMessages()
                          }}
                          options={toneOptions}
                          className="documents-agent-dropdown"
                        />
                      </label>
                      <label className="documents-agent-select-field">
                        <span className="documents-meta-text documents-agent-field-label">{t("documents.agent_workspace.language_label")}</span>
                        <DocumentsDropdown
                          ariaLabel={t("documents.agent_workspace.language_label")}
                          value={language}
                          onChange={(nextValue) => {
                            setLanguage(nextValue)
                            clearResultMessages()
                          }}
                          options={languageOptions}
                          className="documents-agent-dropdown"
                        />
                      </label>
                      <label className="documents-agent-select-field">
                        <span className="documents-meta-text documents-agent-field-label">{t("documents.agent_workspace.length_label")}</span>
                        <DocumentsDropdown
                          ariaLabel={t("documents.agent_workspace.length_label")}
                          value={length}
                          onChange={(nextValue) => {
                            setLength(nextValue)
                            clearResultMessages()
                          }}
                          options={lengthOptions}
                          className="documents-agent-dropdown"
                        />
                      </label>
                    </div>
                  </>
                ) : null}
              </div>
            </Panel>

            <Panel variant="secondary" padding="sm" className="documents-subpanel documents-agent-card documents-agent-card--full rounded-[1rem]">
              <div className="documents-agent-card-header">
                <div className="documents-agent-card-copy">
                  <h2 className="documents-section-title">{t("documents.agent_workspace.selected_documents_title")}</h2>
                  <p className="documents-section-description documents-agent-copy">
                    {t(
                      isClientRole
                        ? clientTask === "FILL_FORM"
                          ? "documents.agent_workspace.client_selected_documents_fill_form_description"
                          : "documents.agent_workspace.client_selected_documents_description"
                        : "documents.agent_workspace.selected_documents_description"
                    )}
                  </p>
                </div>
                <div className="documents-agent-card-actions">
                  {!isClientRole && selectedDocumentIds.length ? (
                    <Link href={documentsHref} className="documents-link-button documents-meta-text documents-agent-inline-link">
                      {t("documents.back_to_documents")}
                    </Link>
                  ) : null}
                </div>
              </div>

              {isClientRole ? (
                <div className="documents-agent-row-actions documents-agent-row-actions--left">
                  <Button
                    type="button"
                    size="sm"
                    className="documents-primary-button documents-primary-button--compact"
                    onClick={() => clientUploadInputRef.current?.click?.()}
                    disabled={clientUploading || selectedCountLimitReached}
                  >
                    {clientUploading ? t("documents.agent_workspace.client_uploading") : t("documents.agent_workspace.client_upload_button")}
                  </Button>
                  <input
                    ref={clientUploadInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="sr-only"
                    onChange={handleClientUpload}
                  />
                </div>
              ) : null}

              <div className="documents-agent-documents">
                {clientUploadError ? (
                  <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                    {clientUploadError}
                  </div>
                ) : null}
                {documentsLoading ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.loading")}</div> : null}
                {!documentsLoading && !selectedDocumentIds.length ? (
                  <div className="documents-agent-empty">
                    <div className={isClientRole ? "" : "documents-agent-empty--inline"}>
                      <p>{t(isClientRole ? "documents.agent_workspace.client_empty_documents" : "documents.agent_workspace.empty_documents")}</p>
                    </div>
                    {!isClientRole ? (
                      <Button as="a" href={documentsHref} size="sm" className="documents-primary-button documents-primary-button--compact">
                        {t("documents.agent_workspace.select_documents")}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
                {!documentsLoading && selectedDocumentIds.length > 0 && documents.length === 0 ? (
                  <div className="documents-empty-state documents-agent-empty rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">
                    <p>{t("documents.agent_workspace.unavailable_documents")}</p>
                    {!isClientRole ? (
                      <Button as="a" href={documentsHref} size="sm" className="documents-primary-button documents-primary-button--compact">
                        {t("documents.back_to_documents")}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
                {documents.map((document) => (
                  <article key={document.id} className="documents-card documents-agent-document rounded-[1rem] border px-[0.9rem] py-[0.82rem]">
                    <div className="documents-agent-document-top">
                      <div className="min-w-0 flex-1">
                        <div className="documents-document-row-title">
                          <h3 className="documents-strong-text text-[1rem] font-semibold">{document.title}</h3>
                          <span className="documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{kindLabel(document.kind, t)}</span>
                          {document.templateFor ? <span className="documents-chip is-active rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{templateForLabel(document.templateFor, t)}</span> : null}
                        </div>
                        <p className="documents-meta-text mt-[0.25rem] text-[0.9rem]">
                          {document.originalName} - {formatFileSize(document.size)} - {formatDate(document.updatedAt, locale)}
                        </p>
                      </div>
                      <div className="documents-agent-row-actions">
                        <Button as="a" href={`/api/documents/${encodeURIComponent(document.id)}/download`} size="sm" variant="ghost" className="documents-secondary-button">
                          {t("documents.actions.download")}
                        </Button>
                        {isClientRole ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="documents-secondary-button"
                            onClick={() => void handleClientRemoveDocument(document.id)}
                          >
                            {t("documents.agent_workspace.client_remove_document")}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel variant="secondary" padding="sm" className="documents-subpanel documents-agent-card documents-agent-card--full rounded-[1rem]">
              <div className="documents-agent-card-copy">
                <h2 className="documents-section-title">{t("documents.agent_workspace.conversation_title")}</h2>
                <p className="documents-section-description documents-agent-copy">
                  {t(isClientRole ? "documents.agent_workspace.client_conversation_description" : "documents.agent_workspace.conversation_description")}
                </p>
              </div>

              <div className="documents-agent-conversation-meta">
                <div className="documents-agent-summary">
                  <span className="documents-chip rounded-full px-[0.75rem] py-[0.25rem] text-[0.92rem]">
                    {t("documents.agent_workspace.summary_documents", { count: selectedCount })}
                  </span>
                  <span className="documents-chip rounded-full px-[0.75rem] py-[0.25rem] text-[0.92rem]">
                    {t("documents.agent_workspace.summary_output", { type: isClientRole ? clientResultLabel : artifactTypeLabel(outputType, t) })}
                  </span>
                  {!isClientRole ? (
                    <span className="documents-chip rounded-full px-[0.75rem] py-[0.25rem] text-[0.92rem]">
                      {audienceOptions.find((option) => option.value === audience)?.label}
                    </span>
                  ) : null}
                  {!isClientRole && activeTemplate ? (
                    <span className="documents-chip rounded-full px-[0.75rem] py-[0.25rem] text-[0.92rem]">
                      {t("documents.agent_workspace.summary_template", { title: activeTemplate.title || activeTemplate.originalName })}
                    </span>
                  ) : null}
                </div>
                <p className="documents-section-description documents-agent-start-help">{conversationHelpText}</p>
              </div>

              <div className="documents-agent-conversation-shell" style={agentConversationVars}>
                <ConversationView
                  t={t}
                  chatWindowRef={chatWindowRef}
                  isStreamingAny={isAgentBusy}
                  hiddenCount={0}
                  pageSize={0}
                  onRevealOlder={() => {}}
                  canHideOlder={false}
                  onHideOlder={() => {}}
                  onJumpToBottom={handleJumpToBottom}
                  messageItems={conversationItems}
                  mainClassName="documents-agent-conversation-main"
                  windowClassName="documents-agent-conversation-window"
                  isMobile={isMobile}
                  isLightTheme={isLightTheme}
                />

                <div className="documents-agent-composer-slot">
                  <ChatComposer
                    t={t}
                    locale={locale}
                    isLightTheme={isLightTheme}
                    hideTools
                    embedded
                    forcePlaceholderVisible
                    placeholderText={t("chat.input.placeholder")}
                    acceptAttr=""
                    ensureAnalysisPanelVisible={() => {}}
                    fileInputRef={fileInputRef}
                    onFileChange={() => {}}
                    inputBarRef={inputBarRef}
                    inputRef={inputRef}
                    onFocusInput={() => setInputFocused(true)}
                    onBlurInput={() => setInputFocused(false)}
                    isGenerating={isAgentBusy}
                    isStreamingAny={false}
                    isRoomMode={false}
                    roomBlocked={false}
                    roomAuthRequired={false}
                    onStop={handleStopAgentRequest}
                    onSend={handleConversationSend}
                    speakLatestReply={speakLatestReply}
                    canSpeakLatest={canSpeakLatest}
                    isSpeaking={isSpeaking}
                    recording={recording}
                    recordingPulse={recordingPulse}
                    handleMic={handleMic}
                    draftApiRef={composerDraftApiRef}
                    inputFocused={inputFocused}
                    isMobile={isMobile}
                  />
                </div>
              </div>

              <ChatRecordingNotice recordingError={recordingError} />
            </Panel>

            <Panel variant="secondary" padding="sm" className="documents-subpanel documents-agent-card documents-agent-card--full rounded-[1rem]">
              <div className="documents-agent-card-header">
                <div className="documents-agent-card-copy">
                  <h2 className="documents-section-title">{t("documents.agent_workspace.result_title")}</h2>
                  <p className="documents-section-description documents-agent-copy">
                    {t(isClientRole ? "documents.agent_workspace.client_result_description" : "documents.agent_workspace.result_description")}
                  </p>
                  {!isClientRole ? (
                    <p className="documents-meta-text documents-agent-copy mt-[0.12rem] text-[1rem] leading-[1.45]">
                      {t("documents.agent_workspace.result_results_link_intro")}{" "}
                      <Link href={artifactResultsHref} className={`${linkBrandInlineClass} documents-link-button documents-meta-text text-[1rem] leading-[1.45]`}>
                        {t("documents.agent_workspace.result_results_link_label")}
                      </Link>
                      .
                    </p>
                  ) : null}
                </div>
                {hasWorkspaceResult ? (
                  <div className="documents-agent-card-actions">
                    {activeArtifactDetailHref ? (
                      <Link href={activeArtifactDetailHref} className="documents-link-button documents-meta-text documents-agent-inline-link">
                        {t("documents.agent_workspace.open_detail")}
                      </Link>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="documents-secondary-button"
                      onClick={handleClearWorkspaceResult}
                      disabled={!canClearWorkspaceResult}
                    >
                      {t("documents.agent_workspace.clear_result")}
                    </Button>
                  </div>
                ) : null}
              </div>
              {artifactLoading ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.loading")}</div> : null}
              {!artifactLoading && !workspaceResult && !artifactError ? (
                <div className="documents-empty-state documents-agent-empty rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">
                  <p>{t("documents.agent_workspace.result_empty")}</p>
                </div>
              ) : null}

              {!artifactLoading && workspaceResult ? (
                <div className="documents-agent-result">
                  <div className="flex flex-wrap items-center gap-[0.45rem]">
                    <span className="documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">
                      {isClientRole ? clientResultLabel : artifactTypeLabel(workspaceResult.type, t)}
                    </span>
                    <span className={`documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em] ${workspaceResult.status === "FINAL" ? "is-active" : ""}`}>
                      {isClientRole ? clientArtifactStatusLabel(workspaceResult.status) : artifactStatusLabel(workspaceResult.status, t)}
                    </span>
                  </div>
                  <div className="documents-agent-result-meta documents-meta-text text-[0.94rem]">
                    <span>{formatDate(workspaceResult.createdAt, locale)}</span>
                    <span>{t("documents.updated_at")} {formatDate(workspaceResult.updatedAt, locale)}</span>
                    {!isClientRole && workspaceResult.approvedAt ? <span>{t("documents.approved_at")} {formatDate(workspaceResult.approvedAt, locale)}</span> : null}
                    <span>{t("documents.sources_label", { count: workspaceResult.sourceCount || 0 })}</span>
                  </div>

                  {!isWorkspaceResultSaved ? (
                    <div className="documents-notice documents-notice--muted rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                      {t(isClientRole ? "documents.agent_workspace.client_result_unsaved" : "documents.agent_workspace.result_unsaved")}
                    </div>
                  ) : null}
                  {isWorkspaceResultSaved && hasDraftEdits ? (
                    <div className="documents-notice documents-notice--warning rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                      {t(isClientRole ? "documents.agent_workspace.client_result_dirty" : "documents.agent_workspace.result_dirty")}
                    </div>
                  ) : null}
                  {activeTemplate ? (
                    <div className="documents-notice documents-notice--muted rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                      {t("documents.agent_workspace.template_selected", { title: activeTemplate.title || activeTemplate.originalName })}
                    </div>
                  ) : null}

                  {!isClientRole && alternateOutputOptions.length ? (
                    <div className="documents-agent-quick-actions">
                      <div className="documents-agent-refine-copy">
                        <h3 className="documents-strong-text text-[0.98rem] font-semibold">{t("documents.agent_workspace.quick_actions_title")}</h3>
                        <p className="documents-section-description documents-agent-copy">{t("documents.agent_workspace.quick_actions_description")}</p>
                      </div>
                      <div className="documents-agent-chip-row">
                        {alternateOutputOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={segmentedChipClassName(false)}
                            onClick={() => {
                              void handleAlternateOutput(option)
                            }}
                            disabled={!canRunAlternateOutput}
                          >
                            {t("documents.agent_workspace.quick_action_button", { type: option.label })}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {workspaceResult.status === "DRAFT" ? (
                    <>
                      <div className="documents-notice documents-notice--muted rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                        {t("documents.agent_workspace.refine_in_chat")}
                      </div>
                      <div className="grid gap-[0.7rem]">
                        <Input
                          value={resultTitle}
                          onChange={(event) => {
                            setResultTitle(event.target.value)
                            clearResultMessages()
                          }}
                          placeholder={t("documents.form.artifact_title_placeholder")}
                          className="documents-form-input"
                        />
                        <Textarea
                          value={resultContent}
                          onChange={(event) => {
                            setResultContent(event.target.value)
                            clearResultMessages()
                          }}
                          rows={14}
                          className="documents-agent-textarea"
                        />
                      </div>
                      <div className="documents-row-actions">
                        <Button type="button" size="sm" className="documents-primary-button" onClick={() => void handleApprove()} disabled={!canPersistResult || refiningResult || savingResult || approvingResult}>
                          {approvingResult ? t("documents.actions.approving") : t(isClientRole ? "documents.agent_workspace.client_finish" : "documents.actions.approve")}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void handleSaveDraft()} disabled={!canPersistResult || refiningResult || savingResult || approvingResult}>
                          {savingResult ? t("documents.actions.saving") : t(isClientRole ? "documents.actions.save" : "documents.actions.save_draft")}
                        </Button>
                        {!isClientRole && canRestoreSavedVersion ? (
                          <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={handleRestoreSavedVersion}>
                            {t("documents.agent_workspace.restore_saved")}
                          </Button>
                        ) : null}
                        <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void handleCopyResult()}>
                          {t("documents.actions.copy")}
                        </Button>
                      </div>
                      {!isClientRole && workspaceVersions.length ? (
                        <div className="documents-agent-version-list">
                          <div className="documents-agent-refine-copy">
                            <h3 className="documents-strong-text text-[0.98rem] font-semibold">{t("documents.agent_workspace.version_history_title")}</h3>
                            <p className="documents-section-description documents-agent-copy">{t("documents.agent_workspace.version_history_description")}</p>
                          </div>
                          {workspaceVersions.slice().reverse().map((version) => {
                            const isActive = isWorkspaceVersionActive(version)
                            return (
                              <div key={version.id} className={`documents-card documents-agent-version-card rounded-[0.8rem] border px-[0.8rem] py-[0.72rem] text-[0.92rem] ${isActive ? "is-active" : ""}`}>
                                <div className="documents-agent-version-top">
                                  <div className="min-w-0 flex-1">
                                    <div className="documents-document-row-title">
                                      <span className="documents-strong-text font-medium">
                                        {version.title || artifactTypeLabel(version.type, t)}
                                      </span>
                                      <span className="documents-chip rounded-full px-[0.5rem] py-[0.12rem] text-[0.74rem] uppercase tracking-[0.08em]">
                                        {t(`documents.agent_workspace.version_kinds.${version.kind}`)}
                                      </span>
                                      {isActive ? (
                                        <span className="documents-chip is-active rounded-full px-[0.5rem] py-[0.12rem] text-[0.74rem] uppercase tracking-[0.08em]">
                                          {t("documents.agent_workspace.version_current")}
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="documents-meta-text mt-[0.2rem] text-[0.84rem]">
                                      {artifactTypeLabel(version.type, t)} - {formatDate(version.createdAt, locale)}
                                    </p>
                                  </div>
                                  {!isActive ? (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="documents-secondary-button"
                                      onClick={() => handleRestoreWorkspaceVersion(version.id)}
                                    >
                                      {t("documents.agent_workspace.restore_version")}
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="documents-content documents-agent-result-content rounded-[1rem] border px-[1rem] py-[0.95rem] whitespace-pre-wrap text-[0.98rem] leading-[1.65]">
                        {workspaceResult.content}
                      </div>
                      <div className="documents-row-actions">
                        {workspaceResult.downloadUrls?.docx ? <Button as="a" href={workspaceResult.downloadUrls.docx} size="sm" className="documents-primary-button">{t("documents.actions.download_docx")}</Button> : null}
                        {workspaceResult.downloadUrls?.pdf ? <Button as="a" href={workspaceResult.downloadUrls.pdf} size="sm" variant="ghost" className="documents-secondary-button">{t("documents.actions.download_pdf")}</Button> : null}
                        <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void handleCopyResult()}>
                          {t("documents.actions.copy")}
                        </Button>
                      </div>
                    </>
                  )}

                  {workspaceResult.sources?.length ? (
                    <div className="documents-agent-source-list">
                      {workspaceResult.sources.map((source) => (
                        <a key={source.id} href={`/api/documents/${encodeURIComponent(source.id)}/download`} className="documents-card documents-agent-source-card rounded-[0.8rem] border px-[0.75rem] py-[0.65rem] text-[0.92rem]">
                          <div className="documents-strong-text font-medium">{source.title}</div>
                          <div className="documents-meta-text text-[0.84rem]">{source.originalName}</div>
                          <div className="documents-link-button documents-meta-text mt-[0.28rem] text-[0.84rem]">{t("documents.actions.download")}</div>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Panel>

            {isClientRole ? (
              <Panel variant="secondary" padding="sm" className="documents-subpanel documents-agent-card documents-agent-card--full rounded-[1rem]">
                <div className="documents-agent-card-copy">
                  <h2 className="documents-section-title">{t("documents.agent_workspace.client_results_title")}</h2>
                  <p className="documents-section-description documents-agent-copy">{t("documents.agent_workspace.client_results_description")}</p>
                </div>

                {recentArtifactsError ? (
                  <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                    {recentArtifactsError}
                  </div>
                ) : null}
                {recentArtifactsLoading ? (
                  <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">
                    {t("documents.agent_workspace.client_recent_results_loading")}
                  </div>
                ) : null}
                {!recentArtifactsLoading && !recentArtifacts.length ? (
                  <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">
                    {t("documents.agent_workspace.client_recent_results_empty")}
                  </div>
                ) : null}

                {!recentArtifactsLoading && recentArtifacts.length ? (
                  <div className="documents-agent-results-list">
                    {recentArtifacts.map((artifact) => (
                      <article key={artifact.id} className="documents-card documents-agent-result-row rounded-[1rem] border px-[0.95rem] py-[0.85rem]">
                        <div className="documents-agent-result-row-top">
                          <div className="min-w-0 flex-1">
                            <div className="documents-document-row-title">
                              <h3 className="documents-strong-text text-[1rem] font-semibold">
                                {artifact.title || artifact.snippet || t("documents.agent_workspace.result_title")}
                              </h3>
                              <span className={`documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em] ${artifact.status === "FINAL" ? "is-active" : ""}`}>
                                {clientArtifactStatusLabel(artifact.status)}
                              </span>
                            </div>
                            <p className="documents-meta-text mt-[0.2rem] text-[0.9rem]">
                              {formatDate(artifact.updatedAt || artifact.createdAt, locale)}
                            </p>
                          </div>
                          <div className="documents-agent-row-actions">
                            <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void handleOpenClientArtifact(artifact.id)}>
                              {t("documents.agent_workspace.client_open_result")}
                            </Button>
                              {artifact.downloadUrls?.docx ? (
                                <Button as="a" href={artifact.downloadUrls.docx} size="sm" variant="ghost" className="documents-secondary-button">
                                  {t("documents.actions.download_docx")}
                                </Button>
                              ) : null}
                              {artifact.downloadUrls?.pdf ? (
                                <Button as="a" href={artifact.downloadUrls.pdf} size="sm" variant="ghost" className="documents-secondary-button">
                                  {t("documents.actions.download_pdf")}
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                              className="documents-secondary-button"
                              onClick={() => void handleCopyRecentArtifact(artifact.id)}
                            >
                              {t("documents.actions.copy")}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void handleDeleteClientArtifact(artifact.id)}>
                              {t("documents.actions.delete")}
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </Panel>
            ) : null}
          </div>
        </Panel>
      </div>
    </section>
  )
}
