import { prisma } from "@/lib/prisma";

const CONVERSATION_TTL_DAYS = Number(process.env.CONVERSATION_TTL_DAYS || 90);
const CONVERSATION_TTL_MS = Math.max(1, CONVERSATION_TTL_DAYS) * 24 * 60 * 60 * 1000;
const SUMMARY_MAX = 2000;
const TITLE_MAX = 160;

export { CONVERSATION_TTL_DAYS };

export function conversationExpiryDate() {
  return new Date(Date.now() + CONVERSATION_TTL_MS);
}
export function trimText(text = "", max = SUMMARY_MAX) {
  if (!text) return "";
  const normalized = String(text).trim();
  if (!normalized) return "";
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}
export function autoTitle(text = "") {
  const normalized = trimText(text, TITLE_MAX);
  if (!normalized) return null;
  const sentenceMatch = normalized.match(/^(.{10,160}?[\.!\?])\s/);
  if (sentenceMatch) return sentenceMatch[1].trim();
  return normalized;
}

export async function persistInit({ convId, userId, role, userMessage }) {
  if (!convId || !userId || !userMessage) return;
  const now = new Date();
  const expiry = conversationExpiryDate();
  const titleDraft = autoTitle(userMessage);
  try {
    let conversation = await prisma.conversation.findUnique({
      where: { id: convId },
      select: { id: true, userId: true, title: true },
    });
    if (conversation && conversation.userId !== userId) return;
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: convId,
          userId,
          role,
          title: titleDraft,
          summary: trimText(userMessage),
          lastActivityAt: now,
          expiresAt: expiry,
        },
        select: { id: true, title: true },
      });
    } else {
      await prisma.conversation.update({
        where: { id: convId },
        data: { role, archivedAt: null },
      });
    }
    const needsTitle = !conversation.title && titleDraft;
    await prisma.$transaction([
      prisma.conversationMessage.create({
        data: {
          conversationId: convId,
          authorId: userId,
          role: "USER",
          content: userMessage,
        },
      }),
      prisma.conversation.update({
        where: { id: convId },
        data: {
          lastActivityAt: now,
          expiresAt: expiry,
          summary: trimText(userMessage),
          ...(needsTitle ? { title: titleDraft } : {}),
        },
      }),
    ]);
  } catch (err) {
    console.error("[chat] persistInit failed", { convId, err });
  }
}

export async function persistAppend({ convId, userId, fullText }) {
  if (!convId || !userId || !fullText) return;
  try {
    await prisma.conversation.update({
      where: { id: convId },
      data: { summary: trimText(fullText) },
    });
  } catch (err) {
    console.error("[chat] persistAppend failed", { convId, err });
  }
}

export async function persistDone({ convId, userId, status = "COMPLETED", finalText, sources = [], isCrisis }) {
  if (!convId || !userId) return;
  const now = new Date();
  const expiry = conversationExpiryDate();
  const operations = [];
  if (finalText) {
    operations.push(
      prisma.conversationMessage.create({
        data: {
          conversationId: convId,
          role: "ASSISTANT",
          content: finalText,
          metadata:
            sources?.length || typeof isCrisis !== "undefined"
              ? { sources: sources ?? [], isCrisis: !!isCrisis }
              : null,
        },
      })
    );
  }
  operations.push(
    prisma.conversation.update({
      where: { id: convId },
      data: {
        lastActivityAt: now,
        expiresAt: expiry,
        summary: finalText ? trimText(finalText) : undefined,
      },
    })
  );
  try {
    if (operations.length) await prisma.$transaction(operations);
  } catch (err) {
    console.error("[chat] persistDone failed", { convId, err });
  }
}
