import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createWorkspaceDashboardRows } from "../../lib/workspaceDashboardCards.js";

function flatten(rows) {
  return rows.flat();
}

const t = (_key, fallback) => fallback;
const noop = () => {};

function cardsFor(role) {
  return flatten(createWorkspaceDashboardRows({
    activeRole: role,
    hasPaidAccess: true,
    t,
    navigateTo: noop,
    openHelpPanel: noop,
    openInvite: noop
  }));
}

test("wellbeing dashboard card is visible only for social workers", () => {
  const socialWorkerCards = cardsFor("SOCIAL_WORKER");
  const clientCards = cardsFor("CLIENT");
  const providerCards = cardsFor("SERVICE_PROVIDER");

  assert.ok(socialWorkerCards.some((card) => card.key === "wellbeing"));
  assert.equal(clientCards.some((card) => card.key === "wellbeing"), false);
  assert.equal(providerCards.some((card) => card.key === "wellbeing"), false);
});

test("wellbeing dashboard card sits next to covision and opens the wellbeing workspace", () => {
  const rows = createWorkspaceDashboardRows({
    activeRole: "SOCIAL_WORKER",
    hasPaidAccess: true,
    t,
    navigateTo: noop,
    openHelpPanel: noop,
    openInvite: noop
  });
  const row = rows.find((items) => items.some((card) => card.key === "kovision"));

  assert.ok(row, "social worker dashboard should include the covision row");
  assert.deepEqual(row.map((card) => card.key), ["kovision", "wellbeing"]);

  const wellbeing = row.find((card) => card.key === "wellbeing");
  assert.equal(wellbeing.title, "Tööheaolu");
  assert.equal(wellbeing.route, "/tooheaolu");
  assert.equal(
    wellbeing.description,
    "Märka töökoormust, vaata ülevaateid ning hoia fookuses taastumine, piirid ja tööprotsessid."
  );
});

test("wellbeing dashboard icon uses a social support mark instead of a medical pulse", () => {
  const source = readFileSync(new URL("../../components/chat/WorkspacePanel.jsx", import.meta.url), "utf8");
  const wellbeingIcon = source.match(/if \(type === "wellbeing"\) \{[\s\S]*?return \([\s\S]*?<\/svg>[\s\S]*?\);\s*\}/)?.[0] || "";

  assert.match(wellbeingIcon, /M12 3\.35c2\.2 1\.68/);
  assert.match(wellbeingIcon, /<circle cx="12" cy="9\.2" r="1\.85"/);
  assert.match(wellbeingIcon, /M8\.6 15\.35c\.7-1\.95/);
  assert.doesNotMatch(wellbeingIcon, /M12 20\.25c-/);
  assert.doesNotMatch(wellbeingIcon, /1\.12-2\.7/);
});
