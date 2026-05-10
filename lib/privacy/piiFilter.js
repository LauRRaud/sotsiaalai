const PERSONAL_DATA_PATTERNS = Object.freeze([
  {
    type: "email",
    label: "e-posti aadress",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu
  },
  {
    type: "phone",
    label: "telefoninumber",
    pattern: /(?:\+372\s*)?(?:\d[\s-]?){7,8}\b/gu
  },
  {
    type: "estonian_personal_code",
    label: "isikukood",
    pattern: /\b[1-6]\d{10}\b/gu
  },
  {
    type: "address",
    label: "aadress",
    pattern: /\b[\p{Lu}ÕÄÖÜŠŽ][\p{L}.'-]+(?:\s+[\p{Lu}ÕÄÖÜŠŽ]?[\p{L}.'-]+){0,3}\s+(?:tn|tänav|tee|mnt|maantee|pst|puiestee)\s+\d+[a-z]?(?:-\d+)?\b/giu
  }
]);

export function detectPersonalData(...values) {
  const source = values
    .map((value) => String(value || ""))
    .join("\n")
    .trim();
  const findings = [];
  const seen = new Set();

  if (!source) {
    return {
      hasPersonalData: false,
      categories: [],
      findings: []
    };
  }

  for (const rule of PERSONAL_DATA_PATTERNS) {
    const matches = source.match(rule.pattern) || [];
    if (!matches.length) continue;
    const key = rule.type;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({
      type: rule.type,
      label: rule.label,
      count: matches.length
    });
  }

  return {
    hasPersonalData: findings.length > 0,
    categories: findings.map((finding) => finding.type),
    findings
  };
}

export function buildPersonalDataWarning(result) {
  const findings = Array.isArray(result?.findings) ? result.findings : [];
  if (!findings.length) return "";
  const labels = findings.map((finding) => finding.label).join(", ");
  return `Tekst võib sisaldada isikuandmeid (${labels}). Enne AI-töötlust, logimist või jagamist kasuta ainult minimaalselt vajalikku infot ja varja detailid, mida töövoog ei vaja.`;
}
