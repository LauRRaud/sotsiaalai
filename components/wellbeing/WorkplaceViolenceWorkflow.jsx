"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { buildWorkplaceViolenceRecord } from "@/lib/wellbeing/workplaceViolence";
import SupportRequestPanel from "./SupportRequestPanel";
import styles from "./WellbeingPage.module.css";

const initialFields = {
  violenceType: "aggression",
  dangerStatus: "ended",
  generalizedDescription: "Tööalane olukord, kus suhtlus muutus ähvardavaks ja vajab neutraalset järelkirjeldust.",
  locationOrChannel: "office",
  documentedStatus: "not_yet",
  workImpact: "moderate",
  safetyImpact: "some",
  nextStepNeed: "manager_followup",
  safetyAgreementNeed: "yes",
  covisionNeed: true,
  recoveryNeed: "partial"
};

const selectFields = [
  {
    key: "violenceType",
    label: "Olukorra liik",
    options: [
      ["insult_or_humiliation", "Solvamine või alandamine"],
      ["aggression", "Agressioon"],
      ["threat", "Ähvardus"],
      ["physical_danger", "Füüsiline oht"],
      ["stalking_or_intimidation", "Jälitamine või hirmutamine"],
      ["repeated_harassment", "Korduv ahistav suhtlus"],
      ["threatening_message", "Ähvardav sõnum või e-kiri"],
      ["lone_work_risk", "Kodukülastuse või üksi töötamise risk"]
    ]
  },
  {
    key: "dangerStatus",
    label: "Kas oht kestab praegu?",
    options: [
      ["ended", "Ei kesta"],
      ["uncertain", "Pole kindel"],
      ["ongoing", "Võib jätkuda"]
    ]
  },
  {
    key: "locationOrChannel",
    label: "Koht või kanal",
    options: [
      ["office", "Kontor või vastuvõtt"],
      ["home_visit", "Kodukülastus"],
      ["phone", "Telefon"],
      ["email_or_message", "E-kiri või sõnum"],
      ["public_space", "Avalik ruum"],
      ["partner_channel", "Koostööpartneri kanal"]
    ]
  },
  {
    key: "documentedStatus",
    label: "Dokumenteerimise seis",
    options: [
      ["yes", "Tööks vajalik info kirjas"],
      ["partial", "Osaliselt kirjas"],
      ["not_yet", "Veel kirja panemata"]
    ]
  },
  {
    key: "workImpact",
    label: "Mõju tööle",
    options: [
      ["low", "Madal"],
      ["moderate", "Mõõdukas"],
      ["high", "Kõrge"]
    ]
  },
  {
    key: "safetyImpact",
    label: "Mõju turvatundele",
    options: [
      ["none", "Ei märgi"],
      ["some", "Mõningane"],
      ["high", "Kõrge"]
    ]
  },
  {
    key: "nextStepNeed",
    label: "Järgmine samm",
    options: [
      ["manager_followup", "Juhiga järelkontakt"],
      ["safety_followup", "Ohutuse järelkontroll"],
      ["document_neutral_facts", "Neutraalsed faktid kirja"],
      ["change_channel", "Suhtluskanali muutmine"],
      ["colleague_presence", "Kolleegi kaasamine"],
      ["work_arrangement_change", "Töökorralduse muutmine"]
    ]
  },
  {
    key: "safetyAgreementNeed",
    label: "Turvalisuse kokkuleppe vajadus",
    options: [
      ["no", "Ei vaja eraldi kokkulepet"],
      ["unclear", "Vajab täpsustamist"],
      ["yes", "Vajab kokkulepet"]
    ]
  },
  {
    key: "recoveryNeed",
    label: "Taastumise vajadus",
    options: [
      ["none", "Ei vaja eraldi plaani"],
      ["partial", "Vajab lühikest plaani"],
      ["high", "Vajab töökorralduslikku tuge"]
    ]
  }
];

const signalCopy = {
  no_immediate_danger: {
    title: "Vahetut ohtu ei ole",
    text: "Olukord vajab neutraalset järelkirjeldust ja kokkulepete hoidmist."
  },
  needs_attention: {
    title: "Vajab tähelepanu",
    text: "Olukord vajab töökorralduslikku järeltegevust, ohutuse täpsustamist või tuge."
  },
  urgent_attention: {
    title: "Kiire tähelepanu vajalik",
    text: "Kui oht võib jätkuda, tuleb esmalt tegutseda ohutuse ja vastutava osapoole juhiste järgi."
  }
};

const actionRoutes = {
  recovery: "/tooheaolu/taastumine",
  covision: "/kovisioon",
  "work-boundaries": "/tooheaolu/toopiirid",
  overview: "/tooheaolu/ulevaade"
};

