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
  function stripTemplatePlaceholders(text = "") {
    return String(text || "")
      .replace(/\[[^\]\n]{1,60}\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stripExplicitTitleLines(text = "") {
    return String(text || "")
      .split(/\r?\n/)
      .filter((line) => !TITLE_PREFIX_PATTERN.test(collapseWhitespace(line)))
      .join("\n");
  }

  function extractExplicitTitle(text = "") {
    const matchingLine = String(text || "")
      .split(/\r?\n/)
      .map((line) => collapseWhitespace(line))
      .find((line) => TITLE_PREFIX_PATTERN.test(line));
    if (!matchingLine) return "";
    return collapseWhitespace(matchingLine.replace(TITLE_PREFIX_PATTERN, "")).slice(0, 120);
  }

  function sanitizeLocationCandidate(value = "") {
    return collapseWhitespace(value).replace(/^(?:ning|ja)\s+/i, "").trim();
  }

  function isGenericLocationCandidate(value = "") {
    return /\b(vajadusel|kokkuleppel|paindlik(?:ult)?|saadaval|saadavus|algus|aeg|ajad|paevad|kell|kohapeal|veebi(?:s)?|online|telefoni|vestluse|mobiil|kaugelt)\b/i.test(normalizeText(value));
  }

  function isLikelyLocationCandidate(value = "") {
    const candidate = sanitizeLocationCandidate(value);
    if (!candidate) return false;
    const normalized = normalizeText(candidate);
    if (!normalized) return false;
    if (isGenericLocationCandidate(candidate)) return false;

    if (
      /\b(olen kattesaadav|olen kättesaadav|kattesaadav|kättesaadav|saadav|saadavus|kokkuleppel|paindlik|vabatahtlik|tasuline|tasu eest|ajad|paevad|päevad|kirjuta julgelt)\b/.test(normalized)
    ) {
      return false;
    }
    if (normalized === "piirkond" || normalized === "asukoht") return false;
    if (normalized.split(/\s+/).length > 3 && !/\b(vald|linn|alev|alevik|kula|küla)\b/.test(normalized)) {
      return false;
    }
    return true;
  }

  function isMeaningfulAnswer(text = "") {
    const normalized = normalizeText(text);
    if (!normalized) return false;
    if (isAffirmative(text) || isNegative(text) || isCancel(text)) return false;
    return normalized.length >= 2;
  }

  function splitIntoSnippets(text = "") {
    const raw = stripTemplatePlaceholders(stripExplicitTitleLines(text));
    if (!raw) return [];
    const parts = raw
      .split(/\n+/)
      .flatMap((line) => line.split(/(?<=[.!?])\s+/))
      .map((part) => collapseWhitespace(part))
      .filter(Boolean);
    return parts.length ? parts : [collapseWhitespace(raw)];
  }

  function pickSnippet(text = "", predicate, options = {}) {
    const maxLen = Number(options?.maxLen) || 140;
    const snippets = splitIntoSnippets(text);
    for (const snippet of snippets) {
      if (!predicate(snippet)) continue;
      if (snippet.length > maxLen) continue;
      return snippet;
    }
    return "";
  }

  function shouldAppendDescription(text = "", currentState = null) {
    const normalized = normalizeText(text);
    if (!normalized) return false;
    if (isAffirmative(text) || isCancel(text)) return false;
    if (currentState?.municipalityCandidates?.length && (normalized.length <= 40 || /^\d+$/.test(normalized))) return false;
    if (currentState?.activeQuestionLayer === "enrichment") return isMeaningfulAnswer(text);
    if (currentState?.activeQuestionLayer === "basic" && currentState?.activeQuestionKey && currentState.activeQuestionKey !== "description") {
      return false;
    }
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
    if (/\b(regulaarne|regulaarselt|iga nadal|iga nädal|kolmapaeviti|kolmapäeviti|esmaspaeviti|esmaspäeviti|teisipaeviti|teisipäeviti|neljapaeviti|neljapäeviti|reedeti|laupaeviti|laupäeviti|puhapaeviti|pühapäeviti|nadalavahetusel|nädalavahetusel|õhtuti|ohtuti|hommikuti)\b/.test(normalized)) return "RECURRING";
    if (/\b(paindlik|paindlikult|vastavalt vajadusele|as needed|kokkuleppel)\b/.test(normalized)) return "FLEXIBLE";
    return "";
  }

  function detectAvailabilityOrStart(message = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    if (
      WEEKDAY_OR_TIME_PATTERN.test(trimmed)
      || /\b(kohe|lähiajal|lahiajal|paindlikult|saadaval|vaba|kokkuleppel|kell\s*\d{1,2}(?::\d{2})?|esmasp[aä]ev\w*|teisip[aä]ev\w*|kolmap[aä]ev\w*|neljap[aä]ev\w*|reede\w*|laup[aä]ev\w*|p[üu]hap[aä]ev\w*)\b/i.test(trimmed)
    ) {
      return trimmed;
    }
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
    if (/\b(teisele|teisele inimesele|kellelegi teisele)\b/.test(normalized)) return "kellelegi teisele";
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

  function isFreeTextExtractionField(activeField = "") {
    return !activeField || activeField === "description";
  }

  function canInferLocationForField(activeField = "", message = "") {
    return isFreeTextExtractionField(activeField)
      || activeField === "rawPlace"
      || activeField === "municipality_confirmation"
      || hasExplicitLocationCue(message);
  }

  function canInferCategoryForField(activeField = "") {
    return isFreeTextExtractionField(activeField) || activeField === "categoryCode";
  }

  function canInferTargetGroupsForField(activeField = "") {
    return isFreeTextExtractionField(activeField)
      || activeField === "requestAudience"
      || activeField === "offerAudience"
      || activeField === "targetGroupCodes";
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

  function detectScopedCompensationDetails(message = "", helpType = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    const snippet = pickSnippet(trimmed, (value) => {
      const normalized = normalizeText(value);
      if (/nii vabatahtlik kui tasuline|molemad|molemale/.test(normalized)) return false;
      if (/(kuluhuvitis|soidukulu|hind|tunnihind|paevahind|tasustamine)/.test(normalized)) return true;
      if (/\d+\s*(eur|euro)/.test(normalized)) return true;
      if (/kokkuleppel/.test(normalized) && /(tasu|hind)/.test(normalized)) return true;
      return false;
    }, {
      maxLen: 120
    });
    if (!snippet) return "";
    if (helpType === "VOLUNTARY" && !/(kuluhuvitis|soidukulu)/.test(normalizeText(snippet))) return "";
    return snippet;
  }

  function detectScopedAvailabilityOrStart(message = "") {
    const trimmed = stripTemplatePlaceholders(message);
    if (!trimmed) return "";
    return pickSnippet(trimmed, (value) => {
      const normalized = normalizeText(value);
      const hasTimingCue = WEEKDAY_OR_TIME_PATTERN.test(value)
        || /(kohe|lahiajal|paindlik|saadaval|saadavus|vaba|kokkuleppel|kell\s*\d|esmasp|teisip|kolmap|neljap|reede|laup|puhap)/.test(normalized);
      if (!hasTimingCue) return false;
      if (
        /(tasu eest|tasuline|tasu|olukorrast|olukorrale)/.test(normalized)
        && !/(kell\s*\d|esmasp|teisip|kolmap|neljap|reede|laup|puhap|hommik|ohtu|õhtu|paindlik|saadaval|saadavus|kohe|lahiajal)/.test(normalized)
      ) {
        return false;
      }
      return WEEKDAY_OR_TIME_PATTERN.test(value)
        || /(kohe|lahiajal|paindlik|saadaval|saadavus|vaba|kokkuleppel|kell\s*\d|esmasp|teisip|kolmap|neljap|reede|laup|puhap)/.test(normalized);
    }, {
      maxLen: 140
    });
  }

  function detectScopedProviderScopeOrConditions(message = "") {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return "";
    return pickSnippet(trimmed, (value) => {
      const normalized = normalizeText(value);
      if (/(saadavus|saadaval|kokkuleppel|paindlik)/.test(normalized) && !/(ainult|kindlas piirkonnas|piiratud piirkonnas)/.test(normalized)) {
        return false;
      }
      return SCOPE_PATTERN.test(value)
        || /(kohapeal|kaugelt|veebis|online|oma autoga|isikliku autoga|ainult|kindlas piirkonnas|piiratud piirkonnas)/.test(normalized);
    }, {
      maxLen: 120
    });
  }

  function inferRichCategoryFromText(message = "", previousCode = "") {
    const normalized = normalizeText(message);
    if (!normalized) {
      return { categoryCode: previousCode || "", category: getCategoryLabel(previousCode), confidence: previousCode ? "high" : "low" };
    }
    if (/\b(transpord|transport|soidut|soit|autoga)\w*/.test(normalized)) {
      return { categoryCode: "TRANSPORT", category: getCategoryLabel("TRANSPORT"), confidence: "high" };
    }
    if (/\b(digi|arvuti|telefon|internet|e-teenus|e teenus|nutisead)/.test(normalized)) {
      return { categoryCode: "DIGITAL_HELP", category: getCategoryLabel("DIGITAL_HELP"), confidence: "high" };
    }
    if (/\b(avaldus|vorm|dokumen|dokumentide tait|asjaajami|kirjade koost)/.test(normalized)) {
      return { categoryCode: "ADMIN_FORM_HELP", category: getCategoryLabel("ADMIN_FORM_HELP"), confidence: "high" };
    }
    if (/\b(igapaeva|pood|poeabi|ostud|kaimine)\w*/.test(normalized)) {
      return { categoryCode: "DAILY_TASKS", category: getCategoryLabel("DAILY_TASKS"), confidence: "high" };
    }
    return inferCategoryFromText(message, previousCode);
  }

  function inferCategoryFromText(message = "", previousCode = "") {
    const normalized = normalizeText(message);
    if (!normalized) {
      return { categoryCode: previousCode || "", category: getCategoryLabel(previousCode), confidence: previousCode ? "high" : "low" };
    }
    if (/\b(transpord\w*|transport\w*|soidut\w*|soit\w*|vii\w*|autoga)\b/.test(normalized)) {
      return { categoryCode: "TRANSPORT", category: getCategoryLabel("TRANSPORT"), confidence: "high" };
    }
    if (/\b(igapaeva\w*|igapäeva\w*|pood\w*|poeabi\w*|ostud\w*|asjaajamine\w*|kaimine\w*|käimine\w*)\b/.test(normalized)) {
      return { categoryCode: "DAILY_TASKS", category: getCategoryLabel("DAILY_TASKS"), confidence: "high" };
    }
    if (/\b(digi\w*|arvuti\w*|telefon\w*|internet\w*|e-teenus\w*|e teenus\w*)\b/.test(normalized)) {
      return { categoryCode: "DIGITAL_HELP", category: getCategoryLabel("DIGITAL_HELP"), confidence: "high" };
    }
    if (/\b(hooldus\w*|hooldaja\w*|isiklik abistaja|tugiisik\w*|saatja\w*)\b/.test(normalized)) {
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
    return stripTemplatePlaceholders(stripExplicitTitleLines(text))
      .replace(/^[\s,.-]*(?:aita mul\s+vormistada|soovin\s+pakkuda|pakun|saan\s+aidata|voin\s+aidata|voiksin\s+aidata|olen\s+valmis\s+aitama|aitan)\s+/i, "")
      .replace(/^[\s,.-]*(?:mul oleks vaja|mul on vaja|vaja oleks|vajan|otsin|soovin leida|aita leida)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractLocationCandidates(message = "") {
    const text = stripTemplatePlaceholders(stripExplicitTitleLines(message));
    if (!text) return [];

    const candidates = [];
    const municipalityMatch = text.match(MUNICIPALITY_PATTERN);
    if (municipalityMatch?.[1]) candidates.push(sanitizeLocationCandidate(municipalityMatch[1]));

    const prepMatch = text.match(LOCATION_PREPOSITION_PATTERN);
    if (prepMatch?.[1]) candidates.push(sanitizeLocationCandidate(prepMatch[1]));

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
      if (isGenericLocationCandidate(token)) continue;
      if (/\b(eakatele|eakale|lapsele|emale|isale|vabatahtlik|tasuline|regulaarne|paindlik|paindlikult|lahiajal|lähiajal|uhekordselt|ühekordselt|poes|kaimiseks)\b/i.test(token)) {
        continue;
      }
      const allowLooseToken = plainWords.length <= 4 || /^\p{Lu}/u.test(token);
      if (!allowLooseToken) continue;
      if (/(s|l|le|lt|st|ga)$/i.test(token)) candidates.push(token.replace(/[.,!?;:]+$/g, ""));
    }

    return uniqueStrings(candidates.map((candidate) => sanitizeLocationCandidate(candidate)).filter((candidate) => isLikelyLocationCandidate(candidate)));
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

    const shouldInferLocation = canInferLocationForField(activeField, message);

    if (!shouldInferLocation) return null;

    const locationCandidates = extractLocationCandidates(message);
    for (const candidate of locationCandidates) {
      const normalizedPlace = await normalizePlaceToMunicipality({
        rawPlace: candidate,
        message: candidate
      }, {}, prismaClient);
      if (!normalizedPlace?.rawPlace && !normalizedPlace?.municipalityId && !normalizedPlace?.candidates?.length) continue;

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

  function applyQuestionFallbacks({ draft, message, activeQuestionLayer, activeQuestionKey }) {
    const trimmed = collapseWhitespace(message);
    if (!trimmed) return;
    const substantive = isMeaningfulAnswer(trimmed);

    if (activeQuestionKey === "offerAudience" && substantive && !draft.targetGroupCodes.length && !draft.targetGroups.length) {
      draft.targetGroups = uniqueStrings([trimmed]);
      draft.targetGroup = trimmed;
    }

    if (activeQuestionKey === "requestAudience" && substantive) {
      if (!draft.beneficiaryLabel) {
        const beneficiaryLabel = detectBeneficiaryLabel(trimmed);
        if (beneficiaryLabel) {
          draft.beneficiaryLabel = beneficiaryLabel;
        }
      }
      if (!draft.targetGroupCodes.length && !draft.targetGroups.length) {
        const targetGroupInfo = inferTargetGroupsFromMessage(trimmed, draft.targetGroupCodes);
        if (targetGroupInfo.confidence !== "low") {
          draft.targetGroupCodes = targetGroupInfo.targetGroupCodes;
          draft.targetGroups = targetGroupInfo.targetGroups;
          draft.targetGroup = targetGroupInfo.targetGroups.join(", ");
        }
      }
      if (!draft.beneficiaryLabel && !draft.targetGroupCodes.length && !draft.targetGroups.length) {
        draft.beneficiaryLabel = trimmed;
      }
    }

    if (activeQuestionKey === "timing" && substantive) {
      if (!draft.availabilityOrStart) draft.availabilityOrStart = trimmed;
    }

    if (
      activeQuestionKey === "helpCompensation"
      && substantive
      && !draft.compensationDetails
      && draft.helpType
      && draft.helpType !== "VOLUNTARY"
    ) {
      draft.compensationDetails = trimmed;
    }

    if (activeQuestionLayer === "enrichment" && substantive) {
      if (draft.description && !draft.description.includes(trimmed)) {
        draft.description = collapseWhitespace(`${draft.description} ${trimmed}`);
      }
      if (String(activeQuestionKey || "").startsWith("create_help_offer:")) {
        draft.providerScopeOrConditions = trimmed;
      }
      draft.extraNotes = trimmed;
    }
  }

  async function mergeDraftState(state, message, { prismaClient, getNextMissingField, aiDraftPatcher } = {}) {
    const previousDraft = normalizeDraft(state?.draft || {});
    const explicitTitle = extractExplicitTitle(message);
    const contentMessage = stripExplicitTitleLines(message);
    const activeField = typeof getNextMissingField === "function" ? getNextMissingField(state) : "";
    const municipalityUpdate = await resolveMunicipalityUpdate(contentMessage, state, prismaClient, activeField);
    let description = previousDraft.description;
    if (!description) {
      description = cleanNaturalDescription(contentMessage);
    } else if (shouldAppendDescription(contentMessage, state)) {
      const addition = cleanNaturalDescription(contentMessage);
      if (addition && !description.includes(addition)) {
        description = collapseWhitespace(`${description} ${addition}`);
      }
    }

    const draft = {
      ...previousDraft,
      description
    };

    const helpType = detectCompensationType(contentMessage);
    if (helpType) draft.helpType = helpType;

    const compensationDetails = detectScopedCompensationDetails(contentMessage, helpType || draft.helpType);
    if (compensationDetails) draft.compensationDetails = compensationDetails;

    const timeType = detectTimeType(contentMessage);
    if (timeType) draft.timeType = timeType;

    const availabilityOrStart = detectScopedAvailabilityOrStart(contentMessage);
    if (availabilityOrStart) draft.availabilityOrStart = availabilityOrStart;

    const beneficiaryLabel = detectBeneficiaryLabel(contentMessage);
    if (state.intent === "create_help_request" && beneficiaryLabel) {
      draft.beneficiaryLabel = beneficiaryLabel;
    }

    const urgency = detectUrgency(contentMessage);
    if (urgency) draft.urgency = urgency;

    const providerScopeOrConditions = detectScopedProviderScopeOrConditions(contentMessage);
    if (providerScopeOrConditions) draft.providerScopeOrConditions = providerScopeOrConditions;

    const conditions = detectConditions(contentMessage);
    if (conditions) draft.conditions = conditions;

    const skillsOrBackground = detectSkillsOrBackground(contentMessage);
    if (skillsOrBackground) draft.skillsOrBackground = skillsOrBackground;

    if (canInferCategoryForField(activeField)) {
      const categoryInfo = inferRichCategoryFromText(`${contentMessage} ${draft.description}`, draft.categoryCode);
      if (categoryInfo.confidence !== "low") {
        draft.categoryCode = categoryInfo.categoryCode;
        draft.category = categoryInfo.category;
      }
    }

    if (canInferTargetGroupsForField(activeField)) {
      const targetGroupInfo = inferTargetGroupsFromMessage(`${contentMessage} ${draft.description}`, draft.targetGroupCodes);
      if (targetGroupInfo.confidence !== "low") {
        draft.targetGroupCodes = targetGroupInfo.targetGroupCodes;
        draft.targetGroups = targetGroupInfo.targetGroups;
        draft.targetGroup = targetGroupInfo.targetGroups.join(", ");
      }
    }

    applyQuestionFallbacks({
      draft,
      message: contentMessage,
      activeQuestionLayer: state?.activeQuestionLayer || "",
      activeQuestionKey: state?.activeQuestionKey || ""
    });

    const municipalityId = municipalityUpdate?.municipalityId ?? state.municipalityId;
    const municipalityLabel = municipalityUpdate?.municipalityLabel ?? state.municipalityLabel;
    const municipalityCandidates = municipalityUpdate?.municipalityCandidates ?? state.municipalityCandidates;
    if (municipalityUpdate?.rawPlace) {
      draft.rawPlace = municipalityUpdate.rawPlace;
    } else if (!draft.rawPlace && municipalityLabel) {
      draft.rawPlace = municipalityLabel;
    }
    draft.title = explicitTitle || generateTitleFromDraft(draft, state.intent);
    draft.structuredSummary = generateStructuredSummary(draft, municipalityLabel, state.intent);

    const nextState = createHelpWorkflowDraftState({
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

    if (typeof aiDraftPatcher === "function") {
      const patchedState = await aiDraftPatcher({
        previousState: state,
        state: nextState,
        message: contentMessage,
        activeField,
        createHelpWorkflowDraftState
      });
      if (patchedState) return createHelpWorkflowDraftState(patchedState);
    }

    return nextState;
  }

  return {
    detectBeneficiaryLabel,
    inferCategoryFromText: inferRichCategoryFromText,
    inferTargetGroupsFromMessage,
    mergeDraftState
  };
}
