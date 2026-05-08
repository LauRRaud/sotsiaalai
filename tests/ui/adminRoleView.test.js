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
  const workspaceFeaturePage = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(adminViewRole, /SERVICE_PROVIDER/);
  assert.match(effectiveRole, /normalized === "SERVICE_PROVIDER"\)\s+return "SERVICE_PROVIDER"/);
  assert.doesNotMatch(profileBody, /key:\s*"view_role"/);
  assert.match(documentsPage, /AdminRoleViewCycleButton/);
  assert.doesNotMatch(documentsPage, /if \(isClientRole\) return null/);
  assert.match(documentsPage, /router\.replace\(localizePath\("\/dokreziim", locale\)\)/);
  assert.match(agentModePage, /AdminRoleViewCycleButton/);
  assert.match(workspaceFeaturePage, /workspace-feature-admin-role--floating/);
  assert.doesNotMatch(workspaceFeaturePage, /<div className=\{cn\(contentClassName[\s\S]*showAdminRoleSelector/);
});

test("documents redirect waits until effective role has resolved", () => {
  const effectiveRole = read("components/auth/useEffectiveRole.js");
  const documentsPage = read("components/documents/DocumentsPage.jsx");

  assert.match(effectiveRole, /isRoleResolved/);
  assert.match(
    documentsPage,
    /const\s+\{\s*effectiveRole,\s*isAdmin,\s*isRoleResolved,\s*refresh:\s*refreshEffectiveRole\s*\}\s*=\s*useEffectiveRole\(\)/
  );
  assert.match(
    documentsPage,
    /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!isRoleResolved\s*\|\|\s*!isClientRole\)\s*return[\s\S]*?router\.replace\(localizePath\("\/dokreziim", locale\)\)/
  );
});
