function pickLocale(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  if (normalized === "ru") return "ru";
  if (normalized === "en") return "en";
  return "et";
}

function normalizeText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeComparableText(value = "") {
  return normalizeText(value)
    .replace(/\s*Ā\s*/gu, " ")
    .toLowerCase()
    .replace(/[.?!…]+$/g, "")
    .replace(/[|·•]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSummaryText(value = "") {
  return normalizeText(value).replace(/\s*Ā\s*/gu, " ").replace(/\s+/g, " ").trim();
}

function truncateText(value = "", max = 220) {
  const text = normalizeText(value);
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}...`;
}

function titleCaseWords(value = "") {
  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function fallbackEnumLabel(value = "") {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  return titleCaseWords(normalized.replace(/_/g, " "));
}

function pickLocalizedField(item, locale = "et") {
  const resolvedLocale = pickLocale(locale);
  if (resolvedLocale === "ru" && item?.labelRu) return normalizeText(item.labelRu);
  if (resolvedLocale === "en" && item?.labelEn) return normalizeText(item.labelEn);
  return normalizeText(item?.labelEt || item?.labelEn || item?.labelRu || "");
}

export function formatListingKindLabel(kind = "", locale = "et") {
  const resolvedLocale = pickLocale(locale);
  const normalized = String(kind || "").trim().toLowerCase();
  const labels = {
    request: {
      et: "Abipalve",
      en: "Help request",
      ru: "Zapros na pomoshch"
    },
    offer: {
      et: "Abipakkumine",
      en: "Help offer",
      ru: "Predlozhenie pomoshchi"
    }
  };

  const variants = labels[normalized] || labels.request;
  return variants[resolvedLocale] || variants.et;
}

export function formatHelpTypeLabel(value = "", locale = "et") {
  const resolvedLocale = pickLocale(locale);
  const normalized = String(value || "").trim().toUpperCase();
  const labels = {
    VOLUNTARY: {
      et: "Vabatahtlik abi",
      en: "Voluntary help",
      ru: "Volonterskaya pomoshch"
    },
    PAID: {
      et: "Tasuline abi",
      en: "Paid help",
      ru: "Platnaya pomoshch"
    },
    MIXED: {
      et: "Vabatahtlik voi tasuline",
      en: "Voluntary or paid",
      ru: "Volonterskaya ili platnaya"
    }
  };
  if (labels[normalized]) return labels[normalized][resolvedLocale] || labels[normalized].et;
  return normalizeText(value);
}

export function formatTimeTypeLabel(value = "", locale = "et") {
  const resolvedLocale = pickLocale(locale);
  const normalized = String(value || "").trim().toUpperCase();
  const labels = {
    ONE_TIME: {
      et: "Uhekordne",
      en: "One-time",
      ru: "Odnorazovo"
    },
    RECURRING: {
      et: "Regulaarne",
      en: "Recurring",
      ru: "Regulyarno"
    },
    FLEXIBLE: {
      et: "Paindlik",
      en: "Flexible",
      ru: "Gibko"
    }
  };
  if (labels[normalized]) return labels[normalized][resolvedLocale] || labels[normalized].et;
  return normalizeText(value);
}

export function formatListingStatusLabel(value = "", locale = "et") {
  const resolvedLocale = pickLocale(locale);
  const normalized = String(value || "").trim().toUpperCase();
  const labels = {
    DRAFT: {
      et: "Mustand",
      en: "Draft",
      ru: "Chernovik"
    },
    OPEN: {
      et: "Aktiivne",
      en: "Open",
      ru: "Aktivno"
    },
    MATCHED: {
      et: "Uhendatud",
      en: "Matched",
      ru: "Svyazano"
    },
    CLOSED: {
      et: "Suletud",
      en: "Closed",
      ru: "Zakryto"
    },
    CANCELLED: {
      et: "Tyhistatud",
      en: "Cancelled",
      ru: "Otmeneno"
    },
    ARCHIVED: {
      et: "Arhiveeritud",
      en: "Archived",
      ru: "V arkhive"
    },
    PENDING: {
      et: "Ootel",
      en: "Pending",
      ru: "V ozhidanii"
    },
    CONTACTED: {
      et: "Kontakt alustatud",
      en: "Contact started",
      ru: "Kontakt nachat"
    },
    ACCEPTED: {
      et: "Vastu voetud",
      en: "Accepted",
      ru: "Prinyato"
    },
    DECLINED: {
      et: "Tagasi lykatud",
      en: "Declined",
      ru: "Otkлонeno"
    }
  };
  if (labels[normalized]) return labels[normalized][resolvedLocale] || labels[normalized].et;
  return fallbackEnumLabel(value);
}

function resolveCategoryLabel(record, locale = "et") {
  if (record?.categoryLabel) return normalizeText(record.categoryLabel);
  return pickLocalizedField(record?.primaryCategory, locale) || normalizeText(record?.primaryCategoryCode || "");
}

function resolveMunicipalityLabel(record) {
  return normalizeText(
    record?.municipalityLabel
    || record?.municipalityName
    || record?.municipality?.displayName
    || ""
  );
}

function resolveTargetGroupLabels(record, locale = "et") {
  if (Array.isArray(record?.targetGroupLabels)) {
    return record.targetGroupLabels.map((item) => normalizeText(item)).filter(Boolean);
  }

  const fromLinks = Array.isArray(record?.targetGroupLinks)
    ? record.targetGroupLinks.map((item) => pickLocalizedField(item?.targetGroup, locale))
    : [];
  const fromTargetGroups = Array.isArray(record?.targetGroups)
    ? record.targetGroups.map((item) => pickLocalizedField(item, locale))
    : [];

  return Array.from(new Set([...fromLinks, ...fromTargetGroups].filter(Boolean)));
}

function startsWithComparable(a = "", b = "") {
  const left = normalizeComparableText(a);
  const right = normalizeComparableText(b);
  if (!left || !right) return false;
  return left.startsWith(right) || right.startsWith(left);
}

function stripRepeatedTitleFromSummary(summary = "", title = "") {
  const normalizedSummary = normalizeSummaryText(summary);
  if (!normalizedSummary) return "";
  if (!title) return normalizedSummary;

  const summarySegments = normalizedSummary
    .split(/\s*[|·•]\s*/u)
    .map((item) => normalizeSummaryText(item))
    .filter(Boolean);

  if (summarySegments.length > 1 && startsWithComparable(summarySegments[0], title)) {
    return summarySegments.slice(1).join(" | ");
  }

  if (!startsWithComparable(normalizedSummary, title)) {
    return normalizedSummary;
  }

  const stripped = normalizedSummary
    .slice(Math.min(normalizedSummary.length, normalizeText(title).length))
    .replace(/^[|·•,;:\-\s]+/u, "");

  return normalizeSummaryText(stripped);
}

function stripLeadingSentenceMatchingTitle(description = "", title = "") {
  const normalizedDescription = normalizeText(description);
  if (!normalizedDescription || !title) return normalizedDescription;

  const sentences = normalizedDescription
    .split(/(?<=[.!?])\s+/u)
    .map((item) => normalizeText(item))
    .filter(Boolean);

  if (sentences.length <= 1) return normalizedDescription;
  if (!startsWithComparable(sentences[0], title)) return normalizedDescription;
  return normalizeText(sentences.slice(1).join(" "));
}

function resolveSummary(record, title = "") {
  const explicitSummary = stripRepeatedTitleFromSummary(
    record?.summary || record?.structuredSummary || "",
    title
  );
  if (explicitSummary && normalizeComparableText(explicitSummary) !== normalizeComparableText(title)) {
    return truncateText(explicitSummary, 240);
  }

  const fallbackDescription = stripLeadingSentenceMatchingTitle(record?.description || "", title);
  return truncateText(fallbackDescription || record?.description || "", 240);
}

function buildFallbackTitle(record, kind = "request", locale = "et") {
  const categoryLabel = resolveCategoryLabel(record, locale);
  const roleLabel = normalizeText(record?.roleLabel || "");
  const municipalityLabel = resolveMunicipalityLabel(record);
  const kindLabel = formatListingKindLabel(kind, locale);

  if (record?.title) return normalizeText(record.title);
  if (roleLabel && municipalityLabel) return `${roleLabel} - ${municipalityLabel}`;
  if (roleLabel) return roleLabel;
  if (categoryLabel && municipalityLabel) return `${categoryLabel} - ${municipalityLabel}`;
  if (categoryLabel) return `${kindLabel}: ${categoryLabel}`;
  return kindLabel;
}

export function toHelpListingView(record = {}, options = {}) {
  const locale = pickLocale(options?.locale);
  const kind = String(options?.kind || record?.kind || "request").trim().toLowerCase() === "offer" ? "offer" : "request";
  const title = buildFallbackTitle(record, kind, locale);
  const summary = resolveSummary(record, title);
  const categoryLabel = resolveCategoryLabel(record, locale);
  const municipalityLabel = resolveMunicipalityLabel(record);
  const helpTypeLabel = formatHelpTypeLabel(record?.helpType || record?.helpTypeLabel || "", locale);
  const timeTypeLabel = formatTimeTypeLabel(record?.timeType || record?.timeTypeLabel || "", locale);
  const roleLabel = normalizeText(record?.roleLabel || "");
  const statusLabel = formatListingStatusLabel(record?.status || record?.statusLabel || "", locale);
  const targetGroupLabels = resolveTargetGroupLabels(record, locale);

  return {
    id: String(record?.id || "").trim(),
    kind,
    title,
    summary,
    categoryLabel,
    municipalityLabel,
    helpTypeLabel,
    timeTypeLabel,
    roleLabel,
    statusLabel,
    targetGroupLabels,
    score: Number.isFinite(Number(record?.score)) ? Number(record.score) : null
  };
}

export function buildHelpListingMetaLine(listingView = {}, _locale = "et") {
  const labels = [];
  if (listingView.categoryLabel) labels.push(listingView.categoryLabel);
  if (listingView.helpTypeLabel) labels.push(listingView.helpTypeLabel);
  if (listingView.timeTypeLabel) labels.push(listingView.timeTypeLabel);
  if (listingView.roleLabel) labels.push(listingView.roleLabel);
  if (listingView.targetGroupLabels?.length) labels.push(listingView.targetGroupLabels.join(", "));
  return labels.join(" | ");
}

export function buildHelpListingCard(listingView = {}, options = {}) {
  const locale = pickLocale(options?.locale);
  const index = Number.isFinite(Number(options?.index)) ? Number(options.index) : null;
  const title = index != null ? `${index + 1}. ${listingView.title}` : listingView.title;
  const subtitleParts = [
    formatListingKindLabel(listingView.kind, locale),
    listingView.municipalityLabel
  ].filter(Boolean);
  const bodyLines = [
    listingView.summary,
    buildHelpListingMetaLine(listingView, locale)
  ].filter(Boolean);
  const metaParts = [listingView.statusLabel];
  if (listingView.score != null && Number.isFinite(Number(listingView.score))) {
    metaParts.push(
      locale === "en"
        ? `Match ${Number(listingView.score)}`
        : locale === "ru"
          ? `Sovpadenie ${Number(listingView.score)}`
          : `Sobivus ${Number(listingView.score)}`
    );
  }

  return {
    title,
    subtitle: subtitleParts.join(" | "),
    body: bodyLines.join("\n"),
    meta: metaParts.filter(Boolean).join(" | ")
  };
}

export function toHelpListingDetailView(record = {}, options = {}) {
  const listingView = toHelpListingView(record, options);
  return {
    ...listingView,
    description: normalizeText(record?.description || ""),
    structuredSummary: normalizeText(record?.structuredSummary || ""),
    rawPlace: normalizeText(record?.rawPlace || ""),
    municipalityId: String(record?.municipalityId || "").trim() || null,
    primaryCategoryId: String(record?.primaryCategoryId || "").trim() || null,
    primaryCategoryCode: normalizeText(record?.primaryCategory?.code || record?.primaryCategoryCode || ""),
    status: normalizeText(record?.status || ""),
    helpType: normalizeText(record?.helpType || ""),
    timeType: normalizeText(record?.timeType || ""),
    roleLabel: normalizeText(record?.roleLabel || ""),
    editableTitle: normalizeText(record?.title || ""),
    editableDescription: normalizeText(record?.description || ""),
    editableRawPlace: normalizeText(record?.rawPlace || ""),
    beneficiaryLabel: normalizeText(record?.beneficiaryLabel || ""),
    urgency: normalizeText(record?.urgency || ""),
    providerScopeOrConditions: normalizeText(record?.providerScopeOrConditions || ""),
    availabilityOrStart: normalizeText(record?.availabilityOrStart || ""),
    compensationDetails: normalizeText(record?.compensationDetails || ""),
    conditions: normalizeText(record?.conditions || ""),
    skillsOrBackground: normalizeText(record?.skillsOrBackground || ""),
    editableBeneficiaryLabel: normalizeText(record?.beneficiaryLabel || ""),
    editableUrgency: normalizeText(record?.urgency || ""),
    editableProviderScopeOrConditions: normalizeText(record?.providerScopeOrConditions || ""),
    editableAvailabilityOrStart: normalizeText(record?.availabilityOrStart || ""),
    editableCompensationDetails: normalizeText(record?.compensationDetails || ""),
    editableConditions: normalizeText(record?.conditions || ""),
    editableSkillsOrBackground: normalizeText(record?.skillsOrBackground || ""),
    targetGroupCodes: Array.from(
      new Set(
        [
          ...(Array.isArray(record?.targetGroupLinks) ? record.targetGroupLinks.map((item) => item?.targetGroup?.code) : []),
          ...(Array.isArray(record?.targetGroups) ? record.targetGroups.map((item) => item?.code) : [])
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      )
    )
  };
}
