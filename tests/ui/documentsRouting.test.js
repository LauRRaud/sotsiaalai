import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace documents card opens the documents library without client redirect", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");
  const documentsPage = read("app/documents/page.js");

  assert.match(
    workspacePanel,
    /key:\s*"documents"[\s\S]*?onClick:\s*\(\)\s*=>\s*navigateTo\("\/documents"\)/
  );
  assert.doesNotMatch(documentsPage, /localizePath\("\/dokreziim"/);
});

test("workspace hides the documents library card in client view and keeps client cards paired", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");
  const nonProviderBranchStart = workspacePanel.indexOf(
    "\n    : [",
    workspacePanel.indexOf("const cardRows = isProviderView")
  );
  const nonProviderBranch = workspacePanel.slice(nonProviderBranchStart);

  assert.notEqual(nonProviderBranchStart, -1);
  assert.match(
    nonProviderBranch,
    /\.\.\.\(!isClientView\s*\?\s*\[\[\s*makeCard\(\{\s*key:\s*"documents"[\s\S]*?key:\s*"document_drafting"[\s\S]*?\]\]\s*:\s*\[\]\)/
  );
  assert.match(
    nonProviderBranch,
    /key:\s*"pre_inquiries"[\s\S]*?isClientView\s*\?\s*makeCard\(\{\s*key:\s*"document_drafting"/
  );
  assert.match(
    nonProviderBranch,
    /\.\.\.\(isClientView\s*\?\s*\[\[\s*makeCard\(\{\s*key:\s*"add_person"[\s\S]*?serviceMapCard[\s\S]*?\]\]/
  );
});
