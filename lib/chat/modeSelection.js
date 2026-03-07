export const CHAT_MODE_SELECTION_VALUES = Object.freeze([
  "document",
  "rag",
  "help_request",
  "help_offer"
]);

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

function getMessageText(entry) {
  return String(entry?.text || entry?.content || "").trim();
}

function isUserRole(role = "") {
  const normalized = String(role || "").toLowerCase();
  return normalized === "user" || normalized === "client";
}

function isAssistantRole(role = "") {
  return String(role || "").toLowerCase() === "ai" || String(role || "").toLowerCase() === "assistant";
}

function isAffirmative(text = "") {
  const normalized = normalizeText(text);
  return /^(jah|jaa|yes|y|ok|okay|okei|sobib|kinnitan|confirm)\b/.test(normalized);
}

function isNegative(text = "") {
  const normalized = normalizeText(text);
  return /^(ei|no|nope|vale|mitte see)\b/.test(normalized);
}

function isSubstantiveMessage(text = "") {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length >= 2;
}

function modeSelectionHeader(replyLang = "et") {
  if (replyLang === "en") return "Please confirm what you want to do next:";
  if (replyLang === "ru") return "Podtverdite, chto imenno vy khotite sdelat dalshe:";
  return "Kinnita palun, mida soovid edasi teha:";
}

function modeSelectionSuggestionLabel(replyLang = "et") {
  if (replyLang === "en") return "Suggested choice";
  if (replyLang === "ru") return "Rekomenduemyi variant";
  return "Soovitatud valik";
}

function modeSelectionReprompt(replyLang = "et") {
  if (replyLang === "en") return "Reply \"yes\" to confirm. If not, choose 1, 2, 3, or 4, or write the option in words.";
  if (replyLang === "ru") return "Otvette \"da\", chtoby podtverdit. Esli net, vyberite 1, 2, 3 ili 4 ili napishite variant slovami.";
  return "Vasta \"jah\", et kinnitada. Kui mitte, vali 1, 2, 3 voi 4 voi kirjuta variant sonadega.";
}

function modeLabel(mode = "rag", replyLang = "et") {
  if (replyLang === "en") {
    if (mode === "document") return "2. Draft a document or report";
    if (mode === "help_request") return "3. Structure a help request";
    if (mode === "help_offer") return "4. Structure a help offer";
    return "1. Get information and guidance";
  }
  if (replyLang === "ru") {
    if (mode === "document") return "2. Podgotovit dokument ili otchyot";
    if (mode === "help_request") return "3. Oformit zapros na pomoshch";
    if (mode === "help_offer") return "4. Oformit predlozhenie pomoshchi";
    return "1. Poluchit informatsiyu i poshagovoe rukovodstvo";
  }
  if (mode === "document") return "2. Koostada dokument voi aruanne";
  if (mode === "help_request") return "3. Vormistada abisoov";
  if (mode === "help_offer") return "4. Vormistada abipakkumine";
  return "1. Saada infot ja juhendamist";
}

function buildConfirmationLead(mode = "rag", replyLang = "et") {
  if (replyLang === "en") {
    if (mode === "document") return "I understood that you want to draft a document or report. Do you want me to open document drafting mode?";
    if (mode === "help_request") return "I understood that you want to form this into a help request. Do you want me to help structure it as a help request?";
    if (mode === "help_offer") return "I understood that you want to form this into a help offer. Do you want me to help structure it as a help offer?";
    return "I understood that you want information or guidance. Do you want me to look up the relevant information and explain the next steps?";
  }
  if (replyLang === "ru") {
    if (mode === "document") return "Ya ponyal, chto vy khotite podgotovit dokument ili otchyot. Otkryt rezhim sostavleniya dokumenta?";
    if (mode === "help_request") return "Ya ponyal, chto vy khotite oformit eto kak zapros na pomoshch. Pomoch strukturirovat eto kak zapros na pomoshch?";
    if (mode === "help_offer") return "Ya ponyal, chto vy khotite oformit eto kak predlozhenie pomoshchi. Pomoch strukturirovat eto kak predlozhenie pomoshchi?";
    return "Ya ponyal, chto vy khotite poluchit informatsiyu ili rukovodstvo. Iskat nuzhnuyu informatsiyu i obyasnit sleduyushchie shagi?";
  }
  if (mode === "document") return "Sain aru, et soovid koostada dokumenti voi aruannet. Kas soovid, et avan dokumendi koostamise reziimi?";
  if (mode === "help_request") return "Sain aru, et soovid selle vormistada abisoovina. Kas soovid, et aitan selle abisoovina vormistada?";
  if (mode === "help_offer") return "Sain aru, et soovid selle vormistada abipakkumisena. Kas soovid, et aitan selle abipakkumisena vormistada?";
  return "Sain aru, et soovid saada infot voi juhendamist. Kas soovid, et otsin vajaliku info ja selgitan jargmisi samme?";
}

function buildAlternativeLead(replyLang = "et") {
  if (replyLang === "en") return "If this is not the right direction, choose the better option:";
  if (replyLang === "ru") return "Esli eto ne to napravlenie, vyberite podkhodyashchii variant:";
  return "Kui see ei ole oige suund, vali sobivam variant:";
}

export function inferSuggestedMode({ helpIntent = null, documentTaskIntent = false } = {}) {
  if (documentTaskIntent) return "document";
  if (helpIntent === "create_help_request") return "help_request";
  if (helpIntent === "create_help_offer") return "help_offer";
  return "rag";
}