export default function WorkplaceViolenceWorkflow({ onNavigate }) {
  const { t } = useI18n();
  const [fields, setFields] = useState(initialFields);
  const [saveState, setSaveState] = useState("idle");
  const record = useMemo(
    () => buildWorkplaceViolenceRecord({
      period: "current",
      roleGroup: "SOCIAL_WORKER",
      standardizedFields: fields
    }),
    [fields]
  );
  const signal = record.computedSignal.signalLevel;
  const signalText = signalCopy[signal] || signalCopy.needs_attention;

  function updateField(key, value) {
    setFields((current) => ({ ...current, [key]: value }));
    setSaveState("idle");
  }

  async function saveWorkplaceViolence() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/wellbeing/workplace-violence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: "current",
          roleGroup: "SOCIAL_WORKER",
          standardizedFields: fields
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "wellbeing.errors.workplace_violence_save_failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className={styles.quickCheck}>
      <section className={styles.quickCheckIntro} aria-labelledby="workplace-violence-heading">
        <div>
          <h2 id="workplace-violence-heading">{t("wellbeing.workplace_violence.title", "Töövägivald")}</h2>
          <p>
            {t(
              "wellbeing.workplace_violence.intro",
              "Töövägivalla töövoog aitab hoida fookust ohutusel, neutraalsel dokumenteerimisel ja töökorralduslikul järeltegevusel."
            )}
          </p>
        </div>
        <div className={cn(styles.quickCheckSignal, styles[`quickCheckSignal_${signal}`])}>
          <span>{signalText.title}</span>
          <p>{signalText.text}</p>
        </div>
      </section>

      {record.computedSignal.safetyNoticeRequired ? (
        <section className={styles.quickCheckOutput} aria-labelledby="workplace-violence-safety-heading">
          <h3 id="workplace-violence-safety-heading">{t("wellbeing.workplace_violence.safety_title", "Ohutustekst")}</h3>
          <p className={styles.quickCheckPrivacy}>
            {t(
              "wellbeing.workplace_violence.safety_text",
              "Kui oht kestab praegu või pole kindel, kas see on lõppenud, tegutse esmalt oma töökoha ohutuskorra, vastutava juhi või hädaabi juhiste järgi. See töövoog ei asenda kriisiabi ega tööandja ohutuskohustust."
            )}
          </p>
        </section>
      ) : null}

      <div className={styles.quickCheckGrid}>
        <fieldset className={styles.quickCheckFieldset}>
          <legend>{t("wellbeing.workplace_violence.situation", "Olukord")}</legend>
          {selectFields.slice(0, 5).map((field) => (
            <SelectField key={field.key} field={field} value={fields[field.key]} onChange={updateField} />
          ))}
        </fieldset>

        <fieldset className={styles.quickCheckFieldset}>
          <legend>{t("wellbeing.workplace_violence.followup", "Järeltegevus")}</legend>
          {selectFields.slice(5).map((field) => (
            <SelectField key={field.key} field={field} value={fields[field.key]} onChange={updateField} />
          ))}
          <label className={styles.quickCheckField}>
            <span>{t("wellbeing.workplace_violence.covision_need", "Vajan kovisiooni sisendit")}</span>
            <input
              type="checkbox"
              checked={fields.covisionNeed}
              onChange={(event) => updateField("covisionNeed", event.target.checked)}
            />
          </label>
        </fieldset>
      </div>

      <section className={styles.quickCheckOutput} aria-labelledby="workplace-violence-description-heading">
        <h3 id="workplace-violence-description-heading">
          {t("wellbeing.workplace_violence.generalized_heading", "Üldistatud kirjeldus")}
        </h3>
        <label className={styles.quickCheckOutputCard}>
          <h4>{t("wellbeing.workplace_violence.generalized_description", "Neutraalne kirjeldus ilma tuvastatavate detailideta")}</h4>
          <textarea
            value={fields.generalizedDescription}
            onChange={(event) => updateField("generalizedDescription", event.target.value)}
            rows={5}
          />
        </label>
      </section>

      <section className={styles.quickCheckOutput} aria-labelledby="workplace-violence-output-heading">
        <h3 id="workplace-violence-output-heading">
          {t("wellbeing.workplace_violence.output_heading", "Praktiline väljund")}
        </h3>
        <div className={styles.quickCheckOutputGrid}>
          <OutputCard title="Neutraalne juhtumikirjeldus" value={record.outputSummary.neutralIncidentDescription} />
          <OutputCard title="Turvalisuse kokkuleppe sisend" value={record.outputSummary.safetyAgreementInput} />
          <OutputCard title="Juhiga arutelu memo" value={record.outputSummary.managerMemo} />
          <OutputCard title="Kovisiooni sisend" value={record.outputSummary.covisionInput} />
          <OutputCard title="Töökorralduse muutmise soovitus" value={record.outputSummary.workArrangementRecommendation} />
        </div>
        <div className={styles.quickCheckActions}>
          <Button type="button" variant="primary" onClick={saveWorkplaceViolence} disabled={saveState === "saving"}>
            {saveState === "saving"
              ? t("wellbeing.workplace_violence.saving", "Salvestan...")
              : t("wellbeing.workplace_violence.save", "Salvesta töövägivalla järeltegevus")}
          </Button>
          {record.recommendedActions.map((action) => (
            <Button
              key={action.workflowType}
              type="button"
              variant="secondary"
              onClick={() => onNavigate?.(actionRoutes[action.workflowType] || "/tooheaolu")}
            >
              {action.label}
            </Button>
          ))}
        </div>
        <p className={styles.quickCheckSaveStatus} role="status">
          {saveState === "saved"
            ? t("wellbeing.workplace_violence.saved", "Töövägivalla järeltegevus salvestati privaatselt.")
            : saveState === "error"
              ? t("wellbeing.workplace_violence.save_failed", "Salvestamine ebaõnnestus. Proovi uuesti.")
              : ""}
        </p>
      </section>

      <SupportRequestPanel
        sourceWorkflowType="workplace-violence"
        context={record}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function SelectField({ field, value, onChange }) {
  return (
    <label className={styles.quickCheckField}>
      <span>{field.label}</span>
      <select value={value} onChange={(event) => onChange(field.key, event.target.value)}>
        {field.options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>{label}</option>
        ))}
      </select>
    </label>
  );
}

function OutputCard({ title, value }) {
  return (
    <article className={styles.quickCheckOutputCard}>
      <h4>{title}</h4>
      <pre>{value}</pre>
    </article>
  );
}
