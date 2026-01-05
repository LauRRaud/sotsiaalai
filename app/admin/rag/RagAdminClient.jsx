"use client";

import dynamic from "next/dynamic";

const RagAdminPanel = dynamic(() => import("@/components/admin/RagAdminPanel"), {
  ssr: false,
  loading: () => <div style={{ opacity: 0.75 }}>Laen paneeli...</div>,
});

export default function RagAdminClient() {
  return <RagAdminPanel />;
}
