import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS } from "@/lib/chat/settings"
import { createArtifactError } from "@/lib/documents/artifacts"
import { readStoredDocument } from "@/lib/documents/server"

const RAW_RAG_HOST = (process.env.RAG_INTERNAL_HOST || process.env.RAG_API_BASE || "127.0.0.1:8000").trim()
const RAG_KEY = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim()
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000)
const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_RAG === "1"
const LOCAL_HOST_RE = /^(127\.0\.0\.1|localhost|\[?::1\]?)(:\d+)?$/i

const AGENT_SOURCE_DOC_MAX_CHARS = Number(process.env.AGENT_SOURCE_DOC_MAX_CHARS || 12_000)
const AGENT_SOURCE_TOTAL_MAX_CHARS = Number(process.env.AGENT_SOURCE_TOTAL_MAX_CHARS || 36_000)
const AGENT_ANALYZE_MAX_CHUNKS = Number(process.env.AGENT_ANALYZE_MAX_CHUNKS || 18)
const AGENT_MAX_OUTPUT_TOKENS = Number(process.env.AGENT_MAX_OUTPUT_TOKENS || OPENAI_MAX_OUTPUT_TOKENS || 1_800)

const AGENT_AUDIENCE_VALUES = new Set(["worker", "client"])
const AGENT_TONE_VALUES = new Set(["professional", "supportive", "plain"])
const AGENT_LENGTH_VALUES = new Set(["short", "standard", "detailed"])
const AGENT_LANGUAGE_VALUES = new Set(["et", "en", "ru"])

