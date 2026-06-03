import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { readServiceMapCssBundle } from "../helpers/serviceMapCssBundle.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("service profile toggle cards keep checkbox text readable across themes", () => {
  const css = readServiceMapCssBundle();

  assert.match(
    css,
    /\.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--pt:\s*var\(--workspace-feature-checkbox-text\)/
  );
  assert.match(
    css,
    /\.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--otp-check-text:\s*var\(--workspace-feature-checkbox-text\)/
  );
  assert.match(
    css,
    /\.workspace-feature-toggle-row \.text\s*\{[\s\S]*?color:\s*var\(--workspace-feature-checkbox-text\)\s*!important/
  );
  assert.match(
    css,
    /\.workspace-feature-toggle-row \.text > span > span:last-child:not\(:first-child\)\s*\{[\s\S]*?opacity:\s*1/
  );
  assert.match(
    css,
    /:root\.theme-light:not\(\.theme-mid\) \.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--workspace-feature-checkbox-body-text:\s*#4b5567/
  );
  assert.match(
    css,
    /:root\.theme-mid \.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--workspace-feature-checkbox-body-text:\s*#536071/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\] \.workspace-feature-panel \.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--workspace-feature-checkbox-body-text:\s*var\(--hc-accent,\s*#ffea00\)/
  );
});

test("service profile page keeps the shared workspace feature desktop width", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/utilities/helpers.css");

  assert.match(source, /workspaceGuidePanelClassName/);
  assert.match(css, /\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?--ring-base-max:\s*calc\(54 \* var\(--base-rem\)\)/);
  assert.doesNotMatch(source, /workspace-feature-panel--service-profile/);
  assert.doesNotMatch(source, /clamp\(38rem,76vw,56rem\)/);
});

test("service profile uses readable dropdowns, checkbox choices and vertical form groups", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = readServiceMapCssBundle();

  assert.match(source, /function ServiceProfileDropdown/);
  assert.match(source, /portal\s+className="workspace-feature-dropdown service-profile-glow-dropdown"/);
  assert.match(source, /menuClassName="service-profile-glow-dropdown-menu"/);
  assert.match(source, /function ServiceProfileLocationChoice/);
  assert.match(source, /className="service-profile-location-choice workspace-feature-fancy-checkbox fancy-checkbox--multiline"/);
  assert.match(source, /service-profile-field-stack/);

  assert.match(css, /\.service-profile-glow-dropdown-menu\s*\{/);
  assert.match(css, /:root\.theme-light:not\(\.theme-mid\) \.service-profile-glow-dropdown-menu\s*\{[\s\S]*?color:\s*rgba\(0,\s*0,\s*0,\s*0\.9\)/);
  assert.match(css, /\.service-profile-field-stack\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.service-profile-publish-layout\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.service-profile-location-choice \.text\s*\{[\s\S]*?color:\s*var\(--workspace-feature-checkbox-text\)/);
  assert.match(css, /\.service-profile-form \.workspace-feature-toggle-row\.workspace-feature-fancy-checkbox,[\s\S]*?min-height:\s*2\.42rem\s*!important/);
  assert.match(css, /\.service-profile-form \.workspace-feature-fancy-checkbox \.box\s*\{[\s\S]*?width:\s*1\.12rem/);
  assert.match(css, /\.service-profile-form \.workspace-feature-fancy-checkbox \.svg\s*\{[\s\S]*?width:\s*0\.88rem/);
});

test("service profile keeps publishing state inside the publish section and un-nested sections", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = readServiceMapCssBundle();
  const sectionBlock = css.match(/\.service-profile-section\s*\{[^}]*\}/)?.[0] || "";

  assert.match(source, /function ServiceProfileSection/);
  assert.doesNotMatch(source, /className="service-profile-status-rail"/);
  assert.doesNotMatch(css, /\.service-profile-status-rail\s*\{/);
  assert.doesNotMatch(source, /workspace_feature_pages\.service_profile\.summary\.pricing/);
  assert.match(source, /workspace_feature_pages\.service_profile\.sections\.services_locations/);
  assert.match(source, /workspace_feature_pages\.service_profile\.fields\.services_overview/);
  assert.match(source, /workspace_feature_pages\.service_profile\.visibility\.visible/);
  assert.match(source, /workspace_feature_pages\.service_profile\.map_status\.title/);
  assert.match(source, /<ServiceProfileSection title=\{readText\(t, "workspace_feature_pages\.service_profile\.sections\.services_locations"/);
  assert.doesNotMatch(source, /<SectionCard title=\{readText\(t, "workspace_feature_pages\.service_profile\.sections/);
  assert.doesNotMatch(source, /workspace_feature_pages\.service_profile\.overview\.body/);

  assert.match(sectionBlock, /border-top:\s*1px solid var\(--workspace-feature-border\)/);
  assert.doesNotMatch(sectionBlock, /background:/);
  assert.match(css, /\.service-profile-subsection > \.grid > \.button,/);
});

test("service profile uses controlled choices for categories, target groups and languages", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = readServiceMapCssBundle();

  assert.match(source, /function ServiceProfileChoiceChips/);
  assert.match(source, /serviceProfileCategoryOptions/);
  assert.match(source, /serviceProfileTargetGroupOptions/);
  assert.match(source, /serviceProfileLanguageOptions/);
  assert.match(source, /value=\{form\.serviceCategories\}/);
  assert.match(source, /value=\{form\.targetGroups\}/);
  assert.match(source, /value=\{form\.languages\}/);
  assert.match(source, /value=\{service\.category\}/);
  assert.doesNotMatch(source, /value=\{form\.serviceCategories\} onChange=\{\(event\) => updateField\("serviceCategories"/);
  assert.doesNotMatch(source, /value=\{form\.languages\} onChange=\{\(event\) => updateField\("languages"/);

  assert.match(css, /\.service-profile-choice-chips\s*\{/);
  assert.match(css, /\.service-profile-choice-chip\.is-selected\s*\{/);
});

test("service profile translation files expose publishing status and combined-section labels", () => {
  for (const locale of ["et", "en", "ru"]) {
    const messages = JSON.parse(read(`messages/${locale}.json`));
    const serviceProfile = messages.workspace_feature_pages.service_profile;

    assert.equal(typeof serviceProfile.summary.label, "string");
    assert.equal(typeof serviceProfile.summary.map_not_ready, "string");
    assert.equal(typeof serviceProfile.sections.services_locations, "string");
    assert.equal(typeof serviceProfile.fields.services_overview, "string");
    assert.equal(typeof serviceProfile.field_help.categories, "string");
    assert.equal(typeof serviceProfile.field_help.target_groups, "string");
    assert.equal(typeof serviceProfile.field_help.services_locations, "string");
    assert.equal(typeof serviceProfile.category_options.transport, "string");
    assert.equal(typeof serviceProfile.target_group_options.child, "string");
    assert.equal(typeof serviceProfile.language_options.et, "string");
    assert.equal(typeof serviceProfile.address_search.hint, "string");
    assert.equal(typeof serviceProfile.fields.fee_type, "string");
    assert.equal(typeof serviceProfile.service_items.fee_type, "string");
    assert.notEqual(serviceProfile.status.draft, serviceProfile.summary.price);
    assert.notEqual(serviceProfile.fields.fee_type, serviceProfile.summary.price);
  }
});
