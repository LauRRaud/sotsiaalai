"use client";

import Button from "@/components/ui/Button";

import {
  buttonBaseClassName,
  buttonCompactClassName,
  buttonGhostClassName,
  cardBodyClassName,
  cardClassName,
  cardSubClassName
} from "../ragAdminShared";

export default function KovEmptyState({ et, hasActiveFilters, onReset }) {
  return (
    <div className={cardClassName}>
      <div className={cardBodyClassName}>
        <div className="text-[1rem] font-semibold text-[color:var(--admin-text)]">
          {et ? "Uhtegi KOV-i ei leitud" : "No municipalities found"}
        </div>
        <div className={cardSubClassName}>
          {hasActiveFilters
            ? et
              ? "Praegused filtrid ei anna tulemusi. Proovi otsingut laiendada voi nulli filtrid."
              : "The current filters return no rows. Try broadening the search or reset the filters."
            : et
              ? "KOV admini kirjed puuduvad. Pusimudel peaks need olemasolevast nimekirjast ette looma."
              : "Municipality admin records are missing. The persistent model should seed them from the municipality list."}
        </div>
        {hasActiveFilters ? (
          <div className="pt-1">
            <Button
              variant="ghost"
              className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
              onClick={onReset}
            >
              {et ? "Nulli filtrid" : "Reset filters"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
