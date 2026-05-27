"use client";

import styles from "./WellbeingPage.module.css";

export default function WellbeingActionList({ actions = [], actionRoutes = {}, onNavigate }) {
  if (!actions.length) return null;

  return (
    <div className={styles.quickCheckActionList} aria-label="Soovitatud järgmised sammud">
      {actions.map((action) => (
        <button
          key={action.workflowType}
          type="button"
          className={styles.quickCheckActionButton}
          onClick={() => onNavigate?.(actionRoutes[action.workflowType] || "/tooheaolu")}
        >
          <span>{action.label}</span>
          {action.reason ? <small>{action.reason}</small> : null}
        </button>
      ))}
    </div>
  );
}
