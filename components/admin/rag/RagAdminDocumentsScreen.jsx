"use client";

import RagAdminDocumentsView from "./RagAdminDocumentsView";
import { rootClassName, rootInputVars } from "./ragAdminShared";
import { useRagAdminController } from "./useRagAdminController";

export default function RagAdminDocumentsScreen() {
  const controller = useRagAdminController();

  return (
    <div className={rootClassName} style={rootInputVars}>
      <RagAdminDocumentsView controller={controller} />
    </div>
  );
}