export function buildModeSelectionPrompt({ replyLang = "et", suggestedMode = "rag" } = {}) {
  return [
    buildConfirmationLead(suggestedMode, replyLang),
    "",
    `${modeSelectionSuggestionLabel(replyLang)}: ${modeLabel(suggestedMode, replyLang)}`,
    buildAlternativeLead(replyLang),
    modeLabel("rag", replyLang),
    modeLabel("document", replyLang),
    modeLabel("help_request", replyLang),
    modeLabel("help_offer", replyLang),
    "",
    modeSelectionHeader(replyLang),
    modeSelectionReprompt(replyLang)
  ].join("\n");
}

function buildAlternativeOnlyPrompt(replyLang = "et") {
  return [
    buildAlternativeLead(replyLang),
    modeLabel("rag", replyLang),
    modeLabel("document", replyLang),
    modeLabel("help_request", replyLang),
    modeLabel("help_offer", replyLang),
    "",
    modeSelectionHeader(replyLang),
    modeSelectionReprompt(replyLang)
  ].join("\n");
}

function parseSuggestedModeFromPrompt(text = "") {
  const normalized = normalizeText(text);
  if (!normalized) return null;
  const match = normalized.match(/(soovitatud valik|suggested choice|rekomenduemyi variant)\s*:\s*([1234])/);
  if (!match) return null;
  if (match[2] === "2") return "document";
  if (match[2] === "3") return "help_request";
  if (match[2] === "4") return "help_offer";
  return "rag";
}

function isModeSelectionPrompt(text = "") {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  return normalized.includes(normalizeText(modeSelectionHeader("et")))
    || normalized.includes(normalizeText(modeSelectionHeader("en")))
    || normalized.includes(normalizeText(modeSelectionHeader("ru")))
    || normalized.includes(normalizeText(buildAlternativeLead("et")))
    || normalized.includes(normalizeText(buildAlternativeLead("en")))
    || normalized.includes(normalizeText(buildAlternativeLead("ru")));
}

export function getPendingModeSelection(history = []) {
  if (!Array.isArray(history) || !history.length) return null;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i];
    if (!isAssistantRole(entry?.role)) continue;
    const text = getMessageText(entry);
    if (!isModeSelectionPrompt(text)) continue;
    let sourceMessage = "";
    for (let j = i - 1; j >= 0; j -= 1) {
      const previous = history[j];
      if (!isUserRole(previous?.role)) continue;
      sourceMessage = getMessageText(previous);
      if (sourceMessage) break;
    }
    return {
      promptText: text,
      suggestedMode: parseSuggestedModeFromPrompt(text) || "rag",
      sourceMessage
    };
  }
  return null;
}

export function parseModeChoice(message = "", suggestedMode = "rag") {
  const normalized = normalizeText(message);
  if (!normalized) return null;
  if (isAffirmative(normalized)) return suggestedMode;
  if (/^(1|info|juhendamine|selgitus|noustamine|nõustamine|information|guidance|advice|andmebaas|teadmusbaas)\b/.test(normalized)) return "rag";
  if (/^(2|dokument|dokumendi|dokumendi koostamine|aruanne|aruande|raport|taotlus|kiri|document|draft|report)\b/.test(normalized)) return "document";
  if (/^(3|abisoov|abipalve|help request|request)\b/.test(normalized)) return "help_request";
  if (/^(4|abipakkumine|help offer|offer|pakkumine)\b/.test(normalized)) return "help_offer";
  return null;
}

export function resolveModeSelection(input = {}) {
  const message = String(input?.message || "").trim();
  const history = Array.isArray(input?.history) ? input.history : [];
  const replyLang = String(input?.replyLang || "et").trim() || "et";
  const suggestedMode = inferSuggestedMode({
    helpIntent: input?.helpIntent || null,
    documentTaskIntent: input?.documentTaskIntent === true
  });
  const pending = getPendingModeSelection(history);

  if (pending) {
    if (isNegative(message)) {
      return {
        handled: true,
        pending,
        suggestedMode: pending.suggestedMode,
        resolvedMode: null,
        routedMessage: pending.sourceMessage || "",
        reply: buildAlternativeOnlyPrompt(replyLang)
      };
    }
    const resolvedMode = parseModeChoice(message, pending.suggestedMode);
    if (resolvedMode) {
      return {
        handled: false,
        pending,
        suggestedMode: pending.suggestedMode,
        resolvedMode,
        routedMessage: pending.sourceMessage || message
      };
    }
    return {
      handled: true,
      pending,
      suggestedMode: pending.suggestedMode,
      resolvedMode: null,
      routedMessage: pending.sourceMessage || "",
      reply: buildModeSelectionPrompt({
        replyLang,
        suggestedMode: pending.suggestedMode
      })
    };
  }

  if (input?.skipSelection === true || !isSubstantiveMessage(message)) {
    return {
      handled: false,
      pending,
      suggestedMode,
      resolvedMode: null,
      routedMessage: message
    };
  }

  return {
    handled: true,
    pending: null,
    suggestedMode,
    resolvedMode: null,
    routedMessage: message,
    reply: buildModeSelectionPrompt({
      replyLang,
      suggestedMode
    })
  };
}

export function buildModeSelectionMetadata(mode = "rag") {
  return {
    workflow: {
      modeSelection: {
        pending: true,
        suggestedMode: CHAT_MODE_SELECTION_VALUES.includes(mode) ? mode : "rag"
      }
    }
  };
}
