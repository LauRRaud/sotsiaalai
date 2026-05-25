const MUNICIPALITY_ALIASES = Object.freeze([
  ["tartus", "Tartu"],
  ["tartu", "Tartu"],
  ["tallinnas", "Tallinn"],
  ["tallinn", "Tallinn"],
  ["parnus", "Parnu"],
  ["parnu", "Parnu"],
  ["narvas", "Narva"],
  ["narva", "Narva"]
]);

function cleanText(value, limit = 400) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function lowerText(value) {
  return cleanText(value, 12000).toLocaleLowerCase("et");
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : item?.title || item?.description || ""))
    .map((item) => cleanText(item, 240))
    .filter(Boolean);
}

function readStringFromContext(context = {}, keys = []) {
  if (!context || typeof context !== "object" || Array.isArray(context)) return "";
  for (const key of keys) {
    const value = cleanText(context[key], 160);
    if (value) return value;
  }
  return "";
}

function municipalityFromText(value) {
  const text = lowerText(value);
  for (const [alias, label] of MUNICIPALITY_ALIASES) {
    if (new RegExp(`\\b${alias}\\b`, "iu").test(text)) return label;
  }
  const match = text.match(/\b([a-z0-9õäöüšž-]{3,40}\s+(?:vald|linn))\b/iu);
  return match ? cleanText(match[1], 80) : "";
}

function inferRecipientType(journey = {}) {
  const text = lowerText([
    journey.primaryPath,
    journey.summary,
    ...normalizeList(journey.domains),
    ...normalizeList(journey.suggestedActions)
  ].join(" "));

  if (/teenuseosutaja|teenuse pakkuja|provider/u.test(text)) return "SERVICE_PROVIDER";
  if (/\bkov\b|omavalitsus|kohalik omavalitsus|sotsiaaltöötaja|sotsiaaltootaja/u.test(text)) return "KOV_CONTACT";
  return "";
}

function buildSuggestedMessageDraft({ topic, situation, missingInfoNotes }) {
  const lines = [
    "Tere",
    "",
    `Soovin pöörduda teemal: ${topic}.`,
    "",
    "Olukorra kirjeldus:",
    situation,
    "",
    missingInfoNotes ? `Täpsustamist vajav info:\n${missingInfoNotes}` : "",
    "",
    "Palun aidata välja selgitada, millised oleksid sobivad järgmised sammud.",
    "",
    "Lugupidamisega"
  ];

  return lines.filter((line, index, source) => line || source[index - 1] !== "").join("\n");
}

export function buildPreInquiryPrefillFromJourney(journey = {}) {
  const context = journey.context && typeof journey.context === "object" && !Array.isArray(journey.context)
    ? journey.context
    : {};
  const missingInfo = normalizeList(journey.missingInfo);
  const riskSignals = normalizeList(journey.riskSignals);
  const suggestedActions = normalizeList(journey.suggestedActions);
  const domains = normalizeList(journey.domains);
  const topic = cleanText(journey.title || journey.primaryPath || "Teekonna eelpöördumine", 160);
  const municipality = readStringFromContext(context, [
    "municipalityName",
    "municipality",
    "kov",
    "region"
  ]) || municipalityFromText([journey.title, journey.summary].join(" "));
  const situationParts = [
    cleanText(journey.summary, 3000),
    domains.length ? `Seotud teemad: ${domains.join(", ")}` : "",
    suggestedActions.length ? `Soovitatud järgmised sammud: ${suggestedActions.join("; ")}` : "",
    riskSignals.length ? `Ettevaatlikud tähelepanekud: ${riskSignals.join("; ")}` : ""
  ].filter(Boolean);
  const situation = situationParts.join("\n\n");
  const missingInfoNotes = missingInfo.map((item) => `- ${item}`).join("\n");

  return {
    sourceJourneyId: journey.id || "",
    topic,
    situation,
    municipality,
    personContext: readStringFromContext(context, ["personContext", "person", "subject"], 500),
    recipientType: inferRecipientType(journey),
    missingInfoNotes,
    suggestedMessageDraft: buildSuggestedMessageDraft({
      topic,
      situation,
      missingInfoNotes
    }),
    sourceNotice: "journey_pre_inquiry_handoff"
  };
}
