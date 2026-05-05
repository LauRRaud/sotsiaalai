import { prisma } from "@/lib/prisma";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";

export const PRE_INQUIRY_RECIPIENT_TYPES = Object.freeze([
  "KOV_CONTACT",
  "SERVICE_PROVIDER"
]);

export const PRE_INQUIRY_DELIVERY_CHANNELS = Object.freeze([
  "INTERNAL",
  "EXTERNAL_EMAIL"
]);

export const PRE_INQUIRY_STATUSES = Object.freeze([
  "DRAFT",
  "READY",
  "SENT",
  "DOWNLOADED",
  "ARCHIVED"
]);

const MAX_SHORT_TEXT_LENGTH = 1_000;
const MAX_TEXT_LENGTH = 12_000;
const ASSIST_STOP_WORDS = new Set([
  "ning",
  "olen",
  "oleme",
  "vajan",
  "vajab",
  "palun",
  "soovin",
  "kuidas",
  "kuhu",
  "mida",
  "kelle",
  "poole",
  "pöörduda",
  "poorduda",
  "minu",
  "tema",
  "meie",
  "selle",
  "kohta"
]);

const preInquiryInclude = {
  recipientEntry: true,
  author: {
    select: {
      id: true,
      email: true,
      role: true
    }
  },
  recipientOwner: {
    select: {
      id: true,
      email: true,
      role: true
    }
  }
};

