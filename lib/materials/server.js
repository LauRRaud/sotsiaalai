import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

import {
  assertMimeMatchesBuffer,
  buildDownloadHeaders,
  ensureAllowedUpload,
  getFileExtension,
  sanitizeTextFilename
} from "@/lib/documents/server"

export { buildDownloadHeaders, ensureAllowedUpload, sanitizeTextFilename }

const FALLBACK_MATERIALS_STORAGE_DIR = "tmp/materials"
const MAX_COMMENT_LENGTH = 4_000
let hasWarnedAboutMaterialsStorageFallback = false

export function resolveMaterialsStorageDir() {
  const raw = String(process.env.MATERIALS_STORAGE_DIR || "").trim()
  if (!raw && process.env.NODE_ENV === "production" && !hasWarnedAboutMaterialsStorageFallback) {
    hasWarnedAboutMaterialsStorageFallback = true
    console.warn("[materials] MATERIALS_STORAGE_DIR is missing in production, falling back to tmp/materials")
  }
  return path.resolve(raw || FALLBACK_MATERIALS_STORAGE_DIR)
}

export function resolveMaterialsUploadsDir() {
  return path.join(resolveMaterialsStorageDir(), "uploads")
}

export async function ensureMaterialsStorage() {
  await fs.mkdir(resolveMaterialsUploadsDir(), { recursive: true })
}

export function normalizeMaterialComment(value) {
  const normalized = String(value || "").replace(/\r\n/g, "\n").trim()
  if (!normalized) return ""
  return normalized.slice(0, MAX_COMMENT_LENGTH)
}

export function getStoredMaterialPath(originalName) {
  const extension = getFileExtension(originalName)
  return path.posix.join("uploads", `${crypto.randomUUID()}${extension}`)
}

export function resolveAbsoluteMaterialPath(storagePath) {
  const uploadsDir = resolveMaterialsUploadsDir()
  const normalized = path.normalize(String(storagePath || ""))
  const absolute = path.resolve(resolveMaterialsStorageDir(), normalized)
  const uploadsRoot = path.resolve(uploadsDir)
  if (absolute !== uploadsRoot && !absolute.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error("materials.errors.storage_path_invalid")
  }
  return absolute
}

export async function writeUploadedMaterial(file, storagePath, mime) {
  const absolutePath = resolveAbsoluteMaterialPath(storagePath)
  const buffer = Buffer.from(await file.arrayBuffer())
  assertMimeMatchesBuffer(buffer, mime)
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex")
  await fs.writeFile(absolutePath, buffer)

  return {
    size: buffer.byteLength,
    sha256
  }
}

export async function readStoredMaterial(storagePath) {
  return fs.readFile(resolveAbsoluteMaterialPath(storagePath))
}

export async function deleteStoredMaterial(storagePath) {
  try {
    await fs.unlink(resolveAbsoluteMaterialPath(storagePath))
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
  }
}
