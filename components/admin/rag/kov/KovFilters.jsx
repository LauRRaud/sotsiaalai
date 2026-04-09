"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";

import {
  buttonBaseClassName,
  buttonCompactClassName,
  buttonGhostClassName,
  dropdownClassName,
  inputClassName,
  toolbarPrimaryClassName,
  toolbarSecondaryClassName
} from "../ragAdminShared";

export default function KovFilters({
  et = true,
  query,
  onQueryChange,
  county,
  onCountyChange,
  countyOptions,
  type,
  onTypeChange,
  typeOptions,
  activity,
  onActivityChange,
  activityOptions,
  packageState,
  onPackageStateChange,
  packageStateOptions,
  sort,
  onSortChange,
  sortOptions,
  resultCount,
  searchPlaceholder,
  resultsLabel,
  onReset,
  hasActiveFilters
}) {
  return (
    <div className="grid gap-1.5">
      <div className="grid gap-1 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-1.5 md:grid-cols-2 xl:grid-cols-5">
        <Input
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          size="sm"
          className={`${inputClassName} md:col-span-2 xl:col-span-1`}
        />
        <DocumentsDropdown ariaLabel="County" value={county} onChange={onCountyChange} options={countyOptions} className={dropdownClassName} />
        <DocumentsDropdown ariaLabel="Type" value={type} onChange={onTypeChange} options={typeOptions} className={dropdownClassName} />
        <DocumentsDropdown
          ariaLabel="Activity"
          value={activity}
          onChange={onActivityChange}
          options={activityOptions}
          className={dropdownClassName}
        />
        <DocumentsDropdown
          ariaLabel="Package state"
          value={packageState}
          onChange={onPackageStateChange}
          options={packageStateOptions}
          className={dropdownClassName}
        />
        <DocumentsDropdown ariaLabel="Sort" value={sort} onChange={onSortChange} options={sortOptions} className={dropdownClassName} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)]/80 px-3 py-2">
        <div className="rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-1.5 text-[0.88rem] text-[color:var(--admin-text)]">
          {resultsLabel(resultCount)}
        </div>
        <div className="text-[0.84rem] text-[color:var(--admin-muted)]">
          {hasActiveFilters
            ? et
              ? "Filtrid on aktiivsed."
              : "Filters are active."
            : et
              ? "Vaikimisi kuvatakse aktiivsed KOV-id."
              : "Active municipalities are shown by default."}
        </div>
        <Button
          variant="ghost"
          className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          {et ? "Nulli filtrid" : "Reset"}
        </Button>
      </div>
    </div>
  );
}
