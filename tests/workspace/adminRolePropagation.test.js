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
  assert.match(source, /createPortal\(roleMenu, roleMenuPortalTarget\)/);
  assert.match(source, /setRoleMenuPortalTarget\(document\.body\)/);
  assert.match(source, /const roleMenu = isAdmin \? \([\s\S]*?className=\{styles\.roleMenu\}/);
  assert.match(source, /\{visible && roleMenuPortalTarget && roleMenu[\s\S]*?\? createPortal\(roleMenu, roleMenuPortalTarget\)[\s\S]*?: null\}[\s\S]*?<section/);
  assert.match(source, /<GlassSubpageHeader[\s\S]*?>\s*\{text\(t, "chat\.workspace\.title", "Töölau[dt]"\)\}/);
  assert.doesNotMatch(source, /rightSlot=\{isAdmin \? \(/);
  assert.doesNotMatch(source, /onChange=\{nextRole => setDashboardRole/);
});

test("workspace feature pages initialize admin role from effective role state", () => {
  const source = readSource("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /useEffectiveRole\(\)/);
  assert.match(source, /setAdminWorkspaceRole\(normalizeWorkspaceRole\(effectiveRole\)\)/);
  assert.match(source, /onRoleChanged=\{handleRoleChanged\}/);
  assert.match(source, /const showAdminRoleSelector = !embedded && isAdmin && \(/);
  assert.match(source, /const content = \([\s\S]*?showAdminRoleSelector \? \([\s\S]*?workspace-feature-admin-role--viewport[\s\S]*?<div[\s\S]*?className=\{cn\(/);
  assert.match(source, /if \(embedded\) return content;[\s\S]*?<section className=\{shellClassName\}/);
  assert.doesNotMatch(source, /workspace-feature-content relative" : contentClassName\)\}>[\s\S]*?showAdminRoleSelector \? \(/);
});

test("documents route redirects client role view before rendering library shell", () => {
  const source = readSource("app/documents/page.js");

  assert.match(source, /resolveSessionRoleState\(session, cookieStore\)/);
  assert.match(source, /roleState\.effectiveRole === "CLIENT"/);
  assert.match(source, /redirect\(localizePath\("\/dokreziim", locale\)\)/);
});
