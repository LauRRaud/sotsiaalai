"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import Panel from "@/components/ui/Panel";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import { useI18n } from "@/components/i18n/I18nProvider";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";

const pageClassName =
  "flex w-full min-w-0 max-w-full flex-col gap-[1rem] overflow-x-clip text-[color:var(--admin-text)] " +
  "[--admin-text:var(--documents-page-text)] [--admin-muted:var(--documents-page-muted)] [--admin-surface:var(--documents-card-bg)] " +
  "[--admin-surface-2:var(--documents-subpanel-bg)] [--admin-surface-3:var(--documents-content-bg)] [--admin-border:var(--documents-card-border)] " +
  "[--admin-border-strong:var(--documents-subpanel-border)] [--admin-shadow-soft:var(--documents-soft-shadow)] [--admin-shadow:var(--documents-strong-shadow)] " +
  "[--admin-accent:var(--documents-accent)] [--admin-accent-soft:var(--documents-accent-soft)] [--admin-success:var(--documents-success-text)] " +
  "[--admin-surface:rgba(255,255,255,0.22)] [--admin-surface-2:rgba(255,255,255,0.18)] [--admin-surface-3:rgba(255,255,255,0.14)] " +
  "[--admin-border:rgba(248,253,255,0.16)] [--admin-border-strong:rgba(248,253,255,0.12)] " +
  "[.theme-night_&]:[--admin-surface:rgba(16,22,34,0.34)] [.theme-night_&]:[--admin-surface-2:rgba(16,22,34,0.32)] [.theme-night_&]:[--admin-surface-3:rgba(16,22,34,0.28)] " +
  "[.theme-night_&]:[--admin-border:rgba(248,253,255,0.16)] [.theme-night_&]:[--admin-border-strong:rgba(248,253,255,0.12)] " +
  "[.theme-light_&]:[--admin-surface:rgba(255,255,255,0.22)] [.theme-light_&]:[--admin-surface-2:rgba(255,255,255,0.18)] [.theme-light_&]:[--admin-surface-3:rgba(255,255,255,0.14)] " +
  "[.theme-light_&]:[--admin-border:rgba(148,163,184,0.18)] [.theme-light_&]:[--admin-border-strong:rgba(148,163,184,0.16)]";
const cardClassName =
  "documents-subpanel relative w-full min-w-0 overflow-visible rounded-[1rem]";
const cardBodyClassName = "relative z-[1] grid gap-[0.9rem]";
const toolbarClassName =
  "documents-soft-subpanel grid min-w-0 grid-cols-1 items-center gap-2 rounded-[1rem] p-[0.72rem] xl:grid-cols-[minmax(14rem,1fr)_minmax(11rem,12rem)_auto]";
const inputClassName =
  "documents-field documents-form-input min-w-0 w-full max-w-full rounded-[12px] border px-3 py-[0.6rem] text-[0.98rem] text-[color:var(--admin-text)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none";
const actionButtonClassName =
  "documents-primary-button !justify-self-start !self-start !w-auto !min-h-[2.5rem] !rounded-full !px-[1rem] !py-[0.5rem] !text-[0.96rem] max-[768px]:!w-full max-[768px]:!justify-center";
const statsGridClassName = "grid gap-3 md:grid-cols-3";
const statCardClassName =
  "documents-soft-subpanel grid gap-1 rounded-[1rem] p-3";
const statLabelClassName = "text-[0.76rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
const statValueClassName = "text-[1.9rem] font-[700] leading-[1.02] text-[color:var(--admin-text)]";
const statMetaClassName = "text-[0.92rem] text-[color:var(--admin-muted)]";
const tableWrapClassName =
  "documents-soft-subpanel w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-[1rem] pr-[0.15rem] [scrollbar-width:thin]";
const tableClassName = "min-w-[60rem] w-full border-collapse text-[color:var(--admin-text)]";
const tableHeadCellClassName =
  "sticky top-0 z-[1] border-b border-[color:var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-surface-3)_92%,transparent)] px-3 py-2 text-left text-[0.74rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
const tableCellClassName = "border-b border-[color:var(--admin-border)] px-3 py-3 text-left text-[0.96rem] align-top";
const cellSubClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
const badgeClassName =
  "documents-chip inline-flex items-center rounded-full px-[0.65rem] py-[0.18rem] text-[0.78rem] font-semibold";
const mobileListClassName = "hidden gap-2 max-[1180px]:grid";
const mobileRowCardClassName =
  "documents-soft-subpanel grid gap-3 rounded-[1rem] p-3";
const mobileRowTitleClassName = "text-[1rem] font-semibold leading-[1.25] text-[color:var(--admin-text)]";
const mobileFieldGridClassName = "grid gap-2 sm:grid-cols-2";
const mobileFieldClassName = "grid gap-[0.35rem]";
const mobileFieldLabelClassName = "text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
const mobileFieldValueClassName = "break-words text-[0.92rem] leading-[1.45] text-[color:var(--admin-text)]";
const emptyClassName =
  "documents-empty-state rounded-[1rem] border border-dashed px-4 py-5 text-center text-[color:var(--admin-muted)]";

