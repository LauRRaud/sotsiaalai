import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readMessages(locale) {
  return JSON.parse(
    readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8"),
  );
}

test("service provider role labels stay consistent on home and register screens", () => {
  const et = readMessages("et");
  const en = readMessages("en");
  const ru = readMessages("ru");

  assert.equal(et.role.provider, "Teenuse osutaja");
  assert.match(et.auth.register.role_hint, /Teenuse osutaja/);
  assert.equal(et.home.card.service_provider.title_line1, "Teenuse");
  assert.equal(et.home.card.service_provider.title_line2, "osutaja");

  assert.equal(en.role.provider, "Service provider");
  assert.match(en.auth.register.role_hint, /Service provider/);
  assert.equal(en.home.card.service_provider.title_line1, "Service");
  assert.equal(en.home.card.service_provider.title_line2, "provider");

  assert.equal(ru.role.provider, "Поставщик услуг");
  assert.match(ru.auth.register.role_hint, /поставщик услуг/i);
  assert.equal(ru.home.card.service_provider.title_line1, "Поставщику");
  assert.equal(ru.home.card.service_provider.title_line2, "услуг");
});
