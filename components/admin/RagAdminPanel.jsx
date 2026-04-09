"use client";

import RagAdminDocumentsView from "@/components/admin/rag/RagAdminDocumentsView";
import RagAdminIngestView from "@/components/admin/rag/RagAdminIngestView";
import { rootClassName, rootInputVars } from "@/components/admin/rag/ragAdminShared";
import { useRagAdminController } from "@/components/admin/rag/useRagAdminController";

export default function RagAdminPanel() {
  const controller = useRagAdminController();

  return (
    <div className={rootClassName} style={rootInputVars}>
      <RagAdminIngestView controller={controller} />
      <RagAdminDocumentsView controller={controller} showMessage={false} />
    </div>
  );
}
