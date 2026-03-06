import prisma from "../prisma.js";
import { createHelpMatch, listMatchingOffersForRequest, listMatchingRequestsForOffer } from "./matches.js";
import { detectHelpChatIntent } from "./intents.js";
import {
  extractPlaceFromText,
  municipalityGuessNeedsConfirmation,
  normalizePlaceToMunicipality
} from "./locationNormalization.js";
import {
  buildHelpListingCard,
  buildHelpListingMetaLine,
  formatHelpTypeLabel,
  formatTimeTypeLabel,
  toHelpListingView
} from "./listingViews.js";
import { createHelpOffer } from "./offers.js";
import { createHelpRequest } from "./requests.js";
import { createHelpWorkflowDraftState, isActiveHelpWorkflowState, normalizeHelpWorkflowState } from "./workflowState.js";

function pickText(replyLang, variants) {
  if (replyLang === "ru" && variants?.ru) return variants.ru;
  if (replyLang === "en" && variants?.en) return variants.en;
  return variants?.et || variants?.en || variants?.ru || "";
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

function formatLabelledLine(label, value) {
  return `${label}: ${value || "-"}`;
}

function isAffirmative(text = "") {
  const normalized = normalizeText(text);
  return /^(jah|jaa|yes|ok|okay|kinnitan|confirm|salvesta|save|sobib)\b/.test(normalized);
}

function isCancel(text = "") {
  return /\b(katkesta|lopeta|lõpeta|cancel|abort|ara salvesta|ära salvesta)\b/.test(normalizeText(text));
}

function isEditSignal(text = "") {
  return /\b(muuda|muudan|edit|change|paranda|tegelikult|pigem)\b/.test(normalizeText(text));
}

function isNegative(text = "") {
  const normalized = normalizeText(text);
  return /^(ei|no|not really)\b/.test(normalized) && normalized.split(/\s+/).length <= 3;
}

function shortDescription(text = "", max = 220) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}...`;
}

function formatMunicipalityCandidateList(candidates = []) {
  return candidates
    .map((candidate, index) => `${index + 1}. ${candidate.displayName}${candidate.county ? ` (${candidate.county})` : ""}`)
    .join("\n");
}

function parseOrdinalSelection(text = "", max = 0) {
  const normalized = normalizeText(text);
  const numericMatch = normalized.match(/\b([1-9]|10)\b/);
  if (numericMatch) {
    const index = Number(numericMatch[1]) - 1;
    if (index >= 0 && index < max) return index;
  }
  if (/\b(esimene|first)\b/.test(normalized)) return max > 0 ? 0 : null;
  if (/\b(teine|second)\b/.test(normalized)) return max > 1 ? 1 : null;
  if (/\b(kolmas|third)\b/.test(normalized)) return max > 2 ? 2 : null;
  return null;
}

function buildIntentTitle(intent) {
  if (intent === "create_help_offer") return "Abipakkumine";
  return "Abipalve";
}

function deriveHelpTypeEnum(description = "") {
  const normalized = normalizeText(description);
  const mentionsVoluntary = /\b(vabatahtlik|tasuta|volunteer|voluntary)\b/.test(normalized);
  const mentionsPaid = /\b(tasuline|paid|tasu eest)\b/.test(normalized);

  if (mentionsVoluntary && mentionsPaid) return "MIXED";
  if (mentionsPaid) return "PAID";
  if (mentionsVoluntary) return "VOLUNTARY";
  return "";
}

function deriveTimeTypeEnum(description = "") {
  const normalized = normalizeText(description);
  if (/\b(paar korda nadalas|paar korda nädalas|iga nadal|iga paev|igapaev|iga päev|weekly|daily|recurring|regular)\b/.test(normalized)) {
    return "RECURRING";
  }
  if (/\b(ukskord|üks kord|one time|one-off|uhekordne|ühekordne)\b/.test(normalized)) {
    return "ONE_TIME";
  }
  if (/\b(paindlik|ajutine|temporary|flexible|vastavalt vajadusele|as needed)\b/.test(normalized)) {
    return "FLEXIBLE";
  }
  return "";
}

function deriveDraftFields(description = "", intent = "create_help_request") {
  const normalized = normalizeText(description);
  let category = "";
  let categoryCode = "";
  let serviceLabel = "";
  let helpType = deriveHelpTypeEnum(description);
  let timeType = deriveTimeTypeEnum(description);
  let targetGroup = "";

  if (/\b(transport|soit|sõit|viia|autoga)\b/.test(normalized)) {
    category = "Transport";
    categoryCode = "TRANSPORT";
    serviceLabel = "Transpordiabi";
  } else if (/\b(pood|poes|ostud|toidupood|shop)\b/.test(normalized)) {
    category = "Igapaevaabi";
    categoryCode = "DAILY_TASKS";
    serviceLabel = "Poeabi";
  } else if (/\b(isiklik abistaja|abistaja|care assistant)\b/.test(normalized)) {
    category = "Tugi ja hooldus";
    categoryCode = "CARE_SUPPORT";
    serviceLabel = "Isikliku abistaja abi";
  } else if (/\b(koduabi|kodus|korist|majapid)\b/.test(normalized)) {
    category = "Koduabi";
    categoryCode = "HOME_HELP";
    serviceLabel = "Koduabi";
  } else if (/\b(selts|kaasa|saatm|compan)\b/.test(normalized)) {
    category = "Seltskond ja sotsiaalne tugi";
    categoryCode = "SOCIAL_SUPPORT";
    serviceLabel = "Saatmis- voi seltsimisabi";
  } else if (/\b(vorm|avald|dokum|asjaaj|admin|form)\b/.test(normalized)) {
    category = "Asjaajamise ja vormide abi";
    categoryCode = "ADMIN_FORM_HELP";
    serviceLabel = "Dokumentide ja vormide abi";
  } else if (/\b(digi|telefon|arvuti|internet|e-teenus|computer)\b/.test(normalized)) {
    category = "Digiabi";
    categoryCode = "DIGITAL_HELP";
    serviceLabel = "Digiabi";
  }

  if (/\b(emale|emalele|isale|vanaemale|vanaisale|eakale|senior)\b/.test(normalized)) {
    targetGroup = "Eakas inimene";
  } else if (/\b(lapsele|lastele|noorele|young person|child)\b/.test(normalized)) {
    targetGroup = "Laps / noor";
  } else if (/\b(puudega|erivajadusega|disabled)\b/.test(normalized)) {
    targetGroup = "Erivajadusega inimene";
  }

  const title = serviceLabel || buildIntentTitle(intent);
  return {
    title,
    category,
    categoryCode,
    serviceLabel,
    helpType,
    timeType,
    targetGroup
  };
}

function cleanInitialDescription(text = "") {
  return String(text || "")
    .replace(/^[\s,.-]*(aita mul\s+vormistada|soovin\s+pakkuda|mul oleks vaja|vajan|otsin)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldAppendDescription(text = "", currentState = null) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (isAffirmative(text) || isCancel(text)) return false;
  if (currentState?.municipalityCandidates?.length && (normalized.length <= 40 || /^\d+$/.test(normalized))) return false;
  if (/\b(tallinn(as)?|tartu(s)?|narva(s)?|parnu(s)?|pärnu(s)?|viljandi(s)?|valga(s)?|keila(s)?)\b/.test(normalized) && normalized.length <= 24) {
    return false;
  }
  return normalized.length >= 6;
}

function buildSummary(state, replyLang) {
  const municipality = state.municipalityLabel || "-";
  const typeLabel = state.intent === "create_help_offer"
    ? pickText(replyLang, { et: "Abipakkumine", en: "Help offer", ru: "Predlozhenie pomoshchi" })
    : pickText(replyLang, { et: "Abipalve", en: "Help request", ru: "Zapros na pomoshch" });

  return [
    pickText(replyLang, {
      et: "Palun kinnita enne salvestamist:",
      en: "Please confirm before saving:",
      ru: "Podtverdite pered sokhraneniem:"
    }),
    "",
    formatLabelledLine(pickText(replyLang, { et: "Tyyp", en: "Type", ru: "Tip" }), typeLabel),
    formatLabelledLine(pickText(replyLang, { et: "Kirjeldus", en: "Description", ru: "Opisanie" }), state.draft.description || "-"),
    formatLabelledLine(pickText(replyLang, { et: "Kategooria", en: "Category", ru: "Kategoriya" }), state.draft.category || "-"),
    formatLabelledLine(pickText(replyLang, { et: "Teenuse silt", en: "Service label", ru: "Yarlyk uslugi" }), state.draft.serviceLabel || "-"),
    formatLabelledLine(pickText(replyLang, { et: "Abi liik", en: "Help type", ru: "Tip pomoshchi" }), formatHelpTypeLabel(state.draft.helpType, replyLang) || "-"),
    formatLabelledLine(pickText(replyLang, { et: "Ajalisus", en: "Time type", ru: "Format vremeni" }), formatTimeTypeLabel(state.draft.timeType, replyLang) || "-"),
    formatLabelledLine(pickText(replyLang, { et: "Sihtruhm", en: "Target group", ru: "Tselevaya gruppa" }), state.draft.targetGroup || "-"),
    formatLabelledLine(pickText(replyLang, { et: "Omavalitsus", en: "Municipality", ru: "Munitsipalitet" }), municipality),
    "",
    pickText(replyLang, {
      et: "Kui sobib, vasta \"jah\" voi \"salvesta\". Kui midagi muuta, kirjuta muudatus otse siia.",
      en: "If this looks right, reply with \"yes\" or \"save\". If something should change, just write the change here.",
      ru: "Esli vse podkhodit, otvette \"da\" ili \"save\". Esli nuzhno izmenit, napishite izmenenie syuda."
    })
  ].join("\n");
}

function buildSavedReply(state, record, replyLang) {
  const listingView = toHelpListingView(record, {
    kind: state.intent === "create_help_offer" ? "offer" : "request",
    locale: replyLang
  });
  const metaLine = buildHelpListingMetaLine(listingView, replyLang);

  return [
    pickText(replyLang, {
      et: "Kuulutus on salvestatud.",
      en: "The listing has been saved.",
      ru: "Obyavlenie sokhraneno."
    }),
    "",
    listingView.title,
    listingView.summary || record.description || state.draft.description || "-",
    metaLine || "",
    listingView.municipalityLabel
      ? formatLabelledLine(pickText(replyLang, { et: "Omavalitsus", en: "Municipality", ru: "Munitsipalitet" }), listingView.municipalityLabel)
      : "",
    listingView.statusLabel
      ? formatLabelledLine(pickText(replyLang, { et: "Staatus", en: "Status", ru: "Status" }), listingView.statusLabel)
      : "",
    "",
    pickText(replyLang, {
      et: state.intent === "create_help_offer"
        ? "Jargmisena voite kirjutada: \"naita sobivaid abipalveid\"."
        : "Jargmisena voite kirjutada: \"naita sobivaid pakkumisi\".",
      en: state.intent === "create_help_offer"
        ? "Next you can write: \"show matching requests\"."
        : "Next you can write: \"show matching offers\".",
      ru: state.intent === "create_help_offer"
        ? "Dalshe mozhno napisat: \"pokazhi podkhodyashchie zaprosy\"."
        : "Dalshe mozhno napisat: \"pokazhi podkhodyashchie predlozheniya\"."
    })
  ].filter(Boolean).join("\n");
}

function buildBrowseReply(intent, results, replyLang) {
  if (!results.length) {
    return pickText(replyLang, {
      et: intent === "browse_help_offers"
        ? "Sobivaid aktiivseid abipakkumisi veel ei leitud."
        : "Sobivaid aktiivseid abipalveid veel ei leitud.",
      en: intent === "browse_help_offers"
        ? "No active matching help offers found yet."
        : "No active matching help requests found yet.",
      ru: intent === "browse_help_offers"
        ? "Pokha ne naydeno podkhodyashchikh aktivnykh predlozheniy."
        : "Pokha ne naydeno podkhodyashchikh aktivnykh zaprosov."
    });
  }

  return [
    pickText(replyLang, {
      et: intent === "browse_help_offers"
        ? `Leidsin ${results.length} voimalikku pakkumist.`
        : `Leidsin ${results.length} voimalikku abipalvet.`,
      en: intent === "browse_help_offers"
        ? `I found ${results.length} possible offers.`
        : `I found ${results.length} possible requests.`,
      ru: intent === "browse_help_offers"
        ? `Naydeno ${results.length} vozmozhnykh predlozheniy.`
        : `Naydeno ${results.length} vozmozhnykh zaprosov.`
    }),
    "",
    pickText(replyLang, {
      et: intent === "browse_help_offers"
        ? "Kui soovite kedagi uhendada, kirjutage naiteks: \"uhenda esimese pakkumisega\"."
        : "Kui soovite kedagi uhendada, kirjutage naiteks: \"uhenda esimese abipalvega\".",
      en: intent === "browse_help_offers"
        ? "If you want to connect, write for example: \"connect to the first offer\"."
        : "If you want to connect, write for example: \"connect to the first request\".",
      ru: intent === "browse_help_offers"
        ? "Esli hotite soedinit, napishite naprimer: \"svyazhi s pervym predlozheniem\"."
        : "Esli hotite soedinit, napishite naprimer: \"svyazhi s pervym zaprosom\"."
    })
  ].join("\n");
}

function _buildBrowseCards(results = [], replyLang) {
  return results.map((item, index) => ({
    title: `${index + 1}. ${item.title}`,
    subtitle: `${item.kind === "offer"
      ? pickText(replyLang, { et: "Abipakkumine", en: "Help offer", ru: "Predlozhenie pomoshchi" })
      : pickText(replyLang, { et: "Abipalve", en: "Help request", ru: "Zapros na pomoshch" })}${item.municipalityName ? ` • ${item.municipalityName}` : ""}`,
    body: shortDescription(item.description),
    meta: item.score > 0
      ? `${pickText(replyLang, { et: "Sobivus", en: "Match", ru: "Sovpadenie" })}: ${item.score}`
      : "",
    hint: item.kind === "offer"
      ? pickText(replyLang, { et: `Kirjuta: "uhenda ${index + 1}. pakkumisega"`, en: `Write: "connect to offer ${index + 1}"`, ru: `Napishite: "svyazhi s predlozheniem ${index + 1}"` })
      : pickText(replyLang, { et: `Kirjuta: "uhenda ${index + 1}. abipalvega"`, en: `Write: "connect to request ${index + 1}"`, ru: `Napishite: "svyazhi s zaprosom ${index + 1}"` })
  }));
}

function buildListingBrowseCards(results = [], replyLang) {
  return results.map((item, index) => {
    const listingView = item?.listingView || toHelpListingView(item, { kind: item.kind, locale: replyLang });
    const card = buildHelpListingCard(listingView, { index, locale: replyLang });
    return {
      ...card,
      hint: item.kind === "offer"
        ? pickText(replyLang, { et: `Kirjuta: "uhenda ${index + 1}. pakkumisega"`, en: `Write: "connect to offer ${index + 1}"`, ru: `Napishite: "svyazhi s predlozheniem ${index + 1}"` })
        : pickText(replyLang, { et: `Kirjuta: "uhenda ${index + 1}. abipalvega"`, en: `Write: "connect to request ${index + 1}"`, ru: `Napishite: "svyazhi s zaprosom ${index + 1}"` })
    };
  });
}

function computeMissingFields(state) {
  const missing = [];
  if (!state.municipalityId) missing.push("municipalityId");
  if (String(state?.draft?.description || "").trim().length < 16) missing.push("description");
  return missing;
}

async function readHelpWorkflowState(convId, userId, prismaClient = prisma) {
  const conversationId = String(convId || "").trim();
  const ownerId = String(userId || "").trim();
  if (!conversationId || !ownerId) return null;

  const conversation = await prismaClient.conversation.findUnique({
    where: { id: conversationId },
    select: {
      userId: true
    }
  });
  if (!conversation || conversation.userId !== ownerId) return null;

  const assistantMessages = await prismaClient.conversationMessage.findMany({
    where: {
      conversationId,
      role: "ASSISTANT"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 12,
    select: {
      metadata: true
    }
  });

  for (const message of assistantMessages) {
    const nextState = normalizeHelpWorkflowState(message?.metadata?.workflow?.help || message?.metadata?.helpWorkflow || null);
    if (nextState) return nextState;
  }

  return null;
}

function buildWorkflowMetadata(state) {
  return {
    workflow: {
      help: state || null
    }
  };
}

async function resolveMunicipalityUpdate(message, state, prismaClient = prisma) {
  if (state?.municipalityCandidates?.length) {
    if (state.municipalityCandidates.length === 1 && isNegative(message)) {
      return {
        municipalityId: null,
        municipalityLabel: "",
        municipalityCandidates: [],
        rawPlace: ""
      };
    }

    if (state.municipalityCandidates.length === 1 && isAffirmative(message)) {
      const selected = state.municipalityCandidates[0];
      return {
        municipalityId: selected.id,
        municipalityLabel: selected.displayName,
        municipalityCandidates: [],
        rawPlace: state?.draft?.rawPlace || selected.displayName
      };
    }

    const selectionIndex = parseOrdinalSelection(message, state.municipalityCandidates.length);
    if (selectionIndex != null) {
      const selected = state.municipalityCandidates[selectionIndex];
      return {
        municipalityId: selected.id,
        municipalityLabel: selected.displayName,
        municipalityCandidates: [],
        rawPlace: state?.draft?.rawPlace || selected.displayName
      };
    }

    const normalizedMessage = normalizeText(message);
    const byName = state.municipalityCandidates.find((candidate) => normalizeText(candidate.displayName) === normalizedMessage);
    if (byName) {
      return {
        municipalityId: byName.id,
        municipalityLabel: byName.displayName,
        municipalityCandidates: [],
        rawPlace: state?.draft?.rawPlace || byName.displayName
      };
    }
  }

  const normalizedPlace = await normalizePlaceToMunicipality({
    rawPlace: state?.draft?.rawPlace,
    message
  }, {}, prismaClient);
  if (!normalizedPlace?.rawPlace && !normalizedPlace?.municipalityId && !normalizedPlace?.candidates?.length) {
    return null;
  }

  if (normalizedPlace.municipalityId && !municipalityGuessNeedsConfirmation(normalizedPlace)) {
    return {
      municipalityId: normalizedPlace.municipalityId,
      municipalityLabel: normalizedPlace.municipalityDisplayName || normalizedPlace.municipality?.displayName || "",
      municipalityCandidates: [],
      rawPlace: normalizedPlace.rawPlace || ""
    };
  }
  if (municipalityGuessNeedsConfirmation(normalizedPlace)) {
    return {
      municipalityId: null,
      municipalityLabel: "",
      municipalityCandidates: (normalizedPlace.candidates || []).map((item) => ({
        id: item.id,
        displayName: item.displayName,
        county: item.county,
        type: item.type
      })),
      rawPlace: normalizedPlace.rawPlace || ""
    };
  }
  return null;
}

async function mergeDraftState(state, message, prismaClient = prisma) {
  const municipalityUpdate = await resolveMunicipalityUpdate(message, state, prismaClient);
  let description = String(state?.draft?.description || "").trim();
  if (!description) {
    description = cleanInitialDescription(message);
  } else if (shouldAppendDescription(message, state)) {
    const addition = cleanInitialDescription(message);
    if (addition && !description.includes(addition)) {
      description = `${description}\n${addition}`.trim();
    }
  }

  const derived = deriveDraftFields(description, state.intent);
  return createHelpWorkflowDraftState({
    ...state,
    step: municipalityUpdate?.municipalityId ? "collect_details" : state.step,
    municipalityId: municipalityUpdate?.municipalityId ?? state.municipalityId,
    municipalityLabel: municipalityUpdate?.municipalityLabel ?? state.municipalityLabel,
    municipalityCandidates: municipalityUpdate?.municipalityCandidates ?? state.municipalityCandidates,
    confirmationPending: false,
    draft: {
      ...state.draft,
      description,
      title: derived.title || state.draft.title,
      category: derived.category,
      categoryCode: derived.categoryCode || state.draft.categoryCode,
      serviceLabel: derived.serviceLabel,
      helpType: derived.helpType,
      timeType: derived.timeType,
      targetGroup: derived.targetGroup,
      rawPlace: municipalityUpdate?.rawPlace ?? state.draft.rawPlace ?? extractPlaceFromText(message) ?? ""
    }
  });
}

async function saveStructuredRecord(state, userId, prismaClient = prisma) {
  if (state.intent === "create_help_offer") {
    return createHelpOffer({
      userId,
      municipalityId: state.municipalityId,
      primaryCategoryCode: state.draft.categoryCode || undefined,
      category: state.draft.category,
      serviceLabel: state.draft.serviceLabel,
      title: state.draft.title || buildIntentTitle(state.intent),
      description: state.draft.description,
      roleLabel: state.draft.serviceLabel,
      helpType: state.draft.helpType || undefined,
      timeType: state.draft.timeType,
      targetGroup: state.draft.targetGroup || undefined,
      rawPlace: state.draft.rawPlace || undefined,
      userConfirmedAt: new Date().toISOString()
    }, prismaClient);
  }

  return createHelpRequest({
    userId,
    municipalityId: state.municipalityId,
    primaryCategoryCode: state.draft.categoryCode || undefined,
    category: state.draft.category,
    serviceLabel: state.draft.serviceLabel,
    title: state.draft.title || buildIntentTitle(state.intent),
    description: state.draft.description,
    roleLabel: state.draft.serviceLabel,
    helpType: state.draft.helpType || undefined,
    timeType: state.draft.timeType,
    targetGroup: state.draft.targetGroup || undefined,
    rawPlace: state.draft.rawPlace || undefined,
    userConfirmedAt: new Date().toISOString()
  }, prismaClient);
}

function buildMissingFieldReply(state, replyLang) {
  if (state.municipalityCandidates?.length) {
    if (state.municipalityCandidates.length === 1) {
      const candidate = state.municipalityCandidates[0];
      return [
        pickText(replyLang, {
          et: `Kas motlesite omavalitsusena ${candidate.displayName}?`,
          en: `Did you mean ${candidate.displayName} as the municipality?`,
          ru: `Vy imali v vidu ${candidate.displayName} kak munitsipalitet?`
        }),
        state.draft.rawPlace
          ? formatLabelledLine(pickText(replyLang, { et: "Tuvastatud koht", en: "Detected place", ru: "Raspoznannoe mesto" }), state.draft.rawPlace)
          : "",
        pickText(replyLang, {
          et: "Vastake \"jah\" voi kirjutage oige omavalitsus / koht uuesti.",
          en: "Reply \"yes\" or write the correct municipality / place again.",
          ru: "Otvette \"da\" ili napishite pravilnyy munitsipalitet / mesto zanovo."
        })
      ].filter(Boolean).join("\n");
    }

    return [
      pickText(replyLang, {
        et: "Leidsin mitu voimalikku omavalitsust. Millist neist motlesite?",
        en: "I found several possible municipalities. Which one did you mean?",
        ru: "Ya nashel neskolko vozmozhnykh munitsipalitetov. Kakov imenno nuzhen?"
      }),
      "",
      formatMunicipalityCandidateList(state.municipalityCandidates),
      "",
      pickText(replyLang, {
        et: "Vastake nime voi numbriga.",
        en: "Reply with the name or the number.",
        ru: "Otvette nazvaniem ili nomerom."
      })
    ].join("\n");
  }

  if (state.missingFields.includes("municipalityId")) {
    return pickText(replyLang, {
      et: state.intent === "create_help_offer"
        ? "Mis omavalitsuses soovite abi pakkuda? Voite kirjutada ka vaiksema koha, naiteks Tabasalu voi Oismae."
        : "Mis omavalitsuses seda abi vaja on? Voite kirjutada ka vaiksema koha, naiteks Tabasalu voi Oismae.",
      en: state.intent === "create_help_offer"
        ? "In which municipality do you want to offer help? You can also name a smaller place, for example Tabasalu."
        : "In which municipality is this help needed? You can also name a smaller place, for example Tabasalu.",
      ru: state.intent === "create_help_offer"
        ? "V kakom munitsipalitete vy khotite predlagat pomoshch? Mozhno ukazat i men'shee mesto, naprimer Tabasalu."
        : "V kakom munitsipalitete nuzhna eta pomoshch? Mozhno ukazat i men'shee mesto, naprimer Tabasalu."
    });
  }

  return pickText(replyLang, {
    et: state.intent === "create_help_offer"
      ? "Kirjeldage palun lyhidalt, millist abi soovite pakkuda."
      : "Kirjeldage palun lyhidalt, millist abi on vaja.",
    en: state.intent === "create_help_offer"
      ? "Please describe briefly what kind of help you want to offer."
      : "Please describe briefly what kind of help is needed.",
    ru: state.intent === "create_help_offer"
      ? "Korotko opishite, kakuyu pomoshch vy khotite predlozhit."
      : "Korotko opishite, kakaya pomoshch nuzhna."
  });
}

function resolveBrowseSelection(message, browseResults = []) {
  if (!browseResults.length) return null;
  if (browseResults.length === 1) return browseResults[0];

  const selectionIndex = parseOrdinalSelection(message, browseResults.length);
  if (selectionIndex != null) {
    return browseResults[selectionIndex] || null;
  }

  return null;
}

async function handleCreateTurn({ state, message, userId, replyLang, prismaClient }) {
  if (isCancel(message)) {
    return {
      handled: true,
      workflowState: null,
      reply: pickText(replyLang, {
        et: "Selge, peatasingi selle abi-workflow.",
        en: "Understood, I stopped the help workflow.",
        ru: "Ponimayu, ya ostanovil etot workflow pomoshchi."
      }),
      cards: [],
      attachments: []
    };
  }

  if (state.confirmationPending && isAffirmative(message)) {
    const record = await saveStructuredRecord(state, userId, prismaClient);
    const listingView = toHelpListingView(record, {
      kind: state.intent === "create_help_offer" ? "offer" : "request",
      locale: replyLang
    });
    const nextState = createHelpWorkflowDraftState({
      ...state,
      mode: "saved",
      step: "done",
      confirmationPending: false,
      municipalityId: record.municipalityId,
      municipalityLabel: record?.municipality?.displayName || state.municipalityLabel,
      linkedRequestId: state.intent === "create_help_request" ? record.id : state.linkedRequestId,
      linkedOfferId: state.intent === "create_help_offer" ? record.id : state.linkedOfferId,
      sourceRecordId: record.id,
      missingFields: []
    });
    return {
      handled: true,
      workflowState: nextState,
      reply: buildSavedReply(nextState, record, replyLang),
      cards: [buildHelpListingCard(listingView, { locale: replyLang })],
      attachments: []
    };
  }

  let nextState = state;
  if (!state.confirmationPending || isEditSignal(message) || !isAffirmative(message)) {
    nextState = await mergeDraftState(state, message, prismaClient);
  }
  nextState = createHelpWorkflowDraftState({
    ...nextState,
    mode: "draft",
    missingFields: computeMissingFields(nextState)
  });

  if (nextState.missingFields.length) {
    return {
      handled: true,
      workflowState: nextState,
      reply: buildMissingFieldReply(nextState, replyLang),
      cards: [],
      attachments: []
    };
  }

  const confirmState = createHelpWorkflowDraftState({
    ...nextState,
    step: "confirm",
    confirmationPending: true,
    missingFields: []
  });

  return {
    handled: true,
    workflowState: confirmState,
    reply: buildSummary(confirmState, replyLang),
    cards: [],
    attachments: []
  };
}

async function handleBrowseTurn({ state, replyLang, prismaClient }) {
  const intent = state.intent === "create_help_offer" || state.intent === "browse_help_requests"
    ? "browse_help_requests"
    : "browse_help_offers";
  const sourceId = intent === "browse_help_offers" ? state.linkedRequestId || state.sourceRecordId : state.linkedOfferId || state.sourceRecordId;

  if (!sourceId) {
    return {
      handled: true,
      workflowState: state,
      reply: pickText(replyLang, {
        et: intent === "browse_help_offers"
          ? "Enne pean teadma, millise abipalve jaoks pakkumisi vaadata."
          : "Enne pean teadma, millise abipakkumise jaoks abipalveid vaadata.",
        en: intent === "browse_help_offers"
          ? "First I need to know which request to browse offers for."
          : "First I need to know which offer to browse requests for.",
        ru: intent === "browse_help_offers"
          ? "Snachala mne nuzhno znat, dlya kakogo zaprosa smotret predlozheniya."
          : "Snachala mne nuzhno znat, dlya kakogo predlozheniya smotret zaprosy."
      }),
      cards: [],
      attachments: []
    };
  }

  const rawResults = intent === "browse_help_offers"
    ? await listMatchingOffersForRequest(sourceId, { limit: 5 }, prismaClient)
    : await listMatchingRequestsForOffer(sourceId, { limit: 5 }, prismaClient);
  const results = rawResults.map((item) => ({
    ...item,
    listingView: toHelpListingView(item, { kind: item.kind, locale: replyLang })
  }));

  const nextState = createHelpWorkflowDraftState({
    ...state,
    mode: "browse",
    step: "browse",
    intent,
    sourceRecordId: sourceId,
    browseResults: results,
    confirmationPending: false
  });

  return {
      handled: true,
      workflowState: nextState,
      reply: buildBrowseReply(intent, results, replyLang),
      cards: buildListingBrowseCards(results, replyLang),
      attachments: []
    };
  }

async function handleConnectTurn({ state, message, replyLang, prismaClient }) {
  if (!state.browseResults?.length) {
    return {
      handled: true,
      workflowState: state,
      reply: pickText(replyLang, {
        et: "Enne uhendamist pean koigepealt naitama sobivaid tulemusi.",
        en: "Before connecting, I need to show matching results first.",
        ru: "Pered soedineniem mne nuzhno snachala pokazat podkhodyashchie rezultaty."
      }),
      cards: [],
      attachments: []
    };
  }

  const selected = resolveBrowseSelection(message, state.browseResults);
  if (!selected) {
    return {
      handled: true,
      workflowState: state,
      reply: pickText(replyLang, {
        et: "Kirjutage palun, millise tulemusega soovite uhendada, naiteks \"uhenda 1\".",
        en: "Please tell me which result to connect to, for example \"connect 1\".",
        ru: "Ukazhite, s kakim rezultatom nuzhno soedinit, naprimer \"connect 1\"."
      }),
      cards: buildListingBrowseCards(state.browseResults, replyLang),
      attachments: []
    };
  }

  const requestId = selected.kind === "offer"
    ? state.linkedRequestId || state.sourceRecordId
    : selected.id;
  const offerId = selected.kind === "offer"
    ? selected.id
    : state.linkedOfferId || state.sourceRecordId;

  try {
    const match = await createHelpMatch({
      requestId,
      offerId
    }, prismaClient);

    const nextState = createHelpWorkflowDraftState({
      ...state,
      mode: "done",
      step: "connect",
      matchId: match.id,
      roomId: match.roomId,
      confirmationPending: false
    });

    return {
      handled: true,
      workflowState: nextState,
      reply: pickText(replyLang, {
        et: "Uhendus on loodud. Avasingi selle matchi jaoks olemasoleva Room vestluse.",
        en: "The connection has been created. I linked an existing Room chat for this match.",
        ru: "Soedinenie sozdano. Ya privyazal Room chat dlya etogo matcha."
      }),
      cards: [],
      attachments: match.roomId
        ? [{
            label: pickText(replyLang, { et: "Ava Room vestlus", en: "Open Room chat", ru: "Otkryt Room chat" }),
            url: `/room/${encodeURIComponent(match.roomId)}`
          }]
        : []
    };
  } catch (error) {
    return {
      handled: true,
      workflowState: state,
      reply: pickText(replyLang, {
        et: error?.code === "HELP_MATCH_ALREADY_ACTIVE"
          ? "Selle kuulutuse jaoks on aktiivne match juba olemas."
          : "Uhenduse loomine ebaonnestus.",
        en: error?.code === "HELP_MATCH_ALREADY_ACTIVE"
          ? "There is already an active match for this listing."
          : "Failed to create the connection.",
        ru: error?.code === "HELP_MATCH_ALREADY_ACTIVE"
          ? "Dlya etogo obyavleniya uzhe est aktivnyy match."
          : "Ne udalos sozdat soedinenie."
      }),
      cards: [],
      attachments: []
    };
  }
}

export async function runHelpChatWorkflow(input = {}, prismaClient = prisma) {
  const message = String(input?.message || "").trim();
  const userId = String(input?.userId || "").trim();
  if (!message || !userId) return { handled: false };

  const replyLang = String(input?.replyLang || "et").trim();
  const currentState = normalizeHelpWorkflowState(input?.workflowState || null)
    || await readHelpWorkflowState(input?.convId, userId, prismaClient);
  const detectedIntent = detectHelpChatIntent(message);

  if (detectedIntent === "service_guidance") {
    return {
      handled: false,
      workflowState: currentState
    };
  }

  const explicitIntent = detectedIntent && detectedIntent !== "service_guidance" ? detectedIntent : null;
  const shouldResume = isActiveHelpWorkflowState(currentState) && !explicitIntent;
  if (!explicitIntent && !shouldResume) {
    return {
      handled: false,
      workflowState: currentState
    };
  }

  let state;
  if (explicitIntent && explicitIntent !== currentState?.intent) {
    state = createHelpWorkflowDraftState({
      intent: explicitIntent,
      mode: currentState?.mode || "draft",
      step: currentState?.step,
      draft: currentState?.draft,
      linkedRequestId: currentState?.linkedRequestId || null,
      linkedOfferId: currentState?.linkedOfferId || null,
      sourceRecordId: currentState?.sourceRecordId || null,
      browseResults: currentState?.browseResults || [],
      municipalityId: currentState?.municipalityId || null,
      municipalityLabel: currentState?.municipalityLabel || "",
      municipalityCandidates: currentState?.municipalityCandidates || []
    });
  } else if (currentState) {
    state = createHelpWorkflowDraftState(currentState);
  } else {
    state = createHelpWorkflowDraftState({
      intent: explicitIntent
    });
  }

  if (state.intent === "browse_help_offers" || state.intent === "browse_help_requests") {
    return handleBrowseTurn({
      state,
      replyLang,
      prismaClient
    });
  }

  if (state.intent === "connect_to_offer" || state.intent === "connect_to_request") {
    return handleConnectTurn({
      state,
      message,
      replyLang,
      prismaClient
    });
  }

  return handleCreateTurn({
    state,
    message,
    userId,
    replyLang,
    prismaClient
  });
}

export function buildHelpWorkflowMetadata(state) {
  return buildWorkflowMetadata(state);
}

export async function getHelpWorkflowState(convId, userId, prismaClient = prisma) {
  return readHelpWorkflowState(convId, userId, prismaClient);
}
