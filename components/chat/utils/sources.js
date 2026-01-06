export function uniqueSortedPages(pages) {
  if (!Array.isArray(pages)) return [];
  const nums = pages.map((p) => Number(p)).filter((p) => Number.isFinite(p));
  return [...new Set(nums)].sort((a, b) => a - b);
}

export function collapsePages(pages) {
  const sorted = uniqueSortedPages(pages);
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

export function asAuthorArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map(String).map((x) => x.trim()).filter(Boolean);
    } catch {}
    return s.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

export function prettifyFileName(name) {
  if (typeof name !== "string" || !name.trim()) return "";
  const noExt = name.replace(/\.[a-z0-9]+$/i, "");
  return noExt.replace(/[_-]+/g, " ").trim();
}

export function formatSourceLabel(src) {
  if (typeof src?.short_ref === "string" && src.short_ref.trim()) {
    return src.short_ref.trim();
  }

  const authors = asAuthorArray(src?.authors);
  const authorText = authors.length ? authors.join("; ") : null;

  const titleText =
    typeof src?.title === "string" && src.title.trim() ? src.title.trim() : "";
  const journal = typeof src?.journalTitle === "string" ? src.journalTitle.trim() : "";
  const issue =
    typeof src?.issueLabel === "string"
      ? src.issueLabel.trim()
      : typeof src?.issueId === "string"
      ? src.issueId.trim()
      : "";
  const year =
    typeof src?.year === "number"
      ? String(src.year)
      : typeof src?.year === "string"
      ? src.year.trim()
      : "";

  const pagesCombined =
    (typeof src?.pageRange === "string" && src.pageRange.trim()) ||
    collapsePages([
      ...(Array.isArray(src?.pages) ? src.pages : []),
      ...(typeof src?.page === "number" ? [src.page] : []),
    ]);

  const section = typeof src?.section === "string" ? src.section.trim() : "";
  const filePretty = src?.fileName ? prettifyFileName(src.fileName) : "";

  const issueSegment = [journal, issue && issue !== year ? issue : null, year || null]
    .filter(Boolean)
    .join(", ");

  const contextSegments = [issueSegment, section].filter(Boolean);

  const mainSegments = [];
  if (authorText) mainSegments.push(authorText);
  if (titleText) mainSegments.push(titleText);

  const tailSegments = [];
  if (contextSegments.length) tailSegments.push(contextSegments.join(", "));
  if (pagesCombined) tailSegments.push(`lk ${pagesCombined}`);

  let label = [...mainSegments, ...tailSegments].filter(Boolean).join(". ").trim();

  if (!label && filePretty) {
    const fallbackParts = [
      filePretty,
      contextSegments.join(", ") || null,
      pagesCombined ? `lk ${pagesCombined}` : null,
      section || null,
    ].filter(Boolean);
    label = fallbackParts.join(", ").trim();
  }

  if (!label) {
    const url = typeof src?.url === "string" ? src.url.replace(/^https?:\/\//, "") : "";
    label = url || "Allikas";
  }

  if (label && !/[.!?]$/.test(label)) {
    label = `${label}.`;
  }

  return label;
}

export function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources.map((src, idx) => {
    const url = src?.url || src?.source || null;
    const page =
      typeof src?.page === "number" || typeof src?.page === "string" ? src.page : null;

    const label = formatSourceLabel(src);
    const key = src?.id || url || `${label}-${idx}`;

    const pages = Array.isArray(src?.pages) ? uniqueSortedPages(src.pages) : undefined;
    const pageLabel = src?.pageRange || collapsePages([...(pages || []), page]);

    const authors = asAuthorArray(src?.authors);

    const issueLabel =
      typeof src?.issueLabel === "string"
        ? src.issueLabel
        : typeof src?.issueId === "string"
        ? src.issueId
        : undefined;

    const year =
      typeof src?.year === "number" || typeof src?.year === "string" ? src.year : undefined;

    return {
      key,
      label,
      url,
      page,
      pageRange: pageLabel || undefined,
      fileName: src?.fileName,
      short_ref: typeof src?.short_ref === "string" ? src?.short_ref : undefined,
      journalTitle: typeof src?.journalTitle === "string" ? src?.journalTitle : undefined,
      authors,
      title: typeof src?.title === "string" ? src.title : undefined,
      issueLabel,
      issueId: typeof src?.issueId === "string" ? src?.issueId : undefined,
      year,
      section: typeof src?.section === "string" ? src.section : undefined,
      pages,
    };
  });
}
