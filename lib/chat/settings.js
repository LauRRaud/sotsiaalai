export const DEFAULT_MODEL = "gpt-5.4-mini";
export const OPENAI_MAX_OUTPUT_TOKENS = (() => {
  const v = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS);
  return Number.isFinite(v) && v > 0 ? v : undefined;
})();
export const RAG_TOP_K = Number(process.env.RAG_TOP_K || 12);
export const CONTEXT_GROUPS_MAX = Number(process.env.RAG_CONTEXT_GROUPS_MAX || 6);
export const DIVERSIFY_LAMBDA = Number(process.env.RAG_MMR_LAMBDA || 0.5);
export const RAG_CTX_MAX_CHARS = Number(process.env.RAG_CTX_MAX_CHARS || 4500);
export const RAG_CTX_HEADROOM = (() => {
  const v = Number(process.env.RAG_CTX_HEADROOM ?? 0.15);
  return Number.isFinite(v) ? Math.min(0.5, Math.max(0, v)) : 0.15;
})();
export const RAG_GROUP_BODY_MAX_CHARS = (() => {
  const v = Number(process.env.RAG_GROUP_BODY_MAX_CHARS ?? 1100);
  return Number.isFinite(v) && v > 200 ? v : 1100;
})();
export const RAG_ALLOW_QUOTES = process.env.RAG_ALLOW_QUOTES === undefined ? true : process.env.RAG_ALLOW_QUOTES !== "0";
export const RAG_BASE = process.env.RAG_API_BASE || "http://127.0.0.1:8000";
export const RAG_KEY = process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "";
