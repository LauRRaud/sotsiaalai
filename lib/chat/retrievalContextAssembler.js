import {
  collapsePages,
  groupMatches,
  diversifyGroupsMMR,
  selectTemporalGroups,
  rankGroupsWithTopicHints,
  buildContextWithBudget,
  makeShortRef,
  filterMunicipalityScopedMatches,
  displayUrl
} from "@/lib/chat/ragContext";
import { groundingStrength } from "@/lib/chat/safety";
import { RAG_TOP_K, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA } from "@/lib/chat/settings";
import { shouldUseExternalSourcesForTurn } from "@/lib/chat/sourceNeed";
import {
  buildTemporalRetrievalPlan,
  buildTemporalBreakdownInstruction,
  buildTemporalFillQueries,
  buildTemporalYearSearchQuery,
  extractTopicHints
} from "@/lib/chat/retrievalPlanning";
import {
  extractRecentUserText,
  normalizeIntentText,
  isMunicipalityDependentSocialHelpQuestion,
  getDocContextBudget,
  buildEphemeralDocContext,
  getEphemeralSourceLabel,
  detectMentionedMunicipalitiesFromUserText
} from "@/lib/chat/requestContext";
import {
  buildRagSearchQuery,
  searchRagQueries,
  extractParagraphReferences,
  inferSourceLookupSubject,
  detectSourceAvailabilityRequest,
  detectPreviousSourceUseRequest,
  buildSourceLookupSearchQuery,
  dedupeRagMatches,
  extractMatchGroupYear
} from "@/lib/chat/retrievalOrchestrator";

function normalizePageRangeString(value = "") {
  return String(value).replace(/\s*[-\u2010-\u2015]\s*/g, "-").trim();
}

function shouldCarryMunicipalityFromHistory(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return false;
  if (normalized.length <= 40) {
    return /\b(see|seda|selle|seal|siin|sealt|sinna|samas|too|need|nende)\b/.test(normalized);
  }
  return /\b(see|seda|selle|seal|siin|sealt|sinna|samas|too|need|nende|kontakt|kontaktid|telefon|e-post|email|taotlus|taotlema)\b/.test(normalized);
}

function isNationalLawSourceLookup(subject = "", combinedText = "") {
  const normalizedSubject = normalizeIntentText(subject);
  const normalizedCombined = normalizeIntentText(combinedText);
  if (/\bsotsiaalhoolekande sead/.test(normalizedSubject) || /\bshs\b/.test(normalizedCombined)) {
    return true;
  }
  return /\b(riigi teataja|riigiteataja)\b/.test(normalizedSubject) &&
    /\b(seadus|paragrahv|paragraph|shs|sotsiaalhoolekande)\b/.test(normalizedCombined);
}

function buildLayeredContextInstruction(replyLang = "et") {
  if (replyLang === "en") {
    return [
      "LAYERED_CONTEXT_MODE:",
      "When sources support several levels, structure the answer from general/national background to municipal support or service and then to direct service provider or partner.",
      "Do not force every level into the answer.",
      "Mention municipal or provider-level details only when RAG_CONTEXT contains evidence for that level.",
      "If the municipality is missing for a municipality-dependent question, give only general background and ask for the municipality."
    ].join("\n");
  }

  if (replyLang === "ru") {
    return [
      "LAYERED_CONTEXT_MODE:",
      "Если источники покрывают несколько уровней, строй ответ от общего/государственного фона к поддержке или услуге местного самоуправления, затем к прямому поставщику услуги или партнёру.",
      "Не добавляй все уровни принудительно.",
      "Упоминай муниципальные детали или поставщика услуги только тогда, когда RAG_CONTEXT содержит подтверждение этого уровня.",
      "Если для вопроса нужен муниципалитет, но он неизвестен, дай только общий фон и спроси муниципалитет."
    ].join("\n");
  }

  return [
    "LAYERED_CONTEXT_MODE:",
    "Kui allikad toetavad mitut tasandit, struktureeri vastus üldisest või riiklikust taustast KOV toe või teenuseni ning sealt otsese teenuseosutaja või partnerini.",
    "Ära suru kõiki tasandeid vastusesse vägisi.",
    "Nimeta KOV- või teenusepartneri tasandi detaile ainult siis, kui RAG_CONTEXT sisaldab selle tasandi tõendust.",
    "Kui küsimus sõltub omavalitsusest, aga omavalitsus pole teada, anna ainult üldine taust ja küsi omavalitsust."
  ].join("\n");
}

