export function getAnalyzeLimit(role = "CLIENT", isAdmin = false) {
  const adminLimit = Number(process.env.ANALYZE_LIMIT_ADMIN || 100);
  const workerLimit = Number(process.env.ANALYZE_LIMIT_WORKER || 20);
  const clientLimit = Number(process.env.ANALYZE_LIMIT_CLIENT || 10);
  if (isAdmin || role === "ADMIN") return adminLimit;
  if (role === "SOCIAL_WORKER") return workerLimit;
  return clientLimit;
}

export function utcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

export function secondsUntilUtcMidnight(date = new Date()) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0));
  return Math.max(1, Math.floor((next.getTime() - date.getTime()) / 1000));
}
