import { resolveSessionRoleState } from "../../authz.js";
import { prisma } from "../../prisma.js";
import { logDocumentsAudit } from "../../documents/audit.js";
import {
  normalizeArtifactContent,
  normalizeArtifactTitle,
  serializeArtifact,
} from "../../documents/artifacts.js";
import { requireDocumentUser } from "../../documents/server.js";
import { DOCUMENT_TYPES } from "./careerDocumentFlows.js";
import {
  DOCUMENT_GENERATION_STATUS,
} from "./careerDocumentGenerator.js";

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function toArtifactType(flow) {
  switch (flow) {
    case DOCUMENT_TYPES.APPLICATION_EMAIL:
    case DOCUMENT_TYPES.COVER_LETTER:
    case DOCUMENT_TYPES.MOTIVATION_LETTER:
    case DOCUMENT_TYPES.RECOMMENDATION_HELP:
      return "LETTER_DRAFT";
    case DOCUMENT_TYPES.CV_BUILD:
    case DOCUMENT_TYPES.CV_TAILOR:
    default:
      return "OTHER";
  }
}

function buildArtifactContent(document = {}) {
  const body = coerceString(document.body);
  const subject = coerceString(document.subject);

  if (!body) {
    return null;
  }

  if (!subject) {
    return normalizeArtifactContent(body);
  }

  return normalizeArtifactContent(`Subject: ${subject}\n\n${body}`);
}

function buildFallbackTitle(flow) {
  const normalized = coerceString(flow) || "career-document";
  const pretty = normalized
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return pretty || "Career Document";
}

function buildOpenUrl(id, effectiveRole) {
  if (effectiveRole === "CLIENT") {
    return `/dokreziim?artifact=${encodeURIComponent(id)}`;
  }

  return `/documents/artifacts/${encodeURIComponent(id)}`;
}

function buildCollectionUrl(effectiveRole) {
  if (effectiveRole === "CLIENT") {
    return "/dokreziim";
  }

  return "/documents?artifacts=all#artifacts";
}

export async function persistCareerGeneratedDocument(
  generatedDocument,
  options = {}
) {
  if (
    !generatedDocument ||
    generatedDocument.ok !== true ||
    generatedDocument.status !== DOCUMENT_GENERATION_STATUS.READY
  ) {
    return null;
  }

  const document = generatedDocument.document;
  if (!document || typeof document !== "object") {
    return null;
  }

  const content = buildArtifactContent(document);
  if (!content) {
    return null;
  }

  const auth = await requireDocumentUser();
  if (!auth?.ok) {
    return null;
  }

  const roleState = resolveSessionRoleState(auth.session, options.cookieSource);
  const effectiveRole = roleState.effectiveRole || "CLIENT";
  const flow = coerceString(generatedDocument.flow) || coerceString(document.flow);
  const artifactType = toArtifactType(flow);
  const artifactTitle =
    normalizeArtifactTitle(document.title) ||
    normalizeArtifactTitle(buildFallbackTitle(flow));

  const artifact = await prisma.agentArtifact.create({
    data: {
      ownerId: auth.userId,
      type: artifactType,
      title: artifactTitle,
      status: "DRAFT",
      content,
    },
  });

  await logDocumentsAudit("artifact.created", {
    ownerId: auth.userId,
    artifactId: artifact.id,
    flow,
    artifactType,
    destination: effectiveRole === "CLIENT" ? "document_builder" : "documents",
    contentLength: content.length,
  });

  const serialized = serializeArtifact(artifact);

  return {
    ...serialized,
    destination: effectiveRole === "CLIENT" ? "document_builder" : "documents",
    openUrl: buildOpenUrl(artifact.id, effectiveRole),
    collectionUrl: buildCollectionUrl(effectiveRole),
    openTarget:
      effectiveRole === "CLIENT" ? "document_builder" : "documents_detail",
  };
}