function normalizeText(value, maxLength = MAX_SHORT_TEXT_LENGTH) {
  const normalized = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function normalizeRequiredText(value, fieldName, maxLength = MAX_TEXT_LENGTH) {
  const normalized = normalizeText(value, maxLength);
  if (!normalized) {
    const error = new Error(`pre_inquiries.errors.${fieldName}_required`);
    error.status = 400;
    throw error;
  }
  return normalized;
}

function normalizeEnum(value, values, fallback) {
  const normalized = String(value || "").trim().toUpperCase();
  return values.includes(normalized) ? normalized : fallback;
}

function inferRecipientType(entry, inputType) {
  const normalizedInput = normalizeEnum(inputType, PRE_INQUIRY_RECIPIENT_TYPES, "");
  if (normalizedInput) return normalizedInput;
  return entry?.type === "SERVICE_PROVIDER" ? "SERVICE_PROVIDER" : "KOV_CONTACT";
}

function buildDraft({ topic, situation, recipientName, recipientEmail }) {
  const subject = topic || "Pöördumine";
  const lines = [
    "Tere",
    "",
    `Soovin pöörduda teemal: ${subject}.`,
    "",
    "Olukorra kirjeldus:",
    situation,
    "",
    "Palun andke teada, millised oleksid järgmised sammud ja millist lisainfot vajate.",
    "",
    "Lugupidamisega"
  ];

  if (recipientName || recipientEmail) {
    lines.splice(
      2,
      0,
      `Adressaat: ${[recipientName, recipientEmail].filter(Boolean).join(" / ")}`,
      ""
    );
  }

  return lines.join("\n").slice(0, MAX_TEXT_LENGTH);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractAssistKeywords(...values) {
  const text = values
    .map((value) => String(value || ""))
    .join(" ")
    .toLocaleLowerCase("et")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ");
  const result = [];
  const seen = new Set();
  for (const word of text.split(/\s+/)) {
    const normalized = word.trim();
    if (normalized.length < 4 || ASSIST_STOP_WORDS.has(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= 12) break;
  }
  return result;
}

function scoreEntry(entry, keywords, preferredType) {
  const haystack = [
    entry.title,
    entry.description,
    entry.address,
    entry.municipalityName,
    entry.county,
    entry.providerProfile?.organizationName,
    entry.providerProfile?.serviceArea,
    ...(entry.providerProfile?.services || []),
    ...(entry.providerProfile?.serviceCategories || []),
    ...(entry.providerProfile?.targetGroups || [])
  ].join(" ").toLocaleLowerCase("et");
  let score = 0;
  if (preferredType && entry.type === preferredType) score += 4;
  if (entry.email) score += 2;
  if (entry.phone) score += 1;
  for (const keyword of keywords) {
    if (haystack.includes(keyword)) score += 3;
  }
  return score;
}

function buildAssistantDraft({ topic, situation, assistantMessage, recipient }) {
  const details = [situation, assistantMessage].filter(Boolean).join("\n\n");
  return buildDraft({
    topic,
    situation: details || situation || assistantMessage || "",
    recipientName: recipient?.title,
    recipientEmail: recipient?.email
  });
}

async function resolveRecipient(input = {}) {
  const recipientEntryId = normalizeText(input.recipientEntryId);
  const selectedRecipientEmail = normalizeText(input.selectedRecipientEmail)?.toLowerCase() || null;
  const explicitRecipientName = normalizeText(input.selectedRecipientName);

  let recipientEntry = null;
  if (recipientEntryId) {
    recipientEntry = await prisma.serviceMapEntry.findUnique({
      where: { id: recipientEntryId },
      include: {
        providerProfile: {
          select: {
            ownerId: true,
            organizationName: true,
            acceptsPlatformPreInquiries: true,
            acceptsEmailPreInquiries: true
          }
        }
      }
    });
  }

  const recipientType = inferRecipientType(recipientEntry, input.recipientType);
  const selectedRecipientName =
    explicitRecipientName ||
    recipientEntry?.title ||
    recipientEntry?.providerProfile?.organizationName ||
    null;
  const recipientEmail = selectedRecipientEmail || recipientEntry?.email || null;
  const matchedRecipientOwner = recipientEmail
    ? await prisma.user.findUnique({
        where: { email: recipientEmail },
        select: {
          id: true,
          acceptsPreInquiries: true
        }
      })
    : null;
  const providerAcceptsPlatform =
    recipientEntry?.type === "SERVICE_PROVIDER" &&
    recipientEntry?.providerProfile?.acceptsPlatformPreInquiries !== false;
  const matchedUserAcceptsPlatform = Boolean(matchedRecipientOwner?.acceptsPreInquiries);
  const recipientOwnerId =
    providerAcceptsPlatform && recipientEntry?.providerProfile?.ownerId
      ? recipientEntry.providerProfile.ownerId
      : matchedUserAcceptsPlatform
        ? matchedRecipientOwner.id
        : null;
  const deliveryChannel = recipientOwnerId ? "INTERNAL" : "EXTERNAL_EMAIL";

  return {
    recipientEntry,
    recipientType,
    selectedRecipientEmail: recipientEmail,
    selectedRecipientName,
    recipientOwnerId,
    deliveryChannel
  };
}

export function serializePreInquiry(inquiry) {
  if (!inquiry) return null;
  return {
    id: inquiry.id,
    authorId: inquiry.authorId,
    recipientOwnerId: inquiry.recipientOwnerId,
    recipientEntryId: inquiry.recipientEntryId,
    recipientType: inquiry.recipientType,
    deliveryChannel: inquiry.deliveryChannel,
    selectedRecipientEmail: inquiry.selectedRecipientEmail,
    selectedRecipientName: inquiry.selectedRecipientName,
    topic: inquiry.topic,
    situation: inquiry.situation,
    generatedDraft: inquiry.generatedDraft,
    userEditedDraft: inquiry.userEditedDraft,
    status: inquiry.status,
    sentAt: inquiry.sentAt,
    externalSendConfirmedAt: inquiry.externalSendConfirmedAt,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    recipientEntry: inquiry.recipientEntry
      ? {
          id: inquiry.recipientEntry.id,
          type: inquiry.recipientEntry.type,
          title: inquiry.recipientEntry.title,
          address: inquiry.recipientEntry.address,
          phone: inquiry.recipientEntry.phone,
          email: inquiry.recipientEntry.email,
          website: inquiry.recipientEntry.website,
          providerProfileId: inquiry.recipientEntry.providerProfileId
        }
      : null,
    author: inquiry.author
      ? {
          id: inquiry.author.id,
          email: inquiry.author.email,
          role: inquiry.author.role
        }
      : null,
    recipientOwner: inquiry.recipientOwner
      ? {
          id: inquiry.recipientOwner.id,
          email: inquiry.recipientOwner.email,
          role: inquiry.recipientOwner.role
        }
      : null
  };
}

export async function listVisiblePreInquiries(userId, { isAdmin = false, limit = 100 } = {}) {
  if (!userId) return [];
  const take = Math.max(1, Math.min(Number(limit) || 100, 250));
  const where = isAdmin
    ? {}
    : {
        OR: [
          { authorId: userId },
          { recipientOwnerId: userId }
        ]
      };

  const inquiries = await prisma.preInquiry.findMany({
    where,
    take,
    orderBy: { updatedAt: "desc" },
    include: preInquiryInclude
  });

  return inquiries.map(serializePreInquiry);
}

export async function getVisiblePreInquiry(userId, inquiryId, { isAdmin = false } = {}) {
  if (!userId || !inquiryId) return null;
  const inquiry = await prisma.preInquiry.findFirst({
    where: {
      id: inquiryId,
      ...(isAdmin
        ? {}
        : {
            OR: [
              { authorId: userId },
              { recipientOwnerId: userId }
            ]
          })
    },
    include: preInquiryInclude
  });
  return inquiry;
}

export async function createPreInquiry(userId, input = {}) {
  if (!userId) {
    const error = new Error("api.common.unauthorized");
    error.status = 401;
    throw error;
  }

  const situation = normalizeRequiredText(input.situation, "situation");
  const topic = normalizeText(input.topic);
  const status = normalizeEnum(input.status, PRE_INQUIRY_STATUSES, "DRAFT");
  const recipient = await resolveRecipient(input);
  const generatedDraft = normalizeText(input.generatedDraft, MAX_TEXT_LENGTH) || buildDraft({
    topic,
    situation,
    recipientName: recipient.selectedRecipientName,
    recipientEmail: recipient.selectedRecipientEmail
  });
  const userEditedDraft = normalizeText(input.userEditedDraft, MAX_TEXT_LENGTH) || generatedDraft;

  const inquiry = await prisma.preInquiry.create({
    data: {
      authorId: userId,
      recipientOwnerId: recipient.recipientOwnerId,
      recipientEntryId: recipient.recipientEntry?.id || null,
      recipientType: recipient.recipientType,
      deliveryChannel: recipient.deliveryChannel,
      selectedRecipientEmail: recipient.selectedRecipientEmail,
      selectedRecipientName: recipient.selectedRecipientName,
      topic,
      situation,
      generatedDraft,
      userEditedDraft,
      status
    },
    include: preInquiryInclude
  });

  return serializePreInquiry(inquiry);
}

export async function updatePreInquiry(userId, inquiryId, input = {}, { isAdmin = false } = {}) {
  const existing = await getVisiblePreInquiry(userId, inquiryId, { isAdmin });
  if (!existing) {
    const error = new Error("api.common.not_found");
    error.status = 404;
    throw error;
  }
  if (!isAdmin && existing.authorId !== userId) {
    const error = new Error("api.common.forbidden");
    error.status = 403;
    throw error;
  }
  if (existing.status === "SENT") {
    const error = new Error("pre_inquiries.errors.sent_cannot_be_edited");
    error.status = 409;
    throw error;
  }

  const situation = normalizeRequiredText(input.situation ?? existing.situation, "situation");
  const topic = normalizeText(input.topic ?? existing.topic);
  const recipient = await resolveRecipient({
    recipientEntryId: input.recipientEntryId ?? existing.recipientEntryId,
    recipientType: input.recipientType ?? existing.recipientType,
    selectedRecipientEmail: input.selectedRecipientEmail ?? existing.selectedRecipientEmail,
    selectedRecipientName: input.selectedRecipientName ?? existing.selectedRecipientName
  });
  const generatedDraft = normalizeText(input.generatedDraft, MAX_TEXT_LENGTH) || existing.generatedDraft || buildDraft({
    topic,
    situation,
    recipientName: recipient.selectedRecipientName,
    recipientEmail: recipient.selectedRecipientEmail
  });
  const userEditedDraft = normalizeText(input.userEditedDraft, MAX_TEXT_LENGTH) || generatedDraft;
  const status = normalizeEnum(input.status, PRE_INQUIRY_STATUSES, existing.status || "DRAFT");

  const inquiry = await prisma.preInquiry.update({
    where: { id: existing.id },
    data: {
      recipientOwnerId: recipient.recipientOwnerId,
      recipientEntryId: recipient.recipientEntry?.id || null,
      recipientType: recipient.recipientType,
      deliveryChannel: recipient.deliveryChannel,
      selectedRecipientEmail: recipient.selectedRecipientEmail,
      selectedRecipientName: recipient.selectedRecipientName,
      topic,
      situation,
      generatedDraft,
      userEditedDraft,
      status
    },
    include: preInquiryInclude
  });

  return serializePreInquiry(inquiry);
}

export async function sendExternalPreInquiry(userId, inquiryId, { isAdmin = false } = {}) {
  const existing = await getVisiblePreInquiry(userId, inquiryId, { isAdmin });
  if (!existing) {
    const error = new Error("api.common.not_found");
    error.status = 404;
    throw error;
  }
  if (!isAdmin && existing.authorId !== userId) {
    const error = new Error("api.common.forbidden");
    error.status = 403;
    throw error;
  }
  if (existing.deliveryChannel !== "EXTERNAL_EMAIL") {
    const error = new Error("pre_inquiries.errors.internal_cannot_email");
    error.status = 409;
    throw error;
  }
  if (!existing.selectedRecipientEmail) {
    const error = new Error("pre_inquiries.errors.recipient_email_required");
    error.status = 400;
    throw error;
  }
  if (existing.status === "SENT") {
    const error = new Error("pre_inquiries.errors.already_sent");
    error.status = 409;
    throw error;
  }

  const from = String(process.env.EMAIL_FROM || process.env.SMTP_FROM || "").trim();
  const hasSmtp = Boolean(process.env.EMAIL_SERVER || process.env.SMTP_HOST);
  if (!from || (process.env.NODE_ENV === "production" && !hasSmtp)) {
    const error = new Error("pre_inquiries.errors.email_not_configured");
    error.status = 503;
    throw error;
  }

  const subject = existing.topic ? `SotsiaalAI eelpöördumine: ${existing.topic}` : "SotsiaalAI eelpöördumine";
  const text = existing.userEditedDraft || existing.generatedDraft || existing.situation;
  const baseUrl = String(resolveBaseUrl() || "").replace(/\/+$/, "");
  const html = [
    `<p>${escapeHtml(text).replace(/\n/g, "<br />")}</p>`,
    baseUrl ? `<p><small>Koostatud SotsiaalAI platvormis: ${escapeHtml(baseUrl)}</small></p>` : ""
  ].filter(Boolean).join("\n");

  await getMailer("pre-inquiries").sendMail({
    to: existing.selectedRecipientEmail,
    from,
    replyTo: existing.author?.email || undefined,
    subject,
    text,
    html
  });

  const now = new Date();
  const inquiry = await prisma.preInquiry.update({
    where: { id: existing.id },
    data: {
      status: "SENT",
      sentAt: now,
      externalSendConfirmedAt: now
    },
    include: preInquiryInclude
  });

  return serializePreInquiry(inquiry);
}

export async function assistPreInquiry({
  topic = "",
  situation = "",
  assistantMessage = "",
  recipientType = "",
  activeRole = "CLIENT",
  limit = 6
} = {}) {
  const normalizedTopic = normalizeText(topic);
  const normalizedSituation = normalizeText(situation, MAX_TEXT_LENGTH);
  const normalizedAssistantMessage = normalizeText(assistantMessage, MAX_TEXT_LENGTH);
  const preferredRecipientType = normalizeEnum(
    recipientType,
    PRE_INQUIRY_RECIPIENT_TYPES,
    ""
  );
  const keywords = extractAssistKeywords(
    normalizedTopic,
    normalizedSituation,
    normalizedAssistantMessage
  );
  const preferredMapType =
    preferredRecipientType === "SERVICE_PROVIDER"
      ? "SERVICE_PROVIDER"
      : preferredRecipientType === "KOV_CONTACT"
        ? "KOV_SOCIAL_CONTACT"
        : "";

  const where = {
    status: { in: ["PUBLISHED", "NEEDS_REVIEW"] },
    ...(preferredMapType
      ? {
          type: preferredMapType === "KOV_SOCIAL_CONTACT"
            ? { in: ["KOV_SOCIAL_CONTACT", "KOV_GENERAL_CONTACT"] }
            : preferredMapType
        }
      : {})
  };

  const entries = await prisma.serviceMapEntry.findMany({
    where,
    take: 100,
    orderBy: [{ type: "asc" }, { title: "asc" }],
    include: {
      providerProfile: {
        select: {
          id: true,
          ownerId: true,
          organizationName: true,
          shortDescription: true,
          services: true,
          serviceCategories: true,
          targetGroups: true,
          serviceArea: true,
          acceptsPlatformPreInquiries: true,
          acceptsEmailPreInquiries: true
        }
      }
    }
  });

  const emails = [...new Set(entries.map((entry) => entry.email).filter(Boolean))];
  const usersByEmail = new Map();
  if (emails.length) {
    const users = await prisma.user.findMany({
      where: {
        email: { in: emails }
      },
      select: {
        id: true,
        email: true,
        acceptsPreInquiries: true
      }
    });
    for (const user of users) {
      if (user.email) usersByEmail.set(user.email.toLowerCase(), user);
    }
  }

  const suggestions = entries
    .map((entry) => {
      const providerAcceptsPlatform =
        entry.type === "SERVICE_PROVIDER" &&
        entry.providerProfile?.acceptsPlatformPreInquiries !== false;
      const providerAcceptsEmail =
        entry.type !== "SERVICE_PROVIDER" ||
        entry.providerProfile?.acceptsEmailPreInquiries !== false;
      const matchedUser = entry.email ? usersByEmail.get(entry.email.toLowerCase()) : null;
      const internalOwnerId =
        providerAcceptsPlatform && entry.providerProfile?.ownerId
          ? entry.providerProfile.ownerId
          : matchedUser?.acceptsPreInquiries
            ? matchedUser.id
            : null;
      const deliveryChannel = internalOwnerId ? "INTERNAL" : "EXTERNAL_EMAIL";
      const score = scoreEntry(entry, keywords, preferredMapType);
      return {
        id: entry.id,
        type: entry.type,
        title: entry.title,
        description: entry.description,
        email: entry.email,
        phone: entry.phone,
        address: entry.address,
        county: entry.county,
        municipalityName: entry.municipalityName,
        providerProfileId: entry.providerProfileId,
        providerServices: entry.providerProfile?.services || [],
        deliveryChannel,
        canSendEmail: Boolean(entry.email && providerAcceptsEmail),
        score
      };
    })
    .filter((entry) => entry.score > 0 || !keywords.length)
    .sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title), "et"))
    .slice(0, Math.max(1, Math.min(Number(limit) || 6, 12)));

  const primaryRecipient = suggestions[0] || null;
  const draft = buildAssistantDraft({
    topic: normalizedTopic,
    situation: normalizedSituation,
    assistantMessage: normalizedAssistantMessage,
    recipient: primaryRecipient
  });

  return {
    activeRole,
    keywords,
    suggestions,
    draft,
    message: suggestions.length
      ? "Leidsin struktuursetest kontaktidest sobivad adressaadid ja koostasin mustandi."
      : "Sobivat adressaati ei leitud. Mustandi saab siiski salvestada ja adressaadi hiljem lisada."
  };
}
