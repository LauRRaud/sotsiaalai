import test from "node:test";
import assert from "node:assert/strict";

import { createOskaApiClient } from "../../lib/career/oskaApiClient.js";
import { MemoryOskaCache } from "../../lib/career/oskaCache.js";

function createJsonResponse(items, totalCount = null) {
  return {
    ok: true,
    headers: {
      get(name) {
        if (String(name).toLowerCase() === "x-total-count" && totalCount !== null) {
          return String(totalCount);
        }
        return null;
      }
    },
    async json() {
      return items;
    }
  };
}

test("api client sends relations by default and reuses cache", async () => {
  const calls = [];
  const client = createOskaApiClient({
    baseUrl: "https://oskused.ee",
    cache: new MemoryOskaCache({ ttlMs: 1000 }),
    fetchImpl: async (url) => {
      calls.push(String(url));
      return createJsonResponse([{ id: 1, name: "Abikokk" }], 1);
    }
  });

  const first = await client.fetchOccupations();
  const second = await client.fetchOccupations();

  assert.equal(first.items[0].name, "Abikokk");
  assert.equal(second.items[0].name, "Abikokk");
  assert.equal(calls.length, 1);
  assert.match(calls[0], /_relations=true/);
});

test("api client can paginate through full lists", async () => {
  let callCount = 0;
  const client = createOskaApiClient({
    baseUrl: "https://oskused.ee",
    fetchImpl: async () => {
      callCount += 1;
      if (callCount === 1) return createJsonResponse([{ id: 1 }, { id: 2 }], 3);
      return createJsonResponse([{ id: 3 }], 3);
    }
  });

  const result = await client.fetchAllSkills({}, { pageSize: 2, cache: false });

  assert.equal(result.items.length, 3);
  assert.equal(result.totalCount, 3);
});
