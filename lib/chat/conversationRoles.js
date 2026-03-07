export function normalizeConversationRole(role) {
  const normalized = String(role || "CLIENT").toUpperCase().trim();
  if (normalized === "ADMIN") return "SOCIAL_WORKER";
  return normalized === "SOCIAL_WORKER" || normalized === "CLIENT" ? normalized : "CLIENT";
}

export function resolveConversationListRoleFilter(roleParam, effectiveRole) {
  return roleParam
    ? normalizeConversationRole(roleParam)
    : normalizeConversationRole(effectiveRole);
}

export function resolveConversationWriteRole({ requestedRole, effectiveRole, isAdmin, sessionRole }) {
  if (!isAdmin) return normalizeConversationRole(sessionRole);
  return requestedRole
    ? normalizeConversationRole(requestedRole)
    : normalizeConversationRole(effectiveRole);
}
