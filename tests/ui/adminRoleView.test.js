import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("admin role preview supports all workspace roles outside profile", () => {
  const adminViewRole = read("lib/adminViewRole.js");
  const effectiveRole = read("components/auth/useEffectiveRole.js");
  const profileBody = read("components/alalehed/ProfiilBody.jsx");
  const documentsPage = read("components/documents/DocumentsPage.jsx");
  const agentModePage = read("components/agent/AgentModePage.jsx");

  assert.match(adminViewRole, /SERVICE_PROVIDER/);
  assert.match(effectiveRole, /normalized === "SERVICE_PROVIDER"\)\s+return "SERVICE_PROVIDER"/);
  assert.doesNotMatch(profileBody, /key:\s*"view_role"/);
  assert.match(documentsPage, /AdminRoleViewCycleButton/);
  assert.match(agentModePage, /AdminRoleViewCycleButton/);
});
