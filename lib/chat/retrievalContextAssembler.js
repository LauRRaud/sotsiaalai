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
  extractMatchGroupYear,
  inferRetrieversUsed,
  hasRecentAssistantSources
} from "@/lib/chat/retrievalOrchestrator";
import { buildRiskPolicyInstruction, classifyRagRisk } from "@/lib/rag/riskPolicy";

function normalizePageRangeString(value = "") {
  return String(value).replace(/\s*[-\u2010-\u2015]\s*/g, "-").trim();
}

function stableSourceIdFromRawMatch(match = {}, index = 0) {
  const md = match?.metadata || {};
  const raw =
    match?.source_id ||
    match?.sourceId ||
    md.source_id ||
    md.sourceId ||
    match?.id ||
    md.chunk_id ||
    md.chunkId ||
    md.doc_id ||
    md.docId ||
    md.item_id ||
    md.itemId ||
    md.article_id ||
    md.articleId ||
    md.source_url ||
    md.url ||
    md.title ||
    `retrieved_${index}`;
  return String(raw || `retrieved_${index}`).trim() || `retrieved_${index}`;
}

function stableSourceIdFromDisplaySource(source = {}, index = 0) {
  const raw =
    source?.source_id ||
    source?.sourceId ||
    source?.id ||
    source?.key ||
    source?.url ||
    source?.short_ref ||
    source?.title ||
    `source_${index}`;
  return String(raw || `source_${index}`).trim() || `source_${index}`;
}

