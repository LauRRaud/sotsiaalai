"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Panel from "@/components/ui/Panel";
import {
  glassPageBackTopLeftClassName,
  glassSubpageContentWideClassName,
  glassSubpageMobileReadableWidthClassName,
  glassSubpagePanelWideClassName,
  glassSubpageSurfaceScopeClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getHelpUiText } from "./helpUiText";

function splitTargetGroups(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

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

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <label className="grid gap-[0.35rem]">
      <span className="text-[0.8rem] uppercase tracking-[0.08em] opacity-74">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="min-h-[3rem] rounded-[1rem] border border-[rgba(248,253,255,0.12)] bg-[rgba(255,255,255,0.12)] px-[0.95rem] py-[0.62rem] text-[1rem] text-[color:var(--glass-modal-text)] outline-none [.theme-light_&]:border-[rgba(122,58,56,0.08)] [.theme-light_&]:bg-[rgba(255,255,255,0.3)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SelectedListingContext({
  locale: _locale = "et",
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
  onCloseListing,
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
    if (!isMounted || (!listing && !loading && !error)) return undefined;
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
  }, [error, isMounted, listing, loading]);

  if (!isMounted || typeof document === "undefined") {
    return null;
  }

  if (!listing && !loading && !error) {
    return null;
  }

  const kindActionLabel = listing?.kind === "request" ? ui.offerHelp : ui.contact;
  const connectDisabled = !selectedConnectListingId || busyAction === "connect";
  const descriptionValue = editState?.description ?? listing?.editableDescription ?? listing?.description ?? "";
  const roleValue = editState?.roleLabel ?? listing?.roleLabel ?? "";
  const helpTypeValue = editState?.helpType ?? listing?.helpType ?? "";
  const timeTypeValue = editState?.timeType ?? listing?.timeType ?? "";
  const targetGroupsValue = editState?.targetGroups ?? (Array.isArray(listing?.targetGroupLabels) ? listing.targetGroupLabels.join(", ") : "");
  const infoItems = listing ? buildInfoItems(listing, ui) : [];
  const cleanDescription = listing ? buildCleanDescription(listing) : "";
  const selectedListingContentClassName =
    `selected-listing-modal-content !w-[min(100%,62vw)] !max-w-[clamp(30rem,54vw,38rem)] ` +
    `relative !flex !max-h-[calc(100dvh-2.5rem)] !flex-col overflow-x-hidden !overflow-hidden pt-[0.35rem] !pb-[1rem] text-[1.08rem] ` +
    `[--glass-modal-bg:var(--subpage-card-bg,var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25))))] ` +
    `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
    `[border:none] [background:var(--subpage-card-bg,var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25))))] shadow-[var(--glass-shell-shadow,none)] ` +
    `${glassSubpageSurfaceScopeClassName} ` +
    `leading-[1.35] tracking-[0.024rem] mobile-keep-desktop-glass-cards ` +
    `max-[768px]:!max-w-none max-[768px]:mx-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] ` +
    `max-[768px]:!w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
    `max-[768px]:rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] ` +
    `max-[768px]:px-[var(--glass-ring-pad-x,clamp(calc(1.8*var(--base-rem)),5vw,calc(3.2*var(--base-rem))))] ` +
    `max-[768px]:pt-[var(--glass-ring-pad-top,clamp(calc(0.4*var(--base-rem)),1.4vh,calc(1.1*var(--base-rem))))] ` +
    `max-[768px]:!max-h-[calc(100dvh-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
    `max-[768px]:pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)]`;
  const actionButtonClassName =
    "!min-h-[2.82rem] !px-[1.1rem] !py-[0.6rem] !text-[1rem] max-[768px]:!min-h-[2.95rem] max-[768px]:!text-[1.04rem]";

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
      <BackButton
        onClick={onDismiss}
        ariaLabel={ui.close}
        className={glassPageBackTopLeftClassName}
      />

      <header className="selected-listing-title-wrap flex w-full items-start justify-center px-[4.3rem] max-[768px]:px-[3.85rem]">
        <div className="flex w-full max-w-[30rem] flex-col items-center text-center">
          <div className="selected-listing-eyebrow mt-[0.7rem] text-[0.82rem] uppercase tracking-[0.12em] text-[color:var(--title-color,var(--brand-primary))] opacity-76 max-[768px]:mt-[calc(env(safe-area-inset-top,0px)+2rem)]">
            {isOwn ? ui.ownListing : ui.selectedListing}
          </div>
          <div className="policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]">
            <h2
              className={`selected-listing-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ${glassPageTitleClassName} w-full max-w-[30rem] !text-balance max-[768px]:!mt-0 max-[768px]:!mb-0 min-[769px]:!mt-[0.45rem]`}
            >
              {loading ? ui.loading : listing?.title || ui.selectedListing}
            </h2>
          </div>
          {listing?.municipalityLabel || listing?.statusLabel ? (
            <p className="mt-[0.82rem] text-[1.08rem] font-[390] tracking-[0.012em] text-[color:var(--title-color,var(--brand-primary))] opacity-72 max-[768px]:text-[1.12rem]">
              {[listing?.municipalityLabel, listing?.statusLabel].filter(Boolean).join(" | ")}
            </p>
          ) : null}
        </div>
      </header>

      <div className={`selected-listing-body ${glassSubpageContentWideClassName} ${glassSubpageMobileReadableWidthClassName} flex flex-1 flex-col overflow-y-auto gap-[0.8rem] px-[0.78rem] pt-[0.8rem] pb-[0.4rem] pr-[0.55rem] max-[768px]:px-[0.05rem] max-[768px]:pr-[0.05rem]`}>
        <Panel
          variant="subpage"
          padding="sm"
          className={`${glassSubpagePanelWideClassName} mt-[0.9rem] max-[768px]:mt-[0.8rem] !p-[0.5rem] max-[768px]:!p-[0.12rem]`}
        >
          {loading ? <div className="px-2 py-4 text-[1rem] opacity-80">{ui.loading}</div> : null}
          {!loading && error ? <div className="px-2 py-4 text-[1rem] text-[#d68580] [.theme-night_&]:text-[rgba(226,182,180,0.96)]">{error}</div> : null}
          {!loading && listing ? (
            <div className="grid gap-[0.9rem]">
              {listing.summary ? (
                <p className="text-[0.96rem] leading-[1.45] font-[520] opacity-88">
                  {listing.summary}
                </p>
              ) : null}
              {cleanDescription ? <div className="whitespace-pre-wrap text-[0.98rem] leading-[1.62] opacity-88">{cleanDescription}</div> : null}
              {infoItems.length ? (
                <dl className="grid gap-[0.55rem] rounded-[1rem] border border-[color:var(--subpage-card-border,transparent)] bg-[color:color-mix(in_srgb,var(--subpage-card-bg)_92%,transparent)] px-[0.85rem] py-[0.78rem] shadow-[var(--subpage-card-shadow)]">
                  {infoItems.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="grid gap-[0.14rem]">
                      <dt className="text-[0.76rem] uppercase tracking-[0.08em] opacity-62">{item.label}</dt>
                      <dd className="m-0 text-[0.94rem] leading-[1.42] opacity-92">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {editState ? (
                <div className="grid gap-[0.8rem] pt-[0.35rem]">
                  <Input
                    id="listing-edit-title"
                    value={editState.title}
                    onChange={(event) => onChangeEditField?.("title", event.target.value)}
                    placeholder={ui.title}
                    aria-label={ui.title}
                  />
                  <label className="grid gap-[0.35rem]">
                    <span className="text-[0.8rem] uppercase tracking-[0.08em] opacity-74">{ui.description}</span>
                    <textarea
                      value={descriptionValue}
                      onChange={(event) => onChangeEditField?.("description", event.target.value)}
                      rows={5}
                      className="rounded-[1rem] border border-[rgba(248,253,255,0.12)] bg-[rgba(255,255,255,0.12)] px-[0.95rem] py-[0.78rem] text-[1rem] text-[color:var(--glass-modal-text)] outline-none [.theme-light_&]:border-[rgba(122,58,56,0.08)] [.theme-light_&]:bg-[rgba(255,255,255,0.3)]"
                    />
                  </label>
                  <div className="grid gap-[0.8rem] md:grid-cols-2">
                    <Input
                      id="listing-edit-role"
                      value={roleValue}
                      onChange={(event) => onChangeEditField?.("roleLabel", event.target.value)}
                      placeholder={ui.roleLabel}
                      aria-label={ui.roleLabel}
                    />
                    <SelectField
                      label={ui.helpType}
                      value={helpTypeValue}
                      onChange={(event) => onChangeEditField?.("helpType", event.target.value)}
                      options={[
                        { value: "", label: ui.emptyOption },
                        { value: "VOLUNTARY", label: ui.voluntaryLabel },
                        { value: "PAID", label: ui.paidLabel },
                        { value: "MIXED", label: ui.mixedLabel }
                      ]}
                    />
                    <SelectField
                      label={ui.timeType}
                      value={timeTypeValue}
                      onChange={(event) => onChangeEditField?.("timeType", event.target.value)}
                      options={[
                        { value: "", label: ui.emptyOption },
                        { value: "ONE_TIME", label: ui.oneTimeLabel },
                        { value: "RECURRING", label: ui.recurringLabel },
                        { value: "FLEXIBLE", label: ui.flexibleLabel }
                      ]}
                    />
                    <Input
                      id="listing-edit-targets"
                      value={targetGroupsValue}
                      onChange={(event) => onChangeEditField?.("targetGroups", event.target.value)}
                      placeholder={ui.targetGroupsHint}
                      aria-label={ui.targetGroups}
                    />
                  </div>
                  <div className="flex flex-wrap justify-center gap-[0.6rem] pt-[0.25rem]">
                    <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={() => onSaveEdit?.({ ...editState, targetGroups: splitTargetGroups(targetGroupsValue) })}>
                      {ui.save}
                    </Button>
                    <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={onCancelEdit}>
                      {ui.cancel}
                    </Button>
                  </div>
                </div>
              ) : null}

              {!editState && isOwn ? (
                <div className="flex flex-wrap justify-center gap-[0.6rem] pt-[0.4rem]">
                  <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={onStartEdit}>
                    {ui.edit}
                  </Button>
                  <Button type="button" variant="primary" size="md" className={actionButtonClassName} onClick={onCloseListing} disabled={busyAction === "close" || listing.status === "CLOSED"}>
                    {ui.closeListing}
                  </Button>
                  <Button type="button" variant="danger" size="md" className={actionButtonClassName} onClick={onDeleteListing} disabled={busyAction === "delete"}>
                    {ui.delete}
                  </Button>
                </div>
              ) : null}

              {!editState && !isOwn ? (
                <div className="grid gap-[0.8rem] pt-[0.35rem]">
                  {listing.status === "CLOSED" ? <div className="text-[0.92rem] opacity-72">{ui.statusClosed}</div> : null}
                  <SelectField
                    label={ui.selectOwnListing}
                    value={selectedConnectListingId}
                    onChange={(event) => onSelectConnectListing?.(event.target.value)}
                    options={[
                      { value: "", label: connectOptions.length ? "-" : ui.noOwnOptions },
                      ...connectOptions.map((item) => ({
                        value: item.id,
                        label: item.title
                      }))
                    ]}
                  />
                  <div className="flex flex-wrap justify-center gap-[0.6rem]">
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
    </Modal>,
    document.body
  );
}
