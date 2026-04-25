const HIGH_RISK_PATTERNS = [
  /\b(oigus|õigus|seadus|paragrahv|määrus|maarus|riigi\s*teataja|vaie|kaebus|otsus)\b/i,
  /\b(summa|määr|maar|euro|eur|tähtaeg|tahtaeg|kuupäev|kuupaev|kehtib|kehtiv|abikõlblik|abikolblik)\b/i,
  /\b(toimetulekutoetus|hooldajatoetus|puue|puudega|elatis|pension|hüvitis|huvitis)\b/i,
  /\b(kriis|vägivald|vagivald|enesetapp|tahan surra|oht|112)\b/i
];

const MEDIUM_RISK_PATTERNS = [
  /\b(kov|omavalitsus|vald|linn|teenus|toetus|taotlus|taotle|vorm|blankett|kontakt)\b/i,
  /\b(koduteenus|sotsiaaltransport|tugiisik|lapsehoid|hooldus|varjupaik|võlanõustamine|volanoustamine)\b/i,
  /\b(kuidas saada|kuidas taotleda|kuhu pöörduda|kuhu poorduda|kes aitab)\b/i
];

const LOW_RISK_PATTERNS = [
  /\b(mis on|selgita|mõiste|moiste|üldiselt|uldiselt|metoodika|taust|praktika)\b/i
];

const SOURCE_POLICY = {
  low: {
    requiredEvidence: "medium",
    preferredSourceTypes: ["journal_article", "methodology_guide", "practice_example", "state_guide"],
    insufficientEvidenceMode: false
  },
  medium: {
    requiredEvidence: "strong",
    preferredSourceTypes: [
      "kov_service_info",
      "application_form",
      "web_form",
      "pdf_form",
      "official_contact",
      "contact_page",
      "state_guide"
    ],
    insufficientEvidenceMode: true
  },
  high: {
    requiredEvidence: "strong",
    preferredSourceTypes: [
      "national_law",
      "kov_regulation",
      "state_guide",
      "kov_service_info",
      "application_form",
      "official_contact"
    ],
    insufficientEvidenceMode: true
  }
};

const EVIDENCE_ORDER = {
  insufficient: 0,
  weak: 1,
  medium: 2,
  strong: 3
};

const OFFICIAL_STRONG_SOURCE_TYPES = new Set([
  "national_law",
  "kov_regulation",
  "state_guide",
  "kov_service_info",
  "official_form",
  "application_form",
  "web_form",
  "pdf_form",
  "official_contact",
  "contact_page"
]);

const BACKGROUND_SOURCE_TYPES = new Set([
  "journal_article",
  "practice_example",
  "project_description",
  "personal_story",
  "opinion",
  "historical_source",
  "methodology_guide",
  "quality_guideline",
  "service_standard",
  "template",
  "faq",
  "partner_service_info"
]);

function matchingReasons(message, patterns) {
  return patterns
    .map(pattern => pattern.exec(message)?.[0])
    .filter(Boolean)
    .map(value => String(value).toLowerCase());
}

export function classifyRagRisk(message = "", options = {}) {
  const text = String(message || "").trim();
  const highReasons = matchingReasons(text, HIGH_RISK_PATTERNS);
  const mediumReasons = matchingReasons(text, MEDIUM_RISK_PATTERNS);
  const lowReasons = matchingReasons(text, LOW_RISK_PATTERNS);

  let riskLevel = "low";
  let reasons = lowReasons.length ? lowReasons : ["general_explanation"];

  if (options?.isCrisis || highReasons.length) {
    riskLevel = "high";
    reasons = options?.isCrisis ? ["crisis", ...highReasons] : highReasons;
  } else if (mediumReasons.length) {
    riskLevel = "medium";
    reasons = mediumReasons;
  }

  const policy = SOURCE_POLICY[riskLevel] || SOURCE_POLICY.low;
  return {
    riskLevel,
    reasons: [...new Set(reasons)].slice(0, 6),
    requiredEvidence: policy.requiredEvidence,
    preferredSourceTypes: policy.preferredSourceTypes,
    insufficientEvidenceMode: policy.insufficientEvidenceMode
  };
}