function uniqueIds(values = []) {
  const out = [];
  const seen = new Set();
  for (const value of values) {
    const id = String(value || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function hasServiceTerm(normalized = "") {
  return /\b[a-z0-9]*teenus[a-z0-9]*\b/u.test(normalized);
}

function hasBenefitTerm(normalized = "") {
  return /\b[a-z0-9]*toetus[a-z0-9]*\b/u.test(normalized);
}

function hasTargetGroupTerm(normalized = "") {
  return /\b(laps|lapse|lapsele|lapsed|laste|alaealine|alaealisele|pere|perele|vanem|vanemale|eakas|eakale|vanur|vanurile|puue|puudega|erivajadus|erivajadusega|hooldusvajadus|hooldusvajadusega|kriis|kriisis)\b/.test(normalized);
}

function isServiceJurisdictionClassificationQuestion(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized || !hasServiceTerm(normalized)) return false;
  const mentionsJurisdiction = /\b(kov|kohalik|kohaliku|omavalitsus|omavalitsuse|riik|riigi|riiklik|riiklikud|riikliku)\b/.test(normalized);
  const asksClassification = /\b(kas|on|voi|või|kumma|kumb|kuulub|korraldab|vastutab|vastutus)\b/.test(normalized);
  return mentionsJurisdiction && asksClassification;
}

function isNationalServiceBenefitQuestion(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return false;
  const mentionsNationalLevel = /\b(riik|riigi|riiklik|riiklikud|riiklikke|shs|sotsiaalhoolekande seadus)\b/.test(normalized);
  const asksServiceOrBenefit = hasServiceTerm(normalized) || hasBenefitTerm(normalized);
  const asksListOrDefinition = /\b(mis|millised|milliseid|loetle|nimeta|pakub|on|maara|maarab|reguleeri|reguleerib|sisalda|sisaldab|nimetab|saab)\b/.test(normalized);
  return mentionsNationalLevel && asksServiceOrBenefit && asksListOrDefinition;
}

function isNationalServiceBenefitFollowup(message = "", history = []) {
  const normalized = normalizeIntentText(message).replace(/[.!?\s]+$/g, "");
  if (!/^(jah|jaa|jep|ok|okei|palun|sobib|1|2|3)$/.test(normalized)) return false;
  const recent = extractRecentUserText(history, 4).join("\n");
  return isNationalServiceBenefitQuestion(recent);
}

function shouldCarryMunicipalityFromHistory(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return false;
  if (hasServiceTerm(normalized) || hasBenefitTerm(normalized)) return true;
  if (hasTargetGroupTerm(normalized)) return true;
  const socialHelpFollowup =
    /\b(loetle|nimeta|too valja|too välja|millised|mis|teenus|teenused|teenuseid|toetus|toetused|toetusi|abi|sotsiaalabi|sotsiaalteenus|sotsiaalteenused|sotsiaalteenuseid|sotsiaaltoetus|sotsiaaltoetused|sotsiaaltoetusi)\b/.test(normalized);
  if (socialHelpFollowup) return true;
  if (normalized.length <= 40) {
    return /\b(see|seda|selle|seal|siin|sealt|sinna|samas|too|need|nende)\b/.test(normalized);
  }
  return /\b(see|seda|selle|seal|siin|sealt|sinna|samas|too|need|nende|kontakt|kontaktid|telefon|e-post|email|taotlus|taotlema)\b/.test(normalized);
}

function isMunicipalityServiceBenefitListRequest(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return false;
  const asksList = /\b(kas|on|olemas|leia|otsi|tuvasta|loetle|nimeta|too valja|too välja|millised|mis|koik|kõik|nimekiri|ulevaade|ülevaade)\b/.test(normalized);
  const asksServicesOrBenefits =
    hasServiceTerm(normalized) ||
    hasBenefitTerm(normalized) ||
    /\b(sotsiaalabi|abi liigid)\b/.test(normalized);
  return asksList && asksServicesOrBenefits;
}

function detectServiceBenefitIntent(message = "") {
  const normalized = normalizeIntentText(message);
  const wantsServices = hasServiceTerm(normalized);
  const wantsBenefits = hasBenefitTerm(normalized);
  const wantsGeneralSocialHelp = /\b(sotsiaalabi|abi liigid)\b/.test(normalized);
  return {
    wantsServices: wantsServices || wantsGeneralSocialHelp,
    wantsBenefits: wantsBenefits || wantsGeneralSocialHelp
  };
}

function detectServiceBenefitTurnIntent(message = "", history = []) {
  const current = detectServiceBenefitIntent(message);
  if (current.wantsServices || current.wantsBenefits) return current;
  if (isAffirmativeServiceBenefitFollowup(message, history)) {
    const previous = detectServiceBenefitIntent(extractRecentUserText(history, 4).join("\n"));
    if (previous.wantsServices || previous.wantsBenefits) return previous;
  }
  return {
    wantsServices: true,
    wantsBenefits: true
  };
}

function isAffirmativeServiceBenefitFollowup(message = "", history = []) {
  const normalized = normalizeIntentText(message).replace(/[.!?\s]+$/g, "");
  if (!/^(jah|jaa|jep|ok|okei|palun|sobib)$/.test(normalized)) return false;
  return isMunicipalityServiceBenefitListRequest(extractRecentUserText(history, 4).join("\n"));
}

function isMunicipalityServiceBenefitTurn(message = "", history = []) {
  return isMunicipalityServiceBenefitListRequest(message) ||
    isAffirmativeServiceBenefitFollowup(message, history);
}

function isConcreteKovItemGroup(group, itemType) {
  return String(group?.collectionId || "") === "kov_services" &&
    String(group?.itemType || "") === itemType;
}

function isKovRegulationGroup(group) {
  return String(group?.collectionId || "") === "kov_regulations";
}

function sortByGroupRank(groups = []) {
  return [...groups].sort((a, b) => {
    const aScore = typeof a?.rankScore === "number" ? a.rankScore : (a?.bestScore || 0);
    const bScore = typeof b?.rankScore === "number" ? b.rankScore : (b?.bestScore || 0);
    return bScore - aScore;
  });
}

function selectMunicipalityServiceBenefitGroups(groups = [], k = CONTEXT_GROUPS_MAX, intent = {}) {
  const selected = [];
  const seen = new Set();
  const add = (items) => {
    for (const item of items) {
      const key = item?.key || item?.docId || item?.articleId || item?.title;
      if (!key || seen.has(key) || selected.length >= k) continue;
      seen.add(key);
      selected.push(item);
    }
  };
  const benefits = sortByGroupRank(groups.filter(group => isConcreteKovItemGroup(group, "benefit")));
  const services = sortByGroupRank(groups.filter(group => isConcreteKovItemGroup(group, "service")));
  const regulations = sortByGroupRank(groups.filter(isKovRegulationGroup));
  const rest = sortByGroupRank(groups.filter(group =>
    !isConcreteKovItemGroup(group, "benefit") &&
    !isConcreteKovItemGroup(group, "service") &&
    !isKovRegulationGroup(group)
  ));
  const wantsServices = intent?.wantsServices !== false;
  const wantsBenefits = intent?.wantsBenefits !== false;

  if (wantsBenefits && !wantsServices) {
    add(benefits);
    add(regulations);
    add(rest);
    return selected;
  }

  if (wantsServices && !wantsBenefits) {
    add(services);
    add(regulations);
    add(rest);
    return selected;
  }

  if (benefits.length && services.length) {
    const benefitTarget = Math.min(benefits.length, Math.ceil(k / 2));
    add(benefits.slice(0, benefitTarget));
    add(services.slice(0, Math.max(1, k - selected.length - Math.min(1, regulations.length))));
    add(benefits.slice(benefitTarget));
    add(services);
  } else {
    add(benefits);
    add(services);
  }
  add(regulations);
  add(rest);
  return selected;
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

function buildNationalServiceBenefitQuery(message = "") {
  return [
    String(message || "").trim(),
    "Sotsiaalhoolekande seadus",
    "riiklikud sotsiaalteenused riiklikud sotsiaaltoetused",
    "erihoolekandeteenus rehabilitatsiooniteenus sotsiaalkindlustusamet riigieelarvest rahastatav"
  ].filter(Boolean).join("\n");
}

function buildServiceJurisdictionQuery(message = "") {
  return [
    String(message || "").trim(),
    "Sotsiaalhoolekande seadus",
    "kohaliku omavalitsuse üksuse korraldatav sotsiaalteenus",
    "riiklik teenus riigi tasandi teenus Sotsiaalkindlustusamet"
  ].filter(Boolean).join("\n");
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

function mergeQueryFilters(entry, filters) {
  return {
    ...(entry?.filters || {}),
    ...(filters || {})
  };
}

function buildMunicipalityScopedQueries(ragQueries = [], municipalities = [], options = {}) {
  const municipalityNames = Array.from(new Set(
    (Array.isArray(municipalities) ? municipalities : [])
      .map((item) => String(item?.displayName || "").trim())
      .filter(Boolean)
  )).slice(0, 3);
  const queryEntries = normalizeRagQueryEntries(ragQueries);
  if (!municipalityNames.length || !queryEntries.length) return queryEntries;

  const serviceAnchor = "sotsiaalteenused toetused sotsiaalabi KOV";
  return queryEntries.flatMap((entry) =>
    municipalityNames.flatMap((municipalityName) => {
      const scoped = {
        ...entry,
        query: [municipalityName, entry.query, serviceAnchor].filter(Boolean).join("\n")
      };
      if (!options?.expandServiceBenefitList) return [scoped];
      const wantsServices = options?.serviceBenefitIntent?.wantsServices !== false;
      const wantsBenefits = options?.serviceBenefitIntent?.wantsBenefits !== false;
      const expanded = [scoped];
      if (wantsServices) {
        expanded.push({
          query: [municipalityName, entry.query, "sotsiaalteenused teenused koduteenus tugiisik sotsiaaltransport eluruum volanoustamine lapsehoid hooldus"].join("\n"),
          filters: mergeQueryFilters(entry, {
            collection_id: "kov_services",
            item_type: "service"
          })
        });
      }
      if (wantsBenefits) {
        expanded.push({
          query: [municipalityName, entry.query, "toetused sotsiaaltoetus sotsiaaltoetused sotsiaaltoetusi toimetulekutoetus vajaduspohine toetus hooldajatoetus eestkostetoetus matusetoetus tervisetoetus sissetulekust soltuv toetus toetuse taotlus"].join("\n"),
          filters: mergeQueryFilters(entry, {
            collection_id: "kov_services",
            item_type: "benefit"
          })
        });
      }
      if (wantsServices && wantsBenefits) {
        expanded.push({
          query: [municipalityName, "Sotsiaalhoolekandelise abi andmise kord abi liigid sotsiaalteenused sotsiaaltoetused"].join("\n"),
          filters: mergeQueryFilters(entry, {
            collection_id: "kov_regulations"
          })
        });
      }
      return expanded;
    })
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

function buildMunicipalityListInstruction(replyLang = "et") {
  if (replyLang === "en") {
    return [
      "MUNICIPALITY_LIST_MODE:",
      "When listing municipal services and benefits, list only items explicitly present in RAG_CONTEXT.",
      "If the user asks about both services and benefits, answer both branches separately when both are present in RAG_CONTEXT.",
      "Separate services from benefits/supports. If one side is missing from retrieved context, say it is not sufficiently visible in the retrieved sources instead of inventing names.",
      "Distinguish direct service pages from broad regulation categories such as 'other services'.",
      "Do not say that you lack access to the whole database. Refer to the current retrieved context or current search results."
    ].join("\n");
  }
  return [
    "MUNICIPALITY_LIST_MODE:",
    "Kui loetled KOV teenuseid ja toetusi, loetle ainult need nimetused, mis on RAG_CONTEXT-is otseselt olemas.",
    "Kui kasutaja kusib nii teenuseid kui toetusi, vasta molema haru kohta eraldi, kui molemad on RAG_CONTEXT-is olemas.",
    "Eralda teenused toetustest. Kui allikad ei anna yhe haru kohta piisavalt infot, ytle loomulikult, et praegune otsing ei leidnud selle kohta piisavat kinnitust; ara leiuta nimetusi juurde.",
    "Erista konkreetseid teenuselehti uldistest maaruse kategooriatest, nt 'muud teenused'.",
    "Kui allikad on leitud, vasta otse ja loomulikus keeles. Ara kasuta valjendeid \"Praegu nahtavas kontekstis\" ega \"Praegu nähtavas kontekstis\".",
    "Ara utle, et sul puudub ligipaas kogu andmebaasile. Viita praegusele leitud kontekstile voi praeguse otsingu tulemustele."
  ].join("\n");
}

function buildServiceJurisdictionInstruction(replyLang = "et") {
  if (replyLang === "en") {
    return [
      "SERVICE_JURISDICTION_MODE:",
      "The user is asking whether a service is municipal/local-government or national/state-level.",
      "Answer the classification directly. Do not ask for the municipality merely to classify the service.",
      "If recent conversation identifies a municipality, connect the answer to that municipality only when retrieved sources support it.",
      "Keep national legal framework and municipal implementation distinct."
    ].join("\n");
  }
  if (replyLang === "ru") {
    return [
      "SERVICE_JURISDICTION_MODE:",
      "Пользователь спрашивает, относится ли услуга к муниципальному или государственному уровню.",
      "Ответь на классификацию прямо. Не спрашивай муниципалитет только для того, чтобы классифицировать услугу.",
      "Если в недавнем разговоре указан муниципалитет, связывай ответ с ним только при наличии подтверждения в найденных источниках.",
      "Разделяй государственную правовую рамку и муниципальную организацию услуги."
    ].join("\n");
  }
  return [
    "SERVICE_JURISDICTION_MODE:",
    "Kasutaja küsib, kas teenus on KOV/kohaliku omavalitsuse või riigi tasandi teenus.",
    "Vasta liigitusele otse. Ära küsi omavalitsust ainult teenuse tasandi liigitamiseks.",
    "Kui hiljutisest vestlusest on omavalitsus teada, seo vastus selle omavalitsusega ainult siis, kui leitud allikad seda toetavad.",
    "Erista riiklik õigusraam ja KOV praktiline teenuse korraldus."
  ].join("\n");
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
  const ragRiskPolicy = classifyRagRisk(effectiveMessage, {
    isCrisis,
    role: normalizedRole
  });
  const previousSourceUseRequest = detectPreviousSourceUseRequest(rawHistory, effectiveMessage);
  const sourceLookupRequest = !previousSourceUseRequest && detectSourceAvailabilityRequest(rawHistory, effectiveMessage);
  const recentAssistantSourcesAvailable = hasRecentAssistantSources(rawHistory);
  const externalSourcesNeeded = shouldUseExternalSourcesForTurn(effectiveMessage, {
    forceSources,
    defaultToExternalSources: forcedMode === "rag",
    hasHistory,
    hasRecentAssistantSources: recentAssistantSourcesAvailable,
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
  const municipalityServiceBenefitListRequest =
    allowMunicipalityScopedRag && isMunicipalityServiceBenefitTurn(effectiveMessage, rawHistory);
  const currentServiceBenefitIntent = detectServiceBenefitIntent(effectiveMessage);
  const targetGroupFollowup = hasTargetGroupTerm(normalizeIntentText(effectiveMessage));
  const serviceJurisdictionQuestion = isServiceJurisdictionClassificationQuestion(effectiveMessage);
  const nationalServiceBenefitQuestion =
    isNationalServiceBenefitQuestion(effectiveMessage) ||
    isNationalServiceBenefitFollowup(effectiveMessage, rawHistory);
  const municipalityServiceBenefitRagRequest =
    allowMunicipalityScopedRag &&
    (municipalityServiceBenefitListRequest || currentServiceBenefitIntent.wantsServices || currentServiceBenefitIntent.wantsBenefits || targetGroupFollowup);
  const municipalityServiceBenefitIntent = municipalityServiceBenefitListRequest
    ? detectServiceBenefitTurnIntent(effectiveMessage, rawHistory)
    : currentServiceBenefitIntent.wantsServices || currentServiceBenefitIntent.wantsBenefits
      ? currentServiceBenefitIntent
      : targetGroupFollowup
        ? {
            wantsServices: true,
            wantsBenefits: true
          }
      : {
          wantsServices: true,
          wantsBenefits: true
        };
  const municipalityQuestionNeedsClarification =
    !allowMunicipalityScopedRag &&
    !serviceJurisdictionQuestion &&
    !nationalServiceBenefitQuestion &&
    isMunicipalityDependentSocialHelpQuestion(effectiveMessage);
  const baseRagQueryText = sourceLookupRequest
    ? buildSourceLookupSearchQuery(effectiveMessage, rawHistory)
    : serviceJurisdictionQuestion
      ? buildServiceJurisdictionQuery(effectiveMessage)
    : nationalServiceBenefitQuestion
      ? buildNationalServiceBenefitQuery(effectiveMessage)
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
    ...(externalSourcesNeeded && ragRiskPolicy.riskLevel !== "low"
      ? [buildRiskPolicyInstruction(ragRiskPolicy, replyLang)]
      : []),
    ...(serviceJurisdictionQuestion ? [buildServiceJurisdictionInstruction(replyLang)] : []),
    ...(municipalityServiceBenefitRagRequest ? [buildMunicipalityListInstruction(replyLang)] : []),
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
        !sourceLookupRequest && (nationalServiceBenefitQuestion || serviceJurisdictionQuestion)
          ? ragQueries
          : !sourceLookupRequest && allowMunicipalityScopedRag
          ? buildMunicipalityScopedQueries(ragQueries, effectiveMunicipalities, {
              expandServiceBenefitList: municipalityServiceBenefitRagRequest,
              serviceBenefitIntent: municipalityServiceBenefitIntent
            })
          : ragQueries;
      const primaryRagFilters =
        !sourceLookupRequest && (nationalServiceBenefitQuestion || serviceJurisdictionQuestion)
          ? {
              ...audienceFilter,
              jurisdiction_level: "NATIONAL"
            }
          : !sourceLookupRequest && allowMunicipalityScopedRag
          ? buildMunicipalityScopedFilters(audienceFilter, effectiveMunicipalities)
          : audienceFilter;

      matches = await searchRagQueries({
        queries: primaryRagQueries,
        topK: sourceLookupRequest
          ? sourceLookupTopK
          : municipalityServiceBenefitListRequest
            ? municipalityServiceBenefitIntent.wantsServices && municipalityServiceBenefitIntent.wantsBenefits
              ? Math.min(80, Math.max(56, RAG_TOP_K * 5))
              : Math.min(64, Math.max(40, RAG_TOP_K * 4))
            : municipalityServiceBenefitRagRequest
              ? Math.min(40, Math.max(24, RAG_TOP_K * 3))
          : nationalServiceBenefitQuestion || serviceJurisdictionQuestion
            ? Math.min(36, Math.max(18, RAG_TOP_K * 3))
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

      if ((sourceLookupTargetsNationalLaw || nationalServiceBenefitQuestion || serviceJurisdictionQuestion) && matches.length === 0) {
        const nationalFallbackMatches = await searchRagQueries({
          queries: ragQueries,
          topK: sourceLookupRequest
            ? Math.min(24, Math.max(12, sourceLookupTopK || RAG_TOP_K))
            : nationalServiceBenefitQuestion || serviceJurisdictionQuestion
              ? Math.min(36, Math.max(18, RAG_TOP_K * 3))
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

      if (!sourceLookupRequest && allowMunicipalityScopedRag && !sourceLookupTargetsNationalLaw && !municipalityServiceBenefitListRequest) {
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

    groupedMatches = rankGroupsWithTopicHints(groupMatches(matches), topicHints, {
      ragRiskPolicy
    });
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
        groupedMatches = rankGroupsWithTopicHints(groupMatches(matches), topicHints, {
          ragRiskPolicy
        });
      }
    }

    chosen = temporalRetrievalPlan.enabled
      ? selectTemporalGroups(groupedMatches, temporalRetrievalPlan.years, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA)
      : municipalityServiceBenefitListRequest
        ? selectMunicipalityServiceBenefitGroups(
            groupedMatches,
            municipalityServiceBenefitIntent.wantsServices && municipalityServiceBenefitIntent.wantsBenefits
              ? Math.max(CONTEXT_GROUPS_MAX, 28)
              : municipalityServiceBenefitIntent.wantsServices
                ? Math.max(CONTEXT_GROUPS_MAX, 24)
                : Math.max(CONTEXT_GROUPS_MAX, 14),
            municipalityServiceBenefitIntent
          )
        : diversifyGroupsMMR(groupedMatches, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA);
    budgeted = buildContextWithBudget(
      chosen,
      temporalRetrievalPlan.enabled
        ? {
            preferredYears: temporalRetrievalPlan.years
          }
        : municipalityServiceBenefitListRequest
          ? {
              compact: true,
              maxGroups: municipalityServiceBenefitIntent.wantsServices && municipalityServiceBenefitIntent.wantsBenefits
                ? Math.max(CONTEXT_GROUPS_MAX, 28)
                : municipalityServiceBenefitIntent.wantsServices
                  ? Math.max(CONTEXT_GROUPS_MAX, 24)
                  : Math.max(CONTEXT_GROUPS_MAX, 14)
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
  const retrieversUsed = inferRetrieversUsed(matches, shouldRunRag ? ["dense"] : []);

  if (typeof logInfo === "function") {
    logInfo("rag.afterSearch", {
      rawMatches: matches.length,
      groups: groupedMatches.length,
      grounding,
      mmrSelected: chosen.length,
      groupedYears,
      selectedYears,
      contextYears,
      retrieversUsed,
      requestedYears: temporalRetrievalPlan.enabled ? temporalRetrievalPlan.years : [],
      missingYears: temporalMissingYears,
      docChunkInputCount: ephemeralChunks.length,
      docChunkUsedCount: docContextResult.usedChunks,
      docContextChars: docContextResult.usedChars,
      ragSkipped: !shouldRunRag,
      externalSourcesNeeded,
      sourceLookupRequest,
      ragRiskLevel: ragRiskPolicy.riskLevel,
      ragRequiredEvidence: ragRiskPolicy.requiredEvidence,
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
        retrieversUsed,
        requestedYears: temporalRetrievalPlan.enabled ? temporalRetrievalPlan.years.join(",") : undefined,
        missingYears: temporalMissingYears.length ? temporalMissingYears.join(",") : undefined,
        docChunkInputCount: ephemeralChunks.length,
        docChunkUsedCount: docContextResult.usedChunks,
        docContextChars: docContextResult.usedChars,
        hadDocContext: usedDocContext,
        hadRagContext: usedRagContext,
        sourceLookupRequest,
        ragRiskLevel: ragRiskPolicy.riskLevel,
        ragRequiredEvidence: ragRiskPolicy.requiredEvidence,
        ragInsufficientEvidenceMode: ragRiskPolicy.insufficientEvidenceMode,
        municipalityMentioned: allowMunicipalityScopedRag,
        municipalityMatches: effectiveMunicipalities.map((item) => item.displayName)
      });
    } else {
      await logEvent("chat_no_external_sources", {
        userId,
        role: normalizedRole,
        isCrisis,
      sourceLookupRequest,
      ragRiskLevel: ragRiskPolicy.riskLevel,
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
      id: entry.sourceId || entry.key || entry.docId || entry.articleId || entry.url || entry.fileName || `source-${idx}`,
      source_id: entry.sourceId || undefined,
      sourceId: entry.sourceId || undefined,
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
      sourceType: entry.sourceType || undefined,
      source_type: entry.sourceType || undefined,
      authority: entry.authority || undefined,
      source_status: entry.sourceStatus || undefined,
      last_checked: entry.lastChecked || undefined,
      valid_from: entry.validFrom || undefined,
      valid_to: entry.validTo || undefined,
      historical: entry.historical === true ? true : undefined,
      canonical_item_id: entry.canonicalItemId || undefined,
      retrieval_channels: Array.isArray(entry.retrievalChannels) && entry.retrievalChannels.length ? entry.retrievalChannels : undefined,
      retrievalChannels: Array.isArray(entry.retrievalChannels) && entry.retrievalChannels.length ? entry.retrievalChannels : undefined,
      section: entry.section || undefined,
      paragraphTitle: entry.paragraphTitle || undefined,
      paragraphNumber: entry.paragraphNumber || undefined,
      subsectionNumber: entry.subsectionNumber || undefined,
      pointNumber: entry.pointNumber || undefined,
      year: entry.year || undefined,
      pages: pageNumbers.length ? pageNumbers : undefined,
      short_ref: shortRefText || undefined,
      evidenceText: Array.isArray(entry.bodies) ? entry.bodies.join("\n") : undefined
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

  const retrievedSourceIds = uniqueIds(matches.map(stableSourceIdFromRawMatch));
  const selectedContextSourceIds = uniqueIds(sources.map(stableSourceIdFromDisplaySource));
  const selectedContextDetails = budgeted.used.map((entry, idx) => ({
    source_id: entry.sourceId || entry.key || entry.docId || entry.articleId || entry.url || entry.fileName || `source-${idx}`,
    source_type: entry.sourceType || undefined,
    source_status: entry.sourceStatus || undefined,
    historical: entry.historical === true ? true : undefined,
    retrieval_channels: Array.isArray(entry.retrievalChannels) && entry.retrievalChannels.length ? entry.retrievalChannels : undefined,
    rank_score: typeof entry.rankScore === "number" ? Number(entry.rankScore.toFixed(4)) : undefined,
    topic_boost: typeof entry.topicBoost === "number" ? Number(entry.topicBoost.toFixed(4)) : undefined,
    quality_adjust: typeof entry.qualityAdjust === "number" ? Number(entry.qualityAdjust.toFixed(4)) : undefined
  }));

  return {
    previousSourceUseRequest,
    sourceLookupRequest,
    extraSystemInstructions,
    effectiveContext,
    grounding,
    sources,
    retrievalMeta: {
      rawMatchesCount: matches.length,
      retrievedSourceIds,
      selectedContextSourceIds,
      selectedContextDetails,
      selectedContextCount: sources.length,
      retrieversUsed,
      ragRiskPolicy,
      hadDocContext: usedDocContext,
      sourceCount: Number(chosen.length || 0) + Number(usedDocContext ? docContextResult.usedChunks || 0 : 0)
    }
  };
}
