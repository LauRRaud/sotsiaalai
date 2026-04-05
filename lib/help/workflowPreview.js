import { helpWorkflowLabel, helpWorkflowT } from "./chatWorkflowText.js";
import { formatHelpTypeLabel, formatTimeTypeLabel } from "./listingViews.js";

export function createHelpWorkflowPreview({ normalizeDraft, collapseWhitespace, formatLabelledLine }) {
  function buildSummarySentence(state, replyLang) {
    const draft = normalizeDraft(state?.draft || {});
    const categoryPart = draft.category ? draft.category.toLowerCase() : "abi";
    const targetPart = draft.targetGroups.length ? ` ${draft.targetGroups.join(", ").toLowerCase()}` : "";
    const locationPart = draft.rawPlace ? ` ${draft.rawPlace}` : "";

    if (state.intent === "create_help_offer") {
      return helpWorkflowT(replyLang, "reflections.offerSummary", {
        category: categoryPart,
        target: targetPart,
        place: locationPart
      });
    }

    return helpWorkflowT(replyLang, "reflections.requestSummary", {
      category: categoryPart,
      target: targetPart,
      place: locationPart
    });
  }

  function buildChangeReflection(state, changedFields = [], replyLang = "et") {
    const draft = normalizeDraft(state?.draft || {});
    if (!changedFields.length) return "";
    if (changedFields.includes("rawPlace") || changedFields.includes("municipalityLabel")) {
      if (draft.rawPlace && state.municipalityLabel) {
        return helpWorkflowT(replyLang, "reflections.locationWithMunicipality", {
          rawPlace: draft.rawPlace,
          municipality: state.municipalityLabel
        });
      }
      if (draft.rawPlace) {
        return helpWorkflowT(replyLang, "reflections.locationOnly", {
          rawPlace: draft.rawPlace
        });
      }
    }
    if (changedFields.includes("helpType") && draft.helpType) {
      const helpTypeLabel = formatHelpTypeLabel(draft.helpType, replyLang).toLowerCase().replace(/\s+abi$/i, "");
      return helpWorkflowT(replyLang, "reflections.helpType", {
        helpType: helpTypeLabel
      });
    }
    if (changedFields.includes("timeType") && draft.timeType) {
      return helpWorkflowT(replyLang, "reflections.timeType", {
        timeType: formatTimeTypeLabel(draft.timeType, replyLang).toLowerCase()
      });
    }
    if (changedFields.includes("contactPreference") && draft.contactPreference) {
      return helpWorkflowT(replyLang, "reflections.contactPreference", {
        contactPreference: draft.contactPreference
      });
    }
    if (changedFields.includes("beneficiaryLabel") && draft.beneficiaryLabel) {
      return helpWorkflowT(replyLang, "reflections.beneficiary", {
        beneficiary: draft.beneficiaryLabel
      });
    }
    if (changedFields.includes("urgency") && draft.urgency) {
      return helpWorkflowT(replyLang, "reflections.urgency", {
        urgency: draft.urgency
      });
    }
    if (changedFields.includes("providerScopeOrConditions") && draft.providerScopeOrConditions) {
      return helpWorkflowT(replyLang, "reflections.conditions");
    }
    if (changedFields.includes("title") && draft.title) {
      return helpWorkflowT(replyLang, "reflections.title", {
        title: draft.title
      });
    }
    if (changedFields.includes("description") || changedFields.includes("categoryCode") || changedFields.includes("targetGroupCodes")) {
      return buildSummarySentence(state, replyLang);
    }
    return "";
  }

  function buildPreviewReply(state, replyLang, options = {}) {
    const prefix = collapseWhitespace(options.prefix);
    const draft = normalizeDraft(state?.draft || {});
    const lines = [];
    if (prefix) lines.push(prefix, "");
    if (state.intent === "create_help_offer") {
      lines.push(helpWorkflowT(replyLang, "preview.offerTitle"), "");
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "type", "Tüüp"), helpWorkflowT(replyLang, "preview.offerTypeValue")));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "title", "Pealkiri"), draft.title));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "description", "Kirjeldus"), draft.description));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "primaryCategory", "Põhikategooria"), draft.category));
      if (draft.secondaryCategories.length) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "secondaryCategories", "Lisakategooriad"), draft.secondaryCategories.join(", ")));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), state.municipalityLabel));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "rawPlace", "Täpsem asukoht"), draft.rawPlace));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "targetGroups", "Sihtrühm"), draft.targetGroups.join(", ")));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "helpForm", "Abi vorm"), formatHelpTypeLabel(draft.helpType, replyLang)));
      if (draft.compensationDetails) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "compensationInfo", "Tasu info"), draft.compensationDetails));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "timeType", "Ajalisus"), formatTimeTypeLabel(draft.timeType, replyLang)));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "availabilityOrStart", "Saadavus / algus"), draft.availabilityOrStart));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "conditions", "Tingimused"), draft.providerScopeOrConditions));
      if (draft.skillsOrBackground) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "skillsOrBackground", "Oskused või taust"), draft.skillsOrBackground));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "contactPreference", "Kontaktiviis"), draft.contactPreference));
    } else {
      lines.push(helpWorkflowT(replyLang, "preview.requestTitle"), "");
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "type", "Tüüp"), helpWorkflowT(replyLang, "preview.requestTypeValue")));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "title", "Pealkiri"), draft.title));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "description", "Kirjeldus"), draft.description));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "beneficiaryLabel", "Kellele abi vaja on"), draft.beneficiaryLabel));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "primaryCategory", "Põhikategooria"), draft.category));
      if (draft.secondaryCategories.length) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "secondaryCategories", "Lisakategooriad"), draft.secondaryCategories.join(", ")));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), state.municipalityLabel));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "rawPlace", "Täpsem asukoht"), draft.rawPlace));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "targetGroups", "Sihtrühm"), draft.targetGroups.join(", ")));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "helpForm", "Abi vorm"), formatHelpTypeLabel(draft.helpType, replyLang)));
      if (draft.compensationDetails) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "compensationPreference", "Tasu eelistus"), draft.compensationDetails));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "urgency", "Kiireloomulisus"), draft.urgency));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "timeType", "Ajalisus"), formatTimeTypeLabel(draft.timeType, replyLang)));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "availabilityForRequest", "Vajalik aeg / algus"), draft.availabilityOrStart));
      if (draft.conditions) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "conditions", "Tingimused"), draft.conditions));
      lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "contactPreference", "Kontaktiviis"), draft.contactPreference));
    }
    lines.push("", helpWorkflowT(replyLang, "preview.savePrompt"));
    return lines.join("\n");
  }

  return {
    buildChangeReflection,
    buildPreviewReply,
    buildSummarySentence
  };
}