function buildGeneralBackgroundQueries(ragQueries = [], baseQuery = "") {
  const normalizedQueries = (Array.isArray(ragQueries) ? ragQueries : [ragQueries])
    .map((entry) => (typeof entry === "string" ? entry : entry?.query))
    .map((query) => String(query || "").trim())
    .filter(Boolean);
  const base = String(baseQuery || normalizedQueries[0] || "").trim();
  const backgroundAnchor = "üldine taust sotsiaalhoolekanne sotsiaalkaitse riiklik korraldus Sotsiaaltöö";
  return Array.from(new Set([
    base ? [base, backgroundAnchor].join("\n") : backgroundAnchor,
    ...normalizedQueries
  ].filter(Boolean))).map((query) => ({ query }));
}

function normalizeRagQueryEntries(ragQueries = []) {
  return (Array.isArray(ragQueries) ? ragQueries : [ragQueries])
    .map((entry) => {
      const query = String(typeof entry === "string" ? entry : entry?.query || "").trim();
      if (!query) return null;
      const filters = entry && typeof entry === "object" && !Array.isArray(entry)
        ? entry.filters || null
        : null;
      return {
        query,
        ...(filters ? { filters } : {})
      };
    })
    .filter(Boolean);
}

function buildMunicipalityScopedQueries(ragQueries = [], municipalities = []) {
  const municipalityNames = Array.from(new Set(
    (Array.isArray(municipalities) ? municipalities : [])
      .map((item) => String(item?.displayName || "").trim())
      .filter(Boolean)
  )).slice(0, 3);
  const queryEntries = normalizeRagQueryEntries(ragQueries);
  if (!municipalityNames.length || !queryEntries.length) return queryEntries;

  const serviceAnchor = "sotsiaalteenused toetused sotsiaalabi KOV";
  return queryEntries.flatMap((entry) =>
    municipalityNames.map((municipalityName) => ({
      ...entry,
      query: [municipalityName, entry.query, serviceAnchor].filter(Boolean).join("\n")
    }))
  );
}

function buildMunicipalityScopedFilters(audienceFilter, municipalities = []) {
  const municipalityNames = Array.from(new Set(
    (Array.isArray(municipalities) ? municipalities : [])
      .map((item) => String(item?.displayName || "").trim())
      .filter(Boolean)
  ));
  if (municipalityNames.length !== 1) return audienceFilter;
  return {
    ...audienceFilter,
    municipality_name: municipalityNames[0]
  };
}

