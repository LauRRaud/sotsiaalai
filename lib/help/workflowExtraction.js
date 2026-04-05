export function createHelpWorkflowExtraction({
  LOCATION_PREPOSITION_PATTERN,
  MUNICIPALITY_PATTERN,
  PAID_DETAILS_PATTERN,
  SCOPE_PATTERN,
  TITLE_PREFIX_PATTERN,
  WEEKDAY_OR_TIME_PATTERN,
  collapseWhitespace,
  createHelpWorkflowDraftState,
  findLocationAliasMatches,
  generateStructuredSummary,
  generateTitleFromDraft,
  getCategoryLabel,
  getTargetGroupLabels,
  inferHelpCategoryCode,
  inferTargetGroupCodes,
  isAffirmative,
  isCancel,
  isNegative,
  municipalityGuessNeedsConfirmation,
  normalizeDraft,
  normalizePlaceToMunicipality,
  normalizeText,
  parseOrdinalSelection,
  uniqueStrings
}) {
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

  function detectCompensationType(message = "") {
    const normalized = normalizeText(message);
    const mentionsVoluntary = /\b(vabatahtlik|vabatahtlikult|tasuta|volunteer|voluntary)\b/.test(normalized);
    const mentionsPaid = /\b(tasuline|tasu eest|paid|eur|euro|€|tunnihind|kokkuleppeline tasu)\b/.test(normalized);
    const mentionsBoth = /\b(molemad|mõlemad|nii vabatahtlik kui tasuline|olen avatud molemale|olen avatud mõlemale)\b/.test(normalized);
    if (mentionsBoth || (mentionsVoluntary && mentionsPaid)) return "MIXED";
    if (mentionsPaid) return "PAID";
    if (mentionsVoluntary) return "VOLUNTARY";
    return "";
  }

  function detectCompensationDetails(message = "", helpType = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    if (!PAID_DETAILS_PATTERN.test(trimmed) && !/\bkokkuleppel\b/i.test(trimmed)) return "";
    if (helpType === "VOLUNTARY" && !/\bkuluhuvitis|sõidukulu|sõidukulud\b/i.test(trimmed)) return "";
    return trimmed;
  }

  function detectTimeType(message = "") {
    const normalized = normalizeText(message);
    if (/\b(uhekordne|ühekordne|one time|one-off|seekord)\b/.test(normalized)) return "ONE_TIME";
    if (/\b(regulaarne|regulaarselt|iga nadal|iga nädal|kolmapaeviti|kolmapäeviti|esmaspaeviti|esmaspäeviti|teisipaeviti|teisipäeviti|neljapaeviti|neljapäeviti|reedeti|laupaeviti|laupäeviti|puhapaeviti|pühapäeviti|nadalavahetusel|nädalavahetusel)\b/.test(normalized)) return "RECURRING";
    if (/\b(paindlik|paindlikult|vastavalt vajadusele|as needed|kokkuleppel)\b/.test(normalized)) return "FLEXIBLE";
    return "";
  }

  function detectAvailabilityOrStart(message = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    if (WEEKDAY_OR_TIME_PATTERN.test(trimmed) || /\b(kohe|lähiajal|paindlikult|saadaval|vaba)\b/i.test(trimmed)) {
      return trimmed;
    }
    return "";
  }

  function detectContactPreference(message = "") {
    const normalized = normalizeText(message);
    if (/\b(vestluse kaudu|siin vestluses|vestluses)\b/.test(normalized)) return "vestluse kaudu";
    if (/\b(telefoni teel|telefonitsi|telefon|helista)\b/.test(normalized)) return "telefoni teel";
    if (/\b(e-posti teel|eposti teel|e-postiga|emaili teel|meili teel|email|e-post)\b/.test(normalized)) return "e-posti teel";
    if (/\b(kokkuleppel)\b/.test(normalized)) return "kokkuleppel";
    return "";
  }

  function detectUrgency(message = "") {
    const normalized = normalizeText(message);
    if (/\b(kohe|esimesel voimalusel|esimesel võimalusel|niipea kui voimalik|niipea kui võimalik)\b/.test(normalized)) return "kohe";
    if (/\b(lahiajal|lähiajal|lähinadalal|lähinädalal|peagi|varsti)\b/.test(normalized)) return "lähiajal";
    if (/\b(paindlik|paindlikult|ei ole kiire|pole kiire)\b/.test(normalized)) return "paindlik";
    return "";
  }

  function detectBeneficiaryLabel(message = "") {
    const normalized = normalizeText(message);
    if (/\b(endale|mulle|minule|enda jaoks)\b/.test(normalized)) return "endale";
    if (/\b(emale)\b/.test(normalized)) return "emale";
    if (/\b(isale)\b/.test(normalized)) return "isale";
    if (/\b(lapsele)\b/.test(normalized)) return "lapsele";
    if (/\b(kliendile)\b/.test(normalized)) return "kliendile";
    if (/\b(vanaemale)\b/.test(normalized)) return "vanaemale";
    if (/\b(vanaisale)\b/.test(normalized)) return "vanaisale";
    return "";
  }

  function hasExplicitLocationCue(message = "") {
    const text = String(message || "").trim();
    if (!text) return false;
    const normalized = normalizeText(text);
    if (MUNICIPALITY_PATTERN.test(text) || LOCATION_PREPOSITION_PATTERN.test(text)) return true;
    if (findLocationAliasMatches(text).length) return true;
    return /\b(asukoht|asukohaks|omavalitsus|vald|linn|alev|küla|kyla|piirkond|koht)\b/.test(normalized);
  }

  function detectProviderScopeOrConditions(message = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    if (SCOPE_PATTERN.test(trimmed) || /\b(kolmapaeviti|kolmapäeviti|esmaspaeviti|esmaspäeviti|teisipaeviti|teisipäeviti|õhtuti|ohtuti|hommikuti)\b/i.test(trimmed)) return trimmed;
    return "";
  }

  function detectConditions(message = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    if (/\b(trepp|ratastool|liikumisraskus|vajab saatjat|ei saa üksinda|juurdepääs)\b/i.test(trimmed)) return trimmed;
    return "";
  }

  function detectSkillsOrBackground(message = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    if (/\b(kogemus|oskused|juhiluba|auto olemas|hoolduskogemus|digiabi kogemus|taust)\b/i.test(trimmed)) return trimmed;
    return "";
  }

  function inferCategoryFromText(message = "", previousCode = "") {
    const normalized = normalizeText(message);
    if (!normalized) {
      return { categoryCode: previousCode || "", category: getCategoryLabel(previousCode), confidence: previousCode ? "high" : "low" };
    }
    if (/\btransport\w*\b/.test(normalized)) {
      return { categoryCode: "TRANSPORT", category: getCategoryLabel("TRANSPORT"), confidence: "high" };
    }
    if (/\b(pood|poes|poeabi|ostud|asjaajamine|kaimine|käimine)\b/.test(normalized)) {
      return { categoryCode: "DAILY_TASKS", category: getCategoryLabel("DAILY_TASKS"), confidence: "high" };
    }
    if (/\b(digi|arvuti|telefon|internet|e-teenus|e teenus)\b/.test(normalized)) {
      return { categoryCode: "DIGITAL_HELP", category: getCategoryLabel("DIGITAL_HELP"), confidence: "high" };
    }
    if (/\b(hooldus|hooldaja|isiklik abistaja|tugiisik|saatja)\b/.test(normalized)) {
      return { categoryCode: "CARE_SUPPORT", category: getCategoryLabel("CARE_SUPPORT"), confidence: "high" };
    }
    const inferredCode = inferHelpCategoryCode({
      primaryCategoryCode: previousCode,
      description: message
    });
    if (inferredCode && inferredCode !== "OTHER") {
      return { categoryCode: inferredCode, category: getCategoryLabel(inferredCode), confidence: "high" };
    }
    if (/\b(muu abi|muu)\b/.test(normalized)) {
      return { categoryCode: "OTHER", category: getCategoryLabel("OTHER"), confidence: "medium" };
    }
    return { categoryCode: previousCode || "", category: getCategoryLabel(previousCode), confidence: previousCode ? "high" : "low" };
  }

  function inferTargetGroupsFromMessage(message = "", previousCodes = []) {
    const normalized = normalizeText(message);
    const manualCodes = [];
    if (/\b(laps|lapsele|lastele|lapsed)\b/.test(normalized)) manualCodes.push("CHILD");
    if (/\b(noor|noorele|noortele|noored)\b/.test(normalized)) manualCodes.push("YOUTH");
    if (/\b(taiskasvanu|taiskasvanule|taiskasvanud)\b/.test(normalized)) manualCodes.push("ADULT");
    if (/\b(eakas|eakale|eakad|eakatele|pensionar|pensionarid)\b/.test(normalized)) manualCodes.push("ELDER");
    if (/\b(puue|puudega|erivajadus|erivajadusega)\b/.test(normalized)) manualCodes.push("DISABILITY");
    if (manualCodes.length) {
      return {
        targetGroupCodes: uniqueStrings(manualCodes),
        targetGroups: getTargetGroupLabels(manualCodes),
        confidence: "high"
      };
    }
    const codes = inferTargetGroupCodes({
      targetGroup: message
    });
    if (codes.length) {
      return {
        targetGroupCodes: uniqueStrings(codes),
        targetGroups: getTargetGroupLabels(codes),
        confidence: "high"
      };
    }
    if (previousCodes.length) {
      return {
        targetGroupCodes: uniqueStrings(previousCodes),
        targetGroups: getTargetGroupLabels(previousCodes),
        confidence: "high"
      };
    }
    return {
      targetGroupCodes: [],
      targetGroups: [],
      confidence: "low"
    };
  }

  function cleanNaturalDescription(text = "") {
    return String(text || "")
      .replace(TITLE_PREFIX_PATTERN, "")
      .replace(/^[\s,.-]*(?:aita mul\s+vormistada|soovin\s+pakkuda|pakun|saan\s+aidata|voin\s+aidata|voiksin\s+aidata|olen\s+valmis\s+aitama|aitan)\s+/i, "")
      .replace(/^[\s,.-]*(?:mul oleks vaja|mul on vaja|vaja oleks|vajan|otsin|soovin leida|aita leida)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractLocationCandidates(message = "") {
    const text = String(message || "").trim();
    if (!text) return [];

    const candidates = [];
    const municipalityMatch = text.match(MUNICIPALITY_PATTERN);
    if (municipalityMatch?.[1]) candidates.push(collapseWhitespace(municipalityMatch[1]));

    const prepMatch = text.match(LOCATION_PREPOSITION_PATTERN);
    if (prepMatch?.[1]) candidates.push(collapseWhitespace(prepMatch[1]));

    const aliasMatches = findLocationAliasMatches(text);
    for (const alias of aliasMatches) {
      candidates.push(alias.place);
    }

    const plainWords = text
      .replace(/[.,!?;:()"]/g, " ")
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const token of plainWords) {
      if (token.length < 4) continue;
      if (/\b(minule|mulle|endale)\b/i.test(token)) continue;
      if (/\b(eakatele|eakale|lapsele|emale|isale|vabatahtlik|tasuline|regulaarne|paindlik|paindlikult|lahiajal|lähiajal|uhekordselt|ühekordselt|telefoni|vestluse|kaudu|poes|kaimiseks)\b/i.test(token)) {
        continue;
      }
      if (/(s|l|le|lt|st|ga)$/i.test(token)) candidates.push(token.replace(/[.,!?;:]+$/g, ""));
    }

    return uniqueStrings(candidates);
  }

  async function resolveMunicipalityUpdate(message, state, prismaClient, activeField = "") {
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

    const shouldInferLocation = activeField === "rawPlace"
      || activeField === "municipalityId"
      || !state?.draft?.rawPlace
      || hasExplicitLocationCue(message);

    if (!shouldInferLocation) return null;

    const locationCandidates = extractLocationCandidates(message);
    for (const candidate of locationCandidates) {
      const normalizedPlace = await normalizePlaceToMunicipality({
        rawPlace: candidate,
        message: candidate
      }, {}, prismaClient);
      if (!normalizedPlace?.rawPlace && !normalizedPlace?.municipalityId && !normalizedPlace?.candidates?.length) {
        continue;
      }

      if (normalizedPlace.municipalityId && !municipalityGuessNeedsConfirmation(normalizedPlace)) {
        return {
          municipalityId: normalizedPlace.municipalityId,
          municipalityLabel: normalizedPlace.municipalityDisplayName || normalizedPlace.municipality?.displayName || "",
          municipalityCandidates: [],
          rawPlace: normalizedPlace.rawPlace || candidate
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
          rawPlace: normalizedPlace.rawPlace || candidate
        };
      }
      if (normalizedPlace?.rawPlace) {
        return {
          municipalityId: null,
          municipalityLabel: "",
          municipalityCandidates: [],
          rawPlace: normalizedPlace.rawPlace
        };
      }
    }
    return null;
  }

  async function mergeDraftState(state, message, { prismaClient, getNextMissingField } = {}) {
    const previousDraft = normalizeDraft(state?.draft || {});
    const activeField = typeof getNextMissingField === "function" ? getNextMissingField(state) : "";
    const municipalityUpdate = await resolveMunicipalityUpdate(message, state, prismaClient, activeField);
    let description = previousDraft.description;
    if (!description) {
      description = cleanNaturalDescription(message);
    } else if (shouldAppendDescription(message, state)) {
      const addition = cleanNaturalDescription(message);
      if (addition && !description.includes(addition)) {
        description = collapseWhitespace(`${description} ${addition}`);
      }
    }

    const draft = {
      ...previousDraft,
      description
    };

    const helpType = detectCompensationType(message);
    if (helpType) draft.helpType = helpType;

    const compensationDetails = detectCompensationDetails(message, helpType || draft.helpType);
    if (compensationDetails) draft.compensationDetails = compensationDetails;

    const timeType = detectTimeType(message);
    if (timeType) draft.timeType = timeType;

    const availabilityOrStart = detectAvailabilityOrStart(message);
    if (availabilityOrStart) draft.availabilityOrStart = availabilityOrStart;

    const contactPreference = detectContactPreference(message);
    if (contactPreference) draft.contactPreference = contactPreference;

    const beneficiaryLabel = detectBeneficiaryLabel(message);
    if (state.intent === "create_help_request" && beneficiaryLabel) {
      draft.beneficiaryLabel = beneficiaryLabel;
    }

    const urgency = detectUrgency(message);
    if (urgency) draft.urgency = urgency;

    const providerScopeOrConditions = detectProviderScopeOrConditions(message);
    if (providerScopeOrConditions) draft.providerScopeOrConditions = providerScopeOrConditions;

    const conditions = detectConditions(message);
    if (conditions) draft.conditions = conditions;

    const skillsOrBackground = detectSkillsOrBackground(message);
    if (skillsOrBackground) draft.skillsOrBackground = skillsOrBackground;

    const categoryInfo = inferCategoryFromText(`${message} ${draft.description}`, draft.categoryCode);
    if (categoryInfo.confidence !== "low") {
      draft.categoryCode = categoryInfo.categoryCode;
      draft.category = categoryInfo.category;
    }

    const targetGroupInfo = inferTargetGroupsFromMessage(`${message} ${draft.description}`, draft.targetGroupCodes);
    if (targetGroupInfo.confidence !== "low") {
      draft.targetGroupCodes = targetGroupInfo.targetGroupCodes;
      draft.targetGroups = targetGroupInfo.targetGroups;
      draft.targetGroup = targetGroupInfo.targetGroups.join(", ");
    }

    const municipalityId = municipalityUpdate?.municipalityId ?? state.municipalityId;
    const municipalityLabel = municipalityUpdate?.municipalityLabel ?? state.municipalityLabel;
    const municipalityCandidates = municipalityUpdate?.municipalityCandidates ?? state.municipalityCandidates;
    if (municipalityUpdate?.rawPlace) {
      draft.rawPlace = municipalityUpdate.rawPlace;
    } else if (!draft.rawPlace && municipalityLabel) {
      draft.rawPlace = municipalityLabel;
    }
    draft.title = generateTitleFromDraft(draft, state.intent);
    draft.structuredSummary = generateStructuredSummary(draft, municipalityLabel, state.intent);

    return createHelpWorkflowDraftState({
      ...state,
      step: "collect_required_fields",
      flowLocked: true,
      municipalityId,
      municipalityLabel,
      municipalityCandidates,
      confirmationPending: false,
      sourceMessage: state.sourceMessage || message,
      draft
    });
  }

  return {
    inferCategoryFromText,
    inferTargetGroupsFromMessage,
    mergeDraftState
  };
}
