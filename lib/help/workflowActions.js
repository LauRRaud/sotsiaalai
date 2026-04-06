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
  listMatchingOffersForRequest,
  listMatchingRequestsForOffer,
  normalizeDraft,
  parseOrdinalSelection,
  toHelpListingView
}) {
  function buildSavedReply(state, record, replyLang, options = {}) {
    const includeNextStep = options?.includeNextStep !== false;
    const listingView = toHelpListingView(record, {
      kind: state.intent === "create_help_offer" ? "offer" : "request",
      locale: replyLang
    });
    const metaLine = buildHelpListingMetaLine(listingView, replyLang);

    return [
      helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "saved.offer" : "saved.request"),
      "",
      listingView.title,
      listingView.summary || record.description || state.draft.description || "-",
      metaLine || "",
      listingView.municipalityLabel
        ? formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), listingView.municipalityLabel)
        : "",
      listingView.statusLabel
        ? formatLabelledLine(helpWorkflowLabel(replyLang, "status", "Status"), listingView.statusLabel)
        : "",
      ...(includeNextStep
        ? [
            "",
            helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "browse.nextRequests" : "browse.nextOffers")
          ]
        : [])
    ].filter(Boolean).join("\n");
  }

  function buildBrowseReply(intent, results, replyLang) {
    if (!results.length) {
      return helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.emptyOffers" : "browse.emptyRequests");
    }

    const lines = results.map((item, index) => {
      const listingView = item?.listingView || toHelpListingView(item, { kind: item.kind, locale: replyLang });
      const meta = buildHelpListingMetaLine(listingView, replyLang);
      return [
        `${index + 1}. ${listingView.title}`,
        listingView.summary || "",
        meta || "",
        listingView.municipalityLabel
          ? formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), listingView.municipalityLabel)
          : ""
      ].filter(Boolean).join("\n");
    });

    return [
      helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.foundOffers" : "browse.foundRequests", {
        count: results.length
      }),
      "",
      lines.join("\n\n"),
      "",
      helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.connectHintOffers" : "browse.connectHintRequests")
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
    const intent = state.intent === "create_help_offer" || state.intent === "browse_help_requests"
      ? "browse_help_requests"
      : "browse_help_offers";
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
      cards: [],
      attachments: []
    };
  }

  async function handleConnectTurn({ state, message, replyLang, prismaClient }) {
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
