import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { serverT } from "@/lib/i18n/serverMessages";
import { logDocumentsAudit } from "@/lib/documents/audit";
import { ensureDocumentsStorage, resolveDocsUploadsDir, sanitizeTextFilename } from "@/lib/documents/server";

function formatRoleLabel(locale, role) {
  if (String(role || "").toUpperCase() === "SOCIAL_WORKER") {
    return serverT(locale, "role.worker", undefined, "Social Work Specialist");
  }
  if (String(role || "").toUpperCase() === "CLIENT") {
    return serverT(locale, "role.client", undefined, "Person seeking help");
  }
  return String(role || "").toUpperCase();
}

function buildAcceptanceDocumentPayload({ acceptance, user, locale }) {
  return {
    recordType: "FRAMEWORK_ACCEPTANCE",
    title: serverT(
      locale,
      "documents.framework_acceptance.title",
      undefined,
      "Professional-use acceptance record"
    ),
    user: {
      id: user.id,
      email: user.email || "",
      role: acceptance.roleAtAcceptance,
      roleLabel: formatRoleLabel(locale, acceptance.roleAtAcceptance)
    },
    framework: {
      key: acceptance.frameworkKey,
      version: acceptance.frameworkVersion
    },
    acceptance: {
      type: acceptance.acceptanceType,
      source: acceptance.acceptanceSource,
      locale: acceptance.locale || locale,
      acceptedAt: acceptance.acceptedAt,
      reviewDocumentOpenedAt: acceptance.reviewDocumentOpenedAt,
      signedDocumentDownloadedAt: acceptance.signedDocumentDownloadedAt
    },
    audit: {
      ipAddress: acceptance.ipAddress || null,
      userAgent: acceptance.userAgent || null
    }
  };
}

export async function createFrameworkAcceptanceDocument({ acceptance, user, locale = "en" }) {
  if (!acceptance?.id || !user?.id) return null;

  const payload = buildAcceptanceDocumentPayload({ acceptance, user, locale });
  const buffer = Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const timestamp = new Date(acceptance.acceptedAt || Date.now()).toISOString().replace(/[:.]/g, "-");
  const title = serverT(
    locale,
    "documents.framework_acceptance.title",
    undefined,
    "Professional-use acceptance record"
  );
  const fileBaseName = sanitizeTextFilename(`${title}_${timestamp}`, "framework_acceptance_record");
  const originalName = `${fileBaseName}.txt`;

  await ensureDocumentsStorage();
  const relativePath = path.join("uploads", `${crypto.randomUUID()}-${originalName}`);
  const absolutePath = path.join(resolveDocsUploadsDir(), path.basename(relativePath));
  await fs.writeFile(absolutePath, buffer);

  try {
    const document = await prisma.userDocument.create({
      data: {
        ownerId: user.id,
        title,
        originalName,
        kind: "OTHER",
        agentAllowed: false,
        mime: "text/plain",
        size: buffer.length,
        sha256,
        storagePath: relativePath,
        frameworkAcceptanceId: acceptance.id
      }
    });

    await logDocumentsAudit("document.uploaded", {
      userId: user.id,
      documentId: document.id,
      title: document.title,
      originalName: document.originalName,
      kind: document.kind,
      source: "framework_acceptance",
      frameworkAcceptanceId: acceptance.id,
      frameworkVersion: acceptance.frameworkVersion
    });

    return document;
  } catch (error) {
    try {
      await fs.unlink(absolutePath);
    } catch {}
    throw error;
  }
}
