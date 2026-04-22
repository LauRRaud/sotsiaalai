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
import { buildTemporalRetrievalPlan, buildTemporalBreakdownInstruction, buildTemporalFillQueries, extractTopicHints } from "@/lib/chat/retrievalPlanning";
import {
  extractRecentUserText,
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
  const sourceLookupTargetsNationalLaw = sourceLookupRequest && sourceLookupSubject === "Sotsiaalhoolekande seadus";

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
  const allowMunicipalityScopedRag = mentionedMunicipalities.length > 0 && !sourceLookupTargetsNationalLaw;
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
  const shouldRunRag = externalSourcesNeeded && (!ephemeralChunks.length || combineSources) && !previousSourceUseRequest;

  if (shouldRunRag) {
    try {
      const ragQueryText = baseRagQueryText;
      const ragQueries = sourceLookupRequest
        ? [ragQueryText]
        : temporalRetrievalPlan.enabled
          ? [
              { query: ragQueryText },
              ...temporalRetrievalPlan.years.map((year) => ({
                query: [temporalRetrievalPlan.focusText || ragQueryText, String(year)].filter(Boolean).join("\n").trim(),
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

      matches = await searchRagQueries({
        queries: ragQueries,
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
          : audienceFilter,
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

      if (!allowMunicipalityScopedRag && !sourceLookupTargetsNationalLaw) {
        const nationalMatches = await searchRagQueries({
          queries: ragQueries,
          topK: sourceLookupRequest
            ? Math.min(24, Math.max(8, RAG_TOP_K))
            : Math.min(12, Math.max(4, RAG_TOP_K)),
          filters: {
            ...audienceFilter,
            jurisdiction_level: "NATIONAL"
          },
          observabilityStage: "rag_search_national_scope",
          userId,
          role: normalizedRole,
          conversationId: convId
        });
        matches = dedupeRagMatches([
          ...filterMunicipalityScopedMatches(nationalMatches, {
            allowMunicipalityScoped: false
          }),
          ...matches
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

  if (docContext) {
    contextParts.push(`USER DOCUMENT:\n${docContext}`);
  }
  if (!docContext) {
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
  const hadDocContext = !!docContext;
  const hadRagContext = !!ragContext;
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
      municipalityMatches: mentionedMunicipalities.map((item) => item.displayName)
    });
  }

  if (typeof logEvent === "function") {
    if (shouldRunRag || hadDocContext || hadRagContext) {
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
        hadDocContext,
        hadRagContext,
        sourceLookupRequest,
        municipalityMentioned: allowMunicipalityScopedRag,
        municipalityMatches: mentionedMunicipalities.map((item) => item.displayName)
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
        hadRagContext
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
  if (docSources.length && combineSources) {
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
      hadDocContext,
      sourceCount: Number(chosen.length || 0) + Number(docContextResult.usedChunks || 0)
    }
  };
}
