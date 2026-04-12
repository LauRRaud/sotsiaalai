import test from "node:test";
import assert from "node:assert/strict";

import { refundAnalyzeQuota, reserveAnalyzeQuota } from "../../lib/analyzeQuotaServer.js";

test("reserveAnalyzeQuota upserts usage row and increments count while under limit", async () => {
  const calls = [];
  const tx = {
    analyzeUsage: {
      upsert: async args => {
        calls.push(["upsert", args]);
        return { userId: "user-1", day: new Date("2026-04-12T00:00:00Z"), count: 0 };
      },
      updateMany: async args => {
        calls.push(["updateMany", args]);
        return { count: 1 };
      }
    }
  };

  await reserveAnalyzeQuota(tx, {
    userId: "user-1",
    day: new Date("2026-04-12T00:00:00Z"),
    limit: 10
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], "upsert");
  assert.equal(calls[1][0], "updateMany");
  assert.equal(calls[1][1].where.count.lt, 10);
});

test("reserveAnalyzeQuota throws a quota-coded error when no slot remains", async () => {
  const tx = {
    analyzeUsage: {
      upsert: async () => ({ count: 10 }),
      updateMany: async () => ({ count: 0 })
    }
  };

  await assert.rejects(
    reserveAnalyzeQuota(tx, {
      userId: "user-1",
      day: new Date("2026-04-12T00:00:00Z"),
      limit: 10
    }),
    error => error?.code === "QUOTA" && error?.message === "api.chat.analyze.quota_exceeded"
  );
});

test("refundAnalyzeQuota decrements the reserved count safely", async () => {
  let receivedArgs = null;
  const client = {
    analyzeUsage: {
      updateMany: async args => {
        receivedArgs = args;
        return { count: 1 };
      }
    }
  };

  const result = await refundAnalyzeQuota(client, {
    userId: "user-1",
    day: new Date("2026-04-12T00:00:00Z")
  });

  assert.deepEqual(result, { count: 1 });
  assert.equal(receivedArgs.where.count.gt, 0);
  assert.equal(receivedArgs.data.count.decrement, 1);
});
