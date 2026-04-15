"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import Modal from "@/components/ui/Modal";
import Panel from "@/components/ui/Panel";
import {
  glassPageBackTopLeftClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageContentWideClassName,
  glassSubpagePanelWideClassName,
  glassSubpageSurfaceScopeClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getHelpUiText } from "./helpUiText";

const HELP_CATEGORY_OPTIONS = [
  { value: "TRANSPORT", label: "Transport" },
  { value: "DAILY_TASKS", label: "Igapäevaabi" },
  { value: "HOME_HELP", label: "Koduabi" },
  { value: "DIGITAL_HELP", label: "Digiabi" },
  { value: "CARE_SUPPORT", label: "Tugi ja hooldus" },
  { value: "CHILD_YOUTH_SUPPORT", label: "Laste ja noorte tugi" },
  { value: "LEARNING_GUIDANCE", label: "Õppimise ja juhendamise abi" },
  { value: "SOCIAL_SUPPORT", label: "Seltskond ja sotsiaalne tugi" },
  { value: "ADMIN_FORM_HELP", label: "Asjaajamise ja vormide abi" },
  { value: "OTHER", label: "Muu abi" }
];

const TARGET_GROUP_OPTIONS = [
  { value: "CHILD", label: "Laps" },
  { value: "YOUTH", label: "Noor" },
  { value: "ADULT", label: "Täiskasvanu" },
  { value: "ELDER", label: "Eakas" }
];

const TARGET_GROUP_OPTION_VALUES = new Set(TARGET_GROUP_OPTIONS.map((option) => option.value));

function normalizeComparableText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[|·•]+/g, " ")
    .trim();
}

function includesComparable(haystack = "", needle = "") {
  const left = normalizeComparableText(haystack);
  const right = normalizeComparableText(needle);
  if (!left || !right) return false;
  return left.includes(right);
}

function buildCleanDescription(listing = {}) {
  const text = String(listing?.description || "").trim();
  if (!text) return "";
  const match = text.match(/\b(?:Põhikategooria|Omavalitsus|Täpsem asukoht|Sihtrühm|Abi vorm|Tasu info|Ajalisus|Saadavus\s*\/\s*algus|Lisatingimused|Tingimused|Oskused või taust):/iu);
  const cleaned = match?.index > 0 ? text.slice(0, match.index) : text;
  return cleaned.trim();
}

function buildInfoItems(listing = {}, ui = {}) {
  const summary = String(listing.summary || "").trim();
  const items = [];

  if (listing.categoryLabel) {
    items.push({ label: ui.category || "Category", value: listing.categoryLabel });
  }

  if (listing.municipalityLabel && !includesComparable(summary, listing.municipalityLabel)) {
    items.push({ label: ui.municipality || "Municipality", value: listing.municipalityLabel });
  }

  if (listing.helpTypeLabel && !includesComparable(summary, listing.helpTypeLabel)) {
    items.push({ label: ui.helpType, value: listing.helpTypeLabel });
  }

  if (listing.timeTypeLabel && !includesComparable(summary, listing.timeTypeLabel)) {
    items.push({ label: ui.timeType, value: listing.timeTypeLabel });
  }

  if (Array.isArray(listing.targetGroupLabels) && listing.targetGroupLabels.length) {
    items.push({ label: ui.targetGroups, value: listing.targetGroupLabels.join(", ") });
  }

  if (
    listing.rawPlace &&
    !includesComparable(summary, listing.rawPlace) &&
    !includesComparable(listing.municipalityLabel, listing.rawPlace)
  ) {
    items.push({ label: ui.location || "Location", value: listing.rawPlace });
  }

  if (listing.availabilityOrStart) {
    items.push({ label: ui.availabilityOrStart || "Availability", value: listing.availabilityOrStart });
  }

  if (listing.compensationDetails) {
    items.push({ label: ui.compensationDetails || "Compensation", value: listing.compensationDetails });
  }

  if (listing.conditions) {
    items.push({ label: ui.conditions || "Conditions", value: listing.conditions });
  }

  return items;
}

function FieldLabel({ children }) {
  return (
    <span className="text-[0.8rem] uppercase tracking-[0.08em] opacity-74">
      {children}
    </span>
  );
}

