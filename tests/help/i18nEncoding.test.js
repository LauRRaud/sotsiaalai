import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function readMessages(locale) {
  const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

test("english footer strings use clean copyright text", () => {
  const bundle = readMessages("en");

  assert.equal(bundle?.profile?.footer_brand, "SotsiaalAI ©");
  assert.equal(bundle?.about?.footer?.note, "SotsiaalAI © 2025");
});
