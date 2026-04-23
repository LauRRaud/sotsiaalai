import test from "node:test";
import assert from "node:assert/strict";

import { parseAssistantMarkdownBlocks } from "../../lib/chat/messageMarkdown.js";

test("assistant markdown parser keeps year-leading sentences as paragraphs", () => {
  const blocks = parseAssistantMarkdownBlocks("2018. aastal jõustunud muudatused suunasid teenust perepõhisemaks.");

  assert.deepEqual(blocks, [
    {
      type: "paragraph",
      text: "2018. aastal jõustunud muudatused suunasid teenust perepõhisemaks."
    }
  ]);
});

test("assistant markdown parser still parses normal ordered lists", () => {
  const blocks = parseAssistantMarkdownBlocks("1. Esimene samm\n2. Teine samm");

  assert.deepEqual(blocks, [
    {
      type: "ordered",
      items: ["Esimene samm", "Teine samm"]
    }
  ]);
});

test("assistant markdown parser keeps retrospective year phrases as paragraphs", () => {
  const blocks = parseAssistantMarkdownBlocks("2024. aastal kirjeldatud muudatused ei tohi muutuda loendiks.");

  assert.equal(blocks[0]?.type, "paragraph");
  assert.match(blocks[0]?.text || "", /^2024\. aastal/);
});
