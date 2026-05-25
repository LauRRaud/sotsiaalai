import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("conversation drawer search uses the shared platform glow input sizing", () => {
  const source = read("components/ChatSidebar.jsx");

  assert.match(source, /const searchInputShellClassName = "relative flex justify-center";/);
  assert.match(source, /const searchInputClassName =[\s\S]*?text-\[1\.08rem\][\s\S]*?py-\[0\.74rem\][\s\S]*?px-\[1\.28rem\][\s\S]*?min-h-\[3\.12rem\]/);
  assert.match(source, /placeholder:text-\[1\.08rem\]/);
  assert.match(source, /const searchInsetWidthClassName =[\s\S]*?max-w-\[20\.6rem\]/);
  assert.match(source, /<GlowField className="chat-sidebar-search-glow w-full">/);
});
