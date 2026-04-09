"use client";

import RagAdminIngestView from "./RagAdminIngestView";
import { rootClassName, rootInputVars } from "./ragAdminShared";
import { useRagAdminController } from "./useRagAdminController";

export default function RagAdminIngestScreen() {
  const controller = useRagAdminController();

  return (
    <div className={rootClassName} style={rootInputVars}>
      <RagAdminIngestView controller={controller} />
    </div>
  );
}
