import { RAG_CTX_MAX_CHARS, RAG_CTX_HEADROOM, CONTEXT_GROUPS_MAX, RAG_GROUP_BODY_MAX_CHARS } from "./settings.js";
const AS_ARRAY = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(v => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};
export function collapsePages(pages) {
  if (!Array.isArray(pages) || pages.length === 0) return "";
  const sorted = [...new Set(pages.filter(Number.isFinite))].sort((a, b) => a - b);
  if (!sorted.length) return "";
  const out = [];
  let start = null;
  let prev = null;
  for (const page of sorted) {
    if (start === null) {
      start = prev = page;
      continue;
    }
    if (page === prev + 1) {
      prev = page;
      continue;
    }
    out.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = prev = page;
  }
  if (start !== null) out.push(start === prev ? `${start}` : `${start}-${prev}`);
  return out.join(", ");
}
export function normalizeMatch(m, idx) {
  const md = m?.metadata || {};
  const title = md.title || m?.title || md.fileName || m?.url || "Allikas";
  const bodyRaw = (m?.text || m?.chunk || "" || "").trim();
  const synth = [];
  if (!bodyRaw) {
    if (md.title) synth.push(md.title);
    const auth = AS_ARRAY(md.authors || m?.authors);
    if (auth.length) synth.push(`Autor(id): ${auth.join(", ")}`);
    const jr = (md.journal_title || md.journalTitle || "").trim();
    const issue = (md.issueLabel || md.issueId || md.year || "").toString().trim();
    const mix = [jr, issue].filter(Boolean).join(" ");
    if (mix) synth.push(mix);
  }
  const body = bodyRaw || (synth.length ? synth.join(" · ") : "");
  const audience = md.audience || m?.audience || null;
  const url = md.source_url || md.url || m?.url || null;
  const fileName = m?.fileName || md.fileName || (md.source_path ? md.source_path.split("/").pop() : null) || null;
  const page = m?.page ?? md.page ?? null;
  const score = typeof m?.distance === "number" ? 1 - m.distance : null;
  const authors = AS_ARRAY(md.authors || m?.authors);
  const pages = Array.isArray(md.pages) ? md.pages.filter(Number.isFinite) : Array.isArray(m?.pages) ? m.pages.filter(Number.isFinite) : [];
  if (Number.isFinite(page)) pages.push(page);
  const pageRange = md.pageRange || md.page_range || m?.pageRange || null;
  const issueLabel = md.issueLabel || md.issue_label || m?.issueLabel || null;
  const issueId = md.issueId || md.issue_id || m?.issueId || null;
  const journalTitle = md.journal_title || md.journalTitle || m?.journal_title || m?.journalTitle || null;
  const articleId = md.articleId || md.article_id || m?.articleId || null;
  const section = md.section || m?.section || null;
  const year = md.year || m?.year || null;
  const docId = md.doc_id || md.docId || m?.doc_id || m?.docId || null;
  const chunkId = md.chunk_id || md.chunkId || m?.chunk_id || m?.chunkId || m?.id || null;
  const sourceType = md.source_type || m?.source_type || null;
  const collectionId = md.collection_id || m?.collection_id || null;
  const itemType = md.item_type || m?.item_type || null;
  const tags = Array.isArray(md.tags) && md.tags || (typeof md.tags === "string" ? md.tags.split(/[,;]/).map(s => s.trim()).filter(Boolean) : null) || Array.isArray(m?.tags) && m.tags || null;
  return {
    id: m?.id || `${title}-${idx}`,
    docId,
    chunkId,
    articleId,
    title,
    body,
    audience,
    url,
    fileName,
    page,
    score,
    authors,
    pages,
    pageRange,
    issueLabel,
    issueId,
    journalTitle,
    section,
    year,
    sourceType,
    collectionId,
    itemType,
    tags: Array.isArray(tags) ? tags : tags ? [tags].flat().filter(Boolean) : null
  };
}
export function groupMatches(matches) {
  if (!Array.isArray(matches) || matches.length === 0) return [];
  const seenSnippets = new Set();
  const order = [];
  const grouped = new Map();
  matches.forEach((raw, idx) => {
    const m = normalizeMatch(raw, idx);
    if (!m.body) return;
    const snippetKey = `${m.title}|${m.page ?? ""}|${m.body.slice(0, 120)}`;
    if (seenSnippets.has(snippetKey)) return;
    seenSnippets.add(snippetKey);
    const shouldKeepChunkSeparate =
      m.collectionId === "kov_services" &&
      m.sourceType === "municipality_kov" &&
      !m.itemType &&
      m.chunkId;
    const groupKey = shouldKeepChunkSeparate
      ? m.chunkId
      : m.articleId || m.docId || (m.title ? `${m.title}|${m.fileName || ""}` : m.id || `match-${idx}`);
    let entry = grouped.get(groupKey);
    if (!entry) {
      entry = {
        key: groupKey,
        docId: m.docId || null,
        articleId: m.articleId || null,
        title: m.title || null,
        url: m.url || null,
        fileName: m.fileName || null,
        audience: m.audience || null,
        issueLabel: m.issueLabel || null,
        issueId: m.issueId || null,
        journalTitle: m.journalTitle || null,
        section: m.section || null,
        year: m.year || null,
        bodies: [],
        authors: new Set(),
        pages: new Set(),
        pageRanges: new Set(),
        tags: new Set(),
        scores: []
      };
      grouped.set(groupKey, entry);
      order.push(groupKey);
    }
    entry.bodies.push(m.body);
    if (Array.isArray(m.authors)) {
      for (const author of m.authors) if (author) entry.authors.add(author);
    }
    if (Array.isArray(m.pages)) {
      for (const p of m.pages) if (Number.isFinite(p)) entry.pages.add(Number(p));
    }
    if (Number.isFinite(m.page)) entry.pages.add(Number(m.page));
    if (m.pageRange) entry.pageRanges.add(m.pageRange);
    if (Array.isArray(m.tags)) {
      for (const tag of m.tags) if (tag) entry.tags.add(tag);
    }
    if (typeof m.score === "number") entry.scores.push(m.score);
    if (!entry.url && m.url) entry.url = m.url;
    if (!entry.fileName && m.fileName) entry.fileName = m.fileName;
    if (!entry.title && m.title) entry.title = m.title;
    if (!entry.audience && m.audience) entry.audience = m.audience;
    if (!entry.section && m.section) entry.section = m.section;
    if (!entry.issueLabel && m.issueLabel) entry.issueLabel = m.issueLabel;
    if (!entry.issueId && m.issueId) entry.issueId = m.issueId;
    if (!entry.journalTitle && m.journalTitle) entry.journalTitle = m.journalTitle;
    if (!entry.year && m.year) entry.year = m.year;
    if (!entry.docId && m.docId) entry.docId = m.docId;
    if (!entry.articleId && m.articleId) entry.articleId = m.articleId;
  });
  return order.map(key => {
    const entry = grouped.get(key);
    if (!entry) return null;
    const authors = Array.from(entry.authors);
    const pages = Array.from(entry.pages).sort((a, b) => a - b);
    const pageRanges = Array.from(entry.pageRanges);
    const tags = Array.from(entry.tags);
    const bestScore = entry.scores.filter(s => typeof s === "number").sort((a, b) => b - a)[0];
    const bodyPreview = entry.bodies.length ? entry.bodies[0] : "";
    return {
      ...entry,
      authors,
      pages,
      pageRanges,
      tags,
      bestScore: typeof bestScore === "number" ? bestScore : null,
      __sig: [entry.title || "", bodyPreview].join("\n").toLowerCase()
    };
  }).filter(Boolean);
}
export function diversifyGroupsMMR(groups, k = CONTEXT_GROUPS_MAX, lambda) {
  const L = typeof lambda === "number" ? lambda : 0.5;
  if (!Array.isArray(groups) || groups.length === 0) return [];
  const K = Math.max(1, Math.min(k, groups.length));
  const tokenize = s => new Set(String(s || "").toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean));
  const cacheTokens = new Map();
  const tok = g => {
    const key = g.key || g.docId || g.articleId || g.title || "";
    if (cacheTokens.has(key)) return cacheTokens.get(key);
    const t = tokenize(g.__sig || g.title || "");
    cacheTokens.set(key, t);
    return t;
  };
  const jaccard = (a, b) => {
    if (!a || !b || a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    const uni = a.size + b.size - inter;
    return uni > 0 ? inter / uni : 0;
  };
  const remaining = [...groups].sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0));
  const selected = [];
  while (selected.length < K && remaining.length) {
    let bestIdx = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const g = remaining[i];
      const rel = typeof g.bestScore === "number" ? g.bestScore : 0.3;
      let div = 0;
      if (selected.length) {
        const gt = tok(g);
        let maxSim = 0;
        for (const s of selected) {
          const sim = jaccard(gt, tok(s));
          if (sim > maxSim) maxSim = sim;
        }
        div = maxSim;
      }
      const mmr = L * rel - (1 - L) * div;
      if (mmr > bestVal) {
        bestVal = mmr;
        bestIdx = i;
      }
    }
    selected.push(remaining.splice(bestIdx, 1)[0]);
  }
  return selected;
}
export function firstAuthor(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return null;
  for (const author of authors) if (typeof author === "string" && author.trim()) return author.trim();
  return null;
}
export function shortIssue(entry) {
  const label = typeof entry.issueLabel === "string" && entry.issueLabel.trim() || typeof entry.issueId === "string" && entry.issueId.trim() || "";
  if (label) return label;
  const {
    year
  } = entry;
  if (typeof year === "number" && Number.isFinite(year)) return String(year);
  if (typeof year === "string") {
    const trimmed = year.trim();
    if (!trimmed) return "";
    return trimmed;
  }
  return "";
}
export function prettifyFileName(name = "") {
  if (typeof name !== "string" || !name.trim()) return "";
  const noExt = name.replace(/\.[a-z0-9]+$/i, "");
  return noExt.replace(/[_-]+/g, " ").trim();
}
export function makeShortRef(entry, pagesCompact) {
  const author = firstAuthor(entry.authors);
  const title = typeof entry.title === "string" ? entry.title.trim() : "";
  const journal = typeof entry.journalTitle === "string" && entry.journalTitle.trim() || "";
  const issueRaw = shortIssue(entry);
  const year = typeof entry.year === "number" ? String(entry.year) : typeof entry.year === "string" ? entry.year.trim() : "";
  const pagesStr = pagesCompact ? `lk ${pagesCompact}` : "";
  const section = typeof entry.section === "string" && entry.section.trim() ? entry.section.trim() : "";
  const fallbackName = prettifyFileName(entry.fileName) || (typeof entry.url === "string" ? entry.url.replace(/^https?:\/\/(www\.)?/, "").trim() : "");
  const issue = issueRaw && year && issueRaw === year ? "" : issueRaw;
  const journalPart = [journal, issue].filter(Boolean).join(" ").trim();
  const headParts = [];
  if (author && title && year) headParts.push(`${author}, ${year}`);
  if (!headParts.length && author) headParts.push(author);
  if (title) headParts.push(title);
  if (journalPart) headParts.push(journalPart);
  if (!headParts.length && fallbackName) headParts.push(fallbackName);
  const parts = [headParts.join(". "), pagesStr, section].filter(Boolean);
  return parts.join(" · ");
}
export function renderOneContextBlock(entry, index) {
  const authors = Array.isArray(entry.authors) ? entry.authors : [];
  const authorText = authors.length ? authors.slice(0, 2).join("; ") : null;
  const pageRangeText = Array.isArray(entry.pageRanges) ? Array.from(new Set(entry.pageRanges.filter(Boolean))).join(", ") : "";
  const pageText = pageRangeText || collapsePages(entry.pages);
  const headerParts = [];
  if (entry.title) headerParts.push(entry.title);
  if (authorText) headerParts.push(authorText);
  if (pageText) headerParts.push(`lk ${pageText}`);
  if (entry.section) headerParts.push(entry.section);
  const header = `(${index + 1}) ` + (headerParts.length ? headerParts.join(". ") : entry.title || "Allikas");
  const fullBody = entry.bodies.join("\n---\n") || "(sisukokkuvote puudub)";
  const bodyText = fullBody.length > RAG_GROUP_BODY_MAX_CHARS ? `${fullBody.slice(0, Math.max(1, RAG_GROUP_BODY_MAX_CHARS - 3)).trimEnd()}...` : fullBody;
  return [header, bodyText].join("\n");
}
export function renderContextBlocks(groups) {
  return (Array.isArray(groups) ? groups : []).map((g, i) => renderOneContextBlock(g, i)).join("\n\n");
}
export function buildContextWithBudget(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return {
    text: "",
    used: []
  };
  const budget = Math.max(500, Math.floor(RAG_CTX_MAX_CHARS * (1 - RAG_CTX_HEADROOM)));
  let acc = "";
  const used = [];
  for (let i = 0; i < groups.length; i++) {
    const block = renderOneContextBlock(groups[i], i);
    const candidate = used.length ? acc + "\n\n" + block : block;
    if (candidate.length > budget) break;
    acc = candidate;
    used.push(groups[i]);
    if (used.length >= CONTEXT_GROUPS_MAX) break;
  }
  return {
    text: acc,
    used
  };
}