function normalizeBaseFromHost(host) {
  const trimmed = String(host || "").trim().replace(/\/+$/, "")
  if (!trimmed) return "http://127.0.0.1:8000"
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}`
}

function isLocalBaseUrl(url) {
  try {
    const parsed = new URL(url)
    return LOCAL_HOST_RE.test(parsed.host)
  } catch {
    return false
  }
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function compactText(value, maxChars) {
  const text = normalizeText(value)
  if (!text) return ""
  if (text.length <= maxChars) return text

  const budget = Math.max(400, maxChars)
  const headLength = Math.max(200, Math.floor(budget * 0.72))
  const tailLength = Math.max(120, budget - headLength - 16)
  const head = text.slice(0, headLength).trim()
  const tail = text.slice(-tailLength).trim()
  return `${head}\n\n[...]\n\n${tail}`
}

function languageLabel(language) {
  if (language === "en") return "English"
  if (language === "ru") return "Russian"
  return "Estonian"
}

function audienceLabel(audience) {
  return audience === "client" ? "help-seeker / client" : "social work specialist"
}

function toneLabel(tone) {
  if (tone === "supportive") return "supportive and calm"
  if (tone === "plain") return "plain-language and easy to follow"
  return "professional and neutral"
}

function lengthLabel(length) {
  if (length === "short") return "short"
  if (length === "detailed") return "detailed"
  return "standard"
}

function structureGuide(type) {
  if (type === "CASE_BRIEF") {
    return "Use sections for situation summary, key facts, risks and needs, and recommended next steps."
  }
  if (type === "MEETING_SUMMARY") {
    return "Use sections for context, main discussion points, agreed actions, and follow-up."
  }
  if (type === "CHECKLIST") {
    return "Return a practical checklist with short actionable bullet points."
  }
  if (type === "LETTER_DRAFT") {
    return "Write a complete letter with greeting, concise body paragraphs, and closing."
  }
  if (type === "REPORT_DRAFT") {
    return "Use sections for purpose, relevant facts, assessment, and next steps."
  }
  return "Use a clear, practical structure that fits the task."
}

function defaultInstruction(type, audience) {
  if (type === "LETTER_DRAFT") {
    return audience === "client"
      ? "Draft a clear letter for the client."
      : "Draft a professional letter for a specialist or institution."
  }
  if (type === "CHECKLIST") return "Create a practical checklist from the selected documents."
  if (type === "MEETING_SUMMARY") return "Create a meeting summary from the selected documents."
  if (type === "CASE_BRIEF") return "Create a concise case brief from the selected documents."
  return "Create a useful first draft from the selected documents."
}

function normalizeAgentOption(value, allowedValues, fallback) {
  const normalized = String(value || "").trim().toLowerCase()
  return allowedValues.has(normalized) ? normalized : fallback
}

export function normalizeAgentAudience(value) {
  return normalizeAgentOption(value, AGENT_AUDIENCE_VALUES, "worker")
}

export function normalizeAgentTone(value) {
  return normalizeAgentOption(value, AGENT_TONE_VALUES, "professional")
}

export function normalizeAgentLength(value) {
  return normalizeAgentOption(value, AGENT_LENGTH_VALUES, "standard")
}

export function normalizeAgentLanguage(value, fallback = "et") {
  return normalizeAgentOption(value, AGENT_LANGUAGE_VALUES, fallback)
}

export function normalizeAgentInstruction(value) {
  const normalized = normalizeText(value)
  if (normalized.length > 4_000) {
    throw createArtifactError("documents.artifacts.errors.instruction_too_long", 400)
  }
  return normalized
}

export function normalizeRefinementInstruction(value) {
  const normalized = normalizeText(value)
  if (!normalized) {
    throw createArtifactError("documents.artifacts.errors.refinement_required", 400)
  }
  if (normalized.length > 4_000) {
    throw createArtifactError("documents.artifacts.errors.instruction_too_long", 400)
  }
  return normalized
}

async function createOpenAIClient() {
  let OpenAI
  try {
    ({ default: OpenAI } = await import("openai"))
  } catch (error) {
    throw createArtifactError(error?.message || "documents.artifacts.errors.ai_unavailable", 503)
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw createArtifactError("documents.artifacts.errors.ai_unavailable", 503)
  }

  return new OpenAI({ apiKey })
}

async function analyzeDocumentBuffer({ fileName, mime, buffer }) {
  if (!RAG_KEY) {
    throw createArtifactError("documents.artifacts.errors.analysis_unavailable", 503)
  }

  const base = normalizeBaseFromHost(RAW_RAG_HOST)
  if (!ALLOW_EXTERNAL && !isLocalBaseUrl(base)) {
    throw createArtifactError("documents.artifacts.errors.analysis_unavailable", 503)
  }

  const headers = new Headers()
  headers.set("X-API-Key", RAG_KEY)

  const formData = new FormData()
  formData.append("file", new Blob([buffer], { type: mime }), fileName || "document")
  formData.append("mimeType", mime)
  formData.append("maxChunks", String(AGENT_ANALYZE_MAX_CHUNKS))

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS)

  try {
    const response = await fetch(`${base}/analyze`, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
      signal: controller.signal
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw createArtifactError(payload?.messageKey || "documents.artifacts.errors.analysis_failed", response.status || 502)
    }

    const fullText = typeof payload?.fullText === "string" && payload.fullText.trim()
      ? payload.fullText
      : Array.isArray(payload?.chunks)
        ? payload.chunks.join("\n\n")
        : payload?.preview || ""

    return normalizeText(fullText)
  } finally {
    clearTimeout(timer)
  }
}

async function extractDocumentText(document) {
  const buffer = await readStoredDocument(document.storagePath)
  let rawText = ""

  if (document.mime === "text/plain") {
    rawText = buffer.toString("utf8")
  } else {
    rawText = await analyzeDocumentBuffer({
      fileName: document.originalName,
      mime: document.mime,
      buffer
    })
  }

  const normalized = normalizeText(rawText)
  if (!normalized) {
    throw createArtifactError("documents.artifacts.errors.analysis_failed", 502)
  }

  return compactText(normalized, AGENT_SOURCE_DOC_MAX_CHARS)
}

async function collectSourceMaterial(documents) {
  const extractedDocuments = []
  const unavailableSources = []

  for (const document of documents) {
    try {
      const text = await extractDocumentText(document)
      extractedDocuments.push({
        id: document.id,
        title: document.title,
        originalName: document.originalName,
        kind: document.kind,
        text
      })
    } catch (error) {
      unavailableSources.push(document.title || document.originalName || document.id)
      console.error("[documents artifacts] source extraction failed", {
        documentId: document.id,
        message: error?.message || "unknown"
      })
    }
  }

  if (!extractedDocuments.length) {
    throw createArtifactError("documents.artifacts.errors.analysis_failed", 502)
  }

  const sourceBlocks = []
  let usedChars = 0

  for (const document of extractedDocuments) {
    if (usedChars >= AGENT_SOURCE_TOTAL_MAX_CHARS) break
    const remaining = AGENT_SOURCE_TOTAL_MAX_CHARS - usedChars
    const excerpt = compactText(document.text, remaining)
    if (!excerpt) continue
    usedChars += excerpt.length
    sourceBlocks.push(
      [
        `Document: ${document.title || document.originalName}`,
        `Original file: ${document.originalName}`,
        `Kind: ${document.kind}`,
        "Excerpt:",
        excerpt
      ].join("\n")
    )
  }

  return {
    sourceBlocks,
    unavailableSources
  }
}

export async function generateArtifactDraftContent({
  type,
  documents,
  templateTitle,
  instruction,
  audience,
  tone,
  language,
  length
}) {
  const client = await createOpenAIClient()
  const resolvedAudience = normalizeAgentAudience(audience)
  const resolvedTone = normalizeAgentTone(tone)
  const resolvedLength = normalizeAgentLength(length)
  const resolvedLanguage = normalizeAgentLanguage(language)
  const resolvedInstruction = normalizeAgentInstruction(instruction) || defaultInstruction(type, resolvedAudience)

  const { sourceBlocks, unavailableSources } = await collectSourceMaterial(documents)

  const limitationsLine = unavailableSources.length
    ? `Some selected documents could not be extracted in time: ${unavailableSources.join(", ")}. If relevant, mention that some material may be missing.`
    : ""

  const systemPrompt = [
    "You are SotsiaalAI's drafting agent for social work workflows.",
    "Use only the source material provided by the system.",
    "Do not invent facts, dates, decisions, or people.",
    "If important information is missing, unclear, or conflicting, say so explicitly in the draft.",
    "Return only the draft text in markdown. Do not wrap it in code fences."
  ].join(" ")

  const userPrompt = [
    `Create a ${lengthLabel(resolvedLength)} ${type.toLowerCase().replace(/_/g, " ")} draft.`,
    `Write in ${languageLabel(resolvedLanguage)}.`,
    `Primary audience: ${audienceLabel(resolvedAudience)}.`,
    `Tone: ${toneLabel(resolvedTone)}.`,
    `Structure guidance: ${structureGuide(type)}`,
    templateTitle ? `Template reference: ${templateTitle}. Use it as a loose framing hint only if consistent with the source material.` : "",
    `User instruction: ${resolvedInstruction}`,
    "Requirements:",
    "- Keep the text useful as a human-review draft.",
    "- Prefer concrete, source-grounded wording over general filler.",
    "- When something is missing, list it clearly instead of guessing.",
    "- Do not mention internal prompts or that you are an AI.",
    limitationsLine,
    "",
    "Source material:",
    sourceBlocks.join("\n\n---\n\n")
  ]
    .filter(Boolean)
    .join("\n")

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    max_output_tokens: AGENT_MAX_OUTPUT_TOKENS,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }]
      }
    ]
  })

  const content = normalizeText(response?.output_text || "")
  if (!content) {
    throw createArtifactError("documents.artifacts.errors.ai_empty", 502)
  }

  return content
}

export async function refineArtifactDraftContent({
  type,
  documents,
  templateTitle,
  currentContent,
  refinementInstruction,
  audience,
  tone,
  language,
  length
}) {
  const currentDraft = normalizeText(currentContent)
  if (!currentDraft) {
    throw createArtifactError("documents.artifacts.errors.content_required", 400)
  }

  const resolvedRefinementInstruction = normalizeRefinementInstruction(refinementInstruction)
  const resolvedAudience = normalizeAgentAudience(audience)
  const resolvedTone = normalizeAgentTone(tone)
  const resolvedLength = normalizeAgentLength(length)
  const resolvedLanguage = normalizeAgentLanguage(language)
  const client = await createOpenAIClient()
  const { sourceBlocks, unavailableSources } = await collectSourceMaterial(documents)

  const limitationsLine = unavailableSources.length
    ? `Some selected documents could not be extracted in time: ${unavailableSources.join(", ")}. If relevant, mention that some material may be missing.`
    : ""

  const systemPrompt = [
    "You are SotsiaalAI's drafting agent for social work workflows.",
    "Revise the existing draft using only the source material and the user's refinement request.",
    "Do not invent facts, dates, decisions, or people.",
    "Keep the draft grounded, practical, and review-ready.",
    "Return only the revised draft text in markdown. Do not wrap it in code fences."
  ].join(" ")

  const userPrompt = [
    `Revise this ${type.toLowerCase().replace(/_/g, " ")} draft.`,
    `Write in ${languageLabel(resolvedLanguage)}.`,
    `Primary audience: ${audienceLabel(resolvedAudience)}.`,
    `Tone: ${toneLabel(resolvedTone)}.`,
    `Target length: ${lengthLabel(resolvedLength)}.`,
    `Structure guidance: ${structureGuide(type)}`,
    templateTitle ? `Template reference: ${templateTitle}. Use it only if consistent with the source material.` : "",
    `User refinement request: ${resolvedRefinementInstruction}`,
    "Revision rules:",
    "- Keep useful parts of the current draft when they are supported by the source material.",
    "- Change unsupported or vague wording into more precise, source-grounded wording.",
    "- If key information is missing, say so clearly instead of guessing.",
    "- Do not mention internal prompts or that you are an AI.",
    limitationsLine,
    "",
    "Current draft:",
    currentDraft,
    "",
    "Source material:",
    sourceBlocks.join("\n\n---\n\n")
  ]
    .filter(Boolean)
    .join("\n")

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    max_output_tokens: AGENT_MAX_OUTPUT_TOKENS,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }]
      }
    ]
  })

  const content = normalizeText(response?.output_text || "")
  if (!content) {
    throw createArtifactError("documents.artifacts.errors.ai_empty", 502)
  }

  return content
}