function DropdownField({ label, value, onChange, options = [] }) {
  return (
    <label className="grid gap-[0.35rem]">
      <FieldLabel>{label}</FieldLabel>
      <DocumentsDropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder="-"
        ariaLabel={label}
      />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="grid gap-[0.35rem]">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="documents-field min-h-[3rem] w-full rounded-[0.9rem] px-[0.95rem] py-[0.7rem] text-[1rem] text-[color:var(--input-text,var(--glass-modal-text))] placeholder:text-[color:var(--input-placeholder,color-mix(in_srgb,var(--input-text)_58%,transparent))] outline-none !shadow-none"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 3 }) {
  return (
    <label className="grid gap-[0.35rem]">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={rows}
        className="documents-field documents-field--textarea w-full resize-y rounded-[0.9rem] px-[0.95rem] py-[0.78rem] text-[1rem] leading-[1.45] text-[color:var(--input-text,var(--glass-modal-text))] placeholder:text-[color:var(--input-placeholder,color-mix(in_srgb,var(--input-text)_58%,transparent))] outline-none !shadow-none"
      />
    </label>
  );
}

function TargetGroupsField({ label, value = [], onChange }) {
  const selectedValues = Array.isArray(value) ? value : [];
  const toggleValue = (nextValue) => {
    const exists = selectedValues.includes(nextValue);
    const nextValues = exists
      ? selectedValues.filter((item) => item !== nextValue)
      : [...selectedValues, nextValue];
    onChange?.(nextValues);
  };

  return (
    <fieldset className="m-0 grid min-w-0 gap-[0.45rem] border-0 p-0">
      <legend className="text-[0.8rem] uppercase tracking-[0.08em] opacity-74">{label}</legend>
      <div className="grid grid-cols-2 gap-[0.45rem] max-[520px]:grid-cols-1">
        {TARGET_GROUP_OPTIONS.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              className={`min-h-[2.65rem] rounded-[1.05rem] border px-[0.75rem] py-[0.55rem] text-left text-[0.98rem] leading-[1.2] transition-colors duration-150 !shadow-none ${
                selected
                  ? "border-[color:var(--title-color,var(--brand-primary))] bg-[color:color-mix(in_srgb,var(--title-color,var(--brand-primary))_12%,transparent)] text-[color:var(--title-color,var(--brand-primary))]"
                  : "border-[color:var(--documents-card-border,var(--subpage-card-border))] bg-[color:var(--input-bg)] text-[color:var(--input-text)] hover:bg-[color:var(--input-bg-hover)]"
              }`}
              aria-pressed={selected ? "true" : "false"}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function SelectedListingContext({
  locale: _locale = "et",
  inline = false,
  loading = false,
  error = "",
  listing = null,
  isOwn = false,
  editState = null,
  connectOptions = [],
  selectedConnectListingId = "",
  busyAction = "",
  onSelectConnectListing,
  onConnect,
  onStartEdit,
  onChangeEditField,
  onCancelEdit,
  onSaveEdit,
  onDeleteListing,
  onDismiss
}) {
  const { t } = useI18n();
  const ui = getHelpUiText(t);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (inline || !isMounted || (!listing && !loading && !error)) return undefined;
    const root = document.documentElement;
    document.body.classList.toggle("modal-open", true);
    root.classList.toggle("modal-open", true);
    document.body.classList.toggle("selected-listing-modal-open", true);
    root.classList.toggle("selected-listing-modal-open", true);
    return () => {
      document.body.classList.remove("modal-open");
      root.classList.remove("modal-open");
      document.body.classList.remove("selected-listing-modal-open");
      root.classList.remove("selected-listing-modal-open");
    };
  }, [error, inline, isMounted, listing, loading]);

  if (!inline && (!isMounted || typeof document === "undefined")) {
    return null;
  }

  if (!listing && !loading && !error) {
    return null;
  }

  const kindActionLabel = listing?.kind === "request" ? ui.offerHelp : ui.contact;
  const connectDisabled = !selectedConnectListingId || busyAction === "connect";
  const descriptionValue = editState?.description ?? listing?.editableDescription ?? listing?.description ?? "";
  const categoryCodeValue = editState?.primaryCategoryCode ?? listing?.primaryCategoryCode ?? "";
  const helpTypeValue = editState?.helpType ?? listing?.helpType ?? "";
  const timeTypeValue = editState?.timeType ?? listing?.timeType ?? "";
  const targetGroupCodesValue = (Array.isArray(editState?.targetGroupCodes)
    ? editState.targetGroupCodes
    : (Array.isArray(listing?.targetGroupCodes) ? listing.targetGroupCodes : []))
    .filter((code) => TARGET_GROUP_OPTION_VALUES.has(code));
  const rawPlaceValue = editState?.rawPlace ?? listing?.editableRawPlace ?? listing?.rawPlace ?? "";
  const availabilityOrStartValue = editState?.availabilityOrStart ?? listing?.editableAvailabilityOrStart ?? listing?.availabilityOrStart ?? "";
  const compensationDetailsValue = editState?.compensationDetails ?? listing?.editableCompensationDetails ?? listing?.compensationDetails ?? "";
  const conditionsValue = editState?.conditions ?? listing?.editableConditions ?? listing?.conditions ?? "";
  const infoItems = listing ? buildInfoItems(listing, ui) : [];
  const cleanDescription = listing ? buildCleanDescription(listing) : "";
  const selectedListingContentClassName =
    `selected-listing-modal-content mx-auto !w-[min(100%,62vw)] !max-w-[clamp(30rem,54vw,38rem)] ` +
    `relative !flex !max-h-[calc(100dvh-2.5rem)] !flex-col overflow-x-hidden !overflow-hidden pt-[0.35rem] !pb-[1rem] text-[1.08rem] ` +
    `[--glass-modal-bg:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] ` +
    `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
    `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] shadow-[var(--glass-shell-shadow,none)] ` +
    `${glassSubpageSurfaceScopeClassName} ${glassPrimaryButtonToneClassName} ` +
    `leading-[1.35] tracking-[0.024rem] mobile-keep-desktop-glass-cards ` +
    `max-[768px]:!max-w-none max-[768px]:mx-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] ` +
    `max-[768px]:!w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
    `max-[768px]:rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] ` +
    `max-[768px]:px-[var(--glass-ring-pad-x,clamp(calc(1.8*var(--base-rem)),5vw,calc(3.2*var(--base-rem))))] ` +
    `max-[768px]:pt-[var(--glass-ring-pad-top,clamp(calc(0.4*var(--base-rem)),1.4vh,calc(1.1*var(--base-rem))))] ` +
    `max-[768px]:!max-h-[calc(100dvh-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
    `max-[768px]:pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)]`;
  const actionButtonClassName =
    "!min-h-[2.72rem] !rounded-[1.32rem] !px-[1.15rem] !py-[0.58rem] !text-[1.04rem] !tracking-[0.022em] max-[768px]:!min-h-[2.9rem] max-[768px]:!text-[1.08rem]";
  const actionRowClassName =
    "mt-[-0.15rem] flex flex-wrap justify-center gap-[0.48rem] pt-0 pb-[0.05rem] max-[768px]:mt-[-0.05rem] max-[768px]:pb-[0.1rem]";
  const selectedListingTitleClassName =
    `${glassPageTitleClassName} subpage-mobile-title policy-mobile-title policy-mobile-title--static selected-listing-title max-[768px]:!mt-0 max-[768px]:!mb-0`;
  const mobileTitleWrapClassName =
    "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
  const selectedListingBodyClassName = inline
    ? `selected-listing-body selected-listing-body--inline ${glassSubpageContentWideClassName} flex min-h-0 max-h-[calc(100dvh-12rem)] flex-none touch-pan-y flex-col overflow-y-auto overflow-x-hidden overscroll-contain gap-[0.4rem] !w-full !max-w-none px-[0.78rem] pt-[0.02rem] pb-[0.25rem] [scrollbar-gutter:auto] max-[768px]:gap-[0.38rem] max-[768px]:px-[0.2rem] max-[768px]:pt-0 max-[768px]:pb-[0.35rem]`
    : `selected-listing-body ${glassSubpageContentWideClassName} flex min-h-0 max-h-full flex-1 touch-pan-y flex-col overflow-y-auto overflow-x-hidden overscroll-contain gap-[0.8rem] px-[0.78rem] pt-[0.8rem] pb-[1.45rem] [scrollbar-gutter:stable_both-edges] max-[768px]:px-[0.2rem] max-[768px]:pb-[calc(env(safe-area-inset-bottom,0px)+1.3rem)]`;
  const selectedListingPanelClassName = inline
    ? `${glassSubpagePanelWideClassName} selected-listing-panel--inline relative mb-0 !w-full !max-w-none self-stretch !max-h-none !overflow-visible !px-[0.74rem] !py-[0.58rem] !shadow-none max-[768px]:!px-[0.42rem] max-[768px]:!py-[0.45rem]`
    : `${glassSubpagePanelWideClassName} mt-[0.9rem] self-center max-[768px]:mt-[0.8rem] !p-[0.5rem] !shadow-none max-[768px]:!p-[0.85rem]`;
  const statusRowVisible = Boolean(listing?.statusLabel || (isOwn && listing));

  const selectedListingContent = (
    <>
      <BackButton
        onClick={onDismiss}
        ariaLabel={ui.close}
        className={glassPageBackTopLeftClassName}
      />

      <header className="selected-listing-title-wrap mb-[0.1rem] flex w-full items-start justify-center gap-[0.75rem]">
        <div className={mobileTitleWrapClassName}>
          <h2 className={selectedListingTitleClassName}>
            {loading ? ui.loading : listing?.title || ui.selectedListing}
          </h2>
        </div>
      </header>

      {statusRowVisible ? (
        <div className="flex justify-center">
          <p className="mt-[0.34rem] flex max-w-full flex-wrap items-center justify-center gap-x-[0.55rem] gap-y-[0.18rem] text-center text-[1.22rem] font-[390] tracking-[0.012em] text-[color:var(--title-color,var(--brand-primary))] opacity-72 max-[768px]:mt-[0.28rem] max-[768px]:text-[1.18rem] max-[768px]:tracking-[0.01em]">
            {listing?.statusLabel ? <span>{listing.statusLabel}</span> : null}
            {listing?.statusLabel && isOwn ? (
              <span aria-hidden="true" className="opacity-42">|</span>
            ) : null}
            {isOwn ? <span>{ui.ownListing}</span> : null}
          </p>
        </div>
      ) : null}

      <div className={selectedListingBodyClassName}>
        <Panel
          variant="subpage"
          padding="sm"
          className={selectedListingPanelClassName}
        >
          {loading ? <div className="px-2 py-4 text-[1rem] opacity-80">{ui.loading}</div> : null}
          {!loading && error ? <div className="px-2 py-4 text-[1rem] text-[#d68580] [.theme-night_&]:text-[rgba(226,182,180,0.96)]">{error}</div> : null}
          {!loading && listing ? (
            <div className="selected-listing-detail-grid grid gap-[0.62rem]">
              {listing.summary ? (
                <p className="mx-auto max-w-full text-center text-[0.96rem] leading-[1.36] font-[520] opacity-88 [text-wrap:balance]">
                  {listing.summary}
                </p>
              ) : null}
              {cleanDescription ? <div className="whitespace-pre-wrap text-[0.98rem] leading-[1.48] opacity-88">{cleanDescription}</div> : null}
              {infoItems.length ? (
                <dl className="selected-listing-info-list grid gap-[0.3rem] rounded-[0.9rem] border border-[color:var(--subpage-card-border,transparent)] bg-[color:color-mix(in_srgb,var(--subpage-card-bg)_92%,transparent)] px-[0.74rem] py-[0.52rem] !shadow-none">
                  {infoItems.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="grid gap-[0.04rem]">
                      <dt className="text-[0.72rem] uppercase tracking-[0.075em] opacity-62">{item.label}</dt>
                      <dd className="m-0 text-[0.92rem] leading-[1.28] opacity-92">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {editState ? (
                <div className="documents-workspace grid gap-[0.8rem] pt-[0.35rem]">
                  <TextField
                    label={ui.title}
                    value={editState.title}
                    onChange={(value) => onChangeEditField?.("title", value)}
                    placeholder={ui.title}
                  />
                  <TextAreaField
                    label={ui.description}
                    value={descriptionValue}
                    onChange={(value) => onChangeEditField?.("description", value)}
                    rows={5}
                  />
                  <div className="grid gap-[0.8rem] md:grid-cols-2">
                    <DropdownField
                      label={ui.category}
                      value={categoryCodeValue}
                      onChange={(value) => onChangeEditField?.("primaryCategoryCode", value)}
                      options={HELP_CATEGORY_OPTIONS}
                    />
                    <TextField
                      label={ui.location}
                      value={rawPlaceValue}
                      onChange={(value) => onChangeEditField?.("rawPlace", value)}
                      placeholder={ui.location}
                    />
                    <DropdownField
                      label={ui.helpType}
                      value={helpTypeValue}
                      onChange={(value) => onChangeEditField?.("helpType", value)}
                      options={[
                        { value: "", label: ui.emptyOption },
                        { value: "VOLUNTARY", label: ui.voluntaryLabel },
                        { value: "PAID", label: ui.paidLabel },
                        { value: "MIXED", label: ui.mixedLabel }
                      ]}
                    />
                    <DropdownField
                      label={ui.timeType}
                      value={timeTypeValue}
                      onChange={(value) => onChangeEditField?.("timeType", value)}
                      options={[
                        { value: "", label: ui.emptyOption },
                        { value: "ONE_TIME", label: ui.oneTimeLabel },
                        { value: "RECURRING", label: ui.recurringLabel },
                        { value: "FLEXIBLE", label: ui.flexibleLabel }
                      ]}
                    />
                  </div>
                  <TargetGroupsField
                    label={ui.targetGroups}
                    value={targetGroupCodesValue}
                    onChange={(value) => onChangeEditField?.("targetGroupCodes", value)}
                  />
                  <TextAreaField
                    label={ui.availabilityOrStart}
                    value={availabilityOrStartValue}
                    onChange={(value) => onChangeEditField?.("availabilityOrStart", value)}
                    rows={2}
                  />
                  <div className="grid gap-[0.8rem] md:grid-cols-2">
                    <TextField
                      label={ui.compensationDetails}
                      value={compensationDetailsValue}
                      onChange={(value) => onChangeEditField?.("compensationDetails", value)}
                      placeholder={ui.compensationDetails}
                    />
                    <TextField
                      label={ui.conditions}
                      value={conditionsValue}
                      onChange={(value) => onChangeEditField?.("conditions", value)}
                      placeholder={ui.conditions}
                    />
                  </div>
                  <div className={actionRowClassName}>
                    <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={() => onSaveEdit?.({ ...editState, targetGroupCodes: targetGroupCodesValue })}>
                      {ui.save}
                    </Button>
                    <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={onCancelEdit}>
                      {ui.cancel}
                    </Button>
                  </div>
                </div>
              ) : null}

              {!editState && isOwn ? (
                <div className={actionRowClassName}>
                  <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={onStartEdit}>
                    {ui.edit}
                  </Button>
                  <Button type="button" variant="danger" size="md" className={actionButtonClassName} onClick={onDeleteListing} disabled={busyAction === "delete"}>
                    {ui.delete}
                  </Button>
                </div>
              ) : null}

              {!editState && !isOwn ? (
                <div className="documents-workspace grid gap-[0.8rem] pt-[0.35rem]">
                  {listing.status === "CLOSED" ? <div className="text-[0.92rem] opacity-72">{ui.statusClosed}</div> : null}
                  <DropdownField
                    label={ui.selectOwnListing}
                    value={selectedConnectListingId}
                    onChange={(value) => onSelectConnectListing?.(value)}
                    options={[
                      { value: "", label: connectOptions.length ? "-" : ui.noOwnOptions },
                      ...connectOptions.map((item) => ({
                        value: item.id,
                        label: item.title
                      }))
                    ]}
                  />
                  <div className={actionRowClassName}>
                    <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={onConnect} disabled={connectDisabled}>
                      {busyAction === "connect" ? `${kindActionLabel}...` : kindActionLabel}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Panel>
      </div>
    </>
  );

  if (inline) {
    return (
      <div className={`${glassPrimaryButtonToneClassName} selected-listing-inline flex min-h-0 w-full flex-none flex-col overflow-visible`}>
        {selectedListingContent}
      </div>
    );
  }

  return createPortal(
    <Modal
      open
      variant="glass"
      onClose={onDismiss}
      closeOnOverlayClick
      aria-label={listing?.title || ui.selectedListing}
      className="selected-listing-modal-overlay z-[142] bg-transparent overflow-y-auto overscroll-contain items-start py-[clamp(1rem,3vh,1.75rem)] max-[768px]:items-start max-[768px]:py-[max(var(--mobile-glass-card-gap,0.35rem),0.35rem)]"
      contentClassName={selectedListingContentClassName}
    >
      {selectedListingContent}
    </Modal>,
    document.body
  );
}
