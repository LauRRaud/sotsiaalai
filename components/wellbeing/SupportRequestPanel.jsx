"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { buildWellbeingShareableDraft } from "@/lib/wellbeing/supportDraftText";
import styles from "./WellbeingPage.module.css";

const supportOptions = [
  {
    outputType: "manager_memo",
    recipientType: "manager",
    label: "Koosta juhiga arutelu memo"
  },
  {
    outputType: "covision_input",
    recipientType: "covision",
    label: "Koosta kovisiooni sisend"
  },
  {
    outputType: "support_request",
    recipientType: "pilot_support_contact",
    label: "Koosta abipalve"
  }
];

export default function SupportRequestPanel({
  sourceWorkflowType = "quick-check",
  sourceRecordId = null,
  context,
  onNavigate
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [userReviewed, setUserReviewed] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [status, setStatus] = useState("idle");

  const preview = useMemo(() => {
    if (!selected) return "";
    return buildWellbeingShareableDraft({
      sourceWorkflowType,
      sourceRecordId,
      outputType: selected.outputType,
      recipientType: selected.recipientType,
      context
    }).generatedText;
  }, [context, selected, sourceRecordId, sourceWorkflowType]);

  function chooseOption(option) {
    setSelected(option);
    setDraft(null);
    setEditedText("");
    setUserReviewed(false);
    setUserConfirmed(false);
    setStatus("idle");
  }

  function leavePrivate() {
    setSelected(null);
    setDraft(null);
    setEditedText("");
    setUserReviewed(false);
    setUserConfirmed(false);
    setStatus("private");
  }

  async function saveDraft() {
    if (!selected || status === "saving") return;
    setStatus("saving");
    try {
      const response = await fetch("/api/wellbeing/output-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceWorkflowType,
          sourceRecordId,
          outputType: selected.outputType,
          recipientType: selected.recipientType,
          generatedText: editedText || preview,
          context
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "wellbeing.errors.output_draft_failed");
      setDraft(payload.draft);
      setEditedText(payload.draft?.generatedText || editedText || preview);
      setStatus("draft_saved");
    } catch {
      setStatus("error");
    }
  }

  async function confirmDraft() {
    if (!draft?.id || status === "saving") return;
    setStatus("saving");
    try {
      const response = await fetch(`/api/wellbeing/output-drafts/${encodeURIComponent(draft.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editedText: editedText || preview,
          userReviewed,
          userConfirmed
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "wellbeing.errors.output_confirm_failed");
      setDraft(payload.draft);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={styles.supportPanel} aria-labelledby="support-request-heading">
      <div className={styles.supportPanelHeader}>
        <div>
          <h3 id="support-request-heading">{t("wellbeing.support.title", "Soovin tuge küsida")}</h3>
          <p>
            {t(
              "wellbeing.support.intro",
              "Midagi ei saadeta automaatselt. Mustand jääb privaatseks, kuni oled teksti üle vaadanud ja kinnitanud."
            )}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={leavePrivate}>
          {t("wellbeing.support.leave_private", "Jäta privaatseks")}
        </Button>
      </div>

      <div className={styles.supportOptions} aria-label={t("wellbeing.support.options_label", "Toe küsimise valikud")}>
        {supportOptions.map((option) => (
          <Button
            key={option.outputType}
            type="button"
            variant={selected?.outputType === option.outputType ? "primary" : "secondary"}
            onClick={() => chooseOption(option)}
          >
            {option.label}
          </Button>
        ))}
        <Button type="button" variant="secondary" onClick={() => onNavigate?.("/tooheaolu/taastumine")}>
          {t("wellbeing.support.open_recovery", "Ava Taastumine")}
        </Button>
      </div>

      {selected ? (
        <div className={styles.supportDraftEditor}>
          <label className={styles.quickCheckField}>
            <span>{t("wellbeing.support.preview_label", "Jagatava versiooni eelvaade")}</span>
            <textarea
              value={editedText || preview}
              onChange={(event) => setEditedText(event.target.value)}
              rows={11}
            />
          </label>
          <div className={styles.supportReviewChecks}>
            <label>
              <input
                type="checkbox"
                checked={userReviewed}
                onChange={(event) => setUserReviewed(event.target.checked)}
              />
              {t("wellbeing.support.reviewed", "Olen teksti üle vaadanud ja liigsed detailid eemaldanud.")}
            </label>
            <label>
              <input
                type="checkbox"
                checked={userConfirmed}
                onChange={(event) => setUserConfirmed(event.target.checked)}
              />
              {t("wellbeing.support.confirmed", "Kinnitan, et see versioon sobib jagatavaks sisendiks.")}
            </label>
          </div>
          <div className={styles.supportActions}>
            <Button type="button" variant="secondary" onClick={saveDraft} disabled={status === "saving"}>
              {t("wellbeing.support.save_draft", "Salvesta privaatne mustand")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmDraft}
              disabled={!draft?.id || !userReviewed || !userConfirmed || status === "saving"}
            >
              {t("wellbeing.support.confirm_draft", "Kinnita jagatav versioon")}
            </Button>
            {selected.outputType === "covision_input" && status === "ready" ? (
              <Button type="button" variant="secondary" onClick={() => onNavigate?.("/kovisioon")}>
                {t("wellbeing.support.open_covision", "Ava olemasolevas Kovisioonis")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className={cn(styles.quickCheckSaveStatus, styles.supportStatus)} role="status">
        {status === "private"
          ? t("wellbeing.support.status_private", "Sisestus jääb privaatseks.")
          : status === "draft_saved"
            ? t("wellbeing.support.status_saved", "Privaatne mustand salvestati. Enne kasutamist kinnita jagatav versioon.")
            : status === "ready"
              ? t("wellbeing.support.status_ready", "Jagatav versioon on kinnitatud, kuid seda ei saadeta automaatselt.")
              : status === "error"
                ? t("wellbeing.support.status_error", "Mustandi salvestamine või kinnitamine ebaõnnestus.")
                : ""}
      </p>
    </section>
  );
}
