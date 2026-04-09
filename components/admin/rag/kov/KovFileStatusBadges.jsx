"use client";

import { KOV_FILE_KEYS, KOV_FILE_ROLE_META } from "@/lib/admin/rag/kov/shared";

import { badgeBaseClassName } from "../ragAdminShared";

const STATUS_CLASS = {
  missing:
    "border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] text-[color:var(--admin-muted)]",
  uploaded:
    "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  replaced:
    "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]"
};

export const FILE_STATUS_LABELS = {
  missing: "missing",
  uploaded: "uploaded",
  replaced: "replaced"
};

export default function KovFileStatusBadges({ files, compact = false, locale = "et", fileKeys = KOV_FILE_KEYS }) {
  const et = String(locale || "").toLowerCase().startsWith("et");
  const labels = {
    missing: et ? "puudu" : "missing",
    uploaded: et ? "olemas" : "uploaded",
    replaced: et ? "asendatud" : "replaced"
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "pt-1"}`}>
      {fileKeys.map(key => {
        const label = KOV_FILE_ROLE_META[key]?.label || key;
        const status = files?.[key]?.status || "missing";
        return (
          <span key={key} className={`${badgeBaseClassName} ${STATUS_CLASS[status] || STATUS_CLASS.missing}`}>
            {compact ? label : `${label}: ${labels[status] || FILE_STATUS_LABELS[status] || status}`}
          </span>
        );
      })}
    </div>
  );
}
