import test from "node:test";
import assert from "node:assert/strict";

import { helpWorkflowT } from "../../lib/help/chatWorkflowText.js";

test("help workflow copy is resolved from locale catalogs with proper unicode", () => {
  assert.equal(
    helpWorkflowT("et", "questions.request.availability"),
    "Millal abi vaja on või millal võiks sellega alustada?"
  );

  assert.equal(
    helpWorkflowT("en", "preview.savePrompt"),
    "If this looks right, reply “yes” or “save”. If you want to change something, write the change directly here."
  );

  assert.equal(
    helpWorkflowT("ru", "questions.request.availability"),
    "Когда помощь нужна или когда можно начать?"
  );
});

test("browse and connect copy is resolved from locale catalogs", () => {
  assert.equal(
    helpWorkflowT("et", "browse.cardHintOffer", { index: 2 }),
    "Kirjuta: „ühenda 2. pakkumisega“"
  );

  assert.equal(
    helpWorkflowT("en", "connect.openRoom"),
    "Open Room chat"
  );

  assert.equal(
    helpWorkflowT("ru", "browse.emptyRequests"),
    "Пока не найдено подходящих активных запросов на помощь."
  );
});
