"use client";

import { cn } from "@/components/ui/cn";

const WORKSPACE_ROLE_CYCLE = Object.freeze([
  "SERVICE_PROVIDER",
  "SOCIAL_WORKER",
  "CLIENT"
]);

function normalizeWorkspaceRole(role) {
  const normalized = String(role || "").trim().toUpperCase();
  return WORKSPACE_ROLE_CYCLE.includes(normalized) ? normalized : "SOCIAL_WORKER";
}

function workspaceRoleShortLabel(role) {
  if (role === "SERVICE_PROVIDER") return "T";
  if (role === "SOCIAL_WORKER") return "S";
  return "P";
}

function workspaceRoleLabel(t, role) {
  if (role === "CLIENT") {
    return typeof t === "function"
      ? t("workspace_feature_pages.roles.client", "Pöörduja")
      : "Pöörduja";
  }
  if (role === "SERVICE_PROVIDER") {
    return typeof t === "function"
      ? t("workspace_feature_pages.roles.service_provider", "Teenuseosutaja")
      : "Teenuseosutaja";
  }
  return typeof t === "function"
    ? t("workspace_feature_pages.roles.social_worker", "Spetsialist")
    : "Spetsialist";
}

function nextWorkspaceRole(role) {
  const normalized = normalizeWorkspaceRole(role);
  const index = WORKSPACE_ROLE_CYCLE.indexOf(normalized);
  return WORKSPACE_ROLE_CYCLE[(index + 1) % WORKSPACE_ROLE_CYCLE.length];
}

export default function WorkspaceRoleCycleButton({
  t,
  value,
  onChange,
  className,
  ariaLabel,
  disabled = false
}) {
  const normalizedValue = normalizeWorkspaceRole(value);
  const label = workspaceRoleLabel(t, normalizedValue);

  return (
    <button
      type="button"
      className={cn("workspace-role-cycle-button", className)}
      aria-label={ariaLabel || label}
      title={label}
      disabled={disabled}
      onClick={() => onChange?.(nextWorkspaceRole(normalizedValue))}
    >
      <span className="workspace-role-cycle-button__letter" aria-hidden="true">
        {workspaceRoleShortLabel(normalizedValue)}
      </span>
    </button>
  );
}

export {
  WORKSPACE_ROLE_CYCLE,
  normalizeWorkspaceRole,
  workspaceRoleLabel,
  workspaceRoleShortLabel
};
