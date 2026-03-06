export const HELP_CHAT_INTENTS = Object.freeze([
  "create_help_request",
  "create_help_offer",
  "browse_help_requests",
  "browse_help_offers",
  "connect_to_offer",
  "connect_to_request",
  "service_guidance"
]);

function normalizeIntentText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

export function isHelpChatIntent(value) {
  return HELP_CHAT_INTENTS.includes(String(value || "").trim());
}

export function detectHelpChatIntent(text = "") {
  const normalized = normalizeIntentText(text);
  if (!normalized) return null;

  const wantsBrowse = /\b(sirvi|vaata|otsi|browse|list|show|find)\b/.test(normalized);
  const wantsCreate = /\b(loo|koosta|sisesta|create|post|publish|offer|request|vajan|pakun|vormista|aita mul vormistada|aita teha)\b/.test(normalized);
  const wantsConnect = /\b(uhenda|yhenda|connect|match|contact|vota uhendust|get in touch)\b/.test(normalized);
  const wantsGuidance = /\?/.test(text) || /\b(kas|kuidas|where|where can|what service|mis teenus|mida teha|can i|get support)\b/.test(normalized);
  const mentionsRequest = /\b(abipalv\w*|abisoov\w*|help request|request|vajan abi|otsin abi|abi vaja)\b/.test(normalized);
  const mentionsOffer = /\b(abipakkumis\w*|pakkumis\w*|help offer|offer|pakun abi|soovin pakkuda|pakkuda abi)\b/.test(normalized);
  const mentionsService = /\b(teenus|service|omavalitsus|municipality|vald|linn)\b/.test(normalized);
  const naturalRequest = /\b(oleks vaja|vajan|otsin)\b/.test(normalized) && /\babi\b/.test(normalized);
  const naturalOffer = /\b(soovin pakkuda|pakun)\b/.test(normalized) && /\b(abi|transporti|koduabi|saatmist|toitu)\b/.test(normalized);

  if (wantsConnect && mentionsOffer) return "connect_to_offer";
  if (wantsConnect && mentionsRequest) return "connect_to_request";
  if (wantsBrowse && mentionsRequest) return "browse_help_requests";
  if (wantsBrowse && mentionsOffer) return "browse_help_offers";
  if (wantsCreate && mentionsOffer) return "create_help_offer";
  if (wantsCreate && mentionsRequest) return "create_help_request";
  if (naturalOffer) return "create_help_offer";
  if (naturalRequest) return "create_help_request";
  if (wantsGuidance && (mentionsService || mentionsRequest || mentionsOffer)) return "service_guidance";
  return null;
}
