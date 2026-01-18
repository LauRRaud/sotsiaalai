import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS } from "./settings.js";
export function todayContext() {
  const fmt = () => new Intl.DateTimeFormat("et-EE", {
    timeZone: "Europe/Tallinn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  let formatted;
  try {
    formatted = fmt();
  } catch {
    try {
      const tzNow = new Date(new Date().toLocaleString("en-US", {
        timeZone: "Europe/Tallinn"
      }));
      const pad = n => String(n).padStart(2, "0");
      formatted = `${pad(tzNow.getDate())}.${pad(tzNow.getMonth() + 1)}.${tzNow.getFullYear()}`;
    } catch {
      const now = new Date();
      const pad = n => String(n).padStart(2, "0");
      formatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
    }
  }
  return `Ajakontekst: ${formatted} (Europe/Tallinn). Kasutaja ajaviiteid (“praegu”, “eelmisel aastal”) tõlgenda selle kuupäeva suhtes. Materjalides (<context>) ajaviiteid tõlgenda dokumentide enda avaldamis-/kehtivuskonteksti järgi. Kui kasutaja näib ajas eksivat, kasuta vastuses konkreetseid kuupäevi.`;
}
export const ROLE_LABELS = {
  CLIENT: "eluküsimusega pöörduja",
  SOCIAL_WORKER: "sotsiaaltöö spetsialist"
};
export function detectLang(text = "") {
  const s = (text || "").toLowerCase();
  if (/[\u0400-\u04FF]/.test(s)) return "ru";
  if (/[äöõü]/i.test(s)) return "et";
  const letters = s.replace(/[^a-z]/g, "");
  if (letters.length >= Math.max(8, Math.floor(s.length * 0.6))) return "en";
  return null;
}
export function pickReplyLang({
  userMessage,
  uiLocale
}) {
  const ui = (uiLocale || "").toLowerCase();
  const d = detectLang(userMessage || "");
  if (ui === "et" || ui === "ru") return d === "et" || d === "ru" ? d : ui;
  if (ui === "en") return d === "et" || d === "ru" ? d : "en";
  return d || "et";
}
export function langStrings(lang = "et", role = "CLIENT") {
  const isWorker = role === "SOCIAL_WORKER";
  if (lang === "ru") {
    return {
      greetingClient: "Привет! Чем могу помочь?",
      greetingWorker: "Привет! С чем сегодня поработаем?",
      noContext: isWorker ? "Материалов пока нет. Уточни: муниципалитет, услуга/ситуация и срочность." : "Подходящих материалов нет. Опиши ситуацию чуть точнее и укажи город/волость (без личных данных).",
      crisis: "Если есть непосредственная опасность — звони 112."
    };
  }
  if (lang === "en") {
    return {
      greetingClient: "Hi! How can I help you today?",
      greetingWorker: "Hello! What case or topic should we focus on?",
      noContext: isWorker ? "No suitable material found. Please specify municipality, service/situation and urgency." : "No material found yet. Please describe your situation a bit more and include your city/municipality (no personal data).",
      crisis: "If there is immediate danger, call 112."
    };
  }
  return {
    greetingClient: "Tere! Millega saan täna toeks olla?",
    greetingWorker: "Tere! Millise teema või juhtumi fookusega saan toeks olla?",
    noContext: isWorker ? "Praegu ei leidnud ma materjalidest vastust. Täpsusta palun KOV/omavalitsus, teenuse/olukorra tüüp ja kiireloomulisus." : "Hetkel ei leidnud ma vastavat materjali. Kirjelda olukorda veidi täpsemalt ja lisa vähemalt vald või linn (ilma isikukoodi ja täpse aadressita).",
    crisis: "Kui on otsene oht, helista kohe 112."
  };
}
function languageRule(replyLang) {
  return `Vasta keeles: ${replyLang || "et"}.`;
}
function roleHeader(effectiveRole) {
  const label = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  return `Roll: ${label}`;
}
function thinkingStylePolicy() {
  return ["Tee enne vastamist lühike sisemine kontroll: kas väited toetuvad materjalile, kas on vastuolusid, kas on risk valesti järeldada.", "Ära näita sisemist arutluskäiku ega samm-sammulist põhjendusketti. Väljundis anna selged järeldused ja lühike põhjendus ainult siis, kui see aitab kasutajal otsustada."].join(" ");
}
function nonTechnicalPolicy() {
  return ["Ära kirjelda ennast ega tehnilist toimimist (mudel, RAG, vektorid, indeks, logid, serverid).", "Ära ütle “materjal ütleb” ega “kontekstis on kirjas” – räägi otse sisust (nt “see tähendab…”, “praktikas…”, “tavaliselt on sammud…”)."].join(" ");
}
function sourcesOutOfBandPolicy() {
  return ["Ära lisa vastuse lõppu allikate loetelu, linke ega pealkirja “Allikad”.", "Kui kasutaja küsib otsesõnu, mis allikale see tugineb, vasta lühidalt allika tüübiga ja nimetusega (nt “SKA juhend”, “SHS”), ilma linkide/loeteludeta, kui just kasutaja eraldi linki ei palu."].join(" ");
}
function groundingPolicy() {
  return ["Faktiväited (summad, tähtajad, tingimused, õigused, ametlik protsess, kontaktid, nõuded) peavad tulema <context> materjalidest.", "Kui konkreetne fakt puudub materjalides, ütle seda selgelt. Ära paku oletusi ega “tõenäoliselt” numbreid.", "Kui materjalides on ajakihte või vastuolusid, ütle seda neutraalselt ja ära esita üht versiooni ainsa tõena, kui kehtivust ei saa materjalist kinnitada.", "Kui vastus puudutab kliendi õigust teenusele/toetusele, väldi absoluutseid lubadusi: kasuta ettevaatlikku sõnastust (“võib olla õigus”, “lõpliku otsuse teeb asutus”), kui materjal ei anna üheselt selget alust."].join(" ");
}
function piiPolicy() {
  return ["Ära küsi isikukoodi, täpset kodust aadressi, kontonumbreid ega muid otseselt tuvastavaid andmeid.", "Kui kasutaja ise jagab selliseid andmeid, ära korda neid vastuses; jätka üldistatult ja vajadusel palu jagada ainult vald/linn ja olukorra üldkirjeldus."].join(" ");
}
function crisisPolicy(isCrisis) {
  if (!isCrisis) return null;
  return ["Kriisireegel: kui jutus on viide enesevigastusele, suitsiidile või tõsisele vägivallale, hoia vastus lühike ja üheselt mõistetav.", "Ütle, et sa ei saa pakkuda hädaabi; suuna kohe 112 (Eestis).", "Ära anna mingeid juhiseid, mis võimaldaks enesevigastust või vägivalda teostada."].join(" ");
}
function outputPolicy(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return ["Stiil (spetsialist): professionaalne, selge ja kollegiaalne; säilita inimlikkus.", "Struktuur: 2–6 lühikest lõiku. Vajadusel lisa väike (kuni 5 punkti) tegevusjärjestus või riskipunktid.", "Õigusviiteid (paragrahvid, määrused) lisa ainult siis, kui need on materjalis selgelt nimetatud.", "Kui materjali on vähe, vasta lühidalt ja ütle, mis täpsustust oleks vaja (nt KOV, teenus, sihtrühm, risk)."].join(" ");
  }
  return ["Stiil (pöörduja): rahulik, toetav, mitte-hukkamõistev; mitte raportlik.", "Ära tee diagnoose ega terapeutilisi tõlgendusi. Kui emotsioon on tugev, kasuta üht lühikest empaatilist lauset ilma analüüsimata.", "Struktuur: selge ja lihtne. Kui on keerukas teema, too välja maksimaalselt 1–3 kõige olulisemat järgmist sammu.", "Ära lõpeta müüva või jätkuküsiva repliigiga (“kui soovid…”). Vastus peab olema sisuliselt lõpetatud."].join(" ");
}
function platformPolicy() {
  return ["Kui küsimus puudutab SotsiaalAI platvormi kasutamist, kontot, tellimust, ligipääsu, privaatsust või andmetöötlust, vasta ainult SotsiaalAI kasutusjuhendi ning privaatsus- ja kasutustingimuste põhjal.", "Kui dokumentides detail puudub, ütle lühidalt, et konkreetset tehnilist detaili ei avalikustata, ning selgita üldpõhimõtet dokumentide piires."].join(" ");
}
function lengthControlPolicy() {
  return ["Väldi infoülekoormust: ära kopeeri pikki tekstilõike; eelista kokkuvõtet ja tähenduse selgitust.", "Ära tsiteeri pikki lõike (eriti ajakirjaartiklitest); kui kasutaja küsib tsitaati, hoia see väga lühike.", "Kui materjal on mahukas, ära piirdu ühe lõiguga: selgita vähemalt mõne lõigu ulatuses, kuid hoia fookus kasutaja küsimusel."].join(" ");
}
function contextUsagePolicy() {
  return ["Kogu kasutatav faktipõhine info asub <context> plokis.", "Väljundis ära räägi <context>-ist ega dokumentide failistruktuurist; kasuta sisu ja tähendust."].join(" ");
}
function buildSystemPrompt({
  effectiveRole,
  replyLang,
  isCrisis
}) {
  return [todayContext(), roleHeader(effectiveRole), languageRule(replyLang), thinkingStylePolicy(), nonTechnicalPolicy(), sourcesOutOfBandPolicy(), groundingPolicy(), piiPolicy(), platformPolicy(), outputPolicy(effectiveRole), lengthControlPolicy(), contextUsagePolicy(), crisisPolicy(isCrisis)].filter(Boolean).join("\n\n");
}
function buildMaterialMessage({
  context
}) {
  if (context) {
    return {
      role: "system",
      content: ["Materjalid on allpool.", "<context>", context, "</context>"].join("\n")
    };
  }
  return {
    role: "system",
    content: ["Materjale ei leitud.", "Kui kasutaja küsib konkreetseid fakte (summad, tähtajad, piirid, ametlikud tingimused), ära paku oletusi — ütle, et materjalides info puudub.", "Kui kasutaja küsib üldist protsessi või ideid, võid anda üldise suunava selgituse ja öelda, mis täpsustusi oleks vaja (nt KOV/omavalitsus, teenus, sihtrühm, ajaraam)."].join(" ")
  };
}
export function toResponsesInput({
  history,
  userMessage,
  context,
  effectiveRole,
  grounding,
  replyLang,
  isCrisis = false,
  maxOutputTokens = OPENAI_MAX_OUTPUT_TOKENS
}) {
  const system = buildSystemPrompt({
    effectiveRole,
    replyLang,
    isCrisis
  });
  const materialMessage = buildMaterialMessage({
    context
  });
  const extraInfoMessage = grounding ? {
    role: "system",
    content: ["Lisainfo (ära kasuta seda faktide, numbrite või õiguslike väidete allikana, kui seda pole <context>-is):", grounding].join("\n")
  } : null;
  return {
    model: DEFAULT_MODEL,
    input: [{
      role: "system",
      content: system
    }, materialMessage, ...(extraInfoMessage ? [extraInfoMessage] : []), ...(Array.isArray(history) ? history : []), {
      role: "user",
      content: userMessage
    }],
    max_output_tokens: maxOutputTokens
  };
}
export function buildResponsesPayload(input, options = {}) {
  return {
    ...input,
    stream: options.stream ?? true,
    metadata: {
      source: "sotsiaalai-chat"
    }
  };
}