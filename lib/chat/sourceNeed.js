export function normalizeSourceNeedText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function isAssistantSourceUiIssue(message = "") {
  const text = normalizeSourceNeedText(message);
  if (!text) return false;
  const mentionsSources = /(allik|viide|viited|\bsource\b|\bsources\b|\bcite\b|\bcitation\b|\brag\b)/.test(text);
  if (!mentionsSources) return false;
  return /\b(miks|mida teha|kuidas|kaasa|tarbet|uleliig|ebavajal|naeb|naitab|kuvab|tekib|tekkis|valtida|selliseid vastuseid|allikarea|vastuste allikad|ilma otsese)\b/.test(text);
}

export function isLikelyConversationalTurn(message = "") {
  const text = normalizeSourceNeedText(message).replace(/[.!?\s]+$/g, "");
  if (!text) return false;
  if (/^(tere|hei|hey|hello|hi|tsau|aitah|tanan|selge|ok|okei|jah|jaa|ei|sobib|hea|vaga hea)$/.test(text)) return true;
  if (/\b(mina olen|ma olen|mu nimi on|my name is|i am)\b/.test(text) && text.split(/\s+/).length <= 12) return true;
  if (/\b(tundub|paistab|naib)\b.*\b(hea|korras|ok|okei|sobiv)\b/.test(text) && text.split(/\s+/).length <= 12) return true;
  if (/^(kas )?(koik|k6ik|kik).*\b(hea|korras|ok|okei)\b/.test(text)) return true;
  return false;
}

function isShortRetrievalFollowup(message = "") {
  const text = normalizeSourceNeedText(message).replace(/[.!?\s]+$/g, "");
  if (!text) return false;
  return /^(jah|jaa|jep|ok|okei|selge|sobib|hea|vaga hea|ei)$/.test(text);
}

function isAffirmativeRetrievalFollowup(message = "") {
  const text = normalizeSourceNeedText(message).replace(/[.!?\s]+$/g, "");
  if (!text) return false;
  return /^(jah|jaa|jep|ok|okei|palun|sobib|1|2|3)$/.test(text);
}

function isServiceJurisdictionLookup(message = "") {
  const text = normalizeSourceNeedText(message);
  if (!text) return false;
  const mentionsService = /\b[a-z0-9]*teenus[a-z0-9]*\b/u.test(text);
  const mentionsJurisdiction = /\b(kov|kohalik|kohaliku|omavalitsus|omavalitsuse|riik|riigi|riiklik|riiklikud|riikliku)\b/.test(text);
  const asksClassification = /\b(kas|on|voi|kumma|kumb|kuulub|korraldab|vastutab|vastutus)\b/.test(text);
  return mentionsService && mentionsJurisdiction && asksClassification;
}

function isTargetGroupRetrievalFollowup(message = "") {
  const text = normalizeSourceNeedText(message).replace(/[.!?\s]+$/g, "");
  if (!text || text.length > 90) return false;
  return /\b(laps|lapse|lapsele|lapsed|laste|alaealine|alaealisele|pere|perele|vanem|vanemale|eakas|eakale|vanur|vanurile|puue|puudega|erivajadus|erivajadusega|hooldusvajadus|hooldusvajadusega|kriis|kriisis)\b/.test(text);
}

export function shouldUseExternalSourcesForTurn(message = "", options = {}) {
  if (options?.previousSourceUseRequest) return false;
  if (isAssistantSourceUiIssue(message)) return false;
  if (isServiceJurisdictionLookup(message)) return true;
  if (options?.hasHistory && isAffirmativeRetrievalFollowup(message)) return true;
  if (isLikelyConversationalTurn(message)) {
    return Boolean(options?.defaultToExternalSources && options?.hasHistory && isShortRetrievalFollowup(message));
  }
  if (options?.forceSources || options?.sourceLookupRequest || options?.defaultToExternalSources) return true;

  const text = normalizeSourceNeedText(message);
  if (!text) return false;
  if (options?.hasHistory && isTargetGroupRetrievalFollowup(text)) return true;

  if (/(?:§|paragrahv|seadus|maarus|maaruse|riigi teataja|riigiteataja|\bshs\b|oigusakt|regulation|law)\b/.test(text)) {
    return true;
  }

  const socialDomain =
    /(sotsiaal|hoolekan|hooldus|toet|teenus|abi|laps|lapse|laste|pere|eakas|eakale|vanur|puue|puudega|erivajad|lastekaitse|\bkov\b|omavalitsus|vald|valla|vallas|linn|linna|linnas|taotl|taot|elukoht|rahvastikuregister|\bska\b|sotsiaalkindlustusamet)/.test(text);
  const asksForRuleOrProcedure =
    /(kas|mis|mida|millal|kuidas|kuhu|kellele|kes|milline|tingimus|tingimused|noue|nouded|tahtaeg|summa|maar|maara|kontakt|vorm|saab|voib|peab|tuleb|tohib|kohustus|oigus|menetlus|leia|otsi|loetle|nimeta|koik|k6ik|kõik|olemas|apply|application|eligible|requirement|deadline|amount|contact|form)/.test(text);

  return socialDomain && asksForRuleOrProcedure;
}
