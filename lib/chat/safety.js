export function groundingStrength(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return "weak";
  const strongHit = groups.some(g => (g.bestScore || 0) >= 0.55);
  if (groups.length >= 4 && strongHit) return "strong";
  if (groups.length >= 2 && strongHit) return "ok";
  return "weak";
}
export function detectCrisis(text = "") {
  const t = (text || "").toLowerCase();
  const hits = [/enesetapp|enese\s*vigastus|tapan end|tapan\s+ennast|tahan surra|ei taha enam elada/, /vahetu oht|kohe oht|elu ohus/, /veritseb|veri ei peatu|teadvuseta/, /lapse\s*(vagivald|ahistamine|ohus|kuritarvitamine)/, /appi!?(\s+appi!?)*$/];
  return hits.some(re => re.test(t));
}
export function isGreeting(text = "") {
  const t = (text || "").toLowerCase().trim();
  if (!t) return false;
  if (detectCrisis(t)) return false;
  if (/^(tere|tsau|tsau|hei|hey|hello|hi|tere paevast|tere ohtust|hommikust|ohtust)[.!?]*$/.test(t)) {
    return true;
  }
  const wordCount = t.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 2 && /^(kysimus|palun abi|appi)$/.test(t)) return true;
  return false;
}