import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("source packages admin view uses dark-mode admin surfaces and localized Estonian copy", () => {
  const source = read("components/admin/rag/RagAdminSourcePackagesScreen.jsx");
  const page = read("app/admin/rag/source-packages/page.jsx");
  const copy = read("components/admin/rag/ragAdminCopy.js");

  assert.match(source, /rootClassName/);
  assert.match(source, /cardClassName/);
  assert.match(source, /--admin-surface-3/);
  assert.match(source, /Lähtepaketid/);
  assert.match(source, /Näita infohoiatusi/);
  assert.match(source, /Ülevaatuse märkus \(valikuline\)/);
  assert.doesNotMatch(source, /bg-white\/55|bg-white\/45|border-black\/10|Default queue: ainult|Naita info/);

  assert.match(page, /<RagAdminSourcePackagesScreen locale=\{locale\} \/>/);
  assert.match(copy, /sourcePackages: "Lähtepaketid"/);
  assert.match(copy, /title: "Lähtepakettide ülevaatus"/);
  assert.doesNotMatch(copy, /persisted SourcePackage snapshotte|review flags seisu|minimaalseid review tegevusi/);
});
