import AgentModePage from "@/components/agent/AgentModePage"

export default async function AgentModeRoute({ searchParams }) {
  const params = await searchParams
  const initialDocumentIds = Array.from(new Set(String(params?.documents || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)))
  const initialArtifactId = String(params?.artifact || "").trim()

  return <AgentModePage initialDocumentIds={initialDocumentIds} initialArtifactId={initialArtifactId} />
}
