"use client";

import styles from "./LeftBackButton.module.css";
import { useRouter } from "next/navigation";
import { pushWithTransition } from "@/lib/routeTransition";

export default function LeftBackButton({ t, hidden }) {
  const router = useRouter();
  return (
    <div
      className={`${styles.slot}${hidden ? ` ${styles.hidden}` : ""}`}
      aria-hidden={hidden ? "true" : "false"}
    >
      <button
        type="button"
        className={`back-arrow-btn ${styles.btn}`}
        onClick={() => pushWithTransition(router, "/")}
        aria-label={t("chat.back_to_home", "Tagasi avalehele")}
        tabIndex={hidden ? -1 : undefined}
      >
        <span className="back-arrow-circle" />
      </button>
    </div>
  );
}

