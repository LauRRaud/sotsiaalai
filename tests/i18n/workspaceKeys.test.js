import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const locales = ["et", "en", "ru"];
const requiredWorkspaceKeys = [
  "chat.workspace.cards.pre_inquiries.title_client",
  "chat.workspace.cards.pre_inquiries.title_staff",
  "chat.workspace.cards.pre_inquiries.meta_client",
  "chat.workspace.cards.pre_inquiries.meta_staff",
  "chat.workspace.view_role.label",
  "workspace_feature_pages.roles.client",
  "workspace_feature_pages.roles.service_provider",
  "workspace_feature_pages.roles.social_worker",
  "workspace_feature_pages.admin_role_label"
];

function readMessages(locale) {
  return JSON.parse(
    readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8")
  );
}

function getMessage(messages, path) {
  return path.split(".").reduce((value, key) => {
    if (!value || !Object.hasOwn(value, key)) return undefined;
    return value[key];
  }, messages);
}

test("workspace i18n lookups used by role-specific dashboards exist", () => {
  for (const locale of locales) {
    const messages = readMessages(locale);
    for (const key of requiredWorkspaceKeys) {
      assert.equal(
        typeof getMessage(messages, key),
        "string",
        `${locale} is missing ${key}`
      );
    }
  }
});