const DAY_OPTIONS = [30, 90, 365, 3650];

function toLocaleTag(locale) {
  const normalized = String(locale || "en").toLowerCase();
  if (normalized.startsWith("et")) return "et-EE";
  if (normalized.startsWith("ru")) return "ru-RU";
  return "en-US";
}

function formatCount(value, localeTag) {
  try {
    return new Intl.NumberFormat(localeTag).format(Number(value || 0));
  } catch {
    return String(Number(value || 0));
  }
}

function formatDate(value, localeTag) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat(localeTag, {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function MobileField({ label, value }) {
  return (
    <div className={mobileFieldClassName}>
      <div className={mobileFieldLabelClassName}>{label}</div>
      <div className={mobileFieldValueClassName}>{value || "-"}</div>
    </div>
  );
}

export default function FrameworkAcceptancesAdmin() {
  const { locale, t } = useI18n();
  const localeTag = useMemo(() => toLocaleTag(locale), [locale]);
  const dayOptions = useMemo(
    () =>
      DAY_OPTIONS.map(value => ({
        value: String(value),
        label:
          value === 3650
            ? t("admin.framework_acceptances.period_all", "All available")
            : t("admin.framework_acceptances.period_days", "{days} days").replace("{days}", String(value))
      })),
    [t]
  );
  const [query, setQuery] = useState("");
  const [days, setDays] = useState(365);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [signedDownloads, setSignedDownloads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = useCallback(
    async (signal, searchValue = query, dayValue = days) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          locale,
          limit: "100",
          days: String(dayValue)
        });
        if (String(searchValue || "").trim()) params.set("q", String(searchValue).trim());
        const res = await fetch(`/api/admin/framework-acceptances?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "x-ui-locale": locale
          },
          signal
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(resolveApiMessage(data, t, "admin.framework_acceptances.load_failed"));
        }
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.total || 0));
        setSignedDownloads(Number(data?.signedDownloads || 0));
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(String(err?.message || t("admin.framework_acceptances.load_failed", "Failed to load framework acceptances.")));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [days, locale, query, t]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchItems(controller.signal, query, days);
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [days, fetchItems, query]);

  const shownSignedDownloads = useMemo(
    () => items.filter(item => item?.signedDocumentDownloadedAt).length,
    [items]
  );

  return (
    <div className={pageClassName}>
      <Panel as="section" variant="secondary" padding="sm" className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className="grid gap-[0.35rem]">
            <CardTitle as="h2" className="documents-subsection-title m-0 text-[1.45rem] max-[768px]:text-[1.7rem]">
              {t("admin.framework_acceptances.title", "Framework acceptances")}
            </CardTitle>
            <p className="documents-section-description m-0 max-w-[72ch] text-[0.98rem] leading-[1.6] text-[color:var(--admin-muted)]">
              {t(
                "admin.framework_acceptances.subtitle",
                "Admin audit view for worker-use framework confirmations created during registration."
              )}
            </p>
          </div>

          <div className={toolbarClassName}>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={t(
                "admin.framework_acceptances.search_placeholder",
                "Search by email, user ID, version or framework key"
              )}
              className={inputClassName}
            />
            <DocumentsDropdown
              ariaLabel={t("admin.framework_acceptances.period", "Period")}
              value={String(days)}
              onChange={nextValue => setDays(Number(nextValue) || 365)}
              options={dayOptions}
              className="w-full"
            />
            <Button
              type="button"
              className={actionButtonClassName}
              onClick={() => fetchItems(undefined, query, days)}
            >
              {loading
                ? t("admin.framework_acceptances.refreshing", "Refreshing...")
                : t("buttons.refresh", "Refresh")}
            </Button>
          </div>

          {error ? <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">{error}</div> : null}

          <div className={statsGridClassName}>
            <div className={statCardClassName}>
              <div className={statLabelClassName}>{t("admin.framework_acceptances.stats.total", "Total matches")}</div>
              <div className={statValueClassName}>{formatCount(total, localeTag)}</div>
              <div className={statMetaClassName}>
                {t("admin.framework_acceptances.stats.period", "Within selected period")}
              </div>
            </div>
            <div className={statCardClassName}>
              <div className={statLabelClassName}>{t("admin.framework_acceptances.stats.shown", "Shown in list")}</div>
              <div className={statValueClassName}>{formatCount(items.length, localeTag)}</div>
              <div className={statMetaClassName}>
                {t("admin.framework_acceptances.stats.current_page", "Current query result")}
              </div>
            </div>
            <div className={statCardClassName}>
              <div className={statLabelClassName}>
                {t("admin.framework_acceptances.stats.signed_downloads", "Framework agreement download recorded")}
              </div>
              <div className={statValueClassName}>{formatCount(signedDownloads, localeTag)}</div>
              <div className={statMetaClassName}>
                {t("admin.framework_acceptances.stats.shown_signed", "Shown now: {count}")
                  .replace("{count}", formatCount(shownSignedDownloads, localeTag))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel as="section" variant="secondary" padding="sm" className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle as="h2" className="documents-subsection-title m-0 text-[1.38rem] max-[768px]:text-[1.6rem]">
              {t("admin.framework_acceptances.table_title", "Acceptance records")}
            </CardTitle>
            <div className="documents-meta-text text-[0.9rem]">
              {loading
                ? t("admin.common.loading_data", "Loading...")
                : t("admin.framework_acceptances.results_count", "{count} records").replace(
                    "{count}",
                    formatCount(items.length, localeTag)
                  )}
            </div>
          </div>

          <div className="min-w-0 max-[1180px]:hidden">
            <div className={tableWrapClassName}>
              <table className={tableClassName}>
                <thead>
                  <tr>
                    <th className={tableHeadCellClassName}>{t("admin.framework_acceptances.columns.time", "Time")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.framework_acceptances.columns.user", "User")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.framework_acceptances.columns.role", "Role")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.framework_acceptances.columns.framework", "Framework")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.framework_acceptances.columns.downloads", "Open / signed")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.framework_acceptances.columns.document", "Document record")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className={tableCellClassName} colSpan={6}>
                        {t("admin.common.loading_data", "Loading...")}
                      </td>
                    </tr>
                  ) : items.length ? (
                    items.map(item => (
                      <tr key={item.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                        <td className={tableCellClassName}>
                          <div>{formatDate(item.acceptedAt, localeTag)}</div>
                          <div className={cellSubClassName}>{item.id}</div>
                        </td>
                        <td className={tableCellClassName}>
                          <div>{item.userEmail || "-"}</div>
                          <div className={cellSubClassName}>{item.userId}</div>
                        </td>
                        <td className={tableCellClassName}>{item.roleAtAcceptance || "-"}</td>
                        <td className={tableCellClassName}>
                          <div className="flex flex-wrap gap-1">
                            <span className={badgeClassName}>{item.frameworkKey}</span>
                            <span className={badgeClassName}>{item.frameworkVersion}</span>
                          </div>
                          <div className={cellSubClassName}>
                            {item.acceptanceType} / {item.acceptanceSource}
                          </div>
                        </td>
                        <td className={tableCellClassName}>
                          <div>
                            {t("admin.framework_acceptances.columns.opened", "Opened")}:{" "}
                            {formatDate(item.reviewDocumentOpenedAt, localeTag)}
                          </div>
                          <div className={cellSubClassName}>
                            {t("admin.framework_acceptances.columns.signed", "Framework agreement download")}:{" "}
                            {formatDate(item.signedDocumentDownloadedAt, localeTag)}
                          </div>
                        </td>
                        <td className={tableCellClassName}>
                          <div>{item.document?.title || "-"}</div>
                          <div className={cellSubClassName}>{item.document?.id || "-"}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={tableCellClassName} colSpan={6}>
                        {t("admin.framework_acceptances.empty", "No framework acceptances found.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={mobileListClassName}>
            {loading ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : items.length ? (
              items.map(item => (
                <article key={item.id} className={mobileRowCardClassName}>
                  <div className="grid gap-1">
                    <div className={mobileRowTitleClassName}>{item.userEmail || item.userId}</div>
                    <div className="text-[0.84rem] text-[color:var(--admin-muted)]">
                      {formatDate(item.acceptedAt, localeTag)}
                    </div>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileField
                      label={t("admin.framework_acceptances.columns.role", "Role")}
                      value={item.roleAtAcceptance || "-"}
                    />
                    <MobileField
                      label={t("admin.framework_acceptances.columns.framework", "Framework")}
                      value={`${item.frameworkKey} / ${item.frameworkVersion}`}
                    />
                    <MobileField
                      label={t("admin.framework_acceptances.columns.opened", "Opened")}
                      value={formatDate(item.reviewDocumentOpenedAt, localeTag)}
                    />
                    <MobileField
                      label={t("admin.framework_acceptances.columns.signed", "Framework agreement download")}
                      value={formatDate(item.signedDocumentDownloadedAt, localeTag)}
                    />
                    <MobileField
                      label={t("admin.framework_acceptances.columns.document", "Document record")}
                      value={item.document?.title || "-"}
                    />
                    <MobileField
                      label={t("admin.framework_acceptances.columns.id", "Acceptance ID")}
                      value={item.id}
                    />
                  </div>
                </article>
              ))
            ) : (
              <div className={emptyClassName}>{t("admin.framework_acceptances.empty", "No framework acceptances found.")}</div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
