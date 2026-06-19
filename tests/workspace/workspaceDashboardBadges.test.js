import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createWorkspaceDashboardRows,
  normalizeWorkspaceDashboardBadge
} from "../../lib/workspaceDashboardCards.js";

const noop = () => {};
const t = (_key, fallback) => fallback;

function flatten(rows) {
  return rows.flat();
}

function cardsFor(role, dashboardBadges = null) {
  return flatten(createWorkspaceDashboardRows({
    activeRole: role,
    hasPaidAccess: true,
    t,
    navigateTo: noop,
    openHelpPanel: noop,
    openInvite: noop,
    dashboardBadges
  }));
}

test("workspace dashboard cards have no badges by default", () => {
  for (const role of ["CLIENT", "SOCIAL_WORKER", "SERVICE_PROVIDER"]) {
    assert.equal(cardsFor(role).some((card) => card.badge), false);
  }
});

test("workspace dashboard badge helper normalizes dot, number and attention badges", () => {
  assert.deepEqual(normalizeWorkspaceDashboardBadge(true), {
    type: "dot",
    value: "",
    label: "uus sündmus",
    tooltip: "Uus sündmus"
  });
  assert.deepEqual(normalizeWorkspaceDashboardBadge(2), {
    type: "number",
    value: "2",
    label: "2 uut sündmust",
    tooltip: "2 uut sündmust"
  });
  assert.deepEqual(normalizeWorkspaceDashboardBadge({ type: "exclamation", tooltip: "Vajab ülevaatust" }), {
    type: "attention",
    value: "!",
    label: "vajab tähelepanu",
    tooltip: "Vajab ülevaatust"
  });
});

test("workspace dashboard attaches badges by visible role card key and aliases", () => {
  const socialWorkerCards = cardsFor("SOCIAL_WORKER", {
    pre_inquiries: { type: "number", count: 2 },
    rooms: true,
    wellbeing: { type: "attention", tooltip: "Vajab ülevaatust" }
  });

  assert.deepEqual(socialWorkerCards.find((card) => card.key === "pre_inquiries")?.badge, {
    type: "number",
    value: "2",
    label: "2 uut sündmust",
    tooltip: "2 uut sündmust"
  });
  assert.equal(socialWorkerCards.find((card) => card.key === "add_person")?.badge?.type, "dot");
  assert.equal(socialWorkerCards.find((card) => card.key === "wellbeing")?.badge?.type, "attention");
});

test("workspace dashboard uses a client-specific pre-inquiry icon and staff mailbox icon", () => {
  const clientCard = cardsFor("CLIENT").find((card) => card.key === "pre_inquiries");
  const staffCard = cardsFor("SOCIAL_WORKER").find((card) => card.key === "pre_inquiries");
  const providerCard = cardsFor("SERVICE_PROVIDER").find((card) => card.key === "pre_inquiries");

  assert.equal(clientCard?.icon, "pre-inquiry");
  assert.equal(staffCard?.icon, "mailbox");
  assert.equal(providerCard?.icon, "mailbox");
});

test("workspace dashboard card icons keep a consistent visible stroke weight", () => {
  const source = readFileSync(new URL("../../components/chat/WorkspacePanel.jsx", import.meta.url), "utf8");
  const dashboardIconSource = source.slice(
    source.indexOf("function DashboardCardIcon"),
    source.indexOf("function getDashboardCardIcon")
  );
  const css = readFileSync(new URL("../../components/chat/WorkspacePanel.module.css", import.meta.url), "utf8");

  assert.match(dashboardIconSource, /<Route className=\{styles\.journeyInlineIcon\} strokeWidth=\{3\}/);
  assert.match(dashboardIconSource, /<Mail className=\{styles\.mailboxInlineIcon\} strokeWidth=\{3\}/);
  assert.match(dashboardIconSource, /type === "compose"[\s\S]*?strokeWidth="3"[\s\S]*?strokeWidth="3"/);
  assert.match(dashboardIconSource, /type === "pre-inquiry"[\s\S]*?stroke="currentColor"[\s\r\n ]+strokeWidth="3"/);
  assert.match(dashboardIconSource, /type === "map"[\s\S]*?<svg className=\{styles\.serviceMapInlineIcon\}[\s\S]*?stroke="currentColor"[\s\r\n ]+strokeWidth="3"/);
  assert.match(dashboardIconSource, /type === "document"[\s\S]*?strokeWidth="3"[\s\S]*?strokeWidth="3"[\s\S]*?strokeWidth="2\.1"/);
  assert.match(dashboardIconSource, /type === "materials"[\s\S]*?strokeWidth="3"[\s\S]*?strokeWidth="3"[\s\S]*?strokeWidth="2\.1"/);
  assert.match(dashboardIconSource, /<AddPersonIcon strokeColor="currentColor" strokeWidth=\{3\}/);
  assert.match(css, /vector-effect:\s*non-scaling-stroke/);
  assert.doesNotMatch(dashboardIconSource, /serviceMapLogoMaskId|serviceMapCutoutMaskId|fill="currentColor" mask/);
  assert.doesNotMatch(dashboardIconSource, /strokeWidth=\{1\.72\}|strokeWidth=\{1\.62\}|strokeWidth=\{1\.55\}|strokeWidth="1\.65"|strokeWidth="1\.6"|strokeWidth="1\.55"|strokeWidth="1\.48"|strokeWidth="1\.42"/);
});

test("workspace panel renders badge as visual chrome with accessible card label", () => {
  const source = readFileSync(new URL("../../components/chat/WorkspacePanel.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../components/chat/WorkspacePanel.module.css", import.meta.url), "utf8");

  assert.match(source, /aria-label=\{formatDashboardCardAriaLabel\(card\)\}/);
  assert.match(source, /className=\{styles\.cardBadge\}/);
  assert.match(source, /data-badge-type=\{card\.badge\.type\}/);
  assert.match(source, /className=\{styles\.cardBadgeTooltip\}/);
  assert.match(css, /\.cardBadge\s*\{/);
  assert.match(css, /\.cardBadge\[data-badge-type="number"\]/);
  assert.match(css, /\.card:not\(\.cardDisabled\):is\(:hover, :focus-visible\) \.cardBadgeTooltip/);
});

test("workspace dashboard badge palette is theme-aware", () => {
  const css = readFileSync(new URL("../../components/chat/WorkspacePanel.module.css", import.meta.url), "utf8");

  assert.match(css, /--workspace-card-badge-bg:/);
  assert.match(css, /--workspace-card-badge-attention-bg:/);
  assert.match(css, /--workspace-card-badge-tooltip-bg:/);
  assert.match(css, /:global\(:root\.theme-light\) \.panel\s*\{[\s\S]*?--workspace-card-badge-bg:/);
  assert.match(css, /:global\(:root\.theme-mid\) \.panel\s*\{[\s\S]*?--workspace-card-badge-bg:/);
  assert.match(css, /:global\(:root\.theme-mono\) \.panel\s*\{[\s\S]*?--workspace-card-badge-bg:/);
  assert.match(css, /:global\(html\[data-contrast="hc"\]\) \.panel\s*\{[\s\S]*?--workspace-card-badge-bg:/);
  assert.match(css, /\.cardBadge\s*\{[\s\S]*?background:\s*var\(--workspace-card-badge-bg\)/);
  assert.match(css, /\.cardBadgeTooltip\s*\{[\s\S]*?background:\s*var\(--workspace-card-badge-tooltip-bg\)/);
});