export function buildRiskPolicyInstruction(policy, replyLang = "et") {
  if (!policy || policy.riskLevel === "low") return "";
  const sourceTypes = Array.isArray(policy.preferredSourceTypes) ? policy.preferredSourceTypes.join(", ") : "";
  if (replyLang === "en") {
    return [
      `RAG_RISK_POLICY: ${policy.riskLevel}.`,
      `Required evidence: ${policy.requiredEvidence}.`,
      sourceTypes ? `Prefer these source types: ${sourceTypes}.` : "",
      "For rights, benefits, amounts, deadlines, forms, contacts, eligibility or validity, state a firm fact only when RAG_CONTEXT directly supports it.",
      "If the visible context does not confirm the claim, say what is confirmed, what is not confirmed, and where it should be checked."
    ].filter(Boolean).join(" ");
  }
  if (replyLang === "ru") {
    return [
      `RAG_RISK_POLICY: ${policy.riskLevel}.`,
      `Требуемая доказательность: ${policy.requiredEvidence}.`,
      sourceTypes ? `Предпочитай эти типы источников: ${sourceTypes}.` : "",
      "По правам, пособиям, суммам, срокам, формам, контактам, праву на помощь и действительности информации утверждай факт только при прямом подтверждении в RAG_CONTEXT.",
      "Если контекст не подтверждает утверждение, скажи, что подтверждено, что не подтверждено и где это нужно проверить."
    ].filter(Boolean).join(" ");
  }
  return [
    `RAG_RISK_POLICY: ${policy.riskLevel}.`,
    `Nõutav tõendusaste: ${policy.requiredEvidence}.`,
    sourceTypes ? `Eelista neid allikatüüpe: ${sourceTypes}.` : "",
    "Õiguse, toetuse, summa, tähtaja, vormi, kontakti, abikõlblikkuse või kehtivuse kohta esita kindel fakt ainult siis, kui RAG_CONTEXT seda otseselt kinnitab.",
    "Kui nähtav kontekst väidet ei kinnita, ütle, mida allikad kinnitavad, mida nad ei kinnita ja kust info üle kontrollida."
  ].filter(Boolean).join(" ");
}

function readSourceType(source = {}) {
  return String(source?.source_type || source?.sourceType || source?.type || "").trim();
}

function readSourceStatus(source = {}) {
  return String(source?.source_status || source?.sourceStatus || source?.content_status || source?.contentStatus || "").trim().toLowerCase();
}

export function inferSourceEvidenceStrength(source = {}, policy = null) {
  const riskLevel = policy?.riskLevel || "low";
  const sourceType = readSourceType(source);
  const status = readSourceStatus(source);
  const historical = source?.historical === true || String(source?.historical || "").toLowerCase() === "true";

  if (status === "inactive" || status === "archived") {
    return {
      strength: "insufficient",
      reason: "inactive_or_archived_source"
    };
  }
  if ((riskLevel === "medium" || riskLevel === "high") && historical) {
    return {
      strength: "insufficient",
      reason: "historical_source_not_current_evidence"
    };
  }
  if (status === "stale") {
    return {
      strength: riskLevel === "low" ? "medium" : "weak",
      reason: "stale_source"
    };
  }
  if (OFFICIAL_STRONG_SOURCE_TYPES.has(sourceType)) {
    return {
      strength: "strong",
      reason: "official_source_type"
    };
  }
  if (BACKGROUND_SOURCE_TYPES.has(sourceType)) {
    return {
      strength: riskLevel === "low" ? "medium" : "weak",
      reason: "background_source_type"
    };
  }
  if (!sourceType) {
    return {
      strength: riskLevel === "low" ? "medium" : "weak",
      reason: "missing_source_type"
    };
  }
  return {
    strength: "weak",
    reason: "unrecognized_source_type"
  };
}

export function sourceMeetsEvidenceRequirement(source = {}, policy = null) {
  if (!policy || !policy.requiredEvidence) {
    return {
      ok: true,
      ...inferSourceEvidenceStrength(source, policy)
    };
  }
  const evidence = inferSourceEvidenceStrength(source, policy);
  const required = policy.requiredEvidence || "medium";
  const ok = (EVIDENCE_ORDER[evidence.strength] || 0) >= (EVIDENCE_ORDER[required] || 0);
  return {
    ok,
    requiredEvidence: required,
    ...evidence
  };
}