export async function assembleRetrievalContext({
  payloadAudience,
  normalizedRole,
  rawHistory,
  effectiveMessage,
  forceSources,
  forcedMode,
  hasHistory,
  replyLang,
  ephemeralChunks,
  ephemeralSource,
  combineSources,
  userId,
  convId,
  isCrisis,
  logInfo,
  logError,
  logEvent,
  buildMissingMunicipalityInstruction,
  buildSourceLookupInstruction,
  docContextBudgets
}) {
  const previousSourceUseRequest = detectPreviousSourceUseRequest(rawHistory, effectiveMessage);
  const sourceLookupRequest = !previousSourceUseRequest && detectSourceAvailabilityRequest(rawHistory, effectiveMessage);
  const externalSourcesNeeded = shouldUseExternalSourcesForTurn(effectiveMessage, {
    forceSources,
    defaultToExternalSources: forcedMode === "rag",
    hasHistory,
    sourceLookupRequest,
    previousSourceUseRequest
  });
  const sourceLookupCombinedText = sourceLookupRequest
    ? [effectiveMessage, ...extractRecentUserText(rawHistory, 8)].join("\n")
    : "";
  const sourceLookupSubject = sourceLookupRequest
    ? inferSourceLookupSubject(sourceLookupCombinedText)
    : "";
  const sourceLookupParagraphRefs = sourceLookupRequest ? extractParagraphReferences(sourceLookupCombinedText) : [];
  const sourceLookupTargetsNationalLaw = sourceLookupRequest &&
    isNationalLawSourceLookup(sourceLookupSubject, sourceLookupCombinedText);

  const audienceFilter = payloadAudience === "CLIENT" || normalizedRole === "CLIENT"
    ? {
        audience: {
          $in: ["CLIENT", "BOTH"]
        }
      }
    : {
        audience: {
          $in: ["SOCIAL_WORKER", "BOTH"]
        }
      };

  const mentionedMunicipalities = await detectMentionedMunicipalitiesFromUserText(rawHistory, effectiveMessage, {
    logError
  });
  const currentMessageMunicipalities = await detectMentionedMunicipalitiesFromUserText([], effectiveMessage, {
    logError
  });
  const effectiveMunicipalities = currentMessageMunicipalities.length
    ? currentMessageMunicipalities
    : shouldCarryMunicipalityFromHistory(effectiveMessage)
      ? mentionedMunicipalities
      : [];
  const allowMunicipalityScopedRag = effectiveMunicipalities.length > 0 && !sourceLookupTargetsNationalLaw;
  const municipalityQuestionNeedsClarification =
    !allowMunicipalityScopedRag && isMunicipalityDependentSocialHelpQuestion(effectiveMessage);
  const baseRagQueryText = sourceLookupRequest
    ? buildSourceLookupSearchQuery(effectiveMessage, rawHistory)
    : buildRagSearchQuery(effectiveMessage, rawHistory);
  const temporalRetrievalPlan = sourceLookupRequest
    ? {
        enabled: false,
        years: [],
        focusText: "",
        queries: baseRagQueryText ? [baseRagQueryText] : []
      }
    : buildTemporalRetrievalPlan({
        message: effectiveMessage,
        history: rawHistory,
        baseQuery: baseRagQueryText
      });
  const topicHints = extractTopicHints(temporalRetrievalPlan.focusText || effectiveMessage);
  const extraSystemInstructions = [
    ...(municipalityQuestionNeedsClarification
      ? [buildMissingMunicipalityInstruction(normalizedRole, replyLang)]
      : []),
    ...(sourceLookupRequest ? [buildSourceLookupInstruction(replyLang)] : []),
    ...(!sourceLookupRequest && externalSourcesNeeded ? [buildLayeredContextInstruction(replyLang)] : []),
    ...(temporalRetrievalPlan.enabled ? [buildTemporalBreakdownInstruction(replyLang, temporalRetrievalPlan.years)] : [])
  ];

  let matches = [];
  let groupedMatches = [];
  let chosen = [];
  let budgeted = {
    text: "",
    used: []
  };
  let temporalMissingYears = [];
  const preferRagForSourceLookup = sourceLookupRequest;
  const shouldRunRag =
    externalSourcesNeeded &&
    !previousSourceUseRequest &&
    (preferRagForSourceLookup || !ephemeralChunks.length || combineSources);

  if (shouldRunRag) {
    try {
      const ragQueryText = baseRagQueryText;
      const ragQueries = sourceLookupRequest
        ? [ragQueryText]
        : temporalRetrievalPlan.enabled
          ? [
              { query: ragQueryText },
              ...temporalRetrievalPlan.years.map((year) => ({
                query: buildTemporalYearSearchQuery(temporalRetrievalPlan.focusText || ragQueryText, year),
                filters: {
                  year
                }
              }))
            ]
          : [ragQueryText];
      const sourceLookupTopK = sourceLookupRequest
        ? sourceLookupParagraphRefs.length <= 1
          ? Math.min(12, Math.max(8, RAG_TOP_K))
          : Math.min(36, Math.max(RAG_TOP_K, sourceLookupParagraphRefs.length * 5))
        : null;
      const primaryRagQueries =
        !sourceLookupRequest && allowMunicipalityScopedRag
          ? buildMunicipalityScopedQueries(ragQueries, effectiveMunicipalities)
          : ragQueries;
      const primaryRagFilters =
        !sourceLookupRequest && allowMunicipalityScopedRag
          ? buildMunicipalityScopedFilters(audienceFilter, effectiveMunicipalities)
          : audienceFilter;

      matches = await searchRagQueries({
        queries: primaryRagQueries,
        topK: sourceLookupRequest
          ? sourceLookupTopK
          : allowMunicipalityScopedRag
            ? RAG_TOP_K
            : Math.min(50, Math.max(RAG_TOP_K, RAG_TOP_K * 3)),
        filters: sourceLookupTargetsNationalLaw
          ? {
              ...audienceFilter,
              jurisdiction_level: "NATIONAL"
            }
          : primaryRagFilters,
        userId,
        role: normalizedRole,
        conversationId: convId
      });
      matches = filterMunicipalityScopedMatches(matches, {
        allowMunicipalityScoped: allowMunicipalityScopedRag
      });

      if (sourceLookupTargetsNationalLaw && matches.length === 0) {
        const nationalFallbackMatches = await searchRagQueries({
          queries: ragQueries,
          topK: sourceLookupRequest
            ? Math.min(24, Math.max(12, sourceLookupTopK || RAG_TOP_K))
            : Math.min(24, Math.max(12, RAG_TOP_K)),
          filters: audienceFilter,
          observabilityStage: "rag_search_national_fallback",
          userId,
          role: normalizedRole,
          conversationId: convId
        });
        matches = filterMunicipalityScopedMatches(nationalFallbackMatches, {
          allowMunicipalityScoped: false
        });
      }

      if (!sourceLookupRequest && allowMunicipalityScopedRag && !sourceLookupTargetsNationalLaw) {
        const backgroundMatches = await searchRagQueries({
          queries: buildGeneralBackgroundQueries(ragQueries, ragQueryText),
          topK: Math.min(12, Math.max(6, RAG_TOP_K)),
          filters: audienceFilter,
          observabilityStage: "rag_search_background_scope",
          userId,
          role: normalizedRole,
          conversationId: convId
        });
        matches = dedupeRagMatches([
          ...matches,
          ...filterMunicipalityScopedMatches(backgroundMatches, {
            allowMunicipalityScoped: false
          })
        ]);
      }
    } catch (err) {
      if (typeof logError === "function") {
        logError("rag.search.error", {
          err: err?.message,
          role: normalizedRole,
          userId
        });
      }
      if (typeof logEvent === "function") {
        await logEvent("rag_error", {
          userId,
          role: normalizedRole,
          isCrisis,
          message: err?.message || "rag search error"
        });
      }
    }

    groupedMatches = rankGroupsWithTopicHints(groupMatches(matches), topicHints);
    if (temporalRetrievalPlan.enabled) {
      const coveredYears = new Set(
        groupedMatches
          .map(extractMatchGroupYear)
          .filter((year) => Number.isInteger(year))
      );
      const missingYears = temporalRetrievalPlan.years.filter((year) => !coveredYears.has(year));
      temporalMissingYears = missingYears;
      if (missingYears.length) {
        const fallbackSettled = await Promise.allSettled(
          missingYears.map((year) =>
            searchRagQueries({
              queries: buildTemporalFillQueries({
                years: [year],
                focusText: temporalRetrievalPlan.focusText || effectiveMessage,
                message: effectiveMessage,
                topicHints
              }),
              topK: Math.max(12, RAG_TOP_K),
              filters: sourceLookupTargetsNationalLaw
                ? {
                    ...audienceFilter,
                    jurisdiction_level: "NATIONAL"
                  }
                : audienceFilter,
              observabilityStage: `rag_search_temporal_fill_${year}`,
              userId,
              role: normalizedRole,
              conversationId: convId
            })
          )
        );
        const fallbackMatches = fallbackSettled.flatMap((item) =>
          item.status === "fulfilled" && Array.isArray(item.value) ? item.value : []
        );
        matches = dedupeRagMatches([
          ...matches,
          ...filterMunicipalityScopedMatches(fallbackMatches, {
            allowMunicipalityScoped: allowMunicipalityScopedRag
          })
        ]);
        groupedMatches = rankGroupsWithTopicHints(groupMatches(matches), topicHints);
      }
    }

    chosen = temporalRetrievalPlan.enabled
      ? selectTemporalGroups(groupedMatches, temporalRetrievalPlan.years, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA)
      : diversifyGroupsMMR(groupedMatches, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA);
    budgeted = buildContextWithBudget(
      chosen,
      temporalRetrievalPlan.enabled
        ? {
            preferredYears: temporalRetrievalPlan.years
          }
        : undefined
    );
  }

  const ragContext = budgeted.text;
  const docBudget = getDocContextBudget(normalizedRole, combineSources, docContextBudgets);
  const docQueryText = [effectiveMessage, ...extractRecentUserText(rawHistory, 2)].filter(Boolean).join("\n");
  const docContextResult = buildEphemeralDocContext(ephemeralChunks, {
    queryText: docQueryText,
    charBudget: docBudget.charBudget,
    maxChunks: docBudget.maxChunks,
    maxInputChunks: docContextBudgets.maxInputChunks,
    chunkCharsMax: docContextBudgets.chunkCharsMax
  });
  const docContext = docContextResult.text;
  const contextParts = [];

  if (docContext && !preferRagForSourceLookup) {
    contextParts.push(`USER DOCUMENT:\n${docContext}`);
  }
  if (preferRagForSourceLookup) {
    if (ragContext) contextParts.push(ragContext);
  } else if (!docContext) {
    if (ragContext) contextParts.push(ragContext);
  } else if (combineSources && ragContext) {
    contextParts.push(ragContext);
  }

  const context = contextParts.filter(Boolean).join("\n\n");
  const lookupFallbackContext = sourceLookupRequest
    ? "SOURCE_LOOKUP_CONTEXT: The current targeted source lookup returned no matches."
    : "";
  const conversationalFallbackContext =
    !externalSourcesNeeded && !docContext
      ? "CONVERSATIONAL_CONTEXT: No verified external context was retrieved for this turn."
      : "";
  const effectiveContext = context && context.trim() ? context : lookupFallbackContext || conversationalFallbackContext;
  const grounding = groundingStrength(groupedMatches);
  const usedDocContext = contextParts.some((part) => part.startsWith("USER DOCUMENT:\n"));
  const usedRagContext = !!ragContext && contextParts.some((part) => part === ragContext);
  const groupedYears = Array.from(new Set(groupedMatches.map(extractMatchGroupYear).filter((year) => Number.isInteger(year))));
  const selectedYears = Array.from(new Set(chosen.map(extractMatchGroupYear).filter((year) => Number.isInteger(year))));
  const contextYears = Array.from(new Set(budgeted.used.map(extractMatchGroupYear).filter((year) => Number.isInteger(year))));

  if (typeof logInfo === "function") {
    logInfo("rag.afterSearch", {
      rawMatches: matches.length,
      groups: groupedMatches.length,
      grounding,
      mmrSelected: chosen.length,
      groupedYears,
      selectedYears,
      contextYears,
      requestedYears: temporalRetrievalPlan.enabled ? temporalRetrievalPlan.years : [],
      missingYears: temporalMissingYears,
      docChunkInputCount: ephemeralChunks.length,
      docChunkUsedCount: docContextResult.usedChunks,
      docContextChars: docContextResult.usedChars,
      ragSkipped: !shouldRunRag,
      externalSourcesNeeded,
      sourceLookupRequest,
      municipalityMentioned: allowMunicipalityScopedRag,
      municipalityMatches: effectiveMunicipalities.map((item) => item.displayName)
    });
  }

  if (typeof logEvent === "function") {
    if (shouldRunRag || usedDocContext || usedRagContext) {
      await logEvent("rag_search", {
        userId,
        role: normalizedRole,
        isCrisis,
        ragMatchCount: matches.length,
        groupCount: groupedMatches.length,
        chosenGroupCount: chosen.length,
        grounding,
        groupedYears: groupedYears.join(",") || undefined,
        selectedYears: selectedYears.join(",") || undefined,
        contextYears: contextYears.join(",") || undefined,
        requestedYears: temporalRetrievalPlan.enabled ? temporalRetrievalPlan.years.join(",") : undefined,
        missingYears: temporalMissingYears.length ? temporalMissingYears.join(",") : undefined,
        docChunkInputCount: ephemeralChunks.length,
        docChunkUsedCount: docContextResult.usedChunks,
        docContextChars: docContextResult.usedChars,
        hadDocContext: usedDocContext,
        hadRagContext: usedRagContext,
        sourceLookupRequest,
        municipalityMentioned: allowMunicipalityScopedRag,
        municipalityMatches: effectiveMunicipalities.map((item) => item.displayName)
      });
    } else {
      await logEvent("chat_no_external_sources", {
        userId,
        role: normalizedRole,
        isCrisis,
        sourceLookupRequest,
        messageLength: effectiveMessage.length
      });
    }

    if (isCrisis) {
      await logEvent("crisis_detected", {
        userId,
        role: normalizedRole,
        hasHistory,
        hadRagContext: usedRagContext
      });
    }
  }

  const docSources = ephemeralChunks && ephemeralChunks.length
    ? [{
        id: "user-document",
        title: getEphemeralSourceLabel(ephemeralSource, "(Uploaded document)"),
        url: undefined,
        file: undefined,
        fileName: getEphemeralSourceLabel(ephemeralSource, "") || undefined,
        audience: undefined,
        pageRange: undefined,
        authors: undefined,
        issueLabel: undefined,
        issueId: undefined,
        journalTitle: undefined,
        section: undefined,
        paragraphTitle: undefined,
        year: undefined,
        pages: undefined,
        short_ref: "(uploaded document)"
      }]
    : [];
  const ragSources = budgeted.used.map((entry, idx) => {
    const pageNumbers = Array.isArray(entry.pages) ? entry.pages : [];
    const pageRanges = Array.isArray(entry.pageRanges) ? Array.from(new Set(entry.pageRanges.filter(Boolean))) : [];
    const pageTextRaw = (pageRanges.length ? pageRanges.join(", ") : collapsePages(pageNumbers)).trim();
    const pageText = normalizePageRangeString(pageTextRaw);
    const shortRefText = (makeShortRef(entry, pageText) || "").trim();
    return {
      id: entry.key || entry.docId || entry.articleId || entry.url || entry.fileName || `source-${idx}`,
      title: entry.title,
      url: entry.url ? displayUrl(entry.url) : undefined,
      file: undefined,
      fileName: entry.fileName || undefined,
      audience: entry.audience || undefined,
      pageRange: pageText || undefined,
      authors: Array.isArray(entry.authors) && entry.authors.length ? entry.authors : undefined,
      issueLabel: entry.issueLabel || undefined,
      issueId: entry.issueId || undefined,
      journalTitle: entry.journalTitle || undefined,
      section: entry.section || undefined,
      paragraphTitle: entry.paragraphTitle || undefined,
      paragraphNumber: entry.paragraphNumber || undefined,
      subsectionNumber: entry.subsectionNumber || undefined,
      pointNumber: entry.pointNumber || undefined,
      year: entry.year || undefined,
      pages: pageNumbers.length ? pageNumbers : undefined,
      short_ref: shortRefText || undefined
    };
  });

  let sources;
  if (preferRagForSourceLookup) {
    sources = ragSources;
  } else if (docSources.length && combineSources) {
    sources = [...docSources, ...ragSources];
  } else if (docSources.length) {
    sources = docSources;
  } else {
    sources = ragSources;
  }

  return {
    previousSourceUseRequest,
    sourceLookupRequest,
    extraSystemInstructions,
    effectiveContext,
    grounding,
    sources,
    retrievalMeta: {
      rawMatchesCount: matches.length,
      hadDocContext: usedDocContext,
      sourceCount: Number(chosen.length || 0) + Number(usedDocContext ? docContextResult.usedChunks || 0 : 0)
    }
  };
}
