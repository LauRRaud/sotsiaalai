import prisma from "../prisma.js";
import { TARGET_GROUP_DATA_PATH, loadTargetGroupSeedEntries } from "./targetGroupData.js";

export const targetGroupSummarySelect = Object.freeze({
  id: true,
  code: true,
  labelEt: true,
  labelEn: true,
  labelRu: true,
  isActive: true
});

function normalizeCode(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim().toUpperCase();
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

export function inferTargetGroupCodes(input = {}) {
  const explicitCodes = Array.isArray(input?.targetGroupCodes)
    ? input.targetGroupCodes.map((value) => normalizeCode(value)).filter(Boolean)
    : [];
  if (explicitCodes.length) return Array.from(new Set(explicitCodes));

  const parts = [
    input?.targetGroup,
    ...(Array.isArray(input?.targetGroups) ? input.targetGroups : [])
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  const combined = parts.join(" ");
  const codes = new Set();

  if (/\b(laps|lapsed|child|children)\b/.test(combined)) codes.add("CHILD");
  if (/\b(noor|noored|youth|young)\b/.test(combined)) codes.add("YOUTH");
  if (/\b(taiskasvanu|adult)\b/.test(combined)) codes.add("ADULT");
  if (/\b(eakas|eakale|eakad|senior|older)\b/.test(combined)) codes.add("ELDER");
  if (/\b(puue|puudega|erivajadus|disabled|disability|special need)\b/.test(combined)) codes.add("DISABILITY");

  return Array.from(codes);
}

export async function listTargetGroups(filters = {}, prismaClient = prisma) {
  const where = {};
  if (filters?.includeInactive !== true) {
    where.isActive = true;
  }

  return prismaClient.targetGroup.findMany({
    where,
    select: targetGroupSummarySelect,
    orderBy: [{ code: "asc" }]
  });
}

export async function resolveTargetGroups(input = {}, prismaClient = prisma) {
  const codes = inferTargetGroupCodes(input);
  if (!codes.length) return [];

  const groups = await prismaClient.targetGroup.findMany({
    where: {
      code: {
        in: codes
      },
      isActive: true
    },
    select: targetGroupSummarySelect
  });

  return groups.sort((left, right) => left.code.localeCompare(right.code, "en"));
}

export async function seedTargetGroups(prismaClient = prisma) {
  const entries = await loadTargetGroupSeedEntries();

  for (const entry of entries) {
    await prismaClient.targetGroup.upsert({
      where: { code: entry.code },
      update: {
        labelEt: entry.labelEt,
        labelEn: entry.labelEn,
        labelRu: entry.labelRu,
        isActive: entry.isActive
      },
      create: {
        code: entry.code,
        labelEt: entry.labelEt,
        labelEn: entry.labelEn,
        labelRu: entry.labelRu,
        isActive: entry.isActive
      }
    });
  }

  return {
    count: entries.length,
    sourcePath: TARGET_GROUP_DATA_PATH
  };
}
