import assert from "node:assert/strict";
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
    "Märka töökoormust, vaata ülevaateid ning valmista ette raport, kovisioon või töökorralduse kokkulepe."
  );
});
