import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function readSource(path) {
  return fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace admin role selector persists through profile view-role API", () => {
  const source = readSource("components/chat/WorkspacePanel.jsx");

  assert.match(source, /AdminRoleViewCycleButton/);
  assert.match(source, /onRoleChanged=\{handleDashboardRoleChanged\}/);
  assert.doesNotMatch(source, /onChange=\{nextRole => setDashboardRole/);
});

test("workspace feature pages initialize admin role from effective role state", () => {
  const source = readSource("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /useEffectiveRole\(\)/);
  assert.match(source, /setAdminWorkspaceRole\(normalizeWorkspaceRole\(effectiveRole\)\)/);
  assert.match(source, /onRoleChanged=\{handleRoleChanged\}/);
});

test("documents route redirects client role view before rendering library shell", () => {
  const source = readSource("app/documents/page.js");

  assert.match(source, /resolveSessionRoleState\(session, cookieStore\)/);
  assert.match(source, /roleState\.effectiveRole === "CLIENT"/);
  assert.match(source, /redirect\(localizePath\("\/dokreziim", locale\)\)/);
});
