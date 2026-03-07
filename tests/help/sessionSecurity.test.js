import test from "node:test";
import assert from "node:assert/strict";

import {
  isDirectPinLoginAllowed,
  pickTrustedDeviceIdsToEvict
} from "../../lib/auth/pin-login.js";

test("direct PIN login is never allowed in production", () => {
  assert.equal(
    isDirectPinLoginAllowed({ envValue: "true", nodeEnv: "production" }),
    false
  );
  assert.equal(
    isDirectPinLoginAllowed({ envValue: "true", nodeEnv: "development" }),
    true
  );
});

test("trusted device eviction keeps at most two newest active devices", () => {
  const devices = [
    {
      id: "oldest",
      lastUsedAt: new Date("2026-03-01T09:00:00.000Z"),
      createdAt: new Date("2026-03-01T09:00:00.000Z")
    },
    {
      id: "middle",
      lastUsedAt: new Date("2026-03-02T09:00:00.000Z"),
      createdAt: new Date("2026-03-02T09:00:00.000Z")
    },
    {
      id: "newest",
      lastUsedAt: new Date("2026-03-03T09:00:00.000Z"),
      createdAt: new Date("2026-03-03T09:00:00.000Z")
    }
  ];

  assert.deepEqual(pickTrustedDeviceIdsToEvict(devices, 2), ["oldest", "middle"]);
  assert.deepEqual(pickTrustedDeviceIdsToEvict(devices.slice(1), 2), ["middle"]);
});
