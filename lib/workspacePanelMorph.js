export const WORKSPACE_PANEL_MORPH_STORAGE_KEY = "__SOTSIAALAI_WORKSPACE_PANEL_MORPH__";
export const WORKSPACE_PANEL_MORPH_MS = 680;
export const WORKSPACE_PANEL_MORPH_DELAY_MS = WORKSPACE_PANEL_MORPH_MS;
export const WORKSPACE_PANEL_MORPH_EXPAND_MS = WORKSPACE_PANEL_MORPH_MS;
export const WORKSPACE_PANEL_MORPH_MAX_AGE_MS = 30 * 60 * 1000;

export function resolveWorkspaceRestoreTransition(morphState, options = {}) {
  const reduceMotion = Boolean(options?.reduceMotion);
  if (morphState?.direction === "collapse" && !reduceMotion) {
    return {
      suppressOpenTransition: false,
      returnMorphing: true,
      returnTransitioning: true
    };
  }
  return {
    suppressOpenTransition: true,
    returnMorphing: false,
    returnTransitioning: false
  };
}

export function markWorkspacePanelMorph(direction, targetPath = "") {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      WORKSPACE_PANEL_MORPH_STORAGE_KEY,
      JSON.stringify({
        direction,
        targetPath,
        ts: Date.now()
      })
    );
  } catch {}
}

export function consumeWorkspacePanelMorph(maxAgeMs = WORKSPACE_PANEL_MORPH_MAX_AGE_MS) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(WORKSPACE_PANEL_MORPH_STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(WORKSPACE_PANEL_MORPH_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const ts = Number(parsed?.ts || 0);
    if (!Number.isFinite(ts) || Date.now() - ts > maxAgeMs) return null;
    return {
      direction: String(parsed?.direction || ""),
      targetPath: String(parsed?.targetPath || ""),
      ts
    };
  } catch {
    try {
      window.sessionStorage.removeItem(WORKSPACE_PANEL_MORPH_STORAGE_KEY);
    } catch {}
    return null;
  }
}
