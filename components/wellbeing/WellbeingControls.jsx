"use client";

import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import styles from "./WellbeingPage.module.css";

function toDropdownOptions(options = []) {
  return options.map((option) => {
    if (typeof option === "string") return { value: option, label: option };
    const [value, label] = option;
    return { value, label };
  });
}

function stripDuplicateHeading(title, value, stripTitles = []) {
  const text = String(value || "").trim();
  const firstLine = text.split(/\r?\n/, 1)[0]?.trim() || "";
  const normalize = (input) =>
    String(input || "")
      .toLocaleLowerCase("et-EE")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const headings = [title, ...stripTitles].map(normalize).filter(Boolean);

  if (headings.includes(normalize(firstLine))) {
    return text.slice(firstLine.length).replace(/^\s+/, "");
  }

  return text;
}

export function WellbeingSelectField({ field, value, onChange }) {
  return (
    <label className={styles.quickCheckField}>
      <span>{field.label}</span>
      <DocumentsDropdown
        value={value}
        onChange={(nextValue) => onChange(field.key, nextValue)}
        options={toDropdownOptions(field.options)}
        ariaLabel={field.label}
        placeholder={field.label}
        className="workspace-feature-dropdown wellbeing-dropdown"
        menuClassName="wellbeing-dropdown-menu"
      />
    </label>
  );
}

export function WellbeingToggleGroup({ field, values, onToggle }) {
  return (
    <div className={styles.quickCheckToggleGroup} aria-label={field.label}>
      {field.options.map(([value, label]) => (
        <label key={value}>
          <input
            type="checkbox"
            checked={values.includes(value)}
            onChange={() => onToggle(field.key, value)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}

export function WellbeingOutputCard({ title, value, stripTitles = [] }) {
  const body = stripDuplicateHeading(title, value, stripTitles);

  return (
    <article className={styles.quickCheckOutputCard}>
      <h4>{title}</h4>
      <pre>{body}</pre>
    </article>
  );
}
