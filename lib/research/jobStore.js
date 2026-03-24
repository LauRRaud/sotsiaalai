import crypto from "node:crypto";

const JOB_TTL_MS = Number(process.env.RESEARCH_JOB_TTL_MS || 30 * 60 * 1000);
const JOB_SWEEP_MS = Number(process.env.RESEARCH_JOB_SWEEP_MS || 60 * 1000);

const jobs = new Map();
let seq = 1;

function nowIso() {
  return new Date().toISOString();
}

function clampStatus(status) {
  if (status === "running" || status === "done" || status === "error" || status === "cancelled") {
    return status;
  }
  return "queued";
}

function emitToSubscribers(job, event) {
  if (!job?.subscribers?.size) return;
  for (const cb of job.subscribers) {
    try {
      cb(event);
    } catch {}
  }
}

function appendEvent(job, event) {
  const fullEvent = {
    seq: seq++,
    at: nowIso(),
    ...event,
  };
  job.events.push(fullEvent);
  if (job.events.length > 200) {
    job.events = job.events.slice(-200);
  }
  emitToSubscribers(job, fullEvent);
  return fullEvent;
}

function toPublic(job) {
  if (!job) return null;
  return {
    id: job.id,
    status: clampStatus(job.status),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    startedAt: job.startedAt,
    endedAt: job.endedAt,
    error: job.error || null,
    metrics: job.metrics || null,
  };
}

function shouldDelete(job, now) {
  if (!job) return true;
  if (job.status === "running" || job.status === "queued") return false;
  const ended = job.endedAt ? Date.parse(job.endedAt) : Date.parse(job.updatedAt || job.createdAt || nowIso());
  if (!Number.isFinite(ended)) return false;
  return now - ended > JOB_TTL_MS;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (shouldDelete(job, now)) jobs.delete(id);
  }
}, JOB_SWEEP_MS).unref?.();

export function createResearchJob({ userId, payload }) {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    const error = new Error("research.error.invalid_user");
    error.code = "INVALID_USER";
    throw error;
  }
  if (getActiveResearchJobCount(normalizedUserId) > 0) {
    const error = new Error("research.error.active_job_limit");
    error.code = "ACTIVE_JOB_LIMIT";
    throw error;
  }
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  const job = {
    id,
    userId: normalizedUserId,
    payload,
    status: "queued",
    createdAt,
    updatedAt: createdAt,
    startedAt: null,
    endedAt: null,
    error: null,
    result: null,
    metrics: null,
    cancelRequested: false,
    abortController: new AbortController(),
    events: [],
    subscribers: new Set(),
  };
  jobs.set(id, job);
  appendEvent(job, { type: "status", status: "queued" });
  return job;
}

export function getResearchJob(jobId) {
  return jobs.get(String(jobId));
}

export function getResearchJobPublic(jobId) {
  return toPublic(getResearchJob(jobId));
}

export function subscribeResearchJob(jobId, callback) {
  const job = getResearchJob(jobId);
  if (!job || typeof callback !== "function") {
    return () => {};
  }
  for (const event of job.events) {
    try {
      callback(event);
    } catch {}
  }
  job.subscribers.add(callback);
  return () => {
    try {
      job.subscribers.delete(callback);
    } catch {}
  };
}

export function publishResearchProgress(job, payload) {
  if (!job) return;
  job.updatedAt = nowIso();
  appendEvent(job, { type: "progress", ...payload });
}

export function markResearchRunning(job) {
  if (!job) return;
  job.status = "running";
  job.startedAt = nowIso();
  job.updatedAt = job.startedAt;
  appendEvent(job, { type: "status", status: "running" });
}

export function markResearchDone(job, result, metrics = null) {
  if (!job) return;
  const endedAt = nowIso();
  job.status = "done";
  job.updatedAt = endedAt;
  job.endedAt = endedAt;
  job.result = result || null;
  job.metrics = metrics || null;
  appendEvent(job, { type: "result", result: job.result, metrics: job.metrics });
  appendEvent(job, { type: "status", status: "done" });
  appendEvent(job, { type: "done" });
}

export function markResearchFailed(job, errorMessage, metrics = null) {
  if (!job) return;
  const endedAt = nowIso();
  job.status = "error";
  job.updatedAt = endedAt;
  job.endedAt = endedAt;
  job.error = String(errorMessage || "research.error.failed");
  job.metrics = metrics || null;
  appendEvent(job, { type: "error", message: job.error, metrics: job.metrics });
  appendEvent(job, { type: "status", status: "error" });
  appendEvent(job, { type: "done" });
}

export function cancelResearchJob(job, message = "research.error.cancelled") {
  if (!job) return;
  if (job.status === "done" || job.status === "error" || job.status === "cancelled") return;
  job.cancelRequested = true;
  try {
    job.abortController.abort();
  } catch {}
  const endedAt = nowIso();
  job.status = "cancelled";
  job.updatedAt = endedAt;
  job.endedAt = endedAt;
  job.error = String(message || "research.error.cancelled");
  appendEvent(job, { type: "error", message: job.error });
  appendEvent(job, { type: "status", status: "cancelled" });
  appendEvent(job, { type: "done" });
}

export function isResearchCancelled(job) {
  return Boolean(job?.cancelRequested || job?.status === "cancelled");
}

export function assertResearchAccess(job, userId) {
  if (!job) return false;
  return String(job.userId) === String(userId);
}

export function getResearchJobResult(jobId) {
  const job = getResearchJob(jobId);
  if (!job) return null;
  return {
    ...toPublic(job),
    result: job.result || null,
  };
}

export function getActiveResearchJobCount(userId) {
  const targetUserId = String(userId || "").trim();
  if (!targetUserId) return 0;
  let count = 0;
  for (const job of jobs.values()) {
    if (String(job.userId) !== targetUserId) continue;
    if (job.status !== "queued" && job.status !== "running") continue;
    count += 1;
  }
  return count;
}

export function hasActiveResearchJob(userId) {
  return getActiveResearchJobCount(userId) > 0;
}
