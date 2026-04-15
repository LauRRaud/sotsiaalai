import { helpWorkflowLabel, helpWorkflowT } from "./chatWorkflowText.js";

export function createHelpWorkflowActions({
  buildHelpListingMetaLine,
  buildIntentTitle,
  createHelpMatch,
  createHelpOffer,
  createHelpRequest,
  createHelpWorkflowDraftState,
  formatHelpTypeLabel,
  formatTimeTypeLabel,
  formatLabelledLine,
  generateStructuredSummary,
  isAffirmative,
  isNegative,
  listAlternativeOffersForRequest,
  listAlternativeRequestsForOffer,
  listMatchingOffersForRequest,
  listMatchingRequestsForOffer,
  normalizeDraft,
  parseOrdinalSelection,
  toHelpListingView
}) {
  function buildSavedReply(state, record, replyLang, options = {}) {
    const includeNextStep = options?.includeNextStep !== false;

    return [
      helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "saved.offer" : "saved.request"),
      helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "saved.offerPublished" : "saved.requestPublished"),
      helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "saved.checkingRequests" : "saved.checkingOffers"),
      ...(includeNextStep
        ? [
            "",
            helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "browse.nextRequests" : "browse.nextOffers")
          ]
        : [])
    ].filter(Boolean).join("\n");
  }

  function browseIntentFromState(state) {
    return state.intent === "create_help_offer" || state.intent === "browse_help_requests" || state.intent === "connect_to_request"
      ? "browse_help_requests"
      : "browse_help_offers";
  }

  function connectIntentFromBrowseIntent(intent = "") {
    return intent === "browse_help_requests" ? "connect_to_request" : "connect_to_offer";
  }

  function normalizeCompatibilityWarnings(warnings = []) {
    return (Array.isArray(warnings) ? warnings : [])
      .map((value) => {
        const normalized = String(value || "").trim();
        if (normalized === "help_type_mismatch") return "help_type_incompatible";
        if (normalized === "time_type_mismatch") return "time_type_incompatible";
        return normalized;
      })
      .filter(Boolean);
  }

  function buildCompatibilitySummary(source = {}, candidate = {}, warningCodes = [], replyLang = "et") {
    const normalizedWarnings = normalizeCompatibilityWarnings(warningCodes);
    const lines = [];
    if (normalizedWarnings.includes("help_type_incompatible")) {
      const sourceLabel = formatHelpTypeLabel(source?.helpType || "", replyLang).toLowerCase();
      const candidateLabel = formatHelpTypeLabel(candidate?.helpType || "", replyLang).toLowerCase();
      if (sourceLabel && candidateLabel && sourceLabel !== candidateLabel) {
        lines.push(helpWorkflowT(replyLang, "browse.compatibilityHelpType", {
          sourceHelpType: sourceLabel,
          candidateHelpType: candidateLabel
        }));
      }
    }
    if (normalizedWarnings.includes("time_type_incompatible")) {
      const sourceLabel = formatTimeTypeLabel(source?.timeType || "", replyLang).toLowerCase();
      const candidateLabel = formatTimeTypeLabel(candidate?.timeType || "", replyLang).toLowerCase();
      if (sourceLabel && candidateLabel && sourceLabel !== candidateLabel) {
        lines.push(helpWorkflowT(replyLang, "browse.compatibilityTimeType", {
          sourceTimeType: sourceLabel,
          candidateTimeType: candidateLabel
        }));
      }
    }
    return lines.filter(Boolean).join("\n");
  }

  function decorateBrowseResults(results = [], sourceDraft = {}, replyLang = "et") {
    return results.map((item) => ({
      ...item,
      compatibilityWarnings: normalizeCompatibilityWarnings(item?.compatibilityWarnings),
      listingView: item?.listingView || toHelpListingView(item, { kind: item.kind, locale: replyLang }),
      compatibilitySummary: item?.compatibilitySummary
        || (Array.isArray(item?.compatibilityWarnings) && item.compatibilityWarnings.length
          ? buildCompatibilitySummary(sourceDraft, item, item.compatibilityWarnings, replyLang)
          : "")
    }));
  }

  function resolveCompatibilitySummary(state, item, replyLang = "et") {
    if (!item) return "";
    if (item?.compatibilitySummary) return item.compatibilitySummary;
    const warnings = Array.isArray(item?.compatibilityWarnings) ? item.compatibilityWarnings : [];
    if (!warnings.length) return "";
    return buildCompatibilitySummary(state?.draft || {}, item, warnings, replyLang);
  }

  function buildBrowseReply(intent, results, replyLang, options = {}) {
    if (!results.length) {
      return helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.emptyOffers" : "browse.emptyRequests");
    }

    const hasCompatibilityAlternatives = results.some((item) => Array.isArray(item?.compatibilityWarnings) && item.compatibilityWarnings.length);

    const lines = results.map((item, index) => {
      const listingView = item?.listingView || toHelpListingView(item, { kind: item.kind, locale: replyLang });
      const meta = buildHelpListingMetaLine(listingView, replyLang);
      return [
        `${index + 1}. ${listingView.title}`,
        listingView.summary || "",
        meta || "",
        item?.compatibilitySummary || "",
        listingView.municipalityLabel
          ? formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), listingView.municipalityLabel)
          : ""
      ].filter(Boolean).join("\n");
    });

    return [
      hasCompatibilityAlternatives
        ? helpWorkflowT(
            replyLang,
            intent === "browse_help_offers" ? "browse.foundAlternativeOffersHelpType" : "browse.foundAlternativeRequestsHelpType",
            { count: results.length }
          )
        : helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.foundOffers" : "browse.foundRequests", {
            count: results.length
          }),
      "",
      lines.join("\n\n"),
      "",
      helpWorkflowT(
        replyLang,
        hasCompatibilityAlternatives
          ? (intent === "browse_help_offers" ? "browse.connectHintAlternativeOffers" : "browse.connectHintAlternativeRequests")
          : (intent === "browse_help_offers" ? "browse.connectHintOffers" : "browse.connectHintRequests")
      )
    ].join("\n");
  }

  async function saveStructuredRecord(state, userId, prismaClient) {
    const draft = normalizeDraft(state?.draft || {});
    const descriptionLines = [
      draft.description,
      state.intent === "create_help_request" && draft.beneficiaryLabel ? `Kellele abi vaja on: ${draft.beneficiaryLabel}` : "",
      state.intent === "create_help_request" && draft.urgency ? `Kiireloomulisus: ${draft.urgency}` : "",
      state.intent === "create_help_offer" && draft.providerScopeOrConditions ? `Tingimused: ${draft.providerScopeOrConditions}` : "",
      draft.category ? `Põhikategooria: ${draft.category}` : "",
      state.municipalityLabel ? `Omavalitsus: ${state.municipalityLabel}` : "",
      draft.rawPlace ? `Täpsem asukoht: ${draft.rawPlace}` : "",
      draft.targetGroups.length ? `Sihtrühm: ${draft.targetGroups.join(", ")}` : "",
      draft.helpType ? `Abi vorm: ${formatHelpTypeLabel(draft.helpType, "et")}` : "",
      draft.compensationDetails ? `Tasu info: ${draft.compensationDetails}` : "",
      draft.timeType ? `Ajalisus: ${formatTimeTypeLabel(draft.timeType, "et")}` : "",
      draft.availabilityOrStart ? `Saadavus / algus: ${draft.availabilityOrStart}` : "",
      draft.conditions ? `Lisatingimused: ${draft.conditions}` : "",
      draft.skillsOrBackground ? `Oskused või taust: ${draft.skillsOrBackground}` : ""
    ].filter(Boolean);

    const sharedPayload = {
      userId,
      municipalityId: state.municipalityId,
      primaryCategoryCode: draft.categoryCode || undefined,
      category: draft.category,
      serviceLabel: draft.category || draft.title,
      title: draft.title || buildIntentTitle(state.intent),
      description: descriptionLines.join("\n"),
      structuredSummary: draft.structuredSummary || generateStructuredSummary(draft, state.municipalityLabel, state.intent),
      roleLabel: state.intent === "create_help_request"
        ? draft.beneficiaryLabel || draft.category
        : draft.providerScopeOrConditions || draft.category,
      beneficiaryLabel: state.intent === "create_help_request" ? draft.beneficiaryLabel || undefined : undefined,
      urgency: state.intent === "create_help_request" ? draft.urgency || undefined : undefined,
      providerScopeOrConditions: state.intent === "create_help_offer" ? draft.providerScopeOrConditions || undefined : undefined,
      availabilityOrStart: draft.availabilityOrStart || undefined,
      compensationDetails: draft.compensationDetails || undefined,
      conditions: draft.conditions || undefined,
      skillsOrBackground: draft.skillsOrBackground || undefined,
      helpType: draft.helpType || undefined,
      timeType: draft.timeType,
      targetGroupCodes: draft.targetGroupCodes,
      rawPlace: draft.rawPlace || undefined,
      classificationSource: "USER",
      userConfirmedAt: new Date().toISOString()
    };

    if (state.intent === "create_help_offer") {
      return createHelpOffer(sharedPayload, prismaClient);
    }

    return createHelpRequest(sharedPayload, prismaClient);
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

  function isCreateHelpIntent(intent = "") {
    return intent === "create_help_request" || intent === "create_help_offer";
  }

  function isBrowseHelpIntent(intent = "") {
    return intent === "browse_help_offers" || intent === "browse_help_requests";
  }

  function isConnectHelpIntent(intent = "") {
    return intent === "connect_to_offer" || intent === "connect_to_request";
  }

  async function handleBrowseTurn({ state, replyLang, prismaClient }) {
    const intent = browseIntentFromState(state);
    const sourceId = intent === "browse_help_offers" ? state.linkedRequestId || state.sourceRecordId : state.linkedOfferId || state.sourceRecordId;

    if (!sourceId) {
      return {
        handled: true,
        workflowState: state,
        reply: helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.sourceMissingOffers" : "browse.sourceMissingRequests"),
        cards: [],
        attachments: []
      };
    }

    const rawResults = intent === "browse_help_offers"
      ? await listMatchingOffersForRequest(sourceId, { limit: 5 }, prismaClient)
      : await listMatchingRequestsForOffer(sourceId, { limit: 5 }, prismaClient);
    const alternativeResults = !rawResults.length
      ? (intent === "browse_help_offers"
          ? await listAlternativeOffersForRequest(sourceId, { limit: 5 }, prismaClient)
          : await listAlternativeRequestsForOffer(sourceId, { limit: 5 }, prismaClient))
      : [];
    const results = decorateBrowseResults(
      rawResults.length ? rawResults : alternativeResults,
      state?.draft || {},
      replyLang
    );

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
      cards: [],
      attachments: []
    };
  }

  function findSelectedBrowseResult(state, requestId = "", offerId = "") {
    return (state?.browseResults || []).find((item) => (
      (item.kind === "offer" && item.id === offerId)
      || (item.kind === "request" && item.id === requestId)
    )) || null;
  }

  async function handleConnectTurn({ state, message, replyLang, prismaClient }) {
    if (state.confirmationPending && (state.candidateRequestId || state.candidateOfferId)) {
      const pendingSelection = findSelectedBrowseResult(state, state.candidateRequestId, state.candidateOfferId);
      const compatibilitySummary = resolveCompatibilitySummary(state, pendingSelection, replyLang);
      if (isAffirmative(message)) {
        try {
          const match = await createHelpMatch({
            requestId: state.candidateRequestId,
            offerId: state.candidateOfferId,
            allowSoftFailures: true
          }, prismaClient);

          const nextState = createHelpWorkflowDraftState({
            ...state,
            mode: "done",
            step: "connect",
            matchId: match.id,
            roomId: match.roomId,
            confirmationPending: false,
            candidateRequestId: null,
            candidateOfferId: null
          });

          return {
            handled: true,
            workflowState: nextState,
            reply: helpWorkflowT(replyLang, "connect.created"),
            cards: [],
            attachments: []
          };
        } catch (error) {
          return {
            handled: true,
            workflowState: state,
            reply: helpWorkflowT(replyLang, error?.code === "HELP_MATCH_ALREADY_ACTIVE" ? "connect.alreadyActive" : "connect.failed"),
            cards: [],
            attachments: []
          };
        }
      }

      if (isNegative(message)) {
        const nextState = createHelpWorkflowDraftState({
          ...state,
          mode: "browse",
          step: "browse",
          intent: browseIntentFromState(state),
          confirmationPending: false,
          candidateRequestId: null,
          candidateOfferId: null
        });
        return {
          handled: true,
          workflowState: nextState,
          reply: helpWorkflowT(replyLang, "connect.cancelledSoftMatch"),
          cards: [],
          attachments: []
        };
      }

      return {
        handled: true,
        workflowState: state,
        reply: [
          compatibilitySummary,
          helpWorkflowT(replyLang, "connect.confirmHelpTypeMismatchRetry")
        ].filter(Boolean).join("\n")
          || helpWorkflowT(replyLang, "connect.confirmHelpTypeMismatchRetry"),
        cards: [],
        attachments: []
      };
    }

    if (!state.browseResults?.length) {
      return {
        handled: true,
        workflowState: state,
        reply: helpWorkflowT(replyLang, "connect.needBrowse"),
        cards: [],
        attachments: []
      };
    }

    const selected = resolveBrowseSelection(message, state.browseResults);
    if (!selected) {
      return {
        handled: true,
        workflowState: state,
        reply: helpWorkflowT(replyLang, "connect.askWhich"),
        cards: [],
        attachments: []
      };
    }

    const requestId = selected.kind === "offer"
      ? state.linkedRequestId || state.sourceRecordId
      : selected.id;
    const offerId = selected.kind === "offer"
      ? selected.id
      : state.linkedOfferId || state.sourceRecordId;

    if (selected.requiresConfirmation === true) {
      const compatibilitySummary = resolveCompatibilitySummary(state, selected, replyLang);
      const nextState = createHelpWorkflowDraftState({
        ...state,
        mode: "browse",
        step: "connect",
        intent: connectIntentFromBrowseIntent(browseIntentFromState(state)),
        candidateRequestId: requestId,
        candidateOfferId: offerId,
        confirmationPending: true
      });
      return {
        handled: true,
        workflowState: nextState,
        reply: [
          helpWorkflowT(replyLang, "connect.confirmHelpTypeMismatch"),
          compatibilitySummary,
          helpWorkflowT(replyLang, "connect.confirmHelpTypeMismatchRetry")
        ].filter(Boolean).join("\n"),
        cards: [],
        attachments: []
      };
    }

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
        reply: helpWorkflowT(replyLang, "connect.created"),
        cards: [],
        attachments: []
      };
    } catch (error) {
      return {
        handled: true,
        workflowState: state,
        reply: helpWorkflowT(replyLang, error?.code === "HELP_MATCH_ALREADY_ACTIVE" ? "connect.alreadyActive" : "connect.failed"),
        cards: [],
        attachments: []
      };
    }
  }

  return {
    buildBrowseReply,
    buildSavedReply,
    handleBrowseTurn,
    handleConnectTurn,
    isBrowseHelpIntent,
    isConnectHelpIntent,
    isCreateHelpIntent,
    saveStructuredRecord
  };
}
